import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";

// Simple Settings component for now
function Settings() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>⚙️ Settings</h1>
      <p>Configure social platforms and character profiles for your content system</p>
      
      <div style={{ marginTop: '30px' }}>
        <div style={{ 
          padding: '30px', 
          border: '2px dashed #d1d5db', 
          borderRadius: '8px', 
          background: '#fafafa',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#6b7280', marginBottom: '10px' }}>⚙️ Settings Configuration</h3>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '20px' }}>
            Social platform management and character profile settings coming soon
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '15px',
            opacity: 0.6
          }}>
            <div style={{ padding: '15px', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#f9fafb' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#6b7280' }}>Social Platforms</div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>Instagram, Twitter, etc.</div>
            </div>
            <div style={{ padding: '15px', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#f9fafb' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#6b7280' }}>Character Profiles</div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>Aurion, Caelum, Anica</div>
            </div>
            <div style={{ padding: '15px', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#f9fafb' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#6b7280' }}>Error Logs</div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>System diagnostics</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function AdminTemplates() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>🏗️ Manage Templates</h2>
      <p>Manage templates, libraries, and brand assets</p>
      
      {/* Two Column Layout: Building (Left) + 3C Brand Products (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '30px' }}>
        
        {/* LEFT SIDE: Builder Admin */}
        <div style={{ 
          padding: '20px', 
          border: '2px solid #3b82f6', 
          borderRadius: '8px', 
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' 
        }}>
          <h3 style={{ color: '#1e40af', marginBottom: '10px' }}>🏗️ Builder Admin</h3>
          <p style={{ color: '#1e40af', fontSize: '14px', marginBottom: '15px' }}>
            External integration for automated generation
          </p>
          
          <div style={{ display: 'grid', gap: '10px' }}>
            <a 
              href="https://anica-blip.github.io/3c-content-template-engine/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px', 
                background: 'rgba(255,255,255,0.7)', 
                border: '1px solid #93c5fd', 
                borderRadius: '6px', 
                textDecoration: 'none',
                color: '#1e40af'
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold' }}>Content Template Engine</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Comprehensive template creation and management</div>
              </div>
              <span style={{ fontSize: '12px' }}>🔗 Open</span>
            </a>
            
            <a 
              href="https://anica-blip.github.io/3c-desktop-editor/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px', 
                background: 'rgba(255,255,255,0.7)', 
                border: '1px solid #93c5fd', 
                borderRadius: '6px', 
                textDecoration: 'none',
                color: '#1e40af'
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold' }}>Featured Content Templates</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Social Media, Blog, News page, Article</div>
              </div>
              <span style={{ fontSize: '12px' }}>🔗 Open</span>
            </a>
            
            <a 
              href="https://anica-blip.github.io/3c-content-scheduler/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px', 
                background: 'rgba(255,255,255,0.7)', 
                border: '1px solid #93c5fd', 
                borderRadius: '6px', 
                textDecoration: 'none',
                color: '#1e40af'
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold' }}>Content Management</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Content creation with AI & Templates</div>
              </div>
              <span style={{ fontSize: '12px' }}>🔗 Open</span>
            </a>
            
            <a 
              href="https://anica-blip.github.io/3c-smpost-generator/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px', 
                background: 'rgba(255,255,255,0.7)', 
                border: '1px solid #93c5fd', 
                borderRadius: '6px', 
                textDecoration: 'none',
                color: '#1e40af'
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold' }}>SM Content Generator</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Generate social media post content</div>
              </div>
              <span style={{ fontSize: '12px' }}>🔗 Open</span>
            </a>
          </div>
        </div>

        {/* RIGHT SIDE: 3C Brand Products */}
        <div style={{ 
          padding: '20px', 
          border: '2px solid #10b981', 
          borderRadius: '8px', 
          background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' 
        }}>
          <h3 style={{ color: '#047857', marginBottom: '10px' }}>🎮 3C Brand Products</h3>
          <p style={{ color: '#047857', fontSize: '14px', marginBottom: '15px' }}>
            External app editors for interactive app loaders
          </p>
          
          <div style={{ display: 'grid', gap: '10px' }}>
            <a 
              href="https://anica-blip.github.io/3c-quiz-admin/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px', 
                background: 'rgba(255,255,255,0.7)', 
                border: '1px solid #6ee7b7', 
                borderRadius: '6px', 
                textDecoration: 'none',
                color: '#047857'
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold' }}>Quiz Generator</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>3C Interactive Quizzes</div>
              </div>
              <span style={{ fontSize: '12px' }}>🔗 Open</span>
            </a>
            
            <a 
              href="https://anica-blip.github.io/3c-quiz-admin/landing.html?quiz=quiz.01" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px', 
                background: 'rgba(255,255,255,0.7)', 
                border: '1px solid #6ee7b7', 
                borderRadius: '6px', 
                textDecoration: 'none',
                color: '#047857'
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold' }}>Quiz Landing Page & App Loader</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Quiz application landing interface</div>
              </div>
              <span style={{ fontSize: '12px' }}>🔗 Open</span>
            </a>
            
            <a 
              href="https://anica-blip.github.io/3c-game-loader/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px', 
                background: 'rgba(255,255,255,0.7)', 
                border: '1px solid #6ee7b7', 
                borderRadius: '6px', 
                textDecoration: 'none',
                color: '#047857'
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold' }}>Game Generator</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Games, puzzles, challenges</div>
              </div>
              <span style={{ fontSize: '12px' }}>🔗 Open</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminLibraries() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>📚 Libraries</h2>
      <p>External service integrations and storage</p>
      
      {/* Three blocks in a row: Notion, Wasabi, Canva */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '20px', 
        marginTop: '30px' 
      }}>
        <div style={{ 
          padding: '20px', 
          border: '1px solid #d1d5db', 
          borderRadius: '8px', 
          background: '#f9fafb',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>📝 Notion</h3>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>
            Content management integration
          </p>
          <button 
            style={{ 
              width: '100%', 
              padding: '12px', 
              backgroundColor: '#f3f4f6', 
              border: '1px solid #d1d5db', 
              borderRadius: '6px', 
              cursor: 'not-allowed',
              color: '#6b7280',
              fontSize: '14px'
            }}
            disabled
          >
            🔗 Connect Notion
            <div style={{ fontSize: '12px', marginTop: '5px' }}>Coming Soon</div>
          </button>
        </div>
        
        <div style={{ 
          padding: '20px', 
          border: '1px solid #d1d5db', 
          borderRadius: '8px', 
          background: '#f9fafb',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>📦 Wasabi</h3>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>
            Cloud storage integration
          </p>
          <button 
            style={{ 
              width: '100%', 
              padding: '12px', 
              backgroundColor: '#f3f4f6', 
              border: '1px solid #d1d5db', 
              borderRadius: '6px', 
              cursor: 'not-allowed',
              color: '#6b7280',
              fontSize: '14px'
            }}
            disabled
          >
            🔗 Connect Wasabi
            <div style={{ fontSize: '12px', marginTop: '5px' }}>Coming Soon</div>
          </button>
        </div>
        
        <div style={{ 
          padding: '20px', 
          border: '1px solid #d1d5db', 
          borderRadius: '8px', 
          background: '#f9fafb',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>🎨 Canva</h3>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>
            Design platform integration
          </p>
          <button 
            style={{ 
              width: '100%', 
              padding: '12px', 
              backgroundColor: '#f3f4f6', 
              border: '1px solid #d1d5db', 
              borderRadius: '6px', 
              cursor: 'not-allowed',
              color: '#6b7280',
              fontSize: '14px'
            }}
            disabled
          >
            🔗 Connect Canva
            <div style={{ fontSize: '12px', marginTop: '5px' }}>Coming Soon</div>
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminBrand() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>🏢 Brand</h2>
      <p>Brand assets, AI tools, and system configuration</p>
      
      <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
        {/* System Status */}
        <div style={{ 
          padding: '20px', 
          border: '1px solid #d1d5db', 
          borderRadius: '8px', 
          background: '#f9fafb' 
        }}>
          <h3 style={{ marginBottom: '15px' }}>📊 System Status</h3>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>Current system health and integrations</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '14px' }}>Dashboard Online</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '14px' }}>Content Manager</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '14px' }}>Scheduler Active</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '14px' }}>External Integrations</span>
            </div>
          </div>
        </div>

        {/* Future Brand Tools */}
        <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <div style={{ padding: '20px', border: '1px solid #d1d5db', borderRadius: '8px', background: '#f9fafb' }}>
            <h4 style={{ marginBottom: '10px' }}>🎨 Brand Library</h4>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>Brand assets and guidelines</p>
            <button style={{ 
              width: '100%', 
              padding: '10px', 
              backgroundColor: '#f3f4f6', 
              border: '1px solid #d1d5db', 
              borderRadius: '6px', 
              cursor: 'not-allowed',
              color: '#6b7280'
            }} disabled>
              Manage Brand Assets (Soon)
            </button>
          </div>
          
          <div style={{ padding: '20px', border: '1px solid #d1d5db', borderRadius: '8px', background: '#f9fafb' }}>
            <h4 style={{ marginBottom: '10px' }}>🤖 AI Internal Tools</h4>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>Internal AI capabilities</p>
            <button style={{ 
              width: '100%', 
              padding: '10px', 
              backgroundColor: '#f3f4f6', 
              border: '1px solid #d1d5db', 
              borderRadius: '6px', 
              cursor: 'not-allowed',
              color: '#6b7280'
            }} disabled>
              Configure AI Tools (Soon)
            </button>
          </div>
          
          <div style={{ padding: '20px', border: '1px solid #d1d5db', borderRadius: '8px', background: '#f9fafb' }}>
            <h4 style={{ marginBottom: '10px' }}>🌐 AI External Tools</h4>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>External AI service integrations</p>
            <button style={{ 
              width: '100%', 
              padding: '10px', 
              backgroundColor: '#f3f4f6', 
              border: '1px solid #d1d5db', 
              borderRadius: '6px', 
              cursor: 'not-allowed',
              color: '#6b7280'
            }} disabled>
              Manage External APIs (Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminCenter() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('templates');
  
  // Get active tab from URL or default to templates
  React.useEffect(() => {
    const path = location.pathname;
    if (path.includes('/admin/libraries')) setActiveTab('libraries');
    else if (path.includes('/admin/brand')) setActiveTab('brand');
    else setActiveTab('templates');
  }, [location]);

  return (
    <div>
      {/* Top Tab Navigation */}
      <div style={{ 
        borderBottom: '1px solid #e5e7eb', 
        backgroundColor: '#f9fafb', 
        padding: '0 20px' 
      }}>
        <div style={{ display: 'flex', gap: '0' }}>
          <Link
            to="/3c-control-center/admin/templates"
            style={{
              padding: '12px 24px',
              textDecoration: 'none',
              color: activeTab === 'templates' ? '#1f2937' : '#6b7280',
              backgroundColor: activeTab === 'templates' ? '#ffffff' : 'transparent',
              borderBottom: activeTab === 'templates' ? '2px solid #3b82f6' : '2px solid transparent',
              fontWeight: activeTab === 'templates' ? 'bold' : 'normal'
            }}
            onClick={() => setActiveTab('templates')}
          >
            🏗️ Manage Templates
          </Link>
          <Link
            to="/3c-control-center/admin/libraries"
            style={{
              padding: '12px 24px',
              textDecoration: 'none',
              color: activeTab === 'libraries' ? '#1f2937' : '#6b7280',
              backgroundColor: activeTab === 'libraries' ? '#ffffff' : 'transparent',
              borderBottom: activeTab === 'libraries' ? '2px solid #3b82f6' : '2px solid transparent',
              fontWeight: activeTab === 'libraries' ? 'bold' : 'normal'
            }}
            onClick={() => setActiveTab('libraries')}
          >
            📚 Libraries
          </Link>
          <Link
            to="/3c-control-center/admin/brand"
            style={{
              padding: '12px 24px',
              textDecoration: 'none',
              color: activeTab === 'brand' ? '#1f2937' : '#6b7280',
              backgroundColor: activeTab === 'brand' ? '#ffffff' : 'transparent',
              borderBottom: activeTab === 'brand' ? '2px solid #3b82f6' : '2px solid transparent',
              fontWeight: activeTab === 'brand' ? 'bold' : 'normal'
            }}
            onClick={() => setActiveTab('brand')}
          >
            🏢 Brand Assets
          </Link>
        </div>
      </div>

      {/* Content Area */}
      <Routes>
        <Route path="/admin/templates" element={<AdminTemplates />} />
        <Route path="/admin/libraries" element={<AdminLibraries />} />
        <Route path="/admin/brand" element={<AdminBrand />} />
        <Route path="/admin" element={<AdminTemplates />} />
      </Routes>
    </div>
  );
}

function Dashboard() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>🚀 3C Control Center</h1>
      <p>Your dashboard is now live!</p>
      <div style={{ marginTop: '20px' }}>
        <h2>Features:</h2>
        <ul>
          <li>✅ React Application Running</li>
          <li>✅ TypeScript Support</li>
          <li>✅ GitHub Pages Deployment</li>
          <li>✅ Supabase Integration Ready</li>
          <li>✅ Admin Center Operational</li>
        </ul>
      </div>
    </div>
  );
}

function App() {
  const location = useLocation();
  
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Left Sidebar */}
      <div style={{ 
        width: '250px', 
        backgroundColor: '#1f2937', 
        color: '#f9fafb',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Logo/Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #374151' }}>
          <h2 style={{ margin: '0', fontSize: '18px', fontWeight: 'bold' }}>3C Control Center</h2>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>Thread To Success</p>
        </div>
        
        {/* Navigation Links */}
        <nav style={{ flex: '1', padding: '20px 0' }}>
          <Link 
            to="/3c-control-center/" 
            style={{ 
              display: 'block',
              padding: '12px 20px', 
              color: location.pathname === '/3c-control-center/' ? '#f9fafb' : '#d1d5db', 
              textDecoration: 'none',
              backgroundColor: location.pathname === '/3c-control-center/' ? '#374151' : 'transparent',
              borderLeft: location.pathname === '/3c-control-center/' ? '3px solid #3b82f6' : '3px solid transparent'
            }}
          >
            📊 Overview
          </Link>
          
          <div style={{ padding: '12px 20px', color: '#6b7280', fontSize: '14px' }}>
            📝 Content Manager (Soon)
          </div>
          
          <div style={{ padding: '12px 20px', color: '#6b7280', fontSize: '14px' }}>
            💬 Chat Manager - Public (Soon)
          </div>
          
          <div style={{ padding: '12px 20px', color: '#6b7280', fontSize: '14px' }}>
            📅 Scheduler (Soon)
          </div>
          
          <div style={{ padding: '12px 20px', color: '#6b7280', fontSize: '14px' }}>
            🧠 Marketing Center (Soon)
          </div>
          
          <Link 
            to="/3c-control-center/settings" 
            style={{ 
              display: 'block',
              padding: '12px 20px', 
              color: location.pathname.includes('/settings') ? '#f9fafb' : '#d1d5db', 
              textDecoration: 'none',
              backgroundColor: location.pathname.includes('/settings') ? '#374151' : 'transparent',
              borderLeft: location.pathname.includes('/settings') ? '3px solid #3b82f6' : '3px solid transparent'
            }}
          >
            ⚙️ Settings
          </Link>
          
          <Link 
            to="/3c-control-center/admin" 
            style={{ 
              display: 'block',
              padding: '12px 20px', 
              color: location.pathname.includes('/admin') ? '#f9fafb' : '#d1d5db', 
              textDecoration: 'none',
              backgroundColor: location.pathname.includes('/admin') ? '#374151' : 'transparent',
              borderLeft: location.pathname.includes('/admin') ? '3px solid #3b82f6' : '3px solid transparent'
            }}
          >
            🔧 Admin Center
          </Link>
        </nav>
        
        {/* Bottom Section - AI Chat */}
        <div style={{ padding: '20px', borderTop: '1px solid #374151' }}>
          <div style={{ padding: '12px 0', color: '#6b7280', fontSize: '14px' }}>
            🤖 AI Chat Manager (Soon)
          </div>
          <p style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic' }}>
            Could be added to Admin/Brand
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: '1', backgroundColor: '#ffffff', overflow: 'auto' }}>
        <Routes>
          <Route path="/3c-control-center/" element={<Dashboard />} />
          <Route path="/3c-control-center/settings" element={<Settings />} />
          <Route path="/3c-control-center/admin/*" element={<AdminCenter />} />
          <Route path="/*" element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  );
}

export default function AppWithRouter() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
