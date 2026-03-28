import { useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  phone: string;
  parent1Name: string;
  parent1Phone: string;
  parent2Name?: string;
  parent2Phone?: string;
  language: 'english' | 'hindi' | 'telugu';
}

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('sarathiUser');
    return saved ? JSON.parse(saved) : null;
  });

  const saveUser = (profile: UserProfile) => {
    localStorage.setItem('sarathiUser', JSON.stringify(profile));
    setUser(profile);
  };

  const clearUser = () => {
    localStorage.removeItem('sarathiUser');
    localStorage.removeItem('sarathiSession');
    setUser(null);
  };

  return { user, saveUser, clearUser };
}
