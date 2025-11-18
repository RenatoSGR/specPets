import { appConfig } from '../config/appConfig';

const API_BASE_URL = appConfig.apiBaseUrl;

export enum BookingStatus {
  Pending = 'Pending',
  Accepted = 'Accepted',
  Declined = 'Declined',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export interface PetOwner {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface PetSitter {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  location: string;
  bio: string;
  yearsOfExperience: number;
  servicesOffered: string[];
  availableDays: string[];
  pricePerDay: number;
  rating: number;
}

export interface Booking {
  id: number;
  petOwnerId: number;
  petSitterId: number;
  serviceId: number;
  petIds: number[];
  startDate: string;
  endDate: string;
  totalCost: number;
  status: BookingStatus;
  statusReason: string;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  // Populated fields
  sitterName?: string;
  ownerName?: string;
  serviceName?: string;
  // Navigation properties
  owner?: PetOwner;
  sitter?: PetSitter;
  // Additional UI fields
  petName?: string;
  petType?: string;
  specialRequirements?: string;
  totalPrice?: number; // Alias for totalCost for UI
}

export interface CreateBookingRequest {
  petOwnerId: number;
  petSitterId: number;
  serviceId: number;
  petIds: number[];
  startDate: string;
  endDate: string;
  totalCost: number;
}

export interface UpdateBookingStatusRequest {
  status: BookingStatus;
  statusReason?: string;
}

/**
 * Create a new booking request
 */
export const createBooking = async (request: CreateBookingRequest): Promise<Booking> => {
  if (appConfig.useMockData) {
    const { bookingMockData } = await import('./bookingData');
    const newBooking: Booking = {
      id: Math.max(...bookingMockData.map(b => b.id)) + 1,
      ...request,
      status: BookingStatus.Pending,
      statusReason: '',
      createdAt: new Date().toISOString()
    };
    bookingMockData.push(newBooking);
    return newBooking;
  }

  const response = await fetch(`${API_BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create booking: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Get booking by ID
 */
export const getBookingById = async (id: number): Promise<Booking> => {
  if (appConfig.useMockData) {
    const { bookingMockData } = await import('./bookingData');
    const booking = bookingMockData.find(b => b.id === id);
    if (!booking) {
      throw new Error(`Booking with ID ${id} not found`);
    }
    return booking;
  }

  const response = await fetch(`${API_BASE_URL}/api/bookings/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch booking: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Get all bookings for a pet owner
 */
export const getOwnerBookings = async (ownerId: number): Promise<Booking[]> => {
  if (appConfig.useMockData) {
    const { bookingMockData } = await import('./bookingData');
    return bookingMockData.filter(b => b.petOwnerId === ownerId);
  }

  const response = await fetch(`${API_BASE_URL}/api/owners/${ownerId}/bookings`);
  if (!response.ok) {
    throw new Error(`Failed to fetch owner bookings: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Get all bookings for a pet sitter
 */
export const getSitterBookings = async (sitterId: number): Promise<Booking[]> => {
  if (appConfig.useMockData) {
    const { bookingMockData } = await import('./bookingData');
    return bookingMockData.filter(b => b.petSitterId === sitterId);
  }

  const response = await fetch(`${API_BASE_URL}/api/sitters/${sitterId}/bookings`);
  if (!response.ok) {
    throw new Error(`Failed to fetch sitter bookings: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Get pending bookings for a pet sitter
 * Phase 5: T108
 */
export const getPendingBookings = async (sitterId: number): Promise<Booking[]> => {
  if (appConfig.useMockData) {
    const { bookingMockData } = await import('./bookingData');
    return bookingMockData.filter(
      b => b.petSitterId === sitterId && b.status === BookingStatus.Pending
    );
  }

  const response = await fetch(`${API_BASE_URL}/api/bookings/pending?sitterId=${sitterId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch pending bookings: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Get pending bookings for a pet sitter (legacy method - calls getPendingBookings)
 */
export const getPendingSitterBookings = async (sitterId: number): Promise<Booking[]> => {
  return getPendingBookings(sitterId);
};

/**
 * Update booking status (accept/decline/cancel/complete)
 */
export const updateBookingStatus = async (
  id: number, 
  request: UpdateBookingStatusRequest
): Promise<Booking> => {
  if (appConfig.useMockData) {
    const { bookingMockData } = await import('./bookingData');
    const booking = bookingMockData.find(b => b.id === id);
    if (!booking) {
      throw new Error(`Booking with ID ${id} not found`);
    }
    booking.status = request.status;
    booking.statusReason = request.statusReason || '';
    
    if (request.status === BookingStatus.Accepted) {
      booking.acceptedAt = new Date().toISOString();
    } else if (request.status === BookingStatus.Completed) {
      booking.completedAt = new Date().toISOString();
    } else if (request.status === BookingStatus.Cancelled) {
      booking.cancelledAt = new Date().toISOString();
    }
    
    return booking;
  }

  const response = await fetch(`${API_BASE_URL}/api/bookings/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update booking status: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Accept a pending booking request
 * Phase 5: T109, T123
 */
export const acceptBooking = async (id: number): Promise<Booking> => {
  if (appConfig.useMockData) {
    const { bookingMockData } = await import('./bookingData');
    const booking = bookingMockData.find(b => b.id === id);
    if (!booking) {
      throw new Error(`Booking with ID ${id} not found`);
    }
    if (booking.status !== BookingStatus.Pending) {
      throw new Error('Only pending bookings can be accepted');
    }
    booking.status = BookingStatus.Accepted;
    booking.statusReason = 'Accepted by sitter';
    booking.acceptedAt = new Date().toISOString();
    return booking;
  }

  const response = await fetch(`${API_BASE_URL}/api/bookings/${id}/accept`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `Failed to accept booking: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Decline a pending booking request with reason
 * Phase 5: T110, T123
 */
export const declineBooking = async (id: number, reason: string): Promise<Booking> => {
  if (appConfig.useMockData) {
    const { bookingMockData } = await import('./bookingData');
    const booking = bookingMockData.find(b => b.id === id);
    if (!booking) {
      throw new Error(`Booking with ID ${id} not found`);
    }
    if (booking.status !== BookingStatus.Pending) {
      throw new Error('Only pending bookings can be declined');
    }
    booking.status = BookingStatus.Declined;
    booking.statusReason = reason;
    booking.cancelledAt = new Date().toISOString();
    return booking;
  }

  const response = await fetch(`${API_BASE_URL}/api/bookings/${id}/decline`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `Failed to decline booking: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Cancel a booking with cancellation policy applied
 * Phase 5: T111, T130
 */
export const cancelBooking = async (id: number, reason?: string): Promise<{
  id: number;
  status: BookingStatus;
  statusReason: string;
  cancelledAt: string;
  refundAmount: number;
  refundPercentage: number;
  message: string;
}> => {
  if (appConfig.useMockData) {
    const { bookingMockData } = await import('./bookingData');
    const booking = bookingMockData.find(b => b.id === id);
    if (!booking) {
      throw new Error(`Booking with ID ${id} not found`);
    }
    if (booking.status === BookingStatus.Completed) {
      throw new Error('Cannot cancel completed bookings');
    }
    if (booking.status === BookingStatus.Cancelled || booking.status === BookingStatus.Declined) {
      throw new Error('Booking is already cancelled');
    }
    
    // Calculate refund
    const hoursUntilStart = (new Date(booking.startDate).getTime() - Date.now()) / (1000 * 60 * 60);
    const refundPercentage = hoursUntilStart >= 24 ? 100 : 0;
    const refundAmount = (booking.totalCost * refundPercentage) / 100;
    
    booking.status = BookingStatus.Cancelled;
    booking.statusReason = reason || 'Cancelled by user';
    booking.cancelledAt = new Date().toISOString();
    
    return {
      id: booking.id,
      status: booking.status,
      statusReason: booking.statusReason,
      cancelledAt: booking.cancelledAt,
      refundAmount,
      refundPercentage,
      message: hoursUntilStart >= 24
        ? 'Booking cancelled with full refund'
        : 'Booking cancelled within 24 hours - no refund per policy'
    };
  }

  const response = await fetch(`${API_BASE_URL}/api/bookings/${id}/cancel`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `Failed to cancel booking: ${response.statusText}`);
  }
  return response.json();
};
