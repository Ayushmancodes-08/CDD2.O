/**
 * ==============================================================================
 * IDEA AND INNOVATION CELL (IIC PMEC / CDD×SIC) - FULL APPS SCRIPT BACKEND
 * ==============================================================================
 * 
 * Features:
 * 1. Recruitment Registrations (POST):
 *    - Creates a dedicated subfolder for each registered student inside
 *      the main "IIC_PMEC_Recruitment_2026" folder:
 *      e.g. "IIC-2026-0042_Ayushman_Patra"
 *    - Saves both:
 *        1. Student Profile Photo ("STUDENT_Photo.jpg")
 *        2. Payment Screenshot ("UTR_123456789012_PaymentProof.jpg")
 *      directly inside the member's personal folder!
 *    - Adds clickable =HYPERLINK() links to the member folder, photo, and receipt.
 * 
 * 2. Event Registrations (POST):
 *    - Logs workshop/event signups to an "Event_Registrations" tab.
 * 
 * 3. Gallery Images API (GET ?action=getImages):
 *    - Scans Google Drive folder ("IIC_PMEC_Gallery") and returns direct CDN URLs.
 * 
 * 4. Health Check (GET):
 *    - Instant online verification.
 */

const MAIN_FOLDER_NAME = "IIC_PMEC_Recruitment_2026";
const GALLERY_FOLDER_NAME = "IIC_PMEC_Gallery";
const RECRUITMENT_SHEET_NAME = "Registrations";
const EVENT_SHEET_NAME = "Event_Registrations";

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
    // CASE 2: CLUB RECRUITMENT REGISTRATION (Per-Member Folder + Photo + UTR)
    // ==========================================================================
    let sheet = ss.getSheetByName(RECRUITMENT_SHEET_NAME);
    const headers = [
      "Timestamp",
      "Reg ID",
      "Student Name",
      "Year of Study",
      "Engineering Branch",
      "College",
      "WhatsApp Phone",
      "Email Address",
      "Fee Amount (₹)",
      "UPI Ref (UTR)",
      "Paying UPI ID",
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
    }

    // 1. Get Main Recruitment Folder
    const mainFolder = getOrCreateFolder(MAIN_FOLDER_NAME);

    // 2. Create Dedicated Subfolder for THIS Registered Member
    const cleanRegId = sanitizeFileName(data.regId || "STUDENT");
    const cleanName = sanitizeFileName(data.name || "Member");
    const memberFolderName = cleanRegId + "_" + cleanName;
    const memberFolder = getOrCreateSubFolder(mainFolder, memberFolderName);
    const memberFolderUrl = memberFolder.getUrl();
    const folderFormula = '=HYPERLINK("' + memberFolderUrl + '", "📁 Open Folder")';

    // 3. Decode & Save Student Photo inside the Member's Personal Folder
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

    // 4. Decode & Save Payment Screenshot inside the Member's Personal Folder
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

    // 5. Format & Append Row
    const timestamp = data.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const rowData = [
      timestamp,
      data.regId || "N/A",
      data.name || "N/A",
      data.year || "N/A",
      data.branch || "N/A",
      data.college || "Parala Maharaja Engineering College",
      "'" + (data.phone || ""), // Force string format for phone numbers
      data.email || "N/A",
      Number(data.amount) || 300,
      "'" + (data.utr || ""), // Force string format for 12-digit UTR numbers
      data.payingUpi || "N/A",
      data.status || "Added to WhatsApp Group",
      folderFormula,
      photoFormula,
      receiptFormula
    ];

    sheet.appendRow(rowData);

    // Format new row styling
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, rowData.length).setVerticalAlignment("middle");
    
    // Status color badge (Column 12: Status)
    const statusCell = sheet.getRange(lastRow, 12);
    statusCell.setFontWeight("bold");
    statusCell.setFontColor("#059669"); // Emerald for confirmed / added to group

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      regId: data.regId,
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
