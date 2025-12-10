import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// =============================================================================
// PROPER SUPABASE CLIENT SETUP - DOCUMENTATION COMPLIANT
// =============================================================================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize Supabase client - THE OFFICIAL WAY
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// =============================================================================
// DOCUMENTATION-COMPLIANT SUPABASE API METHODS
// =============================================================================

const supabaseAPI = {
  // Upload file to Supabase Storage bucket - SIMPLIFIED LIKE SETTINGS
  async uploadFileToBucket(file: File, fileName: string, bucketName = 'brand-assets') {
    console.log('Uploading file to bucket:', { fileName, bucketName, size: file.size });
    
    if (!supabase) {
      throw new Error('Supabase not configured. Please set up environment variables.');
    }
    
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);
      
      console.log('File uploaded successfully:', publicUrl);
      return {
        path: data.path,
        fullPath: data.fullPath,
        publicUrl: publicUrl
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  },

  // Fetch colors from Supabase - OFFICIAL METHOD
  async fetchColors() {
    console.log('Fetching colors from Supabase...');
    
    try {
      const { data, error } = await supabase
        .from('brand_colors')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      console.log('Colors fetched from Supabase:', data);
      return data || [];
    } catch (error) {
      console.error('Color fetch error:', error);
      return [];
    }
  },

  // Save color to Supabase - SIMPLE VERSION  
  async saveColor(colorData: any) {
    console.log('Saving color to Supabase:', colorData);
    
    try {
      const hex = colorData.hex.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const rgbValues = `rgb(${r}, ${g}, ${b})`;
      
      const { data, error } = await supabase
        .from('brand_colors')
        .insert({
          name: colorData.name,
          hex_code: colorData.hex,
          usage: colorData.usage,
          rgb_values: rgbValues
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      console.log('Color saved to Supabase:', data);
      return data?.[0];
    } catch (error) {
      console.error('Color save error:', error);
      throw error;
    }
  },

  // Update color - OFFICIAL METHOD
  async updateColor(colorId: number, colorData: any) {
    console.log('Updating color:', { colorId, colorData });
    
    try {
      const hex = colorData.hex.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const rgbValues = `rgb(${r}, ${g}, ${b})`;
      
      const { data, error } = await supabase
        .from('brand_colors')
        .update({
          name: colorData.name,
          hex_code: colorData.hex,
          usage: colorData.usage,
          rgb_values: rgbValues
        })
        .eq('id', colorId)
        .select();
      
      if (error) {
        throw error;
      }
      
      console.log('Color updated:', data);
      return data?.[0];
    } catch (error) {
      console.error('Color update error:', error);
      throw error;
    }
  },

  // Delete color - OFFICIAL METHOD
  async deleteColor(colorId: number) {
    console.log('Deleting color:', colorId);
    
    try {
      const { error } = await supabase
        .from('brand_colors')
        .delete()
        .eq('id', colorId);
      
      if (error) {
        throw error;
      }
      
      console.log('Color deleted');
      return true;
    } catch (error) {
      console.error('Color delete error:', error);
      throw error;
    }
  },

  // Fetch logos - OFFICIAL METHOD
  async fetchLogos() {
    console.log('Fetching logos from Supabase...');
    
    try {
      const { data, error } = await supabase
        .from('brand_logos')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      console.log('Logos fetched from Supabase:', data);
      return data || [];
    } catch (error) {
      console.error('Logo fetch error:', error);
      return [];
    }
  },

  // Save logo using brand-assets bucket - OFFICIAL SUPABASE METHOD
  async saveLogo(logoData: any, file: File | null = null) {
    console.log('Saving logo to Supabase:', logoData);
    
    try {
      let logoUrl = null;
      
      if (file) {
        // Correct file path within brand-assets bucket
        const fileName = `logos/${logoData.name.replace(/[^a-zA-Z0-9]/g, '_')}_logo_${Date.now()}.${file.name.split('.').pop()}`;
        const uploadResult = await this.uploadFileToBucket(file, fileName, 'brand-assets');
        logoUrl = uploadResult.publicUrl;
      }
      
      const { data, error } = await supabase
        .from('brand_logos')
        .insert({
          name: logoData.name,
          type: logoData.type || 'PNG',
          usage: logoData.usage,
          category: logoData.category || 'Primary Logo',
          logo_url: logoUrl,
          file_size: file ? Math.round(file.size / 1024) : null,
          mime_type: file ? file.type : null,
          is_active: true
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      console.log('Logo saved to Supabase:', data);
      return data?.[0];
    } catch (error) {
      console.error('Logo save error:', error);
      throw error;
    }
  },

  // Update logo - OFFICIAL METHOD
  async updateLogo(logoId: number, logoData: any, file: File | null = null) {
    console.log('Updating logo:', { logoId, logoData });
    
    try {
      let logoUrl = null;
      
      if (file) {
        const fileName = `logos/${logoData.name.replace(/[^a-zA-Z0-9]/g, '_')}_logo_${Date.now()}.${file.name.split('.').pop()}`;
        const uploadResult = await this.uploadFileToBucket(file, fileName, 'brand-assets');
        logoUrl = uploadResult.publicUrl;
      }
      
      const updateData: any = {
        name: logoData.name,
        type: logoData.type || 'PNG',
        usage: logoData.usage,
        category: logoData.category || 'Primary Logo'
      };
      
      if (logoUrl) {
        updateData.logo_url = logoUrl;
      }
      
      const { data, error } = await supabase
        .from('brand_logos')
        .update(updateData)
        .eq('id', logoId)
        .select();
      
      if (error) {
        throw error;
      }
      
      console.log('Logo updated:', data);
      return data?.[0];
    } catch (error) {
      console.error('Logo update error:', error);
      throw error;
    }
  },

  // Delete logo - OFFICIAL METHOD
  async deleteLogo(logoId: number) {
    console.log('Deleting logo:', logoId);
    
    try {
      const { error } = await supabase
        .from('brand_logos')
        .update({ is_active: false })
        .eq('id', logoId);
      
      if (error) {
        throw error;
      }
      
      console.log('Logo deleted');
      return true;
    } catch (error) {
      console.error('Logo delete error:', error);
      throw error;
    }
  },

  // Fetch fonts - OFFICIAL METHOD
  async fetchFonts() {
    console.log('Fetching fonts from Supabase...');
    
    try {
      const { data, error } = await supabase
        .from('brand_font')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      console.log('Fonts fetched from Supabase:', data);
      return data || [];
    } catch (error) {
      console.error('Font fetch error:', error);
      return [];
    }
  },

  // Save font - OFFICIAL METHOD
  async saveFont(fontData: any) {
    console.log('Saving font to Supabase:', fontData);
    
    if (!fontData || !fontData.name) {
      throw new Error('Font data with name is required');
    }
    
    try {
      const googleFontsUrl = fontData.name.trim().replace(/\s+/g, '+');
      const fontUrl = `https://fonts.googleapis.com/css2?family=${googleFontsUrl}:wght@300;400;500;600;700&display=swap`;
      
      const { data, error } = await supabase
        .from('brand_font')
        .insert({
          name: fontData.name,
          type: fontData.category || 'Google Font',
          file_path: fontUrl,
          created_by: null,
          is_active: true
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      console.log('Font saved to Supabase:', data);
      
      // Load the Google Font for preview
      if (typeof document !== 'undefined') {
        const existingLink = document.querySelector(`link[href="${fontUrl}"]`);
        if (!existingLink) {
          const link = document.createElement('link');
          link.href = fontUrl;
          link.rel = 'stylesheet';
          link.type = 'text/css';
          link.onload = () => console.log(`Google Font loaded: ${fontData.name}`);
          document.head.appendChild(link);
        }
      }
      
      return data?.[0];
    } catch (error) {
      console.error('Font save error:', error);
      throw error;
    }
  },

  // Update font - OFFICIAL METHOD
  async updateFont(fontId: number, fontData: any) {
    console.log('Updating font:', { fontId, fontData });
    
    try {
      const googleFontsUrl = fontData.name.trim().replace(/\s+/g, '+');
      const fontUrl = `https://fonts.googleapis.com/css2?family=${googleFontsUrl}:wght@300;400;500;600;700&display=swap`;
      
      const { data, error } = await supabase
        .from('brand_font')
        .update({
          name: fontData.name,
          type: fontData.category || 'Google Font',
          file_path: fontUrl,
          is_active: true
        })
        .eq('id', fontId)
        .select();
      
      if (error) {
        throw error;
      }
      
      console.log('Font updated:', data);
      return data?.[0];
    } catch (error) {
      console.error('Font update error:', error);
      throw error;
    }
  },

  // Delete font - OFFICIAL METHOD
  async deleteFont(fontId: number) {
    console.log('Deleting font:', fontId);
    
    try {
      const { error } = await supabase
        .from('brand_font')
        .delete()
        .eq('id', fontId);
      
      if (error) {
        throw error;
      }
      
      console.log('Font deleted');
      return true;
    } catch (error) {
      console.error('Font delete error:', error);
      throw error;
    }
  },

  // Fetch guidelines - OFFICIAL METHOD
  async fetchGuidelines() {
    console.log('Fetching guidelines from Supabase...');
    
    try {
      const { data, error } = await supabase
        .from('brand_guidelines')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      console.log('Guidelines fetched from Supabase:', data);
      return data || [];
    } catch (error) {
      console.error('Guidelines fetch error:', error);
      return [];
    }
  },

  // Save guidelines - OFFICIAL METHOD
  async saveGuidelines(section: string, content: any) {
    console.log('Saving guidelines to Supabase:', { section, content });
    
    try {
      const { data, error } = await supabase
        .from('brand_guidelines')
        .insert({
          section: section,
          title: `${section.charAt(0).toUpperCase() + section.slice(1)} Guidelines`,
          content: typeof content === 'string' ? content : JSON.stringify(content),
          type: `${section.charAt(0).toUpperCase() + section.slice(1)} Usage`,
          status: 'Active',
          version_number: 1
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      console.log('Guidelines saved to Supabase:', data);
      return data?.[0];
    } catch (error) {
      console.error('Guidelines save error:', error);
      throw error;
    }
  },

  // Update guidelines - OFFICIAL METHOD
  async updateGuidelines(guidelineId: number, guidelineData: any) {
    console.log('Updating guidelines:', { guidelineId, guidelineData });
    
    try {
      const { data, error } = await supabase
        .from('brand_guidelines')
        .update(guidelineData)
        .eq('id', guidelineId)
        .select();
      
      if (error) {
        throw error;
      }
      
      console.log('Guidelines updated:', data);
      return data?.[0];
    } catch (error) {
      console.error('Guidelines update error:', error);
      throw error;
    }
  },

  // Delete guidelines - OFFICIAL METHOD
  async deleteGuidelines(guidelineId: number) {
    console.log('Deleting guidelines:', guidelineId);
    
    try {
      const { error } = await supabase
        .from('brand_guidelines')
        .delete()
        .eq('id', guidelineId);
      
      if (error) {
        throw error;
      }
      
      console.log('Guidelines deleted');
      return true;
    } catch (error) {
      console.error('Guidelines delete error:', error);
      throw error;
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
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setActiveTab('templates')}
            style={{
              flex: 1,
              padding: '12px 24px',
              backgroundColor: activeTab === 'templates' ? '#3b82f6' : theme.buttonSecondary,
              color: activeTab === 'templates' ? 'white' : theme.textSecondary,
              border: 'none',
              borderRadius: '8px',
              fontWeight: activeTab === 'templates' ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
          >
            Manage Templates
          </button>
          <button
            onClick={() => setActiveTab('libraries')}
            style={{
              flex: 1,
              padding: '12px 24px',
              backgroundColor: activeTab === 'libraries' ? '#3b82f6' : theme.buttonSecondary,
              color: activeTab === 'libraries' ? 'white' : theme.textSecondary,
              border: 'none',
              borderRadius: '8px',
              fontWeight: activeTab === 'libraries' ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
          >
            Libraries
          </button>
          <button
            onClick={() => setActiveTab('brand')}
            style={{
              flex: 1,
              padding: '12px 24px',
              backgroundColor: activeTab === 'brand' ? '#3b82f6' : theme.buttonSecondary,
              color: activeTab === 'brand' ? 'white' : theme.textSecondary,
              border: 'none',
              borderRadius: '8px',
              fontWeight: activeTab === 'brand' ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
          >
            Brand Kit
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ backgroundColor: theme.background }}>
        {activeTab === 'templates' && <AdminTemplatesTab theme={theme} />}
        {activeTab === 'libraries' && <AdminLibrariesTab theme={theme} />}
        {activeTab === 'brand' && <AdminBrandTab theme={theme} isDarkMode={isDarkMode} supabaseAPI={supabaseAPI} />}
      </div>
    </div>
  );
}

// =============================================================================
// TEMPLATES TAB
// =============================================================================

function AdminTemplatesTab({ theme }: { theme: any }) {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [templates, setTemplates] = useState([]);

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
        Manage Templates
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
          {showBuilder ? 'View Templates' : 'Create New Template'}
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
            Template Builder
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
                      Remove
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
                Add Field
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
                Save Template
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
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
                External Builder Tools
              </h3>
              <p style={{ color: theme.textSecondary, fontSize: '14px', marginBottom: '20px' }}>
                External integration for automated generation
              </p>
              
              <div style={{ display: 'grid', gap: '12px' }}>
                {[
                  {
                    name: 'Content Template Engine',
                    desc: 'Comprehensive template creation and management',
                    url: 'https://3c-content-template-engine.vercel.app/'
                  },
                  {
                    name: 'Content Library',
                    desc: 'Access and manage your content library',
                    url: 'https://3c-public-library.org'
                  },
                  {
                    name: 'Interactive Pdf',
                    desc: 'Build and manage interactive PDF documents',
                    url: 'https://builder.3c-public-library.org'
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
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Open</span>
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
                3C Brand Products
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
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Open</span>
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
            {connected ? 'Connected' : 'Ready to Connect'}
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
            {connected ? 'Disconnect' : 'Connect'}
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
        Libraries
      </h2>
      <p style={{ color: theme.textSecondary, fontSize: '14px', margin: '0 0 30px 0' }}>
        External service integrations and storage management
      </p>
      
      <div style={{ display: 'grid', gap: '0' }}>
        
        {/* NOTION INTEGRATION */}
        <IntegrationCard
          title="Notion Integration"
          subtitle="Content management and documentation"
          emoji=""
          connected={notionConnected}
          onToggle={handleNotionToggle}
          gradientColor={theme.gradientBlue}
        >
          {notionConnected ? (
            <div>
              <h4 style={{ color: theme.textPrimary, marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>
                Connected to Internal Hub
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
                  Main Hub Link:
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

        {/* CLOUDFLARE R2 BUCKET */}
        <IntegrationCard
          title="Cloudflare R2 Bucket"
          subtitle="Object storage for 3C library files"
          emoji="☁️"
          connected={true}
          onToggle={() => showNotification('Cloudflare R2 is always connected', 'info')}
          gradientColor={theme.gradientRed}
        >
          <div>
            <h4 style={{ color: theme.textPrimary, marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>
              Storage Connected
            </h4>
            <div style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '20px' }}>
              3C Library Files • Media Assets • Document Storage
            </div>
            <div style={{
              padding: '20px', 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              borderRadius: '8px',
              border: `1px solid ${theme.borderColor}`
            }}>
              <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold', color: theme.textPrimary }}>
                Dashboard Link:
              </p>
              <a
                href="https://dash.cloudflare.com/5c482ede9d3c6e016b77a9cb86ed3a29/r2/default/buckets/3c-library-files"
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  fontSize: '12px', 
                  color: '#3b82f6', 
                  textDecoration: 'underline',
                  fontWeight: 'bold',
                  wordBreak: 'break-all'
                }}
              >
                Cloudflare R2 Dashboard - 3c-library-files
              </a>
            </div>
          </div>
        </IntegrationCard>

        {/* SUPABASE LIBRARY */}
        <IntegrationCard
          title="Supabase Library"
          subtitle="Database and backend services"
          emoji="🗄️"
          connected={true}
          onToggle={() => showNotification('Supabase is always connected', 'info')}
          gradientColor={theme.gradientGreen}
        >
          <div>
            <h4 style={{ color: theme.textPrimary, marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>
              Database Connected
            </h4>
            <div style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '20px' }}>
              Content Database • User Management • API Services
            </div>
            <div style={{
              padding: '20px', 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              borderRadius: '8px',
              border: `1px solid ${theme.borderColor}`
            }}>
              <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold', color: theme.textPrimary }}>
                Project Dashboard:
              </p>
              <a
                href="https://supabase.com/dashboard/project/cgxjqsbrditbteqhdyus/editor/189435"
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  fontSize: '12px', 
                  color: '#3b82f6', 
                  textDecoration: 'underline',
                  fontWeight: 'bold',
                  wordBreak: 'break-all'
                }}
              >
                Supabase Dashboard - cgxjqsbrditbteqhdyus
              </a>
            </div>
          </div>
        </IntegrationCard>

        {/* CANVA INTEGRATION */}
        <IntegrationCard
          title="Canva Integration"
          subtitle="Design templates and brand assets"
          emoji=""
          connected={canvaConnected}
          onToggle={handleCanvaToggle}
          gradientColor={theme.gradientPurple}
        >
          {canvaConnected ? (
            <div>
              <h4 style={{ color: theme.textPrimary, marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>
                Design Library Connected
              </h4>
              <div style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '20px' }}>
                Brand Templates • Design Assets • Collaborative Workspace
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                {[
                  { emoji: '📄', title: 'Templates', value: '47 designs' },
                  { emoji: '🎢', title: 'Brand Kit', value: 'Active' },
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
// BRAND TAB - COMPLETE WITH ALL OFFICIAL SUPABASE METHODS
// =============================================================================

function AdminBrandTab({ theme, isDarkMode, supabaseAPI }: { theme: any; isDarkMode: boolean; supabaseAPI: any }) {
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

  // Notification system - PERSISTENT until manually dismissed
  const showNotification = (message: string, type = 'info') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    
    // No auto-dismiss - notifications stay until manually closed with X button
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
    showNotification('Saving colour to Supabase...', 'info');

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
      showNotification(`Failed to save colour: ${error.message}`, 'error');
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
    showNotification('Deleting colour from Supabase...', 'info');

    try {
      await supabaseAPI.deleteColor(colorId);
      showNotification('Colour deleted successfully', 'success');
      
      const updatedColors = await supabaseAPI.fetchColors();
      setBrandColors(updatedColors);
      
    } catch (error: any) {
      showNotification(`Failed to delete colour: ${error.message}`, 'error');
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
        showNotification('Failed to copy colour code', 'error');
      });
    } else {
      showNotification('Clipboard not available', 'error');
    }
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
          Processing...
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
          Brand Kit
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
          Refresh from Supabase
        </button>
      </div>
      <p style={{ color: theme.textSecondary, fontSize: '14px', margin: '0 0 30px 0' }}>
        Brand guidelines, assets, and style management (Connected to Supabase Official Methods)
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
          { id: 'colors', label: 'Colours' },
          { id: 'logos', label: 'Logos' },
          { id: 'fonts', label: 'Typography' },
          { id: 'guidelines', label: 'Guidelines' }
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

      {/* COLOURS SECTION */}
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
              Brand Colours ({brandColors.length} colours)
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
              Add Colour
            </button>
          </div>

          {/* Add/Edit Colour Form */}
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
                {editingColor ? 'Edit Brand Colour' : 'Add New Brand Colour'}
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
                    Colour Name *
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
                  placeholder="Describe where and how this colour should be used..."
                />
              </div>

              {/* Colour preview with transparent background for dark mode compatibility */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                marginBottom: '25px',
                padding: '20px',
                backgroundColor: 'transparent',
                borderRadius: '8px',
                border: `2px solid ${theme.borderColor}`
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: newColor.hex,
                  borderRadius: '8px',
                  border: `2px solid ${theme.borderColor}`
                }}></div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: theme.textPrimary, marginBottom: '4px' }}>
                    {newColor.name || 'New Colour'}
                  </div>
                  <div style={{ fontSize: '14px', color: theme.textSecondary, fontFamily: 'monospace' }}>
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
                    Delete
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
                  Save Colour
                </button>
              </div>
            </div>
          )}
          
          {/* Colour Grid */}
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
                No Brand Colours Yet
              </h4>
              <p style={{ color: theme.textSecondary, fontSize: '14px', margin: '0 0 20px 0' }}>
                Add your first brand colour to get started with your brand kit
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
                Add Your First Colour
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
                      Copy
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
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LOGOS SECTION - COMPLETE IMPLEMENTATION */}
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
              Brand Logos ({logos.length} logos)
            </h3>
            <button 
              onClick={() => setShowLogoForm(true)}
              style={{
                padding: '12px 20px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Add Logo
            </button>
          </div>

          {/* Add/Edit Logo Form */}
          {showLogoForm && (
            <div style={{
              padding: '30px',
              border: '2px solid #f59e0b',
              borderRadius: '12px',
              backgroundColor: theme.background,
              marginBottom: '30px',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)'
            }}>
              <h4 style={{ color: theme.textPrimary, marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>
                {editingLogo ? 'Edit Brand Logo' : 'Add New Brand Logo'}
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
                    Logo Type
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
                    <option value="PNG">PNG</option>
                    <option value="SVG">SVG</option>
                    <option value="JPG">JPG</option>
                    <option value="PDF">PDF</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
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

              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: theme.textPrimary,
                  fontSize: '14px'
                }}>
                  Logo File
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
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
                />
                {logoFile && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: theme.textSecondary }}>
                    Selected: {logoFile.name} ({Math.round(logoFile.size / 1024)}KB)
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowLogoForm(false);
                    setEditingLogo(null);
                    setEditLogoData({ name: '', type: 'PNG', usage: '' });
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
                  onClick={async () => {
                    if (!editLogoData.name.trim() || !editLogoData.usage.trim()) {
                      showNotification('Please fill in all required fields', 'error');
                      return;
                    }

                    setLoading(true);
                    try {
                      if (editingLogo) {
                        await supabaseAPI.updateLogo(editingLogo.id, editLogoData, logoFile);
                        showNotification(`Logo ${editLogoData.name} updated successfully`, 'success');
                      } else {
                        if (!logoFile) {
                          showNotification('Please select a logo file', 'error');
                          return;
                        }
                        await supabaseAPI.saveLogo(editLogoData, logoFile);
                        showNotification(`Logo ${editLogoData.name} saved successfully`, 'success');
                      }
                      
                      const updatedLogos = await supabaseAPI.fetchLogos();
                      setLogos(updatedLogos);
                      setShowLogoForm(false);
                      setEditingLogo(null);
                      setEditLogoData({ name: '', type: 'PNG', usage: '' });
                      setLogoFile(null);
                    } catch (error: any) {
                      showNotification(`Failed to save logo: ${error.message}`, 'error');
                    } finally {
                      setLoading(false);
                    }
                  }}
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
                  Save Logo
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
                No Brand Logos Yet
              </h4>
              <p style={{ color: theme.textSecondary, fontSize: '14px', margin: '0 0 20px 0' }}>
                Add your first brand logo to get started with your logo library
              </p>
              <button 
                onClick={() => setShowLogoForm(true)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Add Your First Logo
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {logos.map(logo => (
                <div key={logo.id} style={{
                  padding: '25px',
                  border: `1px solid ${theme.borderColor}`,
                  borderRadius: '12px',
                  backgroundColor: theme.background,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                    {logo.logo_url ? (
                      <img 
                        src={logo.logo_url} 
                        alt={logo.name}
                        style={{
                          width: '64px',
                          height: '64px',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          border: `2px solid ${theme.borderColor}`,
                          backgroundColor: '#ffffff'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '64px',
                        height: '64px',
                        backgroundColor: theme.buttonSecondary,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                      }}>
                        🏷️
                      </div>
                    )}
                    <div>
                      <h4 style={{ margin: '0 0 6px 0', color: theme.textPrimary, fontSize: '16px', fontWeight: 'bold' }}>
                        {logo.name}
                      </h4>
                      <div style={{ 
                        fontSize: '12px', 
                        color: theme.textSecondary,
                        marginBottom: '4px'
                      }}>
                        {logo.type} • {logo.file_size ? `${logo.file_size}KB` : 'No file'}
                      </div>
                    </div>
                  </div>
                  <p style={{ 
                    margin: '0 0 20px 0', 
                    fontSize: '14px', 
                    color: theme.textSecondary,
                    lineHeight: '1.5'
                  }}>
                    {logo.usage}
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => {
                        setEditingLogo(logo);
                        setEditLogoData({
                          name: logo.name,
                          type: logo.type || 'PNG',
                          usage: logo.usage
                        });
                        setShowLogoForm(true);
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
                      Edit
                    </button>
                    <button 
                      onClick={async () => {
                        if (confirm(`Delete logo "${logo.name}"?`)) {
                          setLoading(true);
                          try {
                            await supabaseAPI.deleteLogo(logo.id);
                            showNotification(`Logo ${logo.name} deleted`, 'success');
                            const updatedLogos = await supabaseAPI.fetchLogos();
                            setLogos(updatedLogos);
                          } catch (error: any) {
                            showNotification(`Failed to delete logo: ${error.message}`, 'error');
                          } finally {
                            setLoading(false);
                          }
                        }
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
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TYPOGRAPHY SECTION - COMPLETE IMPLEMENTATION */}
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
              Typography ({fonts.length} fonts)
            </h3>
            <button 
              onClick={() => setShowFontForm(true)}
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
              Add Font
            </button>
          </div>

          {/* Add/Edit Font Form */}
          {showFontForm && (
            <div style={{
              padding: '30px',
              border: '2px solid #10b981',
              borderRadius: '12px',
              backgroundColor: theme.background,
              marginBottom: '30px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
            }}>
              <h4 style={{ color: theme.textPrimary, marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>
                {editingFont ? 'Edit Typography' : 'Add New Typography'}
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
                    placeholder="e.g., Inter, Roboto, Open Sans"
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
                    <option value="Heading">Heading</option>
                    <option value="Body">Body Text</option>
                    <option value="Accent">Accent</option>
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
                    minHeight: '80px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    outline: 'none'
                  }}
                  placeholder="Describe where and how this font should be used..."
                />
              </div>

              {/* Font Preview */}
              {editFontData.name && (
                <div style={{ 
                  padding: '20px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  marginBottom: '25px'
                }}>
                  <div style={{ 
                    fontFamily: editFontData.name + ', sans-serif',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '8px'
                  }}>
                    {editFontData.name}
                  </div>
                  <div style={{ 
                    fontFamily: editFontData.name + ', sans-serif',
                    fontSize: '16px',
                    color: '#6b7280'
                  }}>
                    The quick brown fox jumps over the lazy dog
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowFontForm(false);
                    setEditingFont(null);
                    setEditFontData({ name: '', category: 'Primary', usage: '', weight: '400-600' });
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
                  onClick={async () => {
                    if (!editFontData.name.trim() || !editFontData.usage.trim()) {
                      showNotification('Please fill in all required fields', 'error');
                      return;
                    }

                    setLoading(true);
                    try {
                      if (editingFont) {
                        await supabaseAPI.updateFont(editingFont.id, editFontData);
                        showNotification(`Font ${editFontData.name} updated successfully`, 'success');
                      } else {
                        await supabaseAPI.saveFont(editFontData);
                        showNotification(`Font ${editFontData.name} saved successfully`, 'success');
                      }
                      
                      const updatedFonts = await supabaseAPI.fetchFonts();
                      setFonts(updatedFonts);
                      setShowFontForm(false);
                      setEditingFont(null);
                      setEditFontData({ name: '', category: 'Primary', usage: '', weight: '400-600' });
                    } catch (error: any) {
                      showNotification(`Failed to save font: ${error.message}`, 'error');
                    } finally {
                      setLoading(false);
                    }
                  }}
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
                  Save Font
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
                No Typography Yet
              </h4>
              <p style={{ color: theme.textSecondary, fontSize: '14px', margin: '0 0 20px 0' }}>
                Add your first brand font to get started with your typography system
              </p>
              <button 
                onClick={() => setShowFontForm(true)}
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
                Add Your First Font
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {fonts.map(font => (
                <div key={font.id} style={{
                  padding: '25px',
                  border: `1px solid ${theme.borderColor}`,
                  borderRadius: '12px',
                  backgroundColor: theme.background,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ 
                      margin: '0 0 12px 0', 
                      color: theme.textPrimary, 
                      fontSize: '18px', 
                      fontWeight: 'bold',
                      fontFamily: font.name + ', sans-serif'
                    }}>
                      {font.name}
                    </h4>
                    <div style={{ 
                      fontSize: '14px', 
                      color: theme.textSecondary,
                      marginBottom: '12px',
                      fontFamily: font.name + ', sans-serif'
                    }}>
                      The quick brown fox jumps over the lazy dog
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: theme.textSecondary,
                      marginBottom: '8px' 
                    }}>
                      Category: {font.type}
                    </div>
                  </div>
                  <p style={{ 
                    margin: '0 0 20px 0', 
                    fontSize: '14px', 
                    color: theme.textSecondary,
                    lineHeight: '1.5'
                  }}>
                    {font.file_path ? 'Google Fonts integrated' : 'Custom font'}
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => {
                        setEditingFont(font);
                        setEditFontData({
                          name: font.name,
                          category: font.type || 'Primary',
                          usage: font.file_path || '',
                          weight: '400-600'
                        });
                        setShowFontForm(true);
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
                      Edit
                    </button>
                    <button 
                      onClick={async () => {
                        if (confirm(`Delete font "${font.name}"?`)) {
                          setLoading(true);
                          try {
                            await supabaseAPI.deleteFont(font.id);
                            showNotification(`Font ${font.name} deleted`, 'success');
                            const updatedFonts = await supabaseAPI.fetchFonts();
                            setFonts(updatedFonts);
                          } catch (error: any) {
                            showNotification(`Failed to delete font: ${error.message}`, 'error');
                          } finally {
                            setLoading(false);
                          }
                        }
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
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* GUIDELINES SECTION - COMPLETE IMPLEMENTATION */}
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
              Brand Guidelines ({guidelines.length} sections)
            </h3>
            <button 
              onClick={() => setShowGuidelinesForm(true)}
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
              Add Guideline
            </button>
          </div>

          {/* Add/Edit Guidelines Form */}
          {showGuidelinesForm && (
            <div style={{
              padding: '30px',
              border: '2px solid #8b5cf6',
              borderRadius: '12px',
              backgroundColor: theme.background,
              marginBottom: '30px',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)'
            }}>
              <h4 style={{ color: theme.textPrimary, marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>
                {editingGuideline ? 'Edit Guideline' : 'Add New Guideline'}
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
                    Section *
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
                    <option value="color">Colour Usage</option>
                    <option value="typography">Typography Rules</option>
                    <option value="voice">Voice & Tone</option>
                    <option value="imagery">Imagery Guidelines</option>
                    <option value="general">General Guidelines</option>
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
                    placeholder="e.g., Logo Clear Space Requirements"
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
                  placeholder="Enter detailed guidelines and rules for this section..."
                />
              </div>

              {/* Form Actions */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowGuidelinesForm(false);
                    setEditingGuideline(null);
                    setEditGuidelineData({ section: 'logo', title: '', content: '', type: 'Logo Usage' });
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
                  onClick={async () => {
                    if (!editGuidelineData.title.trim() || !editGuidelineData.content.trim()) {
                      showNotification('Please fill in all required fields', 'error');
                      return;
                    }

                    setLoading(true);
                    try {
                      if (editingGuideline) {
                        await supabaseAPI.updateGuidelines(editingGuideline.id, editGuidelineData);
                        showNotification(`Guideline "${editGuidelineData.title}" updated successfully`, 'success');
                      } else {
                        await supabaseAPI.saveGuidelines(editGuidelineData.section, editGuidelineData.content);
                        showNotification(`Guideline "${editGuidelineData.title}" saved successfully`, 'success');
                      }
                      
                      const updatedGuidelines = await supabaseAPI.fetchGuidelines();
                      setGuidelines(updatedGuidelines);
                      setShowGuidelinesForm(false);
                      setEditingGuideline(null);
                      setEditGuidelineData({ section: 'logo', title: '', content: '', type: 'Logo Usage' });
                    } catch (error: any) {
                      showNotification(`Failed to save guideline: ${error.message}`, 'error');
                    } finally {
                      setLoading(false);
                    }
                  }}
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
                  Save Guideline
                </button>
              </div>
            </div>
          )}
          
          {/* Guidelines Grid */}
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
                Add your first brand guideline to establish your brand standards
              </p>
              <button 
                onClick={() => setShowGuidelinesForm(true)}
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
                Add Your First Guideline
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {guidelines.map(guideline => (
                <div key={guideline.id} style={{
                  padding: '25px',
                  border: `1px solid ${theme.borderColor}`,
                  borderRadius: '12px',
                  backgroundColor: theme.background,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ 
                        margin: '0 0 8px 0', 
                        color: theme.textPrimary, 
                        fontSize: '18px', 
                        fontWeight: 'bold'
                      }}>
                        {guideline.title}
                      </h4>
                      <span style={{ 
                        padding: '4px 12px', 
                        backgroundColor: '#8b5cf6', 
                        color: 'white', 
                        borderRadius: '16px', 
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textTransform: 'capitalize'
                      }}>
                        {guideline.section}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => {
                          setEditingGuideline(guideline);
                          setEditGuidelineData({
                            section: guideline.section,
                            title: guideline.title,
                            content: guideline.content,
                            type: guideline.type || 'General'
                          });
                          setShowGuidelinesForm(true);
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
                        Edit
                      </button>
                      <button 
                        onClick={async () => {
                          if (confirm(`Delete guideline "${guideline.title}"?`)) {
                            setLoading(true);
                            try {
                              await supabaseAPI.deleteGuidelines(guideline.id);
                              showNotification(`Guideline "${guideline.title}" deleted`, 'success');
                              const updatedGuidelines = await supabaseAPI.fetchGuidelines();
                              setGuidelines(updatedGuidelines);
                            } catch (error: any) {
                              showNotification(`Failed to delete guideline: ${error.message}`, 'error');
                            } finally {
                              setLoading(false);
                            }
                          }
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
                        Delete
                      </button>
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    color: theme.textSecondary,
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {guideline.content}
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

// Export only AdminComponents as default
export default AdminComponents;
