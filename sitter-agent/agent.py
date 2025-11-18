"""
Pet Sitter Recommendation Agent
Provides intelligent sitter recommendations based on pet owner needs
"""

import os
import json
from typing import Any
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

# Environment configuration
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

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
    context: dict[str, Any] | None = None

class ChatResponse(BaseModel):
    message: str
    data: dict[str, Any] | None = None
    action: str | None = None

# Tool functions for the agent
async def search_sitters(
    pet_type: Annotated[str, "Type of pet (dog, cat, bird, reptile, rabbit, other)"] | None = None,
    zip_code: Annotated[str, "5-digit zip code for location"] | None = None,
    max_price: Annotated[float, "Maximum hourly rate budget"] | None = None,
    service_type: Annotated[str, "Service needed (overnight, daily visit, walking, medication, grooming)"] | None = None,
    skills: Annotated[str, "Required skills (first aid, medication administration, training, grooming, senior pet care, special needs)"] | None = None,
    min_rating: Annotated[float, "Minimum average rating (1-5)"] | None = None,
) -> str:
    """
    Search for pet sitters based on specified criteria.
    Returns a list of matching sitters with their details.
    """
    try:
        params = {}
        if pet_type:
            params["petType"] = pet_type.lower()
        if zip_code:
            params["zipCode"] = zip_code
        if max_price:
            params["maxPrice"] = str(max_price)
        if service_type:
            params["serviceIds"] = service_type.lower()
        if skills:
            params["skills"] = skills.lower()
        if min_rating:
            params["minRating"] = str(min_rating)

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BACKEND_URL}/api/search/sitters",
                params=params,
                timeout=10.0
            )
            response.raise_for_status()
            sitters = response.json()

            if not sitters:
                return "No sitters found matching your criteria. Try adjusting your search parameters."

            # Format results for the LLM
            results = []
            for sitter in sitters[:5]:  # Limit to top 5
                result = f"""
**{sitter['name']}** - ${sitter['hourlyRate']}/hour
- Location: {sitter.get('city', 'N/A')}, {sitter.get('state', 'N/A')} {sitter.get('zipCode', '')}
- Pets accepted: {', '.join(sitter.get('petTypesAccepted', []))}
- Skills: {', '.join(sitter.get('skills', []))}
- Profile: {sitter.get('bio', 'No bio available')[:100]}...
- ID: {sitter['id']}
"""
                results.append(result)

            return f"Found {len(sitters)} sitters. Top matches:\n\n" + "\n".join(results)

    except httpx.HTTPError as e:
        return f"Error searching sitters: {str(e)}"
    except Exception as e:
        return f"Unexpected error: {str(e)}"


async def get_sitter_details(
    sitter_id: Annotated[int, "ID of the pet sitter to get details for"]
) -> str:
    """
    Get detailed information about a specific pet sitter including services, reviews, and availability.
    """
    try:
        async with httpx.AsyncClient() as client:
            # Get sitter profile
            sitter_response = await client.get(
                f"{BACKEND_URL}/api/sitters/{sitter_id}",
                timeout=10.0
            )
            sitter_response.raise_for_status()
            sitter = sitter_response.json()

            # Get sitter's services
            services_response = await client.get(
                f"{BACKEND_URL}/api/services/sitter/{sitter_id}",
                timeout=10.0
            )
            services = services_response.json() if services_response.status_code == 200 else []

            # Get sitter's reviews
            reviews_response = await client.get(
                f"{BACKEND_URL}/api/reviews/sitter/{sitter_id}",
                timeout=10.0
            )
            reviews = reviews_response.json() if reviews_response.status_code == 200 else []

            # Calculate average rating
            avg_rating = sum(r['rating'] for r in reviews) / len(reviews) if reviews else 0

            # Format detailed response
            details = f"""
**{sitter['name']}** - ${sitter['hourlyRate']}/hour
📍 Location: {sitter.get('city', 'N/A')}, {sitter.get('state', 'N/A')} {sitter.get('zipCode', '')}
📧 Email: {sitter.get('email', 'N/A')}
📞 Phone: {sitter.get('phone', 'N/A')}

**About:**
{sitter.get('bio', 'No bio available')}

**Pets Accepted:**
{', '.join(sitter.get('petTypesAccepted', []))}

**Skills & Certifications:**
{', '.join(sitter.get('skills', []))}

**Services Offered:**
"""
            for service in services:
                details += f"\n- {service['name']}: ${service['price']}/{service.get('priceUnit', 'service')}"

            details += f"\n\n**Reviews:** ⭐ {avg_rating:.1f}/5.0 ({len(reviews)} reviews)"
            
            if reviews:
                details += "\n\nRecent reviews:"
                for review in reviews[:3]:
                    details += f"\n- ⭐ {review['rating']}/5: \"{review['comment']}\" - {review.get('ownerName', 'Anonymous')}"

            return details

    except httpx.HTTPError as e:
        return f"Error getting sitter details: {str(e)}"
    except Exception as e:
        return f"Unexpected error: {str(e)}"


async def get_available_services() -> str:
    """
    Get list of all service types available in the marketplace.
    """
    return """Available service types:
- **Overnight Boarding**: Sitter keeps pet at their home overnight
- **Daily Visit**: Sitter visits pet at owner's home 1-2 times per day
- **Walking**: Regular walks for dogs
- **Medication Administration**: Giving prescribed medications
- **Grooming**: Bathing, brushing, nail trimming

Common skills to look for:
- First Aid: Certified in pet first aid
- Medication Administration: Trained to give medications
- Training: Professional dog training experience
- Grooming: Professional grooming services
- Senior Pet Care: Experience with elderly pets
- Special Needs: Experience with disabled or special needs pets"""


# Create the agent
def create_sitter_agent() -> Agent:
    """Create the pet sitter recommendation agent with tools"""
    
    model = AzureAIInference(
        endpoint=AZURE_AI_ENDPOINT,
        api_key=AZURE_AI_KEY,
        model="gpt-4o",
    )

    agent = Agent(
        name="SitterRecommendationAgent",
        description="Intelligent assistant for finding and recommending pet sitters",
        instructions="""You are a helpful pet sitting assistant that helps pet owners find the perfect sitter for their pets.

Your capabilities:
1. Search for sitters based on pet type, location, budget, services, skills, and ratings
2. Provide detailed information about specific sitters
3. Explain available services and what they include
4. Make personalized recommendations based on pet owner needs

Guidelines:
- Always ask clarifying questions if needed (pet type, location, budget, special needs)
- Be friendly and reassuring about pet care
- Highlight sitters' relevant skills and certifications
- Explain pricing clearly
- Mention reviews and ratings when recommending sitters
- If no sitters match, suggest adjusting criteria (broader location, higher budget, etc.)
- Provide the sitter ID when recommending someone so they can book

When searching, use these parameters:
- pet_type: dog, cat, bird, reptile, rabbit, other
- service_type: overnight, daily visit, walking, medication, grooming
- skills: first aid, medication administration, training, grooming, senior pet care, special needs

Always be warm, professional, and focused on finding the best care for the pet.""",
        model=model,
        tools=[search_sitters, get_sitter_details, get_available_services],
    )

    return agent


# Global agent instance
sitter_agent = create_sitter_agent()
runner = Runner()


@app.post("/agent/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint for the sitter recommendation agent.
    Processes user messages and returns intelligent responses.
    """
    try:
        # Run the agent
        result = await runner.run(
            agent=sitter_agent,
            task=request.message,
        )

        # Extract the response
        response_text = ""
        if result.messages:
            # Get the last assistant message
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
        "service": "sitter-agent",
        "timestamp": datetime.utcnow().isoformat(),
        "azure_ai_configured": bool(AZURE_AI_KEY),
        "backend_url": BACKEND_URL,
    }


@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": "Octopets Sitter Recommendation Agent",
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
    port = int(os.getenv("PORT", "8001"))
    uvicorn.run(app, host="0.0.0.0", port=port)
