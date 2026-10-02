import React, { useState, useMemo } from 'react';
import { MixDesignInputs } from './types/concrete';
import { calculateMixDesign } from './utils/concreteCalculations';
import { Language } from './utils/translations';
import { AndroidFrame } from './components/AndroidFrame';
import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar, ActiveTab } from './components/BottomNavBar';
import { DesignMixTab } from './components/DesignMixTab';
import { NominalMixTab } from './components/NominalMixTab';
import { FieldAdjustmentTab } from './components/FieldAdjustmentTab';
import { StandardsTab } from './components/StandardsTab';
import { BOQTab } from './components/BOQTab';
import { SccDesignTab } from './components/SccDesignTab';
import { WorkabilityAnimationLab } from './components/WorkabilityAnimationLab';
import { MixReportModal } from './components/MixReportModal';
import { ApkDownloadModal } from './components/ApkDownloadModal';

const DEFAULT_MIX_INPUTS: MixDesignInputs = {
  grade: 'M40',
  concreteType: 'RCC',
  cementType: 'PPC',
  specificGravityCement: 2.88,
  exposureCondition: 'Severe',
  maxAggregateSize: 20,
  aggregateShape: 'Angular',
  sandZone: 'Zone II',
  workabilitySlump: 75,
  placingMethod: 'Chute',
  siteControl: 'Good',
  useCustomStdDev: false,
  mineralAdmixture: 'None',
  mineralPercentage: 0,
  specificGravityMineral: 2.2,
  cementitiousIncreasePercent: 0,
  useAdmixture: true,
  admixtureReductionPercent: 23,
  admixtureDosagePercent: 1.0,
  specificGravityAdmixture: 1.145,
  specificGravityCA: 2.74,
  specificGravityFA: 2.65,
  waterAbsorptionCA: 0.5,
  waterAbsorptionFA: 1.0,
  freeMoistureCA: 0,
  freeMoistureFA: 0,
  coarseFractionRatio: 0.6,
};

export default function App() {
  // Default to Tamil 'ta' as requested by user in Tamil, with instant English switch
  const [lang, setLang] = useState<Language>('ta');
  const [activeTab, setActiveTab] = useState<ActiveTab>('design');
  const [isFrameActive, setIsFrameActive] = useState<boolean>(true);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [inputs, setInputs] = useState<MixDesignInputs>(DEFAULT_MIX_INPUTS);

  // Reactive calculation of outputs
  const outputs = useMemo(() => {
    return calculateMixDesign(inputs);
  }, [inputs]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'ta' : 'en'));
  };

  return (
    <AndroidFrame
      isFrameActive={isFrameActive}
      onToggleFrame={() => setIsFrameActive((prev) => !prev)}
      lang={lang}
    >
      {/* Top Android Material 3 App Bar */}
      <TopAppBar
        lang={lang}
        onToggleLang={handleToggleLang}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
      />

      {/* Main Tab Content Area */}
      <main className="flex-1 w-full bg-slate-900/50">
        {activeTab === 'design' && (
          <DesignMixTab
            inputs={inputs}
            setInputs={setInputs}
            outputs={outputs}
            lang={lang}
            onOpenReport={() => setIsReportOpen(true)}
          />
        )}

        {activeTab === 'scc' && <SccDesignTab lang={lang} />}

        {activeTab === 'lab' && <WorkabilityAnimationLab lang={lang} />}

        {activeTab === 'nominal' && <NominalMixTab lang={lang} />}

        {activeTab === 'field' && (
          <FieldAdjustmentTab
            inputs={inputs}
            setInputs={setInputs}
            outputs={outputs}
            lang={lang}
          />
        )}

        {activeTab === 'standards' && (
          <div className="space-y-4">
            <StandardsTab currentGrade={inputs.grade} lang={lang} />
            <BOQTab outputs={outputs} lang={lang} />
          </div>
        )}
      </main>

      {/* Android Mobile Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        lang={lang}
      />

      {/* Official Mix Design Report Modal */}
      <MixReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        inputs={inputs}
        outputs={outputs}
        lang={lang}
      />

      {/* APK Download & Android Installation Modal */}
      <ApkDownloadModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
        lang={lang}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-amber-300 text-xs px-4 py-2 rounded-full border border-amber-500/40 shadow-xl flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </AndroidFrame>
  );
}

