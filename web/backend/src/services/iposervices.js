const axios = require('axios');
const Ipo = require('../models/ipo');

const UPSTOX_API_BASE = 'https://api.upstox.com/v2';
const UPSTOX_MARKET_DATA_BASE = 'https://api.upstox.com/v3';
let syncPromise = null;

function getUpstoxHeaders() {
  const token = process.env.UPSTOX_ACCESS_TOKEN;
  if (!token) return null;
  return {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

/**
 * Fetch detailed IPO information from Upstox for a specific IPO ID
 */
async function fetchUpstoxIpoDetails(ipoId, headers) {
  try {
    const res = await axios.get(`${UPSTOX_API_BASE}/ipos/${ipoId}`, {
      headers,
      timeout: 6000
    });
    return res.data?.data || null;
  } catch (err) {
    return null;
  }
}

/**
 * Helper to process array in concurrent batches
 */
async function mapConcurrent(items, limit, fn) {
  const results = [];
  for (let i = 0; i < items.length; i += limit) {
    const chunk = items.slice(i, i + limit);
    const chunkResults = await Promise.allSettled(chunk.map(fn));
    for (const r of chunkResults) {
      if (r.status === 'fulfilled') results.push(r.value);
    }
  }
  return results;
}

function toIsoDate(value) {
  // Upstox candle timestamps are exchange-local (+05:30). Preserve their
  // calendar date instead of converting midnight to the previous UTC date.
  if (typeof value === 'string') {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function getIndiaToday() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function addDays(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function getInstrumentKeys(ipo) {
  if (!ipo.isin) return [];

  const rawExchanges = Array.isArray(ipo.exchange)
    ? ipo.exchange
    : String(ipo.exchange || '').split(/[,/|]+/);
  const exchanges = rawExchanges.map((value) => String(value).trim().toUpperCase());
  const keys = [];

  // Try the IPO's stated listing venue first, then the other venue as a fallback.
  if (exchanges.some((value) => value.includes('NSE'))) keys.push(`NSE_EQ|${ipo.isin}`);
  if (exchanges.some((value) => value.includes('BSE'))) keys.push(`BSE_EQ|${ipo.isin}`);
  if (keys.length === 0) keys.push(`NSE_EQ|${ipo.isin}`, `BSE_EQ|${ipo.isin}`);

  return [...new Set(keys)];
}

async function fetchListingOpenPrice(instrumentKey, listingDate, headers) {
  // V3 endpoint order is to_date first, then from_date. A short forward
  // window allows for provider date handling, but only the actual listing-day
  // candle is accepted as the listing price.
  const fromDate = listingDate;
  const toDate = addDays(listingDate, 7);
  const endpoint = `${UPSTOX_MARKET_DATA_BASE}/historical-candle/${encodeURIComponent(instrumentKey)}/days/1/${toDate}/${fromDate}`;

  try {
    const response = await axios.get(endpoint, { headers, timeout: 10000 });
    const candles = response.data?.data?.candles;
    if (!Array.isArray(candles)) {
      console.warn(`[Upstox History] No candles returned for ${instrumentKey}; status=${response.data?.status || 'unknown'}`);
      return null;
    }

    const listingCandle = candles
      .filter((candle) => Array.isArray(candle) && candle.length >= 2)
      .map((candle) => ({
        date: toIsoDate(candle[0]),
        open: Number(candle[1])
      }))
      .find((candle) => candle.date === listingDate && Number.isFinite(candle.open) && candle.open > 0);

    return listingCandle || null;
  } catch (error) {
    const status = error.response?.status || 'network';
    const apiMessage = error.response?.data?.errors?.[0]?.message || error.response?.data?.message || error.message;
    console.warn(`[Upstox History] Request failed for ${instrumentKey} on ${listingDate}: HTTP ${status} - ${apiMessage}`);
    return null;
  }
}

async function enrichListedIposWithMarketData(ipos, headers) {
  const today = getIndiaToday();
  const listedIpos = ipos.filter((ipo) => {
    const listingDate = toIsoDate(ipo.listingdate);
    return listingDate && listingDate <= today && ipo.isin;
  });

  const missingIsinCount = ipos.filter((ipo) => {
    const listingDate = toIsoDate(ipo.listingdate);
    return listingDate && listingDate <= today && !ipo.isin;
  }).length;

  let actualListingPriceCount = 0;
  await mapConcurrent(listedIpos, 4, async (ipo) => {
    const listingDate = toIsoDate(ipo.listingdate);
    const issuePrice = Number(ipo.cutoffPrice || ipo.priceband?.max || 0);
    if (!listingDate || issuePrice <= 0) {
      console.warn(`[Upstox History] Skipping ${ipo.companyName || ipo.ipoId}: missing listing date or valid issue price.`);
      return null;
    }

    for (const instrumentKey of getInstrumentKeys(ipo)) {
      const candle = await fetchListingOpenPrice(instrumentKey, listingDate, headers);
      if (!candle) continue;

      const listingGain = Number((candle.open - issuePrice).toFixed(2));
      ipo.gmp = {
        ...ipo.gmp,
        isListed: true,
        listingPrice: candle.open,
        listingGain,
        listingGainPercentage: Number(((listingGain / issuePrice) * 100).toFixed(2)),
        listingGainIsActual: true,
        listingGainSource: 'Upstox V3 historical candle data',
        listingGainUpdatedAt: new Date(`${candle.date}T00:00:00.000Z`)
      };
      actualListingPriceCount += 1;
      return ipo;
    }

    console.warn(`[Upstox History] No listing-day candle found for ${ipo.companyName || ipo.ipoId} (ISIN ${ipo.isin}, listing date ${listingDate}).`);
    return null;
  });

  console.log(`[Sync] Retrieved actual Upstox listing prices for ${actualListingPriceCount} / ${listedIpos.length} listed IPOs; ${missingIsinCount} had no ISIN.`);
}

/**
 * Synchronize all IPOs from Upstox API (Open, Upcoming, Closed) into MongoDB with Parallel Concurrency
 */
async function executeSyncIPOs() {
  const startTime = Date.now();
  console.log('[Sync] Starting optimized parallel Upstox IPO synchronization...');
  const headers = getUpstoxHeaders();
  if (!headers) {
    console.error('UPSTOX_ACCESS_TOKEN is not configured.');
    return { success: false, message: 'Missing Upstox access token' };
  }

  try {
    const [openRes, upcomingRes, closedRes] = await Promise.allSettled([
      axios.get(`${UPSTOX_API_BASE}/ipos`, { headers, timeout: 8000 }),
      axios.get(`${UPSTOX_API_BASE}/ipos?status=upcoming`, { headers, timeout: 8000 }),
      axios.get(`${UPSTOX_API_BASE}/ipos?status=closed`, { headers, timeout: 8000 })
    ]);

    const openList = openRes.status === 'fulfilled' && openRes.value.data?.data ? openRes.value.data.data : [];
    const upcomingList = upcomingRes.status === 'fulfilled' && upcomingRes.value.data?.data ? upcomingRes.value.data.data : [];
    const closedList = closedRes.status === 'fulfilled' && closedRes.value.data?.data ? closedRes.value.data.data : [];

    const allBasic = [
      ...openList.map(i => ({ ...i, inferredStatus: 'Open' })),
      ...upcomingList.map(i => ({ ...i, inferredStatus: 'Upcoming' })),
      ...closedList.map(i => ({ ...i, inferredStatus: 'Closed' }))
    ];

    console.log(`[Sync] Found ${allBasic.length} total IPOs from Upstox. Fetching details in parallel batches...`);

    // Fetch details in parallel batches of 8 items concurrently
    const detailedIpos = await mapConcurrent(allBasic, 8, async (basic) => {
      const id = basic.id || basic.symbol;
      if (!id) return null;

      const detail = await fetchUpstoxIpoDetails(id, headers);
      const source = detail || basic;

      return {
        ipoId: String(id),
        Symbol: source.symbol || basic.symbol || '',
        companyName: source.name || basic.name || id,
        ipoName: source.name || basic.name || id,
        isin: source.isin || basic.isin || '',
        industry: source.industry || basic.industry || 'Diverse',
        issueType: (source.issue_type || basic.issue_type || 'regular').toLowerCase() === 'sme' ? 'SME' : 'Mainboard',
        exchange: source.listing_exchange ? [source.listing_exchange] : ['NSE', 'BSE'],
        priceband: {
          min: Number(source.minimum_price || basic.minimum_price || 0),
          max: Number(source.maximum_price || basic.maximum_price || 0)
        },
        lotsize: Number(source.lot_size || source.minimum_quantity || 0),
        minimumQuantity: Number(source.minimum_quantity || source.lot_size || 0),
        cutoffPrice: Number(source.cut_off_price || source.maximum_price || basic.maximum_price || 0),
        faceValue: Number(source.face_value || 10),
        opendate: source.timeline?.application_start_date || basic.bidding_start_date ? new Date(source.timeline?.application_start_date || basic.bidding_start_date) : null,
        closedate: source.timeline?.application_end_date || basic.bidding_end_date ? new Date(source.timeline?.application_end_date || basic.bidding_end_date) : null,
        allotmentdate: source.timeline?.allotment_date ? new Date(source.timeline.allotment_date) : null,
        refunddate: source.timeline?.refund_initiation_date ? new Date(source.timeline.refund_initiation_date) : null,
        listingdate: source.timeline?.listing_date ? new Date(source.timeline.listing_date) : null,
        mandatedate: source.timeline?.mandate_end_date ? new Date(source.timeline.mandate_end_date) : null,
        issuesize: Number(source.issue_size || basic.issue_size || 0),
        totalSubscription: String(source.total_subscription || basic.total_subscription || '0.0'),
        subscription: {
          qib: 0,
          nii: 0,
          retail: 0,
          total: Number(source.total_subscription || basic.total_subscription || 0)
        },
        gmp: {
          price: 0,
          percentage: 0,
          lastupdated: new Date(),
          source: 'Upstox'
        },
        registrar: source.registrar_info?.name || 'To Be Announced',
        registrarInfo: {
          name: source.registrar_info?.name || '',
          email: source.registrar_info?.email || '',
          contact_name: source.registrar_info?.contact_name || '',
          contact_number: source.registrar_info?.contact_number || '',
          website: source.registrar_info?.website || '',
          registrar: source.registrar_info?.registrar || ''
        },
        rhpUrl: source.rhp_url || null,
        status: (() => {
          const today = getIndiaToday();
          const listingDate = toIsoDate(source.timeline?.listing_date || basic.timeline?.listing_date || source.listing_date || basic.listing_date);
          const allotmentDate = toIsoDate(source.timeline?.allotment_date || basic.timeline?.allotment_date);
          const providerStatus = String(source.status || '').trim().toLowerCase();
          if (listingDate && listingDate <= today) return 'Listed';
          if (allotmentDate && allotmentDate <= today) return 'Allotted';
          if (providerStatus === 'open' || providerStatus === 'upcoming' || providerStatus === 'closed') {
            return providerStatus.charAt(0).toUpperCase() + providerStatus.slice(1);
          }
          return basic.inferredStatus || 'Closed';
        })(),
        source: 'upstox',
        lastupdated: new Date()
      };
    });

    const validIpos = detailedIpos.filter(Boolean);

    // Load existing records before enrichment so verified historical listing prices
    // are not overwritten when the provider temporarily has no candle response.
    const mongoose = require('mongoose');
    const existingIpos = mongoose.connection.readyState === 1 && validIpos.length > 0
      ? await Ipo.find({ ipoId: { $in: validIpos.map((i) => i.ipoId) } }).lean()
      : [];
    const existingMap = new Map(existingIpos.map((item) => [item.ipoId, item]));

    // Enrich Upstox IPOs with live GMP matched from IPOGuru
    try {
      const { enrichIposWithGmp } = require('./gmpService');
      await enrichIposWithGmp(validIpos);
    } catch (gmpErr) {
      console.warn('[Sync] IPOGuru GMP enrichment warning:', gmpErr.message);
    }

    // Use the listing day's market open from Upstox for listed IPOs. This
    // intentionally runs during synchronization, never on user read paths.
    await enrichListedIposWithMarketData(validIpos, headers);

    // Retain previously verified listing-day prices if this sync could not
    // retrieve a fresh candle. Never replace an actual price with a GMP estimate.
    for (const ipoData of validIpos) {
      const previous = existingMap.get(ipoData.ipoId);
      if (previous?.gmp?.listingGainIsActual && !ipoData.gmp?.listingGainIsActual) {
        ipoData.gmp = {
          ...ipoData.gmp,
          isListed: true,
          listingPrice: previous.gmp.listingPrice,
          listingGain: previous.gmp.listingGain,
          listingGainPercentage: previous.gmp.listingGainPercentage,
          listingGainIsActual: true,
          listingGainSource: previous.gmp.listingGainSource || 'Previously verified Upstox market data',
          listingGainUpdatedAt: previous.gmp.listingGainUpdatedAt
        };
      }
    }

    // Bulk upsert into MongoDB using bulkWrite for maximum speed
    if (mongoose.connection.readyState === 1 && validIpos.length > 0) {
      // Notifications are best-effort: FCM outages must never block IPO persistence.
      for (const ipoData of validIpos) {
        const existing = existingMap.get(ipoData.ipoId);
        if (existing && existing.status !== ipoData.status) {
          let notification = null;
          if (ipoData.status === 'Open') {
            notification = ['IPO Opened! 🚀', `${ipoData.companyName} is now open for subscription.`];
          } else if (ipoData.status === 'Allotted') {
            notification = ['Allotment Declared! 🎉', `The allotment for ${ipoData.companyName} is out. Check your status!`];
          } else if (ipoData.status === 'Listed') {
            notification = ['IPO Listed! 📈', `${ipoData.companyName} has just been listed.`];
          }

          if (notification) {
            try {
              const { notifyAllUsers } = require('./notificationService');
              await notifyAllUsers(notification[0], notification[1], { ipoId: ipoData.ipoId });
            } catch (notificationError) {
              console.warn(`[FCM] Skipping notification for ${ipoData.ipoId}; IPO sync will continue:`, notificationError.message);
            }
          }
        }
      }

      // 3. Save to database
      const ops = validIpos.map(ipoData => ({
        updateOne: {
          filter: { ipoId: ipoData.ipoId },
          update: { $set: ipoData },
          upsert: true
        }
      }));
      await Ipo.bulkWrite(ops, { ordered: false });
    }

    const elapsed = Date.now() - startTime;
    console.log(`[Sync] Successfully synced ${validIpos.length} Upstox IPOs in ${elapsed}ms.`);
    return {
      success: true,
      count: validIpos.length,
      elapsedMs: elapsed,
      source: 'upstox'
    };
  } catch (error) {
    console.error('Error during Upstox sync:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

function SyncIPOs() {
  if (syncPromise) {
    return syncPromise;
  }

  syncPromise = executeSyncIPOs().finally(() => {
    syncPromise = null;
  });

  return syncPromise;
}

module.exports = {
  SyncIPOs,
  fetchUpstoxIpoDetails,
  enrichListedIposWithMarketData
};
