// Helper function to find database (inline to avoid circular dependencies)
async function findDatabase(token, pageId, title) {
  const response = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch databases: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.results || !Array.isArray(data.results)) {
    throw new Error('Invalid response from Notion API');
  }

  const database = data.results.find(block => 
    (block.type === 'child_database' && block.child_database?.title === title) ||
    (block.type === 'database' && block.database?.title === title)
  );

  if (!database) {
    throw new Error(`Database "${title}" not found`);
  }

  return database.id;
}

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { colorData } = req.body;

    if (!colorData || typeof colorData !== 'object') {
      return res.status(400).json({ error: 'Invalid color data provided' });
    }

    if (!colorData.name || !colorData.hex || !colorData.usage) {
      return res.status(400).json({ error: 'Name, hex, and usage are required' });
    }

    const secret = process.env.NOTION_BRAND_KIT;
    
    if (!secret) {
      console.error('NOTION_BRAND_KIT environment variable not found');
      return res.status(500).json({ error: 'Notion configuration not found' });
    }

    const parts = secret.split(',').map(p => p.trim());
    if (parts.length !== 2) {
      return res.status(500).json({ error: 'Invalid Notion configuration format' });
    }

    const [part1, part2] = parts;
    const token = part1.length > part2.length ? part1 : part2;
    const pageId = part1.length < part2.length ? part1 : part2;

    // Find the Brand Colors database
    const databaseId = await findDatabase(token, pageId, 'Brand Colors');

    // Save color to Notion
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties: {
          'Name': { title: [{ text: { content: colorData.name } }] },
          'Hex Code': { rich_text: [{ text: { content: colorData.hex } }] },
          'Usage': { rich_text: [{ text: { content: colorData.usage } }] }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Notion save error:', errorText);
      return res.status(response.status).json({ error: `Failed to save color: ${response.status}` });
    }

    const result = await response.json();
    return res.status(200).json(result);
  } catch (error) {
    console.error('Save color error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
