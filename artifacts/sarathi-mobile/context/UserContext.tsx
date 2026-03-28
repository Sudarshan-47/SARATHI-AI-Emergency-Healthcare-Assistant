import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'english' | 'hindi' | 'telugu';

export interface UserProfile {
  name: string;
  phone: string;
  parent1Name: string;
  parent1Phone: string;
  parent2Name?: string;
  parent2Phone?: string;
  language: Language;
}

interface UserContextValue {
  user: UserProfile | null;
  saveUser: (profile: UserProfile) => Promise<void>;
  clearUser: () => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  saveUser: async () => {},
  clearUser: async () => {},
  isLoading: true,
});

const STORAGE_KEY = '@sarathi_user';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(val => {
      if (val) {
        try { setUser(JSON.parse(val)); } catch {}
      }
      setIsLoading(false);
    });
  }, []);

  const saveUser = async (profile: UserProfile) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setUser(profile);
  };

  const clearUser = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, saveUser, clearUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
