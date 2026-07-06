'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider, 
  OAuthProvider, 
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as firebaseUpdateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, isFirebaseAvailable } from '../lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'user';
  createdAt: string;
  subscription: {
    plan: 'free' | 'pro' | 'business';
    status: 'active' | 'inactive';
    currentPeriodEnd: string;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
  syncProfile: () => Promise<void>;
  updateUserField: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = 'http://localhost:5000/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync profile data from backend API
  const fetchProfile = async (authToken: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        // Clear token if invalid profile
        logout();
      }
    } catch (err) {
      console.error('Error fetching backend user profile:', err);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('decorai_token');
    
    if (isFirebaseAvailable && auth) {
      // 1. Firebase Live Authentication Auth State Listener
      const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
        setLoading(true);
        if (firebaseUser) {
          try {
            const idToken = await firebaseUser.getIdToken();
            setToken(idToken);
            localStorage.setItem('decorai_token', idToken);
            
            // Sync with backend database
            const syncRes = await fetch(`${API_BASE}/auth/sync`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                photoURL: firebaseUser.photoURL || ''
              })
            });

            if (syncRes.ok) {
              const profileData = await syncRes.json();
              setUser(profileData);
            }
          } catch (error) {
            console.error('Failed syncing Firebase User to Backend:', error);
          }
        } else {
          setUser(null);
          setToken(null);
          localStorage.removeItem('decorai_token');
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // 2. Client-Side Mock Auth Mode fallback - do not auto-restore to force login/signup testing
      setUser(null);
      setToken(null);
      localStorage.removeItem('decorai_token');
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (isFirebaseAvailable && auth) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Mock Login Rules
        let uid = 'user-uid';
        if (email.toLowerCase().includes('admin')) {
          uid = 'admin-uid';
        }
        
        const mockToken = `mock-${uid}`;
        
        // Sync/Create user profiles on the Mock Server
        const syncRes = await fetch(`${API_BASE}/auth/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid,
            email,
            displayName: uid === 'admin-uid' ? 'DecorAI Administrator' : 'Alexander Sterling',
            photoURL: uid === 'admin-uid' 
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop'
              : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&fit=crop',
            role: uid === 'admin-uid' ? 'admin' : 'user'
          })
        });

        if (syncRes.ok) {
          const profile = await syncRes.json();
          setUser(profile);
          setToken(mockToken);
          localStorage.setItem('decorai_token', mockToken);
        } else {
          throw new Error('Failed to synchronize user account on mock backend');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      if (isFirebaseAvailable && auth) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await firebaseUpdateProfile(cred.user, { displayName });
        
        // Sync backend
        const syncRes = await fetch(`${API_BASE}/auth/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: cred.user.uid,
            email: cred.user.email,
            displayName: displayName
          })
        });
        if (syncRes.ok) {
          const profile = await syncRes.json();
          setUser(profile);
        }
      } else {
        // Mock Register
        const mockUid = `user-${Math.random().toString(36).substr(2, 9)}`;
        const mockToken = `mock-${mockUid}`;
        
        const syncRes = await fetch(`${API_BASE}/auth/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: mockUid,
            email,
            displayName,
            role: 'user'
          })
        });

        if (syncRes.ok) {
          const profile = await syncRes.json();
          setUser(profile);
          setToken(mockToken);
          localStorage.setItem('decorai_token', mockToken);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      if (isFirebaseAvailable && auth) {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      } else {
        await login('google.user@decorai.com', 'googlepassword');
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithApple = async () => {
    setLoading(true);
    try {
      if (isFirebaseAvailable && auth) {
        const provider = new OAuthProvider('apple.com');
        await signInWithPopup(auth, provider);
      } else {
        await login('apple.user@decorai.com', 'applepassword');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isFirebaseAvailable && auth) {
        await signOut(auth);
      }
      setUser(null);
      setToken(null);
      localStorage.removeItem('decorai_token');
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    if (isFirebaseAvailable && auth) {
      await sendPasswordResetEmail(auth, email);
    } else {
      console.log(`Mock reset password email simulated to ${email}`);
    }
  };

  const verifyEmail = async () => {
    if (isFirebaseAvailable && auth && auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    } else {
      console.log('Mock email verification notification sent.');
    }
  };

  const syncProfile = async () => {
    if (token) {
      await fetchProfile(token);
    }
  };

  const updateUserField = async (data: Partial<UserProfile>) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const updatedProfile = await res.json();
        setUser(updatedProfile);
      }
    } catch (err) {
      console.error('Failed updating profile details:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      register, 
      loginWithGoogle, 
      loginWithApple, 
      logout,
      forgotPassword,
      verifyEmail,
      syncProfile,
      updateUserField
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
