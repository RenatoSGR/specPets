# API Contracts: Pet Sitter Marketplace Platform

**Date**: November 12, 2025  
**Feature**: 001-pet-sitter-marketplace  
**Phase**: 1 - Design & Contracts  
**Data Model Reference**: data-model.md

---

## API Architecture Overview

### Base URL Structure
- **Development**: `http://localhost:5000/api`
- **Production**: `https://octopets-api.azurecontainerapps.io/api`

### Authentication
- **Method**: JWT Bearer tokens via ASP.NET Core Identity
- **Header**: `Authorization: Bearer <token>`
- **Refresh**: Automatic refresh handling in frontend

### Response Format
All API responses follow consistent envelope pattern:
```json
{
  "success": true,
  "data": { /* response data */ },
  "error": null,
  "timestamp": "2025-11-12T10:30:00Z",
  "requestId": "req-12345"
}
```

### Error Handling
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "One or more validation errors occurred",
    "details": [
      {
        "field": "email",
        "message": "Email address is required"
      }
    ]
  },
  "timestamp": "2025-11-12T10:30:00Z",
  "requestId": "req-12345"
}
```

---

## Contract Files

This directory contains the following API contract specifications:

1. **auth-contracts.md** - Authentication and user management
2. **sitter-contracts.md** - Pet sitter profiles and services
3. **search-contracts.md** - Sitter search and discovery
4. **booking-contracts.md** - Booking creation and management
5. **messaging-contracts.md** - Communication system
6. **admin-contracts.md** - Administrative functions

---

## Common Data Types

### Location Types
```typescript
interface LocationCoordinates {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface LocationSearch {
  query: string;           // "Seattle, WA" or "98101"
  radiusMiles: number;    // Default: 25
  coordinates?: {
    lat: number;
    lng: number;
  };
}
```

### Pet Types
```typescript
interface Pet {
  id: string;
  name: string;
  petType: {
    id: string;
    name: string;
    category: 'mammal' | 'bird' | 'reptile' | 'fish' | 'exotic';
  };
  breed?: string;
  ageMonths: number;
  weightPounds: number;
  specialNeeds?: string;
  photoUrl?: string;
}

interface PetType {
  id: string;
  name: string;
  category: string;
  isCommonPet: boolean;
  requiresSpecialLicense: boolean;
  iconUrl?: string;
}
```

### Booking Types
```typescript
interface BookingRequest {
  petSitterId: string;
  serviceId: string;
  startDateTime: string;    // ISO 8601
  endDateTime: string;      // ISO 8601
  petIds: string[];
  specialInstructions?: string;
}

interface Booking {
  id: string;
  petOwner: UserProfile;
  petSitter: PetSitterProfile;
  service: ServiceDetails;
  pets: Pet[];
  startDateTime: string;
  endDateTime: string;
  status: BookingStatus;
  totalCost: number;
  specialInstructions?: string;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
}

type BookingStatus = 
  | 'pending' 
  | 'accepted' 
  | 'declined' 
  | 'confirmed' 
  | 'in-progress' 
  | 'completed' 
  | 'cancelled';
```

### Pagination
```typescript
interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface PaginationRequest {
  page?: number;          // Default: 1
  pageSize?: number;      // Default: 20, Max: 100
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
```

---

## Rate Limiting

### Standard Limits
- **Anonymous**: 100 requests per hour
- **Authenticated**: 1000 requests per hour  
- **Premium Sitters**: 5000 requests per hour

### Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1699891200
```

---

## API Versioning

### Strategy
- **Header-based versioning**: `Accept: application/json; version=1.0`
- **Current version**: 1.0
- **Deprecated endpoint notification**: `Warning: 299 - "Deprecated API"`

### Version Support Policy
- **Current version**: Fully supported with new features
- **Previous version**: Bug fixes only for 6 months
- **Sunset policy**: 12 months notice for major version changes

---

## OpenAPI Specification

### Swagger Documentation
- **Development**: `http://localhost:5000/swagger`
- **Staging**: Available via basic auth
- **Production**: Admin access only

### API Testing
- **Scalar UI**: `http://localhost:5000/scalar/v1`
- **Postman Collection**: Available in `/docs` directory
- **Integration Tests**: Automated via GitHub Actions

---

## Security Considerations

### Input Validation
- All inputs validated using FluentValidation
- SQL injection protection via parameterized queries
- XSS prevention through output encoding
- File upload restrictions (images only, max 5MB)

### CORS Policy
```json
{
  "origins": [
    "http://localhost:3000",
    "https://octopets.azurestaticapps.net"
  ],
  "methods": ["GET", "POST", "PUT", "DELETE"],
  "headers": ["Authorization", "Content-Type", "Accept"],
  "credentials": true
}
```

### Content Security Policy
```
default-src 'self'; 
img-src 'self' data: https://octopets.blob.core.windows.net;
script-src 'self'; 
style-src 'self' 'unsafe-inline';
```

---

## Monitoring & Observability

### Health Checks
- **Endpoint**: `GET /health`
- **Response**: Service status, database connectivity, external dependencies

### Logging
- **Structured logging** via Serilog
- **Correlation IDs** for request tracing
- **Performance metrics** for slow queries

### Metrics
- **Application Insights** integration
- **Custom metrics**: Booking success rate, search performance
- **Alerts**: Error rate thresholds, performance degradation

---

## Testing Strategy

### Contract Testing
- **OpenAPI validation** for request/response schemas
- **Consumer-driven contracts** for agent integration
- **Backward compatibility** verification

### Load Testing
- **Baseline**: 100 concurrent users
- **Peak**: 1000 concurrent users during high-traffic periods
- **Soak testing**: 24-hour sustained load

---

## Development Guidelines

### API Design Principles
1. **RESTful conventions** with clear resource naming
2. **Consistent error responses** across all endpoints
3. **Idempotent operations** where applicable
4. **Optimistic concurrency** using ETags
5. **Graceful degradation** for non-essential features

### Breaking Change Policy
- **Additive changes**: New optional fields, new endpoints
- **Non-breaking**: Extending enums, adding optional parameters
- **Breaking changes**: Field removal, type changes, endpoint removal
- **Migration path**: Version overlap period with deprecation warnings

---

## Agent Integration

### AI Agent Endpoints
All agent services expose consistent HTTP endpoints:

```typescript
interface AgentRequest {
  message: string;
  context?: Record<string, any>;
  sessionId?: string;
}

interface AgentResponse {
  message: string;
  confidence: number;
  suggestions?: string[];
  actions?: AgentAction[];
}
```

### Agent Coordination
- **Orchestrator**: Routes complex queries to specialized agents
- **Circuit breaker**: Fallback to basic search if agents unavailable
- **Async processing**: Long-running agent queries via background jobs

---

This contracts overview provides the foundation for all marketplace API interactions. Refer to individual contract files for detailed endpoint specifications.