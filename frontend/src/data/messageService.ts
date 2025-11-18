import { appConfig } from '../config/appConfig';

const API_BASE_URL = appConfig.apiBaseUrl;

export interface Message {
  id: number;
  bookingId: number;
  senderId: number;
  senderType: 'Owner' | 'Sitter';
  content: string;
  sentAt: string;
  isRead: boolean;
  senderRole?: string; // "Owner" or "Sitter" - from backend response
}

export interface SendMessageRequest {
  bookingId: number;
  senderId: number;
  content: string;
}

export interface UnreadCountResponse {
  count: number;
  hasUnread: boolean;
}

/**
 * Get all messages for a booking (T116, T139)
 * Returns messages ordered chronologically with sender information
 */
export const getMessagesByBooking = async (bookingId: number): Promise<Message[]> => {
  if (appConfig.useMockData) {
    throw new Error('Messaging is not available in mock data mode. Please connect to the backend API.');
  }

  const response = await fetch(`${API_BASE_URL}/api/messages/booking/${bookingId}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch messages: ${response.status} ${errorText}`);
  }
  return response.json();
};

/**
 * Send a new message (T115, T141)
 * Backend auto-determines senderType based on booking participants
 * Validates: max 1000 chars, non-empty, only for accepted bookings
 */
export const sendMessage = async (request: SendMessageRequest): Promise<Message> => {
  if (appConfig.useMockData) {
    throw new Error('Messaging is not available in mock data mode. Please connect to the backend API.');
  }

  const response = await fetch(`${API_BASE_URL}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `Failed to send message: ${response.status}`);
  }
  return response.json();
};

/**
 * Mark a message as read (T117, T143)
 * Only marks a single message, not batch operation
 */
export const markMessageAsRead = async (messageId: number): Promise<void> => {
  if (appConfig.useMockData) {
    throw new Error('Messaging is not available in mock data mode. Please connect to the backend API.');
  }

  const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}/read`, {
    method: 'PUT'
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to mark message as read: ${response.status} ${errorText}`);
  }
};

/**
 * Get unread message count for a user (T118, T144)
 * Returns count and hasUnread flag across all user's bookings
 */
export const getUnreadMessageCount = async (userId: number): Promise<UnreadCountResponse> => {
  if (appConfig.useMockData) {
    throw new Error('Messaging is not available in mock data mode. Please connect to the backend API.');
  }

  const response = await fetch(`${API_BASE_URL}/api/messages/unread?userId=${userId}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch unread count: ${response.status} ${errorText}`);
  }
  return response.json();
};
