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

### Step 2: Install ngrok (for sharing with friends)

1. Go to `https://ngrok.com/`
2. Click **Sign Up** (create a free account)
3. After signing in, go to the **Download** page
4. Download the **Windows** zip file
5. Unzip it to a simple folder like `C:\ngrok`
6. In PowerShell, add ngrok to your system PATH:
   ```
   $ngrokPath = "C:\ngrok"
   $env:Path += ";$ngrokPath"
   ```

**To verify:** Open PowerShell and type:
```
ngrok --version
```
You should see a version number. If you see an error, restart PowerShell and try again.

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

### Step 1: Start the Node server

1. Open PowerShell
2. Go to the project folder:
   ```
   cd e:\Github\soulioli.com
   ```
3. Start the server:
   ```
   npm start
   ```
4. You should see:
   ```
   Document Share server running at http://localhost:3000
   ```
   **Leave this window open.** Do not close it.

---

### Step 2: Start ngrok (to give friends access)

1. Open a **new PowerShell window** (don't close the first one)
2. Start ngrok:
   ```
   ngrok http 3000
   ```
3. You'll see a screen like this:
   ```
   ngrok by @inconshreveable
   ...
   Session Status:           online
   Account:                  [your email]
   Version:                  X.X.X
   Region:                   us (United States)
   Forwarding:               https://[random-id].ngrok.io -> http://localhost:3000
   ```

4. Copy the URL that starts with `https://` (the random one like `https://abc123xyz.ngrok.io`)

---

### Step 3: Share the link with friends

Send your friends the ngrok URL. They can now:
- Visit the site
- Upload documents
- Download documents

**Important:** The link only works while BOTH terminals are running (the Node server AND ngrok).

---

## PART 3: USE THE SERVICE

### For you (on your computer):
1. Go to `http://localhost:3000` in your browser

### For your friends:
1. Use the ngrok URL you shared (looks like `https://abc123xyz.ngrok.io`)

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

### Step 1: Stop ngrok

1. Go to the ngrok PowerShell window (the second one you opened)
2. Press `Ctrl + C`
3. The window will close or show `[CTRL-C]`

---

### Step 2: Stop the Node server

1. Go to the other PowerShell window (the first one with npm start)
2. Press `Ctrl + C`
3. The window will close or show an exit message

---

### Step 3: Verify it's stopped

- Friends trying to use the ngrok URL will get an error
- Your PC will no longer be serving the site
- Files are **still saved** in `e:\Github\soulioli.com\uploads\`

---

## TROUBLESHOOTING

### "npm not found"
- You didn't install Node.js properly
- Restart your computer
- Download and install Node.js again from `nodejs.org`

### "ngrok not found"
- You didn't install ngrok or add it to PATH
- Download ngrok and unzip it to `C:\ngrok`
- Then add to PATH (see Setup Step 2)

### "Address already in use" error
- Something else is using port 3000
- Close all PowerShell windows
- Wait 10 seconds
- Try again

### My friend can't access the link
- Make sure BOTH terminals are still running (Node server + ngrok)
- Check that they're using the full URL with `https://`
- Restart ngrok to get a new URL

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
- Press `Ctrl + C` in Terminal 2
- Press `Ctrl + C` in Terminal 1

**Files are saved in:**
```
e:\Github\soulioli.com\uploads\
```

**Your friends use:**
```
https://[the-url-from-ngrok]
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
