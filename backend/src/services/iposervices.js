const axios = require('axios');
const Ipo = require('../models/ipo');

const UPSTOX_API_BASE = 'https://api.upstox.com/v2';

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
      timeout: 8000
    });
    return res.data?.data || null;
  } catch (err) {
    console.warn(`Upstox details fetch skipped for ${ipoId}:`, err.message);
    return null;
  }
}

/**
 * Synchronize all IPOs from Upstox API (Open, Upcoming, Closed) into MongoDB
 */
async function SyncIPOs() {
  console.log('Starting Upstox IPO synchronization...');
  const headers = getUpstoxHeaders();
  if (!headers) {
    console.error('UPSTOX_ACCESS_TOKEN is not configured.');
    return { success: false, message: 'Missing Upstox access token' };
  }

  try {
    const [openRes, upcomingRes, closedRes] = await Promise.allSettled([
      axios.get(`${UPSTOX_API_BASE}/ipos`, { headers, timeout: 10000 }),
      axios.get(`${UPSTOX_API_BASE}/ipos?status=upcoming`, { headers, timeout: 10000 }),
      axios.get(`${UPSTOX_API_BASE}/ipos?status=closed`, { headers, timeout: 10000 })
    ]);

    const openList = openRes.status === 'fulfilled' && openRes.value.data?.data ? openRes.value.data.data : [];
    const upcomingList = upcomingRes.status === 'fulfilled' && upcomingRes.value.data?.data ? upcomingRes.value.data.data : [];
    const closedList = closedRes.status === 'fulfilled' && closedRes.value.data?.data ? closedRes.value.data.data : [];

    // Tag initial status
    const allBasic = [
      ...openList.map(i => ({ ...i, inferredStatus: 'Open' })),
      ...upcomingList.map(i => ({ ...i, inferredStatus: 'Upcoming' })),
      ...closedList.map(i => ({ ...i, inferredStatus: 'Closed' }))
    ];

    console.log(`Found ${allBasic.length} total IPOs from Upstox (Open: ${openList.length}, Upcoming: ${upcomingList.length}, Closed: ${closedList.length}).`);

    let savedCount = 0;

    for (const basic of allBasic) {
      const id = basic.id || basic.symbol;
      if (!id) continue;

      // Fetch deep details for timeline, registrar, lot size, etc.
      const detail = await fetchUpstoxIpoDetails(id, headers);
      const source = detail || basic;

      const ipoData = {
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
        lotsize: Number(source.lot_size || source.minimum_quantity || 1),
        minimumQuantity: Number(source.minimum_quantity || source.lot_size || 1),
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
        status: (basic.inferredStatus || (source.status === 'open' ? 'Open' : source.status === 'upcoming' ? 'Upcoming' : 'Closed')),
        source: 'upstox',
        lastupdated: new Date()
      };

      await Ipo.findOneAndUpdate(
        { ipoId: ipoData.ipoId },
        { $set: ipoData },
        { upsert: true, new: true }
      );
      savedCount++;
    }

    console.log(`Successfully synced ${savedCount} Upstox IPOs to MongoDB.`);
    return {
      success: true,
      count: savedCount,
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

/**
 * Direct Live fetch from Upstox without needing DB sync first
 */
async function fetchDirectUpstoxList() {
  const headers = getUpstoxHeaders();
  if (!headers) return [];

  try {
    const [openRes, upcomingRes, closedRes] = await Promise.allSettled([
      axios.get(`${UPSTOX_API_BASE}/ipos`, { headers, timeout: 8000 }),
      axios.get(`${UPSTOX_API_BASE}/ipos?status=upcoming`, { headers, timeout: 8000 }),
      axios.get(`${UPSTOX_API_BASE}/ipos?status=closed`, { headers, timeout: 8000 })
    ]);

    const openList = openRes.status === 'fulfilled' && openRes.value.data?.data ? openRes.value.data.data : [];
    const upcomingList = upcomingRes.status === 'fulfilled' && upcomingRes.value.data?.data ? upcomingRes.value.data.data : [];
    const closedList = closedRes.status === 'fulfilled' && closedRes.value.data?.data ? closedRes.value.data.data : [];

    const formatItem = (item, status) => ({
      ipoId: item.id || item.symbol,
      companyName: item.name,
      ipoName: item.name,
      Symbol: item.symbol,
      isin: item.isin,
      industry: item.industry || 'Market Offer',
      issueType: (item.issue_type || '').toLowerCase() === 'sme' ? 'SME' : 'Mainboard',
      exchange: ['NSE', 'BSE'],
      priceband: {
        min: Number(item.minimum_price || 0),
        max: Number(item.maximum_price || 0)
      },
      lotsize: 1,
      cutoffPrice: Number(item.maximum_price || 0),
      issuesize: Number(item.issue_size || 0),
      opendate: item.bidding_start_date,
      closedate: item.bidding_end_date,
      totalSubscription: String(item.total_subscription || '0.0'),
      status: status,
      source: 'upstox'
    });

    return [
      ...openList.map(i => formatItem(i, 'Open')),
      ...upcomingList.map(i => formatItem(i, 'Upcoming')),
      ...closedList.map(i => formatItem(i, 'Closed'))
    ];
  } catch (err) {
    console.error('Error fetching live Upstox list directly:', err.message);
    return [];
  }
}

module.exports = {
  SyncIPOs,
  fetchDirectUpstoxList,
  fetchUpstoxIpoDetails
};
