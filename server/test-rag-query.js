require('dotenv').config();
const { queryRAG } = require('./services/rag');
const connectDB = require('./config/db');

async function testRAG() {
  try {
    await connectDB();
    console.log('Testing RAG query...');
    
    const linkId = '68c129278a635e99d0abc241'; // Elan Enterprises
    const question = 'What services does this company provide?';
    
    console.log('LinkId:', linkId);
    console.log('Question:', question);
    console.log('API Key set:', !!process.env.GEMINI_API_KEY);
    
    const answer = await queryRAG(question, linkId);
    console.log('Answer:', answer);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
  process.exit(0);
}

testRAG();