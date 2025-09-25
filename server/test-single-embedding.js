require('dotenv').config();
const mongoose = require('mongoose');
const { generateEmbedding } = require('./services/embedder');
const { index } = require('./config/pinecone');
const { getWebsiteModel } = require('./models/WebsiteData');

async function testSingleEmbedding() {
  try {
    console.log('🔍 Testing single embedding generation and Pinecone storage...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const linkId = '68d0e36953a7063a5d132a66';
    const WebsiteModel = getWebsiteModel(linkId);
    
    // Get first document
    const firstDoc = await WebsiteModel.findOne();
    if (!firstDoc) {
      console.log('❌ No documents found');
      return;
    }
    
    console.log(`📄 Testing with: ${firstDoc.url}`);
    console.log(`📝 Content length: ${firstDoc.content?.length || 0} chars`);
    
    // Generate embedding
    console.log('🧠 Generating embedding...');
    const embedding = await generateEmbedding(firstDoc.content);
    console.log(`✅ Generated embedding with ${embedding.length} dimensions`);
    
    // Store in Pinecone
    console.log('📤 Storing in Pinecone...');
    const vector = {
      id: `${linkId}_${firstDoc._id}`,
      values: embedding,
      metadata: {
        linkId,
        url: firstDoc.url,
        content: firstDoc.content.substring(0, 1000) // Truncate for metadata
      }
    };
    
    await index.upsert([vector]);
    console.log('✅ Stored in Pinecone successfully!');
    
    // Verify storage
    console.log('🔍 Verifying Pinecone storage...');
    const stats = await index.describeIndexStats();
    console.log('📊 Pinecone stats:', stats);
    
    // Test query
    console.log('🔎 Testing query...');
    const queryResponse = await index.query({
      vector: embedding,
      filter: { linkId },
      topK: 1,
      includeMetadata: true
    });
    
    console.log('📋 Query result:', queryResponse.matches?.length || 0, 'matches');
    if (queryResponse.matches?.[0]) {
      console.log('✅ Found match with score:', queryResponse.matches[0].score);
    }
    
    await mongoose.disconnect();
    console.log('🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSingleEmbedding();