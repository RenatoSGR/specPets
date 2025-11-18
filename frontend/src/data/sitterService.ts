import { appConfig } from '../config/appConfig';

const API_BASE_URL = appConfig.apiBaseUrl;

export interface PetSitter {
  id: number;
  email: string;
  name: string;
  phone: string;
  bio: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  hourlyRate: number;
  photos: string[];
  petTypesAccepted: string[];
  skills: string[];
  createdAt: string;
  profileCompleteness: number;
  services?: Service[];
  reviews?: Review[];
}

export interface Service {
  id: number;
  petSitterId: number;
  name: string;
  description: string;
  price: number;
  priceUnit: string;
  petTypesSupported: string[];
}

export interface Review {
  id: number;
  petSitterId: number;
  petOwnerId: number;
  bookingId: number;
  rating: number;
  comment: string;
  createdAt: string;
  ownerName?: string;
}

export interface SearchParams {
  zipCode?: string;
  startDate?: string;
  endDate?: string;
  petType?: string;
  radius?: number;
  serviceIds?: string;
  minRating?: number;
  maxPrice?: number;
  skills?: string;
}

/**
 * Search for pet sitters by location, dates, and advanced filters
 */
export const searchSitters = async (params: SearchParams): Promise<PetSitter[]> => {
  if (appConfig.useMockData) {
    const { sitterMockData } = await import('./sitterData');
    return sitterMockData.filter(sitter => {
      if (params.zipCode && sitter.zipCode !== params.zipCode) {
        return false;
      }
      if (params.petType && !sitter.petTypesAccepted.includes(params.petType)) {
        return false;
      }
      if (params.maxPrice && sitter.hourlyRate > params.maxPrice) {
        return false;
      }
      if (params.skills) {
        const requestedSkills = params.skills.split(',').map(s => s.trim().toLowerCase());
        const hasSkill = requestedSkills.some(skill => 
          sitter.skills.some(sitterSkill => sitterSkill.toLowerCase().includes(skill))
        );
        if (!hasSkill) return false;
      }
      return true;
    });
  }

  const queryParams = new URLSearchParams();
  if (params.zipCode) queryParams.append('zipCode', params.zipCode);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.petType) queryParams.append('petType', params.petType);
  if (params.radius) queryParams.append('radius', params.radius.toString());
  if (params.serviceIds) queryParams.append('serviceIds', params.serviceIds);
  if (params.minRating) queryParams.append('minRating', params.minRating.toString());
  if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
  if (params.skills) queryParams.append('skills', params.skills);

  const response = await fetch(`${API_BASE_URL}/api/search/sitters?${queryParams}`);
  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Get pet sitter profile by ID
 */
export const getSitterById = async (id: number): Promise<PetSitter> => {
  if (appConfig.useMockData) {
    const { sitterMockData } = await import('./sitterData');
    const sitter = sitterMockData.find(s => s.id === id);
    if (!sitter) {
      throw new Error(`Sitter with ID ${id} not found`);
    }
    return sitter;
  }

  const response = await fetch(`${API_BASE_URL}/api/sitters/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch sitter: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Get services offered by a pet sitter
 */
export const getSitterServices = async (sitterId: number): Promise<Service[]> => {
  if (appConfig.useMockData) {
    const { serviceMockData } = await import('./sitterData');
    return serviceMockData.filter(s => s.petSitterId === sitterId);
  }

  const response = await fetch(`${API_BASE_URL}/api/sitters/${sitterId}/services`);
  if (!response.ok) {
    throw new Error(`Failed to fetch services: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Get reviews for a pet sitter
 */
export const getSitterReviews = async (sitterId: number): Promise<Review[]> => {
  if (appConfig.useMockData) {
    const { reviewMockData } = await import('./sitterData');
    return reviewMockData.filter(r => r.petSitterId === sitterId);
  }

  const response = await fetch(`${API_BASE_URL}/api/sitters/${sitterId}/reviews`);
  if (!response.ok) {
    throw new Error(`Failed to fetch reviews: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Update pet sitter profile
 */
export const updateSitterProfile = async (
  sitterId: number,
  profileData: {
    name?: string;
    phone?: string;
    bio?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    hourlyRate?: number;
    petTypesAccepted?: string[];
    skills?: string[];
  }
): Promise<PetSitter> => {
  if (appConfig.useMockData) {
    throw new Error('Profile updates not supported in mock mode');
  }

  const response = await fetch(`${API_BASE_URL}/api/sitters/${sitterId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update profile: ${errorText}`);
  }

  return response.json();
};

/**
 * Update pet sitter services (batch operation)
 */
export const updateSitterServices = async (
  sitterId: number,
  services: {
    id?: number;
    name: string;
    description: string;
    price: number;
    priceUnit: string;
    petTypesSupported: string[];
  }[]
): Promise<Service[]> => {
  if (appConfig.useMockData) {
    throw new Error('Service updates not supported in mock mode');
  }

  const response = await fetch(`${API_BASE_URL}/api/sitters/${sitterId}/services`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(services),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update services: ${errorText}`);
  }

  return response.json();
};

/**
 * Upload photo for pet sitter
 */
export const uploadSitterPhoto = async (
  sitterId: number,
  photoFile: File
): Promise<PetSitter> => {
  if (appConfig.useMockData) {
    throw new Error('Photo uploads not supported in mock mode');
  }

  // Convert file to base64
  const base64Photo = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(photoFile);
  });

  const response = await fetch(`${API_BASE_URL}/api/sitters/${sitterId}/photos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ photoData: base64Photo }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload photo: ${errorText}`);
  }

  return response.json();
};

/**
 * Delete photo from pet sitter profile
 */
export const deleteSitterPhoto = async (
  sitterId: number,
  photoIndex: number
): Promise<PetSitter> => {
  if (appConfig.useMockData) {
    throw new Error('Photo deletion not supported in mock mode');
  }

  const response = await fetch(`${API_BASE_URL}/api/sitters/${sitterId}/photos/${photoIndex}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete photo: ${errorText}`);
  }

  return response.json();
};
