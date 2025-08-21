import React, { useState, useRef } from 'react';
import { Upload, X, Image, Video, FileText, Download, Eye, Trash2, Plus, Settings, ExternalLink, Database, CheckCircle, Circle, Check } from 'lucide-react';

// Types
interface ContentPost {
  id: string;
  characterProfile: string;
  type: string;
  template: string;
  mediaFiles: MediaFile[];
  description: string;
  selectedPlatforms: string[];
  status: 'pending' | 'scheduled' | 'published';
  createdDate: Date;
  scheduledDate?: Date;
}

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'pdf' | 'gif' | 'interactive' | 'other';
  size: number;
  url: string;
}

interface SocialPlatform {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  isDefault: boolean;
}

interface CharacterProfile {
  id: string;
  name: string;
  description: string;
}

interface ContentType {
  id: string;
  name: string;
}

interface ContentTemplate {
  id: string;
  name: string;
  content: string;
}

// Sub-components
const ContentCreationForm = ({ 
  onSave, 
  onAddToSchedule, 
  characterProfiles, 
  contentTypes, 
  templates, 
  platforms 
}: {
  onSave: (post: Omit<ContentPost, 'id' | 'createdDate'>) => void;
  onAddToSchedule: (post: Omit<ContentPost, 'id' | 'createdDate'>) => void;
  characterProfiles: CharacterProfile[];
  contentTypes: ContentType[];
  templates: ContentTemplate[];
  platforms: SocialPlatform[];
}) => {
  const [formData, setFormData] = useState({
    characterProfile: '',
    type: '',
    template: '',
    description: '',
    selectedPlatforms: [] as string[]
  });
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activePlatforms = platforms.filter(p => p.isActive);

  const handleFileUpload = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const newFile: MediaFile = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('video/') ? 'video' :
              file.type === 'application/pdf' ? 'pdf' :
              file.name.toLowerCase().includes('.gif') ? 'gif' :
              file.name.toLowerCase().includes('.html') ? 'interactive' : 'other',
        size: file.size,
        url: URL.createObjectURL(file),
      };
      setMediaFiles(prev => [...prev, newFile]);
    });
  };

  const handleRemoveFile = (fileId: string) => {
    setMediaFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handlePlatformToggle = (platformId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPlatforms: prev.selectedPlatforms.includes(platformId)
        ? prev.selectedPlatforms.filter(id => id !== platformId)
        : [...prev.selectedPlatforms, platformId]
    }));
  };

  const handleSave = () => {
    onSave({
      ...formData,
      mediaFiles,
      status: 'pending'
    });
    resetForm();
  };

  const handleAddToSchedule = () => {
    onAddToSchedule({
      ...formData,
      mediaFiles,
      status: 'pending'
    });
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      characterProfile: '',
      type: '',
      template: '',
      description: '',
      selectedPlatforms: []
    });
    setMediaFiles([]);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4 text-blue-500" />;
      case 'video': return <Video className="h-4 w-4 text-green-500" />;
      case 'pdf': return <FileText className="h-4 w-4 text-red-500" />;
      case 'interactive': return <Settings className="h-4 w-4 text-purple-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canSave = formData.characterProfile && formData.type && formData.description;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Create New Content</h2>
      
      {/* Form Fields Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Character Profile
          </label>
          <select
            value={formData.characterProfile}
            onChange={(e) => setFormData(prev => ({ ...prev, characterProfile: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select profile...</option>
            {characterProfiles.map(profile => (
              <option key={profile.id} value={profile.id}>{profile.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select type...</option>
            {contentTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Template
          </label>
          <select
            value={formData.template}
            onChange={(e) => setFormData(prev => ({ ...prev, template: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select template...</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>{template.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Media Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Media Type
        </label>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-1">Upload media files</p>
          <p className="text-xs text-gray-400">Images, Videos, GIFs, PDFs, Interactive Media</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.gif,.html"
            className="hidden"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          />
        </div>

        {/* Uploaded Files */}
        {mediaFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Uploaded Files ({mediaFiles.length})</h4>
            {mediaFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                <div className="flex items-center space-x-2">
                  {getFileIcon(file.type)}
                  <span className="text-sm text-gray-900">{file.name}</span>
                  <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                </div>
                <button
                  onClick={() => handleRemoveFile(file.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Post Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter your post content..."
          className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={4}
        />
      </div>

      {/* Platform Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Platforms to Post
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {activePlatforms.map((platform) => (
            <label
              key={platform.id}
              className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.selectedPlatforms.includes(platform.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.selectedPlatforms.includes(platform.id)}
                onChange={() => handlePlatformToggle(platform.id)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <span className="text-sm text-gray-900">{platform.name}</span>
              {platform.isDefault && (
                <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">Default</span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={!canSave}
          className={`px-4 py-2 rounded-lg font-medium ${
            canSave
              ? 'bg-gray-600 text-white hover:bg-gray-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Save as Pending
        </button>
        <button
          onClick={handleAddToSchedule}
          disabled={!canSave}
          className={`px-4 py-2 rounded-lg font-medium ${
            canSave
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Add to Schedule
        </button>
      </div>
    </div>
  );
};

const SavedPostsList = ({ posts, onEditPost, onSchedulePost, onDeletePost }: {
  posts: ContentPost[];
  onEditPost: (postId: string) => void;
  onSchedulePost: (postId: string) => void;
  onDeletePost: (postId: string) => void;
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Pending</span>;
      case 'scheduled':
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Scheduled</span>;
      case 'published':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Published</span>;
      default:
        return null;
    }
  };

  if (posts.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No content created yet</h3>
        <p className="text-gray-500">Create your first post using the form above</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Saved Content ({posts.length})</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {posts.map((post) => (
          <div key={post.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getStatusBadge(post.status)}
                  <span className="text-sm text-gray-500">
                    Created {post.createdDate.toLocaleDateString()}
                  </span>
                  {post.scheduledDate && (
                    <span className="text-sm text-blue-600">
                      Scheduled for {post.scheduledDate.toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                <p className="text-gray-900 mb-2 line-clamp-2">{post.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  {post.mediaFiles.length > 0 && (
                    <span className="flex items-center space-x-1">
                      <Image className="h-4 w-4" />
                      <span>{post.mediaFiles.length} file(s)</span>
                    </span>
                  )}
                  
                  <span className="flex items-center space-x-1">
                    <Settings className="h-4 w-4" />
                    <span>{post.selectedPlatforms.length} platform(s)</span>
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onEditPost(post.id)}
                  className="p-1 text-gray-400 hover:text-blue-500"
                  title="Edit"
                >
                  <Settings className="h-4 w-4" />
                </button>
                
                {post.status === 'pending' && (
                  <button
                    onClick={() => onSchedulePost(post.id)}
                    className="p-1 text-gray-400 hover:text-green-500"
                    title="Add to Schedule"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                )}
                
                <button
                  onClick={() => onDeletePost(post.id)}
                  className="p-1 text-gray-400 hover:text-red-500"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SupabaseConnection = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Database Connection</h3>
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span className="text-sm font-medium">Connected</span>
        </div>
      </div>
      
      <p className="text-gray-600 mb-4">
        Your content and settings are being stored securely in Supabase.
      </p>
      
      <button className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
        <Database className="h-4 w-4" />
        <span>Open Supabase Project</span>
        <ExternalLink className="h-4 w-4" />
      </button>
    </div>
  );
};

// Main Component
export default function ContentManager() {
  const [activeTab, setActiveTab] = useState('media');
  const [savedPosts, setSavedPosts] = useState<ContentPost[]>([]);
  
  // Mock data from settings
  const [characterProfiles] = useState<CharacterProfile[]>([
    { id: '1', name: 'Business Professional', description: 'Corporate tone' },
    { id: '2', name: 'Casual Friend', description: 'Friendly and approachable' },
    { id: '3', name: 'Expert Educator', description: 'Informative and authoritative' },
  ]);

  const [contentTypes] = useState<ContentType[]>([
    { id: '1', name: 'Announcement' },
    { id: '2', name: 'Tutorial' },
    { id: '3', name: 'News Update' },
    { id: '4', name: 'Promotional' },
  ]);

  const [templates] = useState<ContentTemplate[]>([
    { id: '1', name: 'Standard Post', content: 'Standard format' },
    { id: '2', name: 'News Alert', content: 'Breaking news format' },
    { id: '3', name: 'Tutorial Guide', content: 'Step-by-step format' },
  ]);

  const [platforms] = useState<SocialPlatform[]>([
    { id: '1', name: 'Telegram Group 1', url: 'https://t.me/group1', isActive: true, isDefault: true },
    { id: '2', name: 'Telegram Group 2', url: 'https://t.me/group2', isActive: true, isDefault: false },
    { id: '3', name: 'Facebook Page', url: 'https://facebook.com/page', isActive: true, isDefault: false },
    { id: '4', name: 'Forum', url: 'https://yourforum.com', isActive: true, isDefault: true },
    { id: '5', name: 'Twitter', url: 'https://twitter.com/account', isActive: false, isDefault: false },
  ]);

  const handleSavePost = (postData: Omit<ContentPost, 'id' | 'createdDate'>) => {
    const newPost: ContentPost = {
      ...postData,
      id: Date.now().toString(),
      createdDate: new Date(),
    };
    setSavedPosts(prev => [newPost, ...prev]);
  };

  const handleAddToSchedule = (postData: Omit<ContentPost, 'id' | 'createdDate'>) => {
    const newPost: ContentPost = {
      ...postData,
      id: Date.now().toString(),
      createdDate: new Date(),
    };
    setSavedPosts(prev => [newPost, ...prev]);
    // TODO: Navigate to scheduler tab or open scheduler modal
    alert('Post ready for scheduling! (Will integrate with scheduler tab next)');
  };

  const handleEditPost = (postId: string) => {
    // TODO: Load post data into form for editing
    alert('Edit functionality coming next');
  };

  const handleSchedulePost = (postId: string) => {
    // TODO: Move to scheduler
    alert('Schedule functionality coming next');
  };

  const handleDeletePost = (postId: string) => {
    setSavedPosts(prev => prev.filter(post => post.id !== postId));
  };

  const tabs = [
    { id: 'media', label: 'Create Content', icon: Image },
    { id: 'database', label: 'Database', icon: Database },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Content Manager</h1>
        <p className="text-gray-600">Create and manage your social media content</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'media' && (
          <div className="space-y-6">
            <ContentCreationForm
              onSave={handleSavePost}
              onAddToSchedule={handleAddToSchedule}
              characterProfiles={characterProfiles}
              contentTypes={contentTypes}
              templates={templates}
              platforms={platforms}
            />
            
            <SavedPostsList
              posts={savedPosts}
              onEditPost={handleEditPost}
              onSchedulePost={handleSchedulePost}
              onDeletePost={handleDeletePost}
            />
          </div>
        )}

        {activeTab === 'database' && <SupabaseConnection />}
      </div>
    </div>
  );
}
export default ContentComponent;
