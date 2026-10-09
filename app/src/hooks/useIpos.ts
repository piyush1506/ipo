import { useState, useEffect, useCallback } from 'react';
import { IpoItem } from '../types/ipo';
import { getCachedIpos, fetchLiveIpos } from '../api/ipoApi';

export function useIpos() {
  const [ipos, setIpos] = useState<IpoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async (isPullRefresh = false) => {
    if (isPullRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // 1. Instant cached dynamic load (if available from previous API response)
      const cached = await getCachedIpos();
      if (cached && cached.length > 0) {
        setIpos(cached);
        setLoading(false);
      }

      // 2. Fetch live dynamic data from Render API
      const live = await fetchLiveIpos(isPullRefresh);
      if (live && live.length > 0) {
        setIpos(live);
        setLastUpdated(new Date());
      } else if (!cached || cached.length === 0) {
        setError('No IPO data available. Pull down to refresh.');
      }
    } catch (err: any) {
      console.warn('Error loading dynamic IPOs:', err);
      setError(err?.message || 'Failed to fetch IPO data from backend.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (isMounted) {
        await loadData();
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, [loadData]);

  return {
    ipos,
    loading,
    refreshing,
    error,
    lastUpdated,
    refresh: () => loadData(true),
  };
}
