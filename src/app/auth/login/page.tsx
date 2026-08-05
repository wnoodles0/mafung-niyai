'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { openAuthModal, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    } else {
      openAuthModal('login');
    }
  }, [user, openAuthModal, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8 text-center text-slate-400">
      กำลังเปิดหน้าต่างเข้าสู่ระบบ...
    </div>
  );
}
