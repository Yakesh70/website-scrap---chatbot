const axios = require('axios');
const cheerio = require('cheerio');

const scrapeWebsite = async (url) => {
  try {
    console.log('Starting scrape for:', url);
    const response = await axios.get(url, { timeout: 10000 });
    console.log('Got response, status:', response.status);
    const $ = cheerio.load(response.data);
    
    const anchorTags = [];
    const seenUrls = new Set();
    
    $('a[href]').each((i, element) => {
      if (anchorTags.length >= 15) return false;
      
      const href = $(element).attr('href');
      const text = $(element).text().trim();
      
      if (!href || !text) return;
      
      let fullUrl = href.startsWith('http') ? href : new URL(href, url).href;
      
      if (!seenUrls.has(fullUrl)) {
        seenUrls.add(fullUrl);
        anchorTags.push({ url: fullUrl, text });
      }
    });
    
    console.log('Found anchor tags:', anchorTags.length);
    return anchorTags;
  } catch (error) {
    console.error('Scraping error:', error.message);
    throw new Error(`Scraping failed: ${error.message}`);
  }
};

// Test the scraping function
const testUrl = process.argv[2] || 'https://example.com';

scrapeWebsite(testUrl)
  .then(results => {
    console.log('\n✅ Scraping successful!');
    console.log('Results:', JSON.stringify(results, null, 2));
  })
  .catch(error => {
    console.error('\n❌ Scraping failed:', error.message);
  });