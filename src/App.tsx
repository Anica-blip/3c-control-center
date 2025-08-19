import React from 'react';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

// Simple Admin component for now
function Admin() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>⚙️ Admin Center</h1>
      <p>Manage templates, libraries, and brand assets</p>
      
      <div style={{ display: 'grid', gap: '20px', marginTop: '30px' }}>
        {/* Builder Admin Section */}
        <div style={{ 
          padding: '20px', 
          border: '2px solid #3b82f6', 
          borderRadius: '8px', 
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' 
        }}>
          <h2 style={{ color: '#1e40af', marginBottom: '10px' }}>🏗️ Builder Admin</h2>
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

        {/* Community Brand Products Section */}
        <div style={{ 
          padding: '20px', 
          border: '2px solid #10b981', 
          borderRadius: '8px', 
          background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' 
        }}>
          <h2 style={{ color: '#047857', marginBottom: '10px' }}>🎮 Community Brand Products</h2>
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

        {/* System Status */}
        <div style={{ 
          padding: '20px', 
          border: '1px solid #d1d5db', 
          borderRadius: '8px', 
          background: '#f9fafb' 
        }}>
          <h2 style={{ marginBottom: '15px' }}>📊 System Status</h2>
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
      </div>
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
        </ul>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div>
        {/* Simple Navigation */}
        <nav style={{ 
          padding: '10px 20px', 
          backgroundColor: '#1f2937', 
          borderBottom: '1px solid #374151' 
        }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link 
              to="/3c-control-center/" 
              style={{ color: '#f9fafb', textDecoration: 'none', fontWeight: 'bold' }}
            >
              3C Control Center
            </Link>
            <Link 
              to="/3c-control-center/admin" 
              style={{ color: '#d1d5db', textDecoration: 'none' }}
            >
              Admin Center
            </Link>
          </div>
        </nav>

        <Routes>
          <Route path="/3c-control-center/" element={<Dashboard />} />
          <Route path="/3c-control-center/admin" element={<Admin />} />
          <Route path="/*" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
