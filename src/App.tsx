function AdminTemplates() {
  const [selectedTemplate, setSelectedTemplate] = React.useState(null);
  const [templates, setTemplates] = React.useState([
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

  const [showBuilder, setShowBuilder] = React.useState(false);
  const [newTemplate, setNewTemplate] = React.useState({
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

  return React.createElement('div', { style: { padding: '20px' } },
    React.createElement('h2', null, '🏗️ Manage Templates'),
    React.createElement('p', null, 'Create, edit, and manage your content templates'),
    
    React.createElement('div', { style: { marginBottom: '30px' } },
      React.createElement('button', {
        onClick: () => setShowBuilder(!showBuilder),
        style: {
          padding: '12px 24px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }
      }, showBuilder ? '📋 View Templates' : '➕ Create New Template')
    ),

    showBuilder ? 
      React.createElement('div', {
        style: { 
          padding: '30px', 
          border: '2px solid #3b82f6', 
          borderRadius: '8px', 
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' 
        }
      },
        React.createElement('h3', { style: { color: '#1e40af', marginBottom: '20px' } }, '🏗️ Template Builder'),
        React.createElement('div', { style: { display: 'grid', gap: '20px' } },
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' } },
            React.createElement('div', null,
              React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1e40af' } }, 'Template Name'),
              React.createElement('input', {
                type: 'text',
                value: newTemplate.name,
                onChange: (e) => setNewTemplate(prev => ({ ...prev, name: e.target.value })),
                style: {
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #93c5fd',
                  borderRadius: '6px',
                  fontSize: '14px'
                },
                placeholder: 'e.g., Instagram Story Template'
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1e40af' } }, 'Category'),
              React.createElement('select', {
                value: newTemplate.category,
                onChange: (e) => setNewTemplate(prev => ({ ...prev, category: e.target.value })),
                style: {
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #93c5fd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }
              },
                React.createElement('option', { value: 'Social' }, 'Social Media'),
                React.createElement('option', { value: 'Content' }, 'Blog Content'),
                React.createElement('option', { value: 'Email' }, 'Email Marketing'),
                React.createElement('option', { value: 'Video' }, 'Video Content'),
                React.createElement('option', { value: 'Other' }, 'Other')
              )
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1e40af' } }, 'Description'),
            React.createElement('textarea', {
              value: newTemplate.description,
              onChange: (e) => setNewTemplate(prev => ({ ...prev, description: e.target.value })),
              style: {
                width: '100%',
                padding: '12px',
                border: '1px solid #93c5fd',
                borderRadius: '6px',
                fontSize: '14px',
                minHeight: '80px',
                resize: 'vertical'
              },
              placeholder: 'Describe what this template is used for...'
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1e40af' } }, 'Template Fields'),
            ...newTemplate.fields.map((field, index) =>
              React.createElement('div', { key: index, style: { display: 'flex', gap: '10px', marginBottom: '10px' } },
                React.createElement('input', {
                  type: 'text',
                  value: field,
                  onChange: (e) => updateField(index, e.target.value),
                  style: {
                    flex: '1',
                    padding: '10px',
                    border: '1px solid #93c5fd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  },
                  placeholder: 'Field ' + (index + 1) + ' (e.g., headline, image, cta)'
                }),
                newTemplate.fields.length > 1 && React.createElement('button', {
                  onClick: () => removeField(index),
                  style: {
                    padding: '10px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }
                }, '❌')
              )
            ),
            React.createElement('button', {
              onClick: addField,
              style: {
                padding: '10px 20px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }
            }, '➕ Add Field')
          ),
          React.createElement('div', { style: { display: 'flex', gap: '10px', justifyContent: 'flex-end' } },
            React.createElement('button', {
              onClick: () => setShowBuilder(false),
              style: {
                padding: '12px 24px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }
            }, 'Cancel'),
            React.createElement('button', {
              onClick: saveTemplate,
              disabled: !newTemplate.name.trim(),
              style: {
                padding: '12px 24px',
                backgroundColor: newTemplate.name.trim() ? '#10b981' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: newTemplate.name.trim() ? 'pointer' : 'not-allowed'
              }
            }, '💾 Save Template')
          )
        )
      ) :
      React.createElement('div', null,
        React.createElement('div', {
          style: { 
            padding: '20px', 
            border: '1px solid #d1d5db', 
            borderRadius: '8px', 
            background: '#f9fafb',
            marginBottom: '30px'
          }
        },
          React.createElement('h3', { style: { marginBottom: '20px' } }, '📚 Template Library'),
          React.createElement('div', { style: { display: 'grid', gap: '15px' } },
            ...templates.map(template =>
              React.createElement('div', {
                key: template.id,
                style: { 
                  padding: '20px', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '6px', 
                  background: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                },
                onClick: () => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)
              },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } },
                  React.createElement('div', { style: { flex: '1' } },
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' } },
                      React.createElement('h4', { style: { margin: '0', color: '#1f2937' } }, template.name),
                      React.createElement('span', {
                        style: { 
                          padding: '4px 8px', 
                          backgroundColor: '#dbeafe', 
                          color: '#1e40af', 
                          borderRadius: '12px', 
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }
                      }, template.category)
                    ),
                    React.createElement('p', { style: { margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px' } }, template.description),
                    React.createElement('div', { style: { fontSize: '12px', color: '#9ca3af' } }, 
                      'Last modified: ' + template.lastModified + ' • ' + template.fields.length + ' fields'
                    )
                  ),
                  React.createElement('div', { style: { display: 'flex', gap: '8px' } },
                    React.createElement('button', {
                      style: { 
                        padding: '6px 12px', 
                        backgroundColor: '#3b82f6', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        cursor: 'pointer'
                      }
                    }, '✏️ Edit'),
                    React.createElement('button', {
                      style: { 
                        padding: '6px 12px', 
                        backgroundColor: '#10b981', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        cursor: 'pointer'
                      }
                    }, '📋 Use')
                  )
                ),
                selectedTemplate === template.id && React.createElement('div', {
                  style: { 
                    marginTop: '15px', 
                    padding: '15px', 
                    backgroundColor: '#f3f4f6', 
                    borderRadius: '6px' 
                  }
                },
                  React.createElement('h5', { style: { margin: '0 0 10px 0', color: '#374151' } }, 'Template Fields:'),
                  React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
                    ...template.fields.map((field, index) =>
                      React.createElement('span', {
                        key: index,
                        style: { 
                          padding: '4px 8px', 
                          backgroundColor: '#e5e7eb', 
                          color: '#374151', 
                          borderRadius: '8px', 
                          fontSize: '12px' 
                        }
                      }, field)
                    )
                  )
                )
              )
            )
          )
        )
      )
  );
}

function AdminLibraries() {
  const [notionConnected, setNotionConnected] = React.useState(false);
  const [wasabiConnected, setWasabiConnected] = React.useState(false);
  const [canvaConnected, setCanvaConnected] = React.useState(false);
  const [canvaLoading, setCanvaLoading] = React.useState(false);
  const [canvaDesigns, setCanvaDesigns] = React.useState([]);

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
          lastModified: '2025-01-15'
        },
        {
          id: 'design2',
          name: 'YouTube Thumbnail - Tutorial',
          type: 'youtube_thumbnail',
          thumbnail: 'https://via.placeholder.com/200x112/10b981/ffffff?text=YT+Thumb',
          lastModified: '2025-01-14'
        }
      ]);
    }, 2000);
  };

  return React.createElement('div', { style: { padding: '20px' } },
    React.createElement('h2', null, '📚 Libraries'),
    React.createElement('p', null, 'External service integrations and storage management'),
    
    React.createElement('div', { style: { display: 'grid', gap: '30px', marginTop: '30px' } },
      
      // Notion Integration
      React.createElement('div', {
        style: { 
          padding: '25px', 
          border: '2px solid #6366f1', 
          borderRadius: '12px', 
          background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)'
        }
      },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' } },
          React.createElement('div', null,
            React.createElement('h3', { style: { margin: '0', color: '#4338ca', fontSize: '20px' } }, '📝 Notion Integration'),
            React.createElement('p', { style: { margin: '5px 0 0 0', color: '#4338ca', fontSize: '14px' } }, 'Content management and documentation')
          ),
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
            React.createElement('span', {
              style: { 
                padding: '4px 8px', 
                backgroundColor: notionConnected ? '#10b981' : '#f59e0b', 
                color: 'white', 
                borderRadius: '12px', 
                fontSize: '12px',
                fontWeight: 'bold'
              }
            }, notionConnected ? 'Connected' : 'Ready to Connect'),
            React.createElement('button', {
              onClick: () => setNotionConnected(!notionConnected),
              style: {
                padding: '10px 20px',
                backgroundColor: notionConnected ? '#ef4444' : '#4338ca',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }
            }, notionConnected ? 'Disconnect' : '🔗 Connect Notion')
          )
        ),
        notionConnected ? 
          React.createElement('div', null,
            React.createElement('h4', { style: { color: '#4338ca', marginBottom: '15px' } }, '📄 Recent Pages & Databases'),
            React.createElement('div', { style: { fontSize: '14px', color: '#6b7280' } }, 'Content Calendar • Brand Guidelines • Templates')
          ) :
          React.createElement('div', { style: { textAlign: 'center', padding: '30px' } },
            React.createElement('div', { style: { fontSize: '48px', marginBottom: '15px' } }, '📝'),
            React.createElement('p', { style: { color: '#4338ca', fontSize: '16px', marginBottom: '10px' } }, 'Connect your Notion workspace'),
            React.createElement('p', { style: { color: '#6b7280', fontSize: '14px' } }, 'Access your content calendars, brand guidelines, and documentation')
          )
      ),

      // Wasabi Integration
      React.createElement('div', {
        style: { 
          padding: '25px', 
          border: '2px solid #dc2626', 
          borderRadius: '12px', 
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
        }
      },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' } },
          React.createElement('div', null,
            React.createElement('h3', { style: { margin: '0', color: '#dc2626', fontSize: '20px' } }, '📦 Wasabi Cloud Storage'),
            React.createElement('p', { style: { margin: '5px 0 0 0', color: '#dc2626', fontSize: '14px' } }, 'Internal assets & public member content storage')
          ),
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
            React.createElement('span', {
              style: { 
                padding: '4px 8px', 
                backgroundColor: wasabiConnected ? '#10b981' : '#f59e0b', 
                color: 'white', 
                borderRadius: '12px', 
                fontSize: '12px',
                fontWeight: 'bold'
              }
            }, wasabiConnected ? 'Connected' : 'Ready to Connect'),
            React.createElement('button', {
              onClick: () => setWasabiConnected(!wasabiConnected),
              style: {
                padding: '10px 20px',
                backgroundColor: wasabiConnected ? '#ef4444' : '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }
            }, wasabiConnected ? 'Disconnect' : '🔗 Connect Wasabi')
          )
        ),
        wasabiConnected ? 
          React.createElement('div', null,
            React.createElement('h4', { style: { color: '#dc2626', marginBottom: '15px' } }, '📂 Files'),
            React.createElement('div', { style: { fontSize: '14px', color: '#6b7280' } }, 'brand-assets.zip • video-content/ • templates/')
          ) :
          React.createElement('div', { style: { textAlign: 'center', padding: '30px' } },
            React.createElement('div', { style: { fontSize: '48px', marginBottom: '15px' } }, '📦'),
            React.createElement('p', { style: { color: '#dc2626', fontSize: '16px', marginBottom: '10px' } }, 'Connect your Wasabi storage'),
            React.createElement('p', { style: { color: '#6b7280', fontSize: '14px' } }, 'Dual storage: Internal assets & public member content')
          )
      ),

      // Canva Integration
      React.createElement('div', {
        style: { 
          padding: '25px', 
          border: '2px solid #7c3aed', 
          borderRadius: '12px', 
          background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)'
        }
      },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' } },
          React.createElement('div', null,
            React.createElement('h3', { style: { margin: '0', color: '#7c3aed', fontSize: '20px' } }, '🎨 Canva Integration'),
            React.createElement('p', { style: { margin: '5px 0 0 0', color: '#7c3aed', fontSize: '14px' } }, 'Design platform for visual content creation')
          ),
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
            React.createElement('span', {
              style: { 
                padding: '4px 8px', 
                backgroundColor: canvaConnected ? '#10b981' : '#f59e0b', 
                color: 'white', 
                borderRadius: '12px', 
                fontSize: '12px',
                fontWeight: 'bold'
              }
            }, canvaConnected ? 'Connected' : 'Ready to Connect'),
            React.createElement('button', {
              onClick: canvaConnected ? () => setCanvaConnected(false) : connectCanva,
              disabled: canvaLoading,
              style: {
                padding: '10px 20px',
                backgroundColor: canvaConnected ? '#ef4444' : '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: canvaLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                opacity: canvaLoading ? 0.7 : 1
              }
            }, canvaLoading ? '⏳ Connecting...' : (canvaConnected ? 'Disconnect' : '🔗 Connect Canva'))
          )
        ),
        canvaConnected ? 
          React.createElement('div', null,
            React.createElement('h4', { style: { color: '#7c3aed', marginBottom: '15px' } }, '🎨 Your Designs (' + canvaDesigns.length + ')'),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' } },
              ...canvaDesigns.map(design =>
                React.createElement('div', {
                  key: design.id,
                  style: { 
                    padding: '15px', 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    border: '1px solid #ddd6fe', 
                    borderRadius: '12px',
                    cursor: 'pointer'
                  }
                },
                  React.createElement('img', {
                    src: design.thumbnail,
                    alt: design.name,
                    style: { 
                      width: '100%', 
                      height: '150px', 
                      objectFit: 'cover', 
                      borderRadius: '8px',
                      marginBottom: '12px'
                    }
                  }),
                  React.createElement('h5', { style: { margin: '0 0 8px 0', color: '#1f2937', fontSize: '14px', fontWeight: 'bold' } }, design.name),
                  React.createElement('p', { style: { margin: '0 0 12px 0', color: '#6b7280', fontSize: '12px' } }, 
                    design.type.replace('_', ' ') + ' • ' + design.lastModified
                  ),
                  React.createElement('div', { style: { display: 'flex', gap: '8px' } },
                    React.createElement('button', {
                      onClick: (e) => {
                        e.stopPropagation();
                        alert('Edit functionality ready for Canva API integration');
                      },
                      style: { 
                        flex: '1',
                        padding: '8px', 
                        backgroundColor: '#7c3aed', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        cursor: 'pointer'
                      }
                    }, '✏️ Edit'),
                    React.createElement('button', {
                      onClick: (e) => {
                        e.stopPropagation();
                        alert('Exporting ' + design.name + ' to Wasabi...');
                      },
                      style: { 
                        flex: '1',
                        padding: '8px', 
                        backgroundColor: '#10b981', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        cursor: 'pointer'
                      }
                    }, '📥 Export')
                  )
                )
              )
            )
          ) :
          React.createElement('div', { style: { textAlign: 'center', padding: '30px' } },
            React.createElement('div', { style: { fontSize: '48px', marginBottom: '15px' } }, '🎨'),
            React.createElement('p', { style: { color: '#7c3aed', fontSize: '16px', marginBottom: '10px' } }, 'Connect your Canva account'),
            React.createElement('p', { style: { color: '#6b7280', fontSize: '14px' } }, 'Access your designs, templates, and create new visual content')
          )
      )
    )
  );
}

function AdminBrand() {
  const [selectedTab, setSelectedTab] = React.useState('overview');

  return React.createElement('div', { style: { padding: '20px' } },
    React.createElement('h2', null, '🏢 Brand Kit'),
    React.createElement('p', null, 'Brand assets, guidelines, and system configuration'),
    
    React.createElement('div', {
      style: { 
        display: 'flex', 
        gap: '0', 
        marginTop: '20px', 
        marginBottom: '30px',
        borderBottom: '2px solid #e5e7eb'
      }
    },
      React.createElement('button', {
        onClick: () => setSelectedTab('overview'),
        style: {
          padding: '12px 20px',
          backgroundColor: selectedTab === 'overview' ? '#3b82f6' : 'transparent',
          color: selectedTab === 'overview' ? 'white' : '#6b7280',
          border: 'none',
          borderBottom: selectedTab === 'overview' ? '3px solid #3b82f6' : '3px solid transparent',
          cursor: 'pointer',
          fontWeight: selectedTab === 'overview' ? 'bold' : 'normal'
        }
      }, '📊 System Overview'),
      React.createElement('button', {
        onClick: () => setSelectedTab('assets'),
        style: {
          padding: '12px 20px',
          backgroundColor: selectedTab === 'assets' ? '#3b82f6' : 'transparent',
          color: selectedTab === 'assets' ? 'white' : '#6b7280',
          border: 'none',
          borderBottom: selectedTab === 'assets' ? '3px solid #3b82f6' : '3px solid transparent',
          cursor: 'pointer',
          fontWeight: selectedTab === 'assets' ? 'bold' : 'normal'
        }
      }, '🎨 Brand Assets')
    ),

    selectedTab === 'overview' ? 
      React.createElement('div', { style: { display: 'grid', gap: '20px' } },
        React.createElement('div', {
          style: { 
            padding: '25px', 
            border: '2px solid #10b981', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' 
          }
        },
          React.createElement('h3', { style: { color: '#047857', marginBottom: '15px' } }, '📊 System Status'),
          React.createElement('p', { style: { fontSize: '14px', color: '#047857', marginBottom: '20px' } }, 'Current system health and integrations'),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' } },
            React.createElement('div', {
              style: { 
                padding: '15px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }
            },
              React.createElement('div', { style: { width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '50%' } }),
              React.createElement('span', { style: { fontSize: '14px', fontWeight: 'bold' } }, 'Dashboard Online')
            ),
            React.createElement('div', {
              style: { 
                padding: '15px', 
                backgroundColor: 'rgba(255,255,255,0.8)', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }
            },
              React.createElement('div', { style: { width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '50%' } }),
              React.createElement('span', { style: { fontSize: '14px', fontWeight: 'bold' } }, 'External Integrations')
            )
          )
        )
      ) :
      React.createElement('div', { style: { display: 'grid', gap: '20px' } },
        React.createElement('div', {
          style: { 
            padding: '60px 40px', 
            border: '2px dashed #d1d5db', 
            borderRadius: '12px', 
            background: '#fafafa',
            textAlign: 'center'
          }
        },
          React.createElement('div', { style: { fontSize: '64px', marginBottom: '20px' } }, '🎨'),
          React.createElement('h3', { style: { color: '#6b7280', marginBottom: '15px', fontSize: '24px' } }, 'Brand Assets Library'),
          React.createElement('p', { style: { fontSize: '16px', color: '#9ca3af', marginBottom: '25px' } }, 'Coming soon: Logo management, color palettes, and brand guidelines'),
          React.createElement('button', {
            style: { 
              marginTop: '30px',
              padding: '15px 30px', 
              backgroundColor: '#f3f4f6', 
              border: '2px solid #d1d5db', 
              borderRadius: '8px', 
              cursor: 'not-allowed',
              color: '#6b7280',
              fontSize: '16px',
              fontWeight: 'bold'
            },
            disabled: true
          }, '🚧 Coming Soon')
        )
      )
  );
}

function ComingSoon({ title, description, icon = "🚧" }) {
  return React.createElement('div', {
    style: { 
      padding: '60px 40px', 
      textAlign: 'center',
      background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
      borderRadius: '12px',
      border: '2px dashed #d1d5db'
    }
  },
    React.createElement('div', { style: { fontSize: '64px', marginBottom: '20px' } }, icon),
    React.createElement('h2', { style: { color: '#6b7280', marginBottom: '15px', fontSize: '28px' } }, title),
    React.createElement('p', { style: { fontSize: '16px', color: '#9ca3af', marginBottom: '25px', maxWidth: '500px', margin: '0 auto 25px' } }, description),
    React.createElement('button', {
      style: { 
        padding: '15px 30px', 
        backgroundColor: '#f3f4f6', 
        border: '2px solid #d1d5db', 
        borderRadius: '8px', 
        cursor: 'not-allowed',
        color: '#6b7280',
        fontSize: '16px',
        fontWeight: 'bold'
      },
      disabled: true
    }, '🚧 Coming Soon')
  );
}

function App() {
  const [activeSection, setActiveSection] = React.useState('overview');

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
        return React.createElement('div', { style: { padding: '20px' } },
          React.createElement('h1', null, '📊 3C Content Center'),
          React.createElement('p', null, 'Welcome to your comprehensive content management dashboard'),
          
          React.createElement('div', {
            style: { 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '20px',
              marginTop: '30px'
            }
          },
            React.createElement('div', {
              style: { 
                padding: '25px', 
                border: '2px solid #3b82f6', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
              }
            },
              React.createElement('h3', { style: { color: '#1e40af', marginBottom: '15px' } }, '🏗️ Template Management'),
              React.createElement('p', { style: { color: '#1e40af', fontSize: '14px', marginBottom: '20px' } }, 'Create and manage content templates with external tool integrations'),
              React.createElement('button', {
                onClick: () => setActiveSection('admin-center'),
                style: { 
                  padding: '10px 20px', 
                  backgroundColor: '#3b82f6', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }
              }, '🔗 Access Templates')
            ),
            React.createElement('div', {
              style: { 
                padding: '25px', 
                border: '2px solid #10b981', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
              }
            },
              React.createElement('h3', { style: { color: '#047857', marginBottom: '15px' } }, '📚 External Integrations'),
              React.createElement('p', { style: { color: '#047857', fontSize: '14px', marginBottom: '20px' } }, 'Connect with Notion, Canva, and Wasabi for seamless workflow'),
              React.createElement('button', {
                onClick: () => setActiveSection('admin-center'),
                style: { 
                  padding: '10px 20px', 
                  backgroundColor: '#10b981', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }
              }, '🔗 Manage Libraries')
            ),
            React.createElement('div', {
              style: { 
                padding: '25px', 
                border: '2px solid #7c3aed', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)'
              }
            },
              React.createElement('h3', { style: { color: '#7c3aed', marginBottom: '15px' } }, '🏢 Brand Management'),
              React.createElement('p', { style: { color: '#7c3aed', fontSize: '14px', marginBottom: '20px' } }, 'Configure brand assets, guidelines, and system settings'),
              React.createElement('button', {
                onClick: () => setActiveSection('admin-center'),
                style: { 
                  padding: '10px 20px', 
                  backgroundColor: '#7c3aed', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }
              }, '🔗 Brand Kit')
            )
          )
        );

      case 'admin-center':
        return React.createElement(AdminCenter);

      case 'content-manager':
        return React.createElement(ComingSoon, {
          title: "Content Manager",
          description: "Advanced content creation and management tools with AI assistance and template integration.",
          icon: "📝"
        });

      case 'chat-manager-public':
        return React.createElement(ComingSoon, {
          title: "Chat Manager - Public",
          description: "Public-facing chat management system for customer interactions and automated responses.",
          icon: "💬"
        });

      case 'scheduler':
        return React.createElement(ComingSoon, {
          title: "Content Scheduler",
          description: "Schedule and automate content publishing across multiple platforms.",
          icon: "📅"
        });

      case 'marketing-center':
        return React.createElement(ComingSoon, {
          title: "Marketing Center",
          description: "Comprehensive marketing automation, campaign management, and analytics dashboard.",
          icon: "🧠"
        });

      case 'settings':
        return React.createElement(ComingSoon, {
          title: "System Settings",
          description: "Configure system preferences, user permissions, and integrations.",
          icon: "⚙️"
        });

      case 'ai-chat-manager':
        return React.createElement(ComingSoon, {
          title: "AI Chat Manager",
          description: "Advanced AI-powered chat management for internal team communication.",
          icon: "🤖"
        });

      default:
        return React.createElement('div', null, 'Section not found');
    }
  };

  return React.createElement('div', { style: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' } },
    React.createElement('div', {
      style: { 
        width: '280px', 
        backgroundColor: '#ffffff', 
        borderRight: '1px solid #e5e7eb',
        padding: '20px 0',
        display: 'flex',
        flexDirection: 'column'
      }
    },
      React.createElement('div', {
        style: { 
          padding: '0 20px 30px 20px', 
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '20px'
        }
      },
        React.createElement('h2', {
          style: { 
            margin: '0', 
            color: '#1f2937', 
            fontSize: '20px',
            fontWeight: 'bold'
          }
        }, '3C Content Center'),
        React.createElement('p', {
          style: { 
            margin: '5px 0 0 0', 
            color: '#6b7280', 
            fontSize: '14px' 
          }
        }, 'Admin Dashboard')
      ),

      React.createElement('div', { style: { flex: '1', padding: '0 10px' } },
        ...navigationItems.map((item) =>
          React.createElement('button', {
            key: item.id,
            onClick: () => item.available && setActiveSection(item.id),
            style: {
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
            }
          },
            React.createElement('span', { style: { fontSize: '16px' } }, item.icon),
            React.createElement('span', { style: { flex: '1' } }, item.label),
            !item.available && React.createElement('span', {
              style: { 
                fontSize: '10px', 
                backgroundColor: '#f59e0b', 
                color: 'white', 
                padding: '2px 6px', 
                borderRadius: '8px',
                fontWeight: 'bold'
              }
            }, 'Soon')
          )
        )
      ),

      React.createElement('div', {
        style: { 
          padding: '20px 10px 0 10px', 
          borderTop: '1px solid #e5e7eb',
          marginTop: '20px'
        }
      },
        React.createElement('button', {
          style: {
            width: '100%',
            padding: '12px 15px',
            backgroundColor: 'transparent',
            color: '#9ca3af',
            border: 'none',
            borderRadius: '8px',
            textAlign: 'left',
            cursor: 'not-allowed',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            opacity: 0.6
          }
        },
          React.createElement('span', { style: { fontSize: '16px' } }, bottomNavItem.icon),
          React.createElement('div', { style: { flex: '1' } },
            React.createElement('div', null, bottomNavItem.label),
            React.createElement('div', { style: { fontSize: '10px', opacity: 0.8 } }, bottomNavItem.note)
          ),
          React.createElement('span', {
            style: { 
              fontSize: '10px', 
              backgroundColor: '#f59e0b', 
              color: 'white', 
              padding: '2px 6px', 
              borderRadius: '8px',
              fontWeight: 'bold'
            }
          }, 'Soon')
        )
      )
    ),

    React.createElement('div', { style: { flex: '1', backgroundColor: '#ffffff' } },
      renderContent()
    )
  );
}

function AdminCenter() {
  const [activeTab, setActiveTab] = React.useState('templates');

  return React.createElement('div', null,
    React.createElement('div', {
      style: { 
        borderBottom: '1px solid #e5e7eb', 
        backgroundColor: '#f9fafb', 
        padding: '0 20px' 
      }
    },
      React.createElement('div', { style: { display: 'flex', gap: '0' } },
        React.createElement('button', {
          onClick: () => setActiveTab('templates'),
          style: {
            padding: '12px 24px',
            backgroundColor: activeTab === 'templates' ? '#ffffff' : 'transparent',
            color: activeTab === 'templates' ? '#1f2937' : '#6b7280',
            border: 'none',
            borderBottom: activeTab === 'templates' ? '2px solid #3b82f6' : '2px solid transparent',
            fontWeight: activeTab === 'templates' ? 'bold' : 'normal',
            cursor: 'pointer'
          }
        }, '🏗️ Manage Templates'),
        React.createElement('button', {
          onClick: () => setActiveTab('libraries'),
          style: {
            padding: '12px 24px',
            backgroundColor: activeTab === 'libraries' ? '#ffffff' : 'transparent',
            color: activeTab === 'libraries' ? '#1f2937' : '#6b7280',
            border: 'none',
            borderBottom: activeTab === 'libraries' ? '2px solid #3b82f6' : '2px solid transparent',
            fontWeight: activeTab === 'libraries' ? 'bold' : 'normal',
            cursor: 'pointer'
          }
        }, '📚 Libraries'),
        React.createElement('button', {
          onClick: () => setActiveTab('brand'),
          style: {
            padding: '12px 24px',
            backgroundColor: activeTab === 'brand' ? '#ffffff' : 'transparent',
            color: activeTab === 'brand' ? '#1f2937' : '#6b7280',
            border: 'none',
            borderBottom: activeTab === 'brand' ? '2px solid #3b82f6' : '2px solid transparent',
            fontWeight: activeTab === 'brand' ? 'bold' : 'normal',
            cursor: 'pointer'
          }
        }, '🏢 Brand Kit')
      )
    ),

    activeTab === 'templates' && React.createElement(AdminTemplates),
    activeTab === 'libraries' && React.createElement(AdminLibraries),
    activeTab === 'brand' && React.createElement(AdminBrand)
  );
}

export default App;
