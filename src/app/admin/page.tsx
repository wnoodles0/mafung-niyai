'use client';

import React, { useState } from 'react';
import { useNovels } from '@/context/NovelContext';
import { useAuth } from '@/context/AuthContext';
import { Novel, Chapter } from '@/lib/types';
import { NovelFormModal } from '@/components/admin/NovelFormModal';
import { ChapterFormModal } from '@/components/admin/ChapterFormModal';
import { 
  ShieldAlert, 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen, 
  ListMusic, 
  Eye, 
  CheckCircle2, 
  Link as LinkIcon,
  Lock,
  ArrowLeft,
  LogIn
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const { currentRole, openAuthModal, loginAsDemoAdmin } = useAuth();
  const { novels, chaptersMap, saveNovel, deleteNovel, saveChapter, deleteChapter } = useNovels();

  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
  const [isNovelModalOpen, setIsNovelModalOpen] = useState(false);
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);

  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSaveSuccessMessage(msg);
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  // Role Access Guard: Only Admin can access
  if (currentRole !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-xl">
          <Lock className="w-10 h-10" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white">สงวนสิทธิ์เฉพาะผู้ดูแลระบบ (Admin)</h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            หน้านี้สำหรับสิทธิ์ Admin เท่านั้น หากคุณต้องการทดสอบเข้าใช้งานแดชบอร์ด สามารถล็อกอินด้วยอีเมล Admin หรือกดปุ่มทดลองสิทธิ์แอดมินด้านล่าง
          </p>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => openAuthModal('login')}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-950 transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>เข้าสู่ระบบด้วยอีเมล Admin</span>
          </button>

          <button
            onClick={loginAsDemoAdmin}
            className="px-5 py-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 hover:bg-amber-900 font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>ทดลองสิทธิ์ Admin (Demo Mode)</span>
          </button>

          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs transition-colors"
          >
            กลับสู่หน้าแรก
          </Link>
        </div>
      </div>
    );
  }

  // Novel CRUD Actions
  const handleSaveNovel = async (novelData: Partial<Novel>) => {
    await saveNovel(novelData);
    setEditingNovel(null);
    showNotification('บันทึกข้อมูลนิยายสำเร็จเรียบร้อยแล้ว!');
  };

  const handleDeleteNovel = async (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบนิยายเรื่องนี้?')) {
      await deleteNovel(id);
      if (selectedNovel?.id === id) {
        setSelectedNovel(null);
      }
      showNotification('ลบนิยายออกจากระบบเรียบร้อยแล้ว');
    }
  };

  // Chapter CRUD Actions
  const handleSaveChapter = async (chapterData: Partial<Chapter>) => {
    if (!selectedNovel) return;
    await saveChapter(selectedNovel.id, chapterData);
    setEditingChapter(null);
    showNotification(`บันทึกตอน "${chapterData.title}" สำเร็จแล้ว!`);
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!selectedNovel) return;
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบตอนนิยายนี้?')) {
      await deleteChapter(selectedNovel.id, chapterId);
      showNotification('ลบตอนนิยายเรียบร้อยแล้ว');
    }
  };

  const totalNovelsCount = novels.length;
  const totalChaptersCount = Object.values(chaptersMap).reduce((acc, list) => acc + list.length, 0);
  const totalViewsCount = novels.reduce((acc, n) => acc + n.viewCount, 0);

  const activeChapters = selectedNovel ? chaptersMap[selectedNovel.id] || [] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-28">
      
      {/* Toast Notification */}
      {saveSuccessMessage && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold uppercase">
              Admin Mode
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
              <ShieldAlert className="w-7 h-7 text-amber-400" />
              <span>ระบบจัดการนิยายเสียง (Admin Dashboard)</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            เพิ่มนิยาย อัปเดตไฟล์เสียง MP3 / Google Drive / Direct URL และบันทึกข้อมูลอย่างถาวร
          </p>
        </div>

        <button
          onClick={() => {
            setEditingNovel(null);
            setIsNovelModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-purple-950 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มนิยายเรื่องใหม่</span>
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">จำนวนนิยายทั้งหมด</p>
            <h3 className="text-xl font-extrabold text-white">{totalNovelsCount} เรื่อง</h3>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <ListMusic className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">จำนวนตอนทั้งหมด</p>
            <h3 className="text-xl font-extrabold text-white">{totalChaptersCount} ตอน</h3>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">ยอดผู้เข้าฟังรวม</p>
            <h3 className="text-xl font-extrabold text-white">{totalViewsCount.toLocaleString()} ครั้ง</h3>
          </div>
        </div>
      </div>

      {/* Main Admin Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Novels Table */}
        <div className={`${selectedNovel ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-4`}>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <span>รายการนิยายในระบบ</span>
          </h2>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="divide-y divide-slate-800/80">
              {novels.map((novel) => {
                const isSelected = selectedNovel?.id === novel.id;
                const chapterCount = (chaptersMap[novel.id] || []).length;

                return (
                  <div
                    key={novel.id}
                    className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                      isSelected ? 'bg-purple-950/40 border-l-4 border-purple-500' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={novel.coverUrl}
                        alt={novel.title}
                        className="w-12 h-16 object-cover rounded-xl shrink-0 border border-slate-800"
                      />
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-purple-300">
                            {novel.category}
                          </span>
                          {novel.isCompleted && (
                            <span className="text-[10px] font-bold text-emerald-400">จบแล้ว</span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-white truncate">{novel.title}</h4>
                        <p className="text-xs text-slate-400 truncate">
                          ผู้แต่ง: {novel.author} • {chapterCount} ตอน
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedNovel(novel)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800 text-purple-300 hover:bg-purple-600 hover:text-white'
                        }`}
                      >
                        จัดการตอน
                      </button>

                      <button
                        onClick={() => {
                          setEditingNovel(novel);
                          setIsNovelModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        title="แก้ไขข้อมูลนิยาย"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteNovel(novel.id)}
                        className="p-2 rounded-xl bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 transition-colors"
                        title="ลบนิยาย"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Selected Novel Chapters Manager */}
        {selectedNovel && (
          <div className="lg:col-span-6 space-y-4 animate-in fade-in slide-in-from-right-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                  กำลังจัดการตอนของ:
                </span>
                <h3 className="text-base font-extrabold text-white truncate max-w-xs sm:max-w-md">
                  {selectedNovel.title}
                </h3>
              </div>

              <button
                onClick={() => {
                  setEditingChapter(null);
                  setIsChapterModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มตอนใหม่</span>
              </button>
            </div>

            {/* Chapter List inside Admin */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-2 max-h-[600px] overflow-y-auto">
              {activeChapters.length > 0 ? (
                activeChapters.map((ch) => (
                  <div
                    key={ch.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                  >
                    <div className="min-w-0 pr-2 space-y-0.5">
                      <p className="font-bold text-white truncate">{ch.title}</p>
                      <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                        <LinkIcon className="w-3 h-3 text-purple-400 shrink-0" />
                        <span>{Math.floor(ch.duration / 60)} น. • {ch.audioUrl.substring(0, 30)}...</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setEditingChapter(ch);
                          setIsChapterModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                        title="แก้ไขตอน"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteChapter(ch.id)}
                        className="p-1.5 rounded-lg bg-rose-950/50 text-rose-400 hover:bg-rose-900"
                        title="ลบตอน"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  ยังไม่มีตอนในนิยายเรื่องนี้ กด "เพิ่มตอนใหม่" เพื่อเพิ่มไฟล์เสียง MP3 / Google Drive URL
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Modals */}
      {isNovelModalOpen && (
        <NovelFormModal
          initialData={editingNovel}
          onClose={() => setIsNovelModalOpen(false)}
          onSave={handleSaveNovel}
        />
      )}

      {isChapterModalOpen && selectedNovel && (
        <ChapterFormModal
          novelId={selectedNovel.id}
          initialData={editingChapter}
          nextChapterNum={activeChapters.length + 1}
          onClose={() => setIsChapterModalOpen(false)}
          onSave={handleSaveChapter}
        />
      )}

    </div>
  );
}
