# Running the Pet Sitter Marketplace MVP

This guide will help you run the MVP locally to see the results.

## Prerequisites

- .NET 9.0 SDK
- Node.js 18+ and npm

## Quick Start

### Option 1: Run Both Backend and Frontend (Recommended)

Open **two terminal windows** in VS Code:

#### Terminal 1 - Backend API
```powershell
cd backend
dotnet restore
dotnet run
```
The backend will start on: **http://localhost:5000**
- API endpoints: http://localhost:5000/api/*
- Scalar API docs: http://localhost:5000/scalar/v1

#### Terminal 2 - Frontend React App
```powershell
cd frontend
npm install
npm start
```
The frontend will start on: **http://localhost:3000**

### Option 2: Backend Only (Test API)

```powershell
cd backend
dotnet run
```

Then visit:
- **http://localhost:5000/scalar/v1** - Interactive API documentation
- Test endpoints like:
  - GET http://localhost:5000/api/search/sitters?zipCode=90210
  - GET http://localhost:5000/api/sitters/sitter-1

## What to Expect

### Backend API (Port 5000)
The backend API is running with:
- ✅ In-memory database seeded with mock data
  - 2 pet owners
  - 3 pets
  - 3 pet sitters
  - 5 services
  - 90 availability records
  - 2 bookings
- ✅ All REST endpoints functional
- ✅ Scalar API documentation at `/scalar/v1`

**Available Endpoints:**
- `GET /api/search/sitters` - Search sitters by location/dates
- `GET /api/sitters/{id}` - Get sitter profile
- `GET /api/sitters/{id}/services` - Get sitter services
- `GET /api/sitters/{id}/reviews` - Get sitter reviews
- `GET /api/sitters/{id}/availability` - Get sitter availability
- `POST /api/bookings` - Create booking
- `GET /api/bookings/{id}` - Get booking details
- `PATCH /api/bookings/{id}/status` - Update booking status
- `GET /api/owners/{id}/bookings` - Get owner bookings

### Frontend React App (Port 3000)
The frontend will be running with:
- ✅ Search page with filters
- ✅ Sitter profile view
- ✅ Booking flow
- ✅ Messaging interface
- ✅ Navigation between pages

**Note:** The frontend is configured to use **mock data** by default (see `frontend/src/config/appConfig.ts`). To connect to the backend API, set `REACT_APP_USE_MOCK_DATA=false` in environment or modify `appConfig.ts`.

## Testing the MVP

### 1. Test Backend API (Scalar UI)
1. Navigate to http://localhost:5000/scalar/v1
2. Try these requests:
   - **Search Sitters:** GET `/api/search/sitters?zipCode=90210&startDate=2025-11-20&endDate=2025-11-22`
   - **Get Sitter Profile:** GET `/api/sitters/sitter-1`
   - **Create Booking:** POST `/api/bookings` with body:
     ```json
     {
       "ownerId": "owner-1",
       "sitterId": "sitter-1",
       "petId": "pet-1",
       "serviceId": "service-1",
       "startDate": "2025-11-20",
       "endDate": "2025-11-22",
       "specialInstructions": "Test booking"
     }
     ```

### 2. Test Frontend UI
1. Navigate to http://localhost:3000
2. Click **"Search for Pet Sitters"**
3. Enter search criteria (e.g., zip code 90210, dates)
4. Click **"Search"** to see results
5. Click on a sitter card to view full profile
6. Try creating a booking
7. View **"My Bookings"** page
8. Check **"Messages"** page

### 3. Test Frontend + Backend Integration
To enable frontend-backend communication:

**Option A:** Modify `frontend/src/config/appConfig.ts`:
```typescript
export const appConfig = {
  enableMarketplace: true,
  useMockData: false, // Change to false
  apiBaseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000'
};
```

**Option B:** Set environment variable:
```powershell
$env:REACT_APP_USE_MOCK_DATA="false"
npm start
```

Then test the full flow:
1. Search for sitters (hits backend API)
2. View sitter profile (fetches from API)
3. Create booking (posts to API)
4. View bookings (fetches from API)

## Troubleshooting

### Backend won't start
- Check if port 5000 is available: `netstat -ano | findstr :5000`
- Verify .NET 9.0 SDK: `dotnet --version`
- Run `dotnet restore` in backend folder

### Frontend won't start
- Check if port 3000 is available
- Delete `node_modules` and run `npm install` again
- Verify Node.js: `node --version` (should be 18+)

### CORS errors
- Ensure backend is running on port 5000
- Check `Program.cs` has CORS configured for `http://localhost:3000`
- Verify `frontend/package.json` has `"proxy": "http://localhost:5000"`

### No data appearing
- Backend: Check if database was seeded (look for console logs on startup)
- Frontend: Check `appConfig.ts` - if `useMockData: true`, it won't call backend
- Check browser console (F12) for errors

## Next Steps

After verifying the MVP works:
1. ✅ Complete T051: Populate data/*.json files
2. ✅ Add CSS styling for better UI
3. ✅ Integrate with Aspire orchestration
4. ✅ Start Phase 4: Profile Management (T061-T107)

## Current Limitations (Expected)

- ⚠️ No authentication/authorization (using hardcoded owner-1)
- ⚠️ No persistent database (in-memory, resets on restart)
- ⚠️ Basic error handling (no retry logic)
- ⚠️ No CSS styling (functional UI only)
- ⚠️ Mock data only (Phase 2 seed data)
- ⚠️ No file uploads (photos use placeholder URLs)

These will be addressed in future phases and Aspire integration.
