import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WATCHLIST_STORAGE_KEY = 'pkc_ipo_watchlist_v1';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(WATCHLIST_STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) setWatchlist(list);
        }
      })
      .catch(() => {});
  }, []);

  const toggleWatchlist = useCallback(async (ipoId: string) => {
    setWatchlist((prev) => {
      const next = prev.includes(ipoId) ? prev.filter((id) => id !== ipoId) : [...prev, ipoId];
      AsyncStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const isSaved = useCallback((ipoId: string) => watchlist.includes(ipoId), [watchlist]);

  return {
    watchlist,
    toggleWatchlist,
    isSaved
  };
}
