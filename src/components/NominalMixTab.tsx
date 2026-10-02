import React, { useState } from 'react';
import { NOMINAL_MIX_DATA } from '../utils/concreteCalculations';
import { TRANSLATIONS, Language } from '../utils/translations';
import { Layers, Box, Droplets, HelpCircle, CheckCircle, Scale } from 'lucide-react';

interface NominalMixTabProps {
  lang: Language;
}

export const NominalMixTab: React.FC<NominalMixTabProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [selectedGradeKey, setSelectedGradeKey] = useState<'M5' | 'M7_5' | 'M10' | 'M15' | 'M20'>('M20');
  const [cementBags, setCementBags] = useState<number>(1);
  const [bulkingPercent, setBulkingPercent] = useState<number>(15);

  const spec = NOMINAL_MIX_DATA[selectedGradeKey];

  // Nominal mix proportions per 50kg bag of cement
  // For M20: 1:1.5:3 -> Cement 50kg, FA = 250 * (1/3) = ~83kg, CA = 250 * (2/3) = ~167kg
  // General rule from Table 9: Total dry aggregate divided in 1:2 ratio
  const faWeightPerBag = Math.round(spec.totalDryAggKg * (1 / 3));
  const caWeightPerBag = Math.round(spec.totalDryAggKg * (2 / 3));
  const waterPerBag = spec.maxWaterLiters;

  // Total batch quantities for input cement bags
  const totalCementKg = cementBags * 50;
  const totalFAKg = cementBags * faWeightPerBag;
  const totalCAKg = cementBags * caWeightPerBag;
  const totalWaterLiters = cementBags * waterPerBag;

  // Farma Box (Measuring box): 1 bag cement = 35 Litres (0.035 m³)
  // Farma box dimensions: 30cm x 30cm x 38cm = 34.2 ~ 35 Litres
  // 1 bag cement occupies 1 farma box
  // For M20 (1:1.5:3):
  // Cement: 1 box (50kg)
  // Sand: 1.5 boxes (without bulking) -> with bulking: 1.5 * (1 + bulking/100) boxes!
  // Coarse aggregate: 3 boxes
  const nominalRatioParts = spec.proportions.split(':').map((s) => parseFloat(s.trim()));
  const sandBoxWithoutBulking = nominalRatioParts[1] || 1.5;
  const caBoxes = nominalRatioParts[2] || 3;
  const sandBoxWithBulking = Number(
    (sandBoxWithoutBulking * (1 + bulkingPercent / 100)).toFixed(2)
  );

  return (
    <div className="p-3 md:p-6 space-y-5 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl p-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm md:text-base">
          <Layers className="w-5 h-5" />
          <span>{t.nominalTitle}</span>
        </div>
        <p className="text-xs text-slate-300 mt-1">{t.nominalSubtitle}</p>
      </div>

      {/* Grade Selector Tabs */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3">
        <label className="text-xs font-semibold text-slate-300 block mb-2">
          {t.selectNominalGrade}
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {(['M5', 'M7_5', 'M10', 'M15', 'M20'] as const).map((gKey) => {
            const gradeLabel = gKey === 'M7_5' ? 'M7.5' : gKey;
            const isSelected = selectedGradeKey === gKey;
            return (
              <button
                key={gKey}
                onClick={() => setSelectedGradeKey(gKey)}
                className={`py-2 px-1 rounded-xl text-xs font-bold font-mono transition-all text-center ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
                }`}
              >
                {gradeLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Grade Highlights */}
      <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div>
            <span className="text-2xl font-black text-amber-400 font-mono">
              {spec.grade}
            </span>
            <span className="ml-2 text-sm font-bold text-slate-200 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              {spec.proportions}
            </span>
          </div>
          <span className="text-xs text-slate-400 text-right max-w-[140px] truncate">
            IS 456 Table 9
          </span>
        </div>

        <p className="text-xs text-slate-300 italic">{spec.usageDesc}</p>

        {/* Quantities per 50kg bag */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs">
          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block">{lang === 'ta' ? 'சிமெண்ட்' : 'Cement'}</span>
            <span className="font-mono font-bold text-base text-amber-300">50 kg</span>
            <span className="text-[9.5px] text-slate-500 block font-mono">1 Bag (35 L)</span>
          </div>

          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block">{lang === 'ta' ? 'உலர் மணல்' : 'Dry Sand (FA)'}</span>
            <span className="font-mono font-bold text-base text-slate-100">{faWeightPerBag} kg</span>
            <span className="text-[9.5px] text-slate-500 block font-mono">1/3 of Dry Agg</span>
          </div>

          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block">{lang === 'ta' ? 'உலர் ஜல்லி' : 'Dry Coarse Agg (CA)'}</span>
            <span className="font-mono font-bold text-base text-slate-100">{caWeightPerBag} kg</span>
            <span className="text-[9.5px] text-slate-500 block font-mono">2/3 of Dry Agg</span>
          </div>

          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block">{lang === 'ta' ? 'அதிகபட்ச நீர்' : 'Max Water Allowed'}</span>
            <span className="font-mono font-bold text-base text-blue-400">{waterPerBag} L</span>
            <span className="text-[9.5px] text-slate-500 block font-mono">w/c: {(waterPerBag / 50).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Interactive Site Batch Multiplier */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-slate-200">
            <Scale className="w-4 h-4 text-amber-400" />
            <span>{lang === 'ta' ? 'தள கலவை தொகுதி கணக்கீடு (Batch Scale)' : 'Site Batch Weight Multiplier'}</span>
          </div>
          <div className="flex items-center gap-1">
            <label htmlFor="cement-bags-input" className="text-xs text-slate-400">{lang === 'ta' ? 'சிமெண்ட் மூட்டைகள்:' : 'Cement Bags:'}</label>
            <input
              id="cement-bags-input"
              type="number"
              min="1"
              max="100"
              value={cementBags}
              onChange={(e) => setCementBags(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-amber-400 text-xs focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">{lang === 'ta' ? 'மொத்த சிமெண்ட்' : 'Total Cement'}</span>
            <span className="font-mono font-bold text-amber-300 text-sm">{totalCementKg} kg</span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">{lang === 'ta' ? 'மொத்த மணல்' : 'Total Sand (FA)'}</span>
            <span className="font-mono font-bold text-slate-200 text-sm">{totalFAKg} kg</span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">{lang === 'ta' ? 'மொத்த ஜல்லி' : 'Total Jalli (CA)'}</span>
            <span className="font-mono font-bold text-slate-200 text-sm">{totalCAKg} kg</span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">{lang === 'ta' ? 'அதிகபட்ச நீர்' : 'Max Water'}</span>
            <span className="font-mono font-bold text-blue-400 text-sm">{totalWaterLiters} Litres</span>
          </div>
        </div>
      </div>

      {/* Farma Box (Measuring Box) Volume Batching & Bulking of Sand */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-amber-400">
          <Box className="w-4 h-4" />
          <span>{lang === 'ta' ? 'ஃபர்மா பாக்ஸ் (அளவீட்டு பெட்டி) & மணல் உப்பல் திருத்தம்' : 'Measuring Box (Farma Box) & Bulking of Sand'}</span>
        </div>

        <p className="text-xs text-slate-300">{t.farmaname}</p>

        {/* Bulking slider */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label htmlFor="bulking-slider" className="text-slate-300 font-medium">{t.sandBulkingPercent}</label>
            <span className="font-mono text-amber-400 font-bold">{bulkingPercent}%</span>
          </div>
          <input
            id="bulking-slider"
            type="range"
            min="0"
            max="35"
            step="1"
            value={bulkingPercent}
            onChange={(e) => setBulkingPercent(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <p className="text-[10.5px] text-slate-400">{t.bulkingExplain}</p>
        </div>

        {/* Farma box proportions summary */}
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs space-y-2">
          <div className="font-bold text-slate-200">
            {lang === 'ta'
              ? `1 மூட்டை சிமெண்டிற்கு தேவையான பெட்டி எண்ணிக்கை (${spec.grade}):`
              : `Box Batching per 1 Bag of Cement (${spec.grade}):`}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{lang === 'ta' ? 'சிமெண்ட்' : 'Cement'}:</span>
              <span className="font-mono font-bold text-amber-300">1 Farma Box</span>
              <span className="text-[9.5px] text-slate-500 block">(1 Bag = 50 kg)</span>
            </div>

            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{lang === 'ta' ? 'மணல் (உப்பலுடன்)' : 'Sand (with Bulking)'}:</span>
              <span className="font-mono font-bold text-emerald-400">{sandBoxWithBulking} Boxes</span>
              <span className="text-[9.5px] text-slate-500 block">
                ({sandBoxWithoutBulking} dry boxes + {bulkingPercent}% bulking)
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{lang === 'ta' ? 'ஜல்லி (கரடுமுரடானது)' : 'Coarse Aggregate'}:</span>
              <span className="font-mono font-bold text-slate-200">{caBoxes} Boxes</span>
              <span className="text-[9.5px] text-slate-500 block">(20mm / 40mm)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
