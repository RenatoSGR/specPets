# Administration and Analytics Contracts

**API Group**: Administration and Analytics  
**Base Path**: `/api/admin`  
**Version**: 1.0  
**Required Role**: `admin` or specific permissions

---

## User Management

### Get Platform Users
```http
GET /api/admin/users?role=all&status=active&search=john&page=1&pageSize=50&sortBy=createdAt&sortOrder=desc
Authorization: Bearer <admin_access_token>
```

**Query Parameters**:
- `role`: `all`, `pet-owner`, `sitter`, `admin`
- `status`: `active`, `suspended`, `pending-verification`, `all`
- `search`: Search by name, email, or phone
- `location`: Filter by city/state
- `verificationStatus`: `verified`, `pending`, `unverified`

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-001",
        "email": "john.doe@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "phoneNumber": "555-0101",
        "roles": ["pet-owner"],
        "status": "active",
        "location": {
          "city": "Seattle",
          "state": "WA",
          "coordinates": {
            "latitude": 47.6062,
            "longitude": -122.3321
          }
        },
        "verificationStatus": {
          "identity": "verified",
          "phone": "verified",
          "email": "verified",
          "verifiedAt": "2025-11-01T10:30:00Z"
        },
        "statistics": {
          "totalBookings": 15,
          "completedBookings": 12,
          "cancelledBookings": 3,
          "averageRating": 4.8,
          "totalSpent": 450.00,
          "accountAge": 180
        },
        "flags": {
          "hasReports": false,
          "requiresReview": false,
          "isHighValue": true,
          "riskLevel": "low"
        },
        "createdAt": "2025-05-15T10:30:00Z",
        "lastActiveAt": "2025-11-14T09:15:00Z",
        "lastLoginAt": "2025-11-14T09:00:00Z"
      }
    ],
    "summary": {
      "totalUsers": 2847,
      "activeUsers": 2134,
      "petOwners": 1924,
      "sitters": 923,
      "newUsersThisMonth": 156,
      "verifiedUsers": 2456
    },
    "pagination": {
      "totalCount": 2847,
      "pageNumber": 1,
      "pageSize": 50,
      "totalPages": 57,
      "hasNextPage": true
    }
  }
}
```

---

### Get User Details
```http
GET /api/admin/users/{userId}
Authorization: Bearer <admin_access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-001",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "555-0101",
      "dateOfBirth": "1985-06-15",
      "profileImageUrl": "https://octopets.blob.core.windows.net/avatars/user-001.jpg",
      "roles": ["pet-owner"],
      "status": "active",
      "location": {
        "address": "123 Main St, Seattle, WA 98101",
        "city": "Seattle",
        "state": "WA",
        "zipCode": "98101",
        "coordinates": {
          "latitude": 47.6062,
          "longitude": -122.3321
        }
      },
      "verificationStatus": {
        "identity": "verified",
        "phone": "verified", 
        "email": "verified",
        "backgroundCheck": "not-applicable",
        "verifiedAt": "2025-11-01T10:30:00Z",
        "verifierNotes": "Standard verification completed"
      },
      "pets": [
        {
          "id": "pet-001",
          "name": "Buddy",
          "petType": "dog",
          "breed": "Golden Retriever",
          "ageMonths": 36,
          "isActive": true
        }
      ],
      "bookingHistory": {
        "totalBookings": 15,
        "completedBookings": 12,
        "cancelledBookings": 3,
        "noShowBookings": 0,
        "averageRating": 4.8,
        "totalSpent": 450.00,
        "firstBooking": "2025-06-01T10:00:00Z",
        "lastBooking": "2025-11-10T14:30:00Z"
      },
      "sitterProfile": null,
      "compliance": {
        "termsAccepted": true,
        "termsVersion": "2.1",
        "termsAcceptedAt": "2025-11-01T10:30:00Z",
        "privacyPolicyAccepted": true,
        "marketingConsent": false,
        "dataRetentionConsent": true
      },
      "security": {
        "mfaEnabled": true,
        "lastPasswordChange": "2025-10-15T08:00:00Z",
        "failedLoginAttempts": 0,
        "lastFailedLogin": null,
        "suspiciousActivity": false
      },
      "financials": {
        "defaultPaymentMethod": {
          "type": "credit_card",
          "last4": "1234",
          "brand": "visa",
          "isValid": true
        },
        "totalLifetimeValue": 450.00,
        "outstandingBalance": 0,
        "paymentFailures": 0
      },
      "reports": [],
      "notes": [
        {
          "id": "note-001",
          "createdBy": "admin-user-001",
          "content": "High-value customer, excellent reviews from sitters",
          "createdAt": "2025-10-01T14:00:00Z",
          "category": "customer-service"
        }
      ],
      "createdAt": "2025-05-15T10:30:00Z",
      "lastActiveAt": "2025-11-14T09:15:00Z",
      "lastLoginAt": "2025-11-14T09:00:00Z"
    }
  }
}
```

---

### Update User Status
```http
PUT /api/admin/users/{userId}/status
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "status": "suspended",
  "reason": "multiple-policy-violations",
  "duration": 30,
  "notes": "Suspended for 30 days due to repeated cancellations within policy violation threshold",
  "notifyUser": true,
  "suspendServices": true
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-789",
      "status": "suspended",
      "statusUpdatedAt": "2025-11-14T11:30:00Z",
      "statusUpdatedBy": "admin-user-001",
      "suspension": {
        "reason": "multiple-policy-violations",
        "duration": 30,
        "expiresAt": "2025-12-14T11:30:00Z",
        "servicesAffected": ["booking", "messaging"],
        "notes": "Suspended for 30 days due to repeated cancellations..."
      }
    },
    "actions": {
      "userNotified": true,
      "activeBookingsCancelled": 2,
      "futureBookingsCancelled": 1,
      "refundsProcessed": 3
    }
  }
}
```

**Valid Status Values**:
- `active`: Normal account status
- `suspended`: Temporarily suspended
- `banned`: Permanently banned
- `pending-verification`: Awaiting verification
- `under-review`: Manual review required

---

### Add Admin Note
```http
POST /api/admin/users/{userId}/notes
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "content": "Customer called regarding booking issue. Resolved by providing refund for cancellation fee.",
  "category": "customer-service",
  "priority": "normal",
  "isPrivate": false,
  "tags": ["refund", "customer-service", "resolved"]
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "note": {
      "id": "note-002",
      "userId": "user-001",
      "createdBy": "admin-user-001",
      "content": "Customer called regarding booking issue...",
      "category": "customer-service",
      "priority": "normal",
      "isPrivate": false,
      "tags": ["refund", "customer-service", "resolved"],
      "createdAt": "2025-11-14T11:45:00Z"
    }
  }
}
```

---

## Sitter Management

### Get Sitter Applications
```http
GET /api/admin/sitters/applications?status=pending&verificationStatus=background-check-pending&page=1
Authorization: Bearer <admin_access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "app-001",
        "applicant": {
          "userId": "user-456",
          "firstName": "Sarah",
          "lastName": "Johnson",
          "email": "sarah.johnson@example.com",
          "phoneNumber": "555-0102"
        },
        "status": "pending-review",
        "submittedAt": "2025-11-10T14:30:00Z",
        "verificationStatus": {
          "identity": "verified",
          "backgroundCheck": "pending",
          "references": "pending",
          "insurance": "verified",
          "certifications": "verified"
        },
        "experience": {
          "yearsOfExperience": 5,
          "petTypes": ["dog", "cat"],
          "specializations": ["senior-pets", "medication-administration"],
          "certifications": ["pet-first-aid", "dog-training"]
        },
        "services": [
          {
            "serviceType": "dog-walking",
            "basePrice": 25.00,
            "description": "30-60 minute walks with exercise and playtime"
          }
        ],
        "availability": {
          "schedule": "flexible",
          "maxPetsPerBooking": 3,
          "serviceRadius": 5
        },
        "references": [
          {
            "name": "Jane Smith",
            "relationship": "previous-client",
            "phoneNumber": "555-0199",
            "status": "pending-contact"
          }
        ],
        "background": {
          "checkType": "standard",
          "provider": "checkr",
          "status": "in-progress",
          "submittedAt": "2025-11-10T15:00:00Z"
        },
        "reviewNotes": [
          {
            "reviewer": "admin-user-002",
            "note": "Strong application, good experience level",
            "createdAt": "2025-11-11T09:00:00Z"
          }
        ],
        "requiredActions": [
          "background-check-completion",
          "reference-verification"
        ]
      }
    ],
    "summary": {
      "totalApplications": 45,
      "pendingReview": 12,
      "pendingBackgroundCheck": 8,
      "pendingReferences": 15,
      "approvedThisWeek": 6,
      "rejectedThisWeek": 2
    }
  }
}
```

---

### Review Sitter Application
```http
PUT /api/admin/sitters/applications/{applicationId}/review
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "decision": "approved",
  "reviewNotes": "Excellent application with strong experience and positive references. Background check clear.",
  "conditions": [
    "complete-onboarding-training",
    "submit-insurance-proof"
  ],
  "services": [
    {
      "serviceType": "dog-walking",
      "approved": true,
      "maxPets": 3
    },
    {
      "serviceType": "pet-sitting", 
      "approved": false,
      "reason": "requires-additional-experience"
    }
  ],
  "onboardingRequired": true
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "application": {
      "id": "app-001",
      "status": "approved",
      "reviewedAt": "2025-11-14T12:00:00Z",
      "reviewedBy": "admin-user-002",
      "decision": "approved",
      "reviewNotes": "Excellent application with strong experience..."
    },
    "sitterProfile": {
      "id": "sitter-001",
      "userId": "user-456",
      "status": "pending-onboarding",
      "approvedServices": ["dog-walking"],
      "onboardingSteps": [
        "complete-training-modules",
        "submit-insurance-proof", 
        "complete-first-booking"
      ]
    },
    "nextSteps": [
      "Sitter account created",
      "Onboarding email sent",
      "Training modules assigned"
    ]
  }
}
```

**Review Decisions**:
- `approved`: Application approved, create sitter profile
- `rejected`: Application rejected, provide reason
- `needs-info`: Additional information required
- `pending-background`: Waiting for background check

---

### Get Sitter Performance
```http
GET /api/admin/sitters/{sitterId}/performance?period=3months
Authorization: Bearer <admin_access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "sitter": {
      "id": "sitter-001",
      "user": {
        "firstName": "Sarah",
        "lastName": "Johnson"
      },
      "status": "active",
      "joinedAt": "2025-08-15T10:30:00Z"
    },
    "performance": {
      "period": "3months",
      "metrics": {
        "totalBookings": 156,
        "completedBookings": 148,
        "cancelledBookings": 5,
        "noShowBookings": 1,
        "disputedBookings": 2,
        "averageRating": 4.8,
        "responseRate": 94,
        "acceptanceRate": 87,
        "onTimeRate": 96
      },
      "earnings": {
        "totalGrossEarnings": 3900.00,
        "platformFees": 585.00,
        "netEarnings": 3315.00,
        "averagePerBooking": 25.00,
        "topEarningMonth": "2025-10"
      },
      "customerSatisfaction": {
        "averageRating": 4.8,
        "fiveStarPercentage": 78,
        "repeatCustomers": 45,
        "reviewHighlights": [
          "Excellent communication",
          "Reliable and punctual", 
          "Great with pets"
        ]
      },
      "compliance": {
        "backgroundCheckValid": true,
        "backgroundCheckExpires": "2026-08-15",
        "insuranceValid": true,
        "trainingComplete": true,
        "policyViolations": 0
      },
      "trends": {
        "bookingGrowth": 23,
        "ratingTrend": "stable",
        "responseTimeImprovement": 15,
        "customerRetentionRate": 68
      }
    },
    "recentIssues": [
      {
        "date": "2025-11-05",
        "type": "late-arrival",
        "description": "Arrived 15 minutes late due to traffic",
        "resolution": "Compensation provided to customer",
        "status": "resolved"
      }
    ],
    "recommendations": [
      "Consider promoting to premium sitter tier",
      "Invite to pilot new service offerings",
      "Recognize in monthly newsletter"
    ]
  }
}
```

---

## Booking Management

### Get Platform Bookings
```http
GET /api/admin/bookings?status=disputed&dateFrom=2025-11-01&dateTo=2025-11-30&priority=high
Authorization: Bearer <admin_access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "booking-789",
        "status": "disputed",
        "createdAt": "2025-11-10T10:30:00Z",
        "startDateTime": "2025-11-12T14:00:00Z",
        "petOwner": {
          "id": "user-001",
          "firstName": "John",
          "lastName": "Doe",
          "trustScore": 4.8
        },
        "petSitter": {
          "id": "sitter-002", 
          "user": {
            "firstName": "Mark",
            "lastName": "Wilson"
          },
          "trustScore": 4.6
        },
        "service": {
          "title": "Pet Sitting",
          "duration": 120
        },
        "totalCost": 80.00,
        "dispute": {
          "initiatedBy": "pet-owner",
          "reason": "service-not-completed",
          "description": "Sitter left early and did not complete full service time",
          "evidence": ["message-screenshots", "timeline-mismatch"],
          "priority": "high",
          "assignedTo": "admin-user-003",
          "createdAt": "2025-11-13T09:00:00Z"
        },
        "flags": {
          "requiresUrgentAttention": true,
          "potentialRefund": 40.00,
          "riskLevel": "medium"
        }
      }
    ],
    "summary": {
      "totalBookings": 1247,
      "disputedBookings": 23,
      "highPriorityDisputes": 5,
      "averageResolutionTime": 2.5
    }
  }
}
```

---

### Resolve Booking Dispute
```http
POST /api/admin/bookings/{bookingId}/resolve-dispute
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "resolution": "partial-refund",
  "amount": 40.00,
  "reasoning": "Based on message timeline, service was completed but ended 30 minutes early. Partial refund appropriate.",
  "actions": [
    {
      "type": "refund",
      "recipient": "pet-owner",
      "amount": 40.00
    },
    {
      "type": "warning",
      "recipient": "sitter",
      "message": "Reminder about completing full service duration as advertised"
    }
  ],
  "preventiveMeasures": [
    "remind-both-parties-service-expectations",
    "suggest-gps-tracking-for-future-bookings"
  ],
  "followUpRequired": false,
  "isPublic": false
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "booking-789",
      "status": "completed",
      "disputeResolution": {
        "resolvedAt": "2025-11-14T13:00:00Z",
        "resolvedBy": "admin-user-003",
        "resolution": "partial-refund",
        "amount": 40.00,
        "reasoning": "Based on message timeline..."
      }
    },
    "actions": {
      "refundProcessed": {
        "amount": 40.00,
        "recipient": "user-001",
        "transactionId": "ref-12345",
        "expectedProcessingTime": "3-5 business days"
      },
      "warningsIssued": [
        {
          "recipient": "sitter-002",
          "type": "service-completion-reminder",
          "sentAt": "2025-11-14T13:05:00Z"
        }
      ],
      "notificationsSent": [
        "Both parties notified of resolution",
        "Refund confirmation sent to pet owner"
      ]
    }
  }
}
```

---

## Analytics and Reporting

### Platform Analytics Dashboard
```http
GET /api/admin/analytics/dashboard?period=30days&metrics=all
Authorization: Bearer <admin_access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2025-10-15T00:00:00Z",
      "end": "2025-11-14T23:59:59Z",
      "days": 30
    },
    "userMetrics": {
      "totalUsers": 2847,
      "newUsers": 156,
      "activeUsers": 2134,
      "churned": 23,
      "userGrowthRate": 5.8,
      "usersByRole": {
        "petOwners": 1924,
        "sitters": 923,
        "admins": 15
      },
      "verificationMetrics": {
        "verificationRate": 86.3,
        "averageVerificationTime": 2.1
      }
    },
    "bookingMetrics": {
      "totalBookings": 1247,
      "completedBookings": 1189,
      "cancelledBookings": 42,
      "disputedBookings": 16,
      "bookingGrowthRate": 12.4,
      "completionRate": 95.3,
      "averageBookingValue": 32.50,
      "bookingsByService": {
        "dog-walking": 687,
        "pet-sitting": 423,
        "drop-in-visits": 137
      }
    },
    "revenueMetrics": {
      "totalGrossRevenue": 40525.00,
      "platformFees": 6078.75,
      "netRevenue": 34446.25,
      "revenueGrowthRate": 18.7,
      "averageOrderValue": 32.50,
      "revenueByService": {
        "dog-walking": 17175.00,
        "pet-sitting": 16920.00,
        "drop-in-visits": 6430.00
      },
      "recurringRevenue": 12456.75
    },
    "qualityMetrics": {
      "averageRating": 4.7,
      "customerSatisfactionScore": 92.3,
      "firstTimeUserExperience": 89.1,
      "repeatBookingRate": 67.8,
      "issueResolutionTime": 4.2,
      "supportTickets": {
        "total": 89,
        "resolved": 84,
        "averageResolutionTime": 6.8
      }
    },
    "operationalMetrics": {
      "sitterUtilization": 73.2,
      "averageResponseTime": 1.8,
      "peakUsageHours": ["10:00", "15:00", "18:00"],
      "systemUptime": 99.94,
      "apiResponseTime": 245
    },
    "trends": {
      "dailyActiveUsers": [
        { "date": "2025-11-14", "count": 487 },
        { "date": "2025-11-13", "count": 523 }
      ],
      "dailyBookings": [
        { "date": "2025-11-14", "count": 43 },
        { "date": "2025-11-13", "count": 51 }
      ],
      "dailyRevenue": [
        { "date": "2025-11-14", "amount": 1395.50 },
        { "date": "2025-11-13", "amount": 1653.25 }
      ]
    }
  }
}
```

---

### Revenue Analytics
```http
GET /api/admin/analytics/revenue?period=12months&breakdown=monthly&includeProjections=true
Authorization: Bearer <admin_access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "revenueAnalytics": {
      "period": "12months",
      "totalRevenue": 487250.00,
      "platformFees": 73087.50,
      "netRevenue": 414162.50,
      "monthlyBreakdown": [
        {
          "month": "2025-11",
          "grossRevenue": 52340.00,
          "platformFees": 7851.00,
          "netRevenue": 44489.00,
          "bookings": 1598,
          "averageOrderValue": 32.75,
          "growth": 8.2
        }
      ],
      "revenueByCategory": {
        "serviceBookings": 438525.00,
        "subscriptionFees": 32400.00,
        "cancellationFees": 8925.00,
        "promotionalAdjustments": -7600.00
      },
      "revenueByService": {
        "dog-walking": 195690.00,
        "pet-sitting": 203420.00,
        "drop-in-visits": 61840.00,
        "overnight-care": 26300.00
      },
      "geographicBreakdown": [
        {
          "region": "Pacific Northwest",
          "revenue": 145620.00,
          "percentage": 29.9
        },
        {
          "region": "California",
          "revenue": 126380.00,
          "percentage": 25.9
        }
      ],
      "projections": {
        "nextMonth": 56230.00,
        "nextQuarter": 162840.00,
        "confidence": 87.3,
        "factors": [
          "Seasonal holiday increase",
          "New sitter onboarding",
          "Marketing campaign launch"
        ]
      }
    }
  }
}
```

---

### User Behavior Analytics
```http
GET /api/admin/analytics/user-behavior?segment=new-users&period=90days&cohort=2025-Q3
Authorization: Bearer <admin_access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "userBehaviorAnalytics": {
      "segment": "new-users",
      "cohort": "2025-Q3",
      "totalUsers": 478,
      "analysisMetrics": {
        "onboardingCompletion": {
          "rate": 84.3,
          "averageTime": 3.2,
          "dropOffPoints": [
            { "step": "email-verification", "dropRate": 8.2 },
            { "step": "profile-completion", "dropRate": 5.1 },
            { "step": "payment-method", "dropRate": 2.4 }
          ]
        },
        "firstBookingBehavior": {
          "conversionRate": 67.4,
          "timeToFirstBooking": 4.8,
          "averageFirstBookingValue": 28.50,
          "popularFirstServices": [
            { "service": "dog-walking", "percentage": 52.3 },
            { "service": "drop-in-visits", "percentage": 31.2 }
          ]
        },
        "retentionAnalysis": {
          "day7": 78.2,
          "day30": 56.8,
          "day90": 42.7,
          "recurringUsers": 34.9
        },
        "engagementMetrics": {
          "averageSessionDuration": 8.4,
          "pagesPerSession": 5.7,
          "featureAdoption": {
            "messaging": 89.3,
            "reviews": 67.8,
            "favorites": 45.2,
            "recurringBookings": 23.4
          }
        }
      },
      "demographicBreakdown": {
        "ageGroups": [
          { "range": "25-34", "count": 186, "percentage": 38.9 },
          { "range": "35-44", "count": 156, "percentage": 32.6 }
        ],
        "locations": [
          { "city": "Seattle", "count": 67 },
          { "city": "Portland", "count": 43 }
        ],
        "petTypes": [
          { "type": "dog", "count": 312 },
          { "type": "cat", "count": 89 }
        ]
      },
      "satisfactionMetrics": {
        "netPromoterScore": 72,
        "customerSatisfactionScore": 4.6,
        "supportTicketRate": 12.3
      },
      "recommendations": [
        "Simplify payment method setup process",
        "Add more dog walking options in onboarding",
        "Implement retention campaign for day-30 users"
      ]
    }
  }
}
```

---

## Content Moderation

### Get Flagged Content
```http
GET /api/admin/moderation/flagged-content?type=all&status=pending&severity=high&page=1
Authorization: Bearer <admin_access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "flaggedContent": [
      {
        "id": "flag-001",
        "contentType": "user-review",
        "contentId": "review-789",
        "severity": "high",
        "flagReason": "inappropriate-language",
        "status": "pending-review",
        "flaggedAt": "2025-11-14T09:30:00Z",
        "flaggedBy": "system-auto-mod",
        "content": {
          "text": "This sitter was terrible and completely unprofessional...",
          "author": {
            "userId": "user-456",
            "firstName": "Anonymous",
            "lastName": "User"
          },
          "context": {
            "bookingId": "booking-567",
            "serviceType": "pet-sitting"
          }
        },
        "moderationData": {
          "automaticFlags": [
            { "type": "profanity-detected", "confidence": 0.89 },
            { "type": "harassment-potential", "confidence": 0.67 }
          ],
          "userReports": 2,
          "similarIncidents": 0
        },
        "suggestedActions": [
          "remove-content",
          "warn-user",
          "contact-parties"
        ]
      }
    ],
    "summary": {
      "totalFlagged": 34,
      "pendingReview": 12,
      "highSeverity": 3,
      "resolvedToday": 8,
      "falsePositives": 2
    }
  }
}
```

---

### Moderate Content
```http
POST /api/admin/moderation/flagged-content/{flagId}/moderate
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "decision": "remove-and-warn",
  "reasoning": "Content contains inappropriate language and personal attacks. Removing content and issuing warning to user.",
  "actions": [
    {
      "type": "remove-content",
      "permanent": true
    },
    {
      "type": "warn-user", 
      "userId": "user-456",
      "message": "Your review contained inappropriate language and violated our community guidelines. Future violations may result in account suspension."
    },
    {
      "type": "contact-affected-party",
      "userId": "sitter-002",
      "message": "We've removed an inappropriate review from your profile. This action does not reflect on your service quality."
    }
  ],
  "preventiveMeasures": [
    "add-user-to-watch-list",
    "require-approval-for-future-reviews"
  ]
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "moderation": {
      "flagId": "flag-001",
      "decision": "remove-and-warn",
      "moderatedAt": "2025-11-14T14:30:00Z",
      "moderatedBy": "admin-user-001",
      "reasoning": "Content contains inappropriate language..."
    },
    "actionsCompleted": [
      {
        "type": "remove-content",
        "contentId": "review-789",
        "completed": true
      },
      {
        "type": "warn-user",
        "userId": "user-456",
        "warningLevel": "first",
        "completed": true
      },
      {
        "type": "notification-sent",
        "userId": "sitter-002",
        "completed": true
      }
    ]
  }
}
```

---

## System Configuration

### Get Platform Settings
```http
GET /api/admin/settings/platform
Authorization: Bearer <admin_access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "platformSettings": {
      "businessRules": {
        "minimumAdvanceBooking": 2,
        "maximumAdvanceBooking": 720,
        "cancellationPolicyHours": 24,
        "sitterMaxPetsPerBooking": 5,
        "platformFeePercentage": 15.0,
        "minimumServiceDuration": 30,
        "maximumServiceDuration": 480
      },
      "verification": {
        "requirePhoneVerification": true,
        "requireEmailVerification": true,
        "requireIdentityVerification": false,
        "sitterBackgroundCheckRequired": true,
        "backgroundCheckProvider": "checkr",
        "insuranceRequired": true
      },
      "contentModeration": {
        "autoModerationEnabled": true,
        "profanityFilterStrength": "medium",
        "requireReviewApproval": false,
        "imageAutoScanEnabled": true,
        "suspiciousActivityThreshold": 3
      },
      "notifications": {
        "emailNotificationsEnabled": true,
        "pushNotificationsEnabled": true,
        "smsNotificationsEnabled": true,
        "marketingEmailsOptOut": false,
        "reminderLeadTime": 24
      },
      "financial": {
        "paymentHoldDuration": 24,
        "refundProcessingTime": 3,
        "minimumPayoutAmount": 25.00,
        "payoutSchedule": "weekly",
        "currencyCode": "USD"
      }
    }
  }
}
```

---

### Update Platform Settings
```http
PUT /api/admin/settings/platform
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "businessRules": {
    "minimumAdvanceBooking": 4,
    "cancellationPolicyHours": 48
  },
  "verification": {
    "requireIdentityVerification": true
  },
  "reason": "Updated to improve service quality and reduce last-minute cancellations",
  "effectiveDate": "2025-12-01T00:00:00Z",
  "notifyUsers": true
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "settingsUpdate": {
      "updatedBy": "admin-user-001",
      "updatedAt": "2025-11-14T15:00:00Z",
      "effectiveDate": "2025-12-01T00:00:00Z",
      "changesApplied": [
        {
          "setting": "minimumAdvanceBooking",
          "oldValue": 2,
          "newValue": 4
        },
        {
          "setting": "cancellationPolicyHours", 
          "oldValue": 24,
          "newValue": 48
        },
        {
          "setting": "requireIdentityVerification",
          "oldValue": false,
          "newValue": true
        }
      ]
    },
    "impact": {
      "affectedUsers": 2847,
      "notificationsSent": true,
      "gracePeriodUntil": "2025-12-01T00:00:00Z"
    }
  }
}
```

---

## Error Codes Reference

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INSUFFICIENT_ADMIN_PRIVILEGES` | Admin role required for action | 403 |
| `USER_NOT_FOUND` | User account not found | 404 |
| `INVALID_STATUS_TRANSITION` | Cannot change to requested status | 409 |
| `DISPUTE_ALREADY_RESOLVED` | Dispute has been resolved already | 409 |
| `ANALYTICS_DATA_UNAVAILABLE` | Analytics data not ready for period | 503 |
| `MODERATION_ACTION_FAILED` | Content moderation action failed | 500 |
| `SETTINGS_UPDATE_FAILED` | Platform settings update failed | 500 |
| `REPORT_GENERATION_FAILED` | Report generation failed | 500 |
| `BULK_ACTION_PARTIAL_FAILURE` | Some items in bulk action failed | 207 |
| `PERMISSION_DENIED` | Insufficient permissions for resource | 403 |

---

## Admin Permissions Matrix

| Action | Super Admin | Platform Admin | Support Admin | Content Moderator |
|--------|-------------|---------------|---------------|------------------|
| View all users | ✅ | ✅ | ✅ | ❌ |
| Suspend users | ✅ | ✅ | ⚠️ (temp only) | ❌ |
| Ban users | ✅ | ❌ | ❌ | ❌ |
| View financial data | ✅ | ✅ | ❌ | ❌ |
| Modify platform settings | ✅ | ⚠️ (limited) | ❌ | ❌ |
| Resolve disputes | ✅ | ✅ | ✅ | ❌ |
| Moderate content | ✅ | ✅ | ✅ | ✅ |
| View analytics | ✅ | ✅ | ⚠️ (limited) | ❌ |
| Manage sitter applications | ✅ | ✅ | ⚠️ (review only) | ❌ |

**Legend**: ✅ Full access, ⚠️ Limited access, ❌ No access