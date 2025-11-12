# Octopets AI Coding Assistant Instructions

## Project Architecture

Octopets is a .NET Aspire-orchestrated distributed application combining ASP.NET Core backend, React frontend, and **Microsoft Agent Framework-based Python AI agents** for intelligent pet venue and sitter recommendations.

### Core Components

1. **AppHost** (`/apphost`): .NET Aspire orchestrator that manages all services
   - Single command start: `aspire run` or `dotnet run --project apphost`
   - Configures service discovery, ports, environment variables, and CORS
   - Key pattern: Uses `builder.ExecutionContext.IsPublishMode` to toggle dev/prod behavior
   - Python agents use `.AddPythonScript(...).WithUvEnvironment().PublishAsDockerFile()`

2. **Backend API** (`/backend`): ASP.NET Core 9.0 with Minimal APIs
   - In-memory Entity Framework Core database (no persistence needed locally)
   - Endpoint pattern: `/backend/Endpoints/*Endpoints.cs` files with `MapGroup("/api/...")`
   - Mock data seeded in `Data/AppDbContext.cs` automatically on startup
   - Repository pattern: `Repositories/Interfaces/I*Repository.cs` → `Repositories/*Repository.cs`
   - **Special feature**: `ERRORS` env var triggers intentional memory exhaustion for testing (see `ListingEndpoints.cs`)

3. **Frontend** (`/frontend`): React 18 + TypeScript with React Router v6
   - Mock data toggle: `REACT_APP_USE_MOCK_DATA` controls local-only mode (see `src/config/appConfig.ts`)
   - Structure: `src/pages/` (routes), `src/components/` (shared), `src/data/` (services/mock data)
   - Multi-agent integration: `src/data/agentService.ts` with `AgentType` enum (LISTINGS, SITTER, ORCHESTRATOR)
   - Build: `npm run build` creates production bundle in `/build`

4. **AI Agents** (Python with Microsoft Agent Framework):
   - **Listings Agent** (`/agent`): Port 8001, uses Azure AI Foundry agents with **file search** tool for venue data
   - **Sitter Agent** (`/sitter-agent`): Port 8002, uses function tools with local `data/pet-sitter.json`
   - **Orchestrator Agent** (`/orchestrator-agent`): Port 8003, coordinates multi-agent queries using function calling
   - All use `uv` for dependency management, `DefaultAzureCredential` for auth, FastAPI for HTTP endpoints
   - Critical: Orchestrator delegates via `query_listings_agent()` and `query_sitter_agent()` tool functions

5. **ServiceDefaults** (`/servicedefaults`): Shared .NET configuration for health checks, telemetry, and resilience

## Development Workflows

### Starting the Application
```bash
# Single command starts ALL services (frontend, backend, 3 agents)
aspire run
# Opens Aspire Dashboard at http://localhost:15888 with all service endpoints
```

### Python Agent Development
- **Never use `pip install` directly** - always use `uv sync` (already configured in pyproject.toml)
- Authentication: Requires `az login` for `DefaultAzureCredential` to work
- Environment variables set by AppHost: `AZURE_OPENAI_ENDPOINT`, `AGENT_ID`, `FRONTEND_URL`, agent URLs
- Agent Framework pattern: Create `ChatAgent` with `tools=[...]` for function calling
- Testing: Run `uv run python <script>.py` for standalone testing or `uv run python app.py` for API server

### Backend Development
- **No database migrations needed** - uses in-memory DB that resets on restart
- Adding endpoints: Create static methods in `*Endpoints.cs`, call `app.Map<Endpoint>()` in `Program.cs`
- Endpoint conventions: Use `.WithName()`, `.WithDescription()`, `.WithOpenApi()` for documentation
- Testing: Scalar UI available at `/scalar/v1` when running (see Program.cs conditional)
- Repository pattern: Inject `I<Entity>Repository` in endpoint methods

### Frontend Development
- Changes hot reload automatically (React dev server integrated via Aspire)
- Mock data mode: Set `REACT_APP_USE_MOCK_DATA=true` to avoid calling backend (useful for UI-only work)
- Agent integration: Import `agentService` from `data/agentService.ts`, use `sendMessage(msg, AgentType)`
- Testing: Playwright tests in `/frontend/tests`, run with `npm run test:e2e`

### Multi-Agent Orchestration
- **Default to orchestrator for complex queries** involving both venues AND sitters
- Frontend pattern: Check for keywords, route to appropriate `AgentType` (see `docs/multi-agent-orchestration.md`)
- Orchestrator automatically delegates to specialized agents based on LLM analysis
- Example: "venue in NY + sitter on weekends" → orchestrator calls both agents and synthesizes response

## Critical Project-Specific Patterns

### Mock Data Synchronization
- **Frontend and backend mock data MUST match** in structure (see `/data/listing.json` as source of truth)
- Frontend: `frontend/src/data/listingsData.ts`
- Backend: `backend/Data/AppDbContext.cs` SeedData method
- Toggle controlled by `REACT_APP_USE_MOCK_DATA` (frontend) and in-memory DB (backend)
- AppHost sets this automatically: dev=true, production=false

### Aspire Configuration Conventions
- Python scripts: Use `.AddPythonScript(name, path, entrypoint).WithUvEnvironment()`
- CORS: Always configure with `FRONTEND_URL` env var, AppHost injects `frontend.GetEndpoint("http")`
- Service references: `.WithReference(service).WaitFor(service)` for dependency ordering
- Icon names: Use `.WithIconName()` for Aspire Dashboard UI (e.g., "ChatEmpty", "BranchFork")
- Publish mode: Check `builder.ExecutionContext.IsPublishMode` for prod-specific config

### Agent Framework Patterns
- **File search requires thread tool_resources** - see `agent/agent.py` for correct setup with vector stores
- When using existing AI Foundry agent: Pass `agent_id` to `AzureAIAgentClient`, don't override instructions/tools
- Orchestrator tools: Async functions with `Annotated[str, "description"]` for LLM function calling
- Error handling: Agents should return JSON strings, frontend parses `message.content` from response

### API Endpoint Conventions
- Group related endpoints: `app.MapGroup("/api/listings").WithTags("Listings")`
- CRUD operations check `ENABLE_CRUD` config flag (disabled in production)
- Health checks: Always expose `/health` endpoint returning `{ Status: "Healthy", Timestamp: ... }`
- CORS: Applied via `app.UseCors()` after middleware registration

## Debugging & Testing

### Common Issues
1. **Agent not finding files**: Check vector store IDs attached to thread in `agent.py` `generate_agent_response()`
2. **CORS errors**: Verify `FRONTEND_URL` env var matches actual frontend URL in Aspire Dashboard
3. **uv package errors**: Run `gh auth login` first (GH packages in Python dependencies)
4. **Mock data mismatch**: Ensure `listingsData.ts` and `AppDbContext.cs` seed data are in sync

### Monitoring
- Aspire Dashboard shows: logs, traces (OpenTelemetry), metrics, endpoints for all services
- Check "Run Steps" in agent responses to verify file search/tool invocations (logged in agent.py)
- Backend errors: Review `/api/debug/info` endpoint for environment diagnostics

## Deployment

### Azure Deployment (Aspire)
```bash
# Deploy all services to Azure Container Apps
aspire deploy
```
- Aspire handles all infrastructure provisioning and deployment
- Frontend and backend deploy as separate container apps
- Python agents containerized via Dockerfile (generated by Aspire)
- Environment variables configured automatically
- Application Insights enabled automatically in production

### Key Production Differences
- `builder.ExecutionContext.IsPublishMode` triggers: mock data OFF, CRUD operations OFF, ERRORS flag ON
- Frontend: `REACT_APP_USE_MOCK_DATA=false` → hits real backend API
- Agents: Use managed identity authentication in Azure, connection strings injected by Aspire

## File Structure Quick Reference
```
/apphost/AppHost.cs         - Service orchestration (START HERE for understanding service topology)
/backend/Program.cs         - API startup, CORS, middleware, endpoint mapping
/backend/Endpoints/         - All API endpoint definitions (minimal API pattern)
/backend/Data/AppDbContext.cs - Mock data seeding
/frontend/src/data/agentService.ts - Multi-agent routing logic
/orchestrator-agent/orchestrator.py - Multi-agent coordination with tool functions
/agent/agent.py            - Listings agent with file search (see vector store setup)
/docs/multi-agent-orchestration.md - Detailed agent coordination guide
```

## When Stuck

1. **Architecture questions**: Read `AppHost.cs` - it's the dependency map for the entire system
2. **Agent issues**: Check agent README in respective folder, review OpenTelemetry traces in Aspire Dashboard
3. **Data flow**: Mock data is intentionally simple - trace from `listingsData.ts` → `dataService.ts` → backend endpoints
4. **Service discovery**: All URLs are dynamic via Aspire - never hardcode, use `GetEndpoint()` in AppHost.cs