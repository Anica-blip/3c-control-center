import React from 'react';

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

function AdminTemplates() {
  const [selectedTemplate, setSelectedTemplate] = React.useState(null);
  const [templates, setTemplates] = React.useState([
    {
      id: 1,
      name: "Social Media Post",
      category: "Social",
      description: "Instagram/Facebook post template",
      fields: ["title", "description", "hashtags", "image"],
      lastModified: "2025-01-15"
    },
    {
      id: 2,
      name: "Blog Article",
      category: "Content",
      description: "Standard blog post structure",
      fields: ["headline", "introduction", "body", "conclusion", "tags"],
      lastModified: "2025-01-10"
    }
  ]);

  const [showBuilder, setShowBuilder] = React.useState(false);
  const [newTemplate, setNewTemplate] = React.useState({
    name: '',
    category: 'Social',
    description: '',
    fields: ['']
  });

  const addField = () => {
    setNewTemplate(prev => ({
      ...prev,
      fields: [...prev.fields, '']
    }));
  };

  const updateField = (index, value) => {
    setNewTemplate(prev => ({
      ...prev,
      fields: prev.fields.map((field, i) => i === index ? value : field)
    }));
  };

  const removeField = (index) => {
    setNewTemplate(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const saveTemplate = () => {
    const newId = Math.max(...templates.map(t => t.id)) + 1;
    const template = {
      ...newTemplate,
      id: newId,
      lastModified: new Date().toISOString().split('T')[0],
      fields: newTemplate.fields.filter(f => f.trim() !== '')
    };
    
    setTemplates(prev => [...prev, template]);
    setNewTemplate({ name: '', category: 'Social', description: '', fields: [''] });
    setShowBuilder(false);
  };

  return React.createElement('div', { style: { padding: '20px' } },
    React.createElement('h2', null, '🏗️ Manage Templates'),
    React.createElement('p', null, 'Create, edit, and manage your content templates'),
    
    React.createElement('div', { style: { marginBottom: '30px' } },
      React.createElement('button', {
        onClick: () => setShowBuilder(!showBuilder),
        style: {
          padding: '12px 24px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }
      }, showBuilder ? '📋 View Templates' : '➕ Create New Template')
    ),

    showBuilder ? 
      React.createElement('div', {
        style: { 
          padding: '30px', 
          border: '2px solid #3b82f6', 
          borderRadius: '8px', 
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' 
        }
      },
        React.createElement('h3', { style: { color: '#1e40af', marginBottom: '20px' } }, '🏗️ Template Builder'),
        React.createElement('div', { style: { display: 'grid', gap: '20px' } },
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' } },
            React.createElement('div', null,
              React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1e40af' } }, 'Template Name'),
              React.createElement('input', {
                type: 'text',
                value: newTemplate.name,
                onChange: (e) => setNewTemplate(prev => ({ ...prev, name: e.target.value })),
                style: {
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #93c5fd',
                  borderRadius: '6px',
                  fontSize: '14px'
                },
                placeholder: 'e.g., Instagram Story Template'
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1e40af' } }, 'Category'),
              React.createElement('select', {
                value: newTemplate.category,
                onChange: (e) => setNewTemplate(prev => ({ ...prev, category: e.target.value })),
                style: {
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #93c5fd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }
              },
                React.createElement('option', { value: 'Social' }, 'Social Media'),
                React.createElement('option', { value: 'Content' }, 'Blog Content'),
                React.createElement('option', { value: 'Email' }, 'Email Marketing'),
                React.createElement('option', { value: 'Video' }, 'Video Content'),
                React.createElement('option', { value: 'Other' }, 'Other')
              )
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1e40af' } }, 'Description'),
            React.createElement('textarea', {
              value: newTemplate.description,
              onChange: (e) => setNewTemplate(prev => ({ ...prev, description: e.target.value })),
              style: {
                width: '100%',
                padding: '12px',
                border: '1px solid #93c5fd',
                borderRadius: '6px',
                fontSize: '14px',
                minHeight: '80px',
                resize: 'vertical'
              },
              placeholder: 'Describe what this template is used for...'
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1e40af' } }, 'Template Fields'),
            ...newTemplate.fields.map((field, index) =>
              React.createElement('div', { key: index, style: { display: 'flex', gap: '10px', marginBottom: '10px' } },
                React.createElement('input', {
                  type: 'text',
                  value: field,
                  onChange: (e) => updateField(index, e.target.value),
                  style: {
                    flex: '1',
                    padding: '10px',
                    border: '1px solid #93c5fd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  },
                  placeholder: 'Field ' + (index + 1) + ' (e.g., headline, image, cta)'
                }),
                newTemplate.fields.length > 1 && React.createElement('button', {
                  onClick: () => removeField(index),
                  style: {
                    padding: '10px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }
                }, '❌')
              )
            ),
            React.createElement('button', {
              onClick: addField,
              style: {
                padding: '10px 20px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }
            }, '➕ Add Field')
          ),
          React.createElement('div', { style: { display: 'flex', gap: '10px', justifyContent: 'flex-end' } },
            React.createElement('button', {
              onClick: () => setShowBuilder(false),
              style: {
                padding: '12px 24px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }
            }, 'Cancel'),
            React.createElement('button', {
              onClick: saveTemplate,
              disabled: !newTemplate.name.trim(),
              style: {
                padding: '12px 24px',
                backgroundColor: newTemplate.name.trim() ? '#10b981' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: newTemplate.name.trim() ? 'pointer' : 'not-allowed'
              }
            }, '💾 Save Template')
          )
        )
      ) :
      React.createElement('div', null,
        React.createElement('div', {
          style: { 
            padding: '20px', 
            border: '1px solid #d1d5db', 
            borderRadius: '8px', 
            background: '#f9fafb',
            marginBottom: '30px'
          }
        },
          React.createElement('h3', { style: { marginBottom: '20px' } }, '📚 Template Library'),
          React.createElement('div', { style: { display: 'grid', gap: '15px' } },
            ...templates.map(template =>
              React.createElement('div', {
                key: template.id,
                style: { 
                  padding: '20px', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '6px', 
                  background: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                },
                onClick: () => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)
              },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } },
                  React.createElement('div', { style: { flex: '1' } },
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' } },
                      React.createElement('h4', { style: { margin: '0', color: '#1f2937' } }, template.name),
                      React.createElement('span', {
                        style: { 
                          padding: '4px 8px', 
                          backgroundColor: '#dbeafe', 
                          color: '#1e40af', 
                          borderRadius: '12px', 
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }
                      }, template.category)
                    ),
                    React.createElement('p', { style: { margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px' } }, template.description),
                    React.createElement('div', { style: { fontSize: '12px', color: '#9ca3af' } }, 
                      'Last modified: ' + template.lastModified + ' • ' + template.fields.length + ' fields'
                    )
                  ),
                  React.createElement('div', { style: { display: 'flex', gap: '8px' } },
                    React.createElement('button', {
                      style: { 
                        padding: '6px 12px', 
                        backgroundColor: '#3b82f6', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        cursor: 'pointer'
                      }
                    }, '✏️ Edit'),
                    React.createElement('button', {
                      style: { 
                        padding: '6px 12px', 
                        backgroundColor: '#10b981', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        cursor: 'pointer'
                      }
                    }, '📋 Use')
                  )
                ),
                selectedTemplate === template.id && React.createElement('div', {
                  style: { 
                    marginTop: '15px', 
                    padding: '15px', 
                    backgroundColor: '#f3f4f6', 
                    borderRadius: '6px' 
                  }
                },
                  React.createElement('h5', { style: { margin: '0 0 10px 0', color: '#374151' } }, 'Template Fields:'),
                  React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
                    ...template.fields.map((field, index) =>
                      React.createElement('span', {
                        key: index,
                        style: { 
                          padding: '4px 8px', 
                          backgroundColor: '#e5e7eb', 
                          color: '#374151', 
                          borderRadius: '8px', 
                          fontSize: '12px' 
                        }
                      }, field)
                    )
                  )
                )
              )
            )
          )
        )
      )
  );
}

function AdminTemplates() {
  const [selectedTemplate, setSelectedTemplate] = React.useState(null);
  const [templates, setTemplates] = React.useState([
    {
      id: 1,
      name: "Social Media Post",
      category: "Social",
      description: "Instagram/Facebook post template",
      fields: ["title", "description", "hashtags", "image"],
      lastModified: "2025-01-15"
    },
    {
      id: 2,
      name: "Blog Article",
      category: "Content",
      description: "Standard blog post structure",
      fields: ["headline", "introduction", "body", "conclusion", "tags"],
      lastModified: "2025-01-10"
    }
  ]);

  const [showBuilder, setShowBuilder] = React.useState(false);
  const [newTemplate, setNewTemplate] = React.useState({
    name: '',
    category: 'Social',
    description: '',
    fields: ['']
  });

  const addField = () => {
    setNewTemplate(prev => ({
      ...prev,
      fields: [...prev.fields, '']
    }));
  };

  const updateField = (index, value) => {
    setNewTemplate(prev => ({
      ...prev,
      fields: prev.fields.map((field, i) => i === index ? value : field)
    }));
  };

  const removeField = (index) => {
    setNewTemplate(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const saveTemplate = () => {
    const newId = Math.max(...templates.map(t => t.id)) + 1;
    const template = {
      ...newTemplate,
      id: newId,
      lastModified: new Date().toISOString().split('T')[0],
      fields: newTemplate.fields.filter(f => f.trim() !== '')
    };
    
    setTemplates(prev => [...prev, template]);
    setNewTemplate({ name: '', category: 'Social', description: '', fields: [''] });
    setShowBuilder(false);
  };

  return React.createElement('div', { style: { padding: '20px' } },
    React.createElement('h2', null, '🏗️ Manage Templates'),
    React.createElement('p', null, 'Create, edit, and manage your content templates'),
    
    React.createElement('div', { style: { marginBottom: '30px' } },
      React.createElement('button', {
        onClick: () => setShowBuilder(!showBuilder),
        style: {
          padding: '12px 24px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }
      }, showBuilder ? '📋 View Templates' : '➕ Create New Template')
    ),

    showBuilder ? 
      React.createElement('div', {
        style: { 
          padding: '30px', 
          border: '2px solid #3b82f6', 
          borderRadius: '8px', 
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' 
        }
      },
        React.createElement('h3', { style: { color: '#1e40af', marginBottom: '20px' } }, '🏗️ Template Builder'),
        React.createElement('div', { style: { display: 'grid', gap: '20px' } },
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' } },
            React.createElement('div', null,
              React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1e40af' } }, 'Template Name'),
              React.createElement('input', {
                type: 'text',
                value: newTemplate.name,
                onChange: (e) => setNewTemplate(prev => ({ ...prev, name: e.target.value })),
                style: {
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #93c5fd',
                  borderRadius: '6px',
                  fontSize: '14px'
                },
                placeholder: 'e.g., Instagram Story Template'
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1e40af' } }, 'Category'),
              React.createElement('select', {
                value: newTemplate.category,
                onChange: (e) => setNewTemplate(prev => ({ ...prev, category: e.target.value })),
                style: {
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #93c5fd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }
              },
                React.createElement('option', { value: 'Social' }, 'Social Media'),
                React.createElement('option', { value: 'Content' }, 'Blog Content'),
                React.createElement('option', { value: 'Email' }, 'Email Marketing'),
                React.createElement('option', { value: 'Video' }, 'Video Content'),
                React.createElement('option', { value: 'Other' }, 'Other')
              )
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1e40af' } }, 'Description'),
            React.createElement('textarea', {
              value: newTemplate.description,
              onChange: (e) => setNewTemplate(prev => ({ ...prev, description: e.target.value })),
              style: {
                width: '100%',
                padding: '12px',
                border: '1px solid #93c5fd',
                borderRadius: '6px',
                fontSize: '14px',
                minHeight: '80px',
                resize: 'vertical'
              },
              placeholder: 'Describe what this template is used for...'
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1e40af' } }, 'Template Fields'),
            ...newTemplate.fields.map((field, index) =>
              React.createElement('div', { key: index, style: { display: 'flex', gap: '10px', marginBottom: '10px' } },
                React.createElement('input', {
                  type: 'text',
                  value: field,
                  onChange: (e) => updateField(index, e.target.value),
                  style: {
                    flex: '1',
                    padding: '10px',
                    border: '1px solid #93c5fd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  },
                  placeholder: 'Field ' + (index + 1) + ' (e.g., headline, image, cta)'
                }),
                newTemplate.fields.length > 1 && React.createElement('button', {
                  onClick: () => removeField(index),
                  style: {
                    padding: '10px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }
                }, '❌')
              )
            ),
            React.createElement('button', {
              onClick: addField,
              style: {
                padding: '10px 20px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }
            }, '➕ Add Field')
          ),
          React.createElement('div', { style: { display: 'flex', gap: '10px', justifyContent: 'flex-end' } },
            React.createElement('button', {
              onClick: () => setShowBuilder(false),
              style: {
                padding: '12px 24px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }
            }, 'Cancel'),
            React.createElement('button', {
              onClick: saveTemplate,
              disabled: !newTemplate.name.trim(),
              style: {
                padding: '12px 24px',
                backgroundColor: newTemplate.name.trim() ? '#10b981' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: newTemplate.name.trim() ? 'pointer' : 'not-allowed'
              }
            }, '💾 Save Template')
          )
        )
      ) :
      React.createElement('div', null,
        React.createElement('div', {
          style: { 
            padding: '20px', 
            border: '1px solid #d1d5db', 
            borderRadius: '8px', 
            background: '#f9fafb',
            marginBottom: '30px'
          }
        },
          React.createElement('h3', { style: { marginBottom: '20px' } }, '📚 Template Library'),
          React.createElement('div', { style: { display: 'grid', gap: '15px' } },
            ...templates.map(template =>
              React.createElement('div', {
                key: template.id,
                style: { 
                  padding: '20px', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '6px', 
                  background: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                },
                onClick: () => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)
              },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } },
                  React.createElement('div', { style: { flex: '1' } },
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' } },
                      React.createElement('h4', { style: { margin: '0', color: '#1f2937' } }, template.name),
                      React.createElement('span', {
                        style: { 
                          padding: '4px 8px', 
                          backgroundColor: '#dbeafe', 
                          color: '#1e40af', 
                          borderRadius: '12px', 
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }
                      }, template.category)
                    ),
                    React.createElement('p', { style: { margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px' } }, template.description),
                    React.createElement('div', { style: { fontSize: '12px', color: '#9ca3af' } }, 
                      'Last modified: ' + template.lastModified + ' • ' + template.fields.length + ' fields'
                    )
                  ),
                  React.createElement('div', { style: { display: 'flex', gap: '8px' } },
                    React.createElement('button', {
                      style: { 
                        padding: '6px 12px', 
                        backgroundColor: '#3b82f6', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        cursor: 'pointer'
                      }
                    }, '✏️ Edit'),
                    React.createElement('button', {
                      style: { 
                        padding: '6px 12px', 
                        backgroundColor: '#10b981', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        cursor: 'pointer'
                      }
                    }, '📋 Use')
                  )
                ),
                selectedTemplate === template.id && React.createElement('div', {
                  style: { 
                    marginTop: '15px', 
                    padding: '15px', 
                    backgroundColor: '#f3f4f6', 
                    borderRadius: '6px' 
                  }
                },
                  React.createElement('h5', { style: { margin: '0 0 10px 0', color: '#374151' } }, 'Template Fields:'),
                  React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
                    ...template.fields.map((field, index) =>
                      React.createElement('span', {
                        key: index,
                        style: { 
                          padding: '4px 8px', 
                          backgroundColor: '#e5e7eb', 
                          color: '#374151', 
                          borderRadius: '8px', 
                          fontSize: '12px' 
                        }
                      }, field)
                    )
                  )
                )
              )
            )
          )
        )
      )
  );
}

  return React.createElement('div', { style: { padding: '20px' } },
    React.createElement('h2', null, '📚 Libraries'),
    React.createElement('p', null, 'External service integrations and storage management'),
    
    React.createElement('div', { style: { display: 'grid', gap: '30px', marginTop: '30px' } },
      
      // Notion Integration
      React.createElement('div', {
        style: { 
          padding: '25px', 
          border: '2px solid #6366f1', 
          borderRadius: '12px', 
          background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)'
        }
      },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' } },
          React.createElement('div', null,
            React.createElement('h3', { style: { margin: '0', color: '#4338ca', fontSize: '20px' } }, '📝 Notion Integration'),
            React.createElement('p', { style: { margin: '5px 0 0 0', color: '#4338ca', fontSize: '14px' } }, 'Content management and documentation')
          ),
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
            React.createElement('span', {
              style: { 
                padding: '4px 8px', 
                backgroundColor: notionConnected ? '#10b981' : '#f59e0b', 
                color: 'white', 
                borderRadius: '12px', 
                fontSize: '12px',
                fontWeight: 'bold'
              }
            }, notionConnected ? 'Connected' : 'Ready to Connect'),
            React.createElement('button', {
              onClick: () => setNotionConnected(!notionConnected),
              style: {
                padding: '10px 20px',
                backgroundColor: notionConnected ? '#ef4444' : '#4338ca',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }
            }, notionConnected ? 'Disconnect' : '🔗 Connect Notion')
          )
        ),
        notionConnected ? 
          React.createElement('div', null,
            React.createElement('h4', { style: { color: '#4338ca', marginBottom: '15px' } }, '📄 Connected to Internal Hub'),
            React.createElement('div', { style: { fontSize: '14px', color: '#6b7280', marginBottom: '15px' } }, 'Content Calendar • Brand Guidelines • Templates'),
            React.createElement('div', {
              style: { 
                padding: '15px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                borderRadius: '8px',
                marginTop: '15px'
              }
            },
              React.createElement('p', { style: { margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold', color: '#4338ca' } }, '🔗 Database Access Links:'),
              React.createElement('div', { style: { fontSize: '12px', color: '#6b7280', lineHeight: '1.5' } },
                React.createElement('p', { style: { margin: '5px 0' } }, '• For individual database connections, use Notion API integration'),
                React.createElement('p', { style: { margin: '5px 0' } }, '• Each database requires separate API key configuration'),
                React.createElement('p', { style: { margin: '5px 0' } }, '• Go to notion.so/my-integrations for API key management')
              )
            )
          ) :
          React.createElement('div', { style: { textAlign: 'center', padding: '30px' } },
            React.createElement('div', { style: { fontSize: '48px', marginBottom: '15px' } }, '📝'),
            React.createElement('p', { style: { color: '#4338ca', fontSize: '16px', marginBottom: '10px' } }, 'Connect your Notion workspace'),
            React.createElement('p', { style: { color: '#6b7280', fontSize: '14px', marginBottom: '15px' } }, 'Access your content calendars, brand guidelines, and documentation'),
            React.createElement('div', {
              style: { 
                padding: '15px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                borderRadius: '8px',
                marginTop: '15px'
              }
            },
              React.createElement('p', { style: { margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold', color: '#4338ca' } }, '🔗 Main Hub Link:'),
              React.createElement('a', {
                href: 'https://www.notion.so/INTERNAL-HUB-2256ace1e8398087a3c9d25c1cf253e5',
                target: '_blank',
                rel: 'noopener noreferrer',
                style: { 
                  fontSize: '12px', 
                  color: '#4338ca', 
                  textDecoration: 'underline',
                  wordBreak: 'break-all'
                }
              }, 'notion.so/INTERNAL-HUB-2256ace1e8398087a3c9d25c1cf253e5')
            )
          )
      ),

      // Wasabi Integration
      React.createElement('div', {
        style: { 
          padding: '25px', 
          border: '2px solid #dc2626', 
          borderRadius: '12px', 
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
        }
      },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' } },
          React.createElement('div', null,
            React.createElement('h3', { style: { margin: '0', color: '#dc2626', fontSize: '20px' } }, '📦 Wasabi Cloud Storage'),
            React.createElement('p', { style: { margin: '5px 0 0 0', color: '#dc2626', fontSize: '14px' } }, 'Internal assets & public member content storage')
          ),
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
            React.createElement('span', {
              style: { 
                padding: '4px 8px', 
                backgroundColor: wasabiConnected ? '#10b981' : '#f59e0b', 
                color: 'white', 
                borderRadius: '12px', 
                fontSize: '12px',
                fontWeight: 'bold'
              }
            }, wasabiConnected ? 'Connected' : 'Ready to Connect'),
            React.createElement('button', {
              onClick: () => setWasabiConnected(!wasabiConnected),
              style: {
                padding: '10px 20px',
                backgroundColor: wasabiConnected ? '#ef4444' : '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }
            }, wasabiConnected ? 'Disconnect' : '🔗 Connect Wasabi')
          )
        ),
        wasabiConnected ? 
          React.createElement('div', null,
            React.createElement('h4', { style: { color: '#dc2626', marginBottom: '15px' } }, '📂 Files'),
            React.createElement('div', { style: { fontSize: '14px', color: '#6b7280' } }, 'brand-assets.zip • video-content/ • templates/')
          ) :
          React.createElement('div', { style: { textAlign: 'center', padding: '30px' } },
            React.createElement('div', { style: { fontSize: '48px', marginBottom: '15px' } }, '📦'),
            React.createElement('p', { style: { color: '#dc2626', fontSize: '16px', marginBottom: '10px' } }, 'Connect your Wasabi storage'),
            React.createElement('p', { style: { color: '#6b7280', fontSize: '14px' } }, 'Dual storage: Internal assets & public member content')
          )
      ),

      // Canva Integration
      React.createElement('div', {
        style: { 
          padding: '25px', 
          border: '2px solid #7c3aed', 
          borderRadius: '12px', 
          background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)'
        }
      },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' } },
          React.createElement('div', null,
            React.createElement('h3', { style: { margin: '0', color: '#7c3aed', fontSize: '20px' } }, '🎨 Canva Integration'),
            React.createElement('p', { style: { margin: '5px 0 0 0', color: '#7c3aed', fontSize: '14px' } }, 'Design platform for visual content creation')
          ),
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
            React.createElement('span', {
              style: { 
                padding: '4px 8px', 
                backgroundColor: canvaConnected ? '#10b981' : '#f59e0b', 
                color: 'white', 
                borderRadius: '12px', 
                fontSize: '12px',
                fontWeight: 'bold'
              }
            }, canvaConnected ? 'Connected' : 'Ready to Connect'),
            React.createElement('button', {
              onClick: canvaConnected ? () => setCanvaConnected(false) : connectCanva,
              disabled: canvaLoading,
              style: {
                padding: '10px 20px',
                backgroundColor: canvaConnected ? '#ef4444' : '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: canvaLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                opacity: canvaLoading ? 0.7 : 1
              }
            }, canvaLoading ? '⏳ Connecting...' : (canvaConnected ? 'Disconnect' : '🔗 Connect Canva'))
          )
        ),
        canvaConnected ? 
          React.createElement('div', null,
            React.createElement('h4', { style: { color: '#7c3aed', marginBottom: '15px' } }, '🎨 Your Designs (' + canvaDesigns.length + ')'),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' } },
              ...canvaDesigns.map(design =>
                React.createElement('div', {
                  key: design.id,
                  style: { 
                    padding: '15px', 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    border: '1px solid #ddd6fe', 
                    borderRadius: '12px',
                    cursor: 'pointer'
                  }
                },
                  React.createElement('img', {
                    src: design.thumbnail,
                    alt: design.name,
                    style: { 
                      width: '100%', 
                      height: '150px', 
                      objectFit: 'cover', 
                      borderRadius: '8px',
                      marginBottom: '12px'
                    }
                  }),
                  React.createElement('h5', { style: { margin: '0 0 8px 0', color: '#1f2937', fontSize: '14px', fontWeight: 'bold' } }, design.name),
                  React.createElement('p', { style: { margin: '0 0 12px 0', color: '#6b7280', fontSize: '12px' } }, 
                    design.type.replace('_', ' ') + ' • ' + design.lastModified
                  ),
                  React.createElement('div', { style: { display: 'flex', gap: '8px' } },
                    React.createElement('button', {
                      onClick: (e) => {
                        e.stopPropagation();
                        alert('Edit functionality ready for Canva API integration');
                      },
                      style: { 
                        flex: '1',
                        padding: '8px', 
                        backgroundColor: '#7c3aed', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        cursor: 'pointer'
                      }
                    }, '✏️ Edit'),
                    React.createElement('button', {
                      onClick: (e) => {
                        e.stopPropagation();
                        alert('Exporting ' + design.name + ' to Wasabi...');
                      },
                      style: { 
                        flex: '1',
                        padding: '8px', 
                        backgroundColor: '#10b981', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        cursor: 'pointer'
                      }
                    }, '📥 Export')
                  )
                )
              )
            )
          ) :
          React.createElement('div', { style: { textAlign: 'center', padding: '30px' } },
            React.createElement('div', { style: { fontSize: '48px', marginBottom: '15px' } }, '🎨'),
            React.createElement('p', { style: { color: '#7c3aed', fontSize: '16px', marginBottom: '10px' } }, 'Connect your Canva account'),
            React.createElement('p', { style: { color: '#6b7280', fontSize: '14px', marginBottom: '15px' } }, 'Access your designs, templates, and create new visual content'),
            React.createElement('div', {
              style: { 
                padding: '15px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                borderRadius: '8px',
                marginTop: '15px'
              }
            },
              React.createElement('p', { style: { margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold', color: '#7c3aed' } }, '🔗 Dev App Setup:'),
              React.createElement('a', {
                href: 'https://www.canva.com/developers/apps',
                target: '_blank',
                rel: 'noopener noreferrer',
                style: { 
                  fontSize: '12px', 
                  color: '#7c3aed', 
                  textDecoration: 'underline'
                }
              }, 'canva.com/developers/apps'),
              React.createElement('p', { style: { margin: '10px 0 0 0', fontSize: '12px', color: '#6b7280' } }, 'Create your app and get API credentials for integration')
            )
          )
      )
    )
  );
}

function AdminBrand() {
  const [selectedTab, setSelectedTab] = React.useState('overview');

  return React.createElement('div', { style: { padding: '20px' } },
    React.createElement('h2', null, '🏢 Brand Kit'),
    React.createElement('p', null, 'Brand assets, guidelines, and system configuration'),
    
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
        onClick: () => setSelectedTab('overview'),
        style: {
          padding: '12px 20px',
          backgroundColor: selectedTab === 'overview' ? '#3b82f6' : 'transparent',
          color: selectedTab === 'overview' ? 'white' : '#6b7280',
          border: 'none',
          borderBottom: selectedTab === 'overview' ? '3px solid #3b82f6' : '3px solid transparent',
          cursor: 'pointer',
          fontWeight: selectedTab === 'overview' ? 'bold' : 'normal'
        }
      }, '📊 System Overview'),
      React.createElement('button', {
        onClick: () => setSelectedTab('assets'),
        style: {
          padding: '12px 20px',
          backgroundColor: selectedTab === 'assets' ? '#3b82f6' : 'transparent',
          color: selectedTab === 'assets' ? 'white' : '#6b7280',
          border: 'none',
          borderBottom: selectedTab === 'assets' ? '3px solid #3b82f6' : '3px solid transparent',
          cursor: 'pointer',
          fontWeight: selectedTab === 'assets' ? 'bold' : 'normal'
        }
      }, '🎨 Brand Assets')
    ),

    selectedTab === 'overview' ? 
      React.createElement('div', { style: { display: 'grid', gap: '20px' } },
        React.createElement('div', {
          style: { 
            padding: '25px', 
            border: '2px solid #10b981', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' 
          }
        },
          React.createElement('h3', { style: { color: '#047857', marginBottom: '15px' } }, '📊 System Status'),
          React.createElement('p', { style: { fontSize: '14px', color: '#047857', marginBottom: '20px' } }, 'Current system health and integrations'),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' } },
            React.createElement('div', {
              style: { 
                padding: '15px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }
            },
              React.createElement('div', { style: { width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '50%' } }),
              React.createElement('span', { style: { fontSize: '14px', fontWeight: 'bold' } }, 'Dashboard Online')
            ),
            React.createElement('div', {
              style: { 
                padding: '15px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }
            },
              React.createElement('div', { style: { width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '50%' } }),
              React.createElement('span', { style: { fontSize: '14px', fontWeight: 'bold' } }, 'External Integrations')
            )
          )
        )
      ) :
      React.createElement('div', { style: { display: 'grid', gap: '20px' } },
        React.createElement('div', {
          style: { 
            padding: '60px 40px', 
            border: '2px dashed #d1d5db', 
            borderRadius: '12px', 
            background: '#fafafa',
            textAlign: 'center'
          }
        },
          React.createElement('div', { style: { fontSize: '64px', marginBottom: '20px' } }, '🎨'),
          React.createElement('h3', { style: { color: '#6b7280', marginBottom: '15px', fontSize: '24px' } }, 'Brand Assets Library'),
          React.createElement('p', { style: { fontSize: '16px', color: '#9ca3af', marginBottom: '25px' } }, 'Coming soon: Logo management, color palettes, and brand guidelines'),
          React.createElement('button', {
            style: { 
              marginTop: '30px',
              padding: '15px 30px', 
              backgroundColor: '#f3f4f6', 
              border: '2px solid #d1d5db', 
              borderRadius: '8px', 
              cursor: 'not-allowed',
              color: '#6b7280',
              fontSize: '16px',
              fontWeight: 'bold'
            },
            disabled: true
          }, '🚧 Coming Soon')
        )
      )
  );
}

function ComingSoon({ title, description, icon = "🚧" }) {
  return React.createElement('div', {
    style: { 
      padding: '60px 40px', 
      textAlign: 'center',
      background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
      borderRadius: '12px',
      border: '2px dashed #d1d5db'
    }
  },
    React.createElement('div', { style: { fontSize: '64px', marginBottom: '20px' } }, icon),
    React.createElement('h2', { style: { color: '#6b7280', marginBottom: '15px', fontSize: '28px' } }, title),
    React.createElement('p', { style: { fontSize: '16px', color: '#9ca3af', marginBottom: '25px', maxWidth: '500px', margin: '0 auto 25px' } }, description),
    React.createElement('button', {
      style: { 
        padding: '15px 30px', 
        backgroundColor: '#f3f4f6', 
        border: '2px solid #d1d5db', 
        borderRadius: '8px', 
        cursor: 'not-allowed',
        color: '#6b7280',
        fontSize: '16px',
        fontWeight: 'bold'
      },
      disabled: true
    }, '🚧 Coming Soon')
  );
}

function App() {
  const [activeSection, setActiveSection] = React.useState('overview');

  const navigationItems = [
    { id: 'overview', icon: '📊', label: 'Overview', available: true },
    { id: 'content-manager', icon: '📝', label: 'Content Manager', available: false },
    { id: 'chat-manager-public', icon: '💬', label: 'Chat Manager - Public', available: true },
    { id: 'scheduler', icon: '📅', label: 'Scheduler', available: false },
    { id: 'marketing-center', icon: '🧠', label: 'Marketing Center', available: false },
    { id: 'settings', icon: '⚙️', label: 'Settings', available: true },
    { id: 'admin-center', icon: '🔧', label: 'Admin Center', available: true }
  ];

  const bottomNavItem = { 
    id: 'ai-chat-manager', 
    icon: '🤖', 
    label: 'AI Chat Manager', 
    available: false,
    note: 'Admin/Brand feature'
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return React.createElement('div', { style: { padding: '20px' } },
          React.createElement('h1', null, '📊 3C Content Center'),
          React.createElement('p', null, 'Welcome to your comprehensive content management dashboard'),
          
          React.createElement('div', {
            style: { 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '20px',
              marginTop: '30px'
            }
          },
            React.createElement('div', {
              style: { 
                padding: '25px', 
                border: '2px solid #3b82f6', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
              }
            },
              React.createElement('h3', { style: { color: '#1e40af', marginBottom: '15px' } }, '📝 Content Manager'),
              React.createElement('p', { style: { color: '#1e40af', fontSize: '14px', marginBottom: '20px' } }, 'Create, manage, and organize all your content with AI assistance and templates'),
              React.createElement('button', {
                onClick: () => setActiveSection('content-manager'),
                style: { 
                  padding: '10px 20px', 
                  backgroundColor: '#3b82f6', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }
              }, '📝 Create Content')
            ),
            React.createElement('div', {
              style: { 
                padding: '25px', 
                border: '2px solid #10b981', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
              }
            },
              React.createElement('h3', { style: { color: '#047857', marginBottom: '15px' } }, '💬 Chat Manager - Public'),
              React.createElement('p', { style: { color: '#047857', fontSize: '14px', marginBottom: '20px' } }, 'Manage customer communications, support emails, and notifications'),
              React.createElement('button', {
                onClick: () => setActiveSection('chat-manager-public'),
                style: { 
                  padding: '10px 20px', 
                  backgroundColor: '#10b981', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }
              }, '💬 Manage Chats')
            ),
            React.createElement('div', {
              style: { 
                padding: '25px', 
                border: '2px solid #f59e0b', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
              }
            },
              React.createElement('h3', { style: { color: '#92400e', marginBottom: '15px' } }, '📅 Content Scheduler'),
              React.createElement('p', { style: { color: '#92400e', fontSize: '14px', marginBottom: '20px' } }, 'Schedule and automate content publishing across all platforms'),
              React.createElement('button', {
                onClick: () => setActiveSection('scheduler'),
                style: { 
                  padding: '10px 20px', 
                  backgroundColor: '#f59e0b', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }
              }, '📅 Schedule Content')
            ),
            React.createElement('div', {
              style: { 
                padding: '25px', 
                border: '2px solid #7c3aed', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)'
              }
            },
              React.createElement('h3', { style: { color: '#7c3aed', marginBottom: '15px' } }, '🧠 Marketing Center'),
              React.createElement('p', { style: { color: '#7c3aed', fontSize: '14px', marginBottom: '20px' } }, 'Campaign management, analytics, and marketing automation tools'),
              React.createElement('button', {
                onClick: () => setActiveSection('marketing-center'),
                style: { 
                  padding: '10px 20px', 
                  backgroundColor: '#7c3aed', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }
              }, '🧠 Launch Campaigns')
            )
          )
        );

      case 'admin-center':
        return React.createElement(AdminCenter);

      case 'content-manager':
        return React.createElement(ComingSoon, {
          title: "Content Manager",
          description: "Advanced content creation and management tools with AI assistance and template integration.",
          icon: "📝"
        });

      case 'chat-manager-public':
        return React.createElement(ChatManagerPublic);

      case 'scheduler':
        return React.createElement(ComingSoon, {
          title: "Content Scheduler",
          description: "Schedule and automate content publishing across multiple platforms.",
          icon: "📅"
        });

      case 'marketing-center':
        return React.createElement(ComingSoon, {
          title: "Marketing Center",
          description: "Comprehensive marketing automation, campaign management, and analytics dashboard.",
          icon: "🧠"
        });

function Settings() {
  const [activeTab, setActiveTab] = React.useState('platforms');
  
  // Social Platforms State
  const [platforms, setPlatforms] = React.useState([
    { id: 1, name: 'Instagram', url: 'https://instagram.com/yourhandle', type: 'social' },
    { id: 2, name: 'Twitter/X', url: 'https://x.com/yourhandle', type: 'social' }
  ]);
  const [newPlatform, setNewPlatform] = React.useState({ name: '', url: '', type: 'social' });
  
  // Telegram Channels/Groups State
  const [telegramChannels, setTelegramChannels] = React.useState([
    { id: 1, name: 'group2', channel_group: '-1002377255109', thread_id: 'https://t.me/100237725510910', type: 'group' }
  ]);
  const [newTelegram, setNewTelegram] = React.useState({ name: '', channel_group: '', thread_id: '', type: 'channel' });
  
  // Character Profiles State
  const [characters, setCharacters] = React.useState([
    { 
      id: 1, 
      name: 'Dr. Sarah Chen', 
      bio: 'Wellness expert and mindfulness coach specializing in stress management and mental health.',
      image: 'https://via.placeholder.com/80x80/3b82f6/ffffff?text=SC',
      active: true 
    },
    { 
      id: 2, 
      name: 'Alex Rivera', 
      bio: 'Content creator focused on productivity tips and personal development strategies.',
      image: 'https://via.placeholder.com/80x80/10b981/ffffff?text=AR',
      active: true 
    }
  ]);
  const [newCharacter, setNewCharacter] = React.useState({ name: '', bio: '', image: '', active: true });
  
  // Error Logs State
  const [errorLogs, setErrorLogs] = React.useState([
    { id: 1, timestamp: '2025-01-20 14:30:25', type: 'API Error', message: 'Failed to post to Instagram - Rate limit exceeded', severity: 'warning' },
    { id: 2, timestamp: '2025-01-20 13:15:10', type: 'System Error', message: 'Character profile image failed to upload', severity: 'error' },
    { id: 3, timestamp: '2025-01-20 12:05:42', type: 'Info', message: 'Successfully posted to 3 platforms', severity: 'info' }
  ]);

  // Platform Functions
  const addPlatform = () => {
    if (!newPlatform.name.trim()) return;
    const platform = {
      ...newPlatform,
      id: Math.max(...platforms.map(p => p.id), 0) + 1
    };
    setPlatforms(prev => [...prev, platform]);
    setNewPlatform({ name: '', url: '', type: 'social' });
  };

  const removePlatform = (id) => {
    setPlatforms(prev => prev.filter(p => p.id !== id));
  };

  // Telegram Functions
  const addTelegram = () => {
    if (!newTelegram.name.trim() || !newTelegram.channel_group.trim()) return;
    const telegram = {
      ...newTelegram,
      id: Math.max(...telegramChannels.map(t => t.id), 0) + 1
    };
    setTelegramChannels(prev => [...prev, telegram]);
    setNewTelegram({ name: '', channel_group: '', thread_id: '', type: 'channel' });
  };

  const removeTelegram = (id) => {
    setTelegramChannels(prev => prev.filter(t => t.id !== id));
  };

  // Character Functions
  const addCharacter = () => {
    if (!newCharacter.name.trim() || !newCharacter.bio.trim()) return;
    const character = {
      ...newCharacter,
      id: Math.max(...characters.map(c => c.id), 0) + 1,
      image: newCharacter.image || `https://via.placeholder.com/80x80/7c3aed/ffffff?text=${newCharacter.name.charAt(0)}`
    };
    setCharacters(prev => [...prev, character]);
    setNewCharacter({ name: '', bio: '', image: '', active: true });
  };

  const removeCharacter = (id) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
  };

  const toggleCharacter = (id) => {
    setCharacters(prev => prev.map(c => 
      c.id === id ? { ...c, active: !c.active } : c
    ));
  };

  return React.createElement('div', { style: { padding: '20px' } },
    React.createElement('h2', null, '⚙️ Settings'),
    React.createElement('p', null, 'Configure social platforms and character profiles for your content system'),
    
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
        onClick: () => setActiveTab('platforms'),
        style: {
          padding: '12px 20px',
          backgroundColor: activeTab === 'platforms' ? '#3b82f6' : 'transparent',
          color: activeTab === 'platforms' ? 'white' : '#6b7280',
          border: 'none',
          borderBottom: activeTab === 'platforms' ? '3px solid #3b82f6' : '3px solid transparent',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: activeTab === 'platforms' ? 'bold' : 'normal'
        }
      }, '📱 Social Platforms'),
      React.createElement('button', {
        onClick: () => setActiveTab('characters'),
        style: {
          padding: '12px 20px',
          backgroundColor: activeTab === 'characters' ? '#3b82f6' : 'transparent',
          color: activeTab === 'characters' ? 'white' : '#6b7280',
          border: 'none',
          borderBottom: activeTab === 'characters' ? '3px solid #3b82f6' : '3px solid transparent',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: activeTab === 'characters' ? 'bold' : 'normal'
        }
      }, '👥 Character Profiles'),
      React.createElement('button', {
        onClick: () => setActiveTab('logs'),
        style: {
          padding: '12px 20px',
          backgroundColor: activeTab === 'logs' ? '#3b82f6' : 'transparent',
          color: activeTab === 'logs' ? 'white' : '#6b7280',
          border: 'none',
          borderBottom: activeTab === 'logs' ? '3px solid #3b82f6' : '3px solid transparent',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: activeTab === 'logs' ? 'bold' : 'normal'
        }
      }, '📋 Error Logs')
    ),

    // Social Platforms Tab
    activeTab === 'platforms' && React.createElement('div', { style: { display: 'grid', gap: '30px' } },
      // Regular Social Platforms
      React.createElement('div', {
        style: { 
          padding: '25px', 
          border: '2px solid #3b82f6', 
          borderRadius: '12px', 
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' 
        }
      },
        React.createElement('h3', { style: { color: '#1e40af', marginBottom: '20px', fontSize: '18px' } }, '📱 Social Media Platforms'),
        React.createElement('p', { style: { color: '#1e40af', fontSize: '14px', marginBottom: '20px' } }, 'Manage platforms where your characters can share content'),
        
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '15px', marginBottom: '20px' } },
          React.createElement('input', {
            type: 'text',
            value: newPlatform.name,
            onChange: (e) => setNewPlatform(prev => ({ ...prev, name: e.target.value })),
            placeholder: 'e.g., Instagram, YouTube, Pinterest',
            style: {
              padding: '12px',
              border: '1px solid #93c5fd',
              borderRadius: '6px',
              fontSize: '14px'
            }
          }),
          React.createElement('input', {
            type: 'url',
            value: newPlatform.url,
            onChange: (e) => setNewPlatform(prev => ({ ...prev, url: e.target.value })),
            placeholder: 'https://platform.com/yourhandle',
            style: {
              padding: '12px',
              border: '1px solid #93c5fd',
              borderRadius: '6px',
              fontSize: '14px'
            }
          }),
          React.createElement('button', {
            onClick: addPlatform,
            style: {
              padding: '12px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }
          }, '➕ Add')
        ),
        
        React.createElement('div', { style: { display: 'grid', gap: '10px' } },
          ...platforms.map(platform =>
            React.createElement('div', {
              key: platform.id,
              style: { 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '15px',
                backgroundColor: 'rgba(255,255,255,0.8)',
                borderRadius: '8px',
                border: '1px solid #93c5fd'
              }
            },
              React.createElement('div', null,
                React.createElement('div', { style: { fontWeight: 'bold', color: '#1e40af' } }, platform.name),
                React.createElement('div', { style: { fontSize: '12px', color: '#6b7280' } }, platform.url)
              ),
              React.createElement('button', {
                onClick: () => removePlatform(platform.id),
                style: {
                  padding: '8px 12px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }
              }, '🗑️ Remove')
            )
          )
        )
      ),

      // Telegram Channels/Groups
      React.createElement('div', {
        style: { 
          padding: '25px', 
          border: '2px solid #0891b2', 
          borderRadius: '12px', 
          background: 'linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)' 
        }
      },
        React.createElement('h3', { style: { color: '#0e7490', marginBottom: '20px', fontSize: '18px' } }, '📡 Telegram Channels & Groups'),
        React.createElement('p', { style: { color: '#0e7490', fontSize: '14px', marginBottom: '20px' } }, 'Configure Telegram channels and groups with topic/thread support'),
        
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr auto auto auto', gap: '15px', marginBottom: '20px' } },
          React.createElement('input', {
            type: 'text',
            value: newTelegram.name,
            onChange: (e) => setNewTelegram(prev => ({ ...prev, name: e.target.value })),
            placeholder: 'Name (e.g., group2)',
            style: {
              padding: '12px',
              border: '1px solid #67e8f9',
              borderRadius: '6px',
              fontSize: '14px'
            }
          }),
          React.createElement('input', {
            type: 'text',
            value: newTelegram.channel_group,
            onChange: (e) => setNewTelegram(prev => ({ ...prev, channel_group: e.target.value })),
            placeholder: 'Channel/Group ID (e.g., -1002377255109)',
            style: {
              padding: '12px',
              border: '1px solid #67e8f9',
              borderRadius: '6px',
              fontSize: '14px'
            }
          }),
          React.createElement('select', {
            value: newTelegram.type,
            onChange: (e) => setNewTelegram(prev => ({ ...prev, type: e.target.value })),
            style: {
              padding: '12px',
              border: '1px solid #67e8f9',
              borderRadius: '6px',
              fontSize: '14px'
            }
          },
            React.createElement('option', { value: 'channel' }, 'Channel'),
            React.createElement('option', { value: 'group' }, 'Group')
          ),
          React.createElement('input', {
            type: 'text',
            value: newTelegram.thread_id,
            onChange: (e) => setNewTelegram(prev => ({ ...prev, thread_id: e.target.value })),
            placeholder: 'Thread/Topic ID (optional)',
            style: {
              padding: '12px',
              border: '1px solid #67e8f9',
              borderRadius: '6px',
              fontSize: '14px'
            }
          }),
          React.createElement('button', {
            onClick: addTelegram,
            style: {
              padding: '12px 20px',
              backgroundColor: '#0891b2',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }
          }, '➕ Add')
        ),
        
        React.createElement('div', { style: { display: 'grid', gap: '10px' } },
          ...telegramChannels.map(telegram =>
            React.createElement('div', {
              key: telegram.id,
              style: { 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '15px',
                backgroundColor: 'rgba(255,255,255,0.8)',
                borderRadius: '8px',
                border: '1px solid #67e8f9'
              }
            },
              React.createElement('div', null,
                React.createElement('div', { style: { fontWeight: 'bold', color: '#0e7490' } }, 
                  telegram.name + ' (' + telegram.type + ')'
                ),
                React.createElement('div', { style: { fontSize: '12px', color: '#6b7280' } }, 
                  'ID: ' + telegram.channel_group + (telegram.thread_id ? ' • Thread: ' + telegram.thread_id : '')
                )
              ),
              React.createElement('button', {
                onClick: () => removeTelegram(telegram.id),
                style: {
                  padding: '8px 12px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }
              }, '🗑️ Remove')
            )
          )
        )
      )
    ),

    // Character Profiles Tab
    activeTab === 'characters' && React.createElement('div', { style: { display: 'grid', gap: '30px' } },
      React.createElement('div', {
        style: { 
          padding: '25px', 
          border: '2px solid #7c3aed', 
          borderRadius: '12px', 
          background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)' 
        }
      },
        React.createElement('h3', { style: { color: '#7c3aed', marginBottom: '20px', fontSize: '18px' } }, '👥 Character Profiles'),
        React.createElement('p', { style: { color: '#7c3aed', fontSize: '14px', marginBottom: '20px' } }, 'Manage character personas for content creation and posting'),
        
        React.createElement('div', { style: { display: 'grid', gap: '20px', marginBottom: '30px' } },
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' } },
            React.createElement('input', {
              type: 'text',
              value: newCharacter.name,
              onChange: (e) => setNewCharacter(prev => ({ ...prev, name: e.target.value })),
              placeholder: 'Character Name (e.g., Dr. Sarah Chen)',
              style: {
                padding: '12px',
                border: '1px solid #c4b5fd',
                borderRadius: '6px',
                fontSize: '14px'
              }
            }),
            React.createElement('input', {
              type: 'url',
              value: newCharacter.image,
              onChange: (e) => setNewCharacter(prev => ({ ...prev, image: e.target.value })),
              placeholder: 'Profile Image URL (optional)',
              style: {
                padding: '12px',
                border: '1px solid #c4b5fd',
                borderRadius: '6px',
                fontSize: '14px'
              }
            })
          ),
          React.createElement('textarea', {
            value: newCharacter.bio,
            onChange: (e) => setNewCharacter(prev => ({ ...prev, bio: e.target.value })),
            placeholder: 'Character bio and expertise (e.g., Wellness expert and mindfulness coach...)',
            style: {
              padding: '12px',
              border: '1px solid #c4b5fd',
              borderRadius: '6px',
              fontSize: '14px',
              minHeight: '80px',
              resize: 'vertical'
            }
          }),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end' } },
            React.createElement('button', {
              onClick: addCharacter,
              style: {
                padding: '12px 24px',
                backgroundColor: '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }
            }, '➕ Add Character')
          )
        ),
        
        React.createElement('div', { style: { display: 'grid', gap: '15px' } },
          ...characters.map(character =>
            React.createElement('div', {
              key: character.id,
              style: { 
                display: 'flex', 
                gap: '15px',
                padding: '20px',
                backgroundColor: 'rgba(255,255,255,0.8)',
                borderRadius: '12px',
                border: '1px solid #c4b5fd',
                opacity: character.active ? 1 : 0.6
              }
            },
              React.createElement('img', {
                src: character.image,
                alt: character.name,
                style: {
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }
              }),
              React.createElement('div', { style: { flex: '1' } },
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' } },
                  React.createElement('h4', { style: { margin: '0', color: '#7c3aed', fontSize: '16px' } }, character.name),
                  React.createElement('span', {
                    style: { 
                      padding: '2px 8px', 
                      backgroundColor: character.active ? '#10b981' : '#6b7280', 
                      color: 'white', 
                      borderRadius: '12px', 
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }
                  }, character.active ? 'Active' : 'Inactive')
                ),
                React.createElement('p', { style: { margin: '0', color: '#6b7280', fontSize: '14px', lineHeight: '1.4' } }, character.bio)
              ),
              React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
                React.createElement('button', {
                  onClick: () => toggleCharacter(character.id),
                  style: {
                    padding: '8px 12px',
                    backgroundColor: character.active ? '#f59e0b' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }
                }, character.active ? '⏸️ Deactivate' : '▶️ Activate'),
                React.createElement('button', {
                  onClick: () => removeCharacter(character.id),
                  style: {
                    padding: '8px 12px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }
                }, '🗑️ Remove')
              )
            )
          )
        )
      )
    ),

    // Error Logs Tab
    activeTab === 'logs' && React.createElement('div', { style: { display: 'grid', gap: '30px' } },
      React.createElement('div', {
        style: { 
          padding: '25px', 
          border: '2px solid #ef4444', 
          borderRadius: '12px', 
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' 
        }
      },
        React.createElement('h3', { style: { color: '#dc2626', marginBottom: '20px', fontSize: '18px' } }, '📋 System Error Logs'),
        React.createElement('p', { style: { color: '#dc2626', fontSize: '14px', marginBottom: '20px' } }, 'Monitor system errors and posting issues'),
        
        React.createElement('div', { style: { display: 'grid', gap: '10px' } },
          ...errorLogs.map(log =>
            React.createElement('div', {
              key: log.id,
              style: { 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                padding: '15px',
                backgroundColor: 'rgba(255,255,255,0.8)',
                borderRadius: '8px',
                borderLeft: `4px solid ${log.severity === 'error' ? '#ef4444' : log.severity === 'warning' ? '#f59e0b' : '#10b981'}`
              }
            },
              React.createElement('div', { style: { flex: '1' } },
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' } },
                  React.createElement('span', { style: { fontWeight: 'bold', color: '#dc2626' } }, log.type),
                  React.createElement('span', {
                    style: { 
                      padding: '2px 6px', 
                      backgroundColor: log.severity === 'error' ? '#ef4444' : log.severity === 'warning' ? '#f59e0b' : '#10b981', 
                      color: 'white', 
                      borderRadius: '8px', 
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }
                  }, log.severity.toUpperCase())
                ),
                React.createElement('div', { style: { color: '#6b7280', fontSize: '14px', marginBottom: '4px' } }, log.message),
                React.createElement('div', { style: { color: '#9ca3af', fontSize: '12px' } }, log.timestamp)
              )
            )
          )
        ),
        
        React.createElement('div', { style: { marginTop: '20px', textAlign: 'center' } },
          React.createElement('button', {
            style: {
              padding: '10px 20px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }
          }, '🗑️ Clear All Logs')
        )
      )
    )
  );
}

      case 'ai-chat-manager':
        return React.createElement(ComingSoon, {
          title: "AI Chat Manager",
          description: "Advanced AI-powered chat management for internal team communication.",
          icon: "🤖"
        });

      default:
        return React.createElement('div', null, 'Section not found');
    }
  };

  return React.createElement('div', { style: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' } },
    React.createElement('div', {
      style: { 
        width: '280px', 
        backgroundColor: '#ffffff', 
        borderRight: '1px solid #e5e7eb',
        padding: '20px 0',
        display: 'flex',
        flexDirection: 'column'
      }
    },
      React.createElement('div', {
        style: { 
          padding: '0 20px 30px 20px', 
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '20px'
        }
      },
        React.createElement('h2', {
          style: { 
            margin: '0', 
            color: '#1f2937', 
            fontSize: '20px',
            fontWeight: 'bold'
          }
        }, '3C Content Center'),
        React.createElement('p', {
          style: { 
            margin: '5px 0 0 0', 
            color: '#6b7280', 
            fontSize: '14px' 
          }
        }, 'Admin Dashboard')
      ),

      React.createElement('div', { style: { flex: '1', padding: '0 10px' } },
        ...navigationItems.map((item) =>
          React.createElement('button', {
            key: item.id,
            onClick: () => item.available && setActiveSection(item.id),
            style: {
              width: '100%',
              padding: '12px 15px',
              marginBottom: '5px',
              backgroundColor: activeSection === item.id ? '#3b82f6' : 'transparent',
              color: activeSection === item.id ? '#ffffff' : (item.available ? '#374151' : '#9ca3af'),
              border: 'none',
              borderRadius: '8px',
              textAlign: 'left',
              cursor: item.available ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: activeSection === item.id ? 'bold' : 'normal',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s',
              opacity: item.available ? 1 : 0.6
            }
          },
            React.createElement('span', { style: { fontSize: '16px' } }, item.icon),
            React.createElement('span', { style: { flex: '1' } }, item.label),
            !item.available && React.createElement('span', {
              style: { 
                fontSize: '10px', 
                backgroundColor: '#f59e0b', 
                color: 'white', 
                padding: '2px 6px', 
                borderRadius: '8px',
                fontWeight: 'bold'
              }
            }, 'Soon')
          )
        )
      ),

      React.createElement('div', {
        style: { 
          padding: '20px 10px 0 10px', 
          borderTop: '1px solid #e5e7eb',
          marginTop: '20px'
        }
      },
        React.createElement('button', {
          style: {
            width: '100%',
            padding: '12px 15px',
            backgroundColor: 'transparent',
            color: '#9ca3af',
            border: 'none',
            borderRadius: '8px',
            textAlign: 'left',
            cursor: 'not-allowed',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            opacity: 0.6
          }
        },
          React.createElement('span', { style: { fontSize: '16px' } }, bottomNavItem.icon),
          React.createElement('div', { style: { flex: '1' } },
            React.createElement('div', null, bottomNavItem.label),
            React.createElement('div', { style: { fontSize: '10px', opacity: 0.8 } }, bottomNavItem.note)
          ),
          React.createElement('span', {
            style: { 
              fontSize: '10px', 
              backgroundColor: '#f59e0b', 
              color: 'white', 
              padding: '2px 6px', 
              borderRadius: '8px',
              fontWeight: 'bold'
            }
          }, 'Soon')
        )
      )
    ),

    React.createElement('div', { style: { flex: '1', backgroundColor: '#ffffff' } },
      renderContent()
    )
  );
}

function AdminCenter() {
  const [activeTab, setActiveTab] = React.useState('templates');

  return React.createElement('div', null,
    React.createElement('div', {
      style: { 
        borderBottom: '1px solid #e5e7eb', 
        backgroundColor: '#f9fafb', 
        padding: '0 20px' 
      }
    },
      React.createElement('div', { style: { display: 'flex', gap: '0' } },
        React.createElement('button', {
          onClick: () => setActiveTab('templates'),
          style: {
            padding: '12px 24px',
            backgroundColor: activeTab === 'templates' ? '#ffffff' : 'transparent',
            color: activeTab === 'templates' ? '#1f2937' : '#6b7280',
            border: 'none',
            borderBottom: activeTab === 'templates' ? '2px solid #3b82f6' : '2px solid transparent',
            fontWeight: activeTab === 'templates' ? 'bold' : 'normal',
            cursor: 'pointer'
          }
        }, '🏗️ Manage Templates'),
        React.createElement('button', {
          onClick: () => setActiveTab('libraries'),
          style: {
            padding: '12px 24px',
            backgroundColor: activeTab === 'libraries' ? '#ffffff' : 'transparent',
            color: activeTab === 'libraries' ? '#1f2937' : '#6b7280',
            border: 'none',
            borderBottom: activeTab === 'libraries' ? '2px solid #3b82f6' : '2px solid transparent',
            fontWeight: activeTab === 'libraries' ? 'bold' : 'normal',
            cursor: 'pointer'
          }
        }, '📚 Libraries'),
        React.createElement('button', {
          onClick: () => setActiveTab('brand'),
          style: {
            padding: '12px 24px',
            backgroundColor: activeTab === 'brand' ? '#ffffff' : 'transparent',
            color: activeTab === 'brand' ? '#1f2937' : '#6b7280',
            border: 'none',
            borderBottom: activeTab === 'brand' ? '2px solid #3b82f6' : '2px solid transparent',
            fontWeight: activeTab === 'brand' ? 'bold' : 'normal',
            cursor: 'pointer'
          }
        }, '🏢 Brand Kit')
      )
    ),

    activeTab === 'templates' && React.createElement(AdminTemplates),
    activeTab === 'libraries' && React.createElement(AdminLibraries),
    activeTab === 'brand' && React.createElement(AdminBrand)
  );
}

export default App;
