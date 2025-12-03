// /src/marketingcomponent/MarketingComponent.tsx - Marketing Intelligence Dashboard

import React, { useState } from 'react';
import {
  usePersonas,
  useKeywords,
  useTags,
  useChannels,
  useStrategies,
  useIntel,
  useResearchInsights,
  useAnalyticsTools
} from './hooks/useMarketingData';
import {
  getTheme,
  toggleDarkMode,
  getContainerStyle,
  getCardStyle,
  getHeaderStyle,
  getSectionTitleStyle,
  getSectionDescriptionStyle,
  getFormGridStyle,
  getInputStyle,
  getTextareaStyle,
  getSelectStyle,
  getFileInputStyle,
  getPrimaryButtonStyle,
  getSecondaryButtonStyle,
  getDangerButtonStyle,
  getIconButtonStyle,
  getTabContainerStyle,
  getTabButtonStyle,
  getTabGroupHeaderStyle,
  getTableContainerStyle,
  getTableStyle,
  getTableHeaderStyle,
  getTableCellStyle,
  getStatusBadgeStyle,
  getPriorityBadgeStyle,
  getEmptyStateStyle,
  getAnimationStyles
} from './utils/styleUtils';
import {
  TabId,
  PersonaFormState,
  KeywordFormState,
  TagFormState,
  ChannelFormState,
  StrategyFormState,
  IntelFormState,
  ResearchInsightFormState,
  AnalyticsToolFormState,
  PERSONA_OPTIONS,
  AUDIENCE_OPTIONS
} from './types';

const MarketingComponent: React.FC = () => {
  // ============================================================================
  // THEME STATE
  // ============================================================================
  const { theme, isDarkMode } = getTheme();

  // ============================================================================
  // TAB STATE
  // ============================================================================
  const [activeTab, setActiveTab] = useState<TabId>('personas');

  // Tab groups for organized navigation
  const tabGroups = [
    {
      name: 'Content Creation',
      color: '#3b82f6',
      tabs: [
        { id: 'personas' as TabId, label: 'Personas' },
        { id: 'content-tools' as TabId, label: 'Keywords & Tags' },
        { id: 'strategy' as TabId, label: 'Strategy Vault' },
        { id: 'channels' as TabId, label: 'Channels' }
      ]
    },
    {
      name: 'Intelligence & Research',
      color: '#8b5cf6',
      tabs: [
        { id: 'intel' as TabId, label: 'Marketing Intel' },
        { id: 'research' as TabId, label: 'Research Insights' }
      ]
    },
    {
      name: 'Analytics & Archives',
      color: '#10b981',
      tabs: [
        { id: 'analytics' as TabId, label: 'Analytics Tools' },
        { id: 'archives' as TabId, label: 'Caelum Archives' }
      ]
    }
  ];

  // ============================================================================
  // DATA HOOKS
  // ============================================================================
  const {
    personas,
    loading: personasLoading,
    error: personasError,
    createPersona,
    updatePersona,
    deletePersona
  } = usePersonas();

  const {
    keywords,
    loading: keywordsLoading,
    error: keywordsError,
    createKeyword,
    updateKeyword,
    deleteKeyword,
    bulkUploadKeywords
  } = useKeywords();

  const {
    tags,
    loading: tagsLoading,
    error: tagsError,
    createTag,
    updateTag,
    deleteTag
  } = useTags();

  const {
    channels,
    loading: channelsLoading,
    error: channelsError,
    createChannel,
    updateChannel,
    deleteChannel
  } = useChannels();

  const {
    strategies,
    loading: strategiesLoading,
    error: strategiesError,
    createStrategy,
    updateStrategy,
    deleteStrategy
  } = useStrategies();

  const {
    intelEntries,
    loading: intelLoading,
    error: intelError,
    uploadingAudio,
    createIntel,
    updateIntel,
    deleteIntel,
    uploadAudioFile
  } = useIntel();

  const {
    researchInsights,
    loading: researchLoading,
    error: researchError,
    createResearchInsight,
    updateResearchInsight,
    deleteResearchInsight
  } = useResearchInsights();

  const {
    analyticsTools,
    loading: analyticsLoading,
    error: analyticsError,
    createAnalyticsTool,
    updateAnalyticsTool,
    deleteAnalyticsTool
  } = useAnalyticsTools();

  // ============================================================================
  // FORM STATES
  // ============================================================================
  const [newPersona, setNewPersona] = useState<PersonaFormState>({
    name: '',
    audience_segment: '',
    user_role: '',
    description: '',
    key_messages: '',
    last_edited_by: ''
  });

  const [newKeyword, setNewKeyword] = useState<KeywordFormState>({
    keyword: '',
    category: '',
    dateAdded: new Date().toISOString().split('T')[0],
    addedBy: ''
  });

  const [newTag, setNewTag] = useState<TagFormState>({
    tag: '',
    category: 'hashtag',
    dateAdded: new Date().toISOString().split('T')[0],
    addedBy: ''
  });

  const [newChannel, setNewChannel] = useState<ChannelFormState>({
    channelName: '',
    platformType: '',
    priorityLevel: 'medium',
    priorityChangeLog: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Active'
  });

  const [newStrategy, setNewStrategy] = useState<StrategyFormState>({
    contentTitle: '',
    status: 'draft',
    aiSuggestionRating: '',
    hashtags: '',
    tags: '',
    persona: '',
    audienceSegment: ''
  });

  const [newIntel, setNewIntel] = useState<IntelFormState>({
    priorityLevel: 'medium',
    insightEntry: '',
    audioFile: null,
    audioFileUrl: '',
    audioFilename: '',
    persona: '',
    audienceSegment: ''
  });

  const [newResearchInsight, setNewResearchInsight] = useState<ResearchInsightFormState>({
    insight: '',
    persona: '',
    audienceSegment: '',
    reviewStatus: 'new',
    uploadDate: new Date().toISOString().split('T')[0]
  });

  const [newTool, setNewTool] = useState<AnalyticsToolFormState>({
    name: '',
    category: '',
    status: 'Active',
    url: '',
    notes: ''
  });

  // ============================================================================
  // EDITING STATES
  // ============================================================================
  const [editingPersona, setEditingPersona] = useState<string | null>(null);
  const [editingKeyword, setEditingKeyword] = useState<string | null>(null);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [csvUploading, setCsvUploading] = useState(false);

  // ============================================================================
  // FORM HANDLERS - PERSONAS
  // ============================================================================
  const handleAddPersona = async () => {
    if (!newPersona.name || !newPersona.audience_segment) {
      alert('Please fill in required fields: Name and Audience Segment');
      return;
    }

    try {
      await createPersona({
        name: newPersona.name,
        audience_segment: newPersona.audience_segment as 'EM' | 'NM' | 'GP',
        user_role: newPersona.user_role,
        description: newPersona.description,
        key_messages: newPersona.key_messages,
        last_edited_by: newPersona.last_edited_by
      });

      // Reset form
      setNewPersona({
        name: '',
        audience_segment: '',
        user_role: '',
        description: '',
        key_messages: '',
        last_edited_by: ''
      });
    } catch (error) {
      console.error('Failed to create persona:', error);
    }
  };

  const handleDeletePersona = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this persona?')) {
      try {
        await deletePersona(id);
      } catch (error) {
        console.error('Failed to delete persona:', error);
      }
    }
  };

  // ============================================================================
  // FORM HANDLERS - KEYWORDS
  // ============================================================================
  const handleAddKeyword = async () => {
    if (!newKeyword.keyword) {
      alert('Please enter a keyword');
      return;
    }

    try {
      await createKeyword({
        keyword: newKeyword.keyword,
        category: newKeyword.category,
        date_added: newKeyword.dateAdded,
        added_by: newKeyword.addedBy
      });

      // Reset form
      setNewKeyword({
        keyword: '',
        category: '',
        dateAdded: new Date().toISOString().split('T')[0],
        addedBy: ''
      });
    } catch (error) {
      console.error('Failed to create keyword:', error);
    }
  };

  const handleDeleteKeyword = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this keyword?')) {
      try {
        await deleteKeyword(id);
      } catch (error) {
        console.error('Failed to delete keyword:', error);
      }
    }
  };

  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvUploading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const keywordsData = lines.slice(1).map(line => {
        const [keyword, category] = line.split(',').map(s => s.trim());
        return {
          keyword,
          category,
          date_added: new Date().toISOString().split('T')[0],
          added_by: 'CSV Import'
        };
      });

      const result = await bulkUploadKeywords(keywordsData);
      alert(`Import complete: ${result.success} succeeded, ${result.failed} failed`);
    } catch (error) {
      console.error('Failed to upload CSV:', error);
      alert('Failed to import CSV');
    } finally {
      setCsvUploading(false);
      event.target.value = '';
    }
  };

  // ============================================================================
  // FORM HANDLERS - TAGS
  // ============================================================================
  const handleAddTag = async () => {
    if (!newTag.tag) {
      alert('Please enter a tag');
      return;
    }

    try {
      await createTag({
        tag: newTag.tag,
        category: newTag.category,
        date_added: newTag.dateAdded,
        added_by: newTag.addedBy
      });

      // Reset form
      setNewTag({
        tag: '',
        category: 'hashtag',
        dateAdded: new Date().toISOString().split('T')[0],
        addedBy: ''
      });
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      try {
        await deleteTag(id);
      } catch (error) {
        console.error('Failed to delete tag:', error);
      }
    }
  };

  // ============================================================================
  // FORM HANDLERS - CHANNELS
  // ============================================================================
  const handleAddChannel = async () => {
    if (!newChannel.channelName) {
      alert('Please enter a channel name');
      return;
    }

    try {
      await createChannel({
        channel_name: newChannel.channelName,
        platform_type: newChannel.platformType,
        priority_level: newChannel.priorityLevel as 'high' | 'medium' | 'low',
        priority_change_log: newChannel.priorityChangeLog,
        date: newChannel.date,
        status: newChannel.status as 'Active' | 'Inactive' | 'Paused'
      });

      // Reset form
      setNewChannel({
        channelName: '',
        platformType: '',
        priorityLevel: 'medium',
        priorityChangeLog: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Active'
      });
    } catch (error) {
      console.error('Failed to create channel:', error);
    }
  };

  const handleDeleteChannel = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this channel?')) {
      try {
        await deleteChannel(id);
      } catch (error) {
        console.error('Failed to delete channel:', error);
      }
    }
  };

  // ============================================================================
  // FORM HANDLERS - STRATEGIES
  // ============================================================================
  const handleAddStrategy = async () => {
    if (!newStrategy.contentTitle) {
      alert('Please enter a content title');
      return;
    }

    try {
      await createStrategy({
        content_title: newStrategy.contentTitle,
        status: newStrategy.status as 'draft' | 'review' | 'approved' | 'archived',
        ai_suggestion_rating: newStrategy.aiSuggestionRating ? parseFloat(newStrategy.aiSuggestionRating) : undefined,
        hashtags: newStrategy.hashtags.split(',').map(h => h.trim()),
        tags: newStrategy.tags.split(',').map(t => t.trim()),
        persona: newStrategy.persona,
        audience_segment: newStrategy.audienceSegment as 'EM' | 'NM' | 'GP'
      });

      // Reset form
      setNewStrategy({
        contentTitle: '',
        status: 'draft',
        aiSuggestionRating: '',
        hashtags: '',
        tags: '',
        persona: '',
        audienceSegment: ''
      });
    } catch (error) {
      console.error('Failed to create strategy:', error);
    }
  };

  const handleDeleteStrategy = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this strategy?')) {
      try {
        await deleteStrategy(id);
      } catch (error) {
        console.error('Failed to delete strategy:', error);
      }
    }
  };

  // ============================================================================
  // FORM HANDLERS - INTEL
  // ============================================================================
  const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadAudioFile(file);
      setNewIntel({
        ...newIntel,
        audioFile: file,
        audioFileUrl: result.url,
        audioFilename: result.filename
      });
    } catch (error) {
      console.error('Failed to upload audio:', error);
      alert('Failed to upload audio file');
    }
  };

  const handleAddIntel = async () => {
    if (!newIntel.insightEntry) {
      alert('Please enter an insight');
      return;
    }

    try {
      await createIntel({
        priority_level: newIntel.priorityLevel as 'critical' | 'high' | 'medium' | 'low',
        insight_entry: newIntel.insightEntry,
        audio_file_url: newIntel.audioFileUrl,
        audio_filename: newIntel.audioFilename,
        persona: newIntel.persona,
        audience_segment: newIntel.audienceSegment as 'EM' | 'NM' | 'GP' | undefined,
        created_by: 'Current User'
      });

      // Reset form
      setNewIntel({
        priorityLevel: 'medium',
        insightEntry: '',
        audioFile: null,
        audioFileUrl: '',
        audioFilename: '',
        persona: '',
        audienceSegment: ''
      });
    } catch (error) {
      console.error('Failed to create intel entry:', error);
    }
  };

  const handleDeleteIntel = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this intel entry?')) {
      try {
        await deleteIntel(id);
      } catch (error) {
        console.error('Failed to delete intel entry:', error);
      }
    }
  };

  // ============================================================================
  // FORM HANDLERS - RESEARCH INSIGHTS
  // ============================================================================
  const handleAddResearchInsight = async () => {
    if (!newResearchInsight.insight) {
      alert('Please enter an insight');
      return;
    }

    try {
      await createResearchInsight({
        insight: newResearchInsight.insight,
        persona: newResearchInsight.persona,
        audience_segment: newResearchInsight.audienceSegment as 'EM' | 'NM' | 'GP' | undefined,
        review_status: newResearchInsight.reviewStatus as 'new' | 'reviewed' | 'archived',
        upload_date: newResearchInsight.uploadDate
      });

      // Reset form
      setNewResearchInsight({
        insight: '',
        persona: '',
        audienceSegment: '',
        reviewStatus: 'new',
        uploadDate: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Failed to create research insight:', error);
    }
  };

  const handleDeleteResearchInsight = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this research insight?')) {
      try {
        await deleteResearchInsight(id);
      } catch (error) {
        console.error('Failed to delete research insight:', error);
      }
    }
  };

  // ============================================================================
  // FORM HANDLERS - ANALYTICS TOOLS
  // ============================================================================
  const handleAddTool = async () => {
    if (!newTool.name || !newTool.category) {
      alert('Please fill in required fields: Name and Category');
      return;
    }

    try {
      await createAnalyticsTool({
        name: newTool.name,
        category: newTool.category as 'SEO' | 'Social Media' | 'Audience Research' | 'Video Analytics' | 'Hashtag Analysis' | 'Other',
        status: newTool.status as 'Active' | 'Inactive',
        url: newTool.url,
        notes: newTool.notes
      });

      // Reset form
      setNewTool({
        name: '',
        category: '',
        status: 'Active',
        url: '',
        notes: ''
      });
    } catch (error) {
      console.error('Failed to create analytics tool:', error);
    }
  };

  const handleDeleteTool = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this tool?')) {
      try {
        await deleteAnalyticsTool(id);
      } catch (error) {
        console.error('Failed to delete tool:', error);
      }
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div style={getContainerStyle(isDarkMode)}>
      {/* Header */}
      <div style={{ 
        marginBottom: '32px' 
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '700', 
          color: theme.text, 
          margin: '0 0 8px 0' 
        }}>
          Marketing Intelligence Center
        </h1>
        <p style={{ 
          fontSize: '16px', 
          color: theme.textSecondary, 
          margin: '0' 
        }}>
          Manage personas, keywords, strategies, and analytics
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        backgroundColor: theme.headerBackground, 
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        overflowX: 'auto'
      }}>
        {tabGroups.map(group => (
          <div key={group.name}>
            <h3 style={{
              fontSize: '12px',
              fontWeight: 'bold',
              color: theme.textSecondary,
              textTransform: 'uppercase',
              marginBottom: '8px',
              letterSpacing: '0.5px'
            }}>
              {group.name}
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {group.tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: activeTab === tab.id ? group.color : theme.buttonSecondary,
                    color: activeTab === tab.id ? 'white' : theme.textSecondary,
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tab Content Container with Width Constraints */}
      <div style={{
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
        padding: '24px 20px',
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}>
      
      {/* TAB 1: PERSONAS */}
      {activeTab === 'personas' && (
        <div style={getCardStyle(isDarkMode)}>
          <div style={getHeaderStyle(isDarkMode)}>
            <h2 style={getSectionTitleStyle(isDarkMode)}>Character Personas</h2>
            <p style={getSectionDescriptionStyle(isDarkMode)}>
              Define target audience personas for content strategy
            </p>
          </div>

          {/* Add Persona Form */}
          <div style={{ marginBottom: '24px', padding: '20px', border: `1px solid ${theme.border}`, borderRadius: '8px', backgroundColor: isDarkMode ? '#111827' : '#f9fafb' }}>
            <h4 style={{ fontWeight: '600', marginBottom: '16px', fontSize: '16px', margin: '0 0 16px 0', color: theme.text }}>
              Add New Persona
            </h4>
            <div style={getFormGridStyle()}>
              <select 
                value={newPersona.name} 
                onChange={(e) => setNewPersona({...newPersona, name: e.target.value})}
                style={{...getSelectStyle(isDarkMode), color: theme.text}}
              >
                <option value="" style={{ backgroundColor: theme.background, color: theme.text }}>Select Persona</option>
                {PERSONA_OPTIONS.map(p => <option key={p} value={p} style={{ backgroundColor: theme.background, color: theme.text }}>{p}</option>)}
              </select>
              <select 
                value={newPersona.audience_segment} 
                onChange={(e) => setNewPersona({...newPersona, audience_segment: e.target.value})}
                style={{...getSelectStyle(isDarkMode), color: theme.text}}
              >
                <option value="" style={{ backgroundColor: theme.background, color: theme.text }}>Select Audience</option>
                {AUDIENCE_OPTIONS.map(a => <option key={a.value} value={a.value} style={{ backgroundColor: theme.background, color: theme.text }}>{a.label}</option>)}
              </select>
              <input 
                type="text"
                placeholder="User Role"
                value={newPersona.user_role}
                onChange={(e) => setNewPersona({...newPersona, user_role: e.target.value})}
                style={getInputStyle(isDarkMode)}
              />
              <input 
                type="text"
                placeholder="Last Edited By"
                value={newPersona.last_edited_by}
                onChange={(e) => setNewPersona({...newPersona, last_edited_by: e.target.value})}
                style={getInputStyle(isDarkMode)}
              />
            </div>
            <div style={{ marginTop: '16px' }}>
              <textarea 
                placeholder="Description"
                value={newPersona.description}
                onChange={(e) => setNewPersona({...newPersona, description: e.target.value})}
                rows={3}
                style={getTextareaStyle(isDarkMode)}
              />
            </div>
            <div style={{ marginTop: '16px' }}>
              <textarea 
                placeholder="Key Messages"
                value={newPersona.key_messages}
                onChange={(e) => setNewPersona({...newPersona, key_messages: e.target.value})}
                rows={3}
                style={getTextareaStyle(isDarkMode)}
              />
            </div>
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button 
                onClick={handleAddPersona}
                disabled={personasLoading}
                style={getPrimaryButtonStyle(isDarkMode, personasLoading)}
              >
                {personasLoading ? 'Adding...' : '+ Add Persona'}
              </button>
            </div>
          </div>

          {/* Personas List */}
          {personasError && (
            <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '16px' }}>
              Error: {personasError.message}
            </div>
          )}

          {personasLoading && personas.length === 0 ? (
            <div style={getEmptyStateStyle(isDarkMode)}>Loading personas...</div>
          ) : personas.length === 0 ? (
            <div style={getEmptyStateStyle(isDarkMode)}>No personas yet. Add your first one above!</div>
          ) : (
            <div style={getTableContainerStyle()}>
              <table style={getTableStyle()}>
                <thead>
                  <tr>
                    <th style={getTableHeaderStyle(isDarkMode)}>Name</th>
                    <th style={getTableHeaderStyle(isDarkMode)}>Audience</th>
                    <th style={getTableHeaderStyle(isDarkMode)}>Role</th>
                    <th style={getTableHeaderStyle(isDarkMode)}>Description</th>
                    <th style={getTableHeaderStyle(isDarkMode)}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {personas.map(persona => (
                    <tr key={persona.id}>
                      <td style={getTableCellStyle(isDarkMode)}>{persona.name}</td>
                      <td style={getTableCellStyle(isDarkMode)}>
                        <span style={getStatusBadgeStyle('Active', isDarkMode)}>
                          {persona.audience_segment}
                        </span>
                      </td>
                      <td style={getTableCellStyle(isDarkMode)}>{persona.user_role}</td>
                      <td style={getTableCellStyle(isDarkMode)}>{persona.description.substring(0, 50)}...</td>
                      <td style={getTableCellStyle(isDarkMode)}>
                        <button
                          onClick={() => handleDeletePersona(persona.id)}
                          style={{...getIconButtonStyle(isDarkMode), color: theme.danger}}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: KEYWORDS & TAGS */}
      {activeTab === 'content-tools' && (
        <div style={getCardStyle(isDarkMode)}>
          <div style={getHeaderStyle(isDarkMode)}>
            <h2 style={getSectionTitleStyle(isDarkMode)}>Keywords & Tags</h2>
            <p style={getSectionDescriptionStyle(isDarkMode)}>
              Manage SEO keywords and content categorization tags
            </p>
          </div>

          {/* Google Search Integration */}
          <div style={{ 
            marginBottom: '32px', 
            padding: '20px', 
            border: `2px solid ${theme.primary}`, 
            borderRadius: '12px', 
            backgroundColor: isDarkMode ? '#1e293b' : '#f0f9ff' 
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: theme.text }}>
              🔍 Google Search for Keywords & Hashtags
            </h3>
            <p style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '16px' }}>
              Search Google directly for keyword research and hashtag trends
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <a
                href="https://www.google.com/search?q=keyword+research"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '16px',
                  backgroundColor: isDarkMode ? '#334155' : 'white',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: theme.primary,
                  fontSize: '16px',
                  fontWeight: '600',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                🔎 Search Keywords on Google
              </a>
              <a
                href="https://www.google.com/search?q=trending+hashtags"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '16px',
                  backgroundColor: isDarkMode ? '#334155' : 'white',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: theme.primary,
                  fontSize: '16px',
                  fontWeight: '600',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                # Search Hashtags on Google
              </a>
            </div>
          </div>

          {/* Keywords Section */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: theme.text }}>Keywords</h3>
            
            {/* Add Keyword Form */}
            <div style={{ marginBottom: '24px', padding: '20px', border: `1px solid ${theme.border}`, borderRadius: '8px', backgroundColor: isDarkMode ? '#111827' : '#f9fafb' }}>
              <div style={getFormGridStyle()}>
                <input 
                  type="text"
                  placeholder="Keyword"
                  value={newKeyword.keyword}
                  onChange={(e) => setNewKeyword({...newKeyword, keyword: e.target.value})}
                  style={getInputStyle(isDarkMode)}
                />
                <input 
                  type="text"
                  placeholder="Category (optional)"
                  value={newKeyword.category}
                  onChange={(e) => setNewKeyword({...newKeyword, category: e.target.value})}
                  style={getInputStyle(isDarkMode)}
                />
                <input 
                  type="text"
                  placeholder="Added By"
                  value={newKeyword.addedBy}
                  onChange={(e) => setNewKeyword({...newKeyword, addedBy: e.target.value})}
                  style={getInputStyle(isDarkMode)}
                />
              </div>
              <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  disabled={csvUploading}
                  style={getFileInputStyle(isDarkMode)}
                />
                <button 
                  onClick={handleAddKeyword}
                  disabled={keywordsLoading}
                  style={getPrimaryButtonStyle(isDarkMode, keywordsLoading)}
                >
                  {keywordsLoading ? 'Adding...' : '+ Add Keyword'}
                </button>
              </div>
            </div>

            {/* Keywords List */}
            {keywords.length === 0 ? (
              <div style={getEmptyStateStyle(isDarkMode)}>No keywords yet</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {keywords.map(keyword => (
                  <div key={keyword.id} style={{
                    padding: '8px 12px',
                    backgroundColor: theme.primary,
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>{keyword.keyword}</span>
                    <button
                      onClick={() => handleDeleteKeyword(keyword.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '0',
                        lineHeight: '1'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags Section */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: theme.text }}>Tags</h3>
            
            {/* Add Tag Form */}
            <div style={{ marginBottom: '24px', padding: '20px', border: `1px solid ${theme.border}`, borderRadius: '8px', backgroundColor: isDarkMode ? '#111827' : '#f9fafb' }}>
              <div style={getFormGridStyle()}>
                <input 
                  type="text"
                  placeholder="Tag"
                  value={newTag.tag}
                  onChange={(e) => setNewTag({...newTag, tag: e.target.value})}
                  style={getInputStyle(isDarkMode)}
                />
                <select 
                  value={newTag.category} 
                  onChange={(e) => setNewTag({...newTag, category: e.target.value as 'hashtag' | 'topic' | 'campaign' | 'other'})}
                  style={{...getSelectStyle(isDarkMode), color: theme.text}}
                >
                  <option value="hashtag" style={{ backgroundColor: theme.background, color: theme.text }}>Hashtag</option>
                  <option value="topic" style={{ backgroundColor: theme.background, color: theme.text }}>Topic</option>
                  <option value="campaign" style={{ backgroundColor: theme.background, color: theme.text }}>Campaign</option>
                  <option value="other" style={{ backgroundColor: theme.background, color: theme.text }}>Other</option>
                </select>
                <input 
                  type="text"
                  placeholder="Added By"
                  value={newTag.addedBy}
                  onChange={(e) => setNewTag({...newTag, addedBy: e.target.value})}
                  style={getInputStyle(isDarkMode)}
                />
              </div>
              <div style={{ marginTop: '16px', textAlign: 'right' }}>
                <button 
                  onClick={handleAddTag}
                  disabled={tagsLoading}
                  style={getPrimaryButtonStyle(isDarkMode, tagsLoading)}
                >
                  {tagsLoading ? 'Adding...' : '+ Add Tag'}
                </button>
              </div>
            </div>

            {/* Tags List */}
            {tags.length === 0 ? (
              <div style={getEmptyStateStyle(isDarkMode)}>No tags yet</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {tags.map(tag => (
                  <div key={tag.id} style={{
                    padding: '8px 12px',
                    backgroundColor: theme.success,
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>#{tag.tag}</span>
                    <span style={{ fontSize: '10px', opacity: 0.8 }}>({tag.category})</span>
                    <button
                      onClick={() => handleDeleteTag(tag.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '0',
                        lineHeight: '1'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: STRATEGY VAULT */}
      {activeTab === 'strategy' && (
        <div style={getCardStyle(isDarkMode)}>
          <div style={getHeaderStyle(isDarkMode)}>
            <h2 style={getSectionTitleStyle(isDarkMode)}>Strategy Vault</h2>
            <p style={getSectionDescriptionStyle(isDarkMode)}>
              Store and manage content strategies and campaign plans
            </p>
          </div>

          {/* Add Strategy Form */}
          <div style={{ marginBottom: '24px', padding: '20px', border: `1px solid ${theme.border}`, borderRadius: '8px', backgroundColor: isDarkMode ? '#111827' : '#f9fafb' }}>
            <h4 style={{ fontWeight: '600', marginBottom: '16px', fontSize: '16px', margin: '0 0 16px 0', color: theme.text }}>
              Add New Strategy
            </h4>
            <div style={getFormGridStyle()}>
              <input 
                type="text"
                placeholder="Content Title"
                value={newStrategy.contentTitle}
                onChange={(e) => setNewStrategy({...newStrategy, contentTitle: e.target.value})}
                style={getInputStyle(isDarkMode)}
              />
              <select 
                value={newStrategy.status} 
                onChange={(e) => setNewStrategy({...newStrategy, status: e.target.value})}
                style={{...getSelectStyle(isDarkMode), color: theme.text}}
              >
                <option value="draft" style={{ backgroundColor: theme.background, color: theme.text }}>Draft</option>
                <option value="review" style={{ backgroundColor: theme.background, color: theme.text }}>Review</option>
                <option value="approved" style={{ backgroundColor: theme.background, color: theme.text }}>Approved</option>
                <option value="archived" style={{ backgroundColor: theme.background, color: theme.text }}>Archived</option>
              </select>
              <input 
                type="text"
                placeholder="AI Rating (1-10)"
                value={newStrategy.aiSuggestionRating}
                onChange={(e) => setNewStrategy({...newStrategy, aiSuggestionRating: e.target.value})}
                style={getInputStyle(isDarkMode)}
              />
            </div>
            <div style={{ marginTop: '16px', ...getFormGridStyle() }}>
              <input 
                type="text"
                placeholder="Hashtags (comma-separated)"
                value={newStrategy.hashtags}
                onChange={(e) => setNewStrategy({...newStrategy, hashtags: e.target.value})}
                style={getInputStyle(isDarkMode)}
              />
              <input 
                type="text"
                placeholder="Tags (comma-separated)"
                value={newStrategy.tags}
                onChange={(e) => setNewStrategy({...newStrategy, tags: e.target.value})}
                style={getInputStyle(isDarkMode)}
              />
            </div>
            <div style={{ marginTop: '16px', ...getFormGridStyle() }}>
              <select 
                value={newStrategy.persona} 
                onChange={(e) => setNewStrategy({...newStrategy, persona: e.target.value})}
                style={{...getSelectStyle(isDarkMode), color: theme.text}}
              >
                <option value="" style={{ backgroundColor: theme.background, color: theme.text }}>Select Persona</option>
                {PERSONA_OPTIONS.map(p => <option key={p} value={p} style={{ backgroundColor: theme.background, color: theme.text }}>{p}</option>)}
              </select>
              <select 
                value={newStrategy.audienceSegment} 
                onChange={(e) => setNewStrategy({...newStrategy, audienceSegment: e.target.value})}
                style={{...getSelectStyle(isDarkMode), color: theme.text}}
              >
                <option value="" style={{ backgroundColor: theme.background, color: theme.text }}>Select Audience</option>
                {AUDIENCE_OPTIONS.map(a => <option key={a.value} value={a.value} style={{ backgroundColor: theme.background, color: theme.text }}>{a.label}</option>)}
              </select>
            </div>
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button 
                onClick={handleAddStrategy}
                disabled={strategiesLoading}
                style={getPrimaryButtonStyle(isDarkMode, strategiesLoading)}
              >
                {strategiesLoading ? 'Adding...' : '+ Add Strategy'}
              </button>
            </div>
          </div>

          {/* Strategies List */}
          {strategies.length === 0 ? (
            <div style={getEmptyStateStyle(isDarkMode)}>No strategies yet</div>
          ) : (
            <div style={getTableContainerStyle()}>
              <table style={getTableStyle()}>
                <thead>
                  <tr>
                    <th style={getTableHeaderStyle(isDarkMode)}>Title</th>
                    <th style={getTableHeaderStyle(isDarkMode)}>Status</th>
                    <th style={getTableHeaderStyle(isDarkMode)}>Persona</th>
                    <th style={getTableHeaderStyle(isDarkMode)}>Audience</th>
                    <th style={getTableHeaderStyle(isDarkMode)}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {strategies.map(strategy => (
                    <tr key={strategy.id}>
                      <td style={getTableCellStyle(isDarkMode)}>{strategy.content_title}</td>
                      <td style={getTableCellStyle(isDarkMode)}>
                        <span style={getStatusBadgeStyle(strategy.status, isDarkMode)}>
                          {strategy.status}
                        </span>
                      </td>
                      <td style={getTableCellStyle(isDarkMode)}>{strategy.persona}</td>
                      <td style={getTableCellStyle(isDarkMode)}>{strategy.audience_segment}</td>
                      <td style={getTableCellStyle(isDarkMode)}>
                        <button
                          onClick={() => handleDeleteStrategy(strategy.id)}
                          style={{...getIconButtonStyle(isDarkMode), color: theme.danger}}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CHANNELS */}
      {activeTab === 'channels' && (
        <div style={getCardStyle(isDarkMode)}>
          <div style={getHeaderStyle(isDarkMode)}>
            <h2 style={getSectionTitleStyle(isDarkMode)}>Distribution Channels</h2>
            <p style={getSectionDescriptionStyle(isDarkMode)}>
              Manage content distribution platforms and channels
            </p>
          </div>

          {/* Add Channel Form */}
          <div style={{ marginBottom: '24px', padding: '20px', border: `1px solid ${theme.border}`, borderRadius: '8px', backgroundColor: isDarkMode ? '#111827' : '#f9fafb' }}>
            <h4 style={{ fontWeight: '600', marginBottom: '16px', fontSize: '16px', margin: '0 0 16px 0', color: theme.text }}>
              Add New Channel
            </h4>
            <div style={getFormGridStyle()}>
              <input 
                type="text"
                placeholder="Channel Name"
                value={newChannel.channelName}
                onChange={(e) => setNewChannel({...newChannel, channelName: e.target.value})}
                style={getInputStyle(isDarkMode)}
              />
              <input 
                type="text"
                placeholder="Platform Type"
                value={newChannel.platformType}
                onChange={(e) => setNewChannel({...newChannel, platformType: e.target.value})}
                style={getInputStyle(isDarkMode)}
              />
              <select 
                value={newChannel.priorityLevel} 
                onChange={(e) => setNewChannel({...newChannel, priorityLevel: e.target.value as 'high' | 'medium' | 'low'})}
                style={{...getSelectStyle(isDarkMode), color: theme.text}}
              >
                <option value="high" style={{ backgroundColor: theme.background, color: theme.text }}>High Priority</option>
                <option value="medium" style={{ backgroundColor: theme.background, color: theme.text }}>Medium Priority</option>
                <option value="low" style={{ backgroundColor: theme.background, color: theme.text }}>Low Priority</option>
              </select>
              <select 
                value={newChannel.status} 
                onChange={(e) => setNewChannel({...newChannel, status: e.target.value as 'Active' | 'Inactive' | 'Paused'})}
                style={{...getSelectStyle(isDarkMode), color: theme.text}}
              >
                <option value="Active" style={{ backgroundColor: theme.background, color: theme.text }}>Active</option>
                <option value="Inactive" style={{ backgroundColor: theme.background, color: theme.text }}>Inactive</option>
                <option value="Paused" style={{ backgroundColor: theme.background, color: theme.text }}>Paused</option>
              </select>
            </div>
            <div style={{ marginTop: '16px' }}>
              <textarea 
                placeholder="Priority Change Log"
                value={newChannel.priorityChangeLog}
                onChange={(e) => setNewChannel({...newChannel, priorityChangeLog: e.target.value})}
                rows={2}
                style={getTextareaStyle(isDarkMode)}
              />
            </div>
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button 
                onClick={handleAddChannel}
                disabled={channelsLoading}
                style={getPrimaryButtonStyle(isDarkMode, channelsLoading)}
              >
                {channelsLoading ? 'Adding...' : '+ Add Channel'}
              </button>
            </div>
          </div>

          {/* Channels List */}
          {channels.length === 0 ? (
            <div style={getEmptyStateStyle(isDarkMode)}>No channels yet</div>
          ) : (
            <div style={getTableContainerStyle()}>
              <table style={getTableStyle()}>
                <thead>
                  <tr>
                    <th style={getTableHeaderStyle(isDarkMode)}>Channel Name</th>
                    <th style={getTableHeaderStyle(isDarkMode)}>Platform</th>
                    <th style={getTableHeaderStyle(isDarkMode)}>Priority</th>
                    <th style={getTableHeaderStyle(isDarkMode)}>Status</th>
                    <th style={getTableHeaderStyle(isDarkMode)}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {channels.map(channel => (
                    <tr key={channel.id}>
                      <td style={getTableCellStyle(isDarkMode)}>{channel.channel_name}</td>
                      <td style={getTableCellStyle(isDarkMode)}>{channel.platform_type}</td>
                      <td style={getTableCellStyle(isDarkMode)}>
                        <span style={getPriorityBadgeStyle(channel.priority_level, isDarkMode)}>
                          {channel.priority_level}
                        </span>
                      </td>
                      <td style={getTableCellStyle(isDarkMode)}>
                        <span style={getStatusBadgeStyle(channel.status, isDarkMode)}>
                          {channel.status}
                        </span>
                      </td>
                      <td style={getTableCellStyle(isDarkMode)}>
                        <button
                          onClick={() => handleDeleteChannel(channel.id)}
                          style={{...getIconButtonStyle(isDarkMode), color: theme.danger}}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: MARKETING INTEL */}
      {activeTab === 'intel' && (
        <div style={getCardStyle(isDarkMode)}>
          <div style={getHeaderStyle(isDarkMode)}>
            <h2 style={getSectionTitleStyle(isDarkMode)}>Marketing Intelligence</h2>
            <p style={getSectionDescriptionStyle(isDarkMode)}>
              Capture insights, voice notes, and strategic intelligence
            </p>
          </div>

          {/* Add Intel Form */}
          <div style={{ marginBottom: '24px', padding: '20px', border: `1px solid ${theme.border}`, borderRadius: '8px', backgroundColor: isDarkMode ? '#111827' : '#f9fafb' }}>
            <h4 style={{ fontWeight: '600', marginBottom: '16px', fontSize: '16px', margin: '0 0 16px 0', color: theme.text }}>
              Add Intelligence Entry
            </h4>
            <div style={getFormGridStyle()}>
              <select 
                value={newIntel.priorityLevel} 
                onChange={(e) => setNewIntel({...newIntel, priorityLevel: e.target.value})}
                style={{...getSelectStyle(isDarkMode), color: theme.text}}
              >
                <option value="critical" style={{ backgroundColor: theme.background, color: theme.text }}>Critical</option>
                <option value="high" style={{ backgroundColor: theme.background, color: theme.text }}>High</option>
                <option value="medium" style={{ backgroundColor: theme.background, color: theme.text }}>Medium</option>
                <option value="low" style={{ backgroundColor: theme.background, color: theme.text }}>Low</option>
              </select>
              <select 
                value={newIntel.persona} 
                onChange={(e) => setNewIntel({...newIntel, persona: e.target.value})}
                style={{...getSelectStyle(isDarkMode), color: theme.text}}
              >
                <option value="" style={{ backgroundColor: theme.background, color: theme.text }}>Select Persona (optional)</option>
                {PERSONA_OPTIONS.map(p => <option key={p} value={p} style={{ backgroundColor: theme.background, color: theme.text }}>{p}</option>)}
              </select>
              <select 
                value={newIntel.audienceSegment} 
                onChange={(e) => setNewIntel({...newIntel, audienceSegment: e.target.value})}
                style={{...getSelectStyle(isDarkMode), color: theme.text}}
              >
                <option value="" style={{ backgroundColor: theme.background, color: theme.text }}>Select Audience (optional)</option>
                {AUDIENCE_OPTIONS.map(a => <option key={a.value} value={a.value} style={{ backgroundColor: theme.background, color: theme.text }}>{a.label}</option>)}
              </select>
            </div>
            <div style={{ marginTop: '16px' }}>
              <textarea 
                placeholder="Insight Entry"
                value={newIntel.insightEntry}
                onChange={(e) => setNewIntel({...newIntel, insightEntry: e.target.value})}
                rows={4}
                style={getTextareaStyle(isDarkMode)}
              />
            </div>
            <div style={{ marginTop: '16px' }}>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                disabled={uploadingAudio}
                style={getFileInputStyle(isDarkMode)}
              />
              {uploadingAudio && <p style={{ color: theme.textSecondary, marginTop: '8px' }}>Uploading audio...</p>}
              {newIntel.audioFilename && <p style={{ color: theme.success, marginTop: '8px' }}>✓ Audio uploaded</p>}
            </div>
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button 
                onClick={handleAddIntel}
                disabled={intelLoading || uploadingAudio}
                style={getPrimaryButtonStyle(isDarkMode, intelLoading || uploadingAudio)}
              >
                {intelLoading ? 'Adding...' : '+ Add Intel Entry'}
              </button>
            </div>
          </div>

          {/* Intel List */}
          {intelEntries.length === 0 ? (
            <div style={getEmptyStateStyle(isDarkMode)}>No intel entries yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {intelEntries.map(intel => (
                <div key={intel.id} style={{
                  padding: '16px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={getPriorityBadgeStyle(intel.priority_level, isDarkMode)}>
                      {intel.priority_level}
                    </span>
                    <button
                      onClick={() => handleDeleteIntel(intel.id)}
                      style={{...getIconButtonStyle(isDarkMode), color: theme.danger}}
                    >
                      Delete
                    </button>
                  </div>
                  <p style={{ color: theme.text, marginBottom: '8px' }}>{intel.insight_entry}</p>
                  {intel.audio_file_url && (
                    <audio controls style={{ width: '100%', marginTop: '12px' }}>
                      <source src={intel.audio_file_url} />
                    </audio>
                  )}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px', fontSize: '12px', color: theme.textSecondary }}>
                    {intel.persona && <span>Persona: {intel.persona}</span>}
                    {intel.audience_segment && <span>Audience: {intel.audience_segment}</span>}
                    <span>By: {intel.created_by}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: RESEARCH INSIGHTS */}
      {activeTab === 'research' && (
        <div style={getCardStyle(isDarkMode)}>
          <div style={getHeaderStyle(isDarkMode)}>
            <h2 style={getSectionTitleStyle(isDarkMode)}>Research Insights</h2>
            <p style={getSectionDescriptionStyle(isDarkMode)}>
              Store research findings and audience insights
            </p>
          </div>

          {/* SparkToro Research Board */}
          <div style={{ 
            marginBottom: '32px', 
            padding: '20px', 
            border: `2px solid #8b5cf6`, 
            borderRadius: '12px', 
            backgroundColor: isDarkMode ? '#1e1b4b' : '#faf5ff' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0', color: theme.text }}>
                  🎯 SparkToro Research Board
                </h3>
                <p style={{ fontSize: '14px', color: theme.textSecondary, margin: '0' }}>
                  Audience intelligence and research from SparkToro
                </p>
              </div>
              <a
                href="https://sparktoro.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Open SparkToro →
              </a>
            </div>

            {/* SparkToro Entry Form */}
            <div style={{ 
              marginTop: '16px',
              padding: '16px', 
              backgroundColor: isDarkMode ? '#0f172a' : 'white',
              borderRadius: '8px',
              border: `1px solid ${theme.border}`
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: theme.text }}>
                Add SparkToro Research Entry
              </h4>
              <div style={{ display: 'grid', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Research Topic (e.g., 'Tech Content Creators')"
                  style={getInputStyle(isDarkMode)}
                />
                <textarea
                  placeholder="Key Findings from SparkToro..."
                  rows={3}
                  style={getTextareaStyle(isDarkMode)}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <input
                    type="text"
                    placeholder="Audience Size"
                    style={getInputStyle(isDarkMode)}
                  />
                  <input
                    type="text"
                    placeholder="Source URL (optional)"
                    style={getInputStyle(isDarkMode)}
                  />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <button
                    style={{
                      ...getPrimaryButtonStyle(isDarkMode, false),
                      backgroundColor: '#8b5cf6'
                    }}
                  >
                    + Add Research Entry
                  </button>
                </div>
              </div>
            </div>

            {/* SparkToro Entries List */}
            <div style={{ marginTop: '16px' }}>
              <div style={getEmptyStateStyle(isDarkMode)}>
                <p style={{ margin: '0', color: theme.textSecondary }}>
                  No SparkToro research entries yet. Add your audience research findings above.
                </p>
              </div>
            </div>
          </div>

          {/* Add Research Insight Form */}
          <div style={{ marginBottom: '24px', padding: '20px', border: `1px solid ${theme.border}`, borderRadius: '8px', backgroundColor: isDarkMode ? '#111827' : '#f9fafb' }}>
            <h4 style={{ fontWeight: '600', marginBottom: '16px', fontSize: '16px', margin: '0 0 16px 0', color: theme.text }}>
              Add Research Insight
            </h4>
            <div style={getFormGridStyle()}>
              <select 
                value={newResearchInsight.persona} 
                onChange={(e) => setNewResearchInsight({...newResearchInsight, persona: e.target.value})}
                style={{...getSelectStyle(isDarkMode), color: theme.text}}
              >
                <option value="" style={{ backgroundColor: theme.background, color: theme.text }}>Select Persona (optional)</option>
                {PERSONA_OPTIONS.map(p => <option key={p} value={p} style={{ backgroundColor: theme.background, color: theme.text }}>{p}</option>)}
              </select>
              <select 
                value={newResearchInsight.audienceSegment} 
                onChange={(e) => setNewResearchInsight({...newResearchInsight, audienceSegment: e.target.value})}
                style={{...getSelectStyle(isDarkMode), color: theme.text}}
              >
                <option value="" style={{ backgroundColor: theme.background, color: theme.text }}>Select Audience (optional)</option>
                {AUDIENCE_OPTIONS.map(a => <option key={a.value} value={a.value} style={{ backgroundColor: theme.background, color: theme.text }}>{a.label}</option>)}
              </select>
              <select 
                value={newResearchInsight.reviewStatus} 
                onChange={(e) => setNewResearchInsight({...newResearchInsight, reviewStatus: e.target.value as 'new' | 'reviewed' | 'archived'})}
                style={{...getSelectStyle(isDarkMode), color: theme.text}}
              >
                <option value="new" style={{ backgroundColor: theme.background, color: theme.text }}>New</option>
                <option value="reviewed" style={{ backgroundColor: theme.background, color: theme.text }}>Reviewed</option>
                <option value="archived" style={{ backgroundColor: theme.background, color: theme.text }}>Archived</option>
              </select>
            </div>
            <div style={{ marginTop: '16px' }}>
              <textarea 
                placeholder="Research Insight"
                value={newResearchInsight.insight}
                onChange={(e) => setNewResearchInsight({...newResearchInsight, insight: e.target.value})}
                rows={4}
                style={getTextareaStyle(isDarkMode)}
              />
            </div>
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button 
                onClick={handleAddResearchInsight}
                disabled={researchLoading}
                style={getPrimaryButtonStyle(isDarkMode, researchLoading)}
              >
                {researchLoading ? 'Adding...' : '+ Add Insight'}
              </button>
            </div>
          </div>

          {/* Research Insights List */}
          {researchInsights.length === 0 ? (
            <div style={getEmptyStateStyle(isDarkMode)}>No research insights yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {researchInsights.map(insight => (
                <div key={insight.id} style={{
                  padding: '16px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={getStatusBadgeStyle(insight.review_status, isDarkMode)}>
                      {insight.review_status}
                    </span>
                    <button
                      onClick={() => handleDeleteResearchInsight(insight.id)}
                      style={{...getIconButtonStyle(isDarkMode), color: theme.danger}}
                    >
                      Delete
                    </button>
                  </div>
                  <p style={{ color: theme.text, marginBottom: '8px' }}>{insight.insight}</p>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px', fontSize: '12px', color: theme.textSecondary }}>
                    {insight.persona && <span>Persona: {insight.persona}</span>}
                    {insight.audience_segment && <span>Audience: {insight.audience_segment}</span>}
                    <span>Date: {new Date(insight.upload_date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 7: ANALYTICS TOOLS */}
      {activeTab === 'analytics' && (
        <div style={getCardStyle(isDarkMode)}>
          <div style={getHeaderStyle(isDarkMode)}>
            <h2 style={getSectionTitleStyle(isDarkMode)}>Analytics & Research Tools</h2>
            <p style={getSectionDescriptionStyle(isDarkMode)}>
              Manage external analytics and research tools
            </p>
          </div>

          {/* Add Tool Form */}
          <div style={{ marginBottom: '24px', padding: '20px', border: `1px solid ${theme.border}`, borderRadius: '8px', backgroundColor: isDarkMode ? '#111827' : '#f9fafb' }}>
            <h4 style={{ fontWeight: '600', marginBottom: '16px', fontSize: '16px', margin: '0 0 16px 0', color: theme.text }}>
              Add New Tool
            </h4>
            <div style={getFormGridStyle()}>
              <input 
                type="text"
                placeholder="Tool name"
                value={newTool.name}
                onChange={(e) => setNewTool({...newTool, name: e.target.value})}
                style={getInputStyle(isDarkMode)}
              />
              <select 
                value={newTool.category} 
                onChange={(e) => setNewTool({...newTool, category: e.target.value})}
                style={{...getSelectStyle(isDarkMode), color: theme.text}}
              >
                <option value="" style={{ backgroundColor: theme.background, color: theme.text }}>Select category</option>
                <option value="SEO" style={{ backgroundColor: theme.background, color: theme.text }}>SEO</option>
                <option value="Social Media" style={{ backgroundColor: theme.background, color: theme.text }}>Social Media</option>
                <option value="Audience Research" style={{ backgroundColor: theme.background, color: theme.text }}>Audience Research</option>
                <option value="Video Analytics" style={{ backgroundColor: theme.background, color: theme.text }}>Video Analytics</option>
                <option value="Hashtag Analysis" style={{ backgroundColor: theme.background, color: theme.text }}>Hashtag Analysis</option>
                <option value="Other" style={{ backgroundColor: theme.background, color: theme.text }}>Other</option>
              </select>
            </div>
            <div style={{ marginTop: '16px', ...getFormGridStyle() }}>
              <input 
                type="text"
                placeholder="Tool URL"
                value={newTool.url}
                onChange={(e) => setNewTool({...newTool, url: e.target.value})}
                style={getInputStyle(isDarkMode)}
              />
              <select 
                value={newTool.status} 
                onChange={(e) => setNewTool({...newTool, status: e.target.value as 'Active' | 'Inactive'})}
                style={{...getSelectStyle(isDarkMode), color: theme.text}}
              >
                <option value="Active" style={{ backgroundColor: theme.background, color: theme.text }}>Active</option>
                <option value="Inactive" style={{ backgroundColor: theme.background, color: theme.text }}>Inactive</option>
              </select>
            </div>
            <div style={{ marginTop: '16px' }}>
              <textarea 
                placeholder="Notes and setup instructions"
                value={newTool.notes}
                onChange={(e) => setNewTool({...newTool, notes: e.target.value})}
                rows={3}
                style={getTextareaStyle(isDarkMode)}
              />
            </div>
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button 
                onClick={handleAddTool}
                disabled={analyticsLoading}
                style={getPrimaryButtonStyle(isDarkMode, analyticsLoading)}
              >
                {analyticsLoading ? 'Adding...' : '+ Add Tool'}
              </button>
            </div>
          </div>

          {/* Tools List */}
          {analyticsTools.length === 0 ? (
            <div style={getEmptyStateStyle(isDarkMode)}>No tools yet</div>
          ) : (
            <div style={getTableContainerStyle()}>
              <table style={getTableStyle()}>
                <thead>
                  <tr>
                    <th style={getTableHeaderStyle(isDarkMode)}>Tool Name</th>
                    <th style={getTableHeaderStyle(isDarkMode)}>Category</th>
                    <th style={getTableHeaderStyle(isDarkMode)}>Status</th>
                    <th style={getTableHeaderStyle(isDarkMode)}>Access</th>
                    <th style={getTableHeaderStyle(isDarkMode)}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsTools.map(tool => (
                    <tr key={tool.id}>
                      <td style={getTableCellStyle(isDarkMode)}>{tool.name}</td>
                      <td style={getTableCellStyle(isDarkMode)}>{tool.category}</td>
                      <td style={getTableCellStyle(isDarkMode)}>
                        <span style={getStatusBadgeStyle(tool.status, isDarkMode)}>
                          {tool.status}
                        </span>
                      </td>
                      <td style={getTableCellStyle(isDarkMode)}>
                        {tool.url && (
                          <a 
                            href={tool.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ color: theme.primary, textDecoration: 'none' }}
                          >
                            Open Tool
                          </a>
                        )}
                      </td>
                      <td style={getTableCellStyle(isDarkMode)}>
                        <button
                          onClick={() => handleDeleteTool(tool.id)}
                          style={{...getIconButtonStyle(isDarkMode), color: theme.danger}}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 8: ARCHIVES */}
      {activeTab === 'archives' && (
        <div style={getCardStyle(isDarkMode)}>
          <div style={getHeaderStyle(isDarkMode)}>
            <h2 style={getSectionTitleStyle(isDarkMode)}>Caelum Archives</h2>
            <p style={getSectionDescriptionStyle(isDarkMode)}>
              Archived content with search and restore functionality
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <input 
              type="text"
              placeholder="Search archived items..." 
              style={getInputStyle(isDarkMode)}
            />
          </div>

          <div style={getEmptyStateStyle(isDarkMode)}>
            <p style={{ color: theme.textSecondary, textAlign: 'center', fontSize: '16px', margin: '0' }}>
              No archived items yet
            </p>
          </div>
        </div>
      )}

      </div> {/* End Tab Content Container */}

      {/* CSS Animations */}
      <style>{getAnimationStyles()}</style>
    </div>
  );
};

export default MarketingComponent;
