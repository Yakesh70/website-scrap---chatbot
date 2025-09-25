const { GoogleGenerativeAI } = require('@google/generative-ai');
const Link = require('../models/Link');
const { getWebsiteModel } = require('../models/WebsiteData');
const embedder = require('./embedder');
const pinecone = require('./pinecone');

class RAGService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async trainRAG(linkId) {
    try {
      const link = await Link.findById(linkId);
      if (!link) {
        throw new Error('Link not found');
      }
      
      const WebsiteModel = getWebsiteModel(linkId);
      const websiteData = await WebsiteModel.find({ websiteId: linkId });
      
      console.log(`Training RAG for linkId: ${linkId}`);
      console.log(`Found ${websiteData.length} documents for training`);
      
      for (const data of websiteData) {
        if (data.content && (!data.embedding || data.embedding.length === 0)) {
          console.log(`Processing: ${data.url}`);
          const embeddingVector = await embedder.generateEmbedding(data.content);
          
          // Create unique ID for Pinecone
          const pineconeId = `${linkId}_${data._id.toString()}`;
          
          // Store embedding in Pinecone
          await pinecone.upsertEmbedding(
            pineconeId,
            embeddingVector,
            {
              text: data.content.substring(0, 500), // First 500 chars
              source_page: data.text || 'page',
              section: 'content',
              url: data.url,
              linkId: linkId,
              websiteId: data.websiteId
            }
          );
          
          // Mark as embedded in MongoDB (keep content, don't store embedding)
          data.embedding = [1]; // Just mark as embedded
          await data.save();
          
          console.log(`✅ Embedded: ${data.url}`);
          
          // Add delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
      
      // Update link embedding status
      link.isEmbedded = true;
      await link.save();
      
      return { success: true, message: 'RAG training completed' };
    } catch (error) {
      throw new Error(`RAG training failed: ${error.message}`);
    }
  }

  async query(linkId, question) {
    try {
      console.log('Querying for linkId:', linkId, 'question:', question);
      
      // Generate question embedding
      const questionEmbedding = await embedder.generateEmbedding(question);
      
      // Query Pinecone for similar embeddings
      const matches = await pinecone.queryEmbeddings(
        questionEmbedding,
        3,
        { linkId: { $eq: linkId } }
      );
      
      console.log('Found Pinecone matches:', matches.length);
      
      if (matches.length === 0) {
        return "No trained data available. Please upload and train a website first.";
      }
      
      // Extract context from matches
      const context = matches.map(match => match.metadata.text).join('\n\n');
      
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Based on the following context from the website, answer the user's question in a well-structured format:

Context:
${context}

Question: ${question}

Instructions:
• Provide a clear, well-formatted answer
• Use proper headings and bullet points where appropriate
• Structure the information logically
• Make it easy to read and understand
• Only use information from the provided context

Answer:`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      throw new Error(`Query failed: ${error.message}`);
    }
  }
}

// Export both class methods and legacy function names for compatibility
const ragService = new RAGService();

module.exports = {
  storeEmbeddings: (linkId) => ragService.trainRAG(linkId),
  queryRAG: (question, linkId) => ragService.query(linkId, question),
  ragService
};