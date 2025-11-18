import React, { useEffect, useRef } from 'react';
import { Message } from '../data/messageService';
import '../styles/MessageThread.css';

/**
 * MessageThread Component (T136-T139)
 * Displays chronological list of messages with auto-scroll
 * Distinguishes between owner and sitter messages
 */
interface MessageThreadProps {
  messages: Message[];
  currentUserId: number;
  isLoading?: boolean;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  messages,
  currentUserId,
  isLoading = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // T139: Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatFullTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleString('en-US', options);
  };

  if (isLoading) {
    return (
      <div className="message-thread">
        <div className="messages-loading">
          <div className="spinner"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="message-thread">
        <div className="messages-empty">
          <span className="empty-icon">💬</span>
          <h3>No messages yet</h3>
          <p>Start the conversation by sending a message below</p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-thread">
      <div className="messages-list">
        {messages.map((message) => {
          const isOwnMessage = message.senderId === currentUserId;
          
          return (
            <div
              key={message.id}
              className={`message-bubble ${isOwnMessage ? 'message-own' : 'message-other'}`}
            >
              {/* T138: Sender identification */}
              {!isOwnMessage && (
                <div className="message-sender">
                  {message.senderRole || message.senderType}
                </div>
              )}
              
              {/* Message content */}
              <div className="message-content">
                {message.content}
              </div>
              
              {/* T137: Message timestamp */}
              <div className="message-meta">
                <span
                  className="message-time"
                  title={formatFullTimestamp(message.sentAt)}
                >
                  {formatTimestamp(message.sentAt)}
                </span>
                {!message.isRead && !isOwnMessage && (
                  <span className="unread-indicator">●</span>
                )}
              </div>
            </div>
          );
        })}
        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
