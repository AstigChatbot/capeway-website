# Capeway Google Sheets Backend

This folder mirrors the Apps Script backend shape used by the rooms and calculator UI.

## Google Sheets Tabs

Create or let `setupSheets()` create these tabs:

- `Room Types`: `id`, `name`, `description`, `nightlyRate`, `totalRooms`, `imageUrl`, `amenities`, `active`
- `Rooms`: `roomId`, `roomTypeId`, `roomName`, `status`, `active`
- `Bookings`: `bookingId`, `roomTypeId`, `guestName`, `email`, `contact`, `checkIn`, `checkOut`, `status`, `createdAt`
- `Contact Messages`: `messageId`, `name`, `email`, `contact`, `subject`, `message`, `channel`, `priority`, `status`, `createdAt`

## Public Endpoint

Deploy the Apps Script as a web app and call:

```text
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?action=getPublicRoomTypes
```

The response returns `roomTypes` with nightly, weekly, monthly, total-room, and available-room fields for the website cards and price calculator.

## Posts

Send JSON POST bodies with an `action` field:

```json
{ "action": "saveContactMessage", "name": "Guest", "email": "guest@example.com", "message": "Hello" }
```

```json
{ "action": "bookRoom", "roomTypeId": "standard", "guestName": "Guest", "checkIn": "2026-06-01", "checkOut": "2026-06-02" }
```
