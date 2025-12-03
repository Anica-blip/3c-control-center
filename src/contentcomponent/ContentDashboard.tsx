import React, { useState, useContext } from 'react';
import { Edit3, Library, Database } from 'lucide-react';
import { EnhancedContentCreationForm } from './EnhancedContentCreationForm';
import { TemplateLibrary, PendingLibraryTemplate } from './TemplateLibrary';
import { ContentPost, CharacterProfile, SocialPlatform } from './types';

// Theme Context
const ThemeContext = React.createContext({
  isDarkMode: false,
  toggleDarkMode: () => {}
});

const useTheme = () => useContext(ThemeContext);

// Tab definitions
type TabType = 'create-new' | 'template-library' | 'supabase-database';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

// Complete Content Dashboard with Template Integration
interface ContentDashboardProps {
  onSave: (post: Omit<ContentPost, 'id' | 'createdDate'>) => void;
  onAddToSchedule: (post: Omit<ContentPost, 'id' | 'createdDate'>) => void;
  characterProfiles: CharacterProfile[];
  platforms: SocialPlatform[];
  isSaving?: boolean;
  isLoadingProfiles?: boolean;
  editingPost?: ContentPost | null;
  onEditComplete?: () => void;
}

export const ContentDashboard: React.FC<ContentDashboardProps> = ({
  onSave,
  onAddToSchedule,
  characterProfiles,
  platforms,
  isSaving,
  isLoadingProfiles,
  editingPost,
  onEditComplete
}) => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('create-new');
  
  // TEMPLATE LOADING STATE - This is the missing connection!
  const [loadedTemplate, setLoadedTemplate] = useState<PendingLibraryTemplate | null>(null);

  const tabs: Tab[] = [
    {
      id: 'create-new',
      label: 'Create New Content',
      icon: <Edit3 style={{ height: '20px', width: '20px' }} />,
      description: 'Design and prepare your social media content'
    },
    {
      id: 'template-library',
      label: 'Template Library',
      icon: <Library style={{ height: '20px', width: '20px' }} />,
      description: 'Templates forwarded from Content Template Engine'
    },
    {
      id: 'supabase-database',
      label: 'Supabase Database',
      icon: <Database style={{ height: '20px', width: '20px' }} />,
      description: 'Database status and connections'
    }
  ];

  // TEMPLATE LOADING HANDLER - This fixes the connection!
  const handleLoadTemplate = (template: PendingLibraryTemplate) => {
    console.log('=== DASHBOARD: Loading template ===');
    console.log('Template data:', template);
    
    // Set the template to be loaded
    setLoadedTemplate(template);
    
    // Switch to Create New Content tab
    setActiveTab('create-new');
    
    console.log('Dashboard: Template loaded and switched to Create New Content tab');
  };

  // Clear loaded template after it's been processed
  const handleTemplateLoaded = () => {
    console.log('Dashboard: Template has been loaded into form, clearing state');
    setLoadedTemplate(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'create-new':
        return (
          <EnhancedContentCreationForm
            onSave={onSave}
            onAddToSchedule={onAddToSchedule}
            characterProfiles={characterProfiles}
            platforms={platforms}
            isSaving={isSaving}
            isLoadingProfiles={isLoadingProfiles}
            editingPost={editingPost}
            onEditComplete={onEditComplete}
            // TEMPLATE INTEGRATION PROPS:
            loadedTemplate={loadedTemplate}
            onTemplateLoaded={handleTemplateLoaded}
          />
        );
      
      case 'template-library':
        return (
          <TemplateLibrary
            // TEMPLATE LOADING CONNECTION:
            onLoadTemplate={handleLoadTemplate}
          />
        );
      
      case 'supabase-database':
        return (
          <div style={{
            padding: '48px',
            textAlign: 'center',
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            borderRadius: '8px',
            border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`
          }}>
            <Database style={{
              height: '64px',
              width: '64px',
              color: isDarkMode ? '#60a5fa' : '#3b82f6',
              margin: '0 auto 16px auto',
              display: 'block'
            }} />
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: isDarkMode ? '#f8fafc' : '#111827',
              margin: '0 0 8px 0'
            }}>
              Supabase Database
            </h3>
            <p style={{
              color: isDarkMode ? '#94a3b8' : '#6b7280',
              fontSize: '14px',
              margin: '0'
            }}>
              Database management and monitoring features coming soon
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: isDarkMode ? '#1e293b' : 'white',
        borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
        padding: '24px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#3b82f6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '20px' }}>📝</span>
            </div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: isDarkMode ? '#f8fafc' : '#111827',
              margin: '0'
            }}>
              Content Manager
            </h1>
          </div>
          <p style={{
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            fontSize: '14px',
            margin: '0'
          }}>
            Create, manage, and schedule your social media content with ease
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        backgroundColor: isDarkMode ? '#334155' : '#f8fafc',
        padding: '20px 24px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          gap: '12px'
        }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  backgroundColor: activeTab === tab.id 
                    ? '#3b82f6'
                    : (isDarkMode ? '#475569' : '#e5e7eb'),
                  color: activeTab === tab.id 
                    ? 'white'
                    : (isDarkMode ? '#94a3b8' : '#6b7280'),
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Template Loading Indicator */}
        {loadedTemplate && activeTab === 'create-new' && (
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: isDarkMode ? '#065f4630' : '#d1fae5',
            border: `1px solid #10b981`,
            borderRadius: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Library style={{ height: '16px', width: '16px', color: '#10b981' }} />
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: isDarkMode ? '#34d399' : '#065f46'
              }}>
                Template Loaded: {loadedTemplate.content_title}
              </span>
            </div>
            <p style={{
              fontSize: '12px',
              color: isDarkMode ? '#94a3b8' : '#6b7280',
              margin: '4px 0 0 24px'
            }}>
              Template data has been loaded into the form. You can now edit and customize the content.
            </p>
          </div>
        )}

        {renderTabContent()}
      </div>
    </div>
  );
};

export default ContentDashboard;

