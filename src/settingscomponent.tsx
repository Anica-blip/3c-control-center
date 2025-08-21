import React, { useState } from 'react';

function SettingsComponent() {
  const [activeTab, setActiveTab] = useState('platforms');
  
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
    image: null // Changed to null for file handling
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
        // Calculate new dimensions to fit within 200x200 while maintaining aspect ratio
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
        
        // Draw and resize the image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64
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
      image: newCharacter.image, // Keep the base64 image data
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
    <div style={{ padding: '20px' }}>
      <h2>⚙️ Settings</h2>
      <p>Configure social platforms, Telegram channels, and character profiles</p>
      
      {/* Settings Sub-Navigation - 3 TABS ONLY */}
      <div style={{ 
        display: 'flex', 
        gap: '0', 
        marginTop: '30px', 
        marginBottom: '30px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <button
          onClick={() => setActiveTab('platforms')}
          style={{
            padding: '12px 20px',
            backgroundColor: activeTab === 'platforms' ? '#f3f4f6' : 'transparent',
            color: activeTab === 'platforms' ? '#1f2937' : '#6b7280',
            border: 'none',
            borderBottom: activeTab === 'platforms' ? '2px solid #3b82f6' : '2px solid transparent',
            fontWeight: activeTab === 'platforms' ? 'bold' : 'normal',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          📱 Social Platforms
        </button>
        <button
          onClick={() => setActiveTab('characters')}
          style={{
            padding: '12px 20px',
            backgroundColor: activeTab === 'characters' ? '#f3f4f6' : 'transparent',
            color: activeTab === 'characters' ? '#1f2937' : '#6b7280',
            border: 'none',
            borderBottom: activeTab === 'characters' ? '2px solid #3b82f6' : '2px solid transparent',
            fontWeight: activeTab === 'characters' ? 'bold' : 'normal',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          👥 Character Profiles
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          style={{
            padding: '12px 20px',
            backgroundColor: activeTab === 'logs' ? '#f3f4f6' : 'transparent',
            color: activeTab === 'logs' ? '#1f2937' : '#6b7280',
            border: 'none',
            borderBottom: activeTab === 'logs' ? '2px solid #3b82f6' : '2px solid transparent',
            fontWeight: activeTab === 'logs' ? 'bold' : 'normal',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          📋 Error Logs
        </button>
      </div>

      {/* 1. SOCIAL PLATFORMS TAB (includes both Social Media + Telegram) */}
      {activeTab === 'platforms' && (
        <div style={{ display: 'grid', gap: '30px' }}>
          
          {/* SOCIAL MEDIA PLATFORMS SECTION */}
          <div style={{
            padding: '25px',
            border: '2px solid #3b82f6',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
          }}>
            <h3 style={{ color: '#1e40af', marginBottom: '20px' }}>📱 Social Media Platforms</h3>
            
            {/* Add New Platform Form */}
            <div style={{ 
              padding: '20px', 
              backgroundColor: 'rgba(255,255,255,0.8)', 
              borderRadius: '8px', 
              marginBottom: '25px' 
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#1e40af' }}>➕ Create New Platform</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '15px', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1e40af' }}>
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
                      border: '1px solid #93c5fd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1e40af' }}>
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
                      border: '1px solid #93c5fd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <button
                  onClick={addPlatform}
                  disabled={!newPlatform.name.trim() || !newPlatform.url.trim()}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: newPlatform.name.trim() && newPlatform.url.trim() ? '#3b82f6' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: newPlatform.name.trim() && newPlatform.url.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  💾 Save
                </button>
              </div>
            </div>

            {/* Platforms List */}
            <div>
              <h4 style={{ margin: '0 0 15px 0', color: '#1e40af' }}>📋 Your Platforms ({platforms.length})</h4>
              {platforms.length === 0 ? (
                <div style={{ 
                  padding: '40px', 
                  textAlign: 'center', 
                  backgroundColor: 'rgba(255,255,255,0.5)', 
                  borderRadius: '8px',
                  border: '2px dashed #93c5fd'
                }}>
                  <p style={{ color: '#6b7280', fontSize: '16px' }}>No platforms added yet</p>
                  <p style={{ color: '#9ca3af', fontSize: '14px' }}>Use the form above to add your first social media platform</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '10px' }}>
                  {platforms.map(platform => (
                    <div key={platform.id} style={{
                      padding: '15px',
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      borderRadius: '8px',
                      border: '1px solid #93c5fd',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      {editingPlatform && editingPlatform.id === platform.id ? (
                        <div style={{ display: 'flex', gap: '15px', flex: '1', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={editingPlatform.name}
                            onChange={(e) => setEditingPlatform(prev => ({ ...prev, name: e.target.value }))}
                            style={{
                              padding: '8px',
                              border: '1px solid #93c5fd',
                              borderRadius: '4px',
                              fontSize: '14px',
                              width: '150px'
                            }}
                          />
                          <input
                            type="url"
                            value={editingPlatform.url}
                            onChange={(e) => setEditingPlatform(prev => ({ ...prev, url: e.target.value }))}
                            style={{
                              padding: '8px',
                              border: '1px solid #93c5fd',
                              borderRadius: '4px',
                              fontSize: '14px',
                              flex: '1'
                            }}
                          />
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={savePlatformEdit}
                              style={{
                                padding: '8px 12px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              💾 Save
                            </button>
                            <button
                              onClick={() => setEditingPlatform(null)}
                              style={{
                                padding: '8px 12px',
                                backgroundColor: '#6b7280',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              ❌ Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <div style={{ fontWeight: 'bold', color: '#1e40af', marginBottom: '4px' }}>
                              {platform.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              {platform.url}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => setEditingPlatform(platform)}
                              style={{
                                padding: '8px 12px',
                                backgroundColor: '#f59e0b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => deletePlatform(platform.id)}
                              style={{
                                padding: '8px 12px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
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

          {/* TELEGRAM SECTION (within Social Platforms tab) */}
          <div style={{
            padding: '25px',
            border: '2px solid #0891b2',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)'
          }}>
            <h3 style={{ color: '#0e7490', marginBottom: '20px' }}>📡 Telegram Channels & Groups</h3>
            
            {/* Add New Telegram Form */}
            <div style={{ 
              padding: '20px', 
              backgroundColor: 'rgba(255,255,255,0.8)', 
              borderRadius: '8px', 
              marginBottom: '25px' 
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#0e7490' }}>➕ Add Telegram Channel/Group</h4>
              <div style={{ display: 'grid', gap: '15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#0e7490' }}>
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
                        border: '1px solid #67e8f9',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#0e7490' }}>
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
                        border: '1px solid #67e8f9',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#0e7490' }}>
                      Type
                    </label>
                    <select
                      value={newTelegram.type}
                      onChange={(e) => setNewTelegram(prev => ({ ...prev, type: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #67e8f9',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="channel">Channel</option>
                      <option value="group">Group</option>
                    </select>
                  </div>
                </div>
                
                {newTelegram.type === 'group' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#0e7490' }}>
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
                        border: '1px solid #67e8f9',
                        borderRadius: '6px',
                        fontSize: '14px'
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
                      backgroundColor: newTelegram.name.trim() && newTelegram.channel_group_id.trim() ? '#0891b2' : '#9ca3af',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: newTelegram.name.trim() && newTelegram.channel_group_id.trim() ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    💾 Save
                  </button>
                </div>
              </div>
            </div>

            {/* Telegram List */}
            <div>
              <h4 style={{ margin: '0 0 15px 0', color: '#0e7490' }}>📋 Your Telegram Channels/Groups ({telegramChannels.length})</h4>
              {telegramChannels.length === 0 ? (
                <div style={{ 
                  padding: '40px', 
                  textAlign: 'center', 
                  backgroundColor: 'rgba(255,255,255,0.5)', 
                  borderRadius: '8px',
                  border: '2px dashed #67e8f9'
                }}>
                  <p style={{ color: '#6b7280', fontSize: '16px' }}>No Telegram channels/groups added yet</p>
                  <p style={{ color: '#9ca3af', fontSize: '14px' }}>Use the form above to add your first Telegram destination</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '10px' }}>
                  {telegramChannels.map(telegram => (
                    <div key={telegram.id} style={{
                      padding: '15px',
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      borderRadius: '8px',
                      border: '1px solid #67e8f9',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      {editingTelegram && editingTelegram.id === telegram.id ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', flex: '1', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={editingTelegram.name}
                            onChange={(e) => setEditingTelegram(prev => ({ ...prev, name: e.target.value }))}
                            style={{
                              padding: '8px',
                              border: '1px solid #67e8f9',
                              borderRadius: '4px',
                              fontSize: '14px'
                            }}
                          />
                          <input
                            type="text"
                            value={editingTelegram.channel_group_id}
                            onChange={(e) => setEditingTelegram(prev => ({ ...prev, channel_group_id: e.target.value }))}
                            style={{
                              padding: '8px',
                              border: '1px solid #67e8f9',
                              borderRadius: '4px',
                              fontSize: '14px'
                            }}
                          />
                          <input
                            type="text"
                            value={editingTelegram.thread_id || ''}
                            onChange={(e) => setEditingTelegram(prev => ({ ...prev, thread_id: e.target.value }))}
                            placeholder="Thread ID (optional)"
                            style={{
                              padding: '8px',
                              border: '1px solid #67e8f9',
                              borderRadius: '4px',
                              fontSize: '14px'
                            }}
                          />
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={saveTelegramEdit}
                              style={{
                                padding: '8px 12px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              💾 Save
                            </button>
                            <button
                              onClick={() => setEditingTelegram(null)}
                              style={{
                                padding: '8px 12px',
                                backgroundColor: '#6b7280',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              ❌ Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <div style={{ fontWeight: 'bold', color: '#0e7490', marginBottom: '4px' }}>
                              {telegram.name} ({telegram.type})
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
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
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => deleteTelegram(telegram.id)}
                              style={{
                                padding: '8px 12px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
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

        </div>
      )}

      {/* 2. CHARACTER PROFILES TAB */}
      {activeTab === 'characters' && (
        <div style={{
          padding: '25px',
          border: '2px solid #7c3aed',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)'
        }}>
          <h3 style={{ color: '#7c3aed', marginBottom: '20px' }}>👥 Character Profiles</h3>
          
          {/* Add New Character Form */}
          <div style={{ 
            padding: '20px', 
            backgroundColor: 'rgba(255,255,255,0.8)', 
            borderRadius: '8px', 
            marginBottom: '25px' 
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#7c3aed' }}>➕ Add Profile</h4>
            <div style={{ display: 'grid', gap: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#7c3aed' }}>
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
                      border: '1px solid #c4b5fd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#7c3aed' }}>
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
                      border: '1px solid #c4b5fd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#7c3aed' }}>
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
                    border: '1px solid #c4b5fd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#7c3aed' }}>
                  Bio
                </label>
                <textarea
                  value={newCharacter.bio}
                  onChange={(e) => setNewCharacter(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Detailed bio and expertise description..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #c4b5fd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#7c3aed' }}>
                  Upload Profile Image
                </label>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
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
                      padding: '12px',
                      border: '1px solid #c4b5fd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      flex: '1'
                    }}
                  />
                  {newCharacter.image && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={newCharacter.image}
                        alt="Preview"
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #c4b5fd'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setNewCharacter(prev => ({ ...prev, image: null }))}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                  Upload an image from your computer. It will be automatically resized to fit 200x200 pixels.
                </p>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <button
                  onClick={addCharacter}
                  disabled={!newCharacter.name.trim() || !newCharacter.username.trim()}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: newCharacter.name.trim() && newCharacter.username.trim() ? '#7c3aed' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: newCharacter.name.trim() && newCharacter.username.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  💾 Save
                </button>
              </div>
            </div>
          </div>

          {/* Characters List */}
          <div>
            <h4 style={{ margin: '0 0 15px 0', color: '#7c3aed' }}>📋 Your Character Profiles ({characters.length})</h4>
            {characters.length === 0 ? (
              <div style={{ 
                padding: '40px', 
                textAlign: 'center', 
                backgroundColor: 'rgba(255,255,255,0.5)', 
                borderRadius: '8px',
                border: '2px dashed #c4b5fd'
              }}>
                <p style={{ color: '#6b7280', fontSize: '16px' }}>No character profiles created yet</p>
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>Use the form above to create your first character profile</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {characters.map(character => (
                  <div key={character.id} style={{
                    padding: '20px',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    borderRadius: '8px',
                    border: '1px solid #c4b5fd',
                    display: 'flex',
                    gap: '15px',
                    alignItems: 'flex-start'
                  }}>
                    {editingCharacter && editingCharacter.id === character.id ? (
                      <div style={{ flex: '1', display: 'grid', gap: '15px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                          <input
                            type="text"
                            value={editingCharacter.name}
                            onChange={(e) => setEditingCharacter(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Name"
                            style={{
                              padding: '8px',
                              border: '1px solid #c4b5fd',
                              borderRadius: '4px',
                              fontSize: '14px'
                            }}
                          />
                          <input
                            type="text"
                            value={editingCharacter.username}
                            onChange={(e) => setEditingCharacter(prev => ({ ...prev, username: e.target.value }))}
                            placeholder="Username"
                            style={{
                              padding: '8px',
                              border: '1px solid #c4b5fd',
                              borderRadius: '4px',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                        <input
                          type="text"
                          value={editingCharacter.title}
                          onChange={(e) => setEditingCharacter(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Title"
                          style={{
                            padding: '8px',
                            border: '1px solid #c4b5fd',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        />
                        <textarea
                          value={editingCharacter.bio}
                          onChange={(e) => setEditingCharacter(prev => ({ ...prev, bio: e.target.value }))}
                          placeholder="Bio"
                          style={{
                            padding: '8px',
                            border: '1px solid #c4b5fd',
                            borderRadius: '4px',
                            fontSize: '14px',
                            minHeight: '60px',
                            resize: 'vertical'
                          }}
                        />
                        <div style={{ marginBottom: '15px' }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#7c3aed' }}>
                            Update Profile Image
                          </label>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  handleImageUpload(file, true);
                                }
                              }}
                              style={{
                                padding: '6px',
                                border: '1px solid #c4b5fd',
                                borderRadius: '4px',
                                fontSize: '12px',
                                flex: '1'
                              }}
                            />
                            {editingCharacter.image && (
                              <button
                                type="button"
                                onClick={() => setEditingCharacter(prev => ({ ...prev, image: null }))}
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '10px'
                                }}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={saveCharacterEdit}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            💾 Save
                          </button>
                          <button
                            onClick={() => setEditingCharacter(null)}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: '#6b7280',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            ❌ Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          backgroundColor: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '32px',
                          color: '#7c3aed',
                          fontWeight: 'bold',
                          border: '2px solid #c4b5fd',
                          backgroundImage: character.image ? `url(${character.image})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          flexShrink: 0
                        }}>
                          {!character.image && character.name.charAt(0)}
                        </div>
                        <div style={{ flex: '1' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <h4 style={{ margin: '0', color: '#7c3aed', fontSize: '16px' }}>
                              {character.name}
                            </h4>
                            <span style={{ 
                              fontSize: '14px', 
                              color: '#6b7280', 
                              fontStyle: 'italic' 
                            }}>
                              {character.username}
                            </span>
                          </div>
                          {character.title && (
                            <div style={{ 
                              fontSize: '14px', 
                              color: '#7c3aed', 
                              fontWeight: 'bold',
                              marginBottom: '8px'
                            }}>
                              {character.title}
                            </div>
                          )}
                          <p style={{ margin: '0', color: '#6b7280', fontSize: '14px', lineHeight: '1.4' }}>
                            {character.bio}
                          </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <button
                            onClick={() => setEditingCharacter(character)}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: '#f59e0b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => deleteCharacter(character.id)}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
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
      )}

      {/* 3. ERROR LOGS TAB */}
      {activeTab === 'logs' && (
        <div style={{
          padding: '25px',
          border: '2px solid #ef4444',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
        }}>
          <h3 style={{ color: '#dc2626', marginBottom: '20px' }}>📋 Error Logs</h3>
          <p style={{ color: '#dc2626', fontSize: '14px', marginBottom: '20px' }}>
            System error logs from Supabase database
          </p>
          
          {errorLogs.length === 0 ? (
            <div style={{ 
              padding: '60px', 
              textAlign: 'center', 
              backgroundColor: 'rgba(255,255,255,0.5)', 
              borderRadius: '8px',
              border: '2px dashed #fca5a5'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📋</div>
              <h4 style={{ color: '#6b7280', marginBottom: '10px', fontSize: '18px' }}>
                No Error Logs Found
              </h4>
              <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                Error logs from Supabase will appear here automatically
              </p>
              <div style={{ 
                marginTop: '20px',
                padding: '15px',
                backgroundColor: 'rgba(255,255,255,0.8)',
                borderRadius: '8px',
                textAlign: 'left'
              }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: 'bold', color: '#dc2626' }}>
                  📡 Supabase Connection Status:
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    backgroundColor: '#f59e0b', 
                    borderRadius: '50%' 
                  }}></div>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    Waiting for database connection...
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {errorLogs.map(log => (
                <div key={log.id} style={{
                  padding: '15px',
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${log.severity === 'error' ? '#ef4444' : log.severity === 'warning' ? '#f59e0b' : '#10b981'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: '1' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 'bold', color: '#dc2626' }}>{log.type}</span>
                        <span style={{
                          padding: '2px 6px',
                          backgroundColor: log.severity === 'error' ? '#ef4444' : log.severity === 'warning' ? '#f59e0b' : '#10b981',
                          color: 'white',
                          borderRadius: '8px',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}>
                          {log.severity?.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>{log.timestamp}</span>
                      </div>
                      <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>{log.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {errorLogs.length > 0 && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={() => setErrorLogs([])}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                🗑️ Clear All Logs
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SettingsComponent;
