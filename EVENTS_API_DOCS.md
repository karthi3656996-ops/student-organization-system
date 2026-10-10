# Events and Ticketing API Integration Guide

This guide covers the backend API endpoints implemented in `feature/jasmitha-events-ticketing`.

## Event Management APIs

### 1. List Events
- **Method:** `GET`
- **Path:** `/api/events`
- **Query Parameters:** `?status=PUBLISHED` (optional enum: DRAFT, PUBLISHED, COMPLETED, CANCELLED)
- **Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "title": "Spring Gala",
    "slug": "spring-gala",
    "status": "PUBLISHED",
    "ticketTiers": [
      { "id": "tier-1", "tierName": "General", "price": 0, "capacityLimit": 50 }
    ]
  }
]
```

### 2. Create Event
- **Method:** `POST`
- **Path:** `/api/events`
- **Body:**
```json
{
  "title": "Spring Gala",
  "slug": "spring-gala",
  "description": "Annual spring event",
  "venue": "Main Hall",
  "startTime": "2026-03-20T19:00:00Z",
  "endTime": "2026-03-20T23:00:00Z",
  "totalCapacity": 100,
  "status": "PUBLISHED",
  "ticketTiers": [
    { "tierName": "General", "price": 25, "isMemberOnly": false, "capacityLimit": 100 }
  ]
}
```
- **Error (400):** If end time is before start time, or sum of tier capacities > total capacity.

### 3. Get Single Event
- **Method:** `GET`
- **Path:** `/api/events/[slug]`
- **Response (200 OK):** Detailed event object with `ticketTiers`.
- **Error (404):** Event not found.

### 4. Update Event
- **Method:** `PATCH`
- **Path:** `/api/events/[slug]`
- **Body:** Partial event fields (e.g. `{"status": "CANCELLED"}`).
- **Response (200 OK):** Updated event object.

### 5. Delete Event
- **Method:** `DELETE`
- **Path:** `/api/events/[slug]`
- **Response (200 OK):** `{"message": "Event deleted successfully"}`
- **Error (409 Conflict):** If the event has existing ticket bookings, it cannot be deleted to preserve financial records. Use `PATCH` to change status to `CANCELLED` instead.

---

## Ticket Booking APIs

### 6. Book Tickets
- **Method:** `POST`
- **Path:** `/api/events/[slug]/book`
- **Body (Guest Checkout):**
```json
{
  "guestName": "John Doe",
  "guestEmail": "john@example.com",
  "tickets": [
    { "tierId": "tier-1-uuid", "attendeeName": "John Doe" }
  ]
}
```
- **Body (Member Checkout):** Replace guest details with `"userId": "uuid-here"`.
- **Response (201 Created):**
```json
{
  "id": "booking-uuid",
  "bookingReference": "BK-12345-ABCD",
  "totalAmount": 25,
  "paymentStatus": "PAID",
  "tickets": [
    { "id": "tck-uuid", "ticketCode": "TCK-xxx", "attendeeName": "John Doe" }
  ]
}
```
- **Error (409 Conflict):** If event or tier capacity is exceeded.
- **Error (401/403):** If a non-member attempts to book an `isMemberOnly` tier.

### 7. Retrieve Booking Receipt
- **Method:** `GET`
- **Path:** `/api/bookings/[reference]`
- **Response (200 OK):** Booking receipt including event details and ticket QR codes.

### 8. Check-In Ticket (QR Scanner)
- **Method:** `POST`
- **Path:** `/api/tickets/check-in`
- **Body:** `{"ticketCode": "TCK-xxx"}`
- **Response (200 OK):** `{"message": "Check-in successful", "attendeeName": "John Doe", "event": "Spring Gala"}`
- **Error (409 Conflict):** If the ticket has already been checked in.

---

## Integration Notes for Frontend
1. **Fetching Data:** Use standard `fetch('/api/events', { method: 'GET' })` on the client or within React Server Components. Since Next.js App Router API routes act as the backend on the same domain, **CORS configuration is NOT necessary**. 
2. **Event Creation/Editing:** Render forms that collect start/end dates and an array of ticket tiers. Do not allow users to set capacities on tiers that exceed the total event capacity.
3. **Displaying Available Tickets:** Hit `/api/events/[slug]` and map over the `ticketTiers` array to display pricing and member restrictions.
4. **Booking Form Flow:** Collect attendee names for each requested ticket. The frontend should **not** send the `totalAmount` in the POST request; the backend calculates the true price securely using DB records to prevent client-side tampering.
5. **Authentication:** The project does not currently have NextAuth implemented. The booking API is built to accept `userId` explicitly in the JSON payload until the authentication wrapper is completed by the team.
