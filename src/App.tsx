import React, { useState } from 'react';

// =============================================================================
// MAIN DASHBOARD SKELETON
// =============================================================================

function App() {
  const [activeSection, setActiveSection] = useState('webchat');

  const navigationItems = [
    { id: 'overview', icon: '📊', label: 'Overview', available: true },
    { id: 'webchat', icon: '💬', label: 'WebChat', available: true },
    { id: 'content-manager', icon: '📝', label: 'Content Manager', available: false },
    { id: 'chat-manager-public', icon: '💬', label: 'Chat Manager - Public', available: false },
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
      case 'webchat':
        return <WebChatComponent />;
      case 'admin-center':
        return <AdminCenterComponent />;
      case 'settings':
        return <SettingsComponent />;
      case 'overview':
        return <OverviewComponent />;
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
            style={{
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
            }}
          >
            <span style={{ fontSize: '16px' }}>{bottomNavItem.icon}</span>
            <div style={{ flex: '1' }}>
              <div>{bottomNavItem.label}</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>{bottomNavItem.note}</div>
            </div>
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
// WEBCHAT COMPONENT (SAFE - WORKING VERSION)
// =============================================================================

function WebChatComponent() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>💬 WebChat</h2>
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
          This is our SAFE working WebChat component. All WebChat functionality should be preserved here.
        </p>
        <div style={{ 
          padding: '20px', 
          backgroundColor: 'rgba(255,255,255,0.8)', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <p style={{ color: '#047857', fontWeight: 'bold' }}>
            ✅ WebChat features to preserve:
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

// =============================================================================
// ADMIN CENTER COMPONENT (TO BE FIXED)
// =============================================================================

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
            🏗️ Manage Templates
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

// =============================================================================
// ADMIN TABS (TO BE RESTORED)
// =============================================================================

function AdminTemplatesTab() {
  return (
    <div style={{ padding: '20px' }}>
      <h3>🏗️ Manage Templates</h3>
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: '#fef3c7',
        borderRadius: '12px',
        border: '2px dashed #f59e0b'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔧</div>
        <h4 style={{ color: '#92400e', marginBottom: '10px' }}>Missing Components</h4>
        <p style={{ color: '#d97706' }}>
          Need to restore:
        </p>
        <ul style={{ color: '#d97706', textAlign: 'left', marginTop: '10px' }}>
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

// =============================================================================
// SETTINGS COMPONENT (TO BE REBUILT)
// =============================================================================

function SettingsComponent() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>⚙️ Settings</h2>
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: '#fef2f2',
        borderRadius: '12px',
        border: '2px dashed #ef4444'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔧</div>
        <h4 style={{ color: '#dc2626', marginBottom: '10px' }}>Missing Settings</h4>
        <p style={{ color: '#dc2626' }}>
          Need to restore:
        </p>
        <ul style={{ color: '#dc2626', textAlign: 'left', marginTop: '10px' }}>
          <li>Platforms configuration</li>
          <li>Telegram channel/group settings</li>
          <li>Save and edit functionality</li>
        </ul>
      </div>
    </div>
  );
}

// =============================================================================
// OVERVIEW COMPONENT (LOW PRIORITY)
// =============================================================================

function OverviewComponent() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>📊 Overview</h2>
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: '#f3f4f6',
        borderRadius: '12px'
      }}>
        <p style={{ color: '#6b7280' }}>Overview section - Low priority, to be built last</p>
      </div>
    </div>
  );
}

// =============================================================================
// COMING SOON COMPONENT
// =============================================================================

function ComingSoonComponent({ title }) {
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
