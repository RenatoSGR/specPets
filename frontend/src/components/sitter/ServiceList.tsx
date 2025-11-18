import React from 'react';
import type { Service } from '../../data/sitterService';

interface ServiceListProps {
  services: Service[];
}

/**
 * ServiceList Component
 * Display list of services offered by pet sitter
 */
export default function ServiceList({ services }: ServiceListProps) {
  if (services.length === 0) {
    return (
      <div className="service-list-empty">
        <p>No services listed</p>
      </div>
    );
  }

  return (
    <div className="service-list">
      {services.map((service) => (
        <div key={service.id} className="service-card">
          <div className="service-card-header">
            <h3>{service.name}</h3>
            <div className="service-card-price">
              ${service.price.toFixed(2)}
            </div>
          </div>
          
          <p className="service-card-description">{service.description}</p>
          
          <div className="service-card-details">
            {/* Duration and maxPets fields not yet in backend model
            <div className="service-detail">
              <span className="detail-label">Duration:</span>
              <span className="detail-value">{service.durationMinutes} minutes</span>
            </div>

            {service.maxPets && (
              <div className="service-detail">
                <span className="detail-label">Max Pets:</span>
                <span className="detail-value">{service.maxPets}</span>
              </div>
            )}
            */}
          </div>
        </div>
      ))}
    </div>
  );
}
