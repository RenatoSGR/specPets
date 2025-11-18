import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SearchBar from '../components/search/SearchBar';
import SearchResults from '../components/search/SearchResults';
import SearchFilters, { FilterOptions } from '../components/search/SearchFilters';
import ChatInterface from '../components/chat/ChatInterface';
import { searchSitters, type PetSitter, type SearchParams } from '../data/sitterService';
import './SearchPage.css';

/**
 * SearchPage Component
 * Main search interface for finding pet sitters by location and dates
 */
export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sitters, setSitters] = useState<PetSitter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({
    petTypes: [],
    serviceTypes: [],
    minRating: 0,
    maxPrice: 100,
    skills: []
  });
  const [baseSearchParams, setBaseSearchParams] = useState<SearchParams>({});

  // Load initial search from URL params (T204 - filter persistence)
  useEffect(() => {
    const zipCode = searchParams.get('zipCode');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const petType = searchParams.get('petType');
    const minRating = searchParams.get('minRating');
    const maxPrice = searchParams.get('maxPrice');
    const serviceTypes = searchParams.get('serviceTypes');
    const skills = searchParams.get('skills');

    const params: SearchParams = {
      zipCode: zipCode || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      petType: petType || undefined
    };

    const filters: FilterOptions = {
      petTypes: petType ? [petType] : [],
      serviceTypes: serviceTypes ? serviceTypes.split(',') : [],
      minRating: minRating ? parseFloat(minRating) : 0,
      maxPrice: maxPrice ? parseFloat(maxPrice) : 100,
      skills: skills ? skills.split(',') : []
    };

    if (zipCode || startDate || endDate) {
      setBaseSearchParams(params);
      setCurrentFilters(filters);
      handleSearch(params, filters);
    }
  }, []);

  const handleSearch = async (params: SearchParams, filters?: FilterOptions) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setBaseSearchParams(params);

    const filtersToUse = filters || currentFilters;

    // Update URL with search params and filters (T204)
    const newSearchParams = new URLSearchParams();
    if (params.zipCode) newSearchParams.set('zipCode', params.zipCode);
    if (params.startDate) newSearchParams.set('startDate', params.startDate);
    if (params.endDate) newSearchParams.set('endDate', params.endDate);
    if (params.petType) newSearchParams.set('petType', params.petType);
    if (filtersToUse.minRating > 0) newSearchParams.set('minRating', filtersToUse.minRating.toString());
    if (filtersToUse.maxPrice < 100) newSearchParams.set('maxPrice', filtersToUse.maxPrice.toString());
    if (filtersToUse.serviceTypes.length > 0) newSearchParams.set('serviceTypes', filtersToUse.serviceTypes.join(','));
    if (filtersToUse.skills.length > 0) newSearchParams.set('skills', filtersToUse.skills.join(','));
    setSearchParams(newSearchParams);

    try {
      // Combine base search params with filters (T200)
      const fullParams: SearchParams = {
        ...params,
        serviceIds: filtersToUse.serviceTypes.join(',') || undefined,
        minRating: filtersToUse.minRating > 0 ? filtersToUse.minRating : undefined,
        maxPrice: filtersToUse.maxPrice < 100 ? filtersToUse.maxPrice : undefined,
        skills: filtersToUse.skills.join(',') || undefined
      };

      const results = await searchSitters(fullParams);
      setSitters(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setSitters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: FilterOptions) => {
    setCurrentFilters(filters);
    if (hasSearched) {
      handleSearch(baseSearchParams, filters);
    }
  };

  const handleClearFilters = () => {
    const emptyFilters: FilterOptions = {
      petTypes: [],
      serviceTypes: [],
      minRating: 0,
      maxPrice: 100,
      skills: []
    };
    setCurrentFilters(emptyFilters);
    if (hasSearched) {
      handleSearch(baseSearchParams, emptyFilters);
    }
  };

  const activeFilterCount = currentFilters.petTypes.length + 
    currentFilters.serviceTypes.length + 
    currentFilters.skills.length +
    (currentFilters.minRating > 0 ? 1 : 0) +
    (currentFilters.maxPrice < 100 ? 1 : 0);

  // Handler for sitter clicks from agent chat
  const handleSitterClick = (sitterId: number) => {
    navigate(`/sitter/${sitterId}`);
  };

  // Handler for booking clicks from agent chat
  const handleBookingClick = (bookingId: number) => {
    navigate(`/bookings/${bookingId}`);
  };

  return (
    <div className="search-page">
      <div className="search-page-header">
        <h1>Find a Pet Sitter</h1>
        <p>Search for trusted pet sitters in your area</p>
      </div>

      <SearchBar onSearch={(params) => handleSearch(params)} />

      <div className="search-content">
        {/* Filters Sidebar */}
        <aside className="search-sidebar">
          <SearchFilters 
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </aside>

        {/* Results Section */}
        <main className="search-main">
          {loading && (
            <div className="search-loading">
              <p>Searching for pet sitters...</p>
            </div>
          )}

          {error && (
            <div className="search-error">
              <p>Error: {error}</p>
            </div>
          )}

          {!loading && !error && hasSearched && (
            <>
              {/* Filter Summary (T201-T202) */}
              {activeFilterCount > 0 && (
                <div className="filter-summary">
                  <span className="filter-badge">{activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied</span>
                </div>
              )}
              
              {/* No Results Message (T203) */}
              {sitters.length === 0 ? (
                <div className="no-results">
                  <h3>No sitters found</h3>
                  <p>Try adjusting your filters or search criteria:</p>
                  <ul>
                    <li>Expand your location radius</li>
                    <li>Remove some filters</li>
                    <li>Try different dates</li>
                  </ul>
                </div>
              ) : (
                <SearchResults sitters={sitters} />
              )}
            </>
          )}

          {!hasSearched && !loading && (
            <div className="search-prompt">
              <p>Enter your location and dates to find available pet sitters</p>
            </div>
          )}
        </main>
      </div>

      {/* Floating AI Assistant Button */}
      <button 
        className={`floating-ai-btn ${showChat ? 'active' : ''}`}
        onClick={() => setShowChat(!showChat)}
        aria-label="Toggle AI Assistant"
      >
        <span className="ai-bot-icon">🤖</span>
        {!showChat && <span className="ai-help-text">Need help finding pet-friendly places?</span>}
      </button>

      {/* AI Chat Modal */}
      {showChat && (
        <div className="ai-chat-modal">
          <div className="ai-chat-modal-content">
            <div className="ai-chat-header">
              <div className="ai-chat-header-info">
                <div className="ai-avatar">🤖</div>
                <div>
                  <h3 className="ai-chat-title">Your Pet-Friendly Guide</h3>
                  <p className="ai-chat-subtitle">Ask me anything about pet-friendly venues!</p>
                </div>
              </div>
              <button 
                className="ai-chat-close"
                onClick={() => setShowChat(false)}
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
            
            <div className="ai-chat-body">
              <ChatInterface 
                onSitterClick={handleSitterClick}
                onBookingClick={handleBookingClick}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
