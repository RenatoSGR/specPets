import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SitterProfile from '../components/sitter/SitterProfile';
import ServiceList from '../components/sitter/ServiceList';
import ReviewList from '../components/reviews/ReviewList';
import AvailabilityCalendar from '../components/sitter/AvailabilityCalendar';
import BookingForm from '../components/booking/BookingForm';
import { getSitterById, getSitterServices, type PetSitter, type Service } from '../data/sitterService';
import reviewService from '../data/reviewService';
import type { Review, ReviewStats } from '../data/reviewService';

/**
 * SitterProfilePage Component
 * Full profile view for a pet sitter with services, reviews, and booking
 */
export default function SitterProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [sitter, setSitter] = useState<PetSitter | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [reviewSkip, setReviewSkip] = useState(0);
  const reviewTake = 10;

  useEffect(() => {
    if (!id) return;

    const loadSitterData = async () => {
      setLoading(true);
      setError(null);

      try {
        const sitterId = parseInt(id || '0');
        const [sitterData, servicesData, reviewsResponse, statsData] = await Promise.all([
          getSitterById(sitterId),
          getSitterServices(sitterId),
          reviewService.getSitterReviews(sitterId, 0, reviewTake),
          reviewService.getSitterStats(sitterId)
        ]);
        const availabilityData: any[] = []; // TODO: Implement getSitterAvailability

        setSitter(sitterData);
        setServices(servicesData);
        setReviews(reviewsResponse.reviews);
        setReviewStats(statsData);
        setAvailability(availabilityData);
        setReviewSkip(reviewTake);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sitter profile');
      } finally {
        setLoading(false);
      }
    };

    loadSitterData();
  }, [id]);

  const handleLoadMoreReviews = async () => {
    if (!sitter || loadingMoreReviews) return;

    setLoadingMoreReviews(true);
    try {
      const response = await reviewService.getSitterReviews(sitter.id, reviewSkip, reviewTake);
      setReviews(prev => [...prev, ...response.reviews]);
      setReviewSkip(prev => prev + reviewTake);
    } catch (err) {
      console.error('Failed to load more reviews:', err);
    } finally {
      setLoadingMoreReviews(false);
    }
  };

  if (loading) {
    return (
      <div className="sitter-profile-loading">
        <p>Loading sitter profile...</p>
      </div>
    );
  }

  if (error || !sitter) {
    return (
      <div className="sitter-profile-error">
        <h2>Error Loading Profile</h2>
        <p>{error || 'Sitter not found'}</p>
      </div>
    );
  }

  return (
    <div className="sitter-profile-page">
      <SitterProfile 
        sitter={sitter} 
        averageRating={reviewStats?.averageRating || 0}
        totalReviews={reviewStats?.totalReviews || 0}
      />

      <div className="sitter-profile-content">
        <div className="sitter-profile-main">
          <section className="profile-section">
            <h2>Services Offered</h2>
            <ServiceList services={services} />
          </section>

          <section className="profile-section">
            <ReviewList 
              sitterId={sitter.id}
              reviews={reviews}
              totalCount={reviewStats?.totalReviews || 0}
              averageRating={reviewStats?.averageRating || 0}
              onLoadMore={handleLoadMoreReviews}
              isLoading={loadingMoreReviews}
            />
          </section>
        </div>

        <div className="sitter-profile-sidebar">
          <section className="profile-section">
            <h2>Availability</h2>
            <AvailabilityCalendar availability={availability} />
          </section>

          <section className="profile-section">
            {!showBookingForm ? (
              <button 
                className="btn btn-primary btn-large"
                onClick={() => setShowBookingForm(true)}
              >
                Book This Sitter
              </button>
            ) : (
              <BookingForm 
                sitterId={sitter.id}
                services={services}
                onCancel={() => setShowBookingForm(false)}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
