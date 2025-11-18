import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReviewForm from '../components/reviews/ReviewForm';
import { getBookingById, Booking } from '../data/bookingService';
import reviewService from '../data/reviewService';
import './ReviewsPage.css';

const ReviewsPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [hasReview, setHasReview] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingAndReview = async () => {
      if (!bookingId) return;

      try {
        const id = parseInt(bookingId, 10);
        
        // Fetch booking details
        const bookingData = await getBookingById(id);
        setBooking(bookingData);

        // Check if review already exists
        const existingReview = await reviewService.getBookingReview(id);
        setHasReview(existingReview !== null);
      } catch (err: any) {
        setError(err.message || 'Failed to load booking information');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingAndReview();
  }, [bookingId]);

  const handleReviewSuccess = () => {
    navigate('/owner/bookings', {
      state: { message: 'Review submitted successfully! Thank you for your feedback.' }
    });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="reviews-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading booking information...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="reviews-page">
        <div className="error-container">
          <h2>Error Loading Booking</h2>
          <p>{error || 'Booking not found'}</p>
          <button onClick={() => navigate('/owner/bookings')} className="btn-primary">
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  if (booking.status !== 'Completed') {
    return (
      <div className="reviews-page">
        <div className="info-container">
          <h2>Reviews Not Available</h2>
          <p>You can only leave a review for completed bookings.</p>
          <p>Current booking status: <strong>{booking.status}</strong></p>
          <button onClick={() => navigate('/owner/bookings')} className="btn-primary">
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  if (hasReview) {
    return (
      <div className="reviews-page">
        <div className="info-container">
          <h2>Review Already Submitted</h2>
          <p>You have already submitted a review for this booking.</p>
          <button onClick={() => navigate('/owner/bookings')} className="btn-primary">
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  const sitterName = booking.sitter?.firstName && booking.sitter?.lastName 
    ? `${booking.sitter.firstName} ${booking.sitter.lastName}`
    : 'this sitter';

  return (
    <div className="reviews-page">
      <div className="booking-summary">
        <h3>Booking Details</h3>
        <p><strong>Sitter:</strong> {sitterName}</p>
        <p><strong>Dates:</strong> {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p>
        <p><strong>Pet:</strong> {booking.petName || 'Your pet'}</p>
      </div>

      <ReviewForm
        bookingId={booking.id}
        sitterName={sitterName}
        onSuccess={handleReviewSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default ReviewsPage;
