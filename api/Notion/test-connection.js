// File: /pages/api/notion/test-connection.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check environment variable
    const secret = process.env.NOTION_BRAND_KIT;
    
    if (!secret) {
      return res.status(500).json({ 
        error: 'NOTION_BRAND_KIT environment variable not found',
        solution: 'Add NOTION_BRAND_KIT=your_token,your_page_id to .env.local'
      });
    }

    console.log('Raw NOTION_BRAND_KIT:', secret);

    const parts = secret.split(',').map(p => p.trim());
    if (parts.length !== 2) {
      return res.status(500).json({ 
        error: 'Invalid NOTION_BRAND_KIT format',
        current: `Got ${parts.length} parts`,
        expected: 'token,page_id format'
      });
    }

    const [part1, part2] = parts;
    const token = part1.length > part2.length ? part1 : part2;
    const pageId = part1.length < part2.length ? part1 : part2;

    console.log('Parsed token length:', token.length);
    console.log('Parsed page ID:', pageId);

    // Test Notion API connection
    const response = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      }
    });

    console.log('Notion API Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Notion API Error:', errorText);
      return res.status(response.status).json({ 
        error: `Notion API error: ${response.status}`,
        details: errorText,
        possibleCauses: [
          'Invalid token',
          'Page not shared with integration',
          'Invalid page ID',
          'Token expired'
        ]
      });
    }

    const data = await response.json();
    
    // List found databases
    const databases = data.results.filter(block => 
      block.type === 'child_database' || block.type === 'database'
    );

    const databaseTitles = databases.map(db => ({
      id: db.id,
      title: db.child_database?.title || db.database?.title || 'Untitled',
      type: db.type
    }));

    return res.status(200).json({
      success: true,
      pageId: pageId,
      tokenLength: token.length,
      foundDatabases: databaseTitles,
      totalBlocks: data.results.length,
      message: 'Connection successful!'
    });

  } catch (error) {
    console.error('Test connection error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}
