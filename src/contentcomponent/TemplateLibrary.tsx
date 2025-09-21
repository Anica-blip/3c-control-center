// src/contentcomponent/TemplateLibrary.tsx
import React, { useState, useEffect, useContext } from 'react';
import { Library, CheckCircle, X, Send, Trash2, Settings, User, Palette } from 'lucide-react';
import { supabase } from './supabaseAPI'; // Import supabase client directly

// Theme Context (matches EnhancedContentCreationForm pattern)
const ThemeContext = React.createContext({
  isDarkMode: false,
  toggleDarkMode: () => {}
});

const useTheme = () => useContext(ThemeContext);

// ============================================================================
// SHARED STATE FOR TEMPLATE LOADING (Global Communication)
// ============================================================================

// Create a global event system for template loading
const TEMPLATE_LOAD_EVENT = 'LOAD_TEMPLATE_TO_FORM';

const templateEventEmitter = {
  emit: (template: PendingLibraryTemplate) => {
    const event = new CustomEvent(TEMPLATE_LOAD_EVENT, { 
      detail: template 
    });
    window.dispatchEvent(event);
  },
  
  listen: (callback: (template: PendingLibraryTemplate) => void) => {
    const handler = (event: CustomEvent) => {
      callback(event.detail);
    };
    window.addEventListener(TEMPLATE_LOAD_EVENT, handler as EventListener);
    
    return () => {
      window.removeEventListener(TEMPLATE_LOAD_EVENT, handler as EventListener);
    };
  }
};

// ============================================================================

export interface PendingLibraryTemplate {
  id: string;
  template_id: string;
  content_title: string;
  content_id?: string;
  character_profile?: string;
  theme?: string;
  audience?: string;
  media_type?: string;
  template_type?: string;
  platform?: string;
  title?: string;
  description?: string;
  hashtags?: string[];
  keywords?: string;
  cta?: string;
  media_files?: any[]; // MediaFile[] from types
  selected_platforms?: string[];
  status: 'pending' | 'active' | 'draft' | 'scheduled';
  is_from_template: boolean;
  source_template_id?: string;
  user_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  voiceStyle?: string; // Added to match EnhancedContentCreationForm
}

// ============================================================================
// TEMPLATE LIBRARY API FUNCTIONS
// ============================================================================

const templateLibraryAPI = {
  // Fetch pending templates from Supabase
  async fetchPendingTemplates(): Promise<PendingLibraryTemplate[]> {
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    try {
      console.log('Fetching pending templates from pending_content_library table...');
      
              const { data, error } = await supabase
        .from('pending_content_library')
        .select(`
          id,
          template_id,
          content_title,
          content_id,
          character_profile,
          theme,
          audience,
          media_type,
          template_type,
          platform,
          title,
          description,
          hashtags,
          keywords,
          cta,
          media_files,
          selected_platforms,
          status,
          is_from_template,
          source_template_id,
          user_id,
          created_by,
          created_at,
          updated_at,
          is_active,
          voice_style
        `)
        .eq('is_active', true)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase query error:', error);
        throw new Error(`Database query failed: ${error.message}`);
      }
      
      console.log(`Successfully fetched ${data?.length || 0} pending templates from pending_content_library:`, data);
      
      // Transform data to match interface
      const transformedData = (data || []).map(item => ({
        id: item.id?.toString() || '',
        template_id: item.template_id || '',
        content_title: item.content_title || 'Untitled Template',
        content_id: item.content_id || '',
        character_profile: item.character_profile || '',
        theme: item.theme || '',
        audience: item.audience || '',
        media_type: item.media_type || '',
        template_type: item.template_type || '',
        platform: item.platform || '',
        title: item.title || '',
        description: item.description || '',
        hashtags: Array.isArray(item.hashtags) ? item.hashtags : [],
        keywords: item.keywords || '',
        cta: item.cta || '',
        media_files: Array.isArray(item.media_files) ? item.media_files : [],
        selected_platforms: Array.isArray(item.selected_platforms) ? item.selected_platforms : [],
        status: item.status || 'pending',
        is_from_template: Boolean(item.is_from_template),
        source_template_id: item.source_template_id || '',
        user_id: item.user_id || '',
        created_by: item.created_by || '',
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString(),
        is_active: Boolean(item.is_active),
        voiceStyle: item.voice_style || ''
      }));
      
      return transformedData;
    } catch (error) {
      console.error('Error fetching pending templates:', error);
      throw error;
    }
  },

  // Update template status
  async updatePendingTemplate(id: string, updateData: Partial<PendingLibraryTemplate>) {
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    try {
      console.log('Updating pending template:', id, updateData);
      
      const { data, error } = await supabase
        .from('pending_content_library')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      
      console.log('Template updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Error updating pending template:', error);
      throw error;
    }
  },

  // Soft delete template
  async deletePendingTemplate(id: string) {
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    try {
      console.log('Deleting pending template:', id);
      
      const { error } = await supabase
        .from('pending_content_library')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }
      
      console.log('Template deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting pending template:', error);
      throw error;
    }
  }
};

// ============================================================================
// TEMPLATE LIBRARY SECTION COMPONENT
// ============================================================================

interface TemplateLibraryProps {
  onLoadTemplate: (template: PendingLibraryTemplate) => void;
  createFormRef?: React.RefObject<any>; // Reference to EnhancedContentCreationForm
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ 
  onLoadTemplate 
}) => {
  const { isDarkMode } = useTheme();
  const [pendingTemplates, setPendingTemplates] = useState<PendingLibraryTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  // ADD PERSISTENT ERROR STATE FOR TEMPLATE OPERATIONS
  const [operationError, setOperationError] = useState<string | null>(null);
  const [operationSuccess, setOperationSuccess] = useState<string | null>(null);
  // ADD BUTTON CLICK COUNTER FOR DEBUGGING
  const [buttonClickCount, setButtonClickCount] = useState(0);

  // Load pending templates on component mount and when tab becomes active
  useEffect(() => {
    loadPendingTemplates();
  }, []);

  // Refresh when Template Library section becomes visible/focused
  useEffect(() => {
    const handleFocus = () => {
      console.log('Template Library section focused - refreshing templates...');
      loadPendingTemplates();
    };

    // Add event listeners for when this component/section becomes active
    window.addEventListener('focus', handleFocus);
    
    // Also refresh when user clicks anywhere in this component
    const componentElement = document.querySelector('[data-component="template-library"]');
    if (componentElement) {
      componentElement.addEventListener('click', handleFocus);
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      if (componentElement) {
        componentElement.removeEventListener('click', handleFocus);
      }
    };
  }, []);

  const loadPendingTemplates = async () => {
    try {
      setIsLoading(true);
      setConnectionError(null);
      
      // FIXED: Test Supabase connection first
      if (!supabase) {
        throw new Error('Supabase client not initialized - check environment variables');
      }
      
      const templates = await templateLibraryAPI.fetchPendingTemplates();
      setPendingTemplates(templates);
      setIsConnected(true);
      
      if (templates.length === 0) {
        console.log('No pending templates found. Make sure templates are forwarded from Content Template Engine.');
      }
      
    } catch (error: any) {
      console.error('Error loading pending templates:', error);
      setIsConnected(false);
      setConnectionError(error.message || 'Failed to load templates');
      
      // Don't show mock data - let user know the real issue
      setPendingTemplates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToCreate = async (template: PendingLibraryTemplate) => {
    try {
      // Clear previous errors
      setOperationError(null);
      setOperationSuccess(null);
      
      alert('BUTTON CLICKED! Function started executing.');
      console.log('=== SEND TO CREATE DEBUG START ===');
      console.log('1. Button clicked - Template data:', template);
      console.log('2. Template ID:', template.template_id);
      console.log('3. onLoadTemplate function exists:', typeof onLoadTemplate);
      console.log('4. onLoadTemplate function:', onLoadTemplate);
      
      // Validate onLoadTemplate exists
      if (typeof onLoadTemplate !== 'function') {
        const errorMsg = 'onLoadTemplate prop is not a function. Check ContentDashboard.tsx connection.';
        alert(`ERROR: ${errorMsg}`);
        throw new Error(errorMsg);
      }
      
      // FIRST: Call onLoadTemplate prop to send data to Dashboard
      console.log('5. Calling onLoadTemplate prop...');
      alert('About to call onLoadTemplate...');
      onLoadTemplate(template);
      console.log('6. onLoadTemplate called successfully - Dashboard should handle tab switch');
      alert('onLoadTemplate called successfully!');
      
      // SECOND: Update status in database
      console.log('7. Updating database status...');
      await templateLibraryAPI.updatePendingTemplate(template.id, { status: 'active' });
      console.log('8. Database updated successfully');
      
      // THIRD: Remove from pending list
      console.log('9. Removing from local list...');
      setPendingTemplates(prev => {
        const newList = prev.filter(t => t.id !== template.id);
        console.log('10. Templates before filter:', prev.length);
        console.log('11. Templates after filter:', newList.length);
        return newList;
      });
      
      console.log('=== SEND TO CREATE DEBUG SUCCESS ===');
      
      // Show success message
      setOperationSuccess(`Template "${template.content_title}" sent to Create New Content successfully!`);
      alert('SUCCESS: Template sent successfully!');
      
    } catch (error: any) {
      console.error('=== SEND TO CREATE DEBUG ERROR ===');
      console.error('Error details:', error);
      
      // Show persistent error message
      const errorMsg = `Failed to send template "${template.content_title}": ${error.message || 'Unknown error'}`;
      setOperationError(errorMsg);
      alert(`ERROR: ${errorMsg}`);
    }
  };

  const handleDeleteTemplate = async (template: PendingLibraryTemplate) => {
    if (!confirm(`Are you sure you want to delete the template "${template.content_title}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      console.log('Deleting template:', template.template_id);
      
      await templateLibraryAPI.deletePendingTemplate(template.id);
      setPendingTemplates(prev => prev.filter(t => t.id !== template.id));
      alert('Template deleted successfully.');
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template. Please try again.');
    }
  };

  const formatTheme = (theme: string) => {
    return theme?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
  };

  const getThemeIcon = (theme: string) => {
    const icons: Record<string, string> = {
      news_alert: '📢',
      promotion: '🎯',
      standard_post: '📝',
      cta_quiz: '❓',
      tutorial_guide: '📚',
      blog: '✍️',
      assessment: '✅'
    };
    return icons[theme] || '📄';
  };

  return (
    <div 
      data-component="template-library"
      style={{
        display: 'grid',
        gap: '24px'
      }}
    >
      {/* Template Library Header */}
      <div style={{
        backgroundColor: isDarkMode ? '#1e293b' : 'white',
        boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
        padding: '24px',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: isDarkMode ? '#f8fafc' : '#111827',
              margin: '0 0 4px 0'
            }}>
              Template Library
            </h3>
            <p style={{
              color: isDarkMode ? '#94a3b8' : '#6b7280',
              margin: '0',
              fontSize: '14px'
            }}>
              Templates forwarded from Content Template Engine (Table: pending_content_library)
            </p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: isConnected 
              ? (isDarkMode ? '#065f4630' : '#d1fae5')
              : (isDarkMode ? '#7f1d1d30' : '#fee2e2'),
            padding: '8px 12px',
            borderRadius: '8px',
            border: `1px solid ${isConnected ? '#10b981' : '#ef4444'}`
          }}>
            {isConnected ? (
              <CheckCircle style={{ height: '18px', width: '18px', color: '#10b981' }} />
            ) : (
              <X style={{ height: '18px', width: '18px', color: '#ef4444' }} />
            )}
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: isConnected 
                ? (isDarkMode ? '#34d399' : '#065f46')
                : (isDarkMode ? '#fca5a5' : '#7f1d1d')
            }}>
              {isConnected ? 'Connected' : 'Not Connected'}
            </span>
          </div>
        </div>
        
        {/* Connection Error Display */}
        {connectionError && (
          <div style={{
            background: isDarkMode ? '#7f1d1d30' : '#fee2e2',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #ef4444',
            marginBottom: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <X style={{ height: '16px', width: '16px', color: '#ef4444' }} />
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: isDarkMode ? '#fca5a5' : '#7f1d1d'
              }}>
                Supabase Connection Error
              </span>
            </div>
            <p style={{
              color: isDarkMode ? '#fca5a5' : '#7f1d1d',
              fontSize: '14px',
              lineHeight: '1.6',
              margin: '0 0 8px 0'
            }}>
              {connectionError}
            </p>
            <p style={{
              color: isDarkMode ? '#94a3b8' : '#6b7280',
              fontSize: '12px',
              margin: '0'
            }}>
              Check your Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)
            </p>
          </div>
        )}
        
        <div style={{
          background: isConnected 
            ? (isDarkMode ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)')
            : (isDarkMode ? 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)' : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'),
          borderRadius: '8px',
          padding: '16px',
          border: `1px solid ${isConnected ? (isDarkMode ? '#1e40af' : '#3b82f6') : '#ef4444'}`,
          marginBottom: '16px'
        }}>
          <p style={{
            color: isConnected 
              ? (isDarkMode ? '#bfdbfe' : '#1e40af')
              : (isDarkMode ? '#fca5a5' : '#7f1d1d'),
            fontSize: '14px',
            lineHeight: '1.6',
            margin: '0'
          }}>
            {isConnected 
              ? 'Templates are forwarded from your Content Template Engine and stored in Supabase pending_content_library table.'
              : 'Supabase connection required to receive forwarded templates from Content Template Engine.'}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={loadPendingTemplates}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              backgroundColor: isDarkMode ? '#60a5fa' : '#3b82f6',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: 'inherit',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            <Library style={{ height: '16px', width: '16px' }} />
            <span>{isLoading ? 'Refreshing...' : 'Refresh Templates'}</span>
          </button>
        </div>
      </div>

      {/* PERSISTENT ERROR/SUCCESS NOTIFICATIONS */}
      {operationError && (
        <div style={{
          backgroundColor: isDarkMode ? '#7f1d1d30' : '#fee2e2',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flex: 1
            }}>
              <X style={{ height: '20px', width: '20px', color: '#ef4444', flexShrink: 0 }} />
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: isDarkMode ? '#fca5a5' : '#7f1d1d',
                  marginBottom: '4px'
                }}>
                  Template Operation Failed
                </div>
                <div style={{
                  fontSize: '14px',
                  color: isDarkMode ? '#fca5a5' : '#7f1d1d',
                  lineHeight: '1.4'
                }}>
                  {operationError}
                </div>
              </div>
            </div>
            <button
              onClick={() => setOperationError(null)}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                cursor: 'pointer',
                color: '#ef4444',
                borderRadius: '4px',
                flexShrink: 0
              }}
              title="Dismiss error"
            >
              <X style={{ height: '16px', width: '16px' }} />
            </button>
          </div>
        </div>
      )}

      {operationSuccess && (
        <div style={{
          backgroundColor: isDarkMode ? '#065f4630' : '#d1fae5',
          border: '1px solid #10b981',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flex: 1
            }}>
              <CheckCircle style={{ height: '20px', width: '20px', color: '#10b981', flexShrink: 0 }} />
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: isDarkMode ? '#34d399' : '#065f46',
                  marginBottom: '4px'
                }}>
                  Template Sent Successfully
                </div>
                <div style={{
                  fontSize: '14px',
                  color: isDarkMode ? '#34d399' : '#065f46',
                  lineHeight: '1.4'
                }}>
                  {operationSuccess}
                </div>
              </div>
            </div>
            <button
              onClick={() => setOperationSuccess(null)}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                cursor: 'pointer',
                color: '#10b981',
                borderRadius: '4px',
                flexShrink: 0
              }}
              title="Dismiss notification"
            >
              <X style={{ height: '16px', width: '16px' }} />
            </button>
          </div>
        </div>
      )}

      {/* Templates List */}
      <div style={{
        backgroundColor: isDarkMode ? '#1e293b' : 'white',
        boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
        overflow: 'hidden',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          padding: '16px',
          background: isDarkMode 
            ? 'linear-gradient(135deg, #334155 0%, #475569 100%)' 
            : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
          borderBottom: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: isDarkMode ? '#60a5fa' : '#3b82f6',
              margin: '0'
            }}>
              Pending Templates
            </h3>
            <span style={{
              padding: '6px 12px',
              background: isDarkMode 
                ? 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)' 
                : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              borderRadius: '16px'
            }}>
              {pendingTemplates.length} templates
            </span>
          </div>
        </div>
        
        <div>
          {isLoading ? (
            <div style={{
              padding: '48px',
              textAlign: 'center',
              color: isDarkMode ? '#94a3b8' : '#6b7280'
            }}>
              <Library style={{ height: '32px', width: '32px', margin: '0 auto 12px auto', display: 'block' }} />
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                Loading templates...
              </div>
              <div style={{ fontSize: '14px' }}>
                Fetching from pending_content_library
              </div>
            </div>
          ) : pendingTemplates.length === 0 ? (
            <div style={{
              padding: '48px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: isDarkMode ? '#334155' : '#f3f4f6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <Library style={{ height: '32px', width: '32px', color: isDarkMode ? '#64748b' : '#9ca3af' }} />
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: isDarkMode ? '#f8fafc' : '#111827',
                margin: '0 0 8px 0'
              }}>
                No pending templates
              </h3>
              <p style={{
                color: isDarkMode ? '#94a3b8' : '#6b7280',
                fontSize: '14px',
                margin: '0 0 8px 0'
              }}>
                Templates forwarded from Content Template Engine will appear here
              </p>
              <p style={{
                color: isDarkMode ? '#64748b' : '#9ca3af',
                fontSize: '12px',
                margin: '0'
              }}>
                Use the "Forward to Dashboard" button in Content Template Engine to send templates here
              </p>
            </div>
          ) : (
            pendingTemplates.map((template) => (
              <div key={template.id} style={{
                padding: '20px',
                borderBottom: `1px solid ${isDarkMode ? '#334155' : '#f3f4f6'}`,
                transition: 'background-color 0.2s ease'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '12px'
                    }}>
                      <span style={{ fontSize: '24px' }}>
                        {getThemeIcon(template.theme || '')}
                      </span>
                      <div>
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: isDarkMode ? '#f8fafc' : '#111827',
                          margin: '0 0 4px 0'
                        }}>
                          {template.template_id} - {template.content_title}
                        </h4>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          fontFamily: 'monospace',
                          color: isDarkMode ? '#60a5fa' : '#3b82f6',
                          backgroundColor: isDarkMode ? '#1e3a8a30' : '#dbeafe',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          display: 'inline-block'
                        }}>
                          ID: {template.template_id}
                        </div>
                      </div>
                    </div>
                    
                    {template.description && (
                      <p style={{
                        color: isDarkMode ? '#94a3b8' : '#374151',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        margin: '0 0 16px 0'
                      }}>
                        {template.description.length > 150 
                          ? template.description.substring(0, 150) + '...'
                          : template.description
                        }
                      </p>
                    )}
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      flexWrap: 'wrap'
                    }}>
                      {template.theme && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          color: isDarkMode ? '#94a3b8' : '#6b7280',
                          backgroundColor: isDarkMode ? '#334155' : '#f3f4f6',
                          padding: '6px 10px',
                          borderRadius: '6px'
                        }}>
                          <Palette style={{ height: '14px', width: '14px' }} />
                          <span style={{ fontWeight: '600' }}>
                            {formatTheme(template.theme)}
                          </span>
                        </div>
                      )}
                      
                      {template.audience && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          color: isDarkMode ? '#94a3b8' : '#6b7280',
                          backgroundColor: isDarkMode ? '#334155' : '#f3f4f6',
                          padding: '6px 10px',
                          borderRadius: '6px'
                        }}>
                          <User style={{ height: '14px', width: '14px' }} />
                          <span style={{ fontWeight: '600' }}>
                            {formatTheme(template.audience)}
                          </span>
                        </div>
                      )}
                      
                      {template.platform && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          color: isDarkMode ? '#94a3b8' : '#6b7280',
                          backgroundColor: isDarkMode ? '#334155' : '#f3f4f6',
                          padding: '6px 10px',
                          borderRadius: '6px'
                        }}>
                          <Settings style={{ height: '14px', width: '14px' }} />
                          <span style={{ fontWeight: '600' }}>
                            {formatTheme(template.platform)}
                          </span>
                        </div>
                      )}
                      
                      <div style={{
                        fontSize: '12px',
                        color: isDarkMode ? '#64748b' : '#9ca3af',
                        fontWeight: '600'
                      }}>
                        Received {new Date(template.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        alert('BUTTON CLICK EVENT FIRED!');
                        setButtonClickCount(prev => prev + 1);
                        handleSendToCreate(template);
                      }}
                      onClick={() => {
                        console.log('onClick also fired as backup');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        backgroundColor: isDarkMode ? '#10b981' : '#059669',
                        color: 'white',
                        borderRadius: '8px',
                        border: '2px solid #10b981',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        zIndex: 999
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#059669';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isDarkMode ? '#10b981' : '#059669';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <Send style={{ height: '16px', width: '16px' }} />
                      <span>Send to Create</span>
                      {buttonClickCount > 0 && (
                        <span style={{
                          marginLeft: '8px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}>
                          {buttonClickCount}
                        </span>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteTemplate(template)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Trash2 style={{ height: '14px', width: '14px' }} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TEMPLATE LIBRARY INTEGRATION HOOK
// ============================================================================

export const useTemplateLibrary = () => {
  const [loadedTemplate, setLoadedTemplate] = useState<PendingLibraryTemplate | null>(null);

  const handleLoadTemplate = (template: PendingLibraryTemplate) => {
    setLoadedTemplate(template);
  };

  const handleTemplateLoaded = () => {
    console.log('Template loaded into form');
  };

  const clearLoadedTemplate = () => {
    setLoadedTemplate(null);
  };

  return {
    loadedTemplate,
    handleLoadTemplate,
    handleTemplateLoaded,
    clearLoadedTemplate
  };
};

// Export the event emitter for direct communication between components
export { templateEventEmitter };

export default TemplateLibrary;
