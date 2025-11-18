# Octopets - Pet Sitter MarketPlace Platform

## 🙋‍♂️ About the project

Octopets is a platform designed to help pet owners find and share pet-friendly venues. The application allows users to:

- Browse and search for pet-friendly venues by pet type and venue type
- View details about each venue, including allowed pet types, amenities, and photos
- Navigate between main pages: Home, Listings, Add Listing, Listing Details, and Reviews

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

### 🎯 Quick Start (Development)

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