'use client';

import React, { useState } from 'react';
import { useAuth, AuthModalTab } from '@/context/AuthContext';
import { X, Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle, Sparkles, ShieldAlert } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    activeModalTab, 
    authMessage, 
    closeAuthModal, 
    openAuthModal,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    sendPasswordReset,
    loginAsDemoMember,
    loginAsDemoAdmin,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (activeModalTab === 'login') {
        await signInWithEmail(email, password);
      } else if (activeModalTab === 'register') {
        await signUpWithEmail(email, password, displayName);
      } else if (activeModalTab === 'forgot-password') {
        await sendPasswordReset(email);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="relative bg-slate-900/95 border border-purple-500/30 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl shadow-purple-950/80 space-y-6 my-8 overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-2xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Tabs */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 text-purple-300 text-xs font-semibold border border-purple-800/50">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>ระบบสมาชิก มาฟังนิยาย</span>
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {activeModalTab === 'login' && 'เข้าสู่ระบบ'}
            {activeModalTab === 'register' && 'สมัครสมาชิกใหม่'}
            {activeModalTab === 'forgot-password' && 'ตั้งรหัสผ่านใหม่'}
          </h2>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800/80 text-xs font-semibold">
            <button
              onClick={() => openAuthModal('login')}
              className={`flex-1 py-2 rounded-xl transition-all ${
                activeModalTab === 'login' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className={`flex-1 py-2 rounded-xl transition-all ${
                activeModalTab === 'register' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              สมัครสมาชิก
            </button>
          </div>
        </div>

        {/* Feedback Alert Message */}
        {authMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in ${
              authMessage.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-950/90 text-rose-300 border border-rose-500/40'
            }`}
          >
            {authMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{authMessage.text}</span>
          </div>
        )}

        {/* Google Sign In Button (Show on Login & Register) */}
        {activeModalTab !== 'forgot-password' && (
          <div className="space-y-3">
            <button
              onClick={signInWithGoogle}
              type="button"
              className="w-full py-3 px-4 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-800 hover:border-slate-700 flex items-center justify-center gap-3 transition-all shadow-md group"
            >
              {/* Google SVG Logo */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>ดำเนินการต่อด้วย Google</span>
            </button>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider absolute">
                หรือกรอกข้อมูล
              </span>
            </div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Display Name field (Register tab only) */}
          {activeModalTab === 'register' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">ชื่อที่ใช้แสดง (Display Name) *</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="เช่น นักฟังนิยายสายชิว"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">อีเมล (Email) *</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            {activeModalTab === 'register' && (
              <p className="text-[10px] text-slate-500 mt-1">
                * หากใช้อีเมลที่มีคำว่า <span className="text-purple-400 font-bold">admin</span> ระบบจะรับรองสิทธิ์เป็น ผู้ดูแลระบบ (Admin)
              </p>
            )}
          </div>

          {/* Password field (Login & Register tabs) */}
          {activeModalTab !== 'forgot-password' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-300 font-semibold">รหัสผ่าน (Password) *</label>
                {activeModalTab === 'login' && (
                  <button
                    type="button"
                    onClick={() => openAuthModal('forgot-password')}
                    className="text-[11px] text-purple-400 hover:underline"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  min={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-950 transition-all disabled:opacity-50"
          >
            <span>
              {activeModalTab === 'login' && 'เข้าสู่ระบบ'}
              {activeModalTab === 'register' && 'สร้างบัญชีผู้ใช้'}
              {activeModalTab === 'forgot-password' && 'ส่งลิงก์ตั้งรหัสผ่านใหม่'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        {/* Demo Role Switch Shortcuts */}
        <div className="pt-3 border-t border-slate-800 text-center space-y-2">
          <p className="text-[10px] text-slate-500 font-semibold uppercase">ทดลองเข้าสู่ระบบทันที (Demo Test Roles)</p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={loginAsDemoMember}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 hover:text-white hover:border-purple-500/40 transition-colors"
            >
              👤 สมาชิกทั่วไป (Member)
            </button>
            <button
              onClick={loginAsDemoAdmin}
              className="px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300 hover:bg-amber-900/60 transition-colors flex items-center gap-1"
            >
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              <span>ผู้ดูแลระบบ (Admin)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
