---
description: "Task breakdown for Pet Sitter Marketplace implementation"
---

# Tasks: Pet Sitter Marketplace

**Feature Branch**: `001-pet-sitter-marketplace`  
**Input**: Design documents from `/specs/001-pet-sitter-marketplace/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/pet-owner-api.yaml ✅

**Tests**: Tests are NOT explicitly requested in the specification, so test tasks are excluded per template instructions.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and marketplace-specific structure setup

- [ ] T001 Create mock data source files: data/sitters.json, data/bookings.json, data/reviews.json, data/services.json
- [ ] T002 [P] Create backend model files: backend/Models/PetOwner.cs, backend/Models/PetSitter.cs, backend/Models/Booking.cs
- [ ] T003 [P] Create backend model files: backend/Models/Service.cs, backend/Models/Availability.cs, backend/Models/Message.cs, backend/Models/Pet.cs
- [ ] T004 Create repository interface files in backend/Repositories/Interfaces/
- [ ] T005 Review existing authentication patterns in backend/Program.cs and document approach for marketplace

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Update backend/Data/AppDbContext.cs to add DbSet properties for PetOwner, PetSitter, Booking, Service, Availability, Message, Pet
- [ ] T007 Implement SeedData method in backend/Data/AppDbContext.cs for marketplace entities (sync with data/*.json)
- [ ] T008 Create base repository implementations: backend/Repositories/PetOwnerRepository.cs, backend/Repositories/PetSitterRepository.cs
- [ ] T009 [P] Create base repository implementations: backend/Repositories/BookingRepository.cs, backend/Repositories/ServiceRepository.cs
- [ ] T010 [P] Create base repository implementations: backend/Repositories/AvailabilityRepository.cs, backend/Repositories/MessageRepository.cs, backend/Repositories/PetRepository.cs
- [ ] T011 Register all new repositories in backend/Program.cs dependency injection
- [ ] T012 Create frontend service files: frontend/src/data/sitterService.ts, frontend/src/data/bookingService.ts, frontend/src/data/messageService.ts
- [ ] T013 Create frontend mock data files: frontend/src/data/sitterData.ts, frontend/src/data/bookingData.ts (sync with data/*.json)
- [ ] T014 Update frontend/src/config/appConfig.ts to handle marketplace feature toggle if needed
- [ ] T015 Create frontend routing structure in App.tsx for marketplace routes (placeholder components)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Pet Owner Search & Booking (Priority: P1) 🎯 MVP

**Goal**: Enable pet owners to search for pet sitters by location and dates, view detailed profiles, and submit booking requests

**Independent Test**: Create mock pet owner account, search by zip code and dates (e.g., "90210", next week), view at least 3 sitter profiles with services/rates/photos, submit booking request, verify confirmation notification

### Implementation for User Story 1

**Backend - Search Endpoints**

- [ ] T016 [P] [US1] Create backend/Endpoints/SearchEndpoints.cs with MapGroup("/api/search")
- [ ] T017 [US1] Implement GET /api/search/sitters endpoint (location, startDate, endDate params) in backend/Endpoints/SearchEndpoints.cs
- [ ] T018 [US1] Implement basic geographic filtering logic (radius calculation) in SearchEndpoints.cs
- [ ] T019 [US1] Implement availability filtering logic in SearchEndpoints.cs (cross-reference with Availability and Booking entities)

**Backend - Sitter Profile Endpoints**

- [ ] T020 [P] [US1] Create backend/Endpoints/PetSitterEndpoints.cs with MapGroup("/api/sitters")
- [ ] T021 [US1] Implement GET /api/sitters/{id} endpoint (public profile view) in backend/Endpoints/PetSitterEndpoints.cs
- [ ] T022 [US1] Implement GET /api/sitters/{id}/services endpoint in backend/Endpoints/PetSitterEndpoints.cs
- [ ] T023 [US1] Implement GET /api/sitters/{id}/reviews endpoint in backend/Endpoints/PetSitterEndpoints.cs

**Backend - Booking Request Endpoints**

- [ ] T024 [P] [US1] Create backend/Endpoints/BookingEndpoints.cs with MapGroup("/api/bookings")
- [ ] T025 [US1] Implement POST /api/bookings endpoint (create booking request) in backend/Endpoints/BookingEndpoints.cs
- [ ] T026 [US1] Implement GET /api/bookings/{id} endpoint (booking details) in backend/Endpoints/BookingEndpoints.cs
- [ ] T027 [US1] Add booking request validation (dates not in past, sitter availability check) in backend/Endpoints/BookingEndpoints.cs

**Backend - Pet Owner Endpoints**

- [ ] T028 [P] [US1] Create backend/Endpoints/PetOwnerEndpoints.cs with MapGroup("/api/owners")
- [ ] T029 [US1] Implement GET /api/owners/{id}/bookings endpoint in backend/Endpoints/PetOwnerEndpoints.cs

**Frontend - Search Interface**

- [ ] T030 [P] [US1] Create frontend/src/pages/SearchPage.tsx with location/date inputs
- [ ] T031 [P] [US1] Create frontend/src/components/search/SearchBar.tsx component
- [ ] T032 [P] [US1] Create frontend/src/components/search/SearchResults.tsx component with results grid
- [ ] T033 [P] [US1] Create frontend/src/components/sitter/SitterCard.tsx component (search result card)
- [ ] T034 [US1] Implement search form submission and API call in SearchPage.tsx using sitterService.ts
- [ ] T035 [US1] Implement search results display with SitterCard components in SearchResults.tsx
- [ ] T036 [US1] Add loading states and error handling to SearchPage.tsx

**Frontend - Sitter Profile View**

- [ ] T037 [P] [US1] Create frontend/src/pages/SitterProfilePage.tsx
- [ ] T038 [P] [US1] Create frontend/src/components/sitter/SitterProfile.tsx component
- [ ] T039 [P] [US1] Create frontend/src/components/sitter/ServiceList.tsx component
- [ ] T040 [US1] Implement profile data fetching in SitterProfilePage.tsx using sitterService.ts
- [ ] T041 [US1] Display sitter details (bio, photos, services, rates, skills) in SitterProfile.tsx
- [ ] T042 [US1] Display reviews and ratings in SitterProfile.tsx

**Frontend - Booking Request**

- [ ] T043 [P] [US1] Create frontend/src/components/booking/BookingForm.tsx
- [ ] T044 [US1] Implement booking form (date selection, pet details, service selection) in BookingForm.tsx
- [ ] T045 [US1] Implement booking submission API call in BookingForm.tsx using bookingService.ts
- [ ] T046 [US1] Add booking confirmation display and navigation to owner dashboard
- [ ] T047 [US1] Add validation for date ranges and required fields in BookingForm.tsx

**Frontend - Owner Dashboard (Basic)**

- [ ] T048 [P] [US1] Create frontend/src/pages/OwnerDashboardPage.tsx
- [ ] T049 [US1] Implement bookings list display (pending, accepted, completed) in OwnerDashboardPage.tsx
- [ ] T050 [US1] Implement booking status indicators in OwnerDashboardPage.tsx

**Mock Data Synchronization**

- [ ] T051 [US1] Create comprehensive mock data: 10-15 sitters with varied services, locations, availability in data/sitters.json
- [ ] T052 [US1] Sync sitter mock data to frontend/src/data/sitterData.ts (exact match with data/sitters.json structure)
- [ ] T053 [US1] Sync sitter mock data to backend/Data/AppDbContext.cs SeedData method (exact match)
- [ ] T054 [US1] Verify REACT_APP_USE_MOCK_DATA toggle works for search and booking flows

**Integration & Polish**

- [ ] T055 [US1] Register SearchEndpoints, PetSitterEndpoints, BookingEndpoints, PetOwnerEndpoints in backend/Program.cs
- [ ] T056 [US1] Add marketplace routes to frontend App.tsx (SearchPage, SitterProfilePage, OwnerDashboardPage)
- [ ] T057 [US1] Test complete user flow: search → view profile → submit booking → see in dashboard
- [ ] T058 [US1] Add logging and telemetry to all new backend endpoints
- [ ] T059 [US1] Handle edge case: no sitters available for search criteria (display helpful message)
- [ ] T060 [US1] Handle edge case: booking request for dates in past (validation error)

**Checkpoint**: User Story 1 MVP complete - pet owners can search, view profiles, and book sitters

---

## Phase 4: User Story 2 - Pet Sitter Profile Management (Priority: P1) 🎯 MVP

**Goal**: Enable pet sitters to create comprehensive profiles showcasing services, skills, rates, availability, and photos

**Independent Test**: Create mock sitter account, complete profile with bio (50+ chars), upload 2+ photos, define 3+ services with pricing, set availability for next 30 days, verify profile appears in search results

### Implementation for User Story 2

**Backend - Profile Management Endpoints**

- [ ] T061 [P] [US2] Implement PUT /api/sitters/{id} endpoint (update profile) in backend/Endpoints/PetSitterEndpoints.cs
- [ ] T062 [P] [US2] Implement PUT /api/sitters/{id}/services endpoint (manage services) in backend/Endpoints/PetSitterEndpoints.cs
- [ ] T063 [US2] Add profile validation (bio min length, required fields) in PetSitterEndpoints.cs
- [ ] T064 [US2] Implement service CRUD operations in backend/Repositories/ServiceRepository.cs

**Backend - Availability Management Endpoints**

- [ ] T065 [P] [US2] Create backend/Endpoints/AvailabilityEndpoints.cs with MapGroup("/api/availability")
- [ ] T066 [US2] Implement GET /api/sitters/{id}/availability endpoint in backend/Endpoints/AvailabilityEndpoints.cs
- [ ] T067 [US2] Implement PUT /api/sitters/{id}/availability endpoint (batch update calendar) in backend/Endpoints/AvailabilityEndpoints.cs
- [ ] T068 [US2] Add logic to automatically mark dates unavailable when booking accepted

**Backend - Photo Upload Endpoints**

- [ ] T069 [P] [US2] Implement POST /api/sitters/{id}/photos endpoint (photo upload - local file storage for MVP) in backend/Endpoints/PetSitterEndpoints.cs
- [ ] T070 [US2] Implement DELETE /api/sitters/{id}/photos/{photoId} endpoint in backend/Endpoints/PetSitterEndpoints.cs
- [ ] T071 [US2] Add photo validation (file size, format) in PetSitterEndpoints.cs

**Frontend - Profile Editing Interface**

- [ ] T072 [P] [US2] Create frontend/src/pages/ProfileEditPage.tsx
- [ ] T073 [P] [US2] Create form sections: basic info (bio, location, skills) in ProfileEditPage.tsx
- [ ] T074 [P] [US2] Create form sections: services offered with pricing in ProfileEditPage.tsx
- [ ] T075 [US2] Implement profile save functionality using sitterService.ts API calls
- [ ] T076 [US2] Add validation feedback for required fields and min lengths
- [ ] T077 [US2] Add success/error notifications after profile updates

**Frontend - Service Management**

- [ ] T078 [P] [US2] Create service management UI in ProfileEditPage.tsx (add/edit/remove services)
- [ ] T079 [US2] Implement service type selection (overnight, daily visit, walking, medication, grooming)
- [ ] T080 [US2] Implement pricing input for each service (hourly or flat rate)
- [ ] T081 [US2] Add pet type selection per service (dogs, cats, birds, reptiles, etc.)

**Frontend - Availability Calendar**

- [ ] T082 [P] [US2] Create frontend/src/components/sitter/AvailabilityCalendar.tsx component
- [ ] T083 [US2] Integrate calendar library (react-calendar or similar) in AvailabilityCalendar.tsx
- [ ] T084 [US2] Implement date selection/toggling (available/unavailable) in AvailabilityCalendar.tsx
- [ ] T085 [US2] Implement calendar save functionality using API calls
- [ ] T086 [US2] Display booked dates as read-only in calendar

**Frontend - Photo Upload**

- [ ] T087 [P] [US2] Create photo upload component in ProfileEditPage.tsx
- [ ] T088 [US2] Implement file input and preview functionality
- [ ] T089 [US2] Implement photo upload API call with progress indicator
- [ ] T090 [US2] Implement photo deletion functionality
- [ ] T091 [US2] Add validation for file size and format (client-side)
- [ ] T092 [US2] Display uploaded photos in grid with delete option

**Frontend - Sitter Dashboard**

- [ ] T093 [P] [US2] Create frontend/src/pages/SitterDashboardPage.tsx
- [ ] T094 [US2] Display profile completeness indicator in SitterDashboardPage.tsx
- [ ] T095 [US2] Add "Edit Profile" navigation link to ProfileEditPage
- [ ] T096 [US2] Display upcoming bookings summary in SitterDashboardPage.tsx

**Mock Data Synchronization**

- [ ] T097 [US2] Update mock data in data/sitters.json with complete profile examples (bio, photos, services, availability)
- [ ] T098 [US2] Sync updated sitter data to frontend/src/data/sitterData.ts
- [ ] T099 [US2] Sync updated sitter data to backend/Data/AppDbContext.cs SeedData method
- [ ] T100 [US2] Create mock availability data in data/availability.json and sync to AppDbContext.cs

**Integration & Polish**

- [ ] T101 [US2] Register AvailabilityEndpoints in backend/Program.cs
- [ ] T102 [US2] Add ProfileEditPage and SitterDashboardPage routes to frontend App.tsx
- [ ] T103 [US2] Test complete profile creation flow: signup → profile edit → add services → set availability → upload photos
- [ ] T104 [US2] Test profile appears correctly in search results from US1
- [ ] T105 [US2] Add logging and telemetry to profile and availability endpoints
- [ ] T106 [US2] Handle edge case: incomplete profile warning before going live
- [ ] T107 [US2] Handle edge case: profile with no photos (placeholder image)

**Checkpoint**: User Story 2 complete - sitters can fully manage profiles and appear in search

---

## Phase 5: User Story 3 - Booking Management & Communication (Priority: P2)

**Goal**: Enable pet owners and sitters to manage bookings (accept/decline/cancel) and communicate via in-app messaging

**Independent Test**: Simulate full booking lifecycle: owner submits request → sitter receives notification → sitter accepts → both parties can message → owner can cancel with policy applied

### Implementation for User Story 3

**Backend - Booking Management Endpoints**

- [ ] T108 [P] [US3] Implement GET /api/bookings/pending endpoint (sitter view) in backend/Endpoints/BookingEndpoints.cs
- [ ] T109 [P] [US3] Implement PUT /api/bookings/{id}/accept endpoint in backend/Endpoints/BookingEndpoints.cs
- [ ] T110 [P] [US3] Implement PUT /api/bookings/{id}/decline endpoint with reason in backend/Endpoints/BookingEndpoints.cs
- [ ] T111 [P] [US3] Implement PUT /api/bookings/{id}/cancel endpoint with cancellation policy logic in backend/Endpoints/BookingEndpoints.cs
- [ ] T112 [US3] Add status transition validation (only pending bookings can be accepted/declined) in BookingEndpoints.cs
- [ ] T113 [US3] Implement availability auto-update when booking accepted (mark dates unavailable)

**Backend - Messaging Endpoints**

- [ ] T114 [P] [US3] Create backend/Endpoints/MessageEndpoints.cs with MapGroup("/api/messages")
- [ ] T115 [US3] Implement POST /api/messages endpoint (send message) in backend/Endpoints/MessageEndpoints.cs
- [ ] T116 [US3] Implement GET /api/messages/booking/{bookingId} endpoint in backend/Endpoints/MessageEndpoints.cs
- [ ] T117 [US3] Implement PUT /api/messages/{id}/read endpoint in backend/Endpoints/MessageEndpoints.cs
- [ ] T118 [US3] Implement GET /api/messages/unread endpoint (count) in backend/Endpoints/MessageEndpoints.cs
- [ ] T119 [US3] Add message validation (max length, non-empty) in MessageEndpoints.cs

**Frontend - Booking Management (Sitter)**

- [ ] T120 [P] [US3] Update frontend/src/pages/SitterDashboardPage.tsx to show pending requests
- [ ] T121 [P] [US3] Create frontend/src/components/booking/BookingCard.tsx for request display
- [ ] T122 [US3] Implement accept/decline buttons with confirmation dialogs in BookingCard.tsx
- [ ] T123 [US3] Implement API calls for accept/decline using bookingService.ts
- [ ] T124 [US3] Add success/error notifications after booking actions
- [ ] T125 [US3] Update booking list in real-time after accept/decline

**Frontend - Booking Management (Owner)**

- [ ] T126 [P] [US3] Update frontend/src/pages/OwnerDashboardPage.tsx to show booking statuses
- [ ] T127 [P] [US3] Create frontend/src/components/booking/BookingStatus.tsx component
- [ ] T128 [US3] Implement cancel booking button with confirmation in OwnerDashboardPage.tsx
- [ ] T129 [US3] Display cancellation policy warning before cancel
- [ ] T130 [US3] Implement cancel API call using bookingService.ts

**Frontend - Booking Details View**

- [ ] T131 [P] [US3] Create frontend/src/pages/BookingDetailsPage.tsx
- [ ] T132 [US3] Display complete booking information (dates, services, pet details, total cost, status)
- [ ] T133 [US3] Display sitter/owner contact information (after booking confirmed)
- [ ] T134 [US3] Add navigation to messaging interface from booking details
- [ ] T135 [US3] Add booking actions (cancel, contact sitter/owner) based on user role

**Frontend - Messaging Interface**

- [ ] T136 [P] [US3] Create frontend/src/pages/MessagingPage.tsx
- [ ] T137 [P] [US3] Create frontend/src/components/messaging/MessageThread.tsx component
- [ ] T138 [P] [US3] Create frontend/src/components/messaging/MessageInput.tsx component
- [ ] T139 [US3] Implement message fetching for booking in MessagingPage.tsx using messageService.ts
- [ ] T140 [US3] Implement message display with sender/timestamp in MessageThread.tsx
- [ ] T141 [US3] Implement message sending in MessageInput.tsx
- [ ] T142 [US3] Add auto-scroll to latest message in MessageThread.tsx
- [ ] T143 [US3] Implement mark-as-read functionality when viewing messages
- [ ] T144 [US3] Add unread message indicator in dashboards

**Mock Data Synchronization**

- [ ] T145 [US3] Create mock booking data with various statuses in data/bookings.json
- [ ] T146 [US3] Create mock message threads in data/messages.json
- [ ] T147 [US3] Sync booking and message data to frontend/src/data/bookingData.ts and messageData.ts
- [ ] T148 [US3] Sync booking and message data to backend/Data/AppDbContext.cs SeedData method

**Integration & Polish**

- [ ] T149 [US3] Register MessageEndpoints in backend/Program.cs
- [ ] T150 [US3] Add BookingDetailsPage and MessagingPage routes to frontend App.tsx
- [ ] T151 [US3] Test complete booking lifecycle: request → accept → message → cancel
- [ ] T152 [US3] Test booking status updates propagate correctly across both dashboards
- [ ] T153 [US3] Add logging and telemetry to booking management and messaging endpoints
- [ ] T154 [US3] Handle edge case: double-booking prevention (sitter can't accept overlapping bookings)
- [ ] T155 [US3] Handle edge case: messaging only available for confirmed bookings
- [ ] T156 [US3] Handle edge case: cancellation within 24 hours (no refund warning)

**Checkpoint**: User Story 3 complete - full booking lifecycle and communication working

---

## Phase 6: User Story 5 - Reviews & Ratings (Priority: P3)

**Goal**: Enable pet owners to submit reviews after completed bookings and display aggregate ratings on sitter profiles

**Independent Test**: Complete a booking, submit review with 1-5 star rating and comment, verify review appears on sitter profile, verify average rating updates

### Implementation for User Story 5

**Backend - Review Endpoints**

- [ ] T157 [P] [US5] Extend backend/Endpoints/ReviewEndpoints.cs (reuse existing or enhance)
- [ ] T158 [US5] Implement POST /api/reviews endpoint (submit review) in ReviewEndpoints.cs
- [ ] T159 [US5] Add validation: reviews only for completed bookings, one review per booking
- [ ] T160 [US5] Implement GET /api/reviews/sitter/{sitterId} endpoint with pagination
- [ ] T161 [US5] Implement GET /api/reviews/booking/{bookingId} endpoint
- [ ] T162 [US5] Add average rating calculation in sitter profile endpoint

**Frontend - Review Submission**

- [ ] T163 [P] [US5] Create frontend/src/pages/ReviewsPage.tsx
- [ ] T164 [P] [US5] Create frontend/src/components/reviews/ReviewForm.tsx
- [ ] T165 [P] [US5] Create frontend/src/components/reviews/RatingStars.tsx component
- [ ] T166 [US5] Implement star rating selection in RatingStars.tsx
- [ ] T167 [US5] Implement review text input with validation in ReviewForm.tsx
- [ ] T168 [US5] Implement review submission API call
- [ ] T169 [US5] Add "Leave Review" option in completed bookings list
- [ ] T170 [US5] Show confirmation after review submitted

**Frontend - Review Display**

- [ ] T171 [P] [US5] Create frontend/src/components/reviews/ReviewList.tsx
- [ ] T172 [US5] Update SitterProfile.tsx to display average rating and review count
- [ ] T173 [US5] Implement review list display with pagination in ReviewList.tsx
- [ ] T174 [US5] Display individual review cards (rating, comment, date, reviewer name) in ReviewList.tsx
- [ ] T175 [US5] Add aggregate rating display (average stars, total reviews) in sitter profile

**Mock Data Synchronization**

- [ ] T176 [US5] Update data/reviews.json with sample reviews for mock sitters
- [ ] T177 [US5] Sync review data to frontend/src/data/reviewData.ts
- [ ] T178 [US5] Sync review data to backend/Data/AppDbContext.cs SeedData method
- [ ] T179 [US5] Calculate and add average ratings to mock sitter data

**Integration & Polish**

- [ ] T180 [US5] Add ReviewsPage route to frontend App.tsx
- [ ] T181 [US5] Test review submission flow: complete booking → leave review → view on profile
- [ ] T182 [US5] Verify average rating updates correctly after new review
- [ ] T183 [US5] Add logging and telemetry to review endpoints
- [ ] T184 [US5] Handle edge case: can't review incomplete/cancelled bookings
- [ ] T185 [US5] Handle edge case: can't submit multiple reviews for same booking

**Checkpoint**: User Story 5 complete - reviews and ratings system functional

---

## Phase 7: User Story 6 - Advanced Search Filters (Priority: P3)

**Goal**: Enable pet owners to filter search results by pet type, services, skills, and price range for better matches

**Independent Test**: Search with various filter combinations (pet type=dog, service=overnight, price max=$50), verify results match all criteria, test filter clearing

### Implementation for User Story 6

**Backend - Enhanced Search Endpoints**

- [ ] T186 [US6] Update GET /api/search/sitters endpoint to accept filter parameters (petType, serviceIds, minRating, maxPrice) in backend/Endpoints/SearchEndpoints.cs
- [ ] T187 [US6] Implement pet type filtering logic in SearchEndpoints.cs
- [ ] T188 [US6] Implement service filtering logic (sitter must offer ALL requested services) in SearchEndpoints.cs
- [ ] T189 [US6] Implement price range filtering logic in SearchEndpoints.cs
- [ ] T190 [US6] Implement minimum rating filtering logic in SearchEndpoints.cs
- [ ] T191 [US6] Implement skills/certifications filtering in SearchEndpoints.cs

**Frontend - Filter Interface**

- [ ] T192 [P] [US6] Create frontend/src/components/search/SearchFilters.tsx component
- [ ] T193 [US6] Implement pet type filter (checkboxes: dog, cat, bird, reptile, other) in SearchFilters.tsx
- [ ] T194 [US6] Implement service type filter (checkboxes: overnight, daily visit, walking, medication, grooming) in SearchFilters.tsx
- [ ] T195 [US6] Implement price range slider in SearchFilters.tsx
- [ ] T196 [US6] Implement minimum rating filter (star selection) in SearchFilters.tsx
- [ ] T197 [US6] Implement special skills filter (checkboxes or multi-select) in SearchFilters.tsx
- [ ] T198 [US6] Add "Clear Filters" button in SearchFilters.tsx
- [ ] T199 [US6] Implement filter state management in SearchPage.tsx

**Frontend - Filtered Results**

- [ ] T200 [US6] Update SearchPage.tsx to pass filters to API call
- [ ] T201 [US6] Update SearchResults.tsx to display filter summary
- [ ] T202 [US6] Show filter count badge (e.g., "3 filters applied") in SearchResults.tsx
- [ ] T203 [US6] Display "No results" message with filter adjustment suggestions
- [ ] T204 [US6] Implement filter persistence in URL query parameters for shareable links

**Mock Data Enhancement**

- [ ] T205 [US6] Enhance data/sitters.json with diverse pet types, services, skills for filter testing
- [ ] T206 [US6] Sync enhanced sitter data to frontend/src/data/sitterData.ts
- [ ] T207 [US6] Sync enhanced sitter data to backend/Data/AppDbContext.cs SeedData method

**Integration & Polish**

- [ ] T208 [US6] Test all filter combinations work correctly (AND logic)
- [ ] T209 [US6] Test filter clearing returns to full results
- [ ] T210 [US6] Verify filter state persists across page navigation
- [ ] T211 [US6] Add logging for filter usage analytics
- [ ] T212 [US6] Handle edge case: filters too restrictive, no results (suggest loosening)
- [ ] T213 [US6] Handle edge case: malformed filter parameters (validation)

**Checkpoint**: User Story 6 complete - advanced search filters functional

---

## Phase 8: Agent Integration Enhancement (Optional)

**Goal**: Enhance existing AI agents to provide intelligent marketplace recommendations

**Note**: This phase is optional and can be implemented after core marketplace features are complete.

- [ ] T214 [P] Update orchestrator-agent/orchestrator.py to add marketplace tool functions
- [ ] T215 [P] Create find_available_sitters() tool function in orchestrator.py
- [ ] T216 [P] Create get_sitter_recommendations() tool function in orchestrator.py
- [ ] T217 Update frontend/src/data/agentService.ts to add marketplace agent query types
- [ ] T218 Test orchestrator routing for marketplace queries ("find dog sitter in LA")
- [ ] T219 Consider creating specialized "Booking Agent" for complex booking logic

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and production readiness

- [ ] T220 [P] Add comprehensive error boundaries in frontend App.tsx
- [ ] T221 [P] Implement loading states across all pages (SearchPage, SitterProfilePage, dashboards)
- [ ] T222 [P] Add responsive design CSS for mobile/tablet in all new components
- [ ] T223 [P] Implement accessibility audit (ARIA labels, keyboard navigation, screen reader support)
- [ ] T224 [P] Add input validation styling and error messages across all forms
- [ ] T225 [P] Implement success toast notifications for all user actions
- [ ] T226 Create comprehensive health check endpoint at /api/marketplace/health in backend
- [ ] T227 Add OpenTelemetry tracing to all new marketplace endpoints
- [ ] T228 Implement rate limiting on search and booking endpoints
- [ ] T229 Add CORS configuration validation for production deployment
- [ ] T230 Create quickstart.md documentation for marketplace feature development
- [ ] T231 Document API contracts in specs/001-pet-sitter-marketplace/contracts/api-endpoints.md
- [ ] T232 Create frontend route documentation in specs/001-pet-sitter-marketplace/contracts/frontend-routes.md
- [ ] T233 [P] Run frontend E2E Playwright tests for P1 user stories
- [ ] T234 Verify mock data synchronization across all three locations (data/, frontend/, backend/)
- [ ] T235 Test marketplace with REACT_APP_USE_MOCK_DATA toggle (both true and false)
- [ ] T236 Verify Aspire Dashboard shows all services healthy with marketplace endpoints
- [ ] T237 Test deployment to Azure Container Apps via `aspire deploy`
- [ ] T238 Performance test: verify search results load in <3 seconds
- [ ] T239 Performance test: verify booking submission completes in <5 seconds
- [ ] T240 Create data-model.md with complete entity schemas in specs/001-pet-sitter-marketplace/

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) - Can start immediately after Phase 2
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) - Can run in PARALLEL with User Story 1
- **User Story 3 (Phase 5)**: Depends on User Story 1 and 2 (needs search, profiles, and basic booking)
- **User Story 5 (Phase 6)**: Depends on User Story 3 (needs completed bookings for reviews)
- **User Story 6 (Phase 7)**: Depends on User Story 1 (enhances existing search)
- **Agent Integration (Phase 8)**: Optional, depends on User Story 1 and 2
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Independence

- ✅ **User Story 1 (Search & Booking)**: Can be developed, tested, and deployed independently after Phase 2
- ✅ **User Story 2 (Profile Management)**: Can be developed in PARALLEL with US1, independently testable
- ⚠️ **User Story 3 (Booking Management)**: Requires US1 (booking creation) and US2 (sitter profiles) to be complete
- ⚠️ **User Story 5 (Reviews)**: Requires US3 (completed bookings) to be complete
- ✅ **User Story 6 (Advanced Filters)**: Extends US1 but can be tested independently by verifying filter logic

### Within Each User Story

- Backend models before repositories
- Repositories before endpoints
- Endpoints registered before frontend integration
- Frontend service layer before pages/components
- Pages before components that use them
- Mock data synchronized after backend models defined
- Integration testing after all pieces complete

### Parallel Opportunities

**Phase 1 (Setup)**: T002 and T003 can run in parallel (different model files)

**Phase 2 (Foundational)**: T009 and T010 can run in parallel (different repository files), T012 can run in parallel with backend work

**Phase 3 (User Story 1)**: 
- T016, T020, T024, T028 can all start in parallel (different endpoint files)
- T030, T031, T032, T033 can all start in parallel (different component files)
- T037, T038, T039, T043 can all start in parallel (different component files)

**Phase 4 (User Story 2)**:
- T061, T062, T069 can run in parallel (different endpoint methods)
- T072, T073, T074, T082, T087, T093 can run in parallel (different components)

**Phases 3 and 4 can run in PARALLEL** if team capacity allows - US1 and US2 are independently deliverable

---

## Parallel Example: Foundational Phase

```bash
# Team can work on different areas simultaneously after T006-T007 complete:

Developer A:
- T008: Backend repositories (PetOwner, PetSitter)
- T011: Register repositories

Developer B (parallel):
- T009: Backend repositories (Booking, Service)
- T010: Backend repositories (Availability, Message, Pet)

Developer C (parallel):
- T012: Frontend service files
- T013: Frontend mock data files
- T014: Frontend config updates
```

---

## Parallel Example: User Story 1 (MVP)

```bash
# Once Phase 2 complete, can split US1 work:

Backend Developer:
- T016-T019: Search endpoints
- T020-T023: Sitter profile endpoints
- T024-T027: Booking endpoints
- T028-T029: Pet owner endpoints

Frontend Developer (parallel):
- T030-T036: Search interface
- T037-T042: Sitter profile view
- T043-T047: Booking form
- T048-T050: Owner dashboard

Mock Data Developer (parallel):
- T051-T054: Mock data synchronization
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. ✅ Complete Phase 1: Setup (T001-T005)
2. ✅ Complete Phase 2: Foundational (T006-T015) - **CRITICAL CHECKPOINT**
3. ✅ Complete Phase 3: User Story 1 (T016-T060) - Search and Booking
4. ✅ Complete Phase 4: User Story 2 (T061-T107) - Profile Management (can overlap with US1)
5. **STOP and VALIDATE**: Test both stories independently, verify constitution compliance
6. Deploy/demo if ready - This is a functional marketplace MVP!

### Incremental Delivery (Recommended)

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Core marketplace function!)
3. Add User Story 2 (parallel or sequential) → Test independently → Deploy/Demo (Complete marketplace MVP!)
4. Add User Story 3 → Test independently → Deploy/Demo (Full lifecycle management)
5. Add User Story 5 → Test independently → Deploy/Demo (Trust and ratings)
6. Add User Story 6 → Test independently → Deploy/Demo (Enhanced discovery)
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With 3+ developers after Phase 2 complete:

1. **Team completes Setup + Foundational together** (T001-T015)
2. **Split into parallel workstreams:**
   - Developer A: User Story 1 - Search & Booking (T016-T060)
   - Developer B: User Story 2 - Profile Management (T061-T107)
   - Developer C: Polish & Infrastructure (T220-T240 selectively)
3. **Stories complete and integrate independently**

With 2 developers:
1. Both work on Foundational (faster completion of blocker)
2. Developer A: User Story 1
3. Developer B: User Story 2 (parallel)
4. Both: User Story 3 (requires integration)
5. Split: User Story 5 and 6 (can be parallel)

---

## Summary

- **Total Tasks**: 240 tasks across 9 phases
- **MVP Tasks**: T001-T107 (107 tasks for User Stories 1 + 2)
- **Critical Path**: Setup → Foundational (15 tasks, BLOCKS everything) → User Stories (priority order)
- **Parallel Opportunities**: 
  - Phase 1: 2 task groups
  - Phase 2: 3 task groups
  - Phase 3: 4 task groups (backend, frontend, mock data can be parallel)
  - Phase 4: Can run ENTIRELY parallel with Phase 3 if staffed
- **User Stories**:
  - US1 (P1): 45 tasks - Search and Booking (MVP core)
  - US2 (P1): 47 tasks - Profile Management (MVP core, parallel with US1)
  - US3 (P2): 49 tasks - Booking Management & Communication
  - US5 (P3): 29 tasks - Reviews & Ratings
  - US6 (P3): 28 tasks - Advanced Filters
- **Constitution Compliance**: All tasks follow mock data sync, Aspire orchestration, service discovery, and independent story delivery principles

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] label**: Maps task to specific user story for traceability and independent delivery
- **Checkpoint validation**: Stop after each user story phase to test independently
- **Mock data sync**: T051-T054, T097-T100, T145-T148, T176-T179 are CRITICAL - must maintain parity
- **Constitution VII compliance**: Each user story delivers standalone value and can be deployed independently
- **MVP recommendation**: Complete US1 + US2 (Phases 1-4) for functional marketplace
- **Testing approach**: Manual testing via Aspire Dashboard, frontend E2E tests for critical paths, optional backend tests
- **User Story 4 (Payment)**: Intentionally deferred to future phase - not in current task breakdown
