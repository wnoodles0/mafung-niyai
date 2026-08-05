'use client';

import React, { useState } from 'react';
import { Novel } from '@/lib/types';
import { CATEGORIES } from '@/lib/mockData';
import { X, Plus, Save, Image as ImageIcon } from 'lucide-react';

interface NovelFormModalProps {
  initialData?: Novel | null;
  onClose: () => void;
  onSave: (novelData: Partial<Novel>) => void;
}

export const NovelFormModal: React.FC<NovelFormModalProps> = ({ initialData, onClose, onSave }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [author, setAuthor] = useState(initialData?.author || '');
  const [translator, setTranslator] = useState(initialData?.translator || 'แอดมินบอน (MaFangNiyai Official)');
  const [coverUrl, setCoverUrl] = useState(initialData?.coverUrl || '');
  const [synopsis, setSynopsis] = useState(initialData?.synopsis || '');
  const [category, setCategory] = useState(initialData?.category || CATEGORIES[1]);
  const [tags, setTags] = useState<string>(initialData?.tags?.join(', ') || '');
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [isCompleted, setIsCompleted] = useState(initialData?.isCompleted || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialData?.id || `novel-${Date.now()}`,
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      author,
      translator,
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
      synopsis,
      category,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      isFeatured,
      isCompleted,
      rating: initialData?.rating || 5.0,
      ratingCount: initialData?.ratingCount || 1,
      viewCount: initialData?.viewCount || 0,
      favoriteCount: initialData?.favoriteCount || 0,
      totalChapters: initialData?.totalChapters || 0,
      createdAt: initialData?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">
            {initialData ? 'แก้ไขข้อมูลนิยาย' : 'เพิ่มนิยายเรื่องใหม่'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">ชื่อเรื่องนิยาย *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น จักรพรรดิมังกรโบราณ"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">หมวดหมู่นิยาย *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-purple-500"
              >
                {CATEGORIES.filter((c) => c !== 'ทั้งหมด').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">ผู้แต่ง (Author) *</label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="เช่น เทียนหลง"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">ผู้แปล (Translator) *</label>
              <input
                type="text"
                required
                value={translator}
                onChange={(e) => setTranslator(e.target.value)}
                placeholder="เช่น แอดมินบอน"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">ลิงก์รูปปก (Cover Image URL) / Firebase Storage Link</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">เรื่องย่อ (Synopsis)</label>
            <textarea
              rows={4}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="เขียนเรื่องย่อเพื่อดึงดูดผู้ฟัง..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">แท็ก (Tags) - คั่นด้วยเครื่องหมายจุลภาค</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="เทพสงคราม, เกิดใหม่, พระเอกเก่ง"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-950 border-slate-800"
              />
              <span>นิยายแนะนำ (Featured Novel)</span>
            </label>

            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={(e) => setIsCompleted(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-950 border-slate-800"
              />
              <span>จบเรื่องแล้ว (Completed)</span>
            </label>
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
              <span>บันทึกข้อมูล</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
