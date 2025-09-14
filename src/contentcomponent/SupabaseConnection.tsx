import React, { useContext } from 'react';
import { Database, ExternalLink, CheckCircle } from 'lucide-react';

// Theme Context
const ThemeContext = React.createContext({
  isDarkMode: false,
  toggleDarkMode: () => {}
});

const useTheme = () => useContext(ThemeContext);

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
          backgroundColor: isDarkMode ? '#065f4630' : '#d1fae5',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid #10b981'
        }}>
          <CheckCircle style={{ height: '18px', width: '18px', color: '#10b981' }} />
          <span style={{
            fontSize: '12px',
            fontWeight: '600',
            color: isDarkMode ? '#34d399' : '#065f46'
          }}>
            Connected
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
          fontFamily: 'inherit'
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
