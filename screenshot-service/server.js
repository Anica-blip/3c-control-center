import express from 'express';
import captureWebsite from 'capture-website';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Allow your React app to access this server
app.use(cors({
  origin: 'http://localhost:5173' // Vite's default port
}));

// Simple health check
app.get('/health', (req, res) => {
  res.json({ status: 'Screenshot server running!' });
});

// Screenshot endpoint
app.get('/api/capture', async (req, res) => {
  try {
    const { url, width = 1200, height = 630 } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL required' });
    }

    console.log(`📸 Taking screenshot of: ${url}`);

    const buffer = await captureWebsite.buffer(url, {
      width: parseInt(width),
      height: parseInt(height),
      launchOptions: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    res.set('Content-Type', 'image/png');
    res.send(buffer);

  } catch (error) {
    console.error('Screenshot failed:', error.message);
    res.status(500).json({ error: 'Screenshot failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Screenshot server running on http://localhost:${PORT}`);
});
