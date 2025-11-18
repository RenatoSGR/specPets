import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Booking } from '../data/bookingService';
import '../styles/BookingRequestCard.css';

interface BookingRequestCardProps {
  booking: Booking;
  onAccept: (bookingId: number) => Promise<void>;
  onDecline: (bookingId: number, reason: string) => Promise<void>;
}

/**
 * BookingRequestCard Component (T120)
 * Displays a pending booking request with accept/decline actions for sitters
 * Shows owner info, pet details, dates, and pricing
 */
export const BookingRequestCard: React.FC<BookingRequestCardProps> = ({
  booking,
  onAccept,
  onDecline
}) => {
  const navigate = useNavigate();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [showDeclineReason, setShowDeclineReason] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    setError(null);
    setIsAccepting(true);
    try {
      await onAccept(booking.id);
      // T122: Show success notification (parent handles this via callback)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept booking');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDeclineClick = () => {
    setShowDeclineReason(true);
  };

  const handleDeclineSubmit = async () => {
    if (!declineReason.trim()) {
      setError('Please provide a reason for declining');
      return;
    }

    setError(null);
    setIsDeclining(true);
    try {
      await onDecline(booking.id, declineReason);
      // T122: Show success notification (parent handles this)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decline booking');
    } finally {
      setIsDeclining(false);
    }
  };

  const handleCancelDecline = () => {
    setShowDeclineReason(false);
    setDeclineReason('');
    setError(null);
  };

  const handleViewDetails = () => {
    navigate(`/bookings/${booking.id}`);
  };

  // Calculate duration in days
  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <div className="booking-request-card">
      {/* Header: Owner info */}
      <div className="booking-request-header">
        <div className="owner-info">
          <div className="owner-avatar">
            <span>{booking.owner?.firstName?.[0] || 'O'}</span>
          </div>
          <div className="owner-details">
            <h3>{booking.owner?.firstName} {booking.owner?.lastName}</h3>
            <p className="booking-date-submitted">
              Requested {new Date(booking.createdAt || booking.startDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="booking-price">
          <span className="price-amount">${booking.totalPrice.toFixed(2)}</span>
          <span className="price-label">Total</span>
        </div>
      </div>

      {/* Pet details */}
      <div className="booking-pet-info">
        <h4>Pet Information</h4>
        <div className="pet-details">
          <span className="pet-name">{booking.petName || 'Pet'}</span>
          <span className="pet-type">{booking.petType || 'Unknown type'}</span>
          {booking.specialRequirements && (
            <p className="special-requirements">
              <strong>Special Requirements:</strong> {booking.specialRequirements}
            </p>
          )}
        </div>
      </div>

      {/* Booking dates */}
      <div className="booking-dates">
        <div className="date-item">
          <span className="date-label">Start Date</span>
          <span className="date-value">{startDate.toLocaleDateString()}</span>
        </div>
        <div className="date-separator">→</div>
        <div className="date-item">
          <span className="date-label">End Date</span>
          <span className="date-value">{endDate.toLocaleDateString()}</span>
        </div>
        <div className="duration">
          <span className="duration-value">{durationDays} day{durationDays !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="booking-error">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
        </div>
      )}

      {/* Actions (T121) */}
      {!showDeclineReason ? (
        <div className="booking-actions">
          <button
            onClick={handleViewDetails}
            className="btn-view-details"
            disabled={isAccepting || isDeclining}
          >
            View Full Details
          </button>
          <div className="action-buttons">
            <button
              onClick={handleDeclineClick}
              className="btn-decline"
              disabled={isAccepting || isDeclining}
            >
              {isDeclining ? 'Declining...' : 'Decline'}
            </button>
            <button
              onClick={handleAccept}
              className="btn-accept"
              disabled={isAccepting || isDeclining}
            >
              {isAccepting ? 'Accepting...' : 'Accept Booking'}
            </button>
          </div>
        </div>
      ) : (
        <div className="decline-reason-section">
          <label htmlFor={`decline-reason-${booking.id}`}>
            Reason for declining (required):
          </label>
          <textarea
            id={`decline-reason-${booking.id}`}
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="Please explain why you cannot accept this booking..."
            rows={3}
            maxLength={500}
            disabled={isDeclining}
          />
          <div className="decline-actions">
            <button
              onClick={handleCancelDecline}
              className="btn-cancel"
              disabled={isDeclining}
            >
              Cancel
            </button>
            <button
              onClick={handleDeclineSubmit}
              className="btn-decline-submit"
              disabled={isDeclining || !declineReason.trim()}
            >
              {isDeclining ? 'Submitting...' : 'Submit Decline'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
