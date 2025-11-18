"""
Booking Assistant Agent
Uses Microsoft Agent Framework with Azure AI Foundry
Helps pet owners manage bookings and communicate with sitters
"""

import os
import json
from typing import Annotated, Any
from datetime import datetime, timedelta

from agent_framework import Agent, Runner
from agent_framework.azure_ai import AzureAIInference
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

# Environment configuration
AZURE_AI_ENDPOINT = os.getenv("AZURE_AI_ENDPOINT", "https://ai-renribeiro0052ai128937280558.services.ai.azure.com/")
AZURE_AI_KEY = os.getenv("AZURE_AI_KEY", "")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

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
    context: dict[str, Any] | None = None
    user_id: int | None = None

class ChatResponse(BaseModel):
    message: str
    data: dict[str, Any] | None = None
    action: str | None = None


# Tool functions for booking management
async def check_booking_status(
    booking_id: Annotated[int, "ID of the booking to check"]
) -> str:
    """Check the status and details of a booking."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BACKEND_URL}/api/bookings/{booking_id}",
                timeout=10.0
            )
            response.raise_for_status()
            booking = response.json()

            status_emoji = {
                "pending": "⏳",
                "confirmed": "✅",
                "completed": "🎉",
                "cancelled": "❌"
            }

            return f"""
Booking #{booking['id']} {status_emoji.get(booking['status'], '📋')}
Status: {booking['status'].upper()}
Sitter: {booking.get('sitterName', 'N/A')}
Dates: {booking.get('startDate', 'N/A')} to {booking.get('endDate', 'N/A')}
Service: {booking.get('serviceName', 'N/A')}
Total Cost: ${booking.get('totalCost', 0):.2f}
Created: {booking.get('createdAt', 'N/A')}

Notes: {booking.get('notes', 'No special notes')}
"""
    except httpx.HTTPError as e:
        return f"Error checking booking: {str(e)}"


async def get_my_bookings(
    owner_id: Annotated[int, "Pet owner's user ID"],
    status: Annotated[str, "Filter by status: pending, confirmed, completed, or all"] | None = "all"
) -> str:
    """Get list of bookings for a pet owner."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BACKEND_URL}/api/bookings/owner/{owner_id}",
                timeout=10.0
            )
            response.raise_for_status()
            bookings = response.json()

            if status and status != "all":
                bookings = [b for b in bookings if b['status'].lower() == status.lower()]

            if not bookings:
                return f"No {status} bookings found."

            result = f"Found {len(bookings)} booking(s):\n\n"
            for booking in bookings[:10]:  # Limit to 10
                result += f"""
**Booking #{booking['id']}** - {booking['status'].upper()}
Sitter: {booking.get('sitterName', 'N/A')}
Dates: {booking.get('startDate', 'N/A')} to {booking.get('endDate', 'N/A')}
Service: {booking.get('serviceName', 'N/A')}
Total: ${booking.get('totalCost', 0):.2f}
---
"""
            return result

    except httpx.HTTPError as e:
        return f"Error getting bookings: {str(e)}"


async def cancel_booking(
    booking_id: Annotated[int, "ID of the booking to cancel"],
    reason: Annotated[str, "Reason for cancellation"] | None = None
) -> str:
    """Cancel a booking. Note: cancellation policies may apply."""
    try:
        async with httpx.AsyncClient() as client:
            payload = {}
            if reason:
                payload["reason"] = reason

            response = await client.put(
                f"{BACKEND_URL}/api/bookings/{booking_id}/cancel",
                json=payload,
                timeout=10.0
            )
            response.raise_for_status()

            return f"""
✅ Booking #{booking_id} has been cancelled successfully.

Important: Please check the cancellation policy:
- Cancellations more than 48 hours before start: Full refund
- Cancellations 24-48 hours before: 50% refund
- Cancellations less than 24 hours: No refund

The sitter has been notified of the cancellation.
"""
    except httpx.HTTPError as e:
        return f"Error cancelling booking: {str(e)}"


async def estimate_booking_cost(
    sitter_id: Annotated[int, "ID of the sitter"],
    service_name: Annotated[str, "Service type (overnight, daily visit, walking, medication, grooming)"],
    start_date: Annotated[str, "Start date (YYYY-MM-DD)"],
    end_date: Annotated[str, "End date (YYYY-MM-DD)"]
) -> str:
    """Estimate the cost of a booking before creating it."""
    try:
        # Get sitter's services
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BACKEND_URL}/api/services/sitter/{sitter_id}",
                timeout=10.0
            )
            response.raise_for_status()
            services = response.json()

            # Find matching service
            service = next((s for s in services if s['name'].lower() == service_name.lower()), None)
            
            if not service:
                return f"Sitter doesn't offer {service_name} service. Available: {', '.join(s['name'] for s in services)}"

            # Calculate days
            start = datetime.strptime(start_date, "%Y-%m-%d")
            end = datetime.strptime(end_date, "%Y-%m-%d")
            days = (end - start).days + 1

            # Calculate cost
            if service['priceUnit'] == 'hour':
                # Assume 8 hours per day for hourly services
                total_cost = service['price'] * 8 * days
                detail = f"${service['price']}/hour × 8 hours/day × {days} days"
            else:
                total_cost = service['price'] * days
                detail = f"${service['price']}/day × {days} days"

            return f"""
**Booking Cost Estimate**

Service: {service['name'].title()}
Sitter: Sitter #{sitter_id}
Duration: {start_date} to {end_date} ({days} days)

Calculation: {detail}
**Estimated Total: ${total_cost:.2f}**

This is an estimate. Final cost may vary based on additional services or special requirements.
"""

    except Exception as e:
        return f"Error estimating cost: {str(e)}"


async def get_booking_tips() -> str:
    """Get helpful tips for booking pet sitters."""
    return """
**Tips for a Successful Booking:**

📋 Before Booking:
- Read sitter reviews carefully
- Check their certifications and experience
- Verify they accept your pet type
- Confirm their availability for your dates

💬 Communication:
- Share detailed pet information (age, temperament, medical needs)
- Discuss your pet's routine and preferences
- Provide emergency contact information
- Share your vet's contact details

📅 Cancellation Policy:
- Book early to avoid last-minute fees
- Understand the cancellation terms
- Cancel as early as possible if plans change

🏠 For In-Home Care:
- Provide house access instructions
- Show where pet supplies are kept
- Leave written care instructions
- Do a meet-and-greet first if possible

💰 Payment:
- Payment is processed at booking confirmation
- Tip for exceptional service is appreciated
- Review pricing details carefully

✅ After Booking:
- Confirm all details with the sitter
- Provide any last-minute updates
- Leave a review after the service
"""


# Create the booking agent
def create_booking_agent() -> Agent:
    """Create the booking assistant agent with tools"""
    
    model = AzureAIInference(
        endpoint=AZURE_AI_ENDPOINT,
        api_key=AZURE_AI_KEY,
        model="gpt-4o",
    )

    agent = Agent(
        name="BookingAssistantAgent",
        description="Helpful assistant for managing pet sitting bookings",
        instructions="""You are a booking assistant that helps pet owners manage their pet sitting reservations.

Your capabilities:
1. Check booking status and details
2. List all bookings (pending, confirmed, completed)
3. Cancel bookings (with policy explanation)
4. Estimate booking costs before creation
5. Provide booking tips and best practices

Guidelines:
- Always be clear about cancellation policies
- Help owners understand costs and fees
- Remind them to communicate special needs to sitters
- Be empathetic if they need to cancel
- Encourage reviews after completed bookings
- Explain booking statuses clearly:
  * Pending: Waiting for sitter to accept
  * Confirmed: Sitter has accepted
  * Completed: Service finished
  * Cancelled: Booking cancelled by owner or sitter

When discussing bookings:
- Always include booking ID for reference
- Show dates, costs, and sitter information
- Explain next steps based on status
- Offer to help with any concerns

Be friendly, professional, and focused on ensuring great pet care experiences.""",
        model=model,
        tools=[
            check_booking_status,
            get_my_bookings,
            cancel_booking,
            estimate_booking_cost,
            get_booking_tips
        ],
    )

    return agent


# Global agent instance
booking_agent = create_booking_agent()
runner = Runner()


@app.post("/agent/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint for the booking assistant agent.
    """
    try:
        # Add user context to the task if provided
        task = request.message
        if request.user_id:
            task = f"User ID: {request.user_id}\n{task}"

        # Run the agent
        result = await runner.run(
            agent=booking_agent,
            task=task,
        )

        # Extract the response
        response_text = ""
        if result.messages:
            for msg in reversed(result.messages):
                if msg.role == "assistant" and msg.content:
                    response_text = msg.content
                    break

        if not response_text:
            response_text = "I'm sorry, I couldn't process that request. Could you try rephrasing?"

        return ChatResponse(
            message=response_text,
            data=request.context,
            action=None
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "booking-agent",
        "timestamp": datetime.utcnow().isoformat(),
        "azure_ai_configured": bool(AZURE_AI_KEY),
        "backend_url": BACKEND_URL,
    }


@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": "Octopets Booking Assistant Agent",
        "version": "1.0.0",
        "framework": "Microsoft Agent Framework",
        "endpoints": {
            "chat": "/agent/chat",
            "health": "/health",
            "docs": "/docs"
        }
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8002"))
    uvicorn.run(app, host="0.0.0.0", port=port)
