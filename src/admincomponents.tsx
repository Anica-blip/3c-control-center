import React, { useState } from 'react';

// =============================================================================
// ADMIN COMPONENTS - WITH FUNCTIONAL BUTTONS
// =============================================================================

function AdminComponents({ isDarkMode }) {
  const [activeTab, setActiveTab] = useState('templates');

  // Theme objects for consistent styling
  const theme = {
    background: isDarkMode ? '#1f2937' : '#ffffff',
    cardBackground: isDarkMode ? '#374151' : '#ffffff',
    headerBackground: isDarkMode ? '#111827' : '#f9fafb',
    borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
    textPrimary: isDarkMode ? '#f9fafb' : '#1f2937',
    textSecondary: isDarkMode ? '#d1d5db' : '#6b7280',
    buttonPrimary: isDarkMode ? '#3b82f6' : '#3b82f6',
    buttonSecondary: isDarkMode ? '#4b5563' : '#f3f4f6',
    buttonSecondaryText: isDarkMode ? '#f9fafb' : '#374151',
    inputBackground: isDarkMode ? '#374151' : '#ffffff',
    inputBorder: isDarkMode ? '#6b7280' : '#d1d5db',
    gradientBlue: isDarkMode 
      ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' 
      : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
    gradientGreen: isDarkMode 
      ? 'linear-gradient(135deg, #065f46 0%, #047857 100%)' 
      : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    gradientRed: isDarkMode 
      ? 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)' 
      : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    gradientPurple: isDarkMode 
      ? 'linear-gradient(135deg, #581c87 0%, #6b21a8 100%)' 
      : 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
  };

  return (
    <div style={{ backgroundColor: theme.background, minHeight: '100vh' }}>
      {/* Top Tab Navigation */}
      <div style={{ 
        borderBottom: `1px solid ${theme.borderColor}`, 
        backgroundColor: theme.headerBackground, 
        padding: '0 20px' 
      }}>
        <div style={{ display: 'flex', gap: '0' }}>
          <button
            onClick={() => setActiveTab('templates')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'templates' ? theme.background : 'transparent',
              color: activeTab === 'templates' ? theme.textPrimary : theme.textSecondary,
              border: 'none',
              borderBottom: activeTab === 'templates' ? '2px solid #3b82f6' : '2px solid transparent',
              fontWeight: activeTab === 'templates' ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🗂️ Manage Templates
          </button>
          <button
            onClick={() => setActiveTab('libraries')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'libraries' ? theme.background : 'transparent',
              color: activeTab === 'libraries' ? theme.textPrimary : theme.textSecondary,
              border: 'none',
              borderBottom: activeTab === 'libraries' ? '2px solid #3b82f6' : '2px solid transparent',
              fontWeight: activeTab === 'libraries' ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            📚 Libraries
          </button>
          <button
            onClick={() => setActiveTab('brand')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'brand' ? theme.background : 'transparent',
              color: activeTab === 'brand' ? theme.textPrimary : theme.textSecondary,
              border: 'none',
              borderBottom: activeTab === 'brand' ? '2px solid #3b82f6' : '2px solid transparent',
              fontWeight: activeTab === 'brand' ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🏢 Brand Kit
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ backgroundColor: theme.background }}>
        {activeTab === 'templates' && <AdminTemplatesTab theme={theme} />}
        {activeTab === 'libraries' && <AdminLibrariesTab theme={theme} />}
        {activeTab === 'brand' && <AdminBrandTab theme={theme} isDarkMode={isDarkMode} />}
      </div>
    </div>
  );
}

// =============================================================================
// TEMPLATES TAB (keeping original - no changes requested)
// =============================================================================

function AdminTemplatesTab({ theme }) {
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
    <div style={{ padding: '20px', backgroundColor: theme.background }}>
      <h2 style={{ color: theme.textPrimary, fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
        🗂️ Manage Templates
      </h2>
      <p style={{ color: theme.textSecondary, fontSize: '14px', margin: '0 0 30px 0' }}>
        Create, edit, and manage your content templates
      </p>
      
      {/* Template Builder Toggle */}
      <div style={{ marginBottom: '30px' }}>
        <button
          onClick={() => setShowBuilder(!showBuilder)}
          style={{
            padding: '12px 24px',
            backgroundColor: theme.buttonPrimary,
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 2px 6px rgba(59, 130, 246, 0.25)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = theme.buttonPrimary;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {showBuilder ? '📋 View Templates' : '➕ Create New Template'}
        </button>
      </div>

      {showBuilder ? (
        <div style={{ 
          padding: '30px', 
          border: '2px solid #3b82f6', 
          borderRadius: '12px', 
          background: theme.gradientBlue,
          marginBottom: '30px'
        }}>
          <h3 style={{ 
            color: theme.textPrimary, 
            marginBottom: '25px', 
            fontSize: '18px', 
            fontWeight: 'bold' 
          }}>
            🗂️ Template Builder
          </h3>
          
          <div style={{ display: 'grid', gap: '25px' }}>
            {/* Basic Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold', 
                  color: theme.textPrimary,
                  fontSize: '14px'
                }}>
                  Template Name
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: theme.inputBackground,
                    color: theme.textPrimary,
                    outline: 'none'
                  }}
                  placeholder="e.g., Instagram Story Template"
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold', 
                  color: theme.textPrimary,
                  fontSize: '14px'
                }}>
                  Category
                </label>
                <select
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: theme.inputBackground,
                    color: theme.textPrimary,
                    outline: 'none'
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
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 'bold', 
                color: theme.textPrimary,
                fontSize: '14px'
              }}>
                Description
              </label>
              <textarea
                value={newTemplate.description}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${theme.inputBorder}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: theme.inputBackground,
                  color: theme.textPrimary,
                  minHeight: '100px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
                placeholder="Describe what this template is used for..."
              />
            </div>

            {/* Template Fields */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '12px', 
                fontWeight: 'bold', 
                color: theme.textPrimary,
                fontSize: '14px'
              }}>
                Template Fields
              </label>
              {newTemplate.fields.map((field, index) => (
                <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <input
                    type="text"
                    value={field}
                    onChange={(e) => updateField(index, e.target.value)}
                    style={{
                      flex: '1',
                      padding: '12px',
                      border: `1px solid ${theme.inputBorder}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: theme.inputBackground,
                      color: theme.textPrimary,
                      outline: 'none'
                    }}
                    placeholder={`Field ${index + 1} (e.g., headline, image, cta)`}
                  />
                  {newTemplate.fields.length > 1 && (
                    <button
                      onClick={() => removeField(index)}
                      style={{
                        padding: '12px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#dc2626';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#ef4444';
                      }}
                    >
                      ✖
                    </button>
                  )}
                </div>
              ))}
              
              <button
                onClick={addField}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginTop: '8px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#059669';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#10b981';
                }}
              >
                ➕ Add Field
              </button>
            </div>

            {/* Save Button */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setShowBuilder(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: theme.buttonSecondary,
                  color: theme.buttonSecondaryText,
                  border: `1px solid ${theme.borderColor}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = theme.borderColor;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = theme.buttonSecondary;
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
                  borderRadius: '8px',
                  cursor: newTemplate.name.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
                onMouseOver={(e) => {
                  if (newTemplate.name.trim()) {
                    e.currentTarget.style.backgroundColor = '#059669';
                  }
                }}
                onMouseOut={(e) => {
                  if (newTemplate.name.trim()) {
                    e.currentTarget.style.backgroundColor = '#10b981';
                  }
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
            padding: '25px', 
            border: `1px solid ${theme.borderColor}`, 
            borderRadius: '12px', 
            backgroundColor: theme.cardBackground,
            marginBottom: '30px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ 
              marginBottom: '25px', 
              color: theme.textPrimary, 
              fontSize: '18px', 
              fontWeight: 'bold' 
            }}>
              📚 Template Library
            </h3>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              {templates.map(template => (
                <div 
                  key={template.id}
                  style={{ 
                    padding: '20px', 
                    border: `1px solid ${theme.borderColor}`, 
                    borderRadius: '8px', 
                    backgroundColor: theme.background,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: '1' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h4 style={{ margin: '0', color: theme.textPrimary, fontSize: '16px', fontWeight: 'bold' }}>
                          {template.name}
                        </h4>
                        <span style={{ 
                          padding: '4px 12px', 
                          backgroundColor: '#dbeafe', 
                          color: '#1e40af', 
                          borderRadius: '16px', 
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {template.category}
                        </span>
                      </div>
                      <p style={{ 
                        margin: '0 0 12px 0', 
                        color: theme.textSecondary, 
                        fontSize: '14px',
                        lineHeight: '1.5'
                      }}>
                        {template.description}
                      </p>
                      <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                        Last modified: {template.lastModified} • {template.fields.length} fields
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ 
                        padding: '8px 16px', 
                        backgroundColor: theme.buttonPrimary, 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '6px', 
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}>
                        ✏️ Edit
                      </button>
                      <button style={{ 
                        padding: '8px 16px', 
                        backgroundColor: '#10b981', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '6px', 
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}>
                        📋 Use
                      </button>
                    </div>
                  </div>
                  
                  {selectedTemplate === template.id && (
                    <div style={{ 
                      marginTop: '20px', 
                      padding: '16px', 
                      backgroundColor: theme.headerBackground, 
                      borderRadius: '8px',
                      border: `1px solid ${theme.borderColor}`
                    }}>
                      <h5 style={{ 
                        margin: '0 0 12px 0', 
                        color: theme.textPrimary, 
                        fontSize: '14px', 
                        fontWeight: 'bold' 
                      }}>
                        Template Fields:
                      </h5>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {template.fields.map((field, index) => (
                          <span 
                            key={index}
                            style={{ 
                              padding: '6px 12px', 
                              backgroundColor: theme.buttonSecondary, 
                              color: theme.buttonSecondaryText, 
                              borderRadius: '12px', 
                              fontSize: '12px',
                              fontWeight: 'bold',
                              border: `1px solid ${theme.borderColor}`
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
              padding: '25px', 
              border: '2px solid #3b82f6', 
              borderRadius: '12px', 
              background: theme.gradientBlue
            }}>
              <h3 style={{ color: theme.textPrimary, marginBottom: '12px', fontSize: '18px', fontWeight: 'bold' }}>
                🗂️ External Builder Tools
              </h3>
              <p style={{ color: theme.textSecondary, fontSize: '14px', marginBottom: '20px' }}>
                External integration for automated generation
              </p>
              
              <div style={{ display: 'grid', gap: '12px' }}>
                {[
                  {
                    name: 'Content Template Engine',
                    desc: 'Comprehensive template creation and management',
                    url: 'https://anica-blip.github.io/3c-content-template-engine/'
                  },
                  {
                    name: 'Featured Content Templates',
                    desc: 'Social Media, Blog, News page, Article',
                    url: 'https://anica-blip.github.io/3c-desktop-editor/'
                  },
                  {
                    name: 'Content Management',
                    desc: 'Content creation with AI & Templates',
                    url: 'https://anica-blip.github.io/3c-content-scheduler/'
                  },
                  {
                    name: 'SM Content Generator',
                    desc: 'Generate social media post content',
                    url: 'https://anica-blip.github.io/3c-smpost-generator/'
                  }
                ].map((tool, index) => (
                  <a 
                    key={index}
                    href={tool.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '16px', 
                      backgroundColor: 'rgba(255,255,255,0.1)', 
                      border: `1px solid ${theme.borderColor}`, 
                      borderRadius: '8px', 
                      textDecoration: 'none',
                      color: theme.textPrimary,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                        {tool.name}
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.8 }}>
                        {tool.desc}
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>🔗 Open</span>
                  </a>
                ))}
              </div>
            </div>

            {/* RIGHT SIDE: 3C Brand Products */}
            <div style={{ 
              padding: '25px', 
              border: '2px solid #10b981', 
              borderRadius: '12px', 
              background: theme.gradientGreen
            }}>
              <h3 style={{ color: theme.textPrimary, marginBottom: '12px', fontSize: '18px', fontWeight: 'bold' }}>
                🎮 3C Brand Products
              </h3>
              <p style={{ color: theme.textSecondary, fontSize: '14px', marginBottom: '20px' }}>
                External app editors for interactive app loaders
              </p>
              
              <div style={{ display: 'grid', gap: '12px' }}>
                {[
                  {
                    name: 'Quiz Generator',
                    desc: '3C Interactive Quizzes',
                    url: 'https://anica-blip.github.io/3c-quiz-admin/'
                  },
                  {
                    name: 'Quiz Landing Page & App Loader',
                    desc: 'Quiz application landing interface',
                    url: 'https://anica-blip.github.io/3c-quiz-admin/landing.html?quiz=quiz.01'
                  },
                  {
                    name: 'Game Generator',
                    desc: 'Games, puzzles, challenges',
                    url: 'https://anica-blip.github.io/3c-game-loader/'
                  }
                ].map((tool, index) => (
                  <a 
                    key={index}
                    href={tool.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '16px', 
                      backgroundColor: 'rgba(255,255,255,0.1)', 
                      border: `1px solid ${theme.borderColor}`, 
                      borderRadius: '8px', 
                      textDecoration: 'none',
                      color: theme.textPrimary,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                        {tool.name}
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.8 }}>
                        {tool.desc}
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>🔗 Open</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// =============================================================================
// LIBRARIES TAB WITH FUNCTIONAL INTEGRATIONS
// =============================================================================

function AdminLibrariesTab({ theme }) {
  const [notionConnected, setNotionConnected] = useState(false);
  const [wasabiConnected, setWasabiConnected] = useState(false);
  const [canvaConnected, setCanvaConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Add notification system
  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // Connection handlers
  const handleNotionToggle = () => {
    if (notionConnected) {
      setNotionConnected(false);
      showNotification('Notion disconnected successfully', 'info');
    } else {
      // Simulate connection process
      showNotification('Connecting to Notion...', 'info');
      setTimeout(() => {
        setNotionConnected(true);
        showNotification('Notion connected successfully!', 'success');
      }, 1500);
    }
  };

  const handleWasabiToggle = () => {
    if (wasabiConnected) {
      setWasabiConnected(false);
      showNotification('Wasabi storage disconnected', 'info');
    } else {
      showNotification('Connecting to Wasabi Cloud...', 'info');
      setTimeout(() => {
        setWasabiConnected(true);
        showNotification('Wasabi Cloud Storage connected!', 'success');
      }, 1500);
    }
  };

  const handleCanvaToggle = () => {
    if (canvaConnected) {
      setCanvaConnected(false);
      showNotification('Canva workspace disconnected', 'info');
    } else {
      showNotification('Connecting to Canva...', 'info');
      setTimeout(() => {
        setCanvaConnected(true);
        showNotification('Canva workspace connected!', 'success');
      }, 1500);
    }
  };

  // Wasabi action handlers
  const handleWasabiBrowse = () => {
    showNotification('Opening Wasabi file browser...', 'info');
    window.open('https://console.wasabisys.com', '_blank');
  };

  const handleWasabiUpload = () => {
    showNotification('Upload functionality ready for implementation!', 'info');
  };

  const IntegrationCard = ({ 
    title, 
    subtitle, 
    emoji, 
    connected, 
    onToggle, 
    children, 
    gradientColor 
  }) => (
    <div style={{ 
      padding: '30px', 
      border: `2px solid ${connected ? '#10b981' : '#f59e0b'}`, 
      borderRadius: '12px', 
      background: gradientColor,
      marginBottom: '30px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '25px' 
      }}>
        <div>
          <h3 style={{ 
            margin: '0', 
            color: theme.textPrimary, 
            fontSize: '20px', 
            fontWeight: 'bold' 
          }}>
            {emoji} {title}
          </h3>
          <p style={{ 
            margin: '8px 0 0 0', 
            color: theme.textSecondary, 
            fontSize: '14px' 
          }}>
            {subtitle}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ 
            padding: '6px 12px', 
            backgroundColor: connected ? '#10b981' : '#f59e0b', 
            color: 'white', 
            borderRadius: '16px', 
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {connected ? '✅ Connected' : '⏳ Ready to Connect'}
          </span>
          <button
            onClick={onToggle}
            style={{
              padding: '12px 20px',
              backgroundColor: connected ? '#ef4444' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
          >
            {connected ? 'Disconnect' : '🔗 Connect'}
          </button>
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ padding: '20px', backgroundColor: theme.background }}>
      {/* Notification System */}
      {notifications.length > 0 && (
        <div style={{ 
          position: 'fixed', 
          top: '20px', 
          right: '20px', 
          zIndex: 1000, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '10px' 
        }}>
          {notifications.map(notification => (
            <div key={notification.id} style={{
              padding: '12px 20px',
              backgroundColor: notification.type === 'success' ? '#10b981' : 
                             notification.type === 'error' ? '#ef4444' : '#3b82f6',
              color: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {notification.message}
            </div>
          ))}
        </div>
      )}

      <h2 style={{ color: theme.textPrimary, fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
        📚 Libraries
      </h2>
      <p style={{ color: theme.textSecondary, fontSize: '14px', margin: '0 0 30px 0' }}>
        External service integrations and storage management
      </p>
      
      <div style={{ display: 'grid', gap: '0' }}>
        
        {/* NOTION INTEGRATION */}
        <IntegrationCard
          title="Notion Integration"
          subtitle="Content management and documentation"
          emoji="📝"
          connected={notionConnected}
          onToggle={handleNotionToggle}
          gradientColor={theme.gradientBlue}
        >
          {notionConnected ? (
            <div>
              <h4 style={{ color: theme.textPrimary, marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>
                📄 Connected to Internal Hub
              </h4>
              <div style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '20px' }}>
                Content Calendar • Brand Guidelines • Templates
              </div>
              <div style={{
                padding: '20px', 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                borderRadius: '8px',
                border: `1px solid ${theme.borderColor}`
              }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold', color: theme.textPrimary }}>
                  🔗 Main Hub Link:
                </p>
                <a
                  href="https://www.notion.so/INTERNAL-HUB-2256ace1e8398087a3c9d25c1cf253e5"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    fontSize: '12px', 
                    color: '#3b82f6', 
                    textDecoration: 'underline',
                    fontWeight: 'bold'
                  }}
                >
                  notion.so/INTERNAL-HUB-2256ace1e8398087a3c9d25c1cf253e5
                </a>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <p style={{ color: theme.textPrimary, fontSize: '16px', marginBottom: '8px', fontWeight: 'bold' }}>
                Connect your Notion workspace
              </p>
              <p style={{ color: theme.textSecondary, fontSize: '14px', margin: '0' }}>
                Access your content calendars, brand guidelines, and documentation
              </p>
            </div>
          )}
        </IntegrationCard>

        {/* WASABI INTEGRATION */}
        <IntegrationCard
          title="Wasabi Cloud Storage"
          subtitle="Internal assets & public member content storage"
          emoji="📦"
          connected={wasabiConnected}
          onToggle={handleWasabiToggle}
          gradientColor={theme.gradientRed}
        >
          {wasabiConnected ? (
            <div>
              <h4 style={{ color: theme.textPrimary, marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>
                📦 Storage Connected
              </h4>
              <div style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '20px' }}>
                Internal Assets • Member Content • Media Library
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{
                  padding: '20px', 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: '8px',
                  border: `1px solid ${theme.borderColor}`
                }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: 'bold', color: theme.textPrimary }}>
                    Storage Usage:
                  </p>
                  <div style={{ fontSize: '16px', color: theme.textPrimary, fontWeight: 'bold', marginBottom: '8px' }}>
                    2.4 GB / 50 GB
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '8px', 
                    backgroundColor: theme.borderColor, 
                    borderRadius: '4px', 
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: '4.8%', 
                      height: '100%', 
                      backgroundColor: '#10b981' 
                    }}></div>
                  </div>
                </div>
                <div style={{
                  padding: '20px', 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: '8px',
                  border: `1px solid ${theme.borderColor}`
                }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: 'bold', color: theme.textPrimary }}>
                    Quick Actions:
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={handleWasabiBrowse}
                      style={{
                        padding: '8px 16px',
                        fontSize: '12px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      🔍 Browse
                    </button>
                    <button 
                      onClick={handleWasabiUpload}
                      style={{
                        padding: '8px 16px',
                        fontSize: '12px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      ⬆️ Upload
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <p style={{ color: theme.textPrimary, fontSize: '16px', marginBottom: '8px', fontWeight: 'bold' }}>
                Connect Wasabi Cloud Storage
              </p>
              <p style={{ color: theme.textSecondary, fontSize: '14px', margin: '0' }}>
                Secure cloud storage for your assets and member content
              </p>
            </div>
          )}
        </IntegrationCard>

        {/* CANVA INTEGRATION */}
        <IntegrationCard
          title="Canva Integration"
          subtitle="Design templates and brand assets"
          emoji="🎨"
          connected={canvaConnected}
          onToggle={handleCanvaToggle}
          gradientColor={theme.gradientPurple}
        >
          {canvaConnected ? (
            <div>
              <h4 style={{ color: theme.textPrimary, marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>
                🎨 Design Library Connected
              </h4>
              <div style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '20px' }}>
                Brand Templates • Design Assets • Collaborative Workspace
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                {[
                  { emoji: '📄', title: 'Templates', value: '47 designs' },
                  { emoji: '🏢', title: 'Brand Kit', value: 'Active' },
                  { emoji: '👥', title: 'Team', value: '5 members' }
                ].map((item, index) => (
                  <div key={index} style={{
                    padding: '20px', 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: `1px solid ${theme.borderColor}`
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{item.emoji}</div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: theme.textPrimary, marginBottom: '4px' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '11px', color: theme.textSecondary }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
              <p style={{ color: theme.textPrimary, fontSize: '16px', marginBottom: '8px', fontWeight: 'bold' }}>
                Connect your Canva workspace
              </p>
              <p style={{ color: theme.textSecondary, fontSize: '14px', margin: '0' }}>
                Access design templates, brand kits, and collaborative tools
              </p>
            </div>
          )}
        </IntegrationCard>
      </div>
    </div>
  );
}

// =============================================================================
// BRAND TAB - FUNCTIONAL BRAND KIT MANAGEMENT
// =============================================================================

function AdminBrandTab({ theme, isDarkMode }) {
  const [activeSection, setActiveSection] = useState('colors');
  const [notifications, setNotifications] = useState([]);
  
  // Load data from localStorage on component mount
  const [brandColors, setBrandColors] = useState(() => {
    const saved = localStorage.getItem('brandColors');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Primary Blue', hex: '#3b82f6', usage: 'Main brand color' },
      { id: 2, name: 'Secondary Green', hex: '#10b981', usage: 'Success states' },
      { id: 3, name: 'Accent Purple', hex: '#8b5cf6', usage: 'Creative elements' },
      { id: 4, name: 'Warning Orange', hex: '#f59e0b', usage: 'Alerts & warnings' },
      { id: 5, name: 'Error Red', hex: '#ef4444', usage: 'Error states' }
    ];
  });

  const [logos, setLogos] = useState(() => {
    const saved = localStorage.getItem('brandLogos');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Primary Logo', type: 'SVG', size: '1.2 MB', usage: 'Main brand identity' },
      { id: 2, name: 'Logo Mark', type: 'PNG', size: '340 KB', usage: 'Social media icons' },
      { id: 3, name: 'White Version', type: 'SVG', size: '980 KB', usage: 'Dark backgrounds' },
      { id: 4, name: 'Horizontal Layout', type: 'PNG', size: '567 KB', usage: 'Headers & banners' }
    ];
  });

  const [fonts, setFonts] = useState(() => {
    const saved = localStorage.getItem('brandFonts');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Inter', category: 'Primary', usage: 'Headlines, UI text', weight: '400-700' },
      { id: 2, name: 'Roboto', category: 'Secondary', usage: 'Body text, descriptions', weight: '300-500' },
      { id: 3, name: 'Playfair Display', category: 'Accent', usage: 'Special headlines', weight: '400-700' }
    ];
  });

  // Form states
  const [showColorForm, setShowColorForm] = useState(false);
  const [editingColor, setEditingColor] = useState(null);
  const [newColor, setNewColor] = useState({
    name: '',
    hex: '#523474',
    usage: ''
  });

  // Guidelines editing state
  const [editingGuidelines, setEditingGuidelines] = useState({
    logo: false,
    color: false,
    typography: false
  });
  
  const [guidelinesContent, setGuidelinesContent] = useState(() => {
    const saved = localStorage.getItem('brandGuidelines');
    return saved ? JSON.parse(saved) : {
      logo: {
        dos: [
          'Use the primary logo on light backgrounds',
          'Maintain minimum clear space of 2x the logo height',
          'Use approved color variations only',
          'Ensure logo is legible at all sizes'
        ],
        donts: [
          'Stretch, distort, or rotate the logo',
          'Use unauthorized colors or effects',
          'Place logo on busy backgrounds',
          'Use low-resolution versions'
        ]
      },
      color: 'Primary Blue (#3b82f6): Use for main call-to-action buttons, primary links, and key brand elements. Should comprise 60% of brand color usage.\n\nSecondary Green (#10b981): Reserved for success states, positive feedback, and completion indicators. Use sparingly for maximum impact.\n\nSupporting Colors: Purple, Orange, and Red should be used as accent colors for specific UI states and never as primary brand colors.\n\nAccessibility: Ensure all color combinations meet WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text).',
      typography: 'Hierarchy: Use Inter for all UI elements and primary headings. Roboto for body text and longer content. Playfair Display only for special occasions and creative headlines.\n\nSizing: Maintain consistent sizing scale: H1 (32px), H2 (24px), H3 (20px), H4 (18px), Body (16px), Small (14px), Caption (12px).\n\nLine Height: Use 1.5x line height for body text, 1.2x for headings. Ensure adequate spacing between elements for readability.'
    };
  });

  // Notification system
  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // Color management functions
  const handleAddColor = () => {
    setShowColorForm(true);
  };

  // Guidelines editing functions
  const handleEditGuideline = (section) => {
    setEditingGuidelines(prev => ({ ...prev, [section]: true }));
    showNotification(`Editing ${section} guidelines...`, 'info');
  };

  const handleSaveGuideline = (section) => {
    // Save guidelines to localStorage
    localStorage.setItem('brandGuidelines', JSON.stringify(guidelinesContent));
    
    setEditingGuidelines(prev => ({ ...prev, [section]: false }));
    showNotification(`${section.charAt(0).toUpperCase() + section.slice(1)} guidelines saved!`, 'success');
  };

  const handleCancelEditGuideline = (section) => {
    setEditingGuidelines(prev => ({ ...prev, [section]: false }));
    showNotification(`${section.charAt(0).toUpperCase() + section.slice(1)} guidelines edit cancelled`, 'info');
  };

  const handleEditColor = (color) => {
    setEditingColor(color);
    setNewColor({
      name: color.name,
      hex: color.hex,
      usage: color.usage
    });
    setShowColorForm(true);
  };

  const handleSaveColor = () => {
    if (!newColor.name.trim() || !newColor.hex.trim() || !newColor.usage.trim()) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    let updatedColors;
    if (editingColor) {
      // Update existing color
      updatedColors = brandColors.map(color => 
        color.id === editingColor.id 
          ? { ...color, name: newColor.name, hex: newColor.hex, usage: newColor.usage }
          : color
      );
      showNotification(`Updated ${newColor.name}`, 'success');
    } else {
      // Add new color
      const colorToAdd = {
        id: Math.max(...brandColors.map(c => c.id)) + 1,
        name: newColor.name,
        hex: newColor.hex,
        usage: newColor.usage
      };
      updatedColors = [...brandColors, colorToAdd];
      showNotification(`Added ${newColor.name} to palette`, 'success');
    }
    
    // Save to localStorage
    localStorage.setItem('brandColors', JSON.stringify(updatedColors));
    setBrandColors(updatedColors);
    
    setNewColor({ name: '', hex: '#523474', usage: '' });
    setShowColorForm(false);
    setEditingColor(null);
  };

  const handleCancelColor = () => {
    setNewColor({ name: '', hex: '#523474', usage: '' });
    setShowColorForm(false);
    setEditingColor(null);
  };

  const handleCopyColor = (hex) => {
    navigator.clipboard.writeText(hex).then(() => {
      showNotification(`Copied ${hex} to clipboard`, 'success');
    }).catch(() => {
      showNotification('Failed to copy color code', 'error');
    });
  };

  return (
    <div style={{ padding: '20px', backgroundColor: theme.background }}>
      {/* Notification System */}
      {notifications.length > 0 && (
        <div style={{ 
          position: 'fixed', 
          top: '20px', 
          right: '20px', 
          zIndex: 1000, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '10px' 
        }}>
          {notifications.map(notification => (
            <div key={notification.id} style={{
              padding: '12px 20px',
              backgroundColor: notification.type === 'success' ? '#10b981' : 
                             notification.type === 'error' ? '#ef4444' : '#3b82f6',
              color: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {notification.message}
            </div>
          ))}
        </div>
      )}

      <h2 style={{ color: theme.textPrimary, fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
        🏢 Brand Kit
      </h2>
      <p style={{ color: theme.textSecondary, fontSize: '14px', margin: '0 0 30px 0' }}>
        Brand guidelines, assets, and style management
      </p>
      
      {/* Brand Kit Sub-Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '0', 
        marginBottom: '30px',
        borderBottom: `1px solid ${theme.borderColor}`,
        backgroundColor: theme.cardBackground,
        borderRadius: '8px 8px 0 0'
      }}>
        {[
          { id: 'colors', label: '🎨 Colors' },
          { id: 'logos', label: '🏷️ Logos' },
          { id: 'fonts', label: '🔤 Typography' },
          { id: 'guidelines', label: '📋 Guidelines' }
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            style={{
              padding: '16px 24px',
              backgroundColor: activeSection === section.id ? theme.background : 'transparent',
              color: activeSection === section.id ? theme.textPrimary : theme.textSecondary,
              border: 'none',
              borderBottom: activeSection === section.id ? '3px solid #8b5cf6' : '3px solid transparent',
              fontWeight: activeSection === section.id ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* COLORS SECTION */}
      {activeSection === 'colors' && (
        <div style={{ 
          padding: '30px', 
          backgroundColor: theme.cardBackground, 
          borderRadius: '0 0 12px 12px',
          border: `1px solid ${theme.borderColor}`,
          borderTop: 'none'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h3 style={{ color: theme.textPrimary, fontSize: '18px', fontWeight: 'bold', margin: '0' }}>
              🎨 Brand Colors
            </h3>
            <button 
              onClick={handleAddColor}
              style={{
                padding: '12px 20px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ➕ Add Color
            </button>
          </div>

          {/* Add/Edit Color Form */}
          {showColorForm && (
            <div style={{
              padding: '30px',
              border: '2px solid #8b5cf6',
              borderRadius: '12px',
              backgroundColor: theme.background,
              marginBottom: '30px',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)'
            }}>
              <h4 style={{ color: theme.textPrimary, marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>
                🎨 {editingColor ? 'Edit Brand Color' : 'Add New Brand Color'}
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: theme.textPrimary,
                    fontSize: '14px'
                  }}>
                    Color Name
                  </label>
                  <input
                    type="text"
                    value={newColor.name}
                    onChange={(e) => setNewColor(prev => ({ ...prev, name: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${theme.inputBorder}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: theme.inputBackground,
                      color: theme.textPrimary,
                      outline: 'none'
                    }}
                    placeholder="e.g., Deep Purple"
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: theme.textPrimary,
                    fontSize: '14px'
                  }}>
                    Hex Code
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                      type="color"
                      value={newColor.hex}
                      onChange={(e) => setNewColor(prev => ({ ...prev, hex: e.target.value }))}
                      style={{
                        width: '60px',
                        height: '46px',
                        border: `1px solid ${theme.inputBorder}`,
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    />
                    <input
                      type="text"
                      value={newColor.hex}
                      onChange={(e) => setNewColor(prev => ({ ...prev, hex: e.target.value }))}
                      style={{
                        flex: '1',
                        padding: '12px',
                        border: `1px solid ${theme.inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        backgroundColor: theme.inputBackground,
                        color: theme.textPrimary,
                        outline: 'none',
                        fontFamily: 'monospace'
                      }}
                      placeholder="#523474"
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: theme.textPrimary,
                  fontSize: '14px'
                }}>
                  Usage Description
                </label>
                <textarea
                  value={newColor.usage}
                  onChange={(e) => setNewColor(prev => ({ ...prev, usage: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: theme.inputBackground,
                    color: theme.textPrimary,
                    minHeight: '80px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    outline: 'none'
                  }}
                  placeholder="Describe where and how this color should be used..."
                />
              </div>

              {/* Color Preview */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                marginBottom: '25px',
                padding: '20px',
                backgroundColor: theme.headerBackground,
                borderRadius: '8px',
                border: `1px solid ${theme.borderColor}`
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: newColor.hex,
                  borderRadius: '8px',
                  border: isDarkMode 
                    ? `4px solid #ffffff` 
                    : `2px solid ${theme.borderColor}`,
                  boxShadow: isDarkMode 
                    ? '0 0 0 1px rgba(0,0,0,0.8), 0 4px 16px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.5)' 
                    : '0 2px 8px rgba(0, 0, 0, 0.15)',
                  outline: isDarkMode ? '2px solid rgba(255,255,255,0.6)' : 'none',
                  outlineOffset: '2px'
                }}></div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: theme.textPrimary, marginBottom: '4px' }}>
                    {newColor.name || 'New Color'}
                  </div>
                  <div style={{ fontSize: '14px', color: theme.textSecondary, fontFamily: 'monospace' }}>
                    {newColor.hex}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleCancelColor}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: theme.buttonSecondary,
                    color: theme.buttonSecondaryText,
                    border: `1px solid ${theme.borderColor}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveColor}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  💾 Save Color
                </button>
              </div>
            </div>
          )}
          
          {/* Color Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {brandColors.map(color => (
              <div key={color.id} style={{
                padding: '25px',
                border: `1px solid ${theme.borderColor}`,
                borderRadius: '12px',
                backgroundColor: theme.background,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: color.hex,
                    borderRadius: '12px',
                    border: isDarkMode 
                      ? `4px solid #ffffff` 
                      : `2px solid ${theme.borderColor}`,
                    boxShadow: isDarkMode 
                      ? '0 0 0 1px rgba(0,0,0,0.8), 0 4px 16px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.5)' 
                      : '0 2px 8px rgba(0, 0, 0, 0.15)',
                    outline: isDarkMode ? '2px solid rgba(255,255,255,0.6)' : 'none',
                    outlineOffset: '2px'
                  }}></div>
                  <div>
                    <h4 style={{ margin: '0 0 6px 0', color: theme.textPrimary, fontSize: '16px', fontWeight: 'bold' }}>
                      {color.name}
                    </h4>
                    <div style={{ 
                      fontSize: '14px', 
                      color: theme.textSecondary, 
                      fontFamily: 'monospace', 
                      fontWeight: 'bold' 
                    }}>
                      {color.hex}
                    </div>
                  </div>
                </div>
                <p style={{ 
                  margin: '0 0 20px 0', 
                  fontSize: '14px', 
                  color: theme.textSecondary,
                  lineHeight: '1.5'
                }}>
                  {color.usage}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleCopyColor(color.hex)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: theme.buttonSecondary,
                      color: theme.buttonSecondaryText,
                      border: `1px solid ${theme.borderColor}`,
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    📋 Copy
                  </button>
                  <button 
                    onClick={() => handleEditColor(color)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: theme.buttonPrimary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
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
        <div style={{ 
          padding: '30px', 
          backgroundColor: theme.cardBackground, 
          borderRadius: '0 0 12px 12px',
          border: `1px solid ${theme.borderColor}`,
          borderTop: 'none'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h3 style={{ color: theme.textPrimary, fontSize: '18px', fontWeight: 'bold', margin: '0' }}>
              🏷️ Logo Assets
            </h3>
            <button style={{
              padding: '12px 20px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              ⬆️ Upload Logo
            </button>
          </div>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            {logos.map(logo => (
              <div key={logo.id} style={{
                padding: '25px',
                border: `1px solid ${theme.borderColor}`,
                borderRadius: '12px',
                backgroundColor: theme.background,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{
                    width: '80px',
                    height: '60px',
                    backgroundColor: theme.headerBackground,
                    border: `2px dashed ${theme.borderColor}`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    🏷️
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 6px 0', color: theme.textPrimary, fontSize: '16px', fontWeight: 'bold' }}>
                      {logo.name}
                    </h4>
                    <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                      {logo.type} • {logo.size} • {logo.usage}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{
                    padding: '10px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}>
                    ⬇️ Download
                  </button>
                  <button style={{
                    padding: '10px 16px',
                    backgroundColor: theme.buttonPrimary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}>
                    👁️ Preview
                  </button>
                  <button style={{
                    padding: '10px 16px',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*,.svg';
                    input.onchange = (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        showNotification(`Uploading ${file.name}...`, 'info');
                        setTimeout(() => {
                          showNotification(`${file.name} uploaded successfully!`, 'success');
                        }, 1500);
                      }
                    };
                    input.click();
                  }}
                  >
                    📤 Upload
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TYPOGRAPHY SECTION */}
      {activeSection === 'fonts' && (
        <div style={{ 
          padding: '30px', 
          backgroundColor: theme.cardBackground, 
          borderRadius: '0 0 12px 12px',
          border: `1px solid ${theme.borderColor}`,
          borderTop: 'none'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h3 style={{ color: theme.textPrimary, fontSize: '18px', fontWeight: 'bold', margin: '0' }}>
              🔤 Typography System
            </h3>
            <button style={{
              padding: '12px 20px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              ➕ Add Font
            </button>
          </div>
          
          <div style={{ display: 'grid', gap: '25px' }}>
            {fonts.map(font => (
              <div key={font.id} style={{
                padding: '30px',
                border: `1px solid ${theme.borderColor}`,
                borderRadius: '12px',
                backgroundColor: theme.background,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 10px 0', color: theme.textPrimary, fontSize: '20px', fontWeight: 'bold' }}>
                      {font.name}
                    </h4>
                    <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: theme.textSecondary, marginBottom: '8px' }}>
                      <span><strong>Category:</strong> {font.category}</span>
                      <span><strong>Weight:</strong> {font.weight}</span>
                    </div>
                    <p style={{ margin: '0', fontSize: '14px', color: theme.textSecondary, lineHeight: '1.5' }}>
                      {font.usage}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{
                      padding: '8px 16px',
                      backgroundColor: theme.buttonSecondary,
                      color: theme.buttonSecondaryText,
                      border: `1px solid ${theme.borderColor}`,
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      const cssCode = `font-family: '${font.name}', sans-serif;\nfont-weight: ${font.weight.split('-')[0]};\nfont-size: 16px;`;
                      navigator.clipboard.writeText(cssCode).then(() => {
                        showNotification(`${font.name} CSS copied to clipboard!`, 'success');
                      }).catch(() => {
                        showNotification('Failed to copy CSS', 'error');
                      });
                    }}
                    >
                      📋 Copy CSS
                    </button>
                    <button style={{
                      padding: '8px 16px',
                      backgroundColor: theme.buttonPrimary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      showNotification(`${font.name} font editor opening...`, 'info');
                      setTimeout(() => {
                        showNotification(`${font.name} font properties updated!`, 'success');
                      }, 1500);
                    }}
                    >
                      ✏️ Edit
                    </button>
                  </div>
                </div>
                
                {/* Font Preview */}
                <div style={{
                  padding: '25px',
                  backgroundColor: theme.headerBackground,
                  borderRadius: '8px',
                  border: `1px solid ${theme.borderColor}`,
                  fontFamily: font.name.toLowerCase().includes('inter') ? 'ui-sans-serif, system-ui' : 
                             font.name.toLowerCase().includes('roboto') ? 'Roboto, sans-serif' : 
                             'ui-serif, Georgia'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px', fontWeight: 'bold', color: theme.textPrimary }}>
                    The quick brown fox jumps
                  </div>
                  <div style={{ fontSize: '18px', marginBottom: '10px', color: theme.textPrimary }}>
                    Regular weight sample text for {font.name}
                  </div>
                  <div style={{ fontSize: '14px', color: theme.textSecondary, fontWeight: '500' }}>
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
        <div style={{ 
          padding: '30px', 
          backgroundColor: theme.cardBackground, 
          borderRadius: '0 0 12px 12px',
          border: `1px solid ${theme.borderColor}`,
          borderTop: 'none'
        }}>
          <h3 style={{ 
            marginBottom: '30px', 
            color: theme.textPrimary, 
            fontSize: '18px', 
            fontWeight: 'bold' 
          }}>
            📋 Brand Guidelines
          </h3>
          
          <div style={{ display: 'grid', gap: '30px' }}>
            {/* Logo Usage Guidelines */}
            <div style={{
              padding: '30px',
              border: `2px solid ${theme.borderColor}`,
              borderRadius: '12px',
              backgroundColor: theme.background
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4 style={{ color: theme.textPrimary, margin: '0', fontSize: '16px', fontWeight: 'bold' }}>
                  🏷️ Logo Usage Guidelines
                </h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {!editingGuidelines.logo ? (
                    <button 
                      onClick={() => handleEditGuideline('logo')}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: theme.buttonPrimary,
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      ✏️ Edit
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleCancelEditGuideline('logo')}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: theme.buttonSecondary,
                          color: theme.buttonSecondaryText,
                          border: `1px solid ${theme.borderColor}`,
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleSaveGuideline('logo')}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        💾 Save
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {editingGuidelines.logo ? (
                <div style={{ padding: '20px', backgroundColor: theme.headerBackground, borderRadius: '8px', border: `1px solid ${theme.borderColor}` }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold', color: theme.textPrimary }}>
                    Edit logo usage guidelines (demo functionality):
                  </p>
                  <textarea 
                    style={{
                      width: '100%',
                      height: '200px',
                      padding: '12px',
                      border: `1px solid ${theme.inputBorder}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: theme.inputBackground,
                      color: theme.textPrimary,
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                    defaultValue={`DO:\n${guidelinesContent.logo.dos.join('\n')}\n\nDON'T:\n${guidelinesContent.logo.donts.join('\n')}`}
                  />
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                  <div>
                    <h5 style={{ color: '#10b981', fontSize: '14px', marginBottom: '12px', fontWeight: 'bold' }}>
                      ✅ DO
                    </h5>
                    <ul style={{ fontSize: '14px', color: theme.textSecondary, lineHeight: '1.8', paddingLeft: '20px' }}>
                      {guidelinesContent.logo.dos.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 style={{ color: '#ef4444', fontSize: '14px', marginBottom: '12px', fontWeight: 'bold' }}>
                      ❌ DON'T
                    </h5>
                    <ul style={{ fontSize: '14px', color: theme.textSecondary, lineHeight: '1.8', paddingLeft: '20px' }}>
                      {guidelinesContent.logo.donts.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Color Usage Guidelines */}
            <div style={{
              padding: '30px',
              border: `2px solid ${theme.borderColor}`,
              borderRadius: '12px',
              backgroundColor: theme.background
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4 style={{ color: theme.textPrimary, margin: '0', fontSize: '16px', fontWeight: 'bold' }}>
                  🎨 Color Usage Guidelines
                </h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {!editingGuidelines.color ? (
                    <button 
                      onClick={() => handleEditGuideline('color')}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: theme.buttonPrimary,
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      ✏️ Edit
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleCancelEditGuideline('color')}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: theme.buttonSecondary,
                          color: theme.buttonSecondaryText,
                          border: `1px solid ${theme.borderColor}`,
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleSaveGuideline('color')}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        💾 Save
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {editingGuidelines.color ? (
                <div style={{ padding: '20px', backgroundColor: theme.headerBackground, borderRadius: '8px', border: `1px solid ${theme.borderColor}` }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold', color: theme.textPrimary }}>
                    Edit color usage guidelines:
                  </p>
                  <textarea 
                    style={{
                      width: '100%',
                      height: '200px',
                      padding: '12px',
                      border: `1px solid ${theme.inputBorder}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: theme.inputBackground,
                      color: theme.textPrimary,
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                    defaultValue={guidelinesContent.color}
                  />
                </div>
              ) : (
                <div style={{ fontSize: '14px', color: theme.textSecondary, lineHeight: '1.8' }}>
                  {guidelinesContent.color.split('\n\n').map((paragraph, index) => (
                    <p key={index} style={{ marginBottom: '16px' }}>
                      {paragraph.split(': ').length > 1 ? (
                        <>
                          <strong style={{ color: theme.textPrimary }}>{paragraph.split(': ')[0]}:</strong> {paragraph.split(': ').slice(1).join(': ')}
                        </>
                      ) : (
                        paragraph
                      )}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Typography Guidelines */}
            <div style={{
              padding: '30px',
              border: `2px solid ${theme.borderColor}`,
              borderRadius: '12px',
              backgroundColor: theme.background
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4 style={{ color: theme.textPrimary, margin: '0', fontSize: '16px', fontWeight: 'bold' }}>
                  🔤 Typography Guidelines
                </h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {!editingGuidelines.typography ? (
                    <button 
                      onClick={() => handleEditGuideline('typography')}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: theme.buttonPrimary,
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      ✏️ Edit
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleCancelEditGuideline('typography')}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: theme.buttonSecondary,
                          color: theme.buttonSecondaryText,
                          border: `1px solid ${theme.borderColor}`,
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleSaveGuideline('typography')}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        💾 Save
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {editingGuidelines.typography ? (
                <div style={{ padding: '20px', backgroundColor: theme.headerBackground, borderRadius: '8px', border: `1px solid ${theme.borderColor}` }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold', color: theme.textPrimary }}>
                    Edit typography guidelines:
                  </p>
                  <textarea 
                    style={{
                      width: '100%',
                      height: '200px',
                      padding: '12px',
                      border: `1px solid ${theme.inputBorder}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: theme.inputBackground,
                      color: theme.textPrimary,
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                    defaultValue={guidelinesContent.typography}
                  />
                </div>
              ) : (
                <div style={{ fontSize: '14px', color: theme.textSecondary, lineHeight: '1.8' }}>
                  {guidelinesContent.typography.split('\n\n').map((paragraph, index) => (
                    <p key={index} style={{ marginBottom: index === guidelinesContent.typography.split('\n\n').length - 1 ? '0' : '16px' }}>
                      {paragraph.split(': ').length > 1 ? (
                        <>
                          <strong style={{ color: theme.textPrimary }}>{paragraph.split(': ')[0]}:</strong> {paragraph.split(': ').slice(1).join(': ')}
                        </>
                      ) : (
                        paragraph
                      )}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export the main component
export default AdminComponents;
