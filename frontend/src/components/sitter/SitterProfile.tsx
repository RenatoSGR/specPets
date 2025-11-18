import React from 'react';
import type { PetSitter } from '../../data/sitterService';
import RatingStars from '../reviews/RatingStars';

interface SitterProfileProps {
  sitter: PetSitter;
  averageRating?: number;
  totalReviews?: number;
}

/**
 * SitterProfile Component
 * Header section of sitter profile with photo, name, bio, and key info
 */
export default function SitterProfile({ sitter, averageRating = 0, totalReviews = 0 }: SitterProfileProps) {
  const primaryPhoto = sitter.photos && sitter.photos.length > 0
    ? sitter.photos[0]
    : '/images/default-sitter.png';

  const hasReviews = totalReviews > 0;

  return (
    <div className="sitter-profile-header">
      <div className="sitter-profile-photo">
        <img src={primaryPhoto} alt={sitter.name} />
      </div>

      <div className="sitter-profile-info">
        <div className="sitter-profile-title">
          <h1>{sitter.name}</h1>
          {hasReviews && (
            <div className="sitter-profile-rating">
              <RatingStars rating={averageRating} readonly size="medium" />
              <span className="rating-count">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
            </div>
          )}
        </div>

        <div className="sitter-profile-location">
          <span className="location-icon">📍</span>
          {sitter.address}, {sitter.city}, {sitter.state} {sitter.zipCode}
        </div>

        <div className="sitter-profile-rate">
          <span className="rate-label">Hourly Rate:</span>
          <span className="rate-value">${sitter.hourlyRate}/hour</span>
        </div>

        <div className="sitter-profile-bio">
          <h2>About Me</h2>
          <p>{sitter.bio}</p>
        </div>

        <div className="sitter-profile-details">
          <div className="profile-detail">
            <h3>Pet Types</h3>
            <div className="pet-types-list">
              {sitter.petTypesAccepted.map((pet) => (
                <span key={pet} className="pet-badge">{pet}</span>
              ))}
            </div>
          </div>

          {sitter.skills && sitter.skills.length > 0 && (
            <div className="profile-detail">
              <h3>Skills & Expertise</h3>
              <div className="skills-list">
                {sitter.skills.map((skill) => (
                  <span key={skill} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Certifications field not yet in backend model
          {sitter.certifications && sitter.certifications.length > 0 && (
            <div className="profile-detail">
              <h3>Certifications</h3>
              <ul className="certifications-list">
                {sitter.certifications.map((cert: string, index: number) => (
                  <li key={index}>{cert}</li>
                ))}
              </ul>
            </div>
          )}
          */}
        </div>
      </div>
    </div>
  );
}
