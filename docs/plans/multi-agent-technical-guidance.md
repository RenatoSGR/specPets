# Multi-Agent Pet Sitter Marketplace Technical Guidance

## Overview

This document provides comprehensive technical guidance for implementing a production-ready multi-agent pet sitter marketplace using Azure AI Foundry and Microsoft Agent Framework. It covers agent architecture patterns, Azure integration, multi-agent coordination, and observability.

## 1. Agent Architecture Patterns

### 1.1 Specialized Agent Design

**Core Principles:**
- **Single Responsibility**: Each agent handles one domain (sitter search, booking, venues)
- **Stateless Design**: Agents don't maintain conversation state between requests
- **Tool-Based Architecture**: Use tools for external integrations (file search, APIs)
- **Clear Boundaries**: Define explicit input/output contracts

```python
# Example: Sitter Search Agent
from agent_framework import ChatAgent
from agent_framework_azure_ai import AzureAIAgentClient
from azure.identity import DefaultAzureCredential

class SitterSearchAgent:
    def __init__(self, endpoint: str, model_deployment: str):
        self.client = AzureAIAgentClient(
            project_endpoint=endpoint,
            model_deployment_name=model_deployment,
            async_credential=DefaultAzureCredential(),
            agent_name="SitterSearchAgent"
        )
        
        self.agent = ChatAgent(
            chat_client=self.client,
            instructions="""You are a pet sitter recommendation specialist.
            Search through available sitters based on:
            - Location and availability
            - Pet type compatibility
            - Service type (walking, sitting, boarding)
            - Reviews and ratings
            
            Use the search_sitters tool to find matches.""",
            tools=[self.search_sitters_tool]
        )
    
    @ai_function
    async def search_sitters_tool(
        self, 
        location: str, 
        pet_type: str, 
        service_type: str,
        date_range: str
    ) -> str:
        """Search for available pet sitters"""
        # Implementation with database/API calls
        pass
```

### 1.2 Agent Communication Patterns

**HTTP-Based Communication:**
```python
# Orchestrator delegating to specialized agents
import aiohttp
import json

class OrchestratorAgent:
    def __init__(self):
        self.sitter_agent_url = "http://localhost:8002"
        self.venue_agent_url = "http://localhost:8001"
    
    @ai_function
    async def query_sitter_agent(self, query: str) -> str:
        """Delegate sitter-related queries to SitterAgent"""
        async with aiohttp.ClientSession() as session:
            payload = {
                "messages": [{"role": "user", "content": query}]
            }
            async with session.post(
                f"{self.sitter_agent_url}/chat",
                json=payload,
                headers={"Content-Type": "application/json"}
            ) as response:
                result = await response.json()
                return result.get("message", {}).get("content", "")
    
    @ai_function
    async def query_venue_agent(self, query: str) -> str:
        """Delegate venue-related queries to VenueAgent"""
        # Similar implementation
        pass
```

## 2. Azure AI Foundry Integration

### 2.1 Authentication with DefaultAzureCredential

```python
from azure.identity import DefaultAzureCredential, AzureCliCredential
from agent_framework_azure_ai import AzureAIAgentClient

# Production: Use DefaultAzureCredential (supports Managed Identity)
credential = DefaultAzureCredential()

# Development: Use AzureCliCredential for local development
# credential = AzureCliCredential()

client = AzureAIAgentClient(
    project_endpoint="https://your-project.ai.azure.com",
    model_deployment_name="gpt-4o",  # or your deployed model
    async_credential=credential,
    agent_name="PetSitterAgent"
)
```

### 2.2 File Search Agent Configuration

**Critical Pattern: Thread Tool Resources Setup**

```python
from agent_framework import ChatAgent
from agent_framework_azure_ai import AzureAIAgentClient

class VenueSearchAgent:
    def __init__(self, endpoint: str, model_deployment: str, vector_store_id: str):
        self.vector_store_id = vector_store_id
        self.client = AzureAIAgentClient(
            project_endpoint=endpoint,
            model_deployment_name=model_deployment,
            async_credential=DefaultAzureCredential(),
            agent_name="VenueSearchAgent"
        )
        
        # Create agent with file search tool
        self.agent = ChatAgent(
            chat_client=self.client,
            instructions="""You are a pet venue specialist. 
            Use file search to find dog parks, pet stores, and veterinary clinics.
            Base recommendations on location, services, and reviews.""",
            tools=["file_search"]  # Enable file search tool
        )
    
    async def generate_response(self, messages: list) -> str:
        """Generate response with file search capabilities"""
        # CRITICAL: Attach vector store to thread
        thread_options = {
            "tool_resources": {
                "file_search": {
                    "vector_store_ids": [self.vector_store_id]
                }
            }
        }
        
        # Run with thread tool resources
        response = await self.agent.run(
            messages=messages,
            thread_options=thread_options
        )
        
        return response.text
```

### 2.3 Tool Configuration Best Practices

**Function Tools for Local Data:**
```python
@ai_function
async def search_sitters(
    location: Annotated[str, "Search location (city, zip code)"],
    pet_type: Annotated[str, "Type of pet (dog, cat, bird, etc.)"],
    service_type: Annotated[str, "Service needed (walking, sitting, boarding)"]
) -> str:
    """Search for available pet sitters in the specified location"""
    # Load from local JSON file or database
    with open("data/pet-sitters.json", "r") as f:
        sitters_data = json.load(f)
    
    # Filter logic here
    matching_sitters = filter_sitters(sitters_data, location, pet_type, service_type)
    
    return json.dumps(matching_sitters, indent=2)
```

## 3. Multi-Agent Coordination Patterns

### 3.1 Orchestrator Agent Implementation

```python
from agent_framework import ChatAgent, WorkflowBuilder, Executor, WorkflowContext, handler
from typing_extensions import Never

class AgentOrchestratorExecutor(Executor):
    def __init__(self, sitter_agent_url: str, venue_agent_url: str):
        super().__init__(id="orchestrator")
        self.sitter_agent_url = sitter_agent_url
        self.venue_agent_url = venue_agent_url
        
        # Create orchestrator agent with delegation tools
        self.agent = ChatAgent(
            chat_client=client,
            instructions="""You coordinate pet care queries by delegating to specialists:
            - Use query_sitter_agent for sitter searches, bookings, reviews
            - Use query_venue_agent for dog parks, pet stores, veterinarians
            - Synthesize responses from multiple agents when needed""",
            tools=[self.query_sitter_agent, self.query_venue_agent]
        )
    
    @handler
    async def handle_request(self, query: str, ctx: WorkflowContext[Never, str]) -> None:
        """Process user query through orchestration"""
        messages = [{"role": "user", "content": query}]
        response = await self.agent.run(messages)
        await ctx.yield_output(response.text)
    
    @ai_function
    async def query_sitter_agent(self, query: str) -> str:
        """Delegate to sitter specialist agent"""
        async with aiohttp.ClientSession() as session:
            # Implementation here
            pass
    
    @ai_function
    async def query_venue_agent(self, query: str) -> str:
        """Delegate to venue specialist agent"""
        async with aiohttp.ClientSession() as session:
            # Implementation here
            pass

# Create workflow
orchestrator = AgentOrchestratorExecutor(
    sitter_agent_url="http://localhost:8002",
    venue_agent_url="http://localhost:8001"
)

workflow = WorkflowBuilder().set_start_executor(orchestrator).build()

# Run workflow
async for event in workflow.run_stream("Find a dog sitter in Seattle for this weekend"):
    if isinstance(event, WorkflowOutputEvent):
        print(f"Result: {event.data}")
```

### 3.2 Response Synthesis Pattern

```python
@ai_function
async def complex_query_handler(self, user_query: str) -> str:
    """Handle complex queries requiring multiple agents"""
    
    # Analyze query to determine which agents to call
    needs_sitter = "sitter" in user_query.lower() or "walk" in user_query.lower()
    needs_venue = "park" in user_query.lower() or "vet" in user_query.lower()
    
    responses = {}
    
    if needs_sitter:
        sitter_response = await self.query_sitter_agent(user_query)
        responses["sitter"] = sitter_response
    
    if needs_venue:
        venue_response = await self.query_venue_agent(user_query)
        responses["venue"] = venue_response
    
    # Synthesize final response
    synthesis_prompt = f"""
    User asked: {user_query}
    
    Sitter agent response: {responses.get('sitter', 'N/A')}
    Venue agent response: {responses.get('venue', 'N/A')}
    
    Provide a comprehensive, well-organized response that combines relevant information.
    """
    
    synthesis_messages = [{"role": "user", "content": synthesis_prompt}]
    final_response = await self.agent.run(synthesis_messages)
    
    return final_response.text
```

## 4. Agent Framework FastAPI Integration

### 4.1 Production FastAPI Server Pattern

```python
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from contextlib import asynccontextmanager
import logging
import os

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management"""
    # Startup
    logger.info("Starting agent service...")
    # Initialize agents, connections, etc.
    yield
    # Shutdown
    logger.info("Shutting down agent service...")

app = FastAPI(
    title="Pet Sitter Agent Service",
    description="Specialized agent for pet sitter recommendations",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for multi-agent communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Frontend
        "http://localhost:8003",  # Orchestrator agent
        os.getenv("FRONTEND_URL", "")  # Dynamic frontend URL from Aspire
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check for service discovery and monitoring"""
    return {
        "status": "healthy",
        "service": "sitter-agent",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

# Main chat endpoint
@app.post("/chat")
async def chat_endpoint(request: Request):
    """Main chat endpoint for agent communication"""
    try:
        data = await request.json()
        messages = data.get("messages", [])
        
        if not messages:
            raise HTTPException(status_code=400, detail="Messages required")
        
        # Process with agent
        response = await sitter_agent.run(messages)
        
        return {
            "message": {
                "role": "assistant",
                "content": response.text
            },
            "metadata": {
                "agent": "sitter-search",
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# Run with uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8002")),
        log_level="info"
    )
```

### 4.2 uv Dependency Management

**pyproject.toml Pattern:**
```toml
[project]
name = "sitter-agent"
version = "0.1.0"
description = "Pet sitter recommendation agent"
dependencies = [
    "agent-framework-azure-ai>=0.1.0rc1",
    "fastapi>=0.104.0",
    "uvicorn[standard]>=0.24.0",
    "azure-identity>=1.15.0",
    "aiohttp>=3.9.0"
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-asyncio>=0.21.0"
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.uv]
dev-dependencies = [
    "pytest>=7.4.0",
    "pytest-asyncio>=0.21.0"
]
```

**Development Commands:**
```bash
# Install dependencies
uv sync

# Run agent
uv run python app.py

# Run tests
uv run pytest

# Add new dependency
uv add azure-cosmos
```

## 5. Error Handling & Observability

### 5.1 OpenTelemetry Integration

```python
# Set up tracing at application startup
from agent_framework.observability import setup_observability

# Configure OpenTelemetry for Agent Framework
setup_observability(
    otlp_endpoint="http://localhost:4317",  # Aspire OTLP endpoint
    enable_sensitive_data=True  # Capture prompts/completions in dev
)
```

### 5.2 Structured Logging Pattern

```python
import logging
import json
from datetime import datetime

class AgentLogger:
    def __init__(self, agent_name: str):
        self.logger = logging.getLogger(f"agent.{agent_name}")
        self.agent_name = agent_name
    
    def log_tool_invocation(self, tool_name: str, arguments: dict, result: any = None, error: Exception = None):
        """Log tool invocation with structured data"""
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "agent": self.agent_name,
            "event_type": "tool_invocation",
            "tool_name": tool_name,
            "arguments": arguments,
            "success": error is None
        }
        
        if error:
            log_data["error"] = str(error)
            log_data["error_type"] = type(error).__name__
            self.logger.error("Tool invocation failed", extra=log_data)
        else:
            log_data["result_type"] = type(result).__name__
            self.logger.info("Tool invocation completed", extra=log_data)
    
    def log_agent_response(self, input_messages: list, response: str, duration_ms: int):
        """Log agent response with performance metrics"""
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "agent": self.agent_name,
            "event_type": "agent_response",
            "input_message_count": len(input_messages),
            "response_length": len(response),
            "duration_ms": duration_ms
        }
        self.logger.info("Agent response generated", extra=log_data)

# Usage in agent
logger = AgentLogger("sitter-search")

@ai_function
async def search_sitters(location: str, pet_type: str) -> str:
    """Search for available sitters"""
    start_time = time.time()
    
    try:
        # Tool logic here
        result = perform_search(location, pet_type)
        
        logger.log_tool_invocation(
            "search_sitters",
            {"location": location, "pet_type": pet_type},
            result
        )
        
        return json.dumps(result)
        
    except Exception as e:
        logger.log_tool_invocation(
            "search_sitters",
            {"location": location, "pet_type": pet_type},
            error=e
        )
        raise
```

### 5.3 Multi-Agent Workflow Debugging

```python
from agent_framework import (
    WorkflowBuilder, 
    WorkflowOutputEvent, 
    ExecutorCompletedEvent,
    ExecutorFailedEvent,
    AgentRunEvent
)

# Comprehensive event logging for workflows
async def run_workflow_with_logging(workflow, input_data):
    """Run workflow with comprehensive logging"""
    logger = logging.getLogger("workflow.orchestrator")
    
    async for event in workflow.run_stream(input_data):
        if isinstance(event, ExecutorCompletedEvent):
            logger.info(f"Executor {event.executor_id} completed successfully")
            
        elif isinstance(event, ExecutorFailedEvent):
            logger.error(
                f"Executor {event.executor_id} failed: {event.details.message}",
                extra={
                    "executor_id": event.executor_id,
                    "error_type": event.details.error_type,
                    "error_message": event.details.message
                }
            )
            
        elif isinstance(event, AgentRunEvent):
            logger.info(
                f"Agent {event.executor_id} processing",
                extra={
                    "executor_id": event.executor_id,
                    "event_data": str(event.data)[:200]  # Truncate for logging
                }
            )
            
        elif isinstance(event, WorkflowOutputEvent):
            logger.info(f"Workflow output: {event.data}")
            return event.data
```

## 6. .NET Aspire Integration

### 6.1 AppHost Configuration for Python Agents

```csharp
// AppHost/AppHost.cs
var builder = DistributedApplication.CreateBuilder(args);

// Python agents with uv environment
var sitterAgent = builder.AddPythonScript(
        "sitter-agent",
        "../sitter-agent",
        "app.py")
    .WithUvEnvironment()
    .WithIconName("ChatEmpty")
    .WithEnvironment("AZURE_OPENAI_ENDPOINT", azureOpenAI.GetEndpoint("https"))
    .WithEnvironment("FRONTEND_URL", frontend.GetEndpoint("http"))
    .WithEnvironment("PORT", "8002")
    .PublishAsDockerFile();

var orchestratorAgent = builder.AddPythonScript(
        "orchestrator-agent", 
        "../orchestrator-agent",
        "orchestrator.py")
    .WithUvEnvironment()
    .WithIconName("BranchFork")
    .WithEnvironment("SITTER_AGENT_URL", sitterAgent.GetEndpoint("http"))
    .WithEnvironment("VENUE_AGENT_URL", venueAgent.GetEndpoint("http"))
    .WithEnvironment("FRONTEND_URL", frontend.GetEndpoint("http"))
    .WithEnvironment("PORT", "8003")
    .PublishAsDockerFile();

// Frontend with agent URLs
var frontend = builder.AddNpmApp("frontend", "../frontend")
    .WithReference(sitterAgent)
    .WithReference(orchestratorAgent)
    .WithEnvironment("REACT_APP_ORCHESTRATOR_URL", orchestratorAgent.GetEndpoint("http"))
    .WithIconName("Globe")
    .WithExternalHttpEndpoints()
    .PublishAsDockerFile();

// Service dependencies and ordering
sitterAgent.WaitFor(azureOpenAI);
orchestratorAgent.WaitFor(sitterAgent).WaitFor(venueAgent);
frontend.WaitFor(orchestratorAgent);

builder.Build().Run();
```

### 6.2 Health Check Integration

```python
# Health check compatible with Aspire monitoring
@app.get("/health")
async def health_check():
    """Health check endpoint for Aspire monitoring"""
    try:
        # Check agent initialization
        if not hasattr(app.state, 'agent') or app.state.agent is None:
            raise Exception("Agent not initialized")
        
        # Check external dependencies
        # await check_azure_connectivity()
        
        return {
            "status": "Healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "service": "sitter-agent",
            "checks": {
                "agent_initialized": True,
                "azure_connection": True
            }
        }
    except Exception as e:
        return {
            "status": "Unhealthy", 
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

# Startup event to initialize agent
@app.on_event("startup")
async def startup_event():
    """Initialize agent on startup"""
    try:
        # Initialize agent
        app.state.agent = await create_sitter_agent()
        logger.info("Sitter agent initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize agent: {e}")
        raise
```

## 7. Production Deployment Considerations

### 7.1 Environment Configuration

```python
# config.py
import os
from dataclasses import dataclass

@dataclass
class AgentConfig:
    azure_openai_endpoint: str
    model_deployment: str
    vector_store_id: str = None
    enable_telemetry: bool = True
    log_level: str = "INFO"
    cors_origins: list[str] = None
    
    @classmethod
    def from_env(cls) -> 'AgentConfig':
        return cls(
            azure_openai_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
            model_deployment=os.getenv("MODEL_DEPLOYMENT", "gpt-4o"),
            vector_store_id=os.getenv("VECTOR_STORE_ID"),
            enable_telemetry=os.getenv("ENABLE_TELEMETRY", "true").lower() == "true",
            log_level=os.getenv("LOG_LEVEL", "INFO"),
            cors_origins=os.getenv("CORS_ORIGINS", "").split(",") if os.getenv("CORS_ORIGINS") else ["*"]
        )
```

### 7.2 Container Health Checks

```dockerfile
# Dockerfile for Python agents
FROM python:3.12-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

# Set working directory
WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen --no-cache

# Copy application code
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8002/health || exit 1

# Run the application
CMD ["uv", "run", "python", "app.py"]
```

## 8. Testing Patterns

### 8.1 Agent Unit Testing

```python
import pytest
from unittest.mock import AsyncMock, patch
from agent_framework import ChatMessage

@pytest.mark.asyncio
async def test_sitter_search_tool():
    """Test sitter search tool functionality"""
    # Mock the agent client
    mock_client = AsyncMock()
    
    # Create agent instance
    agent = SitterSearchAgent(
        endpoint="https://test.ai.azure.com",
        model_deployment="test-model"
    )
    agent.client = mock_client
    
    # Test tool function
    result = await agent.search_sitters_tool(
        location="Seattle",
        pet_type="dog",
        service_type="walking",
        date_range="2024-01-15 to 2024-01-17"
    )
    
    assert result is not None
    assert "Seattle" in result or "No sitters found" in result

@pytest.mark.asyncio 
async def test_orchestrator_delegation():
    """Test orchestrator delegation to specialist agents"""
    with patch('aiohttp.ClientSession') as mock_session:
        # Mock HTTP responses
        mock_response = AsyncMock()
        mock_response.json.return_value = {
            "message": {"content": "Found 3 dog sitters in Seattle"}
        }
        mock_session.return_value.__aenter__.return_value.post.return_value.__aenter__.return_value = mock_response
        
        orchestrator = OrchestratorAgent()
        result = await orchestrator.query_sitter_agent("Find dog sitters in Seattle")
        
        assert "3 dog sitters" in result
```

## 9. Common Pitfalls and Solutions

### 9.1 Vector Store Configuration Issues

**Problem**: File search not finding relevant documents
**Solution**: Ensure thread tool resources are properly attached

```python
# WRONG: Missing tool_resources
response = await agent.run(messages)

# CORRECT: Attach vector store to thread
thread_options = {
    "tool_resources": {
        "file_search": {
            "vector_store_ids": [vector_store_id]
        }
    }
}
response = await agent.run(messages, thread_options=thread_options)
```

### 9.2 CORS Configuration for Multi-Agent Communication

**Problem**: Cross-origin requests blocked between agents
**Solution**: Configure CORS properly for agent-to-agent communication

```python
# Include all agent URLs in CORS origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Frontend
        "http://localhost:8001",  # Venue agent
        "http://localhost:8002",  # Sitter agent  
        "http://localhost:8003",  # Orchestrator
        os.getenv("FRONTEND_URL", "")
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

### 9.3 Authentication in Distributed Environments

**Problem**: DefaultAzureCredential fails in production
**Solution**: Use Managed Identity in Azure deployment

```python
# Environment-aware credential selection
def get_credential():
    if os.getenv("AZURE_CLIENT_ID"):
        # Production: Managed Identity
        return DefaultAzureCredential()
    else:
        # Development: Azure CLI
        return AzureCliCredential()

credential = get_credential()
```

## 10. Data Architecture Integration

### 10.1 Entity Framework Core Integration

For detailed database design patterns, see the comprehensive [EF Core Design Patterns Research](./ef-core-design-patterns-research.md) which provides:

- **Modern .NET 9.0/EF Core 9.0 patterns** using complex types for value objects
- **Efficient many-to-many relationships** with proper join entity configuration  
- **Location-based querying** with spatial indexing for sitter search
- **Bidirectional review system** with polymorphic relationships
- **Availability conflict prevention** through strategic indexing
- **Performance optimization** patterns for marketplace queries

### 10.2 Agent-Database Integration Pattern

```python
# Service layer for agent-database interaction
class SitterSearchService:
    def __init__(self, db_connection_string: str):
        self.connection_string = db_connection_string
    
    async def find_sitters_near_location(
        self, 
        latitude: float, 
        longitude: float, 
        radius_miles: int = 25,
        pet_type_ids: list[int] = None,
        start_date: str = None,
        end_date: str = None
    ) -> list[dict]:
        """Find sitters using EF Core location-based queries"""
        # This would integrate with the EF Core patterns from the research doc
        async with get_db_context(self.connection_string) as context:
            # Use the optimized location query patterns
            return await context.find_sitters_near_location_async(
                latitude, longitude, radius_miles, pet_type_ids, start_date, end_date
            )

# Integration in agent tool
@ai_function
async def search_sitters_tool(
    location: Annotated[str, "Search location (city, zip code)"],
    pet_type: Annotated[str, "Type of pet (dog, cat, bird, etc.)"],
    service_type: Annotated[str, "Service needed (walking, sitting, boarding)"],
    date_range: Annotated[str, "Date range for booking (YYYY-MM-DD to YYYY-MM-DD)"]
) -> str:
    """Search for available pet sitters using database queries"""
    
    # Geocode location to coordinates
    coordinates = await geocode_service.get_coordinates(location)
    
    # Parse date range
    start_date, end_date = parse_date_range(date_range)
    
    # Query database using EF Core patterns
    sitter_service = SitterSearchService(os.getenv("DATABASE_CONNECTION_STRING"))
    results = await sitter_service.find_sitters_near_location(
        coordinates.latitude,
        coordinates.longitude, 
        radius_miles=25,
        pet_type_ids=get_pet_type_ids(pet_type),
        start_date=start_date,
        end_date=end_date
    )
    
    # Format results for agent response
    return format_sitter_search_results(results)
```

This comprehensive guide provides the foundation for building a production-ready multi-agent pet sitter marketplace using Azure AI Foundry and Microsoft Agent Framework. The integration with modern EF Core patterns ensures efficient data access and scalable marketplace operations. Follow these patterns for reliable, observable, and maintainable agent systems.