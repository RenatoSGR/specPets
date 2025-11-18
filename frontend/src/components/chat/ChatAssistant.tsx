import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatAssistant.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatAssistantProps {
  onClose?: () => void;
  isExpanded?: boolean;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ onClose, isExpanded = false }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your pet sitting assistant. I can help you find the perfect sitter for your pet. What kind of pet do you have?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const parseUserIntent = (message: string): { intent: string; params: any } => {
    const lowerMessage = message.toLowerCase();

    // Pet type detection
    const petTypes = ['dog', 'cat', 'bird', 'rabbit', 'reptile'];
    const detectedPetType = petTypes.find(type => lowerMessage.includes(type));

    // Service detection
    const services: { [key: string]: string } = {
      'overnight': 'overnight',
      'stay': 'overnight',
      'boarding': 'overnight',
      'daily visit': 'daily visit',
      'visit': 'daily visit',
      'drop in': 'daily visit',
      'walking': 'walking',
      'walk': 'walking',
      'medication': 'medication',
      'medicine': 'medication',
      'grooming': 'grooming',
      'groom': 'grooming',
      'bath': 'grooming'
    };
    const detectedService = Object.entries(services).find(([key]) => 
      lowerMessage.includes(key)
    )?.[1];

    // Price detection
    const priceMatch = lowerMessage.match(/\$?(\d+)/);
    const maxPrice = priceMatch ? parseInt(priceMatch[1]) : undefined;

    // Location detection
    const zipMatch = lowerMessage.match(/\b\d{5}\b/);
    const zipCode = zipMatch ? zipMatch[0] : undefined;

    // Skills detection
    const skills: { [key: string]: string } = {
      'first aid': 'first aid',
      'emergency': 'first aid',
      'medication': 'medication administration',
      'training': 'training',
      'train': 'training',
      'grooming': 'grooming',
      'senior': 'senior pet care',
      'elderly': 'senior pet care',
      'special needs': 'special needs',
      'disabled': 'special needs'
    };
    const detectedSkill = Object.entries(skills).find(([key]) => 
      lowerMessage.includes(key)
    )?.[1];

    // Rating detection
    const ratingMatch = lowerMessage.match(/(\d+)\s*star/i);
    const minRating = ratingMatch ? parseInt(ratingMatch[1]) : undefined;

    return {
      intent: detectedPetType || detectedService || maxPrice || zipCode || detectedSkill || minRating 
        ? 'search' 
        : 'general',
      params: {
        petType: detectedPetType,
        serviceType: detectedService,
        maxPrice,
        zipCode,
        skill: detectedSkill,
        minRating
      }
    };
  };

  const generateResponse = (intent: string, params: any): string => {
    const { petType, serviceType, maxPrice, zipCode, skill, minRating } = params;

    const suggestions: string[] = [];

    if (petType) {
      suggestions.push(`${petType}s`);
    }

    if (serviceType) {
      suggestions.push(`${serviceType} services`);
    }

    if (maxPrice) {
      suggestions.push(`under $${maxPrice}/hour`);
    }

    if (zipCode) {
      suggestions.push(`in ${zipCode}`);
    }

    if (skill) {
      suggestions.push(`with ${skill} skills`);
    }

    if (minRating) {
      suggestions.push(`rated ${minRating}+ stars`);
    }

    if (suggestions.length > 0) {
      return `I'll help you find sitters for ${suggestions.join(', ')}. Click "Search Now" to see available sitters!`;
    }

    // Handle common questions
    if (intent === 'general') {
      return "I can help you find pet sitters! Tell me about your pet (dog, cat, bird, etc.), the service you need (overnight, walking, etc.), or your budget, and I'll find great matches for you.";
    }

    return "I'm here to help you find the perfect pet sitter. What are you looking for?";
  };

  const buildSearchUrl = (params: any): string => {
    const searchParams = new URLSearchParams();

    if (params.petType) searchParams.set('petType', params.petType);
    if (params.serviceType) searchParams.set('serviceType', params.serviceType);
    if (params.maxPrice) searchParams.set('maxPrice', params.maxPrice.toString());
    if (params.zipCode) searchParams.set('zipCode', params.zipCode);
    if (params.skill) searchParams.set('skills', params.skill);
    if (params.minRating) searchParams.set('minRating', params.minRating.toString());

    return `/search?${searchParams.toString()}`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const { intent, params } = parseUserIntent(input);
    const response = generateResponse(intent, params);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);

    // Store search params for potential navigation
    if (intent === 'search') {
      const searchUrl = buildSearchUrl(params);
      const searchButton: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `[SEARCH_BUTTON]${searchUrl}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, searchButton]);
    }
  };

  const handleSearchNavigation = (url: string) => {
    navigate(url);
    if (onClose) onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`chat-assistant ${isExpanded ? 'expanded' : ''}`}>
      <div className="chat-header">
        <div className="chat-header-content">
          <div className="chat-avatar">🐾</div>
          <div className="chat-header-text">
            <h3>Pet Sitting Assistant</h3>
            <p className="chat-status">
              <span className="status-indicator"></span>
              Online
            </p>
          </div>
        </div>
        {onClose && (
          <button className="chat-close-btn" onClick={onClose} aria-label="Close chat">
            ✕
          </button>
        )}
      </div>

      <div className="chat-messages">
        {messages.map((message) => {
          if (message.content.startsWith('[SEARCH_BUTTON]')) {
            const url = message.content.replace('[SEARCH_BUTTON]', '');
            return (
              <div key={message.id} className="message-search-action">
                <button 
                  className="search-action-btn"
                  onClick={() => handleSearchNavigation(url)}
                >
                  🔍 Search Now
                </button>
              </div>
            );
          }

          return (
            <div key={message.id} className={`message ${message.role}`}>
              <div className="message-content">
                <p>{message.content}</p>
                <span className="message-time">{formatTime(message.timestamp)}</span>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="message assistant">
            <div className="message-content typing">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <input
            type="text"
            className="chat-input"
            placeholder="Ask me about pet sitters..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isTyping}
          />
          <button 
            className="chat-send-btn" 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            aria-label="Send message"
          >
            ➤
          </button>
        </div>
        <div className="chat-suggestions">
          <button 
            className="suggestion-chip"
            onClick={() => setInput("I need a dog sitter for overnight")}
          >
            Dog overnight care
          </button>
          <button 
            className="suggestion-chip"
            onClick={() => setInput("Cat sitter under $40")}
          >
            Affordable cat care
          </button>
          <button 
            className="suggestion-chip"
            onClick={() => setInput("Sitter with first aid training")}
          >
            First aid certified
          </button>
        </div>
      </div>
    </div>
  );
};
