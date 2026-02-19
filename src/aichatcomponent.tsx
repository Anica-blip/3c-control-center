// Jan AI Assistant Component - Integrated with 3c-desktop-editor
import React, { useState, useEffect } from 'react';
import janProfile from './assets/jan-profile.png';
import { janProjectStorage, initJanProjectStorage, ContentTemplate, ProjectReference } from './utils/janProjectStorage';
import { defaultTemplates, initializeDefaultTemplates } from './utils/defaultTemplates';

interface JanDocument {
  title: string;
  character: string;
  brandVoice: string;
  templateType: string;
  themeLabel: string;
  targetAudience: string;
  contentPrompt: string;
  content: string;
  status: string;
  wordCount: number;
  readingTime: number;
  lastModified: string;
}

interface AIChatComponentProps {
  isDarkMode?: boolean;
}

const AIChatComponent: React.FC<AIChatComponentProps> = ({ isDarkMode = false }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [currentDocument, setCurrentDocument] = useState<JanDocument>({
    title: '',
    character: '',
    brandVoice: '',
    templateType: '',
    themeLabel: '',
    targetAudience: '',
    contentPrompt: '',
    content: '',
    status: 'Not started',
    wordCount: 0,
    readingTime: 0,
    lastModified: new Date().toISOString()
  });
  const [chatMessages, setChatMessages] = useState<Array<{sender: 'user' | 'jan', message: string, timestamp: string}>>([
    {
      sender: 'jan',
      message: 'Hey Chef! 👋 Ready to create some amazing content? Select a persona to set the context, and let\'s get brainstorming!',
      timestamp: new Date().toISOString()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [samples, setSamples] = useState<ProjectReference[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showAddSample, setShowAddSample] = useState(false);
  const [showViewSample, setShowViewSample] = useState(false);
  const [currentSample, setCurrentSample] = useState<ProjectReference | null>(null);
  const [newSample, setNewSample] = useState({ title: '', content: '', tags: '', notes: '' });

  // Theme colors
  const theme = {
    bg: isDarkMode ? '#1a202c' : '#ffffff',
    bgSecondary: isDarkMode ? '#2d3748' : '#f8f9fa',
    bgTertiary: isDarkMode ? '#4a5568' : '#e9ecef',
    text: isDarkMode ? '#f7fafc' : '#2d3748',
    textSecondary: isDarkMode ? '#e2e8f0' : '#4a5568',
    textMuted: isDarkMode ? '#a0aec0' : '#718096',
    border: isDarkMode ? '#4a5568' : '#e2e8f0',
    primary: '#667eea',
    primaryGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: '#28a745',
    shadow: isDarkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)'
  };

  // Calculate word count and reading time
  useEffect(() => {
    const words = currentDocument.content.trim().split(/\s+/).filter(w => w.length > 0).length;
    const readingTime = Math.ceil(words / 200);
    setCurrentDocument(prev => ({
      ...prev,
      wordCount: words,
      readingTime: readingTime,
      lastModified: new Date().toISOString()
    }));
  }, [currentDocument.content]);

  // Initialize storage and load templates
  useEffect(() => {
    const initStorage = async () => {
      await initJanProjectStorage();
      await initializeDefaultTemplates(janProjectStorage);
      const loadedTemplates = await janProjectStorage.getAllTemplates();
      setTemplates(loadedTemplates);
    };
    initStorage();
  }, []);

  // Load samples when template is selected
  useEffect(() => {
    const loadSamples = async () => {
      if (selectedTemplate) {
        const templateSamples = await janProjectStorage.getReferencesByTemplate(selectedTemplate, 10);
        setSamples(templateSamples);
      }
    };
    loadSamples();
  }, [selectedTemplate]);

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentDocument.content || currentDocument.title) {
        localStorage.setItem('janDraft', JSON.stringify(currentDocument));
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [currentDocument]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('janDocumentDraft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setCurrentDocument(parsed);
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      sender: 'user' as const,
      message: chatInput,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    setTimeout(() => {
      const janResponse = generateJanResponse(chatInput, currentDocument);
      setChatMessages(prev => [...prev, {
        sender: 'jan',
        message: janResponse,
        timestamp: new Date().toISOString()
      }]);
    }, 1000);
  };

  const generateJanResponse = (userMsg: string, doc: JanDocument): string => {
    const lowerMsg = userMsg.toLowerCase();
    const persona = doc.character;
    const casualGreetings = ['Hey Chef!', 'Yo Chef!', 'What\'s up Chef!', 'Hey there!', 'Alright Chef!'];
    const randomGreeting = casualGreetings[Math.floor(Math.random() * casualGreetings.length)];

    if (lowerMsg.includes('rise and shine') || lowerMsg.includes('wake up')) {
      const sampleCount = samples.length;
      const sampleInfo = sampleCount > 0 ? ` I've got ${sampleCount} sample${sampleCount > 1 ? 's' : ''} saved for reference.` : '';
      return `${randomGreeting} ☕ I'm up! Ready to tackle whatever you've got cooking today.${sampleInfo} What are we working on?`;
    }

    if (lowerMsg.includes('help') || lowerMsg.includes('assist')) {
      return `${randomGreeting} I've got your back! I can help with:\n\n📝 Content creation & writing\n🎯 Brainstorming ideas\n📚 Training course development\n✨ Deep research & analysis\n💡 Strategy planning\n\nWhat do you need? Let's dive in!`;
    }

    if (lowerMsg.includes('create') || lowerMsg.includes('write') || lowerMsg.includes('content')) {
      const sampleContext = samples.length > 0 ? ` I can reference ${samples.length} saved sample${samples.length > 1 ? 's' : ''} to match your style.` : '';
      return `Let's create something awesome! ${persona ? `Writing as ${persona}` : 'Pick a persona from the sidebar'} - what's the topic and who's the audience?${sampleContext}`;
    }

    if (lowerMsg.includes('sample') || lowerMsg.includes('example') || lowerMsg.includes('last time')) {
      if (samples.length > 0) {
        const lastSample = samples[0];
        return `Got it! I've got ${samples.length} sample${samples.length > 1 ? 's' : ''} saved. The most recent one is "${lastSample.title}" from ${new Date(lastSample.createdAt).toLocaleDateString()}. Want me to reference that style?`;
      } else {
        return `No samples saved yet for this template, Chef. Once you publish something, add it as a sample so I can reference it next time!`;
      }
    }

    const casualResponses = [
      `${randomGreeting} What's on your mind?`,
      `I'm here, Chef! What do you need?`,
      `${randomGreeting} Let's make it happen. What are we tackling?`,
      `Alright, I'm listening. What's the plan?`,
      `${randomGreeting} Ready when you are. What's up?`
    ];

    const contextNote = persona ? ` (Working with ${persona}'s voice btw)` : '';
    return casualResponses[Math.floor(Math.random() * casualResponses.length)] + contextNote;
  };

  const handleNewDocument = () => {
    if (confirm('Create a new document? Any unsaved changes will be lost.')) {
      setCurrentDocument({
        title: '',
        character: '',
        brandVoice: '',
        templateType: '',
        themeLabel: '',
        targetAudience: '',
        contentPrompt: '',
        content: '',
        status: 'Not started',
        wordCount: 0,
        readingTime: 0,
        lastModified: new Date().toISOString()
      });
    }
  };

  const handleSaveDocument = () => {
    const savedDocs = JSON.parse(localStorage.getItem('janSavedDocuments') || '[]');
    const docToSave = { ...currentDocument, id: Date.now().toString() };
    savedDocs.push(docToSave);
    localStorage.setItem('janSavedDocuments', JSON.stringify(savedDocs));
    alert('Document saved successfully!');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
      paddingTop: '80px',
      padding: '80px 20px 20px 20px'
    }}>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
      
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Dashboard Header */}
        <div style={{
          backgroundColor: isDarkMode ? '#1e293b' : 'white',
          boxShadow: isDarkMode 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          border: `1px solid ${isDarkMode ? '#334155' : '#3b82f6'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: isDarkMode ? '#60a5fa' : '#3b82f6',
                margin: '0 0 8px 0'
              }}>
                🤖 Jan - AI Assistant
              </h1>
              <p style={{
                color: isDarkMode ? '#94a3b8' : '#6b7280',
                fontSize: '14px',
                margin: '0'
              }}>
                Your Right-Hand for Content Creation & Strategy
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: isOnline ? '#10b981' : '#ef4444',
                animation: isOnline ? 'pulse 2s infinite' : 'none'
              }} />
              <span style={{ 
                fontSize: '12px', 
                color: isDarkMode ? '#94a3b8' : '#6b7280',
                fontWeight: '600'
              }}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {/* Left Sidebar */}
          <aside style={{
            width: '280px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Character Profile - 3 in one row */}
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: theme.text }}>
                👤 Persona
              </h3>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['Anica', 'Caelum', 'Aurion'].map(char => (
                  <button
                    key={char}
                    onClick={() => setCurrentDocument({...currentDocument, character: char})}
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      backgroundColor: currentDocument.character === char ? theme.primary : theme.bgSecondary,
                      color: currentDocument.character === char ? 'white' : theme.text,
                      border: `1px solid ${currentDocument.character === char ? theme.primary : theme.border}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                  >
                    {char}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Voice */}
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: theme.text }}>
                🎨 Brand Voice
              </h3>
              <select
                value={currentDocument.brandVoice}
                onChange={(e) => setCurrentDocument({...currentDocument, brandVoice: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: theme.bg,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  fontSize: '13px'
                }}
              >
                <option value="">Select brand voice...</option>
                <option value="Casual">Casual</option>
                <option value="Friendly">Friendly</option>
                <option value="Professional">Professional</option>
                <option value="Creative">Creative</option>
              </select>
            </div>

            {/* Theme/Label */}
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: theme.text }}>
                🏷️ Theme/Label
              </h3>
              <select
                value={currentDocument.themeLabel}
                onChange={(e) => setCurrentDocument({...currentDocument, themeLabel: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: theme.bg,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  fontSize: '13px'
                }}
              >
                <option value="">Select theme...</option>
                <option value="News Alert">News Alert</option>
                <option value="Promotion">Promotion</option>
                <option value="Standard Post">Standard Post</option>
                <option value="CTA - Quiz">CTA - Quiz</option>
                <option value="CTA - Game">CTA - Game</option>
                <option value="CTA - Puzzle">CTA - Puzzle</option>
                <option value="CTA - Challenge">CTA - Challenge</option>
                <option value="News">News</option>
                <option value="Blog">Blog</option>
                <option value="Tutorial Guide">Tutorial Guide</option>
                <option value="Course, Tool">Course, Tool</option>
                <option value="Assessment">Assessment</option>
              </select>
            </div>

            {/* Target Audience */}
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: theme.text }}>
                🎯 Target Audience
              </h3>
              <select
                value={currentDocument.targetAudience}
                onChange={(e) => setCurrentDocument({...currentDocument, targetAudience: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: theme.bg,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  fontSize: '13px'
                }}
              >
                <option value="">Select audience...</option>
                <option value="Existing Members">Existing Members</option>
                <option value="New Members">New Members</option>
                <option value="Persona FALCON">Persona FALCON</option>
                <option value="Persona PANTHER">Persona PANTHER</option>
                <option value="Persona WOLF">Persona WOLF</option>
                <option value="Persona LION">Persona LION</option>
                <option value="General Public">General Public</option>
              </select>
            </div>

            {/* Template Type */}
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: theme.text }}>
                📄 Template Type
              </h3>
              <select
                value={currentDocument.templateType}
                onChange={(e) => setCurrentDocument({...currentDocument, templateType: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: theme.bg,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  fontSize: '13px'
                }}
              >
                <option value="">Select template...</option>
                <option value="Social Media">Social Media</option>
                <option value="Presentation">Presentation</option>
                <option value="Video Message">Video Message</option>
                <option value="Anica Chat">Anica Chat</option>
                <option value="Blog Posts">Blog Posts</option>
                <option value="News Article">News Article</option>
                <option value="Newsletter">Newsletter</option>
                <option value="Email Templates">Email Templates</option>
                <option value="Custom Templates">Custom Templates</option>
              </select>
            </div>

            {/* Content Prompt */}
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: theme.text }}>
                💭 Content Prompt
              </h3>
              <textarea
                placeholder="Describe what you want to create..."
                value={currentDocument.contentPrompt}
                onChange={(e) => setCurrentDocument({...currentDocument, contentPrompt: e.target.value})}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: theme.bg,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  fontSize: '13px',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Stats */}
            <div style={{
              padding: '12px',
              backgroundColor: theme.bgTertiary,
              borderRadius: '6px',
              fontSize: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ marginBottom: '6px' }}>
                <strong>Words:</strong> {currentDocument.wordCount}
              </div>
              <div>
                <strong>Reading Time:</strong> {currentDocument.readingTime} min
              </div>
            </div>

            {/* Reference Samples */}
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: theme.text }}>
                📚 Reference Samples
              </h3>
              <p style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '8px' }}>
                Save final published content as examples
              </p>
              
              {/* Template Selector */}
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: theme.bg,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  fontSize: '12px',
                  marginBottom: '8px'
                }}
              >
                <option value="">Select template...</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.timesUsed} saved)
                  </option>
                ))}
              </select>

              {/* Sample List */}
              {selectedTemplate && (
                <div style={{
                  backgroundColor: theme.bgTertiary,
                  borderRadius: '6px',
                  padding: '8px',
                  marginBottom: '8px',
                  maxHeight: '150px',
                  overflowY: 'auto'
                }}>
                  {samples.length > 0 ? (
                    <div>
                      <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '6px' }}>
                        {samples.length} sample{samples.length > 1 ? 's' : ''} saved
                      </div>
                      {samples.map(sample => (
                        <div
                          key={sample.id}
                          onClick={() => {
                            setCurrentSample(sample);
                            setShowViewSample(true);
                          }}
                          style={{
                            padding: '6px',
                            backgroundColor: theme.bg,
                            borderRadius: '4px',
                            marginBottom: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.primary + '20'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.bg}
                        >
                          <div style={{ fontWeight: '600', marginBottom: '2px' }}>{sample.title}</div>
                          <div style={{ fontSize: '10px', color: theme.textMuted }}>
                            {new Date(sample.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '11px', color: theme.textMuted, textAlign: 'center', padding: '8px' }}>
                      No samples yet. Add one after publishing!
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <button
                onClick={() => {
                  if (selectedTemplate) {
                    setShowAddSample(true);
                  }
                }}
                disabled={!selectedTemplate}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: selectedTemplate ? theme.primary : theme.bgTertiary,
                  color: selectedTemplate ? 'white' : theme.textMuted,
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: selectedTemplate ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s'
                }}
              >
                + Add Sample
              </button>
            </div>
          </aside>

          {/* Main Editor */}
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: '400px' }}>
            {/* Toolbar */}
            <div style={{
              padding: '16px 24px',
              backgroundColor: theme.bgSecondary,
              borderBottom: `1px solid ${theme.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleNewDocument}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: theme.bg,
                    color: theme.text,
                    border: `2px solid ${theme.border}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  📄 New
                </button>
                <button
                  onClick={handleSaveDocument}
                  style={{
                    padding: '10px 16px',
                    background: theme.primaryGradient,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  💾 Save
                </button>
                <select
                  value={currentDocument.status}
                  onChange={(e) => setCurrentDocument({...currentDocument, status: e.target.value})}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: theme.bg,
                    color: theme.text,
                    border: `2px solid ${theme.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  <option value="Not started">Not started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Complete">Complete</option>
                  <option value="Published">Published</option>
                </select>
              </div>
              <button
                onClick={() => setShowPreview(!showPreview)}
                style={{
                  padding: '10px 16px',
                  backgroundColor: showPreview ? theme.primary : theme.bg,
                  color: showPreview ? 'white' : theme.text,
                  border: `2px solid ${showPreview ? theme.primary : theme.border}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                👁️ {showPreview ? 'Hide' : 'Show'} Preview
              </button>
            </div>

            {/* Editor Workspace */}
            <div style={{ flex: 1, padding: '32px', overflowY: 'auto', backgroundColor: theme.bg }}>
              <input
                type="text"
                placeholder="Document Title..."
                value={currentDocument.title}
                onChange={(e) => setCurrentDocument({...currentDocument, title: e.target.value})}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '32px',
                  fontWeight: '700',
                  backgroundColor: 'transparent',
                  color: theme.text,
                  border: 'none',
                  borderBottom: `2px solid ${theme.border}`,
                  marginBottom: '24px',
                  outline: 'none'
                }}
              />
              <textarea
                placeholder="Start writing your content here..."
                value={currentDocument.content}
                onChange={(e) => setCurrentDocument({...currentDocument, content: e.target.value})}
                style={{
                  width: '100%',
                  minHeight: '400px',
                  padding: '16px',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  backgroundColor: 'transparent',
                  color: theme.text,
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </main>

          {/* Chat Panel */}
          <aside style={{
            width: '380px',
            backgroundColor: theme.bgSecondary,
            borderLeft: `1px solid ${theme.border}`,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: `1px solid ${theme.border}`,
              backgroundColor: theme.primaryGradient
            }}>
              <h3 style={{ margin: '0', color: 'white', fontSize: '18px', fontWeight: '600' }}>
                💬 Chat with Jan
              </h3>
            </div>
            
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} style={{
                  padding: '12px 16px',
                  backgroundColor: msg.sender === 'jan' ? theme.bgTertiary : theme.primary,
                  color: msg.sender === 'jan' ? theme.text : 'white',
                  borderRadius: '12px',
                  maxWidth: '85%',
                  alignSelf: msg.sender === 'jan' ? 'flex-start' : 'flex-end',
                  whiteSpace: 'pre-wrap',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  <strong>{msg.sender === 'jan' ? 'Jan:' : 'You:'}</strong> {msg.message}
                </div>
              ))}
            </div>

            <div style={{
              padding: '20px',
              borderTop: `1px solid ${theme.border}`,
              backgroundColor: theme.bg
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Ask Jan anything..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: theme.bgSecondary,
                    color: theme.text,
                    border: `2px solid ${theme.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  style={{
                    padding: '12px 20px',
                    background: theme.primaryGradient,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Add Sample Modal */}
        {showAddSample && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: theme.bg,
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
              <h2 style={{ margin: '0 0 8px 0', color: theme.text, fontSize: '20px' }}>
                Add Reference Sample
              </h2>
              <p style={{ margin: '0 0 20px 0', color: theme.textMuted, fontSize: '14px' }}>
                Paste your final published content to save as a reference example
              </p>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: theme.text }}>
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Productivity Tips Coffee Chat"
                  value={newSample.title}
                  onChange={(e) => setNewSample({...newSample, title: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: theme.bgSecondary,
                    color: theme.text,
                    border: `2px solid ${theme.border}`,
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: theme.text }}>
                  Final Content
                </label>
                <textarea
                  placeholder="Paste your final published content here..."
                  value={newSample.content}
                  onChange={(e) => setNewSample({...newSample, content: e.target.value})}
                  rows={12}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: theme.bgSecondary,
                    color: theme.text,
                    border: `2px solid ${theme.border}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: theme.text }}>
                  Tags (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., productivity, mindset, motivation"
                  value={newSample.tags}
                  onChange={(e) => setNewSample({...newSample, tags: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: theme.bgSecondary,
                    color: theme.text,
                    border: `2px solid ${theme.border}`,
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: theme.text }}>
                  Notes (optional)
                </label>
                <textarea
                  placeholder="Any notes about this sample..."
                  value={newSample.notes}
                  onChange={(e) => setNewSample({...newSample, notes: e.target.value})}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: theme.bgSecondary,
                    color: theme.text,
                    border: `2px solid ${theme.border}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowAddSample(false);
                    setNewSample({ title: '', content: '', tags: '', notes: '' });
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: theme.bgTertiary,
                    color: theme.text,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (newSample.title && newSample.content && selectedTemplate) {
                      const reference: ProjectReference = {
                        id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        templateId: selectedTemplate,
                        title: newSample.title,
                        content: newSample.content,
                        character: currentDocument.character,
                        createdAt: new Date().toISOString(),
                        tags: newSample.tags.split(',').map(t => t.trim()).filter(t => t)
                      };
                      if (newSample.notes) {
                        reference.performance = { notes: newSample.notes };
                      }
                      await janProjectStorage.saveReference(reference);
                      await janProjectStorage.updateTemplateUsage(selectedTemplate);
                      
                      const updatedSamples = await janProjectStorage.getReferencesByTemplate(selectedTemplate, 10);
                      setSamples(updatedSamples);
                      
                      const updatedTemplates = await janProjectStorage.getAllTemplates();
                      setTemplates(updatedTemplates);
                      
                      setShowAddSample(false);
                      setNewSample({ title: '', content: '', tags: '', notes: '' });
                      
                      setChatMessages(prev => [...prev, {
                        sender: 'jan',
                        message: `✅ Sample saved! I've got ${updatedSamples.length} example${updatedSamples.length > 1 ? 's' : ''} for this template now. I can reference "${newSample.title}" next time we work on similar content!`,
                        timestamp: new Date().toISOString()
                      }]);
                    }
                  }}
                  disabled={!newSample.title || !newSample.content}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: (newSample.title && newSample.content) ? theme.primary : theme.bgTertiary,
                    color: (newSample.title && newSample.content) ? 'white' : theme.textMuted,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: (newSample.title && newSample.content) ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Save Sample
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Sample Modal */}
        {showViewSample && currentSample && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: theme.bg,
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '700px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
              <h2 style={{ margin: '0 0 4px 0', color: theme.text, fontSize: '20px' }}>
                {currentSample.title}
              </h2>
              <div style={{ marginBottom: '16px', fontSize: '13px', color: theme.textMuted }}>
                {currentSample.character && <span>Character: {currentSample.character} • </span>}
                {new Date(currentSample.createdAt).toLocaleDateString()}
              </div>

              <div style={{
                padding: '16px',
                backgroundColor: theme.bgSecondary,
                borderRadius: '8px',
                marginBottom: '16px',
                whiteSpace: 'pre-wrap',
                fontSize: '14px',
                lineHeight: '1.6',
                color: theme.text,
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                {currentSample.content}
              </div>

              {currentSample.tags && currentSample.tags.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: theme.textMuted }}>
                    Tags:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {currentSample.tags.map((tag, i) => (
                      <span key={i} style={{
                        padding: '4px 10px',
                        backgroundColor: theme.bgTertiary,
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: theme.text
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {currentSample.performance?.notes && (
                <div style={{
                  padding: '12px',
                  backgroundColor: theme.bgTertiary,
                  borderRadius: '6px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  color: theme.text
                }}>
                  <strong>Notes:</strong> {currentSample.performance.notes}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentSample.content);
                    alert('Content copied to clipboard!');
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: theme.bgTertiary,
                    color: theme.text,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  📋 Copy Content
                </button>
                <button
                  onClick={() => {
                    setShowViewSample(false);
                    setCurrentSample(null);
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: theme.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChatComponent;
