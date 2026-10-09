import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User, loginUser } from '../api/userApi';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

const AUTH_STORAGE_KEY = 'pkc_auth_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        let stored: string | null = null;
        if (Platform.OS === 'web') {
          stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        } else {
          stored = await SecureStore.getItemAsync(AUTH_STORAGE_KEY);
        }
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load user', e);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const saveUser = async (u: User | null) => {
    if (Platform.OS === 'web') {
      if (u) await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
      else await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      if (u) await SecureStore.setItemAsync(AUTH_STORAGE_KEY, JSON.stringify(u));
      else await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY);
    }
    setUser(u);
  };

  const login = async (email: string, name: string) => {
    setLoading(true);
    try {
      const loggedInUser = await loginUser(email, name);
      await saveUser(loggedInUser);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await saveUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
