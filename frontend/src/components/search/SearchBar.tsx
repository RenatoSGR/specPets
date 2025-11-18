import React, { useState } from 'react';
import type { SearchParams } from '../../data/sitterService';

interface SearchBarProps {
  onSearch: (params: SearchParams) => void;
}

/**
 * SearchBar Component
 * Form for entering location, dates, and pet type search criteria
 */
export default function SearchBar({ onSearch }: SearchBarProps) {
  const [zipCode, setZipCode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [petType, setPetType] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params: SearchParams = {};

    if (zipCode.trim()) {
      params.zipCode = zipCode.trim();
    }
    if (startDate) {
      params.startDate = startDate;
    }
    if (endDate) {
      params.endDate = endDate;
    }
    if (petType) {
      params.petType = petType;
    }

    onSearch(params);
  };

  const handleReset = () => {
    setZipCode('');
    setStartDate('');
    setEndDate('');
    setPetType('');
  };

  // Get today's date in YYYY-MM-DD format for min date validation
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSubmit} className="search-bar-form">
        <div className="search-inputs-grid">
          <div className="search-input-group">
            <label htmlFor="zipCode" className="search-label">
              <span className="search-icon">📍</span>
              Location
            </label>
            <input
              type="text"
              id="zipCode"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="Enter zip code"
              pattern="[0-9]{5}"
              required
              maxLength={5}
              className="search-input"
            />
          </div>

          <div className="search-input-group">
            <label htmlFor="startDate" className="search-label">
              <span className="search-icon">📅</span>
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={today}
              className="search-input"
            />
          </div>

          <div className="search-input-group">
            <label htmlFor="endDate" className="search-label">
              <span className="search-icon">📅</span>
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || today}
              className="search-input"
            />
          </div>

          <div className="search-input-group">
            <label htmlFor="petType" className="search-label">
              <span className="search-icon">🐾</span>
              Pet Type
            </label>
            <select
              id="petType"
              value={petType}
              onChange={(e) => setPetType(e.target.value)}
              className="search-input search-select"
            >
              <option value="">All Types</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
              <option value="Rabbit">Rabbit</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="search-actions-group">
            <button type="submit" className="search-btn search-btn-primary">
              Search
            </button>
            {(zipCode || startDate || endDate || petType) && (
              <button type="button" className="search-btn-reset" onClick={handleReset} title="Clear all fields">
                ✕
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
