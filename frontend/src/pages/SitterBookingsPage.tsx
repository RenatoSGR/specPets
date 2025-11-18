import React, { useState, useEffect } from 'react';
import { BookingRequestCard } from '../components/BookingRequestCard';
import {
  Booking,
  getPendingBookings,
  acceptBooking,
  declineBooking
} from '../data/bookingService';
import '../styles/SitterBookingsPage.css';

/**
 * SitterBookingsPage Component (T123)
 * Displays pending booking requests for sitters
 * Handles accept/decline actions with notifications
 */
export const SitterBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // TODO: Replace with actual authenticated sitter ID
  const currentSitterId = 2; // Hardcoded for now

  useEffect(() => {
    loadPendingBookings();
  }, []);

  const loadPendingBookings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const pendingBookings = await getPendingBookings(currentSitterId);
      setBookings(pendingBookings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load booking requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (bookingId: number) => {
    try {
      const updatedBooking = await acceptBooking(bookingId);
      
      // Remove from pending list
      setBookings(prev => prev.filter(b => b.id !== bookingId));
      
      // T122: Show success notification
      showNotification(
        'success',
        `Booking accepted! You can now message ${updatedBooking.owner?.firstName || 'the owner'}.`
      );
    } catch (err) {
      showNotification(
        'error',
        err instanceof Error ? err.message : 'Failed to accept booking'
      );
      throw err; // Re-throw so card can handle it too
    }
  };

  const handleDecline = async (bookingId: number, reason: string) => {
    try {
      await declineBooking(bookingId, reason);
      
      // Remove from pending list
      setBookings(prev => prev.filter(b => b.id !== bookingId));
      
      // T122: Show success notification
      showNotification(
        'success',
        'Booking declined. The owner has been notified.'
      );
    } catch (err) {
      showNotification(
        'error',
        err instanceof Error ? err.message : 'Failed to decline booking'
      );
      throw err;
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  if (isLoading) {
    return (
      <div className="sitter-bookings-page">
        <div className="page-header">
          <h1>Booking Requests</h1>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading booking requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sitter-bookings-page">
        <div className="page-header">
          <h1>Booking Requests</h1>
        </div>
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <h2>Unable to Load Requests</h2>
          <p>{error}</p>
          <button onClick={loadPendingBookings} className="btn-retry">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sitter-bookings-page">
      {/* Notification Banner (T122) */}
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          <div className="notification-content">
            <span className="notification-icon">
              {notification.type === 'success' ? '✓' : '⚠️'}
            </span>
            <span className="notification-message">{notification.message}</span>
          </div>
          <button
            onClick={dismissNotification}
            className="notification-dismiss"
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}

      <div className="page-header">
        <h1>Booking Requests</h1>
        <p className="page-subtitle">
          {bookings.length === 0
            ? 'You have no pending requests'
            : `${bookings.length} pending request${bookings.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h2>No Pending Requests</h2>
          <p>When pet owners request your services, they'll appear here.</p>
          <p className="empty-tip">
            Make sure your availability is up to date to receive more booking requests!
          </p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <BookingRequestCard
              key={booking.id}
              booking={booking}
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          ))}
        </div>
      )}
    </div>
  );
};
