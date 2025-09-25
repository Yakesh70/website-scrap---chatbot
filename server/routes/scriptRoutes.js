const express = require('express');
const Link = require('../models/Link');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// Generate widget script for specific link
router.get('/widget/:linkId', requireAuth, async (req, res) => {
  try {
    const { linkId } = req.params;
    const userId = req.auth.userId;

    // Verify link belongs to user
    const link = await Link.findById(linkId);
    if (!link || link.userId !== userId) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Get backend URL from environment or request
    const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    
    // Generate custom script
    const script = `
<!-- Web Bot Chatbot Widget -->
<script>
(function() {
  'use strict';
  
  // Configuration
  const LINK_ID = '${linkId}';
  const API_URL = '${backendUrl}';
  const WEBSITE_NAME = '${new URL(link.originalUrl).hostname}';
  
  // Create widget styles
  const styles = \`
    .webbot-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .webbot-bubble {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: transform 0.3s ease;
    }
    
    .webbot-bubble:hover {
      transform: scale(1.1);
    }
    
    .webbot-bubble svg {
      width: 24px;
      height: 24px;
      fill: white;
    }
    
    .webbot-chat {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      display: none;
      flex-direction: column;
      overflow: hidden;
    }
    
    .webbot-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px;
      font-weight: 600;
    }
    
    .webbot-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .webbot-message {
      max-width: 80%;
      padding: 12px 16px;
      border-radius: 18px;
      word-wrap: break-word;
    }
    
    .webbot-message.user {
      background: #667eea;
      color: white;
      align-self: flex-end;
    }
    
    .webbot-message.bot {
      background: #f1f3f4;
      color: #333;
      align-self: flex-start;
    }
    
    .webbot-input {
      display: flex;
      padding: 16px;
      border-top: 1px solid #eee;
      gap: 8px;
    }
    
    .webbot-input input {
      flex: 1;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 20px;
      outline: none;
      font-size: 14px;
    }
    
    .webbot-input button {
      padding: 12px 16px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .webbot-typing {
      display: flex;
      gap: 4px;
      padding: 12px 16px;
    }
    
    .webbot-typing span {
      width: 8px;
      height: 8px;
      background: #999;
      border-radius: 50%;
      animation: webbot-bounce 1.4s infinite ease-in-out;
    }
    
    @keyframes webbot-bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
  \`;
  
  // Inject styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
  
  // Create widget HTML
  const widget = document.createElement('div');
  widget.className = 'webbot-widget';
  widget.innerHTML = \`
    <div class="webbot-bubble" id="webbot-bubble">
      <svg viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
      </svg>
    </div>
    
    <div class="webbot-chat" id="webbot-chat">
      <div class="webbot-header">
        💬 \${WEBSITE_NAME} Assistant
      </div>
      <div class="webbot-messages" id="webbot-messages">
        <div class="webbot-message bot">
          Hi! I can help you with questions about \${WEBSITE_NAME}. What would you like to know?
        </div>
      </div>
      <div class="webbot-input">
        <input type="text" id="webbot-input" placeholder="Ask me anything..." />
        <button id="webbot-send">Send</button>
      </div>
    </div>
  \`;
  
  document.body.appendChild(widget);
  
  // Widget functionality
  const bubble = document.getElementById('webbot-bubble');
  const chat = document.getElementById('webbot-chat');
  const messages = document.getElementById('webbot-messages');
  const input = document.getElementById('webbot-input');
  const sendBtn = document.getElementById('webbot-send');
  
  let isOpen = false;
  
  // Toggle chat
  bubble.addEventListener('click', () => {
    isOpen = !isOpen;
    chat.style.display = isOpen ? 'flex' : 'none';
    if (isOpen) input.focus();
  });
  
  // Send message
  async function sendMessage() {
    const question = input.value.trim();
    if (!question) return;
    
    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'webbot-message user';
    userMsg.textContent = question;
    messages.appendChild(userMsg);
    
    input.value = '';
    sendBtn.disabled = true;
    
    // Show typing
    const typing = document.createElement('div');
    typing.className = 'webbot-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
    
    try {
      const response = await fetch(\`\${API_URL}/api/widget/chat/\${LINK_ID}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      
      const data = await response.json();
      messages.removeChild(typing);
      
      const botMsg = document.createElement('div');
      botMsg.className = 'webbot-message bot';
      botMsg.textContent = data.answer || 'Sorry, I could not process your request.';
      messages.appendChild(botMsg);
      
    } catch (error) {
      messages.removeChild(typing);
      const errorMsg = document.createElement('div');
      errorMsg.className = 'webbot-message bot';
      errorMsg.textContent = 'Connection error. Please try again.';
      messages.appendChild(errorMsg);
    }
    
    sendBtn.disabled = false;
    messages.scrollTop = messages.scrollHeight;
  }
  
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
})();
</script>`;

    res.setHeader('Content-Type', 'text/plain');
    res.send(script);

  } catch (error) {
    console.error('Script generation error:', error);
    res.status(500).json({ error: 'Failed to generate script' });
  }
});

// Get embed code for dashboard
router.get('/embed/:linkId', requireAuth, async (req, res) => {
  try {
    const { linkId } = req.params;
    const userId = req.auth.userId;

    const link = await Link.findById(linkId);
    if (!link || link.userId !== userId) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    const embedCode = `<script src="${backendUrl}/api/script/widget/${linkId}"></script>`;

    res.json({
      linkId,
      website: link.originalUrl,
      embedCode,
      instructions: 'Copy and paste this code into any website where you want the chatbot to appear.'
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to generate embed code' });
  }
});

module.exports = router;