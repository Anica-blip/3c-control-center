import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// IMPORT YOUR REAL COMPONENTS
import ContentComponent from './contentcomponent';
import WebChatComponent from './webchat';
import ScheduleComponent from './schedulecomponent';
import MarketingComponent from './marketingcomponent';
import SettingsComponent from './settingscomponent';
import AdminComponents from './admincomponents';

// Import HeaderControls - using lowercase to match your file
import HeaderControls from './headercontrols';

// =============================================================================
// AUTHENTICATION COMPONENT
// =============================================================================
const LoginScreen = ({ onLogin, isDarkMode }: { onLogin: () => void; isDarkMode: boolean }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simple password check - in production, this would be more secure
    setTimeout(() => {
      if (password === '3c-internal-2025') {
        onLogin();
      } else {
        setError('Invalid credentials. Access denied.');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
      background: isDarkMode 
        ? 'linear-gradient(135deg, #111827 0%, #1f2937 100%)'
        : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
    }}>
      <div style={{
        backgroundColor: isDarkMode ? '#1f2937' : 'white',
        padding: '48px',
        borderRadius: '16px',
        boxShadow: isDarkMode 
          ? '0 25px 50px rgba(0, 0, 0, 0.5)' 
          : '0 25px 50px rgba(59, 130, 246, 0.15)',
        border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
        width: '100%',
        maxWidth: '400px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔒</div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: isDarkMode ? '#f9fafb' : '#1f2937',
            margin: '0 0 8px 0'
          }}>
            3C Internal Dashboard
          </h1>
          <p style={{
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            fontSize: '14px',
            margin: '0'
          }}>
            Secure access required
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: isDarkMode ? '#f9fafb' : '#374151',
              marginBottom: '8px'
            }}>
              Access Code
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter internal access code"
              style={{
                width: '100%',
                padding: '12px',
                border: isDarkMode ? '1px solid #4b5563' : '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: isDarkMode ? '#374151' : 'white',
                color: isDarkMode ? '#f9fafb' : '#1f2937',
                outline: 'none'
              }}
              disabled={isLoading}
            />
            {error && (
              <p style={{
                color: '#ef4444',
                fontSize: '12px',
                marginTop: '8px',
                margin: '8px 0 0 0'
              }}>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !password}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: (!password || isLoading) ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: (!password || isLoading) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isLoading ? '🔓 Authenticating...' : '🚀 Access Dashboard'}
          </button>
        </form>

        {/* Security Notice */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: isDarkMode ? '#dc2626' : '#fee2e2',
          borderRadius: '8px',
          border: isDarkMode ? '1px solid #ef4444' : '1px solid #fecaca'
        }}>
          <p style={{
            fontSize: '12px',
            color: isDarkMode ? '#fecaca' : '#dc2626',
            margin: '0',
            textAlign: 'center',
            fontWeight: '500'
          }}>
            🔒 This dashboard is for 3C internal use only
          </p>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// OVERVIEW COMPONENT
// =============================================================================
const OverviewComponent = ({ onNavigate, isDarkMode }: { onNavigate: (section: string) => void; isDarkMode: boolean }) => {
  return (
    <div style={{ 
      padding: '20px',
      paddingTop: '100px', // Space for HeaderControls
      backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: isDarkMode ? '#f9fafb' : '#1f2937',
          margin: '0 0 8px 0'
        }}>
          🎯 3C Control Center
        </h1>
        <p style={{
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          fontSize: '18px',
          margin: '0'
        }}>
          Welcome to your internal dashboard - WEST (UTC+1)
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {[
          { title: 'Content Posts', value: '47', icon: '📝', color: '#3b82f6' },
          { title: 'Scheduled', value: '12', icon: '📅', color: '#10b981' },
          { title: 'Templates', value: '8', icon: '📋', color: '#8b5cf6' },
          { title: 'Platforms', value: '5', icon: '🌐', color: '#f59e0b' }
        ].map((stat, index) => (
          <div key={index} style={{
            padding: '24px',
            backgroundColor: isDarkMode ? '#1f2937' : 'white',
            borderRadius: '12px',
            border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
            boxShadow: isDarkMode 
              ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
              : '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                fontSize: '32px',
                backgroundColor: `${stat.color}20`,
                padding: '12px',
                borderRadius: '8px'
              }}>
                {stat.icon}
              </div>
              <div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: stat.color
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: isDarkMode ? '#9ca3af' : '#6b7280'
                }}>
                  {stat.title}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{
        backgroundColor: isDarkMode ? '#1f2937' : 'white',
        borderRadius: '12px',
        padding: '24px',
        border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
        boxShadow: isDarkMode 
          ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
          : '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: isDarkMode ? '#f9fafb' : '#1f2937',
          margin: '0 0 20px 0'
        }}>
          🚀 Quick Actions
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {[
            { id: 'content-manager', title: 'Create Content', icon: '📝', color: '#3b82f6' },
            { id: 'schedule-manager', title: 'Schedule Posts', icon: '📅', color: '#10b981' },
            { id: 'webchat-public', title: 'Manage Chat', icon: '💬', color: '#8b5cf6' },
            { id: 'marketing-center', title: 'Marketing Tools', icon: '📊', color: '#f59e0b' },
            { id: 'settings', title: 'Settings', icon: '⚙️', color: '#6b7280' },
            { id: 'admin-center', title: 'Admin Panel', icon: '🔧', color: '#ef4444' }
          ].map((action) => (
            <button
              key={action.id}
              onClick={() => onNavigate(action.id)}
              style={{
                padding: '16px',
                backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                border: isDarkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = `${action.color}20`;
                e.currentTarget.style.borderColor = action.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f9fafb';
                e.currentTarget.style.borderColor = isDarkMode ? '#4b5563' : '#e5e7eb';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                fontSize: '24px',
                backgroundColor: `${action.color}20`,
                padding: '8px',
                borderRadius: '6px'
              }}>
                {action.icon}
              </div>
              <div>
                <div style={{
                  fontWeight: 'bold',
                  color: isDarkMode ? '#f9fafb' : '#1f2937',
                  fontSize: '14px'
                }}>
                  {action.title}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '32px',
        textAlign: 'center',
        padding: '20px',
        borderTop: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb'
      }}>
        <p style={{
          color: isDarkMode ? '#6b7280' : '#9ca3af',
          fontSize: '12px',
          margin: '0'
        }}>
          🎨 Designed by <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>Claude</a> • 
          © 2025 <a href="https://github.com/anica-blip" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>GitHub</a> • 
          🔒 Internal Use Only
        </p>
      </div>
    </div>
  );
};

// =============================================================================
// COMING SOON COMPONENT
// =============================================================================
const ComingSoonComponent = ({ title, isDarkMode }: { title: string; isDarkMode: boolean }) => (
  <div style={{ 
    padding: '20px',
    paddingTop: '100px', // Space for HeaderControls
    backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <div style={{
      textAlign: 'center',
      backgroundColor: isDarkMode ? '#1f2937' : 'white',
      padding: '48px',
      borderRadius: '16px',
      border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
      boxShadow: isDarkMode 
        ? '0 25px 50px rgba(0, 0, 0, 0.3)' 
        : '0 25px 50px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚧</div>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: isDarkMode ? '#f9fafb' : '#1f2937',
        margin: '0 0 8px 0'
      }}>
        {title}
      </h2>
      <p style={{
        color: isDarkMode ? '#9ca3af' : '#6b7280',
        fontSize: '16px',
        margin: '0'
      }}>
        Coming soon - under development
      </p>
    </div>
  </div>
);

// =============================================================================
// MAIN APP COMPONENT
// =============================================================================
function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Navigation state
  const [activeSection, setActiveSection] = useState('overview');
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Language state
  const [language, setLanguage] = useState('en-GB');

  // Load saved preferences
  useEffect(() => {
    const savedAuth = localStorage.getItem('3c-auth');
    const savedTheme = localStorage.getItem('3c-theme');
    const savedLanguage = localStorage.getItem('3c-language');
    
    if (savedAuth === 'authenticated') {
      setIsAuthenticated(true);
    }
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    // Handle URL hash navigation
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash && isAuthenticated) {
        setActiveSection(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Handle initial hash

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated]);

  // Handle login
  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('3c-auth', 'authenticated');
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('3c-auth');
    setActiveSection('overview');
    window.location.hash = '';
  };

  // Handle navigation
  const handleNavigation = (section: string) => {
    setActiveSection(section);
    window.location.hash = section;
  };

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('3c-theme', !isDarkMode ? 'dark' : 'light');
  };

  // Handle language change
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('3c-language', newLanguage);
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} isDarkMode={isDarkMode} />;
  }

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
    available: false,
    note: 'Admin/Brand feature'
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewComponent onNavigate={handleNavigation} isDarkMode={isDarkMode} />;
      case 'content-manager':
        return <ContentComponent isDarkMode={isDarkMode} />;
      case 'webchat-public':
        return <WebChatComponent isDarkMode={isDarkMode} />;
      case 'schedule-manager':
        return <ScheduleComponent isDarkMode={isDarkMode} />;
      case 'marketing-center':
        return <MarketingComponent isDarkMode={isDarkMode} />;
      case 'settings':
        return <SettingsComponent isDarkMode={isDarkMode} />;
      case 'admin-center':
        return <AdminComponents isDarkMode={isDarkMode} />;
      case 'ai-chat-manager':
        return <ComingSoonComponent title="AI Chat Manager" isDarkMode={isDarkMode} />;
      default:
        return <ComingSoonComponent title={activeSection} isDarkMode={isDarkMode} />;
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: isDarkMode ? '#111827' : '#f8fafc'
    }}>
      {/* HeaderControls */}
      <HeaderControls
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onLogout={handleLogout}
        language={language}
        onLanguageChange={handleLanguageChange}
      />

      {/* LEFT SIDEBAR NAVIGATION */}
      <div style={{ 
        width: '280px', 
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', 
        borderRight: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
        padding: '20px 0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Logo/Header */}
        <div style={{ 
          padding: '0 20px 30px 20px', 
          borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
          marginBottom: '20px'
        }}>
          <h2 style={{ 
            margin: '0', 
            color: isDarkMode ? '#f9fafb' : '#1f2937', 
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            3C Content Center
          </h2>
          <p style={{ 
            margin: '5px 0 0 0', 
            color: isDarkMode ? '#9ca3af' : '#6b7280', 
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
              onClick={() => item.available && handleNavigation(item.id)}
              style={{
                width: '100%',
                padding: '12px 15px',
                marginBottom: '5px',
                backgroundColor: activeSection === item.id ? '#3b82f6' : 'transparent',
                color: activeSection === item.id ? '#ffffff' : (item.available ? (isDarkMode ? '#f9fafb' : '#374151') : '#9ca3af'),
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
          borderTop: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
          marginTop: '20px'
        }}>
          <button
            onClick={() => bottomNavItem.available && handleNavigation(bottomNavItem.id)}
            style={{
              width: '100%',
              padding: '12px 15px',
              backgroundColor: activeSection === bottomNavItem.id ? '#3b82f6' : 'transparent',
              color: activeSection === bottomNavItem.id ? '#ffffff' : '#9ca3af',
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
      <div style={{ 
        flex: '1', 
        backgroundColor: isDarkMode ? '#111827' : '#ffffff'
      }}>
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
