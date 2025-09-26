import React, { useState, useEffect, useContext } from 'react';
import { Edit3, Database, Library } from 'lucide-react'; // ADD Library icon
import { ContentPost, SocialPlatform, CharacterProfile } from './types';
import { supabaseAPI, supabase } from './supabaseAPI';
import { EnhancedContentCreationForm } from './EnhancedContentCreationForm';
import { SavedPostsList } from './SavedPostsList';
import { SupabaseConnection } from './SupabaseConnection';
import { TemplateLibrary, useTemplateLibrary } from './TemplateLibrary'; // ADD Template Library imports

// Theme Context (assuming this comes from your App.tsx)
const ThemeContext = React.createContext({
  isDarkMode: false,
  toggleDarkMode: () => {}
});

const useTheme = () => useContext(ThemeContext);

export default function ContentComponent() {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('create');
  const [savedPosts, setSavedPosts] = useState<ContentPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPost, setEditingPost] = useState<ContentPost | null>(null);

  // ADD TEMPLATE LIBRARY HOOK:
  const { loadedTemplate, handleLoadTemplate, handleTemplateLoaded, clearLoadedTemplate } = useTemplateLibrary();

  // Supabase data states
  const [characterProfiles, setCharacterProfiles] = useState<CharacterProfile[]>([]);
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const [telegramChannels, setTelegramChannels] = useState<any[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);

  // Load data from Supabase on component mount
  useEffect(() => {
    loadCharacterProfiles();
    loadPlatformsData();
    loadTelegramChannels();
    fetchSupabasePosts();
  }, []);

  const loadCharacterProfiles = async () => {
    if (!supabase) {
      console.warn('Supabase not configured. Using mock character data.');
      setCharacterProfiles([
        { id: 'anica', name: 'Anica', username: '@anica', role: 'Community Manager', description: 'Empathetic and supportive communication style', avatar_id: null, is_active: true, created_at: new Date().toISOString() },
        { id: 'caelum', name: 'Caelum', username: '@caelum', role: 'Strategist', description: 'Analytical and strategic approach', avatar_id: null, is_active: true, created_at: new Date().toISOString() },
        { id: 'aurion', name: 'Aurion', username: '@aurion', role: 'Creative Director', description: 'Creative and inspiring messaging', avatar_id: null, is_active: true, created_at: new Date().toISOString() },
      ]);
      setIsLoadingProfiles(false);
      return;
    }

    try {
      setIsLoadingProfiles(true);
      const { data, error } = await supabase
        .from('character_profiles')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCharacterProfiles(data || []);
    } catch (error) {
      console.error('Error loading character profiles:', error);
      // Fallback to mock data
      setCharacterProfiles([
        { id: 'anica', name: 'Anica', username: '@anica', role: 'Community Manager', description: 'Empathetic and supportive communication style', avatar_id: null, is_active: true, created_at: new Date().toISOString() },
        { id: 'caelum', name: 'Caelum', username: '@caelum', role: 'Strategist', description: 'Analytical and strategic approach', avatar_id: null, is_active: true, created_at: new Date().toISOString() },
        { id: 'aurion', name: 'Aurion', username: '@aurion', role: 'Creative Director', description: 'Creative and inspiring messaging', avatar_id: null, is_active: true, created_at: new Date().toISOString() },
      ]);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  const loadPlatformsData = async () => {
    if (!supabase) {
      console.warn('Supabase not configured. Using mock platform data.');
      setPlatforms([
        { id: '1', name: 'Facebook', url: 'https://facebook.com/page', isActive: true, isDefault: false },
        { id: '2', name: 'Instagram', url: 'https://instagram.com/page', isActive: true, isDefault: true },
      ]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('social_platforms_content')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const platformData = (data || []).map(item => ({
        id: item.id.toString(),
        name: item.name,
        url: item.url,
        isActive: item.is_active,
        isDefault: item.is_default || false
      }));
      
      setPlatforms(platformData);
    } catch (error) {
      console.error('Error loading platforms:', error);
      setPlatforms([]);
    }
  };

  const loadTelegramChannels = async () => {
    if (!supabase) {
      console.warn('Supabase not configured. Using empty Telegram data.');
      setTelegramChannels([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('telegram_configurations')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Ensure data has required fields
      const safeData = (data || []).filter(item => 
        item && 
        item.id && 
        item.name && 
        typeof item.name === 'string'
      );
      
      setTelegramChannels(safeData);
    } catch (error) {
      console.error('Error loading Telegram channels:', error);
      setTelegramChannels([]);
    }
  };

  // Load posts from Supabase on component mount
  const fetchSupabasePosts = async () => {
    try {
      setIsLoadingPosts(true);
      const posts = await supabaseAPI.loadContentPosts();
      setSavedPosts(posts);
    } catch (error) {
      console.error('Failed to load posts:', error);
      setSavedPosts([]);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleSavePost = async (postData: Omit<ContentPost, 'id' | 'createdDate'>) => {
    try {
      setIsSaving(true);
      
      // Save to Supabase
      const savedPost = await supabaseAPI.saveContentPost(postData);
      
      // Update local state
      setSavedPosts(prev => [savedPost, ...prev]);
      
      // Clear template after saving:
      clearLoadedTemplate();
      
      alert('Content saved successfully to Supabase database!');
      
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save content. Please try again.\n\nError: ' + (error instanceof Error ? error.message : 'Unknown error'));
      // Don't reset form data on error - form content is preserved
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddToSchedule = async (postData: Omit<ContentPost, 'id' | 'createdDate'>) => {
    try {
      setIsSaving(true);
      
      // FIXED: Save to Supabase with pending_schedule status (not 'scheduled')
      const scheduledData = { ...postData, status: 'pending_schedule' as const };
      const savedPost = await supabaseAPI.saveContentPost(scheduledData);
      
      setSavedPosts(prev => [savedPost, ...prev]);
      
      // Clear template after scheduling:
      clearLoadedTemplate();
      
      alert('Content sent to Schedule Manager for scheduling!\n\nYou can now set the date and time in the Schedule Manager > Pending Scheduling tab.');
      
    } catch (error) {
      console.error('Schedule save failed:', error);
      alert('Failed to save content for scheduling. Please try again.\n\nError: ' + (error instanceof Error ? error.message : 'Unknown error'));
      // Don't reset form data on error - form content is preserved
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditPost = (postId: string) => {
    // Find the post to edit
    const postToEdit = savedPosts.find(p => p.id === postId);
    if (!postToEdit) {
      alert('Post not found for editing.');
      return;
    }

    // Set the post as currently being edited
    setEditingPost(postToEdit);
    
    // Switch to create tab
    setActiveTab('create');
    
    alert(`Loading "${postToEdit.title || 'Untitled Post'}" into the form for editing.\n\nYou can now modify the content and either save as draft (updates existing) or schedule the post.`);
  };

  const handleEditComplete = () => {
    // Clear editing state when edit is complete or cancelled
    setEditingPost(null);
    
    // Refresh posts list to show updated content
    fetchSupabasePosts();
  };

  const handleSchedulePost = (postId: string) => {
    // TODO: Move to scheduler
    alert('Schedule functionality coming next');
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      return;
    }

    try {
      await supabaseAPI.deleteContentPost(postId);
      
      // Remove from local state
      setSavedPosts(prev => prev.filter(post => post.id !== postId));
      
      alert('Content deleted successfully.');
      
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete content. Please try again.');
    }
  };

  // UPDATED TEMPLATE LOAD HANDLER:
  const handleTemplateLoad = (template: any) => {
    handleLoadTemplate(template);
    setActiveTab('create'); // Switch to create tab when template is loaded
  };

  // UPDATED TABS ARRAY - NOW INCLUDES TEMPLATE LIBRARY:
  const tabs = [
    { id: 'create', label: 'Create New Content', icon: Edit3 },
    { id: 'templates', label: 'Template Library', icon: Library }, // ADDED THIS LINE
    { id: 'supabase', label: 'Supabase Database', icon: Database },
  ];

  return (
    <div style={{
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gap: '24px'
      }}>
        {/* Tabs */}
        <div style={{
          backgroundColor: isDarkMode ? '#1e293b' : 'white',
          boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex' }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '16px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    flex: 1,
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: activeTab === tab.id ? (isDarkMode ? '#60a5fa' : '#3b82f6') : 'transparent',
                    color: activeTab === tab.id ? 'white' : (isDarkMode ? '#94a3b8' : '#6b7280'),
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit'
                  }}
                  onMouseOver={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f9fafb';
                      e.currentTarget.style.color = isDarkMode ? '#f8fafc' : '#111827';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#6b7280';
                    }
                  }}
                >
                  <Icon style={{ height: '20px', width: '20px' }} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'create' && (
            <div style={{ display: 'grid', gap: '24px' }}>
              <EnhancedContentCreationForm
                onSave={handleSavePost}
                onAddToSchedule={handleAddToSchedule}
                characterProfiles={characterProfiles}
                platforms={[...platforms, ...telegramChannels.map(t => ({
                  id: t.id ? t.id.toString() : Math.random().toString(),
                  name: t.name ? `${t.name} (Telegram)` : 'Telegram Channel',
                  url: t.channel_group_id ? `https://t.me/${t.channel_group_id}` : '',
                  isActive: true,
                  isDefault: false
                }))].filter(p => p.id && p.name)}
                isSaving={isSaving}
                isLoadingProfiles={isLoadingProfiles}
                editingPost={editingPost}
                onEditComplete={handleEditComplete}
                // ADD TEMPLATE INTEGRATION PROPS:
                loadedTemplate={loadedTemplate}
                onTemplateLoaded={handleTemplateLoaded}
              />
              
              <SavedPostsList
                posts={savedPosts}
                onEditPost={handleEditPost}
                onSchedulePost={handleSchedulePost}
                onDeletePost={handleDeletePost}
                isLoading={isLoadingPosts}
              />
            </div>
          )}

          {/* ADD TEMPLATE LIBRARY TAB CASE: */}
          {activeTab === 'templates' && (
            <TemplateLibrary
              onLoadTemplate={handleTemplateLoad}
            />
          )}

          {activeTab === 'supabase' && <SupabaseConnection />}
        </div>
      </div>
    </div>
  );
}
