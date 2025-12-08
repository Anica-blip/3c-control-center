import React from 'react';
import {
  loadEmailAccounts,
  addEmailAccount,
  deleteEmailAccount,
  loadNotificationCounts,
  calculateTotalUnread,
} from './supabaseAPI';
import {
  validateEmailInput,
  getProviderIcon,
  openEmailInBrowser,
  formatDateTime,
  getNotificationBadgeColor,
  getNotificationTypeIcon,
} from './utils';
import { AURION_CONFIG, REFRESH_INTERVALS } from './config';
import type {
  ChatMessage,
  EmailAccount,
  NotificationCount,
  AurionWebchatProps,
  ChatManagerPublicProps,
} from './types';

// =============================================================================
// AURION WEBCHAT COMPONENT - NO AUTO-SCROLL VERSION
// =============================================================================

function AurionWebchat({ 
  apiEndpoint = AURION_CONFIG.defaultEndpoint,
  className = '',
  isDarkMode = false
}: AurionWebchatProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: 1,
      text: AURION_CONFIG.defaultGreeting,
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [chatSessionId, setChatSessionId] = React.useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
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

      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        text: data.reply,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
          <div style={baseStyles.avatar}>A</div>
          <div style={baseStyles.headerText}>
            <h3 style={baseStyles.headerTitle}>Aurion 3C Assistant</h3>
            <p style={baseStyles.headerStatus}>
              {isLoading ? 'Typing...' : 'Online'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
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
              <div style={{ whiteSpace: 'pre-line' }}>{message.text}</div>
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
// CHAT MANAGER PUBLIC COMPONENT - MODULAR VERSION
// =============================================================================

function ChatManagerPublic({ isDarkMode }: ChatManagerPublicProps) {
  const [activeTab, setActiveTab] = React.useState('chat');
  
  // Email accounts state
  const [manualEmails, setManualEmails] = React.useState<EmailAccount[]>([]);
  const [newEmail, setNewEmail] = React.useState('');
  const [newEmailLabel, setNewEmailLabel] = React.useState('');
  const [emailsLoading, setEmailsLoading] = React.useState(false);
  const [emailsError, setEmailsError] = React.useState<string | null>(null);
  
  // Notification counts state
  const [notificationCounts, setNotificationCounts] = React.useState<NotificationCount[]>([]);
  const [notificationsLoading, setNotificationsLoading] = React.useState(false);
  const [notificationsError, setNotificationsError] = React.useState<string | null>(null);

  // Load email accounts on mount
  React.useEffect(() => {
    handleLoadEmailAccounts();
  }, []);

  // Load notification counts on mount and auto-refresh
  React.useEffect(() => {
    handleLoadNotificationCounts();
    
    const interval = setInterval(() => {
      handleLoadNotificationCounts();
    }, REFRESH_INTERVALS.notificationCounts);
    
    return () => clearInterval(interval);
  }, []);

  // Load email accounts from database
  const handleLoadEmailAccounts = async () => {
    setEmailsLoading(true);
    setEmailsError(null);
    
    const { data, error } = await loadEmailAccounts();
    
    if (error) {
      setEmailsError(error);
    } else {
      setManualEmails(data || []);
    }
    
    setEmailsLoading(false);
  };

  // Load notification counts from database
  const handleLoadNotificationCounts = async () => {
    setNotificationsLoading(true);
    setNotificationsError(null);
    
    const { data, error } = await loadNotificationCounts();
    
    if (error) {
      setNotificationsError(error);
    } else {
      setNotificationCounts(data || []);
    }
    
    setNotificationsLoading(false);
  };

  // Add email account
  const handleAddEmail = async () => {
    const validation = validateEmailInput(newEmail, newEmailLabel);
    
    if (!validation.valid) {
      alert(validation.error);
      return;
    }
    
    const { data, error } = await addEmailAccount(newEmail, newEmailLabel);
    
    if (error) {
      alert(error);
    } else if (data) {
      setManualEmails([data, ...manualEmails]);
      setNewEmail('');
      setNewEmailLabel('');
      alert('Email account added successfully!');
      
      // Refresh notification counts
      handleLoadNotificationCounts();
    }
  };
  
  // Delete email account
  const handleDeleteEmail = async (id: string) => {
    if (!confirm('Are you sure you want to remove this email account?')) {
      return;
    }
    
    const { success, error } = await deleteEmailAccount(id);
    
    if (error) {
      alert(error);
    } else if (success) {
      setManualEmails(manualEmails.filter(e => e.id !== id));
      alert('Email account removed successfully!');
      
      // Refresh notification counts
      handleLoadNotificationCounts();
    }
  };

  // Calculate total unread
  const totalUnreadCount = calculateTotalUnread(notificationCounts);

  // Styles
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
    padding: '8px',
    borderRadius: '12px',
    border: `1px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`,
    boxShadow: isDarkMode 
      ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
      : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  const tabStyle = (isActive: boolean) => ({
    flex: 1,
    padding: '14px 20px',
    backgroundColor: isActive 
      ? (isDarkMode ? '#1e293b' : '#ffffff')
      : 'transparent',
    color: isActive 
      ? (isDarkMode ? '#f8fafc' : '#0f172a')
      : (isDarkMode ? '#94a3b8' : '#64748b'),
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: isActive ? 'bold' : 'normal',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    boxShadow: isActive 
      ? (isDarkMode 
        ? '0 2px 4px rgba(0, 0, 0, 0.3)' 
        : '0 2px 4px rgba(0, 0, 0, 0.1)')
      : 'none'
  });

  const contentCardStyle = {
    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
    borderRadius: '12px',
    padding: '28px',
    border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
    boxShadow: isDarkMode 
      ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
      : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  const sectionTitleStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: isDarkMode ? '#f8fafc' : '#0f172a'
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ 
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold',
            margin: '0 0 8px 0',
            color: isDarkMode ? '#f8fafc' : '#0f172a'
          }}>
            🎛️ 3C Control Center
          </h1>
          <p style={{ 
            color: isDarkMode ? '#94a3b8' : '#64748b',
            margin: 0,
            fontSize: '14px'
          }}>
            Backend monitoring dashboard for all 3C operations
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={tabsContainerStyle}>
        <button
          onClick={() => setActiveTab('chat')}
          style={tabStyle(activeTab === 'chat')}
        >
          💬 Live Chat
        </button>
        <button
          onClick={() => setActiveTab('email-config')}
          style={tabStyle(activeTab === 'email-config')}
        >
          📧 Email Configuration
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          style={tabStyle(activeTab === 'notifications')}
        >
          🔔 Notifications {totalUnreadCount > 0 && `(${totalUnreadCount})`}
        </button>
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div style={contentCardStyle}>
          <h3 style={sectionTitleStyle}>💬 Live Chat Monitor</h3>
          <p style={{ 
            color: isDarkMode ? '#94a3b8' : '#64748b',
            marginBottom: '24px',
            fontSize: '14px'
          }}>
            Monitor live chat conversations with Aurion AI Assistant
          </p>
          <AurionWebchat isDarkMode={isDarkMode} />
        </div>
      )}

      {/* Email Configuration Tab */}
      {activeTab === 'email-config' && (
        <div style={contentCardStyle}>
          <h3 style={sectionTitleStyle}>📧 Email Configuration</h3>
          <p style={{ 
            color: isDarkMode ? '#94a3b8' : '#64748b',
            marginBottom: '24px',
            fontSize: '14px'
          }}>
            Add email accounts to monitor for notifications
          </p>

          {/* Add Email Form */}
          <div style={{
            padding: '20px',
            backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
            borderRadius: '8px',
            border: `1px solid ${isDarkMode ? '#334155' : '#cbd5e1'}`,
            marginBottom: '24px'
          }}>
            <h4 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: isDarkMode ? '#f8fafc' : '#0f172a'
            }}>
              ➕ Add New Email Account
            </h4>
            
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={{ 
                  display: 'block',
                  marginBottom: '6px',
                  color: isDarkMode ? '#e2e8f0' : '#334155',
                  fontSize: '13px',
                  fontWeight: '600'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                    color: isDarkMode ? '#f8fafc' : '#0f172a',
                    border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`,
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block',
                  marginBottom: '6px',
                  color: isDarkMode ? '#e2e8f0' : '#334155',
                  fontSize: '13px',
                  fontWeight: '600'
                }}>
                  Label / Description
                </label>
                <input
                  type="text"
                  value={newEmailLabel}
                  onChange={(e) => setNewEmailLabel(e.target.value)}
                  placeholder="Main Support"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                    color: isDarkMode ? '#f8fafc' : '#0f172a',
                    border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`,
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <button
                onClick={handleAddEmail}
                disabled={!newEmail.trim() || !newEmailLabel.trim()}
                style={{
                  padding: '10px 16px',
                  backgroundColor: (!newEmail.trim() || !newEmailLabel.trim()) 
                    ? (isDarkMode ? '#475569' : '#cbd5e1')
                    : '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: (!newEmail.trim() || !newEmailLabel.trim()) ? 'not-allowed' : 'pointer',
                  marginTop: '8px'
                }}
              >
                ➕ Add Email Account
              </button>
            </div>
          </div>

          {/* Email List */}
          <div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: isDarkMode ? '#f8fafc' : '#0f172a'
            }}>
              📋 Monitored Email Accounts
            </h4>
            
            {emailsLoading ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
                borderRadius: '8px',
                border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`
              }}>
                <p style={{ 
                  color: isDarkMode ? '#94a3b8' : '#64748b',
                  fontSize: '14px',
                  margin: 0
                }}>
                  Loading email accounts...
                </p>
              </div>
            ) : emailsError ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: isDarkMode ? '#450a0a' : '#fee2e2',
                borderRadius: '8px',
                border: `2px dashed ${isDarkMode ? '#991b1b' : '#ef4444'}`
              }}>
                <p style={{ 
                  color: isDarkMode ? '#fca5a5' : '#dc2626',
                  fontSize: '14px',
                  fontWeight: '600',
                  margin: '0 0 8px 0'
                }}>
                  Error loading emails
                </p>
                <button
                  onClick={handleLoadEmailAccounts}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}
                >
                  🔄 Retry
                </button>
              </div>
            ) : manualEmails.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
                borderRadius: '8px',
                border: `2px dashed ${isDarkMode ? '#334155' : '#cbd5e1'}`
              }}>
                <p style={{ 
                  color: isDarkMode ? '#94a3b8' : '#64748b',
                  fontSize: '14px',
                  margin: 0
                }}>
                  No email accounts added yet. Use the form above to add your first email.
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
                    backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
                    borderRadius: '8px',
                    border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
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
                        {getProviderIcon(emailItem.provider)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: 'bold',
                          color: isDarkMode ? '#f8fafc' : '#0f172a',
                          marginBottom: '4px',
                          fontSize: '14px'
                        }}>
                          {emailItem.label}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: isDarkMode ? '#94a3b8' : '#64748b',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {emailItem.email}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button
                        onClick={() => openEmailInBrowser(emailItem.provider, emailItem.email)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#3b82f6',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        🔗 Open
                      </button>
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
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
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
              <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>
                Unread counts from all monitored sources
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {totalUnreadCount > 0 && (
                <div style={{
                  padding: '6px 12px',
                  backgroundColor: getNotificationBadgeColor(totalUnreadCount),
                  color: '#ffffff',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {totalUnreadCount} Total Unread
                </div>
              )}
              <button
                onClick={handleLoadNotificationCounts}
                disabled={notificationsLoading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: isDarkMode ? '#334155' : '#f1f5f9',
                  color: isDarkMode ? '#f8fafc' : '#0f172a',
                  border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`,
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: notificationsLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {notificationsLoading ? '⏳ Refreshing...' : '🔄 Refresh'}
              </button>
            </div>
          </div>

          {notificationsLoading && notificationCounts.length === 0 ? (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
              borderRadius: '8px',
              border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
              <p style={{ 
                color: isDarkMode ? '#94a3b8' : '#64748b',
                fontSize: '16px',
                fontWeight: '600',
                margin: 0
              }}>
                Loading notifications...
              </p>
            </div>
          ) : notificationsError ? (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              backgroundColor: isDarkMode ? '#450a0a' : '#fee2e2',
              borderRadius: '8px',
              border: `2px dashed ${isDarkMode ? '#991b1b' : '#ef4444'}`
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <p style={{ 
                color: isDarkMode ? '#fca5a5' : '#dc2626',
                fontSize: '16px',
                fontWeight: '600',
                margin: '0 0 8px 0'
              }}>
                Error loading notifications
              </p>
              <button
                onClick={handleLoadNotificationCounts}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginTop: '12px'
                }}
              >
                🔄 Retry
              </button>
            </div>
          ) : notificationCounts.length === 0 ? (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
              borderRadius: '8px',
              border: `2px dashed ${isDarkMode ? '#334155' : '#cbd5e1'}`
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
              <p style={{ 
                color: isDarkMode ? '#94a3b8' : '#64748b',
                fontSize: '16px',
                fontWeight: '600',
                margin: '0 0 8px 0'
              }}>
                No notification sources yet
              </p>
              <p style={{ 
                color: isDarkMode ? '#64748b' : '#94a3b8',
                fontSize: '14px',
                margin: 0
              }}>
                Add email accounts in the Email Configuration tab to start monitoring
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {notificationCounts.map(notification => (
                <div key={notification.id} style={{
                  padding: '20px',
                  backgroundColor: notification.unread_count > 0
                    ? (isDarkMode ? '#1e293b' : '#eff6ff')
                    : (isDarkMode ? '#0f172a' : '#f8fafc'),
                  borderRadius: '8px',
                  border: `1px solid ${notification.unread_count > 0
                    ? (isDarkMode ? '#3b82f6' : '#93c5fd')
                    : (isDarkMode ? '#334155' : '#e5e7eb')}`,
                  borderLeft: `4px solid ${notification.source_type === 'webchat' ? '#3b82f6' : '#f59e0b'}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{
                          padding: '6px 12px',
                          backgroundColor: notification.source_type === 'webchat' ? '#3b82f6' : '#f59e0b',
                          color: '#ffffff',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>
                          {getNotificationTypeIcon(notification.source_type)} {notification.source_type === 'webchat' ? 'Live Chat' : 'Email'}
                        </div>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: isDarkMode ? '#f8fafc' : '#0f172a'
                        }}>
                          {notification.source_name}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: isDarkMode ? '#94a3b8' : '#64748b',
                        marginBottom: '4px'
                      }}>
                        Last checked: {formatDateTime(notification.last_checked)}
                      </div>
                    </div>
                    <div style={{
                      padding: '12px 20px',
                      backgroundColor: getNotificationBadgeColor(notification.unread_count),
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      minWidth: '80px',
                      textAlign: 'center',
                      flexShrink: 0
                    }}>
                      {notification.unread_count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Auto-refresh indicator */}
          {!notificationsLoading && notificationCounts.length > 0 && (
            <div style={{
              marginTop: '24px',
              padding: '12px',
              backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
              borderRadius: '6px',
              border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
              textAlign: 'center',
              fontSize: '12px',
              color: isDarkMode ? '#64748b' : '#94a3b8'
            }}>
              🔄 Auto-refreshing every 30 seconds
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ChatManagerPublic;
