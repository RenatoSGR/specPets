"""
Orchestrator Agent
Routes user queries to specialized agents (sitter-agent, booking-agent)
Uses Microsoft Agent Framework with Azure AI Foundry
"""

import os
import json
from typing import Annotated, Any
from datetime import datetime
from enum import Enum

from agent_framework import Agent, Runner
from agent_framework.azure_ai import AzureAIInference
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

# Environment configuration
AZURE_AI_ENDPOINT = os.getenv("AZURE_AI_ENDPOINT", "https://ai-renribeiro0052ai128937280558.services.ai.azure.com/")
AZURE_AI_KEY = os.getenv("AZURE_AI_KEY", "")
SITTER_AGENT_URL = os.getenv("SITTER_AGENT_URL", "http://localhost:8001/agent/chat")
BOOKING_AGENT_URL = os.getenv("BOOKING_AGENT_URL", "http://localhost:8002/agent/chat")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Initialize FastAPI
app = FastAPI(title="Octopets Orchestrator Agent", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class ChatRequest(BaseModel):
    message: str
    context: dict[str, Any] | None = None
    user_id: int | None = None

class ChatResponse(BaseModel):
    message: str
    agent_used: str | None = None
    data: dict[str, Any] | None = None


class AgentType(str, Enum):
    """Types of specialized agents"""
    SITTER = "sitter"
    BOOKING = "booking"
    GENERAL = "general"


# Tool functions for routing
async def route_to_sitter_agent(
    query: Annotated[str, "User query about finding, searching, or recommending pet sitters"],
    context: Annotated[dict, "Additional context like location, dates, pet type"] | None = None
) -> str:
    """
    Route queries to the sitter recommendation agent.
    Use for: finding sitters, sitter recommendations, sitter details, availability searches.
    """
    try:
        async with httpx.AsyncClient() as client:
            payload = {
                "message": query,
                "context": context or {}
            }
            
            response = await client.post(
                SITTER_AGENT_URL,
                json=payload,
                timeout=30.0
            )
            response.raise_for_status()
            result = response.json()
            
            return f"[Sitter Agent Response]\n{result.get('message', 'No response')}"
            
    except httpx.HTTPError as e:
        return f"Error contacting sitter agent: {str(e)}"


async def route_to_booking_agent(
    query: Annotated[str, "User query about bookings, reservations, cancellations, or booking status"],
    context: Annotated[dict, "Additional context like booking ID, user ID"] | None = None,
    user_id: Annotated[int, "User's ID for booking operations"] | None = None
) -> str:
    """
    Route queries to the booking assistant agent.
    Use for: checking booking status, listing bookings, cancelling bookings, cost estimates.
    """
    try:
        async with httpx.AsyncClient() as client:
            payload = {
                "message": query,
                "context": context or {},
                "user_id": user_id
            }
            
            response = await client.post(
                BOOKING_AGENT_URL,
                json=payload,
                timeout=30.0
            )
            response.raise_for_status()
            result = response.json()
            
            return f"[Booking Agent Response]\n{result.get('message', 'No response')}"
            
    except httpx.HTTPError as e:
        return f"Error contacting booking agent: {str(e)}"


async def get_orchestrator_help() -> str:
    """Get information about what the orchestrator can help with."""
    return """
**Welcome to Octopets AI Assistant!** 🐾

I can help you with:

🔍 **Finding Pet Sitters** (handled by Sitter Agent):
- Search for sitters by location and dates
- Get sitter recommendations based on your needs
- View sitter profiles, reviews, and services
- Check sitter availability

📅 **Managing Bookings** (handled by Booking Agent):
- Check status of your bookings
- View all your bookings (pending, confirmed, completed)
- Cancel bookings if needed
- Estimate booking costs
- Get booking tips and policies

**Examples:**
- "Find dog sitters in 90001 for next week"
- "Show me my pending bookings"
- "What's the status of booking #123?"
- "How much would it cost to book sitter #5 for 3 days?"
- "Tell me about sitter #2's services"

Just ask naturally, and I'll route you to the right specialist! 😊
"""


def classify_intent(message: str) -> AgentType:
    """
    Classify user intent to determine which agent to use.
    Uses keyword matching for fast routing.
    """
    message_lower = message.lower()
    
    # Booking-related keywords
    booking_keywords = [
        "booking", "book", "reserve", "reservation",
        "cancel", "cancellation", "my bookings",
        "booking status", "booking #", "booking id",
        "cost estimate", "how much", "price for booking",
        "confirm", "pending", "completed"
    ]
    
    # Sitter-related keywords
    sitter_keywords = [
        "find", "search", "looking for", "need",
        "sitter", "pet sitter", "caregiver",
        "available", "availability", "recommend",
        "profile", "review", "rating", "services",
        "sitter #", "sitter id", "tell me about"
    ]
    
    # Check for booking intent
    booking_matches = sum(1 for keyword in booking_keywords if keyword in message_lower)
    
    # Check for sitter intent
    sitter_matches = sum(1 for keyword in sitter_keywords if keyword in message_lower)
    
    # Decision logic
    if booking_matches > sitter_matches:
        return AgentType.BOOKING
    elif sitter_matches > booking_matches:
        return AgentType.SITTER
    
    # Default to general if unclear
    return AgentType.GENERAL


# Create the orchestrator agent
def create_orchestrator_agent() -> Agent:
    """Create the orchestrator agent with routing tools"""
    
    model = AzureAIInference(
        endpoint=AZURE_AI_ENDPOINT,
        api_key=AZURE_AI_KEY,
        model="gpt-4o",
    )

    agent = Agent(
        name="OrchestratorAgent",
        description="Routes queries to specialized pet sitting agents",
        instructions="""You are the Octopets orchestrator agent that routes user queries to specialized agents.

Your team consists of:
1. **Sitter Agent** - Finds and recommends pet sitters based on user needs
2. **Booking Agent** - Manages bookings, cancellations, and reservations

Routing Guidelines:

**Route to Sitter Agent when the user wants to:**
- Find or search for pet sitters
- Get sitter recommendations
- View sitter profiles, services, or reviews
- Check sitter availability
- Learn about a specific sitter
- Compare sitters

**Route to Booking Agent when the user wants to:**
- Check booking status
- View their bookings (all, pending, confirmed, completed)
- Cancel a booking
- Estimate booking cost
- Get booking tips or policies
- Understand cancellation policies

**Stay in orchestrator (use get_orchestrator_help) when:**
- User asks general questions about what you can do
- User greets you or asks for help
- Query is unclear and needs clarification

**Important:**
- Always pass user_id to booking agent when available
- Include relevant context when routing (location, dates, pet type, booking ID)
- If a query involves BOTH sitters AND bookings, prioritize based on the main action
  - Example: "Book sitter #5" → booking agent (action is booking)
  - Example: "Find sitters and show cost" → sitter agent first (action is finding)
- Be conversational but delegate quickly to specialists
- Don't try to answer specialized questions yourself - route them

Be friendly, helpful, and efficient at routing!""",
        model=model,
        tools=[
            route_to_sitter_agent,
            route_to_booking_agent,
            get_orchestrator_help
        ],
    )

    return agent


# Global agent instance
orchestrator_agent = create_orchestrator_agent()
runner = Runner()


@app.post("/agent/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint for the orchestrator agent.
    Routes queries to appropriate specialized agents.
    """
    try:
        # Build task with context
        task = request.message
        if request.user_id:
            task = f"User ID: {request.user_id}\nQuery: {task}"
        
        if request.context:
            task += f"\nContext: {json.dumps(request.context)}"

        # Quick classification for logging
        intent = classify_intent(request.message)
        
        # Run the orchestrator agent
        result = await runner.run(
            agent=orchestrator_agent,
            task=task,
        )

        # Extract the response
        response_text = ""
        agent_used = intent.value
        
        if result.messages:
            for msg in reversed(result.messages):
                if msg.role == "assistant" and msg.content:
                    response_text = msg.content
                    
                    # Detect which agent was actually used
                    if "[Sitter Agent Response]" in response_text:
                        agent_used = "sitter"
                        response_text = response_text.replace("[Sitter Agent Response]\n", "")
                    elif "[Booking Agent Response]" in response_text:
                        agent_used = "booking"
                        response_text = response_text.replace("[Booking Agent Response]\n", "")
                    else:
                        agent_used = "orchestrator"
                    
                    break

        if not response_text:
            response_text = "I'm sorry, I couldn't process that request. Could you try rephrasing?"

        return ChatResponse(
            message=response_text,
            agent_used=agent_used,
            data=request.context
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Orchestrator error: {str(e)}")


@app.get("/health")
async def health():
    """Health check endpoint with sub-agent status"""
    sub_agents_healthy = True
    sub_agents_status = {}
    
    # Check sitter agent
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{SITTER_AGENT_URL.replace('/agent/chat', '/health')}", timeout=5.0)
            sub_agents_status["sitter_agent"] = "healthy" if response.status_code == 200 else "unhealthy"
    except:
        sub_agents_status["sitter_agent"] = "unreachable"
        sub_agents_healthy = False
    
    # Check booking agent
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BOOKING_AGENT_URL.replace('/agent/chat', '/health')}", timeout=5.0)
            sub_agents_status["booking_agent"] = "healthy" if response.status_code == 200 else "unhealthy"
    except:
        sub_agents_status["booking_agent"] = "unreachable"
        sub_agents_healthy = False
    
    return {
        "status": "healthy" if sub_agents_healthy else "degraded",
        "service": "orchestrator-agent",
        "timestamp": datetime.utcnow().isoformat(),
        "azure_ai_configured": bool(AZURE_AI_KEY),
        "sub_agents": sub_agents_status,
        "sitter_agent_url": SITTER_AGENT_URL,
        "booking_agent_url": BOOKING_AGENT_URL,
    }


@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": "Octopets Orchestrator Agent",
        "version": "1.0.0",
        "framework": "Microsoft Agent Framework",
        "specialized_agents": {
            "sitter": SITTER_AGENT_URL,
            "booking": BOOKING_AGENT_URL
        },
        "endpoints": {
            "chat": "/agent/chat",
            "health": "/health",
            "docs": "/docs"
        }
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8003"))
    uvicorn.run(app, host="0.0.0.0", port=port)
