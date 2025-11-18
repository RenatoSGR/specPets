/**
 * Mock data for pet sitters, services, and reviews
 * This data syncs with backend/Data/AppDbContext.cs seed data
 * and data/*.json files
 */

import { PetSitter, Service, Review } from './sitterService';

export const sitterMockData: PetSitter[] = [
  {
    id: 1,
    email: 'emily.jones@example.com',
    name: 'Emily Jones',
    phone: '555-0101',
    bio: 'Experienced pet sitter with 5 years of caring for dogs and cats. I love spending time outdoors with active dogs!',
    address: '123 Pet Lane',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
    latitude: 34.0522,
    longitude: -118.2437,
    hourlyRate: 25,
    photos: ['/images/sitters/emily1.jpg', '/images/sitters/emily2.jpg'],
    petTypesAccepted: ['dog', 'cat'],
    skills: ['first aid', 'medication administration'],
    createdAt: '2024-01-15T10:00:00Z',
    profileCompleteness: 95
  },
  {
    id: 2,
    email: 'mike.wilson@example.com',
    name: 'Mike Wilson',
    phone: '555-0102',
    bio: 'Professional dog trainer and pet sitter. Specializing in large breeds and behavioral training.',
    address: '456 Oak Street',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90002',
    latitude: 34.0407,
    longitude: -118.2468,
    hourlyRate: 35,
    photos: ['/images/sitters/mike1.jpg'],
    petTypesAccepted: ['dog'],
    skills: ['training', 'grooming', 'first aid'],
    createdAt: '2024-02-01T10:00:00Z',
    profileCompleteness: 90
  },
  {
    id: 3,
    email: 'jessica.brown@example.com',
    name: 'Jessica Brown',
    phone: '555-0103',
    bio: 'Cat lover with experience in multi-cat households. Also comfortable with small dogs and exotic pets.',
    address: '789 Elm Avenue',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    latitude: 37.7749,
    longitude: -122.4194,
    hourlyRate: 30,
    photos: ['/images/sitters/jessica1.jpg', '/images/sitters/jessica2.jpg', '/images/sitters/jessica3.jpg'],
    petTypesAccepted: ['cat', 'dog', 'bird', 'rabbit'],
    skills: ['medication administration', 'special needs'],
    createdAt: '2024-01-20T10:00:00Z',
    profileCompleteness: 100
  },
  {
    id: 4,
    email: 'david.chen@example.com',
    name: 'David Chen',
    phone: '555-0104',
    bio: 'Reptile and exotic pet specialist with veterinary assistant background. Experienced with unusual pets.',
    address: '321 Maple Drive',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
    latitude: 34.0500,
    longitude: -118.2400,
    hourlyRate: 45,
    photos: ['/images/sitters/david1.jpg'],
    petTypesAccepted: ['reptile', 'bird', 'rabbit', 'other'],
    skills: ['medication administration', 'special needs', 'first aid'],
    createdAt: '2024-03-10T10:00:00Z',
    profileCompleteness: 88
  },
  {
    id: 5,
    email: 'sarah.martinez@example.com',
    name: 'Sarah Martinez',
    phone: '555-0105',
    bio: 'Senior pet care specialist with gentle approach. Perfect for elderly pets requiring extra attention and medication.',
    address: '654 Pine Street',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90002',
    latitude: 34.0380,
    longitude: -118.2500,
    hourlyRate: 40,
    photos: ['/images/sitters/sarah1.jpg', '/images/sitters/sarah2.jpg'],
    petTypesAccepted: ['dog', 'cat'],
    skills: ['senior pet care', 'medication administration', 'first aid'],
    createdAt: '2024-02-20T10:00:00Z',
    profileCompleteness: 92
  },
  {
    id: 6,
    email: 'alex.taylor@example.com',
    name: 'Alex Taylor',
    phone: '555-0106',
    bio: 'Active dog walker and runner. Perfect for high-energy dogs needing lots of exercise and outdoor time.',
    address: '987 Cedar Lane',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    latitude: 37.7800,
    longitude: -122.4150,
    hourlyRate: 28,
    photos: ['/images/sitters/alex1.jpg'],
    petTypesAccepted: ['dog'],
    skills: ['training'],
    createdAt: '2024-03-05T10:00:00Z',
    profileCompleteness: 85
  },
  {
    id: 7,
    email: 'maria.garcia@example.com',
    name: 'Maria Garcia',
    phone: '555-0107',
    bio: 'Certified pet groomer and sitter. Offering full grooming services along with overnight care.',
    address: '147 Birch Avenue',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
    latitude: 34.0550,
    longitude: -118.2380,
    hourlyRate: 50,
    photos: ['/images/sitters/maria1.jpg', '/images/sitters/maria2.jpg', '/images/sitters/maria3.jpg'],
    petTypesAccepted: ['dog', 'cat'],
    skills: ['grooming', 'first aid', 'medication administration'],
    createdAt: '2024-01-30T10:00:00Z',
    profileCompleteness: 98
  },
  {
    id: 8,
    email: 'tom.anderson@example.com',
    name: 'Tom Anderson',
    phone: '555-0108',
    bio: 'Bird and small animal enthusiast. Experience with parrots, finches, rabbits, and guinea pigs.',
    address: '258 Spruce Court',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    latitude: 37.7700,
    longitude: -122.4250,
    hourlyRate: 32,
    photos: ['/images/sitters/tom1.jpg'],
    petTypesAccepted: ['bird', 'rabbit', 'other'],
    skills: ['special needs'],
    createdAt: '2024-02-15T10:00:00Z',
    profileCompleteness: 87
  },
  {
    id: 9,
    email: 'linda.white@example.com',
    name: 'Linda White',
    phone: '555-0109',
    bio: 'Retired veterinary nurse with 20 years experience. Specializing in pets with medical needs and post-surgery care.',
    address: '369 Willow Way',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90002',
    latitude: 34.0420,
    longitude: -118.2450,
    hourlyRate: 55,
    photos: ['/images/sitters/linda1.jpg', '/images/sitters/linda2.jpg'],
    petTypesAccepted: ['dog', 'cat', 'bird', 'rabbit', 'reptile'],
    skills: ['medication administration', 'first aid', 'senior pet care', 'special needs'],
    createdAt: '2024-01-10T10:00:00Z',
    profileCompleteness: 100
  },
  {
    id: 10,
    email: 'carlos.rodriguez@example.com',
    name: 'Carlos Rodriguez',
    phone: '555-0110',
    bio: 'Multi-pet household expert. Comfortable managing homes with multiple dogs and cats simultaneously.',
    address: '741 Redwood Street',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
    latitude: 34.0480,
    longitude: -118.2420,
    hourlyRate: 38,
    photos: ['/images/sitters/carlos1.jpg'],
    petTypesAccepted: ['dog', 'cat'],
    skills: ['training', 'first aid'],
    createdAt: '2024-02-28T10:00:00Z',
    profileCompleteness: 90
  }
];

export const serviceMockData: Service[] = [
  // Emily Jones (id: 1) - dog, cat - overnight, daily visit
  {
    id: 1,
    petSitterId: 1,
    name: 'overnight',
    description: 'Full overnight care at your home, includes feeding, walking, and playtime',
    price: 75,
    priceUnit: 'per night',
    petTypesSupported: ['dog', 'cat']
  },
  {
    id: 2,
    petSitterId: 1,
    name: 'daily visit',
    description: '30-minute visit including feeding, fresh water, and playtime',
    price: 25,
    priceUnit: 'per visit',
    petTypesSupported: ['dog', 'cat']
  },
  // Mike Wilson (id: 2) - dog - walking
  {
    id: 3,
    petSitterId: 2,
    name: 'walking',
    description: '60-minute dog walk in your neighborhood or local park',
    price: 35,
    priceUnit: 'per hour',
    petTypesSupported: ['dog']
  },
  // Jessica Brown (id: 3) - cat, dog, bird, rabbit - overnight, medication
  {
    id: 4,
    petSitterId: 3,
    name: 'overnight',
    description: 'Overnight care for cats, dogs, and small animals',
    price: 80,
    priceUnit: 'per night',
    petTypesSupported: ['cat', 'dog', 'bird', 'rabbit']
  },
  {
    id: 5,
    petSitterId: 3,
    name: 'medication',
    description: 'Medication administration for pets requiring special care',
    price: 30,
    priceUnit: 'per visit',
    petTypesSupported: ['cat', 'dog', 'bird', 'rabbit']
  },
  // David Chen (id: 4) - reptile, bird, rabbit, other - medication
  {
    id: 6,
    petSitterId: 4,
    name: 'medication',
    description: 'Specialized care for exotic pets including medication administration',
    price: 45,
    priceUnit: 'per visit',
    petTypesSupported: ['reptile', 'bird', 'rabbit', 'other']
  },
  // Sarah Martinez (id: 5) - dog, cat - overnight, medication
  {
    id: 7,
    petSitterId: 5,
    name: 'overnight',
    description: 'Senior pet overnight care with gentle handling',
    price: 90,
    priceUnit: 'per night',
    petTypesSupported: ['dog', 'cat']
  },
  {
    id: 8,
    petSitterId: 5,
    name: 'medication',
    description: 'Expert medication administration for senior pets',
    price: 40,
    priceUnit: 'per visit',
    petTypesSupported: ['dog', 'cat']
  },
  // Alex Taylor (id: 6) - dog - walking
  {
    id: 9,
    petSitterId: 6,
    name: 'walking',
    description: 'High-energy dog walking and running sessions',
    price: 28,
    priceUnit: 'per hour',
    petTypesSupported: ['dog']
  },
  // Maria Garcia (id: 7) - dog, cat - overnight, grooming
  {
    id: 10,
    petSitterId: 7,
    name: 'overnight',
    description: 'Overnight care with optional grooming services',
    price: 95,
    priceUnit: 'per night',
    petTypesSupported: ['dog', 'cat']
  },
  {
    id: 11,
    petSitterId: 7,
    name: 'grooming',
    description: 'Professional grooming including bath, trim, and nail clipping',
    price: 50,
    priceUnit: 'per session',
    petTypesSupported: ['dog', 'cat']
  },
  // Tom Anderson (id: 8) - bird, rabbit, other - daily visit
  {
    id: 12,
    petSitterId: 8,
    name: 'daily visit',
    description: 'Daily care for birds and small animals',
    price: 32,
    priceUnit: 'per visit',
    petTypesSupported: ['bird', 'rabbit', 'other']
  },
  // Linda White (id: 9) - all types - overnight, medication
  {
    id: 13,
    petSitterId: 9,
    name: 'overnight',
    description: 'Medical-grade overnight care for all pet types',
    price: 120,
    priceUnit: 'per night',
    petTypesSupported: ['dog', 'cat', 'bird', 'rabbit', 'reptile']
  },
  {
    id: 14,
    petSitterId: 9,
    name: 'medication',
    description: 'Professional medication administration with nursing background',
    price: 55,
    priceUnit: 'per visit',
    petTypesSupported: ['dog', 'cat', 'bird', 'rabbit', 'reptile']
  },
  // Carlos Rodriguez (id: 10) - dog, cat - daily visit, walking
  {
    id: 15,
    petSitterId: 10,
    name: 'daily visit',
    description: 'Daily visits for multi-pet households',
    price: 38,
    priceUnit: 'per visit',
    petTypesSupported: ['dog', 'cat']
  },
  {
    id: 16,
    petSitterId: 10,
    name: 'walking',
    description: 'Group walks for multiple dogs',
    price: 38,
    priceUnit: 'per hour',
    petTypesSupported: ['dog']
  }
];

export const reviewMockData: Review[] = [
  // Emily Jones (id: 1) - 4 reviews, avg 4.75
  {
    id: 1,
    petSitterId: 1,
    petOwnerId: 1,
    bookingId: 1,
    rating: 5,
    comment: 'Emily was fantastic! My dog Max loved her and she sent daily photo updates. Highly recommend for anyone looking for a reliable pet sitter!',
    createdAt: '2024-03-01T10:00:00Z',
    ownerName: 'John D.'
  },
  {
    id: 2,
    petSitterId: 1,
    petOwnerId: 2,
    bookingId: 3,
    rating: 4,
    comment: 'Great experience overall. Emily was reliable and my cats were well cared for. Would definitely book again!',
    createdAt: '2024-03-10T10:00:00Z',
    ownerName: 'Sarah S.'
  },
  {
    id: 3,
    petSitterId: 1,
    petOwnerId: 3,
    bookingId: 5,
    rating: 5,
    comment: 'Emily went above and beyond during our vacation. She even watered our plants! Such a caring and thoughtful sitter.',
    createdAt: '2024-03-15T09:15:00Z',
    ownerName: 'Mike W.'
  },
  {
    id: 4,
    petSitterId: 1,
    petOwnerId: 2,
    bookingId: 8,
    rating: 5,
    comment: 'Third time booking with Emily and she never disappoints! My dog gets so excited when she arrives. Thank you Emily!',
    createdAt: '2024-03-22T13:20:00Z',
    ownerName: 'Sarah S.'
  },
  // Mike Wilson (id: 2) - 3 reviews, avg 4.67
  {
    id: 5,
    petSitterId: 2,
    petOwnerId: 2,
    bookingId: 2,
    rating: 5,
    comment: 'Mike is a true professional. His training techniques worked wonders with my dog. We\'ve seen huge improvements in behavior!',
    createdAt: '2024-03-05T10:00:00Z',
    ownerName: 'Sarah S.'
  },
  {
    id: 6,
    petSitterId: 2,
    petOwnerId: 1,
    bookingId: 6,
    rating: 4,
    comment: 'Mike was great with our energetic dog. The training tips he shared were really helpful. Only minor issue was a slight delay one day.',
    createdAt: '2024-03-18T16:45:00Z',
    ownerName: 'John D.'
  },
  {
    id: 7,
    petSitterId: 2,
    petOwnerId: 4,
    bookingId: 11,
    rating: 5,
    comment: 'Excellent grooming service! My dog looks and smells amazing. Mike is very skilled.',
    createdAt: '2024-03-25T14:00:00Z',
    ownerName: 'Linda R.'
  },
  // Jessica Brown (id: 3) - 3 reviews, avg 5.0
  {
    id: 8,
    petSitterId: 3,
    petOwnerId: 1,
    bookingId: 4,
    rating: 5,
    comment: 'Jessica is amazing with cats! She really understands their needs and my two cats were so happy when I got home.',
    createdAt: '2024-03-12T14:30:00Z',
    ownerName: 'John D.'
  },
  {
    id: 9,
    petSitterId: 3,
    petOwnerId: 3,
    bookingId: 7,
    rating: 5,
    comment: 'Jessica took wonderful care of our rabbit and bird. She clearly has experience with different types of pets. 10/10 would book again!',
    createdAt: '2024-03-20T11:00:00Z',
    ownerName: 'Mike W.'
  },
  {
    id: 10,
    petSitterId: 3,
    petOwnerId: 5,
    bookingId: 14,
    rating: 5,
    comment: 'Perfect for medication administration! My cat requires special care and Jessica handled it expertly.',
    createdAt: '2024-03-28T10:30:00Z',
    ownerName: 'Tom H.'
  },
  // David Chen (id: 4) - 2 reviews, avg 4.5
  {
    id: 11,
    petSitterId: 4,
    petOwnerId: 6,
    bookingId: 15,
    rating: 5,
    comment: 'David is the best! My bearded dragon got excellent care. He really knows exotic pets.',
    createdAt: '2024-03-08T11:45:00Z',
    ownerName: 'Emily T.'
  },
  {
    id: 12,
    petSitterId: 4,
    petOwnerId: 7,
    bookingId: 16,
    rating: 4,
    comment: 'Very knowledgeable about reptiles. My snake was well cared for. Highly recommend for exotic pet owners.',
    createdAt: '2024-03-19T15:20:00Z',
    ownerName: 'Carlos M.'
  },
  // Sarah Martinez (id: 5) - 3 reviews, avg 4.67
  {
    id: 13,
    petSitterId: 5,
    petOwnerId: 8,
    bookingId: 17,
    rating: 5,
    comment: 'Sarah was amazing with my senior dog. Very gentle and caring. She has a real gift with older pets.',
    createdAt: '2024-03-11T09:30:00Z',
    ownerName: 'Barbara W.'
  },
  {
    id: 14,
    petSitterId: 5,
    petOwnerId: 9,
    bookingId: 18,
    rating: 5,
    comment: 'Expert medication administration. My cat requires daily insulin and Sarah handled it perfectly.',
    createdAt: '2024-03-21T13:00:00Z',
    ownerName: 'Richard S.'
  },
  {
    id: 15,
    petSitterId: 5,
    petOwnerId: 10,
    bookingId: 19,
    rating: 4,
    comment: 'Professional and experienced with senior pets. Sarah gave my elderly dog excellent care.',
    createdAt: '2024-03-27T16:15:00Z',
    ownerName: 'Nancy B.'
  },
  // Alex Taylor (id: 6) - 2 reviews, avg 4.0
  {
    id: 16,
    petSitterId: 6,
    petOwnerId: 11,
    bookingId: 20,
    rating: 4,
    comment: 'Great energy! My dog loves the long walks. Alex is always punctual and reliable.',
    createdAt: '2024-03-14T10:45:00Z',
    ownerName: 'Kevin M.'
  },
  {
    id: 17,
    petSitterId: 6,
    petOwnerId: 12,
    bookingId: 21,
    rating: 4,
    comment: 'Good walker, my active dog is finally tired out after their sessions!',
    createdAt: '2024-03-24T14:30:00Z',
    ownerName: 'Laura D.'
  },
  // Maria Garcia (id: 7) - 3 reviews, avg 5.0
  {
    id: 18,
    petSitterId: 7,
    petOwnerId: 13,
    bookingId: 22,
    rating: 5,
    comment: 'Amazing groomer! My dog looks fantastic and Maria is so professional. Best grooming service in LA!',
    createdAt: '2024-03-09T12:00:00Z',
    ownerName: 'Steven W.'
  },
  {
    id: 19,
    petSitterId: 7,
    petOwnerId: 14,
    bookingId: 23,
    rating: 5,
    comment: 'Best grooming service we\'ve found. Maria is gentle and skilled. Highly recommend!',
    createdAt: '2024-03-16T11:30:00Z',
    ownerName: 'Patricia L.'
  },
  {
    id: 20,
    petSitterId: 7,
    petOwnerId: 15,
    bookingId: 24,
    rating: 5,
    comment: 'Excellent overnight care and grooming. Worth every penny! Our dog loves Maria.',
    createdAt: '2024-03-26T15:45:00Z',
    ownerName: 'Daniel T.'
  },
  // Tom Anderson (id: 8) - 2 reviews, avg 4.0
  {
    id: 21,
    petSitterId: 8,
    petOwnerId: 16,
    bookingId: 25,
    rating: 4,
    comment: 'Tom is great with birds! My parrot was well cared for and happy.',
    createdAt: '2024-03-13T10:00:00Z',
    ownerName: 'Susan W.'
  },
  {
    id: 22,
    petSitterId: 8,
    petOwnerId: 17,
    bookingId: 26,
    rating: 4,
    comment: 'Good service for small animals. Tom knows what he\'s doing with rabbits. Reliable sitter.',
    createdAt: '2024-03-23T13:15:00Z',
    ownerName: 'Mark J.'
  },
  // Linda White (id: 9) - 4 reviews, avg 5.0
  {
    id: 23,
    petSitterId: 9,
    petOwnerId: 18,
    bookingId: 27,
    rating: 5,
    comment: 'Linda is incredible! Her nursing background shows in every interaction. The best sitter we\'ve ever had!',
    createdAt: '2024-03-07T09:00:00Z',
    ownerName: 'Helen G.'
  },
  {
    id: 24,
    petSitterId: 9,
    petOwnerId: 19,
    bookingId: 28,
    rating: 5,
    comment: 'Best pet sitter we\'ve ever had. Linda handles all our pets (dog, cat, bird) with expertise and care.',
    createdAt: '2024-03-17T14:00:00Z',
    ownerName: 'George M.'
  },
  {
    id: 25,
    petSitterId: 9,
    petOwnerId: 20,
    bookingId: 29,
    rating: 5,
    comment: 'Worth every penny! Professional medical-grade care. Linda saved us when our cat needed special medication.',
    createdAt: '2024-03-29T11:20:00Z',
    ownerName: 'Dorothy B.'
  },
  {
    id: 26,
    petSitterId: 9,
    petOwnerId: 21,
    bookingId: 30,
    rating: 5,
    comment: 'Linda saved us when our special needs cat needed care. Amazing experience! Can\'t recommend highly enough.',
    createdAt: '2024-03-30T16:00:00Z',
    ownerName: 'Paul D.'
  },
  // Carlos Rodriguez (id: 10) - 2 reviews, avg 4.0
  {
    id: 27,
    petSitterId: 10,
    petOwnerId: 22,
    bookingId: 31,
    rating: 4,
    comment: 'Great with multiple pets! Carlos handles our 3 dogs and cat with ease. Very organized and reliable.',
    createdAt: '2024-03-18T12:30:00Z',
    ownerName: 'Carol W.'
  },
  {
    id: 28,
    petSitterId: 10,
    petOwnerId: 23,
    bookingId: 32,
    rating: 4,
    comment: 'Carlos is reliable and great with our multi-pet household. He really knows how to manage multiple animals.',
    createdAt: '2024-03-28T15:00:00Z',
    ownerName: 'Frank A.'
  }
];

