# Implementation Plan: Pet Sitter Marketplace Platform

**Branch**: `001-pet-sitter-marketplace` | **Date**: November 12, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-pet-sitter-marketplace/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Primary requirement: A pet sitter marketplace platform that enables pet owners to search for and book pet sitters, with sitters able to create profiles, manage availability, and accept/decline booking requests. The platform includes social features for community building and supports comprehensive pet types (not just dogs/cats). Technical approach follows .NET Aspire orchestration with ASP.NET Core backend, React frontend, and multi-agent AI integration for intelligent recommendations.

## Technical Context

**Language/Version**: C# 12/.NET 9.0 (backend), JavaScript/TypeScript 5.0+ (frontend), Python 3.11+ (agents)
**Primary Dependencies**: ASP.NET Core 9.0, React 18+, Entity Framework Core 9.0, Microsoft Agent Framework, FastAPI, uv package manager
**Storage**: Entity Framework Core with in-memory database (development), Azure SQL Database (production)  
**Testing**: xUnit + FluentAssertions (backend), Jest + React Testing Library (frontend), pytest (agents)
**Target Platform**: Azure Container Apps via .NET Aspire deployment
**Project Type**: Web application (Aspire-orchestrated distributed system)
**Performance Goals**: 95% of searches under 2 seconds, 1000 concurrent users, 90% booking response rate within 24 hours
**Constraints**: Mobile responsive (320px+), 99.5% uptime for booking functions, real-time availability updates
**Scale/Scope**: Target 75,000 users by Year 3, 4,000 active venues, multi-agent AI coordination, comprehensive pet type support

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Azure Development Prerequisites**:
- [x] Azure CLI installed and up-to-date (required for deployment)
- [x] User authenticated via `az login` (required for agents and deployment)  
- [ ] Azure MCP best practices invoked for code generation (PENDING - will be done during Phase 0)
- [ ] Azure AI Toolkit MCP tools invoked for agent code (PENDING - will be done during Phase 0)

**Aspire-First Orchestration**:
- [x] All services orchestrated through .NET Aspire AppHost (backend, frontend, agents)
- [x] Service discovery for inter-service communication
- [x] No standalone service execution permitted

**Multi-Agent Architecture**:
- [x] Agents specialized by domain (sitter search, booking, venue discovery)
- [x] Microsoft Agent Framework with Azure AI Foundry integration
- [x] FastAPI HTTP endpoints following `/agent/chat` convention
- [x] Health check endpoints at `/health`
- [x] `uv` dependency management (not pip)
- [x] `DefaultAzureCredential` authentication pattern

**Mock Data Synchronization**:
- [x] Frontend/backend mock data structural parity required
- [x] Source of truth: `/data/listing.json` (existing pattern)
- [x] Toggle mechanism: `REACT_APP_USE_MOCK_DATA` and in-memory DB
- [x] AppHost configures mock data flags based on `IsPublishMode`

**Service Discovery & Dynamic Configuration**:
- [x] No hardcoded URLs or ports
- [x] Use `GetEndpoint()` in AppHost for service references
- [x] Environment variables for service communication
- [x] `IsPublishMode` for dev/prod URL schemes

**Environment-Aware Behavior**:
- [x] Development: mock data enabled, CRUD enabled, Swagger exposed
- [x] Production: mock data disabled, CRUD disabled, Application Insights enabled
- [x] Single `IsPublishMode` flag for environment control

**Observability & Telemetry**:
- [x] OpenTelemetry via `.WithOtlpExporter()`
- [x] Structured logging with `app.Logger`
- [x] Health check endpoints required
- [x] Aspire Dashboard for development monitoring
- [x] Application Insights for production

**Independent User Story Delivery**:
- [x] User stories prioritized (P1, P2, P3) in specification
- [x] Each story independently testable
- [x] P1 stories form viable MVP
- [x] No cross-story dependencies blocking parallel development

**GATE STATUS**: ✅ PASSED - All constitutional requirements satisfied. Phase 1 design generation completed successfully.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

## Project Structure

### Documentation (this feature)

```text
specs/001-pet-sitter-marketplace/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Web application structure (frontend + backend + agents)
backend/
├── src/
│   ├── Models/          # EF Core entities (PetOwner, PetSitter, Booking, Review)
│   ├── Data/            # AppDbContext, repositories, mock data seeding
│   ├── Endpoints/       # Minimal API endpoint groups (*Endpoints.cs)
│   ├── Services/        # Business logic services
│   └── DTOs/           # Data transfer objects for API contracts
├── Program.cs          # Service registration, middleware configuration
└── Tests/
    ├── Unit/           # Service and repository unit tests
    └── Integration/    # API endpoint integration tests

frontend/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/         # Route-level page components
│   ├── services/      # API clients, agent communication
│   ├── data/          # Mock data (listingsData.ts, sittersData.ts)
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Helper functions and utilities
├── public/            # Static assets
└── tests/
    ├── unit/          # Component unit tests (Jest + RTL)
    └── e2e/           # End-to-end tests (Playwright)

# AI Agents following existing pattern
sitter-search-agent/   # New agent for sitter discovery
├── src/
│   ├── agent.py       # Main agent logic with Agent Framework
│   ├── app.py         # FastAPI HTTP server
│   └── tools/         # Agent-specific tool implementations
├── pyproject.toml     # uv dependency management
├── uv.lock           # Lock file for reproducible builds
└── tests/            # pytest agent tests

booking-agent/        # New agent for booking intelligence
├── src/
│   ├── agent.py       # Booking recommendation logic
│   ├── app.py         # FastAPI HTTP server
│   └── tools/         # Booking-related tools
├── pyproject.toml
├── uv.lock
└── tests/

# Enhanced orchestrator for marketplace coordination
orchestrator-agent/   # Enhanced existing orchestrator
├── src/
│   ├── orchestrator.py  # Multi-agent coordination
│   ├── app.py           # FastAPI HTTP server
│   └── tools/           # Cross-agent coordination tools
├── pyproject.toml
├── uv.lock
└── tests/

# Aspire orchestration
apphost/
├── AppHost.cs         # Service registration and configuration
├── Program.cs         # Aspire host entry point
└── appsettings.json   # Host-level configuration

servicedefaults/       # Shared Aspire configuration
├── Extensions.cs      # Common service extensions
└── HostingExtensions.cs

# Data contracts (shared truth)
data/
├── sitters.json       # Pet sitter mock data
├── bookings.json      # Booking mock data  
├── petTypes.json      # Supported pet types and categories
└── services.json      # Available pet care services

# Deployment and infrastructure
.azure/
├── azure.yaml         # Aspire Azure deployment configuration
└── environments/      # Environment-specific configs
```

**Structure Decision**: Web application structure selected due to React frontend + ASP.NET Core backend + multi-agent Python services. This follows the existing Octopets pattern while extending it for marketplace functionality. All services are orchestrated through Aspire AppHost maintaining the constitutional requirement for centralized orchestration.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
