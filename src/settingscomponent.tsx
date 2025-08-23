import React, { useState } from 'react';

function SettingsComponent() {
  const [activeTab, setActiveTab] = useState('platforms');
  
  // Check for dark mode from parent (this would normally come from props or context)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });
  
  // Social Platforms State - EMPTY to start
  const [platforms, setPlatforms] = useState([]);
  const [newPlatform, setNewPlatform] = useState({ name: '', url: '' });
  const [editingPlatform, setEditingPlatform] = useState(null);
  
  // Telegram Channels/Groups State - EMPTY to start (part of Social Platforms)
  const [telegramChannels, setTelegramChannels] = useState([]);
  const [newTelegram, setNewTelegram] = useState({ 
    name: '', 
    channel_group_id: '', 
    thread_id: '', 
    type: 'channel' 
  });
  const [editingTelegram, setEditingTelegram] = useState(null);
  
  // Character Profiles State - EMPTY to start
  const [characters, setCharacters] = useState([]);
  const [newCharacter, setNewCharacter] = useState({ 
    name: '', 
    username: '', 
    title: '', 
    bio: '', 
    image: null
  });
  const [editingCharacter, setEditingCharacter] = useState(null);
  
  // Error Logs State - Will come from Supabase
  const [errorLogs, setErrorLogs] = useState([]);

  // =============================================================================
  // SOCIAL PLATFORMS FUNCTIONS
  // =============================================================================
  
  const addPlatform = () => {
    if (!newPlatform.name.trim() || !newPlatform.url.trim()) return;
    const platform = {
      id: Date.now(),
      name: newPlatform.name.trim(),
      url: newPlatform.url.trim(),
      created_at: new Date().toISOString()
    };
    setPlatforms(prev => [...prev, platform]);
    setNewPlatform({ name: '', url: '' });
    console.log('Save to Supabase platforms table:', platform);
  };

  const savePlatformEdit = () => {
    if (!editingPlatform || !editingPlatform.name.trim() || !editingPlatform.url.trim()) return;
    setPlatforms(prev => prev.map(p => 
      p.id === editingPlatform.id ? { ...editingPlatform } : p
    ));
    setEditingPlatform(null);
    console.log('Update in Supabase platforms table:', editingPlatform);
  };

  const deletePlatform = (id) => {
    setPlatforms(prev => prev.filter(p => p.id !== id));
    console.log('Delete from Supabase platforms table, ID:', id);
  };

  // =============================================================================
  // TELEGRAM FUNCTIONS
  // =============================================================================
  
  const addTelegram = () => {
    if (!newTelegram.name.trim() || !newTelegram.channel_group_id.trim()) return;
    const telegram = {
      id: Date.now(),
      name: newTelegram.name.trim(),
      channel_group_id: newTelegram.channel_group_id.trim(),
      thread_id: newTelegram.thread_id.trim() || null,
      type: newTelegram.type,
      created_at: new Date().toISOString()
    };
    setTelegramChannels(prev => [...prev, telegram]);
    setNewTelegram({ name: '', channel_group_id: '', thread_id: '', type: 'channel' });
    console.log('Save to Supabase telegram_channels table:', telegram);
  };

  const saveTelegramEdit = () => {
    if (!editingTelegram || !editingTelegram.name.trim() || !editingTelegram.channel_group_id.trim()) return;
    setTelegramChannels(prev => prev.map(t => 
      t.id === editingTelegram.id ? { ...editingTelegram } : t
    ));
    setEditingTelegram(null);
    console.log('Update in Supabase telegram_channels table:', editingTelegram);
  };

  const deleteTelegram = (id) => {
    setTelegramChannels(prev => prev.filter(t => t.id !== id));
    console.log('Delete from Supabase telegram_channels table, ID:', id);
  };

  // =============================================================================
  // IMAGE PROCESSING FUNCTION
  // =============================================================================
  
  const resizeImage = (file, maxWidth = 200, maxHeight = 200) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        const resizedImageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(resizedImageDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (file, isEditing = false) => {
    if (file && file.type.startsWith('image/')) {
      try {
        const resizedImage = await resizeImage(file);
        
        if (isEditing) {
          setEditingCharacter(prev => ({ ...prev, image: resizedImage }));
        } else {
          setNewCharacter(prev => ({ ...prev, image: resizedImage }));
        }
      } catch (error) {
        console.error('Error processing image:', error);
        alert('Error processing image. Please try again.');
      }
    } else {
      alert('Please select a valid image file (JPG, PNG, GIF, etc.)');
    }
  };

  // =============================================================================
  // CHARACTER PROFILES FUNCTIONS
  // =============================================================================
  
  const addCharacter = () => {
    if (!newCharacter.name.trim() || !newCharacter.username.trim()) return;
    const character = {
      id: Date.now(),
      name: newCharacter.name.trim(),
      username: newCharacter.username.trim(),
      title: newCharacter.title.trim(),
      bio: newCharacter.bio.trim(),
      image: newCharacter.image,
      created_at: new Date().toISOString()
    };
    setCharacters(prev => [...prev, character]);
    setNewCharacter({ name: '', username: '', title: '', bio: '', image: null });
    console.log('Save to Supabase character_profiles table:', character);
  };

  const saveCharacterEdit = () => {
    if (!editingCharacter || !editingCharacter.name.trim() || !editingCharacter.username.trim()) return;
    setCharacters(prev => prev.map(c => 
      c.id === editingCharacter.id ? { ...editingCharacter } : c
    ));
    setEditingCharacter(null);
    console.log('Update in Supabase character_profiles table:', editingCharacter);
  };

  const deleteCharacter = (id) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
    console.log('Delete from Supabase character_profiles table, ID:', id);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
      transition: 'background-color 0.2s ease' 
    }}>
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '900', 
            color: isDarkMode ? '#ffffff' : '#111827', 
            marginBottom: '8px',
            margin: '0 0 8px 0'
          }}>
            ⚙️ Dashboard Settings
          </h1>
          <p style={{ 
            fontSize: '18px', 
            color: isDarkMode ? '#d1d5db' : '#6b7280', 
            fontWeight: '500',
            margin: '0'
          }}>
            Configure social platforms, Telegram channels, and character profiles
          </p>
        </div>
        
        {/* Settings Sub-Navigation - 3 TABS ONLY */}
        <div style={{
          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb' }}>
            {[
              { id: 'platforms', icon: '📱', label: 'Social Platforms' },
              { id: 'characters', icon: '👥', label: 'Character Profiles' },
              { id: 'logs', icon: '📋', label: 'Error Logs' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px 32px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease',
                  borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                  backgroundColor: activeTab === tab.id ? (isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)') : 'transparent',
                  color: activeTab === tab.id 
                    ? (isDarkMode ? '#ffffff' : '#111827')
                    : (isDarkMode ? '#9ca3af' : '#6b7280'),
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(75, 85, 99, 0.1)' : 'rgba(75, 85, 99, 0.1)';
                    e.currentTarget.style.color = isDarkMode ? '#ffffff' : '#111827';
                  }
                }}
                onMouseOut={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = isDarkMode ? '#9ca3af' : '#6b7280';
                  }
                }}
              >
                <span style={{ fontSize: '18px' }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: '32px' }}>
            {/* 1. SOCIAL PLATFORMS TAB (includes both Social Media + Telegram) */}
            {activeTab === 'platforms' && (
              <div style={{ display: 'grid', gap: '32px' }}>
                
                {/* SOCIAL MEDIA PLATFORMS SECTION */}
                <div style={{
                  padding: '32px',
                  border: '2px solid #3b82f6',
                  borderRadius: '12px',
                  background: isDarkMode 
                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)'
                    : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
                }}>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: isDarkMode ? '#93c5fd' : '#1e40af',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    margin: '0 0 24px 0'
                  }}>
                    <span style={{ fontSize: '28px' }}>📱</span>
                    Social Media Platforms
                  </h2>
                  
                  {/* Add New Platform Form */}
                  <div style={{
                    padding: '24px',
                    backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '8px',
                    border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                    marginBottom: '32px'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: isDarkMode ? '#93c5fd' : '#1e40af',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '0 0 16px 0'
                    }}>
                      <span>➕</span>
                      Create New Platform
                    </h3>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '24px', 
                      alignItems: 'end' 
                    }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: isDarkMode ? '#93c5fd' : '#1e40af',
                          marginBottom: '8px'
                        }}>
                          Platform Name
                        </label>
                        <input
                          type="text"
                          value={newPlatform.name}
                          onChange={(e) => setNewPlatform(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Facebook, Instagram, Twitter"
                          style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                            border: isDarkMode ? '1px solid #4b5563' : '1px solid #93c5fd',
                            borderRadius: '6px',
                            fontSize: '14px',
                            color: isDarkMode ? '#ffffff' : '#111827',
                            outline: 'none'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                          onBlur={(e) => e.target.style.borderColor = isDarkMode ? '#4b5563' : '#93c5fd'}
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: isDarkMode ? '#93c5fd' : '#1e40af',
                          marginBottom: '8px'
                        }}>
                          Platform URL/Link
                        </label>
                        <input
                          type="url"
                          value={newPlatform.url}
                          onChange={(e) => setNewPlatform(prev => ({ ...prev, url: e.target.value }))}
                          placeholder="https://facebook.com/yourpage"
                          style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                            border: isDarkMode ? '1px solid #4b5563' : '1px solid #93c5fd',
                            borderRadius: '6px',
                            fontSize: '14px',
                            color: isDarkMode ? '#ffffff' : '#111827',
                            outline: 'none'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                          onBlur={(e) => e.target.style.borderColor = isDarkMode ? '#4b5563' : '#93c5fd'}
                        />
                      </div>
                      <button
                        onClick={addPlatform}
                        disabled={!newPlatform.name.trim() || !newPlatform.url.trim()}
                        style={{
                          padding: '12px 20px',
                          backgroundColor: (newPlatform.name.trim() && newPlatform.url.trim()) ? '#3b82f6' : '#9ca3af',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          cursor: (newPlatform.name.trim() && newPlatform.url.trim()) ? 'pointer' : 'not-allowed',
                          transition: 'background-color 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                        onMouseOver={(e) => {
                          if (newPlatform.name.trim() && newPlatform.url.trim()) {
                            e.currentTarget.style.backgroundColor = '#2563eb';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (newPlatform.name.trim() && newPlatform.url.trim()) {
                            e.currentTarget.style.backgroundColor = '#3b82f6';
                          }
                        }}
                      >
                        <span>💾</span>
                        Save
                      </button>
                    </div>
                  </div>

                  {/* Platforms List */}
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: isDarkMode ? '#93c5fd' : '#1e40af',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '0 0 16px 0'
                    }}>
                      <span>📋</span>
                      Your Platforms ({platforms.length})
                    </h3>
                    {platforms.length === 0 ? (
                      <div style={{
                        padding: '48px',
                        textAlign: 'center',
                        backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.3)' : 'rgba(255, 255, 255, 0.5)',
                        borderRadius: '8px',
                        border: isDarkMode ? '2px dashed #60a5fa' : '2px dashed #93c5fd'
                      }}>
                        <p style={{ 
                          color: isDarkMode ? '#d1d5db' : '#6b7280', 
                          fontSize: '16px', 
                          marginBottom: '8px',
                          margin: '0 0 8px 0'
                        }}>No platforms added yet</p>
                        <p style={{ 
                          color: isDarkMode ? '#9ca3af' : '#9ca3af', 
                          fontSize: '14px',
                          margin: '0'
                        }}>Use the form above to add your first social media platform</p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: '12px' }}>
                        {platforms.map(platform => (
                          <div key={platform.id} style={{
                            padding: '16px',
                            backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                            borderRadius: '8px',
                            border: isDarkMode ? '1px solid #374151' : '1px solid #93c5fd',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            {editingPlatform && editingPlatform.id === platform.id ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1' }}>
                                <input
                                  type="text"
                                  value={editingPlatform.name}
                                  onChange={(e) => setEditingPlatform(prev => ({ ...prev, name: e.target.value }))}
                                  style={{
                                    padding: '8px',
                                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                                    border: isDarkMode ? '1px solid #4b5563' : '1px solid #93c5fd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    color: isDarkMode ? '#ffffff' : '#111827',
                                    width: '150px'
                                  }}
                                />
                                <input
                                  type="url"
                                  value={editingPlatform.url}
                                  onChange={(e) => setEditingPlatform(prev => ({ ...prev, url: e.target.value }))}
                                  style={{
                                    flex: '1',
                                    padding: '8px',
                                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                                    border: isDarkMode ? '1px solid #4b5563' : '1px solid #93c5fd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    color: isDarkMode ? '#ffffff' : '#111827'
                                  }}
                                />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    onClick={savePlatformEdit}
                                    style={{
                                      padding: '8px 12px',
                                      backgroundColor: '#10b981',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '12px',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    💾 Save
                                  </button>
                                  <button
                                    onClick={() => setEditingPlatform(null)}
                                    style={{
                                      padding: '8px 12px',
                                      backgroundColor: '#6b7280',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '12px',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    ❌ Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div>
                                  <div style={{
                                    fontWeight: 'bold',
                                    color: isDarkMode ? '#93c5fd' : '#1e40af',
                                    marginBottom: '4px'
                                  }}>
                                    {platform.name}
                                  </div>
                                  <div style={{
                                    fontSize: '12px',
                                    color: isDarkMode ? '#9ca3af' : '#6b7280'
                                  }}>
                                    {platform.url}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    onClick={() => setEditingPlatform(platform)}
                                    style={{
                                      padding: '8px 12px',
                                      backgroundColor: '#f59e0b',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '12px',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button
                                    onClick={() => deletePlatform(platform.id)}
                                    style={{
                                      padding: '8px 12px',
                                      backgroundColor: '#ef4444',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '12px',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* TELEGRAM SECTION */}
                <div style={{
                  padding: '32px',
                  border: '2px solid #0891b2',
                  borderRadius: '12px',
                  background: isDarkMode 
                    ? 'linear-gradient(135deg, rgba(8, 145, 178, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)'
                    : 'linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)'
                }}>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: isDarkMode ? '#67e8f9' : '#0e7490',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    margin: '0 0 24px 0'
                  }}>
                    <span style={{ fontSize: '28px' }}>📡</span>
                    Telegram Channels & Groups
                  </h2>
                  
                  {/* Add New Telegram Form */}
                  <div style={{
                    padding: '24px',
                    backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '8px',
                    border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                    marginBottom: '32px'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: isDarkMode ? '#67e8f9' : '#0e7490',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '0 0 16px 0'
                    }}>
                      <span>➕</span>
                      Add Telegram Channel/Group
                    </h3>
                    <div style={{ display: 'grid', gap: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px' }}>
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: isDarkMode ? '#67e8f9' : '#0e7490',
                            marginBottom: '8px'
                          }}>
                            Channel or Group Name
                          </label>
                          <input
                            type="text"
                            value={newTelegram.name}
                            onChange={(e) => setNewTelegram(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., group2, channel1"
                            style={{
                              width: '100%',
                              padding: '12px',
                              backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                              border: isDarkMode ? '1px solid #4b5563' : '1px solid #67e8f9',
                              borderRadius: '6px',
                              fontSize: '14px',
                              color: isDarkMode ? '#ffffff' : '#111827',
                              outline: 'none'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: isDarkMode ? '#67e8f9' : '#0e7490',
                            marginBottom: '8px'
                          }}>
                            Channel/Group ID
                          </label>
                          <input
                            type="text"
                            value={newTelegram.channel_group_id}
                            onChange={(e) => setNewTelegram(prev => ({ ...prev, channel_group_id: e.target.value }))}
                            placeholder="e.g., -1002377255109"
                            style={{
                              width: '100%',
                              padding: '12px',
                              backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                              border: isDarkMode ? '1px solid #4b5563' : '1px solid #67e8f9',
                              borderRadius: '6px',
                              fontSize: '14px',
                              color: isDarkMode ? '#ffffff' : '#111827',
                              outline: 'none'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: isDarkMode ? '#67e8f9' : '#0e7490',
                            marginBottom: '8px'
                          }}>
                            Type
                          </label>
                          <select
                            value={newTelegram.type}
                            onChange={(e) => setNewTelegram(prev => ({ ...prev, type: e.target.value }))}
                            style={{
                              width: '100%',
                              padding: '12px',
                              backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                              border: isDarkMode ? '1px solid #4b5563' : '1px solid #67e8f9',
                              borderRadius: '6px',
                              fontSize: '14px',
                              color: isDarkMode ? '#ffffff' : '#111827',
                              outline: 'none'
                            }}
                          >
                            <option value="channel">Channel</option>
                            <option value="group">Group</option>
                          </select>
                        </div>
                      </div>
                      
                      {newTelegram.type === 'group' && (
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: isDarkMode ? '#67e8f9' : '#0e7490',
                            marginBottom: '8px'
                          }}>
                            Thread ID (for groups with topics)
                          </label>
                          <input
                            type="text"
                            value={newTelegram.thread_id}
                            onChange={(e) => setNewTelegram(prev => ({ ...prev, thread_id: e.target.value }))}
                            placeholder="e.g., https://t.me/100237725510910 (optional)"
                            style={{
                              width: '100%',
                              padding: '12px',
                              backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                              border: isDarkMode ? '1px solid #4b5563' : '1px solid #67e8f9',
                              borderRadius: '6px',
                              fontSize: '14px',
                              color: isDarkMode ? '#ffffff' : '#111827',
                              outline: 'none'
                            }}
                          />
                        </div>
                      )}
                      
                      <div style={{ textAlign: 'right' }}>
                        <button
                          onClick={addTelegram}
                          disabled={!newTelegram.name.trim() || !newTelegram.channel_group_id.trim()}
                          style={{
                            padding: '12px 20px',
                            backgroundColor: (newTelegram.name.trim() && newTelegram.channel_group_id.trim()) ? '#0891b2' : '#9ca3af',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            cursor: (newTelegram.name.trim() && newTelegram.channel_group_id.trim()) ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <span>💾</span>
                          Save
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Telegram List */}
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: isDarkMode ? '#67e8f9' : '#0e7490',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '0 0 16px 0'
                    }}>
                      <span>📋</span>
                      Your Telegram Channels/Groups ({telegramChannels.length})
                    </h3>
                    {telegramChannels.length === 0 ? (
                      <div style={{
                        padding: '48px',
                        textAlign: 'center',
                        backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.3)' : 'rgba(255, 255, 255, 0.5)',
                        borderRadius: '8px',
                        border: isDarkMode ? '2px dashed #22d3ee' : '2px dashed #67e8f9'
                      }}>
                        <p style={{ 
                          color: isDarkMode ? '#d1d5db' : '#6b7280', 
                          fontSize: '16px', 
                          marginBottom: '8px',
                          margin: '0 0 8px 0'
                        }}>No Telegram channels/groups added yet</p>
                        <p style={{ 
                          color: isDarkMode ? '#9ca3af' : '#9ca3af', 
                          fontSize: '14px',
                          margin: '0'
                        }}>Use the form above to add your first Telegram destination</p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: '12px' }}>
                        {telegramChannels.map(telegram => (
                          <div key={telegram.id} style={{
                            padding: '16px',
                            backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                            borderRadius: '8px',
                            border: isDarkMode ? '1px solid #374151' : '1px solid #67e8f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <div>
                              <div style={{
                                fontWeight: 'bold',
                                color: isDarkMode ? '#67e8f9' : '#0e7490',
                                marginBottom: '4px'
                              }}>
                                {telegram.name} ({telegram.type})
                              </div>
                              <div style={{
                                fontSize: '12px',
                                color: isDarkMode ? '#9ca3af' : '#6b7280'
                              }}>
                                ID: {telegram.channel_group_id}
                                {telegram.thread_id && ` • Thread: ${telegram.thread_id}`}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => setEditingTelegram(telegram)}
                                style={{
                                  padding: '8px 12px',
                                  backgroundColor: '#f59e0b',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: 'bold'
                                }}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => deleteTelegram(telegram.id)}
                                style={{
                                  padding: '8px 12px',
                                  backgroundColor: '#ef4444',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: 'bold'
                                }}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. CHARACTER PROFILES TAB */}
            {activeTab === 'characters' && (
              <div style={{
                padding: '32px',
                border: '2px solid #8b5cf6',
                borderRadius: '12px',
                background: isDarkMode 
                  ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)'
                  : 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: isDarkMode ? '#c4b5fd' : '#7c3aed',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  margin: '0 0 24px 0'
                }}>
                  <span style={{ fontSize: '28px' }}>👥</span>
                  Character Profiles
                </h2>
                
                {/* Add New Character Form */}
                <div style={{
                  padding: '24px',
                  backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '8px',
                  border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                  marginBottom: '32px'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: isDarkMode ? '#c4b5fd' : '#7c3aed',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    margin: '0 0 16px 0'
                  }}>
                    <span>➕</span>
                    Add Profile
                  </h3>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: isDarkMode ? '#c4b5fd' : '#7c3aed',
                          marginBottom: '8px'
                        }}>
                          Name
                        </label>
                        <input
                          type="text"
                          value={newCharacter.name}
                          onChange={(e) => setNewCharacter(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Dr. Sarah Chen"
                          style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                            border: isDarkMode ? '1px solid #4b5563' : '1px solid #c4b5fd',
                            borderRadius: '6px',
                            fontSize: '14px',
                            color: isDarkMode ? '#ffffff' : '#111827',
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: isDarkMode ? '#c4b5fd' : '#7c3aed',
                          marginBottom: '8px'
                        }}>
                          Username
                        </label>
                        <input
                          type="text"
                          value={newCharacter.username}
                          onChange={(e) => setNewCharacter(prev => ({ ...prev, username: e.target.value }))}
                          placeholder="e.g., @drsarahchen"
                          style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                            border: isDarkMode ? '1px solid #4b5563' : '1px solid #c4b5fd',
                            borderRadius: '6px',
                            fontSize: '14px',
                            color: isDarkMode ? '#ffffff' : '#111827',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: isDarkMode ? '#c4b5fd' : '#7c3aed',
                        marginBottom: '8px'
                      }}>
                        Title
                      </label>
                      <input
                        type="text"
                        value={newCharacter.title}
                        onChange={(e) => setNewCharacter(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Wellness Expert & Mindfulness Coach"
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                          border: isDarkMode ? '1px solid #4b5563' : '1px solid #c4b5fd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          color: isDarkMode ? '#ffffff' : '#111827',
                          outline: 'none'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: isDarkMode ? '#c4b5fd' : '#7c3aed',
                        marginBottom: '8px'
                      }}>
                        Bio
                      </label>
                      <textarea
                        value={newCharacter.bio}
                        onChange={(e) => setNewCharacter(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Detailed bio and expertise description..."
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                          border: isDarkMode ? '1px solid #4b5563' : '1px solid #c4b5fd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          color: isDarkMode ? '#ffffff' : '#111827',
                          minHeight: '80px',
                          resize: 'vertical',
                          outline: 'none',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: isDarkMode ? '#c4b5fd' : '#7c3aed',
                        marginBottom: '8px'
                      }}>
                        Upload Profile Image
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              handleImageUpload(file, false);
                            }
                          }}
                          style={{
                            flex: '1',
                            padding: '12px',
                            backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                            border: isDarkMode ? '1px solid #4b5563' : '1px solid #c4b5fd',
                            borderRadius: '6px',
                            fontSize: '14px',
                            color: isDarkMode ? '#ffffff' : '#111827',
                            outline: 'none'
                          }}
                        />
                        {newCharacter.image && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img
                              src={newCharacter.image}
                              alt="Preview"
                              style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: isDarkMode ? '2px solid #c4b5fd' : '2px solid #c4b5fd'
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setNewCharacter(prev => ({ ...prev, image: null }))}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#ef4444',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                      <p style={{
                        marginTop: '8px',
                        fontSize: '12px',
                        color: isDarkMode ? '#9ca3af' : '#6b7280',
                        margin: '8px 0 0 0'
                      }}>
                        Upload an image from your computer. It will be automatically resized to fit 200x200 pixels.
                      </p>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <button
                        onClick={addCharacter}
                        disabled={!newCharacter.name.trim() || !newCharacter.username.trim()}
                        style={{
                          padding: '12px 20px',
                          backgroundColor: (newCharacter.name.trim() && newCharacter.username.trim()) ? '#8b5cf6' : '#9ca3af',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          cursor: (newCharacter.name.trim() && newCharacter.username.trim()) ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <span>💾</span>
                        Save
                      </button>
                    </div>
                  </div>
                </div>

                {/* Characters List */}
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: isDarkMode ? '#c4b5fd' : '#7c3aed',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    margin: '0 0 16px 0'
                  }}>
                    <span>📋</span>
                    Your Character Profiles ({characters.length})
                  </h3>
                  {characters.length === 0 ? (
                    <div style={{
                      padding: '48px',
                      textAlign: 'center',
                      backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.3)' : 'rgba(255, 255, 255, 0.5)',
                      borderRadius: '8px',
                      border: isDarkMode ? '2px dashed #a855f7' : '2px dashed #c4b5fd'
                    }}>
                      <p style={{ 
                        color: isDarkMode ? '#d1d5db' : '#6b7280', 
                        fontSize: '16px', 
                        marginBottom: '8px',
                        margin: '0 0 8px 0'
                      }}>No character profiles created yet</p>
                      <p style={{ 
                        color: isDarkMode ? '#9ca3af' : '#9ca3af', 
                        fontSize: '14px',
                        margin: '0'
                      }}>Use the form above to create your first character profile</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                      {characters.map(character => (
                        <div key={character.id} style={{
                          padding: '24px',
                          backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                          borderRadius: '8px',
                          border: isDarkMode ? '1px solid #374151' : '1px solid #c4b5fd',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '16px'
                        }}>
                          <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            color: isDarkMode ? '#c4b5fd' : '#7c3aed',
                            fontWeight: 'bold',
                            border: isDarkMode ? '2px solid #c4b5fd' : '2px solid #c4b5fd',
                            flexShrink: 0,
                            backgroundImage: character.image ? `url(${character.image})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}>
                            {!character.image && character.name.charAt(0)}
                          </div>
                          <div style={{ flex: '1' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                              <h4 style={{
                                margin: '0',
                                color: isDarkMode ? '#c4b5fd' : '#7c3aed',
                                fontSize: '18px',
                                fontWeight: 'bold'
                              }}>
                                {character.name}
                              </h4>
                              <span style={{
                                fontSize: '14px',
                                color: isDarkMode ? '#9ca3af' : '#6b7280',
                                fontStyle: 'italic'
                              }}>
                                {character.username}
                              </span>
                            </div>
                            {character.title && (
                              <div style={{
                                fontSize: '14px',
                                color: isDarkMode ? '#c4b5fd' : '#7c3aed',
                                fontWeight: 'bold',
                                marginBottom: '8px'
                              }}>
                                {character.title}
                              </div>
                            )}
                            <p style={{
                              margin: '0',
                              color: isDarkMode ? '#d1d5db' : '#6b7280',
                              fontSize: '14px',
                              lineHeight: '1.4'
                            }}>
                              {character.bio}
                            </p>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                              onClick={() => setEditingCharacter(character)}
                              style={{
                                padding: '8px 12px',
                                backgroundColor: '#f59e0b',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => deleteCharacter(character.id)}
                              style={{
                                padding: '8px 12px',
                                backgroundColor: '#ef4444',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. ERROR LOGS TAB */}
            {activeTab === 'logs' && (
              <div style={{
                padding: '32px',
                border: '2px solid #ef4444',
                borderRadius: '12px',
                background: isDarkMode 
                  ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)'
                  : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: isDarkMode ? '#fca5a5' : '#dc2626',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  margin: '0 0 24px 0'
                }}>
                  <span style={{ fontSize: '28px' }}>📋</span>
                  Error Logs
                </h2>
                <p style={{
                  color: isDarkMode ? '#fca5a5' : '#dc2626',
                  fontSize: '14px',
                  marginBottom: '24px',
                  margin: '0 0 24px 0'
                }}>
                  System error logs from Supabase database
                </p>
                
                {errorLogs.length === 0 ? (
                  <div style={{
                    padding: '64px',
                    textAlign: 'center',
                    backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.3)' : 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '8px',
                    border: isDarkMode ? '2px dashed #f87171' : '2px dashed #fca5a5'
                  }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
                    <h3 style={{
                      color: isDarkMode ? '#d1d5db' : '#6b7280',
                      marginBottom: '12px',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      margin: '0 0 12px 0'
                    }}>
                      No Error Logs Found
                    </h3>
                    <p style={{
                      color: isDarkMode ? '#9ca3af' : '#9ca3af',
                      fontSize: '14px',
                      marginBottom: '24px',
                      margin: '0 0 24px 0'
                    }}>
                      Error logs from Supabase will appear here automatically
                    </p>
                    <div style={{
                      padding: '16px',
                      backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '8px',
                      textAlign: 'left'
                    }}>
                      <p style={{
                        margin: '0 0 12px 0',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: isDarkMode ? '#fca5a5' : '#dc2626',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span>📡</span>
                        Supabase Connection Status:
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#f59e0b',
                          borderRadius: '50%'
                        }}></div>
                        <span style={{
                          fontSize: '12px',
                          color: isDarkMode ? '#9ca3af' : '#6b7280'
                        }}>
                          Waiting for database connection...
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {errorLogs.map(log => (
                      <div key={log.id} style={{
                        padding: '16px',
                        backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '8px',
                        borderLeft: `4px solid ${log.severity === 'error' ? '#ef4444' : log.severity === 'warning' ? '#f59e0b' : '#10b981'}`
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: '1' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                              <span style={{ fontWeight: 'bold', color: isDarkMode ? '#fca5a5' : '#dc2626' }}>{log.type}</span>
                              <span style={{
                                padding: '2px 8px',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                borderRadius: '8px',
                                backgroundColor: log.severity === 'error' ? '#ef4444' : log.severity === 'warning' ? '#f59e0b' : '#10b981',
                                color: '#ffffff'
                              }}>
                                {log.severity?.toUpperCase()}
                              </span>
                              <span style={{ fontSize: '12px', color: isDarkMode ? '#9ca3af' : '#9ca3af' }}>{log.timestamp}</span>
                            </div>
                            <p style={{ margin: '0', color: isDarkMode ? '#d1d5db' : '#6b7280', fontSize: '14px' }}>{log.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {errorLogs.length > 0 && (
                  <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <button
                      onClick={() => setErrorLogs([])}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#dc2626',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        margin: '0 auto'
                      }}
                    >
                      <span>🗑️</span>
                      Clear All Logs
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsComponent;
