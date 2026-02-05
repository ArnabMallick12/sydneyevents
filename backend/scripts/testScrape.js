/**
 * Test script to run scrapers manually
 * Usage: node scripts/testScrape.js [scraper-name]
 * 
 * Examples:
 *   node scripts/testScrape.js           # Run all scrapers
 *   node scripts/testScrape.js eventbrite # Run only Eventbrite
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { runAllScrapers, runSingleScraper } = require('../scraper/scrapeManager');

async function main() {
    const scraperName = process.argv[2];

    console.log('🔗 Connecting to MongoDB...');

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        if (scraperName) {
            console.log(`Running single scraper: ${scraperName}`);
            const result = await runSingleScraper(scraperName);
            console.log('\nResult:', JSON.stringify(result, null, 2));
        } else {
            console.log('Running all scrapers...');
            const result = await runAllScrapers();
            console.log('\nResult:', JSON.stringify(result, null, 2));
        }

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

main();
