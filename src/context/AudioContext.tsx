'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Novel, Chapter, ListeningHistory } from '@/lib/types';
import { MOCK_CHAPTERS } from '@/lib/mockData';
import { formatAudioUrl } from '@/lib/audioUtils';

interface AudioContextType {
  currentNovel: Novel | null;
  currentChapter: Chapter | null;
  queue: Chapter[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  autoPlayNext: boolean;
  sleepTimer: number | null; // minutes remaining or null
  isFullPlayerOpen: boolean;
  listeningHistory: ListeningHistory[];
  audioError: string | null;
  toastNotice: string | null;
  playChapter: (novel: Novel, chapter: Chapter, autoStart?: boolean) => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  skipTime: (seconds: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  setSpeed: (rate: number) => void;
  setAutoPlayNext: (enabled: boolean) => void;
  setSleepTimerMinutes: (minutes: number | null) => void;
  toggleFullPlayer: (open?: boolean) => void;
  getSavedPosition: (novelId: string, chapterId: string) => number;
  clearAudioError: () => void;
  clearToastNotice: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentNovel, setCurrentNovel] = useState<Novel | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [queue, setQueue] = useState<Chapter[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [autoPlayNext, setAutoPlayNext] = useState<boolean>(true);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState<boolean>(false);
  const [listeningHistory, setListeningHistory] = useState<ListeningHistory[]>([]);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSavedPos = useRef<number | null>(null);

  // Initialize HTML5 Audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio();
      audioRef.current = audio;

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      const handleLoadedMetadata = () => {
        setDuration(audio.duration || 0);
        setAudioError(null);

        // Resume saved position safely after metadata is loaded
        if (pendingSavedPos.current !== null && pendingSavedPos.current > 0) {
          try {
            if (pendingSavedPos.current < (audio.duration || 99999) - 5) {
              audio.currentTime = pendingSavedPos.current;
              setCurrentTime(pendingSavedPos.current);
            }
          } catch (e) {
            console.warn('Could not set initial seek position:', e);
          }
          pendingSavedPos.current = null;
        }
      };

      const handleEnded = () => {
        setIsPlaying(false);
        saveHistoryProgress(audio.duration || 0);

        if (autoPlayNext) {
          // Play next chapter immediately (0s delay)
          playNextRef.current();
        }
      };

      const handleError = (e: Event) => {
        setIsPlaying(false);
        console.warn('Audio playback source error:', e);
        setAudioError('ไม่สามารถเล่นไฟล์เสียงนี้ได้ กรุณาตรวจสอบลิงก์ MP3 / สิทธิ์ไฟล์ Google Drive');
      };

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      // Load listening history from local storage
      const savedHistory = localStorage.getItem('mafangniyai_history');
      if (savedHistory) {
        try {
          setListeningHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error('Failed to parse listening history:', e);
        }
      }

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.pause();
      };
    }
  }, []);

  // Save history periodically when playing
  useEffect(() => {
    if (isPlaying && currentNovel && currentChapter && currentTime > 0) {
      const interval = setInterval(() => {
        saveHistoryProgress(currentTime);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, currentNovel, currentChapter, currentTime]);

  const saveHistoryProgress = (time: number) => {
    if (!currentNovel || !currentChapter) return;

    setListeningHistory((prevHistory) => {
      const existingIndex = prevHistory.findIndex(
        (item) => item.novelId === currentNovel.id && item.chapterId === currentChapter.id
      );

      const newItem: ListeningHistory = {
        novelId: currentNovel.id,
        novelTitle: currentNovel.title,
        novelCover: currentNovel.coverUrl,
        chapterId: currentChapter.id,
        chapterNumber: currentChapter.chapterNumber,
        chapterTitle: currentChapter.title,
        progress: Math.floor(time),
        duration: Math.floor(duration || currentChapter.duration),
        lastListenedAt: new Date().toISOString(),
      };

      let newHistory: ListeningHistory[];
      if (existingIndex >= 0) {
        newHistory = [...prevHistory];
        newHistory[existingIndex] = newItem;
      } else {
        newHistory = [newItem, ...prevHistory];
      }

      localStorage.setItem('mafangniyai_history', JSON.stringify(newHistory.slice(0, 50)));
      return newHistory;
    });
  };

  const playNextRef = useRef<() => void>(() => {});

  const getSavedPosition = (novelId: string, chapterId: string): number => {
    const found = listeningHistory.find(
      (item) => item.novelId === novelId && item.chapterId === chapterId
    );
    return found ? found.progress : 0;
  };

  const playChapter = (novel: Novel, chapter: Chapter, autoStart = true) => {
    if (!audioRef.current) return;
    setAudioError(null);

    const novelChapters = novel.chapters || MOCK_CHAPTERS[novel.id] || [chapter];
    setCurrentNovel(novel);
    setCurrentChapter(chapter);
    setQueue(novelChapters);

    const formattedAudio = formatAudioUrl(chapter.audioUrl);

    // Save position to set after load
    const savedPos = getSavedPosition(novel.id, chapter.id);
    pendingSavedPos.current = savedPos > 5 ? savedPos : null;

    if (audioRef.current.src !== formattedAudio) {
      audioRef.current.src = formattedAudio;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.load();
    }

    if (autoStart) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Audio play request failed/prevented:', err);
          setIsPlaying(false);
          if (err.name === 'NotSupportedError') {
            setAudioError('ไม่พบไฟล์เสียงที่รองรับ กรุณาตรวจสอบลิงก์ MP3 หรือสิทธิ์การเข้าถึงไฟล์');
          }
        });
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentChapter) return;
    setAudioError(null);

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      saveHistoryProgress(currentTime);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Play error:', err);
          setIsPlaying(false);
          if (err.name === 'NotSupportedError') {
            setAudioError('ไม่พบไฟล์เสียงที่รองรับ กรุณาตรวจสอบลิงก์ MP3');
          }
        });
    }
  };

  const seekTo = (time: number) => {
    if (!audioRef.current) return;
    try {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    } catch (e) {
      console.warn('Seek failed:', e);
    }
  };

  const skipTime = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.min(Math.max(audioRef.current.currentTime + seconds, 0), duration);
    seekTo(newTime);
  };

  const playNext = () => {
    if (!currentChapter || queue.length === 0 || !currentNovel) return;
    const currentIndex = queue.findIndex((c) => c.id === currentChapter.id);
    if (currentIndex >= 0 && currentIndex < queue.length - 1) {
      const nextChapter = queue[currentIndex + 1];
      playChapter(currentNovel, nextChapter, true);
    } else {
      // Reached the end of the novel queue
      setToastNotice(`🎉 คุณฟังนิยายเรื่อง "${currentNovel.title}" จบครบทุกตอนแล้ว`);
      setTimeout(() => {
        setToastNotice(null);
      }, 5000);
    }
  };
  playNextRef.current = playNext;

  const playPrevious = () => {
    if (!currentChapter || queue.length === 0 || !currentNovel) return;
    const currentIndex = queue.findIndex((c) => c.id === currentChapter.id);
    if (currentIndex > 0) {
      const prevChapter = queue[currentIndex - 1];
      playChapter(currentNovel, prevChapter, true);
    }
  };

  const setSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const setSleepTimerMinutes = (minutes: number | null) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setSleepTimer(minutes);

    if (minutes !== null && minutes > 0) {
      timerRef.current = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
        setSleepTimer(null);
      }, minutes * 60 * 1000);
    }
  };

  const toggleFullPlayer = (open?: boolean) => {
    setIsFullPlayerOpen((prev) => (open !== undefined ? open : !prev));
  };

  const clearAudioError = () => {
    setAudioError(null);
  };

  const clearToastNotice = () => {
    setToastNotice(null);
  };

  return (
    <AudioContext.Provider
      value={{
        currentNovel,
        currentChapter,
        queue,
        isPlaying,
        currentTime,
        duration,
        playbackRate,
        autoPlayNext,
        sleepTimer,
        isFullPlayerOpen,
        listeningHistory,
        audioError,
        toastNotice,
        playChapter,
        togglePlayPause,
        seekTo,
        skipTime,
        playNext,
        playPrevious,
        setSpeed,
        setAutoPlayNext,
        setSleepTimerMinutes,
        toggleFullPlayer,
        getSavedPosition,
        clearAudioError,
        clearToastNotice,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
