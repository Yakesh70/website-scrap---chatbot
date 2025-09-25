require('dotenv').config();
const mongoose = require('mongoose');
const Link = require('./models/Link');
const { getWebsiteModel } = require('./models/WebsiteData');

async function testWebsiteDifferentiation() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all links
    const links = await Link.find();
    console.log(`\n📊 Total websites scraped: ${links.length}`);

    for (let link of links) {
      console.log(`\n🌐 Website: ${link.originalUrl}`);
      console.log(`   📋 Link ID: ${link._id}`);
      console.log(`   👤 User ID: ${link.userId}`);
      console.log(`   📅 Created: ${link.createdAt}`);
      
      // Check collection for this website
      const WebsiteModel = getWebsiteModel(link._id);
      const collectionName = `website_${link._id}`;
      
      try {
        const documents = await WebsiteModel.find();
        console.log(`   📄 Collection: ${collectionName}`);
        console.log(`   📝 Documents: ${documents.length}`);
        
        if (documents.length > 0) {
          const sampleDoc = documents[0];
          console.log(`   🔗 Sample URL: ${sampleDoc.url}`);
          console.log(`   🆔 Website ID: ${sampleDoc.websiteId || 'Not set'}`);
          console.log(`   🧠 Has Embedding: ${sampleDoc.embedding ? 'Yes' : 'No'}`);
          console.log(`   📊 Content Length: ${sampleDoc.content?.length || 0} chars`);
        }
      } catch (collectionError) {
        console.log(`   ❌ Collection ${collectionName} not found or empty`);
      }
    }

    // Show differentiation structure
    console.log(`\n🏗️  DIFFERENTIATION STRUCTURE:`);
    console.log(`   📁 Each website gets its own MongoDB collection:`);
    console.log(`   📁 website_[linkId1] → Website 1 data`);
    console.log(`   📁 website_[linkId2] → Website 2 data`);
    console.log(`   📁 website_[linkId3] → Website 3 data`);
    console.log(`\n   🔑 Benefits:`);
    console.log(`   ✅ Complete data isolation`);
    console.log(`   ✅ Easy deletion (drop entire collection)`);
    console.log(`   ✅ Scalable (each website independent)`);
    console.log(`   ✅ Fast queries (no cross-website data)`);

    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testWebsiteDifferentiation();