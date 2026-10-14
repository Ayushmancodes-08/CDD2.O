# Google Apps Script Setup & Integration Guide
## Idea and Innovation Cell (IIC PMEC / CDD×SIC)

This Google Apps Script acts as the serverless cloud bridge between the CDD Portal, Google Sheets, and Google Drive with **zero hosting fees and automated file management**.

---

## ⚡ What This Script Handles

1. **Automated Recruitment Logging (`POST action: club_registration`)**:
   - Saves student applicant records in the `Registrations` sheet.
   - Creates an isolated personal subfolder in Google Drive under `IIC_PMEC_Recruitment_2026/`:
     ```text
     IIC_PMEC_Recruitment_2026/
     └── 2301109042_Ayushman_Patra/
         ├── 2301109042_Photo.jpg
         └── UTR_428711094821_PaymentProof.jpg
     ```
   - Injects clickable `=HYPERLINK()` formulas into Google Sheets rows:
     - 📁 **Open Folder**: Opens student's personal Google Drive folder.
     - 📷 **View Photo**: Opens student's passport-size photo.
     - 💳 **View Receipt**: Opens student's payment receipt screenshot.
   - Formats amount paid with Indian Rupee formatting (`₹#,##0`).
   - Tags initial status as `Pending Verification` with amber highlighting.

2. **Admin Approval & Status Webhook (`POST action: update_status`)**:
   - When admin approves a student in `/secret-admin-cdd`, Next.js calls this script.
   - Locates row by `Reg ID / Roll No`, `Email`, or `UTR`.
   - Updates Column 12 (*Verification Status*) to `VERIFIED` with emerald green formatting.

3. **Event & Workshop Registrations (`POST action: registration`)**:
   - Logs workshop/hackathon signups to the `Event_Registrations` sheet.

4. **Live Gallery CDN (`GET ?action=getImages`)**:
   - Scans the `IIC_PMEC_Gallery` Google Drive folder and returns direct image CDN URLs to `useGallery.js`.

5. **Health Check & URL Discovery (`GET` or `GET ?action=getInfo`)**:
   - Verifies serverless webhook connectivity and returns active Sheet & Drive folder URLs.

---

## 📋 Step-by-Step Deployment Guide

### Step 1: Open Google Sheets
1. Create a new Google Sheet (or open your existing one) titled **"IIC PMEC CDD Registrations 2026"**.
2. Click **Extensions** in the top menu ➔ **Apps Script**.

### Step 2: Paste the Code
1. In the Apps Script code editor, delete any existing code inside `Code.gs`.
2. Open [`appscript/Code.js`](./Code.js) from this repository, copy the entire code, and paste it into `Code.gs`.
3. Press **Ctrl + S** (or Cmd + S) to save the file.

### Step 3: Run Permissions Test (Crucial Step!)
1. In the Apps Script toolbar, locate the function dropdown (next to "Debug") and select **`testPermissions`**.
2. Click **Run**.
3. A popup titled **"Authorization required"** will appear:
   - Click **Review permissions**.
   - Select your Google account.
   - Click **Advanced** (at the bottom left of the modal).
   - Click **Go to IIC PMEC Recruitment (unsafe)**.
   - Click **Allow**.
4. The execution log at the bottom should display:
   ```text
   Sheet access OK: IIC PMEC CDD Registrations 2026
   Main Recruitment folder OK: IIC_PMEC_Recruitment_2026
   Member folder creation OK: TEST_IIC-2026-0001_Demo_Student
   Gallery folder OK: IIC_PMEC_Gallery
   All permissions successfully granted!
   ```

### Step 4: Deploy as Web App
1. In the top-right corner of the Apps Script editor, click the blue **Deploy** button ➔ **New deployment**.
2. Under **Select type** (gear icon), select **Web app**.
3. Set the fields:
   - **Description**: `CDD Portal v2.0 - 3-Phase Registration & Approval Webhook`
   - **Execute as**: **Me (`your-email@gmail.com`)**
   - **Who has access**: **Anyone** *(Important: Must be Anyone so Next.js can send student submissions without Google login prompt)*
4. Click **Deploy**.
5. Copy the **Web App URL** provided (it looks like `https://script.google.com/macros/s/AKfycb.../exec`).

---

## 🔗 Step 5: Connect to Next.js

1. In `frontend/.env.local`, set:
   ```env
   GOOGLE_SCRIPT_URL="https://script.google.com/macros/s/YOUR_NEW_APPS_SCRIPT_ID/exec"
   ```
2. In `frontend/lib/cdd-constants.js`, update `GOOGLE_SCRIPT_URL`:
   ```javascript
   export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_NEW_APPS_SCRIPT_ID/exec';
   ```
3. Test locally or redeploy to Vercel/Netlify.
