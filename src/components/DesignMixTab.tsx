import React, { useState } from 'react';
import { 
  MixDesignInputs, 
  MixDesignOutputs, 
  GradeType, 
  CementType, 
  ExposureCondition, 
  AggregateSize, 
  AggregateShape, 
  SandZone, 
  SiteControl, 
  PlacingMethod, 
  MineralAdmixtureType 
} from '../types/concrete';
import { calculateMixDesign, DURABILITY_LIMITS } from '../utils/concreteCalculations';
import { TRANSLATIONS, Language } from '../utils/translations';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  Sliders, 
  Layers, 
  Droplet, 
  ChevronDown, 
  ChevronUp, 
  Info 
} from 'lucide-react';

interface DesignMixTabProps {
  inputs: MixDesignInputs;
  setInputs: React.Dispatch<React.SetStateAction<MixDesignInputs>>;
  outputs: MixDesignOutputs;
  lang: Language;
  onOpenReport: () => void;
}

export const DesignMixTab: React.FC<DesignMixTabProps> = ({
  inputs,
  setInputs,
  outputs,
  lang,
  onOpenReport,
}) => {
  const t = TRANSLATIONS[lang];
  const [showCalculationSteps, setShowCalculationSteps] = useState<boolean>(false);
  const [copiedRatio, setCopiedRatio] = useState<boolean>(false);

  const handleInputChange = <K extends keyof MixDesignInputs>(
    key: K,
    value: MixDesignInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleCopyRatio = () => {
    const text = `Mix Ratio for ${inputs.grade} (${inputs.concreteType}): ${outputs.ratioString} | w/c: ${outputs.adoptedWC} | Water: ${outputs.finalWater} kg/m³ | Cement: ${outputs.cementContent} kg/m³`;
    navigator.clipboard.writeText(text);
    setCopiedRatio(true);
    setTimeout(() => setCopiedRatio(false), 2000);
  };

  const durabilityLimit = DURABILITY_LIMITS[inputs.concreteType][inputs.exposureCondition];

  return (
    <div className="p-3 md:p-6 space-y-5 pb-20">
      {/* Main Results Highlight Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-amber-500/30 rounded-2xl p-4 shadow-xl relative overflow-hidden">
        <div className="flex items-start justify-between gap-2 border-b border-slate-700/60 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl md:text-3xl font-extrabold text-amber-400 font-mono">
                {inputs.grade}
              </span>
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {inputs.concreteType}
              </span>
              <span className="text-xs text-slate-400">({inputs.exposureCondition} Exposure)</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {lang === 'ta' ? 'கலவை விகிதம் (சிமெண்ட் : மணல் : ஜல்லி)' : 'Mix Proportion (Cement : Sand : Coarse Agg)'}:
              <strong className="ml-1 text-white font-mono text-sm tracking-wide bg-slate-950 px-2 py-0.5 rounded border border-slate-700">
                {outputs.ratioString}
              </strong>
            </p>
          </div>

          <button
            onClick={handleCopyRatio}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-600 text-xs text-slate-200 transition-colors shrink-0"
            title="Copy Mix Proportion"
          >
            {copiedRatio ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] text-emerald-400">{lang === 'ta' ? 'நகலானது' : 'Copied'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-[11px]">{lang === 'ta' ? 'நகல்' : 'Copy'}</span>
              </>
            )}
          </button>
        </div>


        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3">
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block">{t.targetStrength}</span>
            <div className="text-base font-bold text-white font-mono mt-0.5">
              {outputs.fTarget} <span className="text-xs text-slate-400 font-normal">N/mm²</span>
            </div>
            <span className="text-[9px] text-amber-400/90 font-mono">
              f'ck = {outputs.targetFormulaUsed === '1.65S' ? `fck + 1.65S` : `fck + X`}
            </span>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block">{t.waterCementRatio}</span>
            <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
              {outputs.adoptedWC}
            </div>
            <span className="text-[9px] text-slate-400 font-mono">
              Max: {outputs.maxPermissibleWC} (Table 5)
            </span>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block">{t.netWater}</span>
            <div className="text-base font-bold text-blue-400 font-mono mt-0.5">
              {outputs.finalWater} <span className="text-xs text-slate-400 font-normal">kg/m³</span>
            </div>
            <span className="text-[9px] text-slate-400 font-mono">
              Slump: {inputs.workabilitySlump} mm
            </span>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block">{t.cementQuantity}</span>
            <div className="text-base font-bold text-amber-300 font-mono mt-0.5">
              {outputs.cementContent} <span className="text-xs text-slate-400 font-normal">kg/m³</span>
            </div>
            <span className="text-[9px] text-slate-400 font-mono">
              ≈ {(outputs.cementContent / 50).toFixed(1)} Bags
            </span>
          </div>
        </div>

        {/* Quantities Table per 1 m³ (SSD Condition) */}
        <div className="mt-3 bg-slate-950/70 rounded-xl p-3 border border-slate-800 text-xs">
          <div className="font-semibold text-slate-300 mb-2 flex items-center justify-between">
            <span>{t.resultsTitle}</span>
            <span className="text-[10px] text-slate-500 font-mono">SSD Condition</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-200">
            <div>
              <span className="text-slate-400 text-[11px] block">{t.fineAggQuantity}:</span>
              <span className="font-mono font-bold text-slate-100 text-sm">{outputs.fineAggSSD} kg</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">{t.coarseAggQuantity}:</span>
              <span className="font-mono font-bold text-slate-100 text-sm">{outputs.coarseAggSSD} kg</span>
              <span className="text-[9.5px] text-slate-400 block font-mono">
                (20mm: {outputs.caFraction1}k, 10mm: {outputs.caFraction2}k)
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">{t.mineralQuantity}:</span>
              <span className="font-mono font-bold text-slate-100 text-sm">
                {outputs.mineralContent > 0 ? `${outputs.mineralContent} kg` : '0 kg'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">{t.admixtureQuantity}:</span>
              <span className="font-mono font-bold text-slate-100 text-sm">
                {outputs.admixtureSSD > 0 ? `${outputs.admixtureSSD} kg` : 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Compliance Indicators */}
        <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
          {outputs.isCementMinSatisfied ? (
            <div className="flex items-center gap-1 text-emerald-400 bg-emerald-950/50 px-2 py-1 rounded-md border border-emerald-800/40">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {lang === 'ta'
                  ? `குறைந்தபட்ச சிமெண்ட் தேவை பூர்த்தியானது (${outputs.totalCementitious} ≥ ${outputs.minCementRequired} kg/m³)`
                  : `Min Cement OK: ${outputs.totalCementitious} ≥ ${outputs.minCementRequired} kg/m³ (Table 5)`}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-400 bg-red-950/50 px-2 py-1 rounded-md border border-red-800/40">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Min cement not satisfied! Minimum required: {outputs.minCementRequired} kg/m³</span>
            </div>
          )}

          {outputs.isCementMaxSatisfied ? (
            <div className="flex items-center gap-1 text-slate-300 bg-slate-800/60 px-2 py-1 rounded-md border border-slate-700/40">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              <span>OPC ≤ 450 kg/m³ (IS 456 Cl. 8.2.4.2)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-amber-300 bg-amber-950/50 px-2 py-1 rounded-md border border-amber-800/40">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{t.cementMaxWarning}</span>
            </div>
          )}
        </div>
      </div>

      {/* Field Adjusted Batch Quick Glance */}
      {(inputs.freeMoistureCA > 0 || inputs.freeMoistureFA > 0 || inputs.waterAbsorptionCA > 0 || inputs.waterAbsorptionFA > 0) && (
        <div className="bg-blue-950/40 border border-blue-800/50 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-blue-300 font-semibold text-xs mb-2">
            <Droplet className="w-4 h-4 text-blue-400" />
            <span>{t.fieldAdjustedResults}</span>
          </div>
          <p className="text-[11px] text-slate-300 mb-3">{t.moistureNotice}</p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-900/80 p-2 rounded-xl border border-blue-900/40">
              <span className="text-[10px] text-slate-400 block">{t.actualWaterBatch}</span>
              <span className="font-mono font-bold text-amber-300 text-sm">{outputs.actualWaterToAdd} kg</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-xl border border-blue-900/40">
              <span className="text-[10px] text-slate-400 block">{t.actualFaBatch}</span>
              <span className="font-mono font-bold text-slate-200 text-sm">{outputs.wetAggFA} kg</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-xl border border-blue-900/40">
              <span className="text-[10px] text-slate-400 block">{t.actualCaBatch}</span>
              <span className="font-mono font-bold text-slate-200 text-sm">{outputs.wetAggCA} kg</span>
            </div>
          </div>
        </div>
      )}

      {/* Step-by-Step Engineering Calculation Details Accordion */}
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowCalculationSteps(!showCalculationSteps)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/60 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="text-xs md:text-sm font-semibold text-slate-100">
              {lang === 'ta' ? 'IS குறியீட்டு விரிவான கணக்கீட்டு படிகள் (Detailed Steps)' : 'Step-by-Step IS 10262 Calculation Breakdown'}
            </span>
          </div>
          {showCalculationSteps ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showCalculationSteps && (
          <div className="p-4 pt-1 space-y-3.5 text-xs text-slate-300 border-t border-slate-700/50 font-mono">
            {/* Step 1 */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div className="font-bold text-amber-300 mb-1">
                Step 1: Target Mean Compressive Strength (Cl. 4.2)
              </div>
              <p>Formula 1: f'ck = fck + 1.65 × S = {inputs.grade.replace('M','') } + 1.65 × {outputs.standardDeviation} = {(outputs.fck + 1.65 * outputs.standardDeviation).toFixed(2)} N/mm²</p>
              <p>Formula 2: f'ck = fck + X = {outputs.fck} + {outputs.xFactor} = {outputs.fck + outputs.xFactor} N/mm²</p>
              <p className="text-emerald-400 mt-1">Adopted Target Strength = {outputs.fTarget} N/mm² (Governing: {outputs.targetFormulaUsed})</p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div className="font-bold text-amber-300 mb-1">
                Step 2: Selection of Water-Cement Ratio (Cl. 5.1 & IS 456 Table 5)
              </div>
              <p>From Fig. 1 for {inputs.cementType}: w/c = {outputs.calculatedWC}</p>
              <p>From IS 456 Table 5 for {inputs.exposureCondition} exposure ({inputs.concreteType}): Max w/c = {outputs.maxPermissibleWC}</p>
              <p className="text-emerald-400 mt-1">
                Adopted w/c = min({outputs.calculatedWC}, {outputs.maxPermissibleWC}) = {outputs.adoptedWC}
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div className="font-bold text-amber-300 mb-1">
                Step 3: Selection of Water Content & Admixture Reduction (Cl. 5.3 & Table 4)
              </div>
              <p>Table 4 Base Water for {inputs.maxAggregateSize}mm aggregate @ 50mm slump = {outputs.baseWater} kg</p>
              <p>Adjustment for {inputs.workabilitySlump}mm slump (+3% per 25mm) = {outputs.slumpAdjustedWater} kg</p>
              {inputs.useAdmixture && (
                <p>After {inputs.admixtureReductionPercent}% chemical admixture reduction = {outputs.finalWater} kg/m³</p>
              )}
            </div>

            {/* Step 4 */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div className="font-bold text-amber-300 mb-1">
                Step 4: Calculation of Cementitious Material Content (Cl. 5.4)
              </div>
              <p>Base Cementitious = Water / (w/c) = {outputs.finalWater} / {outputs.adoptedWC} = {outputs.baseCementitious} kg/m³</p>
              {inputs.mineralAdmixture !== 'None' && (
                <>
                  <p>Increase for mineral admixture = +{inputs.cementitiousIncreasePercent}% → Total Cementitious = {outputs.totalCementitious} kg/m³</p>
                  <p>{inputs.mineralAdmixture} ({inputs.mineralPercentage}%) = {outputs.mineralContent} kg/m³</p>
                  <p>OPC Cement Content = {outputs.cementContent} kg/m³</p>
                </>
              )}
              <p className="text-emerald-400 mt-1">
                Durability Check: {outputs.totalCementitious} kg/m³ ≥ Min required {outputs.minCementRequired} kg/m³ (Table 5 & 6) → OK
              </p>
            </div>

            {/* Step 5 */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div className="font-bold text-amber-300 mb-1">
                Step 5: Coarse & Fine Aggregate Volume Proportions (Cl. 5.5 & Table 5)
              </div>
              <p>Base Coarse Aggregate volume ratio for {inputs.maxAggregateSize}mm & {inputs.sandZone} @ w/c 0.50 = {outputs.coarseAggBaseVolumeRatio}</p>
              <p>Correction for w/c ratio {outputs.adoptedWC} (±0.01 per ±0.05 w/c change) = {outputs.coarseAggCorrectedVolumeRatio}</p>
              {inputs.placingMethod === 'Pumping' && (
                <p>Pumpable concrete 10% reduction = {outputs.coarseAggFinalVolumeRatio}</p>
              )}
              <p className="text-emerald-400 mt-1">
                Fine Aggregate Volume Ratio = 1 - {outputs.coarseAggFinalVolumeRatio} = {outputs.fineAggFinalVolumeRatio}
              </p>
            </div>

            {/* Step 6 */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div className="font-bold text-amber-300 mb-1">
                Step 6: Absolute Volume Calculations per 1 m³ (Cl. 5.7)
              </div>
              <p>a) Volume of Entrapped Air = {outputs.airContentVolume} m³ (Table 3)</p>
              <p>b) Volume of Cement = {outputs.cementContent} / ({inputs.specificGravityCement} × 1000) = {outputs.volCement} m³</p>
              {outputs.volMineral > 0 && (
                <p>c) Volume of Mineral = {outputs.mineralContent} / ({inputs.specificGravityMineral} × 1000) = {outputs.volMineral} m³</p>
              )}
              <p>d) Volume of Water = {outputs.finalWater} / 1000 = {outputs.volWater} m³</p>
              {outputs.volAdmixture > 0 && (
                <p>e) Volume of Chemical Admix = {outputs.admixtureSSD} / ({inputs.specificGravityAdmixture} × 1000) = {outputs.volAdmixture} m³</p>
              )}
              <p className="text-amber-400 font-bold mt-1">
                Volume of All-in Aggregate = 1 - Air - Paste = {outputs.volTotalAggregate} m³
              </p>
              <p>Mass of CA = {outputs.volTotalAggregate} × {outputs.coarseAggFinalVolumeRatio} × {inputs.specificGravityCA} × 1000 = {outputs.coarseAggSSD} kg</p>
              <p>Mass of FA = {outputs.volTotalAggregate} × {outputs.fineAggFinalVolumeRatio} × {inputs.specificGravityFA} × 1000 = {outputs.fineAggSSD} kg</p>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Input Form Sections */}
      <div className="space-y-4">
        {/* Section 1: Stipulations */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3">
          <h2 className="text-xs md:text-sm font-bold text-amber-400 flex items-center gap-1.5">
            <Sliders className="w-4 h-4" />
            <span>{t.sectionStipulations}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Grade */}
            <div>
              <label htmlFor="grade-select" className="text-slate-300 font-medium block mb-1">{t.grade}</label>
              <select
                id="grade-select"
                aria-label={t.grade}
                value={inputs.grade}
                onChange={(e) => handleInputChange('grade', e.target.value as GradeType)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
              >
                {(['M10', 'M15', 'M20', 'M25', 'M30', 'M35', 'M40', 'M45', 'M50', 'M55', 'M60', 'M65', 'M70', 'M75', 'M80'] as GradeType[]).map((g) => (
                  <option key={g} value={g}>{g} Grade</option>
                ))}
              </select>
            </div>

            {/* Structure Type */}
            <div>
              <label className="text-slate-300 font-medium block mb-1">{t.concreteType}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleInputChange('concreteType', 'RCC')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    inputs.concreteType === 'RCC'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  RCC (வலுவூட்டப்பட்ட)
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('concreteType', 'PCC')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    inputs.concreteType === 'PCC'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  PCC (வெற்று கான்கிரீட்)
                </button>
              </div>
            </div>

            {/* Cement Type */}
            <div>
              <label htmlFor="cement-select" className="text-slate-300 font-medium block mb-1">{t.cementType}</label>
              <select
                id="cement-select"
                aria-label={t.cementType}
                value={inputs.cementType}
                onChange={(e) => {
                  const val = e.target.value as CementType;
                  handleInputChange('cementType', val);
                  if (val === 'PPC') handleInputChange('specificGravityCement', 2.88);
                  else handleInputChange('specificGravityCement', 3.15);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
              >
                <option value="OPC_43">OPC 43 Grade (IS 269)</option>
                <option value="OPC_53">OPC 53 Grade (IS 269)</option>
                <option value="OPC_33">OPC 33 Grade (IS 269)</option>
                <option value="PPC">PPC (Fly Ash based - IS 1489)</option>
                <option value="PSC">PSC (Portland Slag - IS 455)</option>
              </select>
            </div>

            {/* Exposure */}
            <div>
              <label htmlFor="exposure-select" className="text-slate-300 font-medium block mb-1">
                {t.exposure} <span className="text-amber-400/80">(IS 456 Table 3)</span>
              </label>
              <select
                id="exposure-select"
                aria-label={t.exposure}
                value={inputs.exposureCondition}
                onChange={(e) => handleInputChange('exposureCondition', e.target.value as ExposureCondition)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
              >
                <option value="Mild">Mild (லேசான சூழல்)</option>
                <option value="Moderate">Moderate (மிதமான சூழல்)</option>
                <option value="Severe">Severe (கடுமையான சூழல்)</option>
                <option value="Very Severe">Very Severe (மிகக் கடுமையான சூழல்)</option>
                <option value="Extreme">Extreme (தீவிர கடல்/வேதியியல்)</option>
              </select>
            </div>

            {/* MSA & Aggregate Shape */}
            <div>
              <label htmlFor="msa-select" className="text-slate-300 font-medium block mb-1">{t.maxAggSize}</label>
              <select
                id="msa-select"
                aria-label={t.maxAggSize}
                value={inputs.maxAggregateSize}
                onChange={(e) => handleInputChange('maxAggregateSize', Number(e.target.value) as AggregateSize)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
              >
                <option value={10}>10 mm MSA (+40 kg cement adjustment)</option>
                <option value={20}>20 mm MSA (Standard Standard)</option>
                <option value={40}>40 mm MSA (-30 kg cement adjustment)</option>
              </select>
            </div>

            <div>
              <label htmlFor="aggshape-select" className="text-slate-300 font-medium block mb-1">{t.aggShape}</label>
              <select
                id="aggshape-select"
                aria-label={t.aggShape}
                value={inputs.aggregateShape}
                onChange={(e) => handleInputChange('aggregateShape', e.target.value as AggregateShape)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
              >
                <option value="Angular">Crushed Angular (கூர்மையான ஜல்லி - 0 kg)</option>
                <option value="SubAngular">Sub-Angular (அரை கூர்மையானது - -10 kg)</option>
                <option value="GravelCrushed">Gravel with Crushed Particles (-15 kg)</option>
                <option value="Rounded">Rounded River Gravel (உருண்டை கூழாங்கல் - -20 kg)</option>
              </select>
            </div>

            {/* Workability Slump */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="slump-slider" className="text-slate-300 font-medium">{t.workability}</label>
                <span className="font-mono text-amber-400 font-bold">{inputs.workabilitySlump} mm</span>
              </div>
              <input
                id="slump-slider"
                type="range"
                min="25"
                max="175"
                step="5"
                value={inputs.workabilitySlump}
                onChange={(e) => handleInputChange('workabilitySlump', Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>25mm (Shallow)</span>
                <span>75mm (Normal)</span>
                <span>120mm (Pump)</span>
                <span>175mm (Tremie)</span>
              </div>
            </div>

            {/* Placing Method & Sand Zone */}
            <div>
              <label htmlFor="placing-select" className="text-slate-300 font-medium block mb-1">{t.placingMethod}</label>
              <select
                id="placing-select"
                aria-label={t.placingMethod}
                value={inputs.placingMethod}
                onChange={(e) => handleInputChange('placingMethod', e.target.value as PlacingMethod)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
              >
                <option value="Pumping">Pumping (பம்பிங் - 10% Coarse Agg Cut)</option>
                <option value="Chute">Chute / Direct Pour (சூட் கொட்டுதல்)</option>
                <option value="CraneBucket">Crane & Bucket (கிரேன் தொட்டி)</option>
                <option value="Tremie">Tremie Pipe (நீருக்கடியில்)</option>
              </select>
            </div>

            <div>
              <label htmlFor="sandzone-select" className="text-slate-300 font-medium block mb-1">{t.sandZone}</label>
              <select
                id="sandzone-select"
                aria-label={t.sandZone}
                value={inputs.sandZone}
                onChange={(e) => handleInputChange('sandZone', e.target.value as SandZone)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
              >
                <option value="Zone I">Zone I (Coarse Sand - கரடுமுரடான மணல்)</option>
                <option value="Zone II">Zone II (Standard Medium Sand - நடுத்தர மணல்)</option>
                <option value="Zone III">Zone III (Fine Sand - மெல்லிய மணல்)</option>
                <option value="Zone IV">Zone IV (Very Fine Sand - மிக மெல்லிய மணல்)</option>
              </select>
            </div>

            {/* Site Supervision */}
            <div>
              <label className="text-slate-300 font-medium block mb-1">{t.siteControl}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleInputChange('siteControl', 'Good')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    inputs.siteControl === 'Good'
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900 text-slate-300 border-slate-700'
                  }`}
                >
                  Good (நல்ல தரம்)
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('siteControl', 'Fair')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    inputs.siteControl === 'Fair'
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900 text-slate-300 border-slate-700'
                  }`}
                >
                  Fair (+1 N/mm² S)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Mineral & Chemical Admixtures */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3">
          <h2 className="text-xs md:text-sm font-bold text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>{t.sectionMineral} & {t.sectionChemical}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label htmlFor="mineral-type-select" className="text-slate-300 font-medium block mb-1">{t.mineralType}</label>
              <select
                id="mineral-type-select"
                aria-label={t.mineralType}
                value={inputs.mineralAdmixture}
                onChange={(e) => {
                  const val = e.target.value as MineralAdmixtureType;
                  handleInputChange('mineralAdmixture', val);
                  if (val === 'FlyAsh') {
                    handleInputChange('mineralPercentage', 30);
                    handleInputChange('specificGravityMineral', 2.2);
                    handleInputChange('cementitiousIncreasePercent', 10);
                  } else if (val === 'GGBS') {
                    handleInputChange('mineralPercentage', 40);
                    handleInputChange('specificGravityMineral', 3.0);
                    handleInputChange('cementitiousIncreasePercent', 0);
                  } else if (val === 'SilicaFume') {
                    handleInputChange('mineralPercentage', 5);
                    handleInputChange('specificGravityMineral', 2.2);
                    handleInputChange('cementitiousIncreasePercent', 10);
                  } else {
                    handleInputChange('mineralPercentage', 0);
                    handleInputChange('cementitiousIncreasePercent', 0);
                  }
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
              >
                <option value="None">None (Pure Cement Only)</option>
                <option value="FlyAsh">Fly Ash (சாம்பல் - IS 3812: 15-30%)</option>
                <option value="GGBS">GGBS (இரும்பு ஆலை கசடு - IS 16714: 25-50%)</option>
                <option value="SilicaFume">Silica Fume (சிலிக்கா புகை - IS 15388: 5-10%)</option>
                <option value="Metakaolin">Metakaolin (மெட்டாகாயோலின்: 5-15%)</option>
              </select>
            </div>

            {inputs.mineralAdmixture !== 'None' && (
              <>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="mineral-percent-slider" className="text-slate-300 font-medium">{t.mineralPercent}</label>
                    <span className="font-mono text-amber-400 font-bold">{inputs.mineralPercentage}%</span>
                  </div>
                  <input
                    id="mineral-percent-slider"
                    type="range"
                    min="5"
                    max="50"
                    step="1"
                    value={inputs.mineralPercentage}
                    onChange={(e) => handleInputChange('mineralPercentage', Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label htmlFor="cementitious-increase-input" className="text-slate-300 font-medium block mb-1">
                    {t.cementitiousIncrease} <span className="text-slate-500">(Cl. 5.4.1)</span>
                  </label>
                  <input
                    id="cementitious-increase-input"
                    type="number"
                    value={inputs.cementitiousIncreasePercent}
                    onChange={(e) => handleInputChange('cementitiousIncreasePercent', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            {/* Chemical Admixture */}
            <div className="sm:col-span-2 pt-2 border-t border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="useAdmixCheck"
                  checked={inputs.useAdmixture}
                  onChange={(e) => handleInputChange('useAdmixture', e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <label htmlFor="useAdmixCheck" className="text-xs font-bold text-slate-200 cursor-pointer">
                  {t.useAdmix}
                </label>
              </div>

              {inputs.useAdmixture && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="water-reduction-slider" className="text-slate-300 font-medium">{t.admixReduction}</label>
                      <span className="font-mono text-blue-400 font-bold">{inputs.admixtureReductionPercent}%</span>
                    </div>
                    <input
                      id="water-reduction-slider"
                      type="range"
                      min="5"
                      max="35"
                      step="1"
                      value={inputs.admixtureReductionPercent}
                      onChange={(e) => handleInputChange('admixtureReductionPercent', Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label htmlFor="admix-dosage-input" className="text-slate-300 font-medium block mb-1">{t.admixDosage}</label>
                    <input
                      id="admix-dosage-input"
                      type="number"
                      step="0.1"
                      value={inputs.admixtureDosagePercent}
                      onChange={(e) => handleInputChange('admixtureDosagePercent', Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="admix-sg-input" className="text-slate-300 font-medium block mb-1">{t.admixSg}</label>
                    <input
                      id="admix-sg-input"
                      type="number"
                      step="0.005"
                      value={inputs.specificGravityAdmixture}
                      onChange={(e) => handleInputChange('specificGravityAdmixture', Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Aggregates & Field Moisture Data */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3">
          <h2 className="text-xs md:text-sm font-bold text-amber-400 flex items-center gap-1.5">
            <Droplet className="w-4 h-4" />
            <span>{t.sectionAggregates} &amp; {t.tabFieldAdj}</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label htmlFor="ca-sg-input" className="text-slate-300 font-medium block mb-1">CA Sp. Gravity</label>
              <input
                id="ca-sg-input"
                type="number"
                step="0.01"
                value={inputs.specificGravityCA}
                onChange={(e) => handleInputChange('specificGravityCA', Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="fa-sg-input" className="text-slate-300 font-medium block mb-1">FA Sp. Gravity</label>
              <input
                id="fa-sg-input"
                type="number"
                step="0.01"
                value={inputs.specificGravityFA}
                onChange={(e) => handleInputChange('specificGravityFA', Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="ca-abs-input" className="text-slate-300 font-medium block mb-1">{t.caAbsorption}</label>
              <input
                id="ca-abs-input"
                type="number"
                step="0.1"
                value={inputs.waterAbsorptionCA}
                onChange={(e) => handleInputChange('waterAbsorptionCA', Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="fa-abs-input" className="text-slate-300 font-medium block mb-1">{t.faAbsorption}</label>
              <input
                id="fa-abs-input"
                type="number"
                step="0.1"
                value={inputs.waterAbsorptionFA}
                onChange={(e) => handleInputChange('waterAbsorptionFA', Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="ca-moist-input" className="text-slate-300 font-medium block mb-1">{t.caMoisture}</label>
              <input
                id="ca-moist-input"
                type="number"
                step="0.5"
                value={inputs.freeMoistureCA}
                onChange={(e) => handleInputChange('freeMoistureCA', Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="fa-moist-input" className="text-slate-300 font-medium block mb-1">{t.faMoisture}</label>
              <input
                id="fa-moist-input"
                type="number"
                step="0.5"
                value={inputs.freeMoistureFA}
                onChange={(e) => handleInputChange('freeMoistureFA', Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="col-span-2">
              <label htmlFor="coarse-fraction-select" className="text-slate-300 font-medium block mb-1">{t.coarseFraction}</label>
              <select
                id="coarse-fraction-select"
                aria-label={t.coarseFraction}
                value={inputs.coarseFractionRatio}
                onChange={(e) => handleInputChange('coarseFractionRatio', Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
              >
                <option value={0.6}>60% (20-10 mm) : 40% (10-4.75 mm) - Standard</option>
                <option value={0.5}>50% (20-10 mm) : 50% (10-4.75 mm) - High Strength</option>
                <option value={0.7}>70% (20-10 mm) : 30% (10-4.75 mm)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="pt-2">
        <button
          onClick={onOpenReport}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-transform"
        >
          <Sparkles className="w-4 h-4 stroke-[2.5]" />
          <span>{t.btnExportReport}</span>
        </button>
      </div>
    </div>
  );
};
