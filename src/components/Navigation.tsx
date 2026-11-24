import React from 'react';
import {
  ClipboardCheck,
  FilePlus2,
  Home,
  RotateCcw,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onRequestReset: () => void;
  pendingAuditsCount: number;
}

const NAV_ITEMS: {
  id: ActiveTab;
  label: string;
  mobileLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'inicio',
    label: 'Início',
    mobileLabel: 'Início',
    icon: Home,
  },
  {
    id: 'pacientes',
    label: 'Pacientes',
    mobileLabel: 'Pacientes',
    icon: Users,
  },
  {
    id: 'nova-consulta',
    label: 'Nova Consulta',
    mobileLabel: 'Nova Consulta',
    icon: FilePlus2,
  },
  {
    id: 'auditoria',
    label: 'Auditoria/Convênio',
    mobileLabel: 'Auditoria/Convênio',
    icon: ClipboardCheck,
  },
];

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  onRequestReset,
  pendingAuditsCount,
}) => {
  return (
    <>
      {/* Mobile Top App Bar (compact 56px) */}
      <header className="lg:hidden sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 flex items-center justify-between print:hidden">
        <button
          type="button"
          onClick={() => onSelectTab('inicio')}
          className="flex items-center gap-2.5 min-h-[44px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 rounded-lg"
        >
          <span className="w-8 h-8 rounded-lg bg-[#0F766E] text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <span className="text-base font-bold tracking-tight text-[#1E3A8A] whitespace-nowrap">
            CareAudit
          </span>
        </button>

        <button
          type="button"
          onClick={onRequestReset}
          title="Restaurar Dados de Demonstração"
          className="min-h-[44px] px-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restaurar Demo</span>
        </button>
      </header>

      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 bg-white border-r border-slate-200 z-30 print:hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <button
            type="button"
            onClick={() => onSelectTab('inicio')}
            className="flex items-center gap-3 text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 rounded-lg"
          >
            <span className="w-9 h-9 rounded-xl bg-[#0F766E] text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <div className="text-lg font-bold tracking-tight text-[#1E3A8A] leading-tight">
                CareAudit
              </div>
              <div className="text-xs text-slate-500 truncate">
                Gestão &amp; Auditoria em Saúde
              </div>
            </div>
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1.5" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center justify-between text-sm font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                  isActive
                    ? 'bg-teal-50 text-[#0F766E] font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? 'text-[#0F766E]' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.id === 'auditoria' && pendingAuditsCount > 0 && (
                  <span className="text-xs font-mono tabular-nums font-semibold text-amber-700">
                    {pendingAuditsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="px-2 py-1">
            <div className="text-sm font-semibold text-slate-900 truncate">
              Enf. Débora Gomes
            </div>
            <div className="text-xs text-slate-500 truncate">
              Enfermeira Auditora &amp; Consultora
            </div>
          </div>

          <button
            type="button"
            onClick={onRequestReset}
            className="w-full min-h-[40px] px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center justify-center gap-2 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>Restaurar Dados de Demonstração</span>
          </button>
        </div>
      </aside>

      {/* Mobile Fixed Bottom Tab Bar (64px height) */}
      <nav
        aria-label="Navegação inferior"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 print:hidden"
      >
        <div className="grid grid-cols-4 h-16 max-w-lg mx-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative flex flex-col items-center justify-center min-h-[44px] px-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-700 ${
                  isActive
                    ? 'text-[#0F766E]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span
                  className={`absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all ${
                    isActive ? 'w-8 bg-[#0F766E]' : 'w-0 bg-transparent'
                  }`}
                />
                <div className="relative">
                  <Icon
                    className={`w-[22px] h-[22px] ${
                      isActive ? 'stroke-[2.25]' : 'stroke-[1.8]'
                    }`}
                  />
                  {item.id === 'auditoria' && pendingAuditsCount > 0 && (
                    <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-600 text-white text-[10px] font-bold tabular-nums flex items-center justify-center">
                      {pendingAuditsCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] leading-tight mt-1 max-w-full truncate ${
                    isActive ? 'font-bold text-[#0F766E]' : 'font-medium'
                  }`}
                >
                  {item.mobileLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
