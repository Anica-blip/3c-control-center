import React, { useState } from 'react';

// =============================================================================
// ADMIN COMPONENTS - COMPLETE WITH ALL TABS
// =============================================================================

function AdminComponents() {
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
// TEMPLATES TAB WITH GITHUB EXTERNAL COMPONENTS
// =============================================================================

function AdminTemplatesTab() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: "Social Media Post",
      category: "Social",
      description: "Instagram/Facebook post template",
      fields: ["title", "description", "hashtags", "image"],
      lastModified: "2025-01-15"
    },
    {
      id: 2,
      name: "Blog Article", 
      category: "Content",
      description: "Standard blog post structure",
      fields: ["headline", "introduction", "body", "conclusion", "tags"],
      lastModified: "2025-01-10"
    }
  ]);

  const [showBuilder, setShowBuilder] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: 'Social',
    description: '',
    fields: ['']
  });

  const addField = () => {
    setNewTemplate(prev => ({
      ...prev,
      fields: [...prev.fields, '']
    }));
  };

  const updateField = (index, value) => {
    setNewTemplate(prev => ({
      ...prev,
      fields: prev.fields.map((field, i) => i === index ? value : field)
    }));
  };

  const removeField = (index) => {
    setNewTemplate(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const saveTemplate = () => {
    const newId = Math.max(...templates.map(t => t.id)) + 1;
    const template = {
      ...newTemplate,
      id: newId,
      lastModified: new Date().toISOString().split('T')[0],
      fields: newTemplate.fields.filter(f => f.trim() !== '')
    };
    
    setTemplates(prev => [...prev, template]);
    setNewTemplate({ name: '', category: 'Social', description: '', fields: [''] });
    setShowBuilder(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>🏗️ Manage Templates</h2>
      <p>Create, edit, and manage your content templates</p>
      
      {/* Template Builder Toggle */}
      <div style={{ marginBottom: '30px' }}>
        <button
          onClick={() => setShowBuilder(!showBuilder)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {showBuilder ? '📋 View Templates' : '➕ Create New Template'}
        </button>
      </div>

      {showBuilder ? (
        <div style={{ 
          padding: '30px', 
          border: '2px solid #3b82f6', 
          borderRadius: '8px', 
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' 
        }}>
          <h3 style={{ color: '#1e40af', marginBottom: '20px' }}>🏗️ Template Builder</h3>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            {/* Basic Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1e40af' }}>
                  Template Name
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #93c5fd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="e.g., Instagram Story Template"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1e40af' }}>
                  Category
                </label>
                <select
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #93c5fd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="Social">Social Media</option>
                  <option value="Content">Blog Content</option>
                  <option value="Email">Email Marketing</option>
                  <option value="Video">Video Content</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1e40af' }}>
                Description
              </label>
              <textarea
                value={newTemplate.description}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #93c5fd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
                placeholder="Describe what this template is used for..."
              />
            </div>

            {/* Template Fields */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1e40af' }}>
                Template Fields
              </label>
              {newTemplate.fields.map((field, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={field}
                    onChange={(e) => updateField(index, e.target.value)}
                    style={{
                      flex: '1',
                      padding: '10px',
                      border: '1px solid #93c5fd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    placeholder={`Field ${index + 1} (e.g., headline, image, cta)`}
                  />
                  {newTemplate.fields.length > 1 && (
                    <button
                      onClick={() => removeField(index)}
                      style={{
                        padding: '10px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      ❌
                    </button>
                  )}
                </div>
              ))}
              
              <button
                onClick={addField}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ➕ Add Field
              </button>
            </div>

            {/* Save Button */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowBuilder(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveTemplate}
                disabled={!newTemplate.name.trim()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: newTemplate.name.trim() ? '#10b981' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: newTemplate.name.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                💾 Save Template
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Template Library */}
          <div style={{ 
            padding: '20px', 
            border: '1px solid #d1d5db', 
            borderRadius: '8px', 
            background: '#f9fafb',
            marginBottom: '30px'
          }}>
            <h3 style={{ marginBottom: '20px' }}>📚 Template Library</h3>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              {templates.map(template => (
                <div 
                  key={template.id}
                  style={{ 
                    padding: '20px', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '6px', 
                    background: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: '1' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <h4 style={{ margin: '0', color: '#1f2937' }}>{template.name}</h4>
                        <span style={{ 
                          padding: '4px 8px', 
                          backgroundColor: '#dbeafe', 
                          color: '#1e40af', 
                          borderRadius: '12px', 
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {template.category}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px' }}>
                        {template.description}
                      </p>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        Last modified: {template.lastModified} • {template.fields.length} fields
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ 
                        padding: '6px 12px', 
                        backgroundColor: '#3b82f6', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}>
                        ✏️ Edit
                      </button>
                      <button style={{ 
                        padding: '6px 12px', 
                        backgroundColor: '#10b981', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}>
                        📋 Use
                      </button>
                    </div>
                  </div>
                  
                  {selectedTemplate === template.id && (
                    <div style={{ 
                      marginTop: '15px', 
                      padding: '15px', 
                      backgroundColor: '#f3f4f6', 
                      borderRadius: '6px' 
                    }}>
                      <h5 style={{ margin: '0 0 10px 0', color: '#374151' }}>Template Fields:</h5>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {template.fields.map((field, index) => (
                          <span 
                            key={index}
                            style={{ 
                              padding: '4px 8px', 
                              backgroundColor: '#e5e7eb', 
                              color: '#374151', 
                              borderRadius: '8px', 
                              fontSize: '12px' 
                            }}
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* External Tools Section - GitHub Components */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            {/* LEFT SIDE: External Builder Tools */}
            <div style={{ 
              padding: '20px', 
              border: '2px solid #3b82f6', 
              borderRadius: '8px', 
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' 
            }}>
              <h3 style={{ color: '#1e40af', marginBottom: '10px' }}>🏗️ External Builder Tools</h3>
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
        </>
      )}
    </div>
  );
}

// =============================================================================
// LIBRARIES TAB WITH FULL INTEGRATIONS
// =============================================================================

function AdminLibrariesTab() {
  const [notionConnected, setNotionConnected] = useState(false);
  const [wasabiConnected, setWasabiConnected] = useState(false);
  const [canvaConnected, setCanvaConnected] = useState(false);

  return (
    <div style={{ padding: '20px' }}>
      <h2>📚 Libraries</h2>
      <p>External service integrations and storage management</p>
      
      <div style={{ display: 'grid', gap: '30px', marginTop: '30px' }}>
        
        {/* NOTION INTEGRATION */}
        <div style={{ 
          padding: '25px', 
          border: '2px solid #6366f1', 
          borderRadius: '12px', 
          background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: '0', color: '#4338ca', fontSize: '20px' }}>📝 Notion Integration</h3>
              <p style={{ margin: '5px 0 0 0', color: '#4338ca', fontSize: '14px' }}>
                Content management and documentation
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ 
                padding: '4px 8px', 
                backgroundColor: notionConnected ? '#10b981' : '#f59e0b', 
                color: 'white', 
                borderRadius: '12px', 
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {notionConnected ? 'Connected' : 'Ready to Connect'}
              </span>
              <button
                onClick={() => setNotionConnected(!notionConnected)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: notionConnected ? '#ef4444' : '#4338ca',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {notionConnected ? 'Disconnect' : '🔗 Connect Notion'}
              </button>
            </div>
          </div>

          {notionConnected ? (
            <div>
              <h4 style={{ color: '#4338ca', marginBottom: '15px' }}>📄 Connected to Internal Hub</h4>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>
                Content Calendar • Brand Guidelines • Templates
              </div>
              <div style={{
                padding: '15px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                borderRadius: '8px'
              }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold', color: '#4338ca' }}>
                  🔗 Main Hub Link:
                </p>
                <a
                  href="https://www.notion.so/INTERNAL-HUB-2256ace1e8398087a3c9d25c1cf253e5"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    fontSize: '12px', 
                    color: '#4338ca', 
                    textDecoration: 'underline'
                  }}
                >
                  notion.so/INTERNAL-HUB-2256ace1e8398087a3c9d25c1cf253e5
                </a>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📝</div>
              <p style={{ color: '#4338ca', fontSize: '16px', marginBottom: '10px' }}>
                Connect your Notion workspace
              </p>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '15px' }}>
                Access your content calendars, brand guidelines, and documentation
              </p>
            </div>
          )}
        </div>

        {/* WASABI INTEGRATION */}
        <div style={{ 
          padding: '25px', 
          border: '2px solid #dc2626', 
          borderRadius: '12px', 
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: '0', color: '#dc2626', fontSize: '20px' }}>📦 Wasabi Cloud Storage</h3>
              <p style={{ margin: '5px 0 0 0', color: '#dc2626', fontSize: '14px' }}>
                Internal assets & public member content storage
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ 
                padding: '4px 8px', 
                backgroundColor: wasabiConnected ? '#10b981' : '#f59e0b', 
                color: 'white', 
                borderRadius: '12px', 
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {wasabiConnected ? 'Connected' : 'Ready to Connect'}
              </span>
              <button
                onClick={() => setWasabiConnected(!wasabiConnected)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: wasabiConnected ? '#ef4444' : '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {wasabiConnected ? 'Disconnect' : '🔗 Connect Wasabi'}
              </button>
            </div>
          </div>

          {wasabiConnected ? (
            <div>
              <h4 style={{ color: '#dc2626', marginBottom: '15px' }}>📦 Storage Connected</h4>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>
                Internal Assets • Member Content • Media Library
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{
                  padding: '15px', 
                  backgroundColor: 'rgba(255,255,255,0.8)', 
                  borderRadius: '8px'
                }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 'bold', color: '#dc2626' }}>
                    Storage Usage:
                  </p>
                  <div style={{ fontSize: '14px', color: '#374151' }}>2.4 GB / 50 GB</div>
                  <div style={{ 
                    width: '100%', 
                    height: '8px', 
                    backgroundColor: '#e5e7eb', 
                    borderRadius: '4px', 
                    marginTop: '8px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: '4.8%', 
                      height: '100%', 
                      backgroundColor: '#dc2626' 
                    }}></div>
                  </div>
                </div>
                <div style={{
                  padding: '15px', 
                  backgroundColor: 'rgba(255,255,255,0.8)', 
                  borderRadius: '8px'
                }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 'bold', color: '#dc2626' }}>
                    Quick Actions:
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{
                      padding: '6px 12px',
                      fontSize: '11px',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>
                      📁 Browse
                    </button>
                    <button style={{
                      padding: '6px 12px',
                      fontSize: '11px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>
                      ⬆️ Upload
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📦</div>
              <p style={{ color: '#dc2626', fontSize: '16px', marginBottom: '10px' }}>
                Connect Wasabi Cloud Storage
              </p>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '15px' }}>
                Secure cloud storage for your assets and member content
              </p>
            </div>
          )}
        </div>

        {/* CANVA INTEGRATION */}
        <div style={{ 
          padding: '25px', 
          border: '2px solid #8b5cf6', 
          borderRadius: '12px', 
          background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: '0', color: '#7c3aed', fontSize: '20px' }}>🎨 Canva Integration</h3>
              <p style={{ margin: '5px 0 0 0', color: '#7c3aed', fontSize: '14px' }}>
                Design templates and brand assets
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ 
                padding: '4px 8px', 
                backgroundColor: canvaConnected ? '#10b981' : '#f59e0b', 
                color: 'white', 
                borderRadius: '12px', 
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {canvaConnected ? 'Connected' : 'Ready to Connect'}
              </span>
              <button
                onClick={() => setCanvaConnected(!canvaConnected)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: canvaConnected ? '#ef4444' : '#7c3aed',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {canvaConnected ? 'Disconnect' : '🔗 Connect Canva'}
              </button>
            </div>
          </div>

          {canvaConnected ? (
            <div>
              <h4 style={{ color: '#7c3aed', marginBottom: '15px' }}>🎨 Design Library Connected</h4>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>
                Brand Templates • Design Assets • Collaborative Workspace
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div style={{
                  padding: '15px', 
                  backgroundColor: 'rgba(255,255,255,0.8)', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>📄</div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#7c3aed' }}>Templates</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>47 designs</div>
                </div>
                <div style={{
                  padding: '15px', 
                  backgroundColor: 'rgba(255,255,255,0.8)', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏢</div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#7c3aed' }}>Brand Kit</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Active</div>
                </div>
                <div style={{
                  padding: '15px', 
                  backgroundColor: 'rgba(255,255,255,0.8)', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>👥</div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#7c3aed' }}>Team</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>5 members</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎨</div>
              <p style={{ color: '#7c3aed', fontSize: '16px', marginBottom: '10px' }}>
                Connect your Canva workspace
              </p>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '15px' }}>
                Access design templates, brand kits, and collaborative tools
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// BRAND TAB - FULL BRAND KIT MANAGEMENT
// =============================================================================

function AdminBrandTab() {
  const [activeSection, setActiveSection] = useState('colors');
  const [brandColors, setBrandColors] = useState([
    { id: 1, name: 'Primary Blue', hex: '#3b82f6', usage: 'Main brand color' },
    { id: 2, name: 'Secondary Green', hex: '#10b981', usage: 'Success states' },
    { id: 3, name: 'Accent Purple', hex: '#8b5cf6', usage: 'Creative elements' },
    { id: 4, name: 'Warning Orange', hex: '#f59e0b', usage: 'Alerts & warnings' },
    { id: 5, name: 'Error Red', hex: '#ef4444', usage: 'Error states' }
  ]);

  const [logos, setLogos] = useState([
    { id: 1, name: 'Primary Logo', type: 'SVG', size: '1.2 MB', usage: 'Main brand identity' },
    { id: 2, name: 'Logo Mark', type: 'PNG', size: '340 KB', usage: 'Social media icons' },
    { id: 3, name: 'White Version', type: 'SVG', size: '980 KB', usage: 'Dark backgrounds' },
    { id: 4, name: 'Horizontal Layout', type: 'PNG', size: '567 KB', usage: 'Headers & banners' }
  ]);

  const [fonts, setFonts] = useState([
    { id: 1, name: 'Inter', category: 'Primary', usage: 'Headlines, UI text', weight: '400-700' },
    { id: 2, name: 'Roboto', category: 'Secondary', usage: 'Body text, descriptions', weight: '300-500' },
    { id: 3, name: 'Playfair Display', category: 'Accent', usage: 'Special headlines', weight: '400-700' }
  ]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>🏢 Brand Kit</h2>
      <p>Brand guidelines, assets, and style management</p>
      
      {/* Brand Kit Sub-Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '0', 
        marginTop: '30px', 
        marginBottom: '30px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <button
          onClick={() => setActiveSection('colors')}
          style={{
            padding: '12px 20px',
            backgroundColor: activeSection === 'colors' ? '#f3f4f6' : 'transparent',
            color: activeSection === 'colors' ? '#1f2937' : '#6b7280',
            border: 'none',
            borderBottom: activeSection === 'colors' ? '2px solid #8b5cf6' : '2px solid transparent',
            fontWeight: activeSection === 'colors' ? 'bold' : 'normal',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🎨 Colors
        </button>
        <button
          onClick={() => setActiveSection('logos')}
          style={{
            padding: '12px 20px',
            backgroundColor: activeSection === 'logos' ? '#f3f4f6' : 'transparent',
            color: activeSection === 'logos' ? '#1f2937' : '#6b7280',
            border: 'none',
            borderBottom: activeSection === 'logos' ? '2px solid #8b5cf6' : '2px solid transparent',
            fontWeight: activeSection === 'logos' ? 'bold' : 'normal',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🏷️ Logos
        </button>
        <button
          onClick={() => setActiveSection('fonts')}
          style={{
            padding: '12px 20px',
            backgroundColor: activeSection === 'fonts' ? '#f3f4f6' : 'transparent',
            color: activeSection === 'fonts' ? '#1f2937' : '#6b7280',
            border: 'none',
            borderBottom: activeSection === 'fonts' ? '2px solid #8b5cf6' : '2px solid transparent',
            fontWeight: activeSection === 'fonts' ? 'bold' : 'normal',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔤 Typography
        </button>
        <button
          onClick={() => setActiveSection('guidelines')}
          style={{
            padding: '12px 20px',
            backgroundColor: activeSection === 'guidelines' ? '#f3f4f6' : 'transparent',
            color: activeSection === 'guidelines' ? '#1f2937' : '#6b7280',
            border: 'none',
            borderBottom: activeSection === 'guidelines' ? '2px solid #8b5cf6' : '2px solid transparent',
            fontWeight: activeSection === 'guidelines' ? 'bold' : 'normal',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          📋 Guidelines
        </button>
      </div>

      {/* COLORS SECTION */}
      {activeSection === 'colors' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h3>🎨 Brand Colors</h3>
            <button style={{
              padding: '10px 20px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              ➕ Add Color
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {brandColors.map(color => (
              <div key={color.id} style={{
                padding: '20px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#ffffff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: color.hex,
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb'
                  }}></div>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#1f2937' }}>{color.name}</h4>
                    <div style={{ fontSize: '14px', color: '#6b7280', fontFamily: 'monospace' }}>{color.hex}</div>
                  </div>
                </div>
                <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>{color.usage}</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
                  <button style={{
                    padding: '6px 12px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}>
                    📋 Copy
                  </button>
                  <button style={{
                    padding: '6px 12px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}>
                    ✏️ Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LOGOS SECTION */}
      {activeSection === 'logos' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h3>🏷️ Logo Assets</h3>
            <button style={{
              padding: '10px 20px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              ⬆️ Upload Logo
            </button>
          </div>
          
          <div style={{ display: 'grid', gap: '15px' }}>
            {logos.map(logo => (
              <div key={logo.id} style={{
                padding: '20px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{
                    width: '80px',
                    height: '60px',
                    backgroundColor: '#f9fafb',
                    border: '2px dashed #d1d5db',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    🏷️
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#1f2937' }}>{logo.name}</h4>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {logo.type} • {logo.size} • {logo.usage}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{
                    padding: '8px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}>
                    ⬇️ Download
                  </button>
                  <button style={{
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}>
                    👁️ Preview
                  </button>
                  <button style={{
                    padding: '8px 16px',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}>
                    ✏️ Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TYPOGRAPHY SECTION */}
      {activeSection === 'fonts' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h3>🔤 Typography System</h3>
            <button style={{
              padding: '10px 20px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              ➕ Add Font
            </button>
          </div>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            {fonts.map(font => (
              <div key={font.id} style={{
                padding: '25px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#ffffff'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '20px' }}>{font.name}</h4>
                    <div style={{ display: 'flex', gap: '15px', fontSize: '14px', color: '#6b7280' }}>
                      <span>Category: {font.category}</span>
                      <span>Weight: {font.weight}</span>
                    </div>
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#6b7280' }}>{font.usage}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{
                      padding: '6px 12px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}>
                      📋 Copy CSS
                    </button>
                    <button style={{
                      padding: '6px 12px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}>
                      ✏️ Edit
                    </button>
                  </div>
                </div>
                
                {/* Font Preview */}
                <div style={{
                  padding: '20px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px',
                  fontFamily: font.name.toLowerCase().includes('inter') ? 'ui-sans-serif, system-ui' : 
                             font.name.toLowerCase().includes('roboto') ? 'Roboto, sans-serif' : 
                             'ui-serif, Georgia'
                }}>
                  <div style={{ fontSize: '28px', marginBottom: '10px', fontWeight: 'bold' }}>
                    The quick brown fox jumps
                  </div>
                  <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                    Regular weight sample text for {font.name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ 1234567890
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GUIDELINES SECTION */}
      {activeSection === 'guidelines' && (
        <div>
          <h3 style={{ marginBottom: '25px' }}>📋 Brand Guidelines</h3>
          
          <div style={{ display: 'grid', gap: '25px' }}>
            {/* Logo Usage Guidelines */}
            <div style={{
              padding: '25px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: '#ffffff'
            }}>
              <h4 style={{ color: '#1f2937', marginBottom: '15px' }}>🏷️ Logo Usage Guidelines</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <h5 style={{ color: '#10b981', fontSize: '14px', marginBottom: '10px' }}>✅ DO</h5>
                  <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
                    <li>Use the primary logo on light backgrounds</li>
                    <li>Maintain minimum clear space of 2x the logo height</li>
                    <li>Use approved color variations only</li>
                    <li>Ensure logo is legible at all sizes</li>
                  </ul>
                </div>
                <div>
                  <h5 style={{ color: '#ef4444', fontSize: '14px', marginBottom: '10px' }}>❌ DON'T</h5>
                  <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
                    <li>Stretch, distort, or rotate the logo</li>
                    <li>Use unauthorized colors or effects</li>
                    <li>Place logo on busy backgrounds</li>
                    <li>Use low-resolution versions</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Color Usage Guidelines */}
            <div style={{
              padding: '25px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: '#ffffff'
            }}>
              <h4 style={{ color: '#1f2937', marginBottom: '15px' }}>🎨 Color Usage Guidelines</h4>
              <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8' }}>
                <p style={{ marginBottom: '15px' }}>
                  <strong>Primary Blue (#3b82f6):</strong> Use for main call-to-action buttons, primary links, and key brand elements. Should comprise 60% of brand color usage.
                </p>
                <p style={{ marginBottom: '15px' }}>
                  <strong>Secondary Green (#10b981):</strong> Reserved for success states, positive feedback, and completion indicators. Use sparingly for maximum impact.
                </p>
                <p style={{ marginBottom: '15px' }}>
                  <strong>Supporting Colors:</strong> Purple, Orange, and Red should be used as accent colors for specific UI states and never as primary brand colors.
                </p>
                <p>
                  <strong>Accessibility:</strong> Ensure all color combinations meet WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text).
                </p>
              </div>
            </div>

            {/* Typography Guidelines */}
            <div style={{
              padding: '25px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: '#ffffff'
            }}>
              <h4 style={{ color: '#1f2937', marginBottom: '15px' }}>🔤 Typography Guidelines</h4>
              <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8' }}>
                <p style={{ marginBottom: '15px' }}>
                  <strong>Hierarchy:</strong> Use Inter for all UI elements and primary headings. Roboto for body text and longer content. Playfair Display only for special occasions and creative headlines.
                </p>
                <p style={{ marginBottom: '15px' }}>
                  <strong>Sizing:</strong> Maintain consistent sizing scale: H1 (32px), H2 (24px), H3 (20px), H4 (18px), Body (16px), Small (14px), Caption (12px).
                </p>
                <p>
                  <strong>Line Height:</strong> Use 1.5x line height for body text, 1.2x for headings. Ensure adequate spacing between elements for readability.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export the main component
export default AdminComponents;
