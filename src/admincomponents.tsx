import React, { useState, useEffect } from 'react';

// =============================================================================
// COMPLETE SUPABASE INTEGRATION WITH BUCKET → TABLE WORKFLOW
// =============================================================================

// Supabase Client Configuration
const supabaseConfig = {
  url: process.env.REACT_APP_SUPABASE_URL || 'your-supabase-url',
  anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key'
};

// Complete Supabase API with file upload and database integration
const supabaseAPI = {
  // Upload file to Supabase Storage bucket
  async uploadFileToBucket(file, fileName, bucketName = 'brand-assets') {
    console.log('📁 Uploading file to bucket:', { fileName, bucketName, size: file.size });
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${supabaseConfig.url}/storage/v1/object/${bucketName}/${fileName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`File upload failed: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Generate public URL
      const publicUrl = `${supabaseConfig.url}/storage/v1/object/public/${bucketName}/${fileName}`;
      
      console.log('✅ File uploaded to bucket:', { result, publicUrl });
      return {
        path: fileName,
        fullPath: `${bucketName}/${fileName}`,
        publicUrl: publicUrl
      };
    } catch (error) {
      console.error('💥 File upload error:', error);
      throw error;
    }
  },

  // Save file metadata to database
  async saveFileMetadata(fileData, bucketPath, publicUrl) {
    console.log('💾 Saving file metadata to database:', fileData);
    
    try {
      const response = await fetch(`${supabaseConfig.url}/rest/v1/brand_assets_metadata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          file_name: fileData.fileName,
          file_path: bucketPath,
          file_type: fileData.type,
          file_size: fileData.size,
          bucket_name: 'brand-assets',
          asset_type: fileData.assetType || 'logo',
          description: fileData.description,
          tags: fileData.tags || [],
          is_public: true
        })
      });
      
      if (!response.ok) {
        throw new Error(`Metadata save failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ File metadata saved to database:', result);
      return result;
    } catch (error) {
      console.error('💥 Metadata save error:', error);
      throw error;
    }
  },

  // Upload custom font files to Supabase bucket (BONUS FEATURE)
  async uploadCustomFont(fontFile, fontName) {
    console.log('🔤 Uploading custom font to Supabase bucket:', fontName);
    
    try {
      // Validate font file types
      const fileExtension = fontFile.name.split('.').pop().toLowerCase();
      const validExtensions = ['woff', 'woff2', 'ttf', 'otf'];
      
      if (!validExtensions.includes(fileExtension)) {
        throw new Error('Please upload WOFF, WOFF2, TTF, or OTF font files only');
      }
      
      if (fontFile.size > 5 * 1024 * 1024) { // 5MB limit for font files
        throw new Error('Font file size must be less than 5MB');
      }
      
      const timestamp = Date.now();
      const fileName = `fonts/${timestamp}_${fontFile.name}`;
      
      const uploadResult = await this.uploadFileToBucket(fontFile, fileName);
      
      // Generate @font-face CSS for the custom font
      const fontFaceCSS = this.generateFontFaceCSS(fontName, uploadResult.publicUrl, fileExtension);
      
      console.log('✅ Custom font uploaded:', { uploadResult, fontFaceCSS });
      return {
        path: fileName,
        publicUrl: uploadResult.publicUrl,
        fontFaceCSS: fontFaceCSS
      };
    } catch (error) {
      console.error('💥 Custom font upload error:', error);
      throw error;
    }
  },

  // Generate @font-face CSS for custom fonts (BONUS FEATURE)
  generateFontFaceCSS(fontName, fontUrl, fileExtension) {
    let format = 'woff2';
    if (fileExtension === 'woff') format = 'woff';
    if (fileExtension === 'ttf') format = 'truetype';
    if (fileExtension === 'otf') format = 'opentype';
    
    return `@font-face {
  font-family: '${fontName}';
  src: url('${fontUrl}') format('${format}');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}`;
  },

  // Load custom font from uploaded file (BONUS FEATURE)
  loadCustomFont(fontFaceCSS, fontName) {
    if (typeof document !== 'undefined') {
      // Check if font is already loaded
      const existingStyle = document.querySelector(`style[data-font="${fontName}"]`);
      if (existingStyle) return;
      
      // Create and inject @font-face CSS
      const style = document.createElement('style');
      style.setAttribute('data-font', fontName);
      style.textContent = fontFaceCSS;
      document.head.appendChild(style);
      
      console.log(`✅ Custom font loaded: ${fontName}`);
    }
  },

  // Complete workflow: Upload file + Save logo data + Save metadata
  async saveLogoComplete(logoData, file = null) {
    console.log('🏷️ Starting complete logo save workflow:', logoData);
    
    try {
      let fileUrl = logoData.fileUrl;
      let filePath = null;
      
      // Step 1: Upload file to bucket if provided
      if (file) {
        const timestamp = Date.now();
        const fileName = `logos/${timestamp}_${file.name}`;
        
        const uploadResult = await this.uploadFileToBucket(file, fileName);
        fileUrl = uploadResult.publicUrl;
        filePath = uploadResult.fullPath;
        
        // Step 2: Save file metadata
        await this.saveFileMetadata({
          fileName: file.name,
          type: file.type,
          size: file.size,
          assetType: 'logo',
          description: `Logo asset: ${logoData.name}`
        }, uploadResult.fullPath, uploadResult.publicUrl);
      }
      
      // Step 3: Save logo data to brand_logos table
      const response = await fetch(`${supabaseConfig.url}/rest/v1/brand_logos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          name: logoData.name,
          type: logoData.type || (file ? file.type.split('/')[1].toUpperCase() : 'PNG'),
          usage: logoData.usage,
          file_url: fileUrl,
          file_path: filePath,
          file_size: file ? `${(file.size / 1024).toFixed(1)} KB` : logoData.size,
          category: logoData.category || 'Primary Logo',
          bucket_name: 'brand-assets'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Logo save failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Logo saved completely (bucket + database):', result);
      return result;
    } catch (error) {
      console.error('💥 Complete logo save error:', error);
      throw error;
    }
  },

  // Save color to Supabase
  async saveColor(colorData) {
    console.log('🎨 Saving color to Supabase:', colorData);
    
    try {
      // Convert hex to RGB
      const hex = colorData.hex.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const rgbValues = `rgb(${r}, ${g}, ${b})`;
      
      const response = await fetch(`${supabaseConfig.url}/rest/v1/brand_colors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          name: colorData.name,
          hex_code: colorData.hex,
          usage: colorData.usage,
          rgb_values: rgbValues
        })
      });
      
      if (!response.ok) {
        throw new Error(`Color save failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Color saved to Supabase:', result);
      return result;
    } catch (error) {
      console.error('💥 Color save error:', error);
      throw error;
    }
  },

  // Save font to Supabase with Google Fonts integration
  async saveFont(fontData) {
    console.log('🔤 Saving font to Supabase:', fontData);
    
    try {
      // Generate Google Fonts URLs and CSS
      const googleFontsUrl = this.generateGoogleFontsUrl(fontData.name);
      const cssImport = googleFontsUrl ? `@import url("${googleFontsUrl}");` : null;
      const fontFamilyCSS = `font-family: "${fontData.name}", ui-sans-serif, system-ui, sans-serif;`;
      
      const response = await fetch(`${supabaseConfig.url}/rest/v1/typography_system`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          name: fontData.name,
          category: fontData.category,
          usage: fontData.usage,
          weight_range: fontData.weight || '400-600',
          google_fonts_url: googleFontsUrl,
          css_import: cssImport,
          font_family_css: fontFamilyCSS,
          font_source: 'google',
          status: 'Active'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Font save failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Font saved to Supabase:', result);
      
      // Load the font for immediate preview
      if (googleFontsUrl) {
        this.loadGoogleFont(googleFontsUrl, fontData.name);
      }
      
      return result;
    } catch (error) {
      console.error('💥 Font save error:', error);
      throw error;
    }
  },

  // Enhanced font save with custom upload support (BONUS FEATURE)
  async saveFontWithUpload(fontData, fontFile = null) {
    console.log('🔤 Saving font with optional file upload:', fontData);
    
    try {
      let customFontUrl = null;
      let fontFaceCSS = null;
      let googleFontsUrl = null;
      let fontSource = 'system';
      
      if (fontFile) {
        // Upload custom font file
        const uploadResult = await this.uploadCustomFont(fontFile, fontData.name);
        customFontUrl = uploadResult.publicUrl;
        fontFaceCSS = uploadResult.fontFaceCSS;
        fontSource = 'custom';
        
        // Load the custom font immediately for preview
        this.loadCustomFont(fontFaceCSS, fontData.name);
      } else {
        // Try Google Fonts
        googleFontsUrl = this.generateGoogleFontsUrl(fontData.name);
        if (googleFontsUrl) {
          fontSource = 'google';
          this.loadGoogleFont(googleFontsUrl, fontData.name);
        }
      }
      
      // Save to database with both custom and Google Fonts URLs
      const response = await fetch(`${supabaseConfig.url}/rest/v1/typography_system`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          name: fontData.name,
          category: fontData.category,
          usage: fontData.usage,
          weight_range: fontData.weight || '400-600',
          google_fonts_url: googleFontsUrl,
          css_import: fontFaceCSS || (googleFontsUrl ? `@import url("${googleFontsUrl}");` : null),
          font_family_css: `font-family: "${fontData.name}", ui-sans-serif, system-ui, sans-serif;`,
          custom_font_url: customFontUrl,
          font_source: fontSource,
          status: 'Active'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Font save failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Font saved with upload:', result);
      return result;
    } catch (error) {
      console.error('💥 Font save with upload error:', error);
      throw error;
    }
  },

  // Save guidelines to Supabase
  async saveGuidelines(section, content) {
    console.log('📋 Saving guidelines to Supabase:', { section, content });
    
    try {
      const response = await fetch(`${supabaseConfig.url}/rest/v1/brand_guidelines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          section: section,
          title: `${section.charAt(0).toUpperCase() + section.slice(1)} Guidelines`,
          content: typeof content === 'string' ? content : JSON.stringify(content),
          type: `${section.charAt(0).toUpperCase() + section.slice(1)} Usage`,
          status: 'Active',
          version_number: 1
        })
      });
      
      if (!response.ok) {
        throw new Error(`Guidelines save failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Guidelines saved to Supabase:', result);
      return result;
    } catch (error) {
      console.error('💥 Guidelines save error:', error);
      throw error;
    }
  },

  // Generate Google Fonts URL - Supports 1000+ fonts
  generateGoogleFontsUrl(fontName) {
    // Clean the font name for URL
    const cleanFontName = fontName.trim().replace(/\s+/g, '+');
    
    // Generate Google Fonts URL for ANY font name
    return `https://fonts.googleapis.com/css2?family=${cleanFontName}:wght@300;400;500;600;700&display=swap`;
  },

  // Load Google Font for preview - Enhanced with error handling
  loadGoogleFont(url, fontName) {
    if (typeof document !== 'undefined') {
      // Check if font is already loaded
      const existingLink = document.querySelector(`link[href="${url}"]`);
      if (existingLink) return;
      
      const link = document.createElement('link');
      link.href = url;
      link.rel = 'stylesheet';
      link.type = 'text/css';
      
      // Handle font load success/failure
      link.onload = () => {
        console.log(`✅ Google Font loaded successfully: ${fontName}`);
      };
      
      link.onerror = () => {
        console.log(`⚠️ Could not load Google Font: ${fontName} (may be system font or unavailable)`);
      };
      
      document.head.appendChild(link);
    }
  },

  // Load all fonts from database for preview
  async loadAllFontsForPreview() {
    try {
      const response = await fetch(`${supabaseConfig.url}/rest/v1/typography_system?select=name,google_fonts_url,css_import&is_active=eq.true`, {
        headers: {
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.anonKey}`
        }
      });
      
      if (response.ok) {
        const fonts = await response.json();
        fonts.forEach(font => {
          if (font.google_fonts_url) {
            this.loadGoogleFont(font.google_fonts_url, font.name);
          } else if (font.css_import && font.css_import.includes('@font-face')) {
            this.loadCustomFont(font.css_import, font.name);
          }
        });
        console.log('✅ All fonts loaded for preview:', fonts.length);
      }
    } catch (error) {
      console.log('⚠️ Could not load fonts for preview:', error);
    }
  }
};

// =============================================================================
// SAFE LOCALSTORAGE OPERATIONS
// =============================================================================

const safeLocalStorage = {
  getItem: (key, fallback = null) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
      }
    } catch (error) {
      console.warn('localStorage getItem failed:', error);
    }
    return fallback;
  },
  
  setItem: (key, value) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      }
    } catch (error) {
      console.warn('localStorage setItem failed:', error);
    }
    return false;
  }
};

// =============================================================================
// ADMIN COMPONENTS - WITH COMPLETE SUPABASE INTEGRATION
// =============================================================================

function AdminComponents({ isDarkMode = false }) {
  const [activeTab, setActiveTab] = useState('templates');

  // Load fonts for preview on component mount
  useEffect(() => {
    supabaseAPI.loadAllFontsForPreview();
  }, []);

  // Theme objects for consistent styling
  const theme = {
    background: isDarkMode ? '#1f2937' : '#ffffff',
    cardBackground: isDarkMode ? '#374151' : '#ffffff',
    headerBackground: isDarkMode ? '#111827' : '#f9fafb',
    borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
    textPrimary: isDarkMode ? '#f9fafb' : '#1f2937',
    textSecondary: isDarkMode ? '#d1d5db' : '#6b7280',
    buttonPrimary: isDarkMode ? '#3b82f6' : '#3b82f6',
    buttonSecondary: isDarkMode ? '#4b5563' : '#f3f4f6',
    buttonSecondaryText: isDarkMode ? '#f9fafb' : '#374151',
    inputBackground: isDarkMode ? '#374151' : '#ffffff',
    inputBorder: isDarkMode ? '#6b7280' : '#d1d5db',
    gradientBlue: isDarkMode 
      ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' 
      : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
    gradientGreen: isDarkMode 
      ? 'linear-gradient(135deg, #065f46 0%, #047857 100%)' 
      : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    gradientRed: isDarkMode 
      ? 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)' 
      : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    gradientPurple: isDarkMode 
      ? 'linear-gradient(135deg, #581c87 0%, #6b21a8 100%)' 
      : 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
  };

  return (
    <div style={{ backgroundColor: theme.background, minHeight: '100vh' }}>
      {/* Top Tab Navigation */}
      <div style={{ 
        borderBottom: `1px solid ${theme.borderColor}`, 
        backgroundColor: theme.headerBackground, 
        padding: '0 20px' 
      }}>
        <div style={{ display: 'flex', gap: '0' }}>
          <button
            onClick={() => setActiveTab('templates')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'templates' ? theme.background : 'transparent',
              color: activeTab === 'templates' ? theme.textPrimary : theme.textSecondary,
              border: 'none',
              borderBottom: activeTab === 'templates' ? '2px solid #3b82f6' : '2px solid transparent',
              fontWeight: activeTab === 'templates' ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🗂️ Manage Templates
          </button>
          <button
            onClick={() => setActiveTab('libraries')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'libraries' ? theme.background : 'transparent',
              color: activeTab === 'libraries' ? theme.textPrimary : theme.textSecondary,
              border: 'none',
              borderBottom: activeTab === 'libraries' ? '2px solid #3b82f6' : '2px solid transparent',
              fontWeight: activeTab === 'libraries' ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            📚 Libraries
          </button>
          <button
            onClick={() => setActiveTab('brand')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'brand' ? theme.background : 'transparent',
              color: activeTab === 'brand' ? theme.textPrimary : theme.textSecondary,
              border: 'none',
              borderBottom: activeTab === 'brand' ? '2px solid #3b82f6' : '2px solid transparent',
              fontWeight: activeTab === 'brand' ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🏢 Brand Kit
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ backgroundColor: theme.background }}>
        {activeTab === 'templates' && <AdminTemplatesTab theme={theme} />}
        {activeTab === 'libraries' && <AdminLibrariesTab theme={theme} />}
        {activeTab === 'brand' && <AdminBrandTab theme={theme} isDarkMode={isDarkMode} />}
      </div>
    </div>
  );
}

// =============================================================================
// TEMPLATES TAB (KEEP YOUR EXISTING CODE)
// =============================================================================

function AdminTemplatesTab({ theme }) {
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
    const newId = templates.length > 0 ? Math.max(...templates.map(t => t.id)) + 1 : 1;
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
    <div style={{ padding: '20px', backgroundColor: theme.background }}>
      <h2 style={{ color: theme.textPrimary, fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
        🗂️ Manage Templates
      </h2>
      <p style={{ color: theme.textSecondary, fontSize: '14px', margin: '0 0 30px 0' }}>
        Create, edit, and manage your content templates
      </p>
      
      {/* Template Builder Toggle */}
      <div style={{ marginBottom: '30px' }}>
        <button
          onClick={() => setShowBuilder(!showBuilder)}
          style={{
            padding: '12px 24px',
            backgroundColor: theme.buttonPrimary,
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 2px 6px rgba(59, 130, 246, 0.25)',
            transition: 'all 0.2s ease'
          }}
        >
          {showBuilder ? '📋 View Templates' : '➕ Create New Template'}
        </button>
      </div>

      {showBuilder ? (
        <div style={{ 
          padding: '30px', 
          border: '2px solid #3b82f6', 
          borderRadius: '12px', 
          background: theme.gradientBlue,
          marginBottom: '30px'
        }}>
          <h3 style={{ 
            color: theme.textPrimary, 
            marginBottom: '25px', 
            fontSize: '18px', 
            fontWeight: 'bold' 
          }}>
            🗂️ Template Builder
          </h3>
          
          <div style={{ display: 'grid', gap: '25px' }}>
            {/* Basic Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold', 
                  color: theme.textPrimary,
                  fontSize: '14px'
                }}>
                  Template Name
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: theme.inputBackground,
                    color: theme.textPrimary,
                    outline: 'none'
                  }}
                  placeholder="e.g., Instagram Story Template"
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold', 
                  color: theme.textPrimary,
                  fontSize: '14px'
                }}>
                  Category
                </label>
                <select
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: theme.inputBackground,
                    color: theme.textPrimary,
                    outline: 'none'
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
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 'bold', 
                color: theme.textPrimary,
                fontSize: '14px'
              }}>
                Description
              </label>
              <textarea
                value={newTemplate.description}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${theme.inputBorder}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: theme.inputBackground,
                  color: theme.textPrimary,
                  minHeight: '100px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
                placeholder="Describe what this template is used for..."
              />
            </div>

            {/* Template Fields */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '12px', 
                fontWeight: 'bold', 
                color: theme.textPrimary,
                fontSize: '14px'
              }}>
                Template Fields
              </label>
              {newTemplate.fields.map((field, index) => (
                <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <input
                    type="text"
                    value={field}
                    onChange={(e) => updateField(index, e.target.value)}
                    style={{
                      flex: '1',
                      padding: '12px',
                      border: `1px solid ${theme.inputBorder}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: theme.inputBackground,
                      color: theme.textPrimary,
                      outline: 'none'
                    }}
                    placeholder={`Field ${index + 1} (e.g., headline, image, cta)`}
                  />
                  {newTemplate.fields.length > 1 && (
                    <button
                      onClick={() => removeField(index)}
                      style={{
                        padding: '12px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      ✖
                    </button>
                  )}
                </div>
              ))}
              
              <button
                onClick={addField}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginTop: '8px'
                }}
              >
                ➕ Add Field
              </button>
            </div>

            {/* Save Button */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setShowBuilder(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: theme.buttonSecondary,
                  color: theme.buttonSecondaryText,
                  border: `1px solid ${theme.borderColor}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
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
                  borderRadius: '8px',
                  cursor: newTemplate.name.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                💾 Save Template
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Template Library */}
          <div style={{ 
            padding: '25px', 
            border: `1px solid ${theme.borderColor}`, 
            borderRadius: '12px', 
            backgroundColor: theme.cardBackground,
            marginBottom: '30px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ 
              marginBottom: '25px', 
              color: theme.textPrimary, 
              fontSize: '18px', 
              fontWeight: 'bold' 
            }}>
              📚 Template Library
            </h3>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              {templates.map(template => (
                <div 
                  key={template.id}
                  style={{ 
                    padding: '20px', 
                    border: `1px solid ${theme.borderColor}`, 
                    borderRadius: '8px', 
                    backgroundColor: theme.background,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: '1' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h4 style={{ margin: '0', color: theme.textPrimary, fontSize: '16px', fontWeight: 'bold' }}>
                          {template.name}
                        </h4>
                        <span style={{ 
                          padding: '4px 12px', 
                          backgroundColor: '#dbeafe', 
                          color: '#1e40af', 
                          borderRadius: '16px', 
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {template.category}
                        </span>
                      </div>
                      <p style={{ 
                        margin: '0 0 12px 0', 
                        color: theme.textSecondary, 
                        fontSize: '14px',
                        lineHeight: '1.5'
                      }}>
                        {template.description}
                      </p>
                      <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                        Last modified: {template.lastModified} • {template.fields.length} fields
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ 
                        padding: '8px 16px', 
                        backgroundColor: theme.buttonPrimary, 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '6px', 
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}>
                        ✏️ Edit
                      </button>
                      <button style={{ 
                        padding: '8px 16px', 
                        backgroundColor: '#10b981', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '6px', 
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}>
                        📋 Use
                      </button>
                    </div>
                  </div>
                  
                  {selectedTemplate === template.id && (
                    <div style={{ 
                      marginTop: '20px', 
                      padding: '16px', 
                      backgroundColor: theme.headerBackground, 
                      borderRadius: '8px',
                      border: `1px solid ${theme.borderColor}`
                    }}>
                      <h5 style={{ 
                        margin: '0 0 12px 0', 
                        color: theme.textPrimary, 
                        fontSize: '14px', 
                        fontWeight: 'bold' 
                      }}>
                        Template Fields:
                      </h5>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {template.fields.map((field, index) => (
                          <span 
                            key={index}
                            style={{ 
                              padding: '6px 12px', 
                              backgroundColor: theme.buttonSecondary, 
                              color: theme.buttonSecondaryText, 
                              borderRadius: '12px', 
                              fontSize: '12px',
                              fontWeight: 'bold',
                              border: `1px solid ${theme.borderColor}`
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
            {/* LEFT SIDE: External Builder Tools */}
            <div style={{ 
              padding: '25px', 
              border: '2px solid #3b82f6', 
              borderRadius: '12px', 
              background: theme.gradientBlue
            }}>
              <h3 style={{ color: theme.textPrimary, marginBottom: '12px', fontSize: '18px', fontWeight: 'bold' }}>
                🗂️ External Builder Tools
              </h3>
              <p style={{ color: theme.textSecondary, fontSize: '14px', marginBottom: '20px' }}>
                External integration for automated generation
              </p>
              
              <div style={{ display: 'grid', gap: '12px' }}>
                {[
                  {
                    name: 'Content Template Engine',
                    desc: 'Comprehensive template creation and management',
                    url: 'https://anica-blip.github.io/3c-content-template-engine/'
                  },
                  {
                    name: 'Featured Content Templates',
                    desc: 'Social Media, Blog, News page, Article',
                    url: 'https://anica-blip.github.io/3c-desktop-editor/'
                  },
                  {
                    name: 'Content Management',
                    desc: 'Content creation with AI & Templates',
                    url: 'https://anica-blip.github.io/3c-content-scheduler/'
                  },
                  {
                    name: 'SM Content Generator',
                    desc: 'Generate social media post content',
                    url: 'https://anica-blip.github.io/3c-smpost-generator/'
                  }
                ].map((tool, index) => (
                  <a 
                    key={index}
                    href={tool.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '16px', 
                      backgroundColor: 'rgba(255,255,255,0.1)', 
                      border: `1px solid ${theme.borderColor}`, 
                      borderRadius: '8px', 
                      textDecoration: 'none',
                      color: theme.textPrimary,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                        {tool.name}
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.8 }}>
                        {tool.desc}
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>🔗 Open</span>
                  </a>
                ))}
              </div>
            </div>

            {/* RIGHT SIDE: 3C Brand Products */}
            <div style={{ 
              padding: '25px', 
              border: '2px solid #10b981', 
              borderRadius: '12px', 
              background: theme.gradientGreen
            }}>
              <h3 style={{ color: theme.textPrimary, marginBottom: '12px', fontSize: '18px', fontWeight: 'bold' }}>
                🎮 3C Brand Products
              </h3>
              <p style={{ color: theme.textSecondary, fontSize: '14px', marginBottom: '20px' }}>
                External app editors for interactive app loaders
              </p>
              
              <div style={{ display: 'grid', gap: '12px' }}>
                {[
                  {
                    name: 'Quiz Generator',
                    desc: '3C Interactive Quizzes',
                    url: 'https://anica-blip.github.io/3c-quiz-admin/'
                  },
                  {
                    name: 'Quiz Landing Page & App Loader',
                    desc: 'Quiz application landing interface',
                    url: 'https://anica-blip.github.io/3c-quiz-admin/landing.html?quiz=quiz.01'
                  },
                  {
                    name: 'Game Generator',
                    desc: 'Games, puzzles, challenges',
                    url: 'https://anica-blip.github.io/3c-game-loader/'
                  }
                ].map((tool, index) => (
                  <a 
                    key={index}
                    href={tool.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '16px', 
                      backgroundColor: 'rgba(255,255,255,0.1)', 
                      border: `1px solid ${theme.borderColor}`, 
                      borderRadius: '8px', 
                      textDecoration: 'none',
                      color: theme.textPrimary,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                        {tool.name}
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.8 }}>
                        {tool.desc}
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>🔗 Open</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// =============================================================================
// LIBRARIES TAB (KEEP YOUR EXISTING CODE)
// =============================================================================

function AdminLibrariesTab({ theme }) {
  const [notionConnected, setNotionConnected] = useState(false);
  const [wasabiConnected, setWasabiConnected] = useState(false);
  const [canvaConnected, setCanvaConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Add notification system
  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // Connection handlers
  const handleNotionToggle = () => {
    if (notionConnected) {
      setNotionConnected(false);
      showNotification('Notion disconnected successfully', 'info');
    } else {
      // Simulate connection process
      showNotification('Connecting to Notion...', 'info');
      setTimeout(() => {
        setNotionConnected(true);
        showNotification('Notion connected successfully!', 'success');
      }, 1500);
    }
  };

  const handleWasabiToggle = () => {
    if (wasabiConnected) {
      setWasabiConnected(false);
      showNotification('Wasabi storage disconnected', 'info');
    } else {
      showNotification('Connecting to Wasabi Cloud...', 'info');
      setTimeout(() => {
        setWasabiConnected(true);
        showNotification('Wasabi Cloud Storage connected!', 'success');
      }, 1500);
    }
  };

  const handleCanvaToggle = () => {
    if (canvaConnected) {
      setCanvaConnected(false);
      showNotification('Canva workspace disconnected', 'info');
    } else {
      showNotification('Connecting to Canva...', 'info');
      setTimeout(() => {
        setCanvaConnected(true);
        showNotification('Canva workspace connected!', 'success');
      }, 1500);
    }
  };

  // Wasabi action handlers
  const handleWasabiBrowse = () => {
    showNotification('Opening Wasabi file browser...', 'info');
    if (typeof window !== 'undefined') {
      window.open('https://console.wasabisys.com', '_blank');
    }
  };

  const handleWasabiUpload = () => {
    showNotification('Upload functionality ready for implementation!', 'info');
  };

  const IntegrationCard = ({ 
    title, 
    subtitle, 
    emoji, 
    connected, 
    onToggle, 
    children, 
    gradientColor 
  }) => (
    <div style={{ 
      padding: '30px', 
      border: `2px solid ${connected ? '#10b981' : '#f59e0b'}`, 
      borderRadius: '12px', 
      background: gradientColor,
      marginBottom: '30px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '25px' 
      }}>
        <div>
          <h3 style={{ 
            margin: '0', 
            color: theme.textPrimary, 
            fontSize: '20px', 
            fontWeight: 'bold' 
          }}>
            {emoji} {title}
          </h3>
          <p style={{ 
            margin: '8px 0 0 0', 
            color: theme.textSecondary, 
            fontSize: '14px' 
          }}>
            {subtitle}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ 
            padding: '6px 12px', 
            backgroundColor: connected ? '#10b981' : '#f59e0b', 
            color: 'white', 
            borderRadius: '16px', 
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {connected ? '✅ Connected' : '⏳ Ready to Connect'}
          </span>
          <button
            onClick={onToggle}
            style={{
              padding: '12px 20px',
              backgroundColor: connected ? '#ef4444' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
          >
            {connected ? 'Disconnect' : '🔗 Connect'}
          </button>
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ padding: '20px', backgroundColor: theme.background }}>
      {/* Notification System */}
      {notifications.length > 0 && (
        <div style={{ 
          position: 'fixed', 
          top: '20px', 
          right: '20px', 
          zIndex: 1000, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '10px',
          maxWidth: '400px'
        }}>
          {notifications.map(notification => (
            <div key={notification.id} style={{
              padding: '12px 20px',
              backgroundColor: notification.type === 'success' ? '#10b981' : 
                             notification.type === 'error' ? '#ef4444' : '#3b82f6',
              color: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
              fontSize: '14px',
              fontWeight: 'bold',
              position: 'relative',
              wordWrap: 'break-word'
            }}>
              {notification.message}
            </div>
          ))}
        </div>
      )}

      <h2 style={{ color: theme.textPrimary, fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
        📚 Libraries
      </h2>
      <p style={{ color: theme.textSecondary, fontSize: '14px', margin: '0 0 30px 0' }}>
        External service integrations and storage management
      </p>
      
      <div style={{ display: 'grid', gap: '0' }}>
        
        {/* NOTION INTEGRATION */}
        <IntegrationCard
          title="Notion Integration"
          subtitle="Content management and documentation"
          emoji="📝"
          connected={notionConnected}
          onToggle={handleNotionToggle}
          gradientColor={theme.gradientBlue}
        >
          {notionConnected ? (
            <div>
              <h4 style={{ color: theme.textPrimary, marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>
                📄 Connected to Internal Hub
              </h4>
              <div style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '20px' }}>
                Content Calendar • Brand Guidelines • Templates
              </div>
              <div style={{
                padding: '20px', 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                borderRadius: '8px',
                border: `1px solid ${theme.borderColor}`
              }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold', color: theme.textPrimary }}>
                  🔗 Main Hub Link:
                </p>
                <a
                  href="https://www.notion.so/INTERNAL-HUB-2256ace1e8398087a3c9d25c1cf253e5"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    fontSize: '12px', 
                    color: '#3b82f6', 
                    textDecoration: 'underline',
                    fontWeight: 'bold'
                  }}
                >
                  notion.so/INTERNAL-HUB-2256ace1e8398087a3c9d25c1cf253e5
                </a>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <p style={{ color: theme.textPrimary, fontSize: '16px', marginBottom: '8px', fontWeight: 'bold' }}>
                Connect your Notion workspace
              </p>
              <p style={{ color: theme.textSecondary, fontSize: '14px', margin: '0' }}>
                Access your content calendars, brand guidelines, and documentation
              </p>
            </div>
          )}
        </IntegrationCard>

        {/* WASABI INTEGRATION */}
        <IntegrationCard
          title="Wasabi Cloud Storage"
          subtitle="Internal assets & public member content storage"
          emoji="📦"
          connected={wasabiConnected}
          onToggle={handleWasabiToggle}
          gradientColor={theme.gradientRed}
        >
          {wasabiConnected ? (
            <div>
              <h4 style={{ color: theme.textPrimary, marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>
                📦 Storage Connected
              </h4>
              <div style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '20px' }}>
                Internal Assets • Member Content • Media Library
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{
                  padding: '20px', 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: '8px',
                  border: `1px solid ${theme.borderColor}`
                }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: 'bold', color: theme.textPrimary }}>
                    Storage Usage:
                  </p>
                  <div style={{ fontSize: '16px', color: theme.textPrimary, fontWeight: 'bold', marginBottom: '8px' }}>
                    2.4 GB / 50 GB
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '8px', 
                    backgroundColor: theme.borderColor, 
                    borderRadius: '4px', 
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: '4.8%', 
                      height: '100%', 
                      backgroundColor: '#10b981' 
                    }}></div>
                  </div>
                </div>
                <div style={{
                  padding: '20px', 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: '8px',
                  border: `1px solid ${theme.borderColor}`
                }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: 'bold', color: theme.textPrimary }}>
                    Quick Actions:
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={handleWasabiBrowse}
                      style={{
                        padding: '8px 16px',
                        fontSize: '12px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      🔍 Browse
                    </button>
                    <button 
                      onClick={handleWasabiUpload}
                      style={{
                        padding: '8px 16px',
                        fontSize: '12px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      ⬆️ Upload
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <p style={{ color: theme.textPrimary, fontSize: '16px', marginBottom: '8px', fontWeight: 'bold' }}>
                Connect Wasabi Cloud Storage
              </p>
              <p style={{ color: theme.textSecondary, fontSize: '14px', margin: '0' }}>
                Secure cloud storage for your assets and member content
              </p>
            </div>
          )}
        </IntegrationCard>

        {/* CANVA INTEGRATION */}
        <IntegrationCard
          title="Canva Integration"
          subtitle="Design templates and brand assets"
          emoji="🎨"
          connected={canvaConnected}
          onToggle={handleCanvaToggle}
          gradientColor={theme.gradientPurple}
        >
          {canvaConnected ? (
            <div>
              <h4 style={{ color: theme.textPrimary, marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>
                🎨 Design Library Connected
              </h4>
              <div style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '20px' }}>
                Brand Templates • Design Assets • Collaborative Workspace
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                {[
                  { emoji: '📄', title: 'Templates', value: '47 designs' },
                  { emoji: '🏢', title: 'Brand Kit', value: 'Active' },
                  { emoji: '👥', title: 'Team', value: '5 members' }
                ].map((item, index) => (
                  <div key={index} style={{
                    padding: '20px', 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: `1px solid ${theme.borderColor}`
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{item.emoji}</div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: theme.textPrimary, marginBottom: '4px' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '11px', color: theme.textSecondary }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
              <p style={{ color: theme.textPrimary, fontSize: '16px', marginBottom: '8px', fontWeight: 'bold' }}>
                Connect your Canva workspace
              </p>
              <p style={{ color: theme.textSecondary, fontSize: '14px', margin: '0' }}>
                Access design templates, brand kits, and collaborative tools
              </p>
            </div>
          )}
        </IntegrationCard>
      </div>
    </div>
  );
}

// =============================================================================
// BRAND TAB WITH COMPLETE FILE UPLOAD + DATABASE INTEGRATION
// =============================================================================

function AdminBrandTab({ theme, isDarkMode }) {
  const [activeSection, setActiveSection] = useState('colors');
  const [notifications, setNotifications] = useState([]);
  
  // States for all brand kit elements
  const [brandColors, setBrandColors] = useState(() => {
    return safeLocalStorage.getItem('brandColors', [
      { id: 1, name: 'Primary Blue', hex: '#3b82f6', usage: 'Main brand color' },
      { id: 2, name: 'Secondary Green', hex: '#10b981', usage: 'Success states' },
      { id: 3, name: 'Accent Purple', hex: '#8b5cf6', usage: 'Creative elements' }
    ]);
  });

  const [logos, setLogos] = useState(() => {
    return safeLocalStorage.getItem('brandLogos', [
      { id: 1, name: 'Primary Logo', type: 'SVG', size: '1.2 MB', usage: 'Main brand identity', category: 'Primary Logo' }
    ]);
  });

  const [fonts, setFonts] = useState(() => {
    return safeLocalStorage.getItem('brandFonts', [
      { id: 1, name: 'Inter', category: 'Primary', usage: 'Headlines, UI text', weight: '400-700' },
      { id: 2, name: 'Roboto', category: 'Secondary', usage: 'Body text, descriptions', weight: '300-500' }
    ]);
  });

  // Form states
  const [showColorForm, setShowColorForm] = useState(false);
  const [editingColor, setEditingColor] = useState(null);
  const [newColor, setNewColor] = useState({
    name: '',
    hex: '#523474',
    usage: ''
  });

  // Logo editing states
  const [editingLogo, setEditingLogo] = useState(null);
  const [editLogoData, setEditLogoData] = useState({
    name: '',
    type: '',
    usage: '',
    category: 'Primary Logo'
  });
  const [logoFile, setLogoFile] = useState(null);

  // Typography editing state
  const [editingFont, setEditingFont] = useState(null);
  const [editFontData, setEditFontData] = useState({
    name: '',
    category: '',
    usage: '',
    weight: ''
  });

  // BONUS: Custom font upload states
  const [customFontFile, setCustomFontFile] = useState(null);
  const [fontSourceType, setFontSourceType] = useState('google'); // 'google', 'custom', 'system'

  // Notification system
  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    
    if (type !== 'error') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
    }
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Color management functions
  const handleAddColor = () => {
    setShowColorForm(true);
  };

  const handleEditColor = (color) => {
    setEditingColor(color);
    setNewColor({
      name: color.name,
      hex: color.hex,
      usage: color.usage
    });
    setShowColorForm(true);
  };

  const handleSaveColor = async () => {
    if (!newColor.name.trim() || !newColor.hex.trim() || !newColor.usage.trim()) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    showNotification('Saving color to Supabase...', 'info');

    try {
      let updatedColors;
      if (editingColor) {
        // Update existing color
        updatedColors = brandColors.map(color => 
          color.id === editingColor.id 
            ? { ...color, name: newColor.name, hex: newColor.hex, usage: newColor.usage }
            : color
        );
        showNotification(`Updated ${newColor.name}`, 'success');
      } else {
        // Add new color
        const colorToAdd = {
          id: brandColors.length > 0 ? Math.max(...brandColors.map(c => c.id)) + 1 : 1,
          name: newColor.name,
          hex: newColor.hex,
          usage: newColor.usage
        };
        
        // Save to Supabase
        await supabaseAPI.saveColor(colorToAdd);
        updatedColors = [...brandColors, colorToAdd];
        showNotification(`${newColor.name} saved to Supabase!`, 'success');
      }
      
      safeLocalStorage.setItem('brandColors', updatedColors);
      setBrandColors(updatedColors);
      
    } catch (error) {
      // Fallback to localStorage if Supabase fails
      let updatedColors;
      if (editingColor) {
        updatedColors = brandColors.map(color => 
          color.id === editingColor.id 
            ? { ...color, name: newColor.name, hex: newColor.hex, usage: newColor.usage }
            : color
        );
      } else {
        const colorToAdd = {
          id: brandColors.length > 0 ? Math.max(...brandColors.map(c => c.id)) + 1 : 1,
          name: newColor.name,
          hex: newColor.hex,
          usage: newColor.usage
        };
        updatedColors = [...brandColors, colorToAdd];
      }
      
      safeLocalStorage.setItem('brandColors', updatedColors);
      setBrandColors(updatedColors);
      
      showNotification(`${editingColor ? 'Updated' : 'Added'} ${newColor.name} (saved locally - Supabase sync failed)`, 'error');
    }
    
    setNewColor({ name: '', hex: '#523474', usage: '' });
    setShowColorForm(false);
    setEditingColor(null);
  };

  const handleCancelColor = () => {
    setNewColor({ name: '', hex: '#523474', usage: '' });
    setShowColorForm(false);
    setEditingColor(null);
  };

  const handleCopyColor = (hex) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(hex).then(() => {
        showNotification(`Copied ${hex} to clipboard`, 'success');
      }).catch(() => {
        showNotification('Failed to copy color code', 'error');
      });
    } else {
      showNotification('Clipboard not available', 'error');
    }
  };

  // Logo management functions
  const handleEditLogo = (logo) => {
    setEditingLogo(logo);
    setEditLogoData({
      name: logo.name,
      type: logo.type,
      usage: logo.usage,
      category: logo.category || 'Primary Logo'
    });
  };

  const handleLogoFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file
      if (file.size > 10 * 1024 * 1024) {
        showNotification('File size must be less than 10MB', 'error');
        return;
      }
      
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showNotification('Please upload PNG, JPG, SVG, or WebP files only', 'error');
        return;
      }
      
      setLogoFile(file);
      setEditLogoData(prev => ({
        ...prev,
        name: prev.name || file.name.split('.')[0],
        type: file.type.includes('svg') ? 'SVG' : file.type.includes('png') ? 'PNG' : 'JPG'
      }));
      
      showNotification(`${file.name} selected for upload`, 'success');
    }
  };

  const handleSaveLogo = async () => {
    if (!editLogoData.name.trim() || !editLogoData.usage.trim()) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    showNotification('Saving logo to Supabase (bucket + database)...', 'info');

    try {
      // Use complete workflow: file upload + database save
      await supabaseAPI.saveLogoComplete(editLogoData, logoFile);
      
      // Update local state
      const updatedLogos = logos.map(logo => 
        logo.id === editingLogo.id ? { ...logo, ...editLogoData } : logo
      );
      setLogos(updatedLogos);
      safeLocalStorage.setItem('brandLogos', updatedLogos);
      
      showNotification(`${editLogoData.name} saved to Supabase (bucket + database)!`, 'success');
      setEditingLogo(null);
      setEditLogoData({ name: '', type: '', usage: '', category: 'Primary Logo' });
      setLogoFile(null);
    } catch (error) {
      // Fallback to local save
      const updatedLogos = logos.map(logo => 
        logo.id === editingLogo.id ? { ...logo, ...editLogoData } : logo
      );
      setLogos(updatedLogos);
      safeLocalStorage.setItem('brandLogos', updatedLogos);
      
      showNotification(`Logo saved locally - Supabase sync failed: ${error.message}`, 'error');
    }
  };

  const handleCancelLogo = () => {
    setEditingLogo(null);
    setEditLogoData({ name: '', type: '', usage: '', category: 'Primary Logo' });
    setLogoFile(null);
  };

  // Font management functions  
  const handleSaveFont = async () => {
    if (!editFontData.name.trim()) {
      showNotification('Please enter a font name', 'error');
      return;
    }

    showNotification('Saving font to Supabase...', 'info');
    
    try {
      // Choose save method based on font source type
      if (fontSourceType === 'custom' && customFontFile) {
        // Use enhanced save with custom font upload
        await supabaseAPI.saveFontWithUpload(editFontData, customFontFile);
      } else {
        // Use regular save (Google Fonts or system fonts)
        await supabaseAPI.saveFont(editFontData);
      }
      
      const updatedFonts = fonts.map(f => 
        f.id === editingFont.id ? { ...f, ...editFontData } : f
      );
      setFonts(updatedFonts);
      safeLocalStorage.setItem('brandFonts', updatedFonts);
      
      const fontType = customFontFile ? 'custom font' : 'font';
      showNotification(`${editFontData.name} ${fontType} saved and loaded for preview!`, 'success');
      
      // Reset form
      setEditingFont(null);
      setEditFontData({ name: '', category: '', usage: '', weight: '' });
      setCustomFontFile(null);
      setFontSourceType('google');
    } catch (error) {
      // Fallback to local save
      const updatedFonts = fonts.map(f => 
        f.id === editingFont.id ? { ...f, ...editFontData } : f
      );
      setFonts(updatedFonts);
      safeLocalStorage.setItem('brandFonts', updatedFonts);
      
      showNotification(`Font save failed: ${error.message}`, 'error');
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: theme.background }}>
      {/* Notification System */}
      {notifications.length > 0 && (
        <div style={{ 
          position: 'fixed', 
          top: '20px', 
          right: '20px', 
          zIndex: 1000, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '10px' 
        }}>
          {notifications.map(notification => (
            <div key={notification.id} style={{
              padding: '12px 20px',
              backgroundColor: notification.type === 'success' ? '#10b981' : 
                             notification.type === 'error' ? '#ef4444' : '#3b82f6',
              color: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minWidth: '300px',
              maxWidth: '400px'
            }}>
              <span style={{ wordBreak: 'break-word' }}>{notification.message}</span>
              <button
                onClick={() => dismissNotification(notification.id)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'white',
                  fontSize: '16px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  marginLeft: '12px',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <h2 style={{ color: theme.textPrimary, fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
        🏢 Brand Kit
      </h2>
      <p style={{ color: theme.textSecondary, fontSize: '14px', margin: '0 0 30px 0' }}>
        Complete brand management with Supabase storage and database integration
      </p>
      
      {/* Brand Kit Sub-Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '0', 
        marginBottom: '30px',
        borderBottom: `1px solid ${theme.borderColor}`,
        backgroundColor: theme.cardBackground,
        borderRadius: '8px 8px 0 0'
      }}>
        {[
          { id: 'colors', label: '🎨 Colors' },
          { id: 'logos', label: '🏷️ Logos' },
          { id: 'fonts', label: '🔤 Typography' }
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            style={{
              padding: '16px 24px',
              backgroundColor: activeSection === section.id ? theme.background : 'transparent',
              color: activeSection === section.id ? theme.textPrimary : theme.textSecondary,
              border: 'none',
              borderBottom: activeSection === section.id ? '3px solid #8b5cf6' : '3px solid transparent',
              fontWeight: activeSection === section.id ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* COLORS SECTION */}
      {activeSection === 'colors' && (
        <div style={{ 
          padding: '30px', 
          backgroundColor: theme.cardBackground, 
          borderRadius: '0 0 12px 12px',
          border: `1px solid ${theme.borderColor}`,
          borderTop: 'none'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h3 style={{ color: theme.textPrimary, fontSize: '18px', fontWeight: 'bold', margin: '0' }}>
              🎨 Brand Colors → Supabase Database
            </h3>
            <button 
              onClick={handleAddColor}
              style={{
                padding: '12px 20px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ➕ Add Color
            </button>
          </div>

          {/* Color Form */}
          {showColorForm && (
            <div style={{
              padding: '30px',
              border: '2px solid #8b5cf6',
              borderRadius: '12px',
              backgroundColor: theme.background,
              marginBottom: '30px'
            }}>
              <h4 style={{ color: theme.textPrimary, marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>
                🎨 {editingColor ? 'Edit Color' : 'Add New Color'}
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <input
                  type="text"
                  value={newColor.name}
                  onChange={(e) => setNewColor(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    padding: '12px',
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: theme.inputBackground,
                    color: theme.textPrimary,
                    outline: 'none'
                  }}
                  placeholder="Color name (e.g., Primary Blue)"
                />
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input
                    type="color"
                    value={newColor.hex}
                    onChange={(e) => setNewColor(prev => ({ ...prev, hex: e.target.value }))}
                    style={{
                      width: '60px',
                      height: '46px',
                      border: `1px solid ${theme.inputBorder}`,
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  />
                  <input
                    type="text"
                    value={newColor.hex}
                    onChange={(e) => setNewColor(prev => ({ ...prev, hex: e.target.value }))}
                    style={{
                      flex: '1',
                      padding: '12px',
                      border: `1px solid ${theme.inputBorder}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: theme.inputBackground,
                      color: theme.textPrimary,
                      outline: 'none',
                      fontFamily: 'monospace'
                    }}
                    placeholder="#523474"
                  />
                </div>
              </div>

              <textarea
                value={newColor.usage}
                onChange={(e) => setNewColor(prev => ({ ...prev, usage: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${theme.inputBorder}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: theme.inputBackground,
                  color: theme.textPrimary,
                  minHeight: '80px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  outline: 'none',
                  marginBottom: '20px'
                }}
                placeholder="Describe where and how this color should be used..."
              />

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleCancelColor}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: theme.buttonSecondary,
                    color: theme.buttonSecondaryText,
                    border: `1px solid ${theme.borderColor}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveColor}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  💾 Save to Supabase
                </button>
              </div>
            </div>
          )}
          
          {/* Color Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {brandColors.map(color => (
              <div key={color.id} style={{
                padding: '25px',
                border: `1px solid ${theme.borderColor}`,
                borderRadius: '12px',
                backgroundColor: theme.background,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: color.hex,
                    borderRadius: '12px',
                    border: isDarkMode ? `3px solid #ffffff` : `2px solid ${theme.borderColor}`,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}></div>
                  <div>
                    <h4 style={{ margin: '0 0 6px 0', color: theme.textPrimary, fontSize: '16px', fontWeight: 'bold' }}>
                      {color.name}
                    </h4>
                    <div style={{ fontSize: '14px', color: theme.textSecondary, fontFamily: 'monospace', fontWeight: 'bold' }}>
                      {color.hex}
                    </div>
                  </div>
                </div>
                <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: theme.textSecondary, lineHeight: '1.5' }}>
                  {color.usage}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleCopyColor(color.hex)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: theme.buttonSecondary,
                      color: theme.buttonSecondaryText,
                      border: `1px solid ${theme.borderColor}`,
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    📋 Copy
                  </button>
                  <button 
                    onClick={() => handleEditColor(color)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: theme.buttonPrimary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    ✏️ Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LOGOS SECTION WITH FILE UPLOAD */}
      {activeSection === 'logos' && (
        <div style={{ 
          padding: '30px', 
          backgroundColor: theme.cardBackground, 
          borderRadius: '0 0 12px 12px',
          border: `1px solid ${theme.borderColor}`,
          borderTop: 'none'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h3 style={{ color: theme.textPrimary, fontSize: '18px', fontWeight: 'bold', margin: '0' }}>
              🏷️ Logo Assets → Supabase Bucket + Database
            </h3>
            <button 
              onClick={() => {
                const newLogo = {
                  id: logos.length > 0 ? Math.max(...logos.map(l => l.id)) + 1 : 1,
                  name: 'New Logo',
                  type: 'PNG',
                  size: '',
                  usage: 'Enter usage description',
                  category: 'Primary Logo'
                };
                
                setLogos([...logos, newLogo]);
                setEditingLogo(newLogo);
                setEditLogoData({
                  name: newLogo.name,
                  type: newLogo.type,
                  usage: newLogo.usage,
                  category: 'Primary Logo'
                });
                
                showNotification('New logo entry added - upload file and edit details below', 'success');
              }}
              style={{
                padding: '12px 20px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ➕ Add New Logo
            </button>
          </div>

          {/* Logo Editing Form with File Upload */}
          {editingLogo && (
            <div style={{
              padding: '30px',
              border: '2px solid #8b5cf6',
              borderRadius: '12px',
              backgroundColor: theme.background,
              marginBottom: '30px'
            }}>
              <h4 style={{ color: theme.textPrimary, marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>
                ✏️ Edit Logo: {editingLogo.name}
              </h4>
              
              {/* File Upload */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: theme.textPrimary }}>
                  Logo Image File
                </label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*,.svg';
                      input.style.display = 'none';
                      input.onchange = handleLogoFileSelect;
                      document.body.appendChild(input);
                      input.click();
                      document.body.removeChild(input);
                    }}
                    style={{
                      padding: '12px 20px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    📁 Choose File
                  </button>
                  {logoFile && (
                    <span style={{ color: theme.textSecondary, fontSize: '14px' }}>
                      Selected: {logoFile.name} ({(logoFile.size / 1024).toFixed(1)} KB)
                    </span>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <input
                  type="text"
                  value={editLogoData.name}
                  onChange={(e) => setEditLogoData(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    padding: '12px',
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: theme.inputBackground,
                    color: theme.textPrimary,
                    outline: 'none'
                  }}
                  placeholder="Logo name"
                />
                
                <select
                  value={editLogoData.category}
                  onChange={(e) => setEditLogoData(prev => ({ ...prev, category: e.target.value }))}
                  style={{
                    padding: '12px',
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: theme.inputBackground,
                    color: theme.textPrimary,
                    outline: 'none'
                  }}
                >
                  <option value="Primary Logo">Primary Logo</option>
                  <option value="Secondary Logo">Secondary Logo</option>
                  <option value="Logo Mark">Logo Mark</option>
                  <option value="White Version">White Version</option>
                  <option value="Dark Version">Dark Version</option>
                </select>
              </div>

              <textarea
                value={editLogoData.usage}
                onChange={(e) => setEditLogoData(prev => ({ ...prev, usage: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${theme.inputBorder}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: theme.inputBackground,
                  color: theme.textPrimary,
                  minHeight: '80px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  outline: 'none',
                  marginBottom: '20px'
                }}
                placeholder="Describe where and how this logo should be used..."
              />

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleCancelLogo}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: theme.buttonSecondary,
                    color: theme.buttonSecondaryText,
                    border: `1px solid ${theme.borderColor}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLogo}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  💾 Save to Supabase
                </button>
              </div>
            </div>
          )}
          
          <div style={{ display: 'grid', gap: '16px' }}>
            {logos.map(logo => (
              <div key={logo.id} style={{
                padding: '25px',
                border: `1px solid ${theme.borderColor}`,
                borderRadius: '12px',
                backgroundColor: theme.background,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{
                    width: '80px',
                    height: '60px',
                    backgroundColor: theme.headerBackground,
                    border: `2px dashed ${theme.borderColor}`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    🏷️
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 6px 0', color: theme.textPrimary, fontSize: '16px', fontWeight: 'bold' }}>
                      {logo.name}
                    </h4>
                    <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                      {logo.type} • {logo.size} • {logo.usage}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleEditLogo(logo)}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  ✏️ Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TYPOGRAPHY SECTION WITH GOOGLE FONTS + CUSTOM UPLOAD */}
      {activeSection === 'fonts' && (
        <div style={{ 
          padding: '30px', 
          backgroundColor: theme.cardBackground, 
          borderRadius: '0 0 12px 12px',
          border: `1px solid ${theme.borderColor}`,
          borderTop: 'none'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h3 style={{ color: theme.textPrimary, fontSize: '18px', fontWeight: 'bold', margin: '0' }}>
              🔤 Typography → Supabase Database + 1000+ Google Fonts
            </h3>
            <button 
              onClick={() => {
                const newFont = {
                  id: fonts.length > 0 ? Math.max(...fonts.map(f => f.id)) + 1 : 1,
                  name: 'Nunito',
                  category: 'Primary',
                  usage: 'New font usage',
                  weight: '400-600'
                };
                
                setFonts([...fonts, newFont]);
                setEditingFont(newFont);
                setEditFontData({
                  name: newFont.name,
                  category: newFont.category,
                  usage: newFont.usage,
                  weight: newFont.weight
                });
                
                showNotification('New font added - choose your font below', 'success');
              }}
              style={{
                padding: '12px 20px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ➕ Add Font
            </button>
          </div>

          {/* Font Editing Form with Custom Upload Support */}
          {editingFont && (
            <div style={{
              padding: '30px',
              border: '2px solid #3b82f6',
              borderRadius: '12px',
              backgroundColor: theme.background,
              marginBottom: '30px'
            }}>
              <h4 style={{ color: theme.textPrimary, marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>
                ✏️ Edit Font: {editingFont.name}
              </h4>
              
              {/* FONT SOURCE SELECTION */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: theme.textPrimary,
                  fontSize: '14px'
                }}>
                  Font Source
                </label>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="fontSource"
                      value="google"
                      checked={fontSourceType === 'google'}
                      onChange={(e) => setFontSourceType(e.target.value)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ color: theme.textPrimary, fontSize: '14px' }}>🆓 Google Fonts (1000+)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="fontSource"
                      value="custom"
                      checked={fontSourceType === 'custom'}
                      onChange={(e) => setFontSourceType(e.target.value)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ color: theme.textPrimary, fontSize: '14px' }}>📁 Upload Custom Font</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="fontSource"
                      value="system"
                      checked={fontSourceType === 'system'}
                      onChange={(e) => setFontSourceType(e.target.value)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ color: theme.textPrimary, fontSize: '14px' }}>💻 System Font</span>
                  </label>
                </div>
              </div>

              {/* CUSTOM FONT UPLOAD (BONUS FEATURE) */}
              {fontSourceType === 'custom' && (
                <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: theme.headerBackground, borderRadius: '8px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: theme.textPrimary,
                    fontSize: '14px'
                  }}>
                    Upload Font File
                  </label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                    <button
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.woff,.woff2,.ttf,.otf';
                        input.style.display = 'none';
                        input.onchange = (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setCustomFontFile(file);
                            // Auto-fill font name from filename
                            const fontName = file.name.replace(/\.(woff2?|[ot]tf)$/i, '').replace(/[_-]/g, ' ');
                            setEditFontData(prev => ({ ...prev, name: fontName }));
                          }
                        };
                        document.body.appendChild(input);
                        input.click();
                        document.body.removeChild(input);
                      }}
                      style={{
                        padding: '12px 20px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      📁 Choose Font File
                    </button>
                    {customFontFile && (
                      <span style={{ color: theme.textSecondary, fontSize: '14px' }}>
                        Selected: {customFontFile.name} ({(customFontFile.size / 1024).toFixed(1)} KB)
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: theme.textSecondary, fontStyle: 'italic' }}>
                    💡 Supported: WOFF, WOFF2, TTF, OTF files (max 5MB)
                    <br />
                    Use your own licensed fonts, purchased fonts, or custom brand fonts
                  </div>
                </div>
              )}

              {/* FONT NAME INPUT - Open Text for ANY Font */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: theme.textPrimary,
                    fontSize: '14px'
                  }}>
                    Font Name
                  </label>
                  <input
                    type="text"
                    value={editFontData.name}
                    onChange={(e) => setEditFontData(prev => ({ ...prev, name: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${theme.inputBorder}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: theme.inputBackground,
                      color: theme.textPrimary,
                      outline: 'none'
                    }}
                    placeholder={
                      fontSourceType === 'google' ? 'e.g., Nunito, Raleway, Dancing Script, Oswald' :
                      fontSourceType === 'system' ? 'e.g., Helvetica, Arial, Times New Roman' :
                      'Font name (auto-filled from file)'
                    }
                  />
                  <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '4px', fontStyle: 'italic' }}>
                    {fontSourceType === 'google' && '🆓 Try ANY Google Font name - 1000+ available!'}
                    {fontSourceType === 'system' && '💻 System fonts available on all computers'}
                    {fontSourceType === 'custom' && '📁 Your custom font name'}
                  </div>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: theme.textPrimary,
                    fontSize: '14px'
                  }}>
                    Category
                  </label>
                  <input
                    type="text"
                    value={editFontData.category}
                    onChange={(e) => setEditFontData(prev => ({ ...prev, category: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${theme.inputBorder}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: theme.inputBackground,
                      color: theme.textPrimary,
                      outline: 'none'
                    }}
                    placeholder="e.g., Primary, Secondary, Heading, Display"
                  />
                </div>
              </div>

              {/* USAGE AND WEIGHT */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                <input
                  type="text"
                  value={editFontData.weight}
                  onChange={(e) => setEditFontData(prev => ({ ...prev, weight: e.target.value }))}
                  style={{
                    padding: '12px',
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: theme.inputBackground,
                    color: theme.textPrimary,
                    outline: 'none'
                  }}
                  placeholder="Font weights (e.g., 400-700)"
                />
                
                <input
                  type="text"
                  value={editFontData.usage}
                  onChange={(e) => setEditFontData(prev => ({ ...prev, usage: e.target.value }))}
                  style={{
                    padding: '12px',
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: theme.inputBackground,
                    color: theme.textPrimary,
                    outline: 'none'
                  }}
                  placeholder="Usage description"
                />
              </div>

              {/* SAVE BUTTONS */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setEditingFont(null);
                    setEditFontData({ name: '', category: '', usage: '', weight: '' });
                    setCustomFontFile(null);
                    setFontSourceType('google');
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: theme.buttonSecondary,
                    color: theme.buttonSecondaryText,
                    border: `1px solid ${theme.borderColor}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveFont}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  💾 Save {fontSourceType === 'custom' ? 'Custom Font' : 'Font'} to Supabase
                </button>
              </div>
            </div>
          )}
          
          <div style={{ display: 'grid', gap: '25px' }}>
            {fonts.map(font => (
              <div key={font.id} style={{
                padding: '30px',
                border: `1px solid ${theme.borderColor}`,
                borderRadius: '12px',
                backgroundColor: theme.background,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 10px 0', color: theme.textPrimary, fontSize: '20px', fontWeight: 'bold' }}>
                      {font.name}
                    </h4>
                    <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: theme.textSecondary, marginBottom: '8px' }}>
                      <span><strong>Category:</strong> {font.category}</span>
                      <span><strong>Weight:</strong> {font.weight}</span>
                    </div>
                    <p style={{ margin: '0', fontSize: '14px', color: theme.textSecondary, lineHeight: '1.5' }}>
                      {font.usage}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => {
                        const cssCode = `font-family: '${font.name}', sans-serif;\nfont-weight: ${font.weight.split('-')[0]};\nfont-size: 16px;`;
                        if (typeof navigator !== 'undefined' && navigator.clipboard) {
                          navigator.clipboard.writeText(cssCode).then(() => {
                            showNotification(`${font.name} CSS copied to clipboard!`, 'success');
                          }).catch(() => {
                            showNotification('Failed to copy CSS', 'error');
                          });
                        } else {
                          showNotification('Clipboard not available', 'error');
                        }
                      }}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: theme.buttonSecondary,
                        color: theme.buttonSecondaryText,
                        border: `1px solid ${theme.borderColor}`,
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      📋 Copy CSS
                    </button>
                    <button 
                      onClick={() => {
                        setEditingFont(font);
                        setEditFontData({
                          name: font.name,
                          category: font.category,
                          usage: font.usage,
                          weight: font.weight
                        });
                      }}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: theme.buttonPrimary,
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => {
                        const updatedFonts = fonts.filter(f => f.id !== font.id);
                        setFonts(updatedFonts);
                        safeLocalStorage.setItem('brandFonts', updatedFonts);
                        showNotification(`${font.name} deleted successfully`, 'success');
                      }}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
                
                {/* Font Preview with Google Fonts */}
                <div style={{
                  padding: '25px',
                  backgroundColor: theme.headerBackground,
                  borderRadius: '8px',
                  border: `1px solid ${theme.borderColor}`,
                  fontFamily: `'${font.name}', ui-sans-serif, system-ui, sans-serif`
                }}>
                  <div style={{ 
                    fontSize: '32px', 
                    marginBottom: '12px', 
                    fontWeight: 'bold', 
                    color: theme.textPrimary,
                    fontFamily: `'${font.name}', ui-sans-serif, system-ui, sans-serif`
                  }}>
                    The quick brown fox jumps
                  </div>
                  <div style={{ 
                    fontSize: '18px', 
                    marginBottom: '10px', 
                    color: theme.textPrimary,
                    fontFamily: `'${font.name}', ui-sans-serif, system-ui, sans-serif`
                  }}>
                    Regular weight sample text for {font.name}
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    color: theme.textSecondary, 
                    fontWeight: '500',
                    fontFamily: `'${font.name}', ui-sans-serif, system-ui, sans-serif`
                  }}>
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ 1234567890
                  </div>
                  <div style={{
                    marginTop: '15px',
                    padding: '10px',
                    backgroundColor: theme.background,
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: theme.textSecondary,
                    fontStyle: 'italic',
                    fontFamily: 'ui-sans-serif, system-ui, sans-serif'
                  }}>
                    ✅ Font preview active - Google Fonts loaded automatically
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminComponents;
