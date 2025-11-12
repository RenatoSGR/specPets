# Messaging and Communication Contracts

**API Group**: Messaging and Communication  
**Base Path**: `/api/messages`  
**Version**: 1.0

---

## Real-time Messaging

### Send Message
```http
POST /api/messages
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "conversationId": "conv-123",
  "recipientId": "user-456", 
  "content": "Hi! I wanted to confirm the walk for Buddy tomorrow at 10 AM. Should I use the same route as last time?",
  "messageType": "text",
  "bookingId": "booking-12345",
  "attachments": [
    {
      "type": "image",
      "url": "https://octopets.blob.core.windows.net/messages/photo-123.jpg",
      "filename": "buddy_route_map.jpg",
      "size": 245760
    }
  ]
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "msg-789",
      "conversationId": "conv-123", 
      "senderId": "user-001",
      "recipientId": "user-456",
      "content": "Hi! I wanted to confirm the walk for Buddy tomorrow at 10 AM...",
      "messageType": "text",
      "bookingId": "booking-12345",
      "attachments": [
        {
          "id": "att-123",
          "type": "image",
          "url": "https://octopets.blob.core.windows.net/messages/photo-123.jpg",
          "filename": "buddy_route_map.jpg",
          "size": 245760,
          "thumbnailUrl": "https://octopets.blob.core.windows.net/messages/thumb-123.jpg"
        }
      ],
      "sentAt": "2025-11-14T10:30:00Z",
      "deliveredAt": null,
      "readAt": null,
      "status": "sent",
      "isEdited": false,
      "metadata": {
        "deviceType": "mobile",
        "platform": "ios"
      }
    }
  }
}
```

**Message Types**:
- `text`: Regular text message
- `image`: Image attachment
- `system`: System-generated message
- `booking-update`: Booking status change notification
- `location`: Live location sharing
- `quick-reply`: Predefined quick response

---

### Get Conversation
```http
GET /api/messages/conversations/{conversationId}?page=1&pageSize=50&before=2025-11-14T10:30:00Z
Authorization: Bearer <access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "conv-123",
      "participants": [
        {
          "userId": "user-001",
          "role": "pet-owner",
          "user": {
            "firstName": "John",
            "lastName": "Doe",
            "profileImageUrl": "https://octopets.blob.core.windows.net/avatars/user-001.jpg"
          },
          "lastActiveAt": "2025-11-14T10:30:00Z",
          "isOnline": true
        },
        {
          "userId": "user-456", 
          "role": "pet-sitter",
          "user": {
            "firstName": "Sarah",
            "lastName": "Johnson", 
            "profileImageUrl": "https://octopets.blob.core.windows.net/avatars/user-456.jpg"
          },
          "lastActiveAt": "2025-11-14T10:25:00Z",
          "isOnline": false
        }
      ],
      "bookingContext": {
        "bookingId": "booking-12345",
        "status": "confirmed",
        "service": {
          "title": "Daily Dog Walking",
          "startDateTime": "2025-11-15T10:00:00Z"
        },
        "pets": [
          {
            "name": "Buddy",
            "profileImageUrl": "https://octopets.blob.core.windows.net/pet-photos/buddy-001.jpg"
          }
        ]
      },
      "createdAt": "2025-11-12T10:30:00Z",
      "updatedAt": "2025-11-14T10:30:00Z",
      "isArchived": false,
      "isPinned": false
    },
    "messages": [
      {
        "id": "msg-789",
        "senderId": "user-001",
        "content": "Hi! I wanted to confirm the walk for Buddy tomorrow at 10 AM...",
        "messageType": "text",
        "attachments": [
          {
            "id": "att-123",
            "type": "image",
            "url": "https://octopets.blob.core.windows.net/messages/photo-123.jpg",
            "filename": "buddy_route_map.jpg",
            "thumbnailUrl": "https://octopets.blob.core.windows.net/messages/thumb-123.jpg"
          }
        ],
        "sentAt": "2025-11-14T10:30:00Z",
        "deliveredAt": "2025-11-14T10:30:15Z",
        "readAt": null,
        "status": "delivered",
        "isEdited": false,
        "reactions": [
          {
            "userId": "user-456",
            "emoji": "👍",
            "addedAt": "2025-11-14T10:31:00Z"
          }
        ]
      },
      {
        "id": "msg-788",
        "senderId": "user-456",
        "content": "Perfect! Same route works great. I'll text you when I arrive 😊",
        "messageType": "text",
        "sentAt": "2025-11-14T10:25:00Z",
        "deliveredAt": "2025-11-14T10:25:05Z", 
        "readAt": "2025-11-14T10:26:00Z",
        "status": "read",
        "isEdited": false
      },
      {
        "id": "msg-787",
        "senderId": "system",
        "content": "Booking confirmed for November 15, 2025 at 10:00 AM",
        "messageType": "system",
        "systemMessageType": "booking-confirmed",
        "sentAt": "2025-11-12T11:30:00Z",
        "metadata": {
          "bookingId": "booking-12345",
          "actionRequired": false
        }
      }
    ],
    "pagination": {
      "totalMessages": 12,
      "pageNumber": 1,
      "pageSize": 50,
      "hasNextPage": false,
      "hasUnreadMessages": true,
      "unreadCount": 2
    }
  }
}
```

---

### Get Conversations List
```http
GET /api/messages/conversations?status=active&unreadOnly=false&page=1&pageSize=20
Authorization: Bearer <access_token>
```

**Query Parameters**:
- `status`: `active`, `archived`, `all`
- `unreadOnly`: `true` to show only conversations with unread messages
- `bookingId`: Filter to specific booking conversation

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conv-123",
        "otherParticipant": {
          "userId": "user-456",
          "role": "pet-sitter", 
          "user": {
            "firstName": "Sarah",
            "lastName": "Johnson",
            "profileImageUrl": "https://octopets.blob.core.windows.net/avatars/user-456.jpg"
          },
          "isOnline": false,
          "lastActiveAt": "2025-11-14T10:25:00Z"
        },
        "bookingContext": {
          "bookingId": "booking-12345",
          "status": "confirmed",
          "service": "Daily Dog Walking",
          "startDateTime": "2025-11-15T10:00:00Z",
          "pets": ["Buddy"]
        },
        "lastMessage": {
          "id": "msg-789",
          "content": "Hi! I wanted to confirm the walk for Buddy tomorrow...",
          "messageType": "text",
          "senderId": "user-001",
          "sentAt": "2025-11-14T10:30:00Z",
          "isRead": false
        },
        "unreadCount": 2,
        "totalMessages": 12,
        "createdAt": "2025-11-12T10:30:00Z",
        "updatedAt": "2025-11-14T10:30:00Z",
        "isPinned": false,
        "priority": "normal"
      }
    ],
    "summary": {
      "totalConversations": 8,
      "unreadConversations": 3,
      "totalUnreadMessages": 7,
      "activeBookingConversations": 5
    },
    "pagination": {
      "totalCount": 8,
      "pageNumber": 1,
      "pageSize": 20,
      "totalPages": 1,
      "hasNextPage": false
    }
  }
}
```

---

### Mark Messages as Read
```http
PUT /api/messages/conversations/{conversationId}/read
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "messageIds": ["msg-789", "msg-788"],
  "readAt": "2025-11-14T10:35:00Z"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "markedAsRead": {
      "messageIds": ["msg-789", "msg-788"],
      "readAt": "2025-11-14T10:35:00Z",
      "conversationId": "conv-123"
    },
    "unreadCount": 0
  }
}
```

---

### Edit Message
```http
PUT /api/messages/{messageId}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "content": "Hi! I wanted to confirm the walk for Buddy tomorrow at 9:30 AM (updated time). Should I use the same route as last time?",
  "reason": "Time correction"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "msg-789",
      "content": "Hi! I wanted to confirm the walk for Buddy tomorrow at 9:30 AM (updated time)...",
      "isEdited": true,
      "editedAt": "2025-11-14T10:40:00Z",
      "editHistory": [
        {
          "originalContent": "Hi! I wanted to confirm the walk for Buddy tomorrow at 10 AM...",
          "editedAt": "2025-11-14T10:40:00Z",
          "reason": "Time correction"
        }
      ]
    }
  }
}
```

**Edit Rules**:
- Messages can only be edited within 15 minutes of sending
- Only text messages can be edited
- System messages cannot be edited
- Edit history is preserved

---

### Delete Message
```http
DELETE /api/messages/{messageId}
Authorization: Bearer <access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "msg-789",
      "content": "[Message deleted]",
      "isDeleted": true,
      "deletedAt": "2025-11-14T10:45:00Z",
      "deletedBy": "user-001"
    }
  }
}
```

**Delete Rules**:
- Messages can be deleted within 1 hour of sending
- Deleted messages show "[Message deleted]" placeholder
- Attachments are removed from storage
- Cannot delete system messages

---

## Live Updates and Real-time Features

### WebSocket Connection
```javascript
// Connect to messaging WebSocket
const socket = new WebSocket(`wss://octopets.com/ws/messages?token=${accessToken}`);

// Subscribe to conversation
socket.send(JSON.stringify({
  type: 'subscribe',
  conversationId: 'conv-123'
}));

// Receive real-time events
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch(data.type) {
    case 'message_received':
      // New message in conversation
      break;
    case 'message_read':
      // Message marked as read
      break;
    case 'user_typing':
      // Other user is typing
      break;
    case 'user_online':
      // User came online
      break;
  }
};
```

**WebSocket Events**:
- `message_received`: New message in subscribed conversation
- `message_read`: Message read status updated
- `message_edited`: Message content updated
- `message_deleted`: Message was deleted
- `user_typing`: Typing indicator
- `user_online`: User online status change
- `conversation_archived`: Conversation archived/unarchived

---

### Send Typing Indicator
```http
POST /api/messages/conversations/{conversationId}/typing
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "isTyping": true
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "typingStatus": {
      "userId": "user-001",
      "conversationId": "conv-123",
      "isTyping": true,
      "timestamp": "2025-11-14T10:50:00Z"
    }
  }
}
```

**Typing Rules**:
- Typing status expires after 10 seconds
- Multiple users can be typing simultaneously
- Typing indicator is cleared when message is sent

---

### Share Live Location
```http
POST /api/messages/conversations/{conversationId}/location
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "latitude": 47.6062,
  "longitude": -122.3321,
  "accuracy": 5,
  "duration": 30,
  "message": "On my way to pick up Buddy!"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "msg-790",
      "messageType": "location",
      "content": "On my way to pick up Buddy!",
      "location": {
        "latitude": 47.6062,
        "longitude": -122.3321,
        "accuracy": 5,
        "address": "123 Main St, Seattle, WA",
        "isLive": true,
        "expiresAt": "2025-11-15T10:30:00Z"
      },
      "sentAt": "2025-11-15T10:00:00Z"
    }
  }
}
```

---

## Quick Responses and Templates

### Get Quick Response Templates
```http
GET /api/messages/quick-responses?category=booking&role=sitter
Authorization: Bearer <access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "quickResponses": [
      {
        "id": "qr-001",
        "category": "booking",
        "trigger": "arrival",
        "text": "I've arrived and am ready to take {pet_name} for their walk!",
        "variables": ["pet_name"],
        "usage": "high"
      },
      {
        "id": "qr-002", 
        "category": "booking",
        "trigger": "completion",
        "text": "{pet_name} had a great time! They were well-behaved and enjoyed the walk. See you next time!",
        "variables": ["pet_name"],
        "usage": "high"
      },
      {
        "id": "qr-003",
        "category": "scheduling",
        "trigger": "acceptance", 
        "text": "Thanks for booking with me! I'm excited to take care of {pet_name}. I'll send you updates during the service.",
        "variables": ["pet_name"],
        "usage": "medium"
      },
      {
        "id": "qr-004",
        "category": "emergency",
        "trigger": "manual",
        "text": "I need to contact you immediately about {pet_name}. Please call me as soon as possible.",
        "variables": ["pet_name"],
        "usage": "low"
      }
    ],
    "customTemplates": [
      {
        "id": "custom-001",
        "text": "Running about 5 minutes late due to traffic. Will be there soon!",
        "createdBy": "user-456",
        "usage": "medium"
      }
    ]
  }
}
```

**Quick Response Categories**:
- `booking`: Booking-related responses
- `scheduling`: Scheduling and availability
- `emergency`: Emergency situations
- `general`: General communication
- `completion`: Service completion updates

---

### Send Quick Response
```http
POST /api/messages/conversations/{conversationId}/quick-response
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "quickResponseId": "qr-001",
  "variables": {
    "pet_name": "Buddy"
  },
  "additionalMessage": "Traffic is light so I might be a few minutes early!"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "msg-791",
      "content": "I've arrived and am ready to take Buddy for their walk! Traffic is light so I might be a few minutes early!",
      "messageType": "quick-reply",
      "quickResponseId": "qr-001",
      "sentAt": "2025-11-15T09:55:00Z"
    }
  }
}
```

---

## File and Media Sharing

### Upload Attachment
```http
POST /api/messages/attachments
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

file: <binary_data>
conversationId: conv-123
description: Photo of Buddy after his walk
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "attachment": {
      "id": "att-124",
      "url": "https://octopets.blob.core.windows.net/messages/photo-124.jpg",
      "filename": "buddy_happy.jpg",
      "size": 1048576,
      "contentType": "image/jpeg",
      "thumbnailUrl": "https://octopets.blob.core.windows.net/messages/thumb-124.jpg",
      "description": "Photo of Buddy after his walk",
      "uploadedAt": "2025-11-15T10:15:00Z",
      "expiresAt": "2026-11-15T10:15:00Z"
    }
  }
}
```

**Supported File Types**:
- **Images**: JPEG, PNG, GIF, WebP (max 10MB)
- **Documents**: PDF (max 25MB)
- **Videos**: MP4, MOV (max 100MB, 60 seconds)

**Security Features**:
- All uploads scanned for malware
- EXIF data stripped from images
- Videos automatically compressed
- Files encrypted at rest

---

### Get Conversation Media
```http
GET /api/messages/conversations/{conversationId}/media?type=images&page=1&pageSize=20
Authorization: Bearer <access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "media": [
      {
        "id": "att-124",
        "type": "image",
        "url": "https://octopets.blob.core.windows.net/messages/photo-124.jpg",
        "thumbnailUrl": "https://octopets.blob.core.windows.net/messages/thumb-124.jpg",
        "filename": "buddy_happy.jpg",
        "uploadedAt": "2025-11-15T10:15:00Z",
        "uploadedBy": {
          "userId": "user-456",
          "firstName": "Sarah"
        },
        "messageId": "msg-792",
        "description": "Photo of Buddy after his walk"
      }
    ],
    "pagination": {
      "totalCount": 15,
      "pageNumber": 1,
      "pageSize": 20,
      "totalPages": 1
    }
  }
}
```

---

## Conversation Management

### Archive Conversation
```http
PUT /api/messages/conversations/{conversationId}/archive
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "isArchived": true,
  "reason": "booking_completed"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "conv-123",
      "isArchived": true,
      "archivedAt": "2025-11-15T11:00:00Z",
      "archivedBy": "user-001",
      "reason": "booking_completed"
    }
  }
}
```

---

### Pin/Unpin Conversation
```http
PUT /api/messages/conversations/{conversationId}/pin
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "isPinned": true
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "conv-123",
      "isPinned": true,
      "pinnedAt": "2025-11-14T10:50:00Z"
    }
  }
}
```

---

### Block/Unblock User
```http
POST /api/messages/users/{userId}/block
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "reason": "inappropriate_behavior",
  "reportIncident": true,
  "details": "Sent inappropriate messages unrelated to pet care services"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "blockStatus": {
      "userId": "user-789",
      "isBlocked": true,
      "blockedAt": "2025-11-14T11:00:00Z",
      "reason": "inappropriate_behavior",
      "incidentReported": true
    }
  }
}
```

**Block Effects**:
- User cannot send new messages
- Existing conversations are hidden
- User cannot initiate new bookings
- Automatic incident report created

---

## Message Search and Filtering

### Search Messages
```http
GET /api/messages/search?query=walk&conversationId=conv-123&from=2025-11-01&to=2025-11-30&type=text
Authorization: Bearer <access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "message": {
          "id": "msg-789",
          "content": "Hi! I wanted to confirm the walk for Buddy tomorrow at 10 AM...",
          "sentAt": "2025-11-14T10:30:00Z",
          "sender": {
            "firstName": "John",
            "lastName": "Doe"
          }
        },
        "conversation": {
          "id": "conv-123",
          "otherParticipant": {
            "firstName": "Sarah",
            "lastName": "Johnson"
          }
        },
        "highlights": [
          "confirm the <mark>walk</mark> for Buddy"
        ]
      }
    ],
    "searchStats": {
      "totalResults": 8,
      "searchTime": "0.15s",
      "conversationsSearched": 3
    }
  }
}
```

---

## Notification Preferences

### Update Message Notifications
```http
PUT /api/messages/notifications/preferences
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "emailNotifications": {
    "newMessage": true,
    "missedMessage": true,
    "dailyDigest": false
  },
  "pushNotifications": {
    "newMessage": true,
    "messageRead": false,
    "typing": false
  },
  "quietHours": {
    "enabled": true,
    "startTime": "22:00",
    "endTime": "08:00",
    "timezone": "America/Los_Angeles"
  },
  "conversationSpecific": [
    {
      "conversationId": "conv-123",
      "priority": "high",
      "customSound": true
    }
  ]
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "preferences": {
      "emailNotifications": {
        "newMessage": true,
        "missedMessage": true,
        "dailyDigest": false
      },
      "pushNotifications": {
        "newMessage": true,
        "messageRead": false,
        "typing": false
      },
      "quietHours": {
        "enabled": true,
        "startTime": "22:00",
        "endTime": "08:00",
        "timezone": "America/Los_Angeles"
      },
      "updatedAt": "2025-11-14T11:00:00Z"
    }
  }
}
```

---

## System Messages

### System Message Types
- **`booking-created`**: New booking request sent
- **`booking-accepted`**: Sitter accepted booking
- **`booking-confirmed`**: Owner confirmed booking  
- **`booking-cancelled`**: Booking was cancelled
- **`booking-completed`**: Service completed
- **`payment-processed`**: Payment captured
- **`review-requested`**: Review reminder sent
- **`modification-requested`**: Booking change requested
- **`emergency-alert`**: Emergency during service

### System Message Format
```json
{
  "id": "msg-sys-001",
  "messageType": "system",
  "systemMessageType": "booking-accepted",
  "content": "Sarah accepted your booking request for November 15, 2025",
  "sentAt": "2025-11-12T11:15:00Z",
  "metadata": {
    "bookingId": "booking-12345",
    "actionRequired": true,
    "actionType": "confirm-booking",
    "actionUrl": "/bookings/booking-12345/confirm",
    "expiresAt": "2025-11-14T11:15:00Z"
  },
  "actions": [
    {
      "type": "confirm",
      "label": "Confirm Booking",
      "url": "/api/bookings/booking-12345/confirm",
      "method": "POST"
    },
    {
      "type": "cancel", 
      "label": "Cancel Request",
      "url": "/api/bookings/booking-12345/cancel",
      "method": "POST"
    }
  ]
}
```

---

## Error Codes Reference

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `CONVERSATION_NOT_FOUND` | Conversation does not exist or access denied | 404 |
| `MESSAGE_NOT_FOUND` | Message does not exist | 404 |
| `MESSAGE_EDIT_EXPIRED` | Cannot edit message after time limit | 409 |
| `MESSAGE_DELETE_DENIED` | Cannot delete message | 403 |
| `ATTACHMENT_TOO_LARGE` | File size exceeds limit | 413 |
| `UNSUPPORTED_FILE_TYPE` | File type not allowed | 415 |
| `UPLOAD_VIRUS_DETECTED` | Malware found in upload | 422 |
| `USER_BLOCKED` | Cannot message blocked user | 403 |
| `CONVERSATION_ARCHIVED` | Cannot send to archived conversation | 409 |
| `MESSAGE_QUOTA_EXCEEDED` | Daily message limit reached | 429 |
| `WEBSOCKET_AUTH_FAILED` | WebSocket authentication failed | 401 |

---

## Business Rules

### Message Delivery
- Messages delivered in real-time via WebSocket when possible
- Push notifications sent for offline users
- Email fallback for critical booking messages
- Message delivery guaranteed within 5 seconds

### Content Moderation
- Automatic content filtering for inappropriate language
- Image scanning for inappropriate content
- Manual review for reported messages
- Account suspension for repeated violations

### Data Retention
- Messages stored for 2 years after booking completion
- Deleted messages permanently removed after 30 days
- Attachments automatically deleted after 1 year
- User can request complete conversation export

### Privacy and Security
- End-to-end encryption for all messages
- Message content never stored in plaintext
- User blocking prevents all communication
- Admin users can access messages only for safety investigations

### Rate Limiting
- 100 messages per hour per conversation
- 10 file uploads per hour per user
- 5 location shares per hour per conversation
- WebSocket connections limited to 3 per user