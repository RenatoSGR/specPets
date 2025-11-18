import React, { useState } from 'react';
import RatingStars from './RatingStars';
import reviewService, { CreateReviewRequest } from '../../data/reviewService';
import './ReviewForm.css';

interface ReviewFormProps {
  bookingId: number;
  sitterName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  bookingId,
  sitterName,
  onSuccess,
  onCancel
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const maxCommentLength = 1000;
  const remainingChars = maxCommentLength - comment.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.trim().length === 0) {
      setError('Please write a review comment');
      return;
    }

    if (comment.length > maxCommentLength) {
      setError(`Review comment cannot exceed ${maxCommentLength} characters`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const request: CreateReviewRequest = {
        bookingId,
        rating,
        comment: comment.trim()
      };

      await reviewService.createReview(request);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-form-container">
      <h2 className="form-title">Leave a Review for {sitterName}</h2>
      <p className="form-subtitle">Share your experience to help other pet owners</p>

      <form onSubmit={handleSubmit} className="review-form">
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Your Rating *</label>
          <RatingStars
            rating={rating}
            onRatingChange={setRating}
            size="large"
          />
          {rating === 0 && (
            <p className="form-hint">Click to select a rating</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="comment" className="form-label">
            Your Review *
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about your experience with this pet sitter. What did you like? Would you recommend them to others?"
            className="form-textarea"
            rows={6}
            maxLength={maxCommentLength}
            required
          />
          <div className="char-counter">
            <span className={remainingChars < 50 ? 'warning' : ''}>
              {remainingChars} characters remaining
            </span>
          </div>
        </div>

        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting || rating === 0 || comment.trim().length === 0}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
