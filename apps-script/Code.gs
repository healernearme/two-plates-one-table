/**
 * Two Plates, One Table — tiny sync backend.
 *
 * Paste this into a new Google Apps Script project bound to a spreadsheet
 * (Extensions → Apps Script from within Google Sheets), then deploy it as
 * a Web App (Deploy → New deployment → type "Web app", execute as "Me",
 * access "Anyone"). See README.md for the full walkthrough.
 *
 * It stores the whole app state as one JSON blob in cell A1 of a "state"
 * sheet — simplest possible free database for two people's checkboxes
 * and meal picks.
 */

const SHEET_NAME = "state";

function doGet(e) {
  const sheet = getSheet_();
  const value = sheet.getRange("A1").getValue();
  return ContentService
    .createTextOutput(value || "{}")
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const sheet = getSheet_();
  let body = "{}";
  try {
    body = e.postData.contents;
    JSON.parse(body); // validate
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: "invalid json" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  sheet.getRange("A1").setValue(body);
  sheet.getRange("A2").setValue("last updated");
  sheet.getRange("B2").setValue(new Date());
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange("A1").setValue("{}");
  }
  return sheet;
}
