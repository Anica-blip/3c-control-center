// Load content from Notion database
export default async function handler(req, res) {
  const { Client } = await import('@notionhq/client');
  
  const notion = new Client({
    auth: process.env.NOTION_TOKEN,
  });

  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_CONTENT_CREATION,
      filter: {
        property: 'status',
        select: {
          does_not_equal: 'Deleted'
        }
      },
      sorts: [
        {
          property: 'created_date',
          direction: 'descending'
        }
      ]
    });

    const posts = response.results.map(page => ({
      id: page.id,
      contentId: page.properties.content_id?.title?.[0]?.text?.content || '',
      characterProfile: page.properties.character_profile?.select?.name || '',
      theme: page.properties.theme_type?.select?.name?.toLowerCase().replace(/\s+/g, '_') || '',
      audience: page.properties.target_audience?.select?.name?.toLowerCase().replace(/\s+/g, '_') || '',
      mediaType: page.properties.media_type?.select?.name?.toLowerCase().replace(/\s+/g, '_') || '',
      templateType: page.properties.template_type?.select?.name?.toLowerCase().replace(/\s+/g, '_') || '',
      platform: page.properties.platform_optimized?.select?.name?.toLowerCase().replace(/\s+/g, '_') || '',
      title: page.properties.content_title?.rich_text?.[0]?.text?.content || '',
      description: page.properties.content_description?.rich_text?.[0]?.text?.content || '',
      hashtags: JSON.parse(page.properties.hashtags?.rich_text?.[0]?.text?.content || '[]'),
      keywords: page.properties.keywords?.rich_text?.[0]?.text?.content || '',
      cta: page.properties.call_to_action?.rich_text?.[0]?.text?.content || '',
      selectedPlatforms: JSON.parse(page.properties.selected_platforms?.rich_text?.[0]?.text?.content || '[]'),
      status: page.properties.status?.select?.name?.toLowerCase() || 'pending',
      sourceTemplateId: page.properties.source_template_id?.rich_text?.[0]?.text?.content || '',
      createdDate: new Date(page.created_time),
      notionPageId: page.id,
      mediaFiles: [] // Empty for now
    }));

    res.status(200).json({ posts });
  } catch (error) {
    console.error('Notion load error:', error);
    res.status(500).json({ message: 'Failed to load from Notion' });
  }
}
