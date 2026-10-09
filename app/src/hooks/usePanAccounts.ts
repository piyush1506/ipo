import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { useAuth } from './useAuth';
import { fetchUserPans, addUserPan, deleteUserPan } from '../api/userApi';

export interface PanAccount {
  id: string;
  holderName: string;
  panNumber: string;
  isDefault?: boolean;
}

const PAN_STORAGE_KEY = 'pkc_saved_pan_accounts_v1';
const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const REMOVED_PLACEHOLDER_PAN = 'ABCDE1234F';

async function readAccounts(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(PAN_STORAGE_KEY);
  }

  const secured = await SecureStore.getItemAsync(PAN_STORAGE_KEY);
  if (secured) return secured;

  const legacy = await AsyncStorage.getItem(PAN_STORAGE_KEY);
  if (legacy) {
    await SecureStore.setItemAsync(PAN_STORAGE_KEY, legacy);
    await AsyncStorage.removeItem(PAN_STORAGE_KEY);
  }
  return legacy;
}

async function writeAccounts(accounts: PanAccount[]): Promise<void> {
  const value = JSON.stringify(accounts);
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(PAN_STORAGE_KEY, value);
    return;
  }
  await SecureStore.setItemAsync(PAN_STORAGE_KEY, value);
}

function sanitizeAccounts(value: unknown): PanAccount[] {
  if (!Array.isArray(value)) return [];

  return value.filter((account): account is PanAccount => {
    if (!account || typeof account !== 'object') return false;
    const candidate = account as Partial<PanAccount>;
    return Boolean(
      candidate.id &&
      candidate.holderName &&
      candidate.panNumber &&
      candidate.panNumber !== REMOVED_PLACEHOLDER_PAN &&
      PAN_PATTERN.test(candidate.panNumber)
    );
  });
}

export function usePanAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<PanAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAccounts = useCallback(async () => {
    try {
      if (user) {
        // Fetch from backend
        const remotePans = await fetchUserPans(user._id);
        const mapped = remotePans.map((p) => ({
          id: p._id,
          holderName: p.name,
          panNumber: p.panNumber,
        }));
        setAccounts(mapped);
        await writeAccounts(mapped); // Cache locally
        return;
      }

      // Fallback to local
      const stored = await readAccounts();
      if (stored) {
        const parsed = sanitizeAccounts(JSON.parse(stored));
        setAccounts(parsed);
        await writeAccounts(parsed);
        return;
      }
      setAccounts([]);
    } catch (err) {
      console.warn('Failed to load PAN accounts:', err);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAccounts();
  }, [loadAccounts]);

  const addAccount = async (holderName: string, panNumber: string) => {
    const cleanPan = panNumber.trim().toUpperCase();
    const cleanName = holderName.trim() || 'Account';

    if (!PAN_PATTERN.test(cleanPan)) {
      throw new Error('Enter a valid PAN in the format ABCDE1234F.');
    }

    if (accounts.some((account) => account.panNumber === cleanPan)) {
      throw new Error('This PAN is already saved.');
    }

    let newAccount: PanAccount;
    
    if (user) {
      // Add to backend
      const remotePans = await addUserPan(user._id, cleanPan, cleanName);
      const backendPan = remotePans.find(p => p.panNumber === cleanPan);
      newAccount = {
        id: backendPan?._id || `pan_${Date.now()}`,
        holderName: cleanName,
        panNumber: cleanPan,
        isDefault: accounts.length === 0,
      };
    } else {
      newAccount = {
        id: `pan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        holderName: cleanName,
        panNumber: cleanPan,
        isDefault: accounts.length === 0,
      };
    }

    const updated = [...accounts, newAccount];
    setAccounts(updated);
    await writeAccounts(updated);
    return newAccount;
  };

  const deleteAccount = async (id: string) => {
    if (user && !id.startsWith('pan_')) {
      // Try deleting from backend
      try {
        await deleteUserPan(user._id, id);
      } catch (err) {
        console.warn('Backend delete failed, continuing locally', err);
      }
    }
    const updated = accounts.filter((acc) => acc.id !== id);
    setAccounts(updated);
    await writeAccounts(updated);
  };

  return {
    accounts,
    loading,
    addAccount,
    deleteAccount,
    reloadAccounts: loadAccounts,
  };
}
