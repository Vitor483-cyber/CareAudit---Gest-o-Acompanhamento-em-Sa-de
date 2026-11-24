import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  FileText,
  HeartPulse,
  MessageCircle,
  Pill,
  Plus,
  Search,
  ShieldAlert,
  Stethoscope,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import { ConsultationReport, Medication, Patient } from '../types';
import {
  buildWhatsAppLink,
  formatDateBR,
  getInitials,
} from '../utils/formatters';

interface PatientsViewProps {
  patients: Patient[];
  reports: ConsultationReport[];
  selectedPatientId: string | null;
  onSelectPatient: (id: string | null) => void;
  onAddPatient: (patient: Omit<Patient, 'id'>) => void;
  onUpdatePatient: (patient: Patient) => void;
  onStartConsultationForPatient: (patientId: string) => void;
  onOpenReport: (reportId: string) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  patients,
  reports,
  selectedPatientId,
  onSelectPatient,
  onAddPatient,
  onUpdatePatient,
  onStartConsultationForPatient,
  onOpenReport,
}) => {
  const [search, setSearch] = useState('');
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);

  // New patient modal form state
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyRel, setNewFamilyRel] = useState('Filho(a)');
  const [newFamilyPhone, setNewFamilyPhone] = useState('');
  const [newHealthPlan, setNewHealthPlan] = useState('');
  const [newHealthPlanCode, setNewHealthPlanCode] = useState('');
  const [newDiagnosesText, setNewDiagnosesText] = useState('');
  const [newAllergiesText, setNewAllergiesText] = useState('');
  const [formError, setFormError] = useState('');

  // Inline add medication inside detail view
  const [showAddMed, setShowAddMed] = useState(false);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medSchedule, setMedSchedule] = useState('');

  // Inline add allergy inside detail view
  const [newAllergyInput, setNewAllergyInput] = useState('');
  const [showAddAllergy, setShowAddAllergy] = useState(false);

  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.healthPlan.toLowerCase().includes(q) ||
        p.diagnoses.some((d) => d.toLowerCase().includes(q)) ||
        p.familyContactName.toLowerCase().includes(q)
    );
  }, [patients, search]);

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId) ?? null,
    [patients, selectedPatientId]
  );

  const patientReports = useMemo(() => {
    if (!selectedPatient) return [];
    return reports
      .filter((r) => r.patientId === selectedPatient.id)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [reports, selectedPatient]);

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    const ageNum = parseInt(newAge, 10);
    if (
      !newName.trim() ||
      Number.isNaN(ageNum) ||
      ageNum <= 0 ||
      !newFamilyName.trim() ||
      !newFamilyPhone.trim() ||
      !newHealthPlan.trim()
    ) {
      setFormError(
        'Preencha nome, idade válida, familiar responsável, telefone e convênio.'
      );
      return;
    }

    const diagnoses = newDiagnosesText
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const allergies = newAllergiesText
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    onAddPatient({
      name: newName.trim(),
      age: ageNum,
      familyContactName: newFamilyName.trim(),
      familyRelationship: newFamilyRel.trim() || 'Familiar',
      familyPhone: newFamilyPhone.trim(),
      healthPlan: newHealthPlan.trim(),
      healthPlanCode: newHealthPlanCode.trim() || 'Não informado',
      diagnoses,
      allergies,
      medications: [],
    });

    setShowNewPatientModal(false);
    setNewName('');
    setNewAge('');
    setNewFamilyName('');
    setNewFamilyRel('Filho(a)');
    setNewFamilyPhone('');
    setNewHealthPlan('');
    setNewHealthPlanCode('');
    setNewDiagnosesText('');
    setNewAllergiesText('');
    setFormError('');
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !medName.trim() || !medDosage.trim()) return;
    const med: Medication = {
      id: `med-${Date.now()}`,
      name: medName.trim(),
      dosage: medDosage.trim(),
      schedule: medSchedule.trim() || 'Conforme prescrição',
    };
    onUpdatePatient({
      ...selectedPatient,
      medications: [...selectedPatient.medications, med],
    });
    setMedName('');
    setMedDosage('');
    setMedSchedule('');
    setShowAddMed(false);
  };

  const handleRemoveMedication = (medId: string) => {
    if (!selectedPatient) return;
    onUpdatePatient({
      ...selectedPatient,
      medications: selectedPatient.medications.filter((m) => m.id !== medId),
    });
  };

  const handleAddAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !newAllergyInput.trim()) return;
    onUpdatePatient({
      ...selectedPatient,
      allergies: [...selectedPatient.allergies, newAllergyInput.trim()],
    });
    setNewAllergyInput('');
    setShowAddAllergy(false);
  };

  // DETAIL VIEW
  if (selectedPatient) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onSelectPatient(null)}
            className="min-h-[44px] px-3 -ml-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-[#0F766E] rounded-xl hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Todos os Pacientes</span>
          </button>

          <button
            type="button"
            onClick={() => onStartConsultationForPatient(selectedPatient.id)}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-teal-800 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 whitespace-nowrap transition-colors"
          >
            <Stethoscope className="w-4 h-4 shrink-0" />
            <span>Nova Consulta</span>
          </button>
        </div>

        {/* Patient Header Card */}
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#1E3A8A] text-white font-bold text-lg flex items-center justify-center shrink-0">
                {getInitials(selectedPatient.name)}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {selectedPatient.name}
                </h1>
                <p className="text-sm text-slate-600 tabular-nums mt-0.5">
                  {selectedPatient.age} anos · {selectedPatient.healthPlan}
                </p>
                <p className="text-xs font-mono text-slate-500 mt-0.5 tabular-nums">
                  Carteirinha: {selectedPatient.healthPlanCode}
                </p>
              </div>
            </div>

            <a
              href={buildWhatsAppLink(
                selectedPatient.familyPhone,
                `Olá ${selectedPatient.familyContactName}, aqui é a Enf. Débora Gomes sobre o acompanhamento de ${selectedPatient.name}.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>WhatsApp ({selectedPatient.familyContactName})</span>
            </a>
          </div>

          <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">
                Familiar Responsável
              </span>
              <span className="font-medium text-slate-900">
                {selectedPatient.familyContactName} (
                {selectedPatient.familyRelationship})
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">
                Telefone de Contato
              </span>
              <span className="font-medium text-slate-900 tabular-nums">
                {selectedPatient.familyPhone}
              </span>
            </div>
          </div>
        </section>

        {/* Allergies Highlight Block (Soft Red Clinical Alert) */}
        <section
          aria-label="Alergias do paciente"
          className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-700 shrink-0" />
              <h2 className="text-base font-bold text-red-950">
                Alergias e Contraindicações
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowAddAllergy(!showAddAllergy)}
              className="min-h-[40px] px-3 rounded-xl bg-white/80 hover:bg-white border border-red-200 text-xs font-semibold text-red-900 inline-flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </button>
          </div>

          {selectedPatient.allergies.length === 0 ? (
            <p className="text-sm text-red-900/80">
              Nenhuma alergia registrada até o momento.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {selectedPatient.allergies.map((allergy, idx) => (
                <li
                  key={idx}
                  className="text-sm font-semibold text-red-950 flex items-start gap-2"
                >
                  <ShieldAlert className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                  <span>{allergy}</span>
                </li>
              ))}
            </ul>
          )}

          {showAddAllergy && (
            <form onSubmit={handleAddAllergy} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Ex: Sulfa (edema labial)"
                value={newAllergyInput}
                onChange={(e) => setNewAllergyInput(e.target.value)}
                className="flex-1 min-h-[44px] px-3.5 rounded-xl border border-red-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <button
                type="submit"
                className="min-h-[44px] px-4 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-semibold whitespace-nowrap"
              >
                Salvar
              </button>
            </form>
          )}
        </section>

        {/* Diagnoses + Continuous Medications Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Diagnoses */}
          <section className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-[#1E3A8A]" />
              <h2 className="text-base font-bold text-slate-900">
                Diagnósticos Principais
              </h2>
            </div>

            {selectedPatient.diagnoses.length === 0 ? (
              <p className="text-sm text-slate-500">
                Nenhum diagnóstico cadastrado.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {selectedPatient.diagnoses.map((diag, idx) => (
                  <li
                    key={idx}
                    className="py-2.5 first:pt-1 last:pb-1 text-sm font-medium text-slate-800"
                  >
                    {diag}
                  </li>
                ))}
              </ul>
            )}

            {selectedPatient.notes && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500 block mb-1">
                  Observações de Enfermagem
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedPatient.notes}
                </p>
              </div>
            )}
          </section>

          {/* Continuous Medications */}
          <section className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-[#0F766E]" />
                <h2 className="text-base font-bold text-slate-900">
                  Medicamentos em Uso Contínuo
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowAddMed(!showAddMed)}
                className="min-h-[40px] px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-[#0F766E] inline-flex items-center gap-1 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>

            {showAddMed && (
              <form
                onSubmit={handleAddMedication}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="Nome do medicamento"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    className="min-h-[44px] px-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                  <input
                    type="text"
                    placeholder="Dosagem (ex: 50 mg)"
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                    className="min-h-[44px] px-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Horário / Posologia (ex: 08:00 após café)"
                  value={medSchedule}
                  onChange={(e) => setMedSchedule(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMed(false)}
                    className="min-h-[40px] px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="min-h-[40px] px-4 rounded-xl bg-[#0F766E] text-white text-xs font-semibold"
                  >
                    Salvar Medicamento
                  </button>
                </div>
              </form>
            )}

            {selectedPatient.medications.length === 0 ? (
              <p className="text-sm text-slate-500">
                Nenhum medicamento contínuo registrado.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {selectedPatient.medications.map((med) => (
                  <div
                    key={med.id}
                    className="py-3 first:pt-1 last:pb-1 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900">
                        {med.name}{' '}
                        <span className="font-semibold text-[#0F766E] tabular-nums">
                          — {med.dosage}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5 tabular-nums">
                        {med.schedule}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedication(med.id)}
                      aria-label={`Remover ${med.name}`}
                      className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Consultation and Exam History */}
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Histórico de Consultas e Relatórios
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Clique em qualquer atendimento para visualizar, imprimir ou enviar para a família
              </p>
            </div>
          </div>

          {patientReports.length === 0 ? (
            <div className="py-6 text-center space-y-3 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                Ainda não há relatórios de consulta registrados para este paciente.
              </p>
              <button
                type="button"
                onClick={() => onStartConsultationForPatient(selectedPatient.id)}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-teal-50 text-[#0F766E] text-sm font-semibold hover:bg-teal-100 transition-colors"
              >
                Registrar Primeira Consulta
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {patientReports.map((rep) => (
                <button
                  key={rep.id}
                  type="button"
                  onClick={() => onOpenReport(rep.id)}
                  className="w-full py-4 first:pt-1 last:pb-1 text-left flex items-center justify-between gap-4 hover:bg-slate-50/80 rounded-xl px-2 -mx-2 transition-colors"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900">
                        {rep.specialty} · {rep.doctorName}
                      </div>
                      <div className="text-xs text-slate-500 tabular-nums mt-0.5">
                        Atendimento em {formatDateBR(rep.date)}
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1 mt-1">
                        {rep.medicalSummary}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Pacientes
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Prontuários simplificados, alergias e contatos familiares diretos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewPatientModal(true)}
          className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-teal-800 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4 shrink-0" />
          <span>+ Novo Paciente</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, diagnóstico, convênio ou familiar..."
          className="w-full min-h-[48px] pl-11 pr-4 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-700"
        />
      </div>

      {/* Patient Cards */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
          <p className="text-sm text-slate-500">
            Nenhum paciente encontrado para "{search}".
          </p>
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="min-h-[44px] px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
            >
              Limpar Busca
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPatients.map((patient) => {
            const repCount = reports.filter(
              (r) => r.patientId === patient.id
            ).length;
            return (
              <div
                key={patient.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between gap-4 hover:border-teal-300 transition-colors"
              >
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => onSelectPatient(patient.id)}
                    className="w-full text-left flex items-start justify-between gap-3 group focus-visible:outline-none"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-[#1E3A8A] text-white font-bold text-sm flex items-center justify-center shrink-0">
                        {getInitials(patient.name)}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-base font-bold text-slate-900 group-hover:text-[#0F766E] transition-colors">
                          {patient.name}
                        </h2>
                        <div className="text-xs text-slate-600 tabular-nums mt-0.5">
                          {patient.age} anos · {patient.healthPlan}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Responsável: {patient.familyContactName} (
                          {patient.familyRelationship})
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0F766E] shrink-0 mt-1" />
                  </button>

                  {patient.allergies.length > 0 && (
                    <div className="bg-red-50/90 border border-red-200 rounded-xl px-3 py-2 flex items-start gap-2 text-xs text-red-950">
                      <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                      <span className="font-medium">
                        <strong>Alergias:</strong> {patient.allergies.join(', ')}
                      </span>
                    </div>
                  )}

                  {patient.diagnoses.length > 0 && (
                    <div className="text-xs text-slate-600 line-clamp-2">
                      <strong className="text-slate-700">Diagnósticos:</strong>{' '}
                      {patient.diagnoses.join(' · ')}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500 tabular-nums">
                    {patient.medications.length} med. contínuos · {repCount}{' '}
                    {repCount === 1 ? 'relatório' : 'relatórios'}
                  </span>

                  <div className="flex items-center gap-2">
                    <a
                      href={buildWhatsAppLink(patient.familyPhone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[40px] px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => onSelectPatient(patient.id)}
                      className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-800 hover:text-[#0F766E] text-xs font-semibold transition-colors whitespace-nowrap"
                    >
                      Abrir Ficha
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: + Novo Paciente */}
      {showNewPatientModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-patient-title"
        >
          <div className="w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-2xl shadow-xl border border-slate-200 p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h3
                id="new-patient-title"
                className="text-lg font-bold text-slate-900"
              >
                Cadastrar Novo Paciente
              </h3>
              <button
                type="button"
                onClick={() => setShowNewPatientModal(false)}
                aria-label="Fechar"
                className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-800">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nome Completo do Paciente
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Sra. Helena Martins"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Idade
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    placeholder="Ex: 78"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Familiar Responsável
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Camila Martins"
                    value={newFamilyName}
                    onChange={(e) => setNewFamilyName(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Parentesco
                  </label>
                  <input
                    type="text"
                    placeholder="Filha / Cônjuge"
                    value={newFamilyRel}
                    onChange={(e) => setNewFamilyRel(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    WhatsApp Familiar
                  </label>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={newFamilyPhone}
                    onChange={(e) => setNewFamilyPhone(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Convênio / Plano de Saúde
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Omint / Bradesco Saúde"
                    value={newHealthPlan}
                    onChange={(e) => setNewHealthPlan(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nº da Carteirinha (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="0000 0000 0000"
                    value={newHealthPlanCode}
                    onChange={(e) => setNewHealthPlanCode(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Diagnósticos Principais (separados por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Hipertensão Arterial, Arritmia Cardíaca"
                  value={newDiagnosesText}
                  onChange={(e) => setNewDiagnosesText(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Alergias (separadas por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Dipirona, Contraste Iodado"
                  value={newAllergiesText}
                  onChange={(e) => setNewAllergiesText(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPatientModal(false)}
                  className="min-h-[44px] px-5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 rounded-xl bg-[#0F766E] hover:bg-teal-800 text-white text-sm font-semibold"
                >
                  Salvar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
