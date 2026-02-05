const axios = require('axios');
const crypto = require('crypto');

/**
 * Ticketmaster API Scraper
 * Uses official Discovery API for reliable event fetching
 * 
 * Get API key from: https://developer.ticketmaster.com/
 */
async function scrapeTicketmaster() {
    const events = [];
    const apiKey = process.env.TICKETMASTER_API_KEY;

    // If no API key, fall back to web scraping
    if (!apiKey) {
        console.log('⚠️  Ticketmaster: No API key, using web scraping fallback...');
        return await scrapeTicketmasterWeb();
    }

    try {
        console.log('🔍 Starting Ticketmaster API fetch...');

        // Discovery API - search Sydney events
        const response = await axios.get('https://app.ticketmaster.com/discovery/v2/events.json', {
            params: {
                apikey: apiKey,
                city: 'Sydney',
                countryCode: 'AU',
                size: 50,
                sort: 'date,asc'
            },
            timeout: 15000
        });

        const ticketmasterEvents = response.data._embedded?.events || [];

        for (const event of ticketmasterEvents) {
            const venue = event._embedded?.venues?.[0];

            events.push({
                title: event.name,
                dateTime: new Date(event.dates?.start?.dateTime || event.dates?.start?.localDate || Date.now()),
                venueName: venue?.name || 'Sydney Venue',
                venueAddress: venue?.address?.line1 ?
                    `${venue.address.line1}, ${venue.city?.name || 'Sydney'}` :
                    'Sydney, Australia',
                city: 'Sydney',
                shortDescription: event.info || event.pleaseNote || `${event.name} - Live event`,
                category: event.classifications?.map(c => c.segment?.name).filter(Boolean) || ['Entertainment'],
                imageUrl: event.images?.find(i => i.ratio === '16_9')?.url || event.images?.[0]?.url || '',
                sourceWebsiteName: 'Ticketmaster',
                originalEventUrl: event.url,
                contentHash: generateHash(event.id + event.name)
            });
        }

        console.log(`✅ Ticketmaster API: Found ${events.length} events`);
    } catch (error) {
        if (error.response?.status === 401) {
            console.error('❌ Ticketmaster: Invalid API key');
        } else {
            console.error('❌ Ticketmaster API error:', error.message);
        }
        return await scrapeTicketmasterWeb();
    }

    return events;
}

/**
 * Web scraping fallback for Ticketmaster
 */
async function scrapeTicketmasterWeb() {
    const puppeteer = require('puppeteer');
    const events = [];
    let browser;

    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        const url = 'https://www.ticketmaster.com.au/discover/concerts-sydney';
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3000);

        // Auto-scroll to load more
        await autoScroll(page);

        const scrapedEvents = await page.evaluate(() => {
            const results = [];
            const selectors = [
                '[data-testid="event-tile"]',
                '.event-listing__item',
                'article[class*="event"]',
                '.sc-event-card'
            ];

            let cards = [];
            for (const selector of selectors) {
                cards = document.querySelectorAll(selector);
                if (cards.length > 0) break;
            }

            cards.forEach((card) => {
                try {
                    const title = card.querySelector('h2, h3, [class*="title"], [class*="name"]')?.innerText?.trim();
                    const link = card.querySelector('a')?.href;
                    const date = card.querySelector('time, [class*="date"]')?.innerText?.trim();
                    const venue = card.querySelector('[class*="venue"]')?.innerText?.trim();
                    const img = card.querySelector('img')?.src;

                    if (title && link) {
                        results.push({ title, link, date, venue, img });
                    }
                } catch (e) { }
            });

            return results;
        });

        for (const event of scrapedEvents) {
            events.push({
                title: event.title,
                dateTime: parseDate(event.date),
                venueName: event.venue || 'Sydney Venue',
                venueAddress: 'Sydney, Australia',
                city: 'Sydney',
                shortDescription: `Live event: ${event.title}`,
                category: ['Concerts', 'Live Events'],
                imageUrl: event.img || '',
                sourceWebsiteName: 'Ticketmaster',
                originalEventUrl: event.link,
                contentHash: generateHash(event.title + event.link)
            });
        }

        console.log(`✅ Ticketmaster Web: Found ${events.length} events`);
    } catch (error) {
        console.error('❌ Ticketmaster web error:', error.message);
    } finally {
        if (browser) await browser.close();
    }

    return events;
}

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 500;
            const timer = setInterval(() => {
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= 2000) {
                    clearInterval(timer);
                    resolve();
                }
            }, 200);
        });
    });
}

function parseDate(dateText) {
    if (!dateText) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    try {
        const parsed = new Date(dateText);
        return isNaN(parsed.getTime()) ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : parsed;
    } catch {
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
}

function generateHash(content) {
    return crypto.createHash('md5').update(content || '').digest('hex');
}

module.exports = { scrapeTicketmaster };
