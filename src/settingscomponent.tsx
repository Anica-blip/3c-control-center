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

  // Theme classes
  const themeClasses = {
    background: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
    cardBackground: isDarkMode ? 'bg-gray-800' : 'bg-white',
    textPrimary: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textMuted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    inputBackground: isDarkMode ? 'bg-gray-700' : 'bg-white',
    inputBorder: isDarkMode ? 'border-gray-600' : 'border-gray-300',
    buttonPrimary: isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700',
    buttonSecondary: isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200',
    buttonDanger: isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-600 hover:bg-red-700',
    buttonSuccess: isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 hover:bg-green-700'
  };

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
    <div className={`min-h-screen ${themeClasses.background} transition-colors duration-200`}>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-black ${themeClasses.textPrimary} mb-2`}>
            ⚙️ Dashboard Settings
          </h1>
          <p className={`text-lg ${themeClasses.textSecondary} font-medium`}>
            Configure social platforms, Telegram channels, and character profiles
          </p>
        </div>
        
        {/* Settings Sub-Navigation - 3 TABS ONLY */}
        <div className={`${themeClasses.cardBackground} rounded-lg shadow-lg border ${themeClasses.border} mb-8`}>
          <div className="flex border-b border-gray-700">
            {[
              { id: 'platforms', icon: '📱', label: 'Social Platforms' },
              { id: 'characters', icon: '👥', label: 'Character Profiles' },
              { id: 'logs', icon: '📋', label: 'Error Logs' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-8 py-4 text-sm font-bold transition-all duration-200 border-b-2 ${
                  activeTab === tab.id
                    ? `${themeClasses.textPrimary} border-blue-500 bg-blue-500/10`
                    : `${themeClasses.textSecondary} border-transparent hover:${themeClasses.textPrimary} hover:bg-gray-500/10`
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* 1. SOCIAL PLATFORMS TAB (includes both Social Media + Telegram) */}
            {activeTab === 'platforms' && (
              <div className="space-y-8">
                
                {/* SOCIAL MEDIA PLATFORMS SECTION */}
                <div className={`p-8 border-2 border-blue-500 rounded-xl bg-gradient-to-br ${isDarkMode ? 'from-blue-900/20 to-blue-800/20' : 'from-blue-50 to-blue-100'}`}>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-900'} mb-6 flex items-center gap-3`}>
                    <span className="text-3xl">📱</span>
                    Social Media Platforms
                  </h2>
                  
                  {/* Add New Platform Form */}
                  <div className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} rounded-lg border ${themeClasses.border} mb-8`}>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-900'} mb-4 flex items-center gap-2`}>
                      <span>➕</span>
                      Create New Platform
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                      <div>
                        <label className={`block text-sm font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-900'} mb-2`}>
                          Platform Name
                        </label>
                        <input
                          type="text"
                          value={newPlatform.name}
                          onChange={(e) => setNewPlatform(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Facebook, Instagram, Twitter"
                          className={`w-full px-4 py-3 ${themeClasses.inputBackground} ${themeClasses.inputBorder} border-2 rounded-lg text-sm ${themeClasses.textPrimary} focus:border-blue-500 focus:ring-0 transition-colors`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-900'} mb-2`}>
                          Platform URL/Link
                        </label>
                        <input
                          type="url"
                          value={newPlatform.url}
                          onChange={(e) => setNewPlatform(prev => ({ ...prev, url: e.target.value }))}
                          placeholder="https://facebook.com/yourpage"
                          className={`w-full px-4 py-3 ${themeClasses.inputBackground} ${themeClasses.inputBorder} border-2 rounded-lg text-sm ${themeClasses.textPrimary} focus:border-blue-500 focus:ring-0 transition-colors`}
                        />
                      </div>
                      <button
                        onClick={addPlatform}
                        disabled={!newPlatform.name.trim() || !newPlatform.url.trim()}
                        className={`px-6 py-3 ${themeClasses.buttonPrimary} text-white border-none rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                      >
                        <span>💾</span>
                        Save
                      </button>
                    </div>
                  </div>

                  {/* Platforms List */}
                  <div>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-900'} mb-4 flex items-center gap-2`}>
                      <span>📋</span>
                      Your Platforms ({platforms.length})
                    </h3>
                    {platforms.length === 0 ? (
                      <div className={`p-12 text-center ${isDarkMode ? 'bg-gray-800/30' : 'bg-white/50'} rounded-lg border-2 border-dashed ${isDarkMode ? 'border-blue-400' : 'border-blue-300'}`}>
                        <p className={`${themeClasses.textSecondary} text-lg mb-2`}>No platforms added yet</p>
                        <p className={`${themeClasses.textMuted} text-sm`}>Use the form above to add your first social media platform</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {platforms.map(platform => (
                          <div key={platform.id} className={`p-4 ${themeClasses.cardBackground} rounded-lg border ${themeClasses.border} flex items-center justify-between`}>
                            {editingPlatform && editingPlatform.id === platform.id ? (
                              <div className="flex items-center gap-4 flex-1">
                                <input
                                  type="text"
                                  value={editingPlatform.name}
                                  onChange={(e) => setEditingPlatform(prev => ({ ...prev, name: e.target.value }))}
                                  className={`px-3 py-2 ${themeClasses.inputBackground} ${themeClasses.inputBorder} border rounded text-sm ${themeClasses.textPrimary} w-40`}
                                />
                                <input
                                  type="url"
                                  value={editingPlatform.url}
                                  onChange={(e) => setEditingPlatform(prev => ({ ...prev, url: e.target.value }))}
                                  className={`flex-1 px-3 py-2 ${themeClasses.inputBackground} ${themeClasses.inputBorder} border rounded text-sm ${themeClasses.textPrimary}`}
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={savePlatformEdit}
                                    className={`px-3 py-2 ${themeClasses.buttonSuccess} text-white text-xs rounded font-bold`}
                                  >
                                    💾 Save
                                  </button>
                                  <button
                                    onClick={() => setEditingPlatform(null)}
                                    className={`px-3 py-2 ${themeClasses.buttonSecondary} ${themeClasses.textPrimary} text-xs rounded font-bold`}
                                  >
                                    ❌ Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div>
                                  <div className={`font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-900'} mb-1`}>
                                    {platform.name}
                                  </div>
                                  <div className={`text-xs ${themeClasses.textMuted}`}>
                                    {platform.url}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setEditingPlatform(platform)}
                                    className={`px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded font-bold transition-colors`}
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button
                                    onClick={() => deletePlatform(platform.id)}
                                    className={`px-3 py-2 ${themeClasses.buttonDanger} text-white text-xs rounded font-bold`}
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
                <div className={`p-8 border-2 border-cyan-500 rounded-xl bg-gradient-to-br ${isDarkMode ? 'from-cyan-900/20 to-cyan-800/20' : 'from-cyan-50 to-cyan-100'}`}>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-cyan-300' : 'text-cyan-900'} mb-6 flex items-center gap-3`}>
                    <span className="text-3xl">📡</span>
                    Telegram Channels & Groups
                  </h2>
                  
                  {/* Add New Telegram Form */}
                  <div className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} rounded-lg border ${themeClasses.border} mb-8`}>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-cyan-300' : 'text-cyan-900'} mb-4 flex items-center gap-2`}>
                      <span>➕</span>
                      Add Telegram Channel/Group
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className={`block text-sm font-bold ${isDarkMode ? 'text-cyan-300' : 'text-cyan-900'} mb-2`}>
                            Channel or Group Name
                          </label>
                          <input
                            type="text"
                            value={newTelegram.name}
                            onChange={(e) => setNewTelegram(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., group2, channel1"
                            className={`w-full px-4 py-3 ${themeClasses.inputBackground} ${themeClasses.inputBorder} border-2 rounded-lg text-sm ${themeClasses.textPrimary} focus:border-cyan-500 focus:ring-0 transition-colors`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-bold ${isDarkMode ? 'text-cyan-300' : 'text-cyan-900'} mb-2`}>
                            Channel/Group ID
                          </label>
                          <input
                            type="text"
                            value={newTelegram.channel_group_id}
                            onChange={(e) => setNewTelegram(prev => ({ ...prev, channel_group_id: e.target.value }))}
                            placeholder="e.g., -1002377255109"
                            className={`w-full px-4 py-3 ${themeClasses.inputBackground} ${themeClasses.inputBorder} border-2 rounded-lg text-sm ${themeClasses.textPrimary} focus:border-cyan-500 focus:ring-0 transition-colors`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-bold ${isDarkMode ? 'text-cyan-300' : 'text-cyan-900'} mb-2`}>
                            Type
                          </label>
                          <select
                            value={newTelegram.type}
                            onChange={(e) => setNewTelegram(prev => ({ ...prev, type: e.target.value }))}
                            className={`w-full px-4 py-3 ${themeClasses.inputBackground} ${themeClasses.inputBorder} border-2 rounded-lg text-sm ${themeClasses.textPrimary} focus:border-cyan-500 focus:ring-0 transition-colors`}
                          >
                            <option value="channel">Channel</option>
                            <option value="group">Group</option>
                          </select>
                        </div>
                      </div>
                      
                      {newTelegram.type === 'group' && (
                        <div>
                          <label className={`block text-sm font-bold ${isDarkMode ? 'text-cyan-300' : 'text-cyan-900'} mb-2`}>
                            Thread ID (for groups with topics)
                          </label>
                          <input
                            type="text"
                            value={newTelegram.thread_id}
                            onChange={(e) => setNewTelegram(prev => ({ ...prev, thread_id: e.target.value }))}
                            placeholder="e.g., https://t.me/100237725510910 (optional)"
                            className={`w-full px-4 py-3 ${themeClasses.inputBackground} ${themeClasses.inputBorder} border-2 rounded-lg text-sm ${themeClasses.textPrimary} focus:border-cyan-500 focus:ring-0 transition-colors`}
                          />
                        </div>
                      )}
                      
                      <div className="text-right">
                        <button
                          onClick={addTelegram}
                          disabled={!newTelegram.name.trim() || !newTelegram.channel_group_id.trim()}
                          className={`px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white border-none rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                        >
                          <span>💾</span>
                          Save
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Telegram List */}
                  <div>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-cyan-300' : 'text-cyan-900'} mb-4 flex items-center gap-2`}>
                      <span>📋</span>
                      Your Telegram Channels/Groups ({telegramChannels.length})
                    </h3>
                    {telegramChannels.length === 0 ? (
                      <div className={`p-12 text-center ${isDarkMode ? 'bg-gray-800/30' : 'bg-white/50'} rounded-lg border-2 border-dashed ${isDarkMode ? 'border-cyan-400' : 'border-cyan-300'}`}>
                        <p className={`${themeClasses.textSecondary} text-lg mb-2`}>No Telegram channels/groups added yet</p>
                        <p className={`${themeClasses.textMuted} text-sm`}>Use the form above to add your first Telegram destination</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {telegramChannels.map(telegram => (
                          <div key={telegram.id} className={`p-4 ${themeClasses.cardBackground} rounded-lg border ${themeClasses.border} flex items-center justify-between`}>
                            <div>
                              <div className={`font-bold ${isDarkMode ? 'text-cyan-300' : 'text-cyan-900'} mb-1`}>
                                {telegram.name} ({telegram.type})
                              </div>
                              <div className={`text-xs ${themeClasses.textMuted}`}>
                                ID: {telegram.channel_group_id}
                                {telegram.thread_id && ` • Thread: ${telegram.thread_id}`}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingTelegram(telegram)}
                                className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded font-bold transition-colors"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => deleteTelegram(telegram.id)}
                                className={`px-3 py-2 ${themeClasses.buttonDanger} text-white text-xs rounded font-bold`}
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
              <div className={`p-8 border-2 border-purple-500 rounded-xl bg-gradient-to-br ${isDarkMode ? 'from-purple-900/20 to-purple-800/20' : 'from-purple-50 to-purple-100'}`}>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-900'} mb-6 flex items-center gap-3`}>
                  <span className="text-3xl">👥</span>
                  Character Profiles
                </h2>
                
                {/* Add New Character Form */}
                <div className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} rounded-lg border ${themeClasses.border} mb-8`}>
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-900'} mb-4 flex items-center gap-2`}>
                    <span>➕</span>
                    Add Profile
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-900'} mb-2`}>
                          Name
                        </label>
                        <input
                          type="text"
                          value={newCharacter.name}
                          onChange={(e) => setNewCharacter(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Dr. Sarah Chen"
                          className={`w-full px-4 py-3 ${themeClasses.inputBackground} ${themeClasses.inputBorder} border-2 rounded-lg text-sm ${themeClasses.textPrimary} focus:border-purple-500 focus:ring-0 transition-colors`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-900'} mb-2`}>
                          Username
                        </label>
                        <input
                          type="text"
                          value={newCharacter.username}
                          onChange={(e) => setNewCharacter(prev => ({ ...prev, username: e.target.value }))}
                          placeholder="e.g., @drsarahchen"
                          className={`w-full px-4 py-3 ${themeClasses.inputBackground} ${themeClasses.inputBorder} border-2 rounded-lg text-sm ${themeClasses.textPrimary} focus:border-purple-500 focus:ring-0 transition-colors`}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-900'} mb-2`}>
                        Title
                      </label>
                      <input
                        type="text"
                        value={newCharacter.title}
                        onChange={(e) => setNewCharacter(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Wellness Expert & Mindfulness Coach"
                        className={`w-full px-4 py-3 ${themeClasses.inputBackground} ${themeClasses.inputBorder} border-2 rounded-lg text-sm ${themeClasses.textPrimary} focus:border-purple-500 focus:ring-0 transition-colors`}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-900'} mb-2`}>
                        Bio
                      </label>
                      <textarea
                        value={newCharacter.bio}
                        onChange={(e) => setNewCharacter(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Detailed bio and expertise description..."
                        rows={3}
                        className={`w-full px-4 py-3 ${themeClasses.inputBackground} ${themeClasses.inputBorder} border-2 rounded-lg text-sm ${themeClasses.textPrimary} focus:border-purple-500 focus:ring-0 transition-colors resize-vertical`}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-900'} mb-2`}>
                        Upload Profile Image
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              handleImageUpload(file, false);
                            }
                          }}
                          className={`flex-1 px-4 py-3 ${themeClasses.inputBackground} ${themeClasses.inputBorder} border-2 rounded-lg text-sm ${themeClasses.textPrimary} focus:border-purple-500 focus:ring-0 transition-colors`}
                        />
                        {newCharacter.image && (
                          <div className="flex items-center gap-3">
                            <img
                              src={newCharacter.image}
                              alt="Preview"
                              className="w-16 h-16 rounded-full object-cover border-2 border-purple-300"
                            />
                            <button
                              type="button"
                              onClick={() => setNewCharacter(prev => ({ ...prev, image: null }))}
                              className={`px-3 py-2 ${themeClasses.buttonDanger} text-white text-xs rounded font-bold`}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                      <p className={`mt-2 text-xs ${themeClasses.textMuted}`}>
                        Upload an image from your computer. It will be automatically resized to fit 200x200 pixels.
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <button
                        onClick={addCharacter}
                        disabled={!newCharacter.name.trim() || !newCharacter.username.trim()}
                        className={`px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white border-none rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                      >
                        <span>💾</span>
                        Save
                      </button>
                    </div>
                  </div>
                </div>

                {/* Characters List */}
                <div>
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-900'} mb-4 flex items-center gap-2`}>
                    <span>📋</span>
                    Your Character Profiles ({characters.length})
                  </h3>
                  {characters.length === 0 ? (
                    <div className={`p-12 text-center ${isDarkMode ? 'bg-gray-800/30' : 'bg-white/50'} rounded-lg border-2 border-dashed ${isDarkMode ? 'border-purple-400' : 'border-purple-300'}`}>
                      <p className={`${themeClasses.textSecondary} text-lg mb-2`}>No character profiles created yet</p>
                      <p className={`${themeClasses.textMuted} text-sm`}>Use the form above to create your first character profile</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {characters.map(character => (
                        <div key={character.id} className={`p-6 ${themeClasses.cardBackground} rounded-lg border ${themeClasses.border} flex items-start gap-4`}>
                          <div className={`w-20 h-20 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center text-2xl ${isDarkMode ? 'text-purple-300' : 'text-purple-600'} font-bold border-2 ${isDarkMode ? 'border-purple-400' : 'border-purple-300'} flex-shrink-0 ${character.image ? 'bg-cover bg-center' : ''}`} style={character.image ? { backgroundImage: `url(${character.image})` } : {}}>
                            {!character.image && character.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className={`text-lg font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-900'}`}>
                                {character.name}
                              </h4>
                              <span className={`text-sm ${themeClasses.textMuted} italic`}>
                                {character.username}
                              </span>
                            </div>
                            {character.title && (
                              <div className={`text-sm font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-600'} mb-2`}>
                                {character.title}
                              </div>
                            )}
                            <p className={`${themeClasses.textSecondary} text-sm leading-relaxed`}>
                              {character.bio}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => setEditingCharacter(character)}
                              className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded font-bold transition-colors"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => deleteCharacter(character.id)}
                              className={`px-3 py-2 ${themeClasses.buttonDanger} text-white text-xs rounded font-bold`}
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
              <div className={`p-8 border-2 border-red-500 rounded-xl bg-gradient-to-br ${isDarkMode ? 'from-red-900/20 to-red-800/20' : 'from-red-50 to-red-100'}`}>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-red-300' : 'text-red-900'} mb-6 flex items-center gap-3`}>
                  <span className="text-3xl">📋</span>
                  Error Logs
                </h2>
                <p className={`${isDarkMode ? 'text-red-300' : 'text-red-700'} text-sm mb-6`}>
                  System error logs from Supabase database
                </p>
                
                {errorLogs.length === 0 ? (
                  <div className={`p-16 text-center ${isDarkMode ? 'bg-gray-800/30' : 'bg-white/50'} rounded-lg border-2 border-dashed ${isDarkMode ? 'border-red-400' : 'border-red-300'}`}>
                    <div className="text-5xl mb-4">📋</div>
                    <h3 className={`${themeClasses.textSecondary} mb-3 text-xl font-bold`}>
                      No Error Logs Found
                    </h3>
                    <p className={`${themeClasses.textMuted} text-sm mb-6`}>
                      Error logs from Supabase will appear here automatically
                    </p>
                    <div className={`p-4 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} rounded-lg text-left`}>
                      <p className={`mb-3 text-xs font-bold ${isDarkMode ? 'text-red-300' : 'text-red-700'} flex items-center gap-2`}>
                        <span>📡</span>
                        Supabase Connection Status:
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className={`text-xs ${themeClasses.textMuted}`}>
                          Waiting for database connection...
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {errorLogs.map(log => (
                      <div key={log.id} className={`p-4 ${themeClasses.cardBackground} rounded-lg border-l-4 ${
                        log.severity === 'error' ? 'border-red-500' : 
                        log.severity === 'warning' ? 'border-orange-500' : 
                        'border-green-500'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`font-bold ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>{log.type}</span>
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                log.severity === 'error' ? 'bg-red-500 text-white' :
                                log.severity === 'warning' ? 'bg-orange-500 text-white' :
                                'bg-green-500 text-white'
                              }`}>
                                {log.severity?.toUpperCase()}
                              </span>
                              <span className={`text-xs ${themeClasses.textMuted}`}>{log.timestamp}</span>
                            </div>
                            <p className={`${themeClasses.textSecondary} text-sm`}>{log.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {errorLogs.length > 0 && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setErrorLogs([])}
                      className={`px-6 py-3 ${themeClasses.buttonDanger} text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 mx-auto`}
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
