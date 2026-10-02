import React, { useState, useEffect } from 'react';
import { TRANSLATIONS, Language } from '../utils/translations';
import { Play, RotateCcw, Activity, Droplets, Info, Sparkles, Compass } from 'lucide-react';

interface WorkabilityAnimationLabProps {
  lang: Language;
}

export const WorkabilityAnimationLab: React.FC<WorkabilityAnimationLabProps> = ({ lang }) => {
  const [activeTest, setActiveTest] = useState<'slump' | 'flow' | 'lbox' | 'vfunnel'>('slump');

  // Slump Cone State
  const [targetSlumpMm, setTargetSlumpMm] = useState<number>(100);
  const [isSlumpLifting, setIsSlumpLifting] = useState<boolean>(false);
  const [slumpProgress, setSlumpProgress] = useState<number>(0); // 0 to 1

  // Slump Flow State
  const [targetFlowMm, setTargetFlowMm] = useState<number>(720); // 550 to 850 mm
  const [isFlowing, setIsFlowing] = useState<boolean>(false);
  const [flowProgress, setFlowProgress] = useState<number>(0); // 0 to 1
  const [elapsedT500, setElapsedT500] = useState<number>(0);

  // L-box State
  const [lboxPassingRatio, setLboxPassingRatio] = useState<number>(0.9);
  const [isLboxFlowing, setIsLboxFlowing] = useState<boolean>(false);
  const [lboxProgress, setLboxProgress] = useState<number>(0);

  // Slump Cone Animation loop
  useEffect(() => {
    let animFrame: number;
    if (isSlumpLifting) {
      const startTime = performance.now();
      const duration = 1800; // ms
      const animate = (time: number) => {
        const elapsed = time - startTime;
        const p = Math.min(1, elapsed / duration);
        // smooth easing
        const easeOut = 1 - Math.pow(1 - p, 3);
        setSlumpProgress(easeOut);
        if (p < 1) {
          animFrame = requestAnimationFrame(animate);
        } else {
          setIsSlumpLifting(false);
        }
      };
      animFrame = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animFrame);
  }, [isSlumpLifting]);

  // Slump Flow Animation loop
  useEffect(() => {
    let animFrame: number;
    if (isFlowing) {
      const startTime = performance.now();
      const duration = 2400; // ms
      const animate = (time: number) => {
        const elapsed = time - startTime;
        const p = Math.min(1, elapsed / duration);
        const easeOut = 1 - Math.pow(1 - p, 2.5);
        setFlowProgress(easeOut);
        setElapsedT500(Number(((elapsed / 1000) * 1.5).toFixed(1)));
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

  // L-Box Animation loop
  useEffect(() => {
    let animFrame: number;
    if (isLboxFlowing) {
      const startTime = performance.now();
      const duration = 2000;
      const animate = (time: number) => {
        const elapsed = time - startTime;
        const p = Math.min(1, elapsed / duration);
        const easeOut = 1 - Math.pow(1 - p, 2);
        setLboxProgress(easeOut);
        if (p < 1) {
          animFrame = requestAnimationFrame(animate);
        } else {
          setIsLboxFlowing(false);
        }
      };
      animFrame = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animFrame);
  }, [isLboxFlowing]);

  // Reset helpers
  const handleResetSlump = () => {
    setIsSlumpLifting(false);
    setSlumpProgress(0);
  };

  const handleStartSlump = () => {
    setSlumpProgress(0);
    setIsSlumpLifting(true);
  };

  const handleResetFlow = () => {
    setIsFlowing(false);
    setFlowProgress(0);
    setElapsedT500(0);
  };

  const handleStartFlow = () => {
    setFlowProgress(0);
    setElapsedT500(0);
    setIsFlowing(true);
  };

  // Slump details calculation
  const coneHeightPx = 180; // represents 300 mm cone
  const maxSlumpPx = (targetSlumpMm / 300) * (coneHeightPx * 0.75);
  const currentSlumpMm = Math.round(targetSlumpMm * slumpProgress);
  const currentConeLiftY = slumpProgress * -85; // moves up by 85px
  const currentConcreteDropY = slumpProgress * maxSlumpPx;

  // Slump classification
  let slumpType = 'True Slump';
  let slumpTypeColor = 'text-emerald-400';
  if (targetSlumpMm > 150) {
    slumpType = 'High / Flowable Slump';
    slumpTypeColor = 'text-blue-400';
  } else if (targetSlumpMm < 25) {
    slumpType = 'Very Low / Stiff Concrete';
    slumpTypeColor = 'text-amber-400';
  }

  // SCC Flow classification (IS 10262 Clause 7.2.1)
  let flowClass = 'SF1 (550 - 650 mm)';
  let flowAppDesc = 'Housing slabs, tunnel lining pumps, small unreinforced sections';
  let tamilFlowDesc = 'வீட்டு தளங்கள், சுரங்கப்பாதை பம்பிங், சிறிய கட்டமைப்புகள்';
  if (targetFlowMm >= 760) {
    flowClass = 'SF3 (760 - 850 mm)';
    flowAppDesc = 'Heavily reinforced vertical elements, complex shapes, under formwork';
    tamilFlowDesc = 'அதிக இரும்பு கம்பிகள் கொண்ட செங்குத்து தூண்கள், சுவர்கள், கடினமான வடிவங்கள்';
  } else if (targetFlowMm >= 660) {
    flowClass = 'SF2 (660 - 750 mm)';
    flowAppDesc = 'Normal standard applications: walls, columns, beams';
    tamilFlowDesc = 'நிலையான பயன்பாடுகள்: சுவர்கள், தூண்கள், பீம்கள்';
  }

  const currentFlowMm = Math.round(targetFlowMm * (0.3 + 0.7 * flowProgress));
  const plateRadiusPx = 140; // represents 900mm table
  const spreadRadiusPx = (currentFlowMm / 900) * plateRadiusPx;

  return (
    <div className="p-3 md:p-6 space-y-5 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl p-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm md:text-base">
          <Activity className="w-5 h-5" />
          <span>
            {lang === 'ta'
              ? 'சரிவு & பாய்வு அனிமேஷன் ஆய்வகம் (Slump & Flow Visual Lab)'
              : 'Workability Animation & Physics Lab'}
          </span>
        </div>
        <p className="text-xs text-slate-300 mt-1">
          {lang === 'ta'
            ? 'அப்ராம்ஸ் கூம்பு சரிவு சோதனை & SCC பாய்வு வட்ட அனிமேஷன் (IS 1199 & IS 10262).'
            : 'Interactive Abram\'s Slump Cone Lift & SCC Radial Slump-Flow Spread Simulation.'}
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-slate-800/60 p-1.5 rounded-2xl border border-slate-700/60 text-xs font-semibold">
        <button
          onClick={() => setActiveTest('slump')}
          className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTest === 'slump'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>{lang === 'ta' ? 'அப்ராம்ஸ் கூம்பு (Slump)' : 'Abram\'s Slump'}</span>
        </button>

        <button
          onClick={() => setActiveTest('flow')}
          className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTest === 'flow'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Droplets className="w-4 h-4" />
          <span>{lang === 'ta' ? 'SCC பாய்வு (Slump-Flow)' : 'SCC Slump-Flow'}</span>
        </button>

        <button
          onClick={() => setActiveTest('lbox')}
          className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTest === 'lbox'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{lang === 'ta' ? 'L-பாக்ஸ் (L-Box Test)' : 'L-Box Passing'}</span>
        </button>
      </div>

      {/* TEST 1: ABRAM'S SLUMP CONE SIMULATION */}
      {activeTest === 'slump' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{lang === 'ta' ? 'அப்ராம்ஸ் கூம்பு சரிவு சோதனை (IS 1199)' : 'Abram\'s Slump Cone Test (IS 1199)'}</span>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 ${slumpTypeColor}`}>
                  {slumpType}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Standard Mold: Top 100mm, Bottom 200mm, Height 300mm
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">{lang === 'ta' ? 'அளவிடப்பட்ட சரிவு' : 'Measured Slump'}</span>
              <span className="text-xl md:text-2xl font-black font-mono text-amber-400">
                {currentSlumpMm} <span className="text-xs text-slate-400 font-normal">mm</span>
              </span>
            </div>
          </div>

          {/* Slump Slider Control */}
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="slump-target-slider" className="text-slate-300 font-medium">
                {lang === 'ta' ? 'தேவையான சரிவு மதிப்பை அமைக்கவும் (Target Slump):' : 'Adjust Slump Value:'}
              </label>
              <span className="font-mono text-amber-400 font-bold text-sm">{targetSlumpMm} mm</span>
            </div>
            <input
              id="slump-target-slider"
              type="range"
              min="10"
              max="180"
              step="5"
              value={targetSlumpMm}
              disabled={isSlumpLifting}
              onChange={(e) => {
                setTargetSlumpMm(Number(e.target.value));
                setSlumpProgress(0);
              }}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>25 mm (Roads)</span>
              <span>75 mm (Beams/Slabs)</span>
              <span>120 mm (Pump)</span>
              <span>160 mm (Tremie)</span>
            </div>
          </div>

          {/* Interactive Graphic Canvas (SVG) */}
          <div className="relative w-full h-[280px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-end justify-center pb-4 select-none">
            {/* Background Grid & Measurement Ruler */}
            <div className="absolute right-4 top-8 bottom-6 w-16 border-l border-slate-700/80 flex flex-col justify-between text-[9px] font-mono text-slate-500 pl-1.5">
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <span className="w-2 h-0.5 bg-amber-400"></span>
                <span>300 mm</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-0.5 bg-slate-600"></span>
                <span>200 mm</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-0.5 bg-slate-600"></span>
                <span>100 mm</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400 font-bold">
                <span className="w-2 h-0.5 bg-slate-400"></span>
                <span>0 mm (Base)</span>
              </div>
            </div>

            {/* Base Plate */}
            <div className="absolute bottom-4 w-[280px] h-3 bg-slate-700 rounded-sm shadow-lg border-t border-slate-600"></div>

            {/* SVG Graphics Container */}
            <svg
              className="w-[280px] h-[240px] z-10 overflow-visible"
              viewBox="0 0 280 240"
            >
              {/* Slumped Concrete Mass (Morphing path based on slump progress) */}
              <defs>
                <linearGradient id="concreteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#78716c" />
                  <stop offset="50%" stopColor="#57534e" />
                  <stop offset="100%" stopColor="#44403c" />
                </linearGradient>
                <pattern id="pebbles" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                  <circle cx="3" cy="3" r="1.5" fill="#a8a29e" opacity="0.6" />
                  <circle cx="8" cy="8" r="2" fill="#292524" opacity="0.8" />
                  <circle cx="9" cy="2" r="1.2" fill="#d6d3d1" opacity="0.4" />
                </pattern>
              </defs>

              {/* Slumping Concrete Geometry */}
              {(() => {
                const baseY = 220;
                const origTopY = baseY - 160; // 300mm mark in canvas
                const droppedTopY = origTopY + currentConcreteDropY;
                const topHalfWidth = 28 + (currentConcreteDropY * 0.28);
                const bottomHalfWidth = 56 + (currentConcreteDropY * 0.15);
                const cx = 140;

                return (
                  <g>
                    {/* Concrete Puddle Body */}
                    <path
                      d={`
                        M ${cx - topHalfWidth} ${droppedTopY}
                        Q ${cx} ${droppedTopY - 2} ${cx + topHalfWidth} ${droppedTopY}
                        C ${cx + topHalfWidth + 10} ${droppedTopY + 30} ${cx + bottomHalfWidth + 6} ${baseY - 10} ${cx + bottomHalfWidth} ${baseY}
                        L ${cx - bottomHalfWidth} ${baseY}
                        C ${cx - bottomHalfWidth - 6} ${baseY - 10} ${cx - topHalfWidth - 10} ${droppedTopY + 30} ${cx - topHalfWidth} ${droppedTopY}
                        Z
                      `}
                      fill="url(#concreteGrad)"
                      stroke="#292524"
                      strokeWidth="2"
                    />
                    {/* Aggregate Texture Overlay */}
                    <path
                      d={`
                        M ${cx - topHalfWidth} ${droppedTopY}
                        Q ${cx} ${droppedTopY - 2} ${cx + topHalfWidth} ${droppedTopY}
                        C ${cx + topHalfWidth + 10} ${droppedTopY + 30} ${cx + bottomHalfWidth + 6} ${baseY - 10} ${cx + bottomHalfWidth} ${baseY}
                        L ${cx - bottomHalfWidth} ${baseY}
                        C ${cx - bottomHalfWidth - 6} ${baseY - 10} ${cx - topHalfWidth - 10} ${droppedTopY + 30} ${cx - topHalfWidth} ${droppedTopY}
                        Z
                      `}
                      fill="url(#pebbles)"
                    />
                  </g>
                );
              })()}

              {/* Steel Slump Cone (Moves upward when lifted) */}
              <g
                transform={`translate(0, ${currentConeLiftY})`}
                opacity={slumpProgress > 0 ? (1 - slumpProgress * 0.3) : 1}
                className="transition-transform"
              >
                {/* Cone body */}
                <polygon
                  points="112,60 168,60 196,220 84,220"
                  fill="#64748b"
                  stroke="#94a3b8"
                  strokeWidth="2.5"
                  fillOpacity="0.85"
                />
                {/* Cone handles */}
                <path d="M 84,130 L 70,130 L 70,150 L 88,150" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                <path d="M 196,130 L 210,130 L 210,150 L 192,150" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                {/* Top rim */}
                <ellipse cx="140" cy="60" rx="28" ry="6" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
                {/* Bottom foot pieces */}
                <rect x="74" y="218" width="16" height="4" fill="#334155" rx="1" />
                <rect x="190" y="218" width="16" height="4" fill="#334155" rx="1" />
              </g>

              {/* Measurement Tamping Rod & Drop Line (Shown after lifting) */}
              {slumpProgress > 0.4 && (
                <g>
                  {/* Horizontal Tamping Rod placed over top of cone level */}
                  <rect x="60" y="56" width="160" height="5" fill="#f59e0b" rx="2.5" />
                  {/* Vertical measurement ruler dropping to concrete top */}
                  <line
                    x1="140"
                    y1="60"
                    x2="140"
                    y2={60 + currentConcreteDropY}
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                  />
                  {/* Ruler tip indicator */}
                  <circle cx="140" cy={60 + currentConcreteDropY} r="4" fill="#ef4444" />
                  {/* Floating Slump readout badge */}
                  <rect
                    x="150"
                    y={50 + currentConcreteDropY / 2}
                    width="68"
                    height="20"
                    rx="4"
                    fill="#1e293b"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                  />
                  <text
                    x="184"
                    y={64 + currentConcreteDropY / 2}
                    fill="#fef08a"
                    fontSize="11"
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

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleStartSlump}
              disabled={isSlumpLifting}
              className="flex-1 h-11 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>{lang === 'ta' ? 'கூம்பை மேலே தூக்கு (Lift Cone)' : 'Lift Abram\'s Cone'}</span>
            </button>
            <button
              onClick={handleResetSlump}
              className="px-4 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center gap-1 border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'ta' ? 'மீட்டமை' : 'Reset'}</span>
            </button>
          </div>

          {/* IS 456 Placing Suitability Table Reference */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <Info className="w-3.5 h-3.5" />
              <span>{lang === 'ta' ? 'பொருத்தமான கட்டுமான பயன்பாடு (IS 456 Clause 7.1):' : 'Application Suitability (IS 456 Cl. 7.1):'}</span>
            </div>
            <p className="font-mono text-slate-200">
              {targetSlumpMm <= 25 && '• Pavements using pavers, shallow sections, blinding concrete (Very Low workability)'}
              {targetSlumpMm > 25 && targetSlumpMm <= 75 && '• Mass concrete, lightly reinforced slabs, beams, columns, canal lining (Low workability: 25–75 mm)'}
              {targetSlumpMm > 75 && targetSlumpMm <= 100 && '• Heavily reinforced beams, slabs, slipform work (Medium workability: 50–100 mm)'}
              {targetSlumpMm > 100 && targetSlumpMm <= 150 && '• Pumped concrete, trench fill, in-situ piling (High workability: 100–150 mm)'}
              {targetSlumpMm > 150 && '• Tremie concrete under water (Very High workability > 150 mm)'}
            </p>
          </div>
        </div>
      )}

      {/* TEST 2: SCC SLUMP-FLOW SPREAD SIMULATION */}
      {activeTest === 'flow' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{lang === 'ta' ? 'SCC பாய்வு விட்டம் சோதனை (IS 1199 Part 6)' : 'SCC Slump-Flow Spread Test (IS 1199 Part 6)'}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {flowClass}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {lang === 'ta' ? tamilFlowDesc : flowAppDesc}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">{lang === 'ta' ? 'பாய்வு விட்டம் (Flow Dia)' : 'Flow Spread'}</span>
              <span className="text-xl md:text-2xl font-black font-mono text-emerald-400">
                {currentFlowMm} <span className="text-xs text-slate-400 font-normal">mm</span>
              </span>
            </div>
          </div>

          {/* Flow Target Slider */}
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="flow-target-slider" className="text-slate-300 font-medium">
                {lang === 'ta' ? 'பாய்வு விட்டம் தேர்வு (Target Flow Diameter):' : 'Select Target Flow Spread:'}
              </label>
              <span className="font-mono text-emerald-400 font-bold text-sm">{targetFlowMm} mm</span>
            </div>
            <input
              id="flow-target-slider"
              type="range"
              min="550"
              max="850"
              step="10"
              value={targetFlowMm}
              disabled={isFlowing}
              onChange={(e) => {
                setTargetFlowMm(Number(e.target.value));
                setFlowProgress(0);
              }}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>SF1: 550–650 mm</span>
              <span>SF2: 660–750 mm</span>
              <span>SF3: 760–850 mm</span>
            </div>
          </div>

          {/* Visual Top-Down Flow Table Canvas */}
          <div className="relative w-full h-[300px] bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center p-2 select-none overflow-hidden">
            {/* Concentric Guide Rings SVG */}
            <svg className="w-[280px] h-[280px]" viewBox="0 0 280 280">
              {/* Base plate steel table (900mm dia = 280px) */}
              <circle cx="140" cy="140" r="135" fill="#1e293b" stroke="#475569" strokeWidth="3" />
              {/* Cross hair marks */}
              <line x1="140" y1="10" x2="140" y2="270" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="10" y1="140" x2="270" y2="140" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />

              {/* 500mm T500 Circle Reference */}
              <circle cx="140" cy="140" r={(500 / 900) * 135} fill="none" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="4 2" />
              <text x="140" y={140 - (500 / 900) * 135 - 3} fill="#38bdf8" fontSize="8" fontFamily="monospace" textAnchor="middle">
                T500 Circle (500mm)
              </text>

              {/* SF1 Circle (650mm) */}
              <circle cx="140" cy="140" r={(650 / 900) * 135} fill="none" stroke="#eab308" strokeWidth="1" opacity="0.6" />
              <text x="140" y={140 - (650 / 900) * 135 - 2} fill="#eab308" fontSize="7.5" fontFamily="monospace" textAnchor="middle">
                SF1 (650mm)
              </text>

              {/* SF2 Circle (750mm) */}
              <circle cx="140" cy="140" r={(750 / 900) * 135} fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.6" />
              <text x="140" y={140 - (750 / 900) * 135 - 2} fill="#22c55e" fontSize="7.5" fontFamily="monospace" textAnchor="middle">
                SF2 (750mm)
              </text>

              {/* Spreading Fluid Concrete Circle */}
              <circle
                cx="140"
                cy="140"
                r={spreadRadiusPx}
                fill="url(#concreteGrad)"
                stroke="#d97706"
                strokeWidth="2"
                opacity="0.9"
              />
              <circle
                cx="140"
                cy="140"
                r={spreadRadiusPx}
                fill="url(#pebbles)"
                opacity="0.7"
              />

              {/* Initial Cone circle (200mm base) */}
              <circle
                cx="140"
                cy="140"
                r={(200 / 900) * 135}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
                opacity={flowProgress < 0.2 ? 1 : 0.2}
              />

              {/* Caliper / Diameter Measuring Arrows when finished */}
              {flowProgress > 0.6 && (
                <g>
                  {/* Horizontal measurement arrow */}
                  <line
                    x1={140 - spreadRadiusPx}
                    y1="140"
                    x2={140 + spreadRadiusPx}
                    y2="140"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <polygon points={`${140 - spreadRadiusPx},140 ${140 - spreadRadiusPx + 6},137 ${140 - spreadRadiusPx + 6},143`} fill="#ffffff" />
                  <polygon points={`${140 + spreadRadiusPx},140 ${140 + spreadRadiusPx - 6},137 ${140 + spreadRadiusPx - 6},143`} fill="#ffffff" />

                  {/* Flow Diameter Badge */}
                  <rect
                    x="100"
                    y="146"
                    width="80"
                    height="22"
                    rx="5"
                    fill="#0f172a"
                    stroke="#10b981"
                    strokeWidth="1.5"
                  />
                  <text
                    x="140"
                    y="161"
                    fill="#34d399"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    Ø {currentFlowMm} mm
                  </text>
                </g>
              )}
            </svg>

            {/* Live T500 Stopwatch floating badge */}
            <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-xl font-mono text-xs">
              <span className="text-[10px] text-slate-400 block font-sans">T500 Time</span>
              <span className="font-bold text-amber-400 text-sm">
                {currentFlowMm >= 500 ? `${(Math.min(elapsedT500, 3.2)).toFixed(1)} s` : 'Waiting...'}
              </span>
            </div>

            {/* Segregation Visual Check Indicator */}
            <div className="absolute bottom-3 right-3 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-xl font-mono text-xs">
              <span className="text-[10px] text-slate-400 block font-sans">Segregation Check</span>
              <span className="font-bold text-emerald-400 text-xs">No Bleed Halo (OK)</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleStartFlow}
              disabled={isFlowing}
              className="flex-1 h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>{lang === 'ta' ? 'பாய்வை தொடங்கு (Release SCC Flow)' : 'Release Slump-Flow'}</span>
            </button>
            <button
              onClick={handleResetFlow}
              className="px-4 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center gap-1 border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'ta' ? 'மீட்டமை' : 'Reset'}</span>
            </button>
          </div>

          {/* SCC Slump-Flow Classes Table Summary */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-2">
            <div className="font-bold text-amber-300">
              IS 10262:2019 Table on Slump Flow Classes (Clause 7.2.1):
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono text-center">
              <div className={`p-2 rounded-lg border ${targetFlowMm <= 650 ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800'}`}>
                <span className="font-bold block text-amber-400">SF1</span>
                <span className="text-[10px] text-slate-400">550 – 650 mm</span>
              </div>
              <div className={`p-2 rounded-lg border ${targetFlowMm > 650 && targetFlowMm <= 750 ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800'}`}>
                <span className="font-bold block text-emerald-400">SF2 (Typical)</span>
                <span className="text-[10px] text-slate-400">660 – 750 mm</span>
              </div>
              <div className={`p-2 rounded-lg border ${targetFlowMm > 750 ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800'}`}>
                <span className="font-bold block text-blue-400">SF3</span>
                <span className="text-[10px] text-slate-400">760 – 850 mm</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TEST 3: L-BOX PASSING ABILITY SIMULATION */}
      {activeTest === 'lbox' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{lang === 'ta' ? 'L-பாக்ஸ் தடை தாண்டும் திறன் (L-Box Passing Ability)' : 'L-Box Passing Ability Test (IS 1199 Part 6)'}</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Evaluates fresh concrete passing through reinforcing rebars without blocking.
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Passing Ratio (h2/h1)</span>
              <span className="text-xl md:text-2xl font-black font-mono text-emerald-400">
                {(0.4 + 0.5 * lboxProgress).toFixed(2)}
              </span>
            </div>
          </div>

          {/* L-box SVG Animation */}
          <div className="relative w-full h-[220px] bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center p-2 select-none overflow-hidden">
            <svg className="w-[300px] h-[190px]" viewBox="0 0 300 190">
              {/* L-Box Outline */}
              <path
                d="M 40,20 L 90,20 L 90,110 L 260,110 L 260,160 L 40,160 Z"
                fill="#1e293b"
                stroke="#64748b"
                strokeWidth="2.5"
              />

              {/* Vertical Gate & 3 Rebar Obstacles at junction */}
              <line x1="90" y1="110" x2="90" y2="160" stroke="#f59e0b" strokeWidth="4" />
              <circle cx="90" cy="120" r="3.5" fill="#f59e0b" />
              <circle cx="90" cy="135" r="3.5" fill="#f59e0b" />
              <circle cx="90" cy="150" r="3.5" fill="#f59e0b" />

              {/* Concrete inside L-box */}
              {(() => {
                const vertHeight = 140 - (lboxProgress * 60); // drops from 140 to 80
                const horizLength = 90 + (lboxProgress * 160); // flows from 90 to 250
                const h2 = lboxProgress * 42; // depth at end of trough
                const h1 = 160 - vertHeight; // depth in vertical leg

                return (
                  <g>
                    {/* Vertical leg fluid */}
                    <rect x="42" y={160 - h1} width="46" height={h1} fill="url(#concreteGrad)" />
                    {/* Horizontal leg fluid */}
                    {lboxProgress > 0.1 && (
                      <polygon
                        points={`90,${160 - (h1 * 0.7)} ${horizLength},${160 - h2} ${horizLength},158 90,158`}
                        fill="url(#concreteGrad)"
                      />
                    )}
                  </g>
                );
              })()}

              {/* Height labels h1 and h2 */}
              <text x="65" y="100" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">h1</text>
              <text x="240" y="145" fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold">h2</text>
            </svg>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setLboxProgress(0);
                setIsLboxFlowing(true);
              }}
              disabled={isLboxFlowing}
              className="flex-1 h-11 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>{lang === 'ta' ? 'கேட்டை திறந்து ஓடவிடு (Open Gate)' : 'Open L-Box Gate'}</span>
            </button>
            <button
              onClick={() => {
                setIsLboxFlowing(false);
                setLboxProgress(0);
              }}
              className="px-4 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center gap-1 border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'ta' ? 'மீட்டமை' : 'Reset'}</span>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Info className="w-3.5 h-3.5" />
              <span>IS 10262 Clause 7.2.2 Passing Ability Standard:</span>
            </div>
            <p className="font-mono text-slate-200">
              Minimum permissible passing ratio h2 / h1 = <strong>0.80</strong>. If SCC flows freely like water, ratio = <strong>1.00</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
