const axios = require('axios');
const cheerio = require('cheerio');

const scrapeWebsite = async (url) => {
  try {
    console.log('Starting scrape for:', url);
    const response = await axios.get(url, { 
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
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
    
    // If no anchor tags found, create a single entry for the main page
    if (anchorTags.length === 0) {
      console.log('No anchor tags found, using main page content');
      anchorTags.push({
        url: url,
        text: $('title').text() || 'Main Page'
      });
    }
    
    console.log('Found anchor tags:', anchorTags.length);
    return anchorTags;
  } catch (error) {
    console.error('Scraping error:', error.message);
    throw new Error(`Scraping failed: ${error.message}`);
  }
};

const scrapePageContent = async (url) => {
  try {
    const response = await axios.get(url, { 
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    
    // Remove unwanted elements
    $('script, style, nav, footer, header, .nav, .footer, .header, #nav, #footer, #header').remove();
    
    // Try to get main content from common selectors
    let content = '';
    const contentSelectors = ['main', '.main', '#main', '.content', '#content', 'article', '.article', 'body'];
    
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text().replace(/\s+/g, ' ').trim();
        if (content.length > 100) break;
      }
    }
    
    // If still no good content, get page title and meta description
    if (content.length < 100) {
      const title = $('title').text() || '';
      const description = $('meta[name="description"]').attr('content') || '';
      const h1 = $('h1').first().text() || '';
      const h2 = $('h2').first().text() || '';
      
      content = [title, description, h1, h2].filter(Boolean).join('. ');
    }
    
    return content.substring(0, 5000) || 'No content available';
  } catch (error) {
    console.error('Content scraping error for', url, ':', error.message);
    return 'Content unavailable';
  }
};

module.exports = { scrapeWebsite, scrapePageContent };