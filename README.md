# Document Share

A simple document upload and download website built with Node.js and Express. Share files with friends on demand.

## Quick Start

**See `SETUP_AND_RUN.md` for detailed, step-by-step instructions.**

### Fast version:
1. Install Node.js from `nodejs.org`
2. Run `START_SERVICE.bat` in this folder
3. Share the ngrok URL with friends
4. Run `STOP_SERVICE.bat` when done

## How it works

- Upload documents with a title and description
- Friends download files using a shared URL
- Files stay saved even when the service is stopped
- Only runs when you want it running

## Files & Folders

- `SETUP_AND_RUN.md` — Complete setup and run guide (READ THIS)
- `START_SERVICE.bat` — One-click start (opens Node + ngrok)
- `STOP_SERVICE.bat` — One-click stop
- `uploads/` — Where uploaded files are stored
- `uploads/metadata.json` — File metadata and info

## Requirements

- Windows with Node.js installed
- Internet connection (for ngrok tunnel)
- ngrok account (free at ngrok.com)

## Notes

- This app requires Node.js; it cannot run on static-only platforms like GitHub Pages
- Files persist in the `uploads/` folder even after stopping the service
- Friends access via a secure ngrok tunnel URL
