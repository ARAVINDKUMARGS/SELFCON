# SELFCON REST API DOCUMENTATION
> **Base URL:** `http://localhost:5000/api` (Development) / `https://<your-render-domain>/api` (Production)

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register`
Register a new user account across any role (`guest`, `tenant`, `buyer`, `owner`, `seller`).
- **Access:** Public
- **Body:**
```json
{
  "name": "Sarah Jenkins",
  "email": "sarah@example.com",
  "password": "password123",
  "role": "tenant",
  "phone": "+1 555-0199",
  "bio": "Software engineer seeking quiet rentals."
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5...",
  "user": {
    "id": "67ce19b4...",
    "name": "Sarah Jenkins",
    "email": "sarah@example.com",
    "role": "tenant",
    "verified": true
  }
}
```

### `POST /api/auth/login`
Authenticate user with email and password.
- **Access:** Public
- **Body:** `{ "email": "admin@selfcon.com", "password": "password123" }`
- **Response (200 OK):** Returns JWT token and sanitized user profile.

### `GET /api/auth/me`
Retrieve currently logged-in user profile with saved properties and recent searches.
- **Access:** Private (`Authorization: Bearer <token>`)

### `PUT /api/auth/switch-role`
Dynamically switch active platform role for rapid testing.
- **Access:** Private
- **Body:** `{ "role": "owner" }`

---

## 2. Property Endpoints (`/api/properties`)

### `GET /api/properties`
Search and filter marketplace properties.
- **Access:** Public
- **Query Parameters:**
  - `mode`: `stay` | `rent` | `buy`
  - `city` / `location`: String (e.g. `Mumbai`, `Goa`)
  - `propertyType`: `apartment` | `villa` | `studio` | `penthouse` | `house` | `townhouse`
  - `minPrice`: Number
  - `maxPrice`: Number
  - `bedrooms`: Number
  - `bathrooms`: Number
  - `amenities`: Comma-separated list (e.g. `High-Speed WiFi,Gym / Fitness Center`)
  - `sort`: `newest` | `price-asc` | `price-desc` | `rating`
  - `page`: Number (default `1`)
  - `limit`: Number (default `20`)

### `GET /api/properties/:id`
Retrieve single property details with owner profile and increment view counter.
- **Access:** Public

### `POST /api/properties`
Publish a new property listing with multi-mode pricing and photos.
- **Access:** Private (Roles: `owner`, `seller`, `admin`)
- **Body:**
```json
{
  "title": "Azure Horizon Oceanfront Villa",
  "description": "Cliffside infinity pool villa with 500Mbps fiber internet.",
  "listingModes": ["stay", "rent", "buy"],
  "propertyType": "villa",
  "location": {
    "address": "14 Cliffside Road",
    "city": "Goa",
    "state": "Goa",
    "country": "India",
    "coordinates": { "lat": 15.5798, "lng": 73.7423 }
  },
  "specs": {
    "bedrooms": 3,
    "bathrooms": 4,
    "squareFeet": 3800,
    "maxGuests": 6,
    "furnishing": "furnished"
  },
  "pricing": {
    "nightly": 320,
    "monthly": 6200,
    "salePrice": 1450000,
    "cleaningFee": 60,
    "securityDeposit": 300
  },
  "amenities": ["High-Speed WiFi", "Swimming Pool", "Gym / Fitness Center"]
}
```

### `POST /api/properties/:id/block-dates`
Block owner dates on property calendar to prevent double-booking.
- **Access:** Private (Owner or Admin)
- **Body:** `{ "startDate": "2026-12-01", "endDate": "2026-12-10", "reason": "Owner Vacation" }`

---

## 3. SelfCon AI Discovery Endpoints (`/api/ai`)

### `POST /api/ai/discover`
Signature conversational natural-language property discovery powered by Claude 3.5 Sonnet.
- **Access:** Public (Optional Auth to record recent search history)
- **Body:**
```json
{
  "prompt": "I need a quiet 2-bedroom apartment for three months with high-speed internet and a gym nearby, under $2,000 per month."
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userPrompt": "I need a quiet 2-bedroom apartment for three months with high-speed internet and a gym nearby, under $2,000 per month.",
    "parsedParameters": {
      "mode": "rent",
      "maxPrice": 2000,
      "bedrooms": 2,
      "durationMonths": 3,
      "propertyType": "apartment",
      "requiredAmenities": ["High-Speed WiFi", "Gym / Fitness Center"],
      "lifestylePreferences": ["Quiet & Peaceful"]
    },
    "isAlternative": false,
    "summary": "I found 1 verified listings in our database matching your criteria. Here are the top recommendations ranked for your stay:",
    "properties": [
      {
        "_id": "67ce19b4...",
        "title": "The Green Oasis Tech Executive Suite",
        "pricing": { "monthly": 1400, "nightly": 95 },
        "aiMatch": {
          "score": 94,
          "reason": "2 bedrooms match your requirement. Equipped with High-Speed WiFi, Gym / Fitness Center. Monthly rent of $1400 fits your $2000/mo limit.",
          "isAlternative": false
        }
      }
    ],
    "clarifyingQuestions": [
      "Would you prefer a specific move-in or check-in date?",
      "Do you require parking or specific building amenities like an elevator?"
    ]
  }
}
```

---

## 4. Booking Endpoints (`/api/bookings`)

### `POST /api/bookings`
Initiate booking request with server-side overlap validation and dynamic price calculation.
- **Access:** Private
- **Body:**
```json
{
  "propertyId": "67ce19b4...",
  "checkInDate": "2026-12-15",
  "checkOutDate": "2026-12-20",
  "bookingMode": "stay",
  "guests": { "adults": 2, "children": 0, "pets": 0 },
  "provider": "test"
}
```

### `POST /api/bookings/:id/confirm-payment`
Confirm payment signature and permanently lock calendar slots.
- **Access:** Private
- **Body:**
```json
{
  "orderId": "sim_ord_1001",
  "paymentId": "sim_pay_1001",
  "signature": "sim_sig_verified"
}
```

### `POST /api/bookings/:id/cancel`
Cancel booking, release blocked dates back to the calendar, and calculate refunds.
- **Access:** Private

---

## 5. Buying & Purchase Offer Endpoints (`/api/offers`)

### `POST /api/offers`
Submit a formal binding purchase offer on a property for sale.
- **Access:** Private
- **Body:**
```json
{
  "propertyId": "67ce19b4...",
  "offerAmount": 1400000,
  "financingType": "cash",
  "preApproved": true,
  "message": "All-cash offer with flexible 30-day closing."
}
```

### `PUT /api/offers/:id/respond`
Seller response: Accept, Reject, or Counter-Offer.
- **Access:** Private (Seller or Admin)
- **Body:**
```json
{
  "action": "counter",
  "counterAmount": 1425000,
  "counterTerms": "Countered with 21-day inspection contingency."
}
```

### `POST /api/offers/schedule-visit`
Schedule an in-person property walkthrough tour with the owner.
- **Access:** Private
- **Body:**
```json
{
  "propertyId": "67ce19b4...",
  "requestedDate": "2026-12-10",
  "timeSlot": "11:00 AM - 12:00 PM",
  "notes": "Interested in reviewing architectural finishes."
}
```

---

## 6. Webhooks (`/api/webhooks`)

### `POST /api/webhooks/razorpay`
Cryptographically verified webhook handler for Razorpay (`x-razorpay-signature` verification with HMAC-SHA256).

### `POST /api/webhooks/stripe`
Stripe event handler for `payment_intent.succeeded` asynchronous order confirmation.

