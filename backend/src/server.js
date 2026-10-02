require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
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

connectDB();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    source: 'Upstox Real API'
  });
});

// Single IPO Details - Only Real Upstox Data
app.get(['/api/ipos/:id', '/api/v1/ipos/:id'], async (req, res) => {
  try {
    const queryId = req.params.id;
    let ipo = null;

    if (require('mongoose').connection.readyState === 1) {
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

// Get List of IPOs - Only Real Upstox Data
app.get(['/api/ipos', '/api/v1/ipos'], async (req, res) => {
  try {
    const { status, type, search } = req.query;
    let ipos = [];

    if (require('mongoose').connection.readyState === 1) {
      const filter = { source: 'upstox' };
      if (status && status !== 'all') {
        filter.status = new RegExp(`^${status}$`, 'i');
      }
      if (type && type !== 'all') {
        filter.issueType = new RegExp(`^${type}$`, 'i');
      }
      if (search) {
        filter.$or = [
          { companyName: new RegExp(search, 'i') },
          { ipoName: new RegExp(search, 'i') },
          { Symbol: new RegExp(search, 'i') },
          { industry: new RegExp(search, 'i') }
        ];
      }

      ipos = await IPO.find(filter)
        .sort({ opendate: -1, lastupdated: -1 })
        .lean();
    }

    // If database has no records or offline, fetch directly from live Upstox API
    if (!ipos || ipos.length === 0) {
      let liveList = await fetchDirectUpstoxList();
      if (status && status !== 'all') {
        liveList = liveList.filter(i => (i.status || '').toLowerCase() === status.toLowerCase());
      }
      if (type && type !== 'all') {
        liveList = liveList.filter(i => (i.issueType || '').toLowerCase() === type.toLowerCase());
      }
      if (search) {
        const s = search.toLowerCase();
        liveList = liveList.filter(i => 
          (i.companyName && i.companyName.toLowerCase().includes(s)) ||
          (i.Symbol && i.Symbol.toLowerCase().includes(s))
        );
      }
      ipos = liveList;
    }

    res.json({
      success: true,
      count: ipos.length,
      data: ipos,
      source: 'Upstox Primary Market API'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
});

// Trigger Upstox Data Sync
app.all(['/api/sync', '/api/v1/sync-ipos'], async (req, res) => {
  try {
    console.log('Real Upstox IPO sync triggered via API');
    const result = await SyncIPOs();
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
