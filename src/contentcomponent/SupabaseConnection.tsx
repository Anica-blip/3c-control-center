import React, { useContext } from 'react';
import { Database, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { isSupabaseConfigured, supabaseAPI } from './supabaseAPI';

// Theme Context
const ThemeContext = React.createContext({
  isDarkMode: false,
  toggleDarkMode: () => {}
});

const useTheme = () => useContext(ThemeContext);

// Supabase Connection Component - UI ONLY
export const SupabaseConnection: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  return (
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
            Supabase Database
          </h3>
          <p style={{
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            margin: '0',
            fontSize: '14px'
          }}>
            Manage your content data storage and connectivity
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: isSupabaseConfigured() 
            ? (isDarkMode ? '#065f4630' : '#d1fae5')
            : (isDarkMode ? '#7f1d1d30' : '#fecaca'),
          padding: '8px 12px',
          borderRadius: '8px',
          border: `1px solid ${isSupabaseConfigured() ? '#10b981' : '#ef4444'}`
        }}>
          {isSupabaseConfigured() ? (
            <CheckCircle style={{ height: '18px', width: '18px', color: '#10b981' }} />
          ) : (
            <AlertCircle style={{ height: '18px', width: '18px', color: '#ef4444' }} />
          )}
          <span style={{
            fontSize: '12px',
            fontWeight: '600',
            color: isSupabaseConfigured() 
              ? (isDarkMode ? '#34d399' : '#065f46')
              : (isDarkMode ? '#fca5a5' : '#991b1b')
          }}>
            {isSupabaseConfigured() ? 'Connected' : 'Not Connected'}
          </span>
        </div>
      </div>
      
      <div style={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' 
          : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        borderRadius: '8px',
        padding: '16px',
        border: `1px solid ${isDarkMode ? '#1e40af' : '#3b82f6'}`,
        marginBottom: '16px'
      }}>
        <p style={{
          color: isDarkMode ? '#bfdbfe' : '#1e40af',
          fontSize: '14px',
          lineHeight: '1.6',
          margin: '0'
        }}>
          Content posts, media files, character profiles, and platform configurations are stored in Supabase. All data is encrypted and backed up automatically.
        </p>
      </div>

      {/* Database Tables Status */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
        borderRadius: '8px',
        border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`
      }}>
        <h4 style={{
          fontSize: '14px',
          fontWeight: '600',
          color: isDarkMode ? '#f8fafc' : '#111827',
          margin: '0 0 12px 0'
        }}>
          Required Database Tables
        </h4>
        <div style={{
          display: 'grid',
          gap: '8px'
        }}>
          {[
            { name: 'content_posts', description: 'Stores all created content posts' },
            { name: 'character_profiles', description: 'User-defined posting personas' },
            { name: 'social_platforms', description: 'Platform configurations' },
            { name: 'content-media', description: 'Storage bucket for media files' }
          ].map((table) => (
            <div key={table.name} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              backgroundColor: isDarkMode ? '#1e293b' : 'white',
              borderRadius: '6px',
              border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isSupabaseConfigured() ? '#10b981' : '#94a3b8'
              }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: isDarkMode ? '#f8fafc' : '#111827',
                  fontFamily: 'monospace'
                }}>
                  {table.name}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: isDarkMode ? '#94a3b8' : '#6b7280'
                }}>
                  {table.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          background: isDarkMode 
            ? 'linear-gradient(135deg, #1f2937 0%, #374151 100%)' 
            : 'linear-gradient(135deg, #111827 0%, #374151 100%)',
          color: 'white',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          fontFamily: 'inherit',
          marginTop: '16px'
        }}
        onClick={() => window.open('https://supabase.com/dashboard/project/uqyqpwhkzlhqxcqajhkn/database/schemas', '_blank')}
      >
        <Database style={{ height: '16px', width: '16px' }} />
        <span>Open Supabase Project</span>
        <ExternalLink style={{ height: '14px', width: '14px' }} />
      </button>
    </div>
  );
};

export { supabaseAPI };
export default SupabaseConnection;
