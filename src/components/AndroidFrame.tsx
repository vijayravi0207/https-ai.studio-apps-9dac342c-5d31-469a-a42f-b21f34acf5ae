import React from 'react';
import { Smartphone, Maximize2 } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  isFrameActive: boolean;
  onToggleFrame: () => void;
  lang: 'en' | 'ta';
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  isFrameActive,
  onToggleFrame,
  lang,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start py-0 md:py-4 px-0 md:px-4 font-sans text-slate-100">
      {/* Top Banner / Device Controls */}
      <aside aria-label="Device Controls" className="w-full max-w-5xl hidden md:flex items-center justify-between pb-3 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-slate-200">IS 10262:2019 & IS 456:2000 Certified Mix Engine</span>
          <span className="text-slate-600">|</span>
          <span>{lang === 'ta' ? 'அண்ட்ராய்டு மொபைல் அனுபவம்' : 'Android App View'}</span>
        </div>

        <button
          onClick={onToggleFrame}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 transition-colors"
          title={isFrameActive ? 'Expand to Full Width' : 'Fit inside Android Phone Frame'}
        >
          {isFrameActive ? (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'ta' ? 'முழுத்திரை பார்வை' : 'Full Screen View'}</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'ta' ? 'மொபைல் சட்டகம்' : 'Phone Frame View'}</span>
            </>
          )}
        </button>
      </aside>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 ${
          isFrameActive
            ? 'max-w-[440px] md:rounded-[44px] md:border-[10px] md:border-slate-800 md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden bg-slate-900 relative ring-1 ring-slate-700/50'
            : 'max-w-6xl rounded-none md:rounded-2xl border-0 md:border md:border-slate-800 bg-slate-900 shadow-2xl'
        }`}
      >
        {/* Android Punch Hole Camera Notch only in Frame Mode */}
        {isFrameActive && (
          <div className="hidden md:flex justify-center pt-2 pb-1 bg-slate-900 select-none">
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-800 ring-2 ring-slate-900/80"></div>
          </div>
        )}

        {/* Child Content */}
        <div className="w-full min-h-[600px] flex flex-col">{children}</div>

        {/* Android Navigation Gesture Bar for Frame Mode */}
        {isFrameActive && (
          <div className="hidden md:flex w-full py-2.5 items-center justify-center bg-slate-950 border-t border-slate-800/60">
            <div className="w-32 h-1 bg-slate-500 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

