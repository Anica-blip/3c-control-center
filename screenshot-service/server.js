import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.get('/health', (req, res) => {
  res.json({ status: 'Screenshot service running', port: PORT });
});

app.get('/api/capture', async (req, res) => {
  try {
    const { url, width = 1200, height = 630 } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    console.log(`Capturing screenshot: ${url} (${width}x${height})`);

    // Use dynamic import to avoid ES module issues
    const { chromium } = await import('playwright');
    
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewportSize({ 
      width: parseInt(width), 
      height: parseInt(height) 
    });
    
    await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
    const screenshot = await page.screenshot({ type: 'png' });
    await browser.close();

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': screenshot.length,
      'Cache-Control': 'public, max-age=3600'
    });

    res.send(screenshot);

  } catch (error) {
    console.error('Screenshot capture error:', error);
    res.status(500).json({ 
      error: 'Failed to capture screenshot',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Screenshot service running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
