import React, { useState, useEffect } from 'react';
import { BookingStatusCard } from '../components/BookingStatusCard';
import { Booking, BookingStatus, getOwnerBookings, cancelBooking } from '../data/bookingService';
import '../styles/OwnerBookingsPage.css';

/**
 * OwnerBookingsPage Component (T127-T130)
 * Displays all bookings for pet owners with filtering by status
 * Handles cancellation with refund calculation display
 */
export const OwnerBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // TODO: Replace with actual authenticated owner ID
  const currentOwnerId = 1; // Hardcoded for now

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    applyFilter(activeFilter);
  }, [bookings, activeFilter]);

  const loadBookings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const ownerBookings = await getOwnerBookings(currentOwnerId);
      setBookings(ownerBookings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = (filter: string) => {
    setActiveFilter(filter);
    
    if (filter === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(b => b.status.toLowerCase() === filter.toLowerCase()));
    }
  };

  const handleCancel = async (bookingId: number, reason?: string) => {
    try {
      const result = await cancelBooking(bookingId, reason);
      
      // Update local state
      setBookings(prev => prev.map(b =>
        b.id === bookingId
          ? { ...b, status: BookingStatus.Cancelled, statusReason: reason, cancelledAt: new Date().toISOString() }
          : b
      ));      // Show success notification with refund info (T127)
      showNotification(
        'success',
        result.message || `Booking cancelled. Refund: $${result.refundAmount.toFixed(2)} (${result.refundPercentage}%)`
      );

      return result;
    } catch (err) {
      showNotification(
        'error',
        err instanceof Error ? err.message : 'Failed to cancel booking'
      );
      throw err;
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  // Count bookings by status
  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'Pending').length,
    accepted: bookings.filter(b => b.status === 'Accepted').length,
    completed: bookings.filter(b => b.status === 'Completed').length,
    cancelled: bookings.filter(b => b.status === 'Cancelled' || b.status === 'Declined').length
  };

  if (isLoading) {
    return (
      <div className="owner-bookings-page">
        <div className="page-header">
          <h1>My Bookings</h1>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="owner-bookings-page">
        <div className="page-header">
          <h1>My Bookings</h1>
        </div>
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <h2>Unable to Load Bookings</h2>
          <p>{error}</p>
          <button onClick={loadBookings} className="btn-retry">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="owner-bookings-page">
      {/* Notification Banner */}
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
        <h1>My Bookings</h1>
        <p className="page-subtitle">
          {bookings.length === 0
            ? 'You have no bookings yet'
            : `${bookings.length} total booking${bookings.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🐾</div>
          <h2>No Bookings Yet</h2>
          <p>Start by searching for pet sitters in your area!</p>
          <button onClick={() => window.location.href = '/listings'} className="btn-find-sitters">
            Find Sitters
          </button>
        </div>
      ) : (
        <>
          {/* Status Filter Tabs */}
          <div className="filter-tabs">
            <button
              className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => applyFilter('all')}
            >
              All <span className="count">{statusCounts.all}</span>
            </button>
            <button
              className={`filter-tab ${activeFilter === 'pending' ? 'active' : ''}`}
              onClick={() => applyFilter('pending')}
            >
              Pending <span className="count">{statusCounts.pending}</span>
            </button>
            <button
              className={`filter-tab ${activeFilter === 'accepted' ? 'active' : ''}`}
              onClick={() => applyFilter('accepted')}
            >
              Confirmed <span className="count">{statusCounts.accepted}</span>
            </button>
            <button
              className={`filter-tab ${activeFilter === 'completed' ? 'active' : ''}`}
              onClick={() => applyFilter('completed')}
            >
              Completed <span className="count">{statusCounts.completed}</span>
            </button>
            <button
              className={`filter-tab ${activeFilter === 'cancelled' ? 'active' : ''}`}
              onClick={() => applyFilter('cancelled')}
            >
              Cancelled <span className="count">{statusCounts.cancelled}</span>
            </button>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="no-results">
              <p>No bookings with status "{activeFilter}"</p>
            </div>
          ) : (
            <div className="bookings-list">
              {filteredBookings.map(booking => (
                <BookingStatusCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
