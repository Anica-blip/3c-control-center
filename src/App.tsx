import React, { useState, useEffect, createContext, useContext } from 'react';

// Import your real components
import ContentComponent from './contentcomponent';
import ChatManagerPublic from './webchat';
import ScheduleComponentContent from './schedulecomponent';
import MarketingControlCenter from './marketingcomponent';
import SettingsComponentContent from './settingscomponent';
import AdminComponentsContent from './admincomponents';

// Theme Context
const ThemeContext = createContext({
  isDarkMode: false,
  toggleDarkMode: () => {}
});

const useTheme = () => useContext(ThemeContext);

// =============================================================================
// AUTHENTICATION SYSTEM
// =============================================================================

const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simple password check
    setTimeout(() => {
      if (password === '3c-internal-2025') {
        localStorage.setItem('3c-authenticated', 'true');
        onLogin();
      } else {
        setError('Invalid password. Please try again.');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e5e7eb'
      }}>
        {/* Logo Section */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            🎯
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#3b82f6',
            margin: '0 0 8px 0'
          }}>
            3C Control Center
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            margin: '0'
          }}>
            Internal Dashboard Access
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Access Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter dashboard password"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: isLoading ? '#f9fafb' : 'white',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <p style={{
                color: '#dc2626',
                fontSize: '14px',
                margin: '0'
              }}>
                🚨 {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password.trim()}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isLoading || !password.trim() ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading || !password.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isLoading ? '🔐 Authenticating...' : '🚀 Access Dashboard'}
          </button>
        </form>

        {/* Security Notice */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          border: '1px solid #d1d5db'
        }}>
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            margin: '0',
            textAlign: 'center',
            lineHeight: '1.5'
          }}>
            🔒 <strong>Internal Use Only</strong><br />
            This dashboard contains sensitive business information.<br />
            Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// OVERVIEW COMPONENT
// =============================================================================

const OverviewComponent = () => {
  const { isDarkMode } = useTheme();
  
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const quickActions = [
    { icon: '📝', label: 'Create Content', section: 'content-manager', color: '#3b82f6' },
    { icon: '📅', label: 'Schedule Posts', section: 'schedule-manager', color: '#10b981' },
    { icon: '💬', label: 'Manage Chat', section: 'webchat-public', color: '#8b5cf6' },
    { icon: '📊', label: 'View Analytics', section: 'marketing-center', color: '#f59e0b' },
    { icon: '⚙️', label: 'Settings', section: 'settings', color: '#6b7280' },
    { icon: '🔧', label: 'Admin Panel', section: 'admin-center', color: '#ef4444' }
  ];

  const recentActivity = [
    { icon: '📝', action: 'New content created', time: '2 min ago', status: 'success' },
    { icon: '📤', action: 'Post scheduled for tomorrow', time: '15 min ago', status: 'pending' },
    { icon: '💬', action: 'Chat message received', time: '1 hour ago', status: 'info' },
    { icon: '🔄', action: 'Settings updated', time: '3 hours ago', status: 'success' },
    { icon: '📊', action: 'Weekly report generated', time: '1 day ago', status: 'info' }
  ];

  const metrics = [
    { label: 'Active Posts', value: '24', change: '+12%', color: '#10b981' },
    { label: 'Scheduled', value: '8', change: '+5%', color: '#3b82f6' },
    { label: 'Chat Messages', value: '156', change: '+23%', color: '#8b5cf6' },
    { label: 'Engagement', value: '89%', change: '+8%', color: '#f59e0b' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
      paddingTop: '80px',
      padding: '80px 20px 20px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Welcome Header */}
        <div style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
            : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
          color: 'white',
          boxShadow: isDarkMode 
            ? '0 8px 25px rgba(0, 0, 0, 0.3)' 
            : '0 8px 25px rgba(59, 130, 246, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                margin: '0 0 8px 0'
              }}>
                🎯 3C Control Center
              </h1>
              <p style={{
                fontSize: '18px',
                opacity: 0.9,
                margin: '0'
              }}>
                Welcome to your content management dashboard
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {currentTime.toLocaleTimeString('en-GB', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  timeZone: 'Europe/Lisbon'
                })}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>
                {currentTime.toLocaleDateString('en-GB', { 
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  timeZone: 'Europe/Lisbon'
                })}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>
                WEST (UTC+1)
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {metrics.map((metric, index) => (
            <div key={index} style={{
              backgroundColor: isDarkMode ? '#1e293b' : 'white',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: isDarkMode 
                ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
                : '0 4px 6px rgba(0, 0, 0, 0.1)',
              border: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <p style={{
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
                    fontSize: '14px',
                    margin: '0 0 4px 0'
                  }}>
                    {metric.label}
                  </p>
                  <p style={{
                    color: isDarkMode ? '#f8fafc' : '#111827',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    margin: '0'
                  }}>
                    {metric.value}
                  </p>
                </div>
                <div style={{
                  backgroundColor: metric.color + '20',
                  color: metric.color,
                  padding: '4px 8px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {metric.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Quick Actions */}
          <div style={{
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: isDarkMode 
              ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
              : '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb'
          }}>
            <h3 style={{
              color: isDarkMode ? '#f8fafc' : '#111827',
              fontSize: '18px',
              fontWeight: 'bold',
              margin: '0 0 16px 0'
            }}>
              🚀 Quick Actions
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '12px'
            }}>
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    window.location.hash = action.section;
                    window.dispatchEvent(new HashChangeEvent('hashchange'));
                  }}
                  style={{
                    padding: '16px',
                    backgroundColor: isDarkMode ? '#334155' : '#f8fafc',
                    border: isDarkMode ? '1px solid #475569' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = action.color + '20';
                    e.currentTarget.style.borderColor = action.color;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f8fafc';
                    e.currentTarget.style.borderColor = isDarkMode ? '#475569' : '#e5e7eb';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                    {action.icon}
                  </div>
                  <div style={{
                    color: isDarkMode ? '#f8fafc' : '#374151',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {action.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: isDarkMode 
              ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
              : '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb'
          }}>
            <h3 style={{
              color: isDarkMode ? '#f8fafc' : '#111827',
              fontSize: '18px',
              fontWeight: 'bold',
              margin: '0 0 16px 0'
            }}>
              📊 Recent Activity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentActivity.map((activity, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: isDarkMode ? '#334155' : '#f8fafc',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontSize: '16px' }}>
                    {activity.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      color: isDarkMode ? '#f8fafc' : '#374151',
                      fontSize: '13px',
                      margin: '0 0 2px 0'
                    }}>
                      {activity.action}
                    </p>
                    <p style={{
                      color: isDarkMode ? '#94a3b8' : '#6b7280',
                      fontSize: '11px',
                      margin: '0'
                    }}>
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div style={{
          marginTop: '24px',
          backgroundColor: isDarkMode ? '#1e293b' : 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: isDarkMode 
            ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{
                color: isDarkMode ? '#f8fafc' : '#111827',
                margin: '0 0 4px 0'
              }}>
                🔧 System Status
              </h4>
              <p style={{
                color: isDarkMode ? '#94a3b8' : '#6b7280',
                fontSize: '14px',
                margin: '0'
              }}>
                All systems operational
              </p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#10b981'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#10b981',
                borderRadius: '50%'
              }}></div>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>
                Online
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '32px',
          padding: '20px',
          backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
          borderRadius: '8px',
          textAlign: 'center',
          border: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb'
        }}>
          <p style={{
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            fontSize: '12px',
            margin: '0 0 8px 0'
          }}>
            🔒 <strong>Internal Use Only</strong> • Designed by Claude • © 2025 GitHub Repository
          </p>
          <p style={{
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            fontSize: '11px',
            margin: '0'
          }}>
            🌍 Language: English (UK) • ⏰ Timezone: WEST (UTC+1) • 🎯 3C Control Center v1.0
          </p>
        </div>
      </div>
    </div>
  );
};

// Content Manager Component with Dark Mode Support
const ContentManager = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#0f172a' : '#f3f4f6',
      paddingTop: '80px',
      padding: '80px 20px 20px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: isDarkMode ? '#1e293b' : 'white',
          boxShadow: isDarkMode 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          border: `1px solid ${isDarkMode ? '#334155' : '#3b82f6'}`
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'black',
            color: isDarkMode ? '#60a5fa' : '#3b82f6',
            margin: '0 0 8px 0'
          }}>
            🎯 Content Manager
          </h1>
          <p style={{
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            fontSize: '16px',
            margin: '0',
            fontWeight: 'bold'
          }}>
            Create, manage, and schedule your social media content with ease
          </p>
        </div>

        {/* Rest of component wrapped in light container */}
        <div style={{
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          boxShadow: isDarkMode 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <ContentComponent />
        </div>
      </div>
    </div>
  );
};

// WebChat Component with Dark Mode Support
const WebChatComponent = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
      paddingTop: '80px',
      padding: '80px 20px 20px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: isDarkMode ? '#1e293b' : 'white',
          boxShadow: isDarkMode 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          border: `1px solid ${isDarkMode ? '#334155' : '#3b82f6'}`
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'black',
            color: isDarkMode ? '#60a5fa' : '#3b82f6',
            margin: '0 0 8px 0'
          }}>
            💬 Chat Manager - Public
          </h1>
          <p style={{
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            fontSize: '16px',
            margin: '0',
            fontWeight: 'bold'
          }}>
            Manage customer communications, support emails, and notifications
          </p>
        </div>

        {/* Rest of component wrapped in white container */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: isDarkMode 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <ChatManagerPublic />
        </div>
      </div>
    </div>
  );
};

// Schedule Component with Dark Mode Support
const ScheduleComponent = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
      paddingTop: '80px',
      padding: '80px 20px 20px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: isDarkMode ? '#1e293b' : 'white',
          boxShadow: isDarkMode 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          border: `1px solid ${isDarkMode ? '#334155' : '#3b82f6'}`
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'black',
            color: isDarkMode ? '#60a5fa' : '#3b82f6',
            margin: '0 0 8px 0'
          }}>
            📅 Schedule Manager
          </h1>
          <p style={{
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            fontSize: '16px',
            margin: '0',
            fontWeight: 'bold'
          }}>
            Schedule posts and track their delivery status
          </p>
        </div>

        {/* Rest of component wrapped in white container */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: isDarkMode 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <ScheduleComponentContent />
        </div>
      </div>
    </div>
  );
};

// Marketing Component with Dark Mode Support
const MarketingComponent = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
      paddingTop: '80px',
      padding: '80px 20px 20px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: isDarkMode ? '#1e293b' : 'white',
          boxShadow: isDarkMode 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          border: `1px solid ${isDarkMode ? '#334155' : '#3b82f6'}`
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'black',
            color: isDarkMode ? '#60a5fa' : '#3b82f6',
            margin: '0 0 8px 0'
          }}>
            🧠 Marketing Control Center
          </h1>
          <p style={{
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            fontSize: '16px',
            margin: '0',
            fontWeight: 'bold'
          }}>
            Comprehensive dashboard for persona management, content strategy, and analytics
          </p>
        </div>

        {/* Rest of component wrapped in white container */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: isDarkMode 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <MarketingControlCenter />
        </div>
      </div>
    </div>
  );
};

// Settings Component with Dark Mode Support
const SettingsComponent = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
      paddingTop: '80px',
      padding: '80px 20px 20px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: isDarkMode ? '#1e293b' : 'white',
          boxShadow: isDarkMode 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          border: `1px solid ${isDarkMode ? '#334155' : '#3b82f6'}`
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'black',
            color: isDarkMode ? '#60a5fa' : '#3b82f6',
            margin: '0 0 8px 0'
          }}>
            ⚙️ Dashboard Settings
          </h1>
          <p style={{
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            fontSize: '16px',
            margin: '0',
            fontWeight: 'bold'
          }}>
            Configure social platforms, Telegram channels, and character profiles
          </p>
        </div>

        {/* Rest of component wrapped in white container */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: isDarkMode 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <SettingsComponentContent />
        </div>
      </div>
    </div>
  );
};

// Admin Components with Dark Mode Support
const AdminComponents = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
      paddingTop: '80px',
      padding: '80px 20px 20px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: isDarkMode ? '#1e293b' : 'white',
          boxShadow: isDarkMode 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          border: `1px solid ${isDarkMode ? '#334155' : '#3b82f6'}`
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'black',
            color: isDarkMode ? '#60a5fa' : '#3b82f6',
            margin: '0 0 8px 0'
          }}>
            🔧 Admin Center
          </h1>
          <p style={{
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            fontSize: '16px',
            margin: '0',
            fontWeight: 'bold'
          }}>
            Advanced configuration, templates, and system management
          </p>
        </div>

        {/* Rest of component wrapped in white container */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: isDarkMode 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <AdminComponentsContent />
        </div>
      </div>
    </div>
  );
};

// AI Chat Manager Component (Coming Soon)
const AiChatManagerComponent = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
      paddingTop: '80px',
      padding: '80px 20px 20px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: isDarkMode ? '#1e293b' : 'white',
          boxShadow: isDarkMode 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          border: `1px solid ${isDarkMode ? '#334155' : '#3b82f6'}`
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'black',
            color: isDarkMode ? '#60a5fa' : '#3b82f6',
            margin: '0 0 8px 0'
          }}>
            🤖 AI Chat Manager
          </h1>
          <p style={{
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            fontSize: '16px',
            margin: '0',
            fontWeight: 'bold'
          }}>
            Advanced AI conversation management and automation
          </p>
        </div>

        {/* Coming Soon Content */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: isDarkMode 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          padding: '60px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '96px',
            marginBottom: '24px'
          }}>
            🤖
          </div>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#3b82f6',
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            AI Chat Manager
          </h2>
          <h3 style={{
            fontSize: '20px',
            color: '#6b7280',
            marginBottom: '24px',
            margin: '0 0 24px 0'
          }}>
            Coming Soon
          </h3>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto 32px auto',
            lineHeight: '1.6'
          }}>
            Advanced AI conversation management, automated responses, intelligent routing, 
            and comprehensive analytics for your customer communications. This feature will 
            integrate with all your existing chat platforms and provide powerful automation tools.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            maxWidth: '800px',
            margin: '0 auto 32px auto'
          }}>
            <div style={{
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🧠</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>Smart Routing</div>
            </div>
            <div style={{
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>Auto Responses</div>
            </div>
            <div style={{
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>Analytics</div>
            </div>
            <div style={{
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔗</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>Multi-Platform</div>
            </div>
          </div>

          <div style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#e0e7ff',
            color: '#4338ca',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            🚀 Admin/Brand Feature - In Development
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN DASHBOARD APPLICATION
// =============================================================================

function App() {
  const [activeSection, setActiveSection] = useState('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en-GB');

  // Check authentication status on load
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem('3c-authenticated');
      const darkMode = localStorage.getItem('3c-dark-mode') === 'true';
      const language = localStorage.getItem('3c-language') || 'en-GB';
      
      setIsAuthenticated(authStatus === 'true');
      setIsDarkMode(darkMode);
      setCurrentLanguage(language);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Handle URL navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        setActiveSection(hash);
      }
    };

    // Set initial section from URL
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update URL when section changes
  useEffect(() => {
    if (isAuthenticated && activeSection) {
      window.location.hash = activeSection;
    }
  }, [activeSection, isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('3c-authenticated');
      setIsAuthenticated(false);
      setActiveSection('overview');
      window.location.hash = '';
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('3c-dark-mode', newDarkMode.toString());
  };

  const changeLanguage = (lang: string) => {
    setCurrentLanguage(lang);
    localStorage.setItem('3c-language', lang);
  };

  const getLanguageFlag = (lang: string) => {
    const flags = {
      'en-GB': '🇬🇧',
      'pt-PT': '🇵🇹',
      'fr-FR': '🇫🇷',
      'de-DE': '🇩🇪'
    };
    return flags[lang as keyof typeof flags] || '🇬🇧';
  };

  const navigationItems = [
    { id: 'overview', icon: '📊', label: 'Overview', available: true },
    { id: 'content-manager', icon: '📝', label: 'Content Manager', available: true },
    { id: 'webchat-public', icon: '💬', label: 'WebChat Public', available: true },
    { id: 'schedule-manager', icon: '📅', label: 'Schedule Manager', available: true },
    { id: 'marketing-center', icon: '🧠', label: 'Marketing Center', available: true },
    { id: 'settings', icon: '⚙️', label: 'Dashboard Settings', available: true },
    { id: 'admin-center', icon: '🔧', label: 'Admin Center', available: true }
  ];

  const bottomNavItem = { 
    id: 'ai-chat-manager', 
    icon: '🤖', 
    label: 'AI Chat Manager', 
    available: true,
    note: 'Admin/Brand feature'
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewComponent />;
      case 'content-manager':
        return <ContentManager />;
      case 'webchat-public':
        return <WebChatComponent />;
      case 'schedule-manager':
        return <ScheduleComponent />;
      case 'marketing-center':
        return <MarketingComponent />;
      case 'settings':
        return <SettingsComponent />;
      case 'admin-center':
        return <AdminComponents />;
      case 'ai-chat-manager':
        return <AiChatManagerComponent />;
      default:
        return (
          <div style={{
            minHeight: '100vh',
            backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
            paddingTop: '80px',
            padding: '80px 20px 20px 20px'
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              <div style={{
                backgroundColor: isDarkMode ? '#1e293b' : 'white',
                boxShadow: isDarkMode 
                  ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
                  : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                padding: '60px',
                textAlign: 'center'
              }}>
                <h2 style={{
                  color: isDarkMode ? '#60a5fa' : '#3b82f6',
                  margin: '0 0 16px 0'
                }}>
                  {activeSection}
                </h2>
                <p style={{
                  color: isDarkMode ? '#94a3b8' : '#6b7280',
                  margin: '0'
                }}>
                  Coming soon
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  // Loading screen
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
          <div style={{ fontSize: '18px' }}>Loading 3C Control Center...</div>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <div style={{ 
        display: 'flex', 
        minHeight: '100vh', 
        backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Header Controls - Static Top Right */}
        {isAuthenticated && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {/* Language Selector */}
            <div style={{ position: 'relative' }}>
              <select
                value={currentLanguage}
                onChange={(e) => changeLanguage(e.target.value)}
                style={{
                  appearance: 'none',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  outline: 'none',
                  padding: '4px'
                }}
                title="Select Language"
              >
                <option value="en-GB">🇬🇧</option>
                <option value="pt-PT">🇵🇹</option>
                <option value="fr-FR">🇫🇷</option>
                <option value="de-DE">🇩🇪</option>
              </select>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Logout"
            >
              🚪
            </button>
          </div>
        )}

        {/* LEFT SIDEBAR NAVIGATION */}
        <div style={{ 
          width: '280px', 
          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', 
          borderRight: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb',
          padding: '20px 0',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Logo/Header */}
          <div style={{ 
            padding: '0 20px 30px 20px', 
            borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb',
            marginBottom: '20px'
          }}>
            <h2 style={{ 
              margin: '0', 
              color: isDarkMode ? '#60a5fa' : '#1f2937', 
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              3C Content Center
            </h2>
            <p style={{ 
              margin: '5px 0 0 0', 
              color: isDarkMode ? '#94a3b8' : '#6b7280', 
              fontSize: '14px' 
            }}>
              Dashboard
            </p>
          </div>

          {/* Main Navigation */}
          <div style={{ flex: '1', padding: '0 10px' }}>
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => item.available && setActiveSection(item.id)}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  marginBottom: '5px',
                  backgroundColor: activeSection === item.id 
                    ? (isDarkMode ? '#3b82f6' : '#3b82f6') 
                    : 'transparent',
                  color: activeSection === item.id 
                    ? '#ffffff' 
                    : (item.available 
                        ? (isDarkMode ? '#f8fafc' : '#374151') 
                        : (isDarkMode ? '#64748b' : '#9ca3af')),
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
                }}
              >
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                <span style={{ flex: '1' }}>{item.label}</span>
                {!item.available && (
                  <span style={{ 
                    fontSize: '10px', 
                    backgroundColor: '#f59e0b', 
                    color: 'white', 
                    padding: '2px 6px', 
                    borderRadius: '8px',
                    fontWeight: 'bold'
                  }}>
                    Soon
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Bottom Navigation Item */}
          <div style={{ 
            padding: '20px 10px 0 10px', 
            borderTop: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb',
            marginTop: '20px'
          }}>
            <button
              onClick={() => bottomNavItem.available && setActiveSection(bottomNavItem.id)}
              style={{
                width: '100%',
                padding: '12px 15px',
                backgroundColor: activeSection === bottomNavItem.id 
                  ? (isDarkMode ? '#3b82f6' : '#3b82f6') 
                  : 'transparent',
                color: activeSection === bottomNavItem.id 
                  ? '#ffffff' 
                  : (isDarkMode ? '#94a3b8' : '#9ca3af'),
                border: 'none',
                borderRadius: '8px',
                textAlign: 'left',
                cursor: bottomNavItem.available ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                opacity: bottomNavItem.available ? 1 : 0.6
              }}
            >
              <span style={{ fontSize: '16px' }}>{bottomNavItem.icon}</span>
              <div style={{ flex: '1' }}>
                <div>{bottomNavItem.label}</div>
                <div style={{ fontSize: '10px', opacity: 0.8 }}>{bottomNavItem.note}</div>
              </div>
              {!bottomNavItem.available && (
                <span style={{ 
                  fontSize: '10px', 
                  backgroundColor: '#f59e0b', 
                  color: 'white', 
                  padding: '2px 6px', 
                  borderRadius: '8px',
                  fontWeight: 'bold'
                }}>
                  Soon
                </span>
              )}
            </button>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div style={{ flex: '1', backgroundColor: isDarkMode ? '#0f172a' : '#ffffff' }}>
          {renderContent()}
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
