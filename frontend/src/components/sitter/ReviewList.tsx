import React from 'react';
import type { Review } from '../../data/sitterService';

interface ReviewListProps {
  reviews: Review[];
}

/**
 * ReviewList Component
 * Display list of reviews for pet sitter
 */
export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="review-list-empty">
        <p>No reviews yet</p>
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
    <div className="review-list">
      {reviews.map((review) => (
        <div key={review.id} className="review-card">
          <div className="review-card-header">
            <div className="review-card-author">
              <strong>{review.ownerName}</strong>
            </div>
            <div className="review-card-rating">
              <span className="rating-stars">
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </span>
              <span className="rating-value">{review.rating}/5</span>
            </div>
          </div>
          
          <div className="review-card-date">
            {formatDate(review.createdAt)}
          </div>
          
          <p className="review-card-comment">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}
