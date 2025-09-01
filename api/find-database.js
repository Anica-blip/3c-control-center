export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title } = req.body;
    const secret = process.env.REACT_APP_NOTION_BRAND_KIT;
    
    if (!secret) {
      return res.status(500).json({ error: 'Notion configuration not found' });
    }

    const [part1, part2] = secret.split(',').map(p => p.trim());
    const token = part1.length > part2.length ? part1 : part2;
    const pageId = part1.length < part2.length ? part1 : part2;

    const response = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    
    const database = data.results?.find(block => 
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
    return res.status(500).json({ error: error.message });
  }
}
