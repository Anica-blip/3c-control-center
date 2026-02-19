// Pre-built Content Templates for Jan
// These are your recurring content types that Jan can reference

import { ContentTemplate } from './janProjectStorage';

export const defaultTemplates: ContentTemplate[] = [
  {
    id: 'anica-coffee-break-chat',
    name: 'Anica Coffee Break Chat',
    character: 'Anica',
    brandVoice: 'Friendly',
    templateType: 'Social Media',
    description: 'Casual, warm conversations with the community. Anica shares insights, asks questions, and builds connection.',
    structure: `
# Coffee Break Chat Structure

**Opening**: Warm greeting + coffee/tea reference
**Main Topic**: 1-2 key insights or questions
**Engagement Hook**: Question to community
**Closing**: Encouraging sign-off with Anica's signature

**Tone**: Conversational, mentor-like, encouraging
**Length**: 150-300 words
**Format**: Short paragraphs, easy to read on mobile
    `.trim(),
    guidelines: [
      'Start with a relatable moment or observation',
      'Keep it conversational - like talking to a friend over coffee',
      'Always include a question to spark engagement',
      'Use Anica\'s warm, encouraging voice',
      'End with "Keep Leveling Up!" or similar signature',
      'Avoid being too formal or corporate',
      'Share practical wisdom, not just theory'
    ],
    examples: [],
    frequency: 'as-needed',
    lastUsed: new Date().toISOString(),
    timesUsed: 0,
    createdAt: new Date().toISOString(),
    tags: ['anica', 'social-media', 'community', 'casual', 'engagement']
  },
  {
    id: 'caelum-pr-update',
    name: 'Caelum PR Update',
    character: 'Caelum',
    brandVoice: 'Professional',
    templateType: 'Newsletter',
    description: 'Professional brand updates and announcements. Caelum delivers news with polish and strategic framing.',
    structure: `
# PR Update Structure

**Headline**: Clear, compelling announcement
**Context**: Why this matters
**Details**: Key information (who, what, when, where)
**Impact**: What this means for the audience
**Call to Action**: Next steps or how to engage
**Closing**: Caelum's professional sign-off

**Tone**: Professional, strategic, authentic
**Length**: 300-500 words
**Format**: Structured sections with clear headers
    `.trim(),
    guidelines: [
      'Lead with the most important information',
      'Frame updates in terms of audience benefit',
      'Maintain professional but approachable tone',
      'Include specific dates, links, or action items',
      'Use Caelum\'s strategic, brand-focused voice',
      'End with clear next steps',
      'Proofread for polish - Caelum\'s standard is high'
    ],
    examples: [],
    frequency: 'monthly',
    lastUsed: new Date().toISOString(),
    timesUsed: 0,
    createdAt: new Date().toISOString(),
    tags: ['caelum', 'newsletter', 'pr', 'professional', 'announcements']
  },
  {
    id: 'aurion-motivation-post',
    name: 'Aurion Motivational Post',
    character: 'Aurion',
    brandVoice: 'Creative',
    templateType: 'Social Media',
    description: 'Energetic, inspiring content that motivates and uplifts. Aurion brings creativity and enthusiasm.',
    structure: `
# Motivational Post Structure

**Hook**: Eye-catching opening (emoji, bold statement)
**Story/Insight**: Brief inspiring message or story
**Encouragement**: Direct motivation to the reader
**Visual Element**: Emoji use, formatting for impact
**Closing**: Aurion's energetic sign-off

**Tone**: Enthusiastic, creative, uplifting
**Length**: 100-200 words
**Format**: Short, punchy, visually engaging
    `.trim(),
    guidelines: [
      'Start with energy and enthusiasm',
      'Use emojis strategically for visual impact',
      'Keep it short and punchy',
      'Focus on action and possibility',
      'Use Aurion\'s creative, cheerful voice',
      'End with "Keep Crushing it, Champs!!" or similar',
      'Make it shareable and quotable'
    ],
    examples: [],
    frequency: 'weekly',
    lastUsed: new Date().toISOString(),
    timesUsed: 0,
    createdAt: new Date().toISOString(),
    tags: ['aurion', 'social-media', 'motivation', 'creative', 'inspiration']
  },
  {
    id: 'training-module',
    name: 'Training Course Module',
    character: 'Anica',
    brandVoice: 'Professional',
    templateType: 'Training Course',
    description: 'Structured educational content with clear learning objectives and actionable takeaways.',
    structure: `
# Training Module Structure

**Module Title**: Clear, descriptive
**Learning Objectives**: 3-5 specific outcomes
**Introduction**: Why this matters
**Main Content**: 
  - Concept explanation
  - Examples
  - Step-by-step guidance
**Practice/Application**: Exercises or activities
**Key Takeaways**: Summary bullets
**Next Steps**: What to do next

**Tone**: Educational, clear, supportive
**Length**: 800-1500 words
**Format**: Structured with headers, bullets, examples
    `.trim(),
    guidelines: [
      'Start with clear learning objectives',
      'Break complex topics into digestible sections',
      'Use examples and real-world applications',
      'Include actionable exercises or checkpoints',
      'Maintain encouraging, mentor-like tone',
      'End with clear next steps',
      'Make it practical, not just theoretical'
    ],
    examples: [],
    frequency: 'custom',
    lastUsed: new Date().toISOString(),
    timesUsed: 0,
    createdAt: new Date().toISOString(),
    tags: ['anica', 'training', 'education', 'course', 'structured']
  },
  {
    id: 'blog-post-standard',
    name: 'Standard Blog Post',
    character: 'Anica',
    brandVoice: 'Friendly',
    templateType: 'Blog Posts',
    description: 'In-depth content that educates, inspires, and provides value. Standard format for blog articles.',
    structure: `
# Blog Post Structure

**Title**: Compelling, SEO-friendly
**Introduction**: Hook + preview of value
**Main Sections**: 3-5 key points with:
  - Subheadings
  - Explanations
  - Examples
  - Actionable insights
**Conclusion**: Summary + call to action
**Meta**: Tags, categories, featured image notes

**Tone**: Informative, engaging, valuable
**Length**: 1000-2000 words
**Format**: Scannable with headers, bullets, bold text
    `.trim(),
    guidelines: [
      'Hook readers in the first 2 sentences',
      'Use subheadings every 200-300 words',
      'Include practical examples and stories',
      'Make it scannable with formatting',
      'Provide actionable takeaways',
      'End with a clear call to action',
      'Optimize for SEO without sacrificing readability'
    ],
    examples: [],
    frequency: 'weekly',
    lastUsed: new Date().toISOString(),
    timesUsed: 0,
    createdAt: new Date().toISOString(),
    tags: ['anica', 'blog', 'long-form', 'educational', 'seo']
  },
  {
    id: 'quick-tip-series',
    name: 'Quick Tip Series',
    character: 'Aurion',
    brandVoice: 'Casual',
    templateType: 'Social Media',
    description: 'Bite-sized, actionable tips that provide quick wins. Perfect for social media series.',
    structure: `
# Quick Tip Structure

**Tip Number**: "Tip #X:"
**The Tip**: One clear, actionable piece of advice
**Why It Works**: Brief explanation (1-2 sentences)
**Try This**: Specific action to take
**Emoji/Visual**: Strategic use for emphasis

**Tone**: Casual, helpful, actionable
**Length**: 50-100 words
**Format**: Numbered, easy to save/share
    `.trim(),
    guidelines: [
      'One tip per post - keep it focused',
      'Make it immediately actionable',
      'Explain the "why" briefly',
      'Use casual, friendly language',
      'Number tips if part of a series',
      'Include a specific action to try',
      'Make it shareable and screenshot-friendly'
    ],
    examples: [],
    frequency: 'as-needed',
    lastUsed: new Date().toISOString(),
    timesUsed: 0,
    createdAt: new Date().toISOString(),
    tags: ['aurion', 'social-media', 'tips', 'quick', 'series']
  }
];

// Helper function to initialize default templates
export const initializeDefaultTemplates = async (storage: any) => {
  try {
    const existing = await storage.getAllTemplates();
    
    // Only add templates that don't exist yet
    for (const template of defaultTemplates) {
      const exists = existing.find((t: ContentTemplate) => t.id === template.id);
      if (!exists) {
        await storage.saveTemplate(template);
        console.log(`✅ Added template: ${template.name}`);
      }
    }
    
    console.log('✅ Default templates initialized');
  } catch (error) {
    console.error('❌ Failed to initialize default templates:', error);
  }
};
