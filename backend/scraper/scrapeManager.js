const Event = require('../models/Event');
const { scrapeEventbrite } = require('./eventbriteScraper');
const { scrapeTimeOut } = require('./timeoutScraper');
const { scrapeTicketmaster } = require('./ticketmasterScraper');
const { scrapeMeetup } = require('./meetupScraper');

/**
 * Main scrape manager that orchestrates all scrapers
 * Handles deduplication, change detection, and lifecycle management
 */
async function runAllScrapers() {
    console.log('\n========================================');
    console.log('🚀 Starting scrape cycle at', new Date().toISOString());
    console.log('========================================\n');

    const allEvents = [];
    const errors = [];

    // Run all scrapers with error handling
    const scrapers = [
        { name: 'Eventbrite', fn: scrapeEventbrite },
        { name: 'TimeOut', fn: scrapeTimeOut },
        { name: 'Ticketmaster', fn: scrapeTicketmaster },
        { name: 'Meetup', fn: scrapeMeetup }
    ];

    for (const scraper of scrapers) {
        try {
            const events = await scraper.fn();
            allEvents.push(...events);
            console.log(`✅ ${scraper.name}: ${events.length} events scraped`);
        } catch (error) {
            console.error(`❌ ${scraper.name} failed:`, error.message);
            errors.push({ source: scraper.name, error: error.message });
        }

        // Add delay between scrapers to be polite
        await delay(2000);
    }

    console.log(`\n📊 Total events scraped: ${allEvents.length}`);

    // Process and save events
    const stats = await processEvents(allEvents);

    console.log('\n========================================');
    console.log('📈 Scrape Cycle Complete');
    console.log(`   New: ${stats.new}`);
    console.log(`   Updated: ${stats.updated}`);
    console.log(`   Unchanged: ${stats.unchanged}`);
    console.log(`   Inactive marked: ${stats.inactive}`);
    console.log(`   Errors: ${errors.length}`);
    console.log('========================================\n');

    return { stats, errors };
}

/**
 * Process scraped events - save, update, or mark inactive
 */
async function processEvents(scrapedEvents) {
    const stats = { new: 0, updated: 0, unchanged: 0, inactive: 0 };
    const scrapedUrls = new Set();

    for (const eventData of scrapedEvents) {
        try {
            scrapedUrls.add(eventData.originalEventUrl);

            // Check if event exists
            const existingEvent = await Event.findOne({
                originalEventUrl: eventData.originalEventUrl
            });

            if (existingEvent) {
                // Check if content has changed
                if (existingEvent.contentHash !== eventData.contentHash) {
                    // Event has been updated
                    await Event.updateOne(
                        { _id: existingEvent._id },
                        {
                            ...eventData,
                            statusTag: existingEvent.statusTag === 'imported' ? 'imported' : 'updated',
                            lastScrapedAt: new Date()
                        }
                    );
                    stats.updated++;
                } else {
                    // No changes, just update lastScrapedAt
                    await Event.updateOne(
                        { _id: existingEvent._id },
                        { lastScrapedAt: new Date() }
                    );
                    stats.unchanged++;
                }
            } else {
                // New event
                await Event.create({
                    ...eventData,
                    statusTag: 'new',
                    lastScrapedAt: new Date()
                });
                stats.new++;
            }
        } catch (error) {
            // Handle duplicate key errors gracefully
            if (error.code !== 11000) {
                console.error('Error processing event:', error.message);
            }
        }
    }

    // Mark events as inactive if not seen in last 24 hours
    // But don't touch imported events
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const inactiveResult = await Event.updateMany(
        {
            lastScrapedAt: { $lt: twentyFourHoursAgo },
            statusTag: { $nin: ['inactive', 'imported'] },
            // Also check if the event date has passed
            $or: [
                { dateTime: { $lt: new Date() } },
                { lastScrapedAt: { $lt: new Date(Date.now() - 48 * 60 * 60 * 1000) } }
            ]
        },
        { statusTag: 'inactive' }
    );

    stats.inactive = inactiveResult.modifiedCount;

    return stats;
}

/**
 * Delay helper
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Run a single scraper by name (for testing)
 */
async function runSingleScraper(scraperName) {
    const scrapers = {
        eventbrite: scrapeEventbrite,
        timeout: scrapeTimeOut,
        ticketmaster: scrapeTicketmaster,
        meetup: scrapeMeetup
    };

    const scraperFn = scrapers[scraperName.toLowerCase()];
    if (!scraperFn) {
        throw new Error(`Unknown scraper: ${scraperName}`);
    }

    const events = await scraperFn();
    const stats = await processEvents(events);
    return { events: events.length, stats };
}

module.exports = {
    runAllScrapers,
    processEvents,
    runSingleScraper
};
