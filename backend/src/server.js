require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const IPO = require('./models/ipo');
const connectDB = require('./config/db');
const { SyncIPOs, fetchDirectUpstoxList } = require('./services/iposervices');
require('./jobs/jobsync');

const app = express();

app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// In-Memory High-Speed Cache
const memoryCache = {
  ipos: null,
  iposTimestamp: 0,
  detailsMap: new Map(),
  TTL: 30 * 1000 // 30 seconds fresh cache
};

connectDB();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    cacheStatus: memoryCache.ipos ? 'warm' : 'cold'
  });
});

// Single IPO Details - With Sub-Millisecond In-Memory Cache
app.get(['/api/ipos/:id', '/api/v1/ipos/:id'], async (req, res) => {
  try {
    const queryId = req.params.id;
    const now = Date.now();

    // Check in-memory single item cache
    const cachedItem = memoryCache.detailsMap.get(queryId.toLowerCase());
    if (cachedItem && (now - cachedItem.timestamp < memoryCache.TTL)) {
      res.setHeader('X-Cache', 'HIT-MEMORY');
      res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');
      return res.json({
        success: true,
        data: cachedItem.data
      });
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
      const liveList = await fetchDirectUpstoxList();
      ipo = liveList.find(i => 
        String(i.ipoId) === String(queryId) || 
        (i.Symbol && i.Symbol.toLowerCase() === queryId.toLowerCase()) ||
        (i.companyName && i.companyName.toLowerCase().includes(queryId.toLowerCase()))
      );
    }

    if (!ipo) {
      return res.status(404).json({
        success: false,
        message: `Upstox IPO '${queryId}' not found.`
      });
    }

    // Save in memory cache
    memoryCache.detailsMap.set(queryId.toLowerCase(), {
      data: ipo,
      timestamp: now
    });

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');
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

// Get List of IPOs - Ultra-Fast In-Memory Caching (Responds in < 1ms)
app.get(['/api/ipos', '/api/v1/ipos'], async (req, res) => {
  try {
    const { status, type, search } = req.query;
    const now = Date.now();

    let allIpos = [];

    // Check if warm memory cache exists
    if (memoryCache.ipos && (now - memoryCache.iposTimestamp < memoryCache.TTL)) {
      allIpos = memoryCache.ipos;
    } else {
      // Query MongoDB
      if (mongoose.connection.readyState === 1) {
        allIpos = await IPO.find({ source: 'upstox' })
          .sort({ opendate: -1, lastupdated: -1 })
          .lean();
      }

      // Fallback directly to live Upstox API if DB is empty
      if (!allIpos || allIpos.length === 0) {
        allIpos = await fetchDirectUpstoxList();
      }

      if (allIpos && allIpos.length > 0) {
        memoryCache.ipos = allIpos;
        memoryCache.iposTimestamp = now;
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

    res.setHeader('X-Cache', memoryCache.ipos ? 'HIT' : 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');

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

// Trigger Upstox Data Sync & Invalidate Cache
app.all(['/api/sync', '/api/v1/sync-ipos'], async (req, res) => {
  try {
    console.log('Real Upstox IPO sync triggered via API');
    const result = await SyncIPOs();

    // Invalidate in-memory cache to force refresh
    memoryCache.ipos = null;
    memoryCache.iposTimestamp = 0;
    memoryCache.detailsMap.clear();

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
app.listen(PORT, () => {
  console.log(`Real Upstox IPO Server running on port ${PORT}`);
});
