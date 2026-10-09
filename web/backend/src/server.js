require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const IPO = require('./models/ipo');
const connectDB = require('./config/db');
const { SyncIPOs } = require('./services/iposervices');
const { discoverCompanyLogo } = require('./services/logoService');

const app = express();

app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

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

// Discover, validate, proxy, and cache a company logo. The service only probes
// bounded domain candidates derived from the company name/symbol; it does not
// accept an arbitrary target URL.
app.get(['/api/company-logo', '/api/v1/company-logo'], async (req, res) => {
  const companyName = String(req.query.companyName || '').trim();
  const symbol = String(req.query.symbol || '').trim();

  if (companyName.length < 2 || companyName.length > 160 || symbol.length > 30) {
    return res.status(400).json({ success: false, message: 'A valid company name is required.' });
  }

  try {
    const logo = await discoverCompanyLogo(companyName, symbol);
    res.setHeader('X-Logo-Cache', logo.cacheStatus);
    if (!logo.data || !logo.contentType) {
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=21600');
      return res.status(404).json({ success: false, message: 'Company logo was not found.' });
    }

    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800');
    res.setHeader('Content-Type', logo.contentType);
    return res.send(logo.data);
  } catch (error) {
    return res.status(502).json({ success: false, message: error.message || 'Logo discovery failed.' });
  }
});

// Allotment checking is intentionally disabled until an official data
// provider agreement and API credentials are available. Keep this contract
// stable so mobile/web clients can ship the PAN-management UI without ever
// fabricating a financial result or using an unapproved external source.
const ALLOTMENT_UNAVAILABLE_MESSAGE =
  'Automatic allotment checks are awaiting official data API approval.';

app.get(['/api/allotment/capabilities', '/api/v1/allotment/capabilities'], (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    available: false,
    mode: 'disabled',
    message: ALLOTMENT_UNAVAILABLE_MESSAGE
  });
});

app.post(['/api/allotment/check', '/api/v1/allotment/check'], (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(503).json({
    success: false,
    code: 'ALLOTMENT_PROVIDER_NOT_CONFIGURED',
    message: ALLOTMENT_UNAVAILABLE_MESSAGE
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

// Admin endpoint to upload/override logo
app.post(['/api/admin/company-logo', '/api/v1/admin/company-logo'], async (req, res) => {
  try {
    const syncApiKey = process.env.SYNC_API_KEY;
    const authorization = req.get('authorization') || '';
    const suppliedKey = req.get('x-sync-key') || authorization.replace(/^Bearer\s+/i, '');

    if (!syncApiKey || suppliedKey !== syncApiKey) {
      return res.status(401).json({ success: false, message: 'Unauthorized request.' });
    }

    const { companyName, symbol, base64Image, contentType } = req.body;
    
    if (!companyName || !base64Image || !contentType) {
      return res.status(400).json({ success: false, message: 'companyName, base64Image, and contentType are required.' });
    }

    const { normalizeKey, invalidateCache } = require('./services/logoService');
    const key = normalizeKey(companyName, symbol || '');
    
    const buffer = Buffer.from(base64Image, 'base64');
    
    const CustomLogo = require('./models/CustomLogo');
    await CustomLogo.findOneAndUpdate(
      { key },
      { data: buffer, contentType, uploadedAt: Date.now() },
      { upsert: true, new: true }
    );

    invalidateCache(key);

    return res.json({ success: true, message: 'Logo successfully overridden.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.delete(['/api/admin/company-logo', '/api/v1/admin/company-logo'], async (req, res) => {
  try {
    const syncApiKey = process.env.SYNC_API_KEY;
    const authorization = req.get('authorization') || '';
    const suppliedKey = req.get('x-sync-key') || authorization.replace(/^Bearer\s+/i, '');

    if (!syncApiKey || suppliedKey !== syncApiKey) {
      return res.status(401).json({ success: false, message: 'Unauthorized request.' });
    }

    const companyName = String(req.query.companyName || '');
    const symbol = String(req.query.symbol || '');
    
    if (!companyName) {
      return res.status(400).json({ success: false, message: 'companyName is required.' });
    }

    const { normalizeKey, invalidateCache } = require('./services/logoService');
    const key = normalizeKey(companyName, symbol);
    
    const CustomLogo = require('./models/CustomLogo');
    await CustomLogo.findOneAndDelete({ key });

    invalidateCache(key);

    return res.json({ success: true, message: 'Custom logo successfully removed.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin endpoint to manually send push notifications
app.post(['/api/admin/notify', '/api/v1/admin/notify'], async (req, res) => {
  try {
    const syncApiKey = process.env.SYNC_API_KEY;
    const authorization = req.get('authorization') || '';
    const suppliedKey = req.get('x-sync-key') || authorization.replace(/^Bearer\s+/i, '');

    if (!syncApiKey || suppliedKey !== syncApiKey) {
      return res.status(401).json({ success: false, message: 'Unauthorized request.' });
    }

    const { title, body, data } = req.body;
    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'title and body are required.' });
    }

    const { notifyAllUsers } = require('./services/notificationService');
    const count = await notifyAllUsers(title, body, data || {});

    return res.json({ success: true, message: `Notification sent to ${count} devices.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// --- User & PAN Management ---
const User = require('./models/User');

// Login or register user with Google info
app.post(['/api/users/auth', '/api/v1/users/auth'], async (req, res) => {
  try {
    const { email, name, googleId, picture } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      // Update googleId and picture if they were missing
      let updated = false;
      if (googleId && !user.googleId) { user.googleId = googleId; updated = true; }
      if (picture && !user.picture) { user.picture = picture; updated = true; }
      if (name && !user.name) { user.name = name; updated = true; }
      
      if (updated) {
        await user.save();
      }
    } else {
      user = new User({ email, name, googleId, picture, pans: [] });
      await user.save();
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update Push Token
app.post(['/api/users/:id/push-token', '/api/v1/users/:id/push-token'], async (req, res) => {
  try {
    const { pushToken } = req.body;
    if (!pushToken) {
      return res.status(400).json({ success: false, message: 'pushToken is required' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.expoPushToken = pushToken;
    await user.save();
    
    res.json({ success: true, message: 'Push token updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's PANs
app.get(['/api/users/:id/pans', '/api/v1/users/:id/pans'], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user.pans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add a PAN for a user
app.post(['/api/users/:id/pans', '/api/v1/users/:id/pans'], async (req, res) => {
  try {
    const { panNumber, name } = req.body;
    
    if (!panNumber) {
      return res.status(400).json({ success: false, message: 'PAN number is required' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if PAN already exists
    const exists = user.pans.some(p => p.panNumber.toUpperCase() === panNumber.toUpperCase());
    if (exists) {
      return res.status(400).json({ success: false, message: 'PAN number already added' });
    }

    user.pans.push({ panNumber, name });
    await user.save();
    
    res.json({ success: true, data: user.pans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a PAN
app.delete(['/api/users/:id/pans/:panId', '/api/v1/users/:id/pans/:panId'], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.pans = user.pans.filter(p => p._id.toString() !== req.params.panId);
    await user.save();
    
    res.json({ success: true, data: user.pans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
