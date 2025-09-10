require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { scrapeWebsite } = require('./server/services/scraper');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Simple server running' });
});

// Test upload without authentication
app.post('/api/links/test-upload', async (req, res) => {
  try {
    console.log('Test upload request:', req.body);
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    console.log('Scraping URL:', url);
    const anchorTags = await scrapeWebsite(url);
    console.log('Scraped successfully:', anchorTags.length, 'links');
    
    res.json({ 
      success: true, 
      message: 'Scraping completed successfully',
      anchorTags, 
      count: anchorTags.length 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5002;

app.listen(PORT, () => {
  console.log(`✅ Simple server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/links/test-upload`);
});