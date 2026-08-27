import React from 'react';
import { Trophy, Star, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

interface Props {
  isOpen: boolean;
  onNextChapter: () => void;
  onReplay: () => void;
  lang: 'fa' | 'en';
  chapterTitle: string;
  isFinalChapter: boolean;
}

export const VictoryModal: React.FC<Props> = ({
  isOpen,
  onNextChapter,
  onReplay,
  lang,
  chapterTitle,
  isFinalChapter,
}) => {
  if (!isOpen) return null;

  sound.playVictory();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl text-center relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/30">
        
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-amber-500/30 mb-4 animate-bounce">
          <Trophy className="w-8 h-8 text-slate-950" />
        </div>

        <h2 className="text-2xl font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent mb-1">
          {isFinalChapter
            ? (lang === 'fa' ? 'پایان حماسه! بازسازی شکاف کیهانی' : 'Victory! The Cosmic Rift is Saved!')
            : (lang === 'fa' ? 'فصل با موفقیت تکمیل شد!' : 'Chapter Cleared!')}
        </h2>

        <p className="text-xs text-amber-200/80 mb-6 font-medium">
          {chapterTitle}
        </p>

        {/* Rating Stars */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 mb-6 space-y-2">
          <div className="text-xs text-slate-400">
            {lang === 'fa' ? 'امتیاز همکارانه دو نگهبان:' : 'Guardian Synergy Rating:'}
          </div>
          <div className="flex justify-center gap-1.5 text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-5 h-5 fill-amber-400" />
            ))}
          </div>
          <p className="text-[11px] text-emerald-400 font-bold">
            {lang === 'fa' ? 'هم‌افزایی ۱۰۰٪ بین نور و زمان' : '100% Perfect Light & Time Synergy'}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {!isFinalChapter ? (
            <button
              onClick={onNextChapter}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all transform hover:scale-[1.02] active:scale-95"
            >
              <span>{lang === 'fa' ? 'ورود به فصل بعدی' : 'Proceed to Next Chapter'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onReplay}
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{lang === 'fa' ? 'بازی مجدد از فصل اول' : 'Play Again from Beginning'}</span>
            </button>
          )}

          <button
            onClick={onReplay}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-all"
          >
            {lang === 'fa' ? 'تکرار همین فصل' : 'Replay Chapter'}
          </button>
        </div>

      </div>
    </div>
  );
};
