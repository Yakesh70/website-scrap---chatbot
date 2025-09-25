require('dotenv').config();
const mongoose = require('mongoose');
const { getWebsiteModel } = require('./models/WebsiteData');
const { index } = require('./config/pinecone');

async function migrateToPinecone() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const linkId = '68d0e36953a7063a5d132a66';
    console.log(`\n📦 Migrating existing embeddings to Pinecone for linkId: ${linkId}`);
    
    const WebsiteModel = getWebsiteModel(linkId);
    const websiteData = await WebsiteModel.find({ embedding: { $exists: true } });
    
    console.log(`📊 Found ${websiteData.length} documents with embeddings`);
    
    if (websiteData.length === 0) {
      console.log('❌ No existing embeddings found in MongoDB');
      return;
    }
    
    // Prepare vectors for Pinecone
    const vectors = websiteData.map(data => ({
      id: `${linkId}_${data._id}`,
      values: data.embedding,
      metadata: {
        linkId,
        url: data.url,
        content: data.content
      }
    }));
    
    console.log(`🚀 Uploading ${vectors.length} vectors to Pinecone...`);
    
    // Upload to Pinecone in batches
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      console.log(`Uploading batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(vectors.length/batchSize)}`);
      
      await index.upsert(batch);
      console.log(`✅ Uploaded ${batch.length} vectors`);
    }
    
    console.log('\n✅ Migration completed! Checking Pinecone...');
    
    // Verify upload
    const stats = await index.describeIndexStats();
    console.log('📊 Pinecone Index Stats:', stats);
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Migration Error:', error.message);
  }
}

migrateToPinecone();