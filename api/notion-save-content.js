// Save content to Notion database
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { Client } = await import('@notionhq/client');
  
  const notion = new Client({
    auth: process.env.NOTION_TOKEN,
  });

  try {
    const postData = req.body;
    
    const response = await notion.pages.create({
      parent: { database_id: process.env.NOTION_CONTENT_CREATION },
      properties: {
        content_id: {
          title: [{ text: { content: postData.contentId } }]
        },
        character_profile: postData.characterProfile ? {
          select: { name: postData.characterProfile }
        } : undefined,
        theme_type: postData.theme ? {
          select: { name: postData.theme.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }
        } : undefined,
        target_audience: postData.audience ? {
          select: { name: postData.audience.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }
        } : undefined,
        media_type: postData.mediaType ? {
          select: { name: postData.mediaType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }
        } : undefined,
        template_type: postData.templateType ? {
          select: { name: postData.templateType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }
        } : undefined,
        platform_optimized: postData.platform ? {
          select: { name: postData.platform.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }
        } : undefined,
        content_title: postData.title ? {
          rich_text: [{ text: { content: postData.title } }]
        } : undefined,
        content_description: {
          rich_text: [{ text: { content: postData.description } }]
        },
        hashtags: postData.hashtags.length > 0 ? {
          rich_text: [{ text: { content: JSON.stringify(postData.hashtags) } }]
        } : undefined,
        keywords: postData.keywords ? {
          rich_text: [{ text: { content: postData.keywords } }]
        } : undefined,
        call_to_action: postData.cta ? {
          rich_text: [{ text: { content: postData.cta } }]
        } : undefined,
        selected_platforms: postData.selectedPlatforms.length > 0 ? {
          rich_text: [{ text: { content: JSON.stringify(postData.selectedPlatforms) } }]
        } : undefined,
        status: {
          select: { name: postData.status || 'Pending' }
        },
        source_template_id: postData.sourceTemplateId ? {
          rich_text: [{ text: { content: postData.sourceTemplateId } }]
        } : undefined
      }
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('Notion save error:', error);
    res.status(500).json({ message: 'Failed to save to Notion' });
  }
}
