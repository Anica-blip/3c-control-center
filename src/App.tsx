import React, { useState, useEffect } from 'react';

// IMPORT YOUR REAL COMPONENTS
import OverviewComponent from './OverviewComponent';
import ContentComponent from './contentcomponent';
import WebChatComponent from './webchat';
import ScheduleComponent from './schedulecomponent';
import MarketingComponent from './marketingcomponent';
import SettingsComponent from './settingscomponent';
import AdminComponents from './admincomponents';

// =============================================================================
// FIXED DASHBOARD CONFIGURATION
// =============================================================================
const DASHBOARD_CONFIG = {
  timezone: 'WEST (UTC+1)',
  language: 'en-GB',
  translations: ['pt-PT', 'fr-FR', 'de-DE'],
  flags: {
    'en-GB': '🇬🇧',
    'pt-PT': '🇵🇹', 
    'fr-FR': '🇫🇷',
    'de-DE': '🇩🇪'
  },
  baseUrl: 'anica-blip.github.io/3c-control-center'
};

// =============================================================================
// URL NAVIGATION ROUTES
// =============================================================================
const ROUTES = {
  overview: 'overview',
  'content-manager': 'content-manager',
  'webchat-public': 'webchat-public', 
  'schedule-manager': 'schedule-manager',
  'marketing-center': 'marketing-center',
  'settings': 'settings',
  'admin-center': 'admin-center',
  'ai-chat-manager': 'ai-chat-manager'
};

// =============================================================================
// MAIN DASHBOARD WITH URL NAVIGATION
// =============================================================================
function App() {
  const [activeSection, setActiveSection] = useState('overview');

  // URL Navigation Handler
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove # symbol
      if (hash && Object.values(ROUTES).includes(hash)) {
        setActiveSection(hash);
      } else {
        // Default to overview and update URL
        setActiveSection('overview');
        window.history.replaceState(null, '', '#overview');
      }
    };

    // Set initial route
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Cleanup
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Navigation handler that updates URL
  const navigateToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    window.location.hash = sectionId;
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

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewComponent />;
      case 'content-manager':
        return <ContentComponent />;
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
        return <ComingSoonComponent title="AI Chat Manager" />;
      default:
        return <OverviewComponent />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* LEFT SIDEBAR NAVIGATION */}
      <div style={{ 
        width: '280px', 
        backgroundColor: '#ffffff', 
        borderRight: '1px solid #e5e7eb',
        padding: '20px 0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Logo/Header */}
        <div style={{ 
          padding: '0 20px 30px 20px', 
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '20px'
        }}>
          <h2 style={{ 
            margin: '0', 
            color: '#1f2937', 
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            3C Content Center
          </h2>
          <p style={{ 
            margin: '5px 0 0 0', 
            color: '#6b7280', 
            fontSize: '14px' 
          }}>
            Internal Dashboard
          </p>
          
          {/* Current Config Display */}
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            backgroundColor: '#f3f4f6',
            borderRadius: '6px',
            fontSize: '12px'
          }}>
            <div style={{ color: '#374151', fontWeight: '500' }}>
              {DASHBOARD_CONFIG.flags['en-GB']} {DASHBOARD_CONFIG.language}
            </div>
            <div style={{ color: '#6b7280' }}>
              {DASHBOARD_CONFIG.timezone}
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div style={{ flex: '1', padding: '0 10px' }}>
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => item.available && navigateToSection(item.id)}
              style={{
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
          borderTop: '1px solid #e5e7eb',
          marginTop: '20px'
        }}>
          <button
            onClick={() => bottomNavItem.available && navigateToSection(bottomNavItem.id)}
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

        {/* Security Footer */}
        <div style={{
          padding: '15px 20px',
          borderTop: '1px solid #e5e7eb',
          marginTop: '20px'
        }}>
          <div style={{
            fontSize: '11px',
            color: '#6b7280',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            <div style={{ marginBottom: '4px' }}>
              🔒 <strong>Internal Use Only</strong>
            </div>
            <div style={{ marginBottom: '4px' }}>
              Designed by Claude • © GitHub
            </div>
            <div style={{ 
              color: '#3b82f6',
              wordBreak: 'break-all'
            }}>
              {DASHBOARD_CONFIG.baseUrl}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: '1', backgroundColor: '#ffffff' }}>
        {renderContent()}
      </div>
    </div>
  );
}

// =============================================================================
// SIMPLE FALLBACK COMPONENT
// =============================================================================
const ComingSoonComponent = ({ title }: { title: string }) => (
  <div style={{ 
    padding: '40px',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <div style={{
      backgroundColor: 'white',
      padding: '40px',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      maxWidth: '400px'
    }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚀</div>
      <h2 style={{ 
        color: '#1f2937',
        fontSize: '24px',
        fontWeight: 'bold',
        margin: '0 0 8px 0'
      }}>
        {title}
      </h2>
      <p style={{
        color: '#6b7280',
        fontSize: '16px',
        margin: '0'
      }}>
        Coming soon to your 3C Dashboard
      </p>
    </div>
  </div>
);

export default App;
