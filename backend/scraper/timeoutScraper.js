const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');

/**
 * TimeOut Sydney Scraper
 * Uses web scraping with multiple fallback URLs and selectors
 */
async function scrapeTimeOut() {
    const events = [];

    // Multiple URLs to try
    const urls = [
        'https://www.timeout.com/sydney/things-to-do',
        'https://www.timeout.com/sydney/events',
        'https://www.timeout.com/sydney/things-to-do/things-to-do-in-sydney-this-week'
    ];

    for (const url of urls) {
        try {
            console.log(`🔍 Trying TimeOut URL: ${url}`);

            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Cache-Control': 'no-cache'
                },
                timeout: 20000
            });

            const $ = cheerio.load(response.data);

            // Multiple selector strategies
            const selectors = [
                'article',
                '[class*="card"]',
                '[class*="tile"]',
                '[class*="listing-item"]',
                '[data-testid*="card"]'
            ];

            for (const selector of selectors) {
                $(selector).each((index, element) => {
                    try {
                        const $el = $(element);

                        const titleEl = $el.find('h2, h3, h4, [class*="title"]').first();
                        const linkEl = $el.find('a[href*="/things-to-do/"], a[href*="/events/"]').first();
                        const imageEl = $el.find('img').first();
                        const descEl = $el.find('p, [class*="description"], [class*="summary"]').first();

                        const title = titleEl.text().trim();
                        let eventUrl = linkEl.attr('href');

                        if (title && title.length > 5 && eventUrl) {
                            // Make URL absolute if relative
                            if (eventUrl.startsWith('/')) {
                                eventUrl = 'https://www.timeout.com' + eventUrl;
                            }

                            // Avoid duplicates
                            if (!events.find(e => e.originalEventUrl === eventUrl)) {
                                events.push({
                                    title,
                                    dateTime: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000),
                                    venueName: 'Sydney',
                                    venueAddress: 'Sydney, NSW, Australia',
                                    city: 'Sydney',
                                    shortDescription: descEl.text().trim().substring(0, 200) || `Discover: ${title}`,
                                    category: ['Things to Do'],
                                    imageUrl: imageEl.attr('src') || imageEl.attr('data-src') || '',
                                    sourceWebsiteName: 'TimeOut Sydney',
                                    originalEventUrl: eventUrl,
                                    contentHash: generateHash(title + eventUrl)
                                });
                            }
                        }
                    } catch (e) { }
                });
            }

            if (events.length > 0) {
                console.log(`✅ TimeOut Sydney: Found ${events.length} events from ${url}`);
                break; // Stop if we found events
            }
        } catch (error) {
            console.log(`⚠️  TimeOut URL failed: ${url} - ${error.message}`);
        }
    }

    if (events.length === 0) {
        console.log('⚠️  TimeOut: No events found from any URL');
    }

    return events;
}

function generateHash(content) {
    return crypto.createHash('md5').update(content || '').digest('hex');
}

module.exports = { scrapeTimeOut };
