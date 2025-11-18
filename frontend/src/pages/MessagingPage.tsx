import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Booking, getBookingById } from '../data/bookingService';
import {
  Message,
  SendMessageRequest,
  getMessagesByBooking,
  sendMessage,
  markMessageAsRead,
  getUnreadMessageCount
} from '../data/messageService';
import '../styles/MessagingPage.css';

/**
 * MessagingPage Component (T136-T144)
 * In-app messaging interface for booking conversations
 * Supports real-time messaging, auto-scroll, read receipts, and unread indicators
 */
export const MessagingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // TODO: Replace with actual authenticated user context
  const currentUserId = 1;
  const userRole: 'owner' | 'sitter' = 'owner'; // Determine from auth

  useEffect(() => {
    if (id) {
      loadBookingAndMessages(parseInt(id));
    }
  }, [id]);

  // Auto-scroll to bottom when messages change (T140)
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when viewing (T143)
  useEffect(() => {
    markUnreadMessagesAsRead();
  }, [messages, currentUserId]);

  const loadBookingAndMessages = async (bookingId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const [bookingData, messagesData] = await Promise.all([
        getBookingById(bookingId),
        getMessagesByBooking(bookingId)
      ]);
      
      setBooking(bookingData);
      setMessages(messagesData);
      
      // Load unread count (T144)
      const countData = await getUnreadMessageCount(currentUserId);
      setUnreadCount(countData.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const markUnreadMessagesAsRead = async () => {
    const unreadMessages = messages.filter(
      m => !m.isRead && m.senderId !== currentUserId
    );
    
    for (const msg of unreadMessages) {
      try {
        await markMessageAsRead(msg.id);
        setMessages(prev => prev.map(m => 
          m.id === msg.id ? { ...m, isRead: true } : m
        ));
      } catch (err) {
        console.error('Failed to mark message as read:', err);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !booking) {
      return;
    }

    // T142: Validate message length (max 1000 chars)
    if (newMessage.length > 1000) {
      setError('Message cannot exceed 1000 characters');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const request: SendMessageRequest = {
        bookingId: booking.id,
        senderId: currentUserId,
        content: newMessage.trim()
      };

      const sentMessage = await sendMessage(request);
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  if (isLoading) {
    return (
      <div className="messaging-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="messaging-page">
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <h2>Unable to Load Conversation</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="btn-back">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  // Only allow messaging for accepted bookings (T155)
  if (booking.status !== 'Accepted') {
    return (
      <div className="messaging-page">
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <h2>Messaging Not Available</h2>
          <p>Messages can only be exchanged for confirmed bookings.</p>
          <p>Current booking status: {booking.status}</p>
          <button onClick={() => navigate(`/bookings/${booking.id}`)} className="btn-back">
            View Booking Details
          </button>
        </div>
      </div>
    );
  }

  const otherParty = userRole === 'owner' ? booking.sitter : booking.owner;
  const otherPartyName = `${otherParty?.firstName || ''} ${otherParty?.lastName || ''}`.trim();

  return (
    <div className="messaging-page">
      {/* Header (T137) */}
      <div className="messaging-header">
        <button onClick={() => navigate(`/bookings/${booking.id}`)} className="btn-back-arrow">
          ← Back to Booking
        </button>
        <div className="header-info">
          <div className="other-party-avatar">
            {otherPartyName[0] || '?'}
          </div>
          <div className="header-details">
            <h1>{otherPartyName}</h1>
            <p className="booking-ref">Booking #{booking.id} • {booking.petName || 'Pet'}</p>
          </div>
          {/* T144: Unread indicator */}
          {unreadCount > 0 && (
            <div className="unread-badge" title={`${unreadCount} unread messages`}>
              {unreadCount}
            </div>
          )}
        </div>
      </div>

      {/* Message Thread (T138-T141) */}
      <div className="message-thread">
        {messages.length === 0 ? (
          <div className="empty-thread">
            <span className="empty-icon">💬</span>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isOwnMessage = msg.senderId === currentUserId;
              const showTimestamp = index === 0 || 
                (new Date(msg.sentAt).getTime() - new Date(messages[index - 1].sentAt).getTime() > 300000); // 5 min

              return (
                <div key={msg.id}>
                  {showTimestamp && (
                    <div className="message-timestamp">
                      {new Date(msg.sentAt).toLocaleString()}
                    </div>
                  )}
                  <div className={`message-bubble ${isOwnMessage ? 'own-message' : 'other-message'}`}>
                    <div className="message-content">{msg.content}</div>
                    <div className="message-meta">
                      <span className="message-time">
                        {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isOwnMessage && (
                        <span className="message-status">
                          {msg.isRead ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Auto-scroll anchor (T140) */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input (T141-T142) */}
      <div className="message-input-container">
        {error && (
          <div className="input-error">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="message-input-form">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
            rows={2}
            maxLength={1000}
            disabled={isSending}
            className="message-input"
          />
          <div className="input-footer">
            <span className="char-count">
              {newMessage.length}/1000
            </span>
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className="btn-send"
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
