import React from 'react';
import type { Message } from '../../data/messageService';

interface ConversationListProps {
  conversations: Record<string, Message[]>;
  selectedSitterId: string | null;
  onSelectConversation: (sitterId: string) => void;
}

/**
 * ConversationList Component
 * Sidebar list of all message conversations
 */
export default function ConversationList({
  conversations,
  selectedSitterId,
  onSelectConversation
}: ConversationListProps) {
  if (Object.keys(conversations).length === 0) {
    return (
      <div className="conversation-list-empty">
        <p>No conversations yet</p>
      </div>
    );
  }

  // Get conversation summary for each sitter
  const conversationSummaries = Object.entries(conversations).map(([sitterId, messages]) => {
    const sortedMessages = [...messages].sort(
      (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );
    const lastMessage = sortedMessages[0];
    // TODO: Implement proper unread count based on sender/receiver context
    const unreadCount = messages.filter(m => !m.isRead && m.senderType === 'Sitter').length;

    // Get sitter name from first message (simplified)
    const sitterName = lastMessage.senderType === 'Owner'
      ? `Sitter ${sitterId}`
      : `Sitter ${sitterId}`;
    
    return {
      sitterId,
      sitterName,
      lastMessage: lastMessage.content,
      lastTimestamp: lastMessage.sentAt,
      unreadCount
    };
  });

  // Sort by most recent message
  conversationSummaries.sort(
    (a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime()
  );

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="conversation-list">
      {conversationSummaries.map(({ sitterId, sitterName, lastMessage, lastTimestamp, unreadCount }) => (
        <div
          key={sitterId}
          className={`conversation-item ${selectedSitterId === sitterId ? 'active' : ''}`}
          onClick={() => onSelectConversation(sitterId)}
        >
          <div className="conversation-avatar">
            {sitterName.charAt(0).toUpperCase()}
          </div>
          <div className="conversation-content">
            <div className="conversation-header">
              <span className="conversation-name">{sitterName}</span>
              <span className="conversation-time">{formatTimestamp(lastTimestamp)}</span>
            </div>
            <div className="conversation-preview">
              <span className={unreadCount > 0 ? 'unread' : ''}>
                {lastMessage.length > 50 ? `${lastMessage.substring(0, 50)}...` : lastMessage}
              </span>
              {unreadCount > 0 && (
                <span className="unread-badge">{unreadCount}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
