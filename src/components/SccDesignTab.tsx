import React, { useState, useMemo } from 'react';
import { GradeType, ExposureCondition, AggregateSize, SandZone } from '../types/concrete';
import { TRANSLATIONS, Language } from '../utils/translations';
import { STD_DEV_TABLE, FACTOR_X_TABLE, DURABILITY_LIMITS } from '../utils/concreteCalculations';
import { Sparkles, Droplets, CheckCircle2, AlertTriangle, Layers, Copy, Check, Info } from 'lucide-react';

interface SccDesignTabProps {
  lang: Language;
}

export type SlumpFlowClass = 'SF1' | 'SF2' | 'SF3';
export type ViscosityClass = 'V1' | 'V2';
export type SegregationClass = 'SR1' | 'SR2';

export const SccDesignTab: React.FC<SccDesignTabProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  // SCC Input Parameters (IS 10262:2019 Section 4 & Annex E defaults)
  const [sccGrade, setSccGrade] = useState<GradeType>('M30');
  const [exposure, setExposure] = useState<ExposureCondition>('Severe');
  const [slumpFlowClass, setSlumpFlowClass] = useState<SlumpFlowClass>('SF3');
  const [viscosityClass, setViscosityClass] = useState<ViscosityClass>('V1');
  const [segregationClass, setSegregationClass] = useState<SegregationClass>('SR1');
  const [lboxRatio, setLboxRatio] = useState<number>(0.9);

  // Materials & Proportions
  const [waterContentKg, setWaterContentKg] = useState<number>(190); // 150 to 210 kg/m3 (Annex E: 190)
  const [flyAshPercent, setFlyAshPercent] = useState<number>(35); // 25 to 50% for SCC (Annex E: 35%)
  const [powderContentKg, setPowderContentKg] = useState<number>(520); // 400 to 600 kg/m3 (Annex E: 520)
  const [finesPassing125MicronPercent, setFinesPassing125MicronPercent] = useState<number>(8); // 8% fines in sand
  const [superplasticizerPercent, setSuperplasticizerPercent] = useState<number>(0.6); // % of cementitious (Annex E: 0.6%)
  const [vmaPercent, setVmaPercent] = useState<number>(0.2); // VMA % (Annex E: 0.2%)

  // Specific gravities
  const sgCement = 3.15;
  const sgFlyAsh = 2.20;
  const sgWater = 1.0;
  const sgAdmixture = 1.08;
  const sgCA = 2.74;
  const sgFA = 2.65;

  const [copiedRatio, setCopiedRatio] = useState<boolean>(false);

  // Reactive SCC Mix Proportioning Engine (IS 10262:2019 Clause 8 & Annex E)
  const sccOutputs = useMemo(() => {
    const fck = parseInt(sccGrade.replace('M', ''), 10);
    const S = STD_DEV_TABLE[sccGrade] || 5.0;
    const X = FACTOR_X_TABLE[sccGrade] || 6.5;

    // Target Strength (Clause 4.2 & E-3)
    const fTargetA = fck + 1.65 * S;
    const fTargetB = fck + X;
    const fTarget = Number(Math.max(fTargetA, fTargetB).toFixed(2));

    // w/c selection for target strength
    // Curve 2 for OPC 43 / PPC: at 38.25 -> 0.43 (Annex E)
    let wc = 0.80 - 0.00912 * fTarget;
    const durabilityMaxWC = DURABILITY_LIMITS['RCC'][exposure].maxWC;
    wc = Math.min(Number(wc.toFixed(2)), durabilityMaxWC);

    // Total Cementitious content from water content and w/c
    const totalCementitious = Math.round(waterContentKg / wc);

    // Split between OPC and Fly Ash
    const flyAshKg = Math.round(totalCementitious * (flyAshPercent / 100));
    const cementKg = totalCementitious - flyAshKg;

    // Admixture Mass
    const admixKg = Number(
      ((superplasticizerPercent / 100) * totalCementitious).toFixed(2)
    );
    const vmaKg = Number(((vmaPercent / 100) * totalCementitious).toFixed(2));

    // Powder Content & Fine Aggregate estimation (Clause E-7.3)
    // Powder content (< 0.125 mm) = Entire OPC + Entire Fly Ash + Fines from Fine Aggregate
    const finesRequiredFromFA = Math.max(0, powderContentKg - (cementKg + flyAshKg));
    const fineAggKg = Math.round(
      finesRequiredFromFA / (finesPassing125MicronPercent / 100)
    );

    // Volumes for Absolute Volume calculation (Clause E-7.4)
    const volAir = 0.01; // 1% entrapped air for 20mm aggregate (Table 3)
    const volWater = waterContentKg / (sgWater * 1000);
    const volCement = cementKg / (sgCement * 1000);
    const volFlyAsh = flyAshKg / (sgFlyAsh * 1000);
    const volAdmix = (admixKg + vmaKg) / (sgAdmixture * 1000);
    const volFA = fineAggKg / (sgFA * 1000);

    // Remaining volume is Coarse Aggregate
    const volCA = Number(
      (
        1.0 -
        volAir -
        (volWater + volCement + volFlyAsh + volAdmix + volFA)
      ).toFixed(4)
    );
    const coarseAggKg = Math.round(volCA * sgCA * 1000);

    // Split CA into 50:50 fractions of 20-10mm and 10-4.75mm (Annex E-9)
    const caFraction1 = Math.round(coarseAggKg * 0.5);
    const caFraction2 = coarseAggKg - caFraction1;

    // Calculation of Volume of Powder Content & Water/Powder ratio by volume (Clause E-7.5)
    const volPortionFinesFA = finesRequiredFromFA / (sgFA * 1000);
    const volTotalPowder = volCement + volFlyAsh + volPortionFinesFA;
    const waterPowderRatio = Number((volWater / volTotalPowder).toFixed(2));
    const isWaterPowderValid = waterPowderRatio >= 0.85 && waterPowderRatio <= 1.10;

    // Durability check
    const minDurabilityCement = DURABILITY_LIMITS['RCC'][exposure].minCement;
    const isDurabilityPass = totalCementitious >= minDurabilityCement;

    // Proportions string
    const normFA = (fineAggKg / cementKg).toFixed(2);
    const normCA = (coarseAggKg / cementKg).toFixed(2);
    const ratioString = `1 : ${normFA} : ${normCA} (+${(flyAshKg / cementKg).toFixed(2)} FlyAsh)`;

    return {
      fTarget,
      wc,
      totalCementitious,
      cementKg,
      flyAshKg,
      admixKg,
      vmaKg,
      fineAggKg,
      coarseAggKg,
      caFraction1,
      caFraction2,
      volTotalPowder: Number(volTotalPowder.toFixed(3)),
      waterPowderRatio,
      isWaterPowderValid,
      isDurabilityPass,
      minDurabilityCement,
      ratioString,
    };
  }, [
    sccGrade,
    exposure,
    waterContentKg,
    flyAshPercent,
    powderContentKg,
    finesPassing125MicronPercent,
    superplasticizerPercent,
    vmaPercent,
  ]);

  const handleCopyScc = () => {
    const text = `SCC Mix Proportions (${sccGrade}): Cement=${sccOutputs.cementKg}kg, FlyAsh=${sccOutputs.flyAshKg}kg, Water=${waterContentKg}kg, FA=${sccOutputs.fineAggKg}kg, CA=${sccOutputs.coarseAggKg}kg, PCE Admix=${sccOutputs.admixKg}kg, VMA=${sccOutputs.vmaKg}kg | Flow: ${slumpFlowClass} | w/p: ${sccOutputs.waterPowderRatio}`;
    navigator.clipboard.writeText(text);
    setCopiedRatio(true);
    setTimeout(() => setCopiedRatio(false), 2000);
  };

  return (
    <div className="p-3 md:p-6 space-y-5 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl p-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm md:text-base">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>
            {lang === 'ta'
              ? 'சுய-சுருங்கும் கான்கிரீட் (Self-Compacting Concrete - SCC)'
              : 'Self-Compacting Concrete (SCC) Mix Design'}
          </span>
        </div>
        <p className="text-xs text-slate-300 mt-1">
          {lang === 'ta'
            ? 'IS 10262:2019 பிரிவு 4 மற்றும் அனெக்ஸ் E வழிகாட்டுதல்களின்படி அதிநவீன கலவை வடிவமைப்பு.'
            : 'Conforming to IS 10262:2019 Section 4 & Annex E (Slump-Flow, L-Box, V-Funnel & Powder Content).'}
        </p>
      </div>

      {/* SCC Fresh Concrete Characteristics (Clause 7.2) */}
      <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span>
              {lang === 'ta'
                ? 'SCC புதிய கான்கிரீட் பண்புகள் (Clause 7.2 Characteristics)'
                : '1. Fresh SCC Test Specifications (IS 10262 Cl. 7.2)'}
            </span>
          </span>
          <span className="text-[10.5px] font-mono text-slate-400">IS 1199 Part 6</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Slump Flow Class (Clause 7.2.1) */}
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="flow-class-select" className="text-slate-300 font-medium">a) Slump-Flow Class (பாய்வு விட்டம்)</label>
              <span className="font-mono text-amber-400 font-bold">{slumpFlowClass}</span>
            </div>
            <select
              id="flow-class-select"
              aria-label="Slump-Flow Class"
              value={slumpFlowClass}
              onChange={(e) => setSlumpFlowClass(e.target.value as SlumpFlowClass)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none"
            >
              <option value="SF1">SF1: 550 – 650 mm (Housing slabs, tunnel linings)</option>
              <option value="SF2">SF2: 660 – 750 mm (Normal walls, columns, beams)</option>
              <option value="SF3">SF3: 760 – 850 mm (Vertical congested rebars, complex shapes)</option>
            </select>
            <span className="text-[10px] text-slate-400 block font-mono">
              Annex E standard target: SF3 (760 – 850 mm)
            </span>
          </div>

          {/* Passing Ability by L-Box (Clause 7.2.2) */}
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="lbox-slider" className="text-slate-300 font-medium">b) Passing Ability (L-Box h2/h1)</label>
              <span className="font-mono text-emerald-400 font-bold">{lboxRatio}</span>
            </div>
            <input
              id="lbox-slider"
              type="range"
              min="0.80"
              max="1.00"
              step="0.05"
              value={lboxRatio}
              onChange={(e) => setLboxRatio(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block font-mono">
              Code Requirement: Ratio h2/h1 ≥ 0.80 (Annex E: 0.90)
            </span>
          </div>

          {/* Viscosity by V-Funnel (Clause 7.2.4) */}
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="vfunnel-class-select" className="text-slate-300 font-medium">c) Viscosity (V-Funnel Time)</label>
              <span className="font-mono text-blue-400 font-bold">{viscosityClass}</span>
            </div>
            <select
              id="vfunnel-class-select"
              aria-label="Viscosity V-Funnel Time"
              value={viscosityClass}
              onChange={(e) => setViscosityClass(e.target.value as ViscosityClass)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none"
            >
              <option value="V1">Class V1: Flow time ≤ 8 s (Good filling, self leveling)</option>
              <option value="V2">Class V2: Flow time 8 s – 25 s (Thixotropic, formwork relief)</option>
            </select>
          </div>

          {/* Segregation Resistance (Clause 7.2.3) */}
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="sieve-class-select" className="text-slate-300 font-medium">d) Sieve Segregation Resistance</label>
              <span className="font-mono text-purple-400 font-bold">{segregationClass}</span>
            </div>
            <select
              id="sieve-class-select"
              aria-label="Sieve Segregation Resistance"
              value={segregationClass}
              onChange={(e) => setSegregationClass(e.target.value as SegregationClass)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none"
            >
              <option value="SR1">Class SR1: 15% – 20% (Thin slabs, flow &lt; 5m, gap &gt; 80mm)</option>
              <option value="SR2">Class SR2: &lt; 15% (Tall vertical structures, flow &gt; 5m)</option>
            </select>
          </div>
        </div>
      </div>

      {/* SCC Mix Parameters & Powder Proportioning (Clauses 8.1, 8.3 & Annex E) */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs md:text-sm font-bold text-slate-200 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>
            {lang === 'ta'
              ? '2. தூள் அளவு & கலவை உள்ளீடுகள் (Powder Content & Mix Data)'
              : '2. Powder Content & Mix Parameters'}
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label htmlFor="scc-grade-select" className="text-slate-300 font-medium block mb-1">SCC Grade</label>
            <select
              id="scc-grade-select"
              aria-label="SCC Grade"
              value={sccGrade}
              onChange={(e) => setSccGrade(e.target.value as GradeType)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none"
            >
              {(['M25', 'M30', 'M35', 'M40', 'M45', 'M50', 'M60'] as GradeType[]).map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="scc-exposure-select" className="text-slate-300 font-medium block mb-1">Exposure Condition</label>
            <select
              id="scc-exposure-select"
              aria-label="Exposure Condition"
              value={exposure}
              onChange={(e) => setExposure(e.target.value as ExposureCondition)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
            >
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>
              <option value="Very Severe">Very Severe</option>
              <option value="Extreme">Extreme</option>
            </select>
          </div>

          <div>
            <label htmlFor="water-content-input" className="text-slate-300 font-medium block mb-1">Water Content (150–210 kg/m³)</label>
            <input
              id="water-content-input"
              type="number"
              min="150"
              max="210"
              value={waterContentKg}
              onChange={(e) => setWaterContentKg(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="flyash-percent-slider" className="text-slate-300 font-medium">Fly Ash Replacement (%)</label>
              <span className="font-mono text-amber-400 font-bold">{flyAshPercent}%</span>
            </div>
            <input
              id="flyash-percent-slider"
              type="range"
              min="20"
              max="50"
              step="1"
              value={flyAshPercent}
              onChange={(e) => setFlyAshPercent(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Typical SCC: 25% – 50%</span>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="total-powder-slider" className="text-slate-300 font-medium">Total Powder (&lt;0.125mm)</label>
              <span className="font-mono text-amber-300 font-bold">{powderContentKg} kg/m³</span>
            </div>
            <input
              id="total-powder-slider"
              type="range"
              min="400"
              max="600"
              step="10"
              value={powderContentKg}
              onChange={(e) => setPowderContentKg(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Code range: 400 – 600 kg/m³</span>
          </div>

          <div>
            <label htmlFor="pce-admix-dosage-input" className="text-slate-300 font-medium block mb-1">PCE Superplasticizer (%)</label>
            <input
              id="pce-admix-dosage-input"
              type="number"
              step="0.1"
              value={superplasticizerPercent}
              onChange={(e) => setSuperplasticizerPercent(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Final Calculated SCC Batch Quantities */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-emerald-500/40 rounded-2xl p-4 shadow-xl space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <span className="text-lg font-black text-emerald-400">
              {sccGrade} SCC MIX PROPORTIONS (per 1 m³)
            </span>
            <span className="text-xs text-slate-400 block font-sans">
              Flow Class: {slumpFlowClass} · Passing L-box: {lboxRatio}
            </span>
          </div>
          <button
            onClick={handleCopyScc}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors"
          >
            {copiedRatio ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{copiedRatio ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Quantities Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block">{lang === 'ta' ? 'சிமெண்ட்' : 'Cement (OPC)'}</span>
            <span className="text-base font-bold text-amber-300">{sccOutputs.cementKg} kg</span>
            <span className="text-[9.5px] text-slate-500 block font-sans">≈ {(sccOutputs.cementKg / 50).toFixed(1)} Bags</span>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block">{lang === 'ta' ? 'சாம்பல்' : 'Fly Ash (IS 3812)'}</span>
            <span className="text-base font-bold text-amber-300">{sccOutputs.flyAshKg} kg</span>
            <span className="text-[9.5px] text-slate-500 block font-sans">({flyAshPercent}% of Cementitious)</span>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block">{lang === 'ta' ? 'நீர்' : 'Mixing Water'}</span>
            <span className="text-base font-bold text-blue-400">{waterContentKg} kg</span>
            <span className="text-[9.5px] text-slate-500 block font-sans">w/cm = {sccOutputs.wc}</span>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block">{lang === 'ta' ? 'சூப்பர்பிளாஸ்டிசைசர்' : 'PCE Admixture'}</span>
            <span className="text-base font-bold text-emerald-400">{sccOutputs.admixKg} kg</span>
            <span className="text-[9.5px] text-slate-500 block font-sans">+ {sccOutputs.vmaKg} kg VMA</span>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block">{lang === 'ta' ? 'மணல்' : 'Fine Aggregate (Sand)'}</span>
            <span className="text-base font-bold text-slate-100">{sccOutputs.fineAggKg} kg</span>
            <span className="text-[9.5px] text-slate-500 block font-sans">High Sand Ratio (SSD)</span>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block">{lang === 'ta' ? 'ஜல்லி' : 'Coarse Aggregate (CA)'}</span>
            <span className="text-base font-bold text-slate-100">{sccOutputs.coarseAggKg} kg</span>
            <span className="text-[9.5px] text-slate-500 block font-sans">
              (20mm: {sccOutputs.caFraction1}k, 10mm: {sccOutputs.caFraction2}k)
            </span>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block">{lang === 'ta' ? 'நீர்/தூள் விகிதம்' : 'Water/Powder Vol Ratio'}</span>
            <span className={`text-base font-bold ${sccOutputs.isWaterPowderValid ? 'text-emerald-400' : 'text-amber-400'}`}>
              {sccOutputs.waterPowderRatio}
            </span>
            <span className="text-[9.5px] text-slate-500 block font-sans">Limit: 0.85 – 1.10</span>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block">{lang === 'ta' ? 'மொத்த தூள்' : 'Total Powder'}</span>
            <span className="text-base font-bold text-slate-200">{powderContentKg} kg</span>
            <span className="text-[9.5px] text-slate-500 block font-sans">Fines &lt; 0.125 mm</span>
          </div>
        </div>

        {/* Normalized Ratio Bar */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center font-mono">
          <span className="text-[10.5px] text-slate-400 font-sans block">Normalized SCC Proportion (Cement : Sand : Aggregate)</span>
          <span className="text-sm font-bold text-amber-300 block mt-0.5">{sccOutputs.ratioString}</span>
        </div>

        {/* Durability & Powder ratio status tags */}
        <div className="flex flex-wrap gap-2 text-[11px] pt-1 font-sans">
          {sccOutputs.isWaterPowderValid ? (
            <div className="flex items-center gap-1 text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-800/40">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Water/Powder ratio {sccOutputs.waterPowderRatio} is within IS 10262 range (0.85 – 1.10)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-amber-400 bg-amber-950/40 px-2 py-1 rounded-md border border-amber-800/40">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Adjust water or powder to keep water/powder volume ratio between 0.85 and 1.10</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-blue-300 bg-blue-950/40 px-2 py-1 rounded-md border border-blue-800/40">
            <Info className="w-3.5 h-3.5" />
            <span>Coarse aggregate kept lower (~{sccOutputs.coarseAggKg} kg/m³) to avoid blocking at rebars</span>
          </div>
        </div>
      </div>
    </div>
  );
};
