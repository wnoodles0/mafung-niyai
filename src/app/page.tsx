'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/mockData';
import { useNovels } from '@/context/NovelContext';
import { NovelCard } from '@/components/novel/NovelCard';
import { useAudio } from '@/context/AudioContext';
import { 
  Headphones, 
  Sparkles, 
  Play, 
  Search, 
  Flame, 
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Zap
} from 'lucide-react';

export default function HomePage() {
  const { novels, chaptersMap } = useNovels();
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState('');
  const { playChapter, listeningHistory } = useAudio();

  const featuredNovels = novels.filter((n) => n.isFeatured);
  const latestHistoryItem = listeningHistory[0];

  const filteredNovels = novels.filter((novel) => {
    const matchesCategory = selectedCategory === 'ทั้งหมด' || novel.category === selectedCategory;
    const matchesSearch =
      novel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      novel.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      novel.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Resume listening action
  const handleResumeListening = () => {
    if (!latestHistoryItem) return;
    const novel = novels.find((n) => n.id === latestHistoryItem.novelId);
    if (!novel) return;
    const chapters = chaptersMap[novel.id] || novel.chapters || [];
    const chapter = chapters.find((c) => c.id === latestHistoryItem.chapterId);
    if (novel && chapter) {
      playChapter(novel, chapter, true);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-slate-950 pt-8 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-900">
        
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-purple-900/30 via-indigo-900/20 to-pink-900/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 text-xs font-semibold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>แหล่งรวมนิยายเสียงภาษาไทย อัปเดตตอนใหม่ทุกวัน</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              ฟังนิยายเสียงสุดมันส์ <br />
              <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
                ได้ฟรีทุกที่ ทุกเวลา
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              ดื่มด่ำกับเรื่องราวแฟนตาซี กำลังภายใน ย้อนยุค และสืบสวนสอบสวน พากย์เสียงคุณภาพ พร้อมระบบบันทึกตำแหน่งการฟังอัตโนมัติ ไม่พลาดทุกวินาทีสำคัญ!
            </p>

            {/* Quick Search Input inside Hero */}
            <div className="pt-2 max-w-xl mx-auto lg:mx-0">
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อนิยาย, ผู้แต่ง, หรือแท็กที่สนใจ..."
                  className="w-full pl-11 pr-32 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 shadow-2xl text-sm"
                />
                <Link
                  href={`/novels?search=${encodeURIComponent(searchQuery)}`}
                  className="absolute right-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-md"
                >
                  <span>ค้นหา</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Stats Badges */}
            <div className="pt-4 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 text-center lg:text-left border-t border-slate-900">
              <div>
                <p className="text-lg sm:text-2xl font-extrabold text-white">{novels.length}</p>
                <p className="text-xs text-slate-400">เรื่องนิยายพากย์เสียง</p>
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-extrabold text-purple-400">500,000+</p>
                <p className="text-xs text-slate-400">ยอดเข้าฟังทั้งหมด</p>
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-extrabold text-indigo-400">4.9 ★</p>
                <p className="text-xs text-slate-400">คะแนนรีวิวเฉลี่ย</p>
              </div>
            </div>

          </div>

          {/* Hero Featured Card Highlight */}
          <div className="lg:col-span-5">
            {featuredNovels[0] && (
              <div className="relative group bg-slate-900/80 border border-purple-500/30 rounded-3xl p-5 shadow-2xl shadow-purple-950/40 backdrop-blur-xl">
                <div className="absolute top-8 right-8 z-10">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-600 text-white shadow-lg flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-white" /> นิยายฮิตอันดับ 1
                  </span>
                </div>

                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-4 bg-slate-950">
                  <img
                    src={featuredNovels[0].bannerUrl || featuredNovels[0].coverUrl}
                    alt={featuredNovels[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-purple-400 tracking-wider uppercase">
                    {featuredNovels[0].category}
                  </span>
                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                    {featuredNovels[0].title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {featuredNovels[0].synopsis}
                  </p>

                  <div className="pt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      โดย: <strong className="text-slate-200">{featuredNovels[0].author}</strong>
                    </span>

                    <Link
                      href={`/novels/${featuredNovels[0].id}`}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-purple-950 transition-all"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>เริ่มฟังทันที</span>
                    </Link>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      </section>

      {/* Resume Listening Quick Bar */}
      {latestHistoryItem && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 border border-purple-500/40 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-4 min-w-0">
              <img
                src={latestHistoryItem.novelCover}
                alt={latestHistoryItem.novelTitle}
                className="w-12 h-16 object-cover rounded-xl shadow-md shrink-0 border border-slate-700"
              />
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/30 text-purple-300 border border-purple-500/40">
                    ฟังค้างไว้
                  </span>
                  <span className="text-xs text-slate-400 truncate">
                    {latestHistoryItem.novelTitle}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white truncate">
                  {latestHistoryItem.chapterTitle}
                </h4>
                <div className="w-48 sm:w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{
                      width: `${Math.min(
                        Math.round((latestHistoryItem.progress / (latestHistoryItem.duration || 1)) * 100),
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleResumeListening}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-950 transition-all shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
              <span>ฟังต่อจากเดิม</span>
            </button>

          </div>
        </section>
      )}

      {/* Main Catalog Grid & Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Section Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              <Headphones className="w-6 h-6 text-purple-400" />
              <span>นิยายเสียงทั้งหมด ({filteredNovels.length} เรื่อง)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              เลือกหมวดหมู่ที่ต้องการฟัง หรือค้นหาเรื่องใหม่ๆ ได้เลย
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-950'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Novel Cards Grid */}
        {filteredNovels.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredNovels.map((novel) => (
              <NovelCard key={novel.id} novel={novel} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
            <Search className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">ไม่พบนิยายในหมวดหมู่ที่เลือก</h3>
            <p className="text-xs text-slate-500">ลองเปลี่ยนหมวดหมู่หรือล้างคำค้นหา</p>
            <button
              onClick={() => {
                setSelectedCategory('ทั้งหมด');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 text-purple-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
            >
              แสดงนิยายทั้งหมด
            </button>
          </div>
        )}

      </section>

      {/* PWA & Android App Feature Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 p-8 sm:p-10 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-emerald-400" /> PROGRESSIVE WEB APP & ANDROID
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
              ฟังลื่นไหลไม่สะดุด ติดตั้งได้ทันทีบนมือถือของคุณ!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              "มาฟังนิยาย" ถูกออกแบบโครงสร้างให้รองรับ PWA และการพอร์ตเป็นแอป Android ในอนาคต ให้คุณกด 'เพิ่มไปยังหน้าจอหลัก' บนมือถือเพื่อเข้าถึงนิยายเสียงได้รวดเร็วทันใจ
            </p>
            <div className="pt-2 flex flex-wrap gap-3 text-xs font-semibold text-purple-300">
              <span className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> เล่นเสียงฉากหลัง (Background Play)
              </span>
              <span className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> บันทึกตำแหน่งการฟังอัตโนมัติ
              </span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
