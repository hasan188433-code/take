import React, { useState } from 'react';
import { X, Globe2, Copy, Check, Users, Sparkles, AlertCircle } from 'lucide-react';
import { CharacterType } from '../types/game';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fa' | 'en';
  roomCode: string | null;
  createRoom: (character: CharacterType) => void;
  joinRoom: (code: string) => void;
  myRole: CharacterType | null;
  partnerConnected: boolean;
  errorMessage: string | null;
}

export const RoomModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lang,
  roomCode,
  createRoom,
  joinRoom,
  myRole,
  partnerConnected,
  errorMessage,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType>('AETHER');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!roomCode) return;
    const url = `${window.location.origin}?room=${roomCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-400">
            <Globe2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {lang === 'fa' ? 'اتاق بازی آنلاین از راه دور' : 'Remote Online Co-Op Room'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'fa' ? 'با ارسال کد به دوست خود، از دو مرورگر یا دو سیستم مجزا به هم وصل شوید' : 'Connect seamlessly across devices with real-time sync'}
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* If already in a room */}
        {roomCode ? (
          <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs rounded-full font-medium">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              {lang === 'fa' ? 'کد اختصاصی اتاق شما' : 'Your Unique Room Code'}
            </div>

            <div className="text-4xl font-mono font-black tracking-widest text-amber-400 bg-slate-900 py-3 rounded-xl border border-slate-800 select-all">
              {roomCode}
            </div>

            <p className="text-xs text-slate-400">
              {lang === 'fa' 
                ? `نقش شما: ${(myRole === 'ROSE' || myRole === 'AETHER') ? '🌹 رز (Rose)' : '⚙️ آریا (Arya)'}`
                : `Your Role: ${(myRole === 'ROSE' || myRole === 'AETHER') ? 'Rose (Wooden Doll)' : 'Arya (Clockwork Doll)'}`}
            </p>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? (lang === 'fa' ? 'لینک کپی شد!' : 'Copied!') : (lang === 'fa' ? 'کپی لینک مستقیم' : 'Copy Invite Link')}
              </button>
            </div>

            <div className="pt-3 border-t border-slate-800">
              {partnerConnected ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  {lang === 'fa' ? 'بازیکن دوم متصل شد! بازی همگام‌سازی شد.' : 'Partner Connected! Game Synced.'}
                </div>
              ) : (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded-xl flex items-center justify-center gap-2 animate-pulse">
                  <Users className="w-4 h-4" />
                  {lang === 'fa' ? 'در حال انتظار برای ورود دوست شما...' : 'Waiting for partner to enter code...'}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Create or Join Options */
          <div className="space-y-6">
            
            {/* Create Room Section */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                {lang === 'fa' ? '۱. ساخت اتاق جدید' : '1. Create New Room'}
              </h3>
              
              <div className="mb-3">
                <label className="text-xs text-slate-400 block mb-1.5">
                  {lang === 'fa' ? 'انتخاب شخصیت شما:' : 'Select Your Character:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedCharacter('ROSE')}
                    className={`p-2.5 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      selectedCharacter === 'ROSE' || selectedCharacter === 'AETHER'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    🌹 رز (Rose - شلاق & آهنربا)
                  </button>
                  <button
                    onClick={() => setSelectedCharacter('ARYA')}
                    className={`p-2.5 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      selectedCharacter === 'ARYA' || selectedCharacter === 'CHRONO'
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    ⚙️ آریا (Arya - زمان & کوک)
                  </button>
                </div>
              </div>

              <button
                onClick={() => createRoom(selectedCharacter)}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg text-xs transition-all shadow-md shadow-purple-600/20"
              >
                {lang === 'fa' ? 'ایجاد اتاق و دریافت کد' : 'Create Room & Get Code'}
              </button>
            </div>

            {/* Join Room Section */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                {lang === 'fa' ? '۲. ورود به اتاق دوست با کد' : '2. Join Room with Code'}
              </h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="X7K29B"
                  className="flex-1 bg-slate-900 border border-slate-700 text-center text-amber-400 font-mono font-bold tracking-widest rounded-lg text-lg focus:outline-none focus:border-amber-400 uppercase"
                />
                <button
                  onClick={() => inputCode && joinRoom(inputCode)}
                  disabled={!inputCode}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-all"
                >
                  {lang === 'fa' ? 'ورود به بازی' : 'Join Game'}
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
