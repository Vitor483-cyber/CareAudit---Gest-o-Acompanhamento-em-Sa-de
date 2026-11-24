import React, { useState } from 'react';
import {
  ArrowRight,
  CalendarClock,
  ClipboardCheck,
  FileText,
  MapPin,
  Plus,
  Stethoscope,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import {
  ActiveTab,
  Appointment,
  ConsultationReport,
  Patient,
  UserProfile,
} from '../types';
import {
  formatDateBR,
  getInitials,
  getProfessionalDisplayName,
} from '../utils/formatters';
import { UserAvatar } from './UserAvatar';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface DashboardViewProps {
  user: UserProfile;
  patients: Patient[];
  appointments: Appointment[];
  reports: ConsultationReport[];
  pendingAuditsCount: number;
  onNavigateTab: (tab: ActiveTab) => void;
  onStartConsultationFromAppointment: (appointment: Appointment) => void;
  onOpenReport: (reportId: string) => void;
  onOpenPatient: (patientId: string) => void;
  onAddAppointment: (appointment: Omit<Appointment, 'id' | 'completed'>) => void;
  onDeleteAppointment: (appointmentId: string) => void;
  onDeleteReport: (reportId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  patients,
  appointments,
  reports,
  pendingAuditsCount,
  onNavigateTab,
  onStartConsultationFromAppointment,
  onOpenReport,
  onOpenPatient,
  onAddAppointment,
  onDeleteAppointment,
  onDeleteReport,
}) => {
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [patientId, setPatientId] = useState(patients[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('14:00');
  const [formError, setFormError] = useState('');

  const [appointmentToDelete, setAppointmentToDelete] =
    useState<Appointment | null>(null);
  const [reportToDelete, setReportToDelete] =
    useState<ConsultationReport | null>(null);

  const displayName = getProfessionalDisplayName(user.displayName, user.email);

  const upcomingAppointments = appointments
    .filter((a) => !a.completed)
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));

  const recentReports = [...reports].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  const todayFormatted = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !title.trim() || !specialty.trim() || !doctorName.trim()) {
      setFormError('Preencha paciente, título, especialidade e médico.');
      return;
    }
    onAddAppointment({
      patientId,
      title: title.trim(),
      specialty: specialty.trim(),
      doctorName: doctorName.trim(),
      location: location.trim() || 'Consultório particular',
      date,
      time,
    });
    setShowNewAppointment(false);
    setTitle('');
    setSpecialty('');
    setDoctorName('');
    setLocation('');
    setFormError('');
  };

  const getPatient = (id: string) => patients.find((p) => p.id === id);

  return (
    <div className="space-y-6 animate-view-enter">
      {/* Greeting Header */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <UserAvatar
            name={user.displayName}
            email={user.email}
            photoURL={user.photoURL}
            sizeClass="w-12 h-12 sm:w-14 sm:h-14"
            textSizeClass="text-base"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#0F766E] capitalize">
              {todayFormatted}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5 truncate">
              Olá, {displayName}
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Resumo assistencial dos seus pacientes particulares e pendências de convênio.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('nova-consulta')}
          className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-teal-800 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-xs transition-all duration-150 active:scale-[0.99] whitespace-nowrap shrink-0"
        >
          <Stethoscope className="w-4 h-4 shrink-0" />
          <span>Registrar Nova Consulta</span>
        </button>
      </section>

      {/* Summary Metric Cards */}
      <section
        aria-label="Resumo do dia"
        className="grid grid-cols-1 sm:grid-cols-3 gap-3.5"
      >
        <button
          type="button"
          onClick={() => onNavigateTab('pacientes')}
          className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 text-left hover:border-teal-300 hover:shadow-sm transition-all duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Pacientes Ativos
            </span>
            <span className="w-9 h-9 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">
              {patients.length}
            </span>
            <span className="text-xs font-medium text-[#0F766E] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Ver prontuários <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('proximos-compromissos');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 text-left hover:border-blue-300 hover:shadow-sm transition-all duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Próximas Consultas / Exames
            </span>
            <span className="w-9 h-9 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center">
              <CalendarClock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">
              {upcomingAppointments.length}
            </span>
            <span className="text-xs font-medium text-[#1E3A8A] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Agenda ativa <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('auditoria')}
          className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 text-left hover:border-amber-300 hover:shadow-sm transition-all duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Pendências de Convênio
            </span>
            <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">
              {pendingAuditsCount}
            </span>
            <span className="text-xs font-medium text-amber-800 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Auditar guias <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </button>
      </section>

      {/* Main 2-column split on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Upcoming Appointments */}
        <section
          id="proximos-compromissos"
          className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Próximos Compromissos
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inicie o registro da consulta diretamente pelo agendamento
              </p>
            </div>
            <button
              type="button"
              disabled={patients.length === 0}
              onClick={() => {
                setPatientId(patients[0]?.id ?? '');
                setShowNewAppointment(true);
              }}
              className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
            >
              <Plus className="w-4 h-4 text-[#0F766E]" />
              <span>Agendar</span>
            </button>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="py-10 text-center space-y-3 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                Nenhum compromisso pendente na agenda.
              </p>
              {patients.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setPatientId(patients[0]?.id ?? '');
                    setShowNewAppointment(true);
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-teal-50 text-[#0F766E] text-sm font-semibold hover:bg-teal-100 transition-colors"
                >
                  + Agendar Novo Compromisso
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcomingAppointments.map((app) => {
                const patient = getPatient(app.patientId);
                return (
                  <div
                    key={app.id}
                    className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 text-[#1E3A8A] font-bold text-sm flex items-center justify-center shrink-0">
                        {patient ? getInitials(patient.name) : 'PA'}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="text-sm font-bold text-slate-900">
                          {app.title}
                        </div>
                        <div className="text-xs font-medium text-[#0F766E]">
                          <button
                            type="button"
                            onClick={() => patient && onOpenPatient(patient.id)}
                            className="hover:underline text-left"
                          >
                            {patient?.name ?? 'Paciente'}
                          </button>
                        </div>
                        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5 tabular-nums">
                          <span className="font-semibold text-slate-700">
                            {formatDateBR(app.date)} às {app.time}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{app.specialty}</span>
                          <span aria-hidden="true">·</span>
                          <span>{app.doctorName}</span>
                        </div>
                        {app.location && (
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{app.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onStartConsultationFromAppointment(app)}
                        className="flex-1 sm:flex-initial min-h-[44px] px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-teal-800 text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
                      >
                        <Stethoscope className="w-4 h-4 shrink-0" />
                        <span>Iniciar Consulta</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAppointmentToDelete(app)}
                        aria-label={`Excluir compromisso ${app.title}`}
                        title="Excluir compromisso"
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent Reports Ready for Families */}
        <section className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Relatórios Recentes
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Prontos para envio no WhatsApp ou impressão em PDF
              </p>
            </div>
          </div>

          {recentReports.length === 0 ? (
            <div className="py-8 text-center border-t border-slate-100 space-y-3">
              <p className="text-sm text-slate-500">
                Nenhum relatório registrado ainda.
              </p>
              <button
                type="button"
                onClick={() => onNavigateTab('nova-consulta')}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-teal-50 text-[#0F766E] text-sm font-semibold hover:bg-teal-100 transition-colors"
              >
                Criar Primeiro Relatório
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentReports.slice(0, 5).map((rep) => {
                const patient = getPatient(rep.patientId);
                return (
                  <div key={rep.id} className="py-3.5 first:pt-1 last:pb-1 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">
                          {patient?.name ?? 'Paciente'}
                        </div>
                        <div className="text-xs text-slate-500 tabular-nums mt-0.5">
                          {formatDateBR(rep.date)} · {rep.specialty} · {rep.doctorName}
                        </div>
                      </div>
                      <FileText className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {rep.medicalSummary}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenReport(rep.id)}
                        className="min-h-[40px] flex-1 px-3 py-2 rounded-xl bg-slate-50 hover:bg-teal-50 text-[#1E3A8A] hover:text-[#0F766E] border border-slate-200/80 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>Abrir Relatório Profissional</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setReportToDelete(rep)}
                        aria-label={`Excluir relatório de ${rep.specialty}`}
                        title="Excluir relatório"
                        className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Modal: Agendar Novo Compromisso */}
      {showNewAppointment && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4 animate-backdrop-enter"
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-app-title"
        >
          <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-xl border border-slate-200 p-6 max-h-[90vh] overflow-y-auto space-y-4 animate-modal-enter">
            <div className="flex items-center justify-between">
              <h3 id="new-app-title" className="text-lg font-bold text-slate-900">
                Novo Compromisso Assistencial
              </h3>
              <button
                type="button"
                onClick={() => setShowNewAppointment(false)}
                aria-label="Fechar"
                className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
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
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Descrição do Compromisso
                </label>
                <input
                  type="text"
                  placeholder="Ex: Retorno Cardiologista / Coleta de Exames"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Especialidade
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Cardiologia"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Médico(a)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Dr. Ricardo Vasconcelos"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Data
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Horário
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Local / Clínica (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Hospital Santa Catarina - Sala 412"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewAppointment(false)}
                  className="min-h-[44px] px-5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 rounded-xl bg-[#0F766E] hover:bg-teal-800 text-white text-sm font-semibold"
                >
                  Salvar Compromisso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        open={Boolean(appointmentToDelete)}
        title="Excluir Compromisso"
        description={
          appointmentToDelete
            ? `Deseja remover "${appointmentToDelete.title}" (${formatDateBR(appointmentToDelete.date)} às ${appointmentToDelete.time}) da agenda?`
            : ''
        }
        confirmLabel="Excluir Compromisso"
        onClose={() => setAppointmentToDelete(null)}
        onConfirm={() => {
          if (appointmentToDelete) {
            onDeleteAppointment(appointmentToDelete.id);
          }
        }}
      />

      <ConfirmDeleteModal
        open={Boolean(reportToDelete)}
        title="Excluir Relatório de Consulta"
        description={
          reportToDelete
            ? `Deseja excluir o relatório de ${reportToDelete.specialty} (${formatDateBR(reportToDelete.date)})?`
            : ''
        }
        confirmLabel="Excluir Relatório"
        onClose={() => setReportToDelete(null)}
        onConfirm={() => {
          if (reportToDelete) {
            onDeleteReport(reportToDelete.id);
          }
        }}
      />
    </div>
  );
};
