const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
const { requireAuth } = require('../middleware/auth');
const { generateEmbedding } = require('../services/embedder');
const { getWebsiteModel } = require('../models/WebsiteData');
const Link = require('../models/Link');
const router = express.Router();

// Configure multer
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Content type detection
const detectContentType = (text) => {
  if (!text || text.trim().length < 10) return 'image';
  if (text.includes('|') || text.includes('\t')) return 'table';
  return 'text';
};

// Process PDF files
const processPDF = async (buffer) => {
  try {
    const pdfData = await pdfParse(buffer);
    return {
      text: pdfData.text,
      pages: pdfData.numpages,
      success: true
    };
  } catch (error) {
    console.error('PDF processing error:', error);
    return { success: false, error: error.message };
  }
};

// Process images with OCR
const processImage = async (buffer) => {
  try {
    const { data } = await Tesseract.recognize(buffer, 'eng');
    return {
      text: data.text,
      confidence: data.confidence,
      success: true
    };
  } catch (error) {
    console.error('OCR processing error:', error);
    return { success: false, error: error.message };
  }
};

// Store content in RAG system
const storeInRAG = async (userId, content, filename, contentType) => {
  try {
    // Create a link entry for the uploaded document
    const link = new Link({
      userId,
      originalUrl: `uploaded://${filename}`,
      anchorCount: 1,
      isEmbedded: false
    });
    await link.save();

    // Store content in website collection
    const WebsiteModel = getWebsiteModel(link._id);
    await WebsiteModel.create({
      websiteId: link._id.toString(),
      url: `uploaded://${filename}`,
      text: filename,
      content: content
    });

    // Generate and store embedding in Pinecone only
    const embedding = await generateEmbedding(content);
    const { index } = require('../config/pinecone');
    await index.upsert([{
      id: `${link._id}_uploaded`,
      values: embedding,
      metadata: {
        linkId: link._id.toString(),
        url: `uploaded://${filename}`,
        content: content
      }
    }]);

    // Mark as embedded
    link.isEmbedded = true;
    await link.save();

    return { linkId: link._id, success: true };
  } catch (error) {
    console.error('RAG storage error:', error);
    return { success: false, error: error.message };
  }
};

// Generate HTML response
const generateHTML = (content, type, id) => {
  const timestamp = Date.now();
  
  switch (type) {
    case 'text':
      return `<div id="txt-${timestamp}" class="text-base leading-relaxed whitespace-pre-wrap">${content}</div>`;
    
    case 'table':
      const rows = content.split('\n').filter(r => r.trim());
      const tableData = rows.map(r => r.split(/\s+/));
      return `
        <table id="tbl-${timestamp}" class="border-collapse border border-gray-400 w-full">
          ${tableData.map(row => 
            `<tr>${row.map(cell => 
              `<td class="border px-2 py-1">${cell}</td>`
            ).join('')}</tr>`
          ).join('')}
        </table>`;
    
    case 'image':
      return `<img id="img-${timestamp}" src="${content}" alt="Uploaded Image" class="rounded shadow-md max-w-full h-auto"/>`;
    
    default:
      return `<div id="doc-${timestamp}" class="text-base leading-relaxed">${content}</div>`;
  }
};

// Main upload endpoint
router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const userId = req.auth.userId;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let extractedContent = '';
    let contentType = 'text';
    let processingResult = {};

    // Process based on file type
    if (file.mimetype === 'application/pdf') {
      console.log(`Processing PDF: ${file.originalname}`);
      processingResult = await processPDF(file.buffer);
      
      if (!processingResult.success) {
        return res.status(500).json({ error: 'PDF processing failed' });
      }
      
      extractedContent = processingResult.text;
      contentType = detectContentType(extractedContent);
      
    } else if (file.mimetype.startsWith('image/')) {
      console.log(`Processing image: ${file.originalname}`);
      processingResult = await processImage(file.buffer);
      
      if (!processingResult.success) {
        // Return image without OCR
        const base64 = file.buffer.toString('base64');
        const dataUrl = `data:${file.mimetype};base64,${base64}`;
        
        return res.json({
          type: 'image',
          html: generateHTML(dataUrl, 'image'),
          ragEnabled: false
        });
      }
      
      extractedContent = processingResult.text;
      contentType = detectContentType(extractedContent);
      
    } else if (file.mimetype === 'text/plain') {
      extractedContent = file.buffer.toString('utf-8');
      contentType = 'text';
      
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Store in RAG system if content is meaningful
    let ragResult = { success: false };
    if (extractedContent && extractedContent.trim().length > 50) {
      console.log('Storing content in RAG system...');
      ragResult = await storeInRAG(userId, extractedContent, file.originalname, contentType);
    }

    // Generate response
    const html = generateHTML(extractedContent, contentType);
    
    const response = {
      type: contentType,
      html,
      filename: file.originalname,
      ragEnabled: ragResult.success,
      ...(ragResult.success && { linkId: ragResult.linkId }),
      ...(processingResult.pages && { pages: processingResult.pages }),
      ...(processingResult.confidence && { confidence: processingResult.confidence })
    };

    res.json(response);

  } catch (error) {
    console.error('Upload processing error:', error);
    res.status(500).json({ error: 'Upload processing failed' });
  }
});

module.exports = router;