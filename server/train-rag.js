require('dotenv').config();
const mongoose = require('mongoose');
const { storeEmbeddings } = require('./services/rag');

async function trainRAG() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const linkId = '68d0e36953a7063a5d132a66';
    console.log(`\n🚀 Training RAG for linkId: ${linkId}`);
    
    await storeEmbeddings(linkId);
    
    console.log('\n✅ RAG training completed!');
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Training Error:', error.message);
  }
}

trainRAG();