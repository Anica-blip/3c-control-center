import React, { useState, useEffect, createContext, useContext } from 'react';

// Import your real components - with fallbacks for missing components
import ContentComponent from './contentcomponent';
import ChatManagerPublic from './webchat';
import MarketingControlCenter from './marketingcomponent';
import SettingsComponentContent from './settingscomponent';
import AdminComponentsContent from './admincomponents';

// CREATE PLACEHOLDER COMPONENTS FOR MISSING FILES
const ScheduleComponentContent = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div style={{
      padding: '20px',
      backgroundColor: isDarkMode ? '#1e293b' : 'white',
      borderRadius: '8px',
      border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
      textAlign: 'center'
    }}>
      <h3 style={{
        color: isDarkMode ? '#60a5fa' : '#3b82f6',
        marginBottom: '16px'
      }}>
        📅 Schedule Component
      </h3>
      <p style={{
        color: isDarkMode ? '#94a3b8' : '#6b7280',
        marginBottom: '16px'
      }}>
        Schedule component will be implemented here.
      </p>
      <div style={{
        padding: '16px',
        backgroundColor: isDarkMode ? '#334155' : '#f3f4f6',
        borderRadius: '6px',
        fontSize: '14px',
        color: isDarkMode ? '#e2e8f0' : '#374151'
      }}>
        This component will handle:
        <ul style={{ textAlign: 'left', marginTop: '8px' }}>
          <li>Post scheduling</li>
          <li>Calendar view</li>
          <li>Delivery tracking</li>
          <li>Time zone management</li>
        </ul>
      </div>
    </div>
  );
};

// Theme Context
const ThemeContext = createContext({
  isDarkMode: false,
  toggleDarkMode: () => {}
});

const useTheme = () => useContext(ThemeContext);

// =============================================================================
// THEME WRAPPER HOC - From Working Version
// =============================================================================
const withThemeWrapper = (WrappedComponent: React.ComponentType<any>) => {
  return React.forwardRef<any, any>((props, ref) => {
    const { isDarkMode } = useTheme();
    
    // Apply global dark mode styles to the wrapped component
    useEffect(() => {
      const applyDarkModeStyles = () => {
        const style = document.createElement('style');
        style.id = 'dynamic-dark-mode-styles';
        
        // Remove existing dynamic styles
        const existing = document.getElementById('dynamic-dark-mode-styles');
        if (existing) {
          existing.remove();
        }
        
        if (isDarkMode) {
          style.textContent = `
            /* Global dark mode overrides for all components */
            .chat-content *,
            .settings-content *,
            .admin-content *,
            .content-manager *,
            .schedule-content *,
            .marketing-content * {
              color: white !important;
            }
            
            /* Background overrides */
            .chat-content div[style*="background"],
            .settings-content div[style*="background"],
            .admin-content div[style*="background"],
            .content-manager div[style*="background"],
            .schedule-content div[style*="background"],
            .marketing-content div[style*="background"] {
              background: #1e293b !important;
            }
            
            /* Border overrides */
            .chat-content *[style*="border"],
            .settings-content *[style*="border"],
            .admin-content *[style*="border"],
            .content-manager *[style*="border"],
            .schedule-content *[style*="border"],
            .marketing-content *[style*="border"] {
              border-color: #334155 !important;
            }
            
            /* Tab navigation buttons */
            .chat-content button[style*="border-bottom"],
            .settings-content button[style*="border-bottom"],
            .admin-content button[style*="border-bottom"] {
              color: white !important;
              font-weight: bold !important;
              font-size: 12px !important;
            }
            
            /* Input fields */
            .chat-content input,
            .settings-content input,
            .admin-content input,
            .content-manager input,
            .schedule-content input,
            .marketing-content input,
            .chat-content textarea,
            .settings-content textarea,
            .admin-content textarea,
            .content-manager textarea,
            .schedule-content textarea,
            .marketing-content textarea {
              background: #334155 !important;
              color: white !important;
              border-color: #475569 !important;
            }
            
            /* Buttons */
            .chat-content button,
            .settings-content button,
            .admin-content button,
            .content-manager button,
            .schedule-content button,
            .marketing-content button {
              background: #3b82f6 !important;
              color: white !important;
              border-color: #3b82f6 !important;
            }
            
            /* Cards and containers */
            .chat-content > div,
            .settings-content > div,
            .admin-content > div,
            .content-manager > div,
            .schedule-content > div,
            .marketing-content > div {
              background: #1e293b !important;
              border-color: #334155 !important;
            }
            
            /* Text elements */
            .chat-content p,
            .settings-content p,
            .admin-content p,
            .content-manager p,
            .schedule-content p,
            .marketing-content p,
            .chat-content span,
            .settings-content span,
            .admin-content span,
            .content-manager span,
            .schedule-content span,
            .marketing-content span,
            .chat-content div,
            .settings-content div,
            .admin-content div,
            .content-manager div,
            .schedule-content div,
            .marketing-content div {
              color: white !important;
            }
          `;
        } else {
          style.textContent = `
            /* Light mode - reset any overrides */
            .chat-content *,
            .settings-content *,
            .admin-content *,
            .content-manager *,
            .schedule-content *,
            .marketing-content * {
              color: inherit;
            }
          `;
        }
        
        document.head.appendChild(style);
      };
      
      applyDarkModeStyles();
    }, [isDarkMode]);
    
    return React.createElement(WrappedComponent, { ...props, ref, isDarkMode });
  });
};

// =============================================================================
// SIMPLE AUTH - No Ownership Issues, Hobby Plan Compatible
// =============================================================================

const AUTHORIZED_USER = process.env.REACT_APP_AUTHORIZED_USER || 'Anica-blip';

interface AuthenticatedUser {
  login: string;
  name: string;
  email: string;
  avatar_url: string;
  lastLogin: string;
}

// Simple GitHub Login Screen (Hobby Plan Compatible)
const GitHubLoginScreen = ({ onLogin }: { onLogin: (userData: any) => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const GITHUB_CLIENT_ID = process.env.REACT_APP_GITHUB_CLIENT_ID || 'Iv23lizeirH3ZoENlcig';

  const handleGitHubLogin = () => {
    setIsLoading(true);
    
    const state = Math.random().toString(36).substring(7);
    localStorage.setItem('github_oauth_state', state);
    
    // Fixed redirect URI for Hobby plan
    const redirectUri = 'https://3c-control-center.vercel.app/';
    
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo user&state=${state}`;
    
    window.location.href = githubAuthUrl;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const receivedState = urlParams.get('state');
    
    if (code && receivedState) {
      const savedState = localStorage.getItem('github_oauth_state');
      
      if (receivedState === savedState) {
        // Simulate successful auth
        const userData = {
          login: AUTHORIZED_USER,
          avatar_url: `https://github.com/${AUTHORIZED_USER}.png`,
          name: 'Anica',
          email: '3c.innertherapy@gmail.com',
          lastLogin: new Date().toISOString()
        };
        
        localStorage.setItem('3c-github-auth', 'true');
        localStorage.setItem('3c-github-user', JSON.stringify(userData));
        localStorage.removeItem('github_oauth_state');
        
        // Clear URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        onLogin(userData);
      } else {
        setError('Security verification failed');
      }
      setIsLoading(false);
    }
  }, []);

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
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧵</div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#3b82f6',
            margin: '0 0 8px 0'
          }}>
            3C Thread To Success
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            margin: '0'
          }}>
            Control Center Dashboard
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <p style={{ color: '#dc2626', fontSize: '14px', margin: '0' }}>
              🚨 {error}
            </p>
          </div>
        )}

        <button
          onClick={handleGitHubLogin}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: isLoading ? '#6b7280' : '#24292f',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}
        >
          {isLoading ? (
            'Connecting to GitHub...'
          ) : (
            <>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              Continue with GitHub
            </>
          )}
        </button>

        <div style={{
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            margin: '0',
            textAlign: 'center',
            lineHeight: '1.5'
          }}>
            🧵 <strong>Thread To Success</strong><br />
            Professional dashboard for content management and analytics.
          </p>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// OVERVIEW COMPONENT - From Working Version (Full Glory)
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
        {/* Header with Clock */}
        <div style={{
          backgroundColor: isDarkMode ? '#1e293b' : 'white',
          boxShadow: isDarkMode 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px',
          border: `1px solid ${isDarkMode ? '#334155' : '#3b82f6'}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: isDarkMode ? '#60a5fa' : '#3b82f6',
                margin: '0 0 8px 0'
              }}>
                🎯 Overview
              </h1>
              <p style={{
                color: isDarkMode ? '#94a3b8' : '#6b7280',
                fontSize: '14px',
                margin: '0'
              }}>
                Welcome to your content management dashboard
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: isDarkMode ? '#f8fafc' : '#111827',
                marginBottom: '4px'
              }}>
                {currentTime.toLocaleTimeString('en-GB', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  timeZone: 'Europe/Lisbon'
                })}
              </div>
              <div style={{
                fontSize: '12px',
                color: isDarkMode ? '#94a3b8' : '#6b7280',
                marginBottom: '2px'
              }}>
                {currentTime.toLocaleDateString('en-GB', { 
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  timeZone: 'Europe/Lisbon'
                })}
              </div>
              <div style={{
                fontSize: '10px',
                color: isDarkMode ? '#64748b' : '#9ca3af'
              }}>
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
            📝 <strong>Open Source Project</strong> • Designed by Claude • GitHub Repository Access
          </p>
          <p style={{
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            fontSize: '11px',
            margin: '0'
          }}>
            🌐 Language: English (UK) • ⏰ Timezone: WEST (UTC+1) • 🎯 3C Control Center v2.0
          </p>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// THEMED COMPONENT WRAPPERS - From Working Version
// =============================================================================

const ThemedContentComponent = withThemeWrapper(ContentComponent);
const ThemedChatManagerPublic = withThemeWrapper(ChatManagerPublic);
const ThemedScheduleComponentContent = withThemeWrapper(ScheduleComponentContent);
const ThemedMarketingControlCenter = withThemeWrapper(MarketingControlCenter);
const ThemedSettingsComponentContent = withThemeWrapper(SettingsComponentContent);
const ThemedAdminComponentsContent = withThemeWrapper(AdminComponentsContent);

// =============================================================================
// MAIN APP - With Working Patterns Applied
// =============================================================================
function App() {
  const [activeSection, setActiveSection] = useState('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en-GB');
  const [githubUser, setGitHubUser] = useState<AuthenticatedUser | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check authentication status on load
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem('3c-github-auth');
      const userData = localStorage.getItem('3c-github-user');
      const darkMode = localStorage.getItem('3c-dark-mode') === 'true';
      const language = localStorage.getItem('3c-language') || 'en-GB';
      
      setIsAuthenticated(authStatus === 'true');
      if (userData) {
        try {
          setGitHubUser(JSON.parse(userData));
        } catch (e) {
          console.error('Failed to parse user data');
        }
      }
      setIsDarkMode(darkMode);
      setCurrentLanguage(language);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData: AuthenticatedUser) => {
    if (userData.login !== AUTHORIZED_USER) {
      alert(`Access denied. Only ${AUTHORIZED_USER} is authorized.`);
      return;
    }
    setIsAuthenticated(true);
    setGitHubUser(userData);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('3c-github-auth');
      localStorage.removeItem('3c-github-user');
      setIsAuthenticated(false);
      setGitHubUser(null);
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

  const navigationItems = [
    { id: 'overview', icon: '🧵', label: 'Overview', available: true },
    { id: 'content-manager', icon: '📝', label: 'Content Manager', available: true },
    { id: 'webchat-public', icon: '💬', label: 'WebChat Public', available: true },
    { id: 'schedule-manager', icon: '📅', label: 'Schedule Manager', available: true },
    { id: 'marketing-center', icon: '🧠', label: 'Marketing Center', available: true },
    { id: 'settings', icon: '⚙️', label: 'Dashboard Settings', available: true },
    { id: 'admin-center', icon: '🔧', label: 'Admin Center', available: true }
  ];

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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧵</div>
          <div style={{ fontSize: '18px' }}>Loading 3C Thread To Success...</div>
          <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.8 }}>Professional Dashboard</div>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <GitHubLoginScreen onLogin={handleLogin} />;
  }

  // Main authenticated app
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <div style={{ 
        display: 'flex', 
        minHeight: '100vh', 
        backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* FIXED Header Controls - Working Pattern from Older Version */}
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
            {/* Avatar with Online Status - First Position */}
            {githubUser && (
              <div style={{ position: 'relative' }}>
                <img 
                  src={githubUser.avatar_url} 
                  alt={githubUser.name}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: `2px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`
                  }}
                />
                {/* Online/Offline Status Indicator */}
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: isOnline ? '#10b981' : '#ef4444',
                  border: `2px solid ${isDarkMode ? '#0f172a' : '#f8fafc'}`,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
                }} />
              </div>
            )}

            {/* Language Selector - Working Pattern from Older Version */}
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

        {/* Sidebar Navigation */}
        <div style={{ 
          width: '280px', 
          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', 
          borderRight: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb',
          padding: '20px 0',
          display: 'flex',
          flexDirection: 'column'
        }}>
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
              3C Thread To Success
            </h2>
            <p style={{ 
              margin: '5px 0 0 0', 
              color: isDarkMode ? '#94a3b8' : '#6b7280', 
              fontSize: '14px' 
            }}>
              Control Center
            </p>
          </div>

          <div style={{ flex: '1', padding: '0 10px' }}>
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  marginBottom: '5px',
                  backgroundColor: activeSection === item.id 
                    ? '#3b82f6' 
                    : 'transparent',
                  color: activeSection === item.id 
                    ? '#ffffff' 
                    : (isDarkMode ? '#f8fafc' : '#374151'),
                  border: 'none',
                  borderRadius: '8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeSection === item.id ? 'bold' : 'normal',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* MAIN CONTENT AREA - With Working Pattern Headers & Dark Mode */}
        <div style={{ flex: '1', backgroundColor: isDarkMode ? '#0f172a' : '#ffffff' }}>
          {activeSection === 'overview' && <OverviewComponent />}
          
          {activeSection === 'content-manager' && (
            <div style={{ 
              minHeight: '100vh',
              backgroundColor: isDarkMode ? '#0f172a' : '#f3f4f6',
              paddingTop: '80px',
              padding: '80px 20px 20px 20px'
            }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: isDarkMode ? '#60a5fa' : '#3b82f6',
                    margin: '0 0 8px 0'
                  }}>
                    📝 Content Manager
                  </h1>
                  <p style={{
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
                    fontSize: '14px',
                    margin: '0'
                  }}>
                    Create, manage, and schedule your social media content with ease
                  </p>
                </div>
                <div className="content-manager">
                  <ThemedContentComponent />
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'webchat-public' && (
            <div style={{ 
              minHeight: '100vh',
              backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
              paddingTop: '80px',
              padding: '80px 20px 20px 20px'
            }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: isDarkMode ? '#60a5fa' : '#3b82f6',
                    margin: '0 0 8px 0'
                  }}>
                    💬 Chat Manager - Public
                  </h1>
                  <p style={{
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
                    fontSize: '14px',
                    margin: '0'
                  }}>
                    Manage customer communications, support emails, and notifications
                  </p>
                </div>
                <div className="chat-content">
                  <ThemedChatManagerPublic />
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'schedule-manager' && (
            <div style={{ 
              minHeight: '100vh',
              backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
              paddingTop: '80px',
              padding: '80px 20px 20px 20px'
            }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: isDarkMode ? '#60a5fa' : '#3b82f6',
                    margin: '0 0 8px 0'
                  }}>
                    📅 Schedule Manager
                  </h1>
                  <p style={{
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
                    fontSize: '14px',
                    margin: '0'
                  }}>
                    Schedule posts and track their delivery status
                  </p>
                </div>
                <div className="schedule-content">
                  <ThemedScheduleComponentContent />
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'marketing-center' && (
            <div style={{ 
              minHeight: '100vh',
              backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
              paddingTop: '80px',
              padding: '80px 20px 20px 20px'
            }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: isDarkMode ? '#60a5fa' : '#3b82f6',
                    margin: '0 0 8px 0'
                  }}>
                    🧠 Marketing Control Center
                  </h1>
                  <p style={{
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
                    fontSize: '14px',
                    margin: '0'
                  }}>
                    Comprehensive dashboard for persona management, content strategy, and analytics
                  </p>
                </div>
                <div className="marketing-content">
                  <ThemedMarketingControlCenter />
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'settings' && (
            <div style={{ 
              minHeight: '100vh',
              backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
              paddingTop: '80px',
              padding: '80px 20px 20px 20px'
            }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: isDarkMode ? '#60a5fa' : '#3b82f6',
                    margin: '0 0 8px 0'
                  }}>
                    ⚙️ Dashboard Settings
                  </h1>
                  <p style={{
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
                    fontSize: '14px',
                    margin: '0'
                  }}>
                    Configure social platforms, Telegram channels, and character profiles
                  </p>
                </div>
                <div className="settings-content">
                  <ThemedSettingsComponentContent />
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'admin-center' && (
            <div style={{ 
              minHeight: '100vh',
              backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
              paddingTop: '80px',
              padding: '80px 20px 20px 20px'
            }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: isDarkMode ? '#60a5fa' : '#3b82f6',
                    margin: '0 0 8px 0'
                  }}>
                    🔧 Admin Center
                  </h1>
                  <p style={{
                    color: isDarkMode ? '#94a3b8' : '#6b7280',
                    fontSize: '14px',
                    margin: '0'
                  }}>
                    Advanced configuration, templates, and system management
                  </p>
                </div>
                <div className="admin-content">
                  <ThemedAdminComponentsContent />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
