import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Booking } from '../data/bookingService';
import '../styles/BookingStatusCard.css';

interface BookingStatusCardProps {
  booking: Booking;
  onCancel?: (bookingId: number, reason?: string) => Promise<{ refundAmount: number; refundPercentage: number; message: string }>;
}

/**
 * BookingStatusCard Component (T126)
 * Displays booking status for pet owners
 * Shows different content based on booking status (pending/accepted/declined/cancelled/completed)
 */
export const BookingStatusCard: React.FC<BookingStatusCardProps> = ({
  booking,
  onCancel
}) => {
  const navigate = useNavigate();
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [refundInfo, setRefundInfo] = useState<{ amount: number; percentage: number; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleViewDetails = () => {
    navigate(`/bookings/${booking.id}`);
  };

  const handleCancelClick = () => {
    setShowCancelDialog(true);
    setError(null);
    setRefundInfo(null);
  };

  const handleCancelConfirm = async () => {
    if (!onCancel) return;

    setError(null);
    setIsCancelling(true);
    try {
      const result = await onCancel(booking.id, cancelReason.trim() || undefined);
      setRefundInfo({
        amount: result.refundAmount,
        percentage: result.refundPercentage,
        message: result.message
      });
      // T127: Parent will handle success notification
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCloseCancelDialog = () => {
    setShowCancelDialog(false);
    setCancelReason('');
    setError(null);
    setRefundInfo(null);
  };

  // Calculate time until booking starts (for cancellation policy display)
  const startDate = new Date(booking.startDate);
  const now = new Date();
  const hoursUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60));
  const isWithin24Hours = hoursUntilStart < 24;

  // Status display configuration
  const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
    Pending: { label: 'Pending Response', color: '#FFA500', icon: '⏳' },
    Accepted: { label: 'Confirmed', color: '#4CAF50', icon: '✓' },
    Declined: { label: 'Declined', color: '#ff4444', icon: '✕' },
    Cancelled: { label: 'Cancelled', color: '#999', icon: '⊘' },
    Completed: { label: 'Completed', color: '#2196F3', icon: '★' }
  };

  const status = statusConfig[booking.status] || statusConfig.Pending;

  return (
    <div className="booking-status-card">
      {/* Status Badge */}
      <div className="booking-status-badge" style={{ background: status.color }}>
        <span className="status-icon">{status.icon}</span>
        <span className="status-label">{status.label}</span>
      </div>

      {/* Sitter Info */}
      <div className="booking-sitter-info">
        <div className="sitter-avatar">
          <span>{booking.sitter?.firstName?.[0] || 'S'}</span>
        </div>
        <div className="sitter-details">
          <h3>{booking.sitter?.firstName} {booking.sitter?.lastName}</h3>
          <p className="sitter-location">{booking.sitter?.location || 'Location not available'}</p>
        </div>
        <div className="booking-price-info">
          <span className="price-amount">${booking.totalPrice.toFixed(2)}</span>
          <span className="price-label">Total</span>
        </div>
      </div>

      {/* Booking Details */}
      <div className="booking-details-summary">
        <div className="detail-row">
          <span className="detail-label">Pet:</span>
          <span className="detail-value">{booking.petName || 'Unknown'} ({booking.petType || 'Unknown type'})</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Dates:</span>
          <span className="detail-value">
            {startDate.toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
          </span>
        </div>
        {booking.statusReason && (
          <div className="detail-row status-reason">
            <span className="detail-label">
              {booking.status === 'Declined' ? 'Reason for decline:' : 'Note:'}
            </span>
            <span className="detail-value">{booking.statusReason}</span>
          </div>
        )}
      </div>

      {/* Actions based on status (T127) */}
      <div className="booking-actions">
        <button onClick={handleViewDetails} className="btn-view-details">
          View Full Details
        </button>

        {/* T128: Show cancel button for pending and accepted bookings */}
        {(booking.status === 'Pending' || booking.status === 'Accepted') && !refundInfo && (
          <button
            onClick={handleCancelClick}
            className="btn-cancel-booking"
            disabled={isCancelling}
          >
            Cancel Booking
          </button>
        )}

        {/* Show messaging button for accepted bookings */}
        {booking.status === 'Accepted' && !refundInfo && (
          <button
            onClick={() => navigate(`/bookings/${booking.id}/messages`)}
            className="btn-message"
          >
            💬 Message Sitter
          </button>
        )}

        {/* T169: Show "Leave Review" button for completed bookings */}
        {booking.status === 'Completed' && (
          <button
            onClick={() => navigate(`/bookings/${booking.id}/review`)}
            className="btn-leave-review"
          >
            ⭐ Leave Review
          </button>
        )}
      </div>

      {/* Cancel Dialog (T128, T129, T130) */}
      {showCancelDialog && (
        <div className="cancel-dialog-overlay" onClick={handleCloseCancelDialog}>
          <div className="cancel-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Cancel Booking</h3>

            {!refundInfo ? (
              <>
                {/* T129: Display cancellation policy */}
                <div className="cancellation-policy">
                  <div className={`policy-notice ${isWithin24Hours ? 'policy-warning' : 'policy-ok'}`}>
                    <span className="policy-icon">
                      {isWithin24Hours ? '⚠️' : 'ℹ️'}
                    </span>
                    <div className="policy-text">
                      {isWithin24Hours ? (
                        <>
                          <strong>Less than 24 hours until booking starts</strong>
                          <p>No refund will be issued for cancellations within 24 hours of the start time.</p>
                        </>
                      ) : (
                        <>
                          <strong>More than 24 hours until booking starts</strong>
                          <p>You will receive a full refund (100%) if you cancel now.</p>
                        </>
                      )}
                      <p className="hours-remaining">
                        Time until start: {hoursUntilStart} hours
                      </p>
                    </div>
                  </div>
                </div>

                <div className="cancel-form">
                  <label htmlFor="cancel-reason">
                    Reason for cancellation (optional):
                  </label>
                  <textarea
                    id="cancel-reason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Let the sitter know why you need to cancel..."
                    rows={3}
                    maxLength={500}
                    disabled={isCancelling}
                  />
                </div>

                {error && (
                  <div className="cancel-error">
                    <span className="error-icon">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <div className="cancel-actions">
                  <button
                    onClick={handleCloseCancelDialog}
                    className="btn-keep-booking"
                    disabled={isCancelling}
                  >
                    Keep Booking
                  </button>
                  <button
                    onClick={handleCancelConfirm}
                    className="btn-confirm-cancel"
                    disabled={isCancelling}
                  >
                    {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                  </button>
                </div>
              </>
            ) : (
              /* T130: Display refund information */
              <div className="refund-confirmation">
                <div className="refund-icon">✓</div>
                <h4>Booking Cancelled</h4>
                <div className="refund-details">
                  <div className="refund-amount">
                    <span className="refund-label">Refund Amount:</span>
                    <span className="refund-value">${refundInfo.amount.toFixed(2)}</span>
                  </div>
                  <div className="refund-percentage">
                    ({refundInfo.percentage}% of total)
                  </div>
                  <p className="refund-message">{refundInfo.message}</p>
                </div>
                <button onClick={handleCloseCancelDialog} className="btn-close-dialog">
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
