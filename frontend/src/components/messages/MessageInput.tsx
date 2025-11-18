import React, { useState } from 'react';

interface MessageInputProps {
  onSend: (content: string) => void;
}

/**
 * MessageInput Component
 * Input field for composing and sending messages
 */
export default function MessageInput({ onSend }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    setSending(true);
    try {
      await onSend(trimmedContent);
      setContent(''); // Clear input after successful send
    } catch (err) {
      // Error handled by parent component
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter, but allow Shift+Enter for new lines
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="message-input">
      <form onSubmit={handleSubmit} className="message-input-form">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
          disabled={sending}
          rows={3}
          maxLength={1000}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={sending || !content.trim()}
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
