import React, { useState, useEffect } from 'react';
import { Review } from '../../data/reviewService';
import RatingStars from './RatingStars';
import './ReviewList.css';

interface ReviewListProps {
  sitterId: number;
  reviews: Review[];
  totalCount: number;
  averageRating: number;
  onLoadMore?: () => void;
  isLoading?: boolean;
}

const ReviewList: React.FC<ReviewListProps> = ({ 
  sitterId, 
  reviews, 
  totalCount, 
  averageRating,
  onLoadMore,
  isLoading = false 
}) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const hasMoreReviews = reviews.length < totalCount;

  if (reviews.length === 0) {
    return (
      <div className="review-list">
        <div className="review-list-header">
          <h3>Reviews</h3>
          <div className="review-list-summary">
            <RatingStars rating={0} readonly size="medium" />
            <span className="review-count">No reviews yet</span>
          </div>
        </div>
        <div className="no-reviews">
          <p>This sitter hasn't received any reviews yet.</p>
          <p>Be the first to book and leave a review!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="review-list">
      <div className="review-list-header">
        <h3>Reviews</h3>
        <div className="review-list-summary">
          <RatingStars rating={averageRating} readonly size="medium" />
          <span className="review-count">
            {averageRating.toFixed(1)} ({totalCount} {totalCount === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      </div>

      <div className="reviews-container">
        {reviews.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-card-header">
              <div className="reviewer-info">
                <div className="reviewer-avatar">
                  {review.ownerName ? review.ownerName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="reviewer-details">
                  <span className="reviewer-name">{review.ownerName || 'Anonymous'}</span>
                  <span className="review-date">{formatDate(review.createdAt)}</span>
                </div>
              </div>
              <div className="review-rating">
                <RatingStars rating={review.rating} readonly size="small" />
              </div>
            </div>
            <div className="review-card-body">
              <p className="review-comment">{review.comment}</p>
            </div>
          </div>
        ))}
      </div>

      {hasMoreReviews && onLoadMore && (
        <div className="load-more-container">
          <button 
            onClick={onLoadMore} 
            disabled={isLoading}
            className="btn-load-more"
          >
            {isLoading ? 'Loading...' : `Load More Reviews (${totalCount - reviews.length} remaining)`}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
