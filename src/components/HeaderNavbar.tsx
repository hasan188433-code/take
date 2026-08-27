import React from 'react';
import { GameMode, CharacterType } from '../types/game';
import { Sparkles, Users, Globe2, Volume2, VolumeX, HelpCircle, BookOpen, Palette, Maximize } from 'lucide-react';
import { sound } from '../utils/sound';

interface Props {
  lang: 'fa' | 'en';
  setLang: (lang: 'fa' | 'en') => void;
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  roomCode: string | null;
  myRole: CharacterType;
  openRoomModal: () => void;
  openHintModal: () => void;
  openControlsModal: () => void;
  openStoryModal: () => void;
  openCustomizerModal: () => void;
  toggleFullscreen: () => void;
  currentChapterTitle: string;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

export const HeaderNavbar: React.FC<Props> = ({
  lang,
  setLang,
  gameMode,
  setGameMode,
  roomCode,
  myRole,
  openRoomModal,
  openHintModal,
  openControlsModal,
  openStoryModal,
  openCustomizerModal,
  toggleFullscreen,
  currentChapterTitle,
  isMuted,
  setIsMuted,
}) => {
  const toggleSound = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  };

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 px-4 py-2 sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        
        {/* Title & Lore badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-500 p-0.5 shadow-lg shadow-rose-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-rose-400 text-lg">
              🪵
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base md:text-lg tracking-tight bg-gradient-to-r from-rose-400 via-pink-300 to-amber-300 bg-clip-text text-transparent">
                {lang === 'fa' ? 'رز و آریا: پیوند عروسک‌های چوبی ۳D' : 'Rose & Arya: Wooden Hearts 3D'}
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 font-medium hidden sm:inline-block">
                3D Co-Op Romantic
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {currentChapterTitle}
            </p>
          </div>
        </div>

        {/* Center: Mode Indicator & Room Code */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setGameMode('LOCAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              gameMode === 'LOCAL'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            {lang === 'fa' ? 'دونفره محلی' : 'Local Co-op'}
          </button>

          <button
            onClick={openRoomModal}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              gameMode === 'ONLINE'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            {lang === 'fa' ? 'آنلاین از راه دور' : 'Remote Online'}
            {roomCode && (
              <span className="ml-1 bg-amber-400 text-slate-950 font-mono font-bold px-1.5 py-0.5 rounded text-[10px]">
                {roomCode}
              </span>
            )}
          </button>
        </div>

        {/* Actions & Utilities */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          
          {/* Customizer Studio */}
          <button
            onClick={openCustomizerModal}
            className="px-2.5 py-1.5 bg-gradient-to-r from-rose-500/20 to-amber-500/20 hover:from-rose-500/30 hover:to-amber-500/30 text-rose-300 font-bold rounded-lg text-xs flex items-center gap-1 border border-rose-500/30 transition-all"
            title={lang === 'fa' ? 'طراحی و استایل' : 'Customize Design'}
          >
            <Palette className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">{lang === 'fa' ? 'طراحی و استایل' : 'Design'}</span>
          </button>

          {/* AI Oracle Hint Button */}
          <button
            onClick={openHintModal}
            className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 shadow-md shadow-amber-500/20 transition-all transform hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'fa' ? 'راهنما' : 'Hint'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs transition-all border border-slate-700"
            title={lang === 'fa' ? 'کامل کردن صفحه (Full Screen)' : 'Full Screen'}
          >
            <Maximize className="w-4 h-4" />
          </button>

          {/* Controls Help */}
          <button
            onClick={openControlsModal}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-all border border-slate-700"
            title={lang === 'fa' ? 'راهنمای دکمه‌ها' : 'Controls'}
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Story Cutscene Journal */}
          <button
            onClick={openStoryModal}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-all border border-slate-700"
            title={lang === 'fa' ? 'داستان و مکالمات' : 'Story Lore'}
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Mute/Unmute */}
          <button
            onClick={toggleSound}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-all border border-slate-700"
            title={lang === 'fa' ? 'صدا' : 'Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
            className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-all"
          >
            {lang === 'fa' ? 'EN' : 'فا'}
          </button>

        </div>

      </div>
    </header>
  );
};
