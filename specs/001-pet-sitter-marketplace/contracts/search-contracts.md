# Sitter Search & Discovery Contracts

**API Group**: Search & Discovery  
**Base Path**: `/api/search`  
**Version**: 1.0

---

## Basic Sitter Search

### Search Pet Sitters
```http
GET /api/search/sitters?location=Seattle,WA&radius=25&petType=dog&serviceType=dog-walking&startDate=2025-11-15&endDate=2025-11-17&page=1&pageSize=20&sortBy=distance&sortDirection=asc
Authorization: Bearer <access_token> (optional)
```

**Query Parameters**:
- `location` (required): City/state, zip code, or coordinates "lat,lng"
- `radius`: Search radius in miles (default: 25, max: 100)
- `petType`: Pet type ID (dog, cat, bird, etc.)
- `serviceType`: Service type filter
- `startDate`: Start date for availability check (ISO date)
- `endDate`: End date for availability check (ISO date)
- `minRating`: Minimum rating filter (1-5)
- `maxPrice`: Maximum hourly rate
- `isVerified`: Only verified sitters (true/false)
- `emergencyAvailable`: Emergency availability (true/false)
- `page`: Page number (default: 1)
- `pageSize`: Results per page (default: 20, max: 100)
- `sortBy`: Sort field (distance, rating, price, reviews)
- `sortDirection`: asc or desc

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "sitters": [
      {
        "id": "sitter-001",
        "user": {
          "firstName": "Sarah",
          "lastName": "Johnson",
          "profileImageUrl": "https://octopets.blob.core.windows.net/avatars/user-001.jpg"
        },
        "bio": "Experienced dog walker with 5+ years of pet care experience...",
        "location": {
          "city": "Seattle",
          "state": "WA",
          "distanceFromSearch": 2.3,
          "approximateLocation": {
            "latitude": 47.606,
            "longitude": -122.332
          }
        },
        "hourlyRate": 25.00,
        "isVerified": true,
        "isAvailableForEmergencies": true,
        "averageRating": 4.8,
        "totalReviews": 42,
        "completedBookings": 156,
        "responseTime": "Usually responds within 2 hours",
        "lastActiveAt": "2025-11-12T09:15:00Z",
        "petTypeSpecialties": [
          {
            "petType": {
              "id": "dog",
              "name": "Dog",
              "iconUrl": "https://octopets.blob.core.windows.net/icons/dog.svg"
            },
            "experienceYears": 5,
            "hasSpecialTraining": true
          }
        ],
        "servicesOffered": [
          {
            "id": "service-001",
            "serviceType": "dog-walking",
            "title": "Daily Dog Walking",
            "basePrice": 25.00,
            "pricingModel": "per-visit",
            "durationMinutes": 30,
            "averageRating": 4.9
          }
        ],
        "availability": {
          "hasAvailability": true,
          "nextAvailableDate": "2025-11-15",
          "availableSlots": [
            {
              "date": "2025-11-15",
              "startTime": "08:00",
              "endTime": "18:00",
              "availableHours": 8
            }
          ]
        },
        "recentReview": {
          "rating": 5,
          "comment": "Sarah took excellent care of Buddy. Highly recommend!",
          "reviewer": "John D.",
          "createdAt": "2025-11-10T14:20:00Z"
        },
        "badges": [
          "verified",
          "top-rated",
          "quick-responder",
          "emergency-available"
        ]
      }
    ],
    "pagination": {
      "totalCount": 156,
      "pageNumber": 1,
      "pageSize": 20,
      "totalPages": 8,
      "hasNextPage": true,
      "hasPreviousPage": false
    },
    "filters": {
      "appliedFilters": {
        "location": "Seattle, WA",
        "radius": 25,
        "petType": "dog",
        "serviceType": "dog-walking"
      },
      "availableFilters": {
        "petTypes": [
          {"id": "dog", "name": "Dog", "count": 145},
          {"id": "cat", "name": "Cat", "count": 89},
          {"id": "bird", "name": "Bird", "count": 12}
        ],
        "serviceTypes": [
          {"id": "dog-walking", "name": "Dog Walking", "count": 134},
          {"id": "pet-sitting", "name": "Pet Sitting", "count": 98},
          {"id": "pet-boarding", "name": "Pet Boarding", "count": 45}
        ],
        "priceRange": {
          "min": 15,
          "max": 75,
          "average": 32
        },
        "ratingDistribution": {
          "5": 89,
          "4": 45,
          "3": 18,
          "2": 3,
          "1": 1
        }
      }
    },
    "searchMetadata": {
      "searchId": "search-12345",
      "executionTimeMs": 245,
      "coordinates": {
        "latitude": 47.6062,
        "longitude": -122.3321
      },
      "suggestions": [
        "Try expanding radius to 50 miles for more results",
        "Consider cat sitters if your dog is cat-friendly"
      ]
    }
  }
}
```

---

## AI-Powered Search

### Intelligent Sitter Search
```http
POST /api/search/sitters/intelligent
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "query": "I need someone to walk my energetic golden retriever in downtown Seattle this weekend. He's 2 years old and needs lots of exercise.",
  "location": "Seattle, WA",
  "preferences": {
    "budget": "under-40",
    "priorities": ["experience", "availability", "reviews"],
    "petDetails": {
      "type": "dog",
      "breed": "Golden Retriever",
      "age": "2 years",
      "size": "large",
      "temperament": "energetic",
      "specialNeeds": []
    }
  },
  "dateRange": {
    "startDate": "2025-11-16",
    "endDate": "2025-11-17"
  }
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "sitter": {
          "id": "sitter-001",
          "user": {
            "firstName": "Sarah",
            "lastName": "Johnson"
          },
          "averageRating": 4.8,
          "specialties": ["Large breed dogs", "High-energy pets"],
          "location": {
            "distanceFromSearch": 1.2,
            "neighborhood": "Capitol Hill"
          }
        },
        "matchScore": 95,
        "matchReasons": [
          "Specializes in large breed dogs",
          "5+ years experience with energetic dogs", 
          "Available all requested dates",
          "Excellent reviews for Golden Retrievers",
          "Located in downtown area"
        ],
        "recommendedService": {
          "id": "service-005",
          "title": "Extended Exercise Walks",
          "duration": "60 minutes",
          "price": 35.00,
          "description": "Perfect for high-energy dogs needing extended exercise"
        },
        "availability": {
          "fullyAvailable": true,
          "suggestedSlots": [
            {
              "date": "2025-11-16",
              "startTime": "10:00",
              "endTime": "11:00"
            }
          ]
        }
      }
    ],
    "aiInsights": {
      "queryAnalysis": {
        "petType": "dog",
        "breed": "Golden Retriever",
        "size": "large", 
        "energyLevel": "high",
        "location": "downtown Seattle",
        "timeframe": "weekend",
        "serviceNeeds": ["walking", "exercise"]
      },
      "recommendations": [
        "Golden Retrievers typically need 60+ minutes of exercise daily",
        "Consider sitters with large dog experience",
        "Weekend slots tend to fill quickly - book early"
      ],
      "alternatives": [
        "If weekend unavailable, consider weekday morning walks",
        "Pet boarding might be good for very high energy dogs"
      ]
    },
    "searchMetadata": {
      "agentUsed": "sitter-search-agent",
      "processingTimeMs": 1250,
      "confidence": 0.92
    }
  }
}
```

---

## Advanced Search Features

### Search by Map Area
```http
POST /api/search/sitters/area
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "bounds": {
    "northEast": {
      "latitude": 47.6205,
      "longitude": -122.3047
    },
    "southWest": {
      "latitude": 47.5952,
      "longitude": -122.3595
    }
  },
  "filters": {
    "petType": "dog",
    "serviceType": "dog-walking",
    "minRating": 4.5,
    "isVerified": true
  },
  "dateRange": {
    "startDate": "2025-11-15",
    "endDate": "2025-11-17"
  }
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "sitters": [
      {
        "id": "sitter-001",
        "location": {
          "latitude": 47.6062,
          "longitude": -122.3321,
          "neighborhood": "Capitol Hill"
        },
        "user": {
          "firstName": "Sarah",
          "lastName": "J."
        },
        "averageRating": 4.8,
        "hourlyRate": 25.00,
        "isVerified": true,
        "availability": {
          "hasAvailability": true,
          "totalSlots": 6
        }
      }
    ],
    "mapData": {
      "clusters": [
        {
          "center": {
            "latitude": 47.6062,
            "longitude": -122.3321
          },
          "sitterCount": 15,
          "averageRating": 4.6,
          "priceRange": {
            "min": 20,
            "max": 40
          }
        }
      ],
      "heatmap": {
        "availabilityDensity": "high",
        "areas": [
          {
            "name": "Capitol Hill",
            "sitterCount": 23,
            "availability": "high"
          }
        ]
      }
    }
  }
}
```

---

## Saved Searches and Favorites

### Save Search
```http
POST /api/search/saves
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Weekend Dog Walking in Seattle",
  "searchCriteria": {
    "location": "Seattle, WA",
    "radius": 25,
    "petType": "dog",
    "serviceType": "dog-walking",
    "minRating": 4.0
  },
  "notificationSettings": {
    "enabled": true,
    "frequency": "weekly",
    "newSittersAlert": true,
    "priceChangeAlert": true
  }
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "savedSearch": {
      "id": "saved-search-123",
      "name": "Weekend Dog Walking in Seattle",
      "createdAt": "2025-11-12T10:30:00Z",
      "lastExecuted": "2025-11-12T10:30:00Z",
      "resultCount": 156
    }
  }
}
```

---

### Get Saved Searches
```http
GET /api/search/saves
Authorization: Bearer <access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "savedSearches": [
      {
        "id": "saved-search-123",
        "name": "Weekend Dog Walking in Seattle",
        "searchCriteria": {
          "location": "Seattle, WA",
          "petType": "dog",
          "serviceType": "dog-walking"
        },
        "resultCount": 156,
        "newResultsCount": 3,
        "lastExecuted": "2025-11-10T08:00:00Z",
        "notificationSettings": {
          "enabled": true,
          "frequency": "weekly"
        }
      }
    ]
  }
}
```

---

### Execute Saved Search
```http
POST /api/search/saves/{savedSearchId}/execute
Authorization: Bearer <access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "sitters": [
      // Same structure as regular search
    ],
    "changes": {
      "newSitters": 3,
      "unavailableSitters": 1,
      "priceChanges": [
        {
          "sitterId": "sitter-001",
          "oldPrice": 25.00,
          "newPrice": 30.00
        }
      ]
    }
  }
}
```

---

### Add Sitter to Favorites
```http
POST /api/search/favorites
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "sitterId": "sitter-001",
  "notes": "Great with energetic dogs, excellent communication"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "favorite": {
      "id": "fav-123",
      "sitterId": "sitter-001",
      "notes": "Great with energetic dogs, excellent communication",
      "addedAt": "2025-11-12T10:30:00Z"
    }
  }
}
```

---

### Get Favorite Sitters
```http
GET /api/search/favorites
Authorization: Bearer <access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "favorites": [
      {
        "id": "fav-123",
        "sitter": {
          "id": "sitter-001",
          "user": {
            "firstName": "Sarah",
            "lastName": "Johnson"
          },
          "averageRating": 4.8,
          "isVerified": true,
          "lastBookedAt": "2025-10-15T10:30:00Z",
          "totalBookingsWithUser": 5
        },
        "notes": "Great with energetic dogs, excellent communication",
        "addedAt": "2025-11-12T10:30:00Z",
        "currentAvailability": {
          "hasAvailability": true,
          "nextAvailableDate": "2025-11-15"
        }
      }
    ]
  }
}
```

---

## Search Suggestions and Autocomplete

### Location Autocomplete
```http
GET /api/search/locations/autocomplete?query=seat&limit=10
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "text": "Seattle, WA",
        "type": "city",
        "coordinates": {
          "latitude": 47.6062,
          "longitude": -122.3321
        },
        "sitterCount": 256
      },
      {
        "text": "Seatac, WA",
        "type": "city", 
        "coordinates": {
          "latitude": 47.4502,
          "longitude": -122.2985
        },
        "sitterCount": 45
      },
      {
        "text": "98101 (Seattle Downtown)",
        "type": "zipcode",
        "coordinates": {
          "latitude": 47.6097,
          "longitude": -122.3331
        },
        "sitterCount": 89
      }
    ]
  }
}
```

---

### Search Suggestions
```http
GET /api/search/suggestions?location=Seattle,WA
Authorization: Bearer <access_token> (optional)
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "suggestions": {
      "popularSearches": [
        {
          "query": "dog walking",
          "count": 1250,
          "averagePrice": 28.50
        },
        {
          "query": "pet sitting",
          "count": 890,
          "averagePrice": 45.00
        }
      ],
      "trendingServices": [
        {
          "serviceType": "overnight-care",
          "growth": "+15%",
          "reason": "Holiday season approaching"
        }
      ],
      "personalizedSuggestions": [
        {
          "text": "Search golden retriever specialists",
          "reason": "Based on your pet Buddy"
        },
        {
          "text": "Find weekend availability",
          "reason": "Your usual booking pattern"
        }
      ],
      "areaInsights": [
        {
          "neighborhood": "Capitol Hill",
          "insight": "High concentration of dog walkers",
          "averageResponse": "2 hours"
        },
        {
          "neighborhood": "Belltown", 
          "insight": "Premium services available",
          "averagePrice": 35.00
        }
      ]
    }
  }
}
```

---

## Search Analytics and Insights

### Get Search Analytics
```http
GET /api/search/analytics
Authorization: Bearer <access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "userSearchHistory": {
      "totalSearches": 45,
      "averageResultsViewed": 8,
      "mostSearchedLocation": "Seattle, WA",
      "favoriteServiceType": "dog-walking",
      "searchPatterns": {
        "timeOfDay": "morning",
        "dayOfWeek": "weekends",
        "advanceBooking": "3-7 days"
      }
    },
    "marketInsights": {
      "averagePricing": {
        "dogWalking": 28.50,
        "petSitting": 45.00,
        "petBoarding": 65.00
      },
      "availability": {
        "weekdays": "high",
        "weekends": "medium",
        "holidays": "low"
      },
      "popularTimes": [
        {
          "service": "dog-walking",
          "peakHours": ["8:00-10:00", "16:00-18:00"]
        }
      ]
    },
    "recommendations": [
      "Book weekend services 7+ days in advance",
      "Morning slots typically have better availability",
      "Consider recurring bookings for better rates"
    ]
  }
}
```

---

## Error Codes Reference

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_LOCATION` | Location format invalid or not found | 400 |
| `RADIUS_TOO_LARGE` | Search radius exceeds maximum (100 miles) | 400 |
| `INVALID_DATE_RANGE` | Start date after end date or dates in past | 400 |
| `INVALID_PET_TYPE` | Pet type not supported | 400 |
| `INVALID_SERVICE_TYPE` | Service type not supported | 400 |
| `SEARCH_TIMEOUT` | Search operation timed out | 504 |
| `TOO_MANY_RESULTS` | Results exceed system limits | 413 |
| `SAVED_SEARCH_LIMIT` | User exceeded saved search limit (10) | 429 |
| `FAVORITE_LIMIT` | User exceeded favorite sitter limit (50) | 429 |
| `AGENT_UNAVAILABLE` | AI search agent temporarily unavailable | 503 |
| `INVALID_MAP_BOUNDS` | Map area bounds invalid or too large | 400 |

---

## Rate Limiting

### Search Rate Limits

| Endpoint | Authenticated | Anonymous |
|----------|--------------|-----------|
| Basic search | 100/hour | 20/hour |
| AI search | 50/hour | 5/hour |
| Map search | 100/hour | 10/hour |
| Autocomplete | 500/hour | 100/hour |
| Save/favorites | 50/hour | N/A |

### Performance Optimization

- **Caching**: Search results cached for 5 minutes
- **Pagination**: Maximum 100 results per page
- **Debouncing**: Autocomplete queries debounced 300ms
- **Geographic indexing**: Spatial queries optimized for location
- **Agent fallback**: Basic search if AI unavailable

### Search Quality Metrics

- **Relevance scoring**: Combines distance, rating, availability, price
- **Personalization**: Based on user booking history and preferences  
- **A/B testing**: Continuous optimization of ranking algorithms
- **Feedback loop**: Click-through rates influence future rankings