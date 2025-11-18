"""
Booking Assistant Agent - Simplified Version
Helps manage bookings and reservations
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Environment configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
PORT = int(os.getenv("PORT", "8002"))

# Initialize FastAPI
app = FastAPI(title="Booking Assistant Agent", version="1.0.0")

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
    data: dict | None = None

@app.post("/agent/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Handle chat messages about bookings"""
    message = request.message.lower()
    
    if any(word in message for word in ["booking", "reservation", "my bookings", "appointments"]):
        response = """Here are your current bookings:

**Booking #101** - Upcoming
- Sitter: Sarah Johnson
- Dates: Dec 20-23, 2025
- Service: Overnight stay
- Pet: Max (Dog)
- Status: ✅ Confirmed
- Total: $225

**Booking #102** - Pending
- Sitter: Mike Chen
- Dates: Dec 28, 2025
- Service: Daily visit
- Pet: Whiskers (Cat)
- Status: ⏳ Awaiting confirmation
- Total: $30

Would you like to view details, cancel, or modify any booking?"""
    
    elif any(word in message for word in ["cancel", "cancellation"]):
        response = """**Cancellation Policy:**

📋 Free cancellation up to 48 hours before booking
⚠️ 50% refund if cancelled 24-48 hours before
❌ No refund for cancellations within 24 hours

**To cancel a booking:**
1. Select the booking number (e.g., #101)
2. Confirm cancellation
3. Refund processed within 3-5 business days

Which booking would you like to cancel?"""
    
    elif any(word in message for word in ["cost", "price", "estimate", "how much"]):
        response = """Let me calculate the booking cost for you!

**Booking Cost Calculator:**

Base Rates:
- Overnight stay: $75/night
- Daily visit (30 min): $20
- Daily visit (1 hour): $30
- Dog walking: $18/walk

**Example Booking:**
3 nights overnight stay = $225
+ Meet & greet (free)
+ Service fee (10%) = $22.50
**Total: $247.50**

Discounts available:
- First-time client: -15%
- Weekly booking: -10%
- Multiple pets: -10%

What dates are you considering?"""
    
    elif any(word in message for word in ["modify", "change", "reschedule", "update"]):
        response = """You can modify your booking!

**What would you like to change?**
- Dates/times
- Service type
- Add/remove pets
- Special instructions

Note: Changes must be made at least 24 hours before the booking start time.

Which booking would you like to modify? (Use booking number like #101)"""
    
    elif any(word in message for word in ["status", "confirm", "confirmed"]):
        response = """**Booking Status Guide:**

✅ **Confirmed** - Sitter has accepted, you're all set!
⏳ **Pending** - Waiting for sitter confirmation (usually within 24h)
🔄 **Modified** - Changes were requested
❌ **Cancelled** - Booking was cancelled
✨ **Completed** - Service was provided

Your pending booking #102 should be confirmed within the next few hours. You'll receive a notification once the sitter responds!"""
    
    else:
        response = """Hi! I'm your booking assistant. 📅

I can help you with:
- View your current and past bookings
- Check booking status
- Calculate booking costs  
- Cancel or modify reservations
- Understand cancellation policies

Try asking:
- "Show my bookings"
- "How much will it cost?"
- "Cancel booking #101"
- "What's the cancellation policy?"
"""
    
    return ChatResponse(message=response)

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "booking-agent",
        "port": PORT
    }

if __name__ == "__main__":
    print(f"📅 Booking Assistant Agent starting on port {PORT}...")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
