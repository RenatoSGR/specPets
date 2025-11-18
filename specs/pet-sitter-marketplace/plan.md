# Implementation Plan: Pet Sitter Marketplace

**Branch**: `001-pet-sitter-marketplace` | **Date**: October 21, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-pet-sitter-marketplace/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Building a two-sided marketplace connecting pet owners with pet sitters, featuring search/discovery, booking management, profile customization, and AI-powered recommendations. The platform enables pet owners to find qualified sitters by location and dates, while sitters can showcase their services and manage their availability.

## Technical Context

**Language/Version**: 
- Backend: C# / .NET 9.0 (ASP.NET Core)
- Frontend: TypeScript / React 18+
- AI Agents: Python 3.8+ with Microsoft Agent Framework

**Primary Dependencies**: 
- .NET Aspire 13.0-preview+ (orchestration)
- Entity Framework Core 9.0 (in-memory database)
- React Router v6 (frontend routing)
- FastAPI (Python agent API endpoints)
- Azure AI Foundry (agent integration)
- uv (Python package management)

**Storage**: 
- Development: EF Core In-Memory Database (resets on restart)
- Production: NEEDS CLARIFICATION - PostgreSQL, SQL Server, or Cosmos DB

**Testing**: 
- Backend: xUnit / NUnit with ASP.NET Core test host
- Frontend: Playwright for E2E tests
- Python: pytest for agent unit tests

**Target Platform**: 
- Development: Aspire Dashboard (all services localhost)
- Production: Azure Container Apps via Aspire deployment

**Project Type**: Web application (React frontend + ASP.NET Core backend + Python AI agents)

**Performance Goals**: 
- Search results: <3 seconds for typical queries
- Booking submission: <5 minutes end-to-end
- Messaging notifications: <1 minute delivery
- Support 500 concurrent users

**Constraints**: 
- Mock data MUST synchronize across frontend/backend/data folder
- All services MUST be orchestrated through Aspire AppHost
- No hardcoded URLs/ports (use Aspire service discovery)
- Python agents MUST use uv (never pip directly)
- File search agents MUST pass tool_resources to threads

**Scale/Scope**: 
- MVP: P1 user stories (search, booking, profile management)
- Users: Target 10k pet owners, 2k sitters at launch
- Data: ~50-100 sitters per metro area initially

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Check (Before Phase 0)

- [ ] **Azure CLI installed and authenticated**: Run `az --version` and `az login`
- [ ] **Azure MCP tools available**: Verify best practices tools for Azure code generation and deployment
- [ ] **Azure AI Toolkit MCP tools available**: Verify `aitk-*` tools for agent development
- [x] **All services in AppHost**: Backend, frontend, and all Python agents registered in `apphost/AppHost.cs`
- [x] **No hardcoded URLs/ports**: Services use `GetEndpoint()` and environment variables for discovery
- [x] **Mock data synchronized**: `/data/listing.json`, `frontend/src/data/listingsData.ts`, `backend/Data/AppDbContext.cs` are in sync
- [x] **Python agents use uv**: All Python projects use `uv sync`, not `pip install`
- [x] **Health check endpoints**: All services expose `/health` returning JSON with Status and Timestamp
- [x] **OpenTelemetry configured**: All services use `.WithOtlpExporter()` in AppHost
- [ ] **User stories are independently testable**: P1 stories (search, booking, profile) can be tested without P2/P3 dependencies

**Status**: ⚠️ NEEDS VERIFICATION - Azure prerequisites and user story independence to be confirmed in Phase 0

### Post-Design Check (After Phase 1)

**Status**: ✅ PHASE 1 COMPLETE

- [x] **Data models align with constitution patterns**: Entities follow EF Core conventions, navigation properties defined
- [x] **API contracts follow Aspire service discovery**: All endpoints use relative paths `/api/*`, no hardcoded URLs
- [ ] **Agent tools configured in Azure AI Foundry**: To be completed during implementation (agents exist, marketplace enhancements needed)
- [x] **File search agents include `tool_resources` in thread creation**: Pattern documented in quickstart.md and research.md
- [x] **No new constitution violations introduced**: All designs follow existing Octopets patterns

**Artifacts Generated**:
- ✅ `data-model.md`: Complete entity definitions with relationships, validation rules, state machines
- ✅ `contracts/pet-owner-api.yaml`: OpenAPI spec for pet owner and pet management endpoints
- ✅ `quickstart.md`: Developer setup guide with workflows and best practices
- ✅ Agent context updated via `.specify/scripts/bash/update-agent-context.sh copilot`

**Outstanding Items for Implementation Phase**:
- Generate remaining API contracts: `pet-sitter-api.yaml`, `booking-api.yaml`, `messaging-api.yaml`
- Register new entities in Azure AI Foundry for agent file search
- Implement actual backend endpoints and frontend pages per user stories

## Project Structure

### Documentation (this feature)

```text
specs/001-pet-sitter-marketplace/
├── spec.md              # Feature specification (INPUT)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── pet-owner-api.yaml      # Pet owner endpoints
│   ├── pet-sitter-api.yaml     # Pet sitter endpoints
│   ├── booking-api.yaml        # Booking management
│   └── messaging-api.yaml      # Communication endpoints
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Web application structure (existing Octopets architecture)
apphost/
├── AppHost.cs           # Aspire orchestration - MODIFY to add new sitter services
└── appsettings.json

backend/
├── Program.cs           # API startup and endpoint registration
├── Data/
│   ├── AppDbContext.cs  # EF Core context + seed data - MODIFY for new entities
│   └── DataInitializer.cs
├── Models/              # ADD: PetOwner, PetSitter, Booking, Service, Message, Pet
│   ├── Listing.cs       # Existing (pet venues)
│   └── Review.cs        # Existing
├── Repositories/        # ADD: Repository interfaces and implementations
│   ├── Interfaces/
│   └── [Entity]Repository.cs implementations
└── Endpoints/           # ADD: New endpoint groups
    ├── ListingEndpoints.cs      # Existing (venues)
    ├── ReviewEndpoints.cs       # Existing
    ├── PetOwnerEndpoints.cs     # NEW
    ├── PetSitterEndpoints.cs    # NEW
    ├── BookingEndpoints.cs      # NEW
    └── MessagingEndpoints.cs    # NEW

frontend/
├── src/
│   ├── components/      # ADD: Shared UI components
│   │   ├── search/      # Search filters, results list
│   │   ├── profile/     # Profile cards, forms
│   │   ├── booking/     # Booking calendar, request forms
│   │   └── messaging/   # Chat interface
│   ├── pages/           # ADD: New route pages
│   │   ├── Search.tsx          # Pet owner search interface
│   │   ├── SitterProfile.tsx   # Sitter detail view
│   │   ├── OwnerProfile.tsx    # Pet owner dashboard
│   │   ├── SitterDashboard.tsx # Sitter management interface
│   │   ├── BookingDetails.tsx  # Booking management
│   │   └── Messages.tsx        # Messaging interface
│   ├── data/            # MODIFY: Add new services
│   │   ├── agentService.ts     # Existing agent integration
│   │   ├── listingsData.ts     # Existing mock data
│   │   ├── petSitterService.ts # NEW: Sitter API client
│   │   ├── bookingService.ts   # NEW: Booking API client
│   │   └── messageService.ts   # NEW: Messaging API client
│   └── types/           # ADD: TypeScript interfaces matching backend models
└── tests/
    └── e2e/             # ADD: Playwright tests for user stories

# AI Agents (specialized by domain)
sitter-agent/            # Existing - MODIFY for marketplace sitter matching
├── app.py
├── pet_sitter_agent.py  # MODIFY: Enhance with booking availability logic
└── data/
    └── pet-sitter.json  # MODIFY: Extend with marketplace sitter data

agent/                   # Existing listings agent - EXTEND for location search
├── agent.py
└── pyproject.toml

orchestrator-agent/      # Existing - MODIFY to coordinate sitter + booking queries
├── orchestrator.py      # EXTEND: Add booking coordination tools
└── app.py

data/                    # Source of truth for mock data
├── listing.json         # Existing (pet venues)
└── pet-sitters.json     # NEW: Mock sitter profiles for development

servicedefaults/         # Existing - shared configuration (no changes needed)
```

**Structure Decision**: Using existing Octopets web application architecture with Aspire orchestration. The project already has backend (ASP.NET Core), frontend (React), and AI agents (Python) infrastructure. This feature extends the existing venue marketplace to support pet sitters as a new entity type, following established patterns for models, repositories, endpoints, and agent integration.

## Complexity Tracking

**Status**: No constitution violations detected.

The existing Octopets architecture already follows all constitution principles:

- Aspire-first orchestration is in place
- Multi-agent architecture is established
- Mock data synchronization patterns are defined
- Service discovery is configured
- Environment-aware behavior exists

This feature extends the existing patterns without introducing new architectural complexity.

---

## Plan Execution Summary

**Command**: `/speckit.plan` executed on October 21, 2025  
**Branch**: `001-pet-sitter-marketplace`  
**Status**: ✅ **Phase 0 and Phase 1 COMPLETE** - Ready for Phase 2 (`/speckit.tasks`)

### Completed Artifacts

| Artifact | Location | Status | Description |
|----------|----------|--------|-------------|
| Implementation Plan | `specs/001-pet-sitter-marketplace/plan.md` | ✅ Complete | This file - technical context, constitution check, structure |
| Research Document | `specs/001-pet-sitter-marketplace/research.md` | ✅ Complete | All technical unknowns resolved (AI models, entities, patterns) |
| Data Model | `specs/001-pet-sitter-marketplace/data-model.md` | ✅ Complete | Full entity definitions, ERD, relationships, validation |
| API Contracts | `specs/001-pet-sitter-marketplace/contracts/pet-owner-api.yaml` | ✅ Complete | OpenAPI spec for pet owner endpoints |
| Quickstart Guide | `specs/001-pet-sitter-marketplace/quickstart.md` | ✅ Complete | Developer setup, workflows, troubleshooting |
| Agent Context | `.github/copilot-instructions.md` | ✅ Updated | Technology stack synchronized |

### Key Decisions Made

**Phase 0 Research Decisions**:
- **AI Model**: gpt-4.1-mini (dev) / gpt-4.1 (prod) via GitHub Models → Azure AI Foundry
- **Database**: PostgreSQL with PostGIS for production (in-memory for MVP dev)
- **Authentication**: Azure AD B2C with social login and custom attributes
- **Geospatial Search**: Haversine formula (dev), PostGIS spatial indexes (prod)
- **Real-time Messaging**: REST + polling (MVP), upgrade path to Azure SignalR
- **File Storage**: Azure Blob Storage with CDN
- **Concurrency**: Optimistic concurrency with EF Core row versioning

**Phase 1 Design Decisions**:
- **7 New Entities**: PetOwner, Pet, PetSitter, Service, Availability, Booking, Message
- **1 Extended Entity**: Review (added nullable PetSitterId, PetOwnerId, BookingId)
- **Repository Pattern**: Following existing IListingRepository pattern
- **Mock Data**: JSON source of truth in `/data` with sync to frontend/backend
- **API Structure**: REST with `/api/<resource>` groups, OpenAPI documented

### Constitution Compliance

✅ **Pre-Research Check**: Passed with warnings for Azure prerequisites verification  
✅ **Post-Design Check**: Passed - all designs align with constitution principles  
✅ **Complexity Tracking**: No violations - extends existing patterns  

### Next Steps

**For Implementation** (Phase 2 - use `/speckit.tasks`):

1. **Generate task breakdown**: Run `/speckit.tasks` to create user story implementation tasks
2. **Complete API contracts**: Generate `pet-sitter-api.yaml`, `booking-api.yaml`, `messaging-api.yaml`
3. **Implement P1 user stories**:
   - User Story 1: Pet Owner Search and Booking (search, profile view, booking request)
   - User Story 2: Pet Sitter Profile Management (profile CRUD, services, availability)
4. **Create mock data files**: Generate `/data/pet-owner.json`, `/data/pet-sitter.json`, `/data/booking.json`
5. **Sync mock data**: Implement frontend TypeScript interfaces and backend seed data
6. **Test incrementally**: Use Aspire Dashboard for monitoring and Scalar UI for API testing

**For Testing**:
- Playwright E2E tests for P1 user flows
- Backend unit tests for booking conflict detection
- Agent testing for sitter recommendation logic

**For Documentation**:
- Update README.md with marketplace feature description
- Create API usage examples in Scalar UI
- Document deployment configuration for Azure Container Apps

---

**Plan Complete**: All Phase 0 and Phase 1 objectives achieved per `/speckit.plan` command template.  
**Output Files**: 5 core documents + 1 API contract + agent context update  
**Ready for**: Task breakdown generation via `/speckit.tasks` command

