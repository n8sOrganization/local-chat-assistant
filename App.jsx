import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Settings, Trash2, Plus, History } from 'lucide-react';

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [settings, setSettings] = useState({
    apiUrl: 'http://127.0.0.1:11434',
    model: 'llama3.2:latest',
    temperature: 0.1,
    maxTokens: 2000,
    contextLength: 20
  });
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-focus textarea on mount
  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation context - only include user/bot messages, get recent pairs
      const contextMessages = updatedMessages
        .filter(msg => msg.type === 'user' || msg.type === 'bot')
        .slice(-(settings.contextLength * 2));
      
      // Create conversation history string
      const conversationHistory = contextMessages.length > 0 && settings.contextLength > 0
        ? contextMessages.map(msg => `${msg.type === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`).join('\n\n') + '\n\n'
        : '';

      const fullPrompt = `${conversationHistory}Human: ${currentInput}\n\nAssistant:`;

      const response = await fetch(`${settings.apiUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: settings.model.trim(),
          prompt: fullPrompt,
          stream: false,
          options: {
            temperature: settings.temperature,
            num_predict: settings.maxTokens
          }
        })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const botMessage = {
        type: 'bot',
        content: data.response || 'Sorry, I couldn\'t generate a response.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setTimeout(() => textareaRef.current?.focus(), 100);
    } catch (error) {
      console.error('Error calling Llama API:', error);
      setMessages(prev => [...prev, {
        type: 'error',
        content: `Error: ${error.message}. Make sure your Ollama server is running on ${settings.apiUrl}`,
        timestamp: new Date()
      }]);
      setTimeout(() => textareaRef.current?.focus(), 100);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const newChat = () => {
    const conversationMessages = messages.filter(msg => msg.type === 'user' || msg.type === 'bot');
    if (conversationMessages.length > 0) {
      setChatHistory(prev => [{
        id: Date.now(),
        messages: [...messages],
        timestamp: new Date(),
        title: generateChatTitle(conversationMessages)
      }, ...prev.slice(0, 4)]);
    }
    setMessages([]);
    setInput('');
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const loadChatSession = (session) => {
    setMessages(session.messages);
    setShowChatHistory(false);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const generateChatTitle = (msgs) => {
    const firstUserMessage = msgs.find(msg => msg.type === 'user');
    if (firstUserMessage) {
      const title = firstUserMessage.content.slice(0, 50);
      return title.length === 50 ? title + '...' : title;
    }
    return `Chat ${new Date().toLocaleTimeString()}`;
  };

  const handleSettingsSubmit = () => {
    setShowSettings(false);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  // Styles
  const styles = {
    chatContainer: {
      height: '100vh',
      backgroundColor: '#f9fafb',
      display: 'flex',
      flexDirection: 'column'
    },
    header: {
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '1rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    logoContainer: {
      width: '32px',
      height: '32px',
      backgroundColor: '#4f46e5',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    iconButton: {
      padding: '0.5rem',
      color: '#6b7280',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    iconButtonHover: {
      color: '#374151',
      backgroundColor: '#f3f4f6'
    },
    newChatButton: {
      padding: '0.5rem 0.75rem',
      color: '#4f46e5',
      backgroundColor: '#f0f4ff',
      border: '1px solid #e0e7ff',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    settingsPanel: {
      backgroundColor: '#fef3cd',
      borderBottom: '1px solid #fcd34d',
      padding: '1rem',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem'
    },
    settingsSubmitContainer: {
      gridColumn: '1 / -1',
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '0.5rem'
    },
    settingsSubmitButton: {
      backgroundColor: '#4f46e5',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '8px',
      border: 'none',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    input: {
      width: '100%',
      padding: '0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '0.875rem',
      outline: 'none',
      boxSizing: 'border-box'
    },
    messagesContainer: {
      flex: 1,
      overflowY: 'auto',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    messageRow: {
      display: 'flex'
    },
    messageRowUser: {
      justifyContent: 'flex-end'
    },
    messageRowBot: {
      justifyContent: 'flex-start'
    },
    messageBubble: {
      maxWidth: '768px',
      borderRadius: '12px',
      padding: '1rem'
    },
    messageBubbleUser: {
      backgroundColor: '#4f46e5',
      color: 'white'
    },
    messageBubbleBot: {
      backgroundColor: 'white',
      color: '#111827',
      border: '1px solid #e5e7eb'
    },
    messageBubbleError: {
      backgroundColor: '#fef2f2',
      color: '#991b1b',
      border: '1px solid #fecaca'
    },
    messageBubbleSystem: {
      backgroundColor: '#f0fdf4',
      color: '#166534',
      border: '1px solid #bbf7d0'
    },
    inputContainer: {
      backgroundColor: 'white',
      borderTop: '1px solid #e5e7eb',
      padding: '1rem'
    },
    inputRow: {
      display: 'flex',
      gap: '1rem'
    },
    textarea: {
      flex: 1,
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      resize: 'none',
      outline: 'none',
      fontFamily: 'inherit'
    },
    sendButton: {
      backgroundColor: '#4f46e5',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'background-color 0.2s'
    },
    sendButtonDisabled: {
      backgroundColor: '#d1d5db',
      cursor: 'not-allowed'
    },
    loadingDot: {
      width: '8px',
      height: '8px',
      backgroundColor: '#9ca3af',
      borderRadius: '50%',
      animation: 'bounce 1.4s ease-in-out infinite both'
    },
    chatHistoryInfo: {
      fontSize: '0.75rem',
      color: '#6b7280',
      marginTop: '0.25rem'
    },
    chatHistoryPanel: {
      backgroundColor: '#f0f9ff',
      borderBottom: '1px solid #bae6fd',
      padding: '1rem'
    },
    chatHistoryTitle: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#0c4a6e',
      marginBottom: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    chatHistoryList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    chatHistoryItem: {
      backgroundColor: 'white',
      border: '1px solid #e0f2fe',
      borderRadius: '8px',
      padding: '0.75rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    chatHistoryItemHover: {
      backgroundColor: '#f0f9ff',
      borderColor: '#0284c7'
    },
    chatHistoryItemTitle: {
      fontSize: '0.875rem',
      color: '#0c4a6e',
      fontWeight: '500',
      marginBottom: '0.25rem'
    },
    chatHistoryItemDate: {
      fontSize: '0.75rem',
      color: '#64748b'
    },
    chatHistoryClose: {
      backgroundColor: '#0284c7',
      color: 'white',
      padding: '0.5rem 0.75rem',
      borderRadius: '6px',
      border: 'none',
      fontSize: '0.75rem',
      fontWeight: '500',
      cursor: 'pointer',
      marginTop: '0.75rem'
    }
  };

  // Add CSS animation for loading dots
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }
      .loading-dot-1 { animation-delay: -0.32s; }
      .loading-dot-2 { animation-delay: -0.16s; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div style={styles.chatContainer}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoContainer}>
            <Bot size={16} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: 0 }}>
              Local Chat
            </h1>
            <div style={styles.chatHistoryInfo}>
              Model: {settings.model} | Context: {settings.contextLength === 0 ? 'Disabled' : `${settings.contextLength} pairs`}
              {chatHistory.length > 0 && ` | ${chatHistory.length} saved chat${chatHistory.length > 1 ? 's' : ''}`}
            </div>
          </div>
        </div>
        
        <div style={styles.headerRight}>
          <button onClick={newChat} style={styles.newChatButton}>
            <Plus size={16} />
            <span>New Chat</span>
          </button>
          {chatHistory.length > 0 && (
            <button 
              onClick={() => setShowChatHistory(!showChatHistory)} 
              style={{
                ...styles.iconButton,
                color: showChatHistory ? '#4f46e5' : '#6b7280',
                backgroundColor: showChatHistory ? '#f0f4ff' : 'transparent'
              }}
            >
              <History size={20} />
            </button>
          )}
          <button onClick={() => setShowSettings(!showSettings)} style={styles.iconButton}>
            <Settings size={20} />
          </button>
          <button onClick={clearChat} style={styles.iconButton}>
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Chat History Panel */}
      {showChatHistory && chatHistory.length > 0 && (
        <div style={styles.chatHistoryPanel}>
          <div style={styles.chatHistoryTitle}>
            <History size={16} />
            Recent Conversations (Last 5)
          </div>
          <div style={styles.chatHistoryList}>
            {chatHistory.map((session, index) => (
              <div
                key={session.id}
                style={styles.chatHistoryItem}
                onClick={() => loadChatSession(session)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = styles.chatHistoryItemHover.backgroundColor;
                  e.target.style.borderColor = styles.chatHistoryItemHover.borderColor;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = styles.chatHistoryItem.backgroundColor;
                  e.target.style.borderColor = styles.chatHistoryItem.borderColor;
                }}
              >
                <div>
                  <div style={styles.chatHistoryItemTitle}>
                    {session.title}
                  </div>
                  <div style={styles.chatHistoryItemDate}>
                    {session.timestamp.toLocaleDateString()} at {session.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {session.messages.filter(m => m.type === 'user' || m.type === 'bot').length} messages
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setShowChatHistory(false)} 
            style={styles.chatHistoryClose}
          >
            Close History
          </button>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div style={styles.settingsPanel}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
              API URL
            </label>
            <input
              value={settings.apiUrl}
              onChange={(e) => setSettings(prev => ({...prev, apiUrl: e.target.value}))}
              style={styles.input}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
              Model
            </label>
            <input
              value={settings.model}
              onChange={(e) => setSettings(prev => ({...prev, model: e.target.value}))}
              style={styles.input}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
              Temperature
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={settings.temperature}
              onChange={(e) => setSettings(prev => ({...prev, temperature: parseFloat(e.target.value)}))}
              style={styles.input}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
              Max Tokens
            </label>
            <input
              type="number"
              min="100"
              max="4000"
              value={settings.maxTokens}
              onChange={(e) => setSettings(prev => ({...prev, maxTokens: parseInt(e.target.value)}))}
              style={styles.input}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
              Context Length
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={settings.contextLength}
              onChange={(e) => setSettings(prev => ({...prev, contextLength: parseInt(e.target.value)}))}
              style={styles.input}
            />
          </div>
          <div style={styles.settingsSubmitContainer}>
            <button onClick={handleSettingsSubmit} style={styles.settingsSubmitButton}>
              Apply Settings
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={styles.messagesContainer}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#6b7280', marginTop: '2rem' }}>
            <Bot size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
            <p>Start a conversation with your local model!</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Make sure Ollama is running on {settings.apiUrl}
            </p>
            {chatHistory.length > 0 && (
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '1rem' }}>
                💾 You have {chatHistory.length} saved chat session{chatHistory.length > 1 ? 's' : ''} in memory
              </p>
            )}
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              ...styles.messageRow,
              ...(message.type === 'user' ? styles.messageRowUser : styles.messageRowBot)
            }}
          >
            <div
              style={{
                ...styles.messageBubble,
                ...(message.type === 'user' ? styles.messageBubbleUser :
                   message.type === 'error' ? styles.messageBubbleError :
                   message.type === 'system' ? styles.messageBubbleSystem :
                   styles.messageBubbleBot)
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                {message.type !== 'user' && (
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '0.25rem',
                    backgroundColor: message.type === 'error' ? '#fecaca' : 
                                   message.type === 'system' ? '#bbf7d0' : '#e0e7ff'
                  }}>
                    <Bot size={12} color={
                      message.type === 'error' ? '#dc2626' : 
                      message.type === 'system' ? '#059669' : '#4f46e5'
                    } />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ whiteSpace: 'pre-wrap', margin: '0 0 0.5rem' }}>{message.content}</p>
                  <p style={{
                    fontSize: '0.75rem',
                    margin: 0,
                    color: message.type === 'user' ? 'rgba(255,255,255,0.7)' : '#6b7280'
                  }}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div style={styles.messageRowBot}>
            <div style={{ ...styles.messageBubble, ...styles.messageBubbleBot }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bot size={16} color="#4f46e5" />
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <div style={{ ...styles.loadingDot }} className="loading-dot-1"></div>
                  <div style={{ ...styles.loadingDot }} className="loading-dot-2"></div>
                  <div style={{ ...styles.loadingDot }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={styles.inputContainer}>
        <div style={styles.inputRow}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask your local model anything..."
            style={styles.textarea}
            rows="2"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            style={{
              ...styles.sendButton,
              ...(!input.trim() || isLoading ? styles.sendButtonDisabled : {})
            }}
          >
            <Send size={16} />
            <span>Send</span>
          </button>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.5rem 0 0' }}>
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatApp;
