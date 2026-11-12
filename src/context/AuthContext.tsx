import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { getUserProfile, syncUserProfile } from '../services/authService';
import type { UserProfile } from '../types';
import { useTheme } from './ThemeContext';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  isFirebaseConfigured: false,
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { setTheme } = useTheme();

  const loadUserProfile = async (currentUser: User) => {
    try {
      let profile = await getUserProfile(currentUser.uid);
      if (!profile) {
        profile = await syncUserProfile(currentUser);
      }
      setUserProfile(profile);

      // Apply saved preferred theme if available
      if (profile?.preferredTheme) {
        setTheme(profile.preferredTheme);
      }
    } catch (err) {
      console.warn('Could not sync profile with Firestore:', err);
      // Fallback local representation if Firestore is temporarily offline
      setUserProfile({
        uid: currentUser.uid,
        fullName: currentUser.displayName || '2KAI User',
        displayName: currentUser.displayName || 'User',
        email: currentUser.email || '',
        photoURL: currentUser.photoURL,
        provider: currentUser.providerData[0]?.providerId || 'password',
        emailVerified: currentUser.emailVerified,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        loginCount: 1,
        preferredTheme: 'dark',
        language: 'en',
        accountStatus: 'active',
      });
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await user.reload();
      await loadUserProfile(user);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isFirebaseConfigured,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

