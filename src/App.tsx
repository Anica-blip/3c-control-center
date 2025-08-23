import React, { useState, useEffect } from 'react';

// IMPORT YOUR REAL COMPONENTS
import ContentComponent from './contentcomponent';
import WebChatComponent from './webchat';
import ScheduleComponent from './schedulecomponent';
import MarketingComponent from './marketingcomponent';
import SettingsComponent from './settingscomponent';
import AdminComponents from './admincomponents';

// =============================================================================
// MAIN DASHBOARD - WITH COMPLETE DARK MODE SUPPORT
// =============================================================================

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('3c-auth') === 'authenticated';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Navigation and theme state
  const [activeSection, setActiveSection] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('3c-darkMode') === 'true';
  });
  const [currentLanguage, setCurrentLanguage] = useState('en-GB');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Theme object for consistent styling
  const theme = {
    background: isDarkMode ? '#1f2937' : '#f8fafc',
    cardBackground: isDarkMode ? '#374151' : '#ffffff',
    sidebarBackground: isDarkMode ? '#111827' : '#ffffff',
    headerBackground: isDarkMode ? '#374151' : '#f9fafb',
    borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
    textPrimary: isDarkMode ? '#f9fafb' : '#1f2937',
    textSecondary: isDarkMode ? '#d1d5db' : '#6b7280',
    buttonPrimary: '#3b82f6',
    buttonSecondary: isDarkMode ? '#4b5563' : '#f3f4f6',
    buttonSecondaryText: isDarkMode ? '#f9fafb' : '#374151',
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
    available: false,
    note: 'Admin/Brand feature'
  };

  const languages = [
    { code: 'en-GB', flag: '🇬🇧', name: 'English (UK)' },
    { code: 'pt-PT', flag: '🇵🇹', name: 'Português (PT)' },
    { code: 'fr-FR', flag: '🇫🇷', name: 'Français' },
    { code: 'de-DE', flag: '🇩🇪', name: 'Deutsch' }
  ];

  // URL navigation effect
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash && navigationItems.some(item => item.id === hash)) {
        setActiveSection(hash);
      } else if (hash === 'ai-chat-manager') {
        setActiveSection('ai-chat-manager');
      } else if (!hash) {
        setActiveSection('overview');
        window.history.replaceState(null, '', '#overview');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Dark mode persistence
  useEffect(() => {
    localStorage.setItem('3c-darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simple password check
    if (password === '3c-internal-2025') {
      setTimeout(() => {
        localStorage.setItem('3c-auth', 'authenticated');
        setIsAuthenticated(true);
        setIsLoading(false);
        setPassword('');
      }, 1500);
    } else {
      setTimeout(() => {
        setError('Invalid password. Please try again.');
        setIsLoading(false);
        setPassword('');
      }, 1500);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('3c-auth');
    setIsAuthenticated(false);
    setShowLogoutConfirm(false);
    setActiveSection('overview');
    window.history.replaceState(null, '', '#overview');
  };

  const handleNavigation = (sectionId: string) => {
    setActiveSection(sectionId);
    window.history.pushState(null, '', `#${sectionId}`);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const renderContent = () => {
    const componentProps = { isDarkMode, theme };
    
    switch (activeSection) {
      case 'overview':
        return <OverviewComponent {...componentProps} />;
      case 'content-manager':
        return <ContentComponent {...componentProps} />;
      case 'webchat-public':
        return <WebChatComponent {...componentProps} />;
      case 'schedule-manager':
        return <ScheduleComponent {...componentProps} />;
      case 'marketing-center':
        return <MarketingComponent {...componentProps} />;
      case 'settings':
        return <SettingsComponent {...componentProps} />;
      case 'admin-center':
        return <AdminComponents {...componentProps} />;
      case 'ai-chat-manager':
        return <ComingSoonComponent title="AI Chat Manager" {...componentProps} />;
      default:
        return <ComingSoonComponent title={activeSection} {...componentProps} />;
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: isDarkMode 
          ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
          : 'linear-gradient(135deg, #dbeafe 0%, #3b82f6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: theme.cardBackground,
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${theme.borderColor}`,
          width: '100%',
          maxWidth: '400px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '32px'
            }}>
              🏢
            </div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: theme.textPrimary,
              margin: '0 0 8px 0'
            }}>
              3C Control Center
            </h1>
            <p style={{
              color: theme.textSecondary,
              fontSize: '14px',
              margin: '0'
            }}>
              Internal Dashboard Access
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 'bold',
                color: theme.textPrimary,
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
                  borderRadius: '8px',
                  border: `1px solid ${theme.borderColor}`,
                  backgroundColor: theme.background,
                  color: theme.textPrimary,
                  fontSize: '14px',
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
                backgroundColor: (!password || isLoading) ? '#9ca3af' : theme.buttonPrimary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: (!password || isLoading) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff40',
                    borderTop: '2px solid #ffffff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Authenticating...
                </>
              ) : (
                <>🔐 Access Dashboard</>
              )}
            </button>
          </form>

          <div style={{
            marginTop: '32px',
            padding: '16px',
            backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '12px',
              color: theme.textSecondary,
              margin: '0',
              lineHeight: '1.5'
            }}>
              🔒 Internal Use Only<br />
              Designed by Claude • Copyright GitHub<br />
              anica-blip.github.io/3c-control-center
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: theme.background,
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header Controls */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 1000,
        backgroundColor: theme.cardBackground,
        padding: '8px 12px',
        borderRadius: '12px',
        border: `1px solid ${theme.borderColor}`,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Language Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px'
            }}
            title="Select Language"
          >
            {languages.find(lang => lang.code === currentLanguage)?.flag}
          </button>
          
          {showLanguageDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              marginTop: '4px',
              backgroundColor: theme.cardBackground,
              border: `1px solid ${theme.borderColor}`,
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              zIndex: 1001
            }}>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setCurrentLanguage(lang.code);
                    setShowLanguageDropdown(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: currentLanguage === lang.code ? theme.buttonSecondary : 'transparent',
                    color: theme.textPrimary,
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    borderRadius: currentLanguage === lang.code ? '6px' : '0'
                  }}
                  onMouseOver={(e) => {
                    if (currentLanguage !== lang.code) {
                      e.currentTarget.style.backgroundColor = theme.headerBackground;
                    }
                  }}
                  onMouseOut={(e) => {
                    if (currentLanguage !== lang.code) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {lang.flag} {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          style={{
            backgroundColor: 'transparent',
            border: `1px solid ${theme.borderColor}`,
            borderRadius: '8px',
            padding: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            color: theme.textPrimary
          }}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>

        {/* Logout Button */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          style={{
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
          title="Logout"
        >
          🔓
        </button>
      </div>

      {/* LEFT SIDEBAR NAVIGATION */}
      <div style={{ 
        width: '280px', 
        backgroundColor: theme.sidebarBackground, 
        borderRight: `1px solid ${theme.borderColor}`,
        padding: '20px 0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Logo/Header */}
        <div style={{ 
          padding: '0 20px 30px 20px', 
          borderBottom: `1px solid ${theme.borderColor}`,
          marginBottom: '20px'
        }}>
          <h2 style={{ 
            margin: '0', 
            color: theme.textPrimary, 
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            3C Content Center
          </h2>
          <p style={{ 
            margin: '5px 0 0 0', 
            color: theme.textSecondary, 
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
                backgroundColor: activeSection === item.id ? theme.buttonPrimary : 'transparent',
                color: activeSection === item.id ? '#ffffff' : (item.available ? theme.textPrimary : theme.textSecondary),
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
          borderTop: `1px solid ${theme.borderColor}`,
          marginTop: '20px'
        }}>
          <button
            onClick={() => bottomNavItem.available && handleNavigation(bottomNavItem.id)}
            style={{
              width: '100%',
              padding: '12px 15px',
              backgroundColor: activeSection === bottomNavItem.id ? theme.buttonPrimary : 'transparent',
              color: activeSection === bottomNavItem.id ? '#ffffff' : theme.textSecondary,
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

        {/* Footer */}
        <div style={{
          padding: '20px',
          borderTop: `1px solid ${theme.borderColor}`,
          marginTop: '20px'
        }}>
          <p style={{
            fontSize: '11px',
            color: theme.textSecondary,
            textAlign: 'center',
            margin: '0',
            lineHeight: '1.4'
          }}>
            🔒 Internal Use Only<br />
            Designed by Claude<br />
            © GitHub Open Source
          </p>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ 
        flex: '1', 
        backgroundColor: theme.background,
        overflow: 'auto'
      }}>
        {renderContent()}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed',
          inset: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: theme.cardBackground,
            padding: '24px',
            borderRadius: '12px',
            border: `1px solid ${theme.borderColor}`,
            maxWidth: '300px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: theme.textPrimary, margin: '0 0 12px 0' }}>
              Confirm Logout
            </h3>
            <p style={{ color: theme.textSecondary, fontSize: '14px', margin: '0 0 20px 0' }}>
              Are you sure you want to logout?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: theme.buttonSecondary,
                  color: theme.buttonSecondaryText,
                  border: `1px solid ${theme.borderColor}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// OVERVIEW COMPONENT - QUICK PLACEHOLDER
// =============================================================================

const OverviewComponent = ({ isDarkMode, theme }: { isDarkMode: boolean; theme: any }) => (
  <div style={{ padding: '20px', backgroundColor: theme.background }}>
    <h2 style={{ color: theme.textPrimary, fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
      📊 Dashboard Overview
    </h2>
    <p style={{ color: theme.textSecondary, fontSize: '14px', margin: '0 0 30px 0' }}>
      Welcome to your 3C Content Center dashboard
    </p>
    
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
      gap: '20px',
      marginBottom: '30px'
    }}>
      {[
        { title: 'Active Posts', value: '24', color: '#3b82f6', icon: '📝' },
        { title: 'Scheduled', value: '8', color: '#10b981', icon: '📅' },
        { title: 'Chat Messages', value: '156', color: '#f59e0b', icon: '💬' },
        { title: 'Engagement', value: '89%', color: '#8b5cf6', icon: '📈' }
      ].map((metric, index) => (
        <div key={index} style={{
          padding: '25px',
          backgroundColor: theme.cardBackground,
          borderRadius: '12px',
          border: `1px solid ${theme.borderColor}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>{metric.icon}</div>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: metric.color, 
            marginBottom: '4px' 
          }}>
            {metric.value}
          </div>
          <div style={{ fontSize: '14px', color: theme.textSecondary }}>
            {metric.title}
          </div>
        </div>
      ))}
    </div>

    <div style={{
      padding: '25px',
      backgroundColor: theme.cardBackground,
      borderRadius: '12px',
      border: `1px solid ${theme.borderColor}`
    }}>
      <h3 style={{ 
        color: theme.textPrimary, 
        fontSize: '18px', 
        fontWeight: 'bold', 
        margin: '0 0 16px 0' 
      }}>
        🚀 Quick Actions
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Create Content', icon: '📝', section: 'content-manager' },
          { label: 'Schedule Posts', icon: '📅', section: 'schedule-manager' },
          { label: 'Manage Chat', icon: '💬', section: 'webchat-public' },
          { label: 'View Analytics', icon: '📊', section: 'marketing-center' }
        ].map((action, index) => (
          <button
            key={index}
            onClick={() => window.location.hash = action.section}
            style={{
              padding: '12px 16px',
              backgroundColor: isDarkMode ? '#4b5563' : '#f3f4f6',
              color: theme.textPrimary,
              border: `1px solid ${theme.borderColor}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = theme.buttonPrimary;
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode ? '#4b5563' : '#f3f4f6';
              e.currentTarget.style.color = theme.textPrimary;
            }}
          >
            <span>{action.icon}</span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

// =============================================================================
// SIMPLE FALLBACK COMPONENT
// =============================================================================

const ComingSoonComponent = ({ title, isDarkMode, theme }: { title: string; isDarkMode: boolean; theme: any }) => (
  <div style={{ padding: '20px', backgroundColor: theme.background }}>
    <h2 style={{ color: theme.textPrimary, fontSize: '20px', fontWeight: 'bold' }}>{title}</h2>
    <p style={{ color: theme.textSecondary }}>Coming soon</p>
  </div>
);

export default App;
