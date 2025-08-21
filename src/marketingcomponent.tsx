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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Marketing Control Center</h1>
        <p className="text-gray-600 mt-2">Comprehensive dashboard for persona management, content strategy, and analytics</p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'personas', label: 'Persona Manager' },
            { id: 'content', label: 'Content & Strategy' },
            { id: 'research', label: 'Research & Analytics' },
            { id: 'tools', label: 'Archive & Tools' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'personas' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Add New Persona</h2>
              <p className="text-sm text-gray-600 mt-1">Create and manage marketing personas with role-based access control</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Persona Name</label>
                  <input 
                    type="text"
                    value={newPersona.name}
                    onChange={(e) => setNewPersona({...newPersona, name: e.target.value})}
                    placeholder="Enter persona name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Role</label>
                  <select 
                    value={newPersona.userRole} 
                    onChange={(e) => setNewPersona({...newPersona, userRole: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select role</option>
                    <option value="Admin">Admin</option>
                    <option value="Editor">Editor</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  value={newPersona.description}
                  onChange={(e) => setNewPersona({...newPersona, description: e.target.value})}
                  placeholder="Describe this persona"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <textarea 
                  value={newPersona.targetAudience}
                  onChange={(e) => setNewPersona({...newPersona, targetAudience: e.target.value})}
                  placeholder="Define the target audience for this persona"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key Messages</label>
                <textarea 
                  value={newPersona.keyMessages}
                  onChange={(e) => setNewPersona({...newPersona, keyMessages: e.target.value})}
                  placeholder="Key messages and positioning"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Edited By</label>
                <input 
                  type="text"
                  value={newPersona.lastEditedBy}
                  onChange={(e) => setNewPersona({...newPersona, lastEditedBy: e.target.value})}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <button 
                onClick={addPersona} 
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                ➕ Add Persona
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Active Personas</h2>
            </div>
            <div className="p-6">
              {personas.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No personas created yet. Add your first persona above.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Audience</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Edited</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {personas.map((persona) => (
                        <tr key={persona.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{persona.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {persona.userRole}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{persona.targetAudience}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{persona.lastEditedAt}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900">
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Keyword Intelligence</h2>
                <p className="text-sm text-gray-600 mt-1">Multi-tag filtering and keyword tracking</p>
              </div>
              <div className="p-6 space-y-4">
                <input 
                  type="text"
                  placeholder="Search keywords..." 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Filter by tags</option>
                  <option value="seo">SEO</option>
                  <option value="content">Content</option>
                  <option value="social">Social Media</option>
                </select>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2">
                  ➕ Add Keywords
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Channel Mapper</h2>
                <p className="text-sm text-gray-600 mt-1">Manage channel priorities and review logs</p>
              </div>
              <div className="p-6 space-y-4">
                <input 
                  type="text"
                  placeholder="Channel name" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea 
                  placeholder="Priority change log..." 
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                  type="date"
                  placeholder="Last reviewed" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2">
                  ➕ Add Channel
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Strategy Vault</h2>
              <p className="text-sm text-gray-600 mt-1">Version-controlled content strategy with AI feedback</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content Title</label>
                  <input 
                    type="text"
                    placeholder="Enter content title" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select status</option>
                    <option value="pending">Pending</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="deployed">Deployed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">AI Suggestion Rating</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Rate AI suggestion</option>
                    <option value="useful">Useful</option>
                    <option value="neutral">Neutral</option>
                    <option value="not-useful">Not Useful</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hashtags</label>
                  <textarea 
                    placeholder="Enter hashtags" 
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <textarea 
                    placeholder="Enter tags" 
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 border border-gray-300">
                    🔮 Generate Hashtags & Tags
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 border border-gray-300">
                    📝 Insert Hashtags & Tags
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'research' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Search Trends & Intent Summary</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">247</div>
                  <div className="text-sm text-gray-600">Keywords Tracked</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">18</div>
                  <div className="text-sm text-gray-600">Trends Flagged</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">68%</div>
                  <div className="text-sm text-gray-600">Commercial Intent</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">SparkToro Research Board</h2>
              <p className="text-sm text-gray-600 mt-1">Upload and tag insights with multi-persona support</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Personas</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select personas</option>
                    <option value="persona1">Marketing Manager</option>
                    <option value="persona2">Content Creator</option>
                    <option value="persona3">Data Analyst</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Review Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select status</option>
                    <option value="new">New</option>
                    <option value="in-review">In Review</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2">
                📤 Upload Insight
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Analytics Tools</h2>
              <p className="text-sm text-gray-600 mt-1">Manage your analytics and research tools</p>
            </div>
            <div className="p-6">
              <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium mb-3">Add New Tool</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input 
                    type="text"
                    placeholder="Tool name"
                    value={newTool.name}
                    onChange={(e) => setNewTool({...newTool, name: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select 
                    value={newTool.type} 
                    onChange={(e) => setNewTool({...newTool, type: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input 
                    type="text"
                    placeholder="Access URL or method"
                    value={newTool.link}
                    onChange={(e) => setNewTool({...newTool, link: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select 
                    value={newTool.status} 
                    onChange={(e) => setNewTool({...newTool, status: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <textarea 
                  placeholder="Notes and setup instructions"
                  value={newTool.notes}
                  onChange={(e) => setNewTool({...newTool, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />
                <button 
                  onClick={addAnalyticsTool}
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  ➕ Add Tool
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tool Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analyticsTools.map((tool) => (
                      <tr key={tool.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tool.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tool.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            tool.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {tool.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {tool.link && (
                            <a href={tool.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900">
                              🔗
                            </a>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-1">
                            <button 
                              onClick={() => toggleToolStatus(tool.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {tool.status === 'Active' ? '🔛' : '🔄'}
                            </button>
                            <button 
                              onClick={() => removeTool(tool.id)}
                              className="text-red-400 hover:text-red-600"
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Anica's Intel Drop Zone</h2>
                <p className="text-sm text-gray-600 mt-1">Raw input collection with audio support</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority Level</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <textarea 
                  placeholder="Enter intel or insights..." 
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 border border-gray-300 flex items-center justify-center gap-2">
                  📤 Attach Audio File
                </button>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                  Submit Intel
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">External Tools Panel</h2>
                <p className="text-sm text-gray-600 mt-1">Import data from external sources</p>
              </div>
              <div className="p-6 space-y-4">
                <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 border border-gray-300 flex items-center justify-center gap-2">
                  📤 Import from Keyword Planner
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 border border-gray-300 flex items-center justify-center gap-2">
                  📤 Import from GSC
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 border border-gray-300 flex items-center justify-center gap-2">
                  📤 Manual CSV Upload
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Caelum Archives</h2>
              <p className="text-sm text-gray-600 mt-1">Archived items with restore functionality</p>
            </div>
            <div className="p-6 space-y-4">
              <input 
                type="text"
                placeholder="Search archived items..." 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="border rounded-lg p-4">
                <p className="text-gray-500 text-center py-8">No archived items yet.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingControlCenter;
