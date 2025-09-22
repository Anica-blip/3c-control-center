// /src/schedulecomponent/components/TemplateManager.tsx
import React, { useState, useMemo } from 'react';
import { Save, Plus, Edit, Trash2, Copy, Play, Search, Filter, Eye, Star, TrendingUp, Calendar, User, Hash } from 'lucide-react';
import { formatDate, getRelativeTime } from '../utils/dateUtils';
import { getPlatformIcon, formatPlatformList } from '../utils/platformUtils';

interface SavedTemplate {
  id: string;
  template_name: string;
  character_profile: string;
  theme: string;
  audience: string;
  media_type: string;
  template_type: string;
  platform: string;
  title: string;
  description: string;
  hashtags: string[];
  keywords: string;
  cta: string;
  selected_platforms: string[];
  usage_count: number;
  is_active: boolean;
  template_version: number;
  persona_target?: string;
  audience_segment?: string;
  campaign_type?: string;
  user_id: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

interface TemplateManagerProps {
  templates: SavedTemplate[];
  loading: boolean;
  error?: string | null;
  onCreate: (templateData: Omit<SavedTemplate, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<SavedTemplate>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUse: (id: string) => Promise<void>;
  onLoadTemplate?: (template: SavedTemplate) => void;
}

export default function TemplateManager({
  templates,
  loading,
  error,
  onCreate,
  onUpdate,
  onDelete,
  onUse,
  onLoadTemplate
}: TemplateManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<SavedTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'usage' | 'name'>('recent');

  const isDarkMode = localStorage.getItem('darkMode') === 'true';

  // Theme colors
  const theme = isDarkMode ? {
    bg: '#1e293b',
    cardBg: '#334155',
    border: '#475569',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    primary: '#60a5fa',
    primaryHover: '#3b82f6',
    hoverBg: '#475569',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
  } : {
    bg: 'white',
    cardBg: '#f9fafb',
    border: '#e5e7eb',
    text: '#111827',
    textSecondary: '#6b7280',
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    hoverBg: '#f3f4f6',
    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626'
  };

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let filtered = templates.filter(template => template.is_active);

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(template =>
        template.template_name.toLowerCase().includes(term) ||
        template.description.toLowerCase().includes(term) ||
        template.theme.toLowerCase().includes(term) ||
        template.audience.toLowerCase().includes(term) ||
        template.keywords.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template =>
        template.template_type === selectedCategory ||
        template.theme === selectedCategory
      );
    }

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'usage':
          return b.usage_count - a.usage_count;
        case 'name':
          return a.template_name.localeCompare(b.template_name);
        case 'recent':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    return filtered;
  }, [templates, searchTerm, selectedCategory, sortBy]);

  // Get template categories
  const categories = useMemo(() => {
    const types = new Set(templates.map(t => t.template_type));
    const themes = new Set(templates.map(t => t.theme));
    return {
      template_types: Array.from(types),
      themes: Array.from(themes)
    };
  }, [templates]);

  // Handle template actions
  const handleUseTemplate = async (template: SavedTemplate) => {
    try {
      await onUse(template.id);
      if (onLoadTemplate) {
        onLoadTemplate(template);
      }
    } catch (error) {
      console.error('Failed to use template:', error);
    }
  };

  const handleDuplicateTemplate = async (template: SavedTemplate) => {
    try {
      const duplicateData = {
        ...template,
        template_name: `${template.template_name} (Copy)`,
        usage_count: 0,
        template_version: 1
      };
      delete (duplicateData as any).id;
      delete (duplicateData as any).created_at;
      delete (duplicateData as any).updated_at;
      
      await onCreate(duplicateData);
    } catch (error) {
      console.error('Failed to duplicate template:', error);
    }
  };

  const containerStyle = {
    backgroundColor: theme.bg,
    color: theme.text,
    borderRadius: '8px',
    padding: '24px',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            border: `3px solid ${theme.border}`,
            borderTop: `3px solid ${theme.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: theme.textSecondary }}>Loading templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: theme.danger
        }}>
          <p>Error loading templates: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: `1px solid ${theme.border}`
      }}>
        <div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            margin: '0 0 8px 0',
            color: theme.primary,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Save size={24} />
            Template Library
          </h2>
          <p style={{
            fontSize: '14px',
            color: theme.textSecondary,
            margin: '0'
          }}>
            {templates.length} saved templates • Create reusable content templates
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: theme.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.primaryHover}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = theme.primary}
        >
          <Plus size={16} />
          New Template
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          padding: '16px',
          backgroundColor: theme.cardBg,
          border: `1px solid ${theme.border}`,
          borderRadius: '8px'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: theme.primary,
            marginBottom: '4px'
          }}>
            {templates.length}
          </div>
          <div style={{
            fontSize: '14px',
            color: theme.textSecondary
          }}>
            Total Templates
          </div>
        </div>

        <div style={{
          padding: '16px',
          backgroundColor: theme.cardBg,
          border: `1px solid ${theme.border}`,
          borderRadius: '8px'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: theme.success,
            marginBottom: '4px'
          }}>
            {templates.reduce((sum, t) => sum + t.usage_count, 0)}
          </div>
          <div style={{
            fontSize: '14px',
            color: theme.textSecondary
          }}>
            Total Uses
          </div>
        </div>

        <div style={{
          padding: '16px',
          backgroundColor: theme.cardBg,
          border: `1px solid ${theme.border}`,
          borderRadius: '8px'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: theme.warning,
            marginBottom: '4px'
          }}>
            {categories.template_types.length}
          </div>
          <div style={{
            fontSize: '14px',
            color: theme.textSecondary
          }}>
            Template Types
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: theme.cardBg,
        borderRadius: '8px',
        border: `1px solid ${theme.border}`
      }}>
        {/* Search */}
        <div style={{
          flex: 1,
          position: 'relative'
        }}>
          <Search size={16} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: theme.textSecondary
          }} />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              border: `1px solid ${theme.border}`,
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: theme.bg,
              color: theme.text,
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '10px 12px',
            border: `1px solid ${theme.border}`,
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: theme.bg,
            color: theme.text,
            fontFamily: 'inherit',
            minWidth: '150px'
          }}
        >
          <option value="all">All Categories</option>
          <optgroup label="Template Types">
            {categories.template_types.map(type => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </optgroup>
          <optgroup label="Themes">
            {categories.themes.map(theme => (
              <option key={theme} value={theme}>
                {theme.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </optgroup>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'recent' | 'usage' | 'name')}
          style={{
            padding: '10px 12px',
            border: `1px solid ${theme.border}`,
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: theme.bg,
            color: theme.text,
            fontFamily: 'inherit',
            minWidth: '120px'
          }}
        >
          <option value="recent">Recent</option>
          <option value="usage">Most Used</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: theme.textSecondary
        }}>
          <Save size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
            {searchTerm || selectedCategory !== 'all' ? 'No Matching Templates' : 'No Templates Yet'}
          </h3>
          <p style={{ fontSize: '14px', margin: '0 0 16px 0' }}>
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your filters or search terms.'
              : 'Create your first template to get started.'
            }
          </p>
          {!searchTerm && selectedCategory === 'all' && (
            <button
              onClick={() => setIsCreating(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto',
                padding: '12px 20px',
                backgroundColor: theme.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              <Plus size={16} />
              Create Template
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {filteredTemplates.map((template) => (
            <div key={template.id} style={{
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '12px',
              padding: '20px',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              position: 'relative'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = theme.primary;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = isDarkMode 
                ? '0 8px 25px rgba(96, 165, 250, 0.1)' 
                : '0 8px 25px rgba(59, 130, 246, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = theme.border;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              {/* Template Header */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: theme.text,
                    margin: '0 0 8px 0',
                    lineHeight: '1.4'
                  }}>
                    {template.template_name}
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '12px',
                    color: theme.textSecondary
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <TrendingUp size={12} />
                      {template.usage_count} uses
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Calendar size={12} />
                      {getRelativeTime(template.updated_at)}
                    </div>
                  </div>
                </div>

                {/* Popular badge */}
                {template.usage_count >= 5 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    backgroundColor: theme.warning,
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    <Star size={10} />
                    Popular
                  </div>
                )}
              </div>

              {/* Template Content Preview */}
              <div style={{ marginBottom: '16px' }}>
                <p style={{
                  fontSize: '14px',
                  color: theme.text,
                  lineHeight: '1.5',
                  margin: '0 0 12px 0',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {template.description}
                </p>

                {/* Template Tags */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginBottom: '12px'
                }}>
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    backgroundColor: isDarkMode ? '#1e3a8a20' : '#dbeafe',
                    color: theme.primary,
                    borderRadius: '4px',
                    fontWeight: '500'
                  }}>
                    {template.theme.replace(/_/g, ' ')}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    backgroundColor: isDarkMode ? '#065f4620' : '#d1fae5',
                    color: theme.success,
                    borderRadius: '4px',
                    fontWeight: '500'
                  }}>
                    {template.template_type.replace(/_/g, ' ')}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    backgroundColor: theme.hoverBg,
                    color: theme.textSecondary,
                    borderRadius: '4px',
                    fontWeight: '500'
                  }}>
                    {template.audience.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Platforms */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: theme.textSecondary
                }}>
                  <span>Platforms:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {template.selected_platforms.slice(0, 3).map((platform, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        {getPlatformIcon(platform, 12)}
                      </div>
                    ))}
                    {template.selected_platforms.length > 3 && (
                      <span>+{template.selected_platforms.length - 3}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Character Profile */}
              {template.character_profile && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: theme.textSecondary,
                  marginBottom: '16px',
                  padding: '8px 12px',
                  backgroundColor: theme.bg,
                  borderRadius: '6px'
                }}>
                  <User size={14} />
                  <span>Character: {template.character_profile}</span>
                </div>
              )}

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '8px',
                paddingTop: '16px',
                borderTop: `1px solid ${theme.border}`
              }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUseTemplate(template);
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px',
                    backgroundColor: theme.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.primaryHover}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = theme.primary}
                >
                  <Play size={14} />
                  Use Template
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTemplate(template);
                  }}
                  style={{
                    padding: '10px',
                    backgroundColor: 'transparent',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: theme.textSecondary
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.hoverBg}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Eye size={14} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicateTemplate(template);
                  }}
                  style={{
                    padding: '10px',
                    backgroundColor: 'transparent',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: theme.textSecondary
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.hoverBg}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Copy size={14} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to delete this template?')) {
                      onDelete(template.id);
                    }
                  }}
                  style={{
                    padding: '10px',
                    backgroundColor: 'transparent',
                    border: `1px solid ${theme.danger}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: theme.danger
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template Details Modal */}
      {selectedTemplate && (
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
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setSelectedTemplate(null)}>
          <div style={{
            backgroundColor: theme.bg,
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: `1px solid ${theme.border}`
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                margin: '0',
                color: theme.primary,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Save size={20} />
                Template Details
              </h3>
              <button
                onClick={() => setSelectedTemplate(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: theme.textSecondary,
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            {/* Template Content */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: theme.text,
                margin: '0 0 16px 0'
              }}>
                {selectedTemplate.template_name}
              </h4>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '16px',
                padding: '16px',
                backgroundColor: theme.cardBg,
                borderRadius: '8px'
              }}>
                <div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: theme.textSecondary,
                    textTransform: 'uppercase'
                  }}>
                    Usage Count
                  </span>
                  <div style={{ fontSize: '14px', color: theme.text, marginTop: '2px' }}>
                    {selectedTemplate.usage_count} times
                  </div>
                </div>

                <div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: theme.textSecondary,
                    textTransform: 'uppercase'
                  }}>
                    Last Updated
                  </span>
                  <div style={{ fontSize: '14px', color: theme.text, marginTop: '2px' }}>
                    {formatDate(selectedTemplate.updated_at)}
                  </div>
                </div>
              </div>

              <p style={{
                fontSize: '14px',
                color: theme.text,
                lineHeight: '1.5',
                margin: '0 0 16px 0',
                padding: '12px',
                backgroundColor: theme.cardBg,
                borderRadius: '6px'
              }}>
                {selectedTemplate.description}
              </p>

              {/* Hashtags */}
              {selectedTemplate.hashtags.length > 0 && (
                <div style={{
                  marginBottom: '16px'
                }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: theme.textSecondary,
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Hashtags
                  </span>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px'
                  }}>
                    {selectedTemplate.hashtags.map((tag, index) => (
                      <span key={index} style={{
                        fontSize: '12px',
                        color: theme.primary,
                        backgroundColor: isDarkMode ? '#1e3a8a20' : '#dbeafe',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: '500'
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Template Configuration */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                padding: '16px',
                backgroundColor: theme.cardBg,
                borderRadius: '8px'
              }}>
                <div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: theme.textSecondary,
                    textTransform: 'uppercase'
                  }}>
                    Theme
                  </span>
                  <div style={{ fontSize: '14px', color: theme.text, marginTop: '2px' }}>
                    {selectedTemplate.theme.replace(/_/g, ' ')}
                  </div>
                </div>

                <div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: theme.textSecondary,
                    textTransform: 'uppercase'
                  }}>
                    Audience
                  </span>
                  <div style={{ fontSize: '14px', color: theme.text, marginTop: '2px' }}>
                    {selectedTemplate.audience.replace(/_/g, ' ')}
                  </div>
                </div>

                <div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: theme.textSecondary,
                    textTransform: 'uppercase'
                  }}>
                    Template Type
                  </span>
                  <div style={{ fontSize: '14px', color: theme.text, marginTop: '2px' }}>
                    {selectedTemplate.template_type.replace(/_/g, ' ')}
                  </div>
                </div>

                <div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: theme.textSecondary,
                    textTransform: 'uppercase'
                  }}>
                    Platforms
                  </span>
                  <div style={{ fontSize: '14px', color: theme.text, marginTop: '2px' }}>
                    {formatPlatformList(selectedTemplate.selected_platforms, 2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{
              display: 'flex',
              gap: '12px',
              paddingTop: '16px',
              borderTop: `1px solid ${theme.border}`
            }}>
              <button
                onClick={() => {
                  handleUseTemplate(selectedTemplate);
                  setSelectedTemplate(null);
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: theme.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.primaryHover}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = theme.primary}
              >
                <Play size={16} />
                Use Template
              </button>

              <button
                onClick={() => setSelectedTemplate(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'transparent',
                  color: theme.textSecondary,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.hoverBg}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for loading animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
