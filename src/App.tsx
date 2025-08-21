import React, { useState } from 'react';

// Import your existing components - adjust paths as needed
// Comment out any that don't exist yet
// import OverviewComponent from './overviewcomponent';
// import ContentComponent from './contentcomponent';
// import WebChatComponent from './webchat';
// import ScheduleComponent from './schedulecomponent';
// import MarketingComponent from './marketingcomponent';
// import SettingsComponent from './settingscomponent';
// import AdminComponents from './admincomponents';
// import AIChatComponent from './aichatcomponent';

// =============================================================================
// MAIN DASHBOARD - WORKING VERSION
// =============================================================================

function App() {
  const [activeSection, setActiveSection] = useState('content-manager');

  const navigationItems = [
    { id: 'overview', icon: '📊', label: 'Overview', available: false },
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
    note: 'Internal feature'
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        // return <OverviewComponent />;
        return <ComingSoonComponent title="Overview" />;
      case 'content-manager':
        // return <ContentComponent />;
        return <PlaceholderComponent title="Content Manager" />;
      case 'webchat-public':
        // return <WebChatComponent />;
        return <PlaceholderComponent title="WebChat Public" />;
      case 'schedule-manager':
        // return <ScheduleComponent />;
        return <PlaceholderComponent title="Schedule Manager" />;
      case 'marketing-center':
        // return <MarketingComponent />;
        return <PlaceholderComponent title="Marketing Center" />;
      case 'settings':
        // return <SettingsComponent />;
        return <PlaceholderComponent title="Dashboard Settings" />;
      case 'admin-center':
        // return <AdminComponents />;
        return <PlaceholderComponent title="Admin Center" />;
      case 'ai-chat-manager':
        // return <AIChatComponent />;
        return <ComingSoonComponent title="AI Chat Manager" />;
      default:
        return <ComingSoonComponent title={activeSection} />;
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
            Dashboard v2.0
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
            onClick={() => bottomNavItem.available && setActiveSection(bottomNavItem.id)}
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

        {/* Build Status */}
        <div style={{ 
          padding: '10px', 
          margin: '10px',
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          border: '1px solid #10b981'
        }}>
          <div style={{ 
            fontSize: '12px', 
            color: '#047857', 
            fontWeight: 'bold',
            marginBottom: '5px'
          }}>
            ✅ Build Status: Working
          </div>
          <div style={{ fontSize: '10px', color: '#059669' }}>
            Dashboard structure ready<br/>
            Ready to add components
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
// PLACEHOLDER COMPONENT - SHOWS YOUR EXISTING COMPONENTS WILL GO HERE
// =============================================================================

function PlaceholderComponent({ title }: { title: string }) {
  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>
        {title}
      </h2>
      
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        borderRadius: '12px',
        border: '2px solid #3b82f6'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔧</div>
        <h3 style={{ color: '#1e40af', marginBottom: '15px' }}>
          Ready for Your Component
        </h3>
        <p style={{ color: '#2563eb', marginBottom: '20px' }}>
          This section is ready for your existing <strong>{title}</strong> component.
        </p>
        
        <div style={{ 
          padding: '15px', 
          backgroundColor: 'rgba(255,255,255,0.8)', 
          borderRadius: '8px',
          fontSize: '14px',
          color: '#1e40af',
          textAlign: 'left'
        }}>
          <strong>To activate this section:</strong>
          <ol style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li>Make sure your component file exists</li>
            <li>Uncomment the import line in App.tsx</li>
            <li>Uncomment the return line in renderContent()</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// COMING SOON COMPONENT
// =============================================================================

function ComingSoonComponent({ title }: { title: string }) {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        padding: '60px 40px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
        borderRadius: '12px',
        border: '2px dashed #d1d5db'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚧</div>
        <h2 style={{ color: '#6b7280', marginBottom: '15px', fontSize: '28px' }}>
          {title.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </h2>
        <p style={{ fontSize: '16px', color: '#9ca3af' }}>
          This section is coming soon
        </p>
      </div>
    </div>
  );
}

export default App;
