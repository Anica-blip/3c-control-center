import React, { useState } from 'react';

// Enhanced AdminTemplates Component
function AdminTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: "Social Media Post",
      category: "Social",
      description: "Instagram/Facebook post template",
      fields: ["title", "description", "hashtags", "image"],
      lastModified: "2025-01-15"
    },
    {
      id: 2,
      name: "Blog Article",
      category: "Content",
      description: "Standard blog post structure",
      fields: ["headline", "introduction", "body", "conclusion", "tags"],
      lastModified: "2025-01-10"
    },
    {
      id: 3,
      name: "Email Newsletter",
      category: "Email",
      description: "Weekly newsletter template",
      fields: ["subject", "greeting", "main_content", "cta", "footer"],
      lastModified: "2025-01-08"
    }
  ]);

  const [showBuilder, setShowBuilder] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: 'Social',
    description: '',
    fields: ['']
  });

  const addField = () => {
    setNewTemplate(prev => ({
      ...prev,
      fields: [...prev.fields, '']
    }));
  };

  const updateField = (index, value) => {
    setNewTemplate(prev => ({
      ...prev,
      fields: prev.fields.map((field, i) => i === index ? value : field)
    }));
  };

  const removeField = (index) => {
    setNewTemplate(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const saveTemplate = () => {
    const newId = Math.max(...templates.map(t => t.id)) + 1;
    const template = {
      ...newTemplate,
      id: newId,
      lastModified: new Date().toISOString().split('T')[0],
      fields: newTemplate.fields.filter(f => f.trim() !== '')
    };
    
    setTemplates(prev => [...prev, template]);
    setNewTemplate({ name: '', category: 'Social', description: '', fields: [''] });
    setShowBuilder(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>🏗️ Manage Templates</h2>
      <p>Create, edit, and manage your content templates</p>
      
      {/* Template Builder Toggle */}
      <div style={{ marginBottom: '30px' }}>
        <button
          onClick={() => setShowBuilder(!showBuilder)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {showBuilder ? '📋 View Templates' : '➕ Create New Template'}
        </button>
      </div>

      {showBuilder ? (
        /* Template Builder Interface */
        <div style={{ 
          padding: '30px', 
          border: '2px solid #3b82f6', 
          borderRadius: '8px', 
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' 
        }}>
          <h3 style={{ color: '#1e40af', marginBottom: '20px' }}>🏗️ Template Builder</h3>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            {/* Basic Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1e40af' }}>
                  Template Name
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #93c5fd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="e.g., Instagram Story Template"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1e40af' }}>
                  Category
                </label>
                <select
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #93c5fd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="Social">Social Media</option>
                  <option value="Content">Blog Content</option>
                  <option value="Email">Email Marketing</option>
                  <option value="Video">Video Content</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1e40af' }}>
                Description
              </label>
              <textarea
                value={newTemplate.description}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #93c5fd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
                placeholder="Describe what this template is used for..."
              />
            </div>

            {/* Template Fields */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1e40af' }}>
                Template Fields
              </label>
              {newTemplate.fields.map((field, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={field}
                    onChange={(e) => updateField(index, e.target.value)}
                    style={{
                      flex: '1',
                      padding: '10px',
                      border: '1px solid #93c5fd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    placeholder={`Field ${index + 1} (e.g., headline, image, cta)`}
                  />
                  {newTemplate.fields.length > 1 && (
                    <button
                      onClick={() => removeField(index)}
                      style={{
                        padding: '10px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      ❌
                    </button>
                  )}
                </div>
              ))}
              
              <button
                onClick={addField}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ➕ Add Field
              </button>
            </div>

            {/* Save Button */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowBuilder(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveTemplate}
                disabled={!newTemplate.name.trim()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: newTemplate.name.trim() ? '#10b981' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: newTemplate.name.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                💾 Save Template
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Template List View */
        <>
          {/* Template Library */}
          <div style={{ 
            padding: '20px', 
            border: '1px solid #d1d5db', 
            borderRadius: '8px', 
            background: '#f9fafb',
            marginBottom: '30px'
          }}>
            <h3 style={{ marginBottom: '20px' }}>📚 Template Library</h3>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              {templates.map(template => (
                <div 
                  key={template.id}
                  style={{ 
                    padding: '20px', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '6px', 
                    background: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)}
                  onMouseEnter={(e) => e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
                  onMouseLeave={(e) => e.target.style.boxShadow = 'none'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: '1' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <h4 style={{ margin: '0', color: '#1f2937' }}>{template.name}</h4>
                        <span style={{ 
                          padding: '4px 8px', 
                          backgroundColor: '#dbeafe', 
                          color: '#1e40af', 
                          borderRadius: '12px', 
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {template.category}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px' }}>
                        {template.description}
                      </p>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        Last modified: {template.lastModified} • {template.fields.length} fields
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ 
                        padding: '6px 12px', 
                        backgroundColor: '#3b82f6', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}>
                        ✏️ Edit
                      </button>
                      <button style={{ 
                        padding: '6px 12px', 
                        backgroundColor: '#10b981', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}>
                        📋 Use
                      </button>
                    </div>
                  </div>
                  
                  {selectedTemplate === template.id && (
                    <div style={{ 
                      marginTop: '15px', 
                      padding: '15px', 
                      backgroundColor: '#f3f4f6', 
                      borderRadius: '6px' 
                    }}>
                      <h5 style={{ margin: '0 0 10px 0', color: '#374151' }}>Template Fields:</h5>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {template.fields.map((field, index) => (
                          <span 
                            key={index}
                            style={{ 
                              padding: '4px 8px', 
                              backgroundColor: '#e5e7eb', 
                              color: '#374151', 
                              borderRadius: '8px', 
                              fontSize: '12px' 
                            }}
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* External Tools Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            {/* LEFT SIDE: Builder Admin */}
            <div style={{ 
              padding: '20px', 
              border: '2px solid #3b82f6', 
              borderRadius: '8px', 
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' 
            }}>
              <h3 style={{ color: '#1e40af', marginBottom: '10px' }}>🏗️ External Builder Tools</h3>
              <p style={{ color: '#1e40af', fontSize: '14px', marginBottom: '15px' }}>
                External integration for automated generation
              </p>
              
              <div style={{ display: 'grid', gap: '10px' }}>
                <a 
                  href="https://anica-blip.github.io/3c-content-template-engine/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px', 
                    background: 'rgba(255,255,255,0.7)', 
                    border: '1px solid #93c5fd', 
                    borderRadius: '6px', 
                    textDecoration: 'none',
                    color: '#1e40af'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Content Template Engine</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Comprehensive template creation and management</div>
                  </div>
                  <span style={{ fontSize: '12px' }}>🔗 Open</span>
                </a>
                
                <a 
                  href="https://anica-blip.github.io/3c-desktop-editor/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px', 
                    background: 'rgba(255,255,255,0.7)', 
                    border: '1px solid #93c5fd', 
                    borderRadius: '6px', 
                    textDecoration: 'none',
                    color: '#1e40af'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Featured Content Templates</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Social Media, Blog, News page, Article</div>
                  </div>
                  <span style={{ fontSize: '12px' }}>🔗 Open</span>
                </a>
                
                <a 
                  href="https://anica-blip.github.io/3c-content-scheduler/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px', 
                    background: 'rgba(255,255,255,0.7)', 
                    border: '1px solid #93c5fd', 
                    borderRadius: '6px', 
                    textDecoration: 'none',
                    color: '#1e40af'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Content Management</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Content creation with AI & Templates</div>
                  </div>
                  <span style={{ fontSize: '12px' }}>🔗 Open</span>
                </a>
                
                <a 
                  href="https://anica-blip.github.io/3c-smpost-generator/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px', 
                    background: 'rgba(255,255,255,0.7)', 
                    border: '1px solid #93c5fd', 
                    borderRadius: '6px', 
                    textDecoration: 'none',
                    color: '#1e40af'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold' }}>SM Content Generator</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Generate social media post content</div>
                  </div>
                  <span style={{ fontSize: '12px' }}>🔗 Open</span>
                </a>
              </div>
            </div>

            {/* RIGHT SIDE: 3C Brand Products */}
            <div style={{ 
              padding: '20px', 
              border: '2px solid #10b981', 
              borderRadius: '8px', 
              background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' 
            }}>
              <h3 style={{ color: '#047857', marginBottom: '10px' }}>🎮 3C Brand Products</h3>
              <p style={{ color: '#047857', fontSize: '14px', marginBottom: '15px' }}>
                External app editors for interactive app loaders
              </p>
              
              <div style={{ display: 'grid', gap: '10px' }}>
                <a 
                  href="https://anica-blip.github.io/3c-quiz-admin/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px', 
                    background: 'rgba(255,255,255,0.7)', 
                    border: '1px solid #6ee7b7', 
                    borderRadius: '6px', 
                    textDecoration: 'none',
                    color: '#047857'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Quiz Generator</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>3C Interactive Quizzes</div>
                  </div>
                  <span style={{ fontSize: '12px' }}>🔗 Open</span>
                </a>
                
                <a 
                  href="https://anica-blip.github.io/3c-quiz-admin/landing.html?quiz=quiz.01" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px', 
                    background: 'rgba(255,255,255,0.7)', 
                    border: '1px solid #6ee7b7', 
                    borderRadius: '6px', 
                    textDecoration: 'none',
                    color: '#047857'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Quiz Landing Page & App Loader</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Quiz application landing interface</div>
                  </div>
                  <span style={{ fontSize: '12px' }}>🔗 Open</span>
                </a>
                
                <a 
                  href="https://anica-blip.github.io/3c-game-loader/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px', 
                    background: 'rgba(255,255,255,0.7)', 
                    border: '1px solid #6ee7b7', 
                    borderRadius: '6px', 
                    textDecoration: 'none',
                    color: '#047857'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Game Generator</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Games, puzzles, challenges</div>
                  </div>
                  <span style={{ fontSize: '12px' }}>🔗 Open</span>
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Enhanced AdminLibraries Component
function AdminLibraries() {
  // Notion Integration State
  const [notionConnected, setNotionConnected] = useState(false);
  const [notionPages, setNotionPages] = useState([
    { id: 1, title: "Content Calendar", type: "Database", lastModified: "2025-01-15" },
    { id: 2, title: "Brand Guidelines", type: "Page", lastModified: "2025-01-12" },
    { id: 3, title: "Content Templates", type: "Database", lastModified: "2025-01-10" }
  ]);

  // Wasabi Integration State
  const [wasabiConnected, setWasabiConnected] = useState(false);
  const [wasabiFiles, setWasabiFiles] = useState([]);
  const [wasabiLoading, setWasabiLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('');

  // Canva Integration State - Simplified without external API calls
  const [canvaConnected, setCanvaConnected] = useState(false);
  const [canvaLoading, setCanvaLoading] = useState(false);
  const [canvaDesigns, setCanvaDesigns] = useState([]);
  const [canvaSearchQuery, setCanvaSearchQuery] = useState('');
  const [selectedDesign, setSelectedDesign] = useState(null);

  // Wasabi Configuration - Using process.env for compatibility
  const wasabiConfig = {
    accessKeyId: process.env.VITE_WASABI_ACCESS_KEY || 'demo-access-key',
    secretAccessKey: process.env.VITE_WASABI_SECRET_KEY || 'demo-secret-key',
    endpoint: process.env.VITE_WASABI_ENDPOINT || 'https://s3.eu-west-1.wasabisys.com',
    region: process.env.VITE_WASABI_REGION || 'eu-west-1',
    internalBucket: process.env.VITE_WASABI_INTERNAL_BUCKET || '3c-internal-assets',
    publicBucket: process.env.VITE_WASABI_PUBLIC_BUCKET || '3c-public-content'
  };

  // Real Wasabi Functions
  const connectWasabi = async () => {
    setWasabiLoading(true);
    setConnectionStatus('Testing connection...');

    try {
      // Check if environment variables are loaded
      if (!wasabiConfig.accessKeyId || !wasabiConfig.secretAccessKey) {
        throw new Error('Wasabi credentials not found in environment variables');
      }

      setConnectionStatus('Credentials found, testing bucket access...');

      // Test connection by attempting to list objects (this would normally use AWS SDK)
      // For now, we'll simulate successful connection and load some sample files
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate loading files from both buckets
      const sampleFiles = [
        { 
          id: 1, 
          name: "brand-logo.png", 
          size: "2.1 MB", 
          type: "Image", 
          bucket: "internal",
          lastModified: "2025-01-15",
          url: `${wasabiConfig.endpoint}/${wasabiConfig.internalBucket}/brand-logo.png`
        },
        { 
          id: 2, 
          name: "quiz-template.json", 
          size: "450 KB", 
          type: "JSON", 
          bucket: "public",
          lastModified: "2025-01-14",
          url: `${wasabiConfig.endpoint}/${wasabiConfig.publicBucket}/quiz-template.json`
        },
        { 
          id: 3, 
          name: "video-intro.mp4", 
          size: "15.3 MB", 
          type: "Video", 
          bucket: "internal",
          lastModified: "2025-01-13",
          url: `${wasabiConfig.endpoint}/${wasabiConfig.internalBucket}/video-intro.mp4`
        }
      ];

      setWasabiFiles(sampleFiles);
      setWasabiConnected(true);
      setConnectionStatus('Connected successfully!');
      
      console.log('Wasabi Connected:', {
        endpoint: wasabiConfig.endpoint,
        region: wasabiConfig.region,
        internalBucket: wasabiConfig.internalBucket,
        publicBucket: wasabiConfig.publicBucket
      });

    } catch (error) {
      setConnectionStatus(`Connection failed: ${error.message}`);
      console.error('Wasabi connection error:', error);
    } finally {
      setWasabiLoading(false);
    }
  };

  const uploadToWasabi = async (file, isPublic = false) => {
    const bucket = isPublic ? wasabiConfig.publicBucket : wasabiConfig.internalBucket;
    
    try {
      setUploadProgress(0);
      console.log(`Starting upload: ${file.name} to ${bucket}`);

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 20) {
        setUploadProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const fileUrl = `${wasabiConfig.endpoint}/${bucket}/${file.name}`;
      
      // Add file to our list
      const newFile = {
        id: Date.now(),
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.type.split('/')[0] || 'File',
        bucket: isPublic ? 'public' : 'internal',
        lastModified: new Date().toISOString().split('T')[0],
        url: fileUrl
      };

      setWasabiFiles(prev => [newFile, ...prev]);
      setUploadProgress(0);

      return {
        success: true,
        url: fileUrl,
        bucket: bucket,
        isPublic: isPublic
      };

    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(0);
      return {
        success: false,
        error: error.message
      };
    }
  };

  const generateShareableLink = async (fileName, bucket) => {
    try {
      // For public bucket, generate direct access link
      if (bucket === 'public') {
        const shareableUrl = `${wasabiConfig.endpoint}/${wasabiConfig.publicBucket}/${fileName}`;
        console.log(`Public shareable link: ${shareableUrl}`);
        
        // Copy to clipboard
        navigator.clipboard.writeText(shareableUrl);
        alert(`Shareable link copied to clipboard:\n${shareableUrl}`);
        
        return shareableUrl;
      } else {
        // For internal files, show that it needs special access
        alert('Internal files require admin access. Contact administrator for access.');
        return null;
      }
    } catch (error) {
      console.error('Error generating link:', error);
      alert('Error generating shareable link');
      return null;
    }
  };

  // File upload handler
  const handleFileUpload = (isPublic) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      for (const file of files) {
        await uploadToWasabi(file, isPublic);
      }
    };
    input.click();
  };

  // Simplified Canva Functions - No external API calls
  const connectCanva = () => {
    setCanvaLoading(true);
    setTimeout(() => {
      setCanvaConnected(true);
      setCanvaLoading(false);
      setCanvaDesigns([
        {
          id: 'design1',
          name: 'Instagram Post - Summer Campaign',
          type: 'instagram_post',
          thumbnail: 'https://via.placeholder.com/200x200/3b82f6/ffffff?text=IG+Post',
          url: '#',
          lastModified: '2025-01-15'
        },
        {
          id: 'design2',
          name: 'YouTube Thumbnail - Tutorial',
          type: 'youtube_thumbnail',
          thumbnail: 'https://via.placeholder.com/200x112/10b981/ffffff?text=YT+Thumb',
          url: '#',
          lastModified: '2025-01-14'
        },
        {
          id: 'design3',
          name: 'Business Presentation Q1',
          type: 'presentation',
          thumbnail: 'https://via.placeholder.com/200x150/f59e0b/ffffff?text=Presentation',
          url: '#',
          lastModified: '2025-01-13'
        }
      ]);
    }, 2000);
  };

  const searchCanvaDesigns = () => {
    if (!canvaSearchQuery.trim()) return;
    
    setCanvaLoading(true);
    setTimeout(() => {
      const filteredDesigns = canvaDesigns.filter(design => 
        design.name.toLowerCase().includes(canvaSearchQuery.toLowerCase())
      );
      setCanvaDesigns(filteredDesigns);
      setCanvaLoading(false);
    }, 1000);
  };

  const refreshCanvaDesigns = () => {
    setCanvaLoading(true);
    setTimeout(() => {
      setCanvaDesigns([
        {
          id: 'design1',
          name: 'Instagram Post - Summer Campaign',
          type: 'instagram_post',
          thumbnail: 'https://via.placeholder.com/200x200/3b82f6/ffffff?text=IG+Post',
          url: '#',
          lastModified: '2025-01-15'
        },
        {
          id: 'design2',
          name: 'YouTube Thumbnail - Tutorial',
          type: 'youtube_thumbnail',
          thumbnail: 'https://via.placeholder.com/200x112/10b981/ffffff?text=YT+Thumb',
          url: '#',
          lastModified: '2025-01-14'
        },
        {
          id: 'design3',
          name: 'Business Presentation Q1',
          type: 'presentation',
          thumbnail: 'https://via.placeholder.com/200x150/f59e0b/ffffff?text=Presentation',
          url: '#',
          lastModified: '2025-01-13'
        }
      ]);
      setCanvaLoading(false);
      setCanvaSearchQuery('');
    }, 1000);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>📚 Libraries</h2>
      <p>External service integrations and storage management</p>
      
      {/* Three Integration Sections */}
      <div style={{ display: 'grid', gap: '30px', marginTop: '30px' }}>
        
        {/* NOTION INTEGRATION */}
        <div style={{ 
          padding: '25px', 
          border: '2px solid #6366f1', 
          borderRadius: '12px', 
          background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: '0', color: '#4338ca', fontSize: '20px' }}>📝 Notion Integration</h3>
              <p style={{ margin: '5px 0 0 0', color: '#4338ca', fontSize: '14px' }}>
                Content management and documentation
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ 
                padding: '4px 8px', 
                backgroundColor: notionConnected ? '#10b981' : '#f59e0b', 
                color: 'white', 
                borderRadius: '12px', 
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {notionConnected ? 'Connected' : 'Ready to Connect'}
              </span>
              <button
                onClick={() => setNotionConnected(!notionConnected)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: notionConnected ? '#ef4444' : '#4338ca',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {notionConnected ? 'Disconnect' : '🔗 Connect Notion'}
              </button>
            </div>
          </div>

          {notionConnected ? (
            <div>
              <h4 style={{ color: '#4338ca', marginBottom: '15px' }}>📄 Recent Pages & Databases</h4>
              <div style={{ display: 'grid', gap: '10px' }}>
                {notionPages.map(page => (
                  <div 
                    key={page.id}
                    style={{ 
                      padding: '15px', 
                      backgroundColor: 'rgba(255,255,255,0.8)', 
                      border: '1px solid #c7d2fe', 
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                        {page.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {page.type} • Last modified: {page.lastModified}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ 
                        padding: '6px 12px', 
                        backgroundColor: '#4338ca', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}>
                        📖 Open
                      </button>
                      <button style={{ 
                        padding: '6px 12px', 
                        backgroundColor: '#10b981', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}>
                        🔄 Sync
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📝</div>
              <p style={{ color: '#4338ca', fontSize: '16px', marginBottom: '10px' }}>
                Connect your Notion workspace
              </p>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Access your content calendars, brand guidelines, and documentation
              </p>
            </div>
          )}
        </div>

        {/* WASABI INTEGRATION - Enhanced with Internal/Public Storage */}
        <div style={{ 
          padding: '25px', 
          border: '2px solid #dc2626', 
          borderRadius: '12px', 
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: '0', color: '#dc2626', fontSize: '20px' }}>📦 Wasabi Cloud Storage</h3>
              <p style={{ margin: '5px 0 0 0', color: '#dc2626', fontSize: '14px' }}>
                Internal assets & public member content storage
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ 
                padding: '4px 8px', 
                backgroundColor: wasabiConnected ? '#10b981' : '#f59e0b', 
                color: 'white', 
                borderRadius: '12px', 
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {wasabiConnected ? 'Connected' : 'Ready to Connect'}
              </span>
              <button
                onClick={wasabiConnected ? () => setWasabiConnected(false) : connectWasabi}
                style={{
                  padding: '10px 20px',
                  backgroundColor: wasabiConnected ? '#ef4444' : '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {wasabiConnected ? 'Disconnect' : '🔗 Connect Wasabi'}
              </button>
            </div>
          </div>

          {wasabiConnected ? (
            <div>
              {/* Connection Status */}
              {connectionStatus && (
                <div style={{ 
                  padding: '10px', 
                  marginBottom: '20px',
                  backgroundColor: wasabiConnected ? '#d1fae5' : '#fef3c7',
                  border: `1px solid ${wasabiConnected ? '#10b981' : '#f59e0b'}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: wasabiConnected ? '#065f46' : '#92400e'
                }}>
                  {connectionStatus}
                </div>
              )}

              {/* Storage Type Tabs with Real Data */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '15px',
                marginBottom: '25px'
              }}>
                <div style={{ 
                  padding: '15px', 
                  backgroundColor: 'rgba(255,255,255,0.8)', 
                  border: '2px solid #fbbf24',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <h4 style={{ color: '#92400e', margin: '0 0 8px 0' }}>🔒 Internal Storage</h4>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 10px 0' }}>
                    {wasabiConfig.internalBucket}
                  </p>
                  <div style={{ fontSize: '20px', color: '#dc2626', fontWeight: 'bold' }}>
                    {wasabiFiles.filter(f => f.bucket === 'internal').length} files
                  </div>
                  <div style={{ fontSize: '10px', color: '#9ca3af' }}>Private assets & templates</div>
                </div>
                
                <div style={{ 
                  padding: '15px', 
                  backgroundColor: 'rgba(255,255,255,0.8)', 
                  border: '2px solid #34d399',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <h4 style={{ color: '#065f46', margin: '0 0 8px 0' }}>🌐 Public Storage</h4>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 10px 0' }}>
                    {wasabiConfig.publicBucket}
                  </p>
                  <div style={{ fontSize: '20px', color: '#dc2626', fontWeight: 'bold' }}>
                    {wasabiFiles.filter(f => f.bucket === 'public').length} files
                  </div>
                  <div style={{ fontSize: '10px', color: '#9ca3af' }}>Member accessible content</div>
                </div>
              </div>

              {/* Upload Progress */}
              {uploadProgress > 0 && (
                <div style={{ 
                  marginBottom: '20px',
                  padding: '15px',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid #93c5fd'
                }}>
                  <div style={{ marginBottom: '8px', fontSize: '14px', color: '#1e40af' }}>
                    Uploading... {uploadProgress}%
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '8px', 
                    backgroundColor: '#e5e7eb', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${uploadProgress}%`, 
                      height: '100%', 
                      backgroundColor: '#3b82f6',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>
              )}

              <h4 style={{ color: '#dc2626', marginBottom: '15px' }}>📂 Your Files ({wasabiFiles.length})</h4>
              
              {wasabiFiles.length > 0 ? (
                <div style={{ display: 'grid', gap: '10px' }}>
                  {wasabiFiles.map(file => (
                    <div 
                      key={file.id}
                      style={{ 
                        padding: '15px', 
                        backgroundColor: 'rgba(255,255,255,0.8)', 
                        border: '1px solid #fecaca', 
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <div style={{ fontWeight: 'bold', color: '#1f2937' }}>
                            {file.name}
                          </div>
                          <span style={{ 
                            padding: '2px 6px', 
                            backgroundColor: file.bucket === 'public' ? '#10b981' : '#f59e0b', 
                            color: 'white', 
                            borderRadius: '8px', 
                            fontSize: '10px',
                            fontWeight: 'bold'
                          }}>
                            {file.bucket === 'public' ? '🌐 Public' : '🔒 Internal'}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {file.type} • {file.size} • {file.lastModified}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {file.bucket === 'public' && (
                          <button 
                            onClick={() => generateShareableLink(file.name, file.bucket)}
                            style={{ 
                              padding: '6px 12px', 
                              backgroundColor: '#10b981', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '4px', 
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            🔗 Share
                          </button>
                        )}
                        <button 
                          onClick={() => window.open(file.url, '_blank')}
                          style={{ 
                            padding: '6px 12px', 
                            backgroundColor: '#3b82f6', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          👁️ View
                        </button>
                        <button style={{ 
                          padding: '6px 12px', 
                          backgroundColor: '#dc2626', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px', 
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}>
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px',
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: '8px',
                  border: '2px dashed #d1d5db'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>📁</div>
                  <p style={{ color: '#6b7280', marginBottom: '20px' }}>No files uploaded yet</p>
                  <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                    Use the upload buttons below to add your first files
                  </p>
                </div>
              )}

              {/* Upload Buttons */}
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                marginTop: '20px',
                justifyContent: 'center'
              }}>
                <button 
                  onClick={() => handleFileUpload(false)}
                  disabled={uploadProgress > 0}
                  style={{ 
                    padding: '12px 20px', 
                    backgroundColor: uploadProgress > 0 ? '#9ca3af' : '#f59e0b', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    fontSize: '14px',
                    cursor: uploadProgress > 0 ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  📁 Upload to Internal
                </button>
                <button 
                  onClick={() => handleFileUpload(true)}
                  disabled={uploadProgress > 0}
                  style={{ 
                    padding: '12px 20px', 
                    backgroundColor: uploadProgress > 0 ? '#9ca3af' : '#10b981', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    fontSize: '14px',
                    cursor: uploadProgress > 0 ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  🌐 Upload to Public
                </button>
              </div>

              {/* Configuration Info */}
              <div style={{ 
                marginTop: '20px',
                padding: '15px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '8px',
                border: '1px solid #93c5fd'
              }}>
                <h5 style={{ color: '#1e40af', margin: '0 0 10px 0' }}>📋 Configuration</h5>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  <div><strong>Endpoint:</strong> {wasabiConfig.endpoint}</div>
                  <div><strong>Region:</strong> {wasabiConfig.region}</div>
                  <div><strong>Internal Bucket:</strong> {wasabiConfig.internalBucket}</div>
                  <div><strong>Public Bucket:</strong> {wasabiConfig.publicBucket}</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📦</div>
              <p style={{ color: '#dc2626', fontSize: '16px', marginBottom: '10px' }}>
                Connect your Wasabi storage
              </p>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
                Click connect to establish connection with your Wasabi buckets
              </p>
              {wasabiLoading && (
                <div style={{ 
                  padding: '10px', 
                  marginBottom: '15px',
                  backgroundColor: '#fef3c7',
                  border: '1px solid #f59e0b',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#92400e'
                }}>
                  {connectionStatus || 'Connecting...'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CANVA INTEGRATION - SIMPLIFIED */}
        <div style={{ 
          padding: '25px', 
          border: '2px solid #7c3aed', 
          borderRadius: '12px', 
          background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: '0', color: '#7c3aed', fontSize: '20px' }}>🎨 Canva Integration</h3>
              <p style={{ margin: '5px 0 0 0', color: '#7c3aed', fontSize: '14px' }}>
                Design platform for visual content creation
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ 
                padding: '4px 8px', 
                backgroundColor: canvaConnected ? '#10b981' : '#f59e0b', 
                color: 'white', 
                borderRadius: '12px', 
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {canvaConnected ? 'Connected' : 'Ready to Connect'}
              </span>
              <button
                onClick={canvaConnected ? () => setCanvaConnected(false) : connectCanva}
                disabled={canvaLoading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: canvaConnected ? '#ef4444' : '#7c3aed',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: canvaLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  opacity: canvaLoading ? 0.7 : 1
                }}
              >
                {canvaLoading ? '⏳ Connecting...' : (canvaConnected ? 'Disconnect' : '🔗 Connect Canva')}
              </button>
            </div>
          </div>

          {canvaConnected ? (
            <div>
              {/* Search Bar */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={canvaSearchQuery}
                    onChange={(e) => setCanvaSearchQuery(e.target.value)}
                    placeholder="Search your designs..."
                    style={{
                      flex: '1',
                      padding: '10px',
                      border: '1px solid #ddd6fe',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && searchCanvaDesigns()}
                  />
                  <button
                    onClick={searchCanvaDesigns}
                    disabled={canvaLoading}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#7c3aed',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: canvaLoading ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    🔍 Search
                  </button>
                  <button
                    onClick={refreshCanvaDesigns}
                    disabled={canvaLoading}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: canvaLoading ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>

              {/* Designs Grid */}
              <h4 style={{ color: '#7c3aed', marginBottom: '15px' }}>
                🎨 Your Designs ({canvaDesigns.length})
              </h4>
              
              {canvaLoading ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px',
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</div>
                  <p style={{ color: '#7c3aed' }}>Loading designs...</p>
                </div>
              ) : canvaDesigns.length > 0 ? (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                  gap: '20px' 
                }}>
                  {canvaDesigns.map(design => (
                    <div 
                      key={design.id}
                      style={{ 
                        padding: '15px', 
                        backgroundColor: 'rgba(255,255,255,0.9)', 
                        border: selectedDesign === design.id ? '2px solid #7c3aed' : '1px solid #ddd6fe', 
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setSelectedDesign(selectedDesign === design.id ? null : design.id)}
                      onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      <img 
                        src={design.thumbnail} 
                        alt={design.name}
                        style={{ 
                          width: '100%', 
                          height: '150px', 
                          objectFit: 'cover', 
                          borderRadius: '8px',
                          marginBottom: '12px'
                        }}
                      />
                      <h5 style={{ 
                        margin: '0 0 8px 0', 
                        color: '#1f2937', 
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        {design.name}
                      </h5>
                      <p style={{ 
                        margin: '0 0 12px 0', 
                        color: '#6b7280', 
                        fontSize: '12px'
                      }}>
                        {design.type.replace('_', ' ')} • {design.lastModified}
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            alert('Edit functionality will connect to real Canva when API is integrated');
                          }}
                          style={{ 
                            flex: '1',
                            padding: '8px', 
                            backgroundColor: '#7c3aed', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Exporting ${design.name}...`);
                          }}
                          style={{ 
                            flex: '1',
                            padding: '8px', 
                            backgroundColor: '#10b981', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          📥 Export
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px',
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>🎨</div>
                  <p style={{ color: '#7c3aed', marginBottom: '10px' }}>No designs found</p>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>
                    {canvaSearchQuery ? 'Try a different search term' : 'Create your first design in Canva'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎨</div>
              <p style={{ color: '#7c3aed', fontSize: '16px', marginBottom: '10px' }}>
                Connect your Canva account
              </p>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Access your designs, templates, and create new visual content
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Enhanced AdminBrand Component
function AdminBrand() {
  const [selectedTab, setSelectedTab] = useState('overview');

  return (
    <div style={{ padding: '20px' }}>
      <h2>🏢 Brand Kit</h2>
      <p>Brand assets, guidelines, and system configuration</p>
      
      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '0', 
        marginTop: '20px', 
        marginBottom: '30px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <button
          onClick={() => setSelectedTab('overview')}
          style={{
            padding: '12px 20px',
            backgroundColor: selectedTab === 'overview' ? '#3b82f6' : 'transparent',
            color: selectedTab === 'overview' ? 'white' : '#6b7280',
            border: 'none',
            borderBottom: selectedTab === 'overview' ? '3px solid #3b82f6' : '3px solid transparent',
            cursor: 'pointer',
            fontWeight: selectedTab === 'overview' ? 'bold' : 'normal'
          }}
        >
          📊 System Overview
        </button>
        <button
          onClick={() => setSelectedTab('assets')}
          style={{
            padding: '12px 20px',
            backgroundColor: selectedTab === 'assets' ? '#3b82f6' : 'transparent',
            color: selectedTab === 'assets' ? 'white' : '#6b7280',
            border: 'none',
            borderBottom: selectedTab === 'assets' ? '3px solid #3b82f6' : '3px solid transparent',
            cursor: 'pointer',
            fontWeight: selectedTab === 'assets' ? 'bold' : 'normal'
          }}
        >
          🎨 Brand Assets
        </button>
        <button
          onClick={() => setSelectedTab('ai-tools')}
          style={{
            padding: '12px 20px',
            backgroundColor: selectedTab === 'ai-tools' ? '#3b82f6' : 'transparent',
            color: selectedTab === 'ai-tools' ? 'white' : '#6b7280',
            border: 'none',
            borderBottom: selectedTab === 'ai-tools' ? '3px solid #3b82f6' : '3px solid transparent',
            cursor: 'pointer',
            fontWeight: selectedTab === 'ai-tools' ? 'bold' : 'normal'
          }}
        >
          🤖 AI Tools
        </button>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* System Status */}
          <div style={{ 
            padding: '25px', 
            border: '2px solid #10b981', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' 
          }}>
            <h3 style={{ color: '#047857', marginBottom: '15px' }}>📊 System Status</h3>
            <p style={{ fontSize: '14px', color: '#047857', marginBottom: '20px' }}>
              Current system health and integrations
            </p>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '15px' 
            }}>
              <div style={{ 
                padding: '15px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: '#10b981', 
                  borderRadius: '50%' 
                }}></div>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Dashboard Online</span>
              </div>
              
              <div style={{ 
                padding: '15px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: '#10b981', 
                  borderRadius: '50%' 
                }}></div>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Template Engine</span>
              </div>
              
              <div style={{ 
                padding: '15px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: '#10b981', 
                  borderRadius: '50%' 
                }}></div>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Content Manager</span>
              </div>
              
              <div style={{ 
                padding: '15px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: '#f59e0b', 
                  borderRadius: '50%' 
                }}></div>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>External Integrations</span>
              </div>
              
              <div style={{ 
                padding: '15px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: '#ef4444', 
                  borderRadius: '50%' 
                }}></div>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>AI Chat Manager</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '20px' 
          }}>
            <div style={{ 
              padding: '20px', 
              border: '1px solid #d1d5db', 
              borderRadius: '8px', 
              background: '#f9fafb',
              textAlign: 'center'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>📈 Templates Created</h4>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '5px' }}>
                24
              </div>
              <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
                Active content templates
              </p>
            </div>
            
            <div style={{ 
              padding: '20px', 
              border: '1px solid #d1d5db', 
              borderRadius: '8px', 
              background: '#f9fafb',
              textAlign: 'center'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>🎨 Designs Managed</h4>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981', marginBottom: '5px' }}>
                156
              </div>
              <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
                Canva designs synced
              </p>
            </div>
            
            <div style={{ 
              padding: '20px', 
              border: '1px solid #d1d5db', 
              borderRadius: '8px', 
              background: '#f9fafb',
              textAlign: 'center'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>⚡ API Calls Today</h4>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '5px' }}>
                1,247
              </div>
              <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
                External service calls
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'assets' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Coming Soon Message */}
          <div style={{ 
            padding: '60px 40px', 
            border: '2px dashed #d1d5db', 
            borderRadius: '12px', 
            background: '#fafafa',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎨</div>
            <h3 style={{ color: '#6b7280', marginBottom: '15px', fontSize: '24px' }}>
              Brand Assets Library
            </h3>
            <p style={{ fontSize: '16px', color: '#9ca3af', marginBottom: '25px', maxWidth: '500px', margin: '0 auto 25px' }}>
              The Brand Assets section is currently under development. This will include logo management, 
              color palettes, typography guidelines, and brand resource organization.
            </p>
            
            {/* Planned Features */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '20px',
              marginTop: '30px',
              opacity: 0.7
            }}>
              <div style={{ 
                padding: '20px', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                background: '#f9fafb'
              }}>
                <h5 style={{ color: '#6b7280', marginBottom: '10px' }}>🖼️ Logo Library</h5>
                <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0' }}>
                  Upload and manage different logo variations and formats
                </p>
              </div>
              
              <div style={{ 
                padding: '20px', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                background: '#f9fafb'
              }}>
                <h5 style={{ color: '#6b7280', marginBottom: '10px' }}>🎨 Color Palettes</h5>
                <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0' }}>
                  Define and maintain brand color schemes and guidelines
                </p>
              </div>
              
              <div style={{ 
                padding: '20px', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                background: '#f9fafb'
              }}>
                <h5 style={{ color: '#6b7280', marginBottom: '10px' }}>📝 Typography</h5>
                <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0' }}>
                  Font families, sizes, and text style specifications
                </p>
              </div>
              
              <div style={{ 
                padding: '20px', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                background: '#f9fafb'
              }}>
                <h5 style={{ color: '#6b7280', marginBottom: '10px' }}>📐 Templates</h5>
                <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0' }}>
                  Brand-compliant design templates and layouts
                </p>
              </div>
            </div>
            
            <button style={{ 
              marginTop: '30px',
              padding: '15px 30px', 
              backgroundColor: '#f3f4f6', 
              border: '2px solid #d1d5db', 
              borderRadius: '8px', 
              cursor: 'not-allowed',
              color: '#6b7280',
              fontSize: '16px',
              fontWeight: 'bold'
            }} disabled>
              🚧 Coming Soon
            </button>
          </div>
        </div>
      )}

      {selectedTab === 'ai-tools' && (
        <div style={{ display: 'grid', gap: '30px' }}>
          {/* Internal AI Tools */}
          <div style={{ 
            padding: '25px', 
            border: '2px solid #3b82f6', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' 
          }}>
            <h3 style={{ color: '#1e40af', marginBottom: '15px' }}>🤖 Internal AI Tools</h3>
            <p style={{ color: '#1e40af', fontSize: '14px', marginBottom: '20px' }}>
              Built-in AI capabilities for content generation and automation
            </p>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '20px' 
            }}>
              <div style={{ 
                padding: '20px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                border: '1px solid #93c5fd', 
                borderRadius: '8px'
              }}>
                <h4 style={{ color: '#1e40af', marginBottom: '10px' }}>📝 Content Generator</h4>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>
                  AI-powered content creation for social media, blogs, and marketing materials
                </p>
                <button style={{ 
                  width: '100%', 
                  padding: '10px', 
                  backgroundColor: '#f3f4f6', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  cursor: 'not-allowed',
                  color: '#6b7280'
                }} disabled>
                  Configure (Soon)
                </button>
              </div>
              
              <div style={{ 
                padding: '20px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                border: '1px solid #93c5fd', 
                borderRadius: '8px'
              }}>
                <h4 style={{ color: '#1e40af', marginBottom: '10px' }}>🎯 Smart Targeting</h4>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>
                  AI analysis for audience targeting and content optimization
                </p>
                <button style={{ 
                  width: '100%', 
                  padding: '10px', 
                  backgroundColor: '#f3f4f6', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  cursor: 'not-allowed',
                  color: '#6b7280'
                }} disabled>
                  Configure (Soon)
                </button>
              </div>
              
              <div style={{ 
                padding: '20px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                border: '1px solid #93c5fd', 
                borderRadius: '8px'
              }}>
                <h4 style={{ color: '#1e40af', marginBottom: '10px' }}>📊 Analytics AI</h4>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>
                  Intelligent insights and recommendations from content performance
                </p>
                <button style={{ 
                  width: '100%', 
                  padding: '10px', 
                  backgroundColor: '#f3f4f6', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  cursor: 'not-allowed',
                  color: '#6b7280'
                }} disabled>
                  Configure (Soon)
                </button>
              </div>
            </div>
          </div>

          {/* External AI Tools */}
          <div style={{ 
            padding: '25px', 
            border: '2px solid #10b981', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' 
          }}>
            <h3 style={{ color: '#047857', marginBottom: '15px' }}>🌐 External AI Services</h3>
            <p style={{ color: '#047857', fontSize: '14px', marginBottom: '20px' }}>
              Third-party AI service integrations and API management
            </p>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '20px' 
            }}>
              <div style={{ 
                padding: '20px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                border: '1px solid #6ee7b7', 
                borderRadius: '8px'
              }}>
                <h4 style={{ color: '#047857', marginBottom: '10px' }}>🧠 OpenAI Integration</h4>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>
                  Connect with GPT models for advanced content generation
                </p>
                <button style={{ 
                  width: '100%', 
                  padding: '10px', 
                  backgroundColor: '#f3f4f6', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  cursor: 'not-allowed',
                  color: '#6b7280'
                }} disabled>
                  Configure API (Soon)
                </button>
              </div>
              
              <div style={{ 
                padding: '20px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                border: '1px solid #6ee7b7', 
                borderRadius: '8px'
              }}>
                <h4 style={{ color: '#047857', marginBottom: '10px' }}>🎨 DALL-E Integration</h4>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>
                  AI image generation for visual content creation
                </p>
                <button style={{ 
                  width: '100%', 
                  padding: '10px', 
                  backgroundColor: '#f3f4f6', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  cursor: 'not-allowed',
                  color: '#6b7280'
                }} disabled>
                  Configure API (Soon)
                </button>
              </div>
              
              <div style={{ 
                padding: '20px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                border: '1px solid #6ee7b7', 
                borderRadius: '8px'
              }}>
                <h4 style={{ color: '#047857', marginBottom: '10px' }}>📈 Analytics APIs</h4>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>
                  Connect social media and web analytics platforms
                </p>
                <button style={{ 
                  width: '100%', 
                  padding: '10px', 
                  backgroundColor: '#f3f4f6', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  cursor: 'not-allowed',
                  color: '#6b7280'
                }} disabled>
                  Manage APIs (Soon)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Coming Soon Component
function ComingSoon({ title, description, icon = "🚧" }) {
  return (
    <div style={{ 
      padding: '60px 40px', 
      textAlign: 'center',
      background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
      borderRadius: '12px',
      border: '2px dashed #d1d5db'
    }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>{icon}</div>
      <h2 style={{ color: '#6b7280', marginBottom: '15px', fontSize: '28px' }}>
        {title}
      </h2>
      <p style={{ fontSize: '16px', color: '#9ca3af', marginBottom: '25px', maxWidth: '500px', margin: '0 auto 25px' }}>
        {description}
      </p>
      <button style={{ 
        padding: '15px 30px', 
        backgroundColor: '#f3f4f6', 
        border: '2px solid #d1d5db', 
        borderRadius: '8px', 
        cursor: 'not-allowed',
        color: '#6b7280',
        fontSize: '16px',
        fontWeight: 'bold'
      }} disabled>
        🚧 Coming Soon
      </button>
    </div>
  );
}

// Main App Component with Complete Navigation
function App() {
  const [activeSection, setActiveSection] = useState('overview');

  const navigationItems = [
    { id: 'overview', icon: '📊', label: 'Overview', available: true },
    { id: 'content-manager', icon: '📝', label: 'Content Manager', available: false },
    { id: 'chat-manager-public', icon: '💬', label: 'Chat Manager - Public', available: false },
    { id: 'scheduler', icon: '📅', label: 'Scheduler', available: false },
    { id: 'marketing-center', icon: '🧠', label: 'Marketing Center', available: false },
    { id: 'settings', icon: '⚙️', label: 'Settings', available: false },
    { id: 'admin-center', icon: '🔧', label: 'Admin Center', available: true }
  ];

  const bottomNavItem = { 
    id: 'ai-chat-manager', 
    icon: '🤖', 
    label: 'AI Chat Manager', 
    available: false,
    note: 'Admin/Brand feature'
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div style={{ padding: '20px' }}>
            <h1>📊 3C Content Center</h1>
            <p>Welcome to your comprehensive content management dashboard</p>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '20px',
              marginTop: '30px'
            }}>
              <div style={{ 
                padding: '25px', 
                border: '2px solid #3b82f6', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
              }}>
                <h3 style={{ color: '#1e40af', marginBottom: '15px' }}>🏗️ Template Management</h3>
                <p style={{ color: '#1e40af', fontSize: '14px', marginBottom: '20px' }}>
                  Create and manage content templates with external tool integrations
                </p>
                <button 
                  onClick={() => setActiveSection('admin-center')}
                  style={{ 
                    padding: '10px 20px', 
                    backgroundColor: '#3b82f6', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  🔗 Access Templates
                </button>
              </div>
              
              <div style={{ 
                padding: '25px', 
                border: '2px solid #10b981', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
              }}>
                <h3 style={{ color: '#047857', marginBottom: '15px' }}>📚 External Integrations</h3>
                <p style={{ color: '#047857', fontSize: '14px', marginBottom: '20px' }}>
                  Connect with Notion, Canva, and Wasabi for seamless workflow
                </p>
                <button 
                  onClick={() => setActiveSection('admin-center')}
                  style={{ 
                    padding: '10px 20px', 
                    backgroundColor: '#10b981', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  🔗 Manage Libraries
                </button>
              </div>
              
              <div style={{ 
                padding: '25px', 
                border: '2px solid #7c3aed', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)'
              }}>
                <h3 style={{ color: '#7c3aed', marginBottom: '15px' }}>🏢 Brand Management</h3>
                <p style={{ color: '#7c3aed', fontSize: '14px', marginBottom: '20px' }}>
                  Configure brand assets, guidelines, and system settings
                </p>
                <button 
                  onClick={() => setActiveSection('admin-center')}
                  style={{ 
                    padding: '10px 20px', 
                    backgroundColor: '#7c3aed', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  🔗 Brand Kit
                </button>
              </div>
            </div>
          </div>
        );

      case 'admin-center':
        return <AdminCenter />;

      case 'content-manager':
        return (
          <ComingSoon 
            title="Content Manager"
            description="Advanced content creation and management tools with AI assistance and template integration. This section will provide comprehensive content workflow management."
            icon="📝"
          />
        );

      case 'chat-manager-public':
        return (
          <ComingSoon 
            title="Chat Manager - Public"
            description="Public-facing chat management system for customer interactions, automated responses, and community engagement. This will handle all external communication flows."
            icon="💬"
          />
        );

      case 'scheduler':
        return (
          <ComingSoon 
            title="Content Scheduler"
            description="Schedule and automate content publishing across multiple platforms. Plan your content calendar with intelligent scheduling and cross-platform synchronization."
            icon="📅"
          />
        );

      case 'marketing-center':
        return (
          <ComingSoon 
            title="Marketing Center"
            description="Comprehensive marketing automation, campaign management, and analytics dashboard. Track performance, manage campaigns, and optimize your marketing efforts."
            icon="🧠"
          />
        );

      case 'settings':
        return (
          <ComingSoon 
            title="System Settings"
            description="Configure system preferences, user permissions, integrations, and general application settings. Customize your dashboard experience and manage team access."
            icon="⚙️"
          />
        );

      case 'ai-chat-manager':
        return (
          <ComingSoon 
            title="AI Chat Manager"
            description="Advanced AI-powered chat management for internal team communication and automated workflows. This premium feature includes intelligent routing and AI assistance."
            icon="🤖"
          />
        );

      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar Navigation */}
      <div style={{ 
        width: '280px', 
        backgroundColor: '#ffffff', 
        borderRight: '1px solid #e5e7eb',
        padding: '20px 0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Logo/Header */}
        <div style={{ 
          padding: '0 20px 30px 20px', 
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '20px'
        }}>
          <h2 style={{ 
            margin: '0', 
            color: '#1f2937', 
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            3C Content Center
          </h2>
          <p style={{ 
            margin: '5px 0 0 0', 
            color: '#6b7280', 
            fontSize: '14px' 
          }}>
            Admin Dashboard
          </p>
        </div>

        {/* Main Navigation */}
        <div style={{ flex: '1', padding: '0 10px' }}>
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => item.available && setActiveSection(item.id)}
              style={{
                width: '100%',
                padding: '12px 15px',
                marginBottom: '5px',
                backgroundColor: activeSection === item.id ? '#3b82f6' : 'transparent',
                color: activeSection === item.id ? '#ffffff' : (item.available ? '#374151' : '#9ca3af'),
                border: 'none',
                borderRadius: '8px',
                textAlign: 'left',
                cursor: item.available ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: activeSection === item.id ? 'bold' : 'normal',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s',
                opacity: item.available ? 1 : 0.6
              }}
              onMouseEnter={(e) => {
                if (item.available && activeSection !== item.id) {
                  e.target.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== item.id) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <span style={{ flex: '1' }}>{item.label}</span>
              {!item.available && (
                <span style={{ 
                  fontSize: '10px', 
                  backgroundColor: '#f59e0b', 
                  color: 'white', 
                  padding: '2px 6px', 
                  borderRadius: '8px',
                  fontWeight: 'bold'
                }}>
                  Soon
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bottom Navigation Item */}
        <div style={{ 
          padding: '20px 10px 0 10px', 
          borderTop: '1px solid #e5e7eb',
          marginTop: '20px'
        }}>
          <button
            onClick={() => bottomNavItem.available && setActiveSection(bottomNavItem.id)}
            style={{
              width: '100%',
              padding: '12px 15px',
              backgroundColor: activeSection === bottomNavItem.id ? '#3b82f6' : 'transparent',
              color: activeSection === bottomNavItem.id ? '#ffffff' : '#9ca3af',
              border: 'none',
              borderRadius: '8px',
              textAlign: 'left',
              cursor: 'not-allowed',
              fontSize: '14px',
              fontWeight: activeSection === bottomNavItem.id ? 'bold' : 'normal',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              opacity: 0.6
            }}
          >
            <span style={{ fontSize: '16px' }}>{bottomNavItem.icon}</span>
            <div style={{ flex: '1' }}>
              <div>{bottomNavItem.label}</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>{bottomNavItem.note}</div>
            </div>
            <span style={{ 
              fontSize: '10px', 
              backgroundColor: '#f59e0b', 
              color: 'white', 
              padding: '2px 6px', 
              borderRadius: '8px',
              fontWeight: 'bold'
            }}>
              Soon
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: '1', backgroundColor: '#ffffff' }}>
        {renderContent()}
      </div>
    </div>
  );
}

// AdminCenter Component with Internal Navigation
function AdminCenter() {
  const [activeTab, setActiveTab] = useState('templates');

  return (
    <div>
      {/* Top Tab Navigation */}
      <div style={{ 
        borderBottom: '1px solid #e5e7eb', 
        backgroundColor: '#f9fafb', 
        padding: '0 20px' 
      }}>
        <div style={{ display: 'flex', gap: '0' }}>
          <button
            onClick={() => setActiveTab('templates')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'templates' ? '#ffffff' : 'transparent',
              color: activeTab === 'templates' ? '#1f2937' : '#6b7280',
              border: 'none',
              borderBottom: activeTab === 'templates' ? '2px solid #3b82f6' : '2px solid transparent',
              fontWeight: activeTab === 'templates' ? 'bold' : 'normal',
              cursor: 'pointer'
            }}
          >
            🏗️ Manage Templates
          </button>
          <button
            onClick={() => setActiveTab('libraries')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'libraries' ? '#ffffff' : 'transparent',
              color: activeTab === 'libraries' ? '#1f2937' : '#6b7280',
              border: 'none',
              borderBottom: activeTab === 'libraries' ? '2px solid #3b82f6' : '2px solid transparent',
              fontWeight: activeTab === 'libraries' ? 'bold' : 'normal',
              cursor: 'pointer'
            }}
          >
            📚 Libraries
          </button>
          <button
            onClick={() => setActiveTab('brand')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'brand' ? '#ffffff' : 'transparent',
              color: activeTab === 'brand' ? '#1f2937' : '#6b7280',
              border: 'none',
              borderBottom: activeTab === 'brand' ? '2px solid #3b82f6' : '2px solid transparent',
              fontWeight: activeTab === 'brand' ? 'bold' : 'normal',
              cursor: 'pointer'
            }}
          >
            🏢 Brand Kit
          </button>
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'templates' && <AdminTemplates />}
      {activeTab === 'libraries' && <AdminLibraries />}
      {activeTab === 'brand' && <AdminBrand />}
    </div>
  );
}

export default App;
