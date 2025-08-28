import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with debugging
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Debug environment variables
console.log('Environment check:', {
  url: !!supabaseUrl,
  key: !!supabaseKey,
  urlValue: supabaseUrl ? 'set' : 'missing',
  keyValue: supabaseKey ? 'set' : 'missing',
  allEnvVars: Object.keys(import.meta.env).filter(key => key.includes('SUPABASE'))
});

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase client created successfully');
} else {
  console.error('Missing Supabase environment variables');
}

function SettingsComponent() {
  const [activeTab, setActiveTab] = useState('platforms');
  
  // Check for dark mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });
  
  // Social Platforms State
  const [platforms, setPlatforms] = useState([]);
  const [newPlatform, setNewPlatform] = useState({ name: '', url: '' });
  const [editingPlatform, setEditingPlatform] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Telegram Channels/Groups State (stored in scheduled_posts for unique requirements)
  const [telegramChannels, setTelegramChannels] = useState([]);
  const [newTelegram, setNewTelegram] = useState({ 
    name: '', 
    channel_group: '', 
    thread_id: '', 
    type: 'channel' 
  });
  const [editingTelegram, setEditingTelegram] = useState(null);
  
  // Character Profiles State - EMPTY for now (will handle in next step)
  const [characters, setCharacters] = useState([]);
  const [newCharacter, setNewCharacter] = useState({ 
    name: '', 
    username: '', 
    role: '', 
    description: '', 
    avatar_url: null
  });
  const [editingCharacter, setEditingCharacter] = useState(null);
  
  // Error Logs State
  const [errorLogs, setErrorLogs] = useState([]);

  // =============================================================================
  // LOAD DATA ON COMPONENT MOUNT
  // =============================================================================
  
  useEffect(() => {
    loadPlatforms();
    loadTelegramChannels();
  }, []);

  const loadPlatforms = async () => {
    if (!supabase) {
      console.warn('Supabase not configured. Using mock data.');
      // For testing without Supabase - remove this when env vars are set
      setPlatforms([
        { id: 1, name: 'Facebook', url: 'https://facebook.com', is_active: true, created_at: new Date().toISOString() },
        { id: 2, name: 'Instagram', url: 'https://instagram.com', is_active: true, created_at: new Date().toISOString() }
      ]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('social_platforms')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPlatforms(data || []);
    } catch (error) {
      console.error('Error loading platforms:', error);
      alert('Error loading platforms. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const loadTelegramChannels = async () => {
    if (!supabase) {
      console.warn('Supabase not configured. Using empty Telegram list.');
      return;
    }

    try {
      // Load Telegram configs from scheduled_posts where we store channel_group and thread_id
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('id, channel_group, thread_id, created_at')
        .not('channel_group', 'is', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match our state structure
      const telegramData = (data || []).map(item => ({
        id: item.id,
        name: item.channel_group || 'Unnamed',
        channel_group: item.channel_group,
        thread_id: item.thread_id,
        type: item.thread_id ? 'group' : 'channel',
        created_at: item.created_at
      }));
      
      setTelegramChannels(telegramData);
    } catch (error) {
      console.error('Error loading Telegram channels:', error);
    }
  };

  // =============================================================================
  // SOCIAL PLATFORMS FUNCTIONS
  // =============================================================================
  
  const addPlatform = async () => {
    if (!newPlatform.name.trim() || !newPlatform.url.trim()) return;
    
    if (!supabase) {
      alert('Supabase not configured. Please set up environment variables.');
      return;
    }
    
    try {
      setLoading(true);
      const platformData = {
        name: newPlatform.name.trim(),
        url: newPlatform.url.trim(),
        is_active: true,
        user_id: null // Will add user context later
      };
      
      const { data, error } = await supabase
        .from('social_platforms')
        .insert([platformData])
        .select()
        .single();
      
      if (error) throw error;
      
      setPlatforms(prev => [data, ...prev]);
      setNewPlatform({ name: '', url: '' });
      alert('Platform added successfully!');
    } catch (error) {
      console.error('Error adding platform:', error);
      alert('Error adding platform. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const savePlatformEdit = async () => {
    if (!editingPlatform || !editingPlatform.name.trim() || !editingPlatform.url.trim()) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('social_platforms')
        .update({
          name: editingPlatform.name.trim(),
          url: editingPlatform.url.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', editingPlatform.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setPlatforms(prev => prev.map(p => 
        p.id === editingPlatform.id ? data : p
      ));
      setEditingPlatform(null);
      alert('Platform updated successfully!');
    } catch (error) {
      console.error('Error updating platform:', error);
      alert('Error updating platform. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deletePlatform = async (id) => {
    if (!window.confirm('Are you sure you want to delete this platform?')) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('social_platforms')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
      
      setPlatforms(prev => prev.filter(p => p.id !== id));
      alert('Platform deleted successfully!');
    } catch (error) {
      console.error('Error deleting platform:', error);
      alert('Error deleting platform. Please try again.');
    } finally {
      setLoading(false);
    }
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
  
  const addTelegram = async () => {
    if (!newTelegram.name.trim() || !newTelegram.channel_group.trim()) return;
    
    try {
      setLoading(true);
      const telegramData = {
        channel_group: newTelegram.channel_group.trim(),
        thread_id: newTelegram.thread_id.trim() || null,
        status: 'draft', // Required field for scheduled_posts
        post_description: `Telegram ${newTelegram.type}: ${newTelegram.name.trim()}`,
        scheduled_time: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert([telegramData])
        .select()
        .single();
      
      if (error) throw error;
      
      const telegramEntry = {
        id: data.id,
        name: newTelegram.name.trim(),
        channel_group: data.channel_group,
        thread_id: data.thread_id,
        type: newTelegram.type,
        created_at: data.created_at
      };
      
      setTelegramChannels(prev => [telegramEntry, ...prev]);
      setNewTelegram({ name: '', channel_group: '', thread_id: '', type: 'channel' });
      alert('Telegram channel/group added successfully!');
    } catch (error) {
      console.error('Error adding Telegram channel:', error);
      alert('Error adding Telegram channel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveTelegramEdit = async () => {
    if (!editingTelegram || !editingTelegram.name.trim() || !editingTelegram.channel_group.trim()) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scheduled_posts')
        .update({
          channel_group: editingTelegram.channel_group.trim(),
          thread_id: editingTelegram.thread_id.trim() || null,
          post_description: `Telegram ${editingTelegram.type}: ${editingTelegram.name.trim()}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingTelegram.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setTelegramChannels(prev => prev.map(t => 
        t.id === editingTelegram.id ? {
          ...t,
          name: editingTelegram.name.trim(),
          channel_group: data.channel_group,
          thread_id: data.thread_id
        } : t
      ));
      setEditingTelegram(null);
      alert('Telegram channel/group updated successfully!');
    } catch (error) {
      console.error('Error updating Telegram channel:', error);
      alert('Error updating Telegram channel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteTelegram = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Telegram channel/group?')) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setTelegramChannels(prev => prev.filter(t => t.id !== id));
      alert('Telegram channel/group deleted successfully!');
    } catch (error) {
      console.error('Error deleting Telegram channel:', error);
      alert('Error deleting Telegram channel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
      transition: 'background-color 0.2s ease' 
    }}>
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        
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
              >
                <span style={{ fontSize: '18px' }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: '32px' }}>
            {/* 1. SOCIAL PLATFORMS TAB */}
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
                      gridTemplateColumns: '1fr 1fr auto', 
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
                          disabled={loading}
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
                          disabled={loading}
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
                        />
                      </div>
                      <button
                        onClick={addPlatform}
                        disabled={loading || !newPlatform.name.trim() || !newPlatform.url.trim()}
                        style={{
                          padding: '12px 20px',
                          backgroundColor: (newPlatform.name.trim() && newPlatform.url.trim() && !loading) ? '#3b82f6' : '#9ca3af',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          cursor: (newPlatform.name.trim() && newPlatform.url.trim() && !loading) ? 'pointer' : 'not-allowed',
                          transition: 'background-color 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          minWidth: '100px'
                        }}
                      >
                        {loading ? '⏳' : '💾'}
                        {loading ? 'Saving...' : 'Save'}
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
                                  disabled={loading}
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
                                  disabled={loading}
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
                                    disabled={loading}
                                    style={{
                                      padding: '8px 12px',
                                      backgroundColor: loading ? '#9ca3af' : '#10b981',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: loading ? 'not-allowed' : 'pointer',
                                      fontSize: '12px',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    💾 {loading ? 'Saving...' : 'Save'}
                                  </button>
                                  <button
                                    onClick={() => setEditingPlatform(null)}
                                    disabled={loading}
                                    style={{
                                      padding: '8px 12px',
                                      backgroundColor: '#6b7280',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: loading ? 'not-allowed' : 'pointer',
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
                                    disabled={loading}
                                    style={{
                                      padding: '8px 12px',
                                      backgroundColor: loading ? '#9ca3af' : '#f59e0b',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: loading ? 'not-allowed' : 'pointer',
                                      fontSize: '12px',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button
                                    onClick={() => deletePlatform(platform.id)}
                                    disabled={loading}
                                    style={{
                                      padding: '8px 12px',
                                      backgroundColor: loading ? '#9ca3af' : '#ef4444',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: loading ? 'not-allowed' : 'pointer',
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

                {/* TELEGRAM SECTION - FIXED STYLING */}
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
                  
                  {/* Add New Telegram Form - FIXED STYLING */}
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
                    
                    {/* First Row - Name and Channel ID only */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '16px',
                      marginBottom: '16px'
                    }}>
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
                          disabled={loading}
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
                          value={newTelegram.channel_group}
                          onChange={(e) => setNewTelegram(prev => ({ ...prev, channel_group: e.target.value }))}
                          placeholder="e.g., -1002377255109"
                          disabled={loading}
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
                    </div>
                    
                    {/* Second Row - Type, Thread ID (conditional), and Save Button */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: newTelegram.type === 'group' ? '120px 1fr auto' : '120px auto',
                      gap: '16px',
                      alignItems: 'end'
                    }}>
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
                          disabled={loading}
                          style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: isDarkMode ? '#334155' : '#ffffff',
                            border: isDarkMode ? '1px solid #4b5563' : '1px solid #67e8f9',
                            borderRadius: '6px',
                            fontSize: '14px',
                            color: isDarkMode ? '#ffffff' : '#111827',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="channel">Channel</option>
                          <option value="group">Group</option>
                        </select>
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
                            placeholder="e.g., 10 (optional)"
                            disabled={loading}
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
                      
                      <button
                        onClick={addTelegram}
                        disabled={loading || !newTelegram.name.trim() || !newTelegram.channel_group.trim()}
                        style={{
                          padding: '12px 20px',
                          backgroundColor: (newTelegram.name.trim() && newTelegram.channel_group.trim() && !loading) ? '#0891b2' : '#9ca3af',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          cursor: (newTelegram.name.trim() && newTelegram.channel_group.trim() && !loading) ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          minWidth: '100px'
                        }}
                      >
                        {loading ? '⏳' : '💾'}
                        {loading ? 'Saving...' : 'Save'}
                      </button>
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
                                ID: {telegram.channel_group}
                                {telegram.thread_id && ` • Thread: ${telegram.thread_id}`}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => setEditingTelegram(telegram)}
                                disabled={loading}
                                style={{
                                  padding: '8px 12px',
                                  backgroundColor: loading ? '#9ca3af' : '#f59e0b',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: loading ? 'not-allowed' : 'pointer',
                                  fontSize: '12px',
                                  fontWeight: 'bold'
                                }}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => deleteTelegram(telegram.id)}
                                disabled={loading}
                                style={{
                                  padding: '8px 12px',
                                  backgroundColor: loading ? '#9ca3af' : '#ef4444',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: loading ? 'not-allowed' : 'pointer',
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

            {/* ERROR LOGS TAB - Placeholder */}
            {activeTab === 'logs' && (
              <div style={{
                padding: '64px',
                textAlign: 'center',
                backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.3)' : 'rgba(255, 255, 255, 0.5)',
                borderRadius: '8px',
                border: isDarkMode ? '2px dashed #f87171' : '2px dashed #fca5a5'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: isDarkMode ? '#fca5a5' : '#dc2626',
                  marginBottom: '16px',
                  margin: '0 0 16px 0'
                }}>
                  Error Logs - Coming Later
                </h2>
                <p style={{ 
                  color: isDarkMode ? '#9ca3af' : '#9ca3af', 
                  fontSize: '14px',
                  margin: '0'
                }}>
                  Error logging functionality will be added once the core features are complete
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsComponent;
