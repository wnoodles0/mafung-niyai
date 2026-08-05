'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/lib/types';
import { isFirebaseConfigured, auth, googleProvider } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';

export type AuthModalTab = 'login' | 'register' | 'forgot-password';

interface AuthContextType {
  user: UserProfile | null;
  currentRole: UserRole;
  loading: boolean;
  isAuthModalOpen: boolean;
  activeModalTab: AuthModalTab;
  authMessage: { type: 'success' | 'error'; text: string } | null;
  openAuthModal: (tab?: AuthModalTab) => void;
  closeAuthModal: () => void;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  loginAsDemoMember: () => void;
  loginAsDemoAdmin: () => void;
  logout: () => Promise<void>;
  toggleFavorite: (novelId: string) => void;
  isFavorite: (novelId: string) => boolean;
  clearAuthMessage: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Authorized Admin Emails
const ADMIN_EMAILS = [
  'wnoodles0@gmail.com',
  'admin@mafangniyai.com',
];

// Helper to determine role strictly from email
const determineRole = (email: string): UserRole => {
  if (!email) return 'guest';
  const clean = email.toLowerCase().trim();
  if (ADMIN_EMAILS.includes(clean)) {
    return 'admin';
  }
  return 'member';
};

const DEMO_MEMBER: UserProfile = {
  uid: 'user-demo-member-1',
  email: 'member@mafangniyai.com',
  displayName: 'นักฟังนิยายสายชิว',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
  role: 'member',
  providerId: 'demo',
  favorites: ['n1', 'n2'],
  listeningHistory: [],
  createdAt: '2026-07-01',
};

const DEMO_ADMIN: UserProfile = {
  uid: 'user-demo-admin-1',
  email: 'admin@mafangniyai.com',
  displayName: 'ผู้ดูแลระบบ (Admin)',
  photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
  role: 'admin',
  providerId: 'demo',
  favorites: ['n1', 'n3', 'n4'],
  listeningHistory: [],
  createdAt: '2026-06-01',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [activeModalTab, setActiveModalTab] = useState<AuthModalTab>('login');
  const [authMessage, setAuthMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // 1. Try loading saved local user session
    const savedUserStr = localStorage.getItem('mafangniyai_user');
    if (savedUserStr) {
      try {
        const parsed = JSON.parse(savedUserStr);
        // Ensure role is dynamically calculated if missing
        if (parsed) {
          parsed.role = determineRole(parsed.email);
          setUser(parsed);
        }
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }

    // 2. Sync with Firebase Auth if configured
    if (isFirebaseConfigured && auth) {
      // Handle mobile redirect login result
      getRedirectResult(auth)
        .then((cred) => {
          if (cred?.user) {
            const profile: UserProfile = {
              uid: cred.user.uid,
              email: cred.user.email || '',
              displayName: cred.user.displayName || cred.user.email?.split('@')[0] || 'ผู้ใช้งาน',
              photoURL: cred.user.photoURL || undefined,
              role: determineRole(cred.user.email || ''),
              providerId: 'google',
              favorites: [],
              listeningHistory: [],
              createdAt: new Date().toISOString(),
            };
            saveUserSession(profile);
            closeAuthModal();
          }
        })
        .catch((err) => {
          console.error('Redirect sign-in error:', err);
        });

      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          const profile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'ผู้ใช้งาน',
            photoURL: firebaseUser.photoURL || undefined,
            role: determineRole(firebaseUser.email || ''),
            providerId: firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email',
            favorites: user?.favorites || [],
            listeningHistory: user?.listeningHistory || [],
            createdAt: new Date().toISOString(),
          };
          saveUserSession(profile);
        } else if (!savedUserStr) {
          // Default guest mode if no stored session
          setUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const saveUserSession = (u: UserProfile | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem('mafangniyai_user', JSON.stringify(u));
    } else {
      localStorage.removeItem('mafangniyai_user');
    }
  };

  const openAuthModal = (tab: AuthModalTab = 'login') => {
    setActiveModalTab(tab);
    setIsAuthModalOpen(true);
    setAuthMessage(null);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthMessage(null);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    setAuthMessage(null);
    if (isFirebaseConfigured && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        if (cred.user && name) {
          await updateProfile(cred.user, { displayName: name });
        }
        const profile: UserProfile = {
          uid: cred.user.uid,
          email,
          displayName: name || email.split('@')[0],
          role: determineRole(email),
          providerId: 'email',
          favorites: [],
          listeningHistory: [],
          createdAt: new Date().toISOString(),
        };
        saveUserSession(profile);
        setAuthMessage({ type: 'success', text: 'สมัครสมาชิกสำเร็จแล้ว! ต้อนรับสู่มาฟังนิยาย' });
        setTimeout(() => closeAuthModal(), 1500);
      } catch (err: any) {
        setAuthMessage({ type: 'error', text: err.message || 'ไม่สามารถสมัครสมาชิกได้' });
      }
    } else {
      // Sandbox fallback mode
      const profile: UserProfile = {
        uid: `user-${Date.now()}`,
        email,
        displayName: name || email.split('@')[0],
        role: determineRole(email),
        providerId: 'email',
        favorites: [],
        listeningHistory: [],
        createdAt: new Date().toISOString(),
      };
      saveUserSession(profile);
      setAuthMessage({ type: 'success', text: 'สมัครสมาชิกสำเร็จ! (โหมดทดลองใช้งาน)' });
      setTimeout(() => closeAuthModal(), 1500);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setAuthMessage(null);
    if (isFirebaseConfigured && auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        const profile: UserProfile = {
          uid: cred.user.uid,
          email,
          displayName: cred.user.displayName || email.split('@')[0],
          photoURL: cred.user.photoURL || undefined,
          role: determineRole(email),
          providerId: 'email',
          favorites: user?.favorites || [],
          listeningHistory: user?.listeningHistory || [],
          createdAt: new Date().toISOString(),
        };
        saveUserSession(profile);
        setAuthMessage({ type: 'success', text: 'เข้าสู่ระบบสำเร็จแล้ว!' });
        setTimeout(() => closeAuthModal(), 1200);
      } catch (err: any) {
        setAuthMessage({ type: 'error', text: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
      }
    } else {
      // Sandbox fallback mode
      const profile: UserProfile = {
        uid: `user-${Date.now()}`,
        email,
        displayName: email.split('@')[0],
        role: determineRole(email),
        providerId: 'email',
        favorites: [],
        listeningHistory: [],
        createdAt: new Date().toISOString(),
      };
      saveUserSession(profile);
      setAuthMessage({ type: 'success', text: 'เข้าสู่ระบบสำเร็จ! (โหมดทดลองใช้งาน)' });
      setTimeout(() => closeAuthModal(), 1200);
    }
  };

  const signInWithGoogle = async () => {
    setAuthMessage(null);
    if (isFirebaseConfigured && auth) {
      // Detect if user is on mobile browser
      const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobile) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (err: any) {
          console.error('Mobile redirect sign in failed:', err);
        }
      }

      try {
        const cred = await signInWithPopup(auth, googleProvider);
        const profile: UserProfile = {
          uid: cred.user.uid,
          email: cred.user.email || '',
          displayName: cred.user.displayName || 'Google User',
          photoURL: cred.user.photoURL || undefined,
          role: determineRole(cred.user.email || ''),
          providerId: 'google',
          favorites: user?.favorites || [],
          listeningHistory: user?.listeningHistory || [],
          createdAt: new Date().toISOString(),
        };
        saveUserSession(profile);
        setAuthMessage({ type: 'success', text: 'เข้าสู่ระบบด้วย Google สำเร็จแล้ว!' });
        setTimeout(() => closeAuthModal(), 1200);
      } catch (err: any) {
        console.error('Google Sign-In Error:', err);
        
        // Fallback to Redirect if Popup is blocked/fails on mobile or desktop
        if (
          err.code === 'auth/popup-blocked' || 
          err.code === 'auth/popup-closed-by-user' || 
          (err.message && err.message.includes('Database is closing')) ||
          (err.message && err.message.includes('hidden'))
        ) {
          try {
            setAuthMessage({ type: 'success', text: 'กำลังนำคุณไปยังหน้าเข้าสู่ระบบ Google...' });
            await signInWithRedirect(auth, googleProvider);
            return;
          } catch (rErr: any) {
            console.error('Fallback redirect error:', rErr);
          }
        }

        if (err.code === 'auth/unauthorized-domain') {
          setAuthMessage({ 
            type: 'error', 
            text: 'โดเมนเว็บไซต์นี้ยังไม่ได้เพิ่มใน Authorized Domains ของ Firebase Console' 
          });
        } else if (err.code === 'auth/popup-closed-by-user') {
          setAuthMessage({ type: 'error', text: 'คุณได้ปิดหน้าต่างเข้าสู่ระบบ Google ก่อนทำรายการเสร็จ' });
        } else {
          setAuthMessage({ type: 'error', text: `ไม่สามารถเข้าสู่ระบบด้วย Google ได้ (${err.message || 'ข้อผิดพลาดเกี่ยวกับสิทธิ์'})` });
        }
      }
    } else {
      // Sandbox fallback Google login
      const profile: UserProfile = {
        uid: `google-user-${Date.now()}`,
        email: 'user.google@gmail.com',
        displayName: 'สมาชิก Google Demo',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
        role: 'member',
        providerId: 'google',
        favorites: ['n1'],
        listeningHistory: [],
        createdAt: new Date().toISOString(),
      };
      saveUserSession(profile);
      setAuthMessage({ type: 'success', text: 'เข้าสู่ระบบด้วย Google สำเร็จ! (โหมดทดลองใช้งาน)' });
      setTimeout(() => closeAuthModal(), 1200);
    }
  };

  const sendPasswordReset = async (email: string) => {
    setAuthMessage(null);
    if (isFirebaseConfigured && auth) {
      try {
        await sendPasswordResetEmail(auth, email);
        setAuthMessage({ type: 'success', text: 'ส่งลิงก์ตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณเรียบร้อยแล้ว' });
      } catch (err: any) {
        setAuthMessage({ type: 'error', text: 'ไม่พบอีเมลนี้ในระบบ หรือเกิดข้อผิดพลาดในการส่ง' });
      }
    } else {
      setAuthMessage({ type: 'success', text: 'ส่งลิงก์ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว (โหมดทดลองใช้งาน)' });
    }
  };

  const loginAsDemoMember = () => {
    saveUserSession(DEMO_MEMBER);
    setAuthMessage({ type: 'success', text: 'สลับเข้าสู่ระบบเป็น สมาชิกทั่วไป (Member)' });
  };

  const loginAsDemoAdmin = () => {
    saveUserSession(DEMO_ADMIN);
    setAuthMessage({ type: 'success', text: 'สลับเข้าสู่ระบบเป็น ผู้ดูแลระบบ (Admin)' });
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    saveUserSession(null);
    closeAuthModal();
  };

  const toggleFavorite = (novelId: string) => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    const exists = user.favorites.includes(novelId);
    const newFavs = exists
      ? user.favorites.filter((id) => id !== novelId)
      : [...user.favorites, novelId];

    const updatedUser = {
      ...user,
      favorites: newFavs,
    };
    saveUserSession(updatedUser);
  };

  const isFavorite = (novelId: string): boolean => {
    return user ? user.favorites.includes(novelId) : false;
  };

  const clearAuthMessage = () => setAuthMessage(null);

  const currentRole: UserRole = user ? user.role : 'guest';

  return (
    <AuthContext.Provider
      value={{
        user,
        currentRole,
        loading,
        isAuthModalOpen,
        activeModalTab,
        authMessage,
        openAuthModal,
        closeAuthModal,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        sendPasswordReset,
        loginAsDemoMember,
        loginAsDemoAdmin,
        logout,
        toggleFavorite,
        isFavorite,
        clearAuthMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
