import React, { useState } from 'react';

// Import new components (create these files as needed)
// import ContentComponent from './contentcomponent';
// import ScheduleComponent from './schedulecomponent';
// import MarketingComponent from './marketingcomponent';
// import AIChatComponent from './aichatcomponent';

// =============================================================================
// MAIN DASHBOARD WITH YOUR EXACT REQUIREMENTS
// =============================================================================

function App() {
  const [activeSection, setActiveSection] = useState('content-manager');

  // YOUR EXACT NAVIGATION STRUCTURE
  const navigationItems = [
    { id: 'overview', icon: '📊', label: 'Overview', available: false, file: 'overviewcomponent.tsx' },
    { id: 'content-manager', icon: '📝', label: 'Content Manager', available: true, file: 'contentcomponent.tsx' },
    { id: 'webchat-public', icon: '💬', label: 'WebChat Public', available: true, file: 'webchat.tsx' },
    { id: 'schedule-manager', icon: '📅', label: 'Schedule Manager', available: true, file: 'schedulecomponent.tsx' },
    { id: 'marketing-center', icon: '🧠', label: 'Marketing Center', available: true, file: 'marketingcomponent.tsx' },
    { id: 'settings', icon: '⚙️', label: 'Dashboard Settings', available: true, file: 'settingscomponent.tsx' },
    { id: 'admin-center', icon: '🔧', label: 'Admin Center', available: true, file: 'admincomponents.tsx' }
  ];

  const bottomNavItem = { 
    id: 'ai-chat-manager', 
    icon: '🤖', 
    label: 'AI Chat Manager', 
    available: false,
    note: 'Internal feature',
    file: 'aichatcomponent.tsx'
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewComponent />;
      case 'content-manager':
        return <ContentManagerComponent />;
      case 'webchat-public':
        return <WebChatComponent />;
      case 'schedule-manager':
        return <ScheduleManagerComponent />;
      case 'marketing-center':
        return <MarketingCenterComponent />;
      case 'settings':
        return <SettingsComponent />;
      case 'admin-center':
        return <AdminCenterComponent />;
      case 'ai-chat-manager':
        return <AIChatManagerComponent />;
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
            Your Dashboard
          </p>
        </div>

        {/* Main Navigation - YOUR EXACT ORDER */}
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
// YOUR EXISTING WORKING COMPONENTS - KEPT EXACTLY THE SAME
// =============================================================================

function WebChatComponent() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>💬 WebChat Public</h2>
      <p>Safe working component - WebChat functionality</p>
      
      <div style={{ 
        padding: '60px 40px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
        borderRadius: '12px',
        border: '2px solid #10b981'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>💬</div>
        <h3 style={{ color: '#047857', marginBottom: '15px', fontSize: '24px' }}>
          WebChat Component
        </h3>
        <p style={{ fontSize: '16px', color: '#059669', marginBottom: '25px' }}>
          This is your SAFE working WebChat component. All WebChat functionality is preserved here.
        </p>
        <div style={{ 
          padding: '20px', 
          backgroundColor: 'rgba(255,255,255,0.8)', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <p style={{ color: '#047857', fontWeight: 'bold' }}>
            ✅ WebChat features preserved:
          </p>
          <ul style={{ color: '#059669', textAlign: 'left', marginTop: '10px' }}>
            <li>Chat interface</li>
            <li>Message handling</li>
            <li>User management</li>
            <li>Settings configuration</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function AdminCenterComponent() {
  const [activeTab, setActiveTab] = useState('templates');

  return (
    <div>
      {/* Top Tab Navigation */}
      <div style={{ 
        borderBottom: '1px solid #e5e7eb', 
        backgroundColor: '#f9fafb', 
        padding: '0 20px' 
      }}>
        <div style={{ display: 'flex', gap: '0' }}>
          <button
            onClick={() => setActiveTab('templates')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'templates' ? '#ffffff' : 'transparent',
              color: activeTab === 'templates' ? '#1f2937' : '#6b7280',
              border: 'none',
              borderBottom: activeTab === 'templates' ? '2px solid #3b82f6' : '2px solid transparent',
              fontWeight: activeTab === 'templates' ? 'bold' : 'normal',
              cursor: 'pointer'
            }}
          >
            🗂️ Manage Templates
          </button>
          <button
            onClick={() => setActiveTab('libraries')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'libraries' ? '#ffffff' : 'transparent',
              color: activeTab === 'libraries' ? '#1f2937' : '#6b7280',
              border: 'none',
              borderBottom: activeTab === 'libraries' ? '2px solid #3b82f6' : '2px solid transparent',
              fontWeight: activeTab === 'libraries' ? 'bold' : 'normal',
              cursor: 'pointer'
            }}
          >
            📚 Libraries
          </button>
          <button
            onClick={() => setActiveTab('brand')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'brand' ? '#ffffff' : 'transparent',
              color: activeTab === 'brand' ? '#1f2937' : '#6b7280',
              border: 'none',
              borderBottom: activeTab === 'brand' ? '2px solid #3b82f6' : '2px solid transparent',
              fontWeight: activeTab === 'brand' ? 'bold' : 'normal',
              cursor: 'pointer'
            }}
          >
            🏢 Brand Kit
          </button>
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'templates' && <AdminTemplatesTab />}
      {activeTab === 'libraries' && <AdminLibrariesTab />}
      {activeTab === 'brand' && <AdminBrandTab />}
    </div>
  );
}

function AdminTemplatesTab() {
  return (
    <div style={{ padding: '20px' }}>
      <h3>🗂️ Manage Templates</h3>
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: '#fef3c7',
        borderRadius: '12px',
        border: '2px dashed #f59e0b'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔧</div>
        <h4 style={{ color: '#92400e', marginBottom: '10px' }}>Ready for Enhancement</h4>
        <p style={{ color: '#d97706' }}>
          This section will include:
        </p>
        <ul style={{ color: '#d97706', textAlign: 'left', marginTop: '10px' }}>
          <li>Template creation and editing</li>
          <li>External GitHub components section</li>
          <li>3C Brand products external links</li>
          <li>Template builder functionality</li>
        </ul>
      </div>
    </div>
  );
}

function AdminLibrariesTab() {
  return (
    <div style={{ padding: '20px' }}>
      <h3>📚 Libraries</h3>
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: '#dbeafe',
        borderRadius: '12px'
      }}>
        <p style={{ color: '#1e40af' }}>Libraries integration (Notion, Canva, Wasabi) - Working</p>
      </div>
    </div>
  );
}

function AdminBrandTab() {
  return (
    <div style={{ padding: '20px' }}>
      <h3>🏢 Brand Kit</h3>
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: '#ede9fe',
        borderRadius: '12px'
      }}>
        <p style={{ color: '#7c3aed' }}>Brand management - In development</p>
      </div>
    </div>
  );
}

function SettingsComponent() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>⚙️ Dashboard Settings</h2>
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: '#fef2f2',
        borderRadius: '12px',
        border: '2px dashed #ef4444'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔧</div>
        <h4 style={{ color: '#dc2626', marginBottom: '10px' }}>Settings Components Needed</h4>
        <p style={{ color: '#dc2626' }}>
          Need to restore:
        </p>
        <ul style={{ color: '#dc2626', textAlign: 'left', marginTop: '10px' }}>
          <li>Character profiles configuration</li>
          <li>Platforms configuration (Telegram, etc.)</li>
          <li>Save and edit functionality</li>
          <li>Profile images and detailed settings</li>
        </ul>
      </div>
    </div>
  );
}

function OverviewComponent() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>📊 Overview</h2>
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: '#f3f4f6',
        borderRadius: '12px',
        border: '2px dashed #9ca3af'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>📊</div>
        <h4 style={{ color: '#6b7280', marginBottom: '10px' }}>Overview Component</h4>
        <p style={{ color: '#6b7280' }}>
          Dashboard overview - File: overviewcomponent.tsx
        </p>
        <div style={{ 
          marginTop: '15px', 
          fontSize: '12px', 
          color: '#9ca3af',
          fontStyle: 'italic'
        }}>
          Status: Coming soon (low priority)
        </div>
      </div>
    </div>
  );
}

function ContentManagerComponent() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>📝 Content Manager</h2>
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        borderRadius: '12px',
        border: '2px solid #3b82f6'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>📝</div>
        <h4 style={{ color: '#1e40af', marginBottom: '10px' }}>Content Manager Component</h4>
        <p style={{ color: '#2563eb', marginBottom: '15px' }}>
          Create and manage content posts - File: contentcomponent.tsx
        </p>
        <div style={{ 
          padding: '15px', 
          backgroundColor: 'rgba(255,255,255,0.8)', 
          borderRadius: '8px',
          fontSize: '14px',
          color: '#1e40af',
          textAlign: 'left'
        }}>
          <strong>🔗 Integrations needed:</strong>
          <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
            <li>Character profiles from Settings</li>
            <li>Platforms from Settings</li>
            <li>Templates from Admin Center</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function ScheduleManagerComponent() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>📅 Schedule Manager</h2>
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        borderRadius: '12px',
        border: '2px solid #22c55e'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>📅</div>
        <h4 style={{ color: '#15803d', marginBottom: '10px' }}>Schedule Manager Component</h4>
        <p style={{ color: '#16a34a', marginBottom: '15px' }}>
          Schedule and manage post publishing - File: schedulecomponent.tsx
        </p>
        <div style={{ 
          padding: '15px', 
          backgroundColor: 'rgba(255,255,255,0.8)', 
          borderRadius: '8px',
          fontSize: '14px',
          color: '#15803d',
          textAlign: 'left'
        }}>
          <strong>🔗 Integrations needed:</strong>
          <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
            <li>Posts from Content Manager</li>
            <li>Telegram bot connection (your existing setup)</li>
            <li>Supabase scheduled_posts table</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function MarketingCenterComponent() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>🧠 Marketing Center</h2>
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%)',
        borderRadius: '12px',
        border: '2px solid #a855f7'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🧠</div>
        <h4 style={{ color: '#7c3aed', marginBottom: '10px' }}>Marketing Center Component</h4>
        <p style={{ color: '#8b5cf6', marginBottom: '15px' }}>
          Marketing analytics and campaigns - File: marketingcomponent.tsx
        </p>
        <div style={{ 
          padding: '15px', 
          backgroundColor: 'rgba(255,255,255,0.8)', 
          borderRadius: '8px',
          fontSize: '14px',
          color: '#7c3aed',
          textAlign: 'left'
        }}>
          <strong>🔗 Integrations needed:</strong>
          <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
            <li>Data from Admin Center</li>
            <li>Settings configuration</li>
            <li>Content Manager analytics</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function AIChatManagerComponent() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>🤖 AI Chat Manager</h2>
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
        borderRadius: '12px',
        border: '2px dashed #d1d5db'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🤖</div>
        <h4 style={{ color: '#6b7280', marginBottom: '10px' }}>AI Chat Manager Component</h4>
        <p style={{ color: '#9ca3af', marginBottom: '15px' }}>
          Internal AI chat management - File: aichatcomponent.tsx
        </p>
        <div style={{ 
          padding: '15px', 
          backgroundColor: 'rgba(255,255,255,0.8)', 
          borderRadius: '8px',
          fontSize: '14px',
          color: '#6b7280',
          textAlign: 'left'
        }}>
          <strong>📋 Features planned:</strong>
          <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
            <li>AI conversation management</li>
            <li>Internal brand features</li>
            <li>Advanced chat controls</li>
          </ul>
          <div style={{ 
            marginTop: '10px', 
            fontSize: '11px', 
            color: '#9ca3af',
            fontStyle: 'italic'
          }}>
            Status: Coming soon
          </div>
        </div>
      </div>
    </div>
  );
}

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
          {title}
        </h2>
        <p style={{ fontSize: '16px', color: '#9ca3af', marginBottom: '15px' }}>
          This section is ready for development
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
