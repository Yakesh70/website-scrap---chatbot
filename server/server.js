require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB().catch(err => console.error('DB connection failed:', err));

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'https://web-bot-frontend.vercel.app',
    'https://sspackcare.com',
    'http://sspackcare.com',
    /\.vercel\.app$/,  // Allow all Vercel subdomains
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Additional CORS for widget endpoints
app.use('/api/widget', cors({
  origin: '*',  // Allow all origins for widget
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/links', require('./routes/linkRoutes'));
app.use('/api/rag', require('./routes/ragRoutes'));
app.use('/api/widget', require('./routes/widgetRoutes'));
app.use('/api/script', require('./routes/scriptRoutes'));

// Debug route to see collections
app.get('/api/debug/collections', async (req, res) => {
  const Link = require('./models/Link');
  const User = require('./models/User');
  const links = await Link.find();
  const users = await User.find();
  res.json({ links, users });
});

// Create test user
app.post('/api/debug/create-user', async (req, res) => {
  const User = require('./models/User');
  const user = new User({
    clerkId: 'test-user',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User'
  });
  await user.save();
  res.json(user);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Serve widget file
app.get('/widget.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/widget.js'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint without auth
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working', env: process.env.NODE_ENV });
});

// View scraped content
app.get('/api/debug/content/:linkId', async (req, res) => {
  try {
    const { getWebsiteModel } = require('./models/WebsiteData');
    const WebsiteModel = getWebsiteModel(req.params.linkId);
    const websiteData = await WebsiteModel.find({}, { url: 1, content: 1 }).limit(10);
    
    const formattedContent = websiteData.map(item => ({
      url: item.url,
      contentPreview: item.content?.substring(0, 500) + '...',
      fullContent: item.content
    }));
    
    res.json({
      linkId: req.params.linkId,
      totalPages: websiteData.length,
      content: formattedContent
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Debug RAG system
app.get('/api/debug/rag/:linkId', async (req, res) => {
  try {
    const Link = require('./models/Link');
    const { getWebsiteModel } = require('./models/WebsiteData');
    
    const link = await Link.findById(req.params.linkId);
    if (!link) {
      return res.json({ error: 'Link not found' });
    }
    
    const WebsiteModel = getWebsiteModel(req.params.linkId);
    const websiteData = await WebsiteModel.find();
    const embeddedData = await WebsiteModel.find({ embedding: { $exists: true } });
    
    res.json({
      link: {
        id: link._id,
        url: link.url,
        isEmbedded: link.isEmbedded,
        createdAt: link.createdAt
      },
      totalContent: websiteData.length,
      embeddedContent: embeddedData.length,
      sampleContent: websiteData.slice(0, 2).map(d => ({
        url: d.url,
        hasContent: !!d.content,
        contentLength: d.content?.length || 0,
        hasEmbedding: !!d.embedding
      })),
      geminiApiKey: process.env.GEMINI_API_KEY ? 'Set' : 'Not set'
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5002;

// For Vercel, we export the app instead of listening
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
