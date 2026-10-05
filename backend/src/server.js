require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const IPO = require('./models/ipo');
const connectDB = require('./config/db');
const { SyncIPOs } = require('./services/iposervices');

const app = express();

app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// In-Memory High-Speed Cache with Stale-While-Revalidate (SWR)
const memoryCache = {
  ipos: null,
  iposTimestamp: 0,
  detailsMap: new Map(),
  TTL: 5 * 60 * 1000, // 5 minutes fresh TTL
  isRefreshing: false
};

// Warm cache immediately from DB into RAM
async function warmCache() {
  try {
    if (mongoose.connection.readyState !== 1) return;
    const ipos = await IPO.find({ source: 'upstox' })
      .sort({ opendate: -1, lastupdated: -1 })
      .lean();

    if (ipos && ipos.length > 0) {
      const refreshedAt = Date.now();
      const detailsMap = new Map();

      ipos.forEach(item => {
        if (item.ipoId) detailsMap.set(String(item.ipoId).toLowerCase(), { data: item, timestamp: refreshedAt });
        if (item.Symbol) detailsMap.set(String(item.Symbol).toLowerCase(), { data: item, timestamp: refreshedAt });
      });

      memoryCache.ipos = ipos;
      memoryCache.iposTimestamp = refreshedAt;
      memoryCache.detailsMap = detailsMap;
      console.log(`[Cache] Successfully pre-warmed ${ipos.length} IPOs in RAM.`);
    }
  } catch (err) {
    console.error('[Cache] Warm cache notice:', err.message);
  }
}

// Background refresh without blocking current request
function triggerBackgroundRefresh() {
  if (memoryCache.isRefreshing) return;
  memoryCache.isRefreshing = true;
  warmCache().finally(() => {
    memoryCache.isRefreshing = false;
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    cacheStatus: memoryCache.ipos ? 'warm' : 'cold',
    cachedCount: memoryCache.ipos ? memoryCache.ipos.length : 0
  });
});

// Single IPO Details - Sub-Millisecond In-Memory Cache
app.get(['/api/ipos/:id', '/api/v1/ipos/:id'], async (req, res) => {
  try {
    const queryId = req.params.id;
    const key = queryId.toLowerCase();
    const now = Date.now();

    // 1. Check RAM Cache
    const cachedItem = memoryCache.detailsMap.get(key);
    if (cachedItem) {
      if (now - cachedItem.timestamp > memoryCache.TTL) {
        triggerBackgroundRefresh();
      }
      res.setHeader('X-Cache', 'HIT-MEMORY');
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
      return res.json({
        success: true,
        data: cachedItem.data
      });
    }

    // 2. Check if item exists in list cache
    if (memoryCache.ipos && memoryCache.ipos.length > 0) {
      const foundInList = memoryCache.ipos.find(i =>
        String(i.ipoId).toLowerCase() === key ||
        (i.Symbol && i.Symbol.toLowerCase() === key) ||
        (i.companyName && i.companyName.toLowerCase().includes(key))
      );
      if (foundInList) {
        memoryCache.detailsMap.set(key, { data: foundInList, timestamp: now });
        res.setHeader('X-Cache', 'HIT-LIST');
        res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
        return res.json({
          success: true,
          data: foundInList
        });
      }
    }

    let ipo = null;

    if (mongoose.connection.readyState === 1) {
      ipo = await IPO.findOne({
        source: 'upstox',
        $or: [
          { ipoId: queryId },
          { Symbol: new RegExp(`^${queryId}$`, 'i') },
          { ipoName: new RegExp(queryId, 'i') }
        ]
      }).lean();
    }

    if (!ipo) {
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          success: false,
          message: 'IPO data store is temporarily unavailable.'
        });
      }
      return res.status(404).json({
        success: false,
        message: `IPO '${queryId}' not found.`
      });
    }

    // Save in memory cache
    memoryCache.detailsMap.set(key, {
      data: ipo,
      timestamp: now
    });

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    res.json({
      success: true,
      data: ipo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get List of IPOs - Ultra-Fast In-Memory Cache (0ms Response)
app.get(['/api/ipos', '/api/v1/ipos'], async (req, res) => {
  try {
    const { status, type, search } = req.query;
    const now = Date.now();

    let allIpos = [];
    let cacheStatus = 'MISS';

    // Check if memory cache exists
    if (memoryCache.ipos && memoryCache.ipos.length > 0) {
      allIpos = memoryCache.ipos;
      cacheStatus = 'HIT-MEMORY';
      // Stale-While-Revalidate: refresh in background if older than TTL
      if (now - memoryCache.iposTimestamp > memoryCache.TTL) {
        triggerBackgroundRefresh();
      }
    } else {
      // Cold start: Query MongoDB
      if (mongoose.connection.readyState === 1) {
        allIpos = await IPO.find({ source: 'upstox' })
          .sort({ opendate: -1, lastupdated: -1 })
          .lean();
        cacheStatus = allIpos.length > 0 ? 'MISS-DB' : 'MISS-EMPTY';
      }

      // Provider calls are deliberately excluded from the user request path.
      // The background sync job updates MongoDB and then refreshes this cache.
      if (!allIpos || allIpos.length === 0) {
        return res.status(503).json({
          success: false,
          message: mongoose.connection.readyState === 1
            ? 'IPO data is warming up. Please retry shortly.'
            : 'IPO data store is temporarily unavailable.'
        });
      }

      if (allIpos && allIpos.length > 0) {
        memoryCache.ipos = allIpos;
        memoryCache.iposTimestamp = now;
        allIpos.forEach(item => {
          if (item.ipoId) memoryCache.detailsMap.set(String(item.ipoId).toLowerCase(), { data: item, timestamp: now });
          if (item.Symbol) memoryCache.detailsMap.set(String(item.Symbol).toLowerCase(), { data: item, timestamp: now });
        });
      }
    }

    // Apply fast in-memory filters
    let filtered = allIpos || [];

    if (status && status !== 'all') {
      const s = status.toLowerCase();
      filtered = filtered.filter(i => (i.status || '').toLowerCase() === s);
    }
    if (type && type !== 'all') {
      const t = type.toLowerCase();
      filtered = filtered.filter(i => (i.issueType || '').toLowerCase() === t);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(i => 
        (i.companyName && i.companyName.toLowerCase().includes(q)) ||
        (i.ipoName && i.ipoName.toLowerCase().includes(q)) ||
        (i.Symbol && i.Symbol.toLowerCase().includes(q)) ||
        (i.industry && i.industry.toLowerCase().includes(q))
      );
    }

    res.setHeader('X-Cache', cacheStatus);
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');

    res.json({
      success: true,
      count: filtered.length,
      data: filtered,
      source: 'Upstox Primary Market API'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
});

// Trigger an explicit provider sync. Scheduled jobs call the service directly;
// this public HTTP entry point requires a deployment secret.
app.post(['/api/sync', '/api/v1/sync-ipos'], async (req, res) => {
  try {
    const syncApiKey = process.env.SYNC_API_KEY;
    const authorization = req.get('authorization') || '';
    const suppliedKey = req.get('x-sync-key') || authorization.replace(/^Bearer\s+/i, '');

    if (!syncApiKey) {
      return res.status(503).json({
        success: false,
        message: 'Manual synchronization is not configured.'
      });
    }

    if (suppliedKey !== syncApiKey) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized synchronization request.'
      });
    }

    console.log('Real Upstox IPO sync triggered via API');
    const result = await SyncIPOs();

    if (!result.success) {
      return res.status(502).json({
        success: false,
        message: result.error || result.message || 'Upstox synchronization failed.'
      });
    }

    // Refresh in-memory cache with new data
    await warmCache();

    res.json({
      success: true,
      message: 'Real Upstox IPOs synchronized successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Start the HTTP server immediately. Until MongoDB is ready, read endpoints
  // return a fast 503 instead of blocking on MongoDB or calling Upstox.
  app.listen(PORT, () => {
    console.log(`Real Upstox IPO Server running on port ${PORT}`);
  });

  await connectDB();
  await warmCache();

  const { startSyncJobs } = require('./jobs/jobsync');
  startSyncJobs(warmCache);
}

startServer().catch((error) => {
  console.error('Backend startup failed:', error);
  process.exitCode = 1;
});
