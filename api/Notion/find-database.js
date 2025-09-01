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
    const { title } = req.body;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title is required and must be a string' });
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

    const response = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Notion API error:', errorText);
      return res.status(response.status).json({ error: `Notion API error: ${response.status}` });
    }

    const data = await response.json();
    
    if (!data.results || !Array.isArray(data.results)) {
      return res.status(500).json({ error: 'Invalid response from Notion API' });
    }

    const database = data.results.find(block => 
      (block.type === 'child_database' && block.child_database?.title === title) ||
      (block.type === 'database' && block.database?.title === title)
    );

    if (database) {
      return res.status(200).json({ databaseId: database.id });
    } else {
      return res.status(404).json({ error: `Database "${title}" not found` });
    }
  } catch (error) {
    console.error('Find database error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
