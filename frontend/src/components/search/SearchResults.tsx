import React from 'react';
import { Link } from 'react-router-dom';
import type { PetSitter } from '../../data/sitterService';
import SitterCard from '../sitter/SitterCard';
import './SearchResults.css';

interface SearchResultsProps {
  sitters: PetSitter[];
}

/**
 * SearchResults Component
 * Displays grid of search results with sitter cards
 */
export default function SearchResults({ sitters }: SearchResultsProps) {
  if (sitters.length === 0) {
    return (
      <div className="search-results-empty">
        <h2>No pet sitters found</h2>
        <p>Try adjusting your search criteria or expanding your search radius.</p>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="search-results-header">
        <h2>Found {sitters.length} Pet Sitter{sitters.length !== 1 ? 's' : ''}</h2>
      </div>

      <div className="search-results-grid">
        {sitters.map((sitter) => (
          <Link
            key={sitter.id}
            to={`/sitters/${sitter.id}`}
            className="search-result-link"
          >
            <SitterCard sitter={sitter} />
          </Link>
        ))}
      </div>
    </div>
  );
}
