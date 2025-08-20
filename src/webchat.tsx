import React from 'react';

// =============================================================================
// AURION WEBCHAT COMPONENT
// =============================================================================

function AurionWebchat({ 
  apiEndpoint = 'http://localhost:8080',
  className = ''
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

  return React.createElement('div', { 
    className: `bg-gray-900 rounded-lg shadow-2xl border border-gray-700 ${className}`,
    style: { height: '500px', display: 'flex', flexDirection: 'column' }
  },
    // Header
    React.createElement('div', { 
      style: { 
        background: 'linear-gradient(to right, #22d3ee, #0891b2)', 
        padding: '16px', 
        borderRadius: '8px 8px 0 0' 
      } 
    },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
        React.createElement('div', {
          style: { 
            width: '32px', 
            height: '32px', 
            backgroundColor: 'white', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }
        },
          React.createElement('span', { 
            style: { color: '#0891b2', fontWeight: 'bold', fontSize: '14px' } 
          }, 'A')
        ),
        React.createElement('div', null,
          React.createElement('h3', { 
            style: { color: 'white', fontWeight: 'bold', margin: '0', fontSize: '16px' } 
          }, 'Aurion 3C Mascot'),
          React.createElement('p', { 
            style: { color: '#a5f3fc', fontSize: '12px', margin: '0' } 
          }, isLoading ? 'Typing...' : 'Online')
        )
      )
    ),

    // Messages Container
    React.createElement('div', { 
      style: { 
        flex: '1', 
        overflowY: 'auto', 
        padding: '16px', 
        backgroundColor: '#1f2937',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      } 
    },
      ...messages.map((message) =>
        React.createElement('div', {
          key: message.id,
          style: { 
            display: 'flex', 
            justifyContent: message.isUser ? 'flex-end' : 'flex-start' 
          }
        },
          React.createElement('div', {
            style: {
              maxWidth: '75%',
              padding: '12px 16px',
              borderRadius: '12px',
              background: message.isUser
                ? 'linear-gradient(to right, #fbbf24, #f59e0b)'
                : message.isError
                ? '#ef4444'
                : 'linear-gradient(to right, #22d3ee, #0891b2)',
              color: message.isUser ? '#1f2937' : message.isError ? 'white' : '#1f2937',
              boxShadow: message.isUser 
                ? '0 0 16px rgba(251, 191, 36, 0.3)' 
                : '0 0 16px rgba(34, 211, 238, 0.3)'
            }
          },
            React.createElement('p', { 
              style: { 
                fontSize: '14px', 
                fontWeight: '500', 
                margin: '0 0 4px 0',
                whiteSpace: 'pre-line'
              } 
            }, message.text),
            React.createElement('p', { 
              style: { 
                fontSize: '11px', 
                opacity: '0.7', 
                margin: '0' 
              } 
            }, message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }))
          )
        )
      ),
      isLoading && React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-start' } },
        React.createElement('div', {
          style: {
            background: 'linear-gradient(to right, #22d3ee, #0891b2)',
            color: '#1f2937',
            padding: '12px 16px',
            borderRadius: '12px',
            boxShadow: '0 0 16px rgba(34, 211, 238, 0.3)'
          }
        },
          React.createElement('div', { style: { display: 'flex', gap: '4px' } },
            React.createElement('div', { 
              style: { 
                width: '8px', 
                height: '8px', 
                backgroundColor: '#1f2937', 
                borderRadius: '50%',
                animation: 'bounce 1.4s ease-in-out infinite both'
              } 
            }),
            React.createElement('div', { 
              style: { 
                width: '8px', 
                height: '8px', 
                backgroundColor: '#1f2937', 
                borderRadius: '50%',
                animation: 'bounce 1.4s ease-in-out 0.16s infinite both'
              } 
            }),
            React.createElement('div', { 
              style: { 
                width: '8px', 
                height: '8px', 
                backgroundColor: '#1f2937', 
                borderRadius: '50%',
                animation: 'bounce 1.4s ease-in-out 0.32s infinite both'
              } 
            })
          )
        )
      ),
      React.createElement('div', { ref: messagesEndRef })
    ),

    // Input Section
    React.createElement('div', { 
      style: { 
        padding: '16px', 
        borderTop: '1px solid #374151', 
        backgroundColor: '#1f2937',
        borderRadius: '0 0 8px 8px'
      } 
    },
      React.createElement('div', { style: { display: 'flex', gap: '8px' } },
        React.createElement('input', {
          type: 'text',
          value: inputMessage,
          onChange: (e) => setInputMessage(e.target.value),
          onKeyPress: handleKeyPress,
          placeholder: 'Type your message...',
          disabled: isLoading,
          style: {
            flex: '1',
            backgroundColor: '#374151',
            color: 'white',
            border: '1px solid #4b5563',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '14px',
            outline: 'none'
          }
        }),
        React.createElement('button', {
          onClick: sendMessage,
          disabled: isLoading || !inputMessage.trim(),
          style: {
            background: 'linear-gradient(to right, #22d3ee, #0891b2)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: isLoading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            opacity: isLoading || !inputMessage.trim() ? 0.6 : 1,
            transition: 'all 0.2s'
          }
        }, '➤')
      )
    )
  );
}

// =============================================================================
// CHAT MANAGER PUBLIC COMPONENT - COMPLETE WITH ALL TABS
// =============================================================================

function ChatManagerPublic() {
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

  return React.createElement('div', { style: { padding: '20px' } },
    React.createElement('h2', null, '💬 Chat Manager - Public'),
    React.createElement('p', null, 'Manage customer communications, support emails, and notifications'),
    
    React.createElement('div', {
      style: { 
        display: 'flex', 
        gap: '0', 
        marginTop: '20px', 
        marginBottom: '30px',
        borderBottom: '2px solid #e5e7eb'
      }
    },
      React.createElement('button', {
        onClick: () => setActiveTab('chat'),
        style: {
          padding: '12px 20px',
          backgroundColor: activeTab === 'chat' ? '#3b82f6' : 'transparent',
          color: activeTab === 'chat' ? 'white' : '#6b7280',
          border: 'none',
          borderBottom: activeTab === 'chat' ? '3px solid #3b82f6' : '3px solid transparent',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: activeTab === 'chat' ? 'bold' : 'normal'
        }
      }, '💬 Live Chat'),
      React.createElement('button', {
        onClick: () => setActiveTab('email'),
        style: {
          padding: '12px 20px',
          backgroundColor: activeTab === 'email' ? '#3b82f6' : 'transparent',
          color: activeTab === 'email' ? 'white' : '#6b7280',
          border: 'none',
          borderBottom: activeTab === 'email' ? '3px solid #3b82f6' : '3px solid transparent',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: activeTab === 'email' ? 'bold' : 'normal'
        }
      }, '📧 Email Config'),
      React.createElement('button', {
        onClick: () => setActiveTab('ai'),
        style: {
          padding: '12px 20px',
          backgroundColor: activeTab === 'ai' ? '#3b82f6' : 'transparent',
          color: activeTab === 'ai' ? 'white' : '#6b7280',
          border: 'none',
          borderBottom: activeTab === 'ai' ? '3px solid #3b82f6' : '3px solid transparent',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: activeTab === 'ai' ? 'bold' : 'normal'
        }
      }, '🤖 AI Setup'),
      React.createElement('button', {
        onClick: () => setActiveTab('notifications'),
        style: {
          padding: '12px 20px',
          backgroundColor: activeTab === 'notifications' ? '#3b82f6' : 'transparent',
          color: activeTab === 'notifications' ? 'white' : '#6b7280',
          border: 'none',
          borderBottom: activeTab === 'notifications' ? '3px solid #3b82f6' : '3px solid transparent',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: activeTab === 'notifications' ? 'bold' : 'normal'
        }
      }, '🔔 Notifications')
    ),

    // Live Chat Tab
    activeTab === 'chat' && React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' } },
      React.createElement('div', null,
        React.createElement('h3', { style: { marginBottom: '20px', fontSize: '18px' } }, '💬 Aurion Chat Interface'),
        React.createElement('p', { style: { color: '#6b7280', marginBottom: '20px' } }, 'This is your integrated Aurion webchat system for customer support'),
        React.createElement('div', {
          style: { 
            padding: '20px', 
            backgroundColor: '#f9fafb', 
            borderRadius: '8px',
            marginBottom: '20px'
          }
        },
          React.createElement('h4', { style: { margin: '0 0 10px 0' } }, '📊 Chat Statistics'),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' } },
            React.createElement('div', { style: { textAlign: 'center' } },
              React.createElement('div', { style: { fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' } }, '12'),
              React.createElement('div', { style: { fontSize: '12px', color: '#6b7280' } }, 'Active Chats')
            ),
            React.createElement('div', { style: { textAlign: 'center' } },
              React.createElement('div', { style: { fontSize: '24px', fontWeight: 'bold', color: '#10b981' } }, '89%'),
              React.createElement('div', { style: { fontSize: '12px', color: '#6b7280' } }, 'Resolution Rate')
            ),
            React.createElement('div', { style: { textAlign: 'center' } },
              React.createElement('div', { style: { fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' } }, '3.2m'),
              React.createElement('div', { style: { fontSize: '12px', color: '#6b7280' } }, 'Avg Response')
            )
          )
        )
      ),
      React.createElement('div', null,
        React.createElement(AurionWebchat, { 
          apiEndpoint: aiConfig.apiEndpoint,
          className: 'w-full'
        })
      )
    ),

    // Email Configuration Tab
    activeTab === 'email' && React.createElement('div', { style: { display: 'grid', gap: '30px' } },
      React.createElement('div', {
        style: { 
          padding: '25px', 
          border: '2px solid #3b82f6', 
          borderRadius: '12px', 
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' 
        }
      },
        React.createElement('h3', { style: { color: '#1e40af', marginBottom: '20px' } }, '📧 Email Configuration'),
        React.createElement('div', { style: { display: 'grid', gap: '20px' } },
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' } },
            React.createElement('div', null,
              React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1e40af' } }, 'Main Email'),
              React.createElement('input', {
                type: 'email',
                value: emailConfig.mainEmail,
                onChange: (e) => setEmailConfig(prev => ({ ...prev, mainEmail: e.target.value })),
                style: {
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #93c5fd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1e40af' } }, 'Support Email'),
              React.createElement('input', {
                type: 'email',
                value: emailConfig.supportEmail,
                onChange: (e) => setEmailConfig(prev => ({ ...prev, supportEmail: e.target.value })),
                style: {
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #93c5fd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }
              })
            )
          ),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' } },
            React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
              React.createElement('input', {
                type: 'checkbox',
                checked: emailConfig.notificationsEnabled,
                onChange: (e) => setEmailConfig(prev => ({ ...prev, notificationsEnabled: e.target.checked }))
              }),
              React.createElement('span', { style: { color: '#1e40af', fontWeight: 'bold' } }, 'Enable Email Notifications')
            ),
            React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
              React.createElement('input', {
                type: 'checkbox',
                checked: emailConfig.autoReply,
                onChange: (e) => setEmailConfig(prev => ({ ...prev, autoReply: e.target.checked }))
              }),
              React.createElement('span', { style: { color: '#1e40af', fontWeight: 'bold' } }, 'Auto Reply')
            )
          )
        )
      ),
      React.createElement('div', {
        style: { 
          padding: '20px', 
          backgroundColor: '#f3f4f6', 
          borderRadius: '8px' 
        }
      },
        React.createElement('h4', { style: { margin: '0 0 15px 0' } }, '📝 Email Templates'),
        React.createElement('p', { style: { color: '#6b7280', fontSize: '14px', marginBottom: '15px' } }, 'Quick templates for common responses'),
        React.createElement('div', { style: { display: 'grid', gap: '10px' } },
          React.createElement('button', {
            style: { 
              padding: '10px 15px', 
              backgroundColor: '#white', 
              border: '1px solid #d1d5db', 
              borderRadius: '6px',
              textAlign: 'left',
              cursor: 'pointer'
            }
          }, '📩 Welcome Message'),
          React.createElement('button', {
            style: { 
              padding: '10px 15px', 
              backgroundColor: '#white', 
              border: '1px solid #d1d5db', 
              borderRadius: '6px',
              textAlign: 'left',
              cursor: 'pointer'
            }
          }, '🔧 Technical Support'),
          React.createElement('button', {
            style: { 
              padding: '10px 15px', 
              backgroundColor: '#white', 
              border: '1px solid #d1d5db', 
              borderRadius: '6px',
              textAlign: 'left',
              cursor: 'pointer'
            }
          }, '💼 Business Inquiry')
        )
      )
    ),

    // AI Setup Tab
    activeTab === 'ai' && React.createElement('div', { style: { display: 'grid', gap: '30px' } },
      React.createElement('div', {
        style: { 
          padding: '25px', 
          border: '2px solid #10b981', 
          borderRadius: '12px', 
          background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' 
        }
      },
        React.createElement('h3', { style: { color: '#047857', marginBottom: '20px' } }, '🤖 AI Assistant Configuration'),
        React.createElement('div', { style: { display: 'grid', gap: '20px' } },
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' } },
            React.createElement('div', null,
              React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#047857' } }, 'Primary AI'),
              React.createElement('select', {
                value: aiConfig.primaryAI,
                onChange: (e) => setAiConfig(prev => ({ ...prev, primaryAI: e.target.value })),
                style: {
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #6ee7b7',
                  borderRadius: '6px',
                  fontSize: '14px'
                }
              },
                React.createElement('option', { value: 'Jan AI' }, 'Jan AI (GitHub)'),
                React.createElement('option', { value: 'Claude' }, 'Claude'),
                React.createElement('option', { value: 'OpenAI GPT-4' }, 'OpenAI GPT-4')
              )
            ),
            React.createElement('div', null,
              React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#047857' } }, 'Backup AI'),
              React.createElement('select', {
                value: aiConfig.backupAI,
                onChange: (e) => setAiConfig(prev => ({ ...prev, backupAI: e.target.value })),
                style: {
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #6ee7b7',
                  borderRadius: '6px',
                  fontSize: '14px'
                }
              },
                React.createElement('option', { value: 'OpenAI GPT-4' }, 'OpenAI GPT-4'),
                React.createElement('option', { value: 'Claude' }, 'Claude'),
                React.createElement('option', { value: 'Jan AI' }, 'Jan AI (GitHub)')
              )
            ),
            React.createElement('div', null,
              React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#047857' } }, 'API Endpoint'),
              React.createElement('input', {
                type: 'text',
                value: aiConfig.apiEndpoint,
                onChange: (e) => setAiConfig(prev => ({ ...prev, apiEndpoint: e.target.value })),
                style: {
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #6ee7b7',
                  borderRadius: '6px',
                  fontSize: '14px'
                }
              })
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
              React.createElement('input', {
                type: 'checkbox',
                checked: aiConfig.claudeEnabled,
                onChange: (e) => setAiConfig(prev => ({ ...prev, claudeEnabled: e.target.checked }))
              }),
              React.createElement('span', { style: { color: '#047857', fontWeight: 'bold' } }, 'Enable Claude Integration')
            )
          )
        )
      ),
      React.createElement('div', {
        style: { 
          padding: '20px', 
          backgroundColor: '#f3f4f6', 
          borderRadius: '8px' 
        }
      },
        React.createElement('h4', { style: { margin: '0 0 15px 0' } }, '🔧 AI Status'),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' } },
          React.createElement('div', { 
            style: { 
              padding: '15px', 
              backgroundColor: 'white', 
              borderRadius: '8px',
              textAlign: 'center'
            } 
          },
            React.createElement('div', { style: { width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '50%', margin: '0 auto 8px' } }),
            React.createElement('div', { style: { fontSize: '14px', fontWeight: 'bold' } }, 'Jan AI'),
            React.createElement('div', { style: { fontSize: '12px', color: '#6b7280' } }, 'Connected')
          ),
          React.createElement('div', { 
            style: { 
              padding: '15px', 
              backgroundColor: 'white', 
              borderRadius: '8px',
              textAlign: 'center'
            } 
          },
            React.createElement('div', { style: { width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '50%', margin: '0 auto 8px' } }),
            React.createElement('div', { style: { fontSize: '14px', fontWeight: 'bold' } }, 'OpenAI'),
            React.createElement('div', { style: { fontSize: '12px', color: '#6b7280' } }, 'Standby')
          ),
          React.createElement('div', { 
            style: { 
              padding: '15px', 
              backgroundColor: 'white', 
              borderRadius: '8px',
              textAlign: 'center'
            } 
          },
            React.createElement('div', { style: { width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '50%', margin: '0 auto 8px' } }),
            React.createElement('div', { style: { fontSize: '14px', fontWeight: 'bold' } }, 'Claude'),
            React.createElement('div', { style: { fontSize: '12px', color: '#6b7280' } }, 'Available')
          )
        )
      )
    ),

    // Notifications Tab
    activeTab === 'notifications' && React.createElement('div', { style: { display: 'grid', gap: '30px' } },
      React.createElement('div', {
        style: { 
          padding: '25px', 
          border: '2px solid #f59e0b', 
          borderRadius: '12px', 
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' 
        }
      },
        React.createElement('h3', { style: { color: '#92400e', marginBottom: '20px' } }, '🔔 Notification Center'),
        React.createElement('div', { style: { display: 'grid', gap: '15px' } },
          ...notifications.map(notification =>
            React.createElement('div', {
              key: notification.id,
              style: { 
                padding: '15px', 
                backgroundColor: notification.unread ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)', 
                borderRadius: '8px',
                borderLeft: `4px solid ${notification.type === 'new_message' ? '#3b82f6' : notification.type === 'email' ? '#10b981' : '#6b7280'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }
            },
              React.createElement('div', null,
                React.createElement('div', { 
                  style: { 
                    fontWeight: notification.unread ? 'bold' : 'normal',
                    marginBottom: '4px'
                  } 
                }, notification.message),
                React.createElement('div', { 
                  style: { 
                    fontSize: '12px', 
                    color: '#6b7280' 
                  } 
                }, notification.time)
              ),
              notification.unread && React.createElement('div', {
                style: { 
                  width: '8px', 
                  height: '8px', 
                  backgroundColor: '#3b82f6', 
                  borderRadius: '50%' 
                }
              })
            )
          )
        )
      )
    )
  );
}

// Export the complete ChatManagerPublic as the main component
export default ChatManagerPublic;
