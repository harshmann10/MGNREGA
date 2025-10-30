require('dotenv').config();
const cron = require('node-cron');
const connectDatabase = require('../config/database');
const { runFullSync, runIncrementalSync } = require('./etl');

/**
 * ETL Job Scheduler
 * As per RPD section 7:
 * - Daily full sync at low-traffic hour (3 AM)
 * - Hourly incremental sync for current month
 */

let isFullSyncRunning = false;
let isIncrementalSyncRunning = false;

/**
 * Full sync job - runs daily at 3 AM
 */
const scheduleFullSync = () => {
  // Run at 5 AM every Sunday
  cron.schedule('0 5 * * 0', async () => {
    if (isFullSyncRunning) {
      console.log('⏭️  Full sync already running, skipping...');
      return;
    }

    try {
      isFullSyncRunning = true;
      console.log(`\n📅 Scheduled full sync started at ${new Date().toISOString()}`);
      
      await runFullSync();
      
      console.log('✅ Scheduled full sync completed');
    } catch (error) {
      console.error('❌ Scheduled full sync failed:', error);
    } finally {
      isFullSyncRunning = false;
    }
  }, {
    timezone: 'Asia/Kolkata'
  });

  console.log('🕒 Full sync scheduled for Sundays at 5:00 AM IST');
};

/**
 * Incremental sync job - runs daily at 8 AM (hot states only)
 */
const scheduleIncrementalSync = () => {
  // Run at 8 AM every day
  cron.schedule('0 8 * * *', async () => {
    if (isIncrementalSyncRunning) {
      console.log('⏭️  Incremental sync already running, skipping...');
      return;
    }

    try {
      isIncrementalSyncRunning = true;
      console.log(`\n⏰ Scheduled incremental sync started at ${new Date().toISOString()}`);
      
      await runIncrementalSync();
      
      console.log('✅ Scheduled incremental sync completed');
    } catch (error) {
      console.error('❌ Scheduled incremental sync failed:', error);
    } finally {
      isIncrementalSyncRunning = false;
    }
  }, {
    timezone: 'Asia/Kolkata'
  });

  console.log('🕒 Incremental sync scheduled for daily at 8:00 AM IST (hot states only)');
};

/**
 * Start all scheduled jobs
 */
async function startScheduler() {
  try {
    console.log('\n🚀 Starting ETL Scheduler...\n');
    
    // Connect to database
    await connectDatabase();
    
    // Schedule jobs
    scheduleFullSync();
    scheduleIncrementalSync();
    
    console.log('\n✅ ETL Scheduler is running');
    console.log('   - Full sync: Sundays at 5:00 AM');
    console.log('   - Incremental sync: Daily at 8:00 AM\n');

    // Optional: Run incremental sync on startup (after 2 minutes)
    if (process.env.RUN_ON_STARTUP === 'true') {
      setTimeout(async () => {
        console.log('\n🔄 Running initial incremental sync...');
        try {
          await runIncrementalSync();
        } catch (error) {
          console.error('Initial sync failed:', error);
        }
      }, 120000); // 2 minutes delay
    }
    
  } catch (error) {
    console.error('❌ Failed to start scheduler:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n📛 SIGTERM received, stopping scheduler...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n📛 SIGINT received, stopping scheduler...');
  process.exit(0);
});

// Start scheduler if called directly
if (require.main === module) {
  startScheduler();
}

module.exports = {
  startScheduler,
  scheduleFullSync,
  scheduleIncrementalSync
};
