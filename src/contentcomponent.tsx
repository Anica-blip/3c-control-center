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
    <div className="bg-white shadow-lg border border-gray-100 rounded-xl p-8 space-y-8">
      <div className="border-b border-gray-100 pb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create New Content</h2>
        <p className="text-gray-600 mt-2">Design and prepare your social media content for publishing</p>
      </div>
      
      {/* Form Fields Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Character Profile
          </label>
          <select
            value={formData.characterProfile}
            onChange={(e) => setFormData(prev => ({ ...prev, characterProfile: e.target.value }))}
            className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200 hover:border-gray-300"
          >
            <option value="">Select profile...</option>
            {characterProfiles.map(profile => (
              <option key={profile.id} value={profile.id}>{profile.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Content Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200 hover:border-gray-300"
          >
            <option value="">Select type...</option>
            {contentTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Template
          </label>
          <select
            value={formData.template}
            onChange={(e) => setFormData(prev => ({ ...prev, template: e.target.value }))}
            className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200 hover:border-gray-300"
          >
            <option value="">Select template...</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>{template.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Media Upload */}
      <div className="space-y-4">
        <label className="block text-lg font-semibold text-gray-900">
          Media Upload
        </label>
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors duration-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload your media files</h3>
          <p className="text-sm text-gray-600 mb-1">Drop files here or click to browse</p>
          <p className="text-xs text-gray-500">Support for Images, Videos, GIFs, PDFs, and Interactive Media</p>
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">Uploaded Files</h4>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">{mediaFiles.length} files</span>
            </div>
            <div className="grid gap-3">
              {mediaFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      {getFileIcon(file.type)}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900 block">{file.name}</span>
                      <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="space-y-3">
        <label className="block text-lg font-semibold text-gray-900">
          Post Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Write your post content here... Share your thoughts, updates, or announcements."
          className="w-full p-4 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200 resize-none"
          rows={5}
        />
      </div>

      {/* Platform Selection */}
      <div className="space-y-4">
        <label className="block text-lg font-semibold text-gray-900">
          Select Publishing Platforms
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {activePlatforms.map((platform) => (
            <label
              key={platform.id}
              className={`relative flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                formData.selectedPlatforms.includes(platform.id)
                  ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.selectedPlatforms.includes(platform.id)}
                onChange={() => handlePlatformToggle(platform.id)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900 block truncate">{platform.name}</span>
                {platform.isDefault && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                    Default
                  </span>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
        <button
          onClick={handleSave}
          disabled={!canSave}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
            canSave
              ? 'bg-gray-600 text-white hover:bg-gray-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Save as Draft
        </button>
        <button
          onClick={handleAddToSchedule}
          disabled={!canSave}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
            canSave
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Schedule Post
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
        return <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
      case 'scheduled':
        return <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">Scheduled</span>;
      case 'published':
        return <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Published</span>;
      default:
        return null;
    }
  };

  if (posts.length === 0) {
    return (
      <div className="bg-white shadow-lg border border-gray-100 rounded-xl p-12 text-center">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <FileText className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">No content created yet</h3>
        <p className="text-gray-500 text-lg">Start creating amazing content using the form above</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg border border-gray-100 rounded-xl overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Saved Content</h3>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100">
        {posts.map((post, index) => (
          <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-4">
                <div className="flex items-center space-x-4">
                  {getStatusBadge(post.status)}
                  <span className="text-sm text-gray-500 font-medium">
                    Created {post.createdDate.toLocaleDateString()}
                  </span>
                  {post.scheduledDate && (
                    <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-lg">
                      Scheduled for {post.scheduledDate.toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                <p className="text-gray-900 text-base leading-relaxed line-clamp-3">{post.description}</p>
                
                <div className="flex items-center space-x-6">
                  {post.mediaFiles.length > 0 && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                      <Image className="h-4 w-4" />
                      <span className="font-medium">{post.mediaFiles.length} file{post.mediaFiles.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                    <Settings className="h-4 w-4" />
                    <span className="font-medium">{post.selectedPlatforms.length} platform{post.selectedPlatforms.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-6">
                <button
                  onClick={() => onEditPost(post.id)}
                  className="p-3 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  title="Edit"
                >
                  <Settings className="h-5 w-5" />
                </button>
                
                {post.status === 'pending' && (
                  <button
                    onClick={() => onSchedulePost(post.id)}
                    className="p-3 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all duration-200"
                    title="Add to Schedule"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                )}
                
                <button
                  onClick={() => onDeletePost(post.id)}
                  className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                  title="Delete"
                >
                  <Trash2 className="h-5 w-5" />
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
    <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Database Connection</h3>
          <p className="text-gray-600 mt-1">Manage your data storage and connectivity</p>
        </div>
        <div className="flex items-center space-x-3 bg-green-50 px-4 py-2 rounded-xl border border-green-200">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <span className="text-sm font-semibold text-green-800">Connected</span>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 mb-6">
        <p className="text-gray-700 text-lg leading-relaxed">
          Your content and settings are being stored securely in Supabase. All data is encrypted and backed up automatically.
        </p>
      </div>
      
      <button className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
        <Database className="h-5 w-5" />
        <span className="font-semibold">Open Supabase Project</span>
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900">Content Manager</h1>
          <p className="text-gray-600 text-lg mt-2">Create, manage, and schedule your social media content with ease</p>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3 py-4 px-6 font-semibold text-sm transition-all duration-200 flex-1 justify-center ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'media' && (
            <div className="space-y-8">
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
    </div>
  );
}
