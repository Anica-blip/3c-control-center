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
  
  // Telegram Channels/Groups State (stored in telegram_configurations table)
  const [telegramChannels, setTelegramChannels] = useState([]);
  const [newTelegram, setNewTelegram] = useState({ 
    name: '', 
    channel_group: '', 
    thread_id: '', 
    type: 'channel' 
  });
  const [editingTelegram, setEditingTelegram] = useState(null);
  
  // Character Profiles State
  const [characters, setCharacters] = useState([]);
  const [newCharacter, setNewCharacter] = useState({ 
    name: '', 
    username: '', 
    role: '',
    description: '',
    image: null,
    avatarUrl: null,
    selectedFile: null
  });
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // ✅ FIXED: External Services State (was missing!)
  const [externalServices, setExternalServices] = useState([]);
  const [newExternalService, setNewExternalService] = useState({ name: '', url: '' });
  const [editingExternalService, setEditingExternalService] = useState(null);

  // =============================================================================
  // LOAD DATA ON COMPONENT MOUNT
  // =============================================================================
  
  useEffect(() => {
    loadPlatforms();
    loadTelegramChannels();
    loadCharacters();
    loadExternalServices(); // ✅ FIXED: Now called!
  }, []);

const loadPlatforms = async () => {
  if (!supabase) {
    console.warn('Supabase not configured. Using mock data.');
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

const loadCharacters = async () => {
  if (!supabase) {
    console.warn('Supabase not configured. Using empty character list.');
    return;
  }

  try {
    const { data, error } = await supabase
      .from('character_profiles')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setCharacters(data || []);
  } catch (error) {
    console.error('Error loading characters:', error);
  }
};

const loadTelegramChannels = async () => {
  if (!supabase) {
    console.warn('Supabase not configured. Using empty Telegram list.');
    return;
  }

  try {
    const { data, error } = await supabase
      .from('telegram_configurations')
      .select('id, name, channel_group_id, thread_id, type, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const telegramData = (data || []).map(item => ({
      id: item.id,
      name: item.name,
      channel_group: item.channel_group_id,
      thread_id: item.thread_id,
      type: item.type,
      created_at: item.created_at
    }));
    
    setTelegramChannels(telegramData);
  } catch (error) {
    console.error('Error loading Telegram channels:', error);
  }
};

const loadExternalServices = async () => {
  if (!supabase) {
    console.warn('Supabase not configured. Using empty external services list.');
    return;
  }

  try {
    const { data, error } = await supabase
      .from('external_services')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setExternalServices(data || []);
  } catch (error) {
    console.error('Error loading external services:', error);
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
      user_id: null
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
// TELEGRAM FUNCTIONS
// =============================================================================

const addTelegram = async () => {
  if (!newTelegram.name.trim() || !newTelegram.channel_group.trim()) return;
  
  if (!supabase) {
    alert('Supabase not configured. Please set up environment variables.');
    return;
  }
  
  try {
    setLoading(true);
    const telegramData = {
      name: newTelegram.name.trim(),
      channel_group_id: newTelegram.channel_group.trim(),
      thread_id: newTelegram.thread_id.trim() || null,
      type: newTelegram.type,
      is_active: true,
      user_id: null
    };
    
    const { data, error } = await supabase
      .from('telegram_configurations')
      .insert([telegramData])
      .select()
      .single();
    
    if (error) throw error;
    
    const telegramEntry = {
      id: data.id,
      name: data.name,
      channel_group: data.channel_group_id,
      thread_id: data.thread_id,
      type: data.type,
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
  
  if (!supabase) {
    alert('Supabase not configured. Please set up environment variables.');
    return;
  }
  
  try {
    setLoading(true);
    
    const updateData = {
      name: editingTelegram.name.trim(),
      channel_group_id: editingTelegram.channel_group.trim(),
      thread_id: editingTelegram.thread_id?.trim() || null,
      type: editingTelegram.type
    };
    
    const { data, error } = await supabase
      .from('telegram_configurations')
      .update(updateData)
      .eq('id', editingTelegram.id)
      .select()
      .single();
    
    if (error) throw error;
    
    setTelegramChannels(prev => prev.map(t => 
      t.id === editingTelegram.id ? {
        ...t,
        name: data.name,
        channel_group: data.channel_group_id,
        thread_id: data.thread_id,
        type: data.type
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
  
  if (!supabase) {
    alert('Supabase not configured. Please set up environment variables.');
    return;
  }
  
  try {
    setLoading(true);
    console.log('Attempting to delete Telegram config with ID:', id);
    
    const { data: existingRecord, error: checkError } = await supabase
      .from('telegram_configurations')
      .select('id, name')
      .eq('id', id)
      .single();
    
    if (checkError) {
      console.error('Record not found or error checking:', checkError);
      setTelegramChannels(prev => prev.filter(t => t.id !== id));
      alert('Record removed from display (was not found in database)');
      return;
    }
    
    console.log('Found record to delete:', existingRecord);
    
    const { error } = await supabase
      .from('telegram_configurations')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw error;
    
    setTelegramChannels(prev => prev.filter(t => t.id !== id));
    alert('Telegram channel/group deleted successfully!');
  } catch (error) {
    console.error('Error deleting Telegram channel:', error);
    console.error('Error details:', error.message, error.details);
    
    setTelegramChannels(prev => prev.filter(t => t.id !== id));
    alert('Removed from display. Check console for details.');
  } finally {
    setLoading(false);
  }
};

// =============================================================================
// AVATAR UPLOAD FUNCTIONS
// =============================================================================

const handleFileSelection = (file, isEditing = false) => {
  if (!file || !file.type.startsWith('image/')) {
    alert('Please select a valid image file');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const imageDataUrl = e.target.result;
    if (isEditing) {
      setEditingCharacter(prev => ({ 
        ...prev, 
        image: imageDataUrl,
        selectedFile: file
      }));
    } else {
      setNewCharacter(prev => ({ 
        ...prev, 
        image: imageDataUrl,
        selectedFile: file
      }));
    }
  };
  reader.readAsDataURL(file);
};

const uploadImageToStorage = async (file, characterName) => {
  if (!file || !supabase) {
    return null;
  }

  try {
    const fileName = `${characterName.replace(/[^a-zA-Z0-9]/g, '_')}_avatar_${Date.now()}.png`;
    
    console.log('Uploading to storage with filename:', fileName);
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    console.log('Avatar uploaded successfully:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// =============================================================================
// CHARACTER PROFILES FUNCTIONS
// =============================================================================

const addCharacter = async () => {
  if (!newCharacter.name.trim() || !newCharacter.username.trim()) return;
  
  if (!supabase) {
    alert('Supabase not configured. Please set up environment variables.');
    return;
  }
  
  setLoading(true);
  
  try {
    let avatarUrl = null;
    
    if (newCharacter.selectedFile) {
      setUploadingAvatar(true);
      avatarUrl = await uploadImageToStorage(newCharacter.selectedFile, newCharacter.name);
    }
    
    const characterData = {
      name: newCharacter.name.trim(),
      username: newCharacter.username.trim(),
      role: newCharacter.role.trim() || null,
      description: newCharacter.description.trim() || null,
      avatar_id: avatarUrl,
      is_active: true,
      user_id: null
    };
    
    console.log('Saving character with data:', characterData);
    
    const { data, error } = await supabase
      .from('character_profiles')
      .insert([characterData])
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      alert(`Database error: ${error.message}`);
      return;
    }
    
    setCharacters(prev => [data, ...prev]);
    setNewCharacter({ 
      name: '', 
      username: '', 
      role: '', 
      description: '', 
      image: null, 
      avatarUrl: null,
      selectedFile: null 
    });
    alert('Character profile created successfully!');
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error creating character profile. Please try again.');
  } finally {
    setLoading(false);
    setUploadingAvatar(false);
  }
};

const saveCharacterEdit = async () => {
  if (!editingCharacter || !editingCharacter.name.trim() || !editingCharacter.username.trim()) return;
  
  if (!supabase) {
    alert('Supabase not configured. Please set up environment variables.');
    return;
  }
  
  try {
    setLoading(true);
    
    let avatarUrl = null;
    
    if (editingCharacter.selectedFile) {
      setUploadingAvatar(true);
      avatarUrl = await uploadImageToStorage(editingCharacter.selectedFile, editingCharacter.name);
    }
    
    const updateData = {
      name: editingCharacter.name.trim(),
      username: editingCharacter.username.trim(), 
      role: editingCharacter.role?.trim() || null,
      description: editingCharacter.description?.trim() || null,
      ...(avatarUrl && { avatar_id: avatarUrl })
    };
    
    console.log('Updating character with ID:', editingCharacter.id, 'Data:', updateData);
    
    const { data, error } = await supabase
      .from('character_profiles')
      .update(updateData)
      .eq('id', editingCharacter.id)
      .select()
      .single();
    
    if (error) {
      console.error('Update error:', error);
      throw error;
    }
    
    console.log('Character updated successfully:', data);
    
    setCharacters(prev => prev.map(c => 
      c.id === editingCharacter.id ? data : c
    ));
    setEditingCharacter(null);
    alert('Character profile updated successfully!');
  } catch (error) {
    console.error('Error updating character:', error);
    alert('Error updating character profile. Please try again.');
  } finally {
    setLoading(false);
    setUploadingAvatar(false);
  }
};

const deleteCharacter = async (id) => {
  if (!window.confirm('Are you sure you want to delete this character profile?')) return;
  
  if (!supabase) {
    alert('Supabase not configured. Please set up environment variables.');
    return;
  }
  
  try {
    setLoading(true);
    const { error } = await supabase
      .from('character_profiles')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw error;
    
    setCharacters(prev => prev.filter(c => c.id !== id));
    alert('Character profile deleted successfully!');
  } catch (error) {
    console.error('Error deleting character:', error);
    alert('Error deleting character profile. Please try again.');
  } finally {
    setLoading(false);
  }
};

// =============================================================================
// EXTERNAL SERVICES FUNCTIONS
// =============================================================================

const addExternalService = async () => {
  if (!newExternalService.name.trim() || !newExternalService.url.trim()) return;
  
  if (!supabase) {
    alert('Supabase not configured. Please set up environment variables.');
    return;
  }
  
  try {
    setLoading(true);
    const serviceData = {
      name: newExternalService.name.trim(),
      url: newExternalService.url.trim(),
      is_active: true,
      user_id: null
    };
    
    const { data, error } = await supabase
      .from('external_services')
      .insert([serviceData])
      .select()
      .single();
    
    if (error) throw error;
    
    setExternalServices(prev => [data, ...prev]);
    setNewExternalService({ name: '', url: '' });
    alert('External service added successfully!');
  } catch (error) {
    console.error('Error adding external service:', error);
    alert('Error adding external service. Please try again.');
  } finally {
    setLoading(false);
  }
};

const saveExternalServiceEdit = async () => {
  if (!editingExternalService || !editingExternalService.name.trim() || !editingExternalService.url.trim()) return;
  
  try {
    setLoading(true);
    const { data, error } = await supabase
      .from('external_services')
      .update({
        name: editingExternalService.name.trim(),
        url: editingExternalService.url.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', editingExternalService.id)
      .select()
      .single();
    
    if (error) throw error;
    
    setExternalServices(prev => prev.map(s => 
      s.id === editingExternalService.id ? data : s
    ));
    setEditingExternalService(null);
    alert('External service updated successfully!');
  } catch (error) {
    console.error('Error updating external service:', error);
    alert('Error updating external service. Please try again.');
  } finally {
    setLoading(false);
  }
};

const deleteExternalService = async (id) => {
  if (!window.confirm('Are you sure you want to delete this external service?')) return;
  
  try {
    setLoading(true);
    const { error } = await supabase
      .from('external_services')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw error;
    
    setExternalServices(prev => prev.filter(s => s.id !== id));
    alert('External service deleted successfully!');
  } catch (error) {
    console.error('Error deleting external service:', error);
    alert('Error deleting external service. Please try again.');
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
        
        <div style={{
          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
          marginBottom: '32px'
        }}>
          <div style={{ 
            backgroundColor: isDarkMode ? '#334155' : '#f8fafc',
            padding: '20px',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            display: 'flex', 
            gap: '12px' 
          }}>
            {[
              { id: 'platforms', icon: '📱', label: 'Social Platforms' },
              { id: 'characters', icon: '👥', label: 'Character Profiles' },
              { id: 'services', icon: '🔗', label: 'External Services' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  fontSize: '13px',
                  fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                  transition: 'all 0.2s ease',
                  borderRadius: '8px',
                  backgroundColor: activeTab === tab.id 
                    ? '#3b82f6'
                    : (isDarkMode ? '#475569' : '#e5e7eb'),
                  color: activeTab === tab.id 
                    ? 'white'
                    : (isDarkMode ? '#94a3b8' : '#6b7280'),
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <span style={{ fontSize: '16px' }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div style={{ padding: '32px' }}>
            {activeTab === 'platforms' && (
              <div style={{ display: 'grid', gap: '32px' }}>
                
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
                            {editingTelegram && editingTelegram.id === telegram.id ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1' }}>
                                <input
                                  type="text"
                                  value={editingTelegram.name}
                                  onChange={(e) => setEditingTelegram(prev => ({ ...prev, name: e.target.value }))}
                                  disabled={loading}
                                  placeholder="Name"
                                  style={{
                                    padding: '8px',
                                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                                    border: isDarkMode ? '1px solid #4b5563' : '1px solid #67e8f9',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    color: isDarkMode ? '#ffffff' : '#111827',
                                    width: '120px'
                                  }}
                                />
                                <input
                                  type="text"
                                  value={editingTelegram.channel_group}
                                  onChange={(e) => setEditingTelegram(prev => ({ ...prev, channel_group: e.target.value }))}
                                  disabled={loading}
                                  placeholder="Channel/Group ID"
                                  style={{
                                    padding: '8px',
                                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                                    border: isDarkMode ? '1px solid #4b5563' : '1px solid #67e8f9',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    color: isDarkMode ? '#ffffff' : '#111827',
                                    width: '150px'
                                  }}
                                />
                                <input
                                  type="text"
                                  value={editingTelegram.thread_id || ''}
                                  onChange={(e) => setEditingTelegram(prev => ({ ...prev, thread_id: e.target.value }))}
                                  disabled={loading}
                                  placeholder="Thread ID (optional)"
                                  style={{
                                    padding: '8px',
                                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                                    border: isDarkMode ? '1px solid #4b5563' : '1px solid #67e8f9',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    color: isDarkMode ? '#ffffff' : '#111827',
                                    width: '120px'
                                  }}
                                />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    onClick={saveTelegramEdit}
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
                                    onClick={() => setEditingTelegram(null)}
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
                          disabled={loading}
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
                          disabled={loading}
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
                        Role/Title
                      </label>
                      <input
                        type="text"
                        value={newCharacter.role}
                        onChange={(e) => setNewCharacter(prev => ({ ...prev, role: e.target.value }))}
                        placeholder="e.g., Wellness Expert & Mindfulness Coach"
                        disabled={loading}
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
                        Description/Bio
                      </label>
                      <textarea
                        value={newCharacter.description}
                        onChange={(e) => setNewCharacter(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Detailed bio and expertise description..."
                        disabled={loading}
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
                        Upload Profile Image to Supabase Storage
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              handleFileSelection(file, false);
                            }
                          }}
                          disabled={loading || uploadingAvatar}
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
                        {uploadingAvatar && (
                          <div style={{
                            padding: '8px 16px',
                            backgroundColor: isDarkMode ? '#f59e0b' : '#f59e0b',
                            color: '#ffffff',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            Uploading...
                          </div>
                        )}
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
                              onClick={() => setNewCharacter(prev => ({ 
                                ...prev, 
                                image: null, 
                                avatarUrl: null,
                                selectedFile: null 
                              }))}
                              disabled={loading || uploadingAvatar}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#ef4444',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: (loading || uploadingAvatar) ? 'not-allowed' : 'pointer',
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
                        Select an image for preview. Upload will happen when you click Save.
                      </p>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <button
                        onClick={addCharacter}
                        disabled={loading || uploadingAvatar || !newCharacter.name.trim() || !newCharacter.username.trim()}
                        style={{
                          padding: '12px 20px',
                          backgroundColor: (newCharacter.name.trim() && newCharacter.username.trim() && !loading && !uploadingAvatar) ? '#8b5cf6' : '#9ca3af',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          cursor: (newCharacter.name.trim() && newCharacter.username.trim() && !loading && !uploadingAvatar) ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        {(loading || uploadingAvatar) ? '⏳' : '💾'}
                        {(loading || uploadingAvatar) ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>

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
                          padding: '16px',
                          backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                          borderRadius: '8px',
                          border: isDarkMode ? '1px solid #374151' : '1px solid #c4b5fd',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px'
                        }}>
                          {editingCharacter && editingCharacter.id === character.id ? (
                            <>
                              <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                color: isDarkMode ? '#c4b5fd' : '#7c3aed',
                                fontWeight: 'bold',
                                border: isDarkMode ? '2px solid #c4b5fd' : '2px solid #c4b5fd',
                                flexShrink: 0,
                                overflow: 'hidden'
                              }}>
                                {(editingCharacter.image || character.avatar_id) ? (
                                  <img
                                    src={editingCharacter.image || character.avatar_id}
                                    alt={character.name}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover'
                                    }}
                                  />
                                ) : (
                                  character.name.charAt(0)
                                )}
                              </div>
                              <div style={{ flex: '1', display: 'grid', gap: '8px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                  <input
                                    type="text"
                                    value={editingCharacter.name}
                                    onChange={(e) => setEditingCharacter(prev => ({ ...prev, name: e.target.value }))}
                                    disabled={loading}
                                    placeholder="Name"
                                    style={{
                                      padding: '6px 8px',
                                      backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                                      border: isDarkMode ? '1px solid #4b5563' : '1px solid #c4b5fd',
                                      borderRadius: '4px',
                                      fontSize: '13px',
                                      color: isDarkMode ? '#ffffff' : '#111827'
                                    }}
                                  />
                                  <input
                                    type="text"
                                    value={editingCharacter.username}
                                    onChange={(e) => setEditingCharacter(prev => ({ ...prev, username: e.target.value }))}
                                    disabled={loading}
                                    placeholder="@username"
                                    style={{
                                      padding: '6px 8px',
                                      backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                                      border: isDarkMode ? '1px solid #4b5563' : '1px solid #c4b5fd',
                                      borderRadius: '4px',
                                      fontSize: '13px',
                                      color: isDarkMode ? '#ffffff' : '#111827'
                                    }}
                                  />
                                </div>
                                <input
                                  type="text"
                                  value={editingCharacter.role || ''}
                                  onChange={(e) => setEditingCharacter(prev => ({ ...prev, role: e.target.value }))}
                                  disabled={loading}
                                  placeholder="Role/Title"
                                  style={{
                                    padding: '6px 8px',
                                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                                    border: isDarkMode ? '1px solid #4b5563' : '1px solid #c4b5fd',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    color: isDarkMode ? '#ffffff' : '#111827'
                                  }}
                                />
                                <textarea
                                  value={editingCharacter.description || ''}
                                  onChange={(e) => setEditingCharacter(prev => ({ ...prev, description: e.target.value }))}
                                  disabled={loading}
                                  placeholder="Description/Bio"
                                  style={{
                                    padding: '6px 8px',
                                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                                    border: isDarkMode ? '1px solid #4b5563' : '1px solid #c4b5fd',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    color: isDarkMode ? '#ffffff' : '#111827',
                                    minHeight: '50px',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                  }}
                                />
                                
                                <div>
                                  <label style={{
                                    display: 'block',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: isDarkMode ? '#c4b5fd' : '#7c3aed',
                                    marginBottom: '4px'
                                  }}>
                                    Update Avatar
                                  </label>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                          handleFileSelection(file, true);
                                        }
                                      }}
                                      disabled={loading || uploadingAvatar}
                                      style={{
                                        flex: '1',
                                        padding: '4px',
                                        fontSize: '11px',
                                        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                                        border: isDarkMode ? '1px solid #4b5563' : '1px solid #c4b5fd',
                                        borderRadius: '4px',
                                        color: isDarkMode ? '#ffffff' : '#111827'
                                      }}
                                    />
                                    {uploadingAvatar && (
                                      <span style={{
                                        fontSize: '11px',
                                        color: isDarkMode ? '#f59e0b' : '#f59e0b',
                                        fontWeight: 'bold'
                                      }}>
                                        Uploading...
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                  <button
                                    onClick={saveCharacterEdit}
                                    disabled={loading || uploadingAvatar}
                                    style={{
                                      padding: '6px 12px',
                                      backgroundColor: (loading || uploadingAvatar) ? '#9ca3af' : '#10b981',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: (loading || uploadingAvatar) ? 'not-allowed' : 'pointer',
                                      fontSize: '11px',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    {(loading || uploadingAvatar) ? 'Saving...' : 'Save'}
                                  </button>
                                  <button
                                    onClick={() => setEditingCharacter(null)}
                                    disabled={loading || uploadingAvatar}
                                    style={{
                                      padding: '6px 12px',
                                      backgroundColor: '#6b7280',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: (loading || uploadingAvatar) ? 'not-allowed' : 'pointer',
                                      fontSize: '11px',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                color: isDarkMode ? '#c4b5fd' : '#7c3aed',
                                fontWeight: 'bold',
                                border: isDarkMode ? '2px solid #c4b5fd' : '2px solid #c4b5fd',
                                flexShrink: 0,
                                overflow: 'hidden'
                              }}>
                                {character.avatar_id ? (
                                  <img
                                    src={character.avatar_id}
                                    alt={character.name}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover'
                                    }}
                                  />
                                ) : (
                                  character.name.charAt(0)
                                )}
                              </div>
                              <div style={{ flex: '1' }}>
                                <div style={{ marginBottom: '4px' }}>
                                  <span style={{
                                    color: isDarkMode ? '#c4b5fd' : '#7c3aed',
                                    fontSize: '15px',
                                    fontWeight: 'bold'
                                  }}>
                                    {character.name}
                                  </span>
                                  <span style={{
                                    fontSize: '13px',
                                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                                    fontStyle: 'italic',
                                    marginLeft: '8px'
                                  }}>
                                    {character.username}
                                  </span>
                                </div>
                                {character.role && (
                                  <div style={{
                                    fontSize: '12px',
                                    color: isDarkMode ? '#c4b5fd' : '#7c3aed',
                                    fontWeight: 'bold',
                                    marginBottom: '4px'
                                  }}>
                                    {character.role}
                                  </div>
                                )}
                                <p style={{
                                  margin: '0',
                                  color: isDarkMode ? '#d1d5db' : '#6b7280',
                                  fontSize: '12px',
                                  lineHeight: '1.4'
                                }}>
                                  {character.description || 'No description provided'}
                                </p>
                                {character.avatar_id && (
                                  <div style={{
                                    marginTop: '8px',
                                    fontSize: '11px',
                                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                                    fontStyle: 'italic'
                                  }}>
                                    Avatar: {character.avatar_id.substring(0, 40)}...
                                  </div>
                                )}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <button
                                  onClick={() => setEditingCharacter(character)}
                                  disabled={loading}
                                  style={{
                                    padding: '6px 10px',
                                    backgroundColor: loading ? '#9ca3af' : '#f59e0b',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '11px',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => deleteCharacter(character.id)}
                                  disabled={loading}
                                  style={{
                                    padding: '6px 10px',
                                    backgroundColor: loading ? '#9ca3af' : '#ef4444',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '11px',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  Delete
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
            
{activeTab === 'services' && (
              <div style={{
                padding: '32px',
                border: '2px solid #10b981',
                borderRadius: '12px',
                background: isDarkMode 
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)'
                  : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: isDarkMode ? '#6ee7b7' : '#047857',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  margin: '0 0 24px 0'
                }}>
                  <span style={{ fontSize: '28px' }}>🔗</span>
                  External Services
                </h2>
                
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
                    color: isDarkMode ? '#6ee7b7' : '#047857',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    margin: '0 0 16px 0'
                  }}>
                    <span>➕</span>
                    Add External Service
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
                        color: isDarkMode ? '#6ee7b7' : '#047857',
                        marginBottom: '8px'
                      }}>
                        Service Name
                      </label>
                      <input
                        type="text"
                        value={newExternalService.name}
                        onChange={(e) => setNewExternalService(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Google Analytics, Stripe Dashboard"
                        disabled={loading}
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                          border: isDarkMode ? '1px solid #4b5563' : '1px solid #6ee7b7',
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
                        color: isDarkMode ? '#6ee7b7' : '#047857',
                        marginBottom: '8px'
                      }}>
                        Service URL/Link
                      </label>
                      <input
                        type="url"
                        value={newExternalService.url}
                        onChange={(e) => setNewExternalService(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="https://analytics.google.com"
                        disabled={loading}
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                          border: isDarkMode ? '1px solid #4b5563' : '1px solid #6ee7b7',
                          borderRadius: '6px',
                          fontSize: '14px',
                          color: isDarkMode ? '#ffffff' : '#111827',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <button
                      onClick={addExternalService}
                      disabled={loading || !newExternalService.name.trim() || !newExternalService.url.trim()}
                      style={{
                        padding: '12px 20px',
                        backgroundColor: (newExternalService.name.trim() && newExternalService.url.trim() && !loading) ? '#10b981' : '#9ca3af',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: (newExternalService.name.trim() && newExternalService.url.trim() && !loading) ? 'pointer' : 'not-allowed',
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

                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: isDarkMode ? '#6ee7b7' : '#047857',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    margin: '0 0 16px 0'
                  }}>
                    <span>📋</span>
                    Your External Services ({externalServices.length})
                  </h3>
                  {externalServices.length === 0 ? (
                    <div style={{
                      padding: '48px',
                      textAlign: 'center',
                      backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.3)' : 'rgba(255, 255, 255, 0.5)',
                      borderRadius: '8px',
                      border: isDarkMode ? '2px dashed #34d399' : '2px dashed #6ee7b7'
                    }}>
                      <p style={{ 
                        color: isDarkMode ? '#d1d5db' : '#6b7280', 
                        fontSize: '16px', 
                        marginBottom: '8px',
                        margin: '0 0 8px 0'
                      }}>No external services added yet</p>
                      <p style={{ 
                        color: isDarkMode ? '#9ca3af' : '#9ca3af', 
                        fontSize: '14px',
                        margin: '0'
                      }}>Use the form above to add your first external service link</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {externalServices.map(service => (
                        <div key={service.id} style={{
                          padding: '16px',
                          backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                          borderRadius: '8px',
                          border: isDarkMode ? '1px solid #374151' : '1px solid #6ee7b7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          {editingExternalService && editingExternalService.id === service.id ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1' }}>
                              <input
                                type="text"
                                value={editingExternalService.name}
                                onChange={(e) => setEditingExternalService(prev => ({ ...prev, name: e.target.value }))}
                                disabled={loading}
                                style={{
                                  padding: '8px',
                                  backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                                  border: isDarkMode ? '1px solid #4b5563' : '1px solid #6ee7b7',
                                  borderRadius: '4px',
                                  fontSize: '14px',
                                  color: isDarkMode ? '#ffffff' : '#111827',
                                  width: '150px'
                                }}
                              />
                              <input
                                type="url"
                                value={editingExternalService.url}
                                onChange={(e) => setEditingExternalService(prev => ({ ...prev, url: e.target.value }))}
                                disabled={loading}
                                style={{
                                  flex: '1',
                                  padding: '8px',
                                  backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                                  border: isDarkMode ? '1px solid #4b5563' : '1px solid #6ee7b7',
                                  borderRadius: '4px',
                                  fontSize: '14px',
                                  color: isDarkMode ? '#ffffff' : '#111827'
                                }}
                              />
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={saveExternalServiceEdit}
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
                                  onClick={() => setEditingExternalService(null)}
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
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1' }}>
                                <a
                                  href={service.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    backgroundColor: '#10b981',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    textDecoration: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    flexShrink: 0
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#059669';
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#10b981';
                                    e.currentTarget.style.transform = 'scale(1)';
                                  }}
                                >
                                  →
                                </a>
                                <div>
                                  <div style={{
                                    fontWeight: 'bold',
                                    color: isDarkMode ? '#6ee7b7' : '#047857',
                                    marginBottom: '4px'
                                  }}>
                                    {service.name}
                                  </div>
                                  <div style={{
                                    fontSize: '12px',
                                    color: isDarkMode ? '#9ca3af' : '#6b7280'
                                  }}>
                                    {service.url}
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => setEditingExternalService(service)}
                                  disabled={loading}
                                  style={{
                                    padding: '6px 10px',
                                    backgroundColor: loading ? '#9ca3af' : '#f59e0b',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '11px',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => deleteExternalService(service.id)}
                                  disabled={loading}
                                  style={{
                                    padding: '6px 10px',
                                    backgroundColor: loading ? '#9ca3af' : '#ef4444',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '11px',
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}            

export default SettingsComponent;
