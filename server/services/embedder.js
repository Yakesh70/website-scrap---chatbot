const axios = require('axios');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateOpenAIEmbedding = async (text) => {
  const response = await axios.post(
    'https://api.openai.com/v1/embeddings',
    {
      model: 'text-embedding-3-small',
      input: text
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data.data[0].embedding;
};

const generateEmbedding = async (text, retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      if (i > 0) {
        const delay = 15000 * (i + 1); // Increasing delays: 15s, 30s, 45s, 60s
        console.log(`Waiting ${delay/1000} seconds before retry ${i + 1}...`);
        await sleep(delay);
      }
      
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`,
        {
          model: "models/embedding-001",
          content: { parts: [{ text }] }
        }
      );
      
      return response.data.embedding.values;
    } catch (error) {
      if (error.response?.status === 429 && i < retries - 1) {
        console.log(`Rate limited on attempt ${i + 1}, will retry...`);
        continue;
      }
      throw new Error(`Embedding generation failed: ${error.message}`);
    }
  }
};

module.exports = { generateEmbedding };