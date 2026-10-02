import React, { useState, useEffect } from 'react';
import { Language } from '../utils/translations';
import { Play, RotateCcw, Activity, Droplets, Info } from 'lucide-react';
import { SlumpFlowClass } from './SccDesignTab';

interface SccFlowGraphicProps {
  flowClass: SlumpFlowClass;
  lang: Language;
}

export const SccFlowGraphic: React.FC<SccFlowGraphicProps> = ({ flowClass, lang }) => {
  // Target diameter based on flowClass
  const targetDiameters: Record<SlumpFlowClass, number> = {
    SF1: 600, // 550 - 650 mm
    SF2: 700, // 660 - 750 mm
    SF3: 800, // 760 - 850 mm
  };

  const targetFlowMm = targetDiameters[flowClass] || 720;
  const [isFlowing, setIsFlowing] = useState<boolean>(false);
  const [flowProgress, setFlowProgress] = useState<number>(1); // default full spread so user sees it right away
  const [elapsedT500, setElapsedT500] = useState<number>(2.4);

  useEffect(() => {
    let animFrame: number;
    if (isFlowing) {
      const startTime = performance.now();
      const duration = 2200; // ms
      const animate = (time: number) => {
        const elapsed = time - startTime;
        const p = Math.min(1, elapsed / duration);
        const easeOut = 1 - Math.pow(1 - p, 2.5);
        setFlowProgress(easeOut);
        setElapsedT500(Number(((elapsed / 1000) * 1.6).toFixed(1)));
        if (p < 1) {
          animFrame = requestAnimationFrame(animate);
        } else {
          setIsFlowing(false);
        }
      };
      animFrame = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animFrame);
  }, [isFlowing]);

  const handleStart = () => {
    setFlowProgress(0);
    setElapsedT500(0);
    setIsFlowing(true);
  };

  const handleReset = () => {
    setIsFlowing(false);
    setFlowProgress(0);
    setElapsedT500(0);
  };

  // Flow classification info
  let classTitle = 'SF3 (760 - 850 mm)';
  let appDesc = 'Heavily reinforced vertical elements, complex shapes, under formwork';
  let tamilDesc = 'அதிக இரும்பு கம்பிகள் கொண்ட தூண்கள், சுவர்கள், கடினமான வடிவங்கள்';
  if (flowClass === 'SF1') {
    classTitle = 'SF1 (550 - 650 mm)';
    appDesc = 'Housing slabs, tunnel lining pumps, small unreinforced sections';
    tamilDesc = 'வீட்டு தளங்கள், சுரங்கப்பாதை பம்பிங், சிறிய கட்டமைப்புகள்';
  } else if (flowClass === 'SF2') {
    classTitle = 'SF2 (660 - 750 mm)';
    appDesc = 'Normal standard applications: walls, columns, beams';
    tamilDesc = 'நிலையான பயன்பாடுகள்: சுவர்கள், தூண்கள், பீம்கள்';
  }

  // Dimensions for 900mm flow table
  // 900 mm corresponds to radius 120px in SVG (260x260 canvas)
  const plateRadiusPx = 118;
  const currentFlowMm = Math.round(targetFlowMm * (0.28 + 0.72 * flowProgress));
  const currentRadiusPx = (currentFlowMm / 900) * plateRadiusPx;
  const t500RadiusPx = (500 / 900) * plateRadiusPx;

  return (
    <div className="bg-gradient-to-b from-slate-900/90 to-slate-950 border border-emerald-500/30 rounded-2xl p-3.5 space-y-3 shadow-md">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Droplets className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-bold text-slate-200">
            {lang === 'ta' ? 'SCC பாய்வு விட்டம் காட்சி வரைபடம் (Slump-Flow Simulation)' : 'SCC Slump-Flow Spread Simulation (IS 1199 Pt 6)'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {classTitle}
          </span>
          <span className="text-xs font-mono font-bold text-emerald-400">
            {currentFlowMm} mm
          </span>
        </div>
      </div>

      {/* Visual Top-Down Flow Table Canvas (SVG) */}
      <div className="relative w-full h-[240px] bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-center p-2 select-none overflow-hidden">
        {/* Stopwatch Badge for T500 */}
        <div className="absolute top-2 left-2 bg-slate-900/90 border border-slate-700/80 rounded-lg px-2.5 py-1 z-20 flex items-center gap-1.5 shadow">
          <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
          <div className="text-[10px] font-mono">
            <span className="text-slate-400">T500 Time: </span>
            <span className="text-cyan-300 font-bold">{elapsedT500}s</span>
            <span className="text-[8.5px] text-slate-500 ml-1">(Req: 2-5s)</span>
          </div>
        </div>

        {/* Concentric Guide Rings SVG */}
        <svg className="w-[240px] h-[240px] z-10" viewBox="0 0 240 240">
          <defs>
            <radialGradient id="sccConcreteSpread" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#78716c" />
              <stop offset="60%" stopColor="#57534e" />
              <stop offset="90%" stopColor="#44403c" />
              <stop offset="100%" stopColor="#292524" />
            </radialGradient>
            <pattern id="sccPebbles" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.3" fill="#a8a29e" opacity="0.7" />
              <circle cx="8" cy="8" r="1.8" fill="#1c1917" opacity="0.9" />
              <circle cx="9" cy="2" r="1.1" fill="#e7e5e4" opacity="0.5" />
            </pattern>
          </defs>

          {/* Base plate steel table (900mm dia = 236px) */}
          <circle cx="120" cy="120" r="116" fill="#1e293b" stroke="#475569" strokeWidth="2.5" />

          {/* Cross hair marks */}
          <line x1="120" y1="8" x2="120" y2="232" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="8" y1="120" x2="232" y2="120" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />

          {/* 500mm T500 Circle Reference */}
          <circle
            cx="120"
            cy="120"
            r={t500RadiusPx}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="1.2"
            strokeDasharray="4 2"
          />
          <text x="120" y={120 - t500RadiusPx - 3} fill="#38bdf8" fontSize="8" fontFamily="monospace" textAnchor="middle">
            500 mm (T500 Circle)
          </text>

          {/* Target class circle reference */}
          <circle
            cx="120"
            cy="120"
            r={(targetFlowMm / 900) * plateRadiusPx}
            fill="none"
            stroke="#10b981"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.6"
          />

          {/* Flowing Fresh SCC Concrete Puddle */}
          <circle
            cx="120"
            cy="120"
            r={currentRadiusPx}
            fill="url(#sccConcreteSpread)"
            stroke="#1c1917"
            strokeWidth="1.5"
            className="transition-all"
          />
          <circle
            cx="120"
            cy="120"
            r={currentRadiusPx}
            fill="url(#sccPebbles)"
            className="transition-all"
          />

          {/* Center initial cone footprint */}
          <circle
            cx="120"
            cy="120"
            r={24}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <text x="120" y="123" fill="#fef08a" fontSize="7" fontFamily="monospace" textAnchor="middle">
            Cone Base (200mm)
          </text>

          {/* Flow Spread Diameter Dimension Line */}
          {flowProgress > 0.4 && (
            <g>
              <line
                x1={120 - currentRadiusPx}
                y1="120"
                x2={120 + currentRadiusPx}
                y2="120"
                stroke="#10b981"
                strokeWidth="1.8"
              />
              <circle cx={120 - currentRadiusPx} cy="120" r="2.5" fill="#10b981" />
              <circle cx={120 + currentRadiusPx} cy="120" r="2.5" fill="#10b981" />
              <rect
                x="92"
                y="98"
                width="56"
                height="16"
                rx="3"
                fill="#0f172a"
                stroke="#10b981"
                strokeWidth="1"
              />
              <text
                x="120"
                y="109"
                fill="#a7f3d0"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                Ø {currentFlowMm} mm
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Description & Controls */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <p className="text-[10.5px] text-slate-300 truncate">
            {lang === 'ta' ? tamilDesc : appDesc}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleStart}
            disabled={isFlowing}
            className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-3 h-3 fill-slate-950" />
            <span>{lang === 'ta' ? 'பாய்வு செய்' : 'Start Flow'}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={lang === 'ta' ? 'மீட்டமை' : 'Reset'}
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
