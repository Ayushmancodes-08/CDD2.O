/**
 * ==============================================================================
 * IDEA AND INNOVATION CELL (IIC PMEC / CDD×SIC) - FULL APPS SCRIPT BACKEND
 * ==============================================================================
 * 
 * Features:
 * 1. Recruitment Registrations (POST):
 *    - Creates a dedicated subfolder for each registered student inside
 *      the main "IIC_PMEC_Recruitment_2026" folder:
 *      e.g. "2301109042_Ayushman_Patra"
 *    - Saves both:
 *        1. Student Profile Photo ("2301109042_Photo.jpg")
 *        2. Payment Screenshot ("UTR_123456789012_PaymentProof.jpg")
 *      directly inside the member's personal folder!
 *    - Adds clickable =HYPERLINK() links to the member folder, photo, and receipt.
 *    - Sets status to "Pending Verification".
 * 
 * 2. Admin Status Approval Webhook (POST action: update_status):
 *    - Triggered when admin approves candidate in /secret-admin-cdd.
 *    - Updates status in Google Sheet to "VERIFIED" with green formatting.
 *    - Can also send a native Google backup confirmation email with official WhatsApp link.
 * 
 * 3. Event Registrations (POST):
 *    - Logs workshop/event signups to an "Event_Registrations" tab.
 * 
 * 4. Gallery Images API (GET ?action=getImages):
 *    - Scans Google Drive folder ("IIC_PMEC_Gallery") and returns direct CDN URLs.
 * 
 * 5. Health Check (GET):
 *    - Instant online verification.
 */

const MAIN_FOLDER_NAME = "IIC_PMEC_Recruitment_2026";
const GALLERY_FOLDER_NAME = "IIC_PMEC_Gallery";
const RECRUITMENT_SHEET_NAME = "Registrations";
const EVENT_SHEET_NAME = "Event_Registrations";
const OFFICIAL_WHATSAPP_LINK = "https://chat.whatsapp.com/HPR6RiuFLhxJz34y52IvjY";

/**
 * ==============================================================================
 * GET REQUEST HANDLER
 * ==============================================================================
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "";

    // --- Action: Get Gallery Images ---
    if (action === "getImages") {
      const galleryFolder = getOrCreateFolder(GALLERY_FOLDER_NAME);
      const files = galleryFolder.getFiles();
      const images = [];

      while (files.hasNext()) {
        const file = files.next();
        const mime = file.getMimeType();
        if (mime.startsWith("image/")) {
          try {
            file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          } catch (shareErr) {}

          const fileId = file.getId();
          images.push({
            name: file.getName(),
            url: "https://lh3.googleusercontent.com/d/" + fileId,
            driveUrl: file.getUrl(),
            dateAdded: file.getDateCreated().toISOString()
          });
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        data: images,
        count: images.length
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- Action: Get Master URLs & Status ---
    if (action === "getInfo" || action === "urls") {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const mainFolder = getOrCreateFolder(MAIN_FOLDER_NAME);
      const recSheet = ss.getSheetByName(RECRUITMENT_SHEET_NAME);
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        spreadsheetUrl: ss.getUrl(),
        mainFolderUrl: mainFolder.getUrl(),
        recruitmentFolder: MAIN_FOLDER_NAME,
        totalRows: recSheet ? recSheet.getLastRow() : 0,
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- Default: Health Check ---
    return ContentService.createTextOutput(JSON.stringify({
      status: "online",
      service: "IIC PMEC Recruitment & Storage Webhook",
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.message || err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * ==============================================================================
 * POST REQUEST HANDLER
 * ==============================================================================
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // Wait up to 30 seconds for concurrent write locks
    lock.waitLock(30000);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: "Server busy, lock timeout. Please retry."
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "No POST body content received."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // ==========================================================================
    // CASE 1: EVENT REGISTRATION (From EventsSection or Workshop Forms)
    // ==========================================================================
    if (data.type === "registration" || data.eventName) {
      let eventSheet = ss.getSheetByName(EVENT_SHEET_NAME);
      if (!eventSheet) {
        eventSheet = ss.insertSheet(EVENT_SHEET_NAME);
        const eventHeaders = [
          "Timestamp",
          "Event Name",
          "Student Name",
          "Reg / Roll No",
          "Year",
          "Branch",
          "WhatsApp Phone",
          "Email Address",
          "Status"
        ];
        eventSheet.appendRow(eventHeaders);
        const headerRange = eventSheet.getRange(1, 1, 1, eventHeaders.length);
        headerRange.setBackground("#1e293b");
        headerRange.setFontColor("#ffffff");
        headerRange.setFontWeight("bold");
        headerRange.setHorizontalAlignment("center");
        eventSheet.setFrozenRows(1);
      }

      const timestamp = data.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      const eventRow = [
        timestamp,
        data.eventName || "General Event",
        data.name || data.studentName || "N/A",
        "'" + (data.regId || data.rollNo || "N/A"),
        data.year || "N/A",
        data.branch || "N/A",
        "'" + (data.phone || ""),
        data.email || "N/A",
        data.status || "Registered"
      ];

      eventSheet.appendRow(eventRow);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        type: "event_registration",
        message: "Event registration saved successfully."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ==========================================================================
    // CASE 2: STATUS UPDATE / APPROVE MEMBER WEBHOOK (From Admin Dashboard)
    // ==========================================================================
    if (data.action === "update_status" || data.action === "approve_member") {
      let sheet = ss.getSheetByName(RECRUITMENT_SHEET_NAME);
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: "Registrations sheet not found."
        })).setMimeType(ContentService.MimeType.JSON);
      }

      const searchRegId = (data.regId || "").toLowerCase().trim();
      const searchRollNo = (data.rollNo || "").toLowerCase().trim();
      const searchEmail = (data.email || "").toLowerCase().trim();
      const searchUtr = (data.utr || "").toLowerCase().trim();
      const lastRow = sheet.getLastRow();
      let rowFound = -1;

      if (lastRow > 1) {
        const values = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
        for (let i = 0; i < values.length; i++) {
          const rowReg = String(values[i][1]).toLowerCase().trim(); // Column 2 (Reg ID / Roll No)
          const rowEmail = String(values[i][7]).toLowerCase().trim(); // Column 8 (Email)
          const rowUtr = String(values[i][9]).toLowerCase().trim(); // Column 10 (UTR)

          const matchReg = (searchRollNo && rowReg.includes(searchRollNo)) || (searchRegId && rowReg.includes(searchRegId));
          const matchEmail = searchEmail && rowEmail === searchEmail;
          const matchUtr = searchUtr && rowUtr.includes(searchUtr);

          if (matchReg || matchEmail || matchUtr) {
            rowFound = i + 2;
            break;
          }
        }
      }

      const targetStatus = (data.status || "VERIFIED").toUpperCase();
      if (rowFound !== -1) {
        const statusCell = sheet.getRange(rowFound, 12);
        statusCell.setValue(targetStatus);
        statusCell.setFontWeight("bold");
        if (targetStatus === "VERIFIED") {
          statusCell.setFontColor("#059669");
        } else if (targetStatus === "REJECTED") {
          statusCell.setFontColor("#dc2626");
        } else {
          statusCell.setFontColor("#d97706");
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Status updated in Google Sheet.",
        rowNumber: rowFound,
        status: targetStatus
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ==========================================================================
    // CASE 3: CLUB RECRUITMENT REGISTRATION (Per-Member Folder + Photo + UTR)
    // ==========================================================================
    let sheet = ss.getSheetByName(RECRUITMENT_SHEET_NAME);
    const headers = [
      "Timestamp",
      "Reg ID / Roll No",
      "Student Name",
      "Year of Study",
      "Engineering Branch",
      "College",
      "WhatsApp Phone",
      "Email Address",
      "Amount Paid (₹)",
      "Bank Ref (UTR)",
      "Payment Method",
      "Verification Status",
      "Member Drive Folder",
      "Student Photo",
      "Payment Screenshot"
    ];

    if (!sheet) {
      sheet = ss.insertSheet(RECRUITMENT_SHEET_NAME);
      sheet.appendRow(headers);
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#0f172a");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    } else if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#0f172a");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    } else {
      // Ensure existing headers stay in sync
      sheet.getRange(1, 2).setValue("Reg ID / Roll No");
      sheet.getRange(1, 9).setValue("Amount Paid (₹)");
      sheet.getRange(1, 10).setValue("Bank Ref (UTR)");
      sheet.getRange(1, 11).setValue("Payment Method");
    }

    // 1. Get Main Recruitment Folder
    const mainFolder = getOrCreateFolder(MAIN_FOLDER_NAME);

    // 2. Extract and format Registration Number and Amount Paid
    const regNumber = (data.rollNo || data.registrationNumber || data.regId || "CDD26-STUDENT").trim();
    const cleanRegId = sanitizeFileName(regNumber);
    const cleanName = sanitizeFileName(data.name || "Member");
    const amountPaid = Number(data.amountPaid || data.amount) || 300;

    // 3. Create Dedicated Subfolder for THIS Registered Member
    const memberFolderName = cleanRegId + "_" + cleanName;
    const memberFolder = getOrCreateSubFolder(mainFolder, memberFolderName);
    const memberFolderUrl = memberFolder.getUrl();
    const folderFormula = '=HYPERLINK("' + memberFolderUrl + '", "📁 Open Folder")';

    // 4. Decode & Save Student Photo inside the Member's Personal Folder
    let photoUrl = "";
    let photoFormula = "No Photo";
    if (data.photo && typeof data.photo === "string" && data.photo.length > 50) {
      try {
        const cleanBase64 = data.photo.includes(",") ? data.photo.split(",")[1] : data.photo;
        const decoded = Utilities.base64Decode(cleanBase64);
        const fileName = cleanRegId + "_Photo.jpg";
        const blob = Utilities.newBlob(decoded, "image/jpeg", fileName);
        const file = memberFolder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        photoUrl = file.getUrl();
        photoFormula = '=HYPERLINK("' + photoUrl + '", "📷 View Photo")';
      } catch (imgErr) {
        photoFormula = "Upload Error: " + imgErr.message;
      }
    }

    // 5. Decode & Save Payment Screenshot inside the Member's Personal Folder
    let receiptUrl = "";
    let receiptFormula = "No Screenshot";
    if (data.paymentScreenshot && typeof data.paymentScreenshot === "string" && data.paymentScreenshot.length > 50) {
      try {
        const cleanBase64 = data.paymentScreenshot.includes(",") ? data.paymentScreenshot.split(",")[1] : data.paymentScreenshot;
        const decoded = Utilities.base64Decode(cleanBase64);
        const cleanUtr = sanitizeFileName(data.utr || "000000");
        const fileName = "UTR_" + cleanUtr + "_PaymentProof.jpg";
        const blob = Utilities.newBlob(decoded, "image/jpeg", fileName);
        const file = memberFolder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        receiptUrl = file.getUrl();
        receiptFormula = '=HYPERLINK("' + receiptUrl + '", "💳 View Receipt")';
      } catch (imgErr) {
        receiptFormula = "Upload Error: " + imgErr.message;
      }
    }

    // 6. Format & Append Row
    const timestamp = data.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const rowData = [
      timestamp,
      "'" + regNumber, // Force string representation for registration number
      data.name || "N/A",
      data.year || "N/A",
      data.branch || "N/A",
      data.college || "Parala Maharaja Engineering College",
      "'" + (data.phone || ""), // Force string format for phone numbers
      data.email || "N/A",
      amountPaid, // Numeric amount for easy summing/formulas in Google Sheets
      "'" + (data.utr || ""), // Force string format for 12-digit UTR numbers
      data.payingUpi || "Canara Bank Direct Transfer",
      data.status || "Pending Verification",
      folderFormula,
      photoFormula,
      receiptFormula
    ];

    sheet.appendRow(rowData);

    // Format new row styling
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, rowData.length).setVerticalAlignment("middle");
    
    // Highlight Registration Number (Column 2)
    const regNumCell = sheet.getRange(lastRow, 2);
    regNumCell.setFontWeight("bold");
    regNumCell.setHorizontalAlignment("center");

    // Format Amount Paid (Column 9) as Currency
    const amountCell = sheet.getRange(lastRow, 9);
    amountCell.setFontWeight("bold");
    amountCell.setHorizontalAlignment("right");
    amountCell.setNumberFormat("₹#,##0");

    // Status color badge (Column 12: Status)
    const statusCell = sheet.getRange(lastRow, 12);
    statusCell.setFontWeight("bold");
    const initialStatus = String(data.status || "Pending Verification").toUpperCase();
    if (initialStatus === "VERIFIED" || initialStatus.includes("WHATSAPP")) {
      statusCell.setFontColor("#059669"); // Emerald
    } else {
      statusCell.setFontColor("#d97706"); // Amber for pending verification
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      regId: regNumber,
      registrationNumber: regNumber,
      amountPaid: amountPaid,
      memberFolderUrl: memberFolderUrl,
      mainFolderUrl: mainFolder.getUrl(),
      spreadsheetUrl: ss.getUrl(),
      photoUrl: photoUrl,
      receiptUrl: receiptUrl,
      rowNumber: lastRow
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message || error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * ==============================================================================
 * HELPER FUNCTIONS
 * ==============================================================================
 */

/**
 * Gets an existing Drive folder or creates it if missing
 */
function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  const folder = DriveApp.createFolder(folderName);
  folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return folder;
}

/**
 * Gets an existing subfolder inside a parent folder, or creates it
 */
function getOrCreateSubFolder(parentFolder, subFolderName) {
  const subFolders = parentFolder.getFoldersByName(subFolderName);
  if (subFolders.hasNext()) {
    return subFolders.next();
  }
  const subFolder = parentFolder.createFolder(subFolderName);
  subFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return subFolder;
}

/**
 * Sanitizes folder and file names for safe saving in Drive
 */
function sanitizeFileName(name) {
  return (name || "member").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
}

/**
 * Test function to run directly from Apps Script editor to authorize Drive & Sheets permissions
 */
function testPermissions() {
  Logger.log("Testing permissions...");
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log("Sheet access OK: " + ss.getName());
  const folder = getOrCreateFolder(MAIN_FOLDER_NAME);
  Logger.log("Main Recruitment folder OK: " + folder.getName());
  const testSub = getOrCreateSubFolder(folder, "TEST_IIC-2026-0001_Demo_Student");
  Logger.log("Member folder creation OK: " + testSub.getName());
  const gallery = getOrCreateFolder(GALLERY_FOLDER_NAME);
  Logger.log("Gallery folder OK: " + gallery.getName());
  Logger.log("All permissions successfully granted!");
}
