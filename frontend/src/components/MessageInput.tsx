import React, { useState } from 'react';
import '../styles/MessageInput.css';

/**
 * MessageInput Component (T140-T141)
 * Input field for sending messages with character count
 * Validates message length (max 1000 characters)
 */
interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
}

const MAX_CHARS = 1000;

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charCount = message.length;
  const isOverLimit = charCount > MAX_CHARS;
  const canSend = message.trim().length > 0 && !isOverLimit && !disabled && !isSending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSend) return;

    setIsSending(true);
    setError(null);

    try {
      await onSendMessage(message.trim());
      setMessage(''); // Clear input on success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message with Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (canSend) {
        handleSubmit(e as any);
      }
    }
  };

  return (
    <div className="message-input-container">
      {error && (
        <div className="message-input-error">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="message-input-form">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Ctrl+Enter to send)"
          className={`message-input ${isOverLimit ? 'input-error' : ''}`}
          rows={3}
          disabled={disabled || isSending}
        />
        
        {/* T140: Character count display */}
        <div className="message-input-footer">
          <div className={`char-count ${isOverLimit ? 'char-count-error' : ''}`}>
            {charCount} / {MAX_CHARS}
            {isOverLimit && <span className="char-count-warning"> (Too long!)</span>}
          </div>
          
          {/* T141: Send button */}
          <button
            type="submit"
            className="btn-send"
            disabled={!canSend}
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};
