# Booking Management Contracts

**API Group**: Booking Management  
**Base Path**: `/api/bookings`  
**Version**: 1.0

---

## Booking Creation and Management

### Create Booking Request
```http
POST /api/bookings
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "petSitterId": "sitter-001",
  "serviceId": "service-123",
  "startDateTime": "2025-11-15T10:00:00Z",
  "endDateTime": "2025-11-15T11:00:00Z",
  "petIds": ["pet-001", "pet-002"],
  "specialInstructions": "Buddy needs to be walked on the left side due to a leg injury. Treats are in the kitchen counter.",
  "emergencyContact": {
    "name": "John Doe",
    "phone": "555-0199",
    "relationship": "owner"
  },
  "locationDetails": {
    "pickupAddress": "123 Main St, Seattle, WA 98101",
    "accessInstructions": "Key is under the blue flower pot. Please text when you arrive.",
    "parkingInstructions": "Street parking available, 2-hour limit"
  }
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "booking-12345",
      "status": "pending",
      "petOwner": {
        "id": "user-001",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phoneNumber": "555-0101"
      },
      "petSitter": {
        "id": "sitter-001",
        "user": {
          "firstName": "Sarah",
          "lastName": "Johnson",
          "profileImageUrl": "https://octopets.blob.core.windows.net/avatars/sitter-001.jpg"
        },
        "averageRating": 4.8,
        "isVerified": true
      },
      "service": {
        "id": "service-123",
        "title": "Daily Dog Walking",
        "serviceType": "dog-walking",
        "basePrice": 25.00,
        "durationMinutes": 30
      },
      "pets": [
        {
          "id": "pet-001",
          "name": "Buddy",
          "petType": {
            "id": "dog",
            "name": "Dog"
          },
          "breed": "Golden Retriever",
          "ageMonths": 36,
          "specialNeeds": "Leg injury - walk slowly"
        }
      ],
      "startDateTime": "2025-11-15T10:00:00Z",
      "endDateTime": "2025-11-15T11:00:00Z",
      "totalCost": 30.00,
      "costBreakdown": {
        "baseServiceCost": 25.00,
        "additionalPetCost": 5.00,
        "platformFee": 0,
        "tax": 0,
        "total": 30.00
      },
      "specialInstructions": "Buddy needs to be walked on the left side due to a leg injury...",
      "locationDetails": {
        "pickupAddress": "123 Main St, Seattle, WA 98101",
        "accessInstructions": "Key is under the blue flower pot...",
        "approximateAddress": "123 Main St, Seattle, WA"
      },
      "createdAt": "2025-11-12T10:30:00Z",
      "expiresAt": "2025-11-13T10:30:00Z",
      "estimatedResponse": "Usually responds within 2 hours"
    }
  }
}
```

**Validation Rules**:
- `petSitterId`: Must be valid and active sitter
- `serviceId`: Must belong to the specified sitter
- `startDateTime`: Must be in future, at least 2 hours from now
- `endDateTime`: Must be after startDateTime
- `petIds`: Must belong to requesting user, at least one pet
- `specialInstructions`: Optional, max 1000 characters

**Business Rules**:
- Booking auto-expires after 24 hours if not accepted
- Sitter cannot book for themselves
- Pets must be compatible with selected service
- Time slot must be available per sitter's schedule

---

### Get Booking Details
```http
GET /api/bookings/{bookingId}
Authorization: Bearer <access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "booking-12345",
      "status": "confirmed",
      "petOwner": {
        "id": "user-001",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phoneNumber": "555-0101",
        "profileImageUrl": "https://octopets.blob.core.windows.net/avatars/user-001.jpg"
      },
      "petSitter": {
        "id": "sitter-001",
        "user": {
          "firstName": "Sarah", 
          "lastName": "Johnson",
          "phoneNumber": "555-0102",
          "profileImageUrl": "https://octopets.blob.core.windows.net/avatars/sitter-001.jpg"
        },
        "location": {
          "address": "456 Oak St, Seattle, WA 98102",
          "coordinates": {
            "latitude": 47.6205,
            "longitude": -122.3047
          }
        },
        "emergencyContact": {
          "phone": "555-0911",
          "available24h": true
        }
      },
      "service": {
        "id": "service-123",
        "title": "Daily Dog Walking",
        "serviceType": "dog-walking",
        "description": "30-60 minute walks with exercise and playtime"
      },
      "pets": [
        {
          "id": "pet-001",
          "name": "Buddy",
          "petType": {
            "id": "dog", 
            "name": "Dog"
          },
          "breed": "Golden Retriever",
          "ageMonths": 36,
          "weightPounds": 75,
          "specialNeeds": "Leg injury - walk slowly",
          "medicalConditions": "Arthritis in left hip",
          "behaviorNotes": "Friendly with other dogs, afraid of loud noises"
        }
      ],
      "startDateTime": "2025-11-15T10:00:00Z",
      "endDateTime": "2025-11-15T11:00:00Z",
      "totalCost": 30.00,
      "specialInstructions": "Buddy needs to be walked on the left side...",
      "locationDetails": {
        "pickupAddress": "123 Main St, Seattle, WA 98101",
        "accessInstructions": "Key is under the blue flower pot...",
        "parkingInstructions": "Street parking available, 2-hour limit",
        "vetInfo": {
          "name": "Seattle Pet Clinic",
          "phone": "555-0123",
          "address": "789 Pine St, Seattle, WA"
        }
      },
      "timeline": {
        "createdAt": "2025-11-12T10:30:00Z",
        "acceptedAt": "2025-11-12T11:15:00Z", 
        "confirmedAt": "2025-11-12T11:30:00Z",
        "scheduledStartAt": "2025-11-15T10:00:00Z"
      },
      "statusHistory": [
        {
          "status": "pending",
          "timestamp": "2025-11-12T10:30:00Z",
          "note": "Booking request submitted"
        },
        {
          "status": "accepted",
          "timestamp": "2025-11-12T11:15:00Z",
          "note": "Sitter accepted the request"
        },
        {
          "status": "confirmed", 
          "timestamp": "2025-11-12T11:30:00Z",
          "note": "Pet owner confirmed the booking"
        }
      ],
      "cancellationPolicy": {
        "type": "moderate",
        "description": "Free cancellation up to 24 hours before start time",
        "fees": [
          {
            "timeframe": "24+ hours before",
            "fee": 0,
            "percentage": 0
          },
          {
            "timeframe": "Less than 24 hours",
            "fee": 0,
            "percentage": 50
          }
        ]
      }
    }
  }
}
```

---

### Update Booking Status (Sitter)
```http
PUT /api/bookings/{bookingId}/status
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "accepted",
  "message": "I'm excited to walk Buddy! I have experience with dogs recovering from injuries and will take extra care.",
  "proposedChanges": {
    "startDateTime": "2025-11-15T09:30:00Z",
    "message": "Would 9:30 AM work better for you? I can provide a longer walk if we start earlier."
  }
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "booking-12345",
      "status": "accepted",
      "acceptedAt": "2025-11-12T11:15:00Z",
      "sitterMessage": "I'm excited to walk Buddy! I have experience with dogs recovering from injuries...",
      "proposedChanges": {
        "startDateTime": "2025-11-15T09:30:00Z",
        "message": "Would 9:30 AM work better for you?",
        "requiresApproval": true
      }
    },
    "nextSteps": [
      "Pet owner will be notified of acceptance",
      "Proposed time change requires owner approval",
      "Payment will be processed upon confirmation"
    ]
  }
}
```

**Valid Status Transitions**:
- `pending` → `accepted`, `declined`, `cancelled`
- `accepted` → `confirmed`, `cancelled`
- `confirmed` → `in-progress`, `cancelled`
- `in-progress` → `completed`

---

### Confirm Booking (Owner)
```http
POST /api/bookings/{bookingId}/confirm
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "acceptProposedChanges": true,
  "paymentMethodId": "pm_1234567890",
  "finalInstructions": "Thank you for accepting! Looking forward to the earlier start time."
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "booking-12345",
      "status": "confirmed",
      "startDateTime": "2025-11-15T09:30:00Z",
      "confirmedAt": "2025-11-12T11:30:00Z",
      "paymentStatus": "authorized",
      "paymentId": "pi_1234567890"
    },
    "confirmationDetails": {
      "confirmationNumber": "OCT-2025-11-12345",
      "sitterContactInfo": {
        "phone": "555-0102",
        "emergencyPhone": "555-0911"
      },
      "reminderScheduled": "2025-11-15T08:30:00Z"
    }
  }
}
```

---

### Start Booking Service
```http
POST /api/bookings/{bookingId}/start
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "arrivalTime": "2025-11-15T09:30:00Z",
  "notes": "Arrived on time. Buddy seems excited for his walk!",
  "photos": [
    {
      "url": "https://octopets.blob.core.windows.net/booking-photos/start-123.jpg",
      "description": "Buddy ready for his walk",
      "timestamp": "2025-11-15T09:30:00Z"
    }
  ]
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "booking-12345",
      "status": "in-progress",
      "startedAt": "2025-11-15T09:30:00Z",
      "actualStartTime": "2025-11-15T09:30:00Z",
      "sitterLocation": {
        "latitude": 47.6062,
        "longitude": -122.3321,
        "accuracy": 5
      }
    },
    "liveTracking": {
      "enabled": true,
      "trackingUrl": "https://octopets.com/track/booking-12345",
      "estimatedDuration": 30
    }
  }
}
```

---

### Complete Booking Service
```http
POST /api/bookings/{bookingId}/complete
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "completionTime": "2025-11-15T10:15:00Z",
  "summary": "Great walk with Buddy! We went around the neighborhood park twice. He seemed comfortable and happy. No issues with his leg.",
  "photos": [
    {
      "url": "https://octopets.blob.core.windows.net/booking-photos/end-123.jpg", 
      "description": "Buddy after his walk - tired and happy!",
      "timestamp": "2025-11-15T10:15:00Z"
    }
  ],
  "reportCard": {
    "behaviorRating": "excellent",
    "energyLevel": "high-energy",
    "pottyBreaks": 2,
    "waterIntake": "normal",
    "notableEvents": [
      "Met another golden retriever at the park - played nicely",
      "Avoided running due to leg injury as requested"
    ]
  }
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "booking-12345",
      "status": "completed",
      "completedAt": "2025-11-15T10:15:00Z",
      "actualDuration": 45,
      "serviceSummary": "Great walk with Buddy! We went around the neighborhood park twice..."
    },
    "payment": {
      "status": "captured",
      "amount": 30.00,
      "paidAt": "2025-11-15T10:15:00Z",
      "receiptUrl": "https://octopets.com/receipts/booking-12345"
    },
    "nextSteps": [
      "Review request sent to pet owner",
      "Payment has been processed",
      "Service report available in app"
    ]
  }
}
```

---

### Cancel Booking
```http
POST /api/bookings/{bookingId}/cancel
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "reason": "pet-emergency",
  "explanation": "Buddy injured his leg further and needs to rest. We'll reschedule once he's better.",
  "proposedReschedule": {
    "enabled": true,
    "preferredDates": ["2025-11-22", "2025-11-23"]
  }
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "booking-12345",
      "status": "cancelled",
      "cancelledAt": "2025-11-14T08:00:00Z",
      "cancelledBy": "owner",
      "cancellationReason": "pet-emergency",
      "explanation": "Buddy injured his leg further..."
    },
    "refund": {
      "eligible": true,
      "amount": 30.00,
      "processingTime": "3-5 business days",
      "reason": "Cancellation within policy terms"
    },
    "reschedule": {
      "offerCreated": true,
      "offerExpires": "2025-11-21T08:00:00Z",
      "preferredDates": ["2025-11-22", "2025-11-23"]
    }
  }
}
```

**Cancellation Reasons**:
- `schedule-conflict`: Schedule conflict
- `pet-emergency`: Pet emergency/health issue
- `weather`: Weather conditions
- `sitter-unavailable`: Sitter became unavailable
- `found-alternative`: Found alternative arrangement
- `other`: Other reason (requires explanation)

---

## Booking Lists and Queries

### Get My Bookings (Owner)
```http
GET /api/bookings/me/owner?status=active&startDate=2025-11-01&endDate=2025-11-30&page=1&pageSize=20
Authorization: Bearer <access_token>
```

**Query Parameters**:
- `status`: `active` (pending/confirmed/in-progress), `completed`, `cancelled`, `all`
- `startDate`: Filter by service start date
- `endDate`: Filter by service end date
- `petId`: Filter by specific pet
- `sitterId`: Filter by specific sitter

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "booking-12345",
        "status": "confirmed",
        "petSitter": {
          "user": {
            "firstName": "Sarah",
            "lastName": "Johnson",
            "profileImageUrl": "https://octopets.blob.core.windows.net/avatars/sitter-001.jpg"
          },
          "averageRating": 4.8,
          "isVerified": true
        },
        "service": {
          "title": "Daily Dog Walking",
          "serviceType": "dog-walking"
        },
        "pets": [
          {
            "name": "Buddy",
            "petType": { "name": "Dog" }
          }
        ],
        "startDateTime": "2025-11-15T09:30:00Z",
        "endDateTime": "2025-11-15T10:30:00Z",
        "totalCost": 30.00,
        "canCancel": true,
        "canModify": false,
        "canReview": false,
        "timeUntilStart": "2 days, 23 hours"
      }
    ],
    "summary": {
      "totalBookings": 15,
      "upcomingBookings": 3,
      "completedBookings": 10,
      "cancelledBookings": 2,
      "totalSpent": 450.00
    },
    "pagination": {
      "totalCount": 15,
      "pageNumber": 1,
      "pageSize": 20,
      "totalPages": 1,
      "hasNextPage": false
    }
  }
}
```

---

### Get My Bookings (Sitter)
```http
GET /api/bookings/me/sitter?status=pending&date=2025-11-15
Authorization: Bearer <access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "booking-12345",
        "status": "pending",
        "petOwner": {
          "firstName": "John",
          "lastName": "Doe",
          "profileImageUrl": "https://octopets.blob.core.windows.net/avatars/user-001.jpg",
          "rating": 4.9,
          "totalBookings": 25
        },
        "service": {
          "title": "Daily Dog Walking",
          "serviceType": "dog-walking"
        },
        "pets": [
          {
            "name": "Buddy",
            "breed": "Golden Retriever",
            "ageMonths": 36,
            "specialNeeds": "Leg injury - walk slowly"
          }
        ],
        "startDateTime": "2025-11-15T10:00:00Z",
        "endDateTime": "2025-11-15T11:00:00Z",
        "totalCost": 30.00,
        "distance": 1.2,
        "requestedAt": "2025-11-12T10:30:00Z",
        "expiresAt": "2025-11-13T10:30:00Z",
        "canAccept": true,
        "canDecline": true,
        "hasConflict": false
      }
    ],
    "summary": {
      "pendingRequests": 3,
      "todaysBookings": 5,
      "weeklyEarnings": 350.00,
      "averageRating": 4.8
    }
  }
}
```

---

### Get Booking Calendar
```http
GET /api/bookings/calendar?month=2025-11&view=sitter
Authorization: Bearer <access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "calendar": {
      "month": "2025-11",
      "year": 2025,
      "days": [
        {
          "date": "2025-11-15",
          "dayOfWeek": "Friday",
          "bookings": [
            {
              "id": "booking-12345",
              "startTime": "09:30",
              "endTime": "10:30",
              "status": "confirmed",
              "service": "Dog Walking",
              "petOwner": "John D.",
              "earnings": 30.00,
              "color": "#4CAF50"
            }
          ],
          "availability": [
            {
              "startTime": "08:00",
              "endTime": "09:30",
              "available": true
            },
            {
              "startTime": "10:30", 
              "endTime": "18:00",
              "available": true
            }
          ],
          "totalEarnings": 85.00,
          "totalHours": 3.5
        }
      ]
    },
    "summary": {
      "monthlyEarnings": 1250.00,
      "totalBookings": 45,
      "averagePerDay": 41.67,
      "busyDays": ["2025-11-16", "2025-11-23"]
    }
  }
}
```

---

## Booking Modifications

### Request Booking Modification
```http
POST /api/bookings/{bookingId}/modify
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "requestType": "reschedule",
  "proposedChanges": {
    "startDateTime": "2025-11-16T10:00:00Z",
    "endDateTime": "2025-11-16T11:00:00Z"
  },
  "reason": "schedule-conflict",
  "message": "Could we move this to Saturday at the same time? Something came up at work."
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "modificationRequest": {
      "id": "mod-123",
      "bookingId": "booking-12345",
      "requestType": "reschedule",
      "status": "pending",
      "requestedBy": "owner",
      "proposedChanges": {
        "startDateTime": "2025-11-16T10:00:00Z",
        "endDateTime": "2025-11-16T11:00:00Z"
      },
      "reason": "schedule-conflict",
      "message": "Could we move this to Saturday at the same time?",
      "createdAt": "2025-11-14T09:00:00Z",
      "expiresAt": "2025-11-15T09:00:00Z"
    }
  }
}
```

---

### Respond to Modification Request
```http
PUT /api/bookings/{bookingId}/modify/{modificationId}/respond
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "response": "approved",
  "message": "Saturday works great! See you then.",
  "counterProposal": null
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "booking-12345",
      "startDateTime": "2025-11-16T10:00:00Z",
      "endDateTime": "2025-11-16T11:00:00Z",
      "modifiedAt": "2025-11-14T09:15:00Z"
    },
    "modificationRequest": {
      "id": "mod-123",
      "status": "approved",
      "respondedAt": "2025-11-14T09:15:00Z"
    }
  }
}
```

---

## Recurring Bookings

### Create Recurring Booking
```http
POST /api/bookings/recurring
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "petSitterId": "sitter-001",
  "serviceId": "service-123",
  "pets": ["pet-001"],
  "recurringPattern": {
    "frequency": "weekly",
    "daysOfWeek": [1, 3, 5],
    "startTime": "10:00",
    "endTime": "11:00",
    "startDate": "2025-11-15",
    "endDate": "2025-12-31"
  },
  "specialInstructions": "Same routine each time",
  "discountCode": "RECURRING15"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "recurringBooking": {
      "id": "recurring-123",
      "status": "pending-approval",
      "petSitter": {
        "user": {
          "firstName": "Sarah",
          "lastName": "Johnson"
        }
      },
      "totalBookings": 24,
      "totalCost": 600.00,
      "discountApplied": 90.00,
      "finalCost": 510.00,
      "bookingDates": [
        "2025-11-15T10:00:00Z",
        "2025-11-17T10:00:00Z",
        "2025-11-19T10:00:00Z"
      ],
      "conflictingDates": [],
      "requiresSitterApproval": true
    }
  }
}
```

---

### Get Recurring Booking Series
```http
GET /api/bookings/recurring/{recurringId}
Authorization: Bearer <access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "recurringBooking": {
      "id": "recurring-123",
      "status": "active",
      "petSitter": {
        "user": {
          "firstName": "Sarah",
          "lastName": "Johnson"
        }
      },
      "individualBookings": [
        {
          "id": "booking-12345",
          "date": "2025-11-15",
          "status": "completed",
          "actualCost": 21.25
        },
        {
          "id": "booking-12346",
          "date": "2025-11-17", 
          "status": "confirmed",
          "scheduledCost": 21.25
        }
      ],
      "stats": {
        "totalBookings": 24,
        "completedBookings": 8,
        "upcomingBookings": 16,
        "cancelledBookings": 0,
        "totalSpent": 170.00,
        "averageRating": 4.9
      },
      "nextBooking": {
        "date": "2025-11-17T10:00:00Z",
        "canModify": true,
        "canSkip": true
      }
    }
  }
}
```

---

## Error Codes Reference

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `SITTER_NOT_AVAILABLE` | Sitter not available for requested time | 409 |
| `PET_SERVICE_INCOMPATIBLE` | Pet type not compatible with service | 400 |
| `BOOKING_EXPIRED` | Booking request has expired | 410 |
| `INVALID_TIME_SLOT` | Invalid or past time slot | 400 |
| `INSUFFICIENT_NOTICE` | Less than minimum notice period | 400 |
| `MAX_PETS_EXCEEDED` | Too many pets for sitter's limit | 400 |
| `INVALID_STATUS_TRANSITION` | Cannot change to requested status | 409 |
| `BOOKING_NOT_FOUND` | Booking does not exist or access denied | 404 |
| `PAYMENT_FAILED` | Payment processing failed | 402 |
| `CANCELLATION_NOT_ALLOWED` | Cannot cancel within policy terms | 403 |
| `MODIFICATION_EXPIRED` | Modification request has expired | 410 |
| `RECURRING_LIMIT_EXCEEDED` | Too many recurring bookings active | 429 |

---

## Business Rules

### Booking Creation Rules
- Minimum 2 hours advance notice required
- Maximum 30 days advance booking allowed
- Sitter must be available for requested time slot
- Pet types must be compatible with selected service
- Total pets cannot exceed sitter's maximum capacity

### Status Transition Rules
- **Pending**: Auto-expires after 24 hours if not responded
- **Accepted**: Owner has 48 hours to confirm
- **Confirmed**: Cannot be cancelled less than 24 hours before start
- **In Progress**: Can only be completed by sitter
- **Completed**: Cannot be modified, only reviewed

### Payment Rules
- Payment authorized on confirmation
- Payment captured on completion
- Cancellation refunds based on cancellation policy
- Recurring bookings offer 15% discount after 10 bookings

### Modification Rules
- Time changes require mutual approval
- Service type changes not allowed after confirmation
- Pet additions subject to sitter's capacity limits
- Modifications cannot conflict with other bookings

### Recurring Booking Rules
- Minimum 5 bookings required for recurring series
- Sitter can block individual dates in series
- Pricing locked for duration of series
- Either party can end series with 7 days notice