const cron = require('node-cron');
const { runAllScrapers } = require('../scraper/scrapeManager');

let isRunning = false;
let lastRunAt = null;
let lastRunStats = null;

/**
 * Start the cron scheduler for automatic scraping
 * Runs every 6 hours: 0 0,6,12,18 * * *
 */
function startScheduler() {
    console.log('⏰ Starting cron scheduler...');
    console.log('   Schedule: Every 6 hours (0:00, 6:00, 12:00, 18:00)');

    // Schedule main scrape job
    cron.schedule('0 0,6,12,18 * * *', async () => {
        await runScheduledScrape();
    }, {
        scheduled: true,
        timezone: 'Australia/Sydney'
    });

    // Also run immediately on server start (with delay)
    setTimeout(async () => {
        console.log('🔄 Running initial scrape on server start...');
        await runScheduledScrape();
    }, 5000);

    console.log('✅ Cron scheduler started successfully');
}

/**
 * Run a scheduled scrape with locking to prevent overlapping runs
 */
async function runScheduledScrape() {
    if (isRunning) {
        console.log('⚠️ Scrape already in progress, skipping...');
        return;
    }

    isRunning = true;
    console.log('\n🕐 Scheduled scrape triggered at', new Date().toISOString());

    try {
        const result = await runAllScrapers();
        lastRunAt = new Date();
        lastRunStats = result.stats;

        console.log('✅ Scheduled scrape completed successfully');
    } catch (error) {
        console.error('❌ Scheduled scrape failed:', error);
    } finally {
        isRunning = false;
    }
}

/**
 * Get scheduler status
 */
function getSchedulerStatus() {
    return {
        isRunning,
        lastRunAt,
        lastRunStats,
        nextRun: getNextRunTime()
    };
}

/**
 * Calculate next run time
 */
function getNextRunTime() {
    const now = new Date();
    const hours = [0, 6, 12, 18];
    const currentHour = now.getHours();

    for (const hour of hours) {
        if (hour > currentHour) {
            const next = new Date(now);
            next.setHours(hour, 0, 0, 0);
            return next;
        }
    }

    // Next day at 00:00
    const next = new Date(now);
    next.setDate(next.getDate() + 1);
    next.setHours(0, 0, 0, 0);
    return next;
}

/**
 * Manually trigger a scrape (for admin use)
 */
async function triggerManualScrape() {
    if (isRunning) {
        return { success: false, message: 'Scrape already in progress' };
    }

    // Run in background
    runScheduledScrape();

    return { success: true, message: 'Scrape started' };
}

module.exports = {
    startScheduler,
    runScheduledScrape,
    getSchedulerStatus,
    triggerManualScrape
};
