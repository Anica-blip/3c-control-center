import React, { useState, useEffect } from 'react';
import { personasAPI, keywordsAPI, tagsAPI } from '../supabase/config';

// Import Inter font
const fontStyle = {
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

// Define global persona and audience options
const PERSONA_OPTIONS = ['Falcon', 'Panther', 'Wolf', 'Lion'];
const AUDIENCE_OPTIONS = [
  { value: 'EM', label: 'Existing Member (EM)' },
  { value: 'NM', label: 'New Member (NM)' },
  { value: 'GP', label: 'General Public (GP)' }
];

const MarketingComponent = () => {
  const [activeTab, setActiveTab] = useState('personas');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  // State for all sections
  const [personas, setPersonas] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [tags, setTags] = useState([]);
  const [channels, setChannels] = useState([]);
  const [trends, setTrends] = useState({ tracked: 247, flagged: 18, commercialIntent: 68 });
  const [strategies, setStrategies] = useState([]);
  const [intelEntries, setIntelEntries] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [archives, setArchives] = useState([]);
  const [researchInsights, setResearchInsights] = useState([]);
  
  // Loading and error states for Supabase operations
  const [loading, setLoading] = useState(false);
  const [keywordsLoading, setKeywordsLoading] = useState(false);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingPersona, setEditingPersona] = useState(null);
  const [editingKeyword, setEditingKeyword] = useState(null);
  const [editingTag, setEditingTag] = useState(null);
  const [csvUploading, setCsvUploading] = useState(false);
  
  const [analyticsTools, setAnalyticsTools] = useState([
    {
      id: 1,
      name: "Matomo (Piwik)",
      category: "SEO / Web Analytics",
      status: "Active",
      url: "https://matomo.org/",
      notes: "Open-source Google Analytics alternative"
    },
    {
      id: 2,
      name: "Plausible Analytics",
      category: "SEO / Web Analytics", 
      status: "Active",
      url: "https://plausible.io/",
      notes: "Lightweight, privacy-focused analytics"
    },
    {
      id: 3,
      name: "Google Search Console",
      category: "SEO",
      status: "Active",
      url: "https://search.google.com/search-console",
      notes: "Must-have for SEO data"
    },
    {
      id: 4,
      name: "SparkToro",
      category: "Audience Research",
      status: "Active",
      url: "https://sparktoro.com/audience",
      notes: "Great for audience insights"
    }
  ]);

  // Form states - Updated to match database fields
  const [newPersona, setNewPersona] = useState({
    name: '',
    audience_segment: '',
    user_role: '',
    description: '',
    key_messages: '',
    last_edited_by: ''
  });

  const [newKeyword, setNewKeyword] = useState({
    keyword: '',
    dateAdded: new Date().toISOString().split('T')[0],
    addedBy: ''
  });

  const [newTag, setNewTag] = useState({
    tag: '',
    category: 'hashtag',
    dateAdded: new Date().toISOString().split('T')[0],
    addedBy: ''
  });

  const [newChannel, setNewChannel] = useState({
    channelName: '',
    priorityChangeLog: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Active'
  });

  const [newStrategy, setNewStrategy] = useState({
    contentTitle: '',
    status: '',
    aiSuggestionRating: '',
    hashtags: '',
    tags: '',
    persona: '',
    audienceSegment: ''
  });

  const [newIntel, setNewIntel] = useState({
    priorityLevel: '',
    insightEntry: '',
    audioFile: null,
    persona: '',
    audienceSegment: ''
  });

  const [newResearchInsight, setNewResearchInsight] = useState({
    insight: '',
    persona: '',
    audienceSegment: '',
    reviewStatus: 'new',
    uploadDate: new Date().toISOString().split('T')[0]
  });

  const [newTool, setNewTool] = useState({
    name: '',
    category: '',
    status: 'Active',
    url: '',
    notes: ''
  });

  // Load personas, keywords, and tags on component mount
  useEffect(() => {
    loadPersonas();
    loadKeywords();
    loadTags();
  }, []);

  const loadPersonas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await personasAPI.fetchPersonas();
      setPersonas(data);
    } catch (err) {
      setError('Failed to load personas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadKeywords = async () => {
    try {
      setKeywordsLoading(true);
      setError(null);
      const data = await keywordsAPI.fetchKeywords();
      setKeywords(data);
    } catch (err) {
      setError('Failed to load keywords: ' + err.message);
    } finally {
      setKeywordsLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      setTagsLoading(true);
      setError(null);
      const data = await tagsAPI.fetchTags();
      setTags(data);
    } catch (err) {
      setError('Failed to load tags: ' + err.message);
    } finally {
      setTagsLoading(false);
    }
  };

  // Tab definitions organized by workflow groups
  const tabGroups = [
    {
      name: 'Content Creation',
      color: '#3b82f6', // Blue
      tabs: [
        { id: 'personas', label: 'Personas' },
        { id: 'content-tools', label: 'Keywords & Tags' },
        { id: 'strategy', label: 'Strategy Vault' },
        { id: 'channels', label: 'Channels' }
      ]
    },
    {
      name: 'Analytics & Research', 
      color: '#10b981', // Green
      tabs: [
        { id: 'trends', label: 'Search Trends' },
        { id: 'analytics', label: 'Insights Panel' },
        { id: 'intel', label: 'Intel Drop' }
      ]
    },
    {
      name: 'Management',
      color: '#8b5cf6', // Purple
      tabs: [
        { id: 'archives', label: 'Archives' }
      ]
    }
  ];

  const allTabs = tabGroups.flatMap(group => 
    group.tabs.map(tab => ({
      ...tab,
      groupColor: group.color,
      groupName: group.name
    }))
  );

  // Styles (updated with Inter font and improved dark mode)
  const containerStyle = {
    ...fontStyle,
    padding: '20px',
    minHeight: '100vh',
    backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
    color: isDarkMode ? '#f9fafb' : '#111827'
  };

  const tabsContainerStyle = {
    borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    borderRadius: '8px 8px 0 0',
    marginBottom: '24px',
    boxShadow: isDarkMode 
      ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
      : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  const getTabStyle = (tab) => ({
    padding: '12px 16px',
    borderBottom: activeTab === tab.id ? `3px solid ${tab.groupColor}` : '3px solid transparent',
    borderTop: activeTab === tab.id ? `2px solid ${tab.groupColor}` : '2px solid transparent',
    fontWeight: activeTab === tab.id ? '600' : '500',
    fontSize: '13px',
    color: activeTab === tab.id ? tab.groupColor : (isDarkMode ? '#d1d5db' : '#6b7280'),
    backgroundColor: activeTab === tab.id ? (isDarkMode ? '#374151' : '#f8fafc') : 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderRadius: '6px 6px 0 0',
    margin: '0 2px',
    position: 'relative'
  });

  const cardStyle = {
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: isDarkMode 
      ? '0 10px 25px -3px rgba(0, 0, 0, 0.3)' 
      : '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
  };

  const sectionTitleStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: isDarkMode ? '#f9fafb' : '#111827'
  };

  const inputStyle = {
    width: '90%',
    padding: '12px 16px',
    border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
    color: isDarkMode ? '#f9fafb' : '#1f2937',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    fontFamily: 'inherit'
  };

  const selectStyle = {
    ...inputStyle,
    width: '100%',
    appearance: 'none',
    backgroundImage: isDarkMode 
      ? `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`
      : `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 12px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '16px',
    paddingRight: '48px'
  };

  const textareaStyle = {
    ...inputStyle,
    resize: 'vertical',
    fontFamily: 'inherit'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: isDarkMode ? '#f9fafb' : '#374151',
    fontSize: '14px',
    fontFamily: 'inherit'
  };

  const buttonStyle = {
    padding: '12px 20px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: isDarkMode ? '#4b5563' : '#f3f4f6',
    color: isDarkMode ? '#f9fafb' : '#374151',
    border: `1px solid ${isDarkMode ? '#6b7280' : '#d1d5db'}`
  };

  const smallButtonStyle = {
    padding: '8px 12px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: isDarkMode ? '#4b5563' : '#e5e7eb',
    color: isDarkMode ? '#f9fafb' : '#374151',
    fontFamily: 'inherit'
  };

  const formGridStyle = {
    display: 'grid',
    gap: '20px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
  };

  const statsCardStyle = {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: isDarkMode ? '#111827' : '#ffffff',
    borderRadius: '12px',
    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    boxShadow: isDarkMode 
      ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
      : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  const emptyStateStyle = {
    padding: '48px',
    textAlign: 'center',
    backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
    borderRadius: '12px',
    border: `2px dashed ${isDarkMode ? '#4b5563' : '#d1d5db'}`
  };

  // CRUD Functions - Real Supabase Database Operations
  const addPersona = async () => {
    if (!newPersona.name || !newPersona.audience_segment) {
      setError('Persona name and audience segment are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await personasAPI.insertPersona(newPersona);
      setPersonas([data, ...personas]);
      resetPersonaForm();
    } catch (err) {
      setError('Failed to add persona: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const editPersona = (persona) => {
    setEditingPersona(persona);
    setNewPersona({
      name: persona.name,
      audience_segment: persona.audience_segment,
      user_role: persona.user_role || '',
      description: persona.description || '',
      key_messages: persona.key_messages || '',
      last_edited_by: persona.last_edited_by || ''
    });
  };

  const updatePersona = async () => {
    if (!editingPersona || !newPersona.name || !newPersona.audience_segment) {
      setError('Persona name and audience segment are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const updatedData = await personasAPI.updatePersona(editingPersona.id, newPersona);
      setPersonas(personas.map(p => p.id === editingPersona.id ? updatedData : p));
      resetPersonaForm();
      setEditingPersona(null);
    } catch (err) {
      setError('Failed to update persona: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deletePersona = async (id) => {
    if (!confirm('Are you sure you want to delete this persona?')) return;

    try {
      setLoading(true);
      setError(null);
      await personasAPI.deletePersona(id);
      setPersonas(personas.filter(p => p.id !== id));
    } catch (err) {
      setError('Failed to delete persona: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingPersona(null);
    resetPersonaForm();
    setError(null);
  };

  const addKeyword = async () => {
    if (!newKeyword.keyword.trim()) {
      setError('Keyword is required');
      return;
    }

    try {
      setKeywordsLoading(true);
      setError(null);
      
      // Check if keyword already exists
      const exists = await keywordsAPI.keywordExists(newKeyword.keyword);
      if (exists) {
        setError('This keyword already exists');
        return;
      }

      const data = await keywordsAPI.insertKeyword({
        keyword: newKeyword.keyword.trim(),
        addedBy: newKeyword.addedBy.trim(),
        dateAdded: newKeyword.dateAdded
      });
      
      setKeywords(prevKeywords => [data, ...prevKeywords]);
      resetKeywordForm();
    } catch (err) {
      setError('Failed to add keyword: ' + err.message);
    } finally {
      setKeywordsLoading(false);
    }
  };

  const editKeyword = (keyword) => {
    setEditingKeyword(keyword);
    setNewKeyword({
      keyword: keyword.keyword,
      addedBy: keyword.added_by || '',
      dateAdded: keyword.date_added || new Date().toISOString().split('T')[0]
    });
  };

  const updateKeyword = async () => {
    if (!editingKeyword || !newKeyword.keyword.trim()) {
      setError('Keyword is required');
      return;
    }

    try {
      setKeywordsLoading(true);
      setError(null);
      
      // Check if keyword already exists (excluding current keyword)
      const exists = await keywordsAPI.keywordExists(newKeyword.keyword, editingKeyword.id);
      if (exists) {
        setError('This keyword already exists');
        return;
      }

      const updatedData = await keywordsAPI.updateKeyword(editingKeyword.id, {
        keyword: newKeyword.keyword.trim(),
        addedBy: newKeyword.addedBy.trim(),
        dateAdded: newKeyword.dateAdded
      });
      
      setKeywords(prevKeywords => 
        prevKeywords.map(k => k.id === editingKeyword.id ? updatedData : k)
      );
      resetKeywordForm();
      setEditingKeyword(null);
    } catch (err) {
      setError('Failed to update keyword: ' + err.message);
    } finally {
      setKeywordsLoading(false);
    }
  };

  const deleteKeyword = async (id) => {
    if (!confirm('Are you sure you want to delete this keyword?')) return;

    try {
      setKeywordsLoading(true);
      setError(null);
      await keywordsAPI.deleteKeyword(id);
      setKeywords(prevKeywords => prevKeywords.filter(k => k.id !== id));
    } catch (err) {
      setError('Failed to delete keyword: ' + err.message);
    } finally {
      setKeywordsLoading(false);
    }
  };

  const cancelKeywordEdit = () => {
    setEditingKeyword(null);
    resetKeywordForm();
    setError(null);
  };

  // Tags CRUD Functions
  const addTag = async () => {
    if (!newTag.tag.trim()) {
      setError('Tag is required');
      return;
    }

    try {
      setTagsLoading(true);
      setError(null);
      
      // Check if tag already exists
      const exists = await tagsAPI.tagExists(newTag.tag);
      if (exists) {
        setError('This tag already exists');
        return;
      }

      const data = await tagsAPI.insertTag({
        tag: newTag.tag.trim(),
        category: newTag.category,
        added_by: newTag.addedBy.trim(),
        date_added: newTag.dateAdded
      });
      
      setTags(prevTags => [data, ...prevTags]);
      resetTagForm();
    } catch (err) {
      setError('Failed to add tag: ' + err.message);
    } finally {
      setTagsLoading(false);
    }
  };

  const editTag = (tag) => {
    setEditingTag(tag);
    setNewTag({
      tag: tag.tag,
      category: tag.category,
      addedBy: tag.added_by || '',
      dateAdded: tag.date_added || new Date().toISOString().split('T')[0]
    });
  };

  const updateTag = async () => {
    if (!editingTag || !newTag.tag.trim()) {
      setError('Tag is required');
      return;
    }

    try {
      setTagsLoading(true);
      setError(null);
      
      // Check if tag already exists (excluding current tag)
      const exists = await tagsAPI.tagExists(newTag.tag, editingTag.id);
      if (exists) {
        setError('This tag already exists');
        return;
      }

      const updatedData = await tagsAPI.updateTag(editingTag.id, {
        tag: newTag.tag.trim(),
        category: newTag.category,
        added_by: newTag.addedBy.trim(),
        date_added: newTag.dateAdded
      });
      
      setTags(prevTags => 
        prevTags.map(t => t.id === editingTag.id ? updatedData : t)
      );
      resetTagForm();
      setEditingTag(null);
    } catch (err) {
      setError('Failed to update tag: ' + err.message);
    } finally {
      setTagsLoading(false);
    }
  };

  const deleteTag = async (id) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;

    try {
      setTagsLoading(true);
      setError(null);
      await tagsAPI.deleteTag(id);
      setTags(prevTags => prevTags.filter(t => t.id !== id));
    } catch (err) {
      setError('Failed to delete tag: ' + err.message);
    } finally {
      setTagsLoading(false);
    }
  };

  const cancelTagEdit = () => {
    setEditingTag(null);
    resetTagForm();
    setError(null);
  };

  // CSV Import Functions - Enhanced with Google integrations
  const handleCSVUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    try {
      setCsvUploading(true);
      setError(null);
      
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Expected CSV format: tag, category, added_by
      const tagIndex = headers.indexOf('tag');
      const categoryIndex = headers.indexOf('category');
      const addedByIndex = headers.indexOf('added_by');
      
      if (tagIndex === -1) {
        setError('CSV must contain a "tag" column');
        return;
      }
      
      const tagsToImport = [];
      const currentDate = new Date().toISOString().split('T')[0];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',').map(v => v.trim());
        const tag = values[tagIndex];
        
        if (tag) {
          tagsToImport.push({
            tag: tag,
            category: categoryIndex !== -1 ? (values[categoryIndex] || 'hashtag') : 'hashtag',
            added_by: addedByIndex !== -1 ? (values[addedByIndex] || 'CSV Import') : 'CSV Import',
            date_added: currentDate
          });
        }
      }
      
      if (tagsToImport.length === 0) {
        setError('No valid tags found in CSV');
        return;
      }
      
      // Bulk insert tags
      const insertedTags = await tagsAPI.insertManyTags(tagsToImport);
      setTags(prevTags => [...insertedTags, ...prevTags]);
      
      // Clear file input
      event.target.value = '';
      
      setError(null);
      alert(`Successfully imported ${insertedTags.length} tags`);
      
    } catch (err) {
      setError('Failed to import CSV: ' + err.message);
    } finally {
      setCsvUploading(false);
    }
  };

  // Google Search Console CSV Import
  const handleGSCFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    try {
      setCsvUploading(true);
      setError(null);
      
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Find columns by partial matching for GSC exports
      const queryIndex = headers.findIndex(h => h.includes('query') || h.includes('keyword'));
      const clicksIndex = headers.findIndex(h => h.includes('clicks'));
      const impressionsIndex = headers.findIndex(h => h.includes('impressions'));
      
      if (queryIndex === -1) {
        setError('CSV must contain a "Query" or "Keyword" column');
        return;
      }
      
      const tagsToImport = [];
      const currentDate = new Date().toISOString().split('T')[0];
      
      for (let i = 1; i < lines.length && i <= 100; i++) { // Limit to 100 items
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const query = values[queryIndex];
        const clicks = clicksIndex !== -1 ? values[clicksIndex] : '0';
        const impressions = impressionsIndex !== -1 ? values[impressionsIndex] : '0';
        
        if (query && query.length > 0) {
          tagsToImport.push({
            tag: query,
            category: 'seo-tag',
            added_by: `GSC Import (${clicks} clicks, ${impressions} impressions)`,
            date_added: currentDate
          });
        }
      }
      
      if (tagsToImport.length === 0) {
        setError('No valid queries found in GSC CSV');
        return;
      }
      
      // Bulk insert tags
      const insertedTags = await tagsAPI.insertManyTags(tagsToImport);
      setTags(prevTags => [...insertedTags, ...prevTags]);
      
      // Clear file input
      event.target.value = '';
      
      setError(null);
      alert(`Successfully imported ${insertedTags.length} SEO tags from Google Search Console`);
      
    } catch (err) {
      setError('Failed to import GSC CSV: ' + err.message);
    } finally {
      setCsvUploading(false);
    }
  };

  // Keyword Planner CSV Import
  const handleKeywordPlannerUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    try {
      setCsvUploading(true);
      setError(null);
      
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Find columns by partial matching for Keyword Planner exports
      const keywordIndex = headers.findIndex(h => h.includes('keyword') || h.includes('term'));
      const searchVolumeIndex = headers.findIndex(h => h.includes('search') || h.includes('volume') || h.includes('avg'));
      const competitionIndex = headers.findIndex(h => h.includes('competition') || h.includes('compete'));
      
      if (keywordIndex === -1) {
        setError('CSV must contain a "Keyword" column');
        return;
      }
      
      const tagsToImport = [];
      const currentDate = new Date().toISOString().split('T')[0];
      
      for (let i = 1; i < lines.length && i <= 100; i++) { // Limit to 100 items
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const keyword = values[keywordIndex];
        const searchVolume = searchVolumeIndex !== -1 ? values[searchVolumeIndex] : 'Unknown';
        const competition = competitionIndex !== -1 ? values[competitionIndex] : 'Unknown';
        
        if (keyword && keyword.length > 0) {
          tagsToImport.push({
            tag: keyword,
            category: 'hashtag',
            added_by: `Keyword Planner (${searchVolume} searches, ${competition} competition)`,
            date_added: currentDate
          });
        }
      }
      
      if (tagsToImport.length === 0) {
        setError('No valid keywords found in Keyword Planner CSV');
        return;
      }
      
      // Bulk insert tags
      const insertedTags = await tagsAPI.insertManyTags(tagsToImport);
      setTags(prevTags => [...insertedTags, ...prevTags]);
      
      // Clear file input
      event.target.value = '';
      
      setError(null);
      alert(`Successfully imported ${insertedTags.length} hashtags from Keyword Planner`);
      
    } catch (err) {
      setError('Failed to import Keyword Planner CSV: ' + err.message);
    } finally {
      setCsvUploading(false);
    }
  };

  // Trigger file input clicks
  const triggerCSVUpload = () => {
    document.getElementById('csv-upload').click();
  };

  const importFromKeywordPlanner = () => {
    document.getElementById('keyword-planner-upload').click();
  };

  const importFromGSC = () => {
    document.getElementById('gsc-upload').click();
  };

  const addChannel = () => {
    if (newChannel.channelName) {
      const channel = {
        id: Date.now(),
        ...newChannel
      };
      setChannels([...channels, channel]);
      resetChannelForm();
    }
  };

  const addStrategy = () => {
    if (newStrategy.contentTitle) {
      const strategy = {
        id: Date.now(),
        ...newStrategy,
        version: 1,
        createdAt: new Date().toISOString()
      };
      setStrategies([...strategies, strategy]);
      resetStrategyForm();
    }
  };

  const addIntel = () => {
    if (newIntel.insightEntry) {
      const intel = {
        id: Date.now(),
        ...newIntel,
        submittedAt: new Date().toISOString()
      };
      setIntelEntries([...intelEntries, intel]);
      resetIntelForm();
    }
  };

  const addResearchInsight = () => {
    if (newResearchInsight.insight) {
      const insight = {
        id: Date.now(),
        ...newResearchInsight
      };
      setResearchInsights([...researchInsights, insight]);
      resetResearchForm();
    }
  };

  const addAnalyticsTool = () => {
    if (newTool.name && newTool.category) {
      setAnalyticsTools([...analyticsTools, {
        id: Date.now(),
        ...newTool
      }]);
      resetToolForm();
    }
  };

  // Reset form functions
  const resetPersonaForm = () => {
    setNewPersona({
      name: '',
      audience_segment: '',
      user_role: '',
      description: '',
      key_messages: '',
      last_edited_by: ''
    });
  };

  // Error Alert Component
  const ErrorAlert = ({ message, onClose }) => (
    message ? (
      <div style={{
        backgroundColor: isDarkMode ? '#7f1d1d' : '#fee2e2',
        border: `1px solid ${isDarkMode ? '#dc2626' : '#f87171'}`,
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ color: isDarkMode ? '#fca5a5' : '#dc2626', fontSize: '14px' }}>
          {message}
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: isDarkMode ? '#fca5a5' : '#dc2626',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '0',
            marginLeft: '12px'
          }}
        >
          ×
        </button>
      </div>
    ) : null
  );

  const resetKeywordForm = () => {
    setNewKeyword({
      keyword: '',
      dateAdded: new Date().toISOString().split('T')[0],
      addedBy: ''
    });
  };

  const resetTagForm = () => {
    setNewTag({
      tag: '',
      category: 'hashtag',
      dateAdded: new Date().toISOString().split('T')[0],
      addedBy: ''
    });
  };

  const resetChannelForm = () => {
    setNewChannel({
      channelName: '',
      priorityChangeLog: '',
      date: new Date().toISOString().split('T')[0],
      status: 'Active'
    });
  };

  const resetStrategyForm = () => {
    setNewStrategy({
      contentTitle: '',
      status: '',
      aiSuggestionRating: '',
      hashtags: '',
      tags: '',
      persona: '',
      audienceSegment: ''
    });
  };

  const resetIntelForm = () => {
    setNewIntel({
      priorityLevel: '',
      insightEntry: '',
      audioFile: null,
      persona: '',
      audienceSegment: ''
    });
  };

  const resetResearchForm = () => {
    setNewResearchInsight({
      insight: '',
      persona: '',
      audienceSegment: '',
      reviewStatus: 'new',
      uploadDate: new Date().toISOString().split('T')[0]
    });
  };

  const resetToolForm = () => {
    setNewTool({
      name: '',
      category: '',
      status: 'Active',
      url: '',
      notes: ''
    });
  };

  // Advanced functions (to be implemented)
  const generateHashtagsAndTags = () => {
    console.log('Generating hashtags and tags...');
  };

  const insertHashtagsAndTags = () => {
    console.log('Inserting hashtags and tags...');
  };

  const handleAudioUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewIntel({...newIntel, audioFile: file});
    }
  };

  // Persona and Audience Dropdown Component
  const PersonaAudienceSelect = ({ personaValue, audienceValue, onPersonaChange, onAudienceChange, required = false }) => (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'end' }}>
      <div style={{ flex: 1 }}>
        <label style={labelStyle}>Persona {required && '*'}</label>
        <select 
          value={personaValue} 
          onChange={(e) => onPersonaChange(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
            borderRadius: '8px',
            fontSize: '14px',
            backgroundColor: '#334155',
            color: '#ffffff',
            outline: 'none',
            fontFamily: 'inherit'
          }}
          required={required}
        >
          <option value="" style={{ backgroundColor: '#334155', color: '#ffffff' }}>Select persona</option>
          {PERSONA_OPTIONS.map(persona => (
            <option key={persona} value={persona} style={{ backgroundColor: '#334155', color: '#ffffff' }}>{persona}</option>
          ))}
        </select>
      </div>
      <div style={{ flex: 1 }}>
        <label style={labelStyle}>Audience Segment {required && '*'}</label>
        <select 
          value={audienceValue} 
          onChange={(e) => onAudienceChange(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
            borderRadius: '8px',
            fontSize: '14px',
            backgroundColor: '#334155',
            color: '#ffffff',
            outline: 'none',
            fontFamily: 'inherit'
          }}
          required={required}
        >
          <option value="" style={{ backgroundColor: '#334155', color: '#ffffff' }}>Select audience</option>
          {AUDIENCE_OPTIONS.map(audience => (
            <option key={audience.value} value={audience.value} style={{ backgroundColor: '#334155', color: '#ffffff' }}>{audience.label}</option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div style={containerStyle}>
      <div style={tabsContainerStyle}>
        {/* Tab Groups */}
        <div style={{ padding: '0 12px' }}>
          {tabGroups.map((group, groupIndex) => (
            <div key={group.name} style={{ 
              display: 'inline-block',
              marginRight: '32px',
              borderLeft: groupIndex > 0 ? `2px solid ${isDarkMode ? '#374151' : '#e5e7eb'}` : 'none',
              paddingLeft: groupIndex > 0 ? '32px' : '0'
            }}>
              <div style={{
                fontSize: '11px',
                fontWeight: '600',
                color: group.color,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '8px',
                paddingLeft: '12px'
              }}>
                {group.name}
              </div>
              <nav style={{ display: 'flex', gap: '4px' }}>
                {group.tabs.map((tab) => {
                  const fullTab = allTabs.find(t => t.id === tab.id);
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={getTabStyle(fullTab)}
                      onMouseOver={(e) => {
                        if (activeTab !== tab.id) {
                          e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f1f5f9';
                          e.currentTarget.style.color = group.color;
                        }
                      }}
                      onMouseOut={(e) => {
                        if (activeTab !== tab.id) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = isDarkMode ? '#d1d5db' : '#6b7280';
                        }
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Tab 1: Persona Manager */}
      {activeTab === 'personas' && (
        <div style={{ display: 'grid', gap: '24px' }}>
          <ErrorAlert message={error} onClose={() => setError(null)} />
          
          <div style={cardStyle}>
            <div style={{
              borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
              paddingBottom: '16px',
              marginBottom: '24px'
            }}>
              <h2 style={{ ...sectionTitleStyle, margin: '0 0 8px 0' }}>
                {editingPersona ? 'Edit Persona' : 'Add New Persona'}
              </h2>
              <p style={{ fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#6b7280', margin: '0' }}>
                {editingPersona ? 'Update persona details' : 'Create and manage marketing personas with audience targeting'}
              </p>
            </div>
            
            <PersonaAudienceSelect
              personaValue={newPersona.name}
              audienceValue={newPersona.audience_segment}
              onPersonaChange={(value) => setNewPersona({...newPersona, name: value})}
              onAudienceChange={(value) => setNewPersona({...newPersona, audience_segment: value})}
              required={true}
            />
            
            <div style={{ marginTop: '20px' }}>
              <label style={labelStyle}>User Role</label>
              <input 
                type="text"
                value={newPersona.user_role}
                onChange={(e) => setNewPersona({...newPersona, user_role: e.target.value})}
                placeholder="Enter user role"
                style={inputStyle}
              />
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <label style={labelStyle}>Description</label>
              <textarea 
                value={newPersona.description}
                onChange={(e) => setNewPersona({...newPersona, description: e.target.value})}
                placeholder="Describe this persona"
                rows={3}
                style={textareaStyle}
              />
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <label style={labelStyle}>Key Messages</label>
              <textarea 
                value={newPersona.key_messages}
                onChange={(e) => setNewPersona({...newPersona, key_messages: e.target.value})}
                placeholder="Key messages and positioning"
                rows={3}
                style={textareaStyle}
              />
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <label style={labelStyle}>Last Edited By</label>
              <input 
                type="text"
                value={newPersona.last_edited_by}
                onChange={(e) => setNewPersona({...newPersona, last_edited_by: e.target.value})}
                placeholder="Enter your name"
                style={inputStyle}
              />
            </div>
            
            <div style={{ marginTop: '24px', textAlign: 'right', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              {editingPersona && (
                <button 
                  onClick={cancelEdit} 
                  style={secondaryButtonStyle}
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
              <button 
                onClick={editingPersona ? updatePersona : addPersona} 
                style={{
                  ...primaryButtonStyle,
                  opacity: (newPersona.name && newPersona.audience_segment && !loading) ? 1 : 0.5,
                  cursor: (newPersona.name && newPersona.audience_segment && !loading) ? 'pointer' : 'not-allowed'
                }}
                disabled={!newPersona.name || !newPersona.audience_segment || loading}
              >
                {loading ? 'Saving...' : (editingPersona ? 'Update Persona' : '+ Add Persona')}
              </button>
            </div>
          </div>

          {/* Display existing personas */}
          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>Active Personas ({personas.length})</h2>
            {loading && personas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                Loading personas...
              </div>
            ) : personas.length === 0 ? (
              <div style={emptyStateStyle}>
                <p style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', textAlign: 'center', fontSize: '16px', margin: '0' }}>
                  No personas created yet. Add your first persona above to get started.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {personas.map((persona) => (
                  <div key={persona.id} style={{
                    padding: '16px',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    backgroundColor: '#334155'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#ffffff' }}>
                          {persona.name} - {AUDIENCE_OPTIONS.find(opt => opt.value === persona.audience_segment)?.label || persona.audience_segment}
                        </h4>
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#d1d5db' }}>
                          Role: {persona.user_role || 'Not specified'}
                        </p>
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#d1d5db' }}>
                          {persona.description || 'No description provided'}
                        </p>
                        {persona.key_messages && (
                          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#9ca3af' }}>
                            Key Messages: {persona.key_messages}
                          </p>
                        )}
                        <p style={{ margin: '0', fontSize: '12px', color: '#9ca3af' }}>
                          Last edited by: {persona.last_edited_by || 'Unknown'} • 
                          Created: {new Date(persona.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => editPersona(persona)}
                          style={{
                            ...smallButtonStyle,
                            backgroundColor: '#3b82f6',
                            color: 'white'
                          }}
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => deletePersona(persona.id)}
                          style={{
                            ...smallButtonStyle,
                            backgroundColor: '#dc2626',
                            color: 'white'
                          }}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Keywords & Content Tools */}
      {activeTab === 'content-tools' && (
        <div style={{ display: 'grid', gap: '24px' }}>
          <ErrorAlert message={error} onClose={() => setError(null)} />
          
          <div style={cardStyle}>
            <div style={{
              borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
              paddingBottom: '16px',
              marginBottom: '20px'
            }}>
              <h2 style={{ ...sectionTitleStyle, margin: '0 0 8px 0' }}>
                {editingKeyword ? 'Edit Keyword' : 'Add New Keyword'}
              </h2>
              <p style={{ fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#6b7280', margin: '0' }}>
                {editingKeyword ? 'Update keyword details' : 'Track and manage keywords for content strategy'}
              </p>
            </div>
            
            <div style={formGridStyle}>
              <div>
                <label style={labelStyle}>Keyword *</label>
                <input 
                  type="text"
                  value={newKeyword.keyword}
                  onChange={(e) => setNewKeyword({...newKeyword, keyword: e.target.value})}
                  placeholder="Enter keyword"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Added By</label>
                <input 
                  type="text"
                  value={newKeyword.addedBy}
                  onChange={(e) => setNewKeyword({...newKeyword, addedBy: e.target.value})}
                  placeholder="Your name"
                  style={inputStyle}
                />
              </div>
            </div>
            
            <div style={{ marginTop: '20px', textAlign: 'right', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              {editingKeyword && (
                <button 
                  onClick={cancelKeywordEdit} 
                  style={secondaryButtonStyle}
                  disabled={keywordsLoading}
                >
                  Cancel
                </button>
              )}
              <button 
                onClick={editingKeyword ? updateKeyword : addKeyword}
                style={{
                  ...primaryButtonStyle,
                  opacity: (newKeyword.keyword.trim() && !keywordsLoading) ? 1 : 0.5,
                  cursor: (newKeyword.keyword.trim() && !keywordsLoading) ? 'pointer' : 'not-allowed'
                }}
                disabled={!newKeyword.keyword.trim() || keywordsLoading}
              >
                {keywordsLoading ? 'Saving...' : (editingKeyword ? 'Update Keyword' : '+ Add Keyword')}
              </button>
            </div>
            
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Keywords ({keywords.length})
              </h3>
              {keywordsLoading && keywords.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                  Loading keywords...
                </div>
              ) : keywords.length === 0 ? (
                <div style={emptyStateStyle}>
                  <p style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', textAlign: 'center' }}>
                    No keywords added yet
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {keywords.map((keyword) => (
                    <div key={keyword.id} style={{
                      padding: '12px',
                      border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: isDarkMode ? '#374151' : '#ffffff'
                    }}>
                      <div>
                        <span style={{ fontWeight: '500' }}>{keyword.keyword}</span>
                        <span style={{ fontSize: '12px', color: isDarkMode ? '#9ca3af' : '#6b7280', marginLeft: '12px' }}>
                          {keyword.date_added} by {keyword.added_by || 'Unknown'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => editKeyword(keyword)}
                          style={{
                            ...smallButtonStyle,
                            backgroundColor: '#3b82f6',
                            color: 'white'
                          }}
                          disabled={keywordsLoading}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => deleteKeyword(keyword.id)}
                          style={{
                            ...smallButtonStyle,
                            backgroundColor: '#dc2626',
                            color: 'white'
                          }}
                          disabled={keywordsLoading}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Hashtags & Tags Manager Section with Google Integrations */}
          <div style={cardStyle}>
            <div style={{
              borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
              paddingBottom: '16px',
              marginBottom: '20px'
            }}>
              <h2 style={{ ...sectionTitleStyle, margin: '0 0 8px 0' }}>
                {editingTag ? 'Edit Tag' : 'Add New Tag'}
              </h2>
              <p style={{ fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#6b7280', margin: '0' }}>
                {editingTag ? 'Update tag details' : 'Create and manage hashtags and content tags'}
              </p>
            </div>
            
            <div style={formGridStyle}>
              <div>
                <label style={labelStyle}>Tag *</label>
                <input 
                  type="text"
                  value={newTag.tag}
                  onChange={(e) => setNewTag({...newTag, tag: e.target.value})}
                  placeholder="Enter tag (without # symbol)"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select 
                  value={newTag.category}
                  onChange={(e) => setNewTag({...newTag, category: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: '#334155',
                    color: '#ffffff',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="hashtag" style={{ backgroundColor: '#334155', color: '#ffffff' }}>Hashtag</option>
                  <option value="content-tag" style={{ backgroundColor: '#334155', color: '#ffffff' }}>Content Tag</option>
                  <option value="seo-tag" style={{ backgroundColor: '#334155', color: '#ffffff' }}>SEO Tag</option>
                  <option value="campaign-tag" style={{ backgroundColor: '#334155', color: '#ffffff' }}>Campaign Tag</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Added By</label>
                <input 
                  type="text"
                  value={newTag.addedBy}
                  onChange={(e) => setNewTag({...newTag, addedBy: e.target.value})}
                  placeholder="Your name"
                  style={inputStyle}
                />
              </div>
            </div>
            
            <div style={{ marginTop: '20px', textAlign: 'right', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              {editingTag && (
                <button 
                  onClick={cancelTagEdit} 
                  style={secondaryButtonStyle}
                  disabled={tagsLoading}
                >
                  Cancel
                </button>
              )}
              <button 
                onClick={editingTag ? updateTag : addTag}
                style={{
                  ...primaryButtonStyle,
                  opacity: (newTag.tag.trim() && !tagsLoading) ? 1 : 0.5,
                  cursor: (newTag.tag.trim() && !tagsLoading) ? 'pointer' : 'not-allowed'
                }}
                disabled={!newTag.tag.trim() || tagsLoading}
              >
                {tagsLoading ? 'Saving...' : (editingTag ? 'Update Tag' : '+ Add Tag')}
              </button>
            </div>

            {/* Import Section with Google Integration */}
            <div style={{ 
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Import Tags from Google Services
              </h3>
              <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
                {/* Google Keyword Planner Import */}
                <div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleKeywordPlannerUpload}
                    style={{ display: 'none' }}
                    id="keyword-planner-upload"
                    disabled={csvUploading}
                  />
                  <button 
                    onClick={importFromKeywordPlanner}
                    style={{
                      ...secondaryButtonStyle,
                      width: '100%',
                      opacity: csvUploading ? 0.5 : 1,
                      cursor: csvUploading ? 'not-allowed' : 'pointer'
                    }}
                    disabled={csvUploading}
                  >
                    {csvUploading ? 'Uploading...' : 'Import from Google Keyword Planner'}
                  </button>
                  <p style={{ fontSize: '12px', color: isDarkMode ? '#9ca3af' : '#6b7280', marginTop: '4px', margin: '4px 0 0 0' }}>
                    Export CSV from Google Keyword Planner with keyword, searches, and competition columns
                  </p>
                </div>

                {/* Google Search Console Import */}
                <div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleGSCFileUpload}
                    style={{ display: 'none' }}
                    id="gsc-upload"
                    disabled={csvUploading}
                  />
                  <button 
                    onClick={importFromGSC}
                    style={{
                      ...secondaryButtonStyle,
                      width: '100%',
                      opacity: csvUploading ? 0.5 : 1,
                      cursor: csvUploading ? 'not-allowed' : 'pointer'
                    }}
                    disabled={csvUploading}
                  >
                    {csvUploading ? 'Uploading...' : 'Import from Google Search Console'}
                  </button>
                  <p style={{ fontSize: '12px', color: isDarkMode ? '#9ca3af' : '#6b7280', marginTop: '4px', margin: '4px 0 0 0' }}>
                    Export "Queries" CSV from GSC Performance report with query, clicks, and impressions
                  </p>
                </div>

                {/* Manual CSV Upload */}
                <div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    style={{ display: 'none' }}
                    id="csv-upload"
                    disabled={csvUploading}
                  />
                  <button 
                    onClick={triggerCSVUpload}
                    style={{
                      ...secondaryButtonStyle,
                      width: '100%',
                      opacity: csvUploading ? 0.5 : 1,
                      cursor: csvUploading ? 'not-allowed' : 'pointer'
                    }}
                    disabled={csvUploading}
                  >
                    {csvUploading ? 'Uploading CSV...' : 'Manual CSV Upload'}
                  </button>
                  <p style={{ fontSize: '12px', color: isDarkMode ? '#9ca3af' : '#6b7280', marginTop: '4px', margin: '4px 0 0 0' }}>
                    CSV format: tag, category, added_by (headers required)
                  </p>
                </div>
              </div>
            </div>

            {/* Display existing tags */}
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Tags ({tags.length})
              </h3>
              {tagsLoading && tags.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                  Loading tags...
                </div>
              ) : tags.length === 0 ? (
                <div style={emptyStateStyle}>
                  <p style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', textAlign: 'center' }}>
                    No tags added yet. Add tags manually or import from Google services.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {tags.map((tag) => (
                    <div key={tag.id} style={{
                      padding: '12px',
                      border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: isDarkMode ? '#374151' : '#ffffff'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontWeight: '500' }}>
                            {tag.category === 'hashtag' ? '#' : ''}{tag.tag}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: tag.category === 'hashtag' ? '#dbeafe' : '#f3f4f6',
                            color: tag.category === 'hashtag' ? '#1e40af' : '#374151'
                          }}>
                            {tag.category}
                          </span>
                        </div>
                        <span style={{ fontSize: '12px', color: isDarkMode ? '#9ca3af' : '#6b7280', marginTop: '4px', display: 'block' }}>
                          {tag.date_added} by {tag.added_by || 'Unknown'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => editTag(tag)}
                          style={{
                            ...smallButtonStyle,
                            backgroundColor: '#3b82f6',
                            color: 'white'
                          }}
                          disabled={tagsLoading}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => deleteTag(tag.id)}
                          style={{
                            ...smallButtonStyle,
                            backgroundColor: '#dc2626',
                            color: 'white'
                          }}
                          disabled={tagsLoading}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* All other tabs remain exactly as they were in your working version */}
      {/* Tab 3: Strategy Vault */}
      {activeTab === 'strategy' && (
        <div style={cardStyle}>
          <div style={{
            borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            paddingBottom: '16px',
            marginBottom: '20px'
          }}>
            <h2 style={{ ...sectionTitleStyle, margin: '0 0 8px 0' }}>Strategy Vault</h2>
            <p style={{ fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#6b7280', margin: '0' }}>
              Version-controlled content strategy with AI feedback and persona targeting
            </p>
          </div>
          
          <div style={formGridStyle}>
            <div>
              <label style={labelStyle}>Content Title *</label>
              <input 
                type="text"
                value={newStrategy.contentTitle}
                onChange={(e) => setNewStrategy({...newStrategy, contentTitle: e.target.value})}
                placeholder="Enter content title" 
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select 
                value={newStrategy.status}
                onChange={(e) => setNewStrategy({...newStrategy, status: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#334155',
                  color: '#ffffff',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  fontFamily: 'inherit',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 12px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '16px',
                  paddingRight: '48px'
                }}
              >
                <option value="" style={{ backgroundColor: '#334155', color: '#ffffff' }}>Select status</option>
                <option value="pending" style={{ backgroundColor: '#334155', color: '#ffffff' }}>Pending</option>
                <option value="scheduled" style={{ backgroundColor: '#334155', color: '#ffffff' }}>Scheduled</option>
                <option value="deployed" style={{ backgroundColor: '#334155', color: '#ffffff' }}>Deployed</option>
                <option value="archived" style={{ backgroundColor: '#334155', color: '#ffffff' }}>Archived</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>AI Suggestion Rating</label>
              <select 
                value={newStrategy.aiSuggestionRating}
                onChange={(e) => setNewStrategy({...newStrategy, aiSuggestionRating: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#334155',
                  color: '#ffffff',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  fontFamily: 'inherit',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 12px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '16px',
                  paddingRight: '48px'
                }}
              >
                <option value="" style={{ backgroundColor: '#334155', color: '#ffffff' }}>Rate AI suggestion</option>
                <option value="useful" style={{ backgroundColor: '#334155', color: '#ffffff' }}>Useful</option>
                <option value="neutral" style={{ backgroundColor: '#334155', color: '#ffffff' }}>Neutral</option>
                <option value="not-useful" style={{ backgroundColor: '#334155', color: '#ffffff' }}>Not Useful</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <PersonaAudienceSelect
              personaValue={newStrategy.persona}
              audienceValue={newStrategy.audienceSegment}
              onPersonaChange={(value) => setNewStrategy({...newStrategy, persona: value})}
              onAudienceChange={(value) => setNewStrategy({...newStrategy, audienceSegment: value})}
            />
          </div>
          
          <div style={{ marginTop: '20px', display: 'grid', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Hashtags</label>
              <textarea 
                value={newStrategy.hashtags}
                onChange={(e) => setNewStrategy({...newStrategy, hashtags: e.target.value})}
                placeholder="Enter hashtags" 
                rows={2}
                style={textareaStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Tags</label>
              <textarea 
                value={newStrategy.tags}
                onChange={(e) => setNewStrategy({...newStrategy, tags: e.target.value})}
                placeholder="Enter tags" 
                rows={2}
                style={textareaStyle}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={generateHashtagsAndTags}
                style={{ ...secondaryButtonStyle, flex: 1 }}
              >
                Generate Hashtags & Tags
              </button>
              <button 
                onClick={insertHashtagsAndTags}
                style={{ ...secondaryButtonStyle, flex: 1 }}
              >
                Insert Hashtags & Tags
              </button>
            </div>
          </div>

          <div style={{ marginTop: '24px', textAlign: 'right' }}>
            <button 
              onClick={addStrategy}
              style={{
                ...primaryButtonStyle,
                opacity: newStrategy.contentTitle ? 1 : 0.5,
                cursor: newStrategy.contentTitle ? 'pointer' : 'not-allowed'
              }}
            >
              + Save Strategy
            </button>
          </div>

          {/* Display strategies */}
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              Strategies ({strategies.length})
            </h3>
            {strategies.length === 0 ? (
              <div style={emptyStateStyle}>
                <p style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', textAlign: 'center' }}>
                  No strategies saved yet
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {strategies.map((strategy) => (
                  <div key={strategy.id} style={{
                    padding: '16px',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <h4 style={{ margin: '0 0 8px 0', fontWeight: '600' }}>{strategy.contentTitle}</h4>
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#6b7280' }}>
                          {strategy.persona} - {strategy.audienceSegment} | Status: {strategy.status}
                        </p>
                        {strategy.hashtags && (
                          <p style={{ margin: '0', fontSize: '12px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                            {strategy.hashtags}
                          </p>
                        )}
                      </div>
                      <span style={{ fontSize: '12px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                        v{strategy.version}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Continue with remaining tabs exactly as in your working version... */}
      {/* All other tabs remain the same */}
      {activeTab === 'channels' && (
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Channel Mapper</h2>
          <div style={formGridStyle}>
            <div>
              <label style={labelStyle}>Channel Name *</label>
              <input 
                type="text"
                value={newChannel.channelName}
                onChange={(e) => setNewChannel({...newChannel, channelName: e.target.value})}
                placeholder="Enter channel name"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select 
                value={newChannel.status}
                onChange={(e) => setNewChannel({...newChannel, status: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#334155',
                  color: '#ffffff',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  fontFamily: 'inherit',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 12px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '16px',
                  paddingRight: '48px'
                }}
              >
                <option value="Active" style={{ backgroundColor: '#334155', color: '#ffffff' }}>Active</option>
                <option value="Inactive" style={{ backgroundColor: '#334155', color: '#ffffff' }}>Inactive</option>
                <option value="Pending" style={{ backgroundColor: '#334155', color: '#ffffff' }}>Pending</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: '20px' }}>
            <label style={labelStyle}>Priority Change Log</label>
            <textarea 
              value={newChannel.priorityChangeLog}
              onChange={(e) => setNewChannel({...newChannel, priorityChangeLog: e.target.value})}
              placeholder="Document priority changes and notes"
              rows={3}
              style={textareaStyle}
            />
          </div>
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <button 
              onClick={addChannel}
              style={{
                ...primaryButtonStyle,
                opacity: newChannel.channelName ? 1 : 0.5,
                cursor: newChannel.channelName ? 'pointer' : 'not-allowed'
              }}
            >
              + Add Channel
            </button>
          </div>

          {/* Display channels */}
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              Channels ({channels.length})
            </h3>
            {channels.length === 0 ? (
              <div style={emptyStateStyle}>
                <p style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', textAlign: 'center' }}>
                  No channels added yet
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {channels.map((channel) => (
                  <div key={channel.id} style={{
                    padding: '16px',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ margin: '0', fontWeight: '600' }}>{channel.channelName}</h4>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        backgroundColor: channel.status === 'Active' ? '#d1fae5' : '#f3f4f6',
                        color: channel.status === 'Active' ? '#065f46' : '#374151'
                      }}>
                        {channel.status}
                      </span>
                    </div>
                    {channel.priorityChangeLog && (
                      <p style={{ margin: '0', fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#6b7280' }}>
                        {channel.priorityChangeLog}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Search Trends & Intent */}
      {activeTab === 'trends' && (
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Search Trends & Intent Summary</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {[
              { value: trends.tracked, label: 'Keywords Tracked', color: '#3b82f6' },
              { value: trends.flagged, label: 'Trends Flagged', color: '#10b981' },
              { value: `${trends.commercialIntent}%`, label: 'Commercial Intent', color: '#8b5cf6' }
            ].map((stat, index) => (
              <div key={index} style={statsCardStyle}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: stat.color, 
                  marginBottom: '8px' 
                }}>
                  {stat.value}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: isDarkMode ? '#9ca3af' : '#6b7280' 
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: isDarkMode ? '#111827' : '#f9fafb', borderRadius: '8px' }}>
            <p style={{ margin: '0', fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#6b7280' }}>
              This data is pulled from your connected tracking tools and updated automatically.
              Connect additional tools in the Analytics & Insights panel to enhance trend detection.
            </p>
          </div>
        </div>
      )}

      {/* Tab 6: Intel Drop Zone */}
      {activeTab === 'intel' && (
        <div style={cardStyle}>
          <div style={{
            borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            paddingBottom: '16px',
            marginBottom: '20px'
          }}>
            <h2 style={{ ...sectionTitleStyle, margin: '0 0 8px 0' }}>Anica's Intel Drop Zone</h2>
            <p style={{ fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#6b7280', margin: '0' }}>
              Raw input collection with audio support and persona targeting
            </p>
          </div>
          
          <div style={formGridStyle}>
            <div>
              <label style={labelStyle}>Priority Level</label>
              <select 
                value={newIntel.priorityLevel}
                onChange={(e) => setNewIntel({...newIntel, priorityLevel: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#334155',
                  color: '#ffffff',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  fontFamily: 'inherit',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 12px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '16px',
                  paddingRight: '48px'
                }}
              >
                <option value="" style={{ backgroundColor: '#334155', color: '#ffffff' }}>Select priority</option>
                <option value="low" style={{ backgroundColor: '#334155', color: '#ffffff' }}>Low</option>
                <option value="medium" style={{ backgroundColor: '#334155', color: '#ffffff' }}>Medium</option>
                <option value="high" style={{ backgroundColor: '#334155', color: '#ffffff' }}>High</option>
                <option value="urgent" style={{ backgroundColor: '#334155', color: '#ffffff' }}>Urgent</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <PersonaAudienceSelect
              personaValue={newIntel.persona}
              audienceValue={newIntel.audienceSegment}
              onPersonaChange={(value) => setNewIntel({...newIntel, persona: value})}
              onAudienceChange={(value) => setNewIntel({...newIntel, audienceSegment: value})}
            />
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <label style={labelStyle}>Insight Entry *</label>
            <textarea 
              value={newIntel.insightEntry}
              onChange={(e) => setNewIntel({...newIntel, insightEntry: e.target.value})}
              placeholder="Enter intel or insights..." 
              rows={4}
              style={textareaStyle}
            />
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <label style={labelStyle}>Audio Upload</label>
            <input 
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              style={{ ...inputStyle, padding: '8px', width: '100%' }}
            />
            {newIntel.audioFile && (
              <p style={{ fontSize: '12px', color: isDarkMode ? '#9ca3af' : '#6b7280', marginTop: '8px' }}>
                Selected: {newIntel.audioFile.name}
              </p>
            )}
          </div>
          
          <div style={{ marginTop: '24px', textAlign: 'right' }}>
            <button 
              onClick={addIntel}
              style={{
                ...primaryButtonStyle,
                opacity: newIntel.insightEntry ? 1 : 0.5,
                cursor: newIntel.insightEntry ? 'pointer' : 'not-allowed'
              }}
            >
              Submit Intel
            </button>
          </div>

          {/* Display intel entries */}
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              Intel Entries ({intelEntries.length})
            </h3>
            {intelEntries.length === 0 ? (
              <div style={emptyStateStyle}>
                <p style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', textAlign: 'center' }}>
                  No intel submitted yet
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {intelEntries.map((intel) => (
                  <div key={intel.id} style={{
                    padding: '16px',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        backgroundColor: intel.priorityLevel === 'high' || intel.priorityLevel === 'urgent' ? '#fee2e2' : '#f3f4f6',
                        color: intel.priorityLevel === 'high' || intel.priorityLevel === 'urgent' ? '#dc2626' : '#374151'
                      }}>
                        {intel.priorityLevel || 'Normal'} Priority
                      </span>
                      <span style={{ fontSize: '12px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                        {intel.persona} - {intel.audienceSegment}
                      </span>
                    </div>
                    <p style={{ margin: '0', fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#6b7280' }}>
                      {intel.insightEntry}
                    </p>
                    {intel.audioFile && (
                      <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#3b82f6' }}>
                        Audio attached: {intel.audioFile.name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 7: Analytics & Insights */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'grid', gap: '24px' }}>
          <div style={cardStyle}>
            <div style={{
              borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
              paddingBottom: '16px',
              marginBottom: '20px'
            }}>
              <h2 style={{ ...sectionTitleStyle, margin: '0 0 8px 0' }}>SparkToro Research Board</h2>
              <p style={{ fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#6b7280', margin: '0' }}>
                Upload and tag insights with persona targeting
              </p>
            </div>
            
            <div style={formGridStyle}>
              <div>
                <label style={labelStyle}>Review Status</label>
                <select 
                  value={newResearchInsight.reviewStatus}
                  onChange={(e) => setNewResearchInsight({...newResearchInsight, reviewStatus: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: '#334155',
                    color: '#ffffff',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    fontFamily: 'inherit',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 12px center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '16px',
                    paddingRight: '48px'
                  }}
                >
                  <option value="new" style={{ backgroundColor: '#334155', color: '#ffffff' }}>New</option>
                  <option value="in-review" style={{ backgroundColor: '#334155', color: '#ffffff' }}>In Review</option>
                  <option value="archived" style={{ backgroundColor: '#334155', color: '#ffffff' }}>Archived</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <PersonaAudienceSelect
                personaValue={newResearchInsight.persona}
                audienceValue={newResearchInsight.audienceSegment}
                onPersonaChange={(value) => setNewResearchInsight({...newResearchInsight, persona: value})}
                onAudienceChange={(value) => setNewResearchInsight({...newResearchInsight, audienceSegment: value})}
              />
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <label style={labelStyle}>Insight *</label>
              <textarea 
                value={newResearchInsight.insight}
                onChange={(e) => setNewResearchInsight({...newResearchInsight, insight: e.target.value})}
                placeholder="Enter research insight or finding..." 
                rows={4}
                style={textareaStyle}
              />
            </div>
            
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button 
                onClick={addResearchInsight}
                style={{
                  ...primaryButtonStyle,
                  opacity: newResearchInsight.insight ? 1 : 0.5,
                  cursor: newResearchInsight.insight ? 'pointer' : 'not-allowed'
                }}
              >
                Upload Insight
              </button>
            </div>

            {/* Display research insights */}
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Research Insights ({researchInsights.length})
              </h3>
              {researchInsights.length === 0 ? (
                <div style={emptyStateStyle}>
                  <p style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', textAlign: 'center' }}>
                    No research insights uploaded yet
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {researchInsights.map((insight) => (
                    <div key={insight.id} style={{
                      padding: '16px',
                      border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          backgroundColor: insight.reviewStatus === 'new' ? '#dbeafe' : '#f3f4f6',
                          color: insight.reviewStatus === 'new' ? '#1e40af' : '#374151'
                        }}>
                          {insight.reviewStatus}
                        </span>
                        <span style={{ fontSize: '12px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                          {insight.persona} - {insight.audienceSegment}
                        </span>
                      </div>
                      <p style={{ margin: '0', fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#6b7280' }}>
                        {insight.insight}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{
              borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
              paddingBottom: '16px',
              marginBottom: '20px'
            }}>
              <h2 style={{ ...sectionTitleStyle, margin: '0 0 8px 0' }}>Analytics Tools</h2>
              <p style={{ fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#6b7280', margin: '0' }}>
                Manage your analytics and research tools
              </p>
            </div>
            
            <div style={{ 
              marginBottom: '24px', 
              padding: '20px', 
              border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`, 
              borderRadius: '8px', 
              backgroundColor: isDarkMode ? '#111827' : '#f9fafb' 
            }}>
              <h4 style={{ fontWeight: '600', marginBottom: '16px', fontSize: '16px', margin: '0 0 16px 0' }}>
                Add New Tool
              </h4>
              <div style={formGridStyle}>
                <input 
                  type="text"
                  placeholder="Tool name"
                  value={newTool.name}
                  onChange={(e) => setNewTool({...newTool, name: e.target.value})}
                  style={inputStyle}
                />
                <select 
                  value={newTool.category} 
                  onChange={(e) => setNewTool({...newTool, category: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: '#334155',
                    color: '#ffffff',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    fontFamily: 'inherit',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 12px center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '16px',
                    paddingRight: '48px'
                  }}
                >
                  <option value="" style={{ backgroundColor: '#334155', color: '#ffffff' }}>Select category</option>
                  <option value="SEO" style={{ backgroundColor: '#334155', color: '#ffffff' }}>SEO</option>
                  <option value="Social Media" style={{ backgroundColor: '#334155', color: '#ffffff' }}>Social Media</option>
                  <option value="Audience Research" style={{ backgroundColor: '#334155', color: '#ffffff' }}>Audience Research</option>
                  <option value="Video Analytics" style={{ backgroundColor: '#334155', color: '#ffffff' }}>Video Analytics</option>
                  <option value="Hashtag Analysis" style={{ backgroundColor: '#334155', color: '#ffffff' }}>Hashtag Analysis</option>
                  <option value="Other" style={{ backgroundColor: '#334155', color: '#ffffff' }}>Other</option>
                </select>
              </div>
              
              <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <input 
                  type="text"
                  placeholder="Tool URL"
                  value={newTool.url}
                  onChange={(e) => setNewTool({...newTool, url: e.target.value})}
                  style={inputStyle}
                />
                <select 
                  value={newTool.status} 
                  onChange={(e) => setNewTool({...newTool, status: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#334155',
                    color: '#ffffff',
                    fontFamily: 'inherit',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '16px',
                    paddingRight: '40px'
                  }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              
              <div style={{ marginTop: '16px' }}>
                <textarea 
                  placeholder="Notes and setup instructions"
                  value={newTool.notes}
                  onChange={(e) => setNewTool({...newTool, notes: e.target.value})}
                  rows={3}
                  style={textareaStyle}
                />
              </div>
              
              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button 
                  onClick={addAnalyticsTool}
                  style={{
                    ...primaryButtonStyle,
                    opacity: newTool.name && newTool.category ? 1 : 0.5,
                    cursor: newTool.name && newTool.category ? 'pointer' : 'not-allowed'
                  }}
                >
                  + Add Tool
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: isDarkMode ? '#111827' : '#f9fafb' }}>
                  <tr>
                    {['Tool Name', 'Category', 'Status', 'Access'].map((header) => (
                      <th key={header} style={{ 
                        padding: '12px 16px', 
                        textAlign: 'left', 
                        fontSize: '12px', 
                        fontWeight: '600', 
                        color: isDarkMode ? '#9ca3af' : '#6b7280', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.05em',
                        borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                      }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analyticsTools.map((tool) => (
                    <tr key={tool.id} style={{ borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}` }}>
                      <td style={{ 
                        padding: '12px 16px', 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: isDarkMode ? '#f9fafb' : '#111827' 
                      }}>
                        {tool.name}
                      </td>
                      <td style={{ 
                        padding: '12px 16px', 
                        fontSize: '14px', 
                        color: isDarkMode ? '#d1d5db' : '#6b7280' 
                      }}>
                        {tool.category}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          padding: '4px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          borderRadius: '12px',
                          backgroundColor: tool.status === 'Active' ? '#d1fae5' : '#f3f4f6',
                          color: tool.status === 'Active' ? '#065f46' : '#374151'
                        }}>
                          {tool.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#6b7280' }}>
                        {tool.url && (
                          <a 
                            href={tool.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ color: '#3b82f6', textDecoration: 'none' }}
                          >
                            Open Tool
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: Media Archives */}
      {activeTab === 'archives' && (
        <div style={cardStyle}>
          <div style={{
            borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            paddingBottom: '16px',
            marginBottom: '20px'
          }}>
            <h2 style={{ ...sectionTitleStyle, margin: '0 0 8px 0' }}>Caelum Archives</h2>
            <p style={{ fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#6b7280', margin: '0' }}>
              Archived content with search and restore functionality
            </p>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <input 
              type="text"
              placeholder="Search archived items..." 
              style={inputStyle}
            />
          </div>

          <div style={emptyStateStyle}>
            <p style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', textAlign: 'center', fontSize: '16px', margin: '0' }}>
              No archived items yet
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingComponent;
