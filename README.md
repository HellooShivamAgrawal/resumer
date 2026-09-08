# Paperroom resume editor

Open `index.html` in a browser, or serve this folder locally:

```bash
python3 -m http.server 4173
```

The editor includes two editable A4 resume templates:

- Shivam Agrawal — editorial two-column version
- Harshit Shah — classic split version

Click text on the page to edit it. Changes are saved automatically in the browser and remain after refreshes and later sessions on the same browser/device. **Download PDF** creates a one-page A4 PDF directly, including bundled fonts and image assets. **Download editable HTML** creates a portable HTML copy you can import later.

For structured editing, open **Edit JSON**. The JSON has three useful parts:

- `content` contains the editable field values.
- `mapping` shows the selector and field type used to place each value.
- `layout` stores density and type scale.

You can edit JSON and apply it; the page auto-fits content where possible when sections change.

Open **Templates** to create a resume from either supplied layout, duplicate the current resume, rename it, or delete it. Each document has independent content, layout density, and image changes.

For a portable backup, use **Download editable HTML** or **Edit JSON → Download JSON**. Use **Templates → Import backup** to restore either format as an independent resume. Clearing browser site data removes the local library. Legacy HTML exports without rendering metadata are rejected so they cannot silently change typography or layout.
