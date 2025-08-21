import React, { useState } from 'react';

// IMPORT YOUR REAL COMPONENTS - Uncomment as you create the files
// import OverviewComponent from './overviewcomponent';
// import ContentComponent from './contentcomponent';
// import WebChatComponent from './webchat';
// import ScheduleComponent from './schedulecomponent';
// import MarketingComponent from './marketingcomponent';
// import SettingsComponent from './settingscomponent';
// import AdminComponents from './admincomponents';
// import AIChatComponent from './aichatcomponent';

// =============================================================================
// MAIN DASHBOARD - CONNECTS TO YOUR REAL COMPONENT FILES
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
        // return <OverviewComponent />; // Uncomment when overviewcomponent.tsx exists
        return <ComingSoonComponent title="Overview" note="Create overviewcomponent.tsx" />;
      case 'content-manager':
        // return <ContentComponent />; // Uncomment when contentcomponent.tsx exists
        return <ComingSoonComponent title="Content Manager" note="Create contentcomponent.tsx" />;
      case 'webchat-public':
        // return <WebChatComponent />; // Uncomment when webchat.tsx exists
        return <ComingSoonComponent title="WebChat Public" note="Create webchat.tsx" />;
      case 'schedule-manager':
        // return <ScheduleComponent />; // Uncomment when schedulecomponent.tsx exists
        return <ComingSoonComponent title="Schedule Manager" note="Create schedulecomponent.tsx" />;
      case 'marketing-center':
        // return <MarketingComponent />; // Uncomment when marketingcomponent.tsx exists
        return <ComingSoonComponent title="Marketing Center" note="Create marketingcomponent.tsx" />;
      case 'settings':
        // return <SettingsComponent />; // Uncomment when settingscomponent.tsx exists
        return <ComingSoonComponent title="Dashboard Settings" note="Create settingscomponent.tsx" />;
      case 'admin-center':
        // return <AdminComponents />; // Uncomment when admincomponents.tsx exists
        return <ComingSoonComponent title="Admin Center" note="Create admincomponents.tsx" />;
      case 'ai-chat-manager':
        // return <AIChatComponent />; // Uncomment when aichatcomponent.tsx exists
        return <ComingSoonComponent title="AI Chat Manager" note="Create aichatcomponent.tsx" />;
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
// SIMPLE FALLBACK COMPONENT
// =============================================================================

function ComingSoonComponent({ title, note }: { title: string; note?: string }) {
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
        <p style={{ fontSize: '16px', color: '#9ca3af', marginBottom: '15px' }}>
          This section is ready for your component
        </p>
        {note && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#374151'
          }}>
            📝 Next Step: {note}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
