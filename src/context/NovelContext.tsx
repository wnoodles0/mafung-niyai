'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Novel, Chapter } from '@/lib/types';
import { MOCK_NOVELS, MOCK_CHAPTERS } from '@/lib/mockData';
import { formatAudioUrl } from '@/lib/audioUtils';
import { isFirebaseConfigured, db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

interface NovelContextType {
  novels: Novel[];
  chaptersMap: Record<string, Chapter[]>;
  loading: boolean;
  saveNovel: (novelData: Partial<Novel>) => Promise<void>;
  deleteNovel: (id: string) => Promise<void>;
  saveChapter: (novelId: string, chapterData: Partial<Chapter>) => Promise<void>;
  deleteChapter: (novelId: string, chapterId: string) => Promise<void>;
  getNovelById: (id: string) => Novel | undefined;
  getChaptersByNovelId: (novelId: string) => Chapter[];
}

const NovelContext = createContext<NovelContextType | undefined>(undefined);

export const NovelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [chaptersMap, setChaptersMap] = useState<Record<string, Chapter[]>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and load saved novels & chapters
  useEffect(() => {
    const loadInitialData = async () => {
      let loadedNovels: Novel[] = [];
      let loadedChapters: Record<string, Chapter[]> = {};

      // 1. Try Loading from LocalStorage first
      const savedNovelsStr = localStorage.getItem('mafangniyai_saved_novels');
      const savedChaptersStr = localStorage.getItem('mafangniyai_saved_chapters');

      if (savedNovelsStr) {
        try {
          loadedNovels = JSON.parse(savedNovelsStr);
        } catch (e) {
          console.error('Error parsing local novels:', e);
        }
      }

      if (savedChaptersStr) {
        try {
          loadedChapters = JSON.parse(savedChaptersStr);
        } catch (e) {
          console.error('Error parsing local chapters:', e);
        }
      }

      // If local storage is empty, initialize with MOCK_NOVELS & MOCK_CHAPTERS
      if (!loadedNovels || loadedNovels.length === 0) {
        loadedNovels = MOCK_NOVELS;
        loadedChapters = MOCK_CHAPTERS;
        localStorage.setItem('mafangniyai_saved_novels', JSON.stringify(MOCK_NOVELS));
        localStorage.setItem('mafangniyai_saved_chapters', JSON.stringify(MOCK_CHAPTERS));
      }

      // 2. Sync with Firebase Firestore if configured
      if (isFirebaseConfigured && db) {
        try {
          const novelsSnapshot = await getDocs(collection(db, 'novels'));
          if (!novelsSnapshot.empty) {
            const fsNovels: Novel[] = [];
            novelsSnapshot.forEach((docSnap) => {
              fsNovels.push(docSnap.data() as Novel);
            });
            loadedNovels = fsNovels;
            localStorage.setItem('mafangniyai_saved_novels', JSON.stringify(fsNovels));
          }

          const chaptersSnapshot = await getDocs(collection(db, 'chapters'));
          if (!chaptersSnapshot.empty) {
            const fsChapters: Record<string, Chapter[]> = {};
            chaptersSnapshot.forEach((docSnap) => {
              const ch = docSnap.data() as Chapter;
              if (!fsChapters[ch.novelId]) {
                fsChapters[ch.novelId] = [];
              }
              fsChapters[ch.novelId].push(ch);
            });

            // Sort each novel's chapters by chapterNumber ASC
            Object.keys(fsChapters).forEach((nId) => {
              fsChapters[nId].sort((a, b) => a.chapterNumber - b.chapterNumber);
            });

            loadedChapters = fsChapters;
            localStorage.setItem('mafangniyai_saved_chapters', JSON.stringify(fsChapters));
          }
        } catch (err) {
          console.warn('Firestore load fallback to local:', err);
        }
      }

      setNovels(loadedNovels);
      setChaptersMap(loadedChapters);
      setLoading(false);
    };

    loadInitialData();
  }, []);

  // Save persistent helper
  const persistState = (newNovels: Novel[], newChaptersMap: Record<string, Chapter[]>) => {
    setNovels(newNovels);
    setChaptersMap(newChaptersMap);
    localStorage.setItem('mafangniyai_saved_novels', JSON.stringify(newNovels));
    localStorage.setItem('mafangniyai_saved_chapters', JSON.stringify(newChaptersMap));
  };

  const saveNovel = async (novelData: Partial<Novel>) => {
    const existingIndex = novels.findIndex((n) => n.id === novelData.id);
    let updatedNovels: Novel[];

    const finalNovel: Novel = {
      id: novelData.id || `novel-${Date.now()}`,
      title: novelData.title || 'ไม่มีชื่อเรื่อง',
      slug: novelData.slug || `novel-${Date.now()}`,
      coverUrl: novelData.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
      bannerUrl: novelData.bannerUrl || novelData.coverUrl,
      author: novelData.author || 'ไม่ระบุผู้แต่ง',
      translator: novelData.translator || 'มาฟังนิยาย Official',
      synopsis: novelData.synopsis || '',
      category: novelData.category || 'ทั่วไป',
      tags: novelData.tags || [],
      rating: novelData.rating || 5.0,
      ratingCount: novelData.ratingCount || 1,
      viewCount: novelData.viewCount || 0,
      favoriteCount: novelData.favoriteCount || 0,
      isFeatured: Boolean(novelData.isFeatured),
      isCompleted: Boolean(novelData.isCompleted),
      totalChapters: novelData.totalChapters || chaptersMap[novelData.id || '']?.length || 0,
      createdAt: novelData.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    if (existingIndex >= 0) {
      updatedNovels = [...novels];
      updatedNovels[existingIndex] = finalNovel;
    } else {
      updatedNovels = [finalNovel, ...novels];
    }

    const newChaptersMap = {
      ...chaptersMap,
      [finalNovel.id]: chaptersMap[finalNovel.id] || [],
    };

    persistState(updatedNovels, newChaptersMap);

    // Save to Firestore if available
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'novels', finalNovel.id), finalNovel);
      } catch (e) {
        console.error('Error saving novel to Firestore:', e);
      }
    }
  };

  const deleteNovel = async (id: string) => {
    const updatedNovels = novels.filter((n) => n.id !== id);
    const updatedChaptersMap = { ...chaptersMap };
    delete updatedChaptersMap[id];

    persistState(updatedNovels, updatedChaptersMap);

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'novels', id));
      } catch (e) {
        console.error('Error deleting novel from Firestore:', e);
      }
    }
  };

  const saveChapter = async (novelId: string, chapterData: Partial<Chapter>) => {
    const currentChapters = chaptersMap[novelId] || [];
    const formattedAudio = formatAudioUrl(chapterData.audioUrl || '');
    
    const finalChapter: Chapter = {
      id: chapterData.id || `chapter-${Date.now()}`,
      novelId,
      chapterNumber: chapterData.chapterNumber || currentChapters.length + 1,
      title: chapterData.title || `ตอนที่ ${currentChapters.length + 1}`,
      audioUrl: formattedAudio,
      duration: chapterData.duration || 300,
      releasedAt: chapterData.releasedAt || new Date().toISOString().split('T')[0],
      views: chapterData.views || 0,
    };

    const existingIndex = currentChapters.findIndex((c) => c.id === finalChapter.id);
    let updatedChaptersList: Chapter[];

    if (existingIndex >= 0) {
      updatedChaptersList = [...currentChapters];
      updatedChaptersList[existingIndex] = finalChapter;
    } else {
      updatedChaptersList = [...currentChapters, finalChapter];
    }

    // Sort chapters by chapterNumber
    updatedChaptersList.sort((a, b) => a.chapterNumber - b.chapterNumber);

    const updatedChaptersMap = {
      ...chaptersMap,
      [novelId]: updatedChaptersList,
    };

    // Update novel totalChapters count
    const updatedNovels = novels.map((n) =>
      n.id === novelId ? { ...n, totalChapters: updatedChaptersList.length, updatedAt: new Date().toISOString().split('T')[0] } : n
    );

    persistState(updatedNovels, updatedChaptersMap);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'chapters', finalChapter.id), finalChapter);
      } catch (e) {
        console.error('Error saving chapter to Firestore:', e);
      }
    }
  };

  const deleteChapter = async (novelId: string, chapterId: string) => {
    const currentChapters = chaptersMap[novelId] || [];
    const updatedChaptersList = currentChapters.filter((c) => c.id !== chapterId);

    const updatedChaptersMap = {
      ...chaptersMap,
      [novelId]: updatedChaptersList,
    };

    const updatedNovels = novels.map((n) =>
      n.id === novelId ? { ...n, totalChapters: updatedChaptersList.length } : n
    );

    persistState(updatedNovels, updatedChaptersMap);

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'chapters', chapterId));
      } catch (e) {
        console.error('Error deleting chapter from Firestore:', e);
      }
    }
  };

  const getNovelById = (id: string): Novel | undefined => {
    return novels.find((n) => n.id === id || n.slug === id);
  };

  const getChaptersByNovelId = (novelId: string): Chapter[] => {
    return chaptersMap[novelId] || [];
  };

  return (
    <NovelContext.Provider
      value={{
        novels,
        chaptersMap,
        loading,
        saveNovel,
        deleteNovel,
        saveChapter,
        deleteChapter,
        getNovelById,
        getChaptersByNovelId,
      }}
    >
      {children}
    </NovelContext.Provider>
  );
};

export const useNovels = () => {
  const context = useContext(NovelContext);
  if (!context) {
    throw new Error('useNovels must be used within a NovelProvider');
  }
  return context;
};
