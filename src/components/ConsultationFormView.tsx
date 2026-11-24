import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Eraser,
  FileText,
  Pill,
  Stethoscope,
} from 'lucide-react';
import { Appointment, ConsultationReport, Patient } from '../types';

interface ConsultationFormViewProps {
  patients: Patient[];
  prefillAppointment: Appointment | null;
  prefillPatientId: string | null;
  onSaveReport: (
    report: Omit<ConsultationReport, 'id' | 'createdAt'>,
    linkedAppointmentId?: string
  ) => void;
  onClearPrefill: () => void;
  onCancel: () => void;
}

export const ConsultationFormView: React.FC<ConsultationFormViewProps> = ({
  patients,
  prefillAppointment,
  prefillPatientId,
  onSaveReport,
  onClearPrefill,
  onCancel,
}) => {
  const todayISO = new Date().toISOString().slice(0, 10);

  const [patientId, setPatientId] = useState<string>(
    prefillAppointment?.patientId ?? prefillPatientId ?? patients[0]?.id ?? ''
  );
  const [date, setDate] = useState<string>(prefillAppointment?.date ?? todayISO);
  const [specialty, setSpecialty] = useState<string>(
    prefillAppointment?.specialty ?? ''
  );
  const [doctorName, setDoctorName] = useState<string>(
    prefillAppointment?.doctorName ?? ''
  );
  const [reasonAndComplaints, setReasonAndComplaints] = useState<string>('');
  const [medicalSummary, setMedicalSummary] = useState<string>('');
  const [medicationChanges, setMedicationChanges] = useState<string>('');
  const [requestedExams, setRequestedExams] = useState<string>('');
  const [nextStepsAndReturn, setNextStepsAndReturn] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (prefillAppointment) {
      setPatientId(prefillAppointment.patientId);
      setDate(prefillAppointment.date);
      setSpecialty(prefillAppointment.specialty);
      setDoctorName(prefillAppointment.doctorName);
      setReasonAndComplaints(
        `Acompanhamento presencial para ${prefillAppointment.title}.`
      );
    } else if (prefillPatientId) {
      setPatientId(prefillPatientId);
    }
  }, [prefillAppointment, prefillPatientId]);

  const selectedPatient = patients.find((p) => p.id === patientId);

  const handleClearForm = () => {
    setDate(todayISO);
    setSpecialty('');
    setDoctorName('');
    setReasonAndComplaints('');
    setMedicalSummary('');
    setMedicationChanges('');
    setRequestedExams('');
    setNextStepsAndReturn('');
    setError('');
    onClearPrefill();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !patientId ||
      !date ||
      !specialty.trim() ||
      !doctorName.trim() ||
      !reasonAndComplaints.trim() ||
      !medicalSummary.trim() ||
      !nextStepsAndReturn.trim()
    ) {
      setError(
        'Preencha os campos obrigatórios: Paciente, Data, Especialidade, Médico, Motivo, Resumo Médico e Próximos Passos.'
      );
      return;
    }

    setError('');
    onSaveReport(
      {
        patientId,
        date,
        specialty: specialty.trim(),
        doctorName: doctorName.trim(),
        reasonAndComplaints: reasonAndComplaints.trim(),
        medicalSummary: medicalSummary.trim(),
        medicationChanges: medicationChanges.trim(),
        requestedExams: requestedExams.trim(),
        nextStepsAndReturn: nextStepsAndReturn.trim(),
      },
      prefillAppointment?.id
    );
  };

  if (patients.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 animate-view-enter">
        <p className="text-sm text-slate-600">
          Cadastre pelo menos um paciente antes de registrar uma consulta.
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[44px] px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto animate-view-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Nova Consulta &amp; Relatório Familiar
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Preencha os blocos guiados durante ou após o atendimento para gerar o documento da família.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleClearForm}
            className="min-h-[40px] px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Limpar Formulário</span>
          </button>
        </div>
      </div>

      {/* Patient Quick Clinical Context (Allergies & Current Meds) */}
      {selectedPatient && (
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-[#1E3A8A]">
              Contexto Rápido: {selectedPatient.name} ({selectedPatient.age} anos)
            </span>
            <span className="text-slate-500">{selectedPatient.healthPlan}</span>
          </div>

          {selectedPatient.allergies.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 flex items-start gap-2.5 text-xs text-red-950">
              <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Atenção — Alergias: </strong>
                <span>{selectedPatient.allergies.join(' · ')}</span>
              </div>
            </div>
          )}

          {selectedPatient.medications.length > 0 && (
            <div className="flex items-start gap-2 text-xs text-slate-600">
              <Pill className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-800">Em uso contínuo:</strong>{' '}
                {selectedPatient.medications
                  .map((m) => `${m.name} ${m.dosage}`)
                  .join(' · ')}
              </span>
            </div>
          )}
        </section>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-900 rounded-2xl p-4 text-sm font-medium"
          >
            {error}
          </div>
        )}

        {/* Section 1: Identification */}
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#1E3A8A]">
            <Stethoscope className="w-5 h-5" />
            <h2 className="text-base font-bold">
              01. Identificação do Atendimento
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="consult-patient"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Paciente *
              </label>
              <select
                id="consult-patient"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full min-h-[48px] px-3.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.age} anos)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="consult-date"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Data da Consulta *
              </label>
              <input
                id="consult-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full min-h-[48px] px-3.5 rounded-xl border border-slate-300 bg-white text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div>
              <label
                htmlFor="consult-specialty"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Especialidade *
              </label>
              <input
                id="consult-specialty"
                type="text"
                placeholder="Ex: Cardiologia, Geriatria, Ortopedia"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full min-h-[48px] px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div>
              <label
                htmlFor="consult-doctor"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Nome do Médico(a) *
              </label>
              <input
                id="consult-doctor"
                type="text"
                placeholder="Ex: Dr. Ricardo Vasconcelos"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full min-h-[48px] px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Clinical Narrative */}
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#1E3A8A]">
            <FileText className="w-5 h-5" />
            <h2 className="text-base font-bold">
              02. Registro Clínico e Avaliação
            </h2>
          </div>

          <div>
            <label
              htmlFor="consult-reason"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Motivo da Consulta / Queixas Principais *
            </label>
            <textarea
              id="consult-reason"
              rows={3}
              placeholder="Descreva o motivo do atendimento e sintomas relatados pelo paciente ou cuidador..."
              value={reasonAndComplaints}
              onChange={(e) => setReasonAndComplaints(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-300 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div>
            <label
              htmlFor="consult-summary"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Resumo Médico (O que o médico avaliou e concluiu) *
            </label>
            <textarea
              id="consult-summary"
              rows={4}
              placeholder="Sinais vitais aferidos, exame físico, interpretação de exames levados e conduta diagnóstica..."
              value={medicalSummary}
              onChange={(e) => setMedicalSummary(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-300 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>
        </section>

        {/* Section 3: Medications, Exams & Follow-up */}
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#0F766E]">
            <CheckCircle2 className="w-5 h-5" />
            <h2 className="text-base font-bold">
              03. Condutas, Exames e Próximos Passos
            </h2>
          </div>

          <div>
            <label
              htmlFor="consult-meds"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Alterações de Medicamentos (novos remédios, suspensões ou ajustes de dose)
            </label>
            <textarea
              id="consult-meds"
              rows={3}
              placeholder="Ex: Reduzida Losartana para 25mg; iniciada Vitamina D 2000 UI após o almoço..."
              value={medicationChanges}
              onChange={(e) => setMedicationChanges(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-300 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div>
            <label
              htmlFor="consult-exams"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Exames Solicitados e Prazos
            </label>
            <textarea
              id="consult-exams"
              rows={3}
              placeholder="Ex: Ecocardiograma Transtorácico e Hemograma completo até dia 05/12..."
              value={requestedExams}
              onChange={(e) => setRequestedExams(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-300 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div>
            <label
              htmlFor="consult-next"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Próximos Passos / Data de Retorno *
            </label>
            <textarea
              id="consult-next"
              rows={3}
              placeholder="Ex: Enviar guias para autorização do convênio, agendar coleta domiciliar e retornar em 30 dias..."
              value={nextStepsAndReturn}
              onChange={(e) => setNextStepsAndReturn(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-300 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>
        </section>

        <div className="pt-1 pb-4 flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[52px] px-6 py-3.5 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors whitespace-nowrap"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 min-h-[52px] px-6 py-3.5 rounded-2xl bg-[#0F766E] hover:bg-teal-800 text-white text-base font-bold shadow-sm transition-colors flex items-center justify-center gap-2.5"
          >
            <FileText className="w-5 h-5" />
            <span>Salvar e Gerar Relatório Profissional</span>
          </button>
        </div>
      </form>
    </div>
  );
};
