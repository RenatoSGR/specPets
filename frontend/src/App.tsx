import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { appConfig } from './config/appConfig';
import './App.css';
// Phase 3 Pages
import SearchPage from './pages/SearchPage';
import SitterProfilePage from './pages/SitterProfilePage';
import MyBookingsPage from './pages/MyBookingsPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import MessagesPage from './pages/MessagesPage';
// Phase 4 Pages
import SitterProfileManagePage from './pages/SitterProfileManagePage';
// Phase 5 Pages
import { SitterBookingsPage } from './pages/SitterBookingsPage';
import { OwnerBookingsPage } from './pages/OwnerBookingsPage';
import { BookingDetailsPage } from './pages/BookingDetailsPage';
// Phase 6 Pages
import ReviewsPage from './pages/ReviewsPage';
// Chat Component
import ChatInterface from './components/chat/ChatInterface';

/**
 * Main App Component
 * Defines routing structure for the Octopets application including marketplace
 */
function App() {
  return (
    <Router>
      <div className="app">
        {/* Navigation Header */}
        <nav className="app-nav">
          <div className="nav-brand">
            <Link to="/">Octopets</Link>
          </div>
          {appConfig.enableMarketplace && (
            <div className="nav-links">
              <Link to="/search">Listings</Link>
              <Link to="/bookings">My Bookings</Link>
              <Link to="/messages">Messages</Link>
              <Link to="/profile">Profile</Link>
              <Link to="/login" className="btn-nav-secondary">Login</Link>
              <Link to="/signup" className="btn-nav-primary">Sign up</Link>
            </div>
          )}
        </nav>

        <Routes>
          {/* Home route */}
          <Route path="/" element={<HomePage />} />
          
          {/* Marketplace routes */}
          {appConfig.enableMarketplace && (
            <>
              <Route path="/search" element={<SearchPage />} />
              <Route path="/sitters/:id" element={<SitterProfilePage />} />
              <Route path="/bookings" element={<MyBookingsPage />} />
              <Route path="/bookings/:id" element={<BookingConfirmationPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/manage" element={<SitterProfileManagePage />} />
              {/* Phase 5: Booking Management Routes (T149) */}
              <Route path="/sitter/bookings" element={<SitterBookingsPage />} />
              <Route path="/owner/bookings" element={<OwnerBookingsPage />} />
              <Route path="/bookings/:id/details" element={<BookingDetailsPage />} />
              <Route path="/bookings/:id/messages" element={<MessagesPage />} />
              {/* Phase 6: Reviews Routes (T180) */}
              <Route path="/bookings/:bookingId/review" element={<ReviewsPage />} />
            </>
          )}
          
          {/* 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

/**
 * HomePage Component
 * Landing page with navigation to main features
 */
function HomePage() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="home-hero">
        <div className="floating-pets">
          <span className="floating-pet">🐶</span>
          <span className="floating-pet">🦁</span>
          <span className="floating-pet">🐦</span>
          <span className="floating-pet">🐻</span>
          <span className="floating-pet">🐵</span>
        </div>
        <div className="home-hero-content">
          <h1>
            Find trusted pet sitters
            <span className="highlight">near you</span>
          </h1>
          <p>Connect with verified pet sitters who will treat your furry friends like family. Book with confidence.</p>
          <div className="home-actions">
            <Link to="/search" className="btn btn-primary">Find a sitter</Link>
            <Link to="/profile/manage" className="btn btn-secondary">Become a sitter</Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="home-features">
        <h2>Why choose Octopets?</h2>
        <p className="home-features-subtitle">We make pet care easy, safe, and reliable</p>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">✓</span>
            <h3>Verified Sitters</h3>
            <p>All sitters are background-checked and verified</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">💬</span>
            <h3>Direct Messaging</h3>
            <p>Chat with sitters before booking</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">⭐</span>
            <h3>Reviews & Ratings</h3>
            <p>Read reviews from other pet owners</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🔒</span>
            <h3>Secure Booking</h3>
            <p>Safe and easy payment processing</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📱</span>
            <h3>24/7 Support</h3>
            <p>Get help whenever you need it</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🎯</span>
            <h3>Perfect Match</h3>
            <p>Find sitters specialized for your pet</p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="home-how-it-works">
        <h2>How it works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Search</h3>
            <p>Enter your location and dates to find available pet sitters near you</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Connect</h3>
            <p>Review profiles, read reviews, and message sitters to find the perfect match</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Book</h3>
            <p>Request a booking and receive confirmation from your chosen sitter</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <h3>Relax</h3>
            <p>Your pet is in good hands! Track updates and enjoy peace of mind</p>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="home-services">
        <h2>Services we offer</h2>
        <p className="home-services-subtitle">All the pet care services you need in one place</p>
        <div className="services-grid">
          <div className="service-card">
            <span className="service-icon">🏠</span>
            <h3>Overnight Stay</h3>
            <p>Your pet stays at the sitter's home</p>
          </div>
          <div className="service-card">
            <span className="service-icon">🚶</span>
            <h3>Dog Walking</h3>
            <p>Daily walks for your energetic pup</p>
          </div>
          <div className="service-card">
            <span className="service-icon">🏡</span>
            <h3>Home Visits</h3>
            <p>Check-ins at your home</p>
          </div>
          <div className="service-card">
            <span className="service-icon">💊</span>
            <h3>Medication</h3>
            <p>Administer medication as needed</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="home-cta">
        <h2>Ready to find the perfect pet sitter?</h2>
        <p>Join thousands of happy pet owners who trust Octopets</p>
        <Link to="/search" className="btn btn-primary btn-large">Get started now</Link>
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Octopets</h3>
            <p>Connecting pet owners with trusted pet sitters since 2024</p>
          </div>
          <div className="footer-section">
            <h4>For Pet Owners</h4>
            <ul>
              <li><Link to="/search">Find a Sitter</Link></li>
              <li><Link to="/bookings">My Bookings</Link></li>
              <li><Link to="/messages">Messages</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>For Pet Sitters</h4>
            <ul>
              <li><Link to="/profile/manage">Become a Sitter</Link></li>
              <li><Link to="/sitter/bookings">My Jobs</Link></li>
              <li><Link to="/profile">My Profile</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#safety">Safety</a></li>
              <li><a href="#help">Help Center</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Octopets. All rights reserved.</p>
          <div className="footer-social">
            <a href="#facebook" aria-label="Facebook">📘</a>
            <a href="#twitter" aria-label="Twitter">🐦</a>
            <a href="#instagram" aria-label="Instagram">📷</a>
          </div>
        </div>
      </footer>

      {/* Floating AI Assistant Button */}
      <button 
        className={`floating-ai-btn ${showChat ? 'active' : ''}`}
        onClick={() => setShowChat(!showChat)}
        aria-label="AI Assistant"
      >
        <span className="ai-bot-icon">🤖</span>
        {!showChat && <span className="ai-help-text">Need help finding the perfect sitter?</span>}
      </button>

      {/* AI Chat Modal */}
      {showChat && (
        <div className="ai-chat-modal">
          <div className="ai-chat-modal-content">
            <div className="ai-chat-header">
              <div className="ai-chat-header-info">
                <div className="ai-avatar">🤖</div>
                <div>
                  <h3>Your Pet Care Assistant</h3>
                  <p>Ask me anything about pet care and finding sitters!</p>
                </div>
              </div>
              <button 
                className="ai-chat-close"
                onClick={() => setShowChat(false)}
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
            <div className="ai-chat-body">
              <ChatInterface />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ProfilePage Placeholder
 * Profile management will be implemented in Phase 4 (T061-T107)
 */
function ProfilePage() {
  return (
    <div className="profile-page">
      <h1>My Profile</h1>
      <p>This is your public profile view.</p>
      <div className="profile-actions">
        <Link to="/profile/manage" className="btn btn-primary">Manage Profile</Link>
        <Link to="/" className="btn btn-secondary">Back to Home</Link>
      </div>
    </div>
  );
}

/**
 * NotFoundPage Component
 * 404 error page with navigation
 */
function NotFoundPage() {
  return (
    <div className="not-found-page">
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary">Return to Home</Link>
    </div>
  );
}

export default App;
