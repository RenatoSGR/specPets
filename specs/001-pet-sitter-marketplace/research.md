# Research: Pet Sitter Marketplace Platform

**Date**: November 12, 2025  
**Feature**: 001-pet-sitter-marketplace  
**Research Scope**: Technical architecture decisions and implementation patterns

---

## Executive Summary

This research consolidates technical decisions for implementing a comprehensive pet sitter marketplace platform using .NET Aspire orchestration, multi-agent AI coordination, and modern web technologies. All decisions align with the Octopets constitution and leverage existing architectural patterns while extending functionality for marketplace operations.

---

## Azure AI Agent Architecture

### Decision: Multi-Agent Specialization with HTTP Coordination

**Rationale**: Implement specialized agents (sitter-search, booking-intelligence, orchestrator) following Microsoft Agent Framework patterns with FastAPI HTTP endpoints for inter-agent communication.

**Architecture Pattern**:
```python
# Sitter Search Agent - Specialized for sitter discovery and matching
class SitterSearchAgent:
    def __init__(self, client: AzureAIAgentClient):
        self.agent = ChatAgent(
            name="sitter-search-agent",
            instructions="Find and rank pet sitters based on location, pet type, and availability",
            tools=[search_sitters_tool, filter_by_availability_tool, calculate_distance_tool]
        )
    
    async def search_sitters(self, query: str, filters: dict) -> List[SitterMatch]:
        # Agent Framework integration with function tools
        pass

# Orchestrator Agent - Coordinates multi-agent workflows  
class OrchestratorAgent:
    def __init__(self):
        self.sitter_agent_url = os.getenv("SITTER_SEARCH_AGENT_URL")
        self.booking_agent_url = os.getenv("BOOKING_AGENT_URL")
        
    async def handle_complex_query(self, query: str) -> AgentResponse:
        # Delegate to specialized agents and synthesize responses
        pass
```

**Key Implementation Details**:
- **Authentication**: `DefaultAzureCredential` for Azure AI Foundry integration
- **Tool Configuration**: Vector stores for sitter data, function tools for booking logic
- **Health Checks**: `/health` endpoints for Aspire monitoring
- **Error Handling**: Structured logging with OpenTelemetry integration

**Alternatives Considered**:
- Single monolithic agent (rejected: lacks specialization, harder to scale)
- Direct database access from agents (rejected: violates separation of concerns)

---

## Entity Framework Core Data Architecture

### Decision: Domain-Driven Design with Marketplace-Specific Entities

**Rationale**: Implement comprehensive entity model supporting bidirectional marketplace operations with EF Core 9.0 advanced features.

**Core Entities**:
```csharp
public class PetSitter : BaseEntity
{
    public string UserId { get; set; } // Identity integration
    public string Bio { get; set; }
    public List<Service> ServicesOffered { get; set; }
    public List<PetType> PetTypesAccepted { get; set; }
    public LocationCoordinates Location { get; set; } // Complex type
    public List<Availability> AvailabilitySlots { get; set; }
    public List<Review> ReviewsReceived { get; set; }
    public decimal AverageRating { get; set; } // Calculated property
}

public class Booking : BaseEntity
{
    public string PetOwnerId { get; set; }
    public string PetSitterId { get; set; }
    public DateTimeRange ServicePeriod { get; set; } // Complex type
    public List<Pet> PetsInvolved { get; set; }
    public BookingStatus Status { get; set; }
    public decimal TotalCost { get; set; }
    public CancellationPolicy CancellationPolicy { get; set; }
}
```

**Key Design Patterns**:
- **Spatial Indexing**: Location-based sitter queries with PostGIS extensions
- **Composite Keys**: Prevent double-booking with availability constraints
- **Complex Types**: Value objects for addresses, coordinates, date ranges
- **Enumeration Mapping**: String storage for readable database values

**Database Optimization**:
- Clustered indexes on frequently queried columns (location, availability, rating)
- Partial indexes for active entities only
- Query projections to minimize data transfer

**Alternatives Considered**:
- NoSQL approach (rejected: complex relationships better suited to relational model)
- Microservice data isolation (rejected: adds complexity without clear benefit)

---

## React Frontend Architecture

### Decision: Feature-Based Architecture with Marketplace Workflows

**Rationale**: Organize components around marketplace user journeys with TypeScript for type safety and agent integration.

**Component Structure**:
```typescript
// Feature-based organization
src/
├── features/
│   ├── sitter-search/
│   │   ├── components/      # SitterCard, SearchFilters, SitterProfile
│   │   ├── hooks/          # useSearchSitters, useFilters
│   │   ├── services/       # sitterSearchService, agentIntegration
│   │   └── types/          # SitterSearchTypes
│   ├── booking/
│   │   ├── components/     # BookingForm, AvailabilityCalendar, BookingStatus  
│   │   ├── hooks/          # useBooking, useAvailability
│   │   └── services/       # bookingService
│   └── messaging/
│       ├── components/     # MessageThread, MessageComposer
│       ├── hooks/          # useMessages, useRealTime
│       └── services/       # messagingService
└── shared/
    ├── components/         # Button, Modal, LoadingSpinner
    ├── hooks/              # useAuth, useApi
    ├── services/           # apiClient, agentService
    └── types/              # SharedTypes
```

**Agent Integration Pattern**:
```typescript
// Agent service for AI-powered recommendations
class AgentService {
    async searchSittersWithAI(query: string, preferences: UserPreferences): Promise<SitterRecommendation[]> {
        const response = await this.http.post('/orchestrator/chat', {
            message: `Find pet sitters for: ${query}`,
            context: preferences
        });
        return response.data.recommendations;
    }
}

// React hook for agent integration
export const useAgentSearch = () => {
    const [recommendations, setRecommendations] = useState<SitterRecommendation[]>([]);
    const [loading, setLoading] = useState(false);
    
    const searchWithAI = useCallback(async (query: string) => {
        setLoading(true);
        const results = await agentService.searchSittersWithAI(query, userPreferences);
        setRecommendations(results);
        setLoading(false);
    }, [userPreferences]);
    
    return { recommendations, loading, searchWithAI };
};
```

**State Management**: React Context + useReducer for complex state, React Query for server state
**Testing Strategy**: Jest + React Testing Library for unit tests, Playwright for E2E marketplace workflows

**Alternatives Considered**:
- Redux/Zustand (rejected: React Context sufficient for marketplace complexity)
- Next.js (rejected: existing Aspire infrastructure, SSR not required)

---

## Mock Data Synchronization Strategy

### Decision: JSON-First with Generated Types and Seed Data

**Rationale**: Maintain constitutional requirement for frontend/backend mock data parity using shared JSON schemas with generated TypeScript types and C# seed data.

**Synchronization Pattern**:
```json
// data/sitters.json (source of truth)
{
  "sitters": [
    {
      "id": "sitter-001",
      "name": "Sarah Johnson",
      "bio": "Experienced dog walker with 5+ years",
      "location": {
        "lat": 40.7128,
        "lng": -74.0060,
        "address": "New York, NY"
      },
      "petTypesAccepted": ["dog", "cat"],
      "servicesOffered": [
        {
          "type": "dog-walking",
          "rate": 25.00,
          "duration": "30-minutes"
        }
      ]
    }
  ]
}
```

**Generated Artifacts**:
- **Frontend**: `npm run generate:types` → TypeScript interfaces
- **Backend**: `dotnet run generate:seeddata` → C# entity seed methods
- **Validation**: JSON schema validation in CI/CD pipeline

**Mock Data Toggle**:
```csharp
// AppHost configuration (constitutional requirement)
var useMockData = builder.ExecutionContext.IsPublishMode ? "false" : "true";
backend.WithEnvironment("USE_MOCK_DATA", useMockData);
frontend.WithEnvironment("REACT_APP_USE_MOCK_DATA", useMockData);
```

**Alternatives Considered**:
- Manual synchronization (rejected: error-prone, violates constitution)
- Database-first approach (rejected: breaks local development requirement)

---

## Booking System Architecture

### Decision: Event-Driven Booking with Status State Machine

**Rationale**: Implement robust booking lifecycle with clear state transitions, conflict prevention, and notification patterns.

**Booking State Machine**:
```csharp
public enum BookingStatus
{
    Pending,      // Initial request submitted
    Accepted,     // Sitter accepted the booking
    Declined,     // Sitter declined the booking
    Confirmed,    // Payment confirmed (future)
    InProgress,   // Service period started
    Completed,    // Service finished
    Cancelled     // Cancelled by either party
}

public class BookingStateMachine
{
    private static readonly Dictionary<BookingStatus, List<BookingStatus>> AllowedTransitions = new()
    {
        { BookingStatus.Pending, new() { BookingStatus.Accepted, BookingStatus.Declined, BookingStatus.Cancelled } },
        { BookingStatus.Accepted, new() { BookingStatus.Confirmed, BookingStatus.Cancelled } },
        { BookingStatus.Confirmed, new() { BookingStatus.InProgress, BookingStatus.Cancelled } },
        // ... additional transitions
    };
}
```

**Conflict Prevention**:
```sql
-- Availability constraint preventing double-booking
CREATE UNIQUE INDEX IX_Availability_SitterDate 
ON Availability (PetSitterId, AvailableDate) 
WHERE IsAvailable = 1;

-- Booking overlap prevention
CREATE INDEX IX_Booking_SitterDateRange 
ON Bookings (PetSitterId, StartDate, EndDate) 
WHERE Status IN ('Accepted', 'Confirmed', 'InProgress');
```

**Notification Architecture**:
- **Real-time**: SignalR for booking status updates
- **Email**: Background service for status change notifications
- **In-App**: Message system for booking-related communication

**Alternatives Considered**:
- Simple boolean status (rejected: insufficient for marketplace complexity)
- External payment processing (deferred: phase 2 requirement)

---

## Multi-Pet Type Support Strategy

### Decision: Flexible Pet Type System with Service Compatibility Matrix

**Rationale**: Support comprehensive pet types beyond dogs/cats with dynamic service-pet compatibility matching.

**Pet Type Architecture**:
```typescript
interface PetType {
    id: string;
    name: string;
    category: 'mammal' | 'bird' | 'reptile' | 'fish' | 'exotic';
    specialRequirements: SpecialRequirement[];
    compatibleServices: ServiceType[];
}

interface ServiceCompatibility {
    serviceType: string;
    petTypes: string[];
    requiresSpecialSkills: boolean;
    additionalRequirements?: string[];
}
```

**Service Matching Algorithm**:
```csharp
public class PetServiceMatcher
{
    public async Task<List<PetSitter>> FindCompatibleSitters(
        List<Pet> pets, 
        ServiceType serviceType, 
        Location location)
    {
        return await _context.PetSitters
            .Where(s => s.Location.IsWithinRadius(location, 25))
            .Where(s => pets.All(pet => 
                s.PetTypesAccepted.Any(accepted => accepted.IsCompatibleWith(pet.Type)) &&
                s.ServicesOffered.Any(service => service.IsCompatibleWith(pet.Type))))
            .OrderBy(s => s.Location.DistanceFrom(location))
            .ToListAsync();
    }
}
```

**Sitter Profile Configuration**:
- **Pet Type Selection**: Multi-select with category grouping
- **Service-Pet Matrix**: Dynamic compatibility grid in sitter onboarding
- **Skill Requirements**: Special certifications for exotic pet care

**Alternatives Considered**:
- Fixed dog/cat only (rejected: limits market differentiation)
- Unlimited custom pets (rejected: complexity without structure)

---

## Performance & Scalability Considerations

### Decision: Multi-Tier Caching with Geographic Partitioning

**Rationale**: Implement caching strategy for high-frequency operations while maintaining real-time availability accuracy.

**Caching Strategy**:
```csharp
public class SitterSearchService
{
    private readonly IMemoryCache _memoryCache;
    private readonly IDistributedCache _distributedCache;
    
    public async Task<List<SitterSearchResult>> SearchSitters(SearchCriteria criteria)
    {
        // L1: Memory cache for frequently accessed sitter profiles (5min TTL)
        var cacheKey = $"sitters:{criteria.GetHashCode()}";
        
        if (!_memoryCache.TryGetValue(cacheKey, out List<SitterSearchResult> results))
        {
            // L2: Redis distributed cache for search results (15min TTL)
            results = await _distributedCache.GetOrSetAsync(cacheKey, 
                () => _database.SearchSittersAsync(criteria), 
                TimeSpan.FromMinutes(15));
                
            _memoryCache.Set(cacheKey, results, TimeSpan.FromMinutes(5));
        }
        
        // Always fetch fresh availability data (cannot be cached)
        await EnrichWithRealTimeAvailability(results, criteria.DateRange);
        return results;
    }
}
```

**Database Optimization**:
- **Read Replicas**: Search queries directed to read replicas
- **Geographic Partitioning**: Sitter data partitioned by region
- **Connection Pooling**: Optimized for high concurrent search load

**CDN Strategy**:
- **Static Assets**: Sitter photos, profile images via Azure CDN
- **API Gateway**: Rate limiting and geographic routing

**Alternatives Considered**:
- Full-text search engine (deferred: start with SQL, evaluate Elasticsearch later)
- NoSQL for search (rejected: complex relationships in SQL, hybrid approach too complex)

---

## Security & Privacy Architecture

### Decision: Progressive Trust with Data Protection

**Rationale**: Implement security layers that protect user privacy while enabling marketplace functionality.

**Data Protection Strategy**:
```csharp
public class PrivacyService
{
    // Progressive disclosure - exact address only after booking confirmed
    public SitterPublicProfile GetPublicProfile(PetSitter sitter, User requester)
    {
        return new SitterPublicProfile
        {
            Name = sitter.Name,
            Bio = sitter.Bio,
            ApproximateLocation = sitter.Location.Approximate(radius: 1.0), // 1-mile radius
            Rating = sitter.AverageRating,
            ReviewCount = sitter.Reviews.Count,
            // Exact address hidden until booking confirmed
        };
    }
    
    public SitterDetailedProfile GetDetailedProfile(PetSitter sitter, Booking confirmedBooking)
    {
        return new SitterDetailedProfile
        {
            // ... public profile data
            ExactAddress = sitter.Location.ExactAddress, // Only after booking
            Phone = sitter.ContactInfo.Phone,
            AdditionalInstructions = sitter.SpecialInstructions
        };
    }
}
```

**Authentication & Authorization**:
- **ASP.NET Core Identity**: User management with email verification
- **Role-Based Access**: Owner/Sitter/Admin role separation  
- **JWT Tokens**: Stateless authentication for API and agent access
- **Azure AD Integration**: Optional enterprise SSO for future

**Data Validation**:
- **Input Validation**: FluentValidation for all API inputs
- **XSS Prevention**: Content Security Policy, input sanitization
- **CSRF Protection**: Anti-forgery tokens on state-changing operations

**Alternatives Considered**:
- OAuth-only authentication (rejected: email/password simplifies onboarding)
- Microservice per entity (rejected: adds complexity without clear security benefit)

---

## Testing Strategy

### Decision: Pyramid Testing with Marketplace Workflow Focus

**Rationale**: Comprehensive testing strategy emphasizing critical marketplace workflows while maintaining development velocity.

**Testing Pyramid**:
```csharp
// Unit Tests (70% of coverage)
[Fact]
public async Task SearchSitters_WithLocationFilter_ReturnsNearbyResults()
{
    // Arrange
    var mockRepository = new Mock<ISitterRepository>();
    var service = new SitterSearchService(mockRepository.Object);
    
    // Act
    var results = await service.SearchNearby(location: "Seattle", radiusMiles: 10);
    
    // Assert
    Assert.All(results, r => Assert.True(r.DistanceFromLocation <= 10));
}
```

```typescript
// Frontend Component Tests
describe('SitterSearchForm', () => {
    test('submits search with proper filters', async () => {
        const mockSearchFn = jest.fn();
        render(<SitterSearchForm onSearch={mockSearchFn} />);
        
        await user.type(screen.getByLabelText(/location/i), 'Seattle');
        await user.selectOptions(screen.getByLabelText(/pet type/i), 'dog');
        await user.click(screen.getByRole('button', { name: /search/i }));
        
        expect(mockSearchFn).toHaveBeenCalledWith({
            location: 'Seattle',
            petTypes: ['dog'],
            radius: 25
        });
    });
});
```

**Integration Tests (20% of coverage)**:
- API endpoint tests with in-memory database
- Agent integration tests with mock responses
- Authentication flow testing

**End-to-End Tests (10% of coverage)**:
```typescript
// Critical marketplace workflows
test('complete booking workflow', async ({ page }) => {
    await page.goto('/search');
    await page.fill('[data-testid=location-input]', 'Seattle');
    await page.selectOption('[data-testid=pet-type]', 'dog');
    await page.click('[data-testid=search-button]');
    
    await page.click('[data-testid=sitter-card]'); // First result
    await page.click('[data-testid=request-booking]');
    await page.fill('[data-testid=start-date]', '2025-12-01');
    await page.fill('[data-testid=end-date]', '2025-12-03');
    await page.click('[data-testid=submit-request]');
    
    await expect(page.locator('[data-testid=booking-success]')).toBeVisible();
});
```

**Agent Testing Strategy**:
```python
# Agent unit tests with mocked Azure AI
@pytest.mark.asyncio
async def test_sitter_search_agent():
    mock_client = MagicMock()
    agent = SitterSearchAgent(mock_client)
    
    result = await agent.search_sitters("dog sitter in Seattle")
    
    assert len(result.sitters) > 0
    assert all(s.location.city == "Seattle" for s in result.sitters)
```

**Alternatives Considered**:
- Manual testing only (rejected: marketplace complexity requires automation)
- Full E2E coverage (rejected: slow feedback loop, maintenance overhead)

---

## Deployment & Infrastructure

### Decision: .NET Aspire with Azure Container Apps

**Rationale**: Leverage existing Aspire infrastructure for seamless deployment to Azure Container Apps with minimal configuration.

**Aspire Deployment Configuration**:
```csharp
// apphost/Program.cs additions for marketplace
var builder = DistributedApplication.CreateBuilder(args);

// New marketplace agents
var sitterSearchAgent = builder.AddPythonScript("sitter-search-agent", 
    "../sitter-search-agent", "app.py")
    .WithUvEnvironment()
    .WithEnvironment("AZURE_OPENAI_ENDPOINT", builder.Configuration["AZURE_OPENAI_ENDPOINT"])
    .PublishAsDockerFile();

var bookingAgent = builder.AddPythonScript("booking-agent",
    "../booking-agent", "app.py")
    .WithUvEnvironment()
    .WithReference(sitterSearchAgent)
    .PublishAsDockerFile();

// Enhanced orchestrator
var orchestrator = builder.AddPythonScript("orchestrator-agent",
    "../orchestrator-agent", "app.py")
    .WithUvEnvironment()
    .WithReference(sitterSearchAgent)
    .WithReference(bookingAgent)
    .PublishAsDockerFile();

// Enhanced backend with marketplace features
var backend = builder.AddProject<Projects.Backend>("backend")
    .WithReference(orchestrator)
    .WithEnvironment("ConnectionStrings__DefaultConnection", 
        builder.ExecutionContext.IsPublishMode ? 
            builder.Configuration["AZURE_SQL_CONNECTION"] : 
            "Server=(localdb)\\mssqllocaldb;Database=OctopetsMarketplace;Trusted_Connection=true");
```

**Production Environment**:
- **Azure Container Apps**: Auto-scaling for web traffic and agent load
- **Azure SQL Database**: Managed database with geo-redundancy
- **Application Insights**: Distributed tracing and performance monitoring
- **Azure CDN**: Global content delivery for static assets

**CI/CD Pipeline**:
```yaml
# .github/workflows/deploy.yml
name: Deploy Marketplace
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      - run: |
          cd apphost
          azd deploy --environment production
```

**Alternatives Considered**:
- Kubernetes deployment (rejected: Aspire provides simpler path to Container Apps)
- VM-based deployment (rejected: container approach more maintainable)

---

## Conclusion

This research provides comprehensive technical decisions for implementing a production-ready pet sitter marketplace platform that extends the existing Octopets architecture. All decisions align with the constitutional requirements while addressing the specific needs of marketplace operations including multi-agent AI coordination, comprehensive pet type support, and scalable booking systems.

**Next Steps**: Proceed to Phase 1 design with detailed data models, API contracts, and implementation guidance based on these research findings.