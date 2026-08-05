'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { MOCK_NOVELS } from '@/lib/mockData';
import { NovelCard } from '@/components/novel/NovelCard';
import { Heart, BookOpen, ArrowRight } from 'lucide-react';

export default function FavoritesPage() {
  const { user, isFavorite } = useAuth();

  const favoriteNovels = MOCK_NOVELS.filter((novel) => isFavorite(novel.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      
      {/* Header */}
      <div className="space-y-2 border-b border-slate-900 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
          <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
          <span>รายการโปรดของคุณ ({favoriteNovels.length})</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          รวมนิยายเสียงที่คุณบันทึกไว้สำหรับฟังในอนาคต
        </p>
      </div>

      {favoriteNovels.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {favoriteNovels.map((novel) => (
            <NovelCard key={novel.id} novel={novel} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-200">ยังไม่มีนิยายในรายการโปรด</h3>
            <p className="text-xs text-slate-400">
              กกดไอคอนหัวใจบนปกนิยายเรื่องที่ชอบเพื่อบันทึกไว้ที่นี่
            </p>
          </div>
          <Link
            href="/novels"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-950 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>ไปเลือกชมนิยายทั้งหมด</span>
          </Link>
        </div>
      )}

    </div>
  );
}
