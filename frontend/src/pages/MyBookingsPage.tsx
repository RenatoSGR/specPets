import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOwnerBookings, updateBookingStatus, BookingStatus, type Booking } from '../data/bookingService';
import './MyBookingsPage.css';

const DEMO_OWNER_ID: number = 1;

/**
 * MyBookingsPage Component
 * List of all bookings for the current pet owner
 */
export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For demo purposes, use placeholder owner ID
  // In real app, this would come from authentication context

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getOwnerBookings(DEMO_OWNER_ID);
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    // eslint-disable-next-line no-restricted-globals
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await updateBookingStatus(Number(bookingId), { status: BookingStatus.Cancelled });
      // Reload bookings to show updated status
      await loadBookings();
    } catch (err) {
      alert(`Failed to cancel booking: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="my-bookings-loading">
        <p>Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-bookings-error">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      <div className="my-bookings-header">
        <h1>My Bookings</h1>
        <Link to="/search" className="btn btn-primary">
          Find a Sitter
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="my-bookings-empty">
          <h2>No bookings yet</h2>
          <p>Start by searching for a pet sitter in your area.</p>
          <Link to="/search" className="btn btn-primary">
            Search Pet Sitters
          </Link>
        </div>
      ) : (
        <div className="my-bookings-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-card-header">
                <div className="booking-card-title">
                  <h3>{booking.sitterName}</h3>
                  <span className={`booking-status status-${booking.status.toLowerCase()}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="booking-card-id">#{booking.id}</div>
              </div>

              <div className="booking-card-content">
                <div className="booking-card-detail">
                  <span className="detail-label">Service:</span>
                  <span className="detail-value">{booking.serviceName}</span>
                </div>

                <div className="booking-card-detail">
                  <span className="detail-label">Dates:</span>
                  <span className="detail-value">
                    {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                  </span>
                </div>

                <div className="booking-card-detail">
                  <span className="detail-label">Total Cost:</span>
                  <span className="detail-value">${booking.totalCost.toFixed(2)}</span>
                </div>

                {booking.statusReason && (
                  <div className="booking-card-detail">
                    <span className="detail-label">Status Reason:</span>
                    <p className="detail-value">{booking.statusReason}</p>
                  </div>
                )}
              </div>

              <div className="booking-card-actions">
                <Link to={`/bookings/${booking.id}`} className="btn btn-secondary">
                  View Details
                </Link>
                
                {booking.status === 'Pending' && (
                  <button
                    onClick={() => handleCancelBooking(String(booking.id))}
                    className="btn btn-danger"
                  >
                    Cancel Request
                  </button>
                )}

                {booking.status === 'Accepted' && (
                  <Link to={`/messages?sitterId=${booking.petSitterId}`} className="btn btn-primary">
                    Message Sitter
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
