const express = require('express');
const Link = require('../models/Link');
const { getWebsiteModel } = require('../models/WebsiteData');
const { requireAuth } = require('../middleware/auth');
const { scrapeWebsite, scrapePageContent } = require('../services/scraper');
const router = express.Router();

// Get all links for user
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const links = await Link.find({ userId });
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint without auth
router.post('/test-upload', async (req, res) => {
  try {
    console.log('Test upload request:', req.body);
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const anchorTags = await scrapeWebsite(url);
    console.log('Scraped successfully:', anchorTags.length, 'links');
    
    res.json({ success: true, anchorTags, count: anchorTags.length });
  } catch (error) {
    console.error('Test upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/upload', requireAuth, async (req, res) => {
  try {
    console.log('Upload request received:', req.body);
    const { url } = req.body;
    const userId = req.auth.userId;
    
    console.log('User ID:', userId);
    console.log('URL to scrape:', url);
    
    const anchorTags = await scrapeWebsite(url);
    console.log('Scraped anchor tags:', anchorTags.length);
    
    // Create link metadata
    const link = new Link({
      userId,
      originalUrl: url,
      anchorCount: anchorTags.length
    });
    await link.save();
    console.log('Link saved:', link._id);
    
    // Create separate collection for this website's data
    const WebsiteModel = getWebsiteModel(link._id);
    
    for (let tag of anchorTags) {
      const content = await scrapePageContent(tag.url);
      await WebsiteModel.create({
        websiteId: link._id.toString(),
        url: tag.url,
        text: tag.text,
        content
      });
    }
    
    console.log('Upload completed successfully');
    res.json({ ...link.toObject(), anchorTags });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link || link.userId !== req.auth.userId) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    // Get data from separate collection
    const WebsiteModel = getWebsiteModel(link._id);
    const anchorTags = await WebsiteModel.find();
    
    res.json({ ...link.toObject(), anchorTags });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete link and all associated data
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link || link.userId !== req.auth.userId) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    // Delete the website data collection
    const WebsiteModel = getWebsiteModel(link._id);
    await WebsiteModel.collection.drop().catch(() => {});
    
    // Delete the link
    await Link.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;