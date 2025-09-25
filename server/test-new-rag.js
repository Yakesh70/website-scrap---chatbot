require('dotenv').config();
const mongoose = require('mongoose');
const { ragService } = require('./services/rag');

async function testNewRAG() {
  try {
    console.log('🔍 Testing new RAG service...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const linkId = '68d50982b4cb59f20a04490f'; // Your latest linkId
    
    console.log('\n🚀 Step 1: Train RAG with Pinecone storage...');
    const trainResult = await ragService.trainRAG(linkId);
    console.log('Training result:', trainResult);
    
    console.log('\n🔍 Step 2: Test query...');
    const answer = await ragService.query(linkId, 'What services do you provide?');
    console.log('🤖 AI Response:', answer);
    
    await mongoose.disconnect();
    console.log('\n✅ New RAG service test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNewRAG();