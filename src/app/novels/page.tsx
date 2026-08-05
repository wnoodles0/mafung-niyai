'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CATEGORIES } from '@/lib/mockData';
import { useNovels } from '@/context/NovelContext';
import { NovelCard } from '@/components/novel/NovelCard';
import { Search, SlidersHorizontal, BookOpen } from 'lucide-react';

function NovelCatalogContent() {
  const { novels } = useNovels();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'ทั้งหมด';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<'latest' | 'rating' | 'views'>('latest');
  const [onlyCompleted, setOnlyCompleted] = useState(false);

  useEffect(() => {
    if (initialSearch) setSearchQuery(initialSearch);
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialSearch, initialCategory]);

  const filteredNovels = novels.filter((novel) => {
    const matchesCategory = selectedCategory === 'ทั้งหมด' || novel.category === selectedCategory;
    const matchesCompleted = onlyCompleted ? novel.isCompleted : true;
    const matchesSearch =
      novel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      novel.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      novel.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesCompleted && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'views') return b.viewCount - a.viewCount;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      
      {/* Header Title */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-purple-400" />
          <span>ค้นหาและแคตตาล็อกนิยายเสียง</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          ค้นหานิยายเรื่องโปรด กรองตามหมวดหมู่ ความนิยม และสถานะการแปล
        </p>
      </div>

      {/* Filter Bar Controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Search Input */}
          <div className="md:col-span-6 relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อเรื่อง, ผู้แต่ง, ผู้แปล..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 text-xs sm:text-sm"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-3 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-purple-500"
            >
              <option value="latest">เรียงตาม อัปเดตล่าสุด</option>
              <option value="rating">เรียงตาม คะแนนรีวิวสูงสุด</option>
              <option value="views">เรียงตาม ยอดฟังสูงสุด</option>
            </select>
          </div>

          {/* Checkbox Completed */}
          <div className="md:col-span-3 flex items-center">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 w-full hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={onlyCompleted}
                onChange={(e) => setOnlyCompleted(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-900 border-slate-700"
              />
              <span>เฉพาะเรื่องที่จบแล้ว (Completed)</span>
            </label>
          </div>

        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Novel Grid */}
      <div>
        <div className="flex items-center justify-between mb-4 text-xs text-slate-400 font-semibold">
          <span>พบนิยายทั้งหมด {filteredNovels.length} เรื่อง</span>
        </div>

        {filteredNovels.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredNovels.map((novel) => (
              <NovelCard key={novel.id} novel={novel} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
            <Search className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">ไม่พบนิยายตรงกับเงื่อนไขการค้นหา</h3>
            <p className="text-xs text-slate-500">ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default function NovelCatalogPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">กำลังโหลดรายการนิยาย...</div>}>
      <NovelCatalogContent />
    </Suspense>
  );
}
