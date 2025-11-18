/**
 * Application configuration
 * Centralizes environment-based settings for the frontend
 */

interface AppConfig {
  // API endpoints
  apiBaseUrl: string;
  
  // Feature flags
  useMockData: boolean;
  enableMarketplace: boolean;
  
  // Environment
  environment: 'development' | 'production' | 'test';
}

/**
 * Get app configuration based on environment variables
 */
const getConfig = (): AppConfig => {
  const useMockData = process.env.REACT_APP_USE_MOCK_DATA === 'true';
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';
  const environment = (process.env.NODE_ENV as any) || 'development';
  
  return {
    apiBaseUrl,
    useMockData,
    enableMarketplace: true, // Feature toggle for marketplace
    environment
  };
};

export const appConfig = getConfig();
