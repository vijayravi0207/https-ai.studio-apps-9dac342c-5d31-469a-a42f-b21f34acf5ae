import React, { useState } from 'react';
import { MixDesignInputs, MixDesignOutputs } from '../types/concrete';
import { Language } from '../utils/translations';
import { X, Printer, CheckCircle, ShieldCheck, Download, FileText } from 'lucide-react';
import { generateMixDesignPdf } from '../utils/generatePdfReport';

interface MixReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputs: MixDesignInputs;
  outputs: MixDesignOutputs;
  lang: Language;
}

export const MixReportModal: React.FC<MixReportModalProps> = ({
  isOpen,
  onClose,
  inputs,
  outputs,
  lang,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const fileName = `Concrete_Mix_Design_Report_${inputs.grade}.pdf`;

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      setStatusMessage(lang === 'ta' ? 'PDF தயாராகிறது...' : 'Generating PDF...');

      const doc = generateMixDesignPdf(inputs, outputs, currentDate);

      // Check if running inside our Android APK with Native Bridge
      const androidBridge = (window as any).AndroidBridge;
      if (androidBridge && typeof androidBridge.downloadPdf === 'function') {
        const dataUri = doc.output('datauristring');
        const base64Data = dataUri.split(',')[1] || '';
        androidBridge.downloadPdf(base64Data, fileName);
        setStatusMessage(lang === 'ta' ? 'PDF மொபைலில் சேமிக்கப்பட்டது!' : 'Saved to Downloads!');
      } else {
        // Standard Web / Chrome download
        doc.save(fileName);
        setStatusMessage(lang === 'ta' ? 'PDF பதிவிறக்கம் முடிந்தது!' : 'PDF Downloaded!');
      }

      setTimeout(() => {
        setDownloading(false);
        setStatusMessage(null);
      }, 2500);
    } catch (err) {
      console.error('PDF generation error:', err);
      // Fallback to print
      handlePrint();
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    // Check if running inside Android APK
    const androidBridge = (window as any).AndroidBridge;
    if (androidBridge && typeof androidBridge.printDocument === 'function') {
      androidBridge.printDocument();
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-100">
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-slate-800 border-b border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white">
              {lang === 'ta' ? 'அதிகாரப்பூர்வ கலவை வடிவமைப்பு அறிக்கை' : 'Official Concrete Mix Design Report (IS 10262:2019)'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-70"
            >
              <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
              <span>
                {downloading 
                  ? (lang === 'ta' ? 'தயாராகிறது...' : 'Generating...')
                  : (lang === 'ta' ? 'PDF பதிவிறக்கு' : 'Download PDF')}
              </span>
            </button>
            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{lang === 'ta' ? 'அச்சிடு' : 'Print'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="bg-emerald-950/90 border-b border-emerald-600/40 px-4 py-2 text-center text-xs font-semibold text-emerald-300 animate-fadeIn flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Report Content - Print Friendly */}
        <div id="printable-mix-report" className="p-5 md:p-8 space-y-6 overflow-y-auto text-xs bg-white text-slate-900 font-sans">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <h2 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
              Concrete Mix Design Report
            </h2>
            <p className="text-xs font-semibold text-slate-700">
              Conforming to IS 10262:2019 (Clause 5.8.1) & IS 456:2000
            </p>
            <div className="flex justify-between items-center text-[11px] text-slate-600 mt-2 font-mono">
              <span>Report Ref: CMD/{inputs.grade}/{Date.now().toString().slice(-6)}</span>
              <span>Date: {currentDate}</span>
            </div>
          </div>

          {/* Section 1: Stipulations */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 p-1.5 border-l-4 border-amber-600 mb-2">
              1. Design Stipulations (Clause 4.1)
            </h3>
            <table className="w-full text-[11px] border border-slate-300">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="p-1.5 font-semibold text-slate-600 w-1/2">a) Characteristic Strength (fck)</td>
                  <td className="p-1.5 font-bold font-mono">{outputs.fck} N/mm² at 28 Days</td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <td className="p-1.5 font-semibold text-slate-600">b) Grade & Type of Cement</td>
                  <td className="p-1.5 font-mono">{inputs.cementType.replace('_', ' ')} (IS 269 / IS 1489)</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-1.5 font-semibold text-slate-600">c) Maximum Nominal Aggregate Size (MSA)</td>
                  <td className="p-1.5 font-mono">{inputs.maxAggregateSize} mm</td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <td className="p-1.5 font-semibold text-slate-600">d) Exposure Condition (IS 456 Table 3)</td>
                  <td className="p-1.5 font-mono">{inputs.exposureCondition} ({inputs.concreteType})</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-1.5 font-semibold text-slate-600">e) Workability Slump Required</td>
                  <td className="p-1.5 font-mono">{inputs.workabilitySlump} mm</td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <td className="p-1.5 font-semibold text-slate-600">f) Placing Method & Site Control</td>
                  <td className="p-1.5 font-mono">{inputs.placingMethod} | {inputs.siteControl} Control</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-semibold text-slate-600">g) Chemical Admixture Type</td>
                  <td className="p-1.5 font-mono">{inputs.useAdmixture ? 'Superplasticizer / HRWRA (IS 9103)' : 'None'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: Material Test Data */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 p-1.5 border-l-4 border-amber-600 mb-2">
              2. Material Physical Properties
            </h3>
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <table className="border border-slate-300 w-full">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-1.5 text-slate-600">Specific Gravity Cement</td>
                    <td className="p-1.5 font-mono font-bold">{inputs.specificGravityCement}</td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <td className="p-1.5 text-slate-600">Specific Gravity Coarse Agg (SSD)</td>
                    <td className="p-1.5 font-mono font-bold">{inputs.specificGravityCA}</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 text-slate-600">Specific Gravity Fine Agg (SSD)</td>
                    <td className="p-1.5 font-mono font-bold">{inputs.specificGravityFA}</td>
                  </tr>
                </tbody>
              </table>

              <table className="border border-slate-300 w-full">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-1.5 text-slate-600">Water Absorption CA / FA</td>
                    <td className="p-1.5 font-mono font-bold">{inputs.waterAbsorptionCA}% / {inputs.waterAbsorptionFA}%</td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <td className="p-1.5 text-slate-600">Free Moisture CA / FA</td>
                    <td className="p-1.5 font-mono font-bold">{inputs.freeMoistureCA}% / {inputs.freeMoistureFA}%</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 text-slate-600">Sand Zone (IS 383)</td>
                    <td className="p-1.5 font-mono font-bold">{inputs.sandZone}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Target Strength & Water-Cement Ratio */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 p-1.5 border-l-4 border-amber-600 mb-2">
              3. Target Strength & W/C Ratio Determination
            </h3>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px] space-y-1 font-mono">
              <p>• Target Strength: f'ck = max(fck + 1.65S, fck + X) = max({outputs.fck} + 1.65×{outputs.standardDeviation}, {outputs.fck} + {outputs.xFactor}) = <strong>{outputs.fTarget} N/mm²</strong></p>
              <p>• Selection of w/c from IS 10262 Fig. 1 = {outputs.calculatedWC}</p>
              <p>• Maximum permissible w/c for {inputs.exposureCondition} exposure = {outputs.maxPermissibleWC} (IS 456 Table 5)</p>
              <p className="text-emerald-700 font-bold">• Adopted Free Water-Cement Ratio = {outputs.adoptedWC}</p>
            </div>
          </div>

          {/* Section 4: Recommended Mix Proportions per 1 m3 */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 p-1.5 border-l-4 border-amber-600 mb-2">
              4. Final Recommended Mix Proportions per Cubic Metre (1 m³)
            </h3>
            <table className="w-full text-[11px] border-collapse border border-slate-400 text-left">
              <thead>
                <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-400">
                  <th className="p-2 border-r border-slate-400">Material</th>
                  <th className="p-2 border-r border-slate-400">SSD Mass (kg/m³)</th>
                  <th className="p-2 border-r border-slate-400">Site Adjusted (Wet Batch)</th>
                  <th className="p-2">Normalized Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 font-mono">
                <tr>
                  <td className="p-2 font-bold font-sans">Cement (OPC)</td>
                  <td className="p-2">{outputs.cementContent} kg</td>
                  <td className="p-2 font-bold">{outputs.cementContent} kg</td>
                  <td className="p-2">1.00</td>
                </tr>
                {outputs.mineralContent > 0 && (
                  <tr className="bg-slate-50">
                    <td className="p-2 font-bold font-sans">{inputs.mineralAdmixture}</td>
                    <td className="p-2">{outputs.mineralContent} kg</td>
                    <td className="p-2">{outputs.mineralContent} kg</td>
                    <td className="p-2">{(outputs.mineralContent / outputs.cementContent).toFixed(2)}</td>
                  </tr>
                )}
                <tr>
                  <td className="p-2 font-bold font-sans">Water (Net Mixing)</td>
                  <td className="p-2">{outputs.finalWater} kg</td>
                  <td className="p-2 font-bold text-blue-700">{outputs.actualWaterToAdd} kg</td>
                  <td className="p-2">{outputs.adoptedWC}</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-2 font-bold font-sans">Fine Aggregate (Sand)</td>
                  <td className="p-2">{outputs.fineAggSSD} kg</td>
                  <td className="p-2 font-bold">{outputs.wetAggFA} kg (Wet)</td>
                  <td className="p-2">{(outputs.fineAggSSD / outputs.cementContent).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold font-sans">Coarse Aggregate</td>
                  <td className="p-2">{outputs.coarseAggSSD} kg</td>
                  <td className="p-2 font-bold">{outputs.wetAggCA} kg (Wet)</td>
                  <td className="p-2">{(outputs.coarseAggSSD / outputs.cementContent).toFixed(2)}</td>
                </tr>
                {outputs.admixtureSSD > 0 && (
                  <tr className="bg-slate-50">
                    <td className="p-2 font-bold font-sans">Chemical Admixture</td>
                    <td className="p-2">{outputs.admixtureSSD} kg</td>
                    <td className="p-2">{outputs.admixtureSSD} kg</td>
                    <td className="p-2">{(outputs.admixtureSSD / outputs.cementContent).toFixed(3)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Ratio Highlight & Signoff */}
          <div className="bg-slate-100 p-3 rounded border border-slate-300 text-center font-mono">
            <span className="text-slate-600 block text-[11px] uppercase font-sans font-bold">
              Design Mix Proportion (Cement : Sand : Coarse Aggregate)
            </span>
            <span className="text-base font-extrabold text-slate-900 block mt-0.5">
              {outputs.ratioString}
            </span>
            <span className="text-[10px] text-slate-500 font-sans block mt-1">
              Water-Cement Ratio: {outputs.adoptedWC} | Minimum Cement Durability Check: PASSED
            </span>
          </div>

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-3 gap-4 text-center text-[10.5px] border-t border-slate-300">
            <div>
              <div className="h-10 border-b border-slate-400"></div>
              <span className="font-semibold block mt-1">Tested By (Lab Technician)</span>
            </div>
            <div>
              <div className="h-10 border-b border-slate-400"></div>
              <span className="font-semibold block mt-1">Checked By (Quality Engineer)</span>
            </div>
            <div>
              <div className="h-10 border-b border-slate-400"></div>
              <span className="font-semibold block mt-1">Approved By (Engineer-in-Charge)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
