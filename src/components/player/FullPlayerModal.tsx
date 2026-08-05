'use client';

import React, { useState } from 'react';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  RotateCw, 
  X, 
  Gauge, 
  Moon, 
  Heart, 
  Share2, 
  ListMusic, 
  Repeat,
  Headphones,
  CheckCircle2
} from 'lucide-react';

export const FullPlayerModal: React.FC = () => {
  const {
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
    togglePlayPause,
    seekTo,
    skipTime,
    playNext,
    playPrevious,
    setSpeed,
    setAutoPlayNext,
    setSleepTimerMinutes,
    toggleFullPlayer,
    playChapter,
  } = useAudio();

  const { isFavorite, toggleFavorite } = useAuth();
  const [showDrawer, setShowDrawer] = useState(false);

  if (!isFullPlayerOpen || !currentNovel || !currentChapter) return null;

  const favorited = isFavorite(currentNovel.id);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const speedOptions = [0.75, 1.0, 1.25, 1.5, 2.0];
  const sleepOptions = [
    { label: 'ปิดสลีปไทม์เมอร์', val: null },
    { label: '15 นาที', val: 15 },
    { label: '30 นาที', val: 30 },
    { label: '45 นาที', val: 45 },
    { label: '60 นาที', val: 60 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-3xl flex flex-col justify-between overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
      
      {/* Background Atmosphere Image */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <img
          src={currentNovel.coverUrl}
          alt=""
          className="w-full h-full object-cover blur-3xl scale-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/60" />
      </div>

      {/* Header */}
      <div className="relative z-10 max-w-4xl mx-auto w-full px-6 pt-6 flex items-center justify-between">
        <button
          onClick={() => toggleFullPlayer(false)}
          className="p-2 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400">
            กำลังเล่นนิยายเสียง
          </p>
          <h3 className="text-sm font-bold text-slate-200 truncate max-w-xs sm:max-w-sm">
            {currentNovel.title}
          </h3>
        </div>

        <button
          onClick={() => toggleFavorite(currentNovel.id)}
          className={`p-2 rounded-2xl border transition-all ${
            favorited
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <Heart className={`w-5 h-5 ${favorited ? 'fill-rose-400' : ''}`} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-md mx-auto w-full px-6 py-6 flex flex-col items-center justify-center flex-1 space-y-6">
        
        {/* Large Poster Image with Visualizer */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-2xl shadow-purple-950/80 border border-purple-500/30 group">
          <img
            src={currentNovel.coverUrl}
            alt={currentNovel.title}
            className="w-full h-full object-cover"
          />

          {/* Equalizer animation overlay when playing */}
          {isPlaying && (
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-end justify-center p-6 gap-1.5">
              <span className="w-2 bg-purple-400 rounded-full animate-[bounce_1s_infinite_100ms] h-12" />
              <span className="w-2 bg-indigo-400 rounded-full animate-[bounce_1s_infinite_300ms] h-16" />
              <span className="w-2 bg-pink-400 rounded-full animate-[bounce_1s_infinite_200ms] h-10" />
              <span className="w-2 bg-purple-400 rounded-full animate-[bounce_1s_infinite_400ms] h-14" />
            </div>
          )}
        </div>

        {/* Chapter Title & Meta */}
        <div className="text-center space-y-1.5 w-full">
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug">
            {currentChapter.title}
          </h2>
          <p className="text-xs text-slate-400">
            ผู้แต่ง: <span className="text-slate-200">{currentNovel.author}</span> • ผู้แปล: <span className="text-purple-300">{currentNovel.translator}</span>
          </p>
        </div>

        {/* Progress Bar & Seek Slider */}
        <div className="w-full space-y-2">
          <div className="relative w-full h-2 bg-slate-800/80 rounded-full overflow-hidden cursor-pointer group">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center justify-center gap-4 w-full">
          <button
            onClick={playPrevious}
            className="p-3 rounded-2xl text-slate-300 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
          >
            <SkipBack className="w-6 h-6" />
          </button>

          <button
            onClick={() => skipTime(-10)}
            className="p-3 rounded-2xl text-slate-300 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
            title="-10 วินาที"
          >
            <RotateCcw className="w-6 h-6" />
          </button>

          <button
            onClick={togglePlayPause}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white flex items-center justify-center shadow-xl shadow-purple-950 hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-white" />
            ) : (
              <Play className="w-8 h-8 fill-white ml-1" />
            )}
          </button>

          <button
            onClick={() => skipTime(10)}
            className="p-3 rounded-2xl text-slate-300 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
            title="+10 วินาที"
          >
            <RotateCw className="w-6 h-6" />
          </button>

          <button
            onClick={playNext}
            className="p-3 rounded-2xl text-slate-300 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>

        {/* Option Quick Bar: Speed, Sleep, AutoNext, Chapter Drawer */}
        <div className="flex items-center justify-center gap-3 pt-2 w-full">
          
          {/* Speed picker */}
          <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-xl p-1">
            {speedOptions.map((rate) => (
              <button
                key={rate}
                onClick={() => setSpeed(rate)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  playbackRate === rate ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Chapter Drawer Toggle */}
          <button
            onClick={() => setShowDrawer(!showDrawer)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              showDrawer ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-900/80 text-slate-300 border-slate-800'
            }`}
          >
            <ListMusic className="w-4 h-4" />
            <span>รายชื่อตอน ({queue.length})</span>
          </button>

        </div>

      </div>

      {/* Chapter Drawer Drawer Overlay */}
      {showDrawer && (
        <div className="relative z-20 max-w-xl mx-auto w-full px-6 pb-8 animate-in slide-in-from-bottom-5">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl max-h-72 overflow-y-auto space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                รายการตอนทั้งหมด ({queue.length} ตอน)
              </h4>
              <button
                onClick={() => setShowDrawer(false)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                ปิดรายการ
              </button>
            </div>

            {queue.map((ch) => {
              const isSelected = ch.id === currentChapter.id;
              return (
                <div
                  key={ch.id}
                  onClick={() => {
                    playChapter(currentNovel, ch, true);
                    setShowDrawer(false);
                  }}
                  className={`flex items-center justify-between p-3 rounded-2xl text-xs font-medium cursor-pointer transition-colors ${
                    isSelected ? 'bg-purple-600 text-white' : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{ch.title}</span>
                  {isSelected && <Headphones className="w-4 h-4 shrink-0 animate-pulse ml-2" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Spacer */}
      <div className="h-6" />
    </div>
  );
};
