# Booking Assistant Agent

AI agent that helps pet owners manage their pet sitting bookings using Microsoft Agent Framework with Azure AI Foundry.

## Features

- **Booking Status**: Check status and details of bookings
- **Booking List**: View all bookings (pending, confirmed, completed)
- **Cancellations**: Cancel bookings with policy explanations
- **Cost Estimation**: Calculate booking costs before creation
- **Booking Tips**: Provide best practices and guidance

## Tools

1. **check_booking_status** - Get details and status of a specific booking
2. **get_my_bookings** - List all bookings for a pet owner
3. **cancel_booking** - Cancel a booking with reason
4. **estimate_booking_cost** - Calculate estimated cost for a potential booking
5. **get_booking_tips** - Provide helpful booking tips and policies

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
PORT=8002
```

## Running the Agent

### Development Mode
```bash
uv run python agent.py
```

### Production Mode
```bash
uv run uvicorn agent:app --host 0.0.0.0 --port 8002
```

The agent will be available at `http://localhost:8002`

## API Endpoints

### POST /agent/chat
Main chat endpoint for booking assistance.

**Request:**
```json
{
  "message": "Check the status of booking #123",
  "user_id": 5
}
```

**Response:**
```json
{
  "message": "Booking #123 is confirmed...",
  "data": null,
  "action": null
}
```

### GET /health
Health check endpoint.

## Testing

### Example Queries

```bash
# Check booking status
curl -X POST http://localhost:8002/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the status of booking 1?", "user_id": 5}'

# List bookings
curl -X POST http://localhost:8002/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me all my pending bookings", "user_id": 5}'

# Estimate cost
curl -X POST http://localhost:8002/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How much would it cost to book sitter #3 for overnight care from July 10-15?"}'

# Cancel booking
curl -X POST http://localhost:8002/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Cancel booking 2 because my plans changed", "user_id": 5}'
```

## Booking Statuses

- **Pending**: Waiting for sitter to accept the booking
- **Confirmed**: Sitter has accepted, booking is scheduled
- **Completed**: Service has been provided
- **Cancelled**: Booking cancelled by owner or sitter

## Cancellation Policy

- **48+ hours before**: Full refund
- **24-48 hours before**: 50% refund
- **Less than 24 hours**: No refund

## Integration

This agent works with:
- **Backend API**: Octopets marketplace API at `/api/bookings/*`
- **Orchestrator Agent**: Routed from main orchestrator for booking-related queries
- **Frontend**: Via agent chat interface

## Architecture

- **Framework**: Microsoft Agent Framework (Python)
- **Model**: GPT-4 via Azure AI Foundry
- **API**: FastAPI with CORS enabled
- **Tools**: Native Python async functions
- **Communication**: HTTP/JSON

## License

Part of the Octopets project.
