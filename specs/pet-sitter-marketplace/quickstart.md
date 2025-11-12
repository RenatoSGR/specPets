# Implementation Quickstart Guide

## Overview

This guide provides step-by-step instructions for implementing the Octopets Pet Sitter Marketplace Platform using .NET Aspire orchestration with React frontend, ASP.NET Core backend, and Python AI agents.

---

## Prerequisites

### Required Software
- **.NET 9.0 SDK** or later
- **Node.js 18+** with npm
- **Python 3.11+** 
- **Azure CLI** (for authentication)
- **Docker Desktop** (for deployment)
- **Visual Studio Code** with extensions:
  - C# Dev Kit
  - .NET Aspire
  - Python
  - React/TypeScript

### Azure Services Setup
1. **Azure AI Foundry** (formerly AI Studio)
   - Create AI Foundry project
   - Deploy GPT-4 model
   - Note: endpoint URL and API key
2. **Azure OpenAI Service** 
   - GPT-4 for agent orchestration
   - Text embedding model for vector search
3. **Azure Storage Account**
   - Blob containers for file uploads
   - Configure CORS for frontend access

### Authentication Setup
```bash
# Login to Azure CLI (required for agents)
az login

# Verify authentication context
az account show
```

---

## Project Structure Setup

### 1. Create Solution Structure
```bash
# Create root directory
mkdir octopets-marketplace
cd octopets-marketplace

# Create .NET solution
dotnet new sln -n OctopetsMarketplace

# Create project directories
mkdir src
mkdir src/AppHost
mkdir src/ServiceDefaults  
mkdir src/Backend
mkdir src/Frontend
mkdir src/Agents
mkdir src/Agents/ListingsAgent
mkdir src/Agents/SitterAgent
mkdir src/Agents/OrchestratorAgent
mkdir docs
mkdir scripts
```

### 2. Initialize .NET Aspire AppHost
```bash
cd src/AppHost

# Create Aspire AppHost project
dotnet new aspire-apphost -n AppHost

# Add Aspire packages
dotnet add package Aspire.Hosting.Python
dotnet add package Aspire.Hosting.NodeJs
```

### 3. Create Service Defaults Project
```bash
cd ../ServiceDefaults

# Create service defaults project
dotnet new aspire-servicedefaults -n ServiceDefaults

# Add to solution
cd ../../
dotnet sln add src/AppHost/AppHost.csproj
dotnet sln add src/ServiceDefaults/ServiceDefaults.csproj
```

---

## Backend Implementation

### 1. Create ASP.NET Core API
```bash
cd src/Backend

# Create Web API project
dotnet new webapi -n Backend

# Add required packages
dotnet add package Microsoft.EntityFrameworkCore.InMemory
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package Microsoft.Identity.Web
dotnet add package Scalar.AspNetCore

# Add service defaults reference
dotnet add reference ../ServiceDefaults/ServiceDefaults.csproj

# Add to solution
cd ../../
dotnet sln add src/Backend/Backend.csproj
```

### 2. Configure Backend Dependencies (Backend.csproj)
```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.EntityFrameworkCore.InMemory" Version="9.0.0" />
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="9.0.0" />
    <PackageReference Include="Microsoft.Identity.Web" Version="3.2.0" />
    <PackageReference Include="Scalar.AspNetCore" Version="1.2.0" />
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="9.0.0" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="../ServiceDefaults/ServiceDefaults.csproj" />
  </ItemGroup>
</Project>
```

### 3. Implement Core Backend Files

**Program.cs**
```csharp
using Backend.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add service defaults and Aspire client integrations
builder.AddServiceDefaults();

// Add Entity Framework with in-memory database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("OctopetsDb"));

// Add repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IPetRepository, PetRepository>();
builder.Services.AddScoped<IPetSitterRepository, PetSitterRepository>();
builder.Services.AddScoped<IBookingRepository, BookingRepository>();

// Add authentication
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.Authority = builder.Configuration["Authentication:Authority"];
        options.TokenValidationParameters.ValidateAudience = false;
    });

builder.Services.AddAuthorization();

// Add API services
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// Map API endpoints
app.MapGroup("/api/users").MapUserEndpoints();
app.MapGroup("/api/pets").MapPetEndpoints();
app.MapGroup("/api/sitters").MapSitterEndpoints();
app.MapGroup("/api/bookings").MapBookingEndpoints();
app.MapGroup("/api/messages").MapMessageEndpoints();
app.MapGroup("/api/search").MapSearchEndpoints();

// Map default endpoints
app.MapDefaultEndpoints();

// Ensure database is created and seeded
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.EnsureCreated();
}

app.Run();
```

**Data/AppDbContext.cs** (Create directory and file)
```csharp
using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Pet> Pets { get; set; }
    public DbSet<PetSitter> PetSitters { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<Message> Messages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure entity relationships and constraints
        modelBuilder.Entity<Pet>()
            .HasOne(p => p.Owner)
            .WithMany(u => u.Pets)
            .HasForeignKey(p => p.OwnerId);

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.PetOwner)
            .WithMany()
            .HasForeignKey(b => b.PetOwnerId);

        // Seed initial data
        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        // Seed users, pets, sitters according to data-model.md specifications
        // Implementation details in actual project files
    }
}
```

---

## Frontend Implementation

### 1. Create React Application
```bash
cd src/Frontend

# Create React TypeScript app
npx create-react-app . --template typescript

# Install additional dependencies
npm install @types/node @types/react @types/react-dom
npm install react-router-dom @types/react-router-dom
npm install @microsoft/signalr
npm install axios
npm install @headlessui/react @heroicons/react
npm install tailwindcss

# Install development dependencies
npm install --save-dev @playwright/test
```

### 2. Configure Frontend Dependencies (package.json)
```json
{
  "name": "octopets-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@headlessui/react": "^2.0.0",
    "@heroicons/react": "^2.0.0",
    "@microsoft/signalr": "^8.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "axios": "^1.6.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "react-scripts": "5.0.1",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "test:e2e": "playwright test"
  }
}
```

### 3. Configure Environment Variables (.env.development)
```bash
# Backend API URL (set by Aspire)
REACT_APP_API_BASE_URL=https://localhost:7001

# Agent endpoints (set by Aspire)  
REACT_APP_LISTINGS_AGENT_URL=https://localhost:8001
REACT_APP_SITTER_AGENT_URL=https://localhost:8002
REACT_APP_ORCHESTRATOR_AGENT_URL=https://localhost:8003

# Feature flags
REACT_APP_USE_MOCK_DATA=true
REACT_APP_ENABLE_AI_FEATURES=true

# Authentication
REACT_APP_AUTH_DOMAIN=your-auth-domain
REACT_APP_AUTH_CLIENT_ID=your-client-id
```

---

## Python AI Agents Implementation

### 1. Create Listings Agent
```bash
cd src/Agents/ListingsAgent

# Create Python project structure
touch pyproject.toml
touch agent.py
touch app.py
mkdir data
```

**pyproject.toml**
```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "listings-agent"
version = "0.1.0"
dependencies = [
    "fastapi>=0.104.0",
    "uvicorn[standard]>=0.24.0",
    "azure-ai-projects>=1.0.0b4",
    "azure-identity>=1.15.0",
    "python-multipart>=0.0.6",
    "pydantic>=2.5.0"
]

[project.scripts]
start = "uvicorn app:app --host 0.0.0.0 --port 8001"

[tool.uv]
dev-dependencies = [
    "pytest>=7.4.0",
    "black>=23.0.0",
    "flake8>=6.0.0"
]
```

**agent.py**
```python
import os
import asyncio
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential
from azure.ai.projects.models import AgentEventHandler, MessageDelta, AgentMessage

class ListingsAgentEventHandler(AgentEventHandler):
    def on_message_delta(self, delta: MessageDelta) -> None:
        if delta.content:
            for content_part in delta.content:
                if content_part.type == "text" and content_part.text:
                    print(f"Agent: {content_part.text.value}", end="", flush=True)

    def on_done(self) -> None:
        print("\n")

class ListingsAgent:
    def __init__(self):
        self.client = AIProjectClient.from_connection_string(
            conn_str=os.environ["AZURE_AI_PROJECT_CONNECTION_STRING"],
            credential=DefaultAzureCredential()
        )
        
        # Use existing agent or create new one
        self.agent_id = os.environ.get("LISTINGS_AGENT_ID")
        if not self.agent_id:
            self.agent = self._create_agent()
            self.agent_id = self.agent.id
        
    def _create_agent(self):
        return self.client.agents.create_agent(
            model="gpt-4",
            name="Pet Venue Listings Agent",
            instructions="""You are an expert pet venue and service listings agent for Octopets marketplace.
            
Your role:
- Help users find pet services and venues
- Provide detailed information about pet sitters, daycares, and boarding facilities  
- Use file search tool to access the comprehensive venue database
- Answer questions about pricing, availability, and service details
- Suggest suitable options based on pet type, location, and specific needs

Guidelines:
- Always be helpful and informative
- Prioritize pet safety and owner peace of mind
- Use location data to provide relevant nearby options
- Include pricing and availability information when available
- Suggest multiple options to give users choice""",
            tools=[{"type": "file_search"}]
        )

    async def generate_response(self, query: str, thread_id: str = None) -> str:
        try:
            # Create or get thread
            if thread_id:
                thread = self.client.agents.get_thread(thread_id=thread_id)
            else:
                thread = self.client.agents.create_thread()
            
            # Create message
            self.client.agents.create_message(
                thread_id=thread.id,
                role="user",
                content=query
            )
            
            # Run agent
            run = self.client.agents.create_and_process_run(
                thread_id=thread.id,
                assistant_id=self.agent_id,
                event_handler=ListingsAgentEventHandler()
            )
            
            # Get latest message
            messages = self.client.agents.list_messages(thread_id=thread.id, limit=1)
            
            if messages.data:
                return messages.data[0].content[0].text.value
            return "I apologize, but I couldn't generate a response."
            
        except Exception as e:
            print(f"Error in generate_response: {e}")
            return "I'm experiencing technical difficulties. Please try again later."

# Global agent instance
listings_agent = ListingsAgent()
```

### 2. Create FastAPI Application (app.py)
```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from agent import listings_agent

app = FastAPI(title="Listings Agent API", version="1.0.0")

# Configure CORS
frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str
    thread_id: str = None

class QueryResponse(BaseModel):
    response: str
    thread_id: str = None

@app.post("/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    try:
        response = await listings_agent.generate_response(
            query=request.query,
            thread_id=request.thread_id
        )
        
        return QueryResponse(
            response=response,
            thread_id=request.thread_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "agent": "listings"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
```

### 3. Create Similar Structure for Other Agents
```bash
# Copy ListingsAgent structure for SitterAgent and OrchestratorAgent
cp -r src/Agents/ListingsAgent src/Agents/SitterAgent
cp -r src/Agents/ListingsAgent src/Agents/OrchestratorAgent

# Update port numbers and agent-specific logic in each
# SitterAgent: Port 8002
# OrchestratorAgent: Port 8003
```

---

## Aspire AppHost Configuration

### 1. Configure AppHost Program.cs
```csharp
var builder = DistributedApplication.CreateBuilder(args);

// Add service defaults
var serviceDefaults = builder.AddProject<Projects.ServiceDefaults>("servicedefaults");

// Add backend API
var backend = builder.AddProject<Projects.Backend>("backend")
    .WithReference(serviceDefaults);

// Add React frontend
var frontend = builder.AddNpmApp("frontend", "../Frontend")
    .WithEnvironment("REACT_APP_API_BASE_URL", backend.GetEndpoint("http"))
    .WithHttpEndpoint(port: 3000, env: "PORT")
    .WithExternalHttpEndpoints()
    .PublishAsDockerFile();

// Add Python agents
var listingsAgent = builder.AddPythonScript("listings-agent", "../Agents/ListingsAgent", "app.py")
    .WithUvEnvironment()
    .WithHttpEndpoint(port: 8001, env: "PORT")
    .WithEnvironment("FRONTEND_URL", frontend.GetEndpoint("http"))
    .PublishAsDockerFile();

var sitterAgent = builder.AddPythonScript("sitter-agent", "../Agents/SitterAgent", "app.py")
    .WithUvEnvironment()
    .WithHttpEndpoint(port: 8002, env: "PORT")  
    .WithEnvironment("FRONTEND_URL", frontend.GetEndpoint("http"))
    .PublishAsDockerFile();

var orchestratorAgent = builder.AddPythonScript("orchestrator-agent", "../Agents/OrchestratorAgent", "app.py")
    .WithUvEnvironment()
    .WithHttpEndpoint(port: 8003, env: "PORT")
    .WithEnvironment("FRONTEND_URL", frontend.GetEndpoint("http"))
    .WithEnvironment("LISTINGS_AGENT_URL", listingsAgent.GetEndpoint("http"))
    .WithEnvironment("SITTER_AGENT_URL", sitterAgent.GetEndpoint("http"))
    .PublishAsDockerFile();

// Configure environment variables for frontend agent integration
frontend
    .WithEnvironment("REACT_APP_LISTINGS_AGENT_URL", listingsAgent.GetEndpoint("http"))
    .WithEnvironment("REACT_APP_SITTER_AGENT_URL", sitterAgent.GetEndpoint("http"))
    .WithEnvironment("REACT_APP_ORCHESTRATOR_AGENT_URL", orchestratorAgent.GetEndpoint("http"));

// Configure backend CORS
backend
    .WithEnvironment("FRONTEND_URL", frontend.GetEndpoint("http"));

// Set service dependencies
frontend.WaitFor(backend);
orchestratorAgent.WaitFor(listingsAgent).WaitFor(sitterAgent);

var app = builder.Build();

app.Run();
```

---

## Development Workflow

### 1. Initial Setup Commands
```bash
# Navigate to root directory
cd octopets-marketplace

# Restore .NET dependencies
dotnet restore

# Install Python dependencies for all agents
cd src/Agents/ListingsAgent && uv sync
cd ../SitterAgent && uv sync  
cd ../OrchestratorAgent && uv sync
cd ../../..

# Install frontend dependencies
cd src/Frontend && npm install
cd ../..
```

### 2. Running the Application
```bash
# Start all services with Aspire
cd src/AppHost
aspire run

# Or using dotnet run
dotnet run --project AppHost
```

This command will:
- Start the backend API on https://localhost:7001
- Start the frontend on http://localhost:3000
- Start all three Python agents on their respective ports
- Open Aspire Dashboard at http://localhost:15888

### 3. Development Commands
```bash
# Backend development
cd src/Backend
dotnet watch run

# Frontend development  
cd src/Frontend
npm start

# Individual agent development
cd src/Agents/ListingsAgent
uv run python app.py

# Run tests
cd src/Backend && dotnet test
cd src/Frontend && npm test
cd src/Frontend && npm run test:e2e
```

---

## Configuration Files

### 1. Backend appsettings.json
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "DataSource=:memory:"
  },
  "Authentication": {
    "Authority": "https://your-auth-provider.com",
    "Audience": "octopets-api"
  },
  "Azure": {
    "OpenAI": {
      "Endpoint": "https://your-openai-endpoint.openai.azure.com/",
      "ApiKey": "your-api-key"
    },
    "Storage": {
      "ConnectionString": "your-storage-connection-string"
    }
  },
  "Features": {
    "EnableCRUD": true,
    "UseInMemoryDatabase": true,
    "EnableMockData": true
  }
}
```

### 2. Frontend Dockerfile (auto-generated by Aspire)
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Python Agent Dockerfile (auto-generated by Aspire)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY pyproject.toml ./
RUN pip install uv && uv sync
COPY . .
EXPOSE 8001
CMD ["uv", "run", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001"]
```

---

## Testing Strategy

### 1. Backend Testing
```bash
cd src/Backend

# Add test project
dotnet new xunit -n Backend.Tests
dotnet add Backend.Tests reference Backend/Backend.csproj
dotnet add Backend.Tests package Microsoft.AspNetCore.Mvc.Testing

# Run tests
dotnet test
```

### 2. Frontend Testing
```bash
cd src/Frontend

# Unit tests
npm test

# E2E tests with Playwright
npx playwright install
npm run test:e2e
```

### 3. Agent Testing
```bash
cd src/Agents/ListingsAgent

# Add test dependencies
uv add --dev pytest pytest-asyncio httpx

# Create test file
touch test_agent.py

# Run tests
uv run pytest
```

---

## Deployment

### 1. Azure Deployment with Aspire
```bash
# Install Azure Developer CLI
winget install microsoft.azd

# Initialize for deployment
azd init

# Provision and deploy
azd up
```

### 2. Docker Deployment
```bash
# Build all services
aspire publish --output-path ./artifacts

# Deploy to container registry
docker compose -f ./artifacts/docker-compose.yml up -d
```

---

## Next Steps

1. **Complete Implementation**: Follow the detailed API contracts in `/contracts/` directory
2. **Database Setup**: Replace in-memory database with PostgreSQL/SQL Server for production
3. **Authentication**: Implement full OAuth 2.0/OpenID Connect authentication
4. **AI Features**: Configure Azure AI Foundry agents with vector search capabilities
5. **Monitoring**: Set up Application Insights and logging
6. **CI/CD**: Implement GitHub Actions or Azure DevOps pipelines

## Additional Resources

- [.NET Aspire Documentation](https://learn.microsoft.com/en-us/dotnet/aspire/)
- [Azure AI Foundry Documentation](https://learn.microsoft.com/en-us/azure/ai-studio/)
- [React TypeScript Documentation](https://react.dev/learn/typescript)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

---

## Troubleshooting

### Common Issues

1. **Python agent authentication**: Ensure `az login` is completed
2. **Frontend CORS**: Check `FRONTEND_URL` environment variable in backend
3. **Port conflicts**: Verify ports 3000, 7001, 8001-8003 are available
4. **Azure AI access**: Confirm Azure OpenAI service is properly configured
5. **Missing dependencies**: Run `uv sync` in each Python project

### Debug Commands
```bash
# Check Aspire service status
aspire ps

# View service logs
aspire logs <service-name>

# Check environment variables
aspire env

# Health checks
curl http://localhost:8001/health
```