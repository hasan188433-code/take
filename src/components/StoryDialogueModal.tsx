import React, { useState } from 'react';
import { X, ChevronRight, Volume2, Sparkles } from 'lucide-react';
import { DialogueLine } from '../types/game';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fa' | 'en';
  dialogues: DialogueLine[];
  onComplete?: () => void;
}

export const StoryDialogueModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lang,
  dialogues,
  onComplete,
}) => {
  const [index, setIndex] = useState(0);

  if (!isOpen || dialogues.length === 0) return null;

  const current = dialogues[index] || dialogues[0];

  const handleNext = () => {
    if (index < dialogues.length - 1) {
      setIndex(index + 1);
    } else {
      setIndex(0);
      onClose();
      if (onComplete) onComplete();
    }
  };

  const getSpeakerStyle = (speaker: string) => {
    switch (speaker) {
      case 'ROSE':
      case 'AETHER':
        return {
          name: lang === 'fa' ? 'رز (عروسک چوبی با موهای کاموایی)' : 'Rose (Yarn Hair Wooden Doll)',
          color: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
          gradient: 'from-rose-500/20 to-pink-500/20',
          avatar: '🌹'
        };
      case 'ARYA':
      case 'CHRONO':
        return {
          name: lang === 'fa' ? 'آریا (عروسک چوبی کوکی)' : 'Arya (Clockwork Doll)',
          color: 'text-sky-400 border-sky-500/40 bg-sky-500/10',
          gradient: 'from-sky-500/20 to-cyan-500/20',
          avatar: '⚙️'
        };
      default:
        return {
          name: lang === 'fa' ? 'کتاب جادویی دلدار (Love Book)' : 'Magical Love Book',
          color: 'text-amber-300 border-amber-500/40 bg-amber-500/10',
          gradient: 'from-amber-500/20 to-yellow-500/20',
          avatar: '📖'
        };
    }
  };

  const style = getSpeakerStyle(current.speaker);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-fadeIn">
      <div className={`bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 text-slate-100 shadow-2xl relative overflow-hidden bg-gradient-to-br ${style.gradient}`}>
        
        <button
          onClick={() => {
            setIndex(0);
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Character Avatar & Name */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl shadow-lg">
            {current.avatar || style.avatar}
          </div>
          <div>
            <div className={`text-xs font-bold px-2.5 py-0.5 rounded-full border inline-block ${style.color}`}>
              {style.name}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {lang === 'fa' ? 'داستان و مکالمه معبد' : 'Temple Dialogue'}
            </p>
          </div>
        </div>

        {/* Text Box */}
        <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl min-h-[90px] flex items-center text-sm leading-relaxed text-slate-200">
          <p className="w-full text-right" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
            {lang === 'fa' ? current.text.fa : current.text.en}
          </p>
        </div>

        {/* Navigation Controls */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1">
            {dialogues.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === index ? 'bg-amber-400 w-4' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
          >
            <span>{index < dialogues.length - 1 ? (lang === 'fa' ? 'بعدی' : 'Next') : (lang === 'fa' ? 'ادامه بازی' : 'Continue')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
