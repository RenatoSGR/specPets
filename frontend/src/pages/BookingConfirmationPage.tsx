import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { getBookingById, type Booking } from '../data/bookingService';

/**
 * BookingConfirmationPage Component
 * Displays booking confirmation details after submission
 */
export default function BookingConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [booking, setBooking] = useState<Booking | null>(location.state?.booking || null);
  const [loading, setLoading] = useState(!location.state?.booking);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!booking && id) {
      const loadBooking = async () => {
        try {
          const data = await getBookingById(parseInt(id || '0'));
          setBooking(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load booking');
        } finally {
          setLoading(false);
        }
      };

      loadBooking();
    }
  }, [id, booking]);

  if (loading) {
    return (
      <div className="booking-confirmation-loading">
        <p>Loading booking details...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="booking-confirmation-error">
        <h2>Error</h2>
        <p>{error || 'Booking not found'}</p>
        <Link to="/bookings" className="btn btn-primary">
          View My Bookings
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="booking-confirmation-page">
      <div className="confirmation-success">
        <h1>Booking Request Submitted!</h1>
        <p className="confirmation-message">
          Your booking request has been sent to the pet sitter. 
          You'll receive a notification when they respond.
        </p>
      </div>

      <div className="booking-details-card">
        <h2>Booking Details</h2>
        
        <div className="booking-detail-row">
          <span className="detail-label">Booking ID:</span>
          <span className="detail-value">#{booking.id}</span>
        </div>

        <div className="booking-detail-row">
          <span className="detail-label">Status:</span>
          <span className={`booking-status status-${booking.status.toLowerCase()}`}>
            {booking.status}
          </span>
        </div>

        <div className="booking-detail-row">
          <span className="detail-label">Pet Sitter:</span>
          <span className="detail-value">{booking.sitterName}</span>
        </div>

        <div className="booking-detail-row">
          <span className="detail-label">Service:</span>
          <span className="detail-value">{booking.serviceName}</span>
        </div>

        <div className="booking-detail-row">
          <span className="detail-label">Dates:</span>
          <span className="detail-value">
            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
          </span>
        </div>

        <div className="booking-detail-row">
          <span className="detail-label">Total Cost:</span>
          <span className="detail-value">${booking.totalCost.toFixed(2)}</span>
        </div>

        {/* Special instructions field not yet in backend model
        {booking.specialInstructions && (
          <div className="booking-detail-row">
            <span className="detail-label">Special Instructions:</span>
            <p className="detail-value">{booking.specialInstructions}</p>
          </div>
        )}
        */}
      </div>

      <div className="confirmation-actions">
        <Link to="/bookings" className="btn btn-primary">
          View All My Bookings
        </Link>
        <Link to="/search" className="btn btn-secondary">
          Search More Sitters
        </Link>
      </div>
    </div>
  );
}
