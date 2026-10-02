import React, { useState, useEffect } from 'react';
import { Language } from '../utils/translations';
import { Play, RotateCcw, Info, Activity } from 'lucide-react';

interface SlumpConeGraphicProps {
  slumpMm: number;
  lang: Language;
}

export const SlumpConeGraphic: React.FC<SlumpConeGraphicProps> = ({ slumpMm, lang }) => {
  const [isLifting, setIsLifting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(1); // default to dropped state to show the result immediately

  // Slump animation
  useEffect(() => {
    let animFrame: number;
    if (isLifting) {
      const startTime = performance.now();
      const duration = 1600; // ms
      const animate = (time: number) => {
        const elapsed = time - startTime;
        const p = Math.min(1, elapsed / duration);
        const easeOut = 1 - Math.pow(1 - p, 3);
        setProgress(easeOut);
        if (p < 1) {
          animFrame = requestAnimationFrame(animate);
        } else {
          setIsLifting(false);
        }
      };
      animFrame = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animFrame);
  }, [isLifting]);

  const handleStart = () => {
    setProgress(0);
    setIsLifting(true);
  };

  const handleReset = () => {
    setIsLifting(false);
    setProgress(0);
  };

  // Graphical calculations
  const coneHeightPx = 160; // represents 300 mm cone in SVG
  const maxSlumpPx = (slumpMm / 300) * (coneHeightPx * 0.8);
  const currentSlumpMm = Math.round(slumpMm * progress);
  const currentConeLiftY = progress * -80; // moves up by 80px
  const currentConcreteDropY = progress * maxSlumpPx;

  // Slump classification
  let slumpType = lang === 'ta' ? 'உண்மையான சாய்வு (True Slump)' : 'True Slump';
  let slumpTypeColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  if (slumpMm > 150) {
    slumpType = lang === 'ta' ? 'அதிக பாய்வு சாய்வு (High / Flowable Slump)' : 'High / Flowable Slump';
    slumpTypeColor = 'text-blue-400 border-blue-500/30 bg-blue-500/10';
  } else if (slumpMm < 35) {
    slumpType = lang === 'ta' ? 'மிகக் குறைந்த சாய்வு (Very Low / Stiff Concrete)' : 'Very Low / Stiff Concrete';
    slumpTypeColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
  }

  // IS 456 application suitability
  let appText = '';
  if (slumpMm <= 35) {
    appText = lang === 'ta' ? 'சாலை தளங்கள், தடுப்புச் சுவர்கள் (Paver roads & shallow sections)' : 'Pavement concrete using pavers, shallow blinding slabs';
  } else if (slumpMm <= 75) {
    appText = lang === 'ta' ? 'நிலையான கான்கிரீட்: சாதாரண தளம், தூண்கள் (Mass concrete, light slabs & beams)' : 'Normal slabs, lightly reinforced beams, columns & canal lining';
  } else if (slumpMm <= 125) {
    appText = lang === 'ta' ? 'பம்பிங் கான்கிரீட், நெருக்கமான கம்பிகள் (Pumpable concrete, heavily reinforced)' : 'Pumpable concrete, heavily reinforced beams, flat slabs';
  } else {
    appText = lang === 'ta' ? 'டிரெமி நீருக்கடி, ஆழ்துளை பைலிங் (Tremie concrete under water & piling)' : 'Tremie concrete for underwater pouring & deep bored piles';
  }

  return (
    <div className="mt-3 bg-gradient-to-b from-slate-900/90 to-slate-950 border border-amber-500/30 rounded-2xl p-3.5 space-y-3 shadow-md">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold text-slate-200">
            {lang === 'ta' ? 'அப்ராம்ஸ் கூம்பு காட்சி வரைபடம் (Slump Cone Visualizer)' : 'Abrams Slump Cone Visualizer'}
          </span>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${slumpTypeColor}`}>
          {slumpType}
        </span>
      </div>

      {/* Interactive Graphic Canvas (SVG) */}
      <div className="relative w-full h-[220px] bg-slate-950/80 rounded-xl border border-slate-800 overflow-hidden flex items-end justify-center pb-3 select-none">
        {/* Background Measurement Ruler */}
        <div className="absolute right-3 top-4 bottom-5 w-14 border-l border-slate-800 flex flex-col justify-between text-[8.5px] font-mono text-slate-500 pl-1.5">
          <div className="flex items-center gap-1 text-amber-400 font-bold">
            <span className="w-2 h-0.5 bg-amber-400"></span>
            <span>300 mm</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-0.5 bg-slate-700"></span>
            <span>200 mm</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-0.5 bg-slate-700"></span>
            <span>100 mm</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 font-bold">
            <span className="w-2 h-0.5 bg-slate-400"></span>
            <span>0 mm</span>
          </div>
        </div>

        {/* Base Plate */}
        <div className="absolute bottom-3 w-[240px] h-2.5 bg-slate-700 rounded shadow border-t border-slate-600"></div>

        {/* SVG Container */}
        <svg className="w-[260px] h-[200px] z-10 overflow-visible" viewBox="0 0 260 200">
          <defs>
            <linearGradient id="coneConcreteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#78716c" />
              <stop offset="50%" stopColor="#57534e" />
              <stop offset="100%" stopColor="#44403c" />
            </linearGradient>
            <pattern id="conePebbles" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="2.5" cy="2.5" r="1.2" fill="#a8a29e" opacity="0.6" />
              <circle cx="7" cy="7" r="1.6" fill="#292524" opacity="0.8" />
              <circle cx="8" cy="2" r="1" fill="#d6d3d1" opacity="0.4" />
            </pattern>
          </defs>

          {/* Slumping Concrete Mass */}
          {(() => {
            const baseY = 185;
            const origTopY = baseY - 135; // 300mm level in canvas
            const droppedTopY = origTopY + currentConcreteDropY;
            const topHalfWidth = 24 + currentConcreteDropY * 0.28;
            const bottomHalfWidth = 48 + currentConcreteDropY * 0.16;
            const cx = 130;

            return (
              <g>
                <path
                  d={`
                    M ${cx - topHalfWidth} ${droppedTopY}
                    Q ${cx} ${droppedTopY - 2} ${cx + topHalfWidth} ${droppedTopY}
                    C ${cx + topHalfWidth + 8} ${droppedTopY + 25} ${cx + bottomHalfWidth + 5} ${baseY - 8} ${cx + bottomHalfWidth} ${baseY}
                    L ${cx - bottomHalfWidth} ${baseY}
                    C ${cx - bottomHalfWidth - 5} ${baseY - 8} ${cx - topHalfWidth - 8} ${droppedTopY + 25} ${cx - topHalfWidth} ${droppedTopY}
                    Z
                  `}
                  fill="url(#coneConcreteGrad)"
                  stroke="#292524"
                  strokeWidth="1.5"
                />
                <path
                  d={`
                    M ${cx - topHalfWidth} ${droppedTopY}
                    Q ${cx} ${droppedTopY - 2} ${cx + topHalfWidth} ${droppedTopY}
                    C ${cx + topHalfWidth + 8} ${droppedTopY + 25} ${cx + bottomHalfWidth + 5} ${baseY - 8} ${cx + bottomHalfWidth} ${baseY}
                    L ${cx - bottomHalfWidth} ${baseY}
                    C ${cx - bottomHalfWidth - 5} ${baseY - 8} ${cx - topHalfWidth - 8} ${droppedTopY + 25} ${cx - topHalfWidth} ${droppedTopY}
                    Z
                  `}
                  fill="url(#conePebbles)"
                />
              </g>
            );
          })()}

          {/* Steel Abrams Slump Cone (Lifting Animation) */}
          <g
            transform={`translate(0, ${currentConeLiftY})`}
            opacity={progress > 0 ? 1 - progress * 0.35 : 1}
            className="transition-transform"
          >
            <polygon
              points="106,50 154,50 178,185 82,185"
              fill="#64748b"
              stroke="#94a3b8"
              strokeWidth="2"
              fillOpacity="0.85"
            />
            {/* Handles */}
            <path d="M 82,110 L 70,110 L 70,126 L 86,126" fill="none" stroke="#cbd5e1" strokeWidth="2.5" />
            <path d="M 178,110 L 190,110 L 190,126 L 174,126" fill="none" stroke="#cbd5e1" strokeWidth="2.5" />
            {/* Top rim */}
            <ellipse cx="130" cy="50" rx="24" ry="5" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Base feet */}
            <rect x="74" y="183" width="14" height="3" fill="#334155" rx="1" />
            <rect x="172" y="183" width="14" height="3" fill="#334155" rx="1" />
          </g>

          {/* Measurement Tamping Rod & Drop Line */}
          {progress > 0.3 && (
            <g>
              {/* Tamping Rod */}
              <rect x="60" y="47" width="140" height="4" fill="#f59e0b" rx="2" />
              {/* Vertical measurement line */}
              <line
                x1="130"
                y1="50"
                x2="130"
                y2={50 + currentConcreteDropY}
                stroke="#ef4444"
                strokeWidth="2"
                strokeDasharray="3 2"
              />
              <circle cx="130" cy={50 + currentConcreteDropY} r="3" fill="#ef4444" />
              {/* Slump Readout Badge */}
              <rect
                x="142"
                y={42 + currentConcreteDropY / 2}
                width="64"
                height="18"
                rx="4"
                fill="#0f172a"
                stroke="#f59e0b"
                strokeWidth="1.2"
              />
              <text
                x="174"
                y={55 + currentConcreteDropY / 2}
                fill="#fef08a"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                {currentSlumpMm} mm
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Controls & Application Description */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <p className="text-[10.5px] text-slate-300 truncate">
            {appText}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleStart}
            disabled={isLifting}
            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-3 h-3 fill-slate-950" />
            <span>{lang === 'ta' ? 'கூம்பு தூக்கு' : 'Lift Cone'}</span>
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
