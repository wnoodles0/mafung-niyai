'use client';

import React from 'react';
import Link from 'next/link';
import { Novel } from '@/lib/types';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { MOCK_CHAPTERS } from '@/lib/mockData';
import { Play, Star, Eye, Heart, Headphones, CheckCircle2 } from 'lucide-react';

interface NovelCardProps {
  novel: Novel;
}

export const NovelCard: React.FC<NovelCardProps> = ({ novel }) => {
  const { playChapter, currentChapter, isPlaying } = useAudio();
  const { isFavorite, toggleFavorite } = useAuth();

  const favorited = isFavorite(novel.id);
  const chapters = novel.chapters || MOCK_CHAPTERS[novel.id] || [];
  const firstChapter = chapters[0];
  const isCurrentNovelPlaying = currentChapter?.novelId === novel.id && isPlaying;

  const handleQuickPlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (firstChapter) {
      playChapter(novel, firstChapter, true);
    }
  };

  const handleToggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(novel.id);
  };

  return (
    <div className="group relative bg-slate-900/70 rounded-2xl overflow-hidden border border-slate-800/80 hover:border-purple-500/50 shadow-xl hover:shadow-purple-950/30 transition-all duration-300 flex flex-col h-full">
      
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950">
        <img
          src={novel.coverUrl}
          alt={novel.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-slate-950/80 backdrop-blur-md text-purple-300 border border-purple-500/30 shadow-md">
            {novel.category}
          </span>

          <button
            onClick={handleToggleFav}
            className={`p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
              favorited
                ? 'bg-rose-500 text-white border border-rose-400'
                : 'bg-slate-950/70 text-slate-300 hover:text-white border border-slate-700/50 hover:bg-slate-900'
            }`}
            title={favorited ? 'ลบออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
          >
            <Heart className={`w-4 h-4 ${favorited ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Completed status tag */}
        {novel.isCompleted && (
          <div className="absolute top-12 left-3 z-10">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/90 text-slate-950 flex items-center gap-1 shadow-md">
              <CheckCircle2 className="w-3 h-3" /> จบแล้ว
            </span>
          </div>
        )}

        {/* Play Overlay Button */}
        <button
          onClick={handleQuickPlay}
          className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-purple-600/90 hover:bg-purple-500 text-white backdrop-blur-md flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 z-20 group-hover:shadow-purple-600/50"
        >
          {isCurrentNovelPlaying ? (
            <Headphones className="w-6 h-6 animate-pulse" />
          ) : (
            <Play className="w-6 h-6 ml-0.5 fill-white" />
          )}
        </button>
      </div>

      {/* Novel Info Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <Link href={`/novels/${novel.id}`}>
            <h3 className="text-sm font-bold text-slate-100 group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">
              {novel.title}
            </h3>
          </Link>
          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
            ผู้แต่ง: <span className="text-slate-300">{novel.author}</span>
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {novel.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50">
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer Meta: Rating & Views & Total Chapters */}
        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{novel.rating.toFixed(1)}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              {(novel.viewCount / 1000).toFixed(1)}k
            </span>
            <span className="text-purple-400 font-medium">
              {chapters.length || novel.totalChapters} ตอน
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
