// =============================================================================
// EXAMPLE: HOW TO UPDATE YOUR CONTENTCOMPONENT.TSX
// =============================================================================

import React, { useState } from 'react';
import { 
  CharacterProfileSelector,
  PlatformSelector,
  TemplateSelector,
  ContentLimitsIndicator,
  IntegrationStatus,
  QuickActions
} from './contentManagerIntegration';

// Add this import to your existing contentcomponent.tsx file
// The integration components will automatically pull data from Settings

function ContentComponent() {
  // Post creation state
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [selectedPlatformIds, setSelectedPlatformIds] = useState<string[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');

  // Quick actions for navigation
  const handleOpenSettings = () => {
    // Add your navigation logic here
    // For example: setActiveSection('settings') if you pass it as prop
    alert('Navigate to Settings (integrate with your navigation system)');
  };

  const handleOpenAdminCenter = () => {
    // Add your navigation logic here
    alert('Navigate to Admin Center (integrate with your navigation system)');
  };

  const handleCreatePost = () => {
    if (!selectedProfileId || selectedPlatformIds.length === 0 || !postContent.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    // Here you would save the post using your data connector
    // dataStore.addPostContent({...})
    
    alert('Post created successfully!');
    
    // Reset form
    setPostTitle('');
    setPostContent('');
    setSelectedTemplateId('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>
        📝 Content Manager
      </h2>

      {/* Integration Status - Shows what's available from Settings */}
      <IntegrationStatus />

      {/* Quick Actions - Links to Settings and Admin Center */}
      <QuickActions 
        onOpenSettings={handleOpenSettings}
        onOpenAdminCenter={handleOpenAdminCenter}
      />

      {/* Post Creation Form */}
      <div style={{ 
        backgroundColor: '#ffffff',
        padding: '25px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#374151' }}>
          ✍️ Create New Post
        </h3>

        {/* Character Profile Selection - FROM SETTINGS */}
        <CharacterProfileSelector
          selectedProfileId={selectedProfileId}
          onProfileChange={setSelectedProfileId}
        />

        {/* Platform Selection - FROM SETTINGS */}
        <PlatformSelector
          selectedPlatformIds={selectedPlatformIds}
          onPlatformsChange={setSelectedPlatformIds}
        />

        {/* Template Selection - FROM ADMIN CENTER */}
        <TemplateSelector
          selectedTemplateId={selectedTemplateId}
          onTemplateChange={setSelectedTemplateId}
          selectedPlatformIds={selectedPlatformIds}
        />

        {/* Post Title */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#374151' 
          }}>
            📄 Post Title
          </label>
          <input
            type="text"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            placeholder="Enter post title..."
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>

        {/* Post Content */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#374151' 
          }}>
            📝 Post Content *
          </label>
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Write your post content here..."
            rows={6}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Content Limits - AUTOMATIC FROM SELECTED PLATFORMS */}
        <ContentLimitsIndicator
          selectedPlatformIds={selectedPlatformIds}
          currentContentLength={postContent.length}
        />

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={handleCreatePost}
            style={{
              padding: '12px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ✅ Create Post
          </button>
          <button
            onClick={() => {
              setPostTitle('');
              setPostContent('');
              setSelectedTemplateId('');
            }}
            style={{
              padding: '12px 20px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🗑️ Clear Form
          </button>
        </div>
      </div>

      {/* Integration Demo Section */}
      <div style={{ 
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#f0fdf4',
        borderRadius: '12px',
        border: '2px solid #10b981'
      }}>
        <h4 style={{ color: '#047857', marginBottom: '15px' }}>
          ✅ Integration Working Successfully!
        </h4>
        <div style={{ fontSize: '14px', color: '#059669', lineHeight: '1.6' }}>
          <p><strong>Character Profiles</strong> are automatically loaded from Settings ⚙️</p>
          <p><strong>Platforms</strong> are automatically loaded from Settings ⚙️</p>
          <p><strong>Templates</strong> are automatically loaded from Admin Center 🔧</p>
          <p><strong>Content Limits</strong> are automatically calculated for each platform</p>
          <p><strong>Quick Actions</strong> provide easy navigation to Settings and Admin Center</p>
        </div>
      </div>
    </div>
  );
}

export default ContentComponent;
