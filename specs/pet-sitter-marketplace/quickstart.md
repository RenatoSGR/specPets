# Quickstart Guide: Pet Sitter Marketplace Development

**Feature**: 001-pet-sitter-marketplace  
**Last Updated**: October 21, 2025

## Prerequisites

Before starting development on the Pet Sitter Marketplace feature, ensure you have:

### Required Tools

- [ ] **.NET SDK 9.0+**: `dotnet --version` (for backend and Aspire)
- [ ] **Node.js 18+**: `node --version` (for React frontend)
- [ ] **Python 3.8+**: `python --version` (for AI agents)
- [ ] **uv**: `uv --version` (Python package manager) - Install: `curl -LsSf https://astral.sh/uv/install.sh | sh`
- [ ] **Azure CLI**: `az --version` - Install: [Azure CLI docs](https://docs.microsoft.com/cli/azure/install-azure-cli)
- [ ] **Git**: `git --version`

### Azure Setup

1. **Azure CLI Authentication**:
   ```bash
   az login
   az account set --subscription <your-subscription-id>
   ```

2. **Verify Authentication**:
   ```bash
   az account show
   ```
   
   This authentication is **required** for AI agents to use `DefaultAzureCredential`.

### GitHub Authentication (for Python packages)

Some Python dependencies are hosted on GitHub Packages:

```bash
gh auth login
```

---

## Initial Setup

### 1. Clone and Navigate to Repository

```bash
git clone https://github.com/maddymontaquila/octopets.git
cd octopets
git checkout 001-pet-sitter-marketplace
```

### 2. Verify Existing Infrastructure

The Octopets project already has the core infrastructure. Verify:

```bash
# Check Aspire AppHost
ls apphost/AppHost.cs

# Check backend
ls backend/Program.cs

# Check frontend
ls frontend/package.json

# Check existing agents
ls agent/agent.py sitter-agent/pet_sitter_agent.py orchestrator-agent/orchestrator.py
```

### 3. Install Dependencies

**Backend** (if not already installed):
```bash
cd backend
dotnet restore
cd ..
```

**Frontend** (if not already installed):
```bash
cd frontend
npm install
cd ..
```

**Python Agents** (for each agent directory):
```bash
# Chat/listings agent
cd agent
uv sync
cd ..

# Sitter agent
cd sitter-agent
uv sync
cd ..

# Orchestrator agent
cd orchestrator-agent
uv sync
cd ..
```

---

## Running the Application

### Single Command Start (Recommended)

```bash
aspire run
```

This command:
- Starts all services (backend, frontend, 3 Python agents)
- Opens Aspire Dashboard at `http://localhost:15888`
- Configures service discovery automatically
- Enables hot reload for all services

**Aspire Dashboard** provides:
- Service endpoints (click to open frontend, backend, etc.)
- Logs from all services
- Distributed tracing
- Health checks
- Environment variables

### Alternative: dotnet run

```bash
dotnet run --project apphost
```

Same behavior as `aspire run`.

---

## Development Workflows

### Adding New Backend Entities (Example: PetOwner)

1. **Create Model** in `backend/Models/PetOwner.cs`:
   ```csharp
   public class PetOwner
   {
       public int Id { get; set; }
       public string Email { get; set; } = string.Empty;
       public string Name { get; set; } = string.Empty;
       // ... additional fields from data-model.md
   }
   ```

2. **Create Repository Interface** in `backend/Repositories/Interfaces/IPetOwnerRepository.cs`:
   ```csharp
   public interface IPetOwnerRepository
   {
       Task<PetOwner?> GetByIdAsync(int id);
       Task<PetOwner?> GetByEmailAsync(string email);
       Task<List<PetOwner>> GetAllAsync();
       Task<PetOwner> CreateAsync(PetOwner owner);
       Task<PetOwner> UpdateAsync(PetOwner owner);
       Task<bool> DeleteAsync(int id);
   }
   ```

3. **Implement Repository** in `backend/Repositories/PetOwnerRepository.cs`:
   ```csharp
   public class PetOwnerRepository : IPetOwnerRepository
   {
       private readonly AppDbContext _context;
       public PetOwnerRepository(AppDbContext context) => _context = context;
       
       public async Task<PetOwner?> GetByIdAsync(int id) =>
           await _context.PetOwners.FindAsync(id);
       // ... implement other methods
   }
   ```

4. **Register in AppDbContext** (`backend/Data/AppDbContext.cs`):
   ```csharp
   public DbSet<PetOwner> PetOwners { get; set; } = null!;
   ```

5. **Add Seed Data** in `AppDbContext.cs` `OnModelCreating`:
   ```csharp
   modelBuilder.Entity<PetOwner>().HasData(
       new PetOwner { Id = 1, Email = "owner1@example.com", Name = "Jane Doe", ... }
   );
   ```

6. **Create Endpoints** in `backend/Endpoints/PetOwnerEndpoints.cs`:
   ```csharp
   public static class PetOwnerEndpoints
   {
       public static void MapPetOwnerEndpoints(this WebApplication app)
       {
           var group = app.MapGroup("/api/pet-owners").WithTags("PetOwners");
           
           group.MapGet("/{id}", async (int id, IPetOwnerRepository repo) =>
           {
               var owner = await repo.GetByIdAsync(id);
               return owner is not null ? Results.Ok(owner) : Results.NotFound();
           })
           .WithName("GetPetOwner")
           .WithOpenApi();
           
           // ... additional endpoints
       }
   }
   ```

7. **Register Endpoints** in `backend/Program.cs`:
   ```csharp
   app.MapPetOwnerEndpoints();
   ```

8. **Register Repository** in `backend/Program.cs`:
   ```csharp
   builder.Services.AddScoped<IPetOwnerRepository, PetOwnerRepository>();
   ```

### Adding New Frontend Pages (Example: Search Page)

1. **Create Page Component** in `frontend/src/pages/Search.tsx`:
   ```typescript
   import React, { useState, useEffect } from 'react';
   
   export default function Search() {
       const [sitters, setSitters] = useState([]);
       const [loading, setLoading] = useState(false);
       
       // ... search logic
       
       return (
           <div>
               <h1>Find Pet Sitters</h1>
               {/* Search form, results list */}
           </div>
       );
   }
   ```

2. **Add Route** in `frontend/src/App.tsx`:
   ```typescript
   import { BrowserRouter, Routes, Route } from 'react-router-dom';
   import Search from './pages/Search';
   
   function App() {
       return (
           <BrowserRouter>
               <Routes>
                   <Route path="/search" element={<Search />} />
                   {/* ... existing routes */}
               </Routes>
           </BrowserRouter>
       );
   }
   ```

3. **Create API Service** in `frontend/src/data/petSitterService.ts`:
   ```typescript
   const API_BASE = process.env.REACT_APP_API_URL || '';
   
   export interface PetSitter {
       id: number;
       name: string;
       // ... fields from data-model.md
   }
   
   export async function searchSitters(location: string, startDate: Date, endDate: Date): Promise<PetSitter[]> {
       const response = await fetch(`${API_BASE}/api/sitters/search?location=${location}&start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
       if (!response.ok) throw new Error('Search failed');
       return response.json();
   }
   ```

4. **Hot Reload**: Changes auto-reload via Aspire - no manual restart needed

### Modifying AI Agents

1. **Edit Agent Code** (example: `sitter-agent/pet_sitter_agent.py`):
   ```python
   from azure.ai.inference import ChatAgent
   
   def create_sitter_agent(client):
       agent = client.agents.create_agent(
           model="gpt-4.1-mini",
           name="Pet Sitter Agent",
           instructions="Help users find pet sitters...",
           tools=[
               {"type": "function", "function": check_availability_function}
           ]
       )
       return agent
   ```

2. **Sync Dependencies** if adding packages:
   ```bash
   cd sitter-agent
   uv add <package-name>
   uv sync
   ```

3. **Test Standalone** (optional):
   ```bash
   cd sitter-agent
   uv run python pet_sitter_agent.py
   # Interactive CLI for testing
   ```

4. **Restart via Aspire**: Stop `aspire run` (Ctrl+C) and restart - agent changes reload

### Synchronizing Mock Data

**CRITICAL**: Mock data must be synchronized across three locations.

1. **Update Source JSON** in `/data/pet-sitter.json`:
   ```json
   [
       {
           "id": 1,
           "email": "sitter1@example.com",
           "name": "John Smith",
           "city": "New York",
           ...
       }
   ]
   ```

2. **Update Frontend** in `frontend/src/data/petSitterData.ts`:
   ```typescript
   export interface PetSitter {
       id: number;
       email: string;
       name: string;
       city: string;
       // ... match JSON structure
   }
   
   export const mockPetSitters: PetSitter[] = [
       {
           id: 1,
           email: "sitter1@example.com",
           name: "John Smith",
           city: "New York",
           ...
       }
   ];
   ```

3. **Update Backend Seed** in `backend/Data/AppDbContext.cs`:
   ```csharp
   modelBuilder.Entity<PetSitter>().HasData(
       new PetSitter { Id = 1, Email = "sitter1@example.com", Name = "John Smith", City = "New York", ... }
   );
   ```

4. **Validation**: Run validation script:
   ```bash
   .specify/scripts/validate-mock-data.sh
   ```

---

## Testing

### Backend API Testing

1. **Scalar UI** (automatically available in development):
   - Navigate to `http://localhost:<backend-port>/scalar/v1`
   - Find backend port in Aspire Dashboard
   - Interactive API documentation with "Try it" buttons

2. **Manual HTTP Requests**:
   ```bash
   # Get pet owner
   curl http://localhost:<backend-port>/api/pet-owners/1
   
   # Create booking
   curl -X POST http://localhost:<backend-port>/api/bookings \
     -H "Content-Type: application/json" \
     -d '{"petOwnerId":1,"petSitterId":2,"serviceId":1,...}'
   ```

### Frontend Testing

1. **Browser**: Open frontend URL from Aspire Dashboard (typically `http://localhost:5173`)

2. **Playwright E2E Tests**:
   ```bash
   cd frontend
   npm run test:e2e
   ```

3. **Mock Data Mode**: Toggle in `frontend/src/config/appConfig.ts`:
   ```typescript
   export const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === 'true';
   ```

### Agent Testing

1. **View Agent Logs** in Aspire Dashboard:
   - Click on agent service name
   - "Logs" tab shows all agent activity
   - Look for "Run Steps" output (tool invocations)

2. **Standalone CLI Testing**:
   ```bash
   cd orchestrator-agent
   uv run python orchestrator.py
   # Type queries interactively
   ```

3. **Agent Endpoint Testing**:
   ```bash
   # Send message to orchestrator
   curl -X POST http://localhost:8003/agent/chat \
     -H "Content-Type: application/json" \
     -d '{"message":"Find me a dog sitter in Seattle"}'
   ```

---

## Common Issues & Solutions

### Issue: "DefaultAzureCredential authentication failed"

**Solution**: Run `az login` before starting Aspire:
```bash
az login
aspire run
```

### Issue: "uv not found" in Python agents

**Solution**: Install uv:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
source ~/.zshrc  # or restart terminal
```

### Issue: Agent not using tools (empty "Run Steps")

**Solution**: Verify `tool_resources` passed to thread creation (see `AGENT_FRAMEWORK_FEEDBACK.md`):
```python
thread = client.agents.create_thread(
    tool_resources={
        "file_search": {
            "vector_store_ids": [vector_store_id]
        }
    }
)
```

### Issue: Frontend shows 404 for API calls

**Solution**: Check `FRONTEND_URL` env var in backend (set by AppHost). Verify CORS configuration in `backend/Program.cs`:
```csharp
app.UseCors(policy => policy
    .WithOrigins(frontendUrl)
    .AllowAnyHeader()
    .AllowAnyMethod());
```

### Issue: Mock data out of sync

**Solution**: Run validation script:
```bash
.specify/scripts/validate-mock-data.sh
```

Compare data structures across:
- `/data/*.json`
- `frontend/src/data/*Data.ts`
- `backend/Data/AppDbContext.cs` seed data

---

## Development Best Practices

### Constitution Compliance

✅ **Always** use Aspire orchestration (no standalone service execution)  
✅ **Never** hardcode URLs or ports (use service discovery)  
✅ **Always** synchronize mock data across all three locations  
✅ **Always** use `uv sync` for Python dependencies (never `pip install` directly)  
✅ **Always** invoke Azure MCP best practices tools before Azure-related code generation  
✅ **Always** invoke Azure AI Toolkit tools before agent code generation  

### Code Conventions

- **Backend Endpoints**: Use `.WithName()`, `.WithDescription()`, `.WithOpenApi()` on all routes
- **Repository Pattern**: Inject `I<Entity>Repository` in endpoint methods
- **EF Core**: Use async methods (`FindAsync`, `SaveChangesAsync`, etc.)
- **Frontend**: Use TypeScript interfaces matching backend C# models
- **Agents**: Use `ChatAgent` from Microsoft Agent Framework, not custom implementations

### Git Workflow

```bash
# Feature branch already exists
git checkout 001-pet-sitter-marketplace

# Make changes
git add .
git commit -m "feat: add PetOwner entity and endpoints"

# Push regularly
git push origin 001-pet-sitter-marketplace
```

---

## Next Steps

After quickstart setup:

1. **Review Data Model**: Read `specs/001-pet-sitter-marketplace/data-model.md`
2. **Review API Contracts**: Read `specs/001-pet-sitter-marketplace/contracts/*.yaml`
3. **Implement P1 User Stories**: Follow task breakdown in `specs/001-pet-sitter-marketplace/tasks.md` (generated by `/speckit.tasks`)
4. **Test Incrementally**: Use Aspire Dashboard logs and Scalar UI for validation

---

## Resources

- **Aspire Documentation**: https://learn.microsoft.com/dotnet/aspire
- **Microsoft Agent Framework**: https://github.com/microsoft/agent-framework
- **EF Core**: https://learn.microsoft.com/ef/core
- **React Router v6**: https://reactrouter.com
- **Octopets Constitution**: `.specify/memory/constitution.md`
- **Architecture Guide**: `.github/copilot-instructions.md`
- **Multi-Agent Patterns**: `docs/multi-agent-orchestration.md`

---

**Phase 1 Complete**: Development environment ready, data model defined, contracts generated.  
**Next Phase**: Use `/speckit.tasks` to generate implementation task breakdown from user stories.
