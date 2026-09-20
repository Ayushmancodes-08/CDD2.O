# Google Apps Script Setup Guide for IIC PMEC (CDD×SIC)

This Apps Script serves as the serverless backend bridge connecting your website to Google Sheets and Google Drive with **zero hosting or database costs**.

---

## What It Handles:
1. **Club Recruitment Registrations (`doPost`)**:
   - Stores candidate details in the `Registrations` sheet.
   - Automatically creates a dedicated subfolder for each registered student inside `IIC_PMEC_Recruitment_2026/`:
     ```text
     IIC_PMEC_Recruitment_2026/
     └── IIC-2026-0042_Ayushman_Patra/
         ├── IIC-2026-0042_Photo.jpg
         └── UTR_426491029481_PaymentProof.jpg
     ```
   - Injects clickable `=HYPERLINK(...)` formulas directly into sheet rows:
     - 📁 **Open Folder** (Opens the student's personal Google Drive folder)
     - 📷 **View Photo** (Opens their student portrait)
     - 💳 **View Receipt** (Opens their UTR payment screenshot)
2. **Event Registrations (`doPost`)**:
   - Saves workshop and event signups into the `Event_Registrations` sheet.
3. **Gallery API (`doGet?action=getImages`)**:
   - Fetches all club event photos from the `IIC_PMEC_Gallery` Google Drive folder and returns direct CDN URLs to `useGallery.js`.

---

## Step-by-Step Update:

1. Open your Apps Script project at [script.google.com](https://script.google.com) (or via **Extensions** > **Apps Script** in your spreadsheet).
2. Select all existing code in `Code.gs`, delete it, and paste the entire updated code from [`Code.js`](./Code.js).
3. Press **Ctrl + S** to save.
4. Click the blue **Deploy** button (top right) ➔ **Manage deployments**.
5. Click the **Pencil (Edit)** icon on your active Web app deployment:
   - Change version to **New version**.
   - Ensure Who has access is set to **Anyone**.
   - Click **Deploy**.
6. (If the Web App URL changed, update `GOOGLE_SCRIPT_URL` in `frontend/.env.local` and `frontend/lib/cdd-constants.js`).
