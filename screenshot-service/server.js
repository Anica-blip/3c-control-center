const express = require('express');
const captureWebsite = require('capture-website');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Screenshot capture endpoint
app.get('/api/capture', async (req, res) => {
  try {
    const { 
      url, 
      width = 1200, 
      height = 630, 
      scaleFactor = 1,
      defaultBackground = true,
      disableAnimations = true,
      timeout = 10000,
      fullPage = false
    } = req.query;

    if (!url) {
      return res.status(400).json({ 
        error: 'URL parameter is required',
        example: '/api/capture?url=https://example.com'
      });
    }

    try {
      new URL(url);
    } catch (urlError) {
      return res.status(400).json({ 
        error: 'Invalid URL format',
        provided: url
      });
    }

    console.log(`Capturing screenshot for: ${url}`);

    const options = {
      width: parseInt(width),
      height: parseInt(height),
      scaleFactor: parseFloat(scaleFactor),
      defaultBackground: defaultBackground === 'true',
      disableAnimations: disableAnimations === 'true',
      timeout: parseInt(timeout),
      fullPage: fullPage === 'true',
      launchOptions: {
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      }
    };

    const buffer = await captureWebsite.buffer(url, options);

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': buffer.length,
      'Cache-Control': 'public, max-age=3600'
    });

    res.send(buffer);

  } catch (error) {
    console.error('Screenshot capture failed:', error);
    res.status(500).json({ 
      error: 'Failed to capture screenshot',
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Screenshot service running on port ${PORT}`);
  console.log(`Example: http://localhost:${PORT}/api/capture?url=https://example.com`);
});
