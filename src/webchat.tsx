import React from 'react';

// Get theme-aware styles
const getThemeStyles = (isDark: boolean) => ({
  background: isDark ? '#1f2937' : '#ffffff',
  backgroundSecondary: isDark ? '#374151' : '#f9fafb',
  backgroundTertiary: isDark ? '#4b5563' : '#f3f4f6',
  text: isDark ? '#f9fafb' : '#111827',
  textSecondary: isDark ? '#d1d5db' : '#6b7280',
  textMuted: isDark ? '#9ca3af' : '#9ca3af',
  border: isDark ? '#4b5563' : '#e5e7eb',
  borderSecondary: isDark ? '#374151' : '#d1d5db',
  accent: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  gradient: isDark 
    ? 'linear-gradient(135deg, #374151 0%, #4b5563 100%)'
    : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
  cardShadow: isDark 
    ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
    : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
});

// =============================================================================
// AURION WEBCHAT COMPONENT
// =============================================================================

function AurionWebchat({ 
  apiEndpoint = 'http://localhost:8080',
  className = '',
  isDark = false
}) {
  const theme = getThemeStyles(isDark);
  const [messages, setMessages] = React.useState([
    {
      id: 1,
      text: "Hi, I'm Aurion!\nHow can I help?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [chatSessionId, setChatSessionId] = React.useState(null);
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${apiEndpoint}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          chat_session_id: chatSessionId,
          user_bubble: "User"
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      if (data.chat_session_id && !chatSessionId) {
        setChatSessionId(data.chat_session_id);
      }

      const aiMessage = {
        id: Date.now() + 1,
        text: data.reply,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting right now. Please try again.",
        isUser: false,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
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

  return (
    <div 
      className={className}
      style={{ 
        height: '500px', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: isDark ? '#111827' : '#1f2937',
        borderRadius: '8px',
        boxShadow: theme.cardShadow,
        border: `1px solid ${isDark ? '#374151' : '#4b5563'}`
      }}
    >
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(to right, #22d3ee, #0891b2)', 
        padding: '16px', 
        borderRadius: '8px 8px 0 0' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            backgroundColor: 'white', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <span style={{ color: '#0891b2', fontWeight: 'bold', fontSize: '14px' }}>A</span>
          </div>
          <div>
            <h3 style={{ color: 'white', fontWeight: 'bold', margin: '0', fontSize: '14px' }}>
              Aurion 3C Mascot
            </h3>
            <p style={{ color: '#a5f3fc', fontSize: '11px', fontWeight: 'bold', margin: '0' }}>
              {isLoading ? 'Typing...' : 'Online'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div style={{ 
        flex: '1', 
        overflowY: 'auto', 
        padding: '16px', 
        backgroundColor: isDark ? '#111827' : '#1f2937',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{ 
              display: 'flex', 
              justifyContent: message.isUser ? 'flex-end' : 'flex-start' 
            }}
          >
            <div style={{
              maxWidth: '75%',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              background: message.isUser
                ? 'linear-gradient(to right, #fbbf24, #f59e0b)'
                : message.isError
                ? '#ef4444'
                : 'linear-gradient(to right, #22d3ee, #0891b2)',
              color: message.isUser ? '#1f2937' : message.isError ? 'white' : '#1f2937',
              boxShadow: message.isUser 
                ? '0 0 16px rgba(251, 191, 36, 0.3)' 
                : '0 0 16px rgba(34, 211, 238, 0.3)'
            }}>
              <p style={{ 
                fontSize: '12px', 
                fontWeight: 'bold', 
                margin: '0 0 4px 0',
                whiteSpace: 'pre-line'
              }}>
                {message.text}
              </p>
              <p style={{ 
                fontSize: '10px', 
                opacity: '0.7', 
                margin: '0',
                fontWeight: 'bold'
              }}>
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              background: 'linear-gradient(to right, #22d3ee, #0891b2)',
              color: '#1f2937',
              padding: '12px 16px',
              borderRadius: '12px',
              boxShadow: '0 0 16px rgba(34, 211, 238, 0.3)'
            }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  backgroundColor: '#1f2937', 
                  borderRadius: '50%',
                  animation: 'bounce 1.4s ease-in-out infinite both'
                }} />
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  backgroundColor: '#1f2937', 
                  borderRadius: '50%',
                  animation: 'bounce 1.4s ease-in-out 0.16s infinite both'
                }} />
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  backgroundColor: '#1f2937', 
                  borderRadius: '50%',
                  animation: 'bounce 1.4s ease-in-out 0.32s infinite both'
                }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div style={{ 
        padding: '16px', 
        borderTop: `1px solid ${isDark ? '#374151' : '#4b5563'}`, 
        backgroundColor: isDark ? '#111827' : '#1f2937',
        borderRadius: '0 0 8px 8px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            style={{
              flex: '1',
              backgroundColor: isDark ? '#374151' : '#4b5563',
              color: isDark ? '#f9fafb' : '#e5e7eb',
              border: `1px solid ${isDark ? '#4b5563' : '#6b7280'}`,
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 'bold',
              outline: 'none'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
            style={{
              background: 'linear-gradient(to right, #22d3ee, #0891b2)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: isLoading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              opacity: isLoading || !inputMessage.trim() ? 0.6 : 1,
              transition: 'all 0.2s'
            }}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// CHAT MANAGER PUBLIC COMPONENT - COMPLETE WITH ALL TABS
// =============================================================================

function ChatManagerPublic({ isDark = false }: { isDark?: boolean }) {
  const theme = getThemeStyles(isDark);
  const [activeTab, setActiveTab] = React.useState('chat');
  const [emailConfig, setEmailConfig] = React.useState({
    mainEmail: '3c.innertherapy@gmail.com',
    supportEmail: '3c-helpline@post.com',
    notificationsEnabled: true,
    autoReply: false
  });
  const [aiConfig, setAiConfig] = React.useState({
    primaryAI: 'Jan AI',
    backupAI: 'OpenAI GPT-4',
    claudeEnabled: true,
    apiEndpoint: 'http://localhost:8080'
  });
  const [notifications, setNotifications] = React.useState([
    { id: 1, type: 'new_message', message: 'New chat from visitor on website', time: '2 min ago', unread: true },
    { id: 2, type: 'email', message: 'Support email received', time: '15 min ago', unread: true },
    { id: 3, type: 'system', message: 'AI backup switched to OpenAI', time: '1 hour ago', unread: false }
  ]);

  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: theme.backgroundSecondary,
      minHeight: '100vh'
    }}>
      
      <div style={{ 
        display: 'flex', 
        gap: '0', 
        marginTop: '20px', 
        marginBottom: '30px',
        borderBottom: `2px solid ${theme.border}`,
        backgroundColor: theme.background,
        borderRadius: '8px 8px 0 0',
        boxShadow: theme.cardShadow
      }}>
        <button
          onClick={() => setActiveTab('chat')}
          style={{
            padding: '12px 20px',
            backgroundColor: activeTab === 'chat' ? theme.accent : 'transparent',
            color: activeTab === 'chat' ? 'white' : theme.textSecondary,
            border: 'none',
            borderBottom: activeTab === 'chat' ? `3px solid ${theme.accent}` : '3px solid transparent',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: activeTab === 'chat' ? 'bold' : 'normal'
          }}
        >
          💬 Live Chat
        </button>
        <button
          onClick={() => setActiveTab('email')}
          style={{
            padding: '12px 20px',
            backgroundColor: activeTab === 'email' ? theme.accent : 'transparent',
            color: activeTab === 'email' ? 'white' : theme.textSecondary,
            border: 'none',
            borderBottom: activeTab === 'email' ? `3px solid ${theme.accent}` : '3px solid transparent',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: activeTab === 'email' ? 'bold' : 'normal'
          }}
        >
          📧 Email Config
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          style={{
            padding: '12px 20px',
            backgroundColor: activeTab === 'ai' ? theme.accent : 'transparent',
            color: activeTab === 'ai' ? 'white' : theme.textSecondary,
            border: 'none',
            borderBottom: activeTab === 'ai' ? `3px solid ${theme.accent}` : '3px solid transparent',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: activeTab === 'ai' ? 'bold' : 'normal'
          }}
        >
          🤖 AI Setup
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          style={{
            padding: '12px 20px',
            backgroundColor: activeTab === 'notifications' ? theme.accent : 'transparent',
            color: activeTab === 'notifications' ? 'white' : theme.textSecondary,
            border: 'none',
            borderBottom: activeTab === 'notifications' ? `3px solid ${theme.accent}` : '3px solid transparent',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: activeTab === 'notifications' ? 'bold' : 'normal'
          }}
        >
          🔔 Notifications
        </button>
      </div>

      {/* Live Chat Tab */}
      {activeTab === 'chat' && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 400px', 
          gap: '30px',
          backgroundColor: theme.background,
          padding: '20px',
          borderRadius: '0 0 8px 8px',
          boxShadow: theme.cardShadow
        }}>
          <div>
            <h3 style={{ 
              marginBottom: '20px', 
              fontSize: '16px',
              color: theme.text,
              fontWeight: 'bold'
            }}>
              💬 Aurion Chat Interface
            </h3>
            <p style={{ 
              color: theme.textSecondary, 
              marginBottom: '20px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              This is your integrated Aurion webchat system for customer support
            </p>
            <div style={{ 
              padding: '20px', 
              backgroundColor: theme.backgroundSecondary, 
              borderRadius: '8px',
              marginBottom: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <h4 style={{ 
                fontWeight: 'bold', 
                marginBottom: '8px', 
                fontSize: '14px', 
                margin: '0 0 8px 0',
                color: theme.text
              }}>
                📊 Chat Statistics
              </h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '15px' 
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold', 
                    color: theme.accent 
                  }}>
                    12
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: theme.textSecondary,
                    fontWeight: 'bold'
                  }}>
                    Active Chats
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold', 
                    color: theme.success 
                  }}>
                    89%
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: theme.textSecondary,
                    fontWeight: 'bold'
                  }}>
                    Resolution Rate
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold', 
                    color: theme.warning 
                  }}>
                    3.2m
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: theme.textSecondary,
                    fontWeight: 'bold'
                  }}>
                    Avg Response
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <AurionWebchat 
              apiEndpoint={aiConfig.apiEndpoint}
              className="w-full"
              isDark={isDark}
            />
          </div>
        </div>
      )}

      {/* Email Configuration Tab */}
      {activeTab === 'email' && (
        <div style={{ 
          display: 'grid', 
          gap: '30px',
          backgroundColor: theme.background,
          padding: '20px',
          borderRadius: '0 0 8px 8px',
          boxShadow: theme.cardShadow
        }}>
          <div style={{ 
            padding: '25px', 
            border: `2px solid ${theme.accent}`, 
            borderRadius: '12px', 
            background: theme.gradient
          }}>
            <h3 style={{ 
              color: theme.accent, 
              marginBottom: '20px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              📧 Email Configuration
            </h3>
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 'bold', 
                    color: theme.text,
                    fontSize: '12px'
                  }}>
                    Main Email
                  </label>
                  <input
                    type="email"
                    value={emailConfig.mainEmail}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, mainEmail: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${theme.borderSecondary}`,
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: theme.background,
                      color: theme.text
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 'bold', 
                    color: theme.text,
                    fontSize: '12px'
                  }}>
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={emailConfig.supportEmail}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, supportEmail: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${theme.borderSecondary}`,
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: theme.background,
                      color: theme.text
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px' 
                }}>
                  <input
                    type="checkbox"
                    checked={emailConfig.notificationsEnabled}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, notificationsEnabled: e.target.checked }))}
                  />
                  <span style={{ 
                    color: theme.text, 
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}>
                    Enable Email Notifications
                  </span>
                </label>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px' 
                }}>
                  <input
                    type="checkbox"
                    checked={emailConfig.autoReply}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, autoReply: e.target.checked }))}
                  />
                  <span style={{ 
                    color: theme.text, 
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}>
                    Auto Reply
                  </span>
                </label>
              </div>
            </div>
          </div>
          <div style={{ 
            padding: '20px', 
            backgroundColor: theme.backgroundSecondary, 
            borderRadius: '8px',
            border: `1px solid ${theme.border}`
          }}>
            <h4 style={{ 
              margin: '0 0 15px 0',
              color: theme.text,
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              📄 Email Templates
            </h4>
            <p style={{ 
              color: theme.textSecondary, 
              fontSize: '12px', 
              marginBottom: '15px',
              fontWeight: 'bold',
              margin: '0 0 15px 0'
            }}>
              Quick templates for common responses
            </p>
            <div style={{ display: 'grid', gap: '10px' }}>
              <button style={{ 
                padding: '10px 15px', 
                backgroundColor: theme.background, 
                border: `1px solid ${theme.border}`, 
                borderRadius: '6px',
                textAlign: 'left',
                cursor: 'pointer',
                color: theme.text,
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                📩 Welcome Message
              </button>
              <button style={{ 
                padding: '10px 15px', 
                backgroundColor: theme.background, 
                border: `1px solid ${theme.border}`, 
                borderRadius: '6px',
                textAlign: 'left',
                cursor: 'pointer',
                color: theme.text,
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                🔧 Technical Support
              </button>
              <button style={{ 
                padding: '10px 15px', 
                backgroundColor: theme.background, 
                border: `1px solid ${theme.border}`, 
                borderRadius: '6px',
                textAlign: 'left',
                cursor: 'pointer',
                color: theme.text,
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                💼 Business Inquiry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Setup Tab */}
      {activeTab === 'ai' && (
        <div style={{ 
          display: 'grid', 
          gap: '30px',
          backgroundColor: theme.background,
          padding: '20px',
          borderRadius: '0 0 8px 8px',
          boxShadow: theme.cardShadow
        }}>
          <div style={{ 
            padding: '25px', 
            border: `2px solid ${theme.success}`, 
            borderRadius: '12px', 
            background: isDark 
              ? 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'
              : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
          }}>
            <h3 style={{ 
              color: theme.success, 
              marginBottom: '20px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              🤖 AI Assistant Configuration
            </h3>
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 'bold', 
                    color: theme.text,
                    fontSize: '12px'
                  }}>
                    Primary AI
                  </label>
                  <select
                    value={aiConfig.primaryAI}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, primaryAI: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${theme.borderSecondary}`,
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: theme.background,
                      color: theme.text
                    }}
                  >
                    <option value="Jan AI">Jan AI (GitHub)</option>
                    <option value="Claude">Claude</option>
                    <option value="OpenAI GPT-4">OpenAI GPT-4</option>
                  </select>
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 'bold', 
                    color: theme.text,
                    fontSize: '12px'
                  }}>
                    Backup AI
                  </label>
                  <select
                    value={aiConfig.backupAI}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, backupAI: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${theme.borderSecondary}`,
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: theme.background,
                      color: theme.text
                    }}
                  >
                    <option value="OpenAI GPT-4">OpenAI GPT-4</option>
                    <option value="Claude">Claude</option>
                    <option value="Jan AI">Jan AI (GitHub)</option>
                  </select>
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 'bold', 
                    color: theme.text,
                    fontSize: '12px'
                  }}>
                    API Endpoint
                  </label>
                  <input
                    type="text"
                    value={aiConfig.apiEndpoint}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, apiEndpoint: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${theme.borderSecondary}`,
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: theme.background,
                      color: theme.text
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px' 
                }}>
                  <input
                    type="checkbox"
                    checked={aiConfig.claudeEnabled}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, claudeEnabled: e.target.checked }))}
                  />
                  <span style={{ 
                    color: theme.text, 
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}>
                    Enable Claude Integration
                  </span>
                </label>
              </div>
            </div>
          </div>
          <div style={{ 
            padding: '20px', 
            backgroundColor: theme.backgroundSecondary, 
            borderRadius: '8px',
            border: `1px solid ${theme.border}`
          }}>
            <h4 style={{ 
              margin: '0 0 15px 0',
              color: theme.text,
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              🔧 AI Status
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              <div style={{ 
                padding: '15px', 
                backgroundColor: theme.background, 
                borderRadius: '8px',
                textAlign: 'center',
                border: `1px solid ${theme.border}`
              }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: theme.success, 
                  borderRadius: '50%', 
                  margin: '0 auto 8px' 
                }} />
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  color: theme.text
                }}>
                  Jan AI
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  color: theme.textSecondary,
                  fontWeight: 'bold'
                }}>
                  Connected
                </div>
              </div>
              <div style={{ 
                padding: '15px', 
                backgroundColor: theme.background, 
                borderRadius: '8px',
                textAlign: 'center',
                border: `1px solid ${theme.border}`
              }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: theme.warning, 
                  borderRadius: '50%', 
                  margin: '0 auto 8px' 
                }} />
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  color: theme.text
                }}>
                  OpenAI
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  color: theme.textSecondary,
                  fontWeight: 'bold'
                }}>
                  Standby
                </div>
              </div>
              <div style={{ 
                padding: '15px', 
                backgroundColor: theme.background, 
                borderRadius: '8px',
                textAlign: 'center',
                border: `1px solid ${theme.border}`
              }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: theme.success, 
                  borderRadius: '50%', 
                  margin: '0 auto 8px' 
                }} />
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  color: theme.text
                }}>
                  Claude
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  color: theme.textSecondary,
                  fontWeight: 'bold'
                }}>
                  Available
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div style={{ 
          display: 'grid', 
          gap: '30px',
          backgroundColor: theme.background,
          padding: '20px',
          borderRadius: '0 0 8px 8px',
          boxShadow: theme.cardShadow
        }}>
          <div style={{ 
            padding: '25px', 
            border: `2px solid ${theme.warning}`, 
            borderRadius: '12px', 
            background: isDark
              ? 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'
              : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
          }}>
            <h3 style={{ 
              color: theme.warning, 
              marginBottom: '20px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              🔔 Notification Center
            </h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  style={{ 
                    padding: '15px', 
                    backgroundColor: notification.unread ? theme.background : theme.backgroundSecondary, 
                    borderRadius: '8px',
                    borderLeft: `4px solid ${notification.type === 'new_message' ? theme.accent : notification.type === 'email' ? theme.success : theme.textSecondary}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: `1px solid ${theme.border}`
                  }}
                >
                  <div>
                    <div style={{ 
                      fontWeight: notification.unread ? 'bold' : 'normal',
                      marginBottom: '4px',
                      color: theme.text,
                      fontSize: '12px'
                    }}>
                      {notification.message}
                    </div>
                    <div style={{ 
                      fontSize: '11px', 
                      color: theme.textSecondary,
                      fontWeight: 'bold'
                    }}>
                      {notification.time}
                    </div>
                  </div>
                  {notification.unread && (
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      backgroundColor: theme.accent, 
                      borderRadius: '50%' 
                    }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export the complete ChatManagerPublic as the main component
export default ChatManagerPublic;
