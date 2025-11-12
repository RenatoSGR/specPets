# Pet Sitter Profile & Services Contracts

**API Group**: Pet Sitters  
**Base Path**: `/api/sitters`  
**Version**: 1.0

---

## Pet Sitter Profile Management

### Become a Pet Sitter
```http
POST /api/sitters/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "bio": "Experienced dog walker with 5+ years of pet care experience. I love spending time with animals and ensuring they get the attention and exercise they need.",
  "location": {
    "latitude": 47.6062,
    "longitude": -122.3321,
    "address": "123 Main Street",
    "city": "Seattle",
    "state": "WA",
    "zipCode": "98101"
  },
  "hourlyRate": 25.00,
  "maxPetsAtOnce": 3,
  "isAvailableForEmergencies": true,
  "petTypeSpecialties": [
    {
      "petTypeId": "dog",
      "experienceYears": 5,
      "hasSpecialTraining": true,
      "certifications": "Canine First Aid Certified"
    },
    {
      "petTypeId": "cat", 
      "experienceYears": 3,
      "hasSpecialTraining": false
    }
  ]
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "sitterProfile": {
      "id": "sitter-12345",
      "userId": "user-67890",
      "bio": "Experienced dog walker with 5+ years of pet care experience...",
      "location": {
        "latitude": 47.6062,
        "longitude": -122.3321,
        "address": "123 Main Street",
        "city": "Seattle",
        "state": "WA",
        "zipCode": "98101"
      },
      "hourlyRate": 25.00,
      "maxPetsAtOnce": 3,
      "isAvailableForEmergencies": true,
      "isVerified": false,
      "averageRating": 0,
      "totalReviews": 0,
      "completedBookings": 0,
      "createdAt": "2025-11-12T10:30:00Z",
      "petTypeSpecialties": [
        {
          "petType": {
            "id": "dog",
            "name": "Dog",
            "category": "mammal"
          },
          "experienceYears": 5,
          "hasSpecialTraining": true,
          "certifications": "Canine First Aid Certified"
        }
      ]
    }
  }
}
```

**Validation Rules**:
- `bio`: Required, 50-1000 characters
- `location`: Required, valid coordinates and address
- `hourlyRate`: Required, $5-$200 per hour
- `maxPetsAtOnce`: Required, 1-20 pets
- `petTypeSpecialties`: Required, at least one specialty

---

### Get Pet Sitter Profile
```http
GET /api/sitters/{sitterId}
Authorization: Bearer <access_token> (optional)
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "sitter": {
      "id": "sitter-12345",
      "user": {
        "id": "user-67890",
        "firstName": "Sarah",
        "lastName": "Johnson",
        "profileImageUrl": "https://octopets.blob.core.windows.net/avatars/user-67890.jpg"
      },
      "bio": "Experienced dog walker with 5+ years of pet care experience...",
      "location": {
        "city": "Seattle",
        "state": "WA",
        "approximateLocation": {
          "latitude": 47.606,
          "longitude": -122.332,
          "radiusDisplay": "Within 1 mile of downtown Seattle"
        }
      },
      "hourlyRate": 25.00,
      "maxPetsAtOnce": 3,
      "isAvailableForEmergencies": true,
      "isVerified": true,
      "backgroundCheckDate": "2025-10-15T00:00:00Z",
      "averageRating": 4.8,
      "totalReviews": 42,
      "completedBookings": 156,
      "joinedDate": "2025-03-15T10:30:00Z",
      "lastActiveAt": "2025-11-12T09:15:00Z",
      "responseTime": "Usually responds within 2 hours",
      "petTypeSpecialties": [
        {
          "petType": {
            "id": "dog",
            "name": "Dog",
            "category": "mammal",
            "iconUrl": "https://octopets.blob.core.windows.net/icons/dog.svg"
          },
          "experienceYears": 5,
          "hasSpecialTraining": true,
          "certifications": "Canine First Aid Certified, Pet CPR"
        }
      ],
      "servicesOffered": [
        {
          "id": "service-001",
          "serviceType": "dog-walking",
          "title": "Daily Dog Walking",
          "description": "30-60 minute walks in your neighborhood",
          "basePrice": 25.00,
          "pricingModel": "per-visit",
          "durationMinutes": 30,
          "isAvailable": true
        }
      ],
      "recentReviews": [
        {
          "id": "review-001",
          "reviewer": {
            "firstName": "John",
            "lastName": "D.",
            "profileImageUrl": "https://octopets.blob.core.windows.net/avatars/user-001.jpg"
          },
          "rating": 5,
          "comment": "Sarah took excellent care of Buddy. Highly recommend!",
          "createdAt": "2025-11-10T14:20:00Z",
          "petsCared": ["Buddy (Golden Retriever)"]
        }
      ]
    }
  }
}
```

**Privacy Notes**:
- Exact address only shown to confirmed bookings
- Phone number hidden until booking accepted
- Approximate location shown to all users

---

### Update Pet Sitter Profile
```http
PUT /api/sitters/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "bio": "Updated bio with new experience...",
  "hourlyRate": 30.00,
  "maxPetsAtOnce": 4,
  "isAvailableForEmergencies": false
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "sitterProfile": {
      "id": "sitter-12345",
      "bio": "Updated bio with new experience...",
      "hourlyRate": 30.00,
      "maxPetsAtOnce": 4,
      "isAvailableForEmergencies": false,
      "updatedAt": "2025-11-12T10:45:00Z"
    }
  }
}
```

---

### Get My Sitter Profile
```http
GET /api/sitters/profile/me
Authorization: Bearer <access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "sitterProfile": {
      "id": "sitter-12345",
      "bio": "Experienced dog walker...",
      "location": {
        "latitude": 47.6062,
        "longitude": -122.3321,
        "address": "123 Main Street",
        "city": "Seattle",
        "state": "WA",
        "zipCode": "98101"
      },
      "hourlyRate": 25.00,
      "isVerified": true,
      "verificationStatus": {
        "backgroundCheck": "completed",
        "idVerification": "completed",
        "emailVerification": "completed",
        "phoneVerification": "pending"
      },
      "earnings": {
        "thisMonth": 850.00,
        "lastMonth": 1200.00,
        "totalEarnings": 15600.00
      },
      "stats": {
        "totalBookings": 156,
        "completedBookings": 150,
        "cancelledByMe": 2,
        "cancelledByOwner": 4,
        "averageRating": 4.8,
        "totalReviews": 42,
        "responseRate": 95,
        "averageResponseTime": "2 hours"
      }
    }
  }
}
```

---

## Service Management

### Add Service
```http
POST /api/sitters/profile/services
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "serviceType": "dog-walking",
  "title": "Premium Dog Walking",
  "description": "Extended 60-minute walks with exercise and playtime",
  "basePrice": 35.00,
  "pricingModel": "per-visit",
  "durationMinutes": 60,
  "petTypeCompatibilities": [
    {
      "petTypeId": "dog",
      "requiresSpecialSkills": false,
      "priceAdjustment": 0,
      "additionalRequirements": "Must be leash trained"
    },
    {
      "petTypeId": "cat",
      "requiresSpecialSkills": true,
      "priceAdjustment": 5.00,
      "additionalRequirements": "Indoor cats only for leash walks"
    }
  ]
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "service": {
      "id": "service-123",
      "serviceType": "dog-walking",
      "title": "Premium Dog Walking",
      "description": "Extended 60-minute walks with exercise and playtime",
      "basePrice": 35.00,
      "pricingModel": "per-visit",
      "durationMinutes": 60,
      "isAvailable": true,
      "createdAt": "2025-11-12T10:30:00Z",
      "petTypeCompatibilities": [
        {
          "petType": {
            "id": "dog",
            "name": "Dog"
          },
          "requiresSpecialSkills": false,
          "priceAdjustment": 0,
          "additionalRequirements": "Must be leash trained"
        }
      ]
    }
  }
}
```

**Service Types**:
- `dog-walking`: Walking services
- `pet-sitting`: In-home pet care
- `pet-boarding`: Pet stays at sitter's home
- `drop-in-visits`: Quick check-in visits
- `overnight-care`: Overnight pet supervision
- `pet-taxi`: Transportation services
- `grooming`: Basic grooming services
- `training`: Pet training sessions

**Pricing Models**:
- `per-hour`: Hourly rate
- `per-day`: Daily rate
- `per-visit`: Per visit/session
- `flat`: Fixed price regardless of time

---

### Update Service
```http
PUT /api/sitters/profile/services/{serviceId}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Premium Dog Walking & Training",
  "basePrice": 40.00,
  "description": "60-minute walks with basic obedience training",
  "isAvailable": true
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "service": {
      "id": "service-123",
      "title": "Premium Dog Walking & Training",
      "basePrice": 40.00,
      "description": "60-minute walks with basic obedience training",
      "isAvailable": true,
      "updatedAt": "2025-11-12T10:45:00Z"
    }
  }
}
```

---

### Delete Service
```http
DELETE /api/sitters/profile/services/{serviceId}
Authorization: Bearer <access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "Service successfully deleted"
  }
}
```

**Notes**:
- Cannot delete services with active bookings
- Soft delete preserves historical booking data

---

### Get My Services
```http
GET /api/sitters/profile/services
Authorization: Bearer <access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "service-123",
        "serviceType": "dog-walking", 
        "title": "Premium Dog Walking",
        "basePrice": 35.00,
        "pricingModel": "per-visit",
        "isAvailable": true,
        "bookingCount": 45,
        "averageRating": 4.9,
        "lastBooked": "2025-11-10T14:30:00Z"
      }
    ]
  }
}
```

---

## Availability Management

### Set Availability
```http
POST /api/sitters/profile/availability
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "availabilitySlots": [
    {
      "date": "2025-11-15",
      "startTime": "08:00",
      "endTime": "18:00",
      "isRecurring": true,
      "recurringDayOfWeek": 1,
      "recurringUntilDate": "2025-12-31",
      "notes": "Available for morning and afternoon walks"
    },
    {
      "date": "2025-11-16",
      "startTime": "09:00", 
      "endTime": "17:00",
      "isRecurring": false,
      "notes": "One-time Saturday availability"
    }
  ]
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "availabilitySlots": [
      {
        "id": "avail-001",
        "date": "2025-11-15",
        "startTime": "08:00",
        "endTime": "18:00",
        "isAvailable": true,
        "isRecurring": true,
        "recurringDayOfWeek": 1,
        "recurringUntilDate": "2025-12-31",
        "notes": "Available for morning and afternoon walks"
      }
    ],
    "message": "15 availability slots created (including recurring dates)"
  }
}
```

**Day of Week Values**:
- 0: Sunday, 1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday

---

### Get My Availability
```http
GET /api/sitters/profile/availability?startDate=2025-11-15&endDate=2025-11-30
Authorization: Bearer <access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "availabilitySlots": [
      {
        "id": "avail-001",
        "date": "2025-11-15",
        "startTime": "08:00",
        "endTime": "18:00",
        "isAvailable": true,
        "isBlocked": false,
        "hasBookings": true,
        "bookedSlots": [
          {
            "startTime": "10:00",
            "endTime": "11:00",
            "bookingId": "booking-123"
          }
        ],
        "notes": "Available for morning and afternoon walks"
      }
    ]
  }
}
```

---

### Update Availability Slot
```http
PUT /api/sitters/profile/availability/{availabilityId}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "startTime": "09:00",
  "endTime": "17:00",
  "isBlocked": false,
  "notes": "Updated availability window"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "availabilitySlot": {
      "id": "avail-001",
      "startTime": "09:00",
      "endTime": "17:00",
      "isBlocked": false,
      "notes": "Updated availability window",
      "updatedAt": "2025-11-12T10:45:00Z"
    }
  }
}
```

---

### Block Availability
```http
POST /api/sitters/profile/availability/{availabilityId}/block
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "isBlocked": true,
  "reason": "Personal appointment"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "Availability slot blocked",
    "affectedBookings": []
  }
}
```

**Notes**:
- Blocking availability with existing bookings requires confirmation
- Affected bookings receive cancellation notifications

---

## Reviews and Ratings

### Get Sitter Reviews
```http
GET /api/sitters/{sitterId}/reviews?page=1&pageSize=10&sortBy=createdAt&sortDirection=desc
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "review-001",
        "booking": {
          "id": "booking-123",
          "serviceType": "dog-walking",
          "startDate": "2025-11-05",
          "endDate": "2025-11-05"
        },
        "reviewer": {
          "firstName": "John",
          "lastName": "D.",
          "profileImageUrl": "https://octopets.blob.core.windows.net/avatars/user-001.jpg"
        },
        "rating": 5,
        "communicationRating": 5,
        "reliabilityRating": 5,
        "petCareRating": 5,
        "comment": "Sarah took excellent care of Buddy. He came home tired and happy after his walk. Great communication throughout the day with photos. Highly recommend!",
        "wouldRecommend": true,
        "petsCared": ["Buddy (Golden Retriever)"],
        "createdAt": "2025-11-10T14:20:00Z",
        "sitterResponse": {
          "comment": "Thank you John! Buddy was a joy to walk. Looking forward to our next adventure!",
          "respondedAt": "2025-11-10T16:30:00Z"
        }
      }
    ],
    "pagination": {
      "totalCount": 42,
      "pageNumber": 1,
      "pageSize": 10,
      "totalPages": 5,
      "hasNextPage": true
    },
    "ratingSummary": {
      "averageRating": 4.8,
      "totalReviews": 42,
      "ratingDistribution": {
        "5": 35,
        "4": 6,
        "3": 1,
        "2": 0,
        "1": 0
      },
      "averageSubRatings": {
        "communication": 4.9,
        "reliability": 4.8,
        "petCare": 4.9
      }
    }
  }
}
```

---

### Respond to Review
```http
POST /api/sitters/profile/reviews/{reviewId}/respond
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "comment": "Thank you for the wonderful review! Buddy was such a good dog and I enjoyed our walk together."
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "response": {
      "comment": "Thank you for the wonderful review! Buddy was such a good dog and I enjoyed our walk together.",
      "respondedAt": "2025-11-12T10:30:00Z"
    }
  }
}
```

---

## Verification and Background Checks

### Request Verification
```http
POST /api/sitters/profile/verification/request
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "verificationType": "background-check",
  "documents": [
    {
      "type": "government-id",
      "url": "https://octopets.blob.core.windows.net/documents/id-123.jpg"
    }
  ]
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "verificationRequest": {
      "id": "verification-123",
      "type": "background-check",
      "status": "submitted",
      "submittedAt": "2025-11-12T10:30:00Z",
      "estimatedCompletionDate": "2025-11-19T10:30:00Z"
    }
  }
}
```

---

### Get Verification Status
```http
GET /api/sitters/profile/verification/status
Authorization: Bearer <access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "verification": {
      "backgroundCheck": {
        "status": "completed",
        "completedAt": "2025-10-15T10:30:00Z",
        "expiresAt": "2026-10-15T10:30:00Z",
        "provider": "Checkr"
      },
      "idVerification": {
        "status": "completed",
        "completedAt": "2025-10-14T15:20:00Z"
      },
      "emailVerification": {
        "status": "completed",
        "verifiedAt": "2025-10-12T09:15:00Z"
      },
      "phoneVerification": {
        "status": "pending",
        "lastAttempt": "2025-11-12T10:00:00Z"
      },
      "overallVerificationLevel": "verified"
    }
  }
}
```

**Verification Levels**:
- `unverified`: No verification completed
- `basic`: Email and phone verified
- `enhanced`: Basic + ID verification
- `verified`: Enhanced + background check

---

## Error Codes Reference

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `NOT_A_SITTER` | User is not a registered pet sitter | 403 |
| `SITTER_ALREADY_EXISTS` | User already has a sitter profile | 409 |
| `INVALID_LOCATION` | Invalid coordinates or address | 400 |
| `RATE_TOO_LOW` | Hourly rate below minimum ($5) | 400 |
| `RATE_TOO_HIGH` | Hourly rate above maximum ($200) | 400 |
| `INVALID_PET_TYPE` | Pet type not supported | 400 |
| `SERVICE_HAS_BOOKINGS` | Cannot delete service with active bookings | 409 |
| `AVAILABILITY_CONFLICT` | Time slot conflicts with existing booking | 409 |
| `VERIFICATION_IN_PROGRESS` | Verification already in progress | 409 |
| `VERIFICATION_FAILED` | Background check or ID verification failed | 400 |
| `DOCUMENT_REQUIRED` | Required verification document missing | 400 |
| `INVALID_TIME_RANGE` | Invalid start/end time combination | 400 |
| `RECURRING_DATE_REQUIRED` | Recurring availability missing required fields | 400 |