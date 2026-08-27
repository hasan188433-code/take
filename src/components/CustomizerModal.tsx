import React from 'react';
import { X, Palette, Sparkles, Wand2, Shield, Heart, Zap } from 'lucide-react';
import { CustomizationSettings } from '../types/game';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fa' | 'en';
  settings: CustomizationSettings;
  updateSettings: (newSettings: CustomizationSettings) => void;
  onSendSync?: (settings: CustomizationSettings) => void;
}

export const CustomizerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lang,
  settings,
  updateSettings,
  onSendSync,
}) => {
  if (!isOpen) return null;

  const handleRoseChange = (field: keyof CustomizationSettings['rose'], value: string) => {
    const updated: CustomizationSettings = {
      ...settings,
      rose: { ...settings.rose, [field]: value },
    };
    updateSettings(updated);
    if (onSendSync) onSendSync(updated);
  };

  const handleAryaChange = (field: keyof CustomizationSettings['arya'], value: string) => {
    const updated: CustomizationSettings = {
      ...settings,
      arya: { ...settings.arya, [field]: value },
    };
    updateSettings(updated);
    if (onSendSync) onSendSync(updated);
  };

  const handleRoomChange = (field: keyof CustomizationSettings['room'], value: any) => {
    const updated: CustomizationSettings = {
      ...settings,
      room: { ...settings.room, [field]: value },
    };
    updateSettings(updated);
    if (onSendSync) onSendSync(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-slate-100 shadow-2xl relative my-8">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-400">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {lang === 'fa' ? 'استودیو طراحی و سفارشی‌سازی ۳D' : '3D Design & Customization Studio'}
              <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                Customizer
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'fa' ? 'رنگ‌ها، متریال چوب، نورپردازی اتاق و جلوه‌ها را بر اساس سلیقه خود تغییر دهید' : 'Personalize Rose, Arya, and the 3D workshop environment'}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          
          {/* Section 1: Rose Customization */}
          <div className="bg-slate-950 p-4 rounded-xl border border-rose-500/30">
            <h3 className="text-sm font-bold text-rose-400 mb-3 flex items-center gap-2">
              🌹 {lang === 'fa' ? 'طراحی و ظاهر رز (Rose)' : 'Rose Character Design'}
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">
                  {lang === 'fa' ? 'رنگ موهای کاموایی:' : 'Yarn Hair Color:'}
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { name: 'سرخ گلی', color: '#f43f5e' },
                    { name: 'طلایی', color: '#f59e0b' },
                    { name: 'بنفش مخملی', color: '#8b5cf6' },
                    { name: 'زمردی', color: '#10b981' },
                    { name: 'مشکی', color: '#334155' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      onClick={() => handleRoseChange('hairColor', c.color)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        settings.rose.hairColor === c.color ? 'scale-125 border-white shadow-lg' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5">
                  {lang === 'fa' ? 'رنگ لباس چوبی:' : 'Wooden Dress Color:'}
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { name: 'زرشکی', color: '#881337' },
                    { name: 'سرمه‌ای', color: '#1e3a8a' },
                    { name: 'ارغوانی', color: '#581c87' },
                    { name: 'سبز کهربایی', color: '#064e3b' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      onClick={() => handleRoseChange('dressColor', c.color)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        settings.rose.dressColor === c.color ? 'scale-125 border-white shadow-lg' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5">
                  {lang === 'fa' ? 'رنگ گوهر درخشان قلب:' : 'Heart Gem Glow:'}
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { name: 'سرخ آتشین', color: '#ff2a6d' },
                    { name: 'صورتی نئون', color: '#f43f5e' },
                    { name: 'طلایی درخشان', color: '#fbbf24' },
                    { name: 'فیروزه‌ای', color: '#06b6d4' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      onClick={() => handleRoseChange('heartColor', c.color)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        settings.rose.heartColor === c.color ? 'scale-125 border-white shadow-lg' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Arya Customization */}
          <div className="bg-slate-950 p-4 rounded-xl border border-sky-500/30">
            <h3 className="text-sm font-bold text-sky-400 mb-3 flex items-center gap-2">
              ⚙️ {lang === 'fa' ? 'طراحی و ظاهر آریا (Arya)' : 'Arya Character Design'}
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">
                  {lang === 'fa' ? 'متریال چوب بدن:' : 'Wood Material Tint:'}
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { name: 'بلوط گرم', color: '#78350f' },
                    { name: 'چوب ماهون تیره', color: '#451a03' },
                    { name: 'چوب نقره‌ای', color: '#334155' },
                    { name: 'چوب آبی کبالت', color: '#1e3a8a' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      onClick={() => handleAryaChange('woodTint', c.color)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        settings.arya.woodTint === c.color ? 'scale-125 border-white shadow-lg' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5">
                  {lang === 'fa' ? 'پوشش کلید کوکی برنجی:' : 'Brass Key Finish:'}
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { name: 'طلا', color: '#fbbf24' },
                    { name: 'مس', color: '#b45309' },
                    { name: 'نقره براق', color: '#cbd5e1' },
                    { name: 'برنج نئون', color: '#06b6d4' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      onClick={() => handleAryaChange('keyFinish', c.color)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        settings.arya.keyFinish === c.color ? 'scale-125 border-white shadow-lg' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5">
                  {lang === 'fa' ? 'گوهر درخشان کوک:' : 'Clockwork Gem Glow:'}
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { name: 'آبی آسمانی', color: '#38bdf8' },
                    { name: 'بنفش کهکشانی', color: '#a855f7' },
                    { name: 'سبز زمردی', color: '#10b981' },
                    { name: 'طلایی', color: '#f59e0b' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      onClick={() => handleAryaChange('heartColor', c.color)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        settings.arya.heartColor === c.color ? 'scale-125 border-white shadow-lg' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Room & Atmospheric Environment */}
          <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30">
            <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
              🏚️ {lang === 'fa' ? 'تم و محیط ۳D اتاق کارگاه' : 'Room Environment & Atmosphere'}
            </h3>

            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              {[
                { id: 'WORKSHOP', labelFa: 'کارگاه گرم چوبی', labelEn: 'Warm Workshop', descFa: 'نور شمع و چوب گرم' },
                { id: 'CANDLELIGHT', labelFa: 'شب رمانتیک شمع', labelEn: 'Romantic Candlelight', descFa: 'سایه‌های ملایم و قلبی' },
                { id: 'TWILIGHT', labelFa: 'جادوی غروب بنفش', labelEn: 'Twilight Magic', descFa: 'اتاق با نور غروب' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleRoomChange('theme', t.id as any)}
                  className={`p-3 rounded-xl border text-right transition-all ${
                    settings.room.theme === t.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold text-xs mb-1">
                    {lang === 'fa' ? t.labelFa : t.labelEn}
                  </div>
                  <div className="text-[10px] text-slate-400">{t.descFa}</div>
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">
                {lang === 'fa' ? 'جلوه ذرّات معلق در هوا:' : 'Floating Particle Effects:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'SPARKLES', labelFa: '✨ جرقه‌های طلایی', labelEn: 'Gold Sparkles' },
                  { id: 'HEARTS', labelFa: '💖 قلب‌های معلق', labelEn: 'Floating Hearts' },
                  { id: 'GEAR_STEAM', labelFa: '⚙️ بخار و غبار چرخ‌دنده', labelEn: 'Clockwork Dust' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleRoomChange('particles', p.id as any)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                      settings.room.particles === p.id
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {lang === 'fa' ? p.labelFa : p.labelEn}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-rose-500/20 hover:from-rose-400 hover:to-amber-400 transition-all"
          >
            {lang === 'fa' ? 'اعمال و بازگشت به بازی' : 'Apply & Return to Game'}
          </button>
        </div>

      </div>
    </div>
  );
};
