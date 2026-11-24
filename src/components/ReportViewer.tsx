import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Copy,
  Printer,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { ConsultationReport, Patient } from '../types';
import {
  copyToClipboard,
  formatDateBR,
  formatLongDateBR,
  formatReportForWhatsApp,
} from '../utils/formatters';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface ReportViewerProps {
  report: ConsultationReport;
  patient: Patient;
  professionalName: string;
  professionalEmail?: string | null;
  onBack: () => void;
  onDeleteReport: (reportId: string) => void;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
  report,
  patient,
  professionalName,
  professionalEmail,
  onBack,
  onDeleteReport,
}) => {
  const [copied, setCopied] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const handleCopyWhatsApp = async () => {
    const formatted = formatReportForWhatsApp(report, patient, professionalName);
    const success = await copyToClipboard(formatted);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const reportCode = report.id.toUpperCase().replace(/[^A-Z0-9-]/g, '');

  return (
    <div className="space-y-5 pb-6 animate-view-enter">
      {/* Top Action Bar — hidden during print */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 print:hidden">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] self-start px-3 -ml-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-[#0F766E] rounded-xl hover:bg-white transition-colors whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleCopyWhatsApp}
            className={`min-h-[48px] px-5 py-2.5 rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shadow-xs ${
              copied
                ? 'bg-emerald-700 text-white'
                : 'bg-[#0F766E] hover:bg-teal-800 text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 shrink-0" />
                <span>Resumo copiado para WhatsApp!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 shrink-0" />
                <span>Copiar Resumo para WhatsApp</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="min-h-[48px] px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-[#1E3A8A] font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shadow-xs"
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span>Imprimir / Salvar PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setConfirmDeleteOpen(true)}
            className="min-h-[48px] px-4 py-2.5 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-700 font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            <span>Excluir</span>
          </button>
        </div>
      </div>

      {/* Professional Medical-Advisory Document */}
      <article className="print-report-sheet bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 max-w-4xl mx-auto space-y-7">
        {/* Document Header */}
        <header className="border-b-2 border-[#1E3A8A] pb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-[#1E3A8A] tracking-tight">
                {professionalName}
              </h1>
              <p className="text-sm font-medium text-[#0F766E]">
                Auditoria &amp; Consultoria em Saúde
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                CareAudit · Acompanhamento Clínico e Orientação Familiar
              </p>
            </div>
          </div>

          <div className="sm:text-right text-xs text-slate-600 space-y-0.5 tabular-nums">
            <div className="font-semibold text-slate-900">
              Relatório de Acompanhamento de Consulta
            </div>
            <div>Emissão: {formatLongDateBR(report.date)}</div>
            <div className="font-mono text-slate-500">Ref: {reportCode}</div>
          </div>
        </header>

        {/* Patient & Consultation Identification Grid */}
        <section
          aria-label="Identificação do Paciente e Atendimento"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 border border-slate-200/90 rounded-xl p-4 sm:p-5"
        >
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-slate-500">
              Identificação do Paciente
            </div>
            <div className="text-base font-bold text-slate-900">{patient.name}</div>
            <div className="text-sm text-slate-700 tabular-nums">
              {patient.age} anos · {patient.healthPlan}
            </div>
            <div className="text-xs text-slate-600">
              Familiar responsável: {patient.familyContactName} (
              {patient.familyRelationship}) · {patient.familyPhone}
            </div>
          </div>

          <div className="space-y-1.5 sm:border-l sm:border-slate-200 sm:pl-5">
            <div className="text-xs font-semibold text-slate-500">
              Dados da Consulta Médica
            </div>
            <div className="text-base font-bold text-[#1E3A8A]">
              {report.specialty}
            </div>
            <div className="text-sm text-slate-800 font-medium">
              {report.doctorName}
            </div>
            <div className="text-xs text-slate-600 tabular-nums">
              Data do atendimento: {formatDateBR(report.date)}
            </div>
          </div>
        </section>

        {/* Allergies Safety Callout inside report if patient has allergies */}
        {patient.allergies.length > 0 && (
          <section
            aria-label="Alerta de Alergias"
            className="bg-red-50/90 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
            <div className="text-sm text-red-950">
              <span className="font-bold">Alergias Registradas: </span>
              <span>{patient.allergies.join(' · ')}</span>
            </div>
          </section>
        )}

        {/* Structured Clinical Blocks */}
        <div className="space-y-6">
          <section className="space-y-1.5">
            <h2 className="text-sm font-bold text-[#1E3A8A] border-b border-slate-200 pb-1.5">
              1. Motivo da Consulta e Queixas Principais
            </h2>
            <p className="text-sm sm:text-[15px] text-slate-800 leading-relaxed whitespace-pre-line pt-1">
              {report.reasonAndComplaints}
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm font-bold text-[#1E3A8A] border-b border-slate-200 pb-1.5">
              2. Resumo da Avaliação Médica
            </h2>
            <p className="text-sm sm:text-[15px] text-slate-800 leading-relaxed whitespace-pre-line pt-1">
              {report.medicalSummary}
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm font-bold text-[#1E3A8A] border-b border-slate-200 pb-1.5">
              3. Alterações de Medicamentos e Conduta Terapêutica
            </h2>
            <p className="text-sm sm:text-[15px] text-slate-800 leading-relaxed whitespace-pre-line pt-1">
              {report.medicationChanges ||
                'Prescrição de uso contínuo mantida sem alterações nesta consulta.'}
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm font-bold text-[#1E3A8A] border-b border-slate-200 pb-1.5">
              4. Exames Solicitados e Prazos
            </h2>
            <p className="text-sm sm:text-[15px] text-slate-800 leading-relaxed whitespace-pre-line pt-1">
              {report.requestedExams ||
                'Não houve solicitação de novos exames neste atendimento.'}
            </p>
          </section>

          <section className="space-y-1.5 bg-teal-50/50 border border-teal-200/80 rounded-xl p-4">
            <h2 className="text-sm font-bold text-[#0F766E]">
              5. Próximos Passos e Previsão de Retorno
            </h2>
            <p className="text-sm sm:text-[15px] text-slate-800 leading-relaxed whitespace-pre-line">
              {report.nextStepsAndReturn}
            </p>
          </section>
        </div>

        {/* Formal Professional Footer */}
        <footer className="border-t border-slate-200 pt-6 mt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="text-xs text-slate-500 max-w-md leading-relaxed">
            Este relatório foi elaborado para acompanhamento e orientação da família,
            sintetizando as condutas médicas observadas durante a consulta presencial.
            Em caso de intercorrências clínicas agudas, acionar o pronto-atendimento.
          </div>

          <div className="sm:text-right shrink-0">
            <div className="w-48 sm:ml-auto border-b border-slate-300 mb-1.5" />
            <div className="text-sm font-bold text-[#1E3A8A]">
              {professionalName}
            </div>
            <div className="text-xs text-slate-600">
              Auditoria &amp; Consultoria em Saúde
            </div>
            {professionalEmail && (
              <div className="text-[11px] text-slate-500 mt-0.5">
                {professionalEmail}
              </div>
            )}
          </div>
        </footer>
      </article>

      <ConfirmDeleteModal
        open={confirmDeleteOpen}
        title="Excluir Relatório de Consulta"
        description={`Deseja excluir o relatório de ${report.specialty} (${formatDateBR(report.date)}) de ${patient.name}?`}
        confirmLabel="Excluir Relatório"
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={() => onDeleteReport(report.id)}
      />
    </div>
  );
};
