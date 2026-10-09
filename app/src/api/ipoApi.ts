import AsyncStorage from '@react-native-async-storage/async-storage';
import { IpoItem } from '../types/ipo';
import { API_CONFIG } from '../config/api';

const STORAGE_CACHE_KEY = 'pkc_ipos_dynamic_cache_v3';
const CUSTOM_API_URL_KEY = 'pkc_custom_api_url_v1';
const CACHE_FRESH_TTL = 2 * 60 * 1000; // 2 minutes

let inMemoryIpos: IpoItem[] | null = null;
let lastFetchTimestamp = 0;

/**
 * Get active Backend Base URL (custom saved or from config / .env)
 */
export async function getActiveBaseUrl(): Promise<string> {
  try {
    const custom = await AsyncStorage.getItem(CUSTOM_API_URL_KEY);
    if (custom && custom.trim().startsWith('http')) {
      return custom.trim().replace(/\/$/, '');
    }
  } catch {}
  return API_CONFIG.baseUrl;
}

/**
 * Set custom Backend Base URL at runtime
 */
export async function setActiveBaseUrl(url: string): Promise<void> {
  try {
    if (url && url.trim().startsWith('http')) {
      await AsyncStorage.setItem(CUSTOM_API_URL_KEY, url.trim().replace(/\/$/, ''));
      inMemoryIpos = null; // reset memory cache to force dynamic re-fetch
    }
  } catch {}
}

/**
 * Check Backend Health & Database status on Render
 */
export async function checkApiHealth(): Promise<{
  online: boolean;
  dbState?: string;
  cacheStatus?: string;
  cachedCount?: number;
  url: string;
}> {
  const base = await getActiveBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${base}/api/health`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      return {
        online: true,
        dbState: json.dbState,
        cacheStatus: json.cacheStatus,
        cachedCount: json.cachedCount,
        url: base,
      };
    }
  } catch {}

  return {
    online: false,
    url: base,
  };
}

/**
 * Loads dynamic cached IPOs previously saved from API (0ms startup)
 */
export async function getCachedIpos(): Promise<IpoItem[]> {
  if (inMemoryIpos && inMemoryIpos.length > 0) {
    return inMemoryIpos;
  }

  try {
    const raw = await AsyncStorage.getItem(STORAGE_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const data = Array.isArray(parsed) ? parsed : parsed.data;
      if (Array.isArray(data) && data.length > 0) {
        inMemoryIpos = data;
        return data;
      }
    }
  } catch (err) {
    console.warn('Failed to read local IPO cache:', err);
  }

  return [];
}

/**
 * Fetch IPOs dynamically and directly from Render Backend API
 */
export async function fetchLiveIpos(forceRefresh = false): Promise<IpoItem[]> {
  const now = Date.now();
  if (!forceRefresh && inMemoryIpos && inMemoryIpos.length > 0 && (now - lastFetchTimestamp < CACHE_FRESH_TTL)) {
    return inMemoryIpos;
  }

  const base = await getActiveBaseUrl();
  const endpoints = [
    `${base}/api/ipos`,
    `${base}/api/v1/ipos`,
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      // Render free tier can take up to 15s to spin up if dormant
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeoutMs);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const data = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : null);
        if (data && data.length > 0) {
          inMemoryIpos = data;
          lastFetchTimestamp = Date.now();
          await AsyncStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify({
            data,
            timestamp: Date.now()
          })).catch(() => {});
          return data;
        }
      }
    } catch (err: any) {
      console.warn(`Dynamic fetch attempt from ${url}:`, err.message || err);
    }
  }

  // If live network call failed, return previously cached dynamic API data
  const cached = await getCachedIpos();
  return cached;
}

export interface AllotmentCheckResult {
  accountId: string;
  holderName: string;
  panMasked: string;
  status: 'ALLOTTED' | 'NOT_ALLOTTED' | 'PENDING' | 'ERROR';
  sharesAllotted: number;
  lotCount: number;
  amountDebited: number;
  refundStatus: string;
  applicationNo: string;
  dpClientId?: string;
  checkedAt: string;
  errorMessage?: string;
}

export interface AllotmentCapability {
  available: boolean;
  mode: 'disabled' | 'live';
  message: string;
  provider?: string;
}

export class AllotmentApiError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'AllotmentApiError';
    this.code = code;
  }
}

export async function getAllotmentCapability(): Promise<AllotmentCapability> {
  const base = await getActiveBaseUrl();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${base}/api/allotment/capabilities`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`Capability request failed (${response.status})`);

    const json = await response.json();
    return {
      available: json.available === true && json.mode === 'live',
      mode: json.available === true && json.mode === 'live' ? 'live' : 'disabled',
      message: json.message || 'Automatic allotment checks are awaiting official API approval.',
      provider: json.provider,
    };
  } catch {
    return {
      available: false,
      mode: 'disabled',
      message: 'Automatic allotment checks are awaiting official data API approval.',
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Auto Allotment API Checker.
 * Sends PAN list and IPO ID to backend endpoint (`/api/allotment/check`).
 * Never fabricates a result. The backend returns a clear unavailable response
 * until an approved allotment data provider is configured.
 */
export async function checkBulkAllotmentApi(
  ipo: IpoItem,
  accounts: { id: string; holderName: string; panNumber: string }[]
): Promise<AllotmentCheckResult[]> {
  const base = await getActiveBaseUrl();
  const endpoint = `${base}/api/allotment/check`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          ipoId: ipo.ipoId,
          companyName: ipo.companyName || ipo.ipoName,
          symbol: ipo.Symbol,
          accounts: accounts.map((account) => ({
            accountId: account.id,
            panNumber: account.panNumber,
          })),
        }),
        signal: controller.signal,
      });

      const json = await response.json();
      if (!response.ok) {
        throw new AllotmentApiError(
          json.message || 'Allotment checking is currently unavailable.',
          json.code
        );
      }

      if (!Array.isArray(json.results)) {
        throw new AllotmentApiError('The allotment service returned an invalid response.');
      }

      return json.results.map((result: Omit<AllotmentCheckResult, 'holderName'>) => ({
        ...result,
        holderName: accounts.find((account) => account.id === result.accountId)?.holderName || 'Account',
      }));
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    if (error instanceof AllotmentApiError) throw error;
    throw new AllotmentApiError('Unable to reach the allotment service. Please try again later.');
  }
}

/**
 * Checks exactly one saved PAN profile. The UI calls this sequentially so each
 * profile has independent progress, response handling, and failure reporting.
 */
export async function checkAllotmentAccountApi(
  ipo: IpoItem,
  account: { id: string; holderName: string; panNumber: string }
): Promise<AllotmentCheckResult> {
  const results = await checkBulkAllotmentApi(ipo, [account]);
  const result = results[0];
  if (!result) {
    throw new AllotmentApiError(`No allotment result was returned for ${account.holderName}.`);
  }
  return result;
}
