import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Booking, BookingStatus, getBookingById, acceptBooking, declineBooking, cancelBooking } from '../data/bookingService';
import '../styles/BookingDetailsPage.css';

/**
 * BookingDetailsPage Component (T131-T135)
 * Full booking details view with all information and actions
 * Accessible to both owners and sitters with role-appropriate actions
 */
export const BookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  // TODO: Replace with actual authenticated user context
  const currentUserId = 1; // Hardcoded for now
  // Determine user role - for demo, allow switching between owner and sitter views
  const userRole: 'owner' | 'sitter' = (window.location.search.includes('role=sitter') ? 'sitter' : 'owner');

  useEffect(() => {
    if (id) {
      loadBookingDetails(parseInt(id));
    }
  }, [id]);

  const loadBookingDetails = async (bookingId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const bookingData = await getBookingById(bookingId);
      setBooking(bookingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load booking details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!booking) return;
    setIsProcessing(true);
    try {
      const updated = await acceptBooking(booking.id);
      setBooking(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept booking');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineSubmit = async () => {
    if (!booking || !declineReason.trim()) return;
    setIsProcessing(true);
    try {
      const updated = await declineBooking(booking.id, declineReason);
      setBooking(updated);
      setShowDeclineDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decline booking');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubmit = async () => {
    if (!booking) return;
    setIsProcessing(true);
    try {
      const result = await cancelBooking(booking.id, cancelReason.trim() || undefined);
      setBooking(prev => prev ? { ...prev, status: BookingStatus.Cancelled, statusReason: cancelReason } : null);
      setShowCancelDialog(false);
      alert(`Booking cancelled. Refund: $${result.refundAmount.toFixed(2)} (${result.refundPercentage}%)`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="booking-details-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="booking-details-page">
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <h2>Unable to Load Booking</h2>
          <p>{error || 'Booking not found'}</p>
          <button onClick={() => navigate(-1)} className="btn-back">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const hoursUntilStart = Math.ceil((startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60));
  const isWithin24Hours = hoursUntilStart < 24;

  const statusColors: Record<string, string> = {
    Pending: '#FFA500',
    Accepted: '#4CAF50',
    Declined: '#ff4444',
    Cancelled: '#999',
    Completed: '#2196F3'
  };

  return (
    <div className="booking-details-page">
      {/* Header with status */}
      <div className="details-header">
        <button onClick={() => navigate(-1)} className="btn-back-arrow">
          ← Back
        </button>
        <div className="header-content">
          <h1>Booking Details</h1>
          <div className="status-badge" style={{ background: statusColors[booking.status] || '#999' }}>
            {booking.status}
          </div>
        </div>
      </div>

      <div className="details-content">
        {/* Main Info Card (T132) */}
        <div className="info-card">
          <h2>Booking Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Booking ID</span>
              <span className="info-value">#{booking.id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Status</span>
              <span className="info-value">{booking.status}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Start Date</span>
              <span className="info-value">{startDate.toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">End Date</span>
              <span className="info-value">{endDate.toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Duration</span>
              <span className="info-value">{durationDays} day{durationDays !== 1 ? 's' : ''}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Price</span>
              <span className="info-value price">${(booking.totalPrice || booking.totalCost).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Pet Information (T132) */}
        <div className="info-card">
          <h2>Pet Information</h2>
          <div className="pet-info">
            <div className="pet-avatar">{booking.petType?.[0] || '🐾'}</div>
            <div className="pet-details">
              <h3>{booking.petName || 'Pet'}</h3>
              <p className="pet-type">{booking.petType || 'Unknown type'}</p>
              {booking.specialRequirements && (
                <div className="special-requirements">
                  <strong>Special Requirements:</strong>
                  <p>{booking.specialRequirements}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information (T133) */}
        <div className="info-card">
          <h2>{userRole === 'owner' ? 'Sitter Contact' : 'Owner Contact'}</h2>
          <div className="contact-info">
            {userRole === 'owner' ? (
              <>
                <div className="contact-avatar">
                  {booking.sitter?.firstName?.[0] || 'S'}
                </div>
                <div className="contact-details">
                  <h3>{booking.sitter?.firstName} {booking.sitter?.lastName}</h3>
                  <p>{booking.sitter?.email}</p>
                  <p>{booking.sitter?.phoneNumber}</p>
                  <p className="contact-location">{booking.sitter?.location}</p>
                </div>
              </>
            ) : (
              <>
                <div className="contact-avatar">
                  {booking.owner?.firstName?.[0] || 'O'}
                </div>
                <div className="contact-details">
                  <h3>{booking.owner?.firstName} {booking.owner?.lastName}</h3>
                  <p>{booking.owner?.email}</p>
                  <p>{booking.owner?.phoneNumber}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Status Reason if exists */}
        {booking.statusReason && (
          <div className="info-card status-reason-card">
            <h2>{booking.status === BookingStatus.Declined ? 'Reason for Decline' : 'Note'}</h2>
            <p>{booking.statusReason}</p>
          </div>
        )}

        {/* Actions based on role and status (T134) */}
        <div className="details-actions">
          {/* Messaging button for accepted bookings (T135) */}
          {booking.status === BookingStatus.Accepted && (
            <button
              onClick={() => navigate(`/bookings/${booking.id}/messages`)}
              className="btn-primary btn-message"
            >
              💬 Message {userRole === 'owner' ? 'Sitter' : 'Owner'}
            </button>
          )}

          {/* Sitter actions for pending bookings */}
          {userRole === 'sitter' && booking.status === BookingStatus.Pending && (
            <>
              <button
                onClick={handleAccept}
                className="btn-primary btn-accept"
                disabled={isProcessing}
              >
                {isProcessing ? 'Accepting...' : 'Accept Booking'}
              </button>
              <button
                onClick={() => setShowDeclineDialog(true)}
                className="btn-secondary btn-decline"
                disabled={isProcessing}
              >
                Decline Booking
              </button>
            </>
          )}

          {/* Owner cancel button for pending/accepted bookings */}
          {userRole === 'owner' && (booking.status === BookingStatus.Pending || booking.status === BookingStatus.Accepted) && (
            <button
              onClick={() => setShowCancelDialog(true)}
              className="btn-secondary btn-cancel"
              disabled={isProcessing}
            >
              Cancel Booking
            </button>
          )}
        </div>
      </div>

      {/* Decline Dialog */}
      {showDeclineDialog && (
        <div className="dialog-overlay" onClick={() => setShowDeclineDialog(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Decline Booking</h3>
            <label>
              Reason for declining (required):
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Please explain why you cannot accept this booking..."
                rows={4}
                disabled={isProcessing}
              />
            </label>
            <div className="dialog-actions">
              <button
                onClick={() => setShowDeclineDialog(false)}
                className="btn-secondary"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleDeclineSubmit}
                className="btn-primary"
                disabled={isProcessing || !declineReason.trim()}
              >
                {isProcessing ? 'Submitting...' : 'Submit Decline'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="dialog-overlay" onClick={() => setShowCancelDialog(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Cancel Booking</h3>
            <div className={`policy-notice ${isWithin24Hours ? 'policy-warning' : 'policy-ok'}`}>
              {isWithin24Hours ? (
                <p>⚠️ Less than 24 hours until start. No refund will be issued.</p>
              ) : (
                <p>ℹ️ More than 24 hours until start. You will receive a full refund.</p>
              )}
            </div>
            <label>
              Reason for cancellation (optional):
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Let the sitter know why you need to cancel..."
                rows={3}
                disabled={isProcessing}
              />
            </label>
            <div className="dialog-actions">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="btn-secondary"
                disabled={isProcessing}
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelSubmit}
                className="btn-primary btn-danger"
                disabled={isProcessing}
              >
                {isProcessing ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
