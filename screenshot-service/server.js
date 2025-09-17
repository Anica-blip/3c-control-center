import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

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

    // Use Puppeteer directly for better Codespaces compatibility
    const puppeteerScript = `
      const puppeteer = require('puppeteer');
      
      (async () => {
        const browser = await puppeteer.launch({
          headless: 'new',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
          ]
        });
        
        const page = await browser.newPage();
        await page.setViewport({
          width: ${parseInt(width)},
          height: ${parseInt(height)}
        });
        
        await page.goto('${url}', { waitUntil: 'networkidle2', timeout: 10000 });
        const screenshot = await page.screenshot({ type: 'png' });
        await browser.close();
        
        process.stdout.write(screenshot);
      })();
    `;

    const tempScript = join(tmpdir(), `screenshot-${Date.now()}.js`);
    writeFileSync(tempScript, puppeteerScript);

    const child = spawn('node', [tempScript], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let buffer = Buffer.alloc(0);
    
    child.stdout.on('data', (data) => {
      buffer = Buffer.concat([buffer, data]);
    });

    child.stderr.on('data', (data) => {
      console.error('Screenshot error:', data.toString());
    });

    child.on('close', (code) => {
      unlinkSync(tempScript);
      
      if (code === 0 && buffer.length > 0) {
        res.set({
          'Content-Type': 'image/png',
          'Content-Length': buffer.length,
          'Cache-Control': 'public, max-age=3600'
        });
        res.send(buffer);
      } else {
        res.status(500).json({ 
          error: 'Failed to capture screenshot',
          details: `Process exited with code ${code}`
        });
      }
    });

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
