import React, { useState } from 'react';

const MarketingControlCenter = () => {
  const [personas, setPersonas] = useState([]);
  const [activeTab, setActiveTab] = useState('personas');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  
  const [analyticsTools, setAnalyticsTools] = useState([
    {
      id: 1,
      name: "Matomo (Piwik)",
      type: "SEO / Web Analytics",
      status: "Active",
      accessMethod: "URL",
      link: "https://matomo.org/",
      notes: "Open-source Google Analytics alternative"
    },
    {
      id: 2,
      name: "Plausible Analytics",
      type: "SEO / Web Analytics", 
      status: "Active",
      accessMethod: "URL",
      link: "https://plausible.io/",
      notes: "Lightweight, privacy-focused analytics"
    },
    {
      id: 3,
      name: "Google Search Console",
      type: "SEO",
      status: "Active",
      accessMethod: "URL",
      link: "https://search.google.com/search-console",
      notes: "Must-have for SEO data"
    },
    {
      id: 4,
      name: "SparkToro",
      type: "Audience Research",
      status: "Active",
      accessMethod: "URL",
      link: "https://sparktoro.com/audience",
      notes: "Great for audience insights"
    },
    {
      id: 5,
      name: "YouTube Studio Analytics",
      type: "Video Analytics",
      status: "Inactive",
      accessMethod: "URL",
      link: "https://studio.youtube.com/channel/UC/analytics",
      notes: "Activate when video content grows"
    },
    {
      id: 6,
      name: "RiteTag",
      type: "Hashtag Analysis",
      status: "Inactive",
      accessMethod: "URL",
      link: "https://ritetag.com/",
      notes: "Hashtag research and tracking"
    },
    {
      id: 7,
      name: "Hashtagify",
      type: "Hashtag Analysis",
      status: "Inactive",
      accessMethod: "URL",
      link: "https://hashtagify.me/",
      notes: "Hashtag discovery and monitoring"
    }
  ]);

  const [newPersona, setNewPersona] = useState({
    name: '',
    userRole: '',
    description: '',
    targetAudience: '',
    keyMessages: '',
    lastEditedBy: '',
    lastEditedAt: new Date().toISOString().split('T')[0]
  });

  const [newTool, setNewTool] = useState({
    name: '',
    type: '',
    status: 'Active',
    accessMethod: 'URL',
    link: '',
    notes: ''
  });

  // Styles
  const containerStyle = {
    padding: '20px',
    minHeight: '100vh',
    backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
    color: isDarkMode ? '#f9fafb' : '#111827'
  };

  const tabsContainerStyle = {
    borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    borderRadius: '8px 8px 0 0',
    marginBottom: '24px',
    boxShadow: isDarkMode 
      ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
      : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  const getTabStyle = (tabId) => ({
    padding: '16px 24px',
    borderBottom: activeTab === tabId ? '2px solid #3b82f6' : '2px solid transparent',
    fontWeight: '500',
    fontSize: '14px',
    color: activeTab === tabId ? '#2563eb' : (isDarkMode ? '#d1d5db' : '#6b7280'),
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  });

  const cardStyle = {
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: isDarkMode 
      ? '0 10px 25px -3px rgba(0, 0, 0, 0.3)' 
      : '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
  };

  const sectionTitleStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: isDarkMode ? '#f9fafb' : '#111827'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
    color: isDarkMode ? '#f9fafb' : '#1f2937',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: isDarkMode ? '#f9fafb' : '#374151',
    fontSize: '14px'
  };

  const buttonStyle = {
    padding: '12px 20px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
    color: isDarkMode ? '#f9fafb' : '#374151',
    border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`
  };

  const formGridStyle = {
    display: 'grid',
    gap: '20px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
  };

  const statsCardStyle = {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: isDarkMode ? '#111827' : '#ffffff',
    borderRadius: '12px',
    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    boxShadow: isDarkMode 
      ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
      : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  const emptyStateStyle = {
    padding: '48px',
    textAlign: 'center',
    backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
    borderRadius: '12px',
    border: `2px dashed ${isDarkMode ? '#4b5563' : '#d1d5db'}`
  };

  const addPersona = () => {
    if (newPersona.name && newPersona.userRole) {
      setPersonas([...personas, {
        id: Date.now(),
        ...newPersona,
        lastEditedAt: new Date().toISOString().split('T')[0]
      }]);
      setNewPersona({
        name: '',
        userRole: '',
        description: '',
        targetAudience: '',
        keyMessages: '',
        lastEditedBy: '',
        lastEditedAt: new Date().toISOString().split('T')[0]
      });
    }
  };

  const toggleToolStatus = (id) => {
    setAnalyticsTools(analyticsTools.map(tool => 
      tool.id === id 
        ? { ...tool, status: tool.status === 'Active' ? 'Inactive' : 'Active' }
        : tool
    ));
  };

  const addAnalyticsTool = () => {
    if (newTool.name && newTool.type) {
      setAnalyticsTools([...analyticsTools, {
        id: Date.now(),
        ...newTool
      }]);
      setNewTool({
        name: '',
        type: '',
        status: 'Active',
        accessMethod: 'URL',
        link: '',
        notes: ''
      });
    }
  };

  const removeTool = (id) => {
    setAnalyticsTools(analyticsTools.filter(tool => tool.id !== id));
  };

  return (
    <div style={containerStyle}>
      <div style={tabsContainerStyle}>
        <nav style={{ display: 'flex', gap: '0', padding: '0 24px' }}>
          {[
            { id: 'personas', label: 'Persona Manager' },
            { id: 'content', label: 'Content & Strategy' },
            { id: 'research', label: 'Research & Analytics' },
            { id: 'tools', label: 'Archive & Tools' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={getTabStyle(tab.id)}
              onMouseOver={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.color = isDarkMode ? '#f3f4f6' : '#374151';
                  e.currentTarget.style.borderBottom = `2px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`;
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.color = isDarkMode ? '#d1d5db' : '#6b7280';
                  e.currentTarget.style.borderBottom = '2px solid transparent';
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'personas' && (
        <div style={{ display: 'grid', gap: '24px' }}>
          <div style={cardStyle}>
            <div style={{
              borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
              paddingBottom: '16px',
              marginBottom: '24px'
            }}>
              <h2 style={{ ...sectionTitleStyle, margin: '0 0 8px 0' }}>Add New Persona</h2>
              <p style={{ fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#6b7280', margin: '0' }}>
                Create and manage marketing personas with role-based access control
              </p>
            </div>
            
            <div style={formGridStyle}>
              <div>
                <label style={labelStyle}>Persona Name</label>
                <input 
                  type="text"
                  value={newPersona.name}
                  onChange={(e) => setNewPersona({...newPersona, name: e.target.value})}
                  placeholder="Enter persona name"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>User Role</label>
                <select 
                  value={newPersona.userRole} 
                  onChange={(e) => setNewPersona({...newPersona, userRole: e.target.value})}
                  style={inputStyle}
                >
                  <option value="">Select role</option>
                  <option value="Admin">Admin</option>
                  <option value="Editor">Editor</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <label style={labelStyle}>Description</label>
              <textarea 
                value={newPersona.description}
                onChange={(e) => setNewPersona({...newPersona, description: e.target.value})}
                placeholder="Describe this persona"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <label style={labelStyle}>Target Audience</label>
              <textarea 
                value={newPersona.targetAudience}
                onChange={(e) => setNewPersona({...newPersona, targetAudience: e.target.value})}
                placeholder="Define the target audience for this persona"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <label style={labelStyle}>Key Messages</label>
              <textarea 
                value={newPersona.keyMessages}
                onChange={(e) => setNewPersona({...newPersona, keyMessages: e.target.value})}
                placeholder="Key messages and positioning"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <label style={labelStyle}>Last Edited By</label>
              <input 
                type="text"
                value={newPersona.lastEditedBy}
                onChange={(e) => setNewPersona({...newPersona, lastEditedBy: e.target.value})}
                placeholder="Enter your name"
                style={inputStyle}
              />
            </div>
            
            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button 
                onClick={addPersona} 
                style={{
                  ...primaryButtonStyle,
                  opacity: newPersona.name && newPersona.userRole ? 1 : 0.5,
                  cursor: newPersona.name && newPersona.userRole ? 'pointer' : 'not-allowed'
                }}
                onMouseOver={(e) => {
                  if (newPersona.name && newPersona.userRole) {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseOut={(e) => {
                  if (newPersona.name && newPersona.userRole) {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                ➕ Add Persona
              </button>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{
              borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
              paddingBottom: '16px',
              marginBottom: '24px'
            }}>
              <h2 style={{ ...sectionTitleStyle, margin: '0' }}>Active Personas</h2>
            </div>
            
            {personas.length === 0 ? (
              <div style={emptyStateStyle}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                <p style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', textAlign: 'center', fontSize: '16px', margin: '0 0 8px 0' }}>
                  No personas created yet
                </p>
                <p style={{ color: isDarkMode ? '#6b7280' : '#9ca3af', textAlign: 'center', fontSize: '14px', margin: '0' }}>
                  Add your first persona above to get started
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: isDarkMode ? '#111827' : '#f9fafb' }}>
                    <tr>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'left', 
                        fontSize: '12px', 
                        fontWeight: '600', 
                        color: isDarkMode ? '#9ca3af' : '#6b7280', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.05em',
                        borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                      }}>Name</th>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'left', 
                        fontSize: '12px', 
                        fontWeight: '600', 
                        color: isDarkMode ? '#9ca3af' : '#6b7280', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.05em',
                        borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                      }}>Role</th>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'left', 
                        fontSize: '12px', 
                        fontWeight: '600', 
                        color: isDarkMode ? '#9ca3af' : '#6b7280', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.05em',
                        borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                      }}>Target Audience</th>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'left', 
                        fontSize: '12px', 
                        fontWeight: '600', 
                        color: isDarkMode ? '#9ca3af' : '#6b7280', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.05em',
                        borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                      }}>Last Edited</th>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'left', 
                        fontSize: '12px', 
                        fontWeight: '600', 
                        color: isDarkMode ? '#9ca3af' : '#6b7280', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.05em',
                        borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                      }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personas.map((persona) => (
                      <tr key={persona.id} style={{ borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}` }}>
                        <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#f9fafb' : '#111827' }}>
                          {persona.name}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            display: 'inline-flex',
                            padding: '4px 12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            borderRadius: '12px',
                            backgroundColor: '#dbeafe',
                            color: '#1e40af'
                          }}>
                            {persona.userRole}
                          </span>
                        </td>
                        <td style={{ 
                          padding: '12px 16px', 
                          fontSize: '14px', 
                          color: isDarkMode ? '#f9fafb' : '#111827', 
                          maxWidth: '200px', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap' 
                        }}>
                          {persona.targetAudience}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                          {persona.lastEditedAt}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <button style={{ 
                            color: '#3b82f6', 
                            backgroundColor: 'transparent', 
                            border: 'none', 
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}>
                            ✏️ Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div style={{ display: 'grid', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            <div style={cardStyle}>
              <div style={{
                borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                paddingBottom: '16px',
                marginBottom: '20px'
              }}>
                <h2 style={{ ...sectionTitleStyle, margin: '0 0 8px 0' }}>Keyword Intelligence</h2>
                <p style={{ fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#6b7280', margin: '0' }}>
                  Multi-tag filtering and keyword tracking
                </p>
              </div>
              <div style={{ display: 'grid', gap: '16px' }}>
                <input 
                  type="text"
                  placeholder="Search keywords..." 
                  style={inputStyle}
                />
                <select style={inputStyle}>
                  <option value="">Filter by tags</option>
                  <option value="seo">SEO</option>
                  <option value="content">Content</option>
                  <option value="social">Social Media</option>
                </select>
                <button 
                  style={primaryButtonStyle}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  ➕ Add Keywords
                </button>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{
                borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                paddingBottom: '16px',
                marginBottom: '20px'
              }}>
                <h2 style={{ ...sectionTitleStyle, margin: '0 0 8px 0' }}>Channel Mapper</h2>
                <p style={{ fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#6b7280', margin: '0' }}>
                  Manage channel priorities and review logs
                </p>
              </div>
              <div style={{ display: 'grid', gap: '16px' }}>
                <input 
                  type="text"
                  placeholder="Channel name" 
                  style={inputStyle}
                />
                <textarea 
                  placeholder="Priority change log..." 
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
                <input 
                  type="date"
                  placeholder="Last reviewed" 
                  style={inputStyle}
                />
                <button 
                  style={primaryButtonStyle}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  ➕ Add Channel
                </button>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{
              borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
              paddingBottom: '16px',
              marginBottom: '20px'
            }}>
              <h2 style={{ ...sectionTitleStyle, margin: '0 0 8px 0' }}>Strategy Vault</h2>
              <p style={{ fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#6b7280', margin: '0' }}>
                Version-controlled content strategy with AI feedback
              </p>
            </div>
            
            <div style={formGridStyle}>
              <div>
                <label style={labelStyle}>Content Title</label>
                <input 
                  type="text"
                  placeholder="Enter content title" 
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select style={inputStyle}>
                  <option value="">Select status</option>
                  <option value="pending">Pending</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="deployed">Deployed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>AI Suggestion Rating</label>
                <select style={inputStyle}>
                  <option value="">Rate AI suggestion</option>
                  <option value="useful">Useful</option>
                  <option value="neutral">Neutral</option>
                  <option value="not-useful">Not Useful</option>
                </select>
              </div>
            </div>
            
            <div style={{ marginTop: '20px', display: 'grid', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Hashtags</label>
                <textarea 
                  placeholder="Enter hashtags" 
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Tags</label>
                <textarea 
                  placeholder="Enter tags" 
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  style={{ ...secondaryButtonStyle, flex: 1 }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#4b5563' : '#e5e7eb';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
                  }}
                >
                  🔮 Generate Hashtags & Tags
                </button>
                <button 
                  style={{ ...secondaryButtonStyle, flex: 1 }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#4b5563' : '#e5e7eb';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
                  }}
                >
                  📝 Insert Hashtags & Tags
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'research' && (
        <div style={{ display: 'grid', gap: '24px' }}>
          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>Search Trends & Intent Summary</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { value: '247', label: 'Keywords Tracked', color: '#3b82f6' },
                { value: '18', label: 'Trends Flagged', color: '#10b981' },
                { value: '68%', label: 'Commercial Intent', color: '#8b5cf6' }
              ].map((stat, index) => (
                <div key={index} style={statsCardStyle}>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    color: stat.color, 
                    marginBottom: '8px' 
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: isDarkMode ? '#9ca3af' : '#6b7280' 
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{
              borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
              paddingBottom: '16px',
              marginBottom: '20px'
            }}>
              <h2 style={{ ...sectionTitleStyle, margin: '0 0 8px 0' }}>SparkToro Research Board</h2>
              <p style={{ fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#6b7280', margin: '0' }}>
                Upload and tag insights with multi-persona support
              </p>
            </div>
            <div style={formGridStyle}>
              <div>
                <label style={labelStyle}>Assign to Personas</label>
                <select style={inputStyle}>
                  <option value="">Select personas</option>
                  <option value="persona1">Marketing Manager</option>
                  <option value="persona2">Content Creator</option>
                  <option value="persona3">Data Analyst</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Review Status</label>
                <select style={inputStyle}>
                  <option value="">Select status</option>
                  <option value="new">New</option>
                  <option value="in-review">In Review</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button 
                style={primaryButtonStyle}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                📤 Upload Insight
              </button>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{
              borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
              paddingBottom: '16px',
              marginBottom: '20px'
            }}>
              <h2 style={{ ...sectionTitleStyle, margin: '0 0 8px 0' }}>Analytics Tools</h2>
              <p style={{ fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#6b7280', margin: '0' }}>
                Manage your analytics and research tools
              </p>
            </div>
            
            <div style={{ 
              marginBottom: '24px', 
              padding: '20px', 
              border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`, 
              borderRadius: '8px', 
              backgroundColor: isDarkMode ? '#111827' : '#f9fafb' 
            }}>
              <h4 style={{ fontWeight: '600', marginBottom: '16px', fontSize: '16px', margin: '0 0 16px 0' }}>
                Add New Tool
              </h4>
              <div style={formGridStyle}>
                <input 
                  type="text"
                  placeholder="Tool name"
                  value={newTool.name}
                  onChange={(e) => setNewTool({...newTool, name: e.target.value})}
                  style={inputStyle}
                />
                <select 
                  value={newTool.type} 
                  onChange={(e) => setNewTool({...newTool, type: e.target.value})}
                  style={inputStyle}
                >
                  <option value="">Select type</option>
                  <option value="SEO">SEO</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Audience Research">Audience Research</option>
                  <option value="Video Analytics">Video Analytics</option>
                  <option value="Hashtag Analysis">Hashtag Analysis</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <input 
                  type="text"
                  placeholder="Access URL or method"
                  value={newTool.link}
                  onChange={(e) => setNewTool({...newTool, link: e.target.value})}
                  style={inputStyle}
                />
                <select 
                  value={newTool.status} 
                  onChange={(e) => setNewTool({...newTool, status: e.target.value})}
                  style={inputStyle}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              
              <div style={{ marginTop: '16px' }}>
                <textarea 
                  placeholder="Notes and setup instructions"
                  value={newTool.notes}
                  onChange={(e) => setNewTool({...newTool, notes: e.target.value})}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
              
              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button 
                  onClick={addAnalyticsTool}
                  style={{
                    ...primaryButtonStyle,
                    opacity: newTool.name && newTool.type ? 1 : 0.5,
                    cursor: newTool.name && newTool.type ? 'pointer' : 'not-allowed'
                  }}
                  onMouseOver={(e) => {
                    if (newTool.name && newTool.type) {
                      e.currentTarget.style.backgroundColor = '#2563eb';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (newTool.name && newTool.type) {
                      e.currentTarget.style.backgroundColor = '#3b82f6';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  ➕ Add Tool
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: isDarkMode ? '#111827' : '#f9fafb' }}>
                  <tr>
                    {['Tool Name', 'Type', 'Status', 'Access', 'Actions'].map((header) => (
                      <th key={header} style={{ 
                        padding: '12px 16px', 
                        textAlign: 'left', 
                        fontSize: '12px', 
                        fontWeight: '600', 
                        color: isDarkMode ? '#9ca3af' : '#6b7280', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.05em',
                        borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                      }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analyticsTools.map((tool) => (
                    <tr key={tool.id} style={{ borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}` }}>
                      <td style={{ 
                        padding: '12px 16px', 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: isDarkMode ? '#f9fafb' : '#111827' 
                      }}>
                        {tool.name}
                      </td>
                      <td style={{ 
                        padding: '12px 16px', 
                        fontSize: '14px', 
                        color: isDarkMode ? '#d1d5db' : '#6b7280' 
                      }}>
                        {tool.type}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          padding: '4px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          borderRadius: '12px',
                          backgroundColor: tool.status === 'Active' ? '#d1fae5' : '#f3f4f6',
                          color: tool.status === 'Active' ? '#065f46' : '#374151'
                        }}>
                          {tool.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#6b7280' }}>
                        {tool.link && (
                          <a 
                            href={tool.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '16px' }}
                          >
                            🔗
                          </a>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => toggleToolStatus(tool.id)}
                            style={{ 
                              color: '#3b82f6', 
                              backgroundColor: 'transparent', 
                              border: 'none', 
                              cursor: 'pointer',
                              fontSize: '16px'
                            }}
                            title={tool.status === 'Active' ? 'Deactivate' : 'Activate'}
                          >
                            {tool.status === 'Active' ? '🔀' : '🔄'}
                          </button>
                          <button 
                            onClick={() => removeTool(tool.id)}
                            style={{ 
                              color: '#ef4444', 
                              backgroundColor: 'transparent', 
                              border: 'none', 
                              cursor: 'pointer',
                              fontSize: '16px'
                            }}
                            title="Delete tool"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tools' && (
        <div style={{ display: 'grid', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            <div style={cardStyle}>
              <div style={{
                borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                paddingBottom: '16px',
                marginBottom: '20px'
              }}>
                <h2 style={{ ...sectionTitleStyle, margin: '0 0 8px 0' }}>Anica's Intel Drop Zone</h2>
                <p style={{ fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#6b7280', margin: '0' }}>
                  Raw input collection with audio support
                </p>
              </div>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Priority Level</label>
                  <select style={inputStyle}>
                    <option value="">Select priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <textarea 
                  placeholder="Enter intel or insights..." 
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
                <button 
                  style={secondaryButtonStyle}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#4b5563' : '#e5e7eb';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
                  }}
                >
                  📤 Attach Audio File
                </button>
                <button 
                  style={primaryButtonStyle}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Submit Intel
                </button>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{
                borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                paddingBottom: '16px',
                marginBottom: '20px'
              }}>
                <h2 style={{ ...sectionTitleStyle, margin: '0 0 8px 0' }}>External Tools Panel</h2>
                <p style={{ fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#6b7280', margin: '0' }}>
                  Import data from external sources
                </p>
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                {[
                  '📤 Import from Keyword Planner',
                  '📤 Import from GSC',
                  '📤 Manual CSV Upload'
                ].map((label, index) => (
                  <button 
                    key={index}
                    style={secondaryButtonStyle}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#4b5563' : '#e5e7eb';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{
              borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
              paddingBottom: '16px',
              marginBottom: '20px'
            }}>
              <h2 style={{ ...sectionTitleStyle, margin: '0 0 8px 0' }}>Caelum Archives</h2>
              <p style={{ fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#6b7280', margin: '0' }}>
                Archived items with restore functionality
              </p>
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>
              <input 
                type="text"
                placeholder="Search archived items..." 
                style={inputStyle}
              />
              <div style={emptyStateStyle}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                <p style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', textAlign: 'center', fontSize: '16px', margin: '0' }}>
                  No archived items yet
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingControlCenter;
