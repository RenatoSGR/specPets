import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MessageThread from '../components/messages/MessageThread';
import MessageInput from '../components/messages/MessageInput';
import ConversationList from '../components/messages/ConversationList';
import { sendMessage, type Message } from '../data/messageService';
import './MessagesPage.css';

const DEMO_OWNER_ID: number = 1;

/**
 * MessagesPage Component
 * Main messaging interface with conversation list and active thread
 */
export default function MessagesPage() {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedSitterId, setSelectedSitterId] = useState<string | null>(
    searchParams.get('sitterId')
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Implement proper message loading by owner ID
      const data: Message[] = []; // await getOwnerMessages(DEMO_OWNER_ID);
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedSitterId) return;

    try {
      const newMessage = await sendMessage({
        senderId: DEMO_OWNER_ID,
        content,
        bookingId: 0 // TODO: Associate with actual booking
      });

      // Add new message to list
      setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      alert(`Failed to send message: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Group messages by conversation (sitter)
  const conversations = messages.reduce((acc, msg) => {
    // TODO: Properly determine sitter ID from conversation context
    const sitterId = Number(msg.senderId) === DEMO_OWNER_ID ? 0 : msg.senderId;
    if (!acc[sitterId]) {
      acc[sitterId] = [];
    }
    acc[sitterId].push(msg);
    return acc;
  }, {} as Record<string, Message[]>);

  // Get messages for selected conversation
  const selectedMessages = selectedSitterId ? conversations[selectedSitterId] || [] : [];

  if (loading) {
    return (
      <div className="messages-loading">
        <p>Loading messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="messages-error">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <div className="messages-container">
        <div className="messages-sidebar">
          <h2>Conversations</h2>
          <ConversationList
            conversations={conversations}
            selectedSitterId={selectedSitterId}
            onSelectConversation={setSelectedSitterId}
          />
        </div>

        <div className="messages-main">
          {selectedSitterId ? (
            <>
              <div className="messages-header">
                <h2>Conversation</h2>
              </div>
              <MessageThread messages={selectedMessages} currentUserId={DEMO_OWNER_ID} />
              <MessageInput onSend={handleSendMessage} />
            </>
          ) : (
            <div className="messages-empty">
              <p>Select a conversation to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
