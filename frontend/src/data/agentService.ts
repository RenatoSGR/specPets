/**
 * Agent Service
 * Handles communication with the Octopets AI agent system
 */

import { appConfig } from '../config/appConfig';

// ====================================
// Types
// ====================================

export interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AgentChatRequest {
  message: string;
  context?: Record<string, any>;
  user_id?: number;
}

export interface AgentChatResponse {
  message: string;
  agent_used?: string;
  data?: Record<string, any>;
}

export interface AgentConversation {
  id: string;
  messages: AgentMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// ====================================
// Configuration
// ====================================

// For now, use sitter agent directly (orchestrator has dependency issues)
const ORCHESTRATOR_URL = 'http://localhost:8001';

// ====================================
// Mock Responses (for development)
// ====================================

const mockResponses: Record<string, string> = {
  'find': 'I found 3 pet sitters in your area matching your criteria:\n\n1. Sarah Johnson - Dog specialist, 4.9★\n2. Mike Chen - All pets, 4.8★\n3. Emma Davis - Cats & small animals, 4.7★\n\nWould you like more details about any of these sitters?',
  'booking': 'You have 2 active bookings:\n\n1. Booking #123 - Confirmed with Sarah Johnson for July 10-15\n2. Booking #124 - Pending with Mike Chen for July 20-22\n\nWould you like details on any booking?',
  'status': 'Booking #123 is confirmed! ✅\n\nSitter: Sarah Johnson\nDates: July 10-15, 2024\nService: Overnight Care\nTotal: $240.00\n\nThe sitter will contact you 24 hours before the start date.',
  'help': '**Welcome to Octopets AI Assistant!** 🐾\n\nI can help you with:\n\n🔍 Finding Pet Sitters\n📅 Managing Bookings\n💡 Getting Tips & Advice\n\nJust ask me naturally, like:\n- "Find dog sitters near me"\n- "Show my bookings"\n- "Cancel booking #123"'
};

function getMockResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('find') || lowerMessage.includes('search') || lowerMessage.includes('sitter')) {
    return mockResponses.find;
  } else if (lowerMessage.includes('booking') || lowerMessage.includes('reservation')) {
    return mockResponses.booking;
  } else if (lowerMessage.includes('status')) {
    return mockResponses.status;
  } else {
    return mockResponses.help;
  }
}

// ====================================
// Storage (simple localStorage for demo)
// ====================================

const STORAGE_KEY = 'octopets_agent_conversations';

function loadConversations(): Record<string, AgentConversation> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    
    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    Object.values(parsed).forEach((conv: any) => {
      conv.createdAt = new Date(conv.createdAt);
      conv.updatedAt = new Date(conv.updatedAt);
      conv.messages.forEach((msg: any) => {
        msg.timestamp = new Date(msg.timestamp);
      });
    });
    
    return parsed;
  } catch (error) {
    console.error('Error loading conversations:', error);
    return {};
  }
}

function saveConversations(conversations: Record<string, AgentConversation>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error('Error saving conversations:', error);
  }
}

// ====================================
// API Functions
// ====================================

/**
 * Send a message to the agent orchestrator
 */
export async function sendAgentMessage(
  request: AgentChatRequest
): Promise<AgentChatResponse> {
  if (appConfig.useMockData) {
    // Mock mode - simulate delay and return mock response
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      message: getMockResponse(request.message),
      agent_used: request.message.toLowerCase().includes('booking') ? 'booking' : 'sitter',
      data: request.context
    };
  }

  try {
    const response = await fetch(`${ORCHESTRATOR_URL}/agent/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Agent request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending agent message:', error);
    throw error;
  }
}

/**
 * Get or create a conversation
 */
export function getConversation(conversationId?: string): AgentConversation {
  const conversations = loadConversations();
  
  if (conversationId && conversations[conversationId]) {
    return conversations[conversationId];
  }
  
  // Create new conversation
  const newConversation: AgentConversation = {
    id: conversationId || generateConversationId(),
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  return newConversation;
}

/**
 * Save a message to a conversation
 */
export function addMessageToConversation(
  conversationId: string,
  message: AgentMessage
): AgentConversation {
  const conversations = loadConversations();
  const conversation = conversations[conversationId] || getConversation(conversationId);
  
  conversation.messages.push(message);
  conversation.updatedAt = new Date();
  
  conversations[conversationId] = conversation;
  saveConversations(conversations);
  
  return conversation;
}

/**
 * Get all conversations
 */
export function getAllConversations(): AgentConversation[] {
  const conversations = loadConversations();
  return Object.values(conversations).sort((a, b) => 
    b.updatedAt.getTime() - a.updatedAt.getTime()
  );
}

/**
 * Delete a conversation
 */
export function deleteConversation(conversationId: string): void {
  const conversations = loadConversations();
  delete conversations[conversationId];
  saveConversations(conversations);
}

/**
 * Clear all conversations
 */
export function clearAllConversations(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ====================================
// Helper Functions
// ====================================

function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format a message for display
 */
export function formatAgentMessage(message: string): string {
  // Convert markdown-style formatting for display
  return message
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
}

/**
 * Extract sitter IDs from agent response
 */
export function extractSitterIds(message: string): number[] {
  const matches = message.match(/sitter #(\d+)/gi);
  if (!matches) return [];
  
  return matches.map(match => {
    const id = match.match(/\d+/);
    return id ? parseInt(id[0]) : 0;
  }).filter(id => id > 0);
}

/**
 * Extract booking IDs from agent response
 */
export function extractBookingIds(message: string): number[] {
  const matches = message.match(/booking #(\d+)/gi);
  if (!matches) return [];
  
  return matches.map(match => {
    const id = match.match(/\d+/);
    return id ? parseInt(id[0]) : 0;
  }).filter(id => id > 0);
}

/**
 * Check agent health
 */
export async function checkAgentHealth(): Promise<{
  status: string;
  orchestrator: boolean;
  sitterAgent: boolean;
  bookingAgent: boolean;
}> {
  if (appConfig.useMockData) {
    return {
      status: 'healthy',
      orchestrator: true,
      sitterAgent: true,
      bookingAgent: true,
    };
  }

  try {
    const response = await fetch(`${ORCHESTRATOR_URL}/health`);
    const data = await response.json();
    
    return {
      status: data.status,
      orchestrator: response.ok,
      sitterAgent: data.sub_agents?.sitter_agent === 'healthy',
      bookingAgent: data.sub_agents?.booking_agent === 'healthy',
    };
  } catch (error) {
    console.error('Error checking agent health:', error);
    return {
      status: 'unhealthy',
      orchestrator: false,
      sitterAgent: false,
      bookingAgent: false,
    };
  }
}

// ====================================
// Exports
// ====================================

export default {
  sendAgentMessage,
  getConversation,
  addMessageToConversation,
  getAllConversations,
  deleteConversation,
  clearAllConversations,
  formatAgentMessage,
  extractSitterIds,
  extractBookingIds,
  checkAgentHealth,
};
