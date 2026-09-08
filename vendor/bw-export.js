(() => {
  function pdfBlobFromCanvas(canvas, monochrome) {
    const context = canvas.getContext('2d');
    if (monochrome) {
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      for (let index = 0; index < pixels.data.length; index += 4) {
        const luminance = (pixels.data[index] * .299) + (pixels.data[index + 1] * .587) + (pixels.data[index + 2] * .114);
        const value = luminance >= 185 ? 255 : 0;
        pixels.data[index] = value;
        pixels.data[index + 1] = value;
        pixels.data[index + 2] = value;
      }
      context.putImageData(pixels, 0, 0);
    }
    const binary = atob(canvas.toDataURL('image/jpeg', .98).split(',')[1]);
    const image = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) image[index] = binary.charCodeAt(index);
    const encode = (value) => new TextEncoder().encode(value);
    const header = new Uint8Array([37, 80, 68, 70, 45, 49, 46, 52, 10, 37, 255, 255, 255, 255, 10]);
    const objects = [
      encode('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n'),
      encode('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n'),
      encode('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n'),
      (() => { const prefix = encode(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.length} >>\nstream\n`); const suffix = encode('\nendstream\nendobj\n'); const result = new Uint8Array(prefix.length + image.length + suffix.length); result.set(prefix); result.set(image, prefix.length); result.set(suffix, prefix.length + image.length); return result; })(),
      (() => { const content = encode('q\n595.28 0 0 841.89 0 0 cm\n/Im0 Do\nQ\n'); const prefix = encode(`5 0 obj\n<< /Length ${content.length} >>\nstream\n`); const suffix = encode('endstream\nendobj\n'); const result = new Uint8Array(prefix.length + content.length + suffix.length); result.set(prefix); result.set(content, prefix.length); result.set(suffix, prefix.length + content.length); return result; })()
    ];
    const parts = [header];
    const offsets = [0];
    let position = header.length;
    objects.forEach((object) => { offsets.push(position); parts.push(object); position += object.length; });
    const xrefOffset = position;
    const xref = `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
    parts.push(encode(xref));
    return new Blob(parts, { type: 'application/pdf' });
  }

  async function exportPdf(button, monochrome) {
    const page = document.getElementById('resumePage');
    if (!page || !window.html2canvas) return;
    const original = button.innerHTML;
    button.disabled = true;
    button.textContent = monochrome ? 'Creating B&W…' : 'Creating PDF…';
    try {
      await document.fonts.ready;
      await Promise.all(Array.from(page.querySelectorAll('img')).map(async (image) => { if (!image.complete || !image.naturalWidth) await image.decode(); }));
      const canvas = await window.html2canvas(page, { backgroundColor: '#fffefa', scale: 3, useCORS: true, logging: false, width: page.offsetWidth, height: page.offsetHeight, scrollX: 0, scrollY: 0, onclone: (documentClone) => {
        const clonedPage = documentClone.getElementById('resumePage');
        clonedPage.style.transform = 'none';
        clonedPage.style.boxShadow = 'none';
        clonedPage.querySelectorAll('.selected-asset').forEach((element) => element.classList.remove('selected-asset'));
      }});
      const name = document.getElementById('activeResumeName')?.textContent.trim() || 'resume';
      const url = URL.createObjectURL(pdfBlobFromCanvas(canvas, monochrome));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${name.replace(/[^a-z0-9]+/gi, '-')}${monochrome ? '-bw' : ''}.pdf`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      button.disabled = false;
      button.innerHTML = original;
    }
  }

  function install() {
    const printButton = document.getElementById('printButton');
    if (!printButton) return;
    printButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      exportPdf(printButton, false);
    }, true);
    if (document.getElementById('bwButton')) return;
    const button = document.createElement('button');
    button.className = 'button quiet';
    button.id = 'bwButton';
    button.type = 'button';
    button.innerHTML = '<span class="button-icon">↓</span> B&amp;W PDF';
    button.addEventListener('click', () => exportPdf(button, true));
    printButton.before(button);
  }

  window.setTimeout(install, 0);
})();
