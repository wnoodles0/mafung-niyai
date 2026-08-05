'use client';

import React, { useState } from 'react';
import { Chapter } from '@/lib/types';
import { X, Save, Music } from 'lucide-react';

interface ChapterFormModalProps {
  novelId: string;
  initialData?: Chapter | null;
  nextChapterNum?: number;
  onClose: () => void;
  onSave: (chapterData: Partial<Chapter>) => void;
}

export const ChapterFormModal: React.FC<ChapterFormModalProps> = ({
  novelId,
  initialData,
  nextChapterNum = 1,
  onClose,
  onSave,
}) => {
  const [chapterNumber, setChapterNumber] = useState<number>(initialData?.chapterNumber || nextChapterNum);
  const [title, setTitle] = useState(initialData?.title || `ตอนที่ ${chapterNumber}: `);
  const [audioUrl, setAudioUrl] = useState(initialData?.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
  const [duration, setDuration] = useState<number>(initialData?.duration || 420); // default ~7 mins

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialData?.id || `chapter-${Date.now()}`,
      novelId,
      chapterNumber: Number(chapterNumber),
      title,
      audioUrl,
      duration: Number(duration),
      releasedAt: initialData?.releasedAt || new Date().toISOString().split('T')[0],
      views: initialData?.views || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">
            {initialData ? 'แก้ไขข้อมูลตอนนิยาย' : 'เพิ่มตอนนิยายใหม่'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">ลำดับตอนที่ *</label>
              <input
                type="number"
                required
                min={1}
                value={chapterNumber}
                onChange={(e) => setChapterNumber(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">ชื่อตอน *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ตอนที่ 1: จุดเริ่มต้น"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              ลิงก์ไฟล์เสียง MP3 (Direct MP3 URL / Firebase Storage URL / Google Drive direct link) *
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                required
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://domain.com/path/audio.mp3"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">ความยาวไฟล์เสียง (วินาที)</label>
            <input
              type="number"
              required
              min={1}
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-purple-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              {Math.floor(duration / 60)} นาที {duration % 60} วินาที
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-purple-950"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกตอน</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
