const axios = require('axios');
const crypto = require('crypto');

/**
 * Meetup GraphQL API Scraper
 * Uses official Meetup API for reliable event fetching
 * 
 * Get API key from: https://www.meetup.com/api/authentication/
 */
async function scrapeMeetup() {
    const events = [];
    const apiKey = process.env.MEETUP_API_KEY;

    // If no API key, fall back to web scraping
    if (!apiKey) {
        console.log('⚠️  Meetup: No API key, using web scraping fallback...');
        return await scrapeMeetupWeb();
    }

    try {
        console.log('🔍 Starting Meetup API fetch...');

        // GraphQL query for Sydney events
        const query = `
      query {
        searchEvents(
          filter: { query: "Sydney", lat: -33.8688, lon: 151.2093, radius: 50 }
          first: 50
        ) {
          edges {
            node {
              id
              title
              dateTime
              description
              eventUrl
              venue {
                name
                address
                city
              }
              group {
                name
              }
              images {
                source
              }
            }
          }
        }
      }
    `;

        const response = await axios.post('https://api.meetup.com/gql',
            { query },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            }
        );

        const meetupEvents = response.data?.data?.searchEvents?.edges || [];

        for (const { node: event } of meetupEvents) {
            events.push({
                title: event.title,
                dateTime: new Date(event.dateTime),
                venueName: event.venue?.name || event.group?.name || 'Sydney Meetup',
                venueAddress: event.venue?.address || 'Sydney, Australia',
                city: 'Sydney',
                shortDescription: event.description?.substring(0, 200) || `Hosted by ${event.group?.name}`,
                category: ['Meetup', 'Networking'],
                imageUrl: event.images?.[0]?.source || '',
                sourceWebsiteName: 'Meetup',
                originalEventUrl: event.eventUrl,
                contentHash: generateHash(event.id + event.title)
            });
        }

        console.log(`✅ Meetup API: Found ${events.length} events`);
    } catch (error) {
        if (error.response?.status === 401) {
            console.error('❌ Meetup: Invalid API key');
        } else {
            console.error('❌ Meetup API error:', error.message);
        }
        return await scrapeMeetupWeb();
    }

    return events;
}

/**
 * Web scraping fallback for Meetup
 */
async function scrapeMeetupWeb() {
    const puppeteer = require('puppeteer');
    const events = [];
    let browser;

    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        await page.setViewport({ width: 1920, height: 1080 });

        // Use a more reliable URL
        const url = 'https://www.meetup.com/find/?location=au--sydney&source=EVENTS';
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });

        // Wait for content
        await page.waitForTimeout(5000);

        const scrapedEvents = await page.evaluate(() => {
            const results = [];
            const selectors = [
                '[data-testid="categoryResults-eventCard"]',
                '[id*="event-card"]',
                '.eventCard',
                'a[href*="/events/"]'
            ];

            let cards = [];
            for (const selector of selectors) {
                cards = document.querySelectorAll(selector);
                if (cards.length > 0) break;
            }

            cards.forEach((card) => {
                try {
                    const title = card.querySelector('h2, h3, [class*="title"]')?.innerText?.trim();
                    const link = card.querySelector('a[href*="/events/"]')?.href || card.href;
                    const date = card.querySelector('time')?.innerText?.trim();
                    const group = card.querySelector('[class*="group"]')?.innerText?.trim();
                    const img = card.querySelector('img')?.src;

                    if (title && link) {
                        results.push({ title, link, date, group, img });
                    }
                } catch (e) { }
            });

            return results;
        });

        for (const event of scrapedEvents) {
            events.push({
                title: event.title,
                dateTime: parseDate(event.date),
                venueName: event.group || 'Sydney Meetup',
                venueAddress: 'Sydney, Australia',
                city: 'Sydney',
                shortDescription: event.group ? `Hosted by ${event.group}` : `Meetup event: ${event.title}`,
                category: ['Meetup', 'Networking'],
                imageUrl: event.img || '',
                sourceWebsiteName: 'Meetup',
                originalEventUrl: event.link,
                contentHash: generateHash(event.title + event.link)
            });
        }

        console.log(`✅ Meetup Web: Found ${events.length} events`);
    } catch (error) {
        console.error('❌ Meetup web error:', error.message);
    } finally {
        if (browser) await browser.close();
    }

    return events;
}

function parseDate(dateText) {
    if (!dateText) return new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    try {
        const parsed = new Date(dateText);
        return isNaN(parsed.getTime()) ? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) : parsed;
    } catch {
        return new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    }
}

function generateHash(content) {
    return crypto.createHash('md5').update(content || '').digest('hex');
}

module.exports = { scrapeMeetup };
