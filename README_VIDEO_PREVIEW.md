Video preview support

What changed:
- `app.js` now detects video files by extension (mp4, webm, ogg, mov) and renders an inline `<video controls>` element inside the file card.

Notes:
- Videos are served directly from the `uploads/` directory, so large files may take time to load.
- Browser autoplay policies require user interaction for autoplay; previews are not autoplaying but are playable via controls.

How to test locally:
1. Start the server:

```powershell
cd /d e:\Github\soulioli.com
npm start
```

2. Upload a small MP4 or WebM file via the upload form.
3. After upload, the file card should show a video player with controls and a Download button.

Styling:
- Video preview uses class `.video-preview`. You can style it in `styles.css` to set max-width/height, borders, or glow.

Security:
- Serving uploaded files raw is fine for small personal projects, but for public-facing sites consider streaming, size limits, or virus scanning.
