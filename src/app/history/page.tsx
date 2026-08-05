'use client';

import React from 'react';
import Link from 'next/link';
import { useAudio } from '@/context/AudioContext';
import { MOCK_NOVELS, MOCK_CHAPTERS } from '@/lib/mockData';
import { History, Play, CheckCircle2, RotateCcw, Clock, Trash2, ArrowRight } from 'lucide-react';

export default function HistoryPage() {
  const { listeningHistory, playChapter } = useAudio();

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleResume = (novelId: string, chapterId: string) => {
    const novel = MOCK_NOVELS.find((n) => n.id === novelId);
    if (!novel) return;
    const chapters = novel.chapters || MOCK_CHAPTERS[novel.id] || [];
    const chapter = chapters.find((c) => c.id === chapterId);
    if (novel && chapter) {
      playChapter(novel, chapter, true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      
      {/* Header */}
      <div className="space-y-2 border-b border-slate-900 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
          <History className="w-8 h-8 text-purple-400" />
          <span>ประวัติการฟังนิยายเสียง</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          บันทึกตำแหน่งที่คุณฟังค้างไว้ ลื่นไหล เล่นต่อเนื่องไม่มีสะดุด
        </p>
      </div>

      {listeningHistory.length > 0 ? (
        <div className="space-y-3">
          {listeningHistory.map((item, idx) => {
            const percent = Math.min(Math.round((item.progress / (item.duration || 1)) * 100), 100);
            return (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all shadow-md"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={item.novelCover}
                    alt={item.novelTitle}
                    className="w-14 h-18 object-cover rounded-xl shadow shrink-0 border border-slate-800"
                  />

                  <div className="space-y-1 min-w-0">
                    <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
                      {item.novelTitle}
                    </span>
                    <h3 className="text-sm font-bold text-white truncate">
                      {item.chapterTitle}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        ฟังไปแล้ว {formatTime(item.progress)} / {formatTime(item.duration)}
                      </span>
                      <span>
                        {new Date(item.lastListenedAt).toLocaleDateString('th-TH')}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-48 sm:w-64 pt-1 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-purple-300 font-bold shrink-0">
                        {percent >= 95 ? (
                          <span className="text-emerald-400 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3 inline" /> ฟังจบแล้ว</span>
                        ) : (
                          `${percent}%`
                        )}
                      </span>
                    </div>

                  </div>
                </div>

                <div className="w-full sm:w-auto flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleResume(item.novelId, item.chapterId)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-purple-950 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{percent >= 95 ? 'ฟังอีกครั้ง' : 'ฟังต่อ'}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
            <History className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-200">ยังไม่มีประวัติการฟัง</h3>
            <p className="text-xs text-slate-400">
              เมื่อคุณเริ่มฟังนิยายเสียง ตำแหน่งและประวัติการฟังจะถูกบันทึกที่นี่โดยอัตโนมัติ
            </p>
          </div>
          <Link
            href="/novels"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-950 transition-all"
          >
            <span>ไปเริ่มฟังนิยายตอนนี้</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

    </div>
  );
}
