import React, { useState } from 'react';
import { MixDesignInputs, MixDesignOutputs } from '../types/concrete';
import { TRANSLATIONS, Language } from '../utils/translations';
import { Droplets, Truck, Scale, AlertCircle, CheckCircle2, Waves } from 'lucide-react';

interface FieldAdjustmentTabProps {
  inputs: MixDesignInputs;
  setInputs: React.Dispatch<React.SetStateAction<MixDesignInputs>>;
  outputs: MixDesignOutputs;
  lang: Language;
}

export const FieldAdjustmentTab: React.FC<FieldAdjustmentTabProps> = ({
  inputs,
  setInputs,
  outputs,
  lang,
}) => {
  const t = TRANSLATIONS[lang];
  const [mixerCapacityM3, setMixerCapacityM3] = useState<number>(6.0); // e.g. 6 m3 RMC Transit Mixer
  const [selectedQuickBatch, setSelectedQuickBatch] = useState<string>('6m3');

  const handleQuickBatch = (key: string, vol: number) => {
    setSelectedQuickBatch(key);
    setMixerCapacityM3(vol);
  };

  // Scaling factor for the selected mixer volume
  const scale = mixerCapacityM3;

  const batchCement = Math.round(outputs.cementContent * scale);
  const batchMineral = Math.round(outputs.mineralContent * scale);
  const batchNetWater = Math.round(outputs.finalWater * scale);
  const batchSSD_FA = Math.round(outputs.fineAggSSD * scale);
  const batchSSD_CA = Math.round(outputs.coarseAggSSD * scale);

  const batchWet_FA = Math.round(outputs.wetAggFA * scale);
  const batchWet_CA = Math.round(outputs.wetAggCA * scale);
  const batchActualWater = Math.round(outputs.actualWaterToAdd * scale);
  const batchAdmixture = Number((outputs.admixtureSSD * scale).toFixed(2));

  return (
    <div className="p-3 md:p-6 space-y-5 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl p-4">
        <div className="flex items-center gap-2 text-blue-400 font-bold text-sm md:text-base">
          <Droplets className="w-5 h-5" />
          <span>{lang === 'ta' ? 'தள ஈரப்பதம் & மிக்சர் அளவீடு (Field Moisture & Batching)' : 'Field Moisture & Batching Adjustments'}</span>
        </div>
        <p className="text-xs text-slate-300 mt-1">
          {lang === 'ta'
            ? 'IS 10262:2019 அனெக்ஸ் A-11 & B-11 மற்றும் IS 456 அட்டவணை 10 படி துல்லியமான திருத்தம்.'
            : 'Based on IS 10262:2019 Clauses A-11 & B-11 and IS 456:2000 Table 10 surface moisture rules.'}
        </p>
      </div>

      {/* Moisture & Absorption Sliders */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
          <span className="text-xs font-bold text-slate-200">
            {lang === 'ta' ? 'தள சோதனை ஈரப்பத அளவுகள்' : 'Site Moisture & Water Absorption Data'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">IS 2386 Part 3</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Fine Aggregate */}
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between font-bold text-amber-300">
              <span>{lang === 'ta' ? 'மணல் (Fine Aggregate)' : 'Fine Aggregate (Sand)'}</span>
              <span className="text-[10px] font-mono text-slate-400">SSD Sp.Gr: {inputs.specificGravityFA}</span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="fa-moisture-slider" className="text-slate-300">{t.faMoisture}</label>
                <span className="font-mono text-blue-400 font-bold">{inputs.freeMoistureFA}%</span>
              </div>
              <input
                id="fa-moisture-slider"
                type="range"
                min="0"
                max="8"
                step="0.5"
                value={inputs.freeMoistureFA}
                onChange={(e) =>
                  setInputs((prev) => ({ ...prev, freeMoistureFA: Number(e.target.value) }))
                }
                className="w-full accent-blue-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                IS 456 Table 10: Moist (2.5%), Moderate (5%), Very Wet (7.5%)
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="fa-absorption-slider" className="text-slate-300">{t.faAbsorption}</label>
                <span className="font-mono text-slate-300 font-bold">{inputs.waterAbsorptionFA}%</span>
              </div>
              <input
                id="fa-absorption-slider"
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={inputs.waterAbsorptionFA}
                onChange={(e) =>
                  setInputs((prev) => ({ ...prev, waterAbsorptionFA: Number(e.target.value) }))
                }
                className="w-full accent-slate-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Coarse Aggregate */}
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between font-bold text-amber-300">
              <span>{lang === 'ta' ? 'ஜல்லி (Coarse Aggregate)' : 'Coarse Aggregate (Jalli)'}</span>
              <span className="text-[10px] font-mono text-slate-400">SSD Sp.Gr: {inputs.specificGravityCA}</span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="ca-moisture-slider" className="text-slate-300">{t.caMoisture}</label>
                <span className="font-mono text-blue-400 font-bold">{inputs.freeMoistureCA}%</span>
              </div>
              <input
                id="ca-moisture-slider"
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={inputs.freeMoistureCA}
                onChange={(e) =>
                  setInputs((prev) => ({ ...prev, freeMoistureCA: Number(e.target.value) }))
                }
                className="w-full accent-blue-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                IS 456 Table 10: Moist gravel (1.25% – 2.5%)
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="ca-absorption-slider" className="text-slate-300">{t.caAbsorption}</label>
                <span className="font-mono text-slate-300 font-bold">{inputs.waterAbsorptionCA}%</span>
              </div>
              <input
                id="ca-absorption-slider"
                type="range"
                min="0"
                max="2.5"
                step="0.1"
                value={inputs.waterAbsorptionCA}
                onChange={(e) =>
                  setInputs((prev) => ({ ...prev, waterAbsorptionCA: Number(e.target.value) }))
                }
                className="w-full accent-slate-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transit Mixer / Batch Plant Selector */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-slate-200">
            <Truck className="w-4 h-4 text-amber-400" />
            <span>{lang === 'ta' ? 'மிக்ஸர் / ஆர்.எம்.சி வாகனம் கொள்ளளவு' : 'Batch Mixer / Transit Mixer Capacity'}</span>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              step="0.1"
              min="0.05"
              max="20"
              value={mixerCapacityM3}
              onChange={(e) => {
                setSelectedQuickBatch('custom');
                setMixerCapacityM3(Math.max(0.05, parseFloat(e.target.value) || 1));
              }}
              className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-amber-400 text-xs focus:outline-none"
            />
            <span className="text-xs text-slate-400">m³</span>
          </div>
        </div>

        {/* Quick capacity buttons */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 text-xs">
          {[
            { key: '1bag', label: '1 Bag (0.035m³)', vol: 0.035 },
            { key: '10_7', label: 'Site (0.2m³)', vol: 0.2 },
            { key: '1m3', label: '1.0 m³', vol: 1.0 },
            { key: '6m3', label: '6 m³ RMC', vol: 6.0 },
            { key: '7m3', label: '7 m³ RMC', vol: 7.0 },
            { key: '8m3', label: '8 m³ RMC', vol: 8.0 },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => handleQuickBatch(item.key, item.vol)}
              className={`py-1.5 px-1 rounded-xl text-center font-medium transition-colors border ${
                selectedQuickBatch === item.key
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Batch Weigh Ticket Output */}
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-2xl p-4 shadow-xl space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Scale className="w-4 h-4" />
            <span>
              {lang === 'ta'
                ? `தொகுதி எடை சீட்டு (${mixerCapacityM3} m³ கான்கிரீட்)`
                : `BATCH WEIGH TICKET (${mixerCapacityM3} m³)`}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">{inputs.grade} ({inputs.exposureCondition})</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
            <span className="text-slate-300">1. {lang === 'ta' ? 'சிமெண்ட்' : 'Cement (OPC)'}:</span>
            <span className="text-sm font-bold text-amber-300 tabular-nums">{batchCement} kg</span>
          </div>

          {batchMineral > 0 && (
            <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
              <span className="text-slate-300">2. {inputs.mineralAdmixture}:</span>
              <span className="text-sm font-bold text-amber-300 tabular-nums">{batchMineral} kg</span>
            </div>
          )}

          <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80 bg-blue-950/20 px-2 rounded-lg">
            <div>
              <span className="text-slate-200 font-semibold block">
                {lang === 'ta' ? '3. மிக்சரில் ஊற்ற வேண்டிய நீர்' : '3. Actual Water to Add at Mixer'}:
              </span>
              <span className="text-[10px] text-slate-400 font-sans">
                (Design Water {batchNetWater} kg - Free Moisture {(outputs.freeWaterContributed * scale).toFixed(0)} kg)
              </span>
            </div>
            <span className="text-base font-extrabold text-blue-400 tabular-nums">{batchActualWater} kg / L</span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
            <div>
              <span className="text-slate-300 block">{lang === 'ta' ? '4. மணல் (ஈரப்பதத்துடன்)' : '4. Fine Aggregate (Wet Sand)'}:</span>
              <span className="text-[10px] text-slate-500 font-sans">(SSD: {batchSSD_FA} kg)</span>
            </div>
            <span className="text-sm font-bold text-slate-100 tabular-nums">{batchWet_FA} kg</span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
            <div>
              <span className="text-slate-300 block">{lang === 'ta' ? '5. ஜல்லி (ஈரப்பதத்துடன்)' : '5. Coarse Aggregate (Wet Jalli)'}:</span>
              <span className="text-[10px] text-slate-500 font-sans">
                (20-10mm: {Math.round(batchWet_CA * (inputs.coarseFractionRatio || 0.6))} kg, 10-4.75mm: {Math.round(batchWet_CA * (1 - (inputs.coarseFractionRatio || 0.6)))} kg)
              </span>
            </div>
            <span className="text-sm font-bold text-slate-100 tabular-nums">{batchWet_CA} kg</span>
          </div>

          {batchAdmixture > 0 && (
            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-300">6. {lang === 'ta' ? 'ரசாயனம்' : 'Superplasticizer'}:</span>
              <span className="text-sm font-bold text-emerald-400 tabular-nums">{batchAdmixture} kg</span>
            </div>
          )}
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-sans flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            {lang === 'ta'
              ? 'கவனம்: மணல் அல்லது ஜல்லியின் ஈரப்பதம் மாறும்போது, மிக்சரில் ஊற்றப்படும் நீரின் அளவை உடனடியாக மாற்றியமைக்க வேண்டும்.'
              : 'Important Site Rule: When rain occurs or aggregate moisture changes, recalibrate moisture to maintain specified water-cement ratio!'}
          </span>
        </div>
      </div>
    </div>
  );
};
