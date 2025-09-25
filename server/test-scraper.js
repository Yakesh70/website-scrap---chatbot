const { scrapeWebsite } = require('./services/scraper');

// Test the scraping function
const testUrl = process.argv[2] || 'https://example.com';

console.log('Testing scraper with URL:', testUrl);

scrapeWebsite(testUrl)
  .then(results => {
    console.log('\n✅ Scraping successful!');
    console.log('Found', results.length, 'anchor tags');
    results.forEach((tag, i) => {
      console.log(`${i + 1}. ${tag.text} -> ${tag.url}`);
    });
  })
  .catch(error => {
    console.error('\n❌ Scraping failed:', error.message);
  });