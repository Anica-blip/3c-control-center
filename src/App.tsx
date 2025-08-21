import React, { useState } from 'react';

// =============================================================================
// MAIN DASHBOARD - NAVIGATION WORKING
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
        return <AIChatComponent />;
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
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: '1', backgroundColor: '#ffffff' }}>
        {renderContent()}
      </div>
    </div>
  );
}

// =============================================================================
// PLACEHOLDER COMPONENTS - SHOWS EXPORT INSTRUCTIONS
// =============================================================================

const OverviewComponent = () => (
  <div style={{ padding: '20px' }}>
    <h2>📊 Overview</h2>
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f9ff',
      borderRadius: '8px',
      border: '1px solid #0ea5e9'
    }}>
      <p style={{ margin: 0, color: '#0369a1' }}>
        ✅ Your overviewcomponent.tsx file exists<br/>
        🔧 Add this line to the end: <code>export default OverviewComponent;</code>
      </p>
    </div>
  </div>
);

const ContentComponent = () => (
  <div style={{ padding: '20px' }}>
    <h2>📝 Content Manager</h2>
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f9ff',
      borderRadius: '8px',
      border: '1px solid #0ea5e9'
    }}>
      <p style={{ margin: 0, color: '#0369a1' }}>
        ✅ Your contentcomponent.tsx file exists<br/>
        🔧 Add this line to the end: <code>export default ContentComponent;</code>
      </p>
    </div>
  </div>
);

const WebChatComponent = () => (
  <div style={{ padding: '20px' }}>
    <h2>💬 WebChat Public</h2>
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f9ff',
      borderRadius: '8px',
      border: '1px solid #0ea5e9'
    }}>
      <p style={{ margin: 0, color: '#0369a1' }}>
        ✅ Your webchat.tsx file exists<br/>
        🔧 Add this line to the end: <code>export default WebChatComponent;</code>
      </p>
    </div>
  </div>
);

const ScheduleComponent = () => (
  <div style={{ padding: '20px' }}>
    <h2>📅 Schedule Manager</h2>
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f9ff',
      borderRadius: '8px',
      border: '1px solid #0ea5e9'
    }}>
      <p style={{ margin: 0, color: '#0369a1' }}>
        ✅ Your schedulecomponent.tsx file exists<br/>
        🔧 Add this line to the end: <code>export default ScheduleComponent;</code>
      </p>
    </div>
  </div>
);

const MarketingComponent = () => (
  <div style={{ padding: '20px' }}>
    <h2>🧠 Marketing Center</h2>
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f9ff',
      borderRadius: '8px',
      border: '1px solid #0ea5e9'
    }}>
      <p style={{ margin: 0, color: '#0369a1' }}>
        ✅ Your marketingcomponent.tsx file exists<br/>
        🔧 Add this line to the end: <code>export default MarketingComponent;</code>
      </p>
    </div>
  </div>
);

const SettingsComponent = () => (
  <div style={{ padding: '20px' }}>
    <h2>⚙️ Dashboard Settings</h2>
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f9ff',
      borderRadius: '8px',
      border: '1px solid #0ea5e9'
    }}>
      <p style={{ margin: 0, color: '#0369a1' }}>
        ✅ Your settingscomponent.tsx file exists<br/>
        🔧 Add this line to the end: <code>export default SettingsComponent;</code>
      </p>
    </div>
  </div>
);

const AdminComponents = () => (
  <div style={{ padding: '20px' }}>
    <h2>🔧 Admin Center</h2>
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f9ff',
      borderRadius: '8px',
      border: '1px solid #0ea5e9'
    }}>
      <p style={{ margin: 0, color: '#0369a1' }}>
        ✅ Your admincomponents.tsx file exists<br/>
        🔧 Add this line to the end: <code>export default AdminComponents;</code>
      </p>
    </div>
  </div>
);

const AIChatComponent = () => (
  <div style={{ padding: '20px' }}>
    <h2>🤖 AI Chat Manager</h2>
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f9ff',
      borderRadius: '8px',
      border: '1px solid #0ea5e9'
    }}>
      <p style={{ margin: 0, color: '#0369a1' }}>
        ✅ Your aichatcomponent.tsx file exists<br/>
        🔧 Add this line to the end: <code>export default AIChatComponent;</code>
      </p>
    </div>
  </div>
);

const ComingSoonComponent = ({ title }: { title: string }) => (
  <div style={{ padding: '20px' }}>
    <h2>{title}</h2>
    <p>Coming soon</p>
  </div>
);

export default App;
