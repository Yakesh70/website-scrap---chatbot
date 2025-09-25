require('dotenv').config();
const mongoose = require('mongoose');
const { getWebsiteModel } = require('./models/WebsiteData');

async function testMongoDBVectors() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test with your linkId
    const linkId = '68d0e36953a7063a5d132a66';
    console.log(`\n🔎 Checking vectors for linkId: ${linkId}`);
    
    const WebsiteModel = getWebsiteModel(linkId);
    
    // Check total documents
    const totalDocs = await WebsiteModel.countDocuments();
    console.log(`📄 Total documents: ${totalDocs}`);
    
    // Check documents with embeddings
    const embeddedDocs = await WebsiteModel.countDocuments({ embedding: { $exists: true } });
    console.log(`🧠 Documents with embeddings: ${embeddedDocs}`);
    
    if (embeddedDocs > 0) {
      console.log('✅ Embeddings found in MongoDB!');
      
      // Show sample embedding
      const sampleDoc = await WebsiteModel.findOne({ embedding: { $exists: true } });
      console.log(`📊 Sample embedding dimensions: ${sampleDoc.embedding.length}`);
      console.log(`📝 Sample content: ${sampleDoc.content.substring(0, 100)}...`);
    } else {
      console.log('❌ No embeddings found. Need to train RAG model.');
    }
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ MongoDB Error:', error.message);
  }
}

testMongoDBVectors();