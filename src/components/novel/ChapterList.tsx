'use client';

import React from 'react';
import { Novel, Chapter } from '@/lib/types';
import { useAudio } from '@/context/AudioContext';
import { Play, Pause, Clock, Eye, Headphones, CheckCircle2, RotateCcw } from 'lucide-react';

interface ChapterListProps {
  novel: Novel;
  chapters: Chapter[];
}

export const ChapterList: React.FC<ChapterListProps> = ({ novel, chapters }) => {
  const { playChapter, currentChapter, isPlaying, togglePlayPause, getSavedPosition } = useAudio();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-2">
      {chapters.map((chapter) => {
        const isCurrent = currentChapter?.id === chapter.id;
        const savedPos = getSavedPosition(novel.id, chapter.id);
        const percent = Math.min(Math.round((savedPos / (chapter.duration || 1)) * 100), 100);

        return (
          <div
            key={chapter.id}
            onClick={() => {
              if (isCurrent) {
                togglePlayPause();
              } else {
                playChapter(novel, chapter, true);
              }
            }}
            className={`group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
              isCurrent
                ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-950/20'
                : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            {/* Left: Play button & Chapter details */}
            <div className="flex items-center gap-3.5 min-w-0">
              
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                  isCurrent
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/50'
                    : 'bg-slate-800 text-slate-300 group-hover:bg-purple-600 group-hover:text-white'
                }`}
              >
                {isCurrent && isPlaying ? (
                  <Pause className="w-5 h-5 fill-white" />
                ) : isCurrent ? (
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </div>

              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Volume badge */}
                  {chapter.volumeNumber && (
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      isCurrent
                        ? 'bg-purple-600/30 text-purple-200 border-purple-500/50'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      เล่ม {chapter.volumeNumber}
                    </span>
                  )}
                  <h4 className={`text-sm font-semibold truncate ${isCurrent ? 'text-purple-300' : 'text-slate-200 group-hover:text-purple-300'}`}>
                    {chapter.episodeRange ? `ตอนที่ ${chapter.episodeRange}` : chapter.title}
                  </h4>
                  {isCurrent && (
                    <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      <Headphones className="w-3 h-3 animate-pulse" /> กำลังฟัง
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {formatDuration(chapter.duration)} น.
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-slate-500" />
                    {(chapter.views || 0).toLocaleString()} ครั้ง
                  </span>
                  <span className="hidden sm:inline text-slate-400">
                    {chapter.releasedAt}
                  </span>
                </div>

                {/* Progress bar if listened */}
                {savedPos > 0 && (
                  <div className="w-full max-w-xs pt-1 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-purple-400 font-medium shrink-0">
                      {percent >= 95 ? (
                        <span className="text-emerald-400 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3 inline" /> ฟังจบแล้ว</span>
                      ) : (
                        <span className="flex items-center gap-0.5"><RotateCcw className="w-2.5 h-2.5 inline" /> {percent}%</span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Listen Button */}
            <div className="shrink-0 ml-3">
              <button
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isCurrent
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 group-hover:bg-purple-600/80 group-hover:text-white'
                }`}
              >
                {isCurrent && isPlaying ? 'พักการฟัง' : savedPos > 5 && percent < 95 ? 'ฟังต่อ' : 'ฟังตอนนี้'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
