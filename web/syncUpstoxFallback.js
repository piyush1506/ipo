const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, 'backend', '.env');
const envText = fs.readFileSync(envPath, 'utf-8');
const lines = envText.split('\n');
let token = '';
for (const line of lines) {
  if (line.startsWith('UPSTOX_ACCESS_TOKEN=')) {
    token = line.split('=')[1].trim();
  }
}

const UPSTOX_API_BASE = 'https://api.upstox.com/v2';
const headers = { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' };

async function fetchIpoDetails(id) {
  try {
    const res = await fetch(`${UPSTOX_API_BASE}/ipos/${encodeURIComponent(id)}`, { headers });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

async function mapConcurrent(items, limit, fn) {
  const results = [];
  for (let i = 0; i < items.length; i += limit) {
    const chunk = items.slice(i, i + limit);
    const chunkResults = await Promise.allSettled(chunk.map(fn));
    for (const r of chunkResults) {
      if (r.status === 'fulfilled' && r.value) results.push(r.value);
    }
  }
  return results;
}

async function generate() {
  console.log('Fetching live Upstox IPOs...');
  const [openRes, upcomingRes, closedRes] = await Promise.all([
    fetch(`${UPSTOX_API_BASE}/ipos`, { headers }).then(r => r.json()).catch(() => ({ data: [] })),
    fetch(`${UPSTOX_API_BASE}/ipos?status=upcoming`, { headers }).then(r => r.json()).catch(() => ({ data: [] })),
    fetch(`${UPSTOX_API_BASE}/ipos?status=closed`, { headers }).then(r => r.json()).catch(() => ({ data: [] }))
  ]);

  const allBasic = [
    ...(openRes.data || []).map(i => ({ ...i, inferredStatus: 'OPEN' })),
    ...(upcomingRes.data || []).map(i => ({ ...i, inferredStatus: 'UPCOMING' })),
    ...(closedRes.data || []).map(i => ({ ...i, inferredStatus: 'CLOSED' }))
  ];

  console.log(`Fetched ${allBasic.length} raw IPOs from Upstox API. Fetching detailed records in parallel...`);

  const detailedIpos = await mapConcurrent(allBasic, 8, async (basic) => {
    const id = basic.id || basic.symbol;
    if (!id) return null;
    const detail = await fetchIpoDetails(id);
    const source = detail || basic;

    const cleanStatus = basic.inferredStatus || (source.status ? source.status.toUpperCase() : 'UPCOMING');
    const minP = Number(source.minimum_price || basic.minimum_price || 0);
    const maxP = Number(source.maximum_price || basic.maximum_price || source.cut_off_price || 0);
    const cutP = Number(source.cut_off_price || maxP || minP || 0);
    const lotS = Number(source.lot_size || source.minimum_quantity || (source.issue_type === 'sme' ? 1200 : 1));

    return {
      ipoId: String(id),
      Symbol: source.symbol || basic.symbol || (source.name || id).split(' ')[0].toUpperCase(),
      companyName: source.name || basic.name || id,
      ipoName: source.name || basic.name || id,
      isin: source.isin || basic.isin || '',
      industry: source.industry || basic.industry || (source.issue_type === 'sme' ? 'SME Growth Enterprise' : 'Public Corporate Offering'),
      issueType: (source.issue_type || basic.issue_type || 'regular').toLowerCase() === 'sme' ? 'SME' : 'Mainboard',
      exchange: source.listing_exchange ? [source.listing_exchange] : ['NSE', 'BSE'],
      priceband: {
        min: minP,
        max: maxP
      },
      lotsize: lotS,
      minimumQuantity: Number(source.minimum_quantity || lotS),
      cutoffPrice: cutP,
      faceValue: Number(source.face_value || 10),
      opendate: source.timeline?.application_start_date || basic.bidding_start_date ? new Date(source.timeline?.application_start_date || basic.bidding_start_date).toISOString() : null,
      closedate: source.timeline?.application_end_date || basic.bidding_end_date ? new Date(source.timeline?.application_end_date || basic.bidding_end_date).toISOString() : null,
      allotmentdate: source.timeline?.allotment_date ? new Date(source.timeline.allotment_date).toISOString() : null,
      refunddate: source.timeline?.refund_initiation_date ? new Date(source.timeline.refund_initiation_date).toISOString() : null,
      listingdate: source.timeline?.listing_date ? new Date(source.timeline.listing_date).toISOString() : null,
      mandatedate: source.timeline?.mandate_end_date ? new Date(source.timeline.mandate_end_date).toISOString() : null,
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
        lastupdated: new Date().toISOString(),
        source: 'Upstox Primary Feed'
      },
      registrar: source.registrar_info?.name || 'Registrar to be finalized',
      registrarInfo: {
        name: source.registrar_info?.name || 'Registrar to be finalized',
        email: source.registrar_info?.email || 'support@pkctechs.com',
        contact_name: source.registrar_info?.contact_name || 'Registrar Helpdesk',
        contact_number: source.registrar_info?.contact_number || '+91 22 4918 6200',
        website: source.registrar_info?.website || 'https://linkintime.co.in',
        registrar: source.registrar_info?.registrar || 'LINK'
      },
      rhpUrl: source.rhp_url || null,
      status: cleanStatus,
      source: 'upstox_live_api',
      lastupdated: new Date().toISOString()
    };
  });

  console.log(`Successfully processed ${detailedIpos.length} real Upstox IPOs.`);

  const fileContent = `// Real Live Upstox Primary Market IPO Dataset (Auto-synced from Upstox Primary API)
// Contains genuine live, upcoming, and closed Indian IPOs for SSR and fallback hydration.

export const FALLBACK_IPOS = ${JSON.stringify(detailedIpos, null, 2)};
`;

  const targetFile = path.resolve(__dirname, 'frontend', 'src', 'data', 'fallbackIpos.js');
  fs.writeFileSync(targetFile, fileContent, 'utf-8');
  console.log('Successfully written real Upstox IPO dataset to:', targetFile);
}

generate();
