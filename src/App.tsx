import { useEffect, useMemo, useState } from 'react';
import {
  ActiveTab,
  Appointment,
  CareAuditState,
  ConsultationReport,
  InsuranceAuditItem,
  Patient,
} from './types';
import { getInitialSeedData, STORAGE_KEY } from './data/seedData';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { PatientsView } from './components/PatientsView';
import { ConsultationFormView } from './components/ConsultationFormView';
import { ReportViewer } from './components/ReportViewer';
import { AuditView } from './components/AuditView';
import { ConfirmResetModal } from './components/ConfirmResetModal';

function loadInitialState(): CareAuditState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialSeedData();
    const parsed = JSON.parse(raw) as Partial<CareAuditState>;
    if (
      Array.isArray(parsed.patients) &&
      Array.isArray(parsed.appointments) &&
      Array.isArray(parsed.reports) &&
      Array.isArray(parsed.audits)
    ) {
      return parsed as CareAuditState;
    }
  } catch {
    // Fallback to seed data if storage is malformed
  }
  return getInitialSeedData();
}

export default function App() {
  const [state, setState] = useState<CareAuditState>(loadInitialState);
  const [activeTab, setActiveTab] = useState<ActiveTab>('inicio');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [prefillAppointment, setPrefillAppointment] =
    useState<Appointment | null>(null);
  const [prefillPatientId, setPrefillPatientId] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  // Persist to localStorage on every state update
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors gracefully
    }
  }, [state]);

  const pendingAuditsCount = useMemo(
    () =>
      state.audits.filter(
        (a) => a.status === 'Em análise' || a.status === 'Negado - Recurso em andamento'
      ).length,
    [state.audits]
  );

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveReportId(null);
    if (tab !== 'pacientes') {
      setSelectedPatientId(null);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPatient = (patientId: string) => {
    setActiveReportId(null);
    setSelectedPatientId(patientId);
    setActiveTab('pacientes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReport = (reportId: string) => {
    setActiveReportId(reportId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartConsultationFromAppointment = (appointment: Appointment) => {
    setActiveReportId(null);
    setPrefillAppointment(appointment);
    setPrefillPatientId(appointment.patientId);
    setActiveTab('nova-consulta');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartConsultationForPatient = (patientId: string) => {
    setActiveReportId(null);
    setPrefillAppointment(null);
    setPrefillPatientId(patientId);
    setActiveTab('nova-consulta');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddAppointment = (
    appointment: Omit<Appointment, 'id' | 'completed'>
  ) => {
    const newApp: Appointment = {
      ...appointment,
      id: `app-${Date.now()}`,
      completed: false,
    };
    setState((prev) => ({
      ...prev,
      appointments: [...prev.appointments, newApp],
    }));
  };

  const handleAddPatient = (patient: Omit<Patient, 'id'>) => {
    const newPat: Patient = {
      ...patient,
      id: `pat-${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      patients: [...prev.patients, newPat],
    }));
    setSelectedPatientId(newPat.id);
  };

  const handleUpdatePatient = (updated: Patient) => {
    setState((prev) => ({
      ...prev,
      patients: prev.patients.map((p) => (p.id === updated.id ? updated : p)),
    }));
  };

  const handleSaveReport = (
    reportData: Omit<ConsultationReport, 'id' | 'createdAt'>,
    linkedAppointmentId?: string
  ) => {
    const newReport: ConsultationReport = {
      ...reportData,
      id: `rep-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      reports: [newReport, ...prev.reports],
      appointments: linkedAppointmentId
        ? prev.appointments.map((a) =>
            a.id === linkedAppointmentId ? { ...a, completed: true } : a
          )
        : prev.appointments,
    }));

    setPrefillAppointment(null);
    setPrefillPatientId(null);
    setActiveReportId(newReport.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateAudit = (updated: InsuranceAuditItem) => {
    setState((prev) => ({
      ...prev,
      audits: prev.audits.map((a) => (a.id === updated.id ? updated : a)),
    }));
  };

  const handleAddAudit = (audit: Omit<InsuranceAuditItem, 'id'>) => {
    const newAudit: InsuranceAuditItem = {
      ...audit,
      id: `aud-${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      audits: [newAudit, ...prev.audits],
    }));
  };

  const handleConfirmReset = () => {
    const fresh = getInitialSeedData();
    setState(fresh);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    setActiveReportId(null);
    setSelectedPatientId(null);
    setPrefillAppointment(null);
    setPrefillPatientId(null);
    setActiveTab('inicio');
  };

  const activeReport = activeReportId
    ? state.reports.find((r) => r.id === activeReportId) ?? null
    : null;
  const activeReportPatient = activeReport
    ? state.patients.find((p) => p.id === activeReport.patientId) ?? null
    : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 overflow-x-hidden">
      <Navigation
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onRequestReset={() => setShowResetModal(true)}
        pendingAuditsCount={pendingAuditsCount}
      />

      <main className="lg:pl-64 pb-24 lg:pb-12 print:pl-0 print:pb-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 print:p-0 print:max-w-none">
          {activeReport && activeReportPatient ? (
            <ReportViewer
              report={activeReport}
              patient={activeReportPatient}
              onBack={() => setActiveReportId(null)}
            />
          ) : activeTab === 'inicio' ? (
            <DashboardView
              patients={state.patients}
              appointments={state.appointments}
              reports={state.reports}
              pendingAuditsCount={pendingAuditsCount}
              onNavigateTab={handleSelectTab}
              onStartConsultationFromAppointment={
                handleStartConsultationFromAppointment
              }
              onOpenReport={handleOpenReport}
              onOpenPatient={handleOpenPatient}
              onAddAppointment={handleAddAppointment}
            />
          ) : activeTab === 'pacientes' ? (
            <PatientsView
              patients={state.patients}
              reports={state.reports}
              selectedPatientId={selectedPatientId}
              onSelectPatient={setSelectedPatientId}
              onAddPatient={handleAddPatient}
              onUpdatePatient={handleUpdatePatient}
              onStartConsultationForPatient={handleStartConsultationForPatient}
              onOpenReport={handleOpenReport}
            />
          ) : activeTab === 'nova-consulta' ? (
            <ConsultationFormView
              patients={state.patients}
              prefillAppointment={prefillAppointment}
              prefillPatientId={prefillPatientId}
              onSaveReport={handleSaveReport}
              onClearPrefill={() => {
                setPrefillAppointment(null);
                setPrefillPatientId(null);
              }}
            />
          ) : (
            <AuditView
              audits={state.audits}
              patients={state.patients}
              onUpdateAudit={handleUpdateAudit}
              onAddAudit={handleAddAudit}
            />
          )}
        </div>
      </main>

      <ConfirmResetModal
        open={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleConfirmReset}
      />
    </div>
  );
}
