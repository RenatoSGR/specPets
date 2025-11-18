# Data Model: Pet Sitter Marketplace

**Feature**: 001-pet-sitter-marketplace  
**Date**: October 21, 2025  
**Status**: Phase 1 Design Output

## Entity Relationship Diagram

```mermaid
erDiagram
    PetOwner ||--o{ Pet : owns
    PetOwner ||--o{ Booking : requests
    PetOwner ||--o{ Review : writes
    
    PetSitter ||--o{ Service : offers
    PetSitter ||--o{ Availability : manages
    PetSitter ||--o{ Booking : receives
    PetSitter ||--o{ Review : receives
    
    Booking ||--o{ Message : contains
    Booking }o--|| Service : for
    Booking }o--|| PetOwner : from
    Booking }o--|| PetSitter : to
    Booking ||--o| Review : generates
    
    Review }o--|| PetOwner : by
    Review }o--o| PetSitter : about
    Review }o--o| Listing : about
    Review }o--o| Booking : for
    
    PetOwner {
        int Id PK
        string Email UK
        string Name
        string Phone
        string Address
        string City
        string State
        string ZipCode
        datetime CreatedAt
    }
    
    Pet {
        int Id PK
        int PetOwnerId FK
        string Name
        string Type
        string Breed
        int Age
        string SpecialNeeds
        string BehavioralNotes
    }
    
    PetSitter {
        int Id PK
        string Email UK
        string Name
        string Phone
        string Bio
        string Address
        string City
        string State
        string ZipCode
        double Latitude
        double Longitude
        decimal HourlyRate
        json Photos
        json PetTypesAccepted
        json Skills
        datetime CreatedAt
        int ProfileCompleteness
    }
    
    Service {
        int Id PK
        int PetSitterId FK
        string Name
        string Description
        decimal Price
        string PriceUnit
    }
    
    Availability {
        int Id PK
        int PetSitterId FK
        datetime StartDate
        datetime EndDate
        bool IsAvailable
    }
    
    Booking {
        int Id PK
        int PetOwnerId FK
        int PetSitterId FK
        int ServiceId FK
        json PetIds
        datetime StartDate
        datetime EndDate
        decimal TotalCost
        enum Status
        string StatusReason
        datetime CreatedAt
        datetime AcceptedAt
        datetime CompletedAt
        datetime CancelledAt
    }
    
    Message {
        int Id PK
        int BookingId FK
        int SenderId
        string SenderType
        string Content
        datetime SentAt
        bool IsRead
    }
    
    Review {
        int Id PK
        int ListingId FK "nullable"
        int PetSitterId FK "nullable"
        int PetOwnerId FK
        int BookingId FK "nullable"
        int Rating
        string Comment
        datetime CreatedAt
    }
```

## Entity Definitions

### PetOwner

Represents individuals seeking pet sitting services.

**Fields**:
- `Id` (int, PK): Unique identifier
- `Email` (string, UK, required): Login email, unique constraint
- `Name` (string, required): Full name
- `Phone` (string): Contact phone number
- `Address` (string): Street address
- `City` (string): City name
- `State` (string): State/province code
- `ZipCode` (string): Postal code
- `CreatedAt` (datetime): Account creation timestamp

**Relationships**:
- Has many `Pet` (one-to-many)
- Has many `Booking` (one-to-many)
- Has many `Review` as author (one-to-many)

**Validation Rules**:
- Email: Valid format, unique across system
- Name: 2-100 characters
- Phone: Optional, US phone format if provided
- ZipCode: Required for location-based search

**State Transitions**: N/A (simple CRUD entity)

---

### Pet

Represents animals requiring care.

**Fields**:
- `Id` (int, PK): Unique identifier
- `PetOwnerId` (int, FK, required): Owner reference
- `Name` (string, required): Pet's name
- `Type` (string, required): Species (Dog, Cat, Bird, Reptile, etc.)
- `Breed` (string): Breed information
- `Age` (int): Age in years
- `SpecialNeeds` (string): Medical requirements, allergies
- `BehavioralNotes` (string): Temperament, training notes

**Relationships**:
- Belongs to `PetOwner` (many-to-one)
- Referenced by `Booking.PetIds` (logical many-to-many via JSON array)

**Validation Rules**:
- Name: 1-50 characters
- Type: Must match predefined list or "Other"
- Age: 0-50 years
- SpecialNeeds: Max 500 characters
- BehavioralNotes: Max 1000 characters

---

### PetSitter

Represents individuals offering pet sitting services.

**Fields**:
- `Id` (int, PK): Unique identifier
- `Email` (string, UK, required): Login email, unique constraint
- `Name` (string, required): Full name
- `Phone` (string, required): Contact phone number
- `Bio` (string, required): Profile description (min 50 characters per spec)
- `Address` (string): Street address (not displayed until booking confirmed)
- `City` (string, required): City for display and search
- `State` (string, required): State/province code
- `ZipCode` (string, required): Postal code for geolocation
- `Latitude` (double, required): Geocoded latitude
- `Longitude` (double, required): Geocoded longitude
- `HourlyRate` (decimal): Default hourly rate
- `Photos` (JSON array): Profile photo URLs (min 1 required per spec)
- `PetTypesAccepted` (JSON array): List of pet types (e.g., ["Dog", "Cat"])
- `Skills` (JSON array): Certifications, special skills
- `CreatedAt` (datetime): Account creation timestamp
- `ProfileCompleteness` (int): Calculated 0-100% completeness score

**Relationships**:
- Has many `Service` (one-to-many)
- Has many `Availability` (one-to-many)
- Has many `Booking` (one-to-many)
- Has many `Review` as subject (one-to-many)

**Validation Rules**:
- Bio: 50-2000 characters (constitution requirement)
- Photos: At least 1 photo URL (constitution requirement)
- Latitude/Longitude: Valid WGS84 coordinates
- ProfileCompleteness: Auto-calculated (bio filled, photo uploaded, service defined, pricing set)
- PetTypesAccepted: At least one type selected
- Skills: Max 20 items

**State Transitions**: N/A (simple CRUD entity)

**Derived Fields**:
- `AverageRating`: Calculated from `Review.Rating` where `PetSitterId = this.Id`
- `ReviewCount`: Count of reviews received
- `DistanceFrom(lat, lon)`: Calculated using Haversine formula

---

### Service

Represents specific service offerings by pet sitters.

**Fields**:
- `Id` (int, PK): Unique identifier
- `PetSitterId` (int, FK, required): Sitter reference
- `Name` (string, required): Service name (e.g., "Overnight Stay", "Dog Walking")
- `Description` (string): Detailed service description
- `Price` (decimal, required): Service cost
- `PriceUnit` (string, required): Pricing basis ("hour", "day", "visit")

**Relationships**:
- Belongs to `PetSitter` (many-to-one)
- Referenced by `Booking` (one-to-many)

**Validation Rules**:
- Name: 3-100 characters
- Price: > 0
- PriceUnit: Must be "hour", "day", or "visit"
- Description: Max 500 characters

**Common Service Types** (suggested, not enforced):
- Overnight Stay (priced per day)
- Daily Visit (priced per visit)
- Dog Walking (priced per hour or visit)
- Medication Administration (priced per visit)
- Pet Transportation (priced per trip)

---

### Availability

Represents sitter availability calendar.

**Fields**:
- `Id` (int, PK): Unique identifier
- `PetSitterId` (int, FK, required): Sitter reference
- `StartDate` (datetime, required): Availability period start
- `EndDate` (datetime, required): Availability period end
- `IsAvailable` (bool, required): True = available, False = blocked

**Relationships**:
- Belongs to `PetSitter` (many-to-one)

**Validation Rules**:
- StartDate < EndDate
- No overlapping availability records for same sitter
- Dates cannot be in the past (for new records)

**Business Logic**:
- Default: Sitters are available for all dates (no records = available)
- Blocked dates: Create `IsAvailable=false` record
- Explicit availability: Create `IsAvailable=true` record (optional, for clarity)
- Booking acceptance: Auto-creates `IsAvailable=false` record for booking dates

---

### Booking

Represents a pet sitting service request/reservation.

**Fields**:
- `Id` (int, PK): Unique identifier
- `PetOwnerId` (int, FK, required): Requesting owner
- `PetSitterId` (int, FK, required): Target sitter
- `ServiceId` (int, FK, required): Selected service
- `PetIds` (JSON array): List of pet IDs included in booking
- `StartDate` (datetime, required): Booking start date/time
- `EndDate` (datetime, required): Booking end date/time
- `TotalCost` (decimal, required): Calculated total (auto-calculated from service price and duration)
- `Status` (enum BookingStatus, required): Current booking state
- `StatusReason` (string): Optional reason for status changes (e.g., cancellation reason)
- `CreatedAt` (datetime): Request submission timestamp
- `AcceptedAt` (datetime, nullable): When sitter accepted
- `CompletedAt` (datetime, nullable): When service completed
- `CancelledAt` (datetime, nullable): When booking cancelled

**BookingStatus Enum**:
```csharp
public enum BookingStatus
{
    Pending,              // Initial state after owner requests
    Accepted,             // Sitter accepted request
    Declined,             // Sitter declined request
    InProgress,           // Service currently being performed
    Completed,            // Service finished
    CancelledByOwner,     // Owner cancelled
    CancelledBySitter     // Sitter cancelled
}
```

**Relationships**:
- Belongs to `PetOwner` (many-to-one)
- Belongs to `PetSitter` (many-to-one)
- Belongs to `Service` (many-to-one)
- Has many `Message` (one-to-many)
- Has one `Review` (one-to-one, optional)

**Validation Rules**:
- StartDate < EndDate
- StartDate must be in future (at creation)
- PetIds: At least 1 pet ID
- TotalCost: Auto-calculated, read-only
- Status transitions: See state machine below

**State Transitions**:
```
Pending → Accepted (sitter accepts)
Pending → Declined (sitter declines)
Accepted → InProgress (start date reached)
Accepted → CancelledByOwner (owner cancels)
Accepted → CancelledBySitter (sitter cancels)
InProgress → Completed (end date reached + manual confirmation)
Completed → [terminal state, can add Review]
CancelledByOwner → [terminal state]
CancelledBySitter → [terminal state]
Declined → [terminal state]
```

**Business Rules**:
- Cannot accept if sitter has conflicting Accepted/InProgress booking for same dates
- Cancellation policy: Applied in StatusReason field (e.g., "48+ hours notice - full refund")
- Messages only available for Pending, Accepted, InProgress bookings
- Review only available after Completed status

---

### Message

Represents communication between pet owner and sitter within a booking context.

**Fields**:
- `Id` (int, PK): Unique identifier
- `BookingId` (int, FK, required): Associated booking
- `SenderId` (int, required): User ID of sender (PetOwner.Id or PetSitter.Id)
- `SenderType` (string, required): "Owner" or "Sitter"
- `Content` (string, required): Message text
- `SentAt` (datetime, required): Timestamp
- `IsRead` (bool, required): Read receipt status

**Relationships**:
- Belongs to `Booking` (many-to-one)

**Validation Rules**:
- Content: 1-2000 characters
- SenderType: Must be "Owner" or "Sitter"
- SenderId: Must correspond to booking's PetOwnerId or PetSitterId
- Booking.Status: Must be Pending, Accepted, or InProgress (no messages after completion/cancellation)

**Business Logic**:
- Messages grouped by BookingId in UI
- Notifications triggered on new message (polling-based in MVP)
- Read receipts update via separate API call
- Soft delete only (retain for dispute resolution)

---

### Review

Extended entity supporting both venue reviews (existing) and sitter reviews (new).

**Fields**:
- `Id` (int, PK): Unique identifier
- `ListingId` (int, FK, nullable): For venue reviews (existing functionality)
- `PetSitterId` (int, FK, nullable): For sitter reviews (NEW)
- `PetOwnerId` (int, FK, required): Reviewer (NEW)
- `BookingId` (int, FK, nullable): Associated booking (NEW)
- `Rating` (int, required): 1-5 stars
- `Comment` (string, required): Review text
- `CreatedAt` (datetime): Submission timestamp

**Relationships**:
- Belongs to `Listing` (many-to-one, optional)
- Belongs to `PetSitter` (many-to-one, optional)
- Belongs to `PetOwner` (many-to-one)
- Belongs to `Booking` (one-to-one, optional)

**Validation Rules**:
- Rating: 1-5 integer
- Comment: 10-2000 characters
- Constraint: Either ListingId or PetSitterId must be populated (not both, not neither)
- BookingId: Must reference Completed booking
- One review per booking (unique constraint on BookingId)

**Business Logic**:
- Only pet owners who completed bookings can review sitters
- Reviews appear on sitter profile after submission
- Average rating calculated: `AVG(Rating) WHERE PetSitterId = X`
- Reviews cannot be edited after 7 days (business rule)
- Moderation flag for inappropriate content (future enhancement)

---

## Relationships Summary

### One-to-Many Relationships
- `PetOwner` → `Pet`
- `PetOwner` → `Booking`
- `PetOwner` → `Review`
- `PetSitter` → `Service`
- `PetSitter` → `Availability`
- `PetSitter` → `Booking`
- `PetSitter` → `Review` (as subject)
- `Booking` → `Message`
- `Service` → `Booking`

### One-to-One Relationships
- `Booking` → `Review` (optional, only after completion)

### Many-to-Many Relationships
- `Booking` ↔ `Pet` (via `Booking.PetIds` JSON array)
  - Implementation: Denormalized JSON array for simplicity in MVP
  - Future: Can normalize to `BookingPet` junction table if complex queries needed

---

## Indexing Strategy

### Primary Indexes (Auto-created)
- All `Id` fields (PK clustered indexes)

### Foreign Key Indexes (Recommended)
- `Pet.PetOwnerId`
- `Service.PetSitterId`
- `Availability.PetSitterId`
- `Booking.PetOwnerId`
- `Booking.PetSitterId`
- `Booking.ServiceId`
- `Message.BookingId`
- `Review.ListingId`
- `Review.PetSitterId`
- `Review.PetOwnerId`
- `Review.BookingId`

### Query Optimization Indexes
- `PetSitter` (Latitude, Longitude): Spatial index for distance queries (future with PostGIS)
- `PetSitter` (City, State): Text index for location search
- `Booking` (StartDate, EndDate, Status): Range queries for availability checks
- `Booking` (Status, CreatedAt): Dashboard queries
- `Review` (PetSitterId, CreatedAt): Sitter profile reviews
- `Message` (BookingId, SentAt): Message threading
- `Availability` (PetSitterId, StartDate, EndDate): Calendar queries

---

## Data Integrity Constraints

### Unique Constraints
- `PetOwner.Email`
- `PetSitter.Email`
- `Review.BookingId` (one review per booking)

### Check Constraints
- `Review.Rating` BETWEEN 1 AND 5
- `Service.Price` > 0
- `Booking.StartDate` < `Booking.EndDate`
- `Availability.StartDate` < `Availability.EndDate`
- `PetSitter.ProfileCompleteness` BETWEEN 0 AND 100
- `Review` CHECK (`ListingId IS NOT NULL` OR `PetSitterId IS NOT NULL`)
- `Review` CHECK (NOT (`ListingId IS NOT NULL` AND `PetSitterId IS NOT NULL`))

### Cascading Delete Rules
- `PetOwner` deleted → Cascade delete `Pet`, set null on `Booking`, retain `Review`
- `PetSitter` deleted → Cascade delete `Service`, `Availability`, retain `Booking` (historical), retain `Review`
- `Booking` deleted → Cascade delete `Message`, set null on `Review`
- `Service` deleted → Block if active/pending bookings exist

---

## Mock Data Requirements

Per constitution, mock data MUST be synchronized across:

1. **Source JSON**: `/data/pet-owner.json`, `/data/pet-sitter.json`, `/data/booking.json`
2. **Frontend**: `frontend/src/data/*.ts` TypeScript interfaces
3. **Backend**: `backend/Data/AppDbContext.cs` seed data

**Minimum Mock Records**:
- 5 Pet Owners (with 1-3 pets each)
- 10 Pet Sitters (varied locations, services, availability)
- 15 Bookings (mix of Pending, Accepted, Completed, Cancelled)
- 20 Messages (across multiple bookings)
- 8 Reviews (mix of ratings 2-5 stars)
- 12 Services (varied types and prices)
- 20 Availability periods (some blocked, some available)

**Edge Cases to Include**:
- Sitter with no reviews (new profile)
- Owner with multiple pets (large dog + small cat)
- Overlapping booking dates (to test conflict detection)
- Cancelled booking with reason
- Booking with messages but no review
- Sitter with 100% profile completeness
- Sitter with <50% profile completeness (missing photos or bio)

---

## Migration Path from Existing Schema

The current Octopets database includes:
- `Listing` (pet venues) - NO CHANGES NEEDED
- `Review` (venue reviews) - EXTEND with nullable foreign keys

**Migration Steps**:

1. **Add new tables**: PetOwner, Pet, PetSitter, Service, Availability, Booking, Message
2. **Alter Review table**: Add nullable `PetSitterId`, `PetOwnerId`, `BookingId` columns
3. **Add check constraint**: Review must reference either Listing or PetSitter
4. **Seed new data**: Run seed data script for marketplace entities
5. **Test backward compatibility**: Ensure existing venue/listing functionality unchanged

**EF Core Migration Commands**:
```bash
cd backend
dotnet ef migrations add AddPetSitterMarketplace
dotnet ef database update
```

---

## Phase 1 Completion

✅ **Data model defined**: All entities with fields, relationships, validation rules  
✅ **State transitions documented**: Booking status state machine  
✅ **Indexing strategy**: Performance optimization for key queries  
✅ **Mock data requirements**: Synchronization rules and edge cases  
✅ **Migration path**: Integration with existing schema  

**Next**: Generate API contracts in `contracts/` directory (OpenAPI specifications).
