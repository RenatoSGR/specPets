// Review service for API calls
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

export interface Review {
  id: string;
  bookingId: number;
  ownerId: number;
  sitterId: number;
  rating: number;
  comment: string;
  createdAt: string;
  ownerName?: string;
  sitterName?: string;
}

export interface ReviewStats {
  sitterId: number;
  averageRating: number;
  totalReviews: number;
}

export interface ReviewsResponse {
  sitterId: number;
  averageRating: number;
  totalCount: number;
  skip: number;
  take: number;
  reviews: Review[];
}

export interface CreateReviewRequest {
  bookingId: number;
  rating: number;
  comment: string;
}

const reviewService = {
  // Submit a new review
  createReview: async (request: CreateReviewRequest): Promise<Review> => {
    const response = await fetch(`${API_BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit review');
    }

    return await response.json();
  },

  // Get reviews for a specific sitter
  getSitterReviews: async (
    sitterId: number,
    skip: number = 0,
    take: number = 10
  ): Promise<ReviewsResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/api/reviews/sitter/${sitterId}?skip=${skip}&take=${take}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }

    return await response.json();
  },

  // Get review statistics for a sitter
  getSitterStats: async (sitterId: number): Promise<ReviewStats> => {
    const response = await fetch(
      `${API_BASE_URL}/api/reviews/sitter/${sitterId}/stats`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch rating statistics');
    }

    return await response.json();
  },

  // Get review for a specific booking
  getBookingReview: async (bookingId: number): Promise<Review | null> => {
    const response = await fetch(
      `${API_BASE_URL}/api/reviews/booking/${bookingId}`
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch booking review');
    }

    return await response.json();
  },

  // Get a specific review by ID
  getReviewById: async (id: string): Promise<Review> => {
    const response = await fetch(`${API_BASE_URL}/api/reviews/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch review');
    }

    return await response.json();
  },
};

export default reviewService;
