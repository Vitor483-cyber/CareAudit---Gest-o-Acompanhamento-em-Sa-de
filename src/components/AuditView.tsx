import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  CheckSquare,
  Clock,
  Eraser,
  Plus,
  ShieldCheck,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import { AuditStatus, InsuranceAuditItem, Patient } from '../types';
import { formatDateBR } from '../utils/formatters';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface AuditViewProps {
  audits: InsuranceAuditItem[];
  patients: Patient[];
  onUpdateAudit: (audit: InsuranceAuditItem) => void;
  onAddAudit: (audit: Omit<InsuranceAuditItem, 'id'>) => void;
  onDeleteAudit: (auditId: string) => void;
}

const STATUS_OPTIONS: AuditStatus[] = [
  'Em análise',
  'Aprovado',
  'Negado - Recurso em andamento',
  'Concluído',
];

function getStatusBadgeConfig(status: AuditStatus): {
  classes: string;
  icon: React.ComponentType<{ className?: string }>;
} {
  switch (status) {
    case 'Em análise':
      return {
        classes: 'bg-amber-50 text-amber-900 border-amber-200',
        icon: Clock,
      };
    case 'Aprovado':
      return {
        classes: 'bg-teal-50 text-[#0F766E] border-teal-200',
        icon: CheckCircle2,
      };
    case 'Negado - Recurso em andamento':
      return {
        classes: 'bg-red-50 text-red-900 border-red-200',
        icon: AlertCircle,
      };
    case 'Concluído':
      return {
        classes: 'bg-slate-100 text-slate-800 border-slate-200',
        icon: ShieldCheck,
      };
  }
}

export const AuditView: React.FC<AuditViewProps> = ({
  audits,
  patients,
  onUpdateAudit,
  onAddAudit,
  onDeleteAudit,
}) => {
  const [statusFilter, setStatusFilter] = useState<'Todos' | AuditStatus>(
    'Todos'
  );
  const [patientFilter, setPatientFilter] = useState<string>('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [auditToDelete, setAuditToDelete] =
    useState<InsuranceAuditItem | null>(null);

  // Add checklist step inline state per audit item
  const [newStepTextById, setNewStepTextById] = useState<Record<string, string>>(
    {}
  );

  // New audit modal state
  const [newPatientId, setNewPatientId] = useState(patients[0]?.id ?? '');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Autorização de Exame');
  const [newProtocol, setNewProtocol] = useState('');
  const [newStatus, setNewStatus] = useState<AuditStatus>('Em análise');
  const [newNotes, setNewNotes] = useState('');
  const [formError, setFormError] = useState('');

  const filteredAudits = useMemo(() => {
    return audits
      .filter((a) =>
        statusFilter === 'Todos' ? true : a.status === statusFilter
      )
      .filter((a) =>
        patientFilter === 'all' ? true : a.patientId === patientFilter
      )
      .sort((a, b) => b.requestDate.localeCompare(a.requestDate));
  }, [audits, statusFilter, patientFilter]);

  const handleToggleChecklist = (audit: InsuranceAuditItem, itemId: string) => {
    onUpdateAudit({
      ...audit,
      checklist: audit.checklist.map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item
      ),
    });
  };

  const handleDeleteChecklistStep = (
    audit: InsuranceAuditItem,
    itemId: string
  ) => {
    onUpdateAudit({
      ...audit,
      checklist: audit.checklist.filter((item) => item.id !== itemId),
    });
  };

  const handleAddChecklistStep = (
    e: React.FormEvent,
    audit: InsuranceAuditItem
  ) => {
    e.preventDefault();
    const text = (newStepTextById[audit.id] ?? '').trim();
    if (!text) return;
    onUpdateAudit({
      ...audit,
      checklist: [
        ...audit.checklist,
        { id: `chk-${Date.now()}`, label: text, done: false },
      ],
    });
    setNewStepTextById((prev) => ({ ...prev, [audit.id]: '' }));
  };

  const handleClearNotes = (audit: InsuranceAuditItem) => {
    onUpdateAudit({
      ...audit,
      technicalNotes: '',
    });
  };

  const handleCreateAudit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === newPatientId);
    if (!patient || !newTitle.trim()) {
      setFormError('Selecione o paciente e informe o título da solicitação.');
      return;
    }

    onAddAudit({
      patientId: patient.id,
      title: newTitle.trim(),
      category: newCategory,
      healthPlan: patient.healthPlan,
      protocolNumber: newProtocol.trim() || 'Pendente de protocolo',
      requestDate: new Date().toISOString().slice(0, 10),
      status: newStatus,
      checklist: [
        {
          id: `chk-${Date.now()}-1`,
          label: 'Conferir pedido médico com CID-10 e justificativa clínica',
          done: false,
        },
        {
          id: `chk-${Date.now()}-2`,
          label: 'Protocolar documentação junto à operadora',
          done: false,
        },
      ],
      technicalNotes: newNotes.trim(),
    });

    setShowNewModal(false);
    setNewTitle('');
    setNewProtocol('');
    setNewNotes('');
    setFormError('');
  };

  return (
    <div className="space-y-5 animate-view-enter">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Auditoria &amp; Convênios
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Rastreamento de liberações, reembolsos, negativas ANS e notas técnicas.
          </p>
        </div>

        <button
          type="button"
          disabled={patients.length === 0}
          onClick={() => {
            setNewPatientId(patients[0]?.id ?? '');
            setShowNewModal(true);
          }}
          className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-teal-800 disabled:opacity-50 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Nova Solicitação</span>
        </button>
      </div>

      {/* Interactive Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div
          role="group"
          aria-label="Filtrar por status"
          className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-xs"
        >
          {(['Todos', ...STATUS_OPTIONS] as const).map((status) => {
            const active = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#1E3A8A] text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>

        <select
          aria-label="Filtrar por paciente"
          value={patientFilter}
          onChange={(e) => setPatientFilter(e.target.value)}
          className="min-h-[44px] px-3.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-700"
        >
          <option value="all">Todos os pacientes</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Audit List */}
      {filteredAudits.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
          <p className="text-sm text-slate-500">
            Nenhuma solicitação encontrada com os filtros selecionados.
          </p>
          {(statusFilter !== 'Todos' || patientFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('Todos');
                setPatientFilter('all');
              }}
              className="min-h-[44px] px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
            >
              Mostrar Todas
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAudits.map((audit) => {
            const patient = patients.find((p) => p.id === audit.patientId);
            const badge = getStatusBadgeConfig(audit.status);
            const StatusIcon = badge.icon;
            const doneCount = audit.checklist.filter((c) => c.done).length;

            return (
              <article
                key={audit.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5 transition-all duration-150"
              >
                {/* Top Header */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="text-xs font-medium text-slate-500">
                      {audit.category} · {audit.healthPlan}
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {audit.title}
                    </h2>
                    <div className="text-xs sm:text-sm text-slate-600 flex flex-wrap items-center gap-x-2.5 gap-y-1 tabular-nums">
                      <span className="font-semibold text-[#1E3A8A]">
                        {patient?.name ?? 'Paciente'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">
                        Protocolo: {audit.protocolNumber}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Abertura: {formatDateBR(audit.requestDate)}</span>
                    </div>
                  </div>

                  {/* Status Selector, Semantic Indicator & Delete */}
                  <div className="flex flex-wrap sm:flex-nowrap lg:flex-col items-center sm:items-center lg:items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold ${badge.classes}`}
                      >
                        <StatusIcon className="w-4 h-4 shrink-0" />
                        <span>{audit.status}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setAuditToDelete(audit)}
                        aria-label={`Excluir solicitação ${audit.title}`}
                        title="Excluir solicitação"
                        className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <select
                      aria-label={`Alterar status de ${audit.title}`}
                      value={audit.status}
                      onChange={(e) =>
                        onUpdateAudit({
                          ...audit,
                          status: e.target.value as AuditStatus,
                        })
                      }
                      className="min-h-[40px] px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          Alterar: {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Checklist + Technical Notes 2-column split on desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 border-t border-slate-100 pt-4">
                  {/* Checklist */}
                  <div className="lg:col-span-6 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-700">
                        Checklist de Documentos e Etapas
                      </h3>
                      <span className="text-xs font-mono tabular-nums text-slate-500">
                        {doneCount}/{audit.checklist.length} concluídas
                      </span>
                    </div>

                    <div className="space-y-1">
                      {audit.checklist.length === 0 ? (
                        <p className="text-xs text-slate-400 py-2">
                          Nenhuma etapa cadastrada. Adicione uma abaixo.
                        </p>
                      ) : (
                        audit.checklist.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start gap-1 rounded-xl hover:bg-slate-50 transition-colors"
                          >
                            <button
                              type="button"
                              onClick={() => handleToggleChecklist(audit, item.id)}
                              className="flex-1 min-h-[42px] px-2.5 py-2 text-left flex items-start gap-2.5"
                            >
                              {item.done ? (
                                <CheckSquare className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                              )}
                              <span
                                className={`text-xs sm:text-sm leading-snug ${
                                  item.done
                                    ? 'line-through text-slate-400'
                                    : 'text-slate-800'
                                }`}
                              >
                                {item.label}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteChecklistStep(audit, item.id)
                              }
                              aria-label={`Remover etapa ${item.label}`}
                              title="Remover etapa"
                              className="min-h-[38px] min-w-[38px] mt-0.5 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    <form
                      onSubmit={(e) => handleAddChecklistStep(e, audit)}
                      className="flex gap-2 pt-1"
                    >
                      <input
                        type="text"
                        placeholder="Adicionar nova etapa..."
                        value={newStepTextById[audit.id] ?? ''}
                        onChange={(e) =>
                          setNewStepTextById((prev) => ({
                            ...prev,
                            [audit.id]: e.target.value,
                          }))
                        }
                        className="flex-1 min-h-[40px] px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-700"
                      />
                      <button
                        type="submit"
                        className="min-h-[40px] px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold whitespace-nowrap"
                      >
                        + Etapa
                      </button>
                    </form>
                  </div>

                  {/* Technical Audit Notes */}
                  <div className="lg:col-span-6 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label
                        htmlFor={`notes-${audit.id}`}
                        className="block text-xs font-bold text-slate-700"
                      >
                        Anotações Técnicas da Auditoria
                      </label>
                      {audit.technicalNotes && (
                        <button
                          type="button"
                          onClick={() => handleClearNotes(audit)}
                          className="text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded-lg inline-flex items-center gap-1 transition-colors"
                        >
                          <Eraser className="w-3 h-3" />
                          <span>Limpar</span>
                        </button>
                      )}
                    </div>
                    <textarea
                      id={`notes-${audit.id}`}
                      rows={5}
                      placeholder="Registre fundamentação ANS, retornos da operadora, prazos e contatos..."
                      value={audit.technicalNotes}
                      onChange={(e) =>
                        onUpdateAudit({
                          ...audit,
                          technicalNotes: e.target.value,
                        })
                      }
                      className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-xs sm:text-sm text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-700"
                    />
                    <p className="text-[11px] text-slate-400">
                      Alterações salvas automaticamente na nuvem.
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal: + Nova Solicitação de Auditoria */}
      {showNewModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4 animate-backdrop-enter"
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-audit-title"
        >
          <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-xl border border-slate-200 p-6 max-h-[90vh] overflow-y-auto space-y-4 animate-modal-enter">
            <div className="flex items-center justify-between">
              <h3 id="new-audit-title" className="text-lg font-bold text-slate-900">
                Nova Solicitação de Convênio
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                aria-label="Fechar"
                className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAudit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-800">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Paciente
                </label>
                <select
                  value={newPatientId}
                  onChange={(e) => setNewPatientId(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.healthPlan})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Título da Demanda *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Liberação de Ressonância / Pedido de Reembolso"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Categoria
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
                  >
                    <option value="Autorização de Exame">
                      Autorização de Exame
                    </option>
                    <option value="Autorização de Procedimento / Cirurgia">
                      Autorização de Procedimento / Cirurgia
                    </option>
                    <option value="Pedido de Reembolso">
                      Pedido de Reembolso
                    </option>
                    <option value="Contestação de Negativa / ANS">
                      Contestação de Negativa / ANS
                    </option>
                    <option value="Home Care / OPME">Home Care / OPME</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Status Inicial
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) =>
                      setNewStatus(e.target.value as AuditStatus)
                    }
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Número de Protocolo (se já houver)
                </label>
                <input
                  type="text"
                  placeholder="Ex: BR-2026-99102"
                  value={newProtocol}
                  onChange={(e) => setNewProtocol(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Anotações Técnicas Iniciais
                </label>
                <textarea
                  rows={3}
                  placeholder="Observações de auditoria, prazos ou exigências..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="min-h-[44px] px-5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 rounded-xl bg-[#0F766E] hover:bg-teal-800 text-white text-sm font-semibold"
                >
                  Criar Solicitação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        open={Boolean(auditToDelete)}
        title="Excluir Solicitação de Convênio"
        description={
          auditToDelete
            ? `Deseja excluir "${auditToDelete.title}" (Protocolo ${auditToDelete.protocolNumber}) e todo o seu checklist?`
            : ''
        }
        confirmLabel="Excluir Solicitação"
        onClose={() => setAuditToDelete(null)}
        onConfirm={() => {
          if (auditToDelete) {
            onDeleteAudit(auditToDelete.id);
          }
        }}
      />
    </div>
  );
};
