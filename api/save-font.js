export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fontData } = req.body;
    const secret = process.env.REACT_APP_NOTION_BRAND_KIT;
    
    if (!secret) {
      return res.status(500).json({ error: 'Notion configuration not found' });
    }

    const [part1, part2] = secret.split(',').map(p => p.trim());
    const token = part1.length > part2.length ? part1 : part2;

    // First find the database
    const findResponse = await fetch(`${req.headers.origin}/api/notion/find-database`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Typography System' })
    });

    if (!findResponse.ok) {
      return res.status(500).json({ error: 'Failed to find Typography System database' });
    }

    const { databaseId } = await findResponse.json();

    // Save font to Notion
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
          'Name': { title: [{ text: { content: fontData.name } }] },
          'Category': { select: { name: fontData.category } },
          'Usage': { rich_text: [{ text: { content: fontData.usage } }] },
          'Weight Range': { rich_text: [{ text: { content: fontData.weight } }] },
          'Status': { select: { name: 'Active' } }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const result = await response.json();
    return res.status(200).json(result);
  } catch (error) {
    console.error('Save font error:', error);
    return res.status(500).json({ error: error.message });
  }
}
