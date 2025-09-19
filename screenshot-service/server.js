import express from 'express';
import captureWebsite from 'capture-website';
import cors from 'cors';

const app = express();

// Flexible port configuration - tries multiple ports if 3001 is busy
const tryPorts = [3001, 3002, 3003, 3004, 3005];
let SERVER_PORT = null;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Screenshot service running', 
    port: SERVER_PORT,
    timestamp: new Date().toISOString()
  });
});

// Screenshot capture endpoint with enhanced error handling
app.get('/api/capture', async (req, res) => {
  try {
    const { url, width = 1200, height = 630, timeout = 10000 } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (urlError) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    console.log(`Capturing screenshot: ${url} (${width}x${height})`);

    const screenshot = await captureWebsite.buffer(url, {
      width: parseInt(width),
      height: parseInt(height),
      fullPage: false,
      timeout: parseInt(timeout),
      type: 'png',
      quality: 0.8,
      launchOptions: {
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-extensions',
          '--no-first-run',
          '--disable-default-apps'
        ]
      },
      beforeScreenshot: async (page) => {
        // Wait for images to load
        await page.waitForTimeout(2000);
      }
    });

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': screenshot.length,
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*'
    });

    res.send(screenshot);
    console.log(`Screenshot captured successfully for ${url}`);

  } catch (error) {
    console.error('Screenshot capture error:', error);
    res.status(500).json({ 
      error: 'Failed to capture screenshot',
      details: error.message,
      url: req.query.url
    });
  }
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Screenshot service is working!',
    port: SERVER_PORT,
    endpoints: {
      health: `/health`,
      capture: `/api/capture?url=https://example.com&width=1200&height=630`
    }
  });
});

// Function to try starting server on available port
async function startServer() {
  for (const port of tryPorts) {
    try {
      await new Promise((resolve, reject) => {
        const server = app.listen(port, (err) => {
          if (err) {
            reject(err);
          } else {
            SERVER_PORT = port;
            console.log(`Screenshot service running on http://localhost:${port}`);
            console.log(`Health check: http://localhost:${port}/health`);
            console.log(`Test endpoint: http://localhost:${port}/test`);
            console.log(`Capture example: http://localhost:${port}/api/capture?url=https://example.com`);
            resolve(server);
          }
        });
        
        server.on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is busy, trying next port...`);
            reject(err);
          } else {
            reject(err);
          }
        });
      });
      break; // Success, exit loop
    } catch (error) {
      if (error.code === 'EADDRINUSE') {
        continue; // Try next port
      } else {
        console.error(`Failed to start server:`, error);
        process.exit(1);
      }
    }
  }
  
  if (!SERVER_PORT) {
    console.error(`Could not start server on any of these ports: ${tryPorts.join(', ')}`);
    process.exit(1);
  }
}

// Start the server
startServer();
