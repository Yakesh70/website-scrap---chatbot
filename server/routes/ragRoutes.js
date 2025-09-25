const express = require('express');
const Link = require('../models/Link');
const { requireAuth } = require('../middleware/auth');
const { storeEmbeddings, queryRAG } = require('../services/rag');
const axios = require('axios');
const router = express.Router();

// Test Gemini API directly
router.post('/test-gemini', async (req, res) => {
  try {
    const { question = 'Hello, how are you?' } = req.body;
    
    console.log('Testing Gemini API with question:', question);
    console.log('API Key configured:', !!process.env.GEMINI_API_KEY);
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: question
          }]
        }]
      }
    );
    
    const answer = response.data.candidates[0].content.parts[0].text;
    
    res.json({ 
      success: true, 
      answer,
      apiKeySet: !!process.env.GEMINI_API_KEY,
      message: 'Gemini API is working!' 
    });
    
  } catch (error) {
    console.error('Gemini API Test Error:', error.response?.data || error.message);
    
    res.status(500).json({ 
      success: false,
      error: error.message,
      statusCode: error.response?.status,
      apiKeySet: !!process.env.GEMINI_API_KEY,
      message: error.response?.status === 429 ? 'Rate limit exceeded' : 'API call failed'
    });
  }
});

router.post('/train/:linkId', requireAuth, async (req, res) => {
  try {
    const link = await Link.findById(req.params.linkId);
    if (!link || link.userId !== req.auth.userId) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    await storeEmbeddings(link._id);
    
    link.isEmbedded = true;
    await link.save();
    
    res.json({ message: 'Training completed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test chat endpoint without auth
router.post('/test-chat/:linkId', async (req, res) => {
  try {
    const { question } = req.body;
    const { linkId } = req.params;
    
    console.log('Test Chat Query:', { question, linkId });
    
    // Use proper RAG with Gemini API
    console.log('Using RAG with Gemini API');
    
    const { getWebsiteModel } = require('../models/WebsiteData');
    const WebsiteModel = getWebsiteModel(linkId);
    const websiteData = await WebsiteModel.find();
    
    if (websiteData.length === 0) {
      return res.status(400).json({ error: 'No website content found. Please scrape the website first.' });
    }
    
    const keywords = question.toLowerCase().split(' ').filter(word => word.length > 3);
    const relevantContent = websiteData.filter(data => {
      const content = data.content?.toLowerCase() || '';
      return keywords.some(keyword => content.includes(keyword));
    });
    
    const selectedContent = relevantContent.length > 0 
      ? relevantContent.slice(0, 2)
      : websiteData.slice(0, 2);
    
    const context = selectedContent.map(d => d.content).join('\n\n');
    
    // Use Gemini API to generate answer based on website content
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `Context from website: ${context}\n\nQuestion: ${question}\n\nBased on the website content above, provide a helpful and accurate answer:`
          }]
        }]
      }
    );
    
    const answer = response.data.candidates[0].content.parts[0].text;
    res.json({ answer, foundContent: selectedContent.length });
  } catch (error) {
    console.error('Test Chat Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/query/:linkId', requireAuth, async (req, res) => {
  try {
    const { question } = req.body;
    const { linkId } = req.params;
    
    console.log('RAG Query:', { question, linkId, userId: req.auth.userId });
    console.log('TEST_MODE:', process.env.TEST_MODE);
    
    // Test mode - bypass everything and return simple responses
    if (process.env.TEST_MODE === 'true') {
      console.log('Using TEST_MODE - no API calls');
      const responses = {
        'hello': 'Hello! How can I help you today?',
        'hi': 'Hi there! What would you like to know?',
        'what': 'Based on the website content, I can help answer questions.',
        'services': 'This company provides various services.',
        'about': 'This is information about the company.'
      };
      
      const questionLower = question.toLowerCase();
      const matchedKey = Object.keys(responses).find(key => questionLower.includes(key));
      const answer = matchedKey ? responses[matchedKey] : `You asked: "${question}". Test mode is working!`;
      
      return res.json({ answer });
    }
    
    // Check if link exists and belongs to user
    const link = await Link.findById(linkId);
    if (!link || link.userId !== req.auth.userId) {
      return res.status(404).json({ error: 'Link not found or access denied' });
    }
    
    // Check if link has been trained
    if (!link.isEmbedded) {
      return res.status(400).json({ error: 'Website has not been trained yet. Please train the RAG model first.' });
    }
    
    // Use the same working logic as test-chat
    const { getWebsiteModel } = require('../models/WebsiteData');
    const WebsiteModel = getWebsiteModel(linkId);
    const websiteData = await WebsiteModel.find();
    
    if (websiteData.length === 0) {
      return res.status(400).json({ error: 'No website content found. Please scrape the website first.' });
    }
    
    const keywords = question.toLowerCase().split(' ').filter(word => word.length > 3);
    const relevantContent = websiteData.filter(data => {
      const content = data.content?.toLowerCase() || '';
      return keywords.some(keyword => content.includes(keyword));
    });
    
    const selectedContent = relevantContent.length > 0 
      ? relevantContent.slice(0, 2)
      : websiteData.slice(0, 2);
    
    const context = selectedContent.map(d => d.content).join('\n\n');
    
    // Use Gemini API to generate answer based on website content
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `Context from website: ${context}\n\nQuestion: ${question}\n\nBased on the website content above, provide a helpful and accurate answer:`
          }]
        }]
      }
    );
    
    const answer = response.data.candidates[0].content.parts[0].text;
    res.json({ answer });
  } catch (error) {
    console.error('RAG Query Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;