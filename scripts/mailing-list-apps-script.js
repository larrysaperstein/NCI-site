/**
 * Google Apps Script for the NCI mailing list form.
 *
 * SETUP (do this in Google, then paste the /exec URL into src/config/mailingList.ts):
 *
 * 1. Create a Google Sheet named something like "NCI Mailing List".
 * 2. In row 1, add headers: Timestamp | Name | Email | Source
 * 3. Extensions → Apps Script
 * 4. Paste this entire file into Code.gs and save
 * 5. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the Web app URL ending in /exec
 * 7. Paste it into MAILING_LIST_CONFIG.submitUrl in src/config/mailingList.ts
 * 8. Redeploy the website
 *
 * Tip: After editing the script later, use Deploy → Manage deployments → Edit (pencil)
 * and choose "New version", otherwise the site keeps calling the old deployment.
 */

const SHEET_NAME = "Sheet1"; // change if your tab is named differently

function doPost(e) {
  try {
    const raw = e.postData && e.postData.contents ? e.postData.contents : "{}";
    const data = JSON.parse(raw);
    const name = String(data.name || "").trim();
    const email = String(data.email || "").trim().toLowerCase();
    const source = String(data.source || "").trim();

    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json_({ ok: false, error: "Invalid name or email." });
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      return json_({ ok: false, error: "Sheet tab not found." });
    }

    sheet.appendRow([new Date(), name, email, source]);
    return json_({ ok: true });
  } catch (error) {
    return json_({ ok: false, error: String(error) });
  }
}

function doGet() {
  return json_({ ok: true, message: "NCI mailing list endpoint is live." });
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
