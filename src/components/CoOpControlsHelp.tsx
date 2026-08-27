import React from 'react';
import { X, Gamepad2, Keyboard, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fa' | 'en';
}

export const CoOpControlsHelp: React.FC<Props> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-slate-100 shadow-2xl relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-sky-500/20 border border-sky-500/30 rounded-xl text-sky-400">
            <Keyboard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {lang === 'fa' ? 'راهنمای کنترل دونفره (Local & Remote Controls)' : 'Co-op Controls Guide'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'fa' ? 'قابلیت بازی با یک کیبورد (دونفره محلی) یا از راه دور با مرورگرهای مجزا' : 'Play on one keyboard locally or remotely across devices'}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          
          {/* Player 1: Rose */}
          <div className="bg-slate-950/70 border border-rose-500/30 p-4 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500" />
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-rose-400 flex items-center gap-1.5">
                🌹 رز (Rose) - عروسک چوبی ظریف
              </span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono">
                شلاق گل رز & آهنربای عشق
              </span>
            </div>

            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex justify-between items-center bg-slate-900/80 p-2 rounded border border-slate-800">
                <span>{lang === 'fa' ? 'حرکت ۳ بعدی در اتاق' : '3D Movement'}</span>
                <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-rose-300 font-mono">W A S D</kbd>
              </li>
              <li className="flex justify-between items-center bg-slate-900/80 p-2 rounded border border-slate-800">
                <span>{lang === 'fa' ? 'پریدن روی کتاب‌ها' : 'Jump'}</span>
                <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-rose-300 font-mono">SPACE</kbd>
              </li>
              <li className="flex justify-between items-center bg-slate-900/80 p-2 rounded border border-slate-800">
                <span>{lang === 'fa' ? 'شلاق گل رز / کشیدن اهرم' : 'Rose Whip / Lever Pull'}</span>
                <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-rose-300 font-mono">F</kbd>
              </li>
              <li className="flex justify-between items-center bg-slate-900/80 p-2 rounded border border-slate-800">
                <span>{lang === 'fa' ? 'آهنربای قلب / جذب اجسام' : 'Heart Magnet Hook'}</span>
                <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-rose-300 font-mono">G</kbd>
              </li>
            </ul>
          </div>

          {/* Player 2: Arya */}
          <div className="bg-slate-950/70 border border-sky-500/30 p-4 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-sky-500 to-cyan-500" />
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sky-400 flex items-center gap-1.5">
                ⚙️ آریا (Arya) - عروسک چوبی کوکی
              </span>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-mono">
                کلید برنجی & انجماد زمان
              </span>
            </div>

            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex justify-between items-center bg-slate-900/80 p-2 rounded border border-slate-800">
                <span>{lang === 'fa' ? 'حرکت ۳ بعدی در اتاق' : '3D Movement'}</span>
                <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-sky-300 font-mono">← ↑ ↓ →</kbd>
              </li>
              <li className="flex justify-between items-center bg-slate-900/80 p-2 rounded border border-slate-800">
                <span>{lang === 'fa' ? 'پریدن روی فنجان‌ها' : 'Jump'}</span>
                <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-sky-300 font-mono">SHIFT / ENTER</kbd>
              </li>
              <li className="flex justify-between items-center bg-slate-900/80 p-2 rounded border border-slate-800">
                <span>{lang === 'fa' ? 'انجماد زمان / توقف دنده' : 'Time Freeze / Lock Gear'}</span>
                <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-sky-300 font-mono">K</kbd>
              </li>
              <li className="flex justify-between items-center bg-slate-900/80 p-2 rounded border border-slate-800">
                <span>{lang === 'fa' ? 'ایجاد سکوی زمان کوکی' : 'Clockwork Time Platform'}</span>
                <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-sky-300 font-mono">L</kbd>
              </li>
            </ul>
          </div>

        </div>

        {/* Gamepad & Touch Note */}
        <div className="mt-4 bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
          <Gamepad2 className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            {lang === 'fa' 
              ? 'پشتیبانی از دسته بازی (Gamepad/Controller): هر دو بازیکن می‌توانند با اتصال دسته‌های USB یا بلوتوث بازی را کنترل کنند.'
              : 'Gamepad Controller Support: Connect 1 or 2 controllers to automatically assign player 1 & 2 controls.'}
          </span>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-indigo-500/20"
          >
            {lang === 'fa' ? 'متوجه شدم، شروع بازی!' : 'Got it, Let\'s Play!'}
          </button>
        </div>

      </div>
    </div>
  );
};
