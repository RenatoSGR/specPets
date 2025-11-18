# Research: Pet Sitter Marketplace

**Feature**: Pet Sitter Marketplace  
**Phase**: 0 - Research & Unknowns Resolution  
**Date**: October 21, 2025

## Overview

This document resolves unknowns identified in Technical Context and Constitution Check sections of plan.md. Research focuses on: (1) AI model selection for sitter matching, (2) entity structure for marketplace domain models, (3) integration patterns with existing Octopets architecture.

---

## Research Tasks

### 1. AI Model Selection for Sitter Matching Agent

**Unknown**: Which AI model(s) should be used for intelligent sitter matching and recommendations?

**Decision**: Use **gpt-4.1-mini** from GitHub Models for development, **gpt-4.1** for production via Azure AI Foundry

**Rationale**:
- **gpt-4.1-mini** offers excellent balance of cost ($0.7 per 1M tokens), quality (0.8066 quality index), and throughput (125.04 tokens/sec)
- Outperforms gpt-4o-mini in coding and instruction following, critical for function calling in Agent Framework
- GitHub Models provides free tier for development with single endpoint (https://models.github.ai/inference/)
- Production can seamlessly transition to Azure AI Foundry deployment of same model family
- Multi-agent orchestration benefits from consistent model across agents
- Long context window (1M input, 33K output) supports detailed sitter profiles and booking history

**Alternatives Considered**:
- **o3-mini**: Higher quality (0.8658) but significantly more expensive ($1.925/1M tokens) and reasoning-focused; overkill for recommendation tasks
- **Phi-4-mini-instruct**: Cheaper ($0.1312/1M tokens) but lower quality (0.4429); may struggle with nuanced matching logic
- **gpt-5-mini**: Newer but still preview; prefer stable gpt-4.1 family for production marketplace

**Implementation Notes**:
- Use Mi    figuration to switch between GitHub Models (dev) and Azure AI Foundry (prod)
- Configure in AppHost.cs using `IsPublishMode` to select endpoint
- Both sitter-agent and orchestrator-agent should use same model for consistency

---

### 2. Entity Structure for Marketplace Domain Models

**Unknown**: What is the detailed structure for PetOwner, PetSitter, Booking, Message, Service, and Availability entities?

**Decision**: Define entities following EF Core navigation properties pattern with appropriate relationships

#### PetOwner Entity

```csharp
public class PetOwner
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    
    // Navigation properties
    public List<Pet> Pets { get; set; } = new();
    public List<Booking> Bookings { get; set; } = new();
    public List<Review> ReviewsWritten { get; set; } = new();
}

public class Pet
{
    public int Id { get; set; }
    public int PetOwnerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // Dog, Cat, Bird, etc.
    public string Breed { get; set; } = string.Empty;
    public int Age { get; set; }
    public string SpecialNeeds { get; set; } = string.Empty;
    public string BehavioralNotes { get; set; } = string.Empty;
    
    // Navigation
    public PetOwner Owner { get; set; } = null!;
}
```

#### PetSitter Entity

```csharp
public class PetSitter
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public decimal HourlyRate { get; set; }
    public List<string> Photos { get; set; } = new(); // URLs
    public List<string> PetTypesAccepted { get; set; } = new();
    public List<string> Skills { get; set; } = new(); // Certifications, specialties
    public DateTime CreatedAt { get; set; }
    public int ProfileCompleteness { get; set; } // 0-100%
    
    // Navigation properties
    public List<Service> Services { get; set; } = new();
    public List<Availability> AvailabilityPeriods { get; set; } = new();
    public List<Booking> Bookings { get; set; } = new();
    public List<Review> ReviewsReceived { get; set; } = new();
}

public class Service
{
    public int Id { get; set; }
    public int PetSitterId { get; set; }
    public string Name { get; set; } = string.Empty; // "Overnight Stay", "Daily Visit", etc.
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string PriceUnit { get; set; } = "hour"; // hour, day, visit
    
    // Navigation
    public PetSitter Sitter { get; set; } = null!;
}

public class Availability
{
    public int Id { get; set; }
    public int PetSitterId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsAvailable { get; set; } // true = available, false = blocked
    
    // Navigation
    public PetSitter Sitter { get; set; } = null!;
}
```

#### Booking Entity

```csharp
public class Booking
{
    public int Id { get; set; }
    public int PetOwnerId { get; set; }
    public int PetSitterId { get; set; }
    public int ServiceId { get; set; }
    public List<int> PetIds { get; set; } = new();
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalCost { get; set; }
    public BookingStatus Status { get; set; }
    public string StatusReason { get; set; } = string.Empty; // For cancellations
    public DateTime CreatedAt { get; set; }
    public DateTime? AcceptedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    
    // Navigation properties
    public PetOwner Owner { get; set; } = null!;
    public PetSitter Sitter { get; set; } = null!;
    public Service Service { get; set; } = null!;
    public List<Message> Messages { get; set; } = new();
}

public enum BookingStatus
{
    Pending,
    Accepted,
    Declined,
    InProgress,
    Completed,
    CancelledByOwner,
    CancelledBySitter
}
```

#### Message Entity

```csharp
public class Message
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public int SenderId { get; set; }
    public string SenderType { get; set; } = string.Empty; // "Owner" or "Sitter"
    public string Content { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }
    public bool IsRead { get; set; }
    
    // Navigation
    public Booking Booking { get; set; } = null!;
}
```

#### Review Entity (Extension of Existing)

```csharp
// Extend existing Review model
public class Review
{
    public int Id { get; set; }
    public int ListingId { get; set; } // Existing - for venue reviews
    public int? PetSitterId { get; set; } // NEW - for sitter reviews
    public int PetOwnerId { get; set; } // NEW - reviewer
    public int? BookingId { get; set; } // NEW - associated booking
    public int Rating { get; set; } // 1-5 stars
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    
    // Navigation properties
    public Listing? Listing { get; set; } // Existing
    public PetSitter? Sitter { get; set; } // NEW
    public PetOwner Owner { get; set; } = null!; // NEW
    public Booking? Booking { get; set; } // NEW
}
```

**Rationale**:
- Follows existing Octopets entity patterns (navigation properties, EF Core conventions)
- Separates concerns: Pet data distinct from owner, services distinct from sitter
- Supports all functional requirements from spec
- Enables efficient querying for search (indexed location fields) and calendar (availability entities)
- Review entity extended to support both venue and sitter reviews with nullable foreign keys

**Implementation Notes**:
- Add entities to `backend/Models/` directory
- Register in `AppDbContext.cs` DbSet properties
- Create repositories following existing `IListingRepository` pattern
- Seed mock data in `AppDbContext.cs` SeedData method matching `/data/*.json` structure

---

### 3. Mock Data Synchronization Pattern

**Unknown**: How should mock data be synchronized across `/data`, frontend, and backend?

**Decision**: Use `/data` JSON files as single source of truth, convert to TypeScript interfaces and C# seed data

**Pattern**:

1. **Source of Truth**: Create JSON files in `/data` directory:
   - `data/pet-owner.json` - Array of pet owner objects with nested pets
   - `data/pet-sitter.json` - Array of sitter objects with services and availability
   - `data/booking.json` - Array of booking objects with references to owners/sitters

2. **Frontend Sync**: Convert JSON to TypeScript interfaces in `frontend/src/data/`:
   ```typescript
   // petSitterData.ts
   export interface PetSitter {
     id: number;
     email: string;
     name: string;
     // ... match JSON structure exactly
   }
   
   export const mockPetSitters: PetSitter[] = require('../../../data/pet-sitter.json');
   ```

3. **Backend Sync**: Add seed data to `AppDbContext.cs`:
   ```csharp
   protected override void OnModelCreating(ModelBuilder modelBuilder)
   {
       // Read from /data JSON files during development
       var sitterJson = File.ReadAllText("../data/pet-sitter.json");
       var sitters = JsonSerializer.Deserialize<List<PetSitter>>(sitterJson);
       modelBuilder.Entity<PetSitter>().HasData(sitters);
   }
   ```

4. **Validation**: Create script `.specify/scripts/validate-mock-data.sh` to verify:
   - JSON schema matches TypeScript interfaces
   - Backend seed data matches JSON structure
   - Foreign key references are valid
   - Required fields populated

**Rationale**:
- Single source of truth prevents divergence
- JSON format easy to edit and review
- Automatic sync during build/startup
- Validation script catches mismatches early
- Follows existing pattern from `data/listing.json`

**Implementation Notes**:
- Create JSON files with 5-10 mock records each for testing
- Include edge cases (sitters with no reviews, owners with multiple pets, overlapping bookings)
- Toggle controlled by `REACT_APP_USE_MOCK_DATA` (frontend) and in-memory DB (backend)
- AppHost sets mock data flag: dev=true, production=false

---

### 4. Geographic Search Implementation

**Unknown**: How should geographic distance calculation be implemented for sitter search?

**Decision**: Use Haversine formula for distance calculation, in-memory LINQ filtering for development

**Implementation**:

```csharp
// backend/Services/GeoLocationService.cs
public class GeoLocationService
{
    private const double EarthRadiusMiles = 3959.0;
    
    public double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);
        
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return EarthRadiusMiles * c;
    }
    
    private double ToRadians(double degrees) => degrees * (Math.PI / 180);
}

// Usage in search endpoint
var sitters = await repository.GetAllAsync();
var results = sitters
    .Select(s => new {
        Sitter = s,
        Distance = geoService.CalculateDistance(searchLat, searchLon, s.Latitude, s.Longitude)
    })
    .Where(x => x.Distance <= radiusMiles)
    .OrderBy(x => x.Distance)
    .ToList();
```

**Rationale**:
- Haversine formula accurate for distances up to ~100 miles (sufficient for local search)
- In-memory calculation acceptable for MVP scale (hundreds of sitters)
- Future: Can optimize with spatial indexes in Azure SQL or Cosmos DB if needed
- No external geocoding API required during development (use pre-computed lat/lon in mock data)

**Alternatives Considered**:
- Azure Maps API: Adds external dependency, unnecessary for MVP
- PostGIS/SQL Server spatial types: Overkill for in-memory database
- Simple zip code radius: Less accurate, harder to maintain zip code database

---

### 5. Booking Double-Booking Prevention

**Unknown**: How should the system prevent double-booking when multiple owners request the same sitter for overlapping dates?

**Decision**: Use optimistic concurrency check at booking acceptance time with availability query

**Implementation**:

```csharp
// backend/Repositories/BookingRepository.cs
public async Task<bool> AcceptBookingAsync(int bookingId)
{
    var booking = await GetByIdAsync(bookingId);
    if (booking == null || booking.Status != BookingStatus.Pending)
        return false;
    
    // Check for conflicting accepted bookings
    var hasConflict = await _context.Bookings
        .AnyAsync(b => 
            b.PetSitterId == booking.PetSitterId &&
            b.Status == BookingStatus.Accepted &&
            b.StartDate < booking.EndDate &&
            b.EndDate > booking.StartDate);
    
    if (hasConflict)
    {
        booking.Status = BookingStatus.Declined;
        booking.StatusReason = "Dates no longer available";
        await _context.SaveChangesAsync();
        return false;
    }
    
    booking.Status = BookingStatus.Accepted;
    booking.AcceptedAt = DateTime.UtcNow;
    await _context.SaveChangesAsync();
    return true;
}
```

**Rationale**:
- Check at acceptance time (not request time) allows sitters to review multiple requests
- In-memory database with single instance eliminates race conditions
- Explicit conflict check prevents double-booking logic errors
- Declined bookings inform owners immediately why request was rejected

**Future Considerations**:
- Production: Add database-level unique constraint or transaction isolation
- Notification: Send real-time updates to other pending requests when booking accepted

---

### 6. Message Threading and Notification Pattern

**Unknown**: How should in-platform messaging be implemented with real-time notifications?

**Decision**: REST API for message CRUD, polling for notifications (initial), SignalR for future real-time

**Implementation**:

```csharp
// backend/Endpoints/MessageEndpoints.cs
public static void MapMessageEndpoints(this WebApplication app)
{
    var group = app.MapGroup("/api/messages").WithTags("Messages");
    
    // Get messages for a booking
    group.MapGet("/{bookingId}", async (int bookingId, IMessageRepository repo) =>
    {
        var messages = await repo.GetByBookingIdAsync(bookingId);
        return Results.Ok(messages);
    });
    
    // Send a message
    group.MapPost("/", async (CreateMessageRequest req, IMessageRepository repo) =>
    {
        var message = new Message
        {
            BookingId = req.BookingId,
            SenderId = req.SenderId,
            SenderType = req.SenderType,
            Content = req.Content,
            SentAt = DateTime.UtcNow,
            IsRead = false
        };
        
        await repo.CreateAsync(message);
        return Results.Created($"/api/messages/{message.Id}", message);
    });
    
    // Get unread message count
    group.MapGet("/unread/{userId}", async (int userId, string userType, IMessageRepository repo) =>
    {
        var count = await repo.GetUnreadCountAsync(userId, userType);
        return Results.Ok(new { count });
    });
}
```

**Frontend Polling**:
```typescript
// frontend/src/hooks/useMessagePolling.ts
export function useMessagePolling(userId: number, userType: string) {
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await fetch(`/api/messages/unread/${userId}?userType=${userType}`);
      const data = await response.json();
      setUnreadCount(data.count);
    }, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, [userId, userType]);
  
  return { unreadCount };
}
```

**Rationale**:
- REST API simple to implement and test
- Polling sufficient for MVP (30s latency acceptable per success criteria: <1min)
- No additional infrastructure required (SignalR adds websocket complexity)
- Clear upgrade path: Add SignalR in future for real-time notifications without changing API contracts

**Alternatives Considered**:
- SignalR immediately: Adds complexity, overkill for MVP
- Server-sent events (SSE): Not well supported in all browsers, harder to scale
- Long polling: More complex than simple polling, marginal benefit

---

## Research Summary

All unknowns identified in plan.md have been resolved:

✅ **AI Model Selection**: gpt-4.1-mini (dev) / gpt-4.1 (prod) via GitHub Models → Azure AI Foundry  
✅ **Entity Structure**: Complete C# entity definitions for all marketplace models  
✅ **Mock Data Sync**: JSON source of truth with validation script  
✅ **Geographic Search**: Haversine formula with in-memory LINQ filtering  
✅ **Double-Booking Prevention**: Optimistic concurrency check at acceptance time  
✅ **Messaging Pattern**: REST API with polling notifications, SignalR upgrade path  

**Next Steps**: Proceed to Phase 1 (Design & Contracts) to create:
- `data-model.md` with full entity relationship diagrams
- OpenAPI contracts in `contracts/` directory
- `quickstart.md` for development setup
- Agent context updates

**Architecture Compatibility**: All decisions comply with Octopets constitution:
- Use existing patterns (minimal APIs, repository pattern, mock data sync)
- No hardcoded URLs or ports
- Aspire orchestration maintained
- Multi-agent architecture compatible with enhancements
- Mock data synchronized per requirements
