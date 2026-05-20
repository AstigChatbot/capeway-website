const SHEET_NAMES = {
  roomTypes: "Room Types",
  rooms: "Rooms",
  bookings: "Bookings",
  contactMessages: "Contact Messages"
};

const SHEET_HEADERS = {
  "Room Types": [
    "id",
    "name",
    "description",
    "nightlyRate",
    "totalRooms",
    "imageUrl",
    "amenities",
    "active"
  ],
  Rooms: [
    "roomId",
    "roomTypeId",
    "roomName",
    "status",
    "active"
  ],
  Bookings: [
    "bookingId",
    "roomTypeId",
    "guestName",
    "email",
    "contact",
    "checkIn",
    "checkOut",
    "status",
    "createdAt"
  ],
  "Contact Messages": [
    "messageId",
    "name",
    "email",
    "contact",
    "subject",
    "message",
    "channel",
    "priority",
    "status",
    "createdAt"
  ]
};

function doGet(event) {
  const action = event && event.parameter && event.parameter.action;

  if (action === "getPublicRoomTypes") {
    return jsonResponse({
      success: true,
      roomTypes: getPublicRoomTypes()
    });
  }

  return jsonResponse({
    success: true,
    message: "Capeway Google Sheets backend is running.",
    actions: ["getPublicRoomTypes"]
  });
}

function doPost(event) {
  const payload = parsePayload(event);
  const action = payload.action || "";

  if (action === "saveContactMessage") {
    return jsonResponse(saveContactMessage(payload));
  }

  if (action === "bookRoom") {
    return jsonResponse(bookRoom(payload));
  }

  return jsonResponse({
    success: false,
    error: "Unknown action."
  });
}

function getPublicRoomTypes() {
  setupSheets();

  const roomTypes = readSheetObjects(SHEET_NAMES.roomTypes)
    .filter((roomType) => isActive(roomType.active));
  const rooms = readSheetObjects(SHEET_NAMES.rooms)
    .filter((room) => isActive(room.active));

  return roomTypes.map((roomType) => {
    const linkedRooms = rooms.filter((room) => room.roomTypeId === roomType.id);
    const availableRooms = linkedRooms.filter((room) => String(room.status || "").toLowerCase() === "available");
    const totalRooms = Number(roomType.totalRooms) || linkedRooms.length || 0;
    const nightlyRate = Number(roomType.nightlyRate) || 0;

    return {
      id: roomType.id,
      name: roomType.name,
      description: roomType.description,
      rate: nightlyRate,
      nightlyRate,
      weeklyRate: nightlyRate * 7 * 0.9,
      monthlyRate: nightlyRate * 30 * 0.8,
      totalRooms,
      availableRooms: availableRooms.length,
      imageUrl: roomType.imageUrl,
      amenities: String(roomType.amenities || "")
        .split(",")
        .map((amenity) => amenity.trim())
        .filter(Boolean)
    };
  });
}

function saveContactMessage(formData) {
  setupSheets();

  const id = formData.messageId || makeId("MSG");
  appendObject(SHEET_NAMES.contactMessages, {
    messageId: id,
    name: formData.name || formData.guestName || "",
    email: formData.email || "",
    contact: formData.contact || formData.mobile || "",
    subject: formData.subject || "",
    message: formData.message || "",
    channel: formData.channel || "Website",
    priority: formData.priority || "Normal",
    status: formData.status || "New",
    createdAt: new Date()
  });

  return {
    success: true,
    messageId: id
  };
}

function bookRoom(formData) {
  setupSheets();

  const id = formData.bookingId || makeId("BOOK");
  appendObject(SHEET_NAMES.bookings, {
    bookingId: id,
    roomTypeId: formData.roomTypeId || formData.roomType || "",
    guestName: formData.guestName || [formData.firstName, formData.lastName].filter(Boolean).join(" "),
    email: formData.email || "",
    contact: formData.contact || "",
    checkIn: formData.checkIn || "",
    checkOut: formData.checkOut || "",
    status: formData.status || "Pending",
    createdAt: new Date()
  });

  return {
    success: true,
    bookingId: id
  };
}

function setupSheets() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  Object.keys(SHEET_HEADERS).forEach((sheetName) => {
    const sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
    const headers = SHEET_HEADERS[sheetName];
    const currentHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    const needsHeaders = currentHeaders.join("") === "" || headers.some((header, index) => currentHeaders[index] !== header);

    if (needsHeaders) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
    }
  });
}

function readSheetObjects(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];

  const values = sheet.getDataRange().getValues();
  const headers = values.shift();

  return values.map((row) => headers.reduce((object, header, index) => {
    object[header] = row[index];
    return object;
  }, {}));
}

function appendObject(sheetName, object) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const headers = SHEET_HEADERS[sheetName];
  const row = headers.map((header) => object[header] !== undefined ? object[header] : "");
  sheet.appendRow(row);
}

function parsePayload(event) {
  if (!event || !event.postData || !event.postData.contents) return {};

  try {
    return JSON.parse(event.postData.contents);
  } catch (error) {
    return {};
  }
}

function isActive(value) {
  return value === true || String(value || "").toLowerCase() === "true" || String(value || "").toLowerCase() === "yes";
}

function makeId(prefix) {
  return `${prefix}-${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd-HHmmss")}-${Math.floor(Math.random() * 10000)}`;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
