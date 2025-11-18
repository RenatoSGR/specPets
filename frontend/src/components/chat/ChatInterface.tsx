import React, { useState, useEffect, useRef } from 'react';
import {
  sendAgentMessage,
  getConversation,
  addMessageToConversation,
  formatAgentMessage,
  extractSitterIds,
  extractBookingIds,
  type AgentMessage,
  type AgentConversation,
} from '../../data/agentService';
import './ChatInterface.css';

interface ChatInterfaceProps {
  conversationId?: string;
  initialMessage?: string;
  onSitterClick?: (sitterId: number) => void;
  onBookingClick?: (bookingId: number) => void;
  userId?: number;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversationId,
  initialMessage,
  onSitterClick,
  onBookingClick,
  userId,
}) => {
  const [conversation, setConversation] = useState<AgentConversation | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load conversation on mount
  useEffect(() => {
    const conv = getConversation(conversationId);
    setConversation(conv);

    // Send initial message if provided
    if (initialMessage && conv.messages.length === 0) {
      handleSendMessage(initialMessage);
    }
  }, [conversationId, initialMessage]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage.trim();
    if (!messageToSend || !conversation) return;

    setError(null);
    setInputMessage('');
    setIsLoading(true);

    // Add user message to conversation
    const userMessage: AgentMessage = {
      role: 'user',
      content: messageToSend,
      timestamp: new Date(),
    };

    const updatedConv = addMessageToConversation(conversation.id, userMessage);
    setConversation({ ...updatedConv });

    try {
      // Send to agent
      const response = await sendAgentMessage({
        message: messageToSend,
        user_id: userId,
        context: {},
      });

      // Add assistant message to conversation
      const assistantMessage: AgentMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
      };

      const finalConv = addMessageToConversation(conversation.id, assistantMessage);
      setConversation({ ...finalConv });
    } catch (err) {
      setError('Failed to get response from agent. Please try again.');
      console.error('Agent error:', err);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEntityClick = (type: 'sitter' | 'booking', id: number) => {
    if (type === 'sitter' && onSitterClick) {
      onSitterClick(id);
    } else if (type === 'booking' && onBookingClick) {
      onBookingClick(id);
    }
  };

  const renderMessage = (message: AgentMessage) => {
    const isUser = message.role === 'user';
    const formattedContent = formatAgentMessage(message.content);
    
    // Extract clickable entities
    const sitterIds = extractSitterIds(message.content);
    const bookingIds = extractBookingIds(message.content);

    return (
      <div
        key={message.timestamp.toISOString()}
        className={`chat-message ${isUser ? 'user-message' : 'assistant-message'}`}
      >
        <div className="message-header">
          <span className="message-sender">
            {isUser ? '👤 You' : '🤖 Octopets Assistant'}
          </span>
          <span className="message-time">
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <div
          className="message-content"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />
        
        {/* Clickable entity chips */}
        {!isUser && (sitterIds.length > 0 || bookingIds.length > 0) && (
          <div className="message-entities">
            {sitterIds.map((id) => (
              <button
                key={`sitter-${id}`}
                className="entity-chip sitter-chip"
                onClick={() => handleEntityClick('sitter', id)}
              >
                View Sitter #{id} →
              </button>
            ))}
            {bookingIds.map((id) => (
              <button
                key={`booking-${id}`}
                className="entity-chip booking-chip"
                onClick={() => handleEntityClick('booking', id)}
              >
                View Booking #{id} →
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const suggestedQueries = [
    'Find dog sitters near me',
    'Show my bookings',
    'How much for overnight care?',
    'What can you help with?',
  ];

  const handleSuggestedQuery = (query: string) => {
    setInputMessage(query);
    inputRef.current?.focus();
  };

  if (!conversation) {
    return <div className="chat-loading">Loading conversation...</div>;
  }

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="chat-title">
          <span className="chat-icon">🐾</span>
          <h3>Octopets AI Assistant</h3>
        </div>
        <div className="chat-status">
          <span className="status-indicator online"></span>
          <span className="status-text">Online</span>
        </div>
      </div>

      <div className="chat-messages">
        {conversation.messages.length === 0 && (
          <div className="chat-welcome">
            <div className="welcome-icon">🤖</div>
            <h4>Welcome to Octopets!</h4>
            <p>I can help you find pet sitters and manage your bookings.</p>
            <div className="suggested-queries">
              <p className="suggested-label">Try asking:</p>
              {suggestedQueries.map((query) => (
                <button
                  key={query}
                  className="suggested-query-btn"
                  onClick={() => handleSuggestedQuery(query)}
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        {conversation.messages.map((message) => renderMessage(message))}

        {isLoading && (
          <div className="chat-message assistant-message loading">
            <div className="message-header">
              <span className="message-sender">🤖 Octopets Assistant</span>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="chat-error">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          placeholder="Ask me anything about pet sitting..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <button
          className="chat-send-btn"
          onClick={() => handleSendMessage()}
          disabled={!inputMessage.trim() || isLoading}
        >
          <span className="send-icon">📤</span>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
