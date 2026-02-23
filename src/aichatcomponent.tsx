// Jan AI Assistant Component - Integrated with 3c-desktop-editor
import React, { useState, useEffect, useRef } from 'react';
import janProfile from './assets/jan-profile.png';
import { janProjectStorage, initJanProjectStorage, ContentTemplate, ProjectReference } from './utils/janProjectStorage';
import { defaultTemplates, initializeDefaultTemplates } from './utils/defaultTemplates';
import { janChatStorage, initJanChatStorage } from './utils/janChatStorage';

// ============================================================
// CLOUDFLARE WORKER URL — Jan's secure API proxy
// ============================================================
const WORKER_URL = 'https://jan-assistant.3c-innertherapy.workers.dev/';

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
  const [isLoading, setIsLoading] = useState(false);
  const [sessionTokens, setSessionTokens] = useState({ input: 0, output: 0 });
  const COST_PER_INPUT_TOKEN = 0.000003;  // Sonnet 4.6 input rate
  const COST_PER_OUTPUT_TOKEN = 0.000015; // Sonnet 4.6 output rate
  const WARNING_THRESHOLD = 3.00;         // Alert when $3 spent this session
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

  // API messages array — full conversation history passed to Claude each call
  const apiMessages = useRef<Array<{role: 'user' | 'assistant', content: string}>>([]);

  // Theme colors — unchanged
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

  // Calculate word count and reading time — unchanged
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

  // Initialize storage and load templates — unchanged + connect janChatStorage
  useEffect(() => {
    const initStorage = async () => {
      await initJanProjectStorage();
      await initJanChatStorage();
      await initializeDefaultTemplates(janProjectStorage);
      const loadedTemplates = await janProjectStorage.getAllTemplates();
      setTemplates(loadedTemplates);
    };
    initStorage();
  }, []);

  // Load samples when template is selected — unchanged
  useEffect(() => {
    const loadSamples = async () => {
      if (selectedTemplate) {
        const templateSamples = await janProjectStorage.getReferencesByTemplate(selectedTemplate, 10);
        setSamples(templateSamples);
      }
    };
    loadSamples();
  }, [selectedTemplate]);

  // Auto-save draft — unchanged
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentDocument.content || currentDocument.title) {
        localStorage.setItem('janDraft', JSON.stringify(currentDocument));
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [currentDocument]);

  // Load draft on mount — unchanged
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
    
    const savedPrompt = localStorage.getItem('janLastContentPrompt');
    if (savedPrompt && !currentDocument.contentPrompt) {
      setCurrentDocument(prev => ({
        ...prev,
        contentPrompt: savedPrompt
      }));
    }
  }, []);

  // Save Content Prompt to memory when it changes — unchanged
  useEffect(() => {
    if (currentDocument.contentPrompt) {
      localStorage.setItem('janLastContentPrompt', currentDocument.contentPrompt);
    }
  }, [currentDocument.contentPrompt]);

  // ============================================================
  // BUILD JAN'S SYSTEM PROMPT from dropdown context
  // This is what makes Jan understand who she is and what to do
  // ============================================================
  const buildSystemPrompt = (doc: JanDocument): string => {
    const sampleContext = samples.length > 0
      ? `\n\nREFERENCE SAMPLES AVAILABLE: ${samples.length} saved samples for this template type. Use them to match established style and quality.`
      : '';

    return `You are Jan, the 3C AI Creative Director, Marketing Intelligence Strategist, and Lifeline Mentor. You are the Dolphin of the Core Spirit Team — bringing joy, harmony, emotional intelligence, and creative connection to every session. You are not passive. You are a proactive, grounded, and deeply knowledgeable creative partner who lives and breathes the 3C brand.

YOUR IDENTITY WITHIN 3C:
- Your animal spirit is the Dolphin — joy, harmony, emotional intelligence, compassion, intuition. You bring light into heavy places.
- Your official role: 3C Assistant-Support, Lifeline Anchor, and Mentor in the 3C Guardian group.
- You are the stabilizer — always grounded, always intentional, always supportive.
- You call the user "Chef" as your signature greeting.
- Confident, creative, direct. You give real opinions, not validation. You push back with better ideas when you see a stronger angle.

THE 3C BRAND — FULL CONTEXT:
Brand: 3C Thread to Success | www.3c-innergrowth.com
Tagline: "Think it. Do it. Own it."
3C = Conscious Confident Choices
Vision: Igniting a vibrant community where dreams ignite, and people nurture a growth mindset that turns lives into purpose-driven adventures.
Mission: To inspire individuals to craft a life they genuinely adore while nurturing a beautiful spirit that cherishes gratitude in daily life.
Values: Clarity, courage, commitment, respect. No ego, no noise — just growth, service, and real transformation. Space for growth, not ego.

THE CORE SPIRIT TEAM — WHO IS WHO:
ANICA — Project Founder (Lifeline Cat)
The Cat spirit: master of timing, intuition, sovereign grace. Intuitive, intentional, grounded in service. Quiet presence, immense power. Stays out of spotlight, steps forward to recalibrate or lead major transitions.
Content voice: Warm, mentor-like, encouraging. Builds deep connection. Signs off with "Keep Leveling Up!"

CAELUM — Chief Advisor & PR Manager (Lifeline Eagle & Doberman)
Eagle spirit: truth, clarity, divine perspective, leads with wisdom. Doberman spirit: loyalty, protection, focused discipline — guards mission integrity. Translates energy into direction. Keeps brand voice sharp and shielded. The Signal Caller.
Content voice: Professional, strategic, polished, authentic. Structured with clear headers and action items.

AURION — 3C Mascot, Guardian & Guide (Lifeline Eagle & Anchor)
The friendly, intuitive face of the brand. Takes center stage with personality, presence, and playfulness. The 3C Guide — welcoming pulse of the community, first light at the door. Members see, hear, and interact with Aurion most.
Content voice: Energetic, creative, enthusiastic, uplifting. Uses emojis for visual impact. Short, punchy, shareable. Signs off with "Keep Crushing it, Champs!!"

JAN — That is you. Assistant-Support, Lifeline Mentor & Anchor (Dolphin)
Stabilizer and system whisperer. Operates beneath the surface keeping all parts aligned with 3C core. Grounds the flow. Your dependable presence allows others to trust the process and focus on purpose.

THE 3C MEMBER LEVELS (Animal Badges):
FALCON — Vision and direction. High achievers, results-driven.
PANTHER — Strategic thinkers. Calculated, precise, focused.
WOLF — Community-focused, loyal. Rise together.
LION — Leaders, ambitious, bold, purposeful.
Each level receives a level-specific handbook and an animal badge token visible in the chatroom.

COMMUNITY GROUPS:
- Torchbearers (Guests) — bring fresh energy and wisdom. Every light matters.
- Legacy Planters (VIP) — long-term impact, honored contributors.
- Existing Members — deepening their journey.
- New Members — stepping in, need warmth and clear direction.
- General Public — awareness and introduction to 3C.

CURRENT SESSION CONTEXT:
${doc.character ? `- Speaking as: ${doc.character}` : '- No persona selected yet (ask Chef to select one)'}
${doc.brandVoice ? `- Brand Voice: ${doc.brandVoice}` : ''}
${doc.themeLabel ? `- Content Theme: ${doc.themeLabel}` : ''}
${doc.targetAudience ? `- Target Audience: ${doc.targetAudience}` : ''}
${doc.templateType ? `- Template Type: ${doc.templateType}` : ''}
${doc.title ? `- Current Document Title: ${doc.title}` : ''}
${doc.contentPrompt ? `\nCONTENT PROMPT (apply ONLY when Chef explicitly requests content creation or writing — NOT during brainstorming, general conversation, or strategy discussions):\n${doc.contentPrompt}` : ''}${sampleContext}

YOUR APPROACH:
- Read the dropdown context above before every response — it defines the current task.
- BRAINSTORMING MODE: When Chef is thinking out loud, exploring ideas, or chatting — respond freely and creatively. Do NOT apply the Content Prompt. Just think with Chef.
- CONTENT CREATION MODE: Only when Chef explicitly asks you to write, create, or draft something — apply the Content Prompt and persona voice.
- For brainstorming sessions, bring 2-3 original ideas before asking which direction to pursue.
- For long-form content (guides, courses, articles), structure it properly with clear sections.
- Always confirm key parameters if something critical is missing before generating long content.
- When Chef says "same structure but shorter" or similar — adapt, don't rebuild from scratch.
- This is Chat 2 (3C Control Center) — the creative engine. Full brainstorming, strategy, content creation. No limits on complexity here.
- The brand voice and culture apply to ALL content Jan creates — not just specific templates. Always write from within the 3C brand world.`;
  };

  // ============================================================
  // CALL JAN VIA CLOUDFLARE WORKER — real Claude API
  // ============================================================
  const callJanAPI = async (userMessage: string, doc: JanDocument): Promise<string> => {
    // Add user message to API history
    apiMessages.current.push({
      role: 'user',
      content: userMessage
    });

    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        system: buildSystemPrompt(doc),
        messages: apiMessages.current
      })
    });

    if (!response.ok) {
      throw new Error(`Worker error: ${response.status}`);
    }

    const data = await response.json();

    // Extract text response from Claude API format
    const janReply = data.content?.[0]?.text || 'Sorry Chef, I had trouble processing that. Please try again.';

    // Track token usage from API response
    if (data.usage) {
      setSessionTokens(prev => ({
        input: prev.input + (data.usage.input_tokens || 0),
        output: prev.output + (data.usage.output_tokens || 0)
      }));
    }

    // Add Jan's response to API history for next turn memory
    apiMessages.current.push({
      role: 'assistant',
      content: janReply
    });

    // Persist to janChatStorage so session survives page refresh
    try {
      const sessionId = janChatStorage.getCurrentSessionId();
      await janChatStorage.saveMessage({
        id: `msg_${Date.now()}_user`,
        sender: 'user',
        message: userMessage,
        timestamp: new Date().toISOString(),
        context: {
          character: doc.character,
          brandVoice: doc.brandVoice,
          templateType: doc.templateType,
          documentTitle: doc.title
        }
      }, sessionId);
      await janChatStorage.saveMessage({
        id: `msg_${Date.now()}_jan`,
        sender: 'jan',
        message: janReply,
        timestamp: new Date().toISOString()
      }, sessionId);
    } catch (storageError) {
      console.error('Chat storage error (non-critical):', storageError);
    }

    return janReply;
  };

  // ============================================================
  // HANDLE SEND — now async with real API call
  // ============================================================
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isLoading) return;

    const userMessage = chatInput;

    const userChatMessage = {
      sender: 'user' as const,
      message: userMessage,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userChatMessage]);
    setChatInput('');
    setIsLoading(true);

    // Extract title from message if present — unchanged logic
    const extractedTitle = extractTitleFromMessage(userMessage);
    if (extractedTitle && !currentDocument.title) {
      setCurrentDocument(prev => ({...prev, title: extractedTitle}));
    }

    try {
      const janReply = await callJanAPI(userMessage, currentDocument);
      setChatMessages(prev => [...prev, {
        sender: 'jan',
        message: janReply,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Jan API error:', error);
      setChatMessages(prev => [...prev, {
        sender: 'jan',
        message: 'Chef, I\'m having trouble connecting right now. Check the Worker is deployed and try again! 🔧',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract title from message — unchanged
  const extractTitleFromMessage = (message: string): string | null => {
    const titlePattern1 = /title:\s*(.+?)(?:\n|$)/i;
    const match1 = message.match(titlePattern1);
    if (match1) return match1[1].trim();

    const issuePattern = /\*?\*?Issue\s*#?\d+\s*[-–—]\s*(.+?)(?:\*\*|\n|$)/i;
    const match2 = message.match(issuePattern);
    if (match2) return match2[0].replace(/\*\*/g, '').trim();

    const quotePattern = /"([^"]+)"/;
    const match3 = message.match(quotePattern);
    if (match3) return match3[1].trim();

    const boldPattern = /\*\*([^*]+)\*\*/;
    const match4 = message.match(boldPattern);
    if (match4) return match4[1].trim();

    return null;
  };

  // Handle new document — unchanged
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
      // Clear API message history for new document session
      apiMessages.current = [];
    }
  };

  // Handle save document — unchanged
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
          @keyframes thinking {
            0%, 80%, 100% { transform: scale(0); opacity: 0; }
            40% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
      
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Dashboard Header with Jan's Profile Image — unchanged */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img 
                src={janProfile} 
                alt="Jan Profile" 
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `2px solid ${isDarkMode ? '#60a5fa' : '#3b82f6'}`
                }}
              />
              <div>
                <h1 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: isDarkMode ? '#60a5fa' : '#3b82f6',
                  margin: '0 0 4px 0'
                }}>
                  Jan - AI Assistant
                </h1>
                <p style={{
                  color: isDarkMode ? '#94a3b8' : '#6b7280',
                  fontSize: '14px',
                  margin: '0'
                }}>
                  Your Right-Hand for Content Creation & Strategy
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Token Cost Tracker + Billing Link */}
              {(() => {
                const sessionCost = (sessionTokens.input * COST_PER_INPUT_TOKEN) + (sessionTokens.output * COST_PER_OUTPUT_TOKEN);
                const isWarning = sessionCost >= WARNING_THRESHOLD;
                const isCritical = sessionCost >= WARNING_THRESHOLD + 1.00;
                const pillColor = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';
                const pillBg = isCritical ? 'rgba(239,68,68,0.15)' : isWarning ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)';
                const totalTokens = sessionTokens.input + sessionTokens.output;
                return (
                  <a
                    href="https://console.anthropic.com/settings/billing"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={isWarning ? '⚠️ Credits running low — click to top up!' : 'Session token usage — click to manage billing'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 10px',
                      backgroundColor: pillBg,
                      border: `1px solid ${pillColor}`,
                      borderRadius: '20px',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: pillColor,
                      animation: isWarning ? 'pulse 1s infinite' : 'none',
                      flexShrink: 0
                    }} />
                    <span style={{ fontSize: '11px', fontWeight: '600', color: pillColor, whiteSpace: 'nowrap' }}>
                      {totalTokens > 0 ? `$${sessionCost.toFixed(4)}` : '$0.00'}
                      {isWarning && ' ⚠️'}
                    </span>
                  </a>
                );
              })()}

              {/* Online indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
        </div>

        {/* Control Panel - Dropdowns in Horizontal Rows — unchanged */}
        <div style={{
          backgroundColor: theme.bgSecondary,
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: theme.shadow
        }}>
          {/* Row 1: Persona + Brand Voice + Theme/Label */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {/* Persona */}
            <div style={{ flex: '1 1 300px', minWidth: '250px' }}>
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
                      padding: '10px 8px',
                      backgroundColor: currentDocument.character === char ? theme.primary : theme.bg,
                      color: currentDocument.character === char ? 'white' : theme.text,
                      border: `2px solid ${currentDocument.character === char ? theme.primary : theme.border}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
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
            <div style={{ flex: '1 1 250px', minWidth: '200px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: theme.text }}>
                🎨 Brand Voice
              </h3>
              <select
                value={currentDocument.brandVoice}
                onChange={(e) => setCurrentDocument({...currentDocument, brandVoice: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: theme.bg,
                  color: theme.text,
                  border: `2px solid ${theme.border}`,
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500'
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
            <div style={{ flex: '1 1 250px', minWidth: '200px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: theme.text }}>
                🏷️ Theme/Label
              </h3>
              <select
                value={currentDocument.themeLabel}
                onChange={(e) => setCurrentDocument({...currentDocument, themeLabel: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: theme.bg,
                  color: theme.text,
                  border: `2px solid ${theme.border}`,
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500'
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
          </div>

          {/* Row 2: Target Audience + Template Type + Content Prompt */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {/* Target Audience */}
            <div style={{ flex: '1 1 250px', minWidth: '200px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: theme.text }}>
                🎯 Target Audience
              </h3>
              <select
                value={currentDocument.targetAudience}
                onChange={(e) => setCurrentDocument({...currentDocument, targetAudience: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: theme.bg,
                  color: theme.text,
                  border: `2px solid ${theme.border}`,
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500'
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
            <div style={{ flex: '1 1 250px', minWidth: '200px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: theme.text }}>
                📄 Template Type
              </h3>
              <select
                value={currentDocument.templateType}
                onChange={(e) => setCurrentDocument({...currentDocument, templateType: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: theme.bg,
                  color: theme.text,
                  border: `2px solid ${theme.border}`,
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500'
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
            <div style={{ flex: '2 1 400px', minWidth: '300px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: theme.text }}>
                💭 Content Prompt
              </h3>
              <input
                type="text"
                placeholder="Describe what you'd like to create..."
                value={currentDocument.contentPrompt}
                onChange={(e) => setCurrentDocument({...currentDocument, contentPrompt: e.target.value})}
                style={{
                  width: '85%',
                  padding: '10px',
                  backgroundColor: theme.bg,
                  color: theme.text,
                  border: `2px solid ${theme.border}`,
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              />
            </div>
          </div>

          {/* Row 3: Reference Samples + Stats + Actions — unchanged */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Reference Samples */}
            <div style={{ flex: '2 1 400px', minWidth: '300px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: theme.text }}>
                📚 Reference Samples
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: theme.bg,
                    color: theme.text,
                    border: `2px solid ${theme.border}`,
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  <option value="">Select template...</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.timesUsed} saved)
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (selectedTemplate) {
                      setShowAddSample(true);
                    }
                  }}
                  disabled={!selectedTemplate}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: selectedTemplate ? theme.primary : theme.bgTertiary,
                    color: selectedTemplate ? 'white' : theme.textMuted,
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: selectedTemplate ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  + Add Sample
                </button>
              </div>
              {selectedTemplate && samples.length > 0 && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: theme.textMuted }}>
                  {samples.length} sample{samples.length > 1 ? 's' : ''} available - click to view
                </div>
              )}
            </div>

            {/* Stats */}
            <div style={{ flex: '1 1 200px', minWidth: '150px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: theme.text }}>
                📊 Stats
              </h3>
              <div style={{
                padding: '10px',
                backgroundColor: theme.bgTertiary,
                borderRadius: '6px',
                fontSize: '12px',
                display: 'flex',
                gap: '16px'
              }}>
                <div>
                  <strong>Words:</strong> {currentDocument.wordCount}
                </div>
                <div>
                  <strong>Reading:</strong> {currentDocument.readingTime} min
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ flex: '1 1 250px', minWidth: '200px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: theme.text }}>
                ⚡ Actions
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleNewDocument}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: theme.bg,
                    color: theme.text,
                    border: `2px solid ${theme.border}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px'
                  }}
                >
                  📄 New
                </button>
                <button
                  onClick={handleSaveDocument}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: theme.primaryGradient,
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px'
                  }}
                >
                  💾 Save
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area - Editor + Chat Side by Side — unchanged */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {/* Editor */}
          <div style={{ 
            flex: '1 1 500px', 
            minWidth: '400px',
            backgroundColor: theme.bg,
            borderRadius: '8px',
            boxShadow: theme.shadow,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: `2px solid ${theme.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: theme.text }}>
                ✍️ Content Editor
              </h3>
              <select
                value={currentDocument.status}
                onChange={(e) => setCurrentDocument({...currentDocument, status: e.target.value})}
                style={{
                  padding: '8px 12px',
                  backgroundColor: theme.bgSecondary,
                  color: theme.text,
                  border: `2px solid ${theme.border}`,
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                <option value="Not started">Not started</option>
                <option value="In Progress">In Progress</option>
                <option value="Complete">Complete</option>
                <option value="Published">Published</option>
              </select>
            </div>
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
              <input
                type="text"
                placeholder="Document Title..."
                value={currentDocument.title}
                onChange={(e) => setCurrentDocument({...currentDocument, title: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '24px',
                  fontWeight: '700',
                  backgroundColor: 'transparent',
                  color: theme.text,
                  border: 'none',
                  borderBottom: `2px solid ${theme.border}`,
                  marginBottom: '20px',
                  outline: 'none'
                }}
              />
              <textarea
                placeholder="Start writing your content here..."
                value={currentDocument.content}
                onChange={(e) => setCurrentDocument({...currentDocument, content: e.target.value})}
                style={{
                  width: '100%',
                  minHeight: '300px',
                  padding: '12px',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  backgroundColor: 'transparent',
                  color: theme.text,
                  border: 'none',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          {/* Samples Viewer — unchanged */}
          {selectedTemplate && samples.length > 0 && (
            <div style={{ 
              flex: '0 1 350px',
              minWidth: '300px',
              backgroundColor: theme.bgSecondary,
              borderRadius: '8px',
              boxShadow: theme.shadow,
              padding: '20px',
              maxHeight: '500px',
              overflowY: 'auto'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: theme.text }}>
                📚 Saved Samples
              </h3>
              {samples.map(sample => (
                <div
                  key={sample.id}
                  onClick={() => {
                    setCurrentSample(sample);
                    setShowViewSample(true);
                  }}
                  style={{
                    padding: '12px',
                    backgroundColor: theme.bg,
                    borderRadius: '6px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: `1px solid ${theme.border}`
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ fontWeight: '600', marginBottom: '4px', fontSize: '14px', color: theme.text }}>
                    {sample.title}
                  </div>
                  <div style={{ fontSize: '12px', color: theme.textMuted }}>
                    {sample.character && `${sample.character} • `}
                    {new Date(sample.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Area - Full Width at Bottom */}
        <div style={{
          backgroundColor: theme.bgSecondary,
          borderRadius: '8px',
          boxShadow: theme.shadow,
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px 20px',
            background: theme.primaryGradient,
            borderBottom: `2px solid ${theme.border}`
          }}>
            <h3 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: '600' }}>
              💬 Chat with Jan
            </h3>
          </div>
          
          <div style={{
            height: '350px',
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} style={{
                padding: '12px 16px',
                backgroundColor: msg.sender === 'jan' ? theme.bgTertiary : theme.primary,
                color: msg.sender === 'jan' ? theme.text : 'white',
                borderRadius: '12px',
                maxWidth: '75%',
                alignSelf: msg.sender === 'jan' ? 'flex-start' : 'flex-end',
                whiteSpace: 'pre-wrap',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                <strong>{msg.sender === 'jan' ? 'Jan:' : 'You:'}</strong> {msg.message}
              </div>
            ))}

            {/* Loading indicator — Jan is thinking */}
            {isLoading && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: theme.bgTertiary,
                borderRadius: '12px',
                maxWidth: '75%',
                alignSelf: 'flex-start',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: theme.textMuted
              }}>
                <span>Jan is thinking</span>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: theme.primary,
                    animation: `thinking 1.4s ease-in-out ${i * 0.16}s infinite`
                  }} />
                ))}
              </div>
            )}
          </div>

          <div style={{
            padding: '16px 20px',
            borderTop: `2px solid ${theme.border}`,
            backgroundColor: theme.bg
          }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                placeholder="Ask Jan anything..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  backgroundColor: theme.bgSecondary,
                  color: theme.text,
                  border: `2px solid ${theme.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  opacity: isLoading ? 0.6 : 1
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                style={{
                  padding: '12px 24px',
                  background: isLoading ? theme.bgTertiary : theme.primaryGradient,
                  color: isLoading ? theme.textMuted : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                {isLoading ? '...' : 'Send'}
              </button>
            </div>
          </div>
        </div>

        {/* Add Sample Modal — unchanged */}
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

        {/* View Sample Modal — unchanged */}
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
