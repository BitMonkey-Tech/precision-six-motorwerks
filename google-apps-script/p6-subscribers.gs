/**
 * P6 Subscribers: receives "Join the P6 Community" popup signups from the
 * homepage and appends each one as a row in the "P6 Subscribers" sheet.
 *
 * This file is NOT run by the website. It is pasted into Google Apps Script
 * (Google's free server side JavaScript, attached to a Google Sheet).
 *
 * One time setup:
 *   1. In Google Drive, create a new Google Sheet named "P6 Subscribers".
 *   2. In that sheet, open Extensions > Apps Script.
 *   3. Delete the sample code, paste in this whole file, and click Save.
 *   4. In the function menu at the top, pick "setup" and click Run.
 *      Google will ask you to authorize it; approve with the account that
 *      owns the sheet. This adds the header row.
 *   5. Click Deploy > New deployment. Type: "Web app".
 *        Execute as:      Me
 *        Who has access:  Anyone
 *      Click Deploy and copy the "Web app URL" (ends in /exec).
 *   6. Paste that URL into SHEET_URL at the top of /assets/subscribe.js.
 *
 * If you edit this script later, use Deploy > Manage deployments > Edit
 * (pencil) > Version: New version, so the same /exec URL keeps working.
 */

const SHEET_NAME = 'Subscribers';
const HEADERS = ['Signed up', 'First name', 'Last name', 'Email', 'Car', 'Page'];
const EMAIL_COLUMN = 4; // column D, used to spot repeat signups

// Run once by hand (step 4) to name the tab and add the header row.
function setup() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  sheet.setName(SHEET_NAME);
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
  sheet.setFrozenRows(1);
}

// Google calls doPost every time the website sends a signup to the /exec URL.
function doPost(e) {
  const p = (e && e.parameter) || {};

  // Honeypot: real people never see or fill this field, bots usually do.
  if (p._gotcha) return json({ ok: true });

  const email = String(p.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: 'Invalid email' });
  }

  // A lock stops two signups arriving at the same moment from writing the same row.
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    // Skip emails that are already on the list so nobody is added twice.
    const last = sheet.getLastRow();
    if (last > 1) {
      const existing = sheet.getRange(2, EMAIL_COLUMN, last - 1, 1).getValues().flat();
      if (existing.indexOf(email) !== -1) return json({ ok: true, duplicate: true });
    }

    sheet.appendRow([
      new Date(),
      clean(p['first-name']),
      clean(p['last-name']),
      email,
      clean(p.car),
      clean(p.page),
    ]);
  } finally {
    lock.releaseLock();
  }
  return json({ ok: true });
}

// Trim, cap the length, and stop a value starting with = + - @ from being
// treated as a spreadsheet formula.
function clean(value) {
  const s = String(value || '').trim().slice(0, 200);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
