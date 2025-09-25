const axios = require('axios');
const cheerio = require('cheerio');

const debugScrape = async (url) => {
  try {
    console.log('Fetching:', url);
    const response = await axios.get(url, { 
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    console.log('Page title:', $('title').text());
    console.log('Total anchor tags:', $('a').length);
    console.log('Anchor tags with href:', $('a[href]').length);
    
    // Check all anchor tags
    $('a[href]').each((i, element) => {
      const href = $(element).attr('href');
      const text = $(element).text().trim();
      console.log(`${i + 1}. "${text}" -> ${href}`);
    });
    
    // Check if it's a SPA (Single Page Application)
    console.log('\nChecking for JavaScript content...');
    console.log('Script tags:', $('script').length);
    console.log('Has React/Vue/Angular:', 
      response.data.includes('react') || 
      response.data.includes('vue') || 
      response.data.includes('angular')
    );
    
  } catch (error) {
    console.error('Error:', error.message);
  }
};

debugScrape('https://www.adrig.co.in/');