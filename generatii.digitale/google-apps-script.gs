const SHEET_NAME = "Solicitari Oferta";

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error("Foaia '" + SHEET_NAME + "' nu a fost găsită în spreadsheet.");
    }

    const params = e.parameter;

    sheet.appendRow([
      new Date(),
      params.source || "",
      params.program || "",
      params.name || "",
      params.email || "",
      params.phone || "",
      params.institution || "",
      params.role || "",
      params.message || ""
    ]);

    return createResponse("Mulțumim! Cererea ta a fost trimisă cu succes.");
  } catch (error) {
    return createResponse("Eroare: " + error.toString());
  }
}

function doGet() {
  return createResponse("API activ");
}

function createResponse(message) {
  return ContentService
    .createTextOutput(message)
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST",
      "Access-Control-Allow-Headers": "Content-Type"
    });
}