// =============================================================================
// NOTION API INTEGRATION - FIXES FOR BRAND KIT
// =============================================================================

// Add missing saveFont function to notionAPI
const notionAPI = {
  // ... existing functions ...

  async saveFont(fontData) {
    try {
      const databaseId = await this.findDatabase('Typography System');
      
      const response = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_CONFIG.token}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          parent: { database_id: databaseId },
          properties: {
            'Name': { title: [{ text: { content: fontData.name } }] },
            'Category': { select: { name: fontData.category } },
            'Usage': { rich_text: [{ text: { content: fontData.usage } }] },
            'Weight Range': { rich_text: [{ text: { content: fontData.weight } }] },
            'Status': { select: { name: 'Active' } }
          }
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Notion API error (${response.status}): ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving font to Notion:', error);
      throw error;
    }
  }
};

// =============================================================================
// FIXED BRAND TAB COMPONENT
// =============================================================================

function AdminBrandTab({ theme, isDarkMode }) {
  // ... existing state and functions ...

  // FIXED: Enhanced color display for dark mode
  const ColorPreview = ({ color, size = '64px' }) => (
    <div style={{
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: '12px',
      border: isDarkMode 
        ? `3px solid #ffffff` 
        : `2px solid ${theme.borderColor}`,
      boxShadow: isDarkMode 
        ? '0 0 0 1px rgba(0,0,0,0.8), 0 4px 20px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.3)' 
        : '0 4px 12px rgba(0, 0, 0, 0.15)',
      position: 'relative',
      // Add white backing for better visibility in dark mode
      background: isDarkMode 
        ? `linear-gradient(45deg, #ffffff 25%, transparent 25%, transparent 75%, #ffffff 75%), linear-gradient(45deg, #ffffff 25%, ${color} 25%, ${color} 75%, #ffffff 75%)` 
        : color,
      backgroundSize: isDarkMode ? '8px 8px' : 'auto',
      backgroundPosition: isDarkMode ? '0 0, 4px 4px' : 'auto'
    }}>
      {/* Color overlay for dark mode */}
      {isDarkMode && (
        <div style={{
          position: 'absolute',
          top: '3px',
          left: '3px',
          right: '3px',
          bottom: '3px',
          backgroundColor: color,
          borderRadius: '8px',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)'
        }}></div>
      )}
    </div>
  );

  // FIXED: Enhanced logo upload with proper error handling and Notion saving
  const handleLogoUpload = async (logoId) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.svg';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showNotification('File size must be less than 10MB', 'error');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showNotification('Please upload PNG, JPG, SVG, or WebP files only', 'error');
        return;
      }

      showNotification(`Uploading ${file.name}...`, 'info');
      
      try {
        // Create a data URL for the file
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const logoData = {
              name: file.name.split('.')[0] || 'Uploaded Logo',
              type: file.type.includes('svg') ? 'SVG' : file.type.includes('png') ? 'PNG' : 'JPG',
              size: `${(file.size / 1024).toFixed(1)} KB`,
              usage: 'Uploaded asset',
              fileUrl: event.target.result, // This would be replaced with actual cloud storage URL in production
              category: 'Upload',
              originalName: file.name
            };
            
            // Save to Notion
            await notionAPI.saveLogo(logoData);
            
            // Update local state
            const updatedLogos = logos.map(l => 
              l.id === logoId ? { 
                ...l, 
                name: logoData.name, 
                size: logoData.size,
                type: logoData.type,
                uploadedFile: event.target.result
              } : l
            );
            setLogos(updatedLogos);
            localStorage.setItem('brandLogos', JSON.stringify(updatedLogos));
            
            showNotification(`${file.name} uploaded and saved to Notion successfully!`, 'success');
          } catch (notionError) {
            console.error('Notion save error:', notionError);
            showNotification(`Upload completed but Notion save failed: ${notionError.message}`, 'error');
          }
        };
        
        reader.onerror = () => {
          showNotification('Failed to read file. Please try again.', 'error');
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Upload error:', error);
        showNotification(`Upload failed: ${error.message}`, 'error');
      }
    };
    input.click();
  };

  return (
    <div style={{ padding: '20px', backgroundColor: theme.background }}>
      {/* Notification System - Keep existing */}
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
              maxWidth: '400px',
              wordWrap: 'break-word'
            }}>
              {notification.message}
              <button
                onClick={() => dismissNotification(notification.id)}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '8px',
                  background: 'rgba(255,255,255,0.3)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Header and Navigation - Keep existing */}
      <h2 style={{ color: theme.textPrimary, fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
        🏢 Brand Kit
      </h2>
      <p style={{ color: theme.textSecondary, fontSize: '14px', margin: '0 0 30px 0' }}>
        Brand guidelines, assets, and style management
      </p>
      
      {/* Navigation tabs - Keep existing structure */}
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

      {/* FIXED COLORS SECTION */}
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
              🎨 Brand Colors
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

          {/* Add/Edit Color Form - Keep existing form structure but fix preview */}
          {showColorForm && (
            <div style={{
              padding: '30px',
              border: '2px solid #8b5cf6',
              borderRadius: '12px',
              backgroundColor: theme.background,
              marginBottom: '30px',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)'
            }}>
              {/* Form content - keep existing but fix preview */}
              <h4 style={{ color: theme.textPrimary, marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>
                🎨 {editingColor ? 'Edit Brand Color' : 'Add New Brand Color'}
              </h4>
              
              {/* Form fields - keep existing */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: theme.textPrimary,
                    fontSize: '14px'
                  }}>
                    Color Name
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
                    placeholder="e.g., Deep Purple"
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
                    Hex Code
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
                      placeholder="#523474"
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
                  Usage Description
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

              {/* FIXED: Enhanced color preview for dark mode */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                marginBottom: '25px',
                padding: '20px',
                backgroundColor: theme.headerBackground,
                borderRadius: '8px',
                border: `1px solid ${theme.borderColor}`
              }}>
                <ColorPreview color={newColor.hex} size="60px" />
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: theme.textPrimary, marginBottom: '4px' }}>
                    {newColor.name || 'New Color'}
                  </div>
                  <div style={{ fontSize: '14px', color: theme.textSecondary, fontFamily: 'monospace' }}>
                    {newColor.hex}
                  </div>
                </div>
              </div>

              {/* Form actions - keep existing */}
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
                  💾 Save Color
                </button>
              </div>
            </div>
          )}
          
          {/* FIXED: Color Grid with enhanced dark mode visibility */}
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
                  <ColorPreview color={color.hex} />
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
                      {color.hex}
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

      {/* FIXED LOGOS SECTION */}
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
              🏷️ Logo Assets
            </h3>
            <button 
              onClick={() => handleLogoUpload('new')}
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
              ⬆️ Upload Logo
            </button>
          </div>
          
          {/* FIXED: Logo grid with working upload */}
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
                    backgroundColor: theme.headerBackground,
                    border: `2px dashed ${theme.borderColor}`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    backgroundImage: logo.uploadedFile ? `url(${logo.uploadedFile})` : 'none',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                  }}>
                    {!logo.uploadedFile && '🏷️'}
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
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{
                    padding: '10px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}>
                    ⬇️ Download
                  </button>
                  <button style={{
                    padding: '10px 16px',
                    backgroundColor: theme.buttonPrimary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}>
                    👁️ Preview
                  </button>
                  <button 
                    onClick={() => handleLogoUpload(logo.id)}
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
                    🔄 Upload
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FIXED TYPOGRAPHY SECTION */}
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
              🔤 Typography System
            </h3>
            <button 
              onClick={() => {
                const newFont = {
                  id: Math.max(...fonts.map(f => f.id)) + 1,
                  name: 'New Font',
                  category: 'Primary',
                  usage: 'New font usage',
                  weight: '400-600'
                };
                
                const updatedFonts = [...fonts, newFont];
                setFonts(updatedFonts);
                localStorage.setItem('brandFonts', JSON.stringify(updatedFonts));
                
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

          {/* FIXED: Font Editing Form */}
          {editingFont && (
            <div style={{
              padding: '30px',
              border: '2px solid #3b82f6',
              borderRadius: '12px',
              backgroundColor: theme.background,
              marginBottom: '30px',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
            }}>
              <h4 style={{ color: theme.textPrimary, marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>
                ✏️ Edit Font: {editingFont.name}
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
                    Usage Description
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

              {/* FIXED: Save function with proper Notion integration */}
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
                  onClick={async () => {
                    if (!editFontData.name.trim()) {
                      showNotification('Please enter a font name', 'error');
                      return;
                    }

                    try {
                      showNotification('Saving font to Notion...', 'info');
                      
                      // Save to Notion using corrected database name
                      await notionAPI.saveFont(editFontData);
                      
                      // Update local state
                      const updatedFonts = fonts.map(f => 
                        f.id === editingFont.id ? { ...f, ...editFontData } : f
                      );
                      setFonts(updatedFonts);
                      localStorage.setItem('brandFonts', JSON.stringify(updatedFonts));
                      
                      showNotification(`${editFontData.name} updated and saved to Notion!`, 'success');
                      setEditingFont(null);
                      setEditFontData({ name: '', category: '', usage: '', weight: '' });
                    } catch (error) {
                      console.error('Font save error:', error);
                      // Fallback to local save
                      const updatedFonts = fonts.map(f => 
                        f.id === editingFont.id ? { ...f, ...editFontData } : f
                      );
                      setFonts(updatedFonts);
                      localStorage.setItem('brandFonts', JSON.stringify(updatedFonts));
                      
                      showNotification(`Font saved locally - Notion sync failed: ${error.message}`, 'error');
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
                  💾 Save Changes
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
                        navigator.clipboard.writeText(cssCode).then(() => {
                          showNotification(`${font.name} CSS copied to clipboard!`, 'success');
                        }).catch(() => {
                          showNotification('Failed to copy CSS', 'error');
                        });
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
                  </div>
                </div>
                
                {/* Font Preview */}
                <div style={{
                  padding: '25px',
                  backgroundColor: theme.headerBackground,
                  borderRadius: '8px',
                  border: `1px solid ${theme.borderColor}`,
                  fontFamily: font.name.toLowerCase().includes('inter') ? 'ui-sans-serif, system-ui' : 
                             font.name.toLowerCase().includes('roboto') ? 'Roboto, sans-serif' : 
                             'ui-serif, Georgia'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px', fontWeight: 'bold', color: theme.textPrimary }}>
                    The quick brown fox jumps
                  </div>
                  <div style={{ fontSize: '18px', marginBottom: '10px', color: theme.textPrimary }}>
                    Regular weight sample text for {font.name}
                  </div>
                  <div style={{ fontSize: '14px', color: theme.textSecondary, fontWeight: '500' }}>
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ 1234567890
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GUIDELINES SECTION - Keep existing implementation */}
      {activeSection === 'guidelines' && (
        /* Keep existing guidelines implementation - it's working correctly */
        <div>Guidelines content...</div>
      )}
    </div>
  );
}
