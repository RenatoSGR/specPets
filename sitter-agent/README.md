# Pet Sitter Recommendation Agent

AI agent that helps pet owners find the perfect pet sitter using Microsoft Agent Framework with Azure AI Foundry.

## Features

- **Intelligent Search**: Finds available sitters based on location, dates, pet type, and preferences
- **Detailed Recommendations**: Provides sitter profiles with services, reviews, and ratings
- **Match Scoring**: Calculates compatibility between sitters and owner requirements
- **Conversational Interface**: Natural language chat for personalized assistance

## Tools

1. **find_available_sitters** - Search for sitters by location, dates, and filters
2. **get_sitter_details** - Get comprehensive sitter profile information
3. **calculate_match_score** - Evaluate how well a sitter matches requirements

## Setup

### Prerequisites

- Python 3.11 or higher
- [uv](https://github.com/astral-sh/uv) package manager
- Azure AI Foundry account with API key

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
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
PORT=8001
```

## Running the Agent

### Development Mode
```bash
uv run python agent.py
```

### Production Mode
```bash
uv run uvicorn agent:app --host 0.0.0.0 --port 8001
```

The agent will be available at `http://localhost:8001`

## API Endpoints

### POST /agent/chat
Main chat endpoint for sitter recommendations.

**Request:**
```json
{
  "message": "Find dog sitters in 90001 for next week under $40/day",
  "context": {
    "petType": "dog",
    "location": "90001"
  }
}
```

**Response:**
```json
{
  "message": "I found 3 dog sitters in your area...",
  "data": {
    "sitters": [...]
  }
}
```

### GET /health
Health check endpoint.

## Testing

### Example Queries

```bash
# Find dog sitters
curl -X POST http://localhost:8001/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I need a dog sitter in 90001 for July 10-15"}'

# Get sitter details
curl -X POST http://localhost:8001/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me more about sitter #1"}'

# Match evaluation
curl -X POST http://localhost:8001/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Is sitter #3 good for a senior cat with medication needs?"}'
```

## Integration

This agent is designed to work with:
- **Backend API**: Octopets marketplace API at `/api/search/sitters` and `/api/sitters/{id}`
- **Orchestrator Agent**: Routed from main orchestrator for sitter-related queries
- **Frontend**: Via agent chat interface

## Architecture

- **Framework**: Microsoft Agent Framework (Python)
- **Model**: GPT-4 via Azure AI Foundry
- **API**: FastAPI with CORS enabled
- **Tools**: Native Python async functions
- **Communication**: HTTP/JSON

## License

Part of the Octopets project.
