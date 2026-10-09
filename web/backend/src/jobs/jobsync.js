const cron = require('node-cron');
const { SyncIPOs } = require('../services/iposervices');

function startSyncJobs(onSyncComplete = async () => {}) {
  let syncInProgress = false;

  const runSync = async (label) => {
    if (syncInProgress) {
      console.log(`[Real-time Sync] Skipping ${label}; another sync is already running.`);
      return;
    }

    syncInProgress = true;
    console.log(`[Real-time Sync] ${label} starting...`);
    try {
      const result = await SyncIPOs();
      if (!result.success) {
        throw new Error(result.error || result.message || 'IPO synchronization failed');
      }
      await onSyncComplete();
      console.log(`[Real-time Sync] ${label} completed successfully.`);
    } catch (error) {
      console.error(`[Real-time Sync] ${label} failed:`, error.message);
    } finally {
      syncInProgress = false;
    }
  };

  // Run automatic sync every 10 minutes, then atomically refresh the RAM view.
  cron.schedule('*/10 * * * *', () => runSync('Periodic sync'));

  // Populate an empty database shortly after the server becomes ready.
  setTimeout(() => runSync('Initial background sync'), 5000);

  // Self-ping keepalive every 12 minutes to prevent free-tier cloud host sleeping (e.g. Render)
  const BACKEND_URL = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_PUBLIC_URL || process.env.API_URL;
  if (BACKEND_URL) {
    cron.schedule('*/12 * * * *', async () => {
      try {
        const axios = require('axios');
        await axios.get(`${BACKEND_URL.replace(/\/$/, '')}/api/health`, { timeout: 10000 });
        console.log('[Keep-Alive] Self ping successful to prevent sleep mode.');
      } catch (e) {
        // ignore
      }
    });
  }
}

module.exports = {
  startSyncJobs
};
