import React from 'react';
import type { Message } from '../../data/messageService';

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string | number;
}

/**
 * MessageThread Component
 * Displays list of messages in a conversation thread
 */
export default function MessageThread({ messages, currentUserId }: MessageThreadProps) {
  if (messages.length === 0) {
    return (
      <div className="message-thread-empty">
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Sort messages by timestamp
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
  );

  return (
    <div className="message-thread">
      {sortedMessages.map((message) => {
        const isCurrentUser = String(message.senderId) === String(currentUserId);
        const messageClass = isCurrentUser ? 'message-sent' : 'message-received';

        return (
          <div key={message.id} className={`message-bubble ${messageClass}`}>
            <div className="message-content">{message.content}</div>
            <div className="message-meta">
              <span className="message-timestamp">
                {formatTimestamp(message.sentAt)}
              </span>
              {message.isRead && isCurrentUser && (
                <span className="message-read-indicator">✓✓</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
