import React, { useState } from 'react';
import { MixDesignOutputs } from '../types/concrete';
import { TRANSLATIONS, Language } from '../utils/translations';
import { ReceiptText, IndianRupee, Layers, Calculator, Copy, Check } from 'lucide-react';

interface BOQTabProps {
  outputs: MixDesignOutputs;
  lang: Language;
}

export const BOQTab: React.FC<BOQTabProps> = ({ outputs, lang }) => {
  const t = TRANSLATIONS[lang];
  const [totalVolumeM3, setTotalVolumeM3] = useState<number>(25); // e.g. 25 m3 slab

  // Material rates in Indian Rupees (INR)
  const [cementBagRate, setCementBagRate] = useState<number>(420); // Rs per 50kg bag
  const [sandTonRate, setSandTonRate] = useState<number>(1400); // Rs per Ton of M-Sand / River Sand
  const [aggTonRate, setAggTonRate] = useState<number>(950); // Rs per Ton of 20mm blue metal
  const [admixLiterRate, setAdmixLiterRate] = useState<number>(90); // Rs per Liter

  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Total material quantities for the specified project volume
  const totalCementKg = outputs.cementContent * totalVolumeM3;
  const totalCementBags = Math.ceil(totalCementKg / 50);

  const totalMineralKg = outputs.mineralContent * totalVolumeM3;

  const totalSandKg = outputs.fineAggSSD * totalVolumeM3;
  const totalSandTon = Number((totalSandKg / 1000).toFixed(2));
  // 1 m3 dry loose sand ~ 1600 kg. 1 m3 = 35.315 CFT.
  // 1 Brass = 100 CFT = ~4.5 Tonnes (roughly)
  const totalSandCFT = Number(((totalSandKg / 1600) * 35.315).toFixed(1));
  const totalSandBrass = Number((totalSandCFT / 100).toFixed(2));

  const totalAggKg = outputs.coarseAggSSD * totalVolumeM3;
  const totalAggTon = Number((totalAggKg / 1000).toFixed(2));
  const totalAggCFT = Number(((totalAggKg / 1500) * 35.315).toFixed(1));
  const totalAggBrass = Number((totalAggCFT / 100).toFixed(2));

  const totalWaterLiters = Math.round(outputs.finalWater * totalVolumeM3);
  const totalAdmixKg = Number((outputs.admixtureSSD * totalVolumeM3).toFixed(1));

  // Costs
  const costCement = totalCementBags * cementBagRate;
  const costSand = Math.round(totalSandTon * sandTonRate);
  const costAgg = Math.round(totalAggTon * aggTonRate);
  const costAdmix = Math.round(totalAdmixKg * admixLiterRate);
  const grandTotalCost = costCement + costSand + costAgg + costAdmix;
  const costPerM3 = Math.round(grandTotalCost / totalVolumeM3);

  const handleCopyBOQ = () => {
    const text = `CONCRETE BOQ ESTIMATE (${totalVolumeM3} m³)
- Cement: ${totalCementBags} Bags (50kg) = ₹${costCement.toLocaleString('en-IN')}
- Sand (FA): ${totalSandTon} Tons (${totalSandCFT} CFT / ${totalSandBrass} Brass) = ₹${costSand.toLocaleString('en-IN')}
- Aggregate (CA): ${totalAggTon} Tons (${totalAggCFT} CFT / ${totalAggBrass} Brass) = ₹${costAgg.toLocaleString('en-IN')}
- Admixture: ${totalAdmixKg} L = ₹${costAdmix.toLocaleString('en-IN')}
- Water: ${totalWaterLiters} L
Total Material Cost: ₹${grandTotalCost.toLocaleString('en-IN')} (₹${costPerM3}/m³)`;
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="p-3 md:p-6 space-y-5 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl p-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm md:text-base">
          <ReceiptText className="w-5 h-5" />
          <span>{t.boqTitle}</span>
        </div>
        <p className="text-xs text-slate-300 mt-1">
          {lang === 'ta'
            ? 'திட்ட கான்கிரீட் அளவிற்கான சிமெண்ட் மூட்டைகள், மணல், ஜல்லி மற்றும் செலவு மதிப்பீடு.'
            : 'Estimate cement bags, sand, aggregates in Tons / CFT / Brass, and total procurement budget.'}
        </p>
      </div>

      {/* Concrete Volume Input Card */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="concrete-volume-input" className="text-xs md:text-sm font-bold text-slate-200">
            {t.concreteVolume}
          </label>
          <div className="flex items-center gap-1.5">
            <input
              id="concrete-volume-input"
              type="number"
              step="1"
              min="1"
              max="5000"
              value={totalVolumeM3}
              onChange={(e) => setTotalVolumeM3(Math.max(1, parseFloat(e.target.value) || 1))}
              className="w-24 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-center font-mono font-bold text-amber-400 text-sm focus:outline-none focus:border-amber-500"
            />
            <span className="text-xs text-slate-400">m³</span>
          </div>
        </div>

        {/* Quick volume presets */}
        <div className="flex gap-2 overflow-x-auto text-xs pb-1">
          {[5, 10, 15, 25, 50, 100].map((v) => (
            <button
              key={v}
              onClick={() => setTotalVolumeM3(v)}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                totalVolumeM3 === v
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              {v} m³
            </button>
          ))}
        </div>
      </div>

      {/* Material Quantity Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
          <span className="text-[10.5px] text-slate-400 block">{lang === 'ta' ? 'சிமெண்ட் மூட்டைகள்' : 'Cement Bags'}</span>
          <span className="text-xl font-bold font-mono text-amber-400 block mt-1">{totalCementBags}</span>
          <span className="text-[10px] text-slate-400 block">({totalCementKg} kg)</span>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
          <span className="text-[10.5px] text-slate-400 block">{lang === 'ta' ? 'மணல் (Sand)' : 'Sand (FA)'}</span>
          <span className="text-xl font-bold font-mono text-slate-100 block mt-1">{totalSandTon} <span className="text-xs font-normal">Tons</span></span>
          <span className="text-[10px] text-slate-400 block font-mono">{totalSandCFT} CFT ({totalSandBrass} Brass)</span>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
          <span className="text-[10.5px] text-slate-400 block">{lang === 'ta' ? 'ஜல்லி (Aggregate)' : 'Coarse Agg (CA)'}</span>
          <span className="text-xl font-bold font-mono text-slate-100 block mt-1">{totalAggTon} <span className="text-xs font-normal">Tons</span></span>
          <span className="text-[10px] text-slate-400 block font-mono">{totalAggCFT} CFT ({totalAggBrass} Brass)</span>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
          <span className="text-[10.5px] text-slate-400 block">{lang === 'ta' ? 'நீர் (Water)' : 'Water Needed'}</span>
          <span className="text-xl font-bold font-mono text-blue-400 block mt-1">{totalWaterLiters} <span className="text-xs font-normal">L</span></span>
          <span className="text-[10px] text-slate-400 block font-mono">{(totalWaterLiters / 1000).toFixed(1)} KL</span>
        </div>
      </div>

      {/* Material Rates & Budget Card */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
          <span className="text-xs md:text-sm font-bold text-slate-200 flex items-center gap-1.5">
            <IndianRupee className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'ta' ? 'விலை விபரம் & திட்ட மதிப்பீடு' : 'Unit Rates & Procurement Budget'}</span>
          </span>
          <button
            onClick={handleCopyBOQ}
            className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSummary ? (lang === 'ta' ? 'நகலானது' : 'Copied') : (lang === 'ta' ? 'நகல்' : 'Copy BOQ')}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label htmlFor="cement-rate-input" className="text-slate-400 text-[11px] block mb-1">{t.cementPrice}</label>
            <input
              id="cement-rate-input"
              type="number"
              value={cementBagRate}
              onChange={(e) => setCementBagRate(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="sand-rate-input" className="text-slate-400 text-[11px] block mb-1">{t.sandPrice}</label>
            <input
              id="sand-rate-input"
              type="number"
              value={sandTonRate}
              onChange={(e) => setSandTonRate(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="agg-rate-input" className="text-slate-400 text-[11px] block mb-1">{t.aggPrice}</label>
            <input
              id="agg-rate-input"
              type="number"
              value={aggTonRate}
              onChange={(e) => setAggTonRate(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="admix-rate-input" className="text-slate-400 text-[11px] block mb-1">{t.admixPrice}</label>
            <input
              id="admix-rate-input"
              type="number"
              value={admixLiterRate}
              onChange={(e) => setAdmixLiterRate(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Cost Summary Box */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
          <div className="flex justify-between text-slate-300">
            <span>Cement ({totalCementBags} bags × ₹{cementBagRate}):</span>
            <span className="font-bold text-white">₹{costCement.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Sand ({totalSandTon} tons × ₹{sandTonRate}):</span>
            <span className="font-bold text-white">₹{costSand.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Aggregate ({totalAggTon} tons × ₹{aggTonRate}):</span>
            <span className="font-bold text-white">₹{costAgg.toLocaleString('en-IN')}</span>
          </div>
          {costAdmix > 0 && (
            <div className="flex justify-between text-slate-300">
              <span>Admixture ({totalAdmixKg} L × ₹{admixLiterRate}):</span>
              <span className="font-bold text-white">₹{costAdmix.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-sm font-bold text-emerald-400">
            <span>{t.totalCostEst}:</span>
            <span className="text-base text-emerald-300">₹{grandTotalCost.toLocaleString('en-IN')}</span>
          </div>
          <div className="text-[11px] text-slate-400 text-right font-sans">
            Cost per m³: <strong className="text-slate-200 font-mono">₹{costPerM3.toLocaleString('en-IN')} / m³</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
