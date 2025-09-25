const { index } = require('../config/pinecone');

class PineconeService {
  async upsertEmbedding(id, vector, metadata) {
    try {
      await index.upsert([{
        id: id,
        values: vector,
        metadata: metadata
      }]);
      console.log(`✅ Stored embedding in Pinecone: ${id}`);
    } catch (error) {
      console.error('❌ Pinecone upsert error:', error);
      throw error;
    }
  }

  async queryEmbeddings(vector, topK = 3, filter = {}) {
    try {
      const queryResponse = await index.query({
        vector: vector,
        topK: topK,
        filter: filter,
        includeMetadata: true
      });
      
      return queryResponse.matches || [];
    } catch (error) {
      console.error('❌ Pinecone query error:', error);
      throw error;
    }
  }

  async deleteByFilter(filter) {
    try {
      await index.deleteMany(filter);
      console.log('✅ Deleted vectors from Pinecone');
    } catch (error) {
      console.error('❌ Pinecone delete error:', error);
      throw error;
    }
  }
}

module.exports = new PineconeService();