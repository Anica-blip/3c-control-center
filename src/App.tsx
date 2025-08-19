import React, { useState } from 'react';

// Enhanced AdminTemplates Component
function AdminTemplates() {
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
    },
    {
      id: 3,
      name: "Email Newsletter",
      category: "Email",
      description: "Weekly newsletter template",
      fields: ["subject", "greeting", "main_content", "cta", "footer"],
      lastModified: "2025-01-08"
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
        /* Template Builder Interface */
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
        /* Template List View */
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
                  onMouseEnter={(e) => e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
                  onMouseLeave={(e) => e.target.style.boxShadow = 'none'}
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

          {/* External Tools Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            {/* LEFT SIDE: Builder Admin */}
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

// Enhanced AdminLibraries Component
function AdminLibraries() {
  // Canva Integration State
  const [canvaDesigns, setCanvaDesigns] = useState([]);
  const [canvaLoading, setCanvaLoading] = useState(false);
  const [canvaConnected, setCanvaConnected] = useState(false);
  const [canvaSearchQuery, setCanvaSearchQuery] = useState('');
  const [selectedDesign, setSelectedDesign] = useState(null);

  // Notion Integration State
  const [notionConnected, setNotionConnected] = useState(false);
  const [notionPages, setNotionPages] = useState([
    { id: 1, title: "Content Calendar", type: "Database", lastModified: "2025-01-15" },
    { id: 2, title: "Brand Guidelines", type: "Page", lastModified: "2025-01-12" },
    { id: 3, title: "Content Templates", type: "Database", lastModified: "2025-01-10" }
  ]);

  // Wasabi Integration State
  const [wasabiConnected, setWasabiConnected] = useState(false);
  const [wasabiFiles, setWasabiFiles] = useState([
    { id: 1, name: "brand-assets.zip", size: "25.4 MB", type: "Archive", lastModified: "2025-01-14" },
    { id: 2, name: "video-content/", size: "1.2 GB", type: "Folder", lastModified: "2025-01-13" },
    { id: 3, name: "templates/", size: "156 MB", type: "Folder", lastModified: "2025-01-11" }
  ]);

  // Canva Functions
  const connectCanva = async () => {
    setCanvaLoading(true);
    setTimeout(() => {
      setCanvaConnected(true);
      setCanvaLoading(false);
      setCanvaDesigns([
        {
          id: 'design1',
          name: 'Instagram Post - Summer Campaign',
          type: 'instagram_post',
          thumbnail: 'https://via.placeholder.com/200x200/3b82f6/ffffff?text=IG+Post',
          url: 'https://canva.com/design/sample1',
          lastModified: '2025-01-15'
        },
        {
          id: 'design2',
          name: 'YouTube Thumbnail - Tutorial',
          type: 'youtube_thumbnail',
          thumbnail: 'https://via.placeholder.com/200x112/10b981/ffffff?text=YT+Thumb',
          url: 'https://canva.com/design/sample2',
          lastModified: '2025-01-14'
        },
        {
          id: 'design3',
          name: 'Business Presentation Q1',
          type: 'presentation',
          thumbnail: 'https://via.placeholder.com/200x150/f59e0b/ffffff?text=Presentation',
          url: 'https://canva.com/design/sample3',
          lastModified: '2025-01-13'
        }
      ]);
    }, 2000);
  };

  const searchCanvaDesigns = async () => {
    if (!canvaSearchQuery.trim()) return;
    
    setCanvaLoading(true);
    setTimeout(() => {
      const filteredDesigns = canvaDesigns.filter(design => 
        design.name.toLowerCase().includes(canvaSearchQuery.toLowerCase())
      );
      setCanvaDesigns(filteredDesigns);
      setCanvaLoading(false);
    }, 1000);
  };

  const refreshCanvaDesigns = async () => {
    setCanvaLoading(true);
    setTimeout(() => {
      setCanvaDesigns([
        {
          id: 'design1',
          name: 'Instagram Post - Summer Campaign',
          type: 'instagram_post',
          thumbnail: 'https://via.placeholder.com/200x200/3b82f6/ffffff?text=IG+Post',
          url: 'https://canva.com/design/sample1',
          lastModified: '2025-01-15'
        },
        {
          id: 'design2',
          name: 'YouTube Thumbnail - Tutorial',
          type: 'youtube_thumbnail',
          thumbnail: 'https://via.placeholder.com/200x112/10b981/ffffff?text=YT+Thumb',
          url: 'https://canva.com/design/sample2',
          lastModified: '2025-01-14'
        },
        {
          id: 'design3',
          name: 'Business Presentation Q1',
          type: 'presentation',
          thumbnail: 'https://via.placeholder.com/200x150/f59e0b/ffffff?text=Presentation',
          url: 'https://canva.com/design/sample3',
          lastModified: '2025-01-13'
        }
      ]);
      setCanvaLoading(false);
      setCanvaSearchQuery('');
    }, 1000);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>📚 Libraries</h2>
      <p>External service integrations and storage management</p>
      
      {/* Three Integration Sections */}
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
              <h4 style={{ color: '#4338ca', marginBottom: '15px' }}>📄 Recent Pages & Databases</h4>
              <div style={{ display: 'grid', gap: '10px' }}>
                {notionPages.map(page => (
                  <div 
                    key={page.id}
                    style={{ 
                      padding: '15px', 
                      backgroundColor: 'rgba(255,255,255,0.8)', 
                      border: '1px solid #c7d2fe', 
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                        {page.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {page.type} • Last modified: {page.lastModified}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ 
                        padding: '6px 12px', 
                        backgroundColor: '#4338ca', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}>
                        📖 Open
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
                        🔄 Sync
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📝</div>
              <p style={{ color: '#4338ca', fontSize: '16px', marginBottom: '10px' }}>
                Connect your Notion workspace
              </p>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
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
                High-performance cloud storage for assets
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
              <h4 style={{ color: '#dc2626', marginBottom: '15px' }}>📁 Storage Overview</h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '15px',
                marginBottom: '20px'
              }}>
                <div style={{ 
                  padding: '15px', 
                  backgroundColor: 'rgba(255,255,255,0.8)', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', color: '#dc2626', fontWeight: 'bold' }}>2.1 GB</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Used Storage</div>
                </div>
                <div style={{ 
                  padding: '15px', 
                  backgroundColor: 'rgba(255,255,255,0.8)', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', color: '#dc2626', fontWeight: 'bold' }}>47.9 GB</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Available</div>
                </div>
                <div style={{ 
                  padding: '15px', 
                  backgroundColor: 'rgba(255,255,255,0.8)', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', color: '#dc2626', fontWeight: 'bold' }}>156</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Files</div>
                </div>
              </div>

              <h4 style={{ color: '#dc2626', marginBottom: '15px' }}>📂 Recent Files</h4>
              <div style={{ display: 'grid', gap: '10px' }}>
                {wasabiFiles.map(file => (
                  <div 
                    key={file.id}
                    style={{ 
                      padding: '15px', 
                      backgroundColor: 'rgba(255,255,255,0.8)', 
                      border: '1px solid #fecaca', 
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                        {file.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {file.type} • {file.size} • {file.lastModified}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ 
                        padding: '6px 12px', 
                        backgroundColor: '#dc2626', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}>
                        ⬇️ Download
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
                        🔗 Share
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📦</div>
              <p style={{ color: '#dc2626', fontSize: '16px', marginBottom: '10px' }}>
                Connect your Wasabi storage
              </p>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                High-performance cloud storage for your brand assets and media files
              </p>
            </div>
          )}
        </div>

        {/* CANVA INTEGRATION - FUNCTIONAL */}
        <div style={{ 
          padding: '25px', 
          border: '2px solid #7c3aed', 
          borderRadius: '12px', 
          background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: '0', color: '#7c3aed', fontSize: '20px' }}>🎨 Canva Integration</h3>
              <p style={{ margin: '5px 0 0 0', color: '#7c3aed', fontSize: '14px' }}>
                Design platform for visual content creation
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
                onClick={canvaConnected ? () => setCanvaConnected(false) : connectCanva}
                disabled={canvaLoading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: canvaConnected ? '#ef4444' : '#7c3aed',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: canvaLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  opacity: canvaLoading ? 0.7 : 1
                }}
              >
                {canvaLoading ? '⏳ Connecting...' : (canvaConnected ? 'Disconnect' : '🔗 Connect Canva')}
              </button>
            </div>
          </div>

          {canvaConnected ? (
            <div>
              {/* Search Bar */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={canvaSearchQuery}
                    onChange={(e) => setCanvaSearchQuery(e.target.value)}
                    placeholder="Search your designs..."
                    style={{
                      flex: '1',
                      padding: '10px',
                      border: '1px solid #ddd6fe',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && searchCanvaDesigns()}
                  />
                  <button
                    onClick={searchCanvaDesigns}
                    disabled={canvaLoading}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#7c3aed',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: canvaLoading ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    🔍 Search
                  </button>
                  <button
                    onClick={refreshCanvaDesigns}
                    disabled={canvaLoading}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: canvaLoading ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>

              {/* Designs Grid */}
              <h4 style={{ color: '#7c3aed', marginBottom: '15px' }}>
                🎨 Your Designs ({canvaDesigns.length})
              </h4>
              
              {canvaLoading ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px',
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</div>
                  <p style={{ color: '#7c3aed' }}>Loading designs...</p>
                </div>
              ) : canvaDesigns.length > 0 ? (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                  gap: '20px' 
                }}>
                  {canvaDesigns.map(design => (
                    <div 
                      key={design.id}
                      style={{ 
                        padding: '15px', 
                        backgroundColor: 'rgba(255,255,255,0.9)', 
                        border: selectedDesign === design.id ? '2px solid #7c3aed' : '1px solid #ddd6fe', 
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setSelectedDesign(selectedDesign === design.id ? null : design.id)}
                      onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      <img 
                        src={design.thumbnail} 
                        alt={design.name}
                        style={{ 
                          width: '100%', 
                          height: '150px', 
                          objectFit: 'cover', 
                          borderRadius: '8px',
                          marginBottom: '12px'
                        }}
                      />
                      <h5 style={{ 
                        margin: '0 0 8px 0', 
                        color: '#1f2937', 
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        {design.name}
                      </h5>
                      <p style={{ 
                        margin: '0 0 12px 0', 
                        color: '#6b7280', 
                        fontSize: '12px'
                      }}>
                        {design.type.replace('_', ' ')} • {design.lastModified}
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(design.url, '_blank');
                          }}
                          style={{ 
                            flex: '1',
                            padding: '8px', 
                            backgroundColor: '#7c3aed', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Exporting ${design.name}...`);
                          }}
                          style={{ 
                            flex: '1',
                            padding: '8px', 
                            backgroundColor: '#10b981', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          📥 Export
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px',
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>🎨</div>
                  <p style={{ color: '#7c3aed', marginBottom: '10px' }}>No designs found</p>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>
                    {canvaSearchQuery ? 'Try a different search term' : 'Create your first design in Canva'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎨</div>
              <p style={{ color: '#7c3aed', fontSize: '16px', marginBottom: '10px' }}>
                Connect your Canva account
              </p>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Access your designs, templates, and create new visual content
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Enhanced AdminBrand Component
function AdminBrand() {
  const [selectedTab, setSelectedTab] = useState('overview');

  return (
    <div style={{ padding: '20px' }}>
      <h2>🏢 Brand Kit</h2>
      <p>Brand assets, guidelines, and system configuration</p>
      
      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '0', 
        marginTop: '20px', 
        marginBottom: '30px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <button
          onClick={() => setSelectedTab('overview')}
          style={{
            padding: '12px 20px',
            backgroundColor: selectedTab === 'overview' ? '#3b82f6' : 'transparent',
            color: selectedTab === 'overview' ? 'white' : '#6b7280',
            border: 'none',
            borderBottom: selectedTab === 'overview' ? '3px solid #3b82f6' : '3px solid transparent',
            cursor: 'pointer',
            fontWeight: selectedTab === 'overview' ? 'bold' : 'normal'
          }}
        >
          📊 System Overview
        </button>
        <button
          onClick={() => setSelectedTab('assets')}
          style={{
            padding: '12px 20px',
            backgroundColor: selectedTab === 'assets' ? '#3b82f6' : 'transparent',
            color: selectedTab === 'assets' ? 'white' : '#6b7280',
            border: 'none',
            borderBottom: selectedTab === 'assets' ? '3px solid #3b82f6' : '3px solid transparent',
            cursor: 'pointer',
            fontWeight: selectedTab === 'assets' ? 'bold' : 'normal'
          }}
        >
          🎨 Brand Assets
        </button>
        <button
          onClick={() => setSelectedTab('ai-tools')}
          style={{
            padding: '12px 20px',
            backgroundColor: selectedTab === 'ai-tools' ? '#3b82f6' : 'transparent',
            color: selectedTab === 'ai-tools' ? 'white' : '#6b7280',
            border: 'none',
            borderBottom: selectedTab === 'ai-tools' ? '3px solid #3b82f6' : '3px solid transparent',
            cursor: 'pointer',
            fontWeight: selectedTab === 'ai-tools' ? 'bold' : 'normal'
          }}
        >
          🤖 AI Tools
        </button>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* System Status */}
          <div style={{ 
            padding: '25px', 
            border: '2px solid #10b981', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' 
          }}>
            <h3 style={{ color: '#047857', marginBottom: '15px' }}>📊 System Status</h3>
            <p style={{ fontSize: '14px', color: '#047857', marginBottom: '20px' }}>
              Current system health and integrations
            </p>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '15px' 
            }}>
              <div style={{ 
                padding: '15px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: '#10b981', 
                  borderRadius: '50%' 
                }}></div>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Dashboard Online</span>
              </div>
              
              <div style={{ 
                padding: '15px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: '#10b981', 
                  borderRadius: '50%' 
                }}></div>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Template Engine</span>
              </div>
              
              <div style={{ 
                padding: '15px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: '#10b981', 
                  borderRadius: '50%' 
                }}></div>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Content Manager</span>
              </div>
              
              <div style={{ 
                padding: '15px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: '#f59e0b', 
                  borderRadius: '50%' 
                }}></div>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>External Integrations</span>
              </div>
              
              <div style={{ 
                padding: '15px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: '#ef4444', 
                  borderRadius: '50%' 
                }}></div>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>AI Chat Manager</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '20px' 
          }}>
            <div style={{ 
              padding: '20px', 
              border: '1px solid #d1d5db', 
              borderRadius: '8px', 
              background: '#f9fafb',
              textAlign: 'center'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>📈 Templates Created</h4>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '5px' }}>
                24
              </div>
              <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
                Active content templates
              </p>
            </div>
            
            <div style={{ 
              padding: '20px', 
              border: '1px solid #d1d5db', 
              borderRadius: '8px', 
              background: '#f9fafb',
              textAlign: 'center'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>🎨 Designs Managed</h4>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981', marginBottom: '5px' }}>
                156
              </div>
              <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
                Canva designs synced
              </p>
            </div>
            
            <div style={{ 
              padding: '20px', 
              border: '1px solid #d1d5db', 
              borderRadius: '8px', 
              background: '#f9fafb',
              textAlign: 'center'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>⚡ API Calls Today</h4>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '5px' }}>
                1,247
              </div>
              <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
                External service calls
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'assets' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Coming Soon Message */}
          <div style={{ 
            padding: '60px 40px', 
            border: '2px dashed #d1d5db', 
            borderRadius: '12px', 
            background: '#fafafa',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎨</div>
            <h3 style={{ color: '#6b7280', marginBottom: '15px', fontSize: '24px' }}>
              Brand Assets Library
            </h3>
            <p style={{ fontSize: '16px', color: '#9ca3af', marginBottom: '25px', maxWidth: '500px', margin: '0 auto 25px' }}>
              The Brand Assets section is currently under development. This will include logo management, 
              color palettes, typography guidelines, and brand resource organization.
            </p>
            
            {/* Planned Features */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '20px',
              marginTop: '30px',
              opacity: 0.7
            }}>
              <div style={{ 
                padding: '20px', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                background: '#f9fafb'
              }}>
                <h5 style={{ color: '#6b7280', marginBottom: '10px' }}>🖼️ Logo Library</h5>
                <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0' }}>
                  Upload and manage different logo variations and formats
                </p>
              </div>
              
              <div style={{ 
                padding: '20px', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                background: '#f9fafb'
              }}>
                <h5 style={{ color: '#6b7280', marginBottom: '10px' }}>🎨 Color Palettes</h5>
                <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0' }}>
                  Define and maintain brand color schemes and guidelines
                </p>
              </div>
              
              <div style={{ 
                padding: '20px', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                background: '#f9fafb'
              }}>
                <h5 style={{ color: '#6b7280', marginBottom: '10px' }}>📝 Typography</h5>
                <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0' }}>
                  Font families, sizes, and text style specifications
                </p>
              </div>
              
              <div style={{ 
                padding: '20px', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                background: '#f9fafb'
              }}>
                <h5 style={{ color: '#6b7280', marginBottom: '10px' }}>📐 Templates</h5>
                <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0' }}>
                  Brand-compliant design templates and layouts
                </p>
              </div>
            </div>
            
            <button style={{ 
              marginTop: '30px',
              padding: '15px 30px', 
              backgroundColor: '#f3f4f6', 
              border: '2px solid #d1d5db', 
              borderRadius: '8px', 
              cursor: 'not-allowed',
              color: '#6b7280',
              fontSize: '16px',
              fontWeight: 'bold'
            }} disabled>
              🚧 Coming Soon
            </button>
          </div>
        </div>
      )}

      {selectedTab === 'ai-tools' && (
        <div style={{ display: 'grid', gap: '30px' }}>
          {/* Internal AI Tools */}
          <div style={{ 
            padding: '25px', 
            border: '2px solid #3b82f6', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' 
          }}>
            <h3 style={{ color: '#1e40af', marginBottom: '15px' }}>🤖 Internal AI Tools</h3>
            <p style={{ color: '#1e40af', fontSize: '14px', marginBottom: '20px' }}>
              Built-in AI capabilities for content generation and automation
            </p>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '20px' 
            }}>
              <div style={{ 
                padding: '20px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                border: '1px solid #93c5fd', 
                borderRadius: '8px'
              }}>
                <h4 style={{ color: '#1e40af', marginBottom: '10px' }}>📝 Content Generator</h4>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>
                  AI-powered content creation for social media, blogs, and marketing materials
                </p>
                <button style={{ 
                  width: '100%', 
                  padding: '10px', 
                  backgroundColor: '#f3f4f6', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  cursor: 'not-allowed',
                  color: '#6b7280'
                }} disabled>
                  Configure (Soon)
                </button>
              </div>
              
              <div style={{ 
                padding: '20px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                border: '1px solid #93c5fd', 
                borderRadius: '8px'
              }}>
                <h4 style={{ color: '#1e40af', marginBottom: '10px' }}>🎯 Smart Targeting</h4>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>
                  AI analysis for audience targeting and content optimization
                </p>
                <button style={{ 
                  width: '100%', 
                  padding: '10px', 
                  backgroundColor: '#f3f4f6', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  cursor: 'not-allowed',
                  color: '#6b7280'
                }} disabled>
                  Configure (Soon)
                </button>
              </div>
              
              <div style={{ 
                padding: '20px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                border: '1px solid #93c5fd', 
                borderRadius: '8px'
              }}>
                <h4 style={{ color: '#1e40af', marginBottom: '10px' }}>📊 Analytics AI</h4>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>
                  Intelligent insights and recommendations from content performance
                </p>
                <button style={{ 
                  width: '100%', 
                  padding: '10px', 
                  backgroundColor: '#f3f4f6', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  cursor: 'not-allowed',
                  color: '#6b7280'
                }} disabled>
                  Configure (Soon)
                </button>
              </div>
            </div>
          </div>

          {/* External AI Tools */}
          <div style={{ 
            padding: '25px', 
            border: '2px solid #10b981', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' 
          }}>
            <h3 style={{ color: '#047857', marginBottom: '15px' }}>🌐 External AI Services</h3>
            <p style={{ color: '#047857', fontSize: '14px', marginBottom: '20px' }}>
              Third-party AI service integrations and API management
            </p>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '20px' 
            }}>
              <div style={{ 
                padding: '20px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                border: '1px solid #6ee7b7', 
                borderRadius: '8px'
              }}>
                <h4 style={{ color: '#047857', marginBottom: '10px' }}>🧠 OpenAI Integration</h4>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>
                  Connect with GPT models for advanced content generation
                </p>
                <button style={{ 
                  width: '100%', 
                  padding: '10px', 
                  backgroundColor: '#f3f4f6', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  cursor: 'not-allowed',
                  color: '#6b7280'
                }} disabled>
                  Configure API (Soon)
                </button>
              </div>
              
              <div style={{ 
                padding: '20px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                border: '1px solid #6ee7b7', 
                borderRadius: '8px'
              }}>
                <h4 style={{ color: '#047857', marginBottom: '10px' }}>🎨 DALL-E Integration</h4>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>
                  AI image generation for visual content creation
                </p>
                <button style={{ 
                  width: '100%', 
                  padding: '10px', 
                  backgroundColor: '#f3f4f6', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  cursor: 'not-allowed',
                  color: '#6b7280'
                }} disabled>
                  Configure API (Soon)
                </button>
              </div>
              
              <div style={{ 
                padding: '20px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                border: '1px solid #6ee7b7', 
                borderRadius: '8px'
              }}>
                <h4 style={{ color: '#047857', marginBottom: '10px' }}>📈 Analytics APIs</h4>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>
                  Connect social media and web analytics platforms
                </p>
                <button style={{ 
                  width: '100%', 
                  padding: '10px', 
                  backgroundColor: '#f3f4f6', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  cursor: 'not-allowed',
                  color: '#6b7280'
                }} disabled>
                  Manage APIs (Soon)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main AdminCenter Component with Internal Navigation
function AdminCenter() {
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
      {activeTab === 'templates' && <AdminTemplates />}
      {activeTab === 'libraries' && <AdminLibraries />}
      {activeTab === 'brand' && <AdminBrand />}
    </div>
  );
}

export default AdminCenter;
