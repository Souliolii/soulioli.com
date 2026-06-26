# Document Share — Complete Setup & Run Guide

## PART 1: ONE-TIME SETUP (Do this once)

### Step 1: Install Node.js

1. Go to `https://nodejs.org/`
2. Click the big green button labeled **"LTS"** (Long Term Support)
3. Run the installer
4. Click **Next** through all screens (keep defaults)
5. Click **Install**
6. When done, click **Finish**

**To verify:** Open PowerShell and type:
```
node --version
```
You should see a version number like `v20.x.x`. If you see an error, restart your computer and try again.

---

### Step 2: Install Cloudflare Tunnel (`cloudflared`)

1. Go to the Cloudflare installation page:
   `https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/`
2. Download and install `cloudflared` for Windows.
3. Open PowerShell and verify the install:
   ```powershell
   cloudflared --version
   ```
4. Authenticate with Cloudflare if needed:
   ```powershell
   cloudflared login
   ```

**To verify:** the command should open a browser and ask you to sign in to Cloudflare.

---

### Step 3: Install the app's dependencies

1. Open PowerShell
2. Navigate to the project:
   ```
   cd e:\Github\soulioli.com
   ```
3. Run:
   ```
   npm install
   ```
   This will take 1-2 minutes. You'll see text scrolling. Wait until it finishes.

**You only do this once.** The `node_modules` folder will be created.

---

## PART 2: START THE SERVICE (Do this when you want it running)

### Step 1: Start the app and tunnel

1. Open PowerShell
2. Go to the project folder:
   ```powershell
   cd e:\Github\soulioli.com
   ```
3. Run the startup script:
   ```powershell
   START_SERVICE.bat
   ```
4. This will open two windows:
   - Node server
   - Cloudflare Tunnel

5. Keep both windows open while the tunnel is running.

### Step 2: Confirm the site is available

1. Open your browser and visit:
   ```
   https://soulioli.com
   ```
2. If the page does not load immediately, wait a few seconds, refresh, and try again.

---

### Step 3: Share your domain with friends

Send your friends this URL:
- `https://soulioli.com`

They can now visit the site, upload documents, and download files.

Send your friends this URL:
- `https://soulioli.com`

They can now:
- Visit the site
- Upload documents
- Download documents

**Important:** The site only works while BOTH windows are running (the Node server AND Cloudflare Tunnel).

---

## PART 3: USE THE SERVICE

### For you (on your computer):
1. Go to `http://localhost:3000` in your browser

### For your friends:
1. Go to `https://soulioli.com`

### How to upload a file:
1. Enter a title (e.g., "Budget Spreadsheet")
2. Enter a description (e.g., "Q3 budget for team review")
3. Click "Choose a file" and select the file
4. Click "Upload file"
5. Wait for the success message

### How friends download:
1. They see a list of all files
2. They click the "Download" button on any file
3. The file downloads to their computer

---

## PART 4: STOP THE SERVICE (When you want to shut it down)

### Step 1: Stop the Cloudflare Tunnel

1. Go to the Cloudflare Tunnel PowerShell window
2. Press `Ctrl + C`
3. The window will close or show `[CTRL-C]`

---

### Step 2: Stop the Node server

1. Go to the other PowerShell window (the one with npm start)
2. Press `Ctrl + C`
3. The window will close or show an exit message

---

### Step 3: Verify it's stopped

- `https://soulioli.com` will no longer connect
- Your PC will no longer be serving the site
- Files are **still saved** in `e:\Github\soulioli.com\uploads\`

---

## TROUBLESHOOTING

### "npm not found"
- You didn't install Node.js properly
- Restart your computer
- Download and install Node.js again from `nodejs.org`

### "cloudflared not found"
- You didn't install Cloudflare Tunnel or it is not in your PATH
- Reinstall `cloudflared` and restart PowerShell

### "Address already in use" error
- Something else is using port 3000
- Close all PowerShell windows
- Wait 10 seconds
- Try again

### My friend can't access the site
- Make sure BOTH windows are still running (Node server + Cloudflare Tunnel)
- Check that they're using the URL `https://soulioli.com`
- Restart the tunnel if needed

### I want to upload a new file
- Keep everything running
- Just use the browser
- New files appear immediately

### I want to change which files are available
- Stop the service (Part 4)
- Edit or delete files in `e:\Github\soulioli.com\uploads\`
- Start the service again

---

## QUICK REFERENCE

**To start everything:**
```
# Terminal 1:
cd e:\Github\soulioli.com
npm start

# Terminal 2:
ngrok http 3000
```

**To stop everything:**
- Press `Ctrl + C` in the Cloudflare Tunnel window
- Press `Ctrl + C` in the Node server window

**Files are saved in:**
```
e:\Github\soulioli.com\uploads\
```

**Your friends use:**
```
https://soulioli.com
```

---

## PASSWORD PROTECTION

By default, the delete password is: `delete123`

You must enter this password to delete any file.

### Change the delete password

1. Set an environment variable before starting:
   ```
   $env:DELETE_PASSWORD="your-new-password"
   ```

2. Then run `npm start`

3. Now the new password will be required to delete files

Example:
```
$env:DELETE_PASSWORD="MySecretPass123"
npm start
```

For permanent change, add it to your system environment variables.

- **npm start** = starts a local web server on your computer (port 3000)
- **ngrok** = creates a secure tunnel from the internet to your local server
- **uploads/** = folder where all uploaded files are stored
- **metadata.json** = file that tracks who uploaded what and when
