# Authentication & User Management Contracts

**API Group**: Authentication  
**Base Path**: `/api/auth`  
**Version**: 1.0

---

## Authentication Flow

### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "phoneNumber": "555-0101",
  "agreeToTerms": true
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-12345",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "555-0101",
      "profileImageUrl": null,
      "createdAt": "2025-11-12T10:30:00Z",
      "isActive": true,
      "isPetSitter": false
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "rt_a1b2c3d4e5f6g7h8i9j0",
    "expiresAt": "2025-11-12T14:30:00Z"
  },
  "timestamp": "2025-11-12T10:30:00Z"
}
```

**Validation Rules**:
- `firstName`: Required, 2-100 characters
- `lastName`: Required, 2-100 characters  
- `email`: Required, valid email format, unique
- `password`: Required, 8+ chars, 1 upper, 1 lower, 1 number, 1 special
- `phoneNumber`: Optional, valid US phone format
- `agreeToTerms`: Required, must be true

**Error Responses**:
```json
// 400 Bad Request - Validation Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Registration validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email address is already registered"
      },
      {
        "field": "password", 
        "message": "Password must contain at least one uppercase letter"
      }
    ]
  }
}

// 429 Too Many Requests
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many registration attempts. Please try again in 15 minutes."
  }
}
```

---

### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "rememberMe": true
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-12345",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "profileImageUrl": "https://octopets.blob.core.windows.net/avatars/user-12345.jpg",
      "isPetSitter": true,
      "sitterProfile": {
        "id": "sitter-67890",
        "isVerified": true,
        "averageRating": 4.8,
        "totalReviews": 42
      }
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "rt_a1b2c3d4e5f6g7h8i9j0",
    "expiresAt": "2025-11-12T14:30:00Z"
  }
}
```

**Error Responses**:
```json
// 401 Unauthorized - Invalid Credentials
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}

// 423 Locked - Account Locked
{
  "success": false,
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Account locked due to too many failed login attempts. Please reset your password."
  }
}
```

---

### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "rt_a1b2c3d4e5f6g7h8i9j0"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "rt_x9y8z7w6v5u4t3s2r1q0",
    "expiresAt": "2025-11-12T18:30:00Z"
  }
}
```

---

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refreshToken": "rt_a1b2c3d4e5f6g7h8i9j0"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "Successfully logged out"
  }
}
```

---

## Password Management

### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john.doe@example.com"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "Password reset instructions sent to your email if the account exists"
  }
}
```

**Note**: Always returns 200 to prevent email enumeration attacks.

---

### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePassword123!"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "Password successfully reset"
  }
}
```

**Error Responses**:
```json
// 400 Bad Request - Invalid Token
{
  "success": false,
  "error": {
    "code": "INVALID_RESET_TOKEN",
    "message": "Password reset token is invalid or has expired"
  }
}
```

---

### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePassword123!"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "Password successfully changed"
  }
}
```

---

## User Profile Management

### Get Current User Profile
```http
GET /api/auth/profile
Authorization: Bearer <access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-12345",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "555-0101",
      "profileImageUrl": "https://octopets.blob.core.windows.net/avatars/user-12345.jpg",
      "createdAt": "2025-10-15T10:30:00Z",
      "lastLoginAt": "2025-11-12T09:15:00Z",
      "isActive": true,
      "isPetSitter": true,
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
          "photoUrl": "https://octopets.blob.core.windows.net/pets/pet-001.jpg"
        }
      ],
      "sitterProfile": {
        "id": "sitter-67890",
        "bio": "Experienced dog walker with 5+ years of pet care",
        "isVerified": true,
        "averageRating": 4.8,
        "totalReviews": 42,
        "location": {
          "city": "Seattle",
          "state": "WA"
        }
      }
    }
  }
}
```

---

### Update User Profile
```http
PUT /api/auth/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "firstName": "Jonathan",
  "lastName": "Doe",
  "phoneNumber": "555-0199"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-12345",
      "firstName": "Jonathan",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "555-0199",
      "updatedAt": "2025-11-12T10:45:00Z"
    }
  }
}
```

**Validation Rules**:
- Only firstName, lastName, and phoneNumber can be updated
- Email changes require separate verification flow
- Profile image updates use separate endpoint

---

### Upload Profile Image
```http
POST /api/auth/profile/image
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

[Form data with 'image' file field]
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "profileImageUrl": "https://octopets.blob.core.windows.net/avatars/user-12345.jpg",
    "updatedAt": "2025-11-12T10:50:00Z"
  }
}
```

**Constraints**:
- Max file size: 5MB
- Allowed formats: JPG, PNG, WebP
- Images automatically resized to 512x512 pixels

---

### Delete Account
```http
DELETE /api/auth/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "password": "CurrentPassword123!",
  "confirmDeletion": true,
  "reason": "No longer need the service"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "Account successfully deleted",
    "effectiveDate": "2025-11-19T10:00:00Z"
  }
}
```

**Notes**:
- 7-day grace period before permanent deletion
- Active bookings prevent immediate deletion
- Data retention for legal/audit purposes

---

## Email Verification

### Send Verification Email
```http
POST /api/auth/verify-email/send
Authorization: Bearer <access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "Verification email sent",
    "canResendAt": "2025-11-12T10:35:00Z"
  }
}
```

---

### Verify Email
```http
POST /api/auth/verify-email/confirm
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "token": "verification_token_from_email"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "Email successfully verified",
    "user": {
      "id": "user-12345",
      "email": "john.doe@example.com",
      "emailVerified": true,
      "emailVerifiedAt": "2025-11-12T11:00:00Z"
    }
  }
}
```

---

## Security Endpoints

### Check Email Availability
```http
GET /api/auth/check-email?email=john.doe@example.com
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "available": false,
    "suggestions": [
      "john.doe1@example.com",
      "j.doe@example.com"
    ]
  }
}
```

---

### Get User Sessions
```http
GET /api/auth/sessions
Authorization: Bearer <access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session-001",
        "device": "Chrome on Windows",
        "location": "Seattle, WA",
        "ipAddress": "192.168.1.100",
        "lastActivity": "2025-11-12T11:00:00Z",
        "isCurrentSession": true
      },
      {
        "id": "session-002",
        "device": "Mobile Safari on iPhone",
        "location": "Seattle, WA",
        "ipAddress": "192.168.1.101",
        "lastActivity": "2025-11-11T15:30:00Z",
        "isCurrentSession": false
      }
    ]
  }
}
```

---

### Revoke Session
```http
DELETE /api/auth/sessions/{sessionId}
Authorization: Bearer <access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "Session successfully revoked"
  }
}
```

---

## Error Codes Reference

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_FAILED` | Request validation errors | 400 |
| `INVALID_CREDENTIALS` | Wrong email/password | 401 |
| `ACCOUNT_LOCKED` | Account locked due to failed attempts | 423 |
| `EMAIL_NOT_VERIFIED` | Email verification required | 403 |
| `ACCOUNT_DISABLED` | Account disabled by admin | 403 |
| `PASSWORD_EXPIRED` | Password change required | 403 |
| `TOKEN_EXPIRED` | Access token expired | 401 |
| `INVALID_REFRESH_TOKEN` | Refresh token invalid | 401 |
| `RATE_LIMITED` | Too many requests | 429 |
| `EMAIL_ALREADY_EXISTS` | Email already registered | 409 |
| `INVALID_RESET_TOKEN` | Password reset token invalid | 400 |
| `FILE_TOO_LARGE` | Uploaded file exceeds size limit | 413 |
| `UNSUPPORTED_FILE_TYPE` | Invalid file type for upload | 415 |

---

## Rate Limiting

### Limits by Endpoint

| Endpoint | Limit | Window |
|----------|--------|---------|
| `POST /register` | 5 attempts | 15 minutes |
| `POST /login` | 10 attempts | 15 minutes |
| `POST /forgot-password` | 3 attempts | 1 hour |
| `POST /verify-email/send` | 5 attempts | 1 hour |
| General authenticated | 1000 requests | 1 hour |
| General anonymous | 100 requests | 1 hour |

### Headers
All auth endpoints include rate limit headers:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1699891200
X-RateLimit-Type: login
```

---

## Security Notes

### JWT Token Structure
```json
{
  "sub": "user-12345",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "role": "user",
  "isPetSitter": true,
  "iat": 1699887600,
  "exp": 1699891200,
  "iss": "octopets-api",
  "aud": "octopets-web"
}
```

### Security Headers
All responses include:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### CORS Configuration
```json
{
  "origins": [
    "http://localhost:3000",
    "https://octopets.azurestaticapps.net"
  ],
  "methods": ["GET", "POST", "PUT", "DELETE"],
  "credentials": true,
  "maxAge": 86400
}
```