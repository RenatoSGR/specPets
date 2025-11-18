/**
 * Mock data for messages - Phase 5 Enhanced (T146)
 * Message threads for accepted bookings with realistic conversation flows
 */

import { Message } from './messageService';

// Calculate relative timestamps
const now = new Date();
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

export const messageMockData: Message[] = [
  // Thread for Booking #2 (Accepted, 30 days away)
  {
    id: 1,
    bookingId: 2,
    senderId: 2,
    senderType: 'Owner',
    content: 'Hi Mike! Thanks for accepting the booking. Charlie is very excited for his training session!',
    sentAt: daysAgo(1),
    isRead: true
  },
  {
    id: 2,
    bookingId: 2,
    senderId: 2,
    senderType: 'Sitter',
    content: 'Hi Sarah! I\'m looking forward to working with Charlie. What specific commands would you like me to focus on during our session?',
    sentAt: hoursAgo(22),
    isRead: true
  },
  {
    id: 3,
    bookingId: 2,
    senderId: 2,
    senderType: 'Owner',
    content: 'Charlie struggles with "stay" and recall commands, especially when there are distractions. He responds well to treats though!',
    sentAt: hoursAgo(20),
    isRead: true
  },
  {
    id: 4,
    bookingId: 2,
    senderId: 2,
    senderType: 'Sitter',
    content: 'Perfect! I\'ll bring some high-value treats and we\'ll work on impulse control exercises. Does Charlie have any food allergies I should know about?',
    sentAt: hoursAgo(18),
    isRead: true
  },
  {
    id: 5,
    bookingId: 2,
    senderId: 2,
    senderType: 'Owner',
    content: 'No allergies! He loves chicken and peanut butter treats. Thanks for asking!',
    sentAt: hoursAgo(17),
    isRead: false
  },
  
  // Thread for Booking #3 (Accepted, tomorrow - urgent communication)
  {
    id: 6,
    bookingId: 3,
    senderId: 1,
    senderType: 'Owner',
    content: 'Hi Emily, just confirming our booking for tomorrow. Max will be ready by 2 PM.',
    sentAt: hoursAgo(5),
    isRead: true
  },
  {
    id: 7,
    bookingId: 3,
    senderId: 1,
    senderType: 'Sitter',
    content: 'Perfect! I\'ll be there at 2 PM sharp. Does Max still need his medication twice daily?',
    sentAt: hoursAgo(4),
    isRead: true
  },
  {
    id: 8,
    bookingId: 3,
    senderId: 1,
    senderType: 'Owner',
    content: 'Yes, 8 AM and 8 PM. I\'ll leave detailed instructions on the counter along with his food and medications.',
    sentAt: hoursAgo(3),
    isRead: true
  },
  {
    id: 9,
    bookingId: 3,
    senderId: 1,
    senderType: 'Sitter',
    content: 'Got it! I\'ll make sure to follow the schedule. Looking forward to spending time with Max again! 🐕',
    sentAt: hoursAgo(2),
    isRead: false
  },
  
  // Thread for Booking #7 (Pending - pre-acceptance questions)
  {
    id: 10,
    bookingId: 7,
    senderId: 2,
    senderType: 'Owner',
    content: 'Hi Mike! I saw your profile and would love to book a training session for Charlie. We need help with leash pulling.',
    sentAt: daysAgo(2),
    isRead: true
  },
  {
    id: 11,
    bookingId: 7,
    senderId: 2,
    senderType: 'Sitter',
    content: 'Hi Sarah! I specialize in leash training. How old is Charlie and how long has the pulling been an issue?',
    sentAt: hoursAgo(36),
    isRead: true
  },
  {
    id: 12,
    bookingId: 7,
    senderId: 2,
    senderType: 'Owner',
    content: 'Charlie is 2 years old. The pulling started about 6 months ago and has gotten progressively worse.',
    sentAt: hoursAgo(32),
    isRead: false
  }
];
