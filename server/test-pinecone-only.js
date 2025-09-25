require('dotenv').config();
const mongoose = require('mongoose');
const { storeEmbeddings, queryRAG } = require('./services/rag');

async function testPineconeOnly() {
  try {
    console.log('🔍 Testing Pinecone-only vector storage...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const linkId = '68d0e36953a7063a5d132a66';
    
    console.log('\n🚀 Step 1: Store embeddings in Pinecone only...');
    await storeEmbeddings(linkId);
    
    console.log('\n🔍 Step 2: Test RAG query using Pinecone...');
    const answer = await queryRAG('What services do you provide?', linkId);
    console.log('🤖 AI Response:', answer);
    
    await mongoose.disconnect();
    console.log('\n✅ Pinecone-only test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPineconeOnly();