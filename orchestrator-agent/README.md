# Orchestrator Agent

Main routing agent that coordinates between specialized agents in the Octopets multi-agent system.

## Features

- **Intelligent Routing**: Analyzes queries and routes to appropriate specialized agent
- **Multi-Agent Coordination**: Manages sitter agent and booking agent
- **Intent Classification**: Fast keyword-based intent detection
- **Health Monitoring**: Checks status of all sub-agents
- **Conversational**: Provides help and guidance when needed

## Specialized Agents

### Sitter Agent (Port 8001)
Handles:
- Finding and recommending pet sitters
- Sitter profiles and details
- Availability searches
- Match scoring

### Booking Agent (Port 8002)
Handles:
- Booking status checks
- Listing bookings
- Cancellations
- Cost estimates
- Booking tips

## Setup

### Prerequisites

- Python 3.11 or higher
- [uv](https://github.com/astral-sh/uv) package manager
- Azure AI Foundry account with API key
- Sitter agent and booking agent running

### Installation

1. Install dependencies:
```bash
uv pip install -e .
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
AZURE_AI_ENDPOINT=your_azure_ai_foundry_endpoint
AZURE_AI_KEY=your_api_key
SITTER_AGENT_URL=http://localhost:8001/agent/chat
BOOKING_AGENT_URL=http://localhost:8002/agent/chat
FRONTEND_URL=http://localhost:3000
PORT=8003
```

### Start All Agents

**Option 1: Manual Start (for testing)**
```bash
# Terminal 1 - Sitter Agent
cd sitter-agent
uv run python agent.py

# Terminal 2 - Booking Agent
cd booking-agent
uv run python agent.py

# Terminal 3 - Orchestrator
cd orchestrator-agent
uv run python orchestrator.py
```

**Option 2: Via Aspire (recommended)**
```bash
# From project root
aspire run
```

## Running the Orchestrator

### Development Mode
```bash
uv run python orchestrator.py
```

### Production Mode
```bash
uv run uvicorn orchestrator:app --host 0.0.0.0 --port 8003
```

The orchestrator will be available at `http://localhost:8003`

## API Endpoints

### POST /agent/chat
Main chat endpoint that routes to specialized agents.

**Request:**
```json
{
  "message": "Find dog sitters in 90001",
  "context": {
    "petType": "dog",
    "location": "90001"
  },
  "user_id": 5
}
```

**Response:**
```json
{
  "message": "I found 3 dog sitters in your area...",
  "agent_used": "sitter",
  "data": {...}
}
```

### GET /health
Health check with sub-agent status monitoring.

**Response:**
```json
{
  "status": "healthy",
  "service": "orchestrator-agent",
  "sub_agents": {
    "sitter_agent": "healthy",
    "booking_agent": "healthy"
  }
}
```

## Routing Logic

### Intent Classification

The orchestrator uses keyword-based classification:

**Sitter Agent Keywords:**
- find, search, looking for, need
- sitter, pet sitter, caregiver
- available, availability, recommend
- profile, review, rating, services

**Booking Agent Keywords:**
- booking, book, reserve, reservation
- cancel, cancellation, my bookings
- status, cost estimate, price

**Priority Rules:**
- More keyword matches = higher confidence
- Booking actions (cancel, reserve) prioritized for booking agent
- Search actions (find, search) prioritized for sitter agent
- Unclear queries get help message from orchestrator

### Example Routing

```
"Find dog sitters" → Sitter Agent (search keywords)
"Cancel booking 123" → Booking Agent (booking + action)
"How much for sitter #5?" → Sitter Agent (sitter profile query)
"Show my bookings" → Booking Agent (booking list)
"What can you help with?" → Orchestrator (general help)
```

## Testing

### Example Queries

```bash
# Sitter routing
curl -X POST http://localhost:8003/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Find cat sitters in 10001 for next week"}'

# Booking routing
curl -X POST http://localhost:8003/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me my pending bookings", "user_id": 5}'

# General help
curl -X POST http://localhost:8003/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What can you help me with?"}'

# Health check
curl http://localhost:8003/health
```

## Architecture

```
┌─────────────────────┐
│  Frontend (React)   │
│   Port 3000         │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Orchestrator Agent │  ← Main Entry Point
│   Port 8003         │
└────┬──────────┬─────┘
     │          │
     ↓          ↓
┌─────────┐  ┌─────────┐
│ Sitter  │  │ Booking │
│ Agent   │  │ Agent   │
│ 8001    │  │ 8002    │
└─────────┘  └─────────┘
     │          │
     └────┬─────┘
          ↓
   ┌──────────────┐
   │ Backend API  │
   │  Port 5000   │
   └──────────────┘
```

## Integration

- **Frontend**: Single agent endpoint at `/agent/chat`
- **Backend**: Sub-agents call marketplace API
- **Service Discovery**: Managed by Aspire
- **CORS**: Configured for frontend origins

## Monitoring

The `/health` endpoint monitors:
- Orchestrator status
- Sitter agent reachability
- Booking agent reachability
- Azure AI Foundry configuration
- Sub-agent URLs

## Troubleshooting

**Sub-agent unreachable:**
- Check if sitter-agent and booking-agent are running
- Verify URLs in `.env` are correct
- Check ports are not in use by other services

**Routing errors:**
- Check orchestrator logs for intent classification
- Verify sub-agent responses in logs
- Test sub-agents independently

**Slow responses:**
- Check Azure AI Foundry quota/limits
- Monitor sub-agent performance
- Consider caching for common queries

## License

Part of the Octopets project.
