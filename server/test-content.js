const { scrapePageContent } = require('./services/scraper');

scrapePageContent('https://www.adrig.co.in/')
  .then(content => {
    console.log('Content length:', content.length);
    console.log('Content preview:');
    console.log(content.substring(0, 500) + '...');
  })
  .catch(error => {
    console.error('Error:', error.message);
  });