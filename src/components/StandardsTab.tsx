import React, { useState } from 'react';
import { GradeType } from '../types/concrete';
import { STD_DEV_TABLE, STRIPPING_TIME_GUIDE } from '../utils/concreteCalculations';
import { TRANSLATIONS, Language } from '../utils/translations';
import { BookCheck, ShieldAlert, CheckCircle2, Clock, FileText, Activity } from 'lucide-react';

interface StandardsTabProps {
  currentGrade: GradeType;
  lang: Language;
}

export const StandardsTab: React.FC<StandardsTabProps> = ({ currentGrade, lang }) => {
  const t = TRANSLATIONS[lang];
  const [selectedGrade, setSelectedGrade] = useState<GradeType>(currentGrade || 'M25');

  // Cube Strength Acceptance Tester (IS 456 Table 11 & Clause 16.1)
  const [cube1, setCube1] = useState<number>(31.5);
  const [cube2, setCube2] = useState<number>(29.8);
  const [cube3, setCube3] = useState<number>(32.2);
  const [cube4, setCube4] = useState<number>(30.5);

  const fck = parseInt(selectedGrade.replace('M', ''), 10);
  const s = STD_DEV_TABLE[selectedGrade] || 5.0;

  // Table 11:
  // For M15: Mean >= fck + 0.825*s OR fck + 3; Individual >= fck - 3
  // For M20 & above: Mean >= fck + 0.825*s OR fck + 4; Individual >= fck - 4
  const minAddition = fck === 15 ? 3 : 4;
  const sTerm = Math.round((0.825 * s) * 2) / 2; // rounded to nearest 0.5
  const reqMean = fck + Math.max(sTerm, minAddition);
  const reqIndividualMin = fck - (fck === 15 ? 3 : 4);

  const currentMean = Number(((cube1 + cube2 + cube3 + cube4) / 4).toFixed(2));
  const minTested = Math.min(cube1, cube2, cube3, cube4);

  const isMeanPass = currentMean >= reqMean;
  const isIndividualPass = minTested >= reqIndividualMin;
  const isAllPass = isMeanPass && isIndividualPass;

  return (
    <div className="p-3 md:p-6 space-y-5 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl p-4">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm md:text-base">
          <BookCheck className="w-5 h-5" />
          <span>{t.standardsTitle}</span>
        </div>
        <p className="text-xs text-slate-300 mt-1">
          {lang === 'ta'
            ? 'IS 456:2000 பிரிவு 16 (ஏற்பு விதிகள்) மற்றும் பிரிவு 11 (தட்டு பிரிக்கும் காலம்).'
            : 'IS 456:2000 Section 16 (Acceptance Criteria) & Section 11 (Stripping Times).'}
        </p>
      </div>

      {/* Interactive Cube Acceptance Tester (IS 456 Clause 16.1 & Table 11) */}
      <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
          <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-amber-300">
            <Activity className="w-4 h-4" />
            <span>{t.cubeStrengthTitle}</span>
          </div>
          <span className="text-[10.5px] font-mono text-slate-400">IS 456:2000 Cl. 16.1</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <label htmlFor="test-grade-select" className="text-slate-300 font-medium">{t.grade}:</label>
          <select
            id="test-grade-select"
            aria-label={t.grade}
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value as GradeType)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono font-bold text-xs"
          >
            {(['M15', 'M20', 'M25', 'M30', 'M35', 'M40', 'M45', 'M50'] as GradeType[]).map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* 4 Cube inputs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <label htmlFor="cube-test-1" className="text-slate-400 text-[11px] block mb-1">{t.cubeTest1}</label>
            <input
              id="cube-test-1"
              type="number"
              step="0.1"
              value={cube1}
              onChange={(e) => setCube1(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="cube-test-2" className="text-slate-400 text-[11px] block mb-1">{t.cubeTest2}</label>
            <input
              id="cube-test-2"
              type="number"
              step="0.1"
              value={cube2}
              onChange={(e) => setCube2(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="cube-test-3" className="text-slate-400 text-[11px] block mb-1">{t.cubeTest3}</label>
            <input
              id="cube-test-3"
              type="number"
              step="0.1"
              value={cube3}
              onChange={(e) => setCube3(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="cube-test-4" className="text-slate-400 text-[11px] block mb-1">{t.cubeTest4}</label>
            <input
              id="cube-test-4"
              type="number"
              step="0.1"
              value={cube4}
              onChange={(e) => setCube4(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Verification Result Box */}
        <div
          className={`p-3 rounded-xl border text-xs space-y-1.5 ${
            isAllPass
              ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
              : 'bg-red-950/40 border-red-700/60 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            {isAllPass ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400">
                  {lang === 'ta' ? 'கான்கிரீட் ஏற்புடையது (ACCEPTED - PASS)' : 'CONCRETE ACCEPTED (PASSES IS 456 CL. 16.1)'}
                </span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <span className="text-red-400">
                  {lang === 'ta' ? 'ஏற்புடையதல்ல (NON-COMPLIANT - ACTION NEEDED)' : 'COMPLIANCE FAILED (SEE CL. 16.4 / 17.4)'}
                </span>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11.5px]">
            <div>
              <span>Condition (a) 4-Sample Mean: </span>
              <strong>{currentMean} N/mm²</strong> (Required: ≥ {reqMean} N/mm²) →{' '}
              <span className={isMeanPass ? 'text-emerald-400' : 'text-red-400'}>
                {isMeanPass ? 'PASS' : 'FAIL'}
              </span>
            </div>
            <div>
              <span>Condition (b) Min Individual: </span>
              <strong>{minTested} N/mm²</strong> (Required: ≥ {reqIndividualMin} N/mm²) →{' '}
              <span className={isIndividualPass ? 'text-emerald-400' : 'text-red-400'}>
                {isIndividualPass ? 'PASS' : 'FAIL'}
              </span>
            </div>
          </div>

          {!isAllPass && (
            <p className="text-[10.5px] text-red-300 font-sans pt-1">
              {lang === 'ta'
                ? 'பிரிவு 16.4 படி: கான்கிரீட் போதிய வலிமை பெறவில்லை என்றால், கோர் டெஸ்ட் (Core Test Cl. 17.4) அல்லது சுமை சோதனை (Load Test Cl. 17.6) செய்ய வேண்டும்.'
                : 'As per Clause 16.4: Concrete failing Table 11 must be investigated by Core Testing (Cl. 17.4) or Load Testing (Cl. 17.6).'}
            </p>
          )}
        </div>
      </div>

      {/* Stripping Time of Formwork (IS 456 Clause 11.3) */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-amber-300">
          <Clock className="w-4 h-4" />
          <span>{t.strippingTitle}</span>
        </div>

        <div className="divide-y divide-slate-700/50 text-xs">
          {STRIPPING_TIME_GUIDE.map((item, index) => (
            <div key={index} className="py-2.5 flex items-start justify-between gap-3">
              <div>
                <span className="font-medium text-slate-200 block">{item.type}</span>
                <span className="text-[11px] text-slate-400 block">{item.tamil}</span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-amber-400 font-mono font-bold whitespace-nowrap text-xs border border-slate-700">
                {item.period}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Core Testing & Acceptance (Clause 17.4) */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-200">
          <FileText className="w-4 h-4 text-blue-400" />
          <span>{lang === 'ta' ? 'கோர் டெஸ்ட் விதிகள் (Core Test - IS 456 Cl. 17.4)' : 'Core Test Evaluation (IS 456 Cl. 17.4)'}</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11.5px] leading-relaxed">
          <li>At least 3 core specimens must be drilled and tested in accordance with IS 516.</li>
          <li>Average equivalent cube strength of cores must be ≥ <strong>85%</strong> of the specified grade cube strength.</li>
          <li>No individual core shall have strength &lt; <strong>75%</strong> of the specified grade cube strength.</li>
        </ul>
      </div>
    </div>
  );
};
