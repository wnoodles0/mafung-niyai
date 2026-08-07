'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useNovels } from '@/context/NovelContext';
import { ChapterList } from '@/components/novel/ChapterList';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Play, 
  Heart, 
  Star, 
  Eye, 
  User, 
  CheckCircle2, 
  BookOpen, 
  ListMusic, 
  ArrowLeft
} from 'lucide-react';
import { formatImageUrl, DEFAULT_COVER_IMAGE } from '@/lib/audioUtils';

export default function NovelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { novels, chaptersMap } = useNovels();

  const novel = novels.find((n) => n.id === id || n.slug === id) || novels[0];
  const chapters = selectedNovelChapters();

  function selectedNovelChapters() {
    if (!novel) return [];
    const list = chaptersMap[novel.id] || novel.chapters || [];
    return [...list].sort((a, b) => a.chapterNumber - b.chapterNumber);
  }

  const { playChapter } = useAudio();
  const { isFavorite, toggleFavorite } = useAuth();
  const favorited = novel ? isFavorite(novel.id) : false;

  const [chapterSearch, setChapterSearch] = useState('');

  if (!novel) {
    return (
      <div className="p-12 text-center text-slate-400">
        ไม่พบนิยายเรื่องนี้ในระบบ <br />
        <button onClick={() => router.push('/novels')} className="mt-4 text-purple-400 underline">
          กลับไปหน้ารายการนิยาย
        </button>
      </div>
    );
  }

  const filteredChapters = chapters.filter((c) =>
    c.title.toLowerCase().includes(chapterSearch.toLowerCase())
  );

  const handlePlayFirst = () => {
    if (chapters[0]) {
      playChapter(novel, chapters[0], true);
    }
  };

  return (
    <div className="space-y-8 pb-24">
      
      {/* Top Banner Header */}
      <div className="relative overflow-hidden bg-slate-950 border-b border-slate-900 pt-6 pb-12">
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <img
            src={formatImageUrl(novel.bannerUrl || novel.coverUrl)}
            alt=""
            onError={(e) => {
              e.currentTarget.src = DEFAULT_COVER_IMAGE;
            }}
            className="w-full h-full object-cover blur-3xl scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/90 to-slate-950" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ย้อนกลับ</span>
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Poster Cover Image */}
            <div className="md:col-span-4 lg:col-span-3">
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl shadow-purple-950/60 border border-purple-500/30 bg-slate-900 group">
                <img
                  src={formatImageUrl(novel.coverUrl)}
                  alt={novel.title}
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_COVER_IMAGE;
                  }}
                  className="w-full h-full object-cover"
                />
                {novel.isCompleted && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" /> จบเรื่องแล้ว
                  </div>
                )}
              </div>
            </div>

            {/* Details Content */}
            <div className="md:col-span-8 lg:col-span-9 space-y-5">
              
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-600/20 text-purple-300 border border-purple-500/40">
                    {novel.category}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 font-bold text-xs bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{novel.rating.toFixed(1)} ({novel.ratingCount} รีวิว)</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {novel.title}
                </h1>
              </div>

              {/* Author & Translator Credits */}
              <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 border-y border-slate-800/80 py-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-400" />
                  <span>ผู้แต่ง: <strong className="text-slate-100">{novel.author}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>ผู้แปล: <strong className="text-purple-300">{novel.translator}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span>ยอดฟัง {(novel.viewCount).toLocaleString()} ครั้ง</span>
                </div>
              </div>

              {/* Synopsis */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">เรื่องย่อ</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {novel.synopsis}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {novel.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 border border-slate-800">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Primary Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={handlePlayFirst}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 hover:opacity-95 text-white font-bold text-sm flex items-center gap-2.5 shadow-xl shadow-purple-950 transition-all transform hover:scale-105"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>เริ่มฟังตอนที่ 1</span>
                </button>

                <button
                  onClick={() => toggleFavorite(novel.id)}
                  className={`px-5 py-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                    favorited
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-400 text-rose-400' : ''}`} />
                  <span>{favorited ? 'บันทึกในรายการโปรดแล้ว' : 'เพิ่มในรายการโปรด'}</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Chapters Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <ListMusic className="w-5 h-5 text-purple-400" />
              <span>รายการตอนทั้งหมด ({chapters.length} ตอน)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              คลิกที่ตอนเพื่อเริ่มฟังได้ทันที
            </p>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              value={chapterSearch}
              onChange={(e) => setChapterSearch(e.target.value)}
              placeholder="ค้นหาชื่อตอน..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <ChapterList novel={novel} chapters={filteredChapters} />

      </section>

    </div>
  );
}
