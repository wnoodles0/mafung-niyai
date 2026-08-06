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
        if (parsed) {
          parsed.role = determineRole(parsed.email);
          setUser(parsed);
        }
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }

    // Check if we're returning from a Google redirect flow
    const redirectPending = localStorage.getItem('google_redirect_pending') === 'true';

    // 2. Sync with Firebase Auth if configured
    if (isFirebaseConfigured && auth) {
      let redirectHandled = false;

      // --- Handle redirect result FIRST, before setting up onAuthStateChanged ---
      // This avoids the race condition where onAuthStateChanged fires with null
      // before getRedirectResult() has had a chance to process the OAuth response.
      const handleRedirectResult = getRedirectResult(auth)
        .then((cred) => {
          redirectHandled = true;
          localStorage.removeItem('google_redirect_pending');
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
          redirectHandled = true;
          localStorage.removeItem('google_redirect_pending');
          console.error('Redirect sign-in error:', err);
        });

      // --- Set up onAuthStateChanged ---
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        // If a redirect is still being processed, wait for it to complete
        // before deciding the final auth state to avoid premature "not logged in"
        if (redirectPending && !redirectHandled) {
          await handleRedirectResult;
        }

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
        } else if (!savedUserStr && !redirectPending) {
          // Only set guest mode if we know for sure there's no redirect in flight
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

      // ─── POPUP-FIRST STRATEGY ─────────────────────────────────────────────
      // signInWithPopup is the preferred method on ALL platforms including mobile.
      // Chrome Android 100+ supports popups from direct user interactions.
      // signInWithRedirect is only used as a fallback when popup is blocked.
      // ─────────────────────────────────────────────────────────────────────
      try {
        const cred = await signInWithPopup(auth, googleProvider);
        if (cred?.user) {
          const profile: UserProfile = {
            uid: cred.user.uid,
            email: cred.user.email || '',
            displayName: cred.user.displayName || 'ผู้ใช้งาน Google',
            photoURL: cred.user.photoURL || undefined,
            role: determineRole(cred.user.email || ''),
            providerId: 'google',
            favorites: user?.favorites || [],
            listeningHistory: user?.listeningHistory || [],
            createdAt: new Date().toISOString(),
          };
          saveUserSession(profile);
          setAuthMessage({ type: 'success', text: 'เข้าสู่ระบบด้วย Google สำเร็จแล้ว! 🎉' });
          setTimeout(() => closeAuthModal(), 1200);
          return;
        }
      } catch (popupErr: any) {
        console.warn('[Google Auth] signInWithPopup error:', popupErr.code);

        // Domain not authorized in Firebase Console
        if (popupErr.code === 'auth/unauthorized-domain') {
          setAuthMessage({
            type: 'error',
            text: 'โดเมนนี้ยังไม่ได้รับอนุญาตใน Firebase Console กรุณาติดต่อผู้ดูแลระบบ',
          });
          return;
        }

        // User closed the popup — don't show error
        if (popupErr.code === 'auth/popup-closed-by-user' ||
            popupErr.code === 'auth/cancelled-popup-request') {
          setAuthMessage(null);
          return;
        }

        // Popup was blocked by the browser — fall back to redirect
        if (popupErr.code === 'auth/popup-blocked' ||
            popupErr.code === 'auth/operation-not-supported-in-this-environment') {
          console.warn('[Google Auth] Popup blocked, falling back to redirect flow...');
          setAuthMessage({ type: 'success', text: 'กำลังนำคุณไปยังหน้าเข้าสู่ระบบ Google...' });
          try {
            // Set flag BEFORE redirect so we know to wait for getRedirectResult on return
            localStorage.setItem('google_redirect_pending', 'true');
            await signInWithRedirect(auth, googleProvider);
            return;
          } catch (redirectErr: any) {
            localStorage.removeItem('google_redirect_pending');
            console.error('[Google Auth] signInWithRedirect error:', redirectErr);
            setAuthMessage({
              type: 'error',
              text: 'ไม่สามารถเปิดหน้าเข้าสู่ระบบ Google ได้ กรุณาลองใหม่อีกครั้ง',
            });
            return;
          }
        }

        // Any other unexpected error
        console.error('[Google Auth] Unexpected error:', popupErr);
        setAuthMessage({
          type: 'error',
          text: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ Google กรุณาลองใหม่อีกครั้ง',
        });
      }
    } else {
      // Sandbox fallback Google login (no Firebase configured)
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
      setAuthMessage({ type: 'success', text: 'เข้าสู่ระบบด้วย Google สำเร็จ!' });
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
