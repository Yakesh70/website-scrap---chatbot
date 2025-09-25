const express = require('express');
const Link = require('../models/Link');
const axios = require('axios');
const router = express.Router();

// Widget chat endpoint - no authentication required
router.post('/chat/:linkId', async (req, res) => {
  try {
    const { question } = req.body;
    const { linkId } = req.params;
    
    console.log('Widget Chat Query:', { question, linkId });
    
    // Check if link exists and is trained
    const link = await Link.findById(linkId);
    if (!link) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }
    
    if (!link.isEmbedded) {
      return res.status(400).json({ error: 'Chatbot is not ready yet' });
    }
    
    const { getWebsiteModel } = require('../models/WebsiteData');
    const WebsiteModel = getWebsiteModel(linkId);
    const websiteData = await WebsiteModel.find();
    
    if (websiteData.length === 0) {
      return res.status(400).json({ error: 'No content available' });
    }
    
    // Find relevant content
    const keywords = question.toLowerCase().split(' ').filter(word => word.length > 3);
    const relevantContent = websiteData.filter(data => {
      const content = data.content?.toLowerCase() || '';
      return keywords.some(keyword => content.includes(keyword));
    });
    
    const selectedContent = relevantContent.length > 0 
      ? relevantContent.slice(0, 2)
      : websiteData.slice(0, 2);
    
    const context = selectedContent.map(d => d.content).join('\n\n');
    
    // Generate AI response
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `Context: ${context}\n\nQuestion: ${question}\n\nProvide a helpful answer based on the context:`
          }]
        }]
      }
    );
    
    const answer = response.data.candidates[0].content.parts[0].text;
    
    // Add CORS headers for external websites
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    res.json({ answer });
    
  } catch (error) {
    console.error('Widget Chat Error:', error);
    res.status(500).json({ error: 'Sorry, I encountered an error. Please try again.' });
  }
});

// Handle preflight requests
router.options('/chat/:linkId', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});

module.exports = router;