import React, { useState } from 'react';
import { MixDesignInputs, MixDesignOutputs, MixReportMetadata, DEFAULT_REPORT_METADATA } from '../types/concrete';
import { Language } from '../utils/translations';
import { 
  X, 
  Printer, 
  CheckCircle, 
  ShieldCheck, 
  Download, 
  Edit3, 
  Building2, 
  MapPin, 
  UserCheck, 
  FileCheck2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { generateMixDesignPdf } from '../utils/generatePdfReport';

interface MixReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputs: MixDesignInputs;
  outputs: MixDesignOutputs;
  lang: Language;
  metadata?: MixReportMetadata;
  setMetadata?: React.Dispatch<React.SetStateAction<MixReportMetadata>>;
}

export const MixReportModal: React.FC<MixReportModalProps> = ({
  isOpen,
  onClose,
  inputs,
  outputs,
  lang,
  metadata: propMetadata,
  setMetadata: propSetMetadata,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isEditingMetadata, setIsEditingMetadata] = useState(true);

  // Local fallback metadata state if not provided by prop
  const [localMetadata, setLocalMetadata] = useState<MixReportMetadata>(DEFAULT_REPORT_METADATA);
  const metadata = propMetadata || localMetadata;
  const setMetadata = propSetMetadata || setLocalMetadata;

  if (!isOpen) return null;

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const reportRef = `CMD/${inputs.grade}/${Date.now().toString().slice(-6)}`;
  const fileName = `Concrete_Mix_Design_Report_${inputs.grade}_${metadata.clientName.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 15)}.pdf`;

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      setStatusMessage(lang === 'ta' ? 'PDF அறிக்கை தயாராகிறது...' : 'Generating 2-page detailed PDF...');

      const doc = generateMixDesignPdf(inputs, outputs, currentDate, {
        ...metadata,
        reportRef,
        reportDate: currentDate,
      });

      // Check if running inside our Android APK with Native Bridge
      const androidBridge = (window as any).AndroidBridge;
      if (androidBridge && typeof androidBridge.downloadPdf === 'function') {
        const dataUri = doc.output('datauristring');
        const base64Data = dataUri.split(',')[1] || '';
        androidBridge.downloadPdf(base64Data, fileName);
        setStatusMessage(lang === 'ta' ? 'PDF மொபைல் டவுன்லோட் பகுதியில் சேமிக்கப்பட்டது!' : 'Saved to Mobile Downloads!');
      } else {
        // Standard Web / Chrome download
        doc.save(fileName);
        setStatusMessage(lang === 'ta' ? 'முழுமையான PDF அறிக்கை பதிவிறக்கப்பட்டது!' : 'Detailed Mix Report Downloaded!');
      }

      setTimeout(() => {
        setDownloading(false);
        setStatusMessage(null);
      }, 3000);
    } catch (err) {
      console.error('PDF generation error:', err);
      handlePrint();
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    const androidBridge = (window as any).AndroidBridge;
    if (androidBridge && typeof androidBridge.printDocument === 'function') {
      androidBridge.printDocument();
    } else {
      window.print();
    }
  };

  // Calculations for step by step displays
  const bagFactor = 50 / outputs.cementContent;
  const bagWater = (outputs.actualWaterToAdd * bagFactor).toFixed(1);
  const bagFA = (outputs.wetAggFA * bagFactor).toFixed(1);
  const bagCA = (outputs.wetAggCA * bagFactor).toFixed(1);
  const bagAdmix = (outputs.admixtureSSD * bagFactor * 1000).toFixed(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col text-slate-100">
        
        {/* Modal Top Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-800 border-b border-slate-700 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                {lang === 'ta' ? 'கான்கிரீட் மிக்ஸ் டிசைன் அறிக்கை (IS 10262:2019)' : 'Concrete Mix Design Report (IS 10262:2019)'}
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                  {inputs.grade}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingMetadata((prev) => !prev)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-200 font-medium text-xs border border-slate-600 transition-all cursor-pointer"
              title="Edit Client Name, Project Site, Prepared By, Checked By"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'ta' ? 'திட்ட விவரங்கள்' : 'Project Details'}</span>
              {isEditingMetadata ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

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

        {/* Collapsible Metadata Editor Form */}
        {isEditingMetadata && (
          <div className="bg-slate-800/90 border-b border-slate-700 p-4 space-y-3 shrink-0 text-xs animate-fadeIn">
            <div className="flex items-center justify-between pb-1 border-b border-slate-700/60">
              <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4" />
                {lang === 'ta' ? 'அறிக்கை திட்ட & பொறியாளர் விவரங்கள்' : 'Report Project & Engineering Details'}
              </span>
              <span className="text-[11px] text-slate-400">
                {lang === 'ta' ? 'இங்கு மாற்றப்படும் விவரங்கள் PDF-ல் சேரும்' : 'These details are rendered directly in the PDF'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  {lang === 'ta' ? 'வாடிக்கையாளர் பெயர் (Client Name):' : 'Client Name:'}
                </label>
                <input
                  type="text"
                  value={metadata.clientName}
                  onChange={(e) => setMetadata({ ...metadata, clientName: e.target.value })}
                  placeholder="e.g. M/s Greenfield Infrastructure Ltd"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {lang === 'ta' ? 'திட்ட இடம் (Project Site):' : 'Project Site:'}
                </label>
                <input
                  type="text"
                  value={metadata.projectSite}
                  onChange={(e) => setMetadata({ ...metadata, projectSite: e.target.value })}
                  placeholder="e.g. Residential High-Rise Tower Block-A, Chennai"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {lang === 'ta' ? 'தயாரித்தவர் (Prepared By):' : 'Prepared By:'}
                </label>
                <input
                  type="text"
                  value={metadata.preparedBy}
                  onChange={(e) => setMetadata({ ...metadata, preparedBy: e.target.value })}
                  placeholder="e.g. Er. K. Vijay, B.E. (Civil QC Engineer)"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                  {lang === 'ta' ? 'சரிபார்த்தவர் (Checked By):' : 'Checked By:'}
                </label>
                <input
                  type="text"
                  value={metadata.checkedBy}
                  onChange={(e) => setMetadata({ ...metadata, checkedBy: e.target.value })}
                  placeholder="e.g. Er. R. Sundaram, M.E. (Chief Structural Engineer)"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>
          </div>
        )}

        {statusMessage && (
          <div className="bg-emerald-950/90 border-b border-emerald-600/40 px-4 py-2 text-center text-xs font-semibold text-emerald-300 animate-fadeIn flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Report Content - Print Friendly & Complete Step-by-Step View */}
        <div id="printable-mix-report" className="p-4 sm:p-8 space-y-6 overflow-y-auto text-xs bg-white text-slate-900 font-sans">
          
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-3">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
              Concrete Mix Design Report (IS 10262:2019)
            </h2>
            <p className="text-xs font-bold text-slate-700 mt-0.5">
              Comprehensive Proportioning & Quality Compliance to IS 456:2000 (Table 5) & IS 10262:2019
            </p>
            <div className="flex flex-wrap justify-between items-center text-[11px] text-slate-600 mt-2 font-mono border-t border-slate-200 pt-1.5">
              <span>Report Ref: {reportRef}</span>
              <span>Concrete Grade: <strong>{inputs.grade} ({inputs.concreteType})</strong></span>
              <span>Date: {currentDate}</span>
            </div>
          </div>

          {/* Project Details Banner */}
          <div className="bg-slate-50 border border-slate-300 p-3 rounded-md text-[11px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <p><span className="font-bold text-slate-700">Client Name:</span> <span className="font-semibold text-slate-900">{metadata.clientName}</span></p>
                <p className="mt-1"><span className="font-bold text-slate-700">Project Site:</span> <span className="font-semibold text-slate-900">{metadata.projectSite}</span></p>
              </div>
              <div className="sm:border-l sm:border-slate-200 sm:pl-3">
                <p><span className="font-bold text-slate-700">Prepared By:</span> <span className="font-semibold text-emerald-800">{metadata.preparedBy}</span></p>
                <p className="mt-1"><span className="font-bold text-slate-700">Checked By:</span> <span className="font-semibold text-blue-800">{metadata.checkedBy}</span></p>
              </div>
            </div>
          </div>

          {/* STEP 1: Design Stipulations */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 p-2 border-l-4 border-amber-600 mb-2">
              Step 1: Design Stipulations (Clause 4.1)
            </h3>
            <table className="w-full text-[11px] border border-slate-300">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="p-1.5 font-semibold text-slate-600 w-1/2">a) Characteristic Compressive Strength (fck)</td>
                  <td className="p-1.5 font-bold font-mono">{outputs.fck} N/mm² at 28 Days</td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <td className="p-1.5 font-semibold text-slate-600">b) Grade & Type of Cement</td>
                  <td className="p-1.5 font-mono">{inputs.cementType.replace('_', ' ')} (IS 269 / IS 1489)</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-1.5 font-semibold text-slate-600">c) Maximum Nominal Size of Aggregate (MSA)</td>
                  <td className="p-1.5 font-mono">{inputs.maxAggregateSize} mm ({inputs.aggregateShape})</td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <td className="p-1.5 font-semibold text-slate-600">d) Exposure Condition (IS 456 Table 3 & 5)</td>
                  <td className="p-1.5 font-mono">{inputs.exposureCondition} ({inputs.concreteType})</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-1.5 font-semibold text-slate-600">e) Workability (Slump Required)</td>
                  <td className="p-1.5 font-mono">{inputs.workabilitySlump} mm</td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <td className="p-1.5 font-semibold text-slate-600">f) Placing Method & Site Control Degree</td>
                  <td className="p-1.5 font-mono">{inputs.placingMethod} | {inputs.siteControl} Control</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-semibold text-slate-600">g) Chemical Admixture Type & Dosage</td>
                  <td className="p-1.5 font-mono">{inputs.useAdmixture ? `Superplasticizer / HRWRA (${inputs.admixtureDosagePercent}% by mass)` : 'None'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* STEP 2: Material Test Data */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 p-2 border-l-4 border-amber-600 mb-2">
              Step 2: Test Data of Materials (Clause 4.3)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <table className="border border-slate-300 w-full">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-1.5 text-slate-600">Specific Gravity of Cement</td>
                    <td className="p-1.5 font-mono font-bold">{inputs.specificGravityCement}</td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <td className="p-1.5 text-slate-600">Specific Gravity of Coarse Agg (SSD)</td>
                    <td className="p-1.5 font-mono font-bold">{inputs.specificGravityCA}</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 text-slate-600">Specific Gravity of Fine Agg (SSD)</td>
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
                    <td className="p-1.5 text-slate-600">Free Surface Moisture CA / FA</td>
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

          {/* STEP 3: Target Mean Compressive Strength */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 p-2 border-l-4 border-amber-600 mb-2">
              Step 3: Target Mean Compressive Strength Calculation (Clause 4.2)
            </h3>
            <div className="bg-slate-50 p-3 rounded border border-slate-200 text-[11px] space-y-1.5 font-mono">
              <p>• Standard Deviation (s) from Table 2 = <strong>{outputs.standardDeviation} N/mm²</strong></p>
              <p>• Factor X from Table 1 for {inputs.grade} = <strong>{outputs.xFactor} N/mm²</strong></p>
              <div className="bg-white p-2 rounded border border-slate-300">
                <p>Case A: f'ck = fck + 1.65 × s = {outputs.fck} + (1.65 × {outputs.standardDeviation}) = <strong>{(outputs.fck + 1.65 * outputs.standardDeviation).toFixed(2)} N/mm²</strong></p>
                <p className="mt-1">Case B: f'ck = fck + X = {outputs.fck} + {outputs.xFactor} = <strong>{(outputs.fck + outputs.xFactor).toFixed(2)} N/mm²</strong></p>
              </div>
              <p className="text-amber-800 font-bold font-sans">
                =&gt; Adopted Governing Target Mean Strength (f'target) = {outputs.fTarget.toFixed(2)} N/mm²
              </p>
            </div>
          </div>

          {/* STEP 4: Water-Cement Ratio */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 p-2 border-l-4 border-amber-600 mb-2">
              Step 4: Selection of Water-Cement Ratio (Clause 5.2 & IS 456 Table 5)
            </h3>
            <div className="bg-slate-50 p-3 rounded border border-slate-200 text-[11px] space-y-1 font-mono">
              <p>• Estimated w/c ratio based on IS 10262:2019 Fig. 1 Curve = {outputs.calculatedWC.toFixed(3)}</p>
              <p>• Maximum permissible free w/c ratio for '{inputs.exposureCondition}' exposure (IS 456 Table 5) = {outputs.maxPermissibleWC.toFixed(3)}</p>
              <p className="text-emerald-700 font-bold font-sans">
                =&gt; Adopted Free Water-Cement Ratio = {outputs.adoptedWC.toFixed(3)} (Satisfies IS 456 Table 5 durability limit)
              </p>
            </div>
          </div>

          {/* STEP 5: Water Content */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 p-2 border-l-4 border-amber-600 mb-2">
              Step 5: Selection of Water Content (Clause 5.3 & Table 4)
            </h3>
            <div className="bg-slate-50 p-3 rounded border border-slate-200 text-[11px] space-y-1 font-mono">
              <p>• Base water content for {inputs.maxAggregateSize} mm aggregate (50 mm slump) = {outputs.baseWater} kg/m³</p>
              <p>• Slump adjustment (+3% per 25 mm above 50 mm) = {outputs.slumpAdjustedWater} kg/m³</p>
              {inputs.useAdmixture ? (
                <p>• Chemical Admixture water reduction ({inputs.admixtureReductionPercent}% reduction) = {outputs.finalWater} kg/m³</p>
              ) : (
                <p>• Without chemical admixture, net water = {outputs.finalWater} kg/m³</p>
              )}
              <p className="font-bold text-slate-900 font-sans">=&gt; Final Net Mixing Water Content = {outputs.finalWater} kg/m³ (Litres)</p>
            </div>
          </div>

          {/* STEP 6: Cementitious Content */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 p-2 border-l-4 border-amber-600 mb-2">
              Step 6: Calculation of Cementitious Material Content (Clause 5.4)
            </h3>
            <div className="bg-slate-50 p-3 rounded border border-slate-200 text-[11px] space-y-1 font-mono">
              <p>• Total Cementitious Content = Net Water / w/c = {outputs.finalWater} / {outputs.adoptedWC.toFixed(3)} = {outputs.baseCementitious} kg/m³</p>
              <p>• Minimum cement content for '{inputs.exposureCondition}' exposure (IS 456 Table 5) = {outputs.minCementRequired} kg/m³</p>
              <p className="text-emerald-700 font-bold font-sans">
                =&gt; Adopted Total Cementitious Content = {outputs.totalCementitious} kg/m³ (&gt;= {outputs.minCementRequired} kg/m³ Minimum Check PASSED)
              </p>
              <p>• Cement (OPC): {outputs.cementContent} kg/m³ {outputs.mineralContent > 0 ? `| Mineral Replacement (${inputs.mineralAdmixture}): ${outputs.mineralContent} kg/m³` : ''}</p>
              <p className="text-slate-600">• Maximum cement content limit (450 kg/m³ per Clause 8.2.4.2): PASSED</p>
            </div>
          </div>

          {/* STEP 7: Aggregate Proportions */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 p-2 border-l-4 border-amber-600 mb-2">
              Step 7: Proportion of Volume of Coarse and Fine Aggregate (Clause 5.5)
            </h3>
            <div className="bg-slate-50 p-3 rounded border border-slate-200 text-[11px] space-y-1 font-mono">
              <p>• Base Coarse Aggregate volume ratio for {inputs.sandZone} (at w/c = 0.50) = {outputs.coarseAggBaseVolumeRatio}</p>
              <p>• Correction for w/c ratio = {outputs.coarseAggCorrectedVolumeRatio}</p>
              {inputs.placingMethod === 'Pumping' && (
                <p>• Pumping reduction (10% per Clause 5.5.2) applied</p>
              )}
              <p className="font-bold text-slate-900 font-sans">
                =&gt; Final Volume Fractions: Coarse Aggregate = {outputs.coarseAggFinalVolumeRatio} | Fine Aggregate = {outputs.fineAggFinalVolumeRatio}
              </p>
            </div>
          </div>

          {/* STEP 8: Absolute Volume Calculations */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 p-2 border-l-4 border-amber-600 mb-2">
              Step 8: Absolute Volume Calculations per 1 m³ (Clause 5.6)
            </h3>
            <table className="w-full text-[11px] border border-slate-300 font-mono">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="p-1.5 font-sans font-semibold text-slate-600">a) Absolute Volume of Concrete</td>
                  <td className="p-1.5 font-bold">1.0000 m³</td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <td className="p-1.5 font-sans font-semibold text-slate-600">b) Volume of Entrapped Air (IS 10262 Table 3)</td>
                  <td className="p-1.5">{outputs.airContentVolume.toFixed(4)} m³</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-1.5 font-sans font-semibold text-slate-600">c) Volume of Cement [Mass / (SG × 1000)]</td>
                  <td className="p-1.5">{outputs.volCement.toFixed(4)} m³</td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <td className="p-1.5 font-sans font-semibold text-slate-600">d) Volume of Water [Mass / (1.0 × 1000)]</td>
                  <td className="p-1.5">{outputs.volWater.toFixed(4)} m³</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-1.5 font-sans font-semibold text-slate-600">e) Volume of Chemical Admixture</td>
                  <td className="p-1.5">{outputs.volAdmixture.toFixed(4)} m³</td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50/50 font-bold">
                  <td className="p-1.5 font-sans text-slate-900">f) Volume of All-In Aggregate [1 - (b+c+d+e)]</td>
                  <td className="p-1.5 text-blue-700">{outputs.volTotalAggregate.toFixed(4)} m³</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-1.5 font-sans font-semibold text-slate-600">g) Mass of Coarse Aggregate (SSD)</td>
                  <td className="p-1.5 font-bold">{outputs.coarseAggSSD} kg/m³</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-sans font-semibold text-slate-600">h) Mass of Fine Aggregate (SSD)</td>
                  <td className="p-1.5 font-bold">{outputs.fineAggSSD} kg/m³</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* STEP 9: Final Mix Proportions Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 p-2 border-l-4 border-amber-600 mb-2">
              Step 9: Final Recommended Mix Proportions (per 1 m³ SSD Condition)
            </h3>
            <table className="w-full text-[11px] border-collapse border border-slate-400 text-left">
              <thead>
                <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-400">
                  <th className="p-2 border-r border-slate-400">Material</th>
                  <th className="p-2 border-r border-slate-400">SSD Mass (kg/m³)</th>
                  <th className="p-2 border-r border-slate-400">Specific Gravity</th>
                  <th className="p-2 border-r border-slate-400">Volume (m³)</th>
                  <th className="p-2">Normalized Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 font-mono">
                <tr>
                  <td className="p-2 font-bold font-sans">Cement ({inputs.cementType.replace('_', ' ')})</td>
                  <td className="p-2 font-bold">{outputs.cementContent} kg</td>
                  <td className="p-2">{inputs.specificGravityCement}</td>
                  <td className="p-2">{outputs.volCement.toFixed(4)}</td>
                  <td className="p-2 font-bold">1.00</td>
                </tr>
                {outputs.mineralContent > 0 && (
                  <tr className="bg-slate-50">
                    <td className="p-2 font-bold font-sans">{inputs.mineralAdmixture} ({inputs.mineralPercentage}%)</td>
                    <td className="p-2">{outputs.mineralContent} kg</td>
                    <td className="p-2">{inputs.specificGravityMineral}</td>
                    <td className="p-2">{outputs.volMineral.toFixed(4)}</td>
                    <td className="p-2">{(outputs.mineralContent / outputs.cementContent).toFixed(2)}</td>
                  </tr>
                )}
                <tr>
                  <td className="p-2 font-bold font-sans">Water (Net Mixing)</td>
                  <td className="p-2 font-bold">{outputs.finalWater} kg (L)</td>
                  <td className="p-2">1.00</td>
                  <td className="p-2">{outputs.volWater.toFixed(4)}</td>
                  <td className="p-2">{outputs.adoptedWC.toFixed(3)}</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-2 font-bold font-sans">Fine Aggregate (Sand - {inputs.sandZone})</td>
                  <td className="p-2 font-bold">{outputs.fineAggSSD} kg</td>
                  <td className="p-2">{inputs.specificGravityFA}</td>
                  <td className="p-2">{(outputs.volTotalAggregate * outputs.fineAggFinalVolumeRatio).toFixed(4)}</td>
                  <td className="p-2 font-bold">{(outputs.fineAggSSD / outputs.cementContent).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold font-sans">Coarse Aggregate (MSA {inputs.maxAggregateSize}mm)</td>
                  <td className="p-2 font-bold">{outputs.coarseAggSSD} kg</td>
                  <td className="p-2">{inputs.specificGravityCA}</td>
                  <td className="p-2">{(outputs.volTotalAggregate * outputs.coarseAggFinalVolumeRatio).toFixed(4)}</td>
                  <td className="p-2 font-bold">{(outputs.coarseAggSSD / outputs.cementContent).toFixed(2)}</td>
                </tr>
                {outputs.admixtureSSD > 0 && (
                  <tr className="bg-slate-50">
                    <td className="p-2 font-bold font-sans">Chemical Admixture ({inputs.admixtureDosagePercent}%)</td>
                    <td className="p-2 font-bold">{outputs.admixtureSSD} kg</td>
                    <td className="p-2">{inputs.specificGravityAdmixture}</td>
                    <td className="p-2">{outputs.volAdmixture.toFixed(4)}</td>
                    <td className="p-2">{(outputs.admixtureSSD / outputs.cementContent).toFixed(3)}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Design Ratio Banner */}
            <div className="mt-3 bg-amber-50 border border-amber-300 p-3 rounded text-center">
              <span className="text-[11px] font-bold uppercase text-amber-900 block">
                Design Mix Proportion (Cement : Sand : Coarse Aggregate)
              </span>
              <span className="text-lg font-extrabold text-slate-900 font-mono block mt-0.5">
                {outputs.ratioString}
              </span>
              <span className="text-[10px] text-slate-600 block mt-1 font-mono">
                Water-Cement Ratio: {outputs.adoptedWC.toFixed(3)} | Slump: {inputs.workabilitySlump} mm
              </span>
            </div>
          </div>

          {/* STEP 10: Field Moisture Corrections */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 p-2 border-l-4 border-amber-600 mb-2">
              Step 10: Field Moisture Adjustments (Clause 5.7)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono">
              <div className="p-2.5 bg-slate-50 border border-slate-300 rounded">
                <p className="font-bold text-slate-800 font-sans mb-1">Adjusted Batch Weights (Wet):</p>
                <p>• Wet Sand to weigh: <strong>{outputs.wetAggFA} kg/m³</strong></p>
                <p>• Wet Aggregate to weigh: <strong>{outputs.wetAggCA} kg/m³</strong></p>
              </div>
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded">
                <p className="font-bold text-blue-900 font-sans mb-1">Actual Water to Add:</p>
                <p>• Free surface water: {outputs.freeWaterContributed} kg/m³</p>
                <p className="text-blue-800 font-bold">• Water to add in mixer: <strong>{outputs.actualWaterToAdd} Litres/m³</strong></p>
              </div>
            </div>
          </div>

          {/* STEP 11: 50 kg Bag Batching */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 p-2 border-l-4 border-amber-600 mb-2">
              Step 11: Site Batching Quantities (Per 50 kg Bag of Cement)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
              <div className="p-2 bg-slate-100 border border-slate-300 rounded">
                <span className="text-slate-600 block text-[10px]">Cement</span>
                <span className="font-mono font-bold text-slate-900 text-sm">50 kg</span>
                <span className="text-[10px] text-slate-500 block">1 Bag</span>
              </div>
              <div className="p-2 bg-slate-100 border border-slate-300 rounded">
                <span className="text-slate-600 block text-[10px]">Water to Add</span>
                <span className="font-mono font-bold text-blue-700 text-sm">{bagWater} L</span>
                <span className="text-[10px] text-slate-500 block">Adjusted</span>
              </div>
              <div className="p-2 bg-slate-100 border border-slate-300 rounded">
                <span className="text-slate-600 block text-[10px]">Wet Sand (FA)</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{bagFA} kg</span>
                <span className="text-[10px] text-slate-500 block">Per Bag</span>
              </div>
              <div className="p-2 bg-slate-100 border border-slate-300 rounded">
                <span className="text-slate-600 block text-[10px]">Wet Aggregate (CA)</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{bagCA} kg</span>
                <span className="text-[10px] text-slate-500 block">Per Bag</span>
              </div>
            </div>
            {Number(bagAdmix) > 0 && (
              <p className="text-[10.5px] font-mono text-slate-600 mt-1.5 text-center">
                Admixture Dosage per 50 kg Bag: <strong>{bagAdmix} ml</strong>
              </p>
            )}
          </div>

          {/* STEP 12: Durability & Compliance */}
          <div className="bg-emerald-50 border border-emerald-300 p-3 rounded">
            <h4 className="text-xs font-bold text-emerald-900 uppercase">
              Step 12: Code Compliance Verification (IS 456 & IS 10262)
            </h4>
            <p className="text-[11px] text-emerald-800 mt-1">
              ✓ <strong>Minimum Cement Check:</strong> {outputs.cementContent} kg/m³ ≥ {outputs.minCementRequired} kg/m³ (IS 456 Table 5 Durability Pass)<br/>
              ✓ <strong>Maximum w/c Check:</strong> {outputs.adoptedWC.toFixed(3)} ≤ {outputs.maxPermissibleWC.toFixed(3)} (Durability Pass)<br/>
              ✓ <strong>Maximum OPC Limit:</strong> {outputs.cementContent} kg/m³ ≤ 450 kg/m³ (IS 456 Clause 8.2.4.2 Pass)
            </p>
          </div>

          {/* Formal Signatures Section */}
          <div className="pt-6 border-t-2 border-slate-900">
            <div className="grid grid-cols-3 gap-4 text-center text-[11px]">
              <div>
                <div className="h-12 border-b border-slate-400 flex items-end justify-center pb-1">
                  <span className="font-mono text-[10px] text-slate-400">[Signed]</span>
                </div>
                <span className="font-bold text-slate-900 block mt-1.5">Prepared By:</span>
                <span className="text-slate-700 font-semibold block text-[10.5px]">{metadata.preparedBy}</span>
                <span className="text-slate-500 text-[10px] block">Civil QC Engineer</span>
              </div>

              <div>
                <div className="h-12 border-b border-slate-400 flex items-end justify-center pb-1">
                  <span className="font-mono text-[10px] text-slate-400">[Signed]</span>
                </div>
                <span className="font-bold text-slate-900 block mt-1.5">Checked By:</span>
                <span className="text-slate-700 font-semibold block text-[10.5px]">{metadata.checkedBy}</span>
                <span className="text-slate-500 text-[10px] block">Chief Structural Consultant</span>
              </div>

              <div>
                <div className="h-12 border-b border-slate-400 flex items-end justify-center pb-1">
                  <span className="font-mono text-[10px] text-slate-400">[Seal & Sign]</span>
                </div>
                <span className="font-bold text-slate-900 block mt-1.5">Approved By / Client:</span>
                <span className="text-slate-700 font-semibold block text-[10.5px]">{metadata.approvedBy || metadata.clientName}</span>
                <span className="text-slate-500 text-[10px] block">Engineer-in-Charge</span>
              </div>
            </div>

            <div className="mt-6 text-center text-[10px] text-slate-500 border-t border-slate-200 pt-2 font-mono">
              Concrete Mix Design Pro Suite | Conforming to Bureau of Indian Standards (IS 10262:2019 & IS 456:2000)
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
