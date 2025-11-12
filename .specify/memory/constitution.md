# Octopets Constitution

## Core Principles

### 0. Azure Development Prerequisites

**All Azure-related development MUST verify prerequisites before code generation or deployment**:

- Azure CLI MUST be installed and up-to-date (`az --version` to verify)
- User MUST be authenticated via `az login` with valid subscription access
- Azure MCP best practices tools MUST be invoked before:
  - Generating Azure-related code (invoke with resource=`general`, action=`code-generation`)
  - Deploying to Azure (invoke with resource=`general`, action=`deployment`)
  - Working with Azure Functions (invoke with resource=`azurefunctions`, action=`code-generation` or `deployment`)
  - Working with Azure Static Web Apps (invoke appropriate best practices tool)
- Azure AI Toolkit MCP tools (prefixed with `aitk_`) MUST be invoked for:
  - AI agent code generation (`aitk-get_agent_code_gen_best_practices`)
  - AI agent evaluation code (`aitk-get_evaluation_code_gen_best_practices`)
  - Agent runner setup (`aitk-evaluation_agent_runner_best_practices`)
  - AI model guidance (`aitk_get_ai_model_guidance`)
  - Tracing implementation (`aitk_get_tracing_code_gen_best_practices`)

**Rationale**: Azure MCP tools provide up-to-date official guidance that prevents common misconfigurations, security issues, and deployment failures. Azure AI Toolkit tools ensure agents follow Microsoft's latest patterns for Agent Framework, evaluation, and observability. Verifying prerequisites prevents wasted development time on environments that cannot authenticate or deploy.

### I. Aspire-First Orchestration

**All services MUST be orchestrated through .NET Aspire AppHost**. No standalone service execution is permitted in development or production. The AppHost is the single source of truth for:

- Service discovery and inter-service communication
- Environment variable injection
- Resource management and health checks
- Port allocation and endpoint configuration
- CORS policy enforcement

**Rationale**: Aspire provides deterministic service topology, eliminates configuration drift between environments, and ensures consistent observability across all components. Direct service execution bypasses critical infrastructure patterns and creates deployment inconsistencies.

### II. Multi-Agent Architecture

**AI agents MUST be specialized by domain** and coordinated through an orchestrator pattern. Each agent:

- MUST have a single, well-defined responsibility (listings, sitters, etc.)
- MUST use Microsoft Agent Framework with Azure AI Foundry integration
- MUST expose FastAPI HTTP endpoints following `/agent/chat` convention
- MUST implement health check endpoints at `/health`
- MUST use `uv` for dependency management (never `pip install` directly)
- MUST authenticate via `DefaultAzureCredential` (requires `az login` locally)
- MUST follow Azure best practices obtained via Azure MCP tools before code generation
- MUST invoke Azure AI Toolkit MCP tools (`aitk_get_agent_code_gen_best_practices`) before agent code generation

**Orchestrator requirements**:

- MUST delegate complex queries to specialized agents via function calling
- MUST use `httpx.AsyncClient` for inter-agent communication
- MUST synthesize results from multiple agents into unified responses
- MUST be the default entry point for frontend queries

**Rationale**: Specialized agents enable focused knowledge bases and tools, while orchestration provides unified user experience. This pattern scales horizontally as new agent types are added without modifying existing agents.

### III. Mock Data Synchronization (NON-NEGOTIABLE)

**Frontend and backend mock data MUST maintain structural parity** at all times. Mock data serves as the single source of truth for data models during development.

- Source of truth: `/data/listing.json`
- Frontend representation: `frontend/src/data/listingsData.ts`
- Backend seed data: `backend/Data/AppDbContext.cs` SeedData method
- Toggle mechanism: `REACT_APP_USE_MOCK_DATA` (frontend), in-memory DB (backend)
- AppHost MUST configure mock data flags: dev=true, production=false

**Any change to data models MUST update all three locations simultaneously**. Breaking this parity causes runtime errors, frontend/backend mismatches, and blocks local development.

**Rationale**: Mock data enables zero-dependency local development and serves as living documentation of data contracts. Synchronization ensures developers can seamlessly transition between mock and live data without model mismatches.

### IV. Service Discovery & Dynamic Configuration

**No hardcoded URLs or ports are permitted**. All service communication MUST use Aspire's service discovery mechanisms:

- Use `GetEndpoint("http"/"https")` in AppHost for service references
- Backend MUST read `FRONTEND_URL` from environment for CORS
- Frontend MUST read agent URLs from environment variables set by AppHost
- Agents MUST read sibling agent URLs from environment (orchestrator pattern)
- Use `IsPublishMode` to toggle dev/prod URL schemes (http vs https)

**Rationale**: Hardcoded configuration breaks when Aspire assigns dynamic ports or when deploying to Azure Container Apps. Service discovery ensures portability across environments without code changes.

### V. Environment-Aware Behavior

**Services MUST adapt behavior based on `builder.ExecutionContext.IsPublishMode`**:

- **Development mode** (`IsPublishMode=false`):
  - Mock data enabled
  - CRUD operations enabled
  - Swagger/Scalar UI exposed
  - ERRORS flag disabled
  - Local http endpoints

- **Production mode** (`IsPublishMode=true`):
  - Mock data disabled
  - CRUD operations disabled
  - OpenAPI only if explicitly configured
  - ERRORS flag enabled (for intentional testing)
  - HTTPS endpoints
  - Application Insights enabled

**Code changes requiring environment checks MUST NOT use separate configuration files**—use the single IsPublishMode flag.

**Rationale**: Single-point environment control prevents configuration drift and ensures consistent behavior expectations. Developers cannot accidentally deploy development settings to production.

### VI. Observability & Telemetry

**All services MUST emit structured telemetry** via OpenTelemetry:

- Use `.WithOtlpExporter()` on all Aspire service definitions
- Backend MUST use `app.Logger` for structured logging
- Python agents MUST use standard `logging` module
- Health check endpoints required: `/health` returning `{ Status, Timestamp }`
- Agents MUST log tool invocations and run steps for debugging

**Aspire Dashboard MUST be the primary development monitoring interface**:

- Logs aggregation across all services
- Distributed tracing for multi-service requests
- Metrics and resource utilization
- Service status and health checks

**Production MUST use Application Insights** (automatically added in publish mode).

**Rationale**: Distributed applications are impossible to debug without unified observability. Tool invocation visibility in agents is critical for diagnosing why agents don't use configured tools (see AGENT_FRAMEWORK_FEEDBACK.md).

### VII. Independent User Story Delivery

**Features MUST be decomposed into independently deliverable user stories**. Each story:

- MUST be prioritized (P1, P2, P3...)
- MUST be independently testable without other stories
- MUST deliver standalone value (viable as MVP at P1)
- MUST NOT create cross-story dependencies that block parallel development

**Implementation phases**:

1. **Setup**: Project scaffolding (can run in parallel)
2. **Foundational**: Core infrastructure that BLOCKS all user stories (database, auth, routing)
3. **User Stories**: Independent increments deliverable in priority order OR parallel
4. **Polish**: Cross-cutting improvements after stories complete

**User stories define task organization in tasks.md**—tasks MUST be grouped by story.

**Rationale**: Independent stories enable incremental delivery, parallel team work, and graceful scope reduction if timelines compress. Foundational phase prevents repeated infrastructure work per story.

## Technology Stack Standards

**Required Technologies** (changes require constitution amendment):

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| Orchestration | .NET Aspire | 13.0-preview+ | Service discovery, observability, deployment |
| Backend | ASP.NET Core | 9.0+ | Minimal APIs, EF Core integration |
| Frontend | React + TypeScript | 18+ | Type safety, modern hooks |
| Routing | React Router | v6+ | Declarative routing |
| AI Agents | Python + Agent Framework | 3.8+ / latest preview | Microsoft-supported multi-agent patterns |
| Package Management (Python) | uv | Latest | Deterministic builds, GitHub package support |
| API Framework (Python) | FastAPI | Latest | Async support, OpenAPI generation |
| Backend Data | EF Core In-Memory | 9.0+ | Zero-dependency local dev |
| Containerization | Docker | Latest | Production deployment |
| Monitoring | Azure Application Insights | Latest | Production observability |

**Prohibited Patterns**:

- ❌ Direct `pip install` (use `uv sync` for Python)
- ❌ Hardcoded URLs or ports (use Aspire service discovery)
- ❌ Separate mock data implementations per service (maintain `/data/*.json` parity)
- ❌ Agent tools defined only in code without Azure AI Foundry configuration
- ❌ Thread creation without `tool_resources` when using file search (see AGENT_FRAMEWORK_FEEDBACK.md)

## Development Workflow

### Starting the Application

```bash
aspire run
# Opens Aspire Dashboard at http://localhost:15888
# Starts: frontend, backend, chat agent, sitter agent, orchestrator agent
```

**Single command MUST start entire application stack**. Services not in AppHost are not part of the architecture.

### Python Agent Development

1. **Verify Azure prerequisites**: Run `az --version` and `az login` before development
2. **Invoke Azure AI Toolkit MCP tools**: Before agent code changes, use `aitk_get_agent_code_gen_best_practices` for guidance
3. **Invoke Azure best practices**: Before Azure-specific code, use Azure MCP tools for guidance
4. **Never use standalone Python execution** for integrated agents (use AppHost)
5. Standalone testing: `uv run python <agent>.py` (interactive CLI)
6. Dependency changes: `uv sync` in agent directory, commit `pyproject.toml` and `uv.lock`
7. Authentication: `az login` required before `aspire run`
8. File search agents: Verify `tool_resources` passed to thread creation (see AGENT_FRAMEWORK_FEEDBACK.md)

### Backend Development

1. **No database migrations**—uses in-memory DB that resets on restart
2. New endpoints: Create `*Endpoints.cs`, call `app.Map<Endpoint>()` in Program.cs
3. Use `.WithName()`, `.WithDescription()`, `.WithOpenApi()` on all endpoints
4. Repository pattern: Inject `I<Entity>Repository` in endpoint methods
5. Test with Scalar UI at `/scalar/v1` in development

### Frontend Development

1. Hot reload enabled via Aspire (changes reload automatically)
2. Mock data mode: Set `REACT_APP_USE_MOCK_DATA=true` for UI-only work
3. Agent integration: Use `agentService.sendMessage(msg, AgentType)` from `data/agentService.ts`
4. E2E tests: Playwright in `/frontend/tests`, run with `npm run test:e2e`

### Constitution Compliance Checks

**Before Phase 0 research AND after Phase 1 design**, verify:

- [ ] Azure CLI installed and user authenticated (`az login`)
- [ ] Azure MCP best practices invoked for all Azure-related code/deployments
- [ ] Azure AI Toolkit MCP tools invoked for all agent code generation
- [ ] All services registered in AppHost.cs
- [ ] No hardcoded URLs or ports
- [ ] Mock data synchronized across `/data`, frontend, backend
- [ ] Python agents use `uv` for dependencies
- [ ] All services have health check endpoints
- [ ] OpenTelemetry configured on all services
- [ ] User stories are independently testable (P1 is viable MVP)

**Templates affected by constitution**:

- `.specify/templates/plan-template.md`: Constitution Check section
- `.specify/templates/spec-template.md`: User Story prioritization and independence
- `.specify/templates/tasks-template.md`: Phase structure and story grouping

## Governance

**This constitution supersedes all other coding practices or conventions**. When conflicts arise, constitution principles MUST be followed unless:

1. An amendment is proposed with explicit rationale
2. Complexity violation is justified in plan.md Complexity Tracking section
3. Technical constraint requires deviation (must be documented in spec or plan)

**Amendment Process**:

1. Propose change with rationale in GitHub issue or PR
2. Document impact on existing code and templates
3. Update constitution version using semantic versioning:
   - **MAJOR**: Removes/redefines principle, breaks backward compatibility
   - **MINOR**: Adds principle, expands guidance, new mandatory section
   - **PATCH**: Clarifies wording, fixes typos, non-semantic refinements
4. Update affected templates (plan, spec, tasks) and commands
5. Create Sync Impact Report in constitution as HTML comment
6. Commit message: `docs: amend constitution to vX.Y.Z (summary)`

**Compliance Verification**:

- Constitution Check in plan.md MUST pass before implementation
- Complexity Tracking in plan.md MUST justify any violations
- Code reviews MUST validate constitution adherence
- No deployment without constitution compliance

**Runtime Guidance**:

- Primary: `.github/copilot-instructions.md` (architecture and patterns)
- Architecture details: `docs/multi-agent-orchestration.md`
- Known issues: `AGENT_FRAMEWORK_FEEDBACK.md`
- Quick reference: `README.md`

**Version**: 1.0.0 | **Ratified**: 2025-11-11 | **Last Amended**: 2025-11-11
