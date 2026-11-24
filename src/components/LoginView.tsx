import React, { useState } from 'react';
import { ShieldCheck, Lock, Sparkles, AlertCircle } from 'lucide-react';

interface LoginViewProps {
  onLoginGoogle: () => Promise<void>;
  loading?: boolean;
  errorMessage?: string;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginGoogle,
  loading = false,
  errorMessage = '',
}) => {
  const [submitting, setSubmitting] = useState(false);

  const handleClick = async () => {
    setSubmitting(true);
    try {
      await onLoginGoogle();
    } finally {
      setSubmitting(false);
    }
  };

  const isBusy = loading || submitting;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center px-4 py-10">
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1E3A8A]">
              CareAudit
            </h1>
            <p className="text-sm font-medium text-[#0F766E] mt-0.5">
              Gestão, Auditoria &amp; Acompanhamento em Saúde
            </p>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm">
            Acesse seus prontuários, agendas, auditorias de convênios e relatórios
            familiares salvos com segurança na nuvem.
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-900 rounded-2xl p-3.5 text-xs font-medium flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          type="button"
          disabled={isBusy}
          onClick={handleClick}
          className="w-full min-h-[52px] px-5 py-3 rounded-2xl bg-[#1E3A8A] hover:bg-blue-950 disabled:opacity-60 text-white text-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-3 cursor-pointer"
        >
          <span>
            {isBusy ? 'Conectando ao Google...' : 'Entrar com Conta Google'}
          </span>
        </button>

        <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
            <span>Dados isolados por conta autenticada via Google e Firestore.</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
            <span>Sincronização automática entre celular, tablet e computador.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
