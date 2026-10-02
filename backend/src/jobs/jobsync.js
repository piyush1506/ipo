const cron = require('node-cron');
const { SyncIPOs } = require('../services/iposervices');

// Run automatic sync every 10 minutes for real-time data freshness
cron.schedule('*/10 * * * *', async () => {
  console.log('[Real-time Sync] Running periodic Upstox IPO sync...');
  try {
    await SyncIPOs();
    console.log('[Real-time Sync] Periodic Upstox IPO sync completed successfully');
  } catch (error) {
    console.error('[Real-time Sync] Periodic Upstox IPO sync failed:', error.message);
  }
});

// Run initial sync 5 seconds after server start
setTimeout(async () => {
  try {
    console.log('[Real-time Sync] Initial background sync starting...');
    await SyncIPOs();
    console.log('[Real-time Sync] Initial background sync complete.');
  } catch (err) {
    console.warn('[Real-time Sync] Initial sync warning:', err.message);
  }
}, 5000);

module.exports = {};
