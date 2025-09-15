import React, { useContext } from 'react';
import { Database, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

// Theme Context
const ThemeContext = React.createContext({
  isDarkMode: false,
  toggleDarkMode: () => {}
});

const useTheme = () => useContext(ThemeContext);

export const SupabaseConnection: React.FC = () => {
  const { isDarkMode } = useTheme();

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase client created successfully for Content Manager');
} else {
  console.error('Missing Supabase environment variables in Content Manager');
}

// Supabase Integration Following Your Established Pattern
const supabaseAPI = {
  // Upload media file to content-media bucket
  async uploadMediaFile(file: File, contentId: string, userId: string): Promise<string> {
    if (!supabase) throw new Error('Supabase not configured');
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${contentId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('content-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('content-media')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading media file:', error);
      throw error;
    }
  }, 

  // Save content post to content_posts table
  async saveContentPost(postData: Omit<ContentPost, 'id' | 'createdDate'>): Promise<ContentPost> {
    if (!supabase) throw new Error('Supabase not configured');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;

      // Upload media files first
      const uploadedMediaFiles = await Promise.all(
        postData.mediaFiles.map(async (mediaFile) => {
          if (mediaFile.url.startsWith('blob:')) {
            // Convert blob URL to file and upload
            const response = await fetch(mediaFile.url);
            const blob = await response.blob();
            const file = new File([blob], mediaFile.name, { type: blob.type });
            
            const supabaseUrl = await this.uploadMediaFile(file, postData.contentId, userId);
            
            return {
              ...mediaFile,
              supabaseUrl: supabaseUrl,
              url: supabaseUrl // Update URL to Supabase URL
            };
          }
          return mediaFile;
        })
      );

      // Prepare data for database insert
      const insertData = {
        content_id: postData.contentId,
        character_profile: postData.characterProfile,
        theme: postData.theme,
        audience: postData.audience,
        media_type: postData.mediaType,
        template_type: postData.templateType,
        platform: postData.platform,
        voice_style: postData.voiceStyle,
        title: postData.title,
        description: postData.description,
        hashtags: postData.hashtags,
        keywords: postData.keywords,
        cta: postData.cta,
        media_files: uploadedMediaFiles,
        selected_platforms: postData.selectedPlatforms,
        status: postData.status,
        is_from_template: postData.isFromTemplate || false,
        source_template_id: postData.sourceTemplateId,
        user_id: userId, // REQUIRED for RLS
        created_by: userId, // REQUIRED for tracking
        is_active: true
      };

      const { data, error } = await supabase
        .from('content_posts')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      // Convert back to ContentPost format
      const contentPost: ContentPost = {
        id: data.id.toString(),
        contentId: data.content_id,
        characterProfile: data.character_profile,
        theme: data.theme,
        audience: data.audience,
        mediaType: data.media_type,
        templateType: data.template_type,
        platform: data.platform,
        voiceStyle: data.voice_style || '',
        title: data.title,
        description: data.description,
        hashtags: data.hashtags || [],
        keywords: data.keywords || '',
        cta: data.cta || '',
        mediaFiles: uploadedMediaFiles,
        selectedPlatforms: data.selected_platforms || [],
        status: data.status,
        createdDate: new Date(data.created_at),
        scheduledDate: data.scheduled_date ? new Date(data.scheduled_date) : undefined,
        isFromTemplate: data.is_from_template || false,
        sourceTemplateId: data.source_template_id,
        supabaseId: data.id.toString()
      };

      return contentPost;
    } catch (error) {
      console.error('Error saving content post:', error);
      throw error;
    }
  },

  // Load content posts from content_posts table
  async loadContentPosts(): Promise<ContentPost[]> {
    if (!supabase) return [];
    
    try {
      const { data, error } = await supabase
        .from('content_posts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert to ContentPost format
      const contentPosts: ContentPost[] = (data || []).map(record => ({
        id: record.id.toString(),
        contentId: record.content_id,
        characterProfile: record.character_profile,
        theme: record.theme,
        audience: record.audience,
        mediaType: record.media_type,
        templateType: record.template_type,
        platform: record.platform || '',
        voiceStyle: record.voice_style || '',
        title: record.title || '',
        description: record.description || '',
        hashtags: record.hashtags || [],
        keywords: record.keywords || '',
        cta: record.cta || '',
        mediaFiles: record.media_files || [],
        selectedPlatforms: record.selected_platforms || [],
        status: record.status || 'pending',
        createdDate: new Date(record.created_at),
        scheduledDate: record.scheduled_date ? new Date(record.scheduled_date) : undefined,
        isFromTemplate: record.is_from_template || false,
        sourceTemplateId: record.source_template_id,
        supabaseId: record.id.toString()
      }));

      return contentPosts;
    } catch (error) {
      console.error('Error loading content posts:', error);
      return [];
    }
  },

  // Update content post
  async updateContentPost(postId: string, updates: Partial<ContentPost>): Promise<ContentPost> {
    if (!supabase) throw new Error('Supabase not configured');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;
      
      // Handle media file updates if needed
      let updatedMediaFiles = updates.mediaFiles;
      if (updates.mediaFiles) {
        updatedMediaFiles = await Promise.all(
          updates.mediaFiles.map(async (mediaFile) => {
            if (mediaFile.url.startsWith('blob:')) {
              // Upload new media file
              const response = await fetch(mediaFile.url);
              const blob = await response.blob();
              const file = new File([blob], mediaFile.name, { type: blob.type });
              
              const supabaseUrl = await this.uploadMediaFile(file, updates.contentId || 'updated', userId);
              
              return {
                ...mediaFile,
                supabaseUrl: supabaseUrl,
                url: supabaseUrl
              };
            }
            return mediaFile;
          })
        );
      }

      // Prepare update data
      const updateData: any = {};
      if (updates.characterProfile) updateData.character_profile = updates.characterProfile;
      if (updates.theme) updateData.theme = updates.theme;
      if (updates.audience) updateData.audience = updates.audience;
      if (updates.mediaType) updateData.media_type = updates.mediaType;
      if (updates.templateType) updateData.template_type = updates.templateType;
      if (updates.platform) updateData.platform = updates.platform;
      if (updates.voiceStyle) updateData.voice_style = updates.voiceStyle;
      if (updates.title) updateData.title = updates.title;
      if (updates.description) updateData.description = updates.description;
      if (updates.hashtags) updateData.hashtags = updates.hashtags;
      if (updates.keywords) updateData.keywords = updates.keywords;
      if (updates.cta) updateData.cta = updates.cta;
      if (updatedMediaFiles) updateData.media_files = updatedMediaFiles;
      if (updates.selectedPlatforms) updateData.selected_platforms = updates.selectedPlatforms;
      if (updates.status) updateData.status = updates.status;
      
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('content_posts')
        .update(updateData)
        .eq('id', parseInt(postId))
        .select()
        .single();

      if (error) throw error;

      // Convert back to ContentPost format
      const contentPost: ContentPost = {
        id: data.id.toString(),
        contentId: data.content_id,
        characterProfile: data.character_profile,
        theme: data.theme,
        audience: data.audience,
        mediaType: data.media_type,
        templateType: data.template_type,
        platform: data.platform,
        voiceStyle: data.voice_style || '',
        title: data.title,
        description: data.description,
        hashtags: data.hashtags || [],
        keywords: data.keywords || '',
        cta: data.cta || '',
        mediaFiles: data.media_files || [],
        selectedPlatforms: data.selected_platforms || [],
        status: data.status,
        createdDate: new Date(data.created_at),
        scheduledDate: data.scheduled_date ? new Date(data.scheduled_date) : undefined,
        isFromTemplate: data.is_from_template || false,
        sourceTemplateId: data.source_template_id,
        supabaseId: data.id.toString()
      };

      return contentPost;
    } catch (error) {
      console.error('Error updating content post:', error);
      throw error;
    }
  },

  // Soft delete content post
  async deleteContentPost(postId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    try {
      const { error } = await supabase
        .from('content_posts')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', parseInt(postId));

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting content post:', error);
      throw error;
    }
  }
};
 
      {/* Database Tables Status */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
        borderRadius: '8px',
        border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`
      }}>
        <h4 style={{
          fontSize: '14px',
          fontWeight: '600',
          color: isDarkMode ? '#f8fafc' : '#111827',
          margin: '0 0 12px 0'
        }}>
          Required Database Tables
        </h4>
        <div style={{
          display: 'grid',
          gap: '8px'
        }}>
          {[
            { name: 'content_posts', description: 'Stores all created content posts' },
            { name: 'character_profiles', description: 'User-defined posting personas' },
            { name: 'social_platforms', description: 'Platform configurations' },
            { name: 'telegram_configurations', description: 'Telegram channel settings' }
          ].map((table) => (
            <div key={table.name} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              backgroundColor: isDarkMode ? '#1e293b' : 'white',
              borderRadius: '6px',
              border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isConnected ? '#10b981' : '#94a3b8'
              }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: isDarkMode ? '#f8fafc' : '#111827',
                  fontFamily: 'monospace'
                }}>
                  {table.name}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: isDarkMode ? '#94a3b8' : '#6b7280'
                }}>
                  {table.description}
                </div>
              </div>

const SupabaseConnection = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div style={{
      backgroundColor: isDarkMode ? '#1e293b' : 'white',
      boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
      padding: '24px',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: isDarkMode ? '#f8fafc' : '#111827',
            margin: '0 0 4px 0'
          }}>
            Supabase Database
          </h3>
          <p style={{
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            margin: '0',
            fontSize: '14px'
          }}>
            Manage your content data storage and connectivity
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: isDarkMode ? '#065f4630' : '#d1fae5',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid #10b981'
        }}>
          <CheckCircle style={{ height: '18px', width: '18px', color: '#10b981' }} />
          <span style={{
            fontSize: '12px',
            fontWeight: '600',
            color: isDarkMode ? '#34d399' : '#065f46'
          }}>
            Connected
          </span>
        </div>
      </div>
      
      <div style={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' 
          : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        borderRadius: '8px',
        padding: '16px',
        border: `1px solid ${isDarkMode ? '#1e40af' : '#3b82f6'}`,
        marginBottom: '16px'
      }}>
        <p style={{
          color: isDarkMode ? '#bfdbfe' : '#1e40af',
          fontSize: '14px',
          lineHeight: '1.6',
          margin: '0'
        }}>
          Content posts, media files, character profiles, and platform configurations are stored in Supabase. All data is encrypted and backed up automatically.
        </p>
      </div>
      
      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          background: isDarkMode 
            ? 'linear-gradient(135deg, #1f2937 0%, #374151 100%)' 
            : 'linear-gradient(135deg, #111827 0%, #374151 100%)',
          color: 'white',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          fontFamily: 'inherit'
        }}
        onClick={() => window.open('https://supabase.com/dashboard/project/uqyqpwhkzlhqxcqajhkn/database/schemas', '_blank')}
      >
        <Database style={{ height: '16px', width: '16px' }} />
        <span>Open Supabase Project</span>
        <ExternalLink style={{ height: '14px', width: '14px' }} />
      </button>
    </div>
  );
};

// Main Component
export default function ContentComponent() {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('create');
  const [savedPosts, setSavedPosts] = useState<ContentPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPost, setEditingPost] = useState<ContentPost | null>(null);

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
        .from('social_platforms')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const platformData = (data || []).map(item => ({
        id: item.id.toString(),
        name: item.name,
        url: item.url,
        isActive: item.is_active,
        isDefault: false // You can add this field to your Supabase table if needed
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
      
      // Save to Supabase with scheduled status
      const scheduledData = { ...postData, status: 'scheduled' as const };
      const savedPost = await supabaseAPI.saveContentPost(scheduledData);
      
      setSavedPosts(prev => [savedPost, ...prev]);
      
      // Format post for Schedule Manager (convert ContentPost to PendingPost format)
      const pendingPost = {
        id: 'pending-' + Date.now(),
        characterProfile: postData.characterProfile,
        type: postData.theme.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        template: postData.templateType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: postData.description,
        mediaFiles: postData.mediaFiles,
        platforms: postData.selectedPlatforms.map(platformId => ({
          platformId: platformId,
          platformName: platforms?.find(p => p.id === platformId)?.name || 'Unknown',
          platformIcon: platforms?.find(p => p.id === platformId)?.name?.substring(0, 2).toUpperCase() || 'UN',
          status: 'pending' as const
        })),
        status: 'pending_schedule' as const,
        createdDate: new Date(),
        contentId: postData.contentId // Include the generated content ID
      };
      
      // Send to Schedule Manager - this would typically be done via:
      // 1. Parent component callback prop
      // 2. Context/State management
      // 3. Event system
      // For now, store in localStorage as bridge between components
      const existingPending = JSON.parse(localStorage.getItem('pendingSchedulePosts') || '[]');
      existingPending.unshift(pendingPost);
      localStorage.setItem('pendingSchedulePosts', JSON.stringify(existingPending));
      
      // Dispatch custom event to notify Schedule Manager
      window.dispatchEvent(new CustomEvent('newPendingPost', { 
        detail: pendingPost 
      }));
      
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

  const tabs = [
    { id: 'create', label: 'Create New Content', icon: Edit3 },
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

          {activeTab === 'supabase' && <SupabaseConnection />}
        </div>
      </div>
    </div>
  );
}
