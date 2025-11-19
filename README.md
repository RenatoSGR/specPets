# Octopets - Pet Sitter MarketPlace Platform

## 🙋‍♂️ About the project

Octopets is a platform designed to help pet owners find and share pet-friendly venues. The application allows users to:

- Browse and search for pet-friendly venues by pet type and venue type
- View details about each venue, including allowed pet types, amenities, and photos
- Navigate between main pages: Home, Listings, Add Listing, Listing Details, and Reviews

This Repo is the reproducible demo from Microsoft Build 2025, and from GitHub Universe, that can be found https://github.com/Azure-Samples/octopets

![Octopets landing page](media/octopets-landing.gif)

## 🏗️ Tech stack

| Category | Technology |
| --- | --- |
| Frontend | React with TypeScript (functional components and hooks, 2025 latest) |
| Routing | React Router v7 |
| Backend | ASP.NET Core 9.0 with Minimal APIs |
| Database | Entity Framework Core 9.0 (with local database for development) |
| API Documentation | Swagger/OpenAPI with Scalar UI |
| Application Hosting | .NET Aspire for distributed application orchestration |
| Styling | Custom CSS with responsive design |
| Containerization | Docker for frontend deployment |
| Monitoring | Azure Application Insights (production only) |

## 🚀 Getting started

### 💻 Prerequisites

| Requirement | Version | Download Link |
| --- | --- | --- |
| Aspire CLI | Latest Daily | [Get Aspire CLI](https://github.com/dotnet/aspire/blob/main/docs/using-latest-daily.md) |
| GH CLI | Latest | [Get GH CLI](https://cli.github.com/) |
| .NET SDK | 9.0 or later | [Download .NET](https://dotnet.microsoft.com/download/dotnet/9.0) |
| Node.js | v18.0.0 or later | [Download Node.js](https://nodejs.org/) |
| npm | v10.0.0 or later | [npm Docs](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) (included with Node.js) |
| Python and uv | Latest | [uv Docs](https://docs.astral.sh/uv/) |
| Docker | Latest | [Download Docker](https://www.docker.com/products/docker-desktop/) |
| Visual Studio | Latest | [Download Visual Studio](https://visualstudio.microsoft.com/downloads/) |
| Visual Studio Code | Latest | [Download VS Code](https://code.visualstudio.com/) |
| C# Dev Kit | Latest | [C# Dev Kit Extension](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csdevkit) |

### 🎯 Quick Start (Using SpecKit)
#### **Video with the process**

[![Watch the video](https://raw.githubusercontent.com/RenatoSGR/specPets/main/media/video.png)](https://raw.githubusercontent.com/RenatoSGR/specPets/main/media/SpecPets.mp4)

SpecKit enables AI-assisted implementation of the pet sitter marketplace using the task breakdown in `/specs/pet-sitter-marketplace/tasks.md`.

#### **Step 1: Review Project Specifications**
```bash
# Open the project specifications folder
code specs/pet-sitter-marketplace/

# Key files to review:
# - spec.md          → Feature requirements and user stories
# - tasks.md         → Detailed task breakdown (372 tasks across 10 phases)
# - data-model.md    → Database schema and entity relationships
# - contracts/       → API contracts and endpoint definitions
```

#### **Step 2: Implement Tasks Using AI Assistant**

**Option A: Single Task Implementation**
```
Prompt: "Implement task T001: Create mock data source files: 
data/sitters.json, data/bookings.json, data/reviews.json, data/services.json"

# AI will:
# 1. Create the required JSON files
# 2. Populate with realistic mock data
# 3. Follow data model from specs/pet-sitter-marketplace/data-model.md
```

**Option B: Phase-Based Implementation**
```
Prompt: "Implement Phase 1 (Setup) tasks T001-T005 from 
specs/pet-sitter-marketplace/tasks.md"

# AI will implement all tasks in the phase:
# - Create mock data files
# - Create backend model files
# - Set up repository interfaces
# - Review authentication patterns
```

**Option C: User Story Implementation**
```
Prompt: "Implement User Story 1 (Search & Booking) tasks T016-T060. 
Use frontend-templates/ directory for UI design reference."

# AI will:
# 1. Create backend endpoints (SearchEndpoints, PetSitterEndpoints, BookingEndpoints)
# 2. Create frontend pages and components (SearchPage, SitterCard, BookingForm)
# 3. Reference design templates from frontend-templates/
# 4. Implement API integration
# 5. Sync mock data across data/, frontend/src/data/, and backend/Data/
```

#### **Step 3: Validate Implementation**
```bash
# After implementing tasks, test locally with Aspire
aspire run

# Open Aspire Dashboard (auto-opens at http://localhost:15888)
# - Verify all services are running (backend, frontend, agents)
# - Check service endpoints and logs
# - Test the implemented features in the frontend
```

#### **Step 4: Incremental Deployment**
```
Prompt: "I've completed User Stories 1 and 2 (MVP). 
Implement Phase 9 (Polish) and Phase 10 (Azure Deployment) tasks."

# AI will:
# 1. Add production readiness features (error handling, monitoring, health checks)
# 2. Configure Azure deployment with azd
# 3. Set up Container Apps and Azure AI Foundry
# 4. Provide deployment commands and validation steps
```

#### **Common SpecKit Prompts**

**For Backend Development:**
```
"Implement backend endpoints for [feature] following the repository pattern 
in backend/Repositories/ and register in Program.cs"
```

**For Frontend Development:**
```
"Create frontend components for [feature] using design templates from 
frontend-templates/ directory. Match the layout from [template-name].png"
```

**For Mock Data Synchronization:**
```
"Sync mock data from data/[entity].json to frontend/src/data/[entity]Data.ts 
and backend/Data/AppDbContext.cs SeedData method"
```

**For Agent Enhancement:**
```
"Update orchestrator-agent to coordinate queries between listings agent 
and sitter agent for marketplace searches"
```

**For Deployment:**
```
"Deploy the marketplace to Azure Container Apps using azd. 
Configure all services (backend, frontend, 3 agents) with Azure AI Foundry integration."
```

#### **Task Progress Tracking**

Track your implementation progress:
```markdown
- [ ] Phase 1: Setup (T001-T005) → Foundation
- [ ] Phase 2: Foundational (T006-T015) → CRITICAL - blocks all user stories
- [ ] Phase 3: User Story 1 (T016-T060) → MVP Core - Search & Booking
- [ ] Phase 4: User Story 2 (T061-T107) → MVP Core - Profile Management
- [ ] Phase 5: User Story 3 (T108-T156) → Booking Management & Communication
- [ ] Phase 6: User Story 5 (T157-T185) → Reviews & Ratings
- [ ] Phase 7: User Story 6 (T186-T213) → Advanced Search Filters
- [ ] Phase 8: Agent Integration (T214-T219) → Optional
- [ ] Phase 9: Polish (T220-T239) → Production Readiness
- [ ] Phase 10: Azure Deployment (T240-T372) → Production Deployment
```

**Recommended Implementation Order:**
1. **MVP First**: Phases 1-4 (User Stories 1 & 2) → Functional marketplace
2. **Test Locally**: `aspire run` → Validate all features work
3. **Add Features**: Phases 5-7 (User Stories 3, 5, 6) → Full functionality
4. **Production Ready**: Phase 9 → Polish and optimize
5. **Deploy**: Phase 10 → Azure Container Apps + AI Foundry

#### **Pro Tips**

- **Reference templates**: Always mention "use frontend-templates/" when working on UI
- **Parallel tasks**: Tasks marked `[P]` can be implemented simultaneously
- **Mock data sync**: Critical checkpoints at T051-T054, T097-T100, T145-T148, T176-T179
- **Constitution compliance**: Each user story is independently testable and deployable
- **Design consistency**: All frontend work should reference `/frontend-templates` images

### 🎯 Quick Start (Development Mode)

#### **Option 1: Using .NET Aspire (Recommended)**
```bash
# Clone the repository
git clone <repo-url>
cd octopets

# Install Aspire (if not already installed)
dotnet workload restore

# Run everything (frontend + backend + all services)
dotnet run --project apphost

# Aspire Dashboard opens automatically at http://localhost:15888
# Frontend: http://localhost:5173
# Backend API: http://localhost:5246
```

#### **Option 2: Manual Start (Development)**
```bash
# Terminal 1: Start Backend
cd backend
dotnet run

# Terminal 2: Start Frontend  
cd frontend
npm install
npm start

# Frontend: http://localhost:5173
# Backend: http://localhost:5246
```

### 📋 First Run Steps

1. **Open Frontend**: Navigate to http://localhost:5173
2. **Explore Listings**: Click on listings to see sitter profiles
3. **Register as Sitter**: Go to "Become a Pet Sitter" and fill out the form
4. **Book a Sitter**: Click "Book Now" on any sitter profile to create a booking
5. **Check API**: Visit http://localhost:5246/health to verify backend

---

## 🧪 Testing

### Test the API Endpoints

```bash
# Get health status
curl http://localhost:5246/health

# List all sitters
curl http://localhost:5246/api/sitters

# List all bookings
curl http://localhost:5246/api/bookings

# Create a new sitter
curl -X POST http://localhost:5246/api/sitters/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Sitter",
    "email": "test@example.com",
    "hourlyRate": 30,
    "maxPetsAtOnce": 5,
    "petTypesAccepted": ["dog", "cat"],
    "skills": ["walking", "feeding"]
  }'
```

### Frontend Testing

1. **Form Submission**: Test "Become a Pet Sitter" form → data sent to `/api/sitters/register`
2. **Booking**: Test "Book Now" modal → data sent to `/api/bookings`
3. **Success Messages**: Verify alerts confirm successful operations
4. **Data Persistence**: Refresh page and verify data remains

---

## 📁 Project Structure

```
octopets/
├── apphost/                    # .NET Aspire orchestrator
├── backend/                    # ASP.NET Core 9.0 API
│   ├── Endpoints/             # API endpoint definitions
│   ├── Models/                # Data entities
│   ├── Repositories/          # Data access layer
│   ├── Data/                  # Database configuration & seed data
│   └── Program.cs             # Startup configuration
├── frontend/                   # React 18 + TypeScript
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── styles/           # CSS files
│   │   ├── services/         # API services
│   │   └── App.tsx           # Main app component
│   └── package.json
├── docs/                       # Project documentation
│   ├── API-TESTING-SUMMARY.md
│   ├── FRONTEND-BACKEND-INTEGRATION-TESTS.md
│   ├── DEPLOYMENT-READINESS.md
│   └── PROJECT-STATUS-FINAL.md
└── README.md                   # This file
```

---

## 🔑 Key Features

### Frontend
- ✅ Responsive React UI with React Router
- ✅ Pet sitter search and filtering
- ✅ Sitter profile with reviews
- ✅ Booking form with cost calculation
- ✅ Sitter registration form
- ✅ Professional CSS with animations

### Backend API
- ✅ 18 REST endpoints for complete CRUD operations
- ✅ Sitter registration and profile management
- ✅ Booking lifecycle management (create, accept, complete, cancel)
- ✅ Review system with ratings
- ✅ In-memory EF Core database with seed data
- ✅ Repository pattern for data access
- ✅ CORS configured for frontend
- ✅ Health check endpoint

---

## 📊 API Endpoints

### Sitters
```
POST   /api/sitters/register          Register new sitter
GET    /api/sitters/{id}/profile      Get sitter profile
PUT    /api/sitters/{id}/profile      Update sitter profile
GET    /api/sitters                   List all sitters
```

### Bookings
```
POST   /api/bookings                  Create booking
GET    /api/bookings                  List all bookings
GET    /api/bookings/{id}             Get specific booking
GET    /api/bookings/owner/{id}       Get owner's bookings
GET    /api/bookings/sitter/{id}      Get sitter's bookings
PUT    /api/bookings/{id}/accept      Accept booking
PUT    /api/bookings/{id}/complete    Complete booking
PUT    /api/bookings/{id}/cancel      Cancel booking
```

### Reviews
```
POST   /api/reviews                   Create review
GET    /api/reviews                   List all reviews
GET    /api/reviews/{id}              Get review
GET    /api/reviews/sitter/{id}       Get sitter reviews
GET    /api/reviews/booking/{id}      Get booking review
PUT    /api/reviews/{id}              Update review
DELETE /api/reviews/{id}              Delete review
```

### Health
```
GET    /health                        Service health status
```

---

## 🚢 Deployment

### Deploy to Azure

See [DEPLOYMENT-READINESS.md](docs/DEPLOYMENT-READINESS.md) for complete deployment guide.

**Quick Deploy** (Azure Container Apps):
```bash
# 1. Create Azure resources
az group create --name octopets-rg --location eastus

# 2. Build and push images
docker build -t octopets-backend:latest ./backend
docker build -t octopets-frontend:latest ./frontend

# 3. Deploy (follow DEPLOYMENT-READINESS.md for detailed steps)
```

---

## 📚 Documentation

- **[PROJECT-STATUS-FINAL.md](docs/PROJECT-STATUS-FINAL.md)** - Complete project status and achievements
- **[DEPLOYMENT-READINESS.md](docs/DEPLOYMENT-READINESS.md)** - Azure deployment guide
- **[API-TESTING-SUMMARY.md](docs/API-TESTING-SUMMARY.md)** - API testing results
- **[FRONTEND-BACKEND-INTEGRATION-TESTS.md](docs/FRONTEND-BACKEND-INTEGRATION-TESTS.md)** - Integration testing guide

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 5246 is in use
netstat -ano | findstr :5246

# Kill process (Windows)
taskkill /PID <PID> /F

# Try again
cd backend
dotnet run
```

### Frontend build errors
```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json

# Reinstall
npm install
npm start
```

### CORS errors in browser
- Backend is not running on http://localhost:5246
- Frontend URL not in CORS policy in Program.cs
- Try hard refresh (Ctrl+Shift+Delete)

### Database issues
- In-memory database resets on backend restart
- Check Data/AppDbContext.cs for seed data
- Verify EF Core migrations applied

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## 📝 License

This project is licensed under the MIT License.

---

**Next Steps**: Deploy to Azure, add authentication, implement payments

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review documentation in `/docs` folder
3. Check API responses in browser console
4. Review logs in backend terminal
