'use client';

import React, { useState } from 'react';
import { useAudio } from '@/context/AudioContext';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  RotateCw, 
  Maximize2, 
  Gauge, 
  Moon, 
  Repeat,
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';
import { formatImageUrl, DEFAULT_COVER_IMAGE } from '@/lib/audioUtils';

export const AudioPlayer: React.FC = () => {
  const {
    currentNovel,
    currentChapter,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    autoPlayNext,
    sleepTimer,
    audioError,
    toastNotice,
    togglePlayPause,
    seekTo,
    skipTime,
    playNext,
    playPrevious,
    setSpeed,
    setAutoPlayNext,
    setSleepTimerMinutes,
    toggleFullPlayer,
    clearAudioError,
    clearToastNotice,
  } = useAudio();

  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [sleepMenuOpen, setSleepMenuOpen] = useState(false);

  if (!currentNovel || !currentChapter) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(parseFloat(e.target.value));
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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-2xl border-t border-purple-900/40 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      
      {/* Toast Completion Notice Banner */}
      {toastNotice && (
        <div className="bg-gradient-to-r from-emerald-950/95 to-purple-950/95 border-b border-emerald-600/50 text-emerald-200 px-4 py-2.5 text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in slide-in-from-bottom">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastNotice}</span>
          </div>
          <button onClick={clearToastNotice} className="p-1 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Audio Source Warning Banner */}
      {audioError && (
        <div className="bg-rose-950/90 border-b border-rose-800 text-rose-200 px-4 py-2 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{audioError}</span>
          </div>
          <button onClick={clearAudioError} className="p-1 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Scrubber Line */}
      <div className="relative w-full h-1.5 bg-slate-800 group cursor-pointer">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeekChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 transition-all duration-100 relative"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        
        {/* Left: Novel Thumbnail & Titles */}
        <div 
          onClick={() => toggleFullPlayer(true)}
          className="flex items-center gap-3 min-w-0 cursor-pointer group flex-1 sm:flex-initial"
        >
          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-800 group-hover:border-purple-500/50 transition-colors">
            <img
              src={formatImageUrl(currentNovel.coverUrl)}
              alt={currentNovel.title}
              onError={(e) => {
                e.currentTarget.src = DEFAULT_COVER_IMAGE;
              }}
              className="w-full h-full object-cover"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-purple-950/40 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-100 truncate group-hover:text-purple-300 transition-colors">
              {currentChapter.title}
            </h4>
            <p className="text-[11px] text-slate-400 truncate">
              {currentNovel.title}
            </p>
          </div>
        </div>

        {/* Center: Playback Controls & Time */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Prev Chapter */}
            <button
              onClick={playPrevious}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
              title="ตอนก่อนหน้า"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Rewind 10s */}
            <button
              onClick={() => skipTime(-10)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
              title="ย้อนหลัง 10 วินาที"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Play/Pause Main Button */}
            <button
              onClick={togglePlayPause}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-purple-900/50 hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : (
                <Play className="w-5 h-5 fill-white ml-0.5" />
              )}
            </button>

            {/* Forward 10s */}
            <button
              onClick={() => skipTime(10)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
              title="ข้ามไปข้างหน้า 10 วินาที"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Next Chapter */}
            <button
              onClick={playNext}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
              title="ตอนถัดไป"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Time Display */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Speed, Sleep Timer, Auto-next & Expand */}
        <div className="hidden md:flex items-center gap-2">
          
          {/* Speed Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setSpeedMenuOpen(!speedMenuOpen);
                setSleepMenuOpen(false);
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-purple-500/40 flex items-center gap-1 transition-all"
            >
              <Gauge className="w-3.5 h-3.5 text-purple-400" />
              <span>{playbackRate}x</span>
            </button>

            {speedMenuOpen && (
              <div className="absolute bottom-full right-0 mb-2 w-28 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 z-50">
                <p className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase">ความเร็วเสียง</p>
                {speedOptions.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      setSpeed(rate);
                      setSpeedMenuOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                      playbackRate === rate ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {rate === 1 ? '1.0x (ปกติ)' : `${rate}x`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sleep Timer */}
          <div className="relative">
            <button
              onClick={() => {
                setSleepMenuOpen(!sleepMenuOpen);
                setSpeedMenuOpen(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1 transition-all ${
                sleepTimer !== null
                  ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500/50'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
              title="ตั้งเวลาปิด"
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>{sleepTimer ? `${sleepTimer}น.` : 'ปิด'}</span>
            </button>

            {sleepMenuOpen && (
              <div className="absolute bottom-full right-0 mb-2 w-36 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 z-50">
                <p className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase">ตั้งเวลาปิดเพลง</p>
                {sleepOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSleepTimerMinutes(opt.val);
                      setSleepMenuOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                      sleepTimer === opt.val ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auto Play Next Toggle */}
          <button
            onClick={() => setAutoPlayNext(!autoPlayNext)}
            className={`p-1.5 rounded-lg border text-xs transition-all ${
              autoPlayNext
                ? 'bg-purple-950/60 text-purple-300 border-purple-500/50'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={autoPlayNext ? 'เล่นตอนถัดไปอัตโนมัติ: เปิด' : 'เล่นตอนถัดไปอัตโนมัติ: ปิด'}
          >
            <Repeat className="w-4 h-4" />
          </button>

          {/* Expand to Full Screen Modal */}
          <button
            onClick={() => toggleFullPlayer(true)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-colors ml-1"
            title="ขยายหน้าจอเครื่องเล่น"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
