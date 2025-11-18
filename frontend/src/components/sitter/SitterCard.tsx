import React from 'react';
import type { PetSitter } from '../../data/sitterService';
import './SitterCard.css';

interface SitterCardProps {
  sitter: PetSitter;
}

/**
 * SitterCard Component
 * Card display for pet sitter in search results
 */
export default function SitterCard({ sitter }: SitterCardProps) {
  const primaryPhoto = sitter.photos && sitter.photos.length > 0 
    ? sitter.photos[0] 
    : '/images/default-sitter.png';

  const averageRating = sitter.reviews && sitter.reviews.length > 0
    ? (sitter.reviews.reduce((sum, r) => sum + r.rating, 0) / sitter.reviews.length).toFixed(1)
    : null;

  // Get pet type icons
  const getPetIcon = (petType: string) => {
    const icons: Record<string, string> = {
      'Dog': '🐕',
      'Cat': '🐈',
      'Bird': '🦜',
      'Rabbit': '🐇',
      'Other': '🐾'
    };
    return icons[petType] || '🐾';
  };

  // Determine venue type based on services
  const getVenueType = () => {
    if (sitter.skills?.includes('Home Boarding')) return 'Homes';
    if (sitter.skills?.includes('Dog Walking')) return 'Parks';
    return 'Pet Sitters';
  };

  return (
    <div className="sitter-card">
      <div className="sitter-card-image">
        <img src={primaryPhoto} alt={sitter.name} />
        
        {/* Category Badge - Top Left */}
        <div className="sitter-card-category">
          <span className="category-icon">🏠</span>
          <span>{getVenueType()}</span>
        </div>

        {/* Rating Badge - Top Right */}
        {averageRating && (
          <div className="sitter-card-rating-badge">
            <span className="rating-star">⭐</span>
            <span className="rating-value">{averageRating}</span>
          </div>
        )}
      </div>

      <div className="sitter-card-content">
        <h3 className="sitter-card-title">{sitter.name}</h3>
        
        <div className="sitter-card-location">
          {sitter.city}, {sitter.state}
        </div>

        {/* Pet Type Icons at Bottom */}
        <div className="sitter-card-pets-icons">
          {sitter.petTypesAccepted.slice(0, 4).map((pet) => (
            <span key={pet} className="pet-icon" title={pet}>
              {getPetIcon(pet)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
