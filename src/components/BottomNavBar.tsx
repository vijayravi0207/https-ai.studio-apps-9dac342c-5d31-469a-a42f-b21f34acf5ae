import React from 'react';
import { Calculator, Sparkles, Layers, Droplets, BookCheck } from 'lucide-react';
import { TRANSLATIONS, Language } from '../utils/translations';

export type ActiveTab = 'design' | 'scc' | 'nominal' | 'field' | 'standards';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  lang: Language;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onChangeTab,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  const navItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'design',
      label: t.tabDesignMix,
      icon: <Calculator className="w-4 h-4" />,
    },
    {
      id: 'scc',
      label: t.tabScc,
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'nominal',
      label: t.tabNominalMix,
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 'field',
      label: t.tabFieldAdj,
      icon: <Droplets className="w-4 h-4" />,
    },
    {
      id: 'standards',
      label: t.tabStandards,
      icon: <BookCheck className="w-4 h-4" />,
    },
  ];

  return (
    <nav aria-label="Bottom Navigation" className="sticky bottom-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-1 py-1.5 shadow-lg">
      <div className="grid grid-cols-5 items-center justify-around gap-0.5">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-150 min-h-[48px] ${
                isActive
                  ? 'text-amber-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-amber-500/20 text-amber-300' : ''
                }`}
              >
                {item.icon}
              </div>
              <span className="text-[9.5px] mt-0.5 truncate max-w-[58px] text-center leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

