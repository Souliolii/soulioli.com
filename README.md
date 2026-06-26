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

## Notes

- This app requires Node.js; it cannot run on static-only platforms like GitHub Pages
- Files persist in the `uploads/` folder even after stopping the service
- Friends access the site through `https://soulioli.com`
