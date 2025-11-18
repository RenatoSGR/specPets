/**
 * Mock data for bookings - Phase 5 Enhanced (T145-T148)
 * Includes various booking statuses and edge cases for testing:
 * - Pending bookings for accept/decline testing
 * - Accepted bookings for cancellation testing
 * - Declined bookings with reasons
 * - Cancelled bookings with/without refunds (24h policy testing)
 * - Dates relative to current time for policy validation
 */

import { Booking, BookingStatus, PetOwner, PetSitter } from './bookingService';

// Calculate dates relative to today for realistic testing
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const in3Days = new Date(today);
in3Days.setDate(in3Days.getDate() + 3);
const in7Days = new Date(today);
in7Days.setDate(in7Days.getDate() + 7);
const in30Days = new Date(today);
in30Days.setDate(in30Days.getDate() + 30);
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const weekAgo = new Date(today);
weekAgo.setDate(weekAgo.getDate() - 7);

// Mock pet owners with full details (T145)
const mockOwner1: PetOwner = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phoneNumber: '(555) 123-4567',
  address: '123 Main St',
  city: 'Los Angeles',
  state: 'CA',
  zipCode: '90210'
};

const mockOwner2: PetOwner = {
  id: 2,
  firstName: 'Sarah',
  lastName: 'Smith',
  email: 'sarah.smith@example.com',
  phoneNumber: '(555) 234-5678',
  address: '456 Oak Ave',
  city: 'San Francisco',
  state: 'CA',
  zipCode: '94102'
};

// Mock pet sitters with full details (T145)
const mockSitter1: PetSitter = {
  id: 1,
  firstName: 'Emily',
  lastName: 'Jones',
  email: 'emily.jones@petsitter.com',
  phoneNumber: '(555) 345-6789',
  location: 'Beverly Hills, CA',
  bio: 'Experienced pet sitter with 5+ years caring for dogs and cats',
  yearsOfExperience: 5,
  servicesOffered: ['Overnight Pet Care', 'Daily Walks', 'Pet Sitting'],
  availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  pricePerDay: 75,
  rating: 4.8
};

const mockSitter2: PetSitter = {
  id: 2,
  firstName: 'Mike',
  lastName: 'Wilson',
  email: 'mike.wilson@petsitter.com',
  phoneNumber: '(555) 456-7890',
  location: 'San Francisco, CA',
  bio: 'Certified dog trainer specializing in obedience training',
  yearsOfExperience: 8,
  servicesOffered: ['Dog Training Session', 'Behavioral Training'],
  availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
  pricePerDay: 80,
  rating: 4.9
};

export const bookingMockData: Booking[] = [
  // T145: Pending booking - for accept/decline testing
  {
    id: 1,
    petOwnerId: 1,
    petSitterId: 1,
    serviceId: 1,
    petIds: [1],
    startDate: in7Days.toISOString(),
    endDate: new Date(in7Days.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 nights
    totalCost: 375,
    status: BookingStatus.Pending,
    statusReason: '',
    createdAt: weekAgo.toISOString(),
    sitterName: 'Emily Jones',
    ownerName: 'John Doe',
    serviceName: 'Overnight Pet Care',
    owner: mockOwner1,
    sitter: mockSitter1,
    petName: 'Max',
    petType: 'Dog (Golden Retriever)',
    specialRequirements: 'Needs medication at 8 AM and 8 PM. Loves playing fetch in the evenings.'
  },
  // T146: Accepted booking >24h away - for cancellation with full refund testing
  {
    id: 2,
    petOwnerId: 2,
    petSitterId: 2,
    serviceId: 4,
    petIds: [3],
    startDate: in30Days.toISOString(),
    endDate: in30Days.toISOString(),
    totalCost: 80,
    status: BookingStatus.Accepted,
    statusReason: 'Looking forward to working with Charlie on basic obedience!',
    createdAt: weekAgo.toISOString(),
    acceptedAt: yesterday.toISOString(),
    sitterName: 'Mike Wilson',
    ownerName: 'Sarah Smith',
    serviceName: 'Dog Training Session',
    owner: mockOwner2,
    sitter: mockSitter2,
    petName: 'Charlie',
    petType: 'Dog (Labrador)',
    specialRequirements: 'Can be stubborn with "stay" command. Responds well to treats.'
  },
  // T147: Accepted booking <24h away - for cancellation with partial/no refund testing
  {
    id: 3,
    petOwnerId: 1,
    petSitterId: 1,
    serviceId: 1,
    petIds: [1],
    startDate: tomorrow.toISOString(),
    endDate: new Date(tomorrow.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 nights
    totalCost: 150,
    status: BookingStatus.Accepted,
    statusReason: 'Confirmed! I have experience with Golden Retrievers.',
    createdAt: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    acceptedAt: new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
    sitterName: 'Emily Jones',
    ownerName: 'John Doe',
    serviceName: 'Overnight Pet Care',
    owner: mockOwner1,
    sitter: mockSitter1,
    petName: 'Max',
    petType: 'Dog (Golden Retriever)',
    specialRequirements: 'Same medication schedule as usual.'
  },
  // T148: Declined booking - with reason
  {
    id: 4,
    petOwnerId: 2,
    petSitterId: 1,
    serviceId: 1,
    petIds: [3],
    startDate: in3Days.toISOString(),
    endDate: new Date(in3Days.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    totalCost: 300,
    status: BookingStatus.Declined,
    statusReason: 'Unfortunately, I have a scheduling conflict during those dates. Please try another sitter!',
    createdAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    sitterName: 'Emily Jones',
    ownerName: 'Sarah Smith',
    serviceName: 'Overnight Pet Care',
    owner: mockOwner2,
    sitter: mockSitter1,
    petName: 'Charlie',
    petType: 'Dog (Labrador)'
  },
  // T148: Cancelled booking with full refund (>24h notice)
  {
    id: 5,
    petOwnerId: 1,
    petSitterId: 2,
    serviceId: 4,
    petIds: [1],
    startDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks out
    endDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    totalCost: 80,
    status: BookingStatus.Cancelled,
    statusReason: 'Change of plans - we are going on vacation together!',
    createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    acceptedAt: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    cancelledAt: yesterday.toISOString(),
    sitterName: 'Mike Wilson',
    ownerName: 'John Doe',
    serviceName: 'Dog Training Session',
    owner: mockOwner1,
    sitter: mockSitter2,
    petName: 'Max',
    petType: 'Dog (Golden Retriever)'
  },
  // T148: Cancelled booking with no refund (<24h notice)
  {
    id: 6,
    petOwnerId: 2,
    petSitterId: 1,
    serviceId: 1,
    petIds: [3],
    startDate: new Date(today.getTime() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now
    endDate: new Date(today.getTime() + 36 * 60 * 60 * 1000).toISOString(), // 1 night
    totalCost: 75,
    status: BookingStatus.Cancelled,
    statusReason: 'Emergency came up',
    createdAt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    acceptedAt: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    cancelledAt: new Date(today.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    sitterName: 'Emily Jones',
    ownerName: 'Sarah Smith',
    serviceName: 'Overnight Pet Care',
    owner: mockOwner2,
    sitter: mockSitter1,
    petName: 'Charlie',
    petType: 'Dog (Labrador)'
  },
  // Additional pending booking for sitter testing
  {
    id: 7,
    petOwnerId: 2,
    petSitterId: 2,
    serviceId: 4,
    petIds: [3],
    startDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    totalCost: 80,
    status: BookingStatus.Pending,
    statusReason: '',
    createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    sitterName: 'Mike Wilson',
    ownerName: 'Sarah Smith',
    serviceName: 'Dog Training Session',
    owner: mockOwner2,
    sitter: mockSitter2,
    petName: 'Charlie',
    petType: 'Dog (Labrador)',
    specialRequirements: 'Focus on leash training and recall commands.'
  }
];
