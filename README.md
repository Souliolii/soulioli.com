# Document Share

A simple document upload and download website built with Node.js and Express. Share files with friends on demand.

## Quick Start

**See `SETUP_AND_RUN.md` for detailed, step-by-step instructions.**

### Fast version:
1. Install Node.js from `nodejs.org`
2. Run `START_SERVICE.bat` in this folder
3. Keep the Cloudflare Tunnel running
4. Visit `https://soulioli.com`
5. Run `STOP_SERVICE.bat` when done

## How it works

- Upload documents with a title and description
- Friends download files using `https://soulioli.com`
- Files stay saved even when the service is stopped
- Only runs when you want it running

## Files & Folders

- `SETUP_AND_RUN.md` — Complete setup and run guide (READ THIS)
- `START_SERVICE.bat` — One-click start (opens Node + Cloudflare Tunnel)
- `STOP_SERVICE.bat` — One-click stop
- `uploads/` — Where uploaded files are stored
- `uploads/metadata.json` — File metadata and info

## Requirements

- Windows with Node.js installed
- `cloudflared` installed and logged in to your Cloudflare account
- Cloudflare Tunnel set up for `soulioli.com`

## Change passwords & key settings

This app supports two environment-controlled passwords:

- `UPLOAD_PASSWORD` — required to upload files through the form.
- `DELETE_PASSWORD` — required to delete files from the shared list.

Defaults are set in `server.js`:

```js
const deletePassword = process.env.DELETE_PASSWORD || 'delete123';
const uploadPassword = process.env.UPLOAD_PASSWORD || 'upload123';
```

To change them without editing code, set environment variables before launching the app:

```powershell
$env:UPLOAD_PASSWORD="MyNewUploadPass"
$env:DELETE_PASSWORD="MyNewDeletePass"
npm start
```

If you want to hardcode a new default, edit the values above in `server.js`.

Other important customizations we have added:

- Landing page at `/`
- Document share app available at `/share`
- Simple forum page available at `/forum`
- Forum posts stored in `uploads/forum.json`
- Forum topics open into a detail view at `/forum/topic/:id`
- Hidden editor available at `/forum/admin` with browser auth
- Editor password defaults to `forumadmin` unless `FORUM_ADMIN_PASSWORD` is set
- Dark emo/Myspace theme with neon pink accents
- Inline video previews for uploaded video files
- Home button on the document share page
- Upload password requirement for all uploads
- File-level download permission toggle for each upload
- Delete password requirement for removing files

## Notes

- This app requires Node.js; it cannot run on static-only platforms like GitHub Pages
- Files persist in the `uploads/` folder even after stopping the service
- Friends access the site through `https://soulioli.com`
