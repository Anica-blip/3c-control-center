// File: /pages/api/notion/save-color.js
import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { colorData } = req.body;
    const DATABASE_ID = process.env.NOTION_COLORS_DATABASE_ID;

    const response = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: colorData.name,
              },
            },
          ],
        },
        'Hex Code': {
          rich_text: [
            {
              text: {
                content: colorData.hex,
              },
            },
          ],
        },
        Usage: {
          rich_text: [
            {
              text: {
                content: colorData.usage,
              },
            },
          ],
        },
      },
    });

    res.status(200).json({ success: true, pageId: response.id });
  } catch (error) {
    console.error('Notion API error:', error);
    res.status(500).json({ error: error.message });
  }
}

// File: /pages/api/notion/save-logo.js
import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { logoData } = req.body;
    const DATABASE_ID = process.env.NOTION_LOGOS_DATABASE_ID;

    const response = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: logoData.name,
              },
            },
          ],
        },
        Type: {
          select: {
            name: logoData.type,
          },
        },
        Usage: {
          rich_text: [
            {
              text: {
                content: logoData.usage,
              },
            },
          ],
        },
      },
    });

    res.status(200).json({ success: true, pageId: response.id });
  } catch (error) {
    console.error('Notion API error:', error);
    res.status(500).json({ error: error.message });
  }
}

// File: /pages/api/notion/save-font.js
import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fontData } = req.body;
    const DATABASE_ID = process.env.NOTION_FONTS_DATABASE_ID;

    const response = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: fontData.name,
              },
            },
          ],
        },
        Category: {
          select: {
            name: fontData.category,
          },
        },
        Usage: {
          rich_text: [
            {
              text: {
                content: fontData.usage,
              },
            },
          ],
        },
        Weight: {
          rich_text: [
            {
              text: {
                content: fontData.weight,
              },
            },
          ],
        },
      },
    });

    res.status(200).json({ success: true, pageId: response.id });
  } catch (error) {
    console.error('Notion API error:', error);
    res.status(500).json({ error: error.message });
  }
}

// File: /pages/api/notion/save-guidelines.js
import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { section, content } = req.body;
    const DATABASE_ID = process.env.NOTION_GUIDELINES_DATABASE_ID;

    const response = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: {
        Section: {
          title: [
            {
              text: {
                content: section,
              },
            },
          ],
        },
        Content: {
          rich_text: [
            {
              text: {
                content: typeof content === 'object' ? JSON.stringify(content) : content,
              },
            },
          ],
        },
        'Last Updated': {
          date: {
            start: new Date().toISOString(),
          },
        },
      },
    });

    res.status(200).json({ success: true, pageId: response.id });
  } catch (error) {
    console.error('Notion API error:', error);
    res.status(500).json({ error: error.message });
  }
}

// File: /pages/api/notion/find-database.js
import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title } = req.body;
    
    const response = await notion.search({
      query: title,
      filter: {
        property: 'object',
        value: 'database'
      }
    });

    if (response.results.length > 0) {
      res.status(200).json({ databaseId: response.results[0].id });
    } else {
      res.status(404).json({ error: 'Database not found' });
    }
  } catch (error) {
    console.error('Notion API error:', error);
    res.status(500).json({ error: error.message });
  }
}
