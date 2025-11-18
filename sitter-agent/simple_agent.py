"""
Pet Sitter Recommendation Agent - Simplified Version
Provides intelligent sitter recommendations based on pet owner needs
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Environment configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
PORT = int(os.getenv("PORT", "8001"))

# Initialize FastAPI
app = FastAPI(title="Sitter Recommendation Agent", version="1.0.0")

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

class ChatResponse(BaseModel):
    message: str
    data: dict | None = None

@app.post("/agent/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Handle chat messages and provide sitter recommendations"""
    message = request.message.lower()
    
    # Simple keyword-based responses
    if any(word in message for word in ["find", "sitter", "search", "recommend"]):
        response = """I can help you find the perfect pet sitter! 

Based on your needs, here are some top-rated sitters in your area:

**Sitter #1** - Sarah Johnson
- Specializes in dogs
- 5 years experience
- Rating: 4.9★
- $25/hour

**Sitter #2** - Mike Chen  
- All pets welcome
- 3 years experience
- Rating: 4.8★
- $22/hour

**Sitter #3** - Emma Davis
- Cats & small animals
- 4 years experience  
- Rating: 4.7★
- $20/hour

Would you like more details about any of these sitters? Just click on their name or ask me!"""
    
    elif any(word in message for word in ["detail", "more", "info", "about"]):
        response = """Let me get you more details!

**Sitter Profile:**
- Available weekdays 9AM-6PM
- Certified in pet first aid
- Has references from 50+ happy clients
- Offers overnight stays, daily visits, and dog walking
- Home has a secure fenced yard

Would you like to see their calendar availability or book a meet & greet?"""
    
    elif any(word in message for word in ["price", "cost", "rate", "budget"]):
        response = """Here's the pricing breakdown:

💰 **Typical Rates in Your Area:**
- Daily Visit (30 min): $15-25
- Daily Visit (1 hour): $25-35  
- Overnight Stay: $50-75 per night
- Dog Walking: $15-20 per walk
- Special services: +$5-10

Most sitters offer discounts for:
- Multiple pets (+10% off)
- Weekly bookings (+15% off)
- Regular clients (+20% off)

Would you like to see sitters within a specific price range?"""
    
    elif any(word in message for word in ["available", "availability", "calendar", "schedule"]):
        response = """Let me check availability for you!

**This Week:**
- Monday-Wednesday: ✅ 3 sitters available
- Thursday-Friday: ✅ 5 sitters available
- Weekend: ⚠️ Limited availability (2 sitters)

**Next Week:**
- Full availability across all days

Would you like to see specific dates or book a time slot?"""
    
    else:
        response = """Hi! I'm your pet sitter assistant. 🐾

I can help you:
- Find qualified pet sitters in your area
- Compare ratings, prices, and availability
- Get details about sitter experience and services
- Check availability and book appointments

What would you like to know? Try asking:
- "Find me a dog sitter"
- "Show me sitters under $30/hour"
- "Who's available this weekend?"
- "Tell me more about sitter #1"
"""
    
    return ChatResponse(message=response)

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "sitter-agent",
        "port": PORT
    }

if __name__ == "__main__":
    print(f"🐾 Sitter Recommendation Agent starting on port {PORT}...")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
