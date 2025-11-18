import React, { useState } from 'react';
import './SearchFilters.css';

export interface FilterOptions {
  petTypes: string[];
  serviceTypes: string[];
  minRating: number;
  maxPrice: number;
  skills: string[];
}

interface SearchFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
}

const AVAILABLE_PET_TYPES = ['dog', 'cat', 'bird', 'reptile', 'rabbit', 'other'];
const AVAILABLE_SERVICE_TYPES = ['overnight', 'daily visit', 'walking', 'medication', 'grooming'];
const AVAILABLE_SKILLS = ['first aid', 'medication administration', 'grooming', 'training', 'senior pet care', 'special needs'];

const SearchFilters: React.FC<SearchFiltersProps> = ({ onFilterChange, onClearFilters }) => {
  const [petTypes, setPetTypes] = useState<string[]>([]);
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(100);
  const [skills, setSkills] = useState<string[]>([]);

  const handlePetTypeToggle = (petType: string) => {
    const updated = petTypes.includes(petType)
      ? petTypes.filter(pt => pt !== petType)
      : [...petTypes, petType];
    setPetTypes(updated);
    notifyFilterChange({ petTypes: updated, serviceTypes, minRating, maxPrice, skills });
  };

  const handleServiceTypeToggle = (serviceType: string) => {
    const updated = serviceTypes.includes(serviceType)
      ? serviceTypes.filter(st => st !== serviceType)
      : [...serviceTypes, serviceType];
    setServiceTypes(updated);
    notifyFilterChange({ petTypes, serviceTypes: updated, minRating, maxPrice, skills });
  };

  const handleSkillToggle = (skill: string) => {
    const updated = skills.includes(skill)
      ? skills.filter(s => s !== skill)
      : [...skills, skill];
    setSkills(updated);
    notifyFilterChange({ petTypes, serviceTypes, minRating, maxPrice, skills: updated });
  };

  const handleMinRatingChange = (rating: number) => {
    setMinRating(rating);
    notifyFilterChange({ petTypes, serviceTypes, minRating: rating, maxPrice, skills });
  };

  const handleMaxPriceChange = (price: number) => {
    setMaxPrice(price);
    notifyFilterChange({ petTypes, serviceTypes, minRating, maxPrice: price, skills });
  };

  const notifyFilterChange = (filters: FilterOptions) => {
    onFilterChange(filters);
  };

  const handleClearAll = () => {
    setPetTypes([]);
    setServiceTypes([]);
    setMinRating(0);
    setMaxPrice(100);
    setSkills([]);
    onClearFilters();
  };

  const activeFilterCount = petTypes.length + serviceTypes.length + skills.length + 
    (minRating > 0 ? 1 : 0) + (maxPrice < 100 ? 1 : 0);

  return (
    <div className="search-filters">
      <div className="filters-header">
        <h3>Filters</h3>
        {activeFilterCount > 0 && (
          <button className="clear-filters-btn" onClick={handleClearAll}>
            Clear All ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Pet Type Filter */}
      <div className="filter-section">
        <h4>Pet Type</h4>
        <div className="filter-checkboxes">
          {AVAILABLE_PET_TYPES.map(petType => (
            <label key={petType} className="filter-checkbox">
              <input
                type="checkbox"
                checked={petTypes.includes(petType)}
                onChange={() => handlePetTypeToggle(petType)}
              />
              <span className="capitalize">{petType}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Service Type Filter */}
      <div className="filter-section">
        <h4>Services</h4>
        <div className="filter-checkboxes">
          {AVAILABLE_SERVICE_TYPES.map(serviceType => (
            <label key={serviceType} className="filter-checkbox">
              <input
                type="checkbox"
                checked={serviceTypes.includes(serviceType)}
                onChange={() => handleServiceTypeToggle(serviceType)}
              />
              <span className="capitalize">{serviceType}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Minimum Rating Filter */}
      <div className="filter-section">
        <h4>Minimum Rating</h4>
        <div className="rating-filter">
          {[0, 1, 2, 3, 4, 5].map(rating => (
            <button
              key={rating}
              className={`rating-btn ${minRating === rating ? 'active' : ''}`}
              onClick={() => handleMinRatingChange(rating)}
            >
              {rating === 0 ? 'Any' : `${rating}+ ⭐`}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="filter-section">
        <h4>Max Price (per hour)</h4>
        <div className="price-filter">
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={maxPrice}
            onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
            className="price-slider"
          />
          <div className="price-display">
            ${maxPrice === 100 ? '100+' : maxPrice}
          </div>
        </div>
      </div>

      {/* Skills Filter */}
      <div className="filter-section">
        <h4>Special Skills</h4>
        <div className="filter-checkboxes">
          {AVAILABLE_SKILLS.map(skill => (
            <label key={skill} className="filter-checkbox">
              <input
                type="checkbox"
                checked={skills.includes(skill)}
                onChange={() => handleSkillToggle(skill)}
              />
              <span className="capitalize">{skill}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
