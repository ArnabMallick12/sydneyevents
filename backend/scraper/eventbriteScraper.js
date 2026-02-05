const axios = require('axios');
const crypto = require('crypto');

/**
 * Eventbrite API Scraper
 * Uses official Eventbrite API for reliable event fetching
 * 
 * Get API key from: https://www.eventbrite.com/platform/api
 */
async function scrapeEventbrite() {
    const events = [];
    const apiKey = process.env.EVENTBRITE_API_KEY;

    // If no API key, fall back to web scraping
    if (!apiKey) {
        console.log('⚠️  Eventbrite: No API key, using web scraping fallback...');
        return await scrapeEventbriteWeb();
    }

    try {
        console.log('🔍 Starting Eventbrite API fetch...');

        // Search for Sydney events
        const response = await axios.get('https://www.eventbriteapi.com/v3/events/search/', {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            },
            params: {
                'location.address': 'Sydney, Australia',
                'location.within': '50km',
                'expand': 'venue,category',
                'sort_by': 'date',
                'page_size': 50
            },
            timeout: 15000
        });

        const eventbriteEvents = response.data.events || [];

        for (const event of eventbriteEvents) {
            events.push({
                title: event.name?.text || 'Untitled Event',
                dateTime: new Date(event.start?.utc || Date.now()),
                venueName: event.venue?.name || 'Sydney, NSW',
                venueAddress: event.venue?.address?.localized_address_display || 'Sydney, Australia',
                city: 'Sydney',
                shortDescription: event.description?.text?.substring(0, 200) || event.summary || '',
                category: event.category?.name ? [event.category.name] : ['General'],
                imageUrl: event.logo?.url || '',
                sourceWebsiteName: 'Eventbrite',
                originalEventUrl: event.url,
                contentHash: generateHash(event.id + event.name?.text)
            });
        }

        console.log(`✅ Eventbrite API: Found ${events.length} events`);
    } catch (error) {
        if (error.response?.status === 401) {
            console.error('❌ Eventbrite: Invalid API key');
        } else {
            console.error('❌ Eventbrite API error:', error.message);
        }
        // Fall back to web scraping
        return await scrapeEventbriteWeb();
    }

    return events;
}

/**
 * Web scraping fallback for Eventbrite
 */
async function scrapeEventbriteWeb() {
    const puppeteer = require('puppeteer');
    const events = [];
    let browser;

    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1920, height: 1080 });

        const url = 'https://www.eventbrite.com.au/d/australia--sydney/all-events/';
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Wait a bit for content to load
        await page.waitForTimeout(3000);

        const scrapedEvents = await page.evaluate(() => {
            const results = [];
            // Multiple selector strategies
            const selectors = [
                '[data-testid="search-event-card"]',
                '.search-event-card-wrapper',
                '.eds-event-card',
                'article[class*="event"]',
                '[class*="EventCard"]'
            ];

            let cards = [];
            for (const selector of selectors) {
                cards = document.querySelectorAll(selector);
                if (cards.length > 0) break;
            }

            cards.forEach((card) => {
                try {
                    const title = card.querySelector('h2, h3, [class*="title"]')?.innerText?.trim();
                    const link = card.querySelector('a[href*="/e/"]')?.href;
                    const date = card.querySelector('time, [class*="date"]')?.innerText?.trim();
                    const venue = card.querySelector('[class*="venue"], [class*="location"]')?.innerText?.trim();
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
                venueName: event.venue || 'Sydney, NSW',
                venueAddress: 'Sydney, Australia',
                city: 'Sydney',
                shortDescription: `Event from Eventbrite: ${event.title}`,
                category: ['General'],
                imageUrl: event.img || '',
                sourceWebsiteName: 'Eventbrite',
                originalEventUrl: event.link,
                contentHash: generateHash(event.title + event.link)
            });
        }

        console.log(`✅ Eventbrite Web: Found ${events.length} events`);
    } catch (error) {
        console.error('❌ Eventbrite web scraping error:', error.message);
    } finally {
        if (browser) await browser.close();
    }

    return events;
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

module.exports = { scrapeEventbrite };
