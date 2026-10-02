import React from 'react';
import { HardHat, FileDown, Languages, Download } from 'lucide-react';
import { TRANSLATIONS, Language } from '../utils/translations';

interface TopAppBarProps {
  lang: Language;
  onToggleLang: () => void;
  onOpenReport: () => void;
  onOpenApkModal: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  lang,
  onToggleLang,
  onOpenReport,
  onOpenApkModal,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 md:px-4 py-3 flex items-center justify-between">
      {/* Brand & Codes */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
          <HardHat className="w-5 h-5 text-slate-950 stroke-[2.2]" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xs sm:text-sm md:text-base font-bold text-white truncate flex items-center gap-1.5">
            <span>{t.appTitle}</span>
            <span className="text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 py-0.2 rounded">
              v2019
            </span>
          </h1>
          <div className="flex items-center gap-1 text-[10px] md:text-[10.5px] text-slate-400 font-mono">
            <span>IS 10262:2019</span>
            <span>·</span>
            <span>IS 456</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* APK Download Button */}
        <button
          onClick={onOpenApkModal}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          title="Download APK / Install on Android"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>APK</span>
        </button>

        {/* Language Toggle */}
        <button
          onClick={onToggleLang}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          title="Switch Language / மொழி மாற்று"
        >
          <Languages className="w-3.5 h-3.5 text-blue-400" />
          <span>{lang === 'en' ? 'தமிழ்' : 'EN'}</span>
        </button>

        {/* Export / Print Report */}
        <button
          onClick={onOpenReport}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
          title="Generate Official IS 10262 Calculation Report"
        >
          <FileDown className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">{lang === 'ta' ? 'அறிக்கை' : 'Report'}</span>
        </button>
      </div>
    </header>
  );
};


