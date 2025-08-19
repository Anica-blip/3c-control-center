import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  message: string;
  characterProfile?: string;
  conversationHistory?: ChatMessage[];
  provider?: 'openai' | 'jan' | 'anthropic' | 'inference';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, characterProfile, conversationHistory = [], provider = 'openai' }: ChatRequest = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get character profile context if specified
    let systemPrompt = `You are an AI assistant specialized in content management, marketing, and social media strategy. You help with:
- Content creation and planning
- Social media strategy
- Marketing campaigns
- Project management
- Creative direction

Keep responses focused, actionable, and professional. Be concise but helpful.`;

    if (characterProfile) {
      const { data: profile } = await supabase
        .from('character_profiles')
        .select('*')
        .eq('username', characterProfile)
        .eq('is_active', true)
        .single();

      if (profile) {
        systemPrompt = `You are ${profile.name} (${profile.role}), an AI assistant with this personality: ${profile.description}. 
        
Focus on: ${profile.role === 'researcher' ? 'research, analysis, and data insights' : 
                  profile.role === 'creative' ? 'creative direction, content creation, and artistic vision' :
                  profile.role === 'strategist' ? 'strategy, planning, and optimization' :
                  'general assistance with content and marketing'}.

Keep responses in character and focused on your expertise area.`;
      }
    }

    // Check which AI provider to use based on available API keys
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    const janApiUrl = Deno.env.get('JAN_API_URL');
    const janApiKey = Deno.env.get('JAN_API_KEY');
    const inferenceNetKey = Deno.env.get('INFERENCE_NET_API_KEY');

    let aiResponse: string;

    // Try different providers based on availability and preference
    if (provider === 'inference' && inferenceNetKey) {
      aiResponse = await callInferenceNet(systemPrompt, message, conversationHistory, inferenceNetKey);
    } else if (provider === 'openai' && openaiKey) {
      aiResponse = await callOpenAI(systemPrompt, message, conversationHistory, openaiKey);
    } else if (provider === 'anthropic' && anthropicKey) {
      aiResponse = await callAnthropic(systemPrompt, message, conversationHistory, anthropicKey);
    } else if (provider === 'jan' && janApiUrl) {
      aiResponse = await callJanAI(systemPrompt, message, conversationHistory, janApiUrl, janApiKey);
    } else if (inferenceNetKey) {
      // Fallback to inference.net if available
      aiResponse = await callInferenceNet(systemPrompt, message, conversationHistory, inferenceNetKey);
    } else if (openaiKey) {
      // Fallback to OpenAI if available
      aiResponse = await callOpenAI(systemPrompt, message, conversationHistory, openaiKey);
    } else {
      // Last resort: mock response
      aiResponse = generateMockResponse(message, characterProfile);
    }

    console.log(`AI Chat - Provider: ${provider}, Character: ${characterProfile || 'default'}, Message length: ${message.length}`);

    return new Response(JSON.stringify({ 
      response: aiResponse,
      provider: provider,
      characterProfile: characterProfile 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallbackResponse: "I'm experiencing some technical difficulties. Please try again in a moment."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function callOpenAI(systemPrompt: string, message: string, history: ChatMessage[], apiKey: string): Promise<string> {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10), // Keep last 10 messages for context
    { role: 'user', content: message }
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${await response.text()}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAnthropic(systemPrompt: string, message: string, history: ChatMessage[], apiKey: string): Promise<string> {
  const messages = [
    ...history.slice(-10),
    { role: 'user', content: message }
  ];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      system: systemPrompt,
      messages: messages,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${await response.text()}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function callJanAI(systemPrompt: string, message: string, history: ChatMessage[], apiUrl: string, apiKey?: string): Promise<string> {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10),
    { role: 'user', content: message }
  ];

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch(`${apiUrl}/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Jan AI API error: ${await response.text()}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callInferenceNet(systemPrompt: string, message: string, history: ChatMessage[], apiKey: string): Promise<string> {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10), // Keep last 10 messages for context
    { role: 'user', content: message }
  ];

  const response = await fetch('https://api.inference.net/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Inference.net API error: ${await response.text()}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function generateMockResponse(message: string, characterProfile?: string): string {
  const responses = {
    researcher: [
      "Based on current market trends, I'd recommend analyzing your audience engagement metrics first.",
      "Let me help you research that topic. What specific data points are you looking for?",
      "From my analysis, here are the key insights you should consider..."
    ],
    creative: [
      "That's a fantastic creative opportunity! Let's brainstorm some visual concepts.",
      "I love the creative direction you're taking. Here's how we can enhance it...",
      "For this content piece, I suggest we focus on storytelling and visual impact."
    ],
    strategist: [
      "Let's develop a strategic approach to this. First, we need to define our objectives.",
      "That aligns perfectly with our content strategy. Here's how we can optimize it...",
      "I recommend a phased approach to maximize impact and engagement."
    ],
    default: [
      "I'm here to help with your content and marketing needs. What would you like to work on?",
      "That's an interesting project! Let me help you develop a plan for it.",
      "Great idea! Here's how we can turn that into actionable content..."
    ]
  };

  const profileResponses = responses[characterProfile as keyof typeof responses] || responses.default;
  const randomResponse = profileResponses[Math.floor(Math.random() * profileResponses.length)];
  
  return `${randomResponse}\n\n*Note: AI backend is ready but waiting for API key configuration. This is a mock response.*`;
}