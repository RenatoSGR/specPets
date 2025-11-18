"""
Orchestrator Agent - Simplified Version
Routes queries to appropriate specialized agents
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import httpx

# Environment configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
SITTER_AGENT_URL = os.getenv("SITTER_AGENT_URL", "http://localhost:8001")
BOOKING_AGENT_URL = os.getenv("BOOKING_AGENT_URL", "http://localhost:8002")
PORT = int(os.getenv("PORT", "8003"))

# Initialize FastAPI
app = FastAPI(title="Orchestrator Agent", version="1.0.0")

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
    context: dict | None = None
    user_id: int | None = None

class ChatResponse(BaseModel):
    message: str
    agent_used: str | None = None
    data: dict | None = None

def classify_intent(message: str) -> str:
    """Determine which agent should handle the message"""
    message_lower = message.lower()
    
    # Booking-related keywords
    booking_keywords = ["booking", "reservation", "cancel", "modify", "my bookings", 
                       "appointment", "schedule", "reschedule", "cost", "price", 
                       "estimate", "status", "confirm"]
    
    # Sitter-related keywords
    sitter_keywords = ["sitter", "find", "search", "recommend", "available", 
                      "profile", "rating", "review", "experience", "dog", "cat",
                      "pet", "walking", "overnight"]
    
    # Count keyword matches
    booking_score = sum(1 for kw in booking_keywords if kw in message_lower)
    sitter_score = sum(1 for kw in sitter_keywords if kw in message_lower)
    
    # Route to appropriate agent
    if booking_score > sitter_score:
        return "booking"
    elif sitter_score > 0:
        return "sitter"
    else:
        return "general"

@app.post("/agent/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Orchestrate chat messages to appropriate agent"""
    intent = classify_intent(request.message)
    
    try:
        if intent == "booking":
            # Route to booking agent
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{BOOKING_AGENT_URL}/agent/chat",
                    json={"message": request.message, "user_id": request.user_id}
                )
                response.raise_for_status()
                data = response.json()
                return ChatResponse(
                    message=data["message"],
                    agent_used="booking-agent",
                    data=data.get("data")
                )
        
        elif intent == "sitter":
            # Route to sitter agent
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{SITTER_AGENT_URL}/agent/chat",
                    json={"message": request.message}
                )
                response.raise_for_status()
                data = response.json()
                return ChatResponse(
                    message=data["message"],
                    agent_used="sitter-agent",
                    data=data.get("data")
                )
        
        else:
            # Handle general queries
            response_text = """Hi! I'm Octopets AI Assistant. 🐾

I can help you with:

**Finding Pet Sitters:**
- Search for qualified sitters in your area
- Compare ratings, experience, and prices
- Check availability
- View detailed sitter profiles

**Managing Bookings:**
- View your current bookings
- Check booking status
- Calculate costs
- Cancel or modify reservations

What would you like to do today? Try asking:
- "Find me a dog sitter for next weekend"
- "Show my bookings"
- "Who's available under $30/hour?"
- "Cancel booking #101"
"""
            return ChatResponse(
                message=response_text,
                agent_used="orchestrator"
            )
    
    except httpx.HTTPError as e:
        # Fallback if agent is unavailable
        return ChatResponse(
            message=f"I'm having trouble connecting to our specialized agents right now. Please try again in a moment. (Error: {str(e)})",
            agent_used="orchestrator-fallback"
        )

@app.get("/health")
async def health():
    """Health check endpoint with sub-agent status"""
    status = {
        "status": "healthy",
        "service": "orchestrator",
        "port": PORT,
        "sub_agents": {}
    }
    
    # Check sitter agent
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{SITTER_AGENT_URL}/health")
            status["sub_agents"]["sitter"] = "healthy" if response.status_code == 200 else "unhealthy"
    except:
        status["sub_agents"]["sitter"] = "unavailable"
    
    # Check booking agent
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{BOOKING_AGENT_URL}/health")
            status["sub_agents"]["booking"] = "healthy" if response.status_code == 200 else "unhealthy"
    except:
        status["sub_agents"]["booking"] = "unavailable"
    
    return status

if __name__ == "__main__":
    print(f"🎯 Orchestrator Agent starting on port {PORT}...")
    print(f"   Sitter Agent: {SITTER_AGENT_URL}")
    print(f"   Booking Agent: {BOOKING_AGENT_URL}")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
