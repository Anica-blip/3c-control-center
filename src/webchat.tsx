import React from 'react';

// =============================================================================
// AURION WEBCHAT COMPONENT - NO AUTO-SCROLL VERSION
// =============================================================================

function AurionWebchat({ 
  apiEndpoint = 'http://localhost:8080',
  className = '',
  isDarkMode = false
}) {
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

  // ✅ REMOVED: Auto-scroll behavior - Let user scroll manually
  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // };

  // ✅ REMOVED: Auto-scroll on new messages
  // React.useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

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

  const baseStyles = {
    container: {
      height: '500px',
      display: 'flex',
      flexDirection: 'column' as const,
      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
      border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: isDarkMode 
        ? '0 10px 25px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)' 
        : '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    },
    header: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      padding: '20px',
      color: '#ffffff'
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    avatar: {
      width: '40px',
      height: '40px',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#ffffff'
    },
    headerText: {
      flex: '1'
    },
    headerTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      margin: '0 0 4px 0',
      color: '#ffffff'
    },
    headerStatus: {
      fontSize: '12px',
      color: 'rgba(255, 255, 255, 0.8)',
      margin: '0'
    },
    messagesContainer: {
      flex: '1',
      overflowY: 'auto' as const,
      padding: '20px',
      backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px'
    },
    messageWrapper: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px'
    },
    userMessageWrapper: {
      alignItems: 'flex-end'
    },
    aiMessageWrapper: {
      alignItems: 'flex-start'
    },
    message: {
      maxWidth: '80%',
      padding: '12px 16px',
      borderRadius: '16px',
      fontSize: '14px',
      lineHeight: '1.5',
      wordWrap: 'break-word' as const
    },
    userMessage: {
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      borderBottomRightRadius: '4px',
      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
    },
    aiMessage: {
      backgroundColor: isDarkMode ? '#374151' : '#ffffff',
      color: isDarkMode ? '#f9fafb' : '#1f2937',
      borderBottomLeftRadius: '4px',
      border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
      boxShadow: isDarkMode 
        ? '0 2px 8px rgba(0, 0, 0, 0.2)' 
        : '0 2px 8px rgba(0, 0, 0, 0.05)'
    },
    errorMessage: {
      backgroundColor: '#ef4444',
      color: '#ffffff',
      borderBottomLeftRadius: '4px',
      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
    },
    timestamp: {
      fontSize: '11px',
      color: isDarkMode ? '#9ca3af' : '#6b7280',
      textAlign: 'right' as const,
      marginTop: '4px'
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'flex-start'
    },
    loadingMessage: {
      backgroundColor: isDarkMode ? '#374151' : '#ffffff',
      color: isDarkMode ? '#f9fafb' : '#1f2937',
      padding: '12px 16px',
      borderRadius: '16px',
      borderBottomLeftRadius: '4px',
      border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
      boxShadow: isDarkMode 
        ? '0 2px 8px rgba(0, 0, 0, 0.2)' 
        : '0 2px 8px rgba(0, 0, 0, 0.05)'
    },
    loadingDots: {
      display: 'flex',
      gap: '4px'
    },
    dot: {
      width: '8px',
      height: '8px',
      backgroundColor: isDarkMode ? '#9ca3af' : '#6b7280',
      borderRadius: '50%',
      animation: 'bounce 1.4s ease-in-out infinite both'
    },
    inputSection: {
      padding: '20px',
      borderTop: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff'
    },
    inputContainer: {
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-end'
    },
    input: {
      flex: '1',
      backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
      color: isDarkMode ? '#f9fafb' : '#1f2937',
      border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      outline: 'none',
      resize: 'none' as const,
      minHeight: '44px',
      maxHeight: '120px',
      transition: 'border-color 0.2s ease',
      fontFamily: 'inherit'
    },
    sendButton: {
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      padding: '12px 20px',
      borderRadius: '8px',
      border: 'none',
      cursor: isLoading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      opacity: isLoading || !inputMessage.trim() ? 0.6 : 1,
      transition: 'all 0.2s ease',
      minWidth: '80px',
      height: '44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  };

  // Add CSS keyframes for loading animation
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes bounce {
        0%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-6px); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div style={baseStyles.container} className={className}>
      {/* Header */}
      <div style={baseStyles.header}>
        <div style={baseStyles.headerContent}>
          <div style={baseStyles.avatar}>
            A
          </div>
          <div style={baseStyles.headerText}>
            <h3 style={baseStyles.headerTitle}>
              Aurion 3C Assistant
            </h3>
            <p style={baseStyles.headerStatus}>
              {isLoading ? 'Typing...' : 'Online'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container - NO AUTO-SCROLL */}
      <div style={baseStyles.messagesContainer}>
        {messages.map((message) => (
          <div 
            key={message.id} 
            style={{
              ...baseStyles.messageWrapper,
              ...(message.isUser ? baseStyles.userMessageWrapper : baseStyles.aiMessageWrapper)
            }}
          >
            <div 
              style={{
                ...baseStyles.message,
                ...(message.isUser 
                  ? baseStyles.userMessage 
                  : message.isError 
                    ? baseStyles.errorMessage 
                    : baseStyles.aiMessage)
              }}
            >
              <div style={{ whiteSpace: 'pre-line' }}>
                {message.text}
              </div>
            </div>
            <div style={{
              ...baseStyles.timestamp,
              textAlign: message.isUser ? 'right' : 'left'
            }}>
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div style={baseStyles.loadingContainer}>
            <div style={baseStyles.loadingMessage}>
              <div style={baseStyles.loadingDots}>
                <div style={{...baseStyles.dot, animationDelay: '0s'}} />
                <div style={{...baseStyles.dot, animationDelay: '0.16s'}} />
                <div style={{...baseStyles.dot, animationDelay: '0.32s'}} />
              </div>
            </div>
          </div>
        )}
        
        {/* ✅ KEPT: Reference for manual scrolling if needed later */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div style={baseStyles.inputSection}>
        <div style={baseStyles.inputContainer}>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            style={{
              ...baseStyles.input,
              borderColor: inputMessage.trim() ? '#3b82f6' : baseStyles.input.border
            }}
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
            style={{
              ...baseStyles.sendButton,
              backgroundColor: isLoading || !inputMessage.trim() ? '#9ca3af' : '#3b82f6'
            }}
            onMouseOver={(e) => {
              if (!isLoading && inputMessage.trim()) {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading && inputMessage.trim()) {
                e.currentTarget.style.backgroundColor = '#3b82f6';
              }
            }}
          >
            {isLoading ? '...' : '↑'}
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// CHAT MANAGER PUBLIC COMPONENT - SAME AS BEFORE
// =============================================================================

function ChatManagerPublic() {
  const [activeTab, setActiveTab] = React.useState('chat');
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  
  const [emailConfig, setEmailConfig] = React.useState({
    mainEmail: '3c.innertherapy@gmail.com',
    supportEmail: '3c-helpline@post.com',
    notificationsEnabled: true,
    autoReply: false
  });
  
  // Manual email list state
  const [manualEmails, setManualEmails] = React.useState([
    { id: 1, email: 'customer1@example.com', label: 'Customer Support' },
    { id: 2, email: 'sales@example.com', label: 'Sales Team' }
  ]);
  const [newEmail, setNewEmail] = React.useState('');
  const [newEmailLabel, setNewEmailLabel] = React.useState('');
  
  const [aiConfig, setAiConfig] = React.useState({
    primaryAI: 'Jan AI',
    backupAI: 'OpenAI GPT-4',
    claudeEnabled: true,
    apiEndpoint: 'http://localhost:8080'
  });
  
  const [notifications, setNotifications] = React.useState([
    { id: 1, type: 'webchat', message: 'New chat from visitor on website', time: '2 min ago', unread: true, source: 'Webchat Public' },
    { id: 2, type: 'email', message: 'Support email received from customer1@example.com', time: '15 min ago', unread: true, source: 'Email' },
    { id: 3, type: 'webchat', message: 'Chat session ended - customer feedback received', time: '1 hour ago', unread: false, source: 'Webchat Public' },
    { id: 4, type: 'email', message: 'New inquiry from sales@example.com', time: '2 hours ago', unread: false, source: 'Email' }
  ]);

  // Email management functions
  const handleAddEmail = () => {
    if (!newEmail.trim() || !newEmailLabel.trim()) {
      alert('Please fill in both email and label fields');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      alert('Please enter a valid email address');
      return;
    }
    
    const emailExists = manualEmails.some(e => e.email.toLowerCase() === newEmail.toLowerCase());
    if (emailExists) {
      alert('This email already exists in the list');
      return;
    }
    
    const newEmailObj = {
      id: Date.now(),
      email: newEmail.trim(),
      label: newEmailLabel.trim()
    };
    
    setManualEmails([...manualEmails, newEmailObj]);
    setNewEmail('');
    setNewEmailLabel('');
  };
  
  const handleDeleteEmail = (id) => {
    if (confirm('Are you sure you want to remove this email?')) {
      setManualEmails(manualEmails.filter(e => e.id !== id));
    }
  };
  
  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, unread: false } : n
    ));
  };
  
  const handleDeleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };
  
  const unreadCount = notifications.filter(n => n.unread).length;

  const containerStyle = {
    padding: '20px',
    minHeight: '100vh',
    backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
    color: isDarkMode ? '#f9fafb' : '#111827'
  };

  const tabsContainerStyle = {
    display: 'flex',
    gap: '12px',
    marginBottom: '32px',
    backgroundColor: isDarkMode ? '#334155' : '#f8fafc',
    borderRadius: '8px',
    padding: '20px'
  };

  const getTabStyle = (tabId) => ({
    padding: '12px 24px',
    backgroundColor: activeTab === tabId ? '#3b82f6' : (isDarkMode ? '#475569' : '#e5e7eb'),
    color: activeTab === tabId ? '#ffffff' : (isDarkMode ? '#94a3b8' : '#6b7280'),
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: activeTab === tabId ? 'bold' : 'normal',
    transition: 'all 0.2s ease',
    flex: '1',
    textAlign: 'center',
    whiteSpace: 'nowrap'
  });

  const contentCardStyle = {
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: isDarkMode 
      ? '0 10px 25px -3px rgba(0, 0, 0, 0.3)' 
      : '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
  };

  const sectionTitleStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: isDarkMode ? '#f9fafb' : '#111827'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
    color: isDarkMode ? '#f9fafb' : '#1f2937',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  };

  return (
    <div style={containerStyle}>
      <div style={tabsContainerStyle}>
        {[
          { id: 'chat', label: '💬 Live Chat', icon: '💬' },
          { id: 'email', label: '📧 Email Configuration', icon: '📧' },
          { id: 'notifications', label: '🔔 Notifications', icon: '🔔' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={getTabStyle(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Live Chat Tab - NO AUTO-SCROLL */}
      {activeTab === 'chat' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
          <div style={contentCardStyle}>
            <h3 style={sectionTitleStyle}>💬 Aurion Chat Interface</h3>
            <p style={{ color: isDarkMode ? '#d1d5db' : '#6b7280', marginBottom: '20px' }}>
              This is your integrated Aurion webchat system for customer support
            </p>
            
            <div style={{
              padding: '20px',
              backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
              borderRadius: '8px',
              marginBottom: '20px',
              border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
            }}>
              <h4 style={{ margin: '0 0 16px 0', color: isDarkMode ? '#f9fafb' : '#111827' }}>📊 Chat Statistics</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {[
                  { value: '12', label: 'Active Chats', color: '#3b82f6' },
                  { value: '89%', label: 'Resolution Rate', color: '#10b981' },
                  { value: '3.2m', label: 'Avg Response', color: '#f59e0b' }
                ].map((stat, index) => (
                  <div key={index} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: stat.color, marginBottom: '4px' }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '12px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <AurionWebchat 
              apiEndpoint={aiConfig.apiEndpoint}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      )}

      {/* Email Configuration Tab */}
      {activeTab === 'email' && (
        <div style={contentCardStyle}>
          <h3 style={sectionTitleStyle}>📧 Email Configuration</h3>
          <p style={{ color: isDarkMode ? '#d1d5db' : '#6b7280', marginBottom: '24px' }}>
            Manage email addresses for notifications and support inquiries
          </p>

          {/* Add Email Form */}
          <div style={{
            padding: '20px',
            backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
            borderRadius: '8px',
            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            marginBottom: '24px'
          }}>
            <h4 style={{ 
              color: isDarkMode ? '#f9fafb' : '#111827',
              marginBottom: '16px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              ➕ Add New Email
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: isDarkMode ? '#d1d5db' : '#374151',
                  marginBottom: '6px'
                }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    color: isDarkMode ? '#f9fafb' : '#111827',
                    border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                    borderRadius: '6px',
                    outline: 'none'
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleAddEmail();
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: isDarkMode ? '#d1d5db' : '#374151',
                  marginBottom: '6px'
                }}>
                  Label *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Customer Support"
                  value={newEmailLabel}
                  onChange={(e) => setNewEmailLabel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    color: isDarkMode ? '#f9fafb' : '#111827',
                    border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                    borderRadius: '6px',
                    outline: 'none'
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleAddEmail();
                  }}
                />
              </div>
              <button
                onClick={handleAddEmail}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
              >
                ➕ Add Email
              </button>
            </div>
          </div>

          {/* Email List */}
          <div>
            <h4 style={{ 
              color: isDarkMode ? '#f9fafb' : '#111827',
              marginBottom: '16px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              📋 Email List ({manualEmails.length})
            </h4>
            {manualEmails.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
                borderRadius: '8px',
                border: `2px dashed ${isDarkMode ? '#374151' : '#d1d5db'}`
              }}>
                <p style={{ 
                  color: isDarkMode ? '#9ca3af' : '#6b7280',
                  fontSize: '14px',
                  margin: 0
                }}>
                  No emails added yet. Use the form above to add your first email.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {manualEmails.map(emailItem => (
                  <div key={emailItem.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
                    borderRadius: '8px',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    overflow: 'hidden',
                    minWidth: 0
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        flexShrink: 0
                      }}>
                        📧
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: 'bold',
                          color: isDarkMode ? '#f9fafb' : '#111827',
                          marginBottom: '4px'
                        }}>
                          {emailItem.label}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: isDarkMode ? '#9ca3af' : '#6b7280',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {emailItem.email}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteEmail(emailItem.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div style={contentCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h3 style={{ ...sectionTitleStyle, margin: 0 }}>🔔 Notifications</h3>
              <p style={{ color: isDarkMode ? '#d1d5db' : '#6b7280', fontSize: '14px', margin: '4px 0 0 0' }}>
                Activity from Webchat Public and Email notifications
              </p>
            </div>
            {unreadCount > 0 && (
              <div style={{
                padding: '6px 12px',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {unreadCount} Unread
              </div>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
              borderRadius: '8px',
              border: `2px dashed ${isDarkMode ? '#374151' : '#d1d5db'}`
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
              <p style={{ 
                color: isDarkMode ? '#9ca3af' : '#6b7280',
                fontSize: '16px',
                fontWeight: '600',
                margin: '0 0 8px 0'
              }}>
                No notifications yet
              </p>
              <p style={{ 
                color: isDarkMode ? '#6b7280' : '#9ca3af',
                fontSize: '14px',
                margin: 0
              }}>
                You'll see activity from Webchat Public and Email here
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {notifications.map(notification => (
                <div key={notification.id} style={{
                  padding: '16px',
                  backgroundColor: notification.unread 
                    ? (isDarkMode ? '#1e293b' : '#eff6ff')
                    : (isDarkMode ? '#111827' : '#f9fafb'),
                  borderRadius: '8px',
                  border: `1px solid ${notification.unread 
                    ? (isDarkMode ? '#3b82f6' : '#93c5fd')
                    : (isDarkMode ? '#374151' : '#e5e7eb')}`,
                  borderLeft: `4px solid ${notification.type === 'webchat' ? '#3b82f6' : '#f59e0b'}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <div style={{
                          padding: '4px 8px',
                          backgroundColor: notification.type === 'webchat' ? '#3b82f6' : '#f59e0b',
                          color: '#ffffff',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>
                          {notification.source}
                        </div>
                        <span style={{
                          fontSize: '12px',
                          color: isDarkMode ? '#9ca3af' : '#6b7280'
                        }}>
                          {notification.time}
                        </span>
                        {notification.unread && (
                          <div style={{
                            width: '8px',
                            height: '8px',
                            backgroundColor: '#ef4444',
                            borderRadius: '50%'
                          }} />
                        )}
                      </div>
                      <p style={{
                        color: isDarkMode ? '#f9fafb' : '#111827',
                        fontSize: '14px',
                        margin: 0,
                        lineHeight: '1.5'
                      }}>
                        {notification.message}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      {notification.unread && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#10b981',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          ✓ Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ChatManagerPublic;
