import React, { useState } from 'react';

const MarketingControlCenter = () => {
  const [personas, setPersonas] = useState([]);
  const [activeTab, setActiveTab] = useState('personas');
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

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none'
  };

  const buttonStyle = {
    padding: '8px 16px',
    borderRadius: '6px',
    fontWeight: '500',
    fontSize: '14px',
    cursor: 'pointer',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#3b82f6',
    color: 'white'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db'
  };

  return (
    <div style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' }}>
          📊 Marketing Control Center
        </h1>
        <p style={{ color: '#6b7280', margin: '0', fontSize: '13px' }}>
          Comprehensive dashboard for persona management, content strategy, and analytics
        </p>
      </div>

      <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '20px' }}>
        <nav style={{ display: 'flex', gap: '24px', marginBottom: '-1px' }}>
          {[
            { id: 'personas', label: 'Persona Manager' },
            { id: 'content', label: 'Content & Strategy' },
            { id: 'research', label: 'Research & Analytics' },
            { id: 'tools', label: 'Archive & Tools' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 4px',
                borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                fontWeight: '500',
                fontSize: '13px',
                color: activeTab === tab.id ? '#2563eb' : '#6b7280',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.color = '#374151';
                  e.currentTarget.style.borderBottom = '2px solid #d1d5db';
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.color = '#6b7280';
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
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>Add New Persona</h2>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>Create and manage marketing personas with role-based access control</p>
            </div>
            <div style={{ padding: '16px', display: 'grid', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Persona Name</label>
                  <input 
                    type="text"
                    value={newPersona.name}
                    onChange={(e) => setNewPersona({...newPersona, name: e.target.value})}
                    placeholder="Enter persona name"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>User Role</label>
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
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Description</label>
                <textarea 
                  value={newPersona.description}
                  onChange={(e) => setNewPersona({...newPersona, description: e.target.value})}
                  placeholder="Describe this persona"
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Target Audience</label>
                <textarea 
                  value={newPersona.targetAudience}
                  onChange={(e) => setNewPersona({...newPersona, targetAudience: e.target.value})}
                  placeholder="Define the target audience for this persona"
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Key Messages</label>
                <textarea 
                  value={newPersona.keyMessages}
                  onChange={(e) => setNewPersona({...newPersona, keyMessages: e.target.value})}
                  placeholder="Key messages and positioning"
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Last Edited By</label>
                <input 
                  type="text"
                  value={newPersona.lastEditedBy}
                  onChange={(e) => setNewPersona({...newPersona, lastEditedBy: e.target.value})}
                  placeholder="Enter your name"
                  style={inputStyle}
                />
              </div>
              
              <button 
                onClick={addPersona} 
                style={{ ...primaryButtonStyle, width: '100%' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
              >
                ➕ Add Persona
              </button>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0' }}>Active Personas</h2>
            </div>
            <div style={{ padding: '16px' }}>
              {personas.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '32px 0', margin: '0', fontSize: '14px' }}>
                  No personas created yet. Add your first persona above.
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                      <tr>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Audience</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Edited</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody style={{ backgroundColor: 'white' }}>
                      {personas.map((persona) => (
                        <tr key={persona.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '8px 12px', fontSize: '13px', fontWeight: '500', color: '#111827' }}>{persona.name}</td>
                          <td style={{ padding: '8px 12px' }}>
                            <span style={{
                              display: 'inline-flex',
                              padding: '2px 8px',
                              fontSize: '11px',
                              fontWeight: '600',
                              borderRadius: '12px',
                              backgroundColor: '#dbeafe',
                              color: '#1e40af'
                            }}>
                              {persona.userRole}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', fontSize: '13px', color: '#111827', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{persona.targetAudience}</td>
                          <td style={{ padding: '8px 12px', fontSize: '13px', color: '#6b7280' }}>{persona.lastEditedAt}</td>
                          <td style={{ padding: '8px 12px', fontSize: '13px', fontWeight: '500' }}>
                            <button style={{ color: '#2563eb', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
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
        </div>
      )}

      {activeTab === 'content' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>Keyword Intelligence</h2>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>Multi-tag filtering and keyword tracking</p>
              </div>
              <div style={{ padding: '16px', display: 'grid', gap: '12px' }}>
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
                  style={{ ...primaryButtonStyle, width: '100%' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                >
                  ➕ Add Keywords
                </button>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>Channel Mapper</h2>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>Manage channel priorities and review logs</p>
              </div>
              <div style={{ padding: '16px', display: 'grid', gap: '12px' }}>
                <input 
                  type="text"
                  placeholder="Channel name" 
                  style={inputStyle}
                />
                <textarea 
                  placeholder="Priority change log..." 
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
                <input 
                  type="date"
                  placeholder="Last reviewed" 
                  style={inputStyle}
                />
                <button 
                  style={{ ...primaryButtonStyle, width: '100%' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                >
                  ➕ Add Channel
                </button>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>Strategy Vault</h2>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>Version-controlled content strategy with AI feedback</p>
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Content Title</label>
                  <input 
                    type="text"
                    placeholder="Enter content title" 
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Status</label>
                  <select style={inputStyle}>
                    <option value="">Select status</option>
                    <option value="pending">Pending</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="deployed">Deployed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>AI Suggestion Rating</label>
                  <select style={inputStyle}>
                    <option value="">Rate AI suggestion</option>
                    <option value="useful">Useful</option>
                    <option value="neutral">Neutral</option>
                    <option value="not-useful">Not Useful</option>
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'grid', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Hashtags</label>
                  <textarea 
                    placeholder="Enter hashtags" 
                    rows={2}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Tags</label>
                  <textarea 
                    placeholder="Enter tags" 
                    rows={2}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    style={{ ...secondaryButtonStyle, flex: 1 }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  >
                    🔮 Generate Hashtags & Tags
                  </button>
                  <button 
                    style={{ ...secondaryButtonStyle, flex: 1 }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  >
                    📝 Insert Hashtags & Tags
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'research' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0' }}>Search Trends & Intent Summary</h2>
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb' }}>247</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Keywords Tracked</div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#16a34a' }}>18</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Trends Flagged</div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#faf5ff', borderRadius: '8px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#9333ea' }}>68%</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Commercial Intent</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>SparkToro Research Board</h2>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>Upload and tag insights with multi-persona support</p>
            </div>
            <div style={{ padding: '16px', display: 'grid', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Assign to Personas</label>
                  <select style={inputStyle}>
                    <option value="">Select personas</option>
                    <option value="persona1">Marketing Manager</option>
                    <option value="persona2">Content Creator</option>
                    <option value="persona3">Data Analyst</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Review Status</label>
                  <select style={inputStyle}>
                    <option value="">Select status</option>
                    <option value="new">New</option>
                    <option value="in-review">In Review</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <button 
                style={{ ...primaryButtonStyle, width: '100%' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
              >
                📤 Upload Insight
              </button>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>Analytics Tools</h2>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>Manage your analytics and research tools</p>
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ marginBottom: '16px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                <h4 style={{ fontWeight: '500', marginBottom: '8px', fontSize: '14px', margin: '0 0 8px 0' }}>Add New Tool</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
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
                <textarea 
                  placeholder="Notes and setup instructions"
                  value={newTool.notes}
                  onChange={(e) => setNewTool({...newTool, notes: e.target.value})}
                  rows={2}
                  style={{ ...inputStyle, marginBottom: '12px', resize: 'vertical' }}
                />
                <button 
                  onClick={addAnalyticsTool}
                  style={primaryButtonStyle}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                >
                  ➕ Add Tool
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f9fafb' }}>
                    <tr>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tool Name</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Access</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody style={{ backgroundColor: 'white' }}>
                    {analyticsTools.map((tool) => (
                      <tr key={tool.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '8px 12px', fontSize: '13px', fontWeight: '500', color: '#111827' }}>{tool.name}</td>
                        <td style={{ padding: '8px 12px', fontSize: '13px', color: '#6b7280' }}>{tool.type}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{
                            display: 'inline-flex',
                            padding: '2px 8px',
                            fontSize: '11px',
                            fontWeight: '600',
                            borderRadius: '12px',
                            backgroundColor: tool.status === 'Active' ? '#d1fae5' : '#f3f4f6',
                            color: tool.status === 'Active' ? '#065f46' : '#374151'
                          }}>
                            {tool.status}
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px', fontSize: '13px', color: '#6b7280' }}>
                          {tool.link && (
                            <a href={tool.link} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>
                              🔗
                            </a>
                          )}
                        </td>
                        <td style={{ padding: '8px 12px', fontSize: '13px', fontWeight: '500' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button 
                              onClick={() => toggleToolStatus(tool.id)}
                              style={{ color: '#6b7280', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                            >
                              {tool.status === 'Active' ? '🔀' : '🔄'}
                            </button>
                            <button 
                              onClick={() => removeTool(tool.id)}
                              style={{ color: '#ef4444', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
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
        </div>
      )}

      {activeTab === 'tools' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>Anica's Intel Drop Zone</h2>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>Raw input collection with audio support</p>
              </div>
              <div style={{ padding: '16px', display: 'grid', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Priority Level</label>
                  <select style={inputStyle}>
                    <option value="">Select priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <textarea 
                  placeholder="Enter intel or insights..." 
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
                <button 
                  style={{ ...secondaryButtonStyle, width: '100%' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                >
                  📤 Attach Audio File
                </button>
                <button 
                  style={{ ...primaryButtonStyle, width: '100%' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                >
                  Submit Intel
                </button>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>External Tools Panel</h2>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>Import data from external sources</p>
              </div>
              <div style={{ padding: '16px', display: 'grid', gap: '12px' }}>
                <button 
                  style={{ ...secondaryButtonStyle, width: '100%' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                >
                  📤 Import from Keyword Planner
                </button>
                <button 
                  style={{ ...secondaryButtonStyle, width: '100%' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                >
                  📤 Import from GSC
                </button>
                <button 
                  style={{ ...secondaryButtonStyle, width: '100%' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                >
                  📤 Manual CSV Upload
                </button>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>Caelum Archives</h2>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>Archived items with restore functionality</p>
            </div>
            <div style={{ padding: '16px', display: 'grid', gap: '12px' }}>
              <input 
                type="text"
                placeholder="Search archived items..." 
                style={inputStyle}
              />
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '32px 0', margin: '0', fontSize: '14px' }}>No archived items yet.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingControlCenter;
