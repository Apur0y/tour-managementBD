# Tour Management Complete API Documentation

This document provides comprehensive documentation for all APIs in the tour management system including booking, wishlist, payment processing, and tour management.

## Base URL
```
http://localhost:1000/api/v1
```

## Authentication
Most endpoints require JWT authentication via cookies (`accessToken`) or Authorization header.

---

## 1. BOOKING MANAGEMENT APIs

### 1.1 Create Booking
Create a new tour booking.

**Endpoint:** `POST /bookings`  
**Authentication:** Required  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "tourId": "string",
  "numberOfPeople": 2,
  "customerDetails": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "specialRequests": "Vegetarian meals please"
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Booking created successfully!",
  "data": {
    "_id": "booking_id",
    "user": { "name": "User Name", "email": "user@email.com" },
    "tour": { "title": "Tour Title", "location": "Location", "costFrom": 100 },
    "numberOfPeople": 2,
    "totalAmount": 200,
    "paymentStatus": "PENDING",
    "bookingStatus": "PENDING",
    "customerDetails": { ... },
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### 1.2 Get User Bookings
Retrieve all bookings for the authenticated user.

**Endpoint:** `GET /bookings/my-bookings`  
**Authentication:** Required

**Query Parameters:**
- `status` (optional): Filter by booking status (PENDING, CONFIRMED, CANCELLED, COMPLETED, REFUNDED)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Bookings retrieved successfully!",
  "data": {
    "bookings": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

### 1.3 Get Booking Details
Get details of a specific booking.

**Endpoint:** `GET /bookings/:id`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Booking retrieved successfully!",
  "data": {
    "_id": "booking_id",
    "tour": { ... },
    "user": { ... },
    "numberOfPeople": 2,
    "totalAmount": 200,
    "paymentStatus": "PAID",
    "bookingStatus": "CONFIRMED",
    "customerDetails": { ... },
    "stripePaymentIntentId": "pi_...",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### 1.4 Cancel Booking
Cancel a booking (with automatic refund if payment was made).

**Endpoint:** `PUT /bookings/:id/cancel`  
**Authentication:** Required

**Request Body:**
```json
{
  "reason": "Change of plans"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Booking cancelled successfully!",
  "data": {
    "bookingStatus": "CANCELLED",
    "cancellationReason": "Change of plans",
    ...
  }
}
```

---

## 2. PAYMENT APIs

### 2.1 Create Payment Intent
Create a Stripe payment intent for a booking.

**Endpoint:** `POST /payments/create-intent`  
**Authentication:** Required

**Request Body:**
```json
{
  "bookingId": "booking_id"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment intent created successfully!",
  "data": {
    "clientSecret": "pi_...client_secret",
    "paymentIntentId": "pi_...",
    "amount": 200,
    "currency": "usd"
  }
}
```

### 2.2 Confirm Payment
Confirm a payment after client-side processing.

**Endpoint:** `POST /payments/confirm`  
**Authentication:** Required

**Request Body:**
```json
{
  "paymentIntentId": "pi_..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment confirmed successfully!",
  "data": {
    "booking": { ... },
    "payment": { ... },
    "status": "SUCCEEDED"
  }
}
```

### 2.3 Stripe Webhook
Handle Stripe webhook events.

**Endpoint:** `POST /payments/webhook`  
**Authentication:** Not required (Stripe signature verification)  
**Content-Type:** `application/json`

---

## 3. WISHLIST APIs

### 3.1 Add to Wishlist
Add a tour to user's wishlist.

**Endpoint:** `POST /wishlist`  
**Authentication:** Required

**Request Body:**
```json
{
  "tourId": "tour_id"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Tour added to wishlist successfully!",
  "data": {
    "user": "user_id",
    "tours": [
      {
        "_id": "tour_id",
        "title": "Tour Title",
        "location": "Location",
        "costFrom": 100,
        "images": [...],
        ...
      }
    ]
  }
}
```

### 3.2 Remove from Wishlist
Remove a tour from user's wishlist.

**Endpoint:** `DELETE /wishlist/:tourId`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Tour removed from wishlist successfully!",
  "data": {
    "tours": [...] // Updated wishlist
  }
}
```

### 3.3 Get User Wishlist
Retrieve user's wishlist with pagination.

**Endpoint:** `GET /wishlist`  
**Authentication:** Required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Wishlist retrieved successfully!",
  "data": {
    "tours": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### 3.4 Check Tour in Wishlist
Check if a specific tour is in user's wishlist.

**Endpoint:** `GET /wishlist/check/:tourId`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Wishlist status retrieved successfully!",
  "data": {
    "inWishlist": true
  }
}
```

### 3.5 Clear Wishlist
Remove all tours from user's wishlist.

**Endpoint:** `DELETE /wishlist`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Wishlist cleared successfully!",
  "data": {
    "message": "Wishlist cleared successfully"
  }
}
```

### 3.6 Get Wishlist Stats
Get statistics about user's wishlist.

**Endpoint:** `GET /wishlist/stats`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Wishlist stats retrieved successfully!",
  "data": {
    "totalTours": 25,
    "activeTours": 22,
    "inactiveTours": 3
  }
}
```

---

## 4. POSTED TOURS MANAGEMENT APIs (For Tour Guides/Owners)

### 4.1 Create Tour
Create a new tour (Guide/Admin only).

**Endpoint:** `POST /posted-tours`  
**Authentication:** Required (Guide/Admin role)  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "slug": "amazing-paris-tour",
  "title": "Amazing Paris Tour",
  "description": "Discover the beauty of Paris with our expert guides...",
  "images": ["url1", "url2"],
  "location": "Paris, France",
  "costFrom": 150,
  "startDate": "2024-06-01T09:00:00.000Z",
  "endDate": "2024-06-01T18:00:00.000Z",
  "tourType": "tour_type_id",
  "included": ["Meals", "Transport"],
  "excluded": ["Flights"],
  "amenities": ["WiFi", "Air Conditioning"],
  "tourPlan": ["Visit Eiffel Tower", "Louvre Museum"],
  "tourTags": ["culture", "history"],
  "duartion": "8 hours",
  "maxPeople": "20",
  "category": ["Cultural", "Historical"]
}
```

### 4.2 Get My Tours
Retrieve all tours created by the authenticated guide.

**Endpoint:** `GET /posted-tours`  
**Authentication:** Required (Guide/Admin role)

**Query Parameters:**
- `isActive` (optional): Filter by active status (true/false)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

### 4.3 Get Tour Details
Get detailed information about a specific tour with booking statistics.

**Endpoint:** `GET /posted-tours/:tourId`  
**Authentication:** Required (Guide/Admin role)

### 4.4 Update Tour
Update tour information.

**Endpoint:** `PUT /posted-tours/:tourId`  
**Authentication:** Required (Guide/Admin role)

### 4.5 Delete Tour
Delete a tour (only if no confirmed bookings exist).

**Endpoint:** `DELETE /posted-tours/:tourId`  
**Authentication:** Required (Guide/Admin role)

### 4.6 Toggle Tour Status
Activate or deactivate a tour.

**Endpoint:** `PUT /posted-tours/:tourId/toggle-status`  
**Authentication:** Required (Guide/Admin role)

### 4.7 Get Dashboard Statistics
Get comprehensive statistics for the guide's tours and bookings.

**Endpoint:** `GET /posted-tours/dashboard/stats`  
**Authentication:** Required (Guide/Admin role)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Dashboard stats retrieved successfully!",
  "data": {
    "tourStats": {
      "total": 10,
      "active": 8,
      "inactive": 2
    },
    "bookingStats": {
      "total": 150,
      "pending": 5,
      "confirmed": 120,
      "completed": 20,
      "cancelled": 5
    },
    "revenue": {
      "total": 25000,
      "currency": "USD"
    },
    "recentBookings": [...]
  }
}
```

### 4.8 Get Tour Bookings
Get all bookings for a specific tour.

**Endpoint:** `GET /posted-tours/:tourId/bookings`  
**Authentication:** Required (Guide/Admin role)

**Query Parameters:**
- `status` (optional): Filter by booking status
- `page` (optional): Page number
- `limit` (optional): Items per page

### 4.9 Update Booking Status
Update the status of a specific booking.

**Endpoint:** `PUT /bookings/:bookingId/status`  
**Authentication:** Required (Guide/Admin role)

**Request Body:**
```json
{
  "status": "CONFIRMED"
}
```

---

## 5. PROFILE MANAGEMENT APIs

### 5.1 Update Profile
Update user profile with optional image upload.

**Endpoint:** `PUT /profile`  
**Authentication:** Required  
**Content-Type:** `multipart/form-data`

**Form Data:**
- `name` (optional): User's full name
- `phone` (optional): Phone number
- `address` (optional): Address
- `picture` (optional): Profile picture file (max 5MB, images only)

### 5.2 Change Password
Change user password.

**Endpoint:** `PUT /change-password`  
**Authentication:** Required  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456",
  "confirmPassword": "newPassword456"
}
```

---

## 6. ERROR RESPONSES

### Common Error Codes
- **400 Bad Request**: Invalid request data or business logic error
- **401 Unauthorized**: Authentication required or invalid credentials
- **403 Forbidden**: Access denied for the requested resource
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists
- **422 Unprocessable Entity**: Validation errors
- **500 Internal Server Error**: Server error

### Error Response Format
```json
{
  "success": false,
  "message": "Error message",
  "errorDetails": {
    "issues": [
      {
        "path": ["field_name"],
        "message": "Field-specific error message"
      }
    ]
  }
}
```

---

## 7. STRIPE INTEGRATION

### Environment Variables Required
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Supported Payment Methods
- Credit/Debit Cards
- Apple Pay
- Google Pay
- PayPal (if configured)

### Webhook Events Handled
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

### Test Card Numbers
```
4242424242424242 - Successful payment
4000000000000002 - Declined payment
4000000000009995 - Insufficient funds
```

---

## 8. RATE LIMITING & SECURITY

### Rate Limits
- Authentication endpoints: 5 requests per minute
- General API endpoints: 100 requests per minute
- Payment endpoints: 10 requests per minute

### Security Features
- JWT Authentication with httpOnly cookies
- Request validation with Zod schemas
- File upload restrictions (type, size)
- SQL injection protection via Mongoose
- CORS configuration for production
- Stripe webhook signature verification

---

## 9. PAGINATION

All list endpoints support pagination with the following query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Pagination response format:
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

---

## 10. FILE UPLOADS

### Profile Pictures
- **Endpoint:** `/profile` (multipart/form-data)
- **Field name:** `picture`
- **Max size:** 5MB
- **Allowed types:** JPEG, PNG, GIF, WebP, BMP
- **Storage:** Local filesystem (`uploads/profiles/`)
- **Access:** `GET /uploads/profiles/filename.ext`

### File Naming
Files are automatically renamed using the pattern:
`profile-{timestamp}-{random}.{original_extension}`

---

This documentation covers all the major APIs in the tour management system. For additional details or troubleshooting, refer to the individual service files or contact the development team.
