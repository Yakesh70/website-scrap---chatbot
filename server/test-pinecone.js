require('dotenv').config();
const { index } = require('./config/pinecone');

async function testPinecone() {
  try {
    console.log('🔍 Testing Pinecone connection...');
    
    // Check index stats
    const stats = await index.describeIndexStats();
    console.log('📊 Index Stats:', stats);
    
    // Test query
    const linkId = '68d0e36953a7063a5d132a66';
    console.log(`\n🔎 Searching for vectors with linkId: ${linkId}`);
    
    const queryResponse = await index.query({
      vector: new Array(768).fill(0.1),
      filter: { linkId },
      topK: 5,
      includeMetadata: true
    });
    
    console.log('📋 Query Results:');
    console.log('- Total matches:', queryResponse.matches?.length || 0);
    
    if (queryResponse.matches && queryResponse.matches.length > 0) {
      console.log('✅ Found embeddings in Pinecone:');
      queryResponse.matches.forEach((match, i) => {
        console.log(`  ${i + 1}. ID: ${match.id}`);
        console.log(`     Score: ${match.score}`);
        console.log(`     URL: ${match.metadata?.url}`);
      });
    } else {
      console.log('❌ No embeddings found for this linkId');
      console.log('💡 Need to train RAG model to store embeddings');
    }
    
  } catch (error) {
    console.error('❌ Pinecone Error:', error.message);
  }
}

testPinecone();