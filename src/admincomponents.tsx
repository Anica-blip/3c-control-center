import React, { useState, useEffect } from 'react';

// =============================================================================
// COMPLETE SUPABASE EDGE FUNCTIONS INTEGRATION
// =============================================================================
// Vite Supabase Client Configuration
const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
};

// =============================================================================
// SCHEMA-COMPLIANT SUPABASE API - ALL EDGE FUNCTIONS MATCHING SCHEMA
// =============================================================================

const supabaseAPI = {
  // Upload file to Supabase Storage bucket - SCHEMA COMPLIANT
  async uploadFileToBucket(file: File, fileName: string, bucketName = 'brand_assets') {
    console.log('🔄 Uploading file to bucket:', { fileName, bucketName, size: file.size });
    
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

// Fetch colors from Supabase
  async fetchColors() {
    console.log('🎨 Fetching colors from Supabase...');
    
    try {
      const response = await fetch(`${supabaseConfig.url}/rest/v1/brand_colors`, {
        method: 'GET',
        headers: {
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch colors: ${response.status}`);
      }
      
      const colors = await response.json();
      console.log('✅ Colors fetched from Supabase:', colors);
      return colors;
    } catch (error) {
      console.error('💥 Color fetch error:', error);
      return [];
    }
  },

  // Save color to Supabase
  async saveColor(colorData: any) {
    console.log('🎨 Saving color to Supabase:', colorData);
    
    try {
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

  // Update color using Edge Function - FIXED NAME
  async updateColor(colorId: number, colorData: any) {
    console.log('🎨 Updating color via Edge Function:', { colorId, colorData });
    
    try {
      const response = await fetch(`${supabaseConfig.url}/functions/v1/update_brand_colors-ts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
        },
        body: JSON.stringify({
          colorId: colorId,
          colorData: colorData
        })
      });
      
      if (!response.ok) {
        throw new Error(`Color update failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Color updated via Edge Function:', result);
      return result.data;
    } catch (error) {
      console.error('💥 Color update error:', error);
      throw error;
    }
  },

  // Delete color using Edge Function - FIXED NAME
  async deleteColor(colorId: number) {
    console.log('🎨 Deleting color via Edge Function:', colorId);
    
    try {
      const response = await fetch(`${supabaseConfig.url}/functions/v1/delete_brand_colors-ts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
        },
        body: JSON.stringify({
          colorId: colorId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Color delete failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Color deleted via Edge Function:', result);
      return true;
    } catch (error) {
      console.error('💥 Color delete error:', error);
      throw error;
    }
  },

  // MIRROR CHARACTER PROFILES: Direct fetch logos (like loadCharacters)
  async fetchLogos(supabase) {
    if (!supabase) {
      console.warn('Supabase not configured. Using empty logo list.');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('brand_logos')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading logos:', error);
      return [];
    }
  },

  // MIRROR CHARACTER PROFILES: Direct save logo (like addCharacter)
  async saveLogo(supabase, logoData: any, file: File | null = null) {
    if (!logoData.name.trim()) return;
    
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    
    try {
      let logoUrl = null;
      
      // Upload image if one was selected (same pattern as character profiles)
      if (file) {
        const fileName = `logos/${logoData.name.replace(/[^a-zA-Z0-9]/g, '_')}_logo_${Date.now()}.${file.name.split('.').pop()}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('brand_assets')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('brand_assets')
          .getPublicUrl(fileName);

        logoUrl = publicUrl;
      }
      
      const logoRecord = {
        name: logoData.name.trim(),
        type: logoData.type || (file ? file.type.split('/')[1].toUpperCase() : 'PNG'),
        usage: logoData.usage?.trim() || null,
        category: logoData.category || 'Primary Logo',
        logo_url: logoUrl,
        file_size: file ? Math.round(file.size / 1024) : null,
        mime_type: file ? file.type : null,
        is_active: true,
        user_id: null
      };
      
      const { data, error } = await supabase
        .from('brand_logos')
        .insert([logoRecord])
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error saving logo:', error);
      throw error;
    }
  },

  // MIRROR CHARACTER PROFILES: Upload logo (simplified to call saveLogo)
  async uploadLogo(supabase, file: File, logoData: any) {
    return await this.saveLogo(supabase, logoData, file);
  },

  // MIRROR CHARACTER PROFILES: Direct update logo (like saveCharacterEdit)
  async updateLogo(supabase, logoId: number, logoData: any, file: File | null = null) {
    if (!logoData.name.trim()) return;
    
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    
    try {
      let logoUrl = null;
      
      if (file) {
        const fileName = `logos/${logoData.name.replace(/[^a-zA-Z0-9]/g, '_')}_logo_${Date.now()}.${file.name.split('.').pop()}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('brand_assets')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('brand_assets')
          .getPublicUrl(fileName);

        logoUrl = publicUrl;
      }
      
      const updateData = {
        name: logoData.name.trim(),
        type: logoData.type || 'PNG',
        usage: logoData.usage?.trim() || null,
        category: logoData.category || 'Primary Logo',
        ...(logoUrl && { logo_url: logoUrl })
      };
      
      const { data, error } = await supabase
        .from('brand_logos')
        .update(updateData)
        .eq('id', logoId)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error updating logo:', error);
      throw error;
    }
  },

  // MIRROR CHARACTER PROFILES: Direct delete logo (like deleteCharacter)
  async deleteLogo(supabase, logoId: number) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    
    try {
      const { error } = await supabase
        .from('brand_logos')
        .update({ is_active: false })
        .eq('id', logoId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting logo:', error);
      throw error;
    }
  },

// Fetch fonts from Supabase
  async fetchFont() {
    console.log('📋 Fetching font from Supabase...');
    
    try {
      const response = await fetch(`${supabaseConfig.url}/rest/v1/brand_font`, {
        method: 'GET',
        headers: {
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch font: ${response.status}`);
      }
      
      const font = await response.json();
      console.log('✅ font fetched from Supabase:', font);
      return font;
    } catch (error) {
      console.error('💥 font fetch error:', error);
      return [];
    }
  },

  // Save font to Supabase - MINIMAL FIX: Handle both object and separate parameters
  async saveFont(sectionOrFontData: any, content?: any) {
    console.log('📋 Saving font to Supabase:', { sectionOrFontData, content });
    
    // Handle when called with font object from component
    if (typeof sectionOrFontData === 'object' && sectionOrFontData.name) {
      const fontData = sectionOrFontData;
      const section = fontData.category || 'primary';
      const contentData = JSON.stringify(fontData);
      
      try {
        const response = await fetch(`${supabaseConfig.url}/rest/v1/brand_font`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseConfig.anonKey,
            'Authorization': `Bearer ${supabaseConfig.anonKey}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            section: section,
            title: `${section.charAt(0).toUpperCase() + section.slice(1)} font`,
            content: contentData,
            type: `${section.charAt(0).toUpperCase() + section.slice(1)} Usage`,
            status: 'Active',
            version_number: 1
          })
        });
        
        if (!response.ok) {
          throw new Error(`font save failed: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ font saved to Supabase:', result);
        return result;
      } catch (error) {
        console.error('💥 font save error:', error);
        throw error;
      }
    }
    
    // Handle when called with separate parameters (original way)
    const section = sectionOrFontData;
    if (!section || typeof section !== 'string') {
      throw new Error('Section parameter must be a non-empty string');
    }
    
    try {
      const response = await fetch(`${supabaseConfig.url}/rest/v1/brand_font`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          section: section,
          title: `${section.charAt(0).toUpperCase() + section.slice(1)} font`,
          content: typeof content === 'string' ? content : JSON.stringify(content),
          type: `${section.charAt(0).toUpperCase() + section.slice(1)} Usage`,
          status: 'Active',
          version_number: 1
        })
      });
      
      if (!response.ok) {
        throw new Error(`font save failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ font saved to Supabase:', result);
      return result;
    } catch (error) {
      console.error('💥 font save error:', error);
      throw error;
    }
  },

  // Update font using Edge Function
  async updateFont(fontId: number, fontData: any) {
    console.log('📋 Updating font via Edge Function:', { fontId, fontData });
    
    try {
      const response = await fetch(`${supabaseConfig.url}/functions/v1/update_brand_font-ts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
        },
        body: JSON.stringify({
          fontId: fontId,
          fontData: fontData
        })
      });
      
      if (!response.ok) {
        throw new Error(`font update failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ font updated via Edge Function:', result);
      return result.data;
    } catch (error) {
      console.error('💥 font update error:', error);
      throw error;
    }
  },

  // Delete font using Edge Function
  async deleteFont(fontId: number) {
    console.log('📋 Deleting font via Edge Function:', fontId);
    
    try {
      const response = await fetch(`${supabaseConfig.url}/functions/v1/delete_brand_font-ts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
        },
        body: JSON.stringify({
          fontId: fontId
        })
      });
      
      if (!response.ok) {
        throw new Error(`font delete failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ font deleted via Edge Function:', result);
      return true;
    } catch (error) {
      console.error('💥 font delete error:', error);
      throw error;
    }
  },

  // Fetch guidelines from Supabase
  async fetchGuidelines() {
    console.log('📋 Fetching guidelines from Supabase...');
    
    try {
      const response = await fetch(`${supabaseConfig.url}/rest/v1/brand_guidelines`, {
        method: 'GET',
        headers: {
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch guidelines: ${response.status}`);
      }
      
      const guidelines = await response.json();
      console.log('✅ Guidelines fetched from Supabase:', guidelines);
      return guidelines;
    } catch (error) {
      console.error('💥 Guidelines fetch error:', error);
      return [];
    }
  },

  // Save guidelines to Supabase
  async saveGuidelines(section: string, content: any) {
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

  // Update guidelines using Edge Function
  async updateGuidelines(guidelineId: number, guidelineData: any) {
    console.log('📋 Updating guidelines via Edge Function:', { guidelineId, guidelineData });
    
    try {
      const response = await fetch(`${supabaseConfig.url}/functions/v1/update_brand_guidelines-ts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
        },
        body: JSON.stringify({
          guidelineId: guidelineId,
          guidelineData: guidelineData
        })
      });
      
      if (!response.ok) {
        throw new Error(`Guidelines update failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Guidelines updated via Edge Function:', result);
      return result.data;
    } catch (error) {
      console.error('💥 Guidelines update error:', error);
      throw error;
    }
  },

  // Delete guidelines using Edge Function
  async deleteGuidelines(guidelineId: number) {
    console.log('📋 Deleting guidelines via Edge Function:', guidelineId);
    
    try {
      const response = await fetch(`${supabaseConfig.url}/functions/v1/delete_brand_guidelines-ts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
        },
        body: JSON.stringify({
          guidelineId: guidelineId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Guidelines delete failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Guidelines deleted via Edge Function:', result);
      return true;
    } catch (error) {
      console.error('💥 Guidelines delete error:', error);
      throw error;
    }
  },

  // Generate Google Fonts URL
  generateGoogleFontsUrl(fontName: string) {
    const cleanFontName = fontName.trim().replace(/\s+/g, '+');
    return `https://fonts.googleapis.com/css2?family=${cleanFontName}:wght@300;400;500;600;700&display=swap`;
  },

  // Load Google Font for preview
  loadGoogleFont(url: string, fontName: string) {
    if (typeof document !== 'undefined') {
      const existingLink = document.querySelector(`link[href="${url}"]`);
      if (existingLink) return;
      
      const link = document.createElement('link');
      link.href = url;
      link.rel = 'stylesheet';
      link.type = 'text/css';
      
      link.onload = () => {
        console.log(`✅ Google Font loaded successfully: ${fontName}`);
      };
      
      link.onerror = () => {
        console.log(`⚠️ Could not load Google Font: ${fontName}`);
      };
      
      document.head.appendChild(link);
    }
  }
};

// =============================================================================
// ADMIN COMPONENTS - COMPLETE IMPLEMENTATION
// =============================================================================

function AdminComponents({ isDarkMode = false }: { isDarkMode?: boolean }) {
  const [activeTab, setActiveTab] = useState('templates');

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
// TEMPLATES TAB
// =============================================================================

function AdminTemplatesTab({ theme }: { theme: any }) {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
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

  const updateField = (index: number, value: string) => {
    setNewTemplate(prev => ({
      ...prev,
      fields: prev.fields.map((field, i) => i === index ? value : field)
    }));
  };

  const removeField = (index: number) => {
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
// LIBRARIES TAB
// =============================================================================

function AdminLibrariesTab({ theme }: { theme: any }) {
  const [notionConnected, setNotionConnected] = useState(false);
  const [wasabiConnected, setWasabiConnected] = useState(false);
  const [canvaConnected, setCanvaConnected] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const showNotification = (message: string, type = 'info') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const handleNotionToggle = () => {
    if (notionConnected) {
      setNotionConnected(false);
      showNotification('Notion disconnected successfully', 'info');
    } else {
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
  }: { 
    title: string; 
    subtitle: string; 
    emoji: string; 
    connected: boolean; 
    onToggle: () => void; 
    children: React.ReactNode; 
    gradientColor: string; 
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
            {connected ? '✅ Connected' : '⏱ Ready to Connect'}
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
          emoji="📚"
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
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
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
// BRAND TAB - COMPLETE WITH ALL EDGE FUNCTION INTEGRATIONS
// =============================================================================

function AdminBrandTab({ theme, isDarkMode }: { theme: any; isDarkMode: boolean }) {
  const [activeSection, setActiveSection] = useState('colors');
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // States for all brand kit elements
  const [brandColors, setBrandColors] = useState<any[]>([]);
  const [logos, setLogos] = useState<any[]>([]);
  const [fonts, setFonts] = useState<any[]>([]);
  const [guidelines, setGuidelines] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);

  // Load data from Supabase on component mount
  useEffect(() => {
    loadDataFromSupabase();
  }, []);

  const loadDataFromSupabase = async () => {
    setLoading(true);
    try {
      const [colorsData, logosData, fontsData, guidelinesData] = await Promise.all([
        supabaseAPI.fetchColors(),
        supabaseAPI.fetchLogos(),
        supabaseAPI.fetchFonts(),
        supabaseAPI.fetchGuidelines()
      ]);
      
      setBrandColors(colorsData);
      setLogos(logosData);
      setFonts(fontsData);
      setGuidelines(guidelinesData);
      
      showNotification('Brand data loaded from Supabase!', 'success');
    } catch (error) {
      console.error('Failed to load data from Supabase:', error);
      showNotification('Failed to load brand data from Supabase', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Form states for colors
  const [showColorForm, setShowColorForm] = useState(false);
  const [editingColor, setEditingColor] = useState<any>(null);
  const [newColor, setNewColor] = useState({
    name: '',
    hex: '#3b82f6',
    usage: ''
  });

  // Form states for logos
  const [showLogoForm, setShowLogoForm] = useState(false);
  const [editingLogo, setEditingLogo] = useState<any>(null);
  const [editLogoData, setEditLogoData] = useState({
    name: '',
    type: 'PNG',
    usage: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Typography states
  const [showFontForm, setShowFontForm] = useState(false);
  const [editingFont, setEditingFont] = useState<any>(null);
  const [editFontData, setEditFontData] = useState({
    name: '',
    category: 'Primary',
    usage: '',
    weight: '400-600'
  });

  // Guidelines states
  const [showGuidelinesForm, setShowGuidelinesForm] = useState(false);
  const [editingGuideline, setEditingGuideline] = useState<any>(null);
  const [editGuidelineData, setEditGuidelineData] = useState({
    section: 'logo',
    title: '',
    content: '',
    type: 'Logo Usage'
  });

  // Notification system
  const showNotification = (message: string, type = 'info') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const dismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // =============================================================================
  // COLOR MANAGEMENT FUNCTIONS
  // =============================================================================

  const handleAddColor = () => {
    setShowColorForm(true);
    setEditingColor(null);
    setNewColor({ name: '', hex: '#3b82f6', usage: '' });
  };

  const handleEditColor = (color: any) => {
    setEditingColor(color);
    setNewColor({
      name: color.name,
      hex: color.hex_code || color.hex,
      usage: color.usage
    });
    setShowColorForm(true);
  };

  const handleSaveColor = async () => {
    if (!newColor.name.trim() || !newColor.hex.trim() || !newColor.usage.trim()) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    showNotification('Saving color to Supabase...', 'info');

    try {
      if (editingColor) {
        await supabaseAPI.updateColor(editingColor.id, newColor);
        showNotification(`Updated ${newColor.name}`, 'success');
      } else {
        await supabaseAPI.saveColor(newColor);
        showNotification(`${newColor.name} saved to Supabase!`, 'success');
      }
      
      const updatedColors = await supabaseAPI.fetchColors();
      setBrandColors(updatedColors);
      
    } catch (error: any) {
      showNotification(`Failed to save color: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
    
    setNewColor({ name: '', hex: '#3b82f6', usage: '' });
    setShowColorForm(false);
    setEditingColor(null);
  };

  const handleCancelColor = () => {
    setNewColor({ name: '', hex: '#3b82f6', usage: '' });
    setShowColorForm(false);
    setEditingColor(null);
  };

  const handleDeleteColor = async (colorId: number) => {
    setLoading(true);
    showNotification('Deleting color from Supabase...', 'info');

    try {
      await supabaseAPI.deleteColor(colorId);
      showNotification('Color deleted successfully', 'success');
      
      const updatedColors = await supabaseAPI.fetchColors();
      setBrandColors(updatedColors);
      
    } catch (error: any) {
      showNotification(`Failed to delete color: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
    
    setShowColorForm(false);
    setEditingColor(null);
  };

  const handleCopyColor = (hex: string) => {
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

  // =============================================================================
  // LOGO MANAGEMENT FUNCTIONS
  // =============================================================================

  const handleAddLogo = () => {
    setShowLogoForm(true);
    setEditingLogo(null);
    setEditLogoData({ name: '', type: 'PNG', usage: '' });
    setLogoFile(null);
  };

  const handleEditLogo = (logo: any) => {
    setEditingLogo(logo);
    setEditLogoData({
      name: logo.name,
      type: logo.type,
      usage: logo.usage
    });
    setShowLogoForm(true);
  };

  const handleLogoFileSelect = (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
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
      
      showNotification(`${file.name} selected successfully`, 'success');
    }
  };

  const handleSaveLogo = async () => {
    if (!editLogoData.name.trim() || !editLogoData.usage.trim()) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    if (!editingLogo && !logoFile) {
      showNotification('Please select a logo file', 'error');
      return;
    }

    setLoading(true);
    showNotification('Saving logo to Supabase...', 'info');

    try {
      if (editingLogo) {
        await supabaseAPI.updateLogo(editingLogo.id, editLogoData, logoFile);
        showNotification(`${editLogoData.name} updated in Supabase!`, 'success');
      } else {
        await supabaseAPI.saveLogo(editLogoData, logoFile);
        showNotification(`${editLogoData.name} saved to Supabase!`, 'success');
      }
      
      const updatedLogos = await supabaseAPI.fetchLogos();
      setLogos(updatedLogos);
      
    } catch (error: any) {
      showNotification(`Failed to save logo: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
    
    setShowLogoForm(false);
    setEditingLogo(null);
    setEditLogoData({ name: '', type: '', usage: '' });
    setLogoFile(null);
  };

  const handleCancelLogo = () => {
    setShowLogoForm(false);
    setEditingLogo(null);
    setEditLogoData({ name: '', type: '', usage: '' });
    setLogoFile(null);
  };

  const handleDeleteLogo = async (logoId: number) => {
    setLoading(true);
    showNotification('Deleting logo from Supabase...', 'info');

    try {
      await supabaseAPI.deleteLogo(logoId);
      showNotification('Logo deleted successfully', 'success');
      
      const updatedLogos = await supabaseAPI.fetchLogos();
      setLogos(updatedLogos);
      
    } catch (error: any) {
      showNotification(`Failed to delete logo: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
    
    setShowLogoForm(false);
    setEditingLogo(null);
  };

  // =============================================================================
  // TYPOGRAPHY MANAGEMENT FUNCTIONS
  // =============================================================================

  const handleAddFont = () => {
    setShowFontForm(true);
    setEditingFont(null);
    setEditFontData({ name: '', category: 'Primary', usage: '', weight: '400-600' });
  };

  const handleEditFont = (font: any) => {
    setEditingFont(font);
    setEditFontData({
      name: font.name,
      category: font.category,
      usage: font.usage,
      weight: font.weight_range || font.weight
    });
    setShowFontForm(true);
  };

  const handleSaveFont = async () => {
    if (!editFontData.name.trim()) {
      showNotification('Please enter a font name', 'error');
      return;
    }

    setLoading(true);
    showNotification('Saving font to Supabase...', 'info');
    
    try {
      if (editingFont) {
        await supabaseAPI.updateFont(editingFont.id, editFontData);
        showNotification(`${editFontData.name} updated in Supabase!`, 'success');
      } else {
        await supabaseAPI.saveFont(editFontData);
        showNotification(`${editFontData.name} saved to Supabase!`, 'success');
      }
      
      const updatedFonts = await supabaseAPI.fetchFonts();
      setFonts(updatedFonts);
      
    } catch (error: any) {
      showNotification(`Failed to save font: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
    
    setShowFontForm(false);
    setEditingFont(null);
    setEditFontData({ name: '', category: '', usage: '', weight: '' });
  };

  const handleCancelFont = () => {
    setShowFontForm(false);
    setEditingFont(null);
    setEditFontData({ name: '', category: '', usage: '', weight: '' });
  };

  const handleDeleteFont = async (fontId: number) => {
    setLoading(true);
    showNotification('Deleting font from Supabase...', 'info');

    try {
      await supabaseAPI.deleteFont(fontId);
      showNotification('Font deleted successfully', 'success');
      
      const updatedFonts = await supabaseAPI.fetchFonts();
      setFonts(updatedFonts);
      
    } catch (error: any) {
      showNotification(`Failed to delete font: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
    
    setShowFontForm(false);
    setEditingFont(null);
  };

  // =============================================================================
  // GUIDELINES MANAGEMENT FUNCTIONS - COMPLETE WITH EDGE FUNCTIONS
  // =============================================================================

  const handleAddGuideline = () => {
    setShowGuidelinesForm(true);
    setEditingGuideline(null);
    setEditGuidelineData({
      section: 'logo',
      title: '',
      content: '',
      type: 'Logo Usage'
    });
  };

  const handleEditGuideline = (guideline: any) => {
    setEditingGuideline(guideline);
    setEditGuidelineData({
      section: guideline.section,
      title: guideline.title,
      content: typeof guideline.content === 'string' ? guideline.content : JSON.stringify(guideline.content),
      type: guideline.type
    });
    setShowGuidelinesForm(true);
  };

  const handleSaveGuideline = async () => {
    if (!editGuidelineData.title.trim() || !editGuidelineData.content.trim()) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    showNotification('Saving guideline to Supabase...', 'info');

    try {
      if (editingGuideline) {
        // Use Edge Function for update
        await supabaseAPI.updateGuidelines(editingGuideline.id, editGuidelineData);
        showNotification(`${editGuidelineData.title} updated!`, 'success');
      } else {
        // Use REST API for create
        await supabaseAPI.saveGuidelines(editGuidelineData.section, editGuidelineData.content);
        showNotification(`${editGuidelineData.title} saved to Supabase!`, 'success');
      }
      
      // Refresh guidelines data
      const updatedGuidelines = await supabaseAPI.fetchGuidelines();
      setGuidelines(updatedGuidelines);
      
    } catch (error: any) {
      showNotification(`Failed to save guideline: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
    
    setShowGuidelinesForm(false);
    setEditingGuideline(null);
    setEditGuidelineData({ section: 'logo', title: '', content: '', type: 'Logo Usage' });
  };

  const handleCancelGuideline = () => {
    setShowGuidelinesForm(false);
    setEditingGuideline(null);
    setEditGuidelineData({ section: 'logo', title: '', content: '', type: 'Logo Usage' });
  };

  const handleDeleteGuideline = async (guidelineId: number) => {
    setLoading(true);
    showNotification('Deleting guideline from Supabase...', 'info');

    try {
      // Use Edge Function for delete
      await supabaseAPI.deleteGuidelines(guidelineId);
      showNotification('Guideline deleted successfully', 'success');
      
      // Refresh guidelines data
      const updatedGuidelines = await supabaseAPI.fetchGuidelines();
      setGuidelines(updatedGuidelines);
      
    } catch (error: any) {
      showNotification(`Failed to delete guideline: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
    
    setShowGuidelinesForm(false);
    setEditingGuideline(null);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: theme.background }}>
      {/* Loading Overlay */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          📄 Processing...
        </div>
      )}

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
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minWidth: '300px'
            }}>
              <span>{notification.message}</span>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h2 style={{ color: theme.textPrimary, fontSize: '20px', fontWeight: 'bold', margin: '0' }}>
          🏢 Brand Kit
        </h2>
        <button
          onClick={loadDataFromSupabase}
          style={{
            padding: '8px 16px',
            backgroundColor: theme.buttonPrimary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          🔄 Refresh from Supabase
        </button>
      </div>
      <p style={{ color: theme.textSecondary, fontSize: '14px', margin: '0 0 30px 0' }}>
        Brand guidelines, assets, and style management (Connected to Supabase Edge Functions)
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
          { id: 'fonts', label: '🔤 Typography' },
          { id: 'guidelines', label: '📋 Guidelines' }
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
              🎨 Brand Colors ({brandColors.length} colors)
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

          {/* Add/Edit Color Form */}
          {showColorForm && (
            <div style={{
              padding: '30px',
              border: '2px solid #8b5cf6',
              borderRadius: '12px',
              backgroundColor: theme.background,
              marginBottom: '30px',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)'
            }}>
              <h4 style={{ color: theme.textPrimary, marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>
                🎨 {editingColor ? 'Edit Brand Color' : 'Add New Brand Color'}
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: theme.textPrimary,
                    fontSize: '14px'
                  }}>
                    Color Name *
                  </label>
                  <input
                    type="text"
                    value={newColor.name}
                    onChange={(e) => setNewColor(prev => ({ ...prev, name: e.target.value }))}
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
                    placeholder="e.g., Primary Blue"
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
                    Hex Code *
                  </label>
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
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: theme.textPrimary,
                  fontSize: '14px'
                }}>
                  Usage Description *
                </label>
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
                    outline: 'none'
                  }}
                  placeholder="Describe where and how this color should be used..."
                />
              </div>

              {/* Color preview with white background for visibility */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                marginBottom: '25px',
                padding: '20px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '2px solid #e5e7eb'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: newColor.hex,
                  borderRadius: '8px',
                  border: '2px solid #000000'
                }}></div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                    {newColor.name || 'New Color'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', fontFamily: 'monospace' }}>
                    {newColor.hex}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
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
                {editingColor && (
                  <button
                    onClick={() => handleDeleteColor(editingColor.id)}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    🗑️ Delete
                  </button>
                )}
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
                  💾 Save Color
                </button>
              </div>
            </div>
          )}
          
          {/* Color Grid */}
          {brandColors.length === 0 ? (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              border: `2px dashed ${theme.borderColor}`,
              borderRadius: '12px',
              backgroundColor: theme.background
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
              <h4 style={{ color: theme.textPrimary, fontSize: '18px', marginBottom: '8px', fontWeight: 'bold' }}>
                No Brand Colors Yet
              </h4>
              <p style={{ color: theme.textSecondary, fontSize: '14px', margin: '0 0 20px 0' }}>
                Add your first brand color to get started with your brand kit
              </p>
              <button 
                onClick={handleAddColor}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                ➕ Add Your First Color
              </button>
            </div>
          ) : (
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
                      backgroundColor: color.hex_code || color.hex,
                      borderRadius: '12px',
                      border: '2px solid #ffffff',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                    }}></div>
                    <div>
                      <h4 style={{ margin: '0 0 6px 0', color: theme.textPrimary, fontSize: '16px', fontWeight: 'bold' }}>
                        {color.name}
                      </h4>
                      <div style={{ 
                        fontSize: '14px', 
                        color: theme.textSecondary, 
                        fontFamily: 'monospace', 
                        fontWeight: 'bold' 
                      }}>
                        {color.hex_code || color.hex}
                      </div>
                    </div>
                  </div>
                  <p style={{ 
                    margin: '0 0 20px 0', 
                    fontSize: '14px', 
                    color: theme.textSecondary,
                    lineHeight: '1.5'
                  }}>
                    {color.usage}
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleCopyColor(color.hex_code || color.hex)}
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
          )}
        </div>
      )}

      {/* LOGOS SECTION */}
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
              🏷️ Logo Assets ({logos.length} logos)
            </h3>
            <button 
              onClick={handleAddLogo}
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

          {/* Logo Form */}
          {showLogoForm && (
            <div style={{
              padding: '30px',
              border: '2px solid #8b5cf6',
              borderRadius: '12px',
              backgroundColor: theme.background,
              marginBottom: '30px',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)'
            }}>
              <h4 style={{ color: theme.textPrimary, marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>
                🏷️ {editingLogo ? `Edit Logo: ${editingLogo.name}` : 'Add New Logo'}
              </h4>
              
              {/* Image Upload Section */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: theme.textPrimary,
                  fontSize: '14px'
                }}>
                  Logo Image *
                </label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button
                    onClick={() => {
                      if (typeof document !== 'undefined') {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*,.svg';
                        input.style.display = 'none';
                        input.onchange = handleLogoFileSelect;
                        document.body.appendChild(input);
                        input.click();
                        document.body.removeChild(input);
                      }
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
                    🔍 Choose Image File
                  </button>
                  {logoFile && (
                    <span style={{ color: theme.textSecondary, fontSize: '14px' }}>
                      Selected: {logoFile.name}
                    </span>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: theme.textPrimary,
                    fontSize: '14px'
                  }}>
                    Logo Name *
                  </label>
                  <input
                    type="text"
                    value={editLogoData.name}
                    onChange={(e) => setEditLogoData(prev => ({ ...prev, name: e.target.value }))}
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
                    placeholder="e.g., Primary Logo"
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
                    File Type
                  </label>
                  <select
                    value={editLogoData.type}
                    onChange={(e) => setEditLogoData(prev => ({ ...prev, type: e.target.value }))}
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
                    <option value="SVG">SVG</option>
                    <option value="PNG">PNG</option>
                    <option value="JPG">JPG</option>
                    <option value="WebP">WebP</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: theme.textPrimary,
                  fontSize: '14px'
                }}>
                  Usage Description *
                </label>
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
                    outline: 'none'
                  }}
                  placeholder="Describe where and how this logo should be used..."
                />
              </div>

              {/* Form Actions */}
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
                {editingLogo && (
                  <button
                    onClick={() => handleDeleteLogo(editingLogo.id)}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    🗑️ Delete
                  </button>
                )}
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
                  💾 Save Logo
                </button>
              </div>
            </div>
          )}
          
          {/* Logo Grid */}
          {logos.length === 0 ? (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              border: `2px dashed ${theme.borderColor}`,
              borderRadius: '12px',
              backgroundColor: theme.background
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏷️</div>
              <h4 style={{ color: theme.textPrimary, fontSize: '18px', marginBottom: '8px', fontWeight: 'bold' }}>
                No Logo Assets Yet
              </h4>
              <p style={{ color: theme.textSecondary, fontSize: '14px', margin: '0 0 20px 0' }}>
                Upload your first logo to start building your brand asset library
              </p>
              <button 
                onClick={handleAddLogo}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                ➕ Add Your First Logo
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {logos.map(logo => (
                <div key={logo.id} style={{
                  padding: '25px',
                  border: `1px solid ${theme.borderColor}`,
                  borderRadius: '12px',
                  backgroundColor: theme.background,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{
                      width: '80px',
                      height: '60px',
                      backgroundColor: '#ffffff',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      backgroundImage: logo.file_url ? `url(${logo.file_url})` : 'none',
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center'
                    }}>
                      {!logo.file_url && '🏷️'}
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 6px 0', color: theme.textPrimary, fontSize: '16px', fontWeight: 'bold' }}>
                        {logo.name}
                      </h4>
                      <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                        {logo.type} • {logo.file_size || 'Unknown size'} • {logo.usage}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
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
                    <button 
                      onClick={() => handleDeleteLogo(logo.id)}
                      style={{
                        padding: '10px 16px',
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
              ))}
            </div>
          )}
        </div>
      )}

      {/* TYPOGRAPHY SECTION */}
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
              🔤 Typography System ({fonts.length} fonts)
            </h3>
            <button 
              onClick={handleAddFont}
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

          {/* Font Form */}
          {showFontForm && (
            <div style={{
              padding: '30px',
              border: '2px solid #3b82f6',
              borderRadius: '12px',
              backgroundColor: theme.background,
              marginBottom: '30px',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
            }}>
              <h4 style={{ color: theme.textPrimary, marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>
                🔤 {editingFont ? `Edit Font: ${editingFont.name}` : 'Add New Font'}
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: theme.textPrimary,
                    fontSize: '14px'
                  }}>
                    Font Name *
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
                    placeholder="e.g., Inter, Roboto, Playfair Display"
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
                  >
                    <option value="Primary">Primary</option>
                    <option value="Secondary">Secondary</option>
                    <option value="Accent">Accent</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: theme.textPrimary,
                    fontSize: '14px'
                  }}>
                    Font Weight Range
                  </label>
                  <input
                    type="text"
                    value={editFontData.weight}
                    onChange={(e) => setEditFontData(prev => ({ ...prev, weight: e.target.value }))}
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
                    placeholder="e.g., 400-700"
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
                    Usage Description *
                  </label>
                  <input
                    type="text"
                    value={editFontData.usage}
                    onChange={(e) => setEditFontData(prev => ({ ...prev, usage: e.target.value }))}
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
                    placeholder="e.g., Headlines, UI text"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleCancelFont}
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
                {editingFont && (
                  <button
                    onClick={() => handleDeleteFont(editingFont.id)}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    🗑️ Delete
                  </button>
                )}
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
                  💾 Save Font
                </button>
              </div>
            </div>
          )}
          
          {/* Font Grid */}
          {fonts.length === 0 ? (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              border: `2px dashed ${theme.borderColor}`,
              borderRadius: '12px',
              backgroundColor: theme.background
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔤</div>
              <h4 style={{ color: theme.textPrimary, fontSize: '18px', marginBottom: '8px', fontWeight: 'bold' }}>
                No Fonts in Typography System
              </h4>
              <p style={{ color: theme.textSecondary, fontSize: '14px', margin: '0 0 20px 0' }}>
                Add your first font to establish your brand's typography hierarchy
              </p>
              <button 
                onClick={handleAddFont}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                ➕ Add Your First Font
              </button>
            </div>
          ) : (
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
                        <span><strong>Weight:</strong> {font.weight_range || font.weight}</span>
                      </div>
                      <p style={{ margin: '0', fontSize: '14px', color: theme.textSecondary, lineHeight: '1.5' }}>
                        {font.usage}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => {
                          const cssCode = `font-family: '${font.name}', sans-serif;\nfont-weight: ${(font.weight_range || font.weight || '400').split('-')[0]};\nfont-size: 16px;`;
                          if (typeof navigator !== 'undefined' && navigator.clipboard) {
                            navigator.clipboard.writeText(cssCode).then(() => {
                              showNotification(`${font.name} CSS copied to clipboard!`, 'success');
                            }).catch(() => {
                              showNotification('Failed to copy CSS', 'error');
                            });
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
                        onClick={() => handleEditFont(font)}
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
                  
                  {/* Font Preview */}
                  <div style={{
                    padding: '25px',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontFamily: `'${font.name}', sans-serif`
                  }}>
                    <div style={{ 
                      fontSize: '32px', 
                      marginBottom: '12px', 
                      fontWeight: 'bold', 
                      color: '#1f2937',
                      fontFamily: `'${font.name}', sans-serif`
                    }}>
                      The quick brown fox jumps
                    </div>
                    <div style={{ 
                      fontSize: '18px', 
                      marginBottom: '10px', 
                      color: '#374151',
                      fontFamily: `'${font.name}', sans-serif`
                    }}>
                      Regular weight sample text for {font.name}
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#6b7280', 
                      fontWeight: '500',
                      fontFamily: `'${font.name}', sans-serif`
                    }}>
                      ABCDEFGHIJKLMNOPQRSTUVWXYZ 1234567890
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* GUIDELINES SECTION */}
      {activeSection === 'guidelines' && (
        <div style={{ 
          padding: '30px', 
          backgroundColor: theme.cardBackground, 
          borderRadius: '0 0 12px 12px',
          border: `1px solid ${theme.borderColor}`,
          borderTop: 'none'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h3 style={{ color: theme.textPrimary, fontSize: '18px', fontWeight: 'bold', margin: '0' }}>
              📋 Brand Guidelines ({guidelines.length} guidelines)
            </h3>
            <button 
              onClick={handleAddGuideline}
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
              ➕ Add Guideline
            </button>
          </div>

          {/* Guidelines Form */}
          {showGuidelinesForm && (
            <div style={{
              padding: '30px',
              border: '2px solid #10b981',
              borderRadius: '12px',
              backgroundColor: theme.background,
              marginBottom: '30px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
            }}>
              <h4 style={{ color: theme.textPrimary, marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>
                📋 {editingGuideline ? `Edit Guideline: ${editingGuideline.title}` : 'Add New Brand Guideline'}
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: theme.textPrimary,
                    fontSize: '14px'
                  }}>
                    Section
                  </label>
                  <select
                    value={editGuidelineData.section}
                    onChange={(e) => setEditGuidelineData(prev => ({ ...prev, section: e.target.value }))}
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
                    <option value="logo">Logo Usage</option>
                    <option value="colors">Color Guidelines</option>
                    <option value="typography">Typography Guidelines</option>
                    <option value="voice">Voice & Tone</option>
                    <option value="imagery">Imagery Guidelines</option>
                    <option value="general">General Brand Guidelines</option>
                  </select>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: theme.textPrimary,
                    fontSize: '14px'
                  }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={editGuidelineData.title}
                    onChange={(e) => setEditGuidelineData(prev => ({ ...prev, title: e.target.value }))}
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
                    placeholder="e.g., Logo Usage Guidelines"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: theme.textPrimary,
                  fontSize: '14px'
                }}>
                  Content *
                </label>
                <textarea
                  value={editGuidelineData.content}
                  onChange={(e) => setEditGuidelineData(prev => ({ ...prev, content: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: theme.inputBackground,
                    color: theme.textPrimary,
                    minHeight: '150px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    outline: 'none'
                  }}
                  placeholder="Describe the brand guideline in detail..."
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleCancelGuideline}
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
                {editingGuideline && (
                  <button
                    onClick={() => handleDeleteGuideline(editingGuideline.id)}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    🗑️ Delete
                  </button>
                )}
                <button
                  onClick={handleSaveGuideline}
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
                  💾 Save Guideline
                </button>
              </div>
            </div>
          )}
          
          {guidelines.length === 0 ? (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              border: `2px dashed ${theme.borderColor}`,
              borderRadius: '12px',
              backgroundColor: theme.background
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <h4 style={{ color: theme.textPrimary, fontSize: '18px', marginBottom: '8px', fontWeight: 'bold' }}>
                No Brand Guidelines Yet
              </h4>
              <p style={{ color: theme.textSecondary, fontSize: '14px', margin: '0 0 20px 0' }}>
                Create comprehensive brand guidelines to maintain consistency across all touchpoints
              </p>
              <button 
                onClick={handleAddGuideline}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                ➕ Create Your First Guideline
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '30px' }}>
              {guidelines.map(guideline => (
                <div key={guideline.id} style={{
                  padding: '30px',
                  border: `2px solid ${theme.borderColor}`,
                  borderRadius: '12px',
                  backgroundColor: theme.background
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h4 style={{ color: theme.textPrimary, margin: '0', fontSize: '16px', fontWeight: 'bold' }}>
                      📋 {guideline.title}
                    </h4>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleEditGuideline(guideline)}
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
                        onClick={() => handleDeleteGuideline(guideline.id)}
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
                  
                  <div style={{ fontSize: '14px', color: theme.textSecondary, lineHeight: '1.8' }}>
                    {typeof guideline.content === 'string' ? guideline.content : JSON.stringify(guideline.content)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminComponents;
