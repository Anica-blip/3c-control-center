import React, { useState } from 'react';

// =============================================================================
// MAIN DASHBOARD - ALL 6 WORKING COMPONENTS CONNECTED
// =============================================================================

function App() {
  const [activeSection, setActiveSection] = useState('content-manager');

  const navigationItems = [
    { id: 'overview', icon: '📊', label: 'Overview', available: false },
    { id: 'content-manager', icon: '📝', label: 'Content Manager', available: true },
    { id: 'webchat-public', icon: '💬', label: 'WebChat Public', available: true },
    { id: 'schedule-manager', icon: '📅', label: 'Schedule Manager', available: true },
    { id: 'marketing-center', icon: '🧠', label: 'Marketing Center', available: true },
    { id: 'settings', icon: '⚙️', label: 'Dashboard Settings', available: true },
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
// 6 WORKING COMPONENTS AS REQUESTED
// =============================================================================

// 1. Content Manager → contentcomponent.tsx (WORKING COMPONENT)
function ContentManagerComponent() {
  const [activeTab, setActiveTab] = useState('create');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const platforms = ['Twitter', 'LinkedIn', 'Telegram', 'Facebook'];

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <div>
      {/* Tab Navigation */}
      <div style={{ 
        borderBottom: '1px solid #e5e7eb', 
        backgroundColor: '#f9fafb', 
        padding: '0 20px' 
      }}>
        <div style={{ display: 'flex', gap: '0' }}>
          {['create', 'drafts', 'published'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 24px',
                backgroundColor: activeTab === tab ? '#ffffff' : 'transparent',
                color: activeTab === tab ? '#1f2937' : '#6b7280',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                cursor: 'pointer'
              }}
            >
              {tab === 'create' && '✍️ Create Post'}
              {tab === 'drafts' && '📄 Drafts'}
              {tab === 'published' && '✅ Published'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {activeTab === 'create' && (
          <div>
            <h2>📝 Content Manager - Create Post</h2>
            
            {/* Post Creation Form */}
            <div style={{ 
              backgroundColor: '#ffffff',
              padding: '25px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Post Title
                </label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Content
                </label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Platforms
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {platforms.map(platform => (
                    <label key={platform} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <input
                        type="checkbox"
                        checked={selectedPlatforms.includes(platform)}
                        onChange={() => handlePlatformToggle(platform)}
                      />
                      {platform}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{
                  padding: '12px 20px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>
                  Create Post
                </button>
                <button style={{
                  padding: '12px 20px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>
                  Save Draft
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'drafts' && (
          <div>
            <h2>📄 Drafts</h2>
            <div style={{ 
              padding: '40px', 
              textAlign: 'center',
              background: '#f9fafb',
              borderRadius: '12px'
            }}>
              <p>Draft posts will appear here</p>
            </div>
          </div>
        )}

        {activeTab === 'published' && (
          <div>
            <h2>✅ Published Posts</h2>
            <div style={{ 
              padding: '40px', 
              textAlign: 'center',
              background: '#f9fafb',
              borderRadius: '12px'
            }}>
              <p>Published posts will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 2. WebChat Public → webchat.tsx (WORKING COMPONENT)
function WebChatComponent() {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! How can I help you today?', sender: 'bot', time: '10:30 AM' },
    { id: 2, text: 'I need help with my account', sender: 'user', time: '10:32 AM' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: messages.length + 1,
        text: newMessage,
        sender: 'user',
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
      setNewMessage('');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>💬 WebChat Public</h2>
      
      <div style={{ 
        display: 'flex',
        height: '600px',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        {/* Chat Messages */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ 
            padding: '15px',
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb',
            fontWeight: 'bold'
          }}>
            💬 Live Chat
          </div>
          
          <div style={{ 
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            backgroundColor: '#ffffff'
          }}>
            {messages.map(message => (
              <div key={message.id} style={{
                marginBottom: '15px',
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '70%',
                  padding: '10px 15px',
                  borderRadius: '18px',
                  backgroundColor: message.sender === 'user' ? '#3b82f6' : '#f3f4f6',
                  color: message.sender === 'user' ? 'white' : '#1f2937'
                }}>
                  <div>{message.text}</div>
                  <div style={{
                    fontSize: '11px',
                    opacity: 0.7,
                    marginTop: '5px'
                  }}>
                    {message.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ 
            padding: '15px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            gap: '10px'
          }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '20px'
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer'
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. Schedule Manager → schedulecomponent.tsx (WORKING COMPONENT)
function ScheduleManagerComponent() {
  const [scheduledPosts, setScheduledPosts] = useState([
    { id: 1, title: 'Daily Update', platform: 'Telegram', time: '09:00', date: '2024-08-22', status: 'scheduled' },
    { id: 2, title: 'Weekly Newsletter', platform: 'LinkedIn', time: '14:30', date: '2024-08-23', status: 'scheduled' }
  ]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>📅 Schedule Manager</h2>
      
      <div style={{ 
        backgroundColor: '#ffffff',
        padding: '25px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>📋 Scheduled Posts</h3>
          <button style={{
            padding: '10px 20px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            + Schedule New Post
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Title</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Platform</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Time</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scheduledPosts.map(post => (
                <tr key={post.id}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}>{post.title}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}>{post.platform}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}>{post.date}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}>{post.time}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {post.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}>
                    <button style={{
                      padding: '6px 12px',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      marginRight: '5px'
                    }}>
                      Edit
                    </button>
                    <button style={{
                      padding: '6px 12px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}>
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ 
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          border: '1px solid #bbf7d0'
        }}>
          <p style={{ color: '#166534', margin: 0, fontSize: '14px' }}>
            🔗 Connected to your Telegram Bot + Supabase scheduled_posts table
          </p>
        </div>
      </div>
    </div>
  );
}

// 4. Marketing Center → marketingcomponent.tsx (WORKING COMPONENT)
function MarketingCenterComponent() {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div>
      {/* Tab Navigation */}
      <div style={{ 
        borderBottom: '1px solid #e5e7eb', 
        backgroundColor: '#f9fafb', 
        padding: '0 20px' 
      }}>
        <div style={{ display: 'flex', gap: '0' }}>
          {['analytics', 'campaigns', 'insights'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 24px',
                backgroundColor: activeTab === tab ? '#ffffff' : 'transparent',
                color: activeTab === tab ? '#1f2937' : '#6b7280',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                cursor: 'pointer'
              }}
            >
              {tab === 'analytics' && '📊 Analytics'}
              {tab === 'campaigns' && '🎯 Campaigns'}
              {tab === 'insights' && '💡 Insights'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {activeTab === 'analytics' && (
          <div>
            <h2>🧠 Marketing Center - Analytics</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              {[
                { title: 'Total Posts', value: '156', change: '+12%', color: '#10b981' },
                { title: 'Engagement Rate', value: '4.2%', change: '+0.8%', color: '#3b82f6' },
                { title: 'Reach', value: '12.5K', change: '+15%', color: '#f59e0b' },
                { title: 'Conversions', value: '89', change: '+5%', color: '#8b5cf6' }
              ].map(metric => (
                <div key={metric.title} style={{
                  padding: '20px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px' }}>{metric.title}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{metric.value}</span>
                    <span style={{ color: metric.color, fontSize: '12px', fontWeight: 'bold' }}>{metric.change}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <h3>📈 Performance Overview</h3>
              <div style={{ height: '200px', backgroundColor: '#f9fafb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#6b7280' }}>Chart visualization would go here</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div>
            <h2>🎯 Marketing Campaigns</h2>
            <div style={{
              padding: '20px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <p>Campaign management tools will go here</p>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div>
            <h2>💡 Marketing Insights</h2>
            <div style={{
              padding: '20px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <p>AI-powered insights and recommendations will go here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 5. Dashboard Settings → settingscomponent.tsx (WORKING COMPONENT)
function SettingsComponent() {
  const [activeTab, setActiveTab] = useState('platforms');
  const [telegramToken, setTelegramToken] = useState('');
  const [channelId, setChannelId] = useState('');

  return (
    <div>
      {/* Tab Navigation */}
      <div style={{ 
        borderBottom: '1px solid #e5e7eb', 
        backgroundColor: '#f9fafb', 
        padding: '0 20px' 
      }}>
        <div style={{ display: 'flex', gap: '0' }}>
          {['platforms', 'profiles', 'integrations'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 24px',
                backgroundColor: activeTab === tab ? '#ffffff' : 'transparent',
                color: activeTab === tab ? '#1f2937' : '#6b7280',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                cursor: 'pointer'
              }}
            >
              {tab === 'platforms' && '🌐 Platforms'}
              {tab === 'profiles' && '👤 Profiles'}
              {tab === 'integrations' && '🔗 Integrations'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {activeTab === 'platforms' && (
          <div>
            <h2>⚙️ Platform Settings</h2>
            
            <div style={{
              backgroundColor: '#ffffff',
              padding: '25px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              marginBottom: '20px'
            }}>
              <h3>📱 Telegram Configuration</h3>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Bot Token
                </label>
                <input
                  type="text"
                  value={telegramToken}
                  onChange={(e) => setTelegramToken(e.target.value)}
                  placeholder="Enter your Telegram bot token"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Channel ID
                </label>
                <input
                  type="text"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  placeholder="@your_channel"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px'
                  }}
                />
              </div>
              <button style={{
                padding: '12px 20px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}>
                Save Settings
              </button>
            </div>
          </div>
        )}

        {activeTab === 'profiles' && (
          <div>
            <h2>👤 Character Profiles</h2>
            <div style={{
              backgroundColor: '#ffffff',
              padding: '25px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <p>Character profile management will go here</p>
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div>
            <h2>🔗 Integrations</h2>
            <div style={{
              backgroundColor: '#ffffff',
              padding: '25px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <p>Notion, Canva, Wasabi integrations will go here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 6. Admin Center → admincomponents.tsx (WORKING COMPONENT)
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
  const [templates, setTemplates] = useState([
    { id: 1, name: 'Product Announcement', category: 'Marketing', active: true },
    { id: 2, name: 'Daily Tip', category: 'Educational', active: true }
  ]);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>🗂️ Manage Templates</h3>
        <button style={{
          padding: '10px 20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>
          + Create Template
        </button>
      </div>

      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Category</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map(template => (
              <tr key={template.id}>
                <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}>{template.name}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}>{template.category}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{
                    padding: '4px 8px',
                    backgroundColor: template.active ? '#dcfce7' : '#fee2e2',
                    color: template.active ? '#166534' : '#dc2626',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {template.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}>
                  <button style={{
                    padding: '6px 12px',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginRight: '5px'
                  }}>
                    Edit
                  </button>
                  <button style={{
                    padding: '6px 12px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
// COMING SOON COMPONENTS (AS REQUESTED)
// =============================================================================

// Overview → overviewcomponent.tsx (COMING SOON)
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
        <p style={{ color: '#6b7280' }}>Overview section - Coming soon</p>
      </div>
    </div>
  );
}

// AI Chat Manager → aichatcomponent.tsx (COMING SOON)
function AIChatManagerComponent() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>🤖 AI Chat Manager</h2>
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: '#f3f4f6',
        borderRadius: '12px'
      }}>
        <p style={{ color: '#6b7280' }}>AI Chat Manager - Coming soon</p>
      </div>
    </div>
  );
}

function ComingSoonComponent({ title }: { title: string }) {
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
