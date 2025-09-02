import React, { useState, useEffect } from 'react';

// =============================================================================
// SUPABASE INTEGRATION WITH BUCKET → TABLE WORKFLOW
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
        this.loadGoogleFont(googleFontsUrl);
      }
      
      return result;
    } catch (error) {
      console.error('💥 Font save error:', error);
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

  // Generate Google Fonts URL
  generateGoogleFontsUrl(fontName) {
    const commonGoogleFonts = {
      'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
      'Roboto': 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
      'Playfair Display': 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap',
      'Open Sans': 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap',
      'Poppins': 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
      'Lato': 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap',
      'Montserrat': 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap',
      'Source Sans Pro': 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&display=swap'
    };
    
    return commonGoogleFonts[fontName] || null;
  },

  // Load Google Font for preview
  loadGoogleFont(url) {
    if (typeof document !== 'undefined') {
      // Check if font is already loaded
      const existingLink = document.querySelector(`link[href="${url}"]`);
      if (existingLink) return;
      
      const link = document.createElement('link');
      link.href = url;
      link.rel = 'stylesheet';
      link.type = 'text/css';
      document.head.appendChild(link);
      
      console.log('🔤 Google Font loaded for preview:', url);
    }
  },

  // Load all fonts from database for preview
  async loadAllFontsForPreview() {
    try {
      const response = await fetch(`${supabaseConfig.url}/rest/v1/typography_system?select=name,google_fonts_url&is_active=eq.true`, {
        headers: {
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.anonKey}`
        }
      });
      
      if (response.ok) {
        const fonts = await response.json();
        fonts.forEach(font => {
          if (font.google_fonts_url) {
            this.loadGoogleFont(font.google_fonts_url);
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
// BRAND TAB WITH COMPLETE FILE UPLOAD + DATABASE INTEGRATION
// =============================================================================

function AdminBrandTab({ theme, isDarkMode }) {
  const [activeSection, setActiveSection] = useState('colors');
  const [notifications, setNotifications] = useState([]);
  
  // States for all brand kit elements
  const [brandColors, setBrandColors] = useState(() => {
    return safeLocalStorage.getItem('brandColors', [
      { id: 1, name: 'Primary Blue', hex: '#3b82f6', usage: 'Main brand color' },
      { id: 2, name: 'Secondary Green', hex: '#10b981', usage: 'Success states' }
    ]);
  });

  const [logos, setLogos] = useState(() => {
    return safeLocalStorage.getItem('brandLogos', [
      { id: 1, name: 'Primary Logo', type: 'SVG', size: '1.2 MB', usage: 'Main brand identity' }
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
      showNotification(`Save failed: ${error.message}`, 'error');
    }
    
    setNewColor({ name: '', hex: '#523474', usage: '' });
    setShowColorForm(false);
    setEditingColor(null);
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
      showNotification(`Logo save failed: ${error.message}`, 'error');
    }
  };

  // Font management functions
  const handleSaveFont = async () => {
    if (!editFontData.name.trim()) {
      showNotification('Please enter a font name', 'error');
      return;
    }

    showNotification('Saving font to Supabase...', 'info');
    
    try {
      await supabaseAPI.saveFont(editFontData);
      
      const updatedFonts = fonts.map(f => 
        f.id === editingFont.id ? { ...f, ...editFontData } : f
      );
      setFonts(updatedFonts);
      safeLocalStorage.setItem('brandFonts', updatedFonts);
      
      showNotification(`${editFontData.name} saved to Supabase and loaded for preview!`, 'success');
      setEditingFont(null);
      setEditFontData({ name: '', category: '', usage: '', weight: '' });
    } catch (error) {
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
                  onClick={() => {
                    setNewColor({ name: '', hex: '#523474', usage: '' });
                    setShowColorForm(false);
                    setEditingColor(null);
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
                    onClick={() => {
                      navigator.clipboard?.writeText(color.hex);
                      showNotification(`${color.hex} copied!`, 'success');
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
                  usage: 'Enter usage description'
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
                  onClick={() => {
                    setEditingLogo(null);
                    setEditLogoData({ name: '', type: '', usage: '', category: 'Primary Logo' });
                    setLogoFile(null);
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

      {/* TYPOGRAPHY SECTION WITH GOOGLE FONTS */}
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
              🔤 Typography → Supabase Database + Google Fonts
            </h3>
            <button 
              onClick={() => {
                const newFont = {
                  id: fonts.length > 0 ? Math.max(...fonts.map(f => f.id)) + 1 : 1,
                  name: 'Poppins',
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
                
                showNotification('New font added - edit the details below', 'success');
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

          {/* Font Editing Form */}
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
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <select
                  value={editFontData.name}
                  onChange={(e) => setEditFontData(prev => ({ ...prev, name: e.target.value }))}
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
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Lato">Lato</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Source Sans Pro">Source Sans Pro</option>
                </select>
                
                <select
                  value={editFontData.category}
                  onChange={(e) => setEditFontData(prev => ({ ...prev, category: e.target.value }))}
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
                  <option value="Primary">Primary</option>
                  <option value="Secondary">Secondary</option>
                  <option value="Accent">Accent</option>
                </select>
              </div>

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
                  placeholder="e.g., 400-700"
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
                  placeholder="e.g., Headlines, UI text"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setEditingFont(null);
                    setEditFontData({ name: '', category: '', usage: '', weight: '' });
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
                  💾 Save to Supabase
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
                </div>
                
                {/* Font Preview with Google Fonts */}
                <div style={{
                  padding: '25px',
                  backgroundColor: theme.headerBackground,
                  borderRadius: '8px',
                  border: `1px solid ${theme.borderColor}`,
                  fontFamily: `'${font.name}', sans-serif`
                }}>
                  <div style={{ 
                    fontSize: '32px', 
                    marginBottom: '12px', 
                    fontWeight: 'bold', 
                    color: theme.textPrimary,
                    fontFamily: `'${font.name}', sans-serif`
                  }}>
                    The quick brown fox jumps
                  </div>
                  <div style={{ 
                    fontSize: '18px', 
                    marginBottom: '10px', 
                    color: theme.textPrimary,
                    fontFamily: `'${font.name}', sans-serif`
                  }}>
                    Regular weight sample text for {font.name}
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    color: theme.textSecondary, 
                    fontWeight: '500',
                    fontFamily: `'${font.name}', sans-serif`
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
                    ✅ Google Fonts loaded: '{font.name}' preview active
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

// Keep existing Templates and Libraries tabs (placeholder)
function AdminTemplatesTab({ theme }) {
  return (
    <div style={{ padding: '30px', color: theme.textPrimary }}>
      <h3>Templates Tab - Keep your existing code here</h3>
      <p style={{ color: theme.textSecondary }}>This section unchanged from your original code.</p>
    </div>
  );
}

function AdminLibrariesTab({ theme }) {
  return (
    <div style={{ padding: '30px', color: theme.textPrimary }}>
      <h3>Libraries Tab - Keep your existing code here</h3>
      <p style={{ color: theme.textSecondary }}>This section unchanged from your original code.</p>
    </div>
  );
}

export default AdminComponents;
