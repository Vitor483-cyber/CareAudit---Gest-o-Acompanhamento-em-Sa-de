import { useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import {
  ActiveTab,
  Appointment,
  CareAuditState,
  ConsultationReport,
  InsuranceAuditItem,
  Patient,
  UserProfile,
} from './types';
import { getInitialSeedData, STORAGE_KEY } from './data/seedData';
import { getProfessionalDisplayName } from './utils/formatters';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { PatientsView } from './components/PatientsView';
import { ConsultationFormView } from './components/ConsultationFormView';
import { ReportViewer } from './components/ReportViewer';
import { AuditView } from './components/AuditView';
import { ConfirmResetModal } from './components/ConfirmResetModal';
import { LoginView } from './components/LoginView';

function isValidState(parsed: unknown): parsed is CareAuditState {
  if (!parsed || typeof parsed !== 'object') return false;
  const obj = parsed as Partial<CareAuditState>;
  return (
    Array.isArray(obj.patients) &&
    Array.isArray(obj.appointments) &&
    Array.isArray(obj.reports) &&
    Array.isArray(obj.audits)
  );
}

function loadLocalFallbackState(): CareAuditState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialSeedData();
    const parsed = JSON.parse(raw);
    if (isValidState(parsed)) {
      return parsed;
    }
  } catch {
    // Fallback to seed data if storage is malformed
  }
  return getInitialSeedData();
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(false);
  const [authError, setAuthError] = useState('');

  const [state, setState] = useState<CareAuditState>(loadLocalFallbackState);
  const [activeTab, setActiveTab] = useState<ActiveTab>('inicio');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [prefillAppointment, setPrefillAppointment] =
    useState<Appointment | null>(null);
  const [prefillPatientId, setPrefillPatientId] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        setCloudSynced(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setDataLoading(true);
    setCloudSynced(false);

    const loadUserData = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid, 'workspace', 'main');
        const snap = await getDoc(userDocRef);

        if (cancelled) return;

        if (snap.exists() && isValidState(snap.data())) {
          const cloudState = snap.data() as CareAuditState;
          setState(cloudState);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudState));
          } catch {
            // Ignore localStorage quota issues
          }
        } else {
          const initialData = getInitialSeedData();
          setState(initialData);
          await setDoc(userDocRef, {
            ...initialData,
            updatedAt: new Date().toISOString(),
            ownerEmail: user.email ?? '',
          });
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
          } catch {
            // Ignore localStorage quota issues
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados do Firestore:', err);
      } finally {
        if (!cancelled) {
          setDataLoading(false);
          setCloudSynced(true);
        }
      }
    };

    loadUserData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors gracefully
    }

    if (!user || !cloudSynced || dataLoading) return;

    const persistToCloud = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid, 'workspace', 'main');
        await setDoc(
          userDocRef,
          {
            ...state,
            updatedAt: new Date().toISOString(),
            ownerEmail: user.email ?? '',
          },
          { merge: true }
        );
      } catch (err) {
        console.error('Erro ao salvar no Firestore:', err);
      }
    };

    persistToCloud();
  }, [state, user, cloudSynced, dataLoading]);

  const handleLoginGoogle = async () => {
    setAuthError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code?: string }).code)
          : '';
      if (code === 'auth/popup-closed-by-user') {
        setAuthError('O login foi cancelado antes de ser concluído.');
      } else if (code === 'auth/unauthorized-domain') {
        setAuthError(
          'Este domínio ainda não está autorizado no Firebase Authentication (adicione-o em Domínios Autorizados).'
        );
      } else {
        setAuthError(
          'Não foi possível entrar com a conta Google. Verifique sua conexão e tente novamente.'
        );
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActiveReportId(null);
      setSelectedPatientId(null);
      setPrefillAppointment(null);
      setPrefillPatientId(null);
      setActiveTab('inicio');
    } catch (err) {
      console.error('Erro ao sair:', err);
    }
  };

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

  const handleDeleteAppointment = (appointmentId: string) => {
    setState((prev) => ({
      ...prev,
      appointments: prev.appointments.filter((a) => a.id !== appointmentId),
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

  const handleDeletePatient = (patientId: string) => {
    setState((prev) => ({
      ...prev,
      patients: prev.patients.filter((p) => p.id !== patientId),
      appointments: prev.appointments.filter((a) => a.patientId !== patientId),
      reports: prev.reports.filter((r) => r.patientId !== patientId),
      audits: prev.audits.filter((au) => au.patientId !== patientId),
    }));
    if (selectedPatientId === patientId) {
      setSelectedPatientId(null);
    }
    if (prefillPatientId === patientId) {
      setPrefillPatientId(null);
      setPrefillAppointment(null);
    }
    setActiveReportId(null);
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

  const handleDeleteReport = (reportId: string) => {
    setState((prev) => ({
      ...prev,
      reports: prev.reports.filter((r) => r.id !== reportId),
    }));
    if (activeReportId === reportId) {
      setActiveReportId(null);
    }
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

  const handleDeleteAudit = (auditId: string) => {
    setState((prev) => ({
      ...prev,
      audits: prev.audits.filter((a) => a.id !== auditId),
    }));
  };

  const handleConfirmReset = () => {
    const fresh = getInitialSeedData();
    setState(fresh);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      // Ignore quota issues
    }
    setActiveReportId(null);
    setSelectedPatientId(null);
    setPrefillAppointment(null);
    setPrefillPatientId(null);
    setActiveTab('inicio');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-slate-200 px-6 py-5 text-sm font-medium text-slate-700 shadow-xs">
          Verificando sessão segura...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginView
        onLoginGoogle={handleLoginGoogle}
        loading={authLoading}
        errorMessage={authError}
      />
    );
  }

  const userProfile: UserProfile = {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  };

  const professionalName = getProfessionalDisplayName(
    user.displayName,
    user.email
  );

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
        user={userProfile}
        onLogout={handleLogout}
      />

      <main className="lg:pl-64 pb-24 lg:pb-12 print:pl-0 print:pb-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 print:p-0 print:max-w-none">
          {dataLoading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-600 shadow-xs animate-view-enter">
              Sincronizando dados de pacientes e auditorias na nuvem...
            </div>
          ) : activeReport && activeReportPatient ? (
            <ReportViewer
              report={activeReport}
              patient={activeReportPatient}
              professionalName={professionalName}
              professionalEmail={user.email}
              onBack={() => setActiveReportId(null)}
              onDeleteReport={handleDeleteReport}
            />
          ) : activeTab === 'inicio' ? (
            <DashboardView
              user={userProfile}
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
              onDeleteAppointment={handleDeleteAppointment}
              onDeleteReport={handleDeleteReport}
            />
          ) : activeTab === 'pacientes' ? (
            <PatientsView
              patients={state.patients}
              reports={state.reports}
              professionalName={professionalName}
              selectedPatientId={selectedPatientId}
              onSelectPatient={setSelectedPatientId}
              onAddPatient={handleAddPatient}
              onUpdatePatient={handleUpdatePatient}
              onDeletePatient={handleDeletePatient}
              onStartConsultationForPatient={handleStartConsultationForPatient}
              onOpenReport={handleOpenReport}
              onDeleteReport={handleDeleteReport}
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
              onCancel={() => handleSelectTab('inicio')}
            />
          ) : (
            <AuditView
              audits={state.audits}
              patients={state.patients}
              onUpdateAudit={handleUpdateAudit}
              onAddAudit={handleAddAudit}
              onDeleteAudit={handleDeleteAudit}
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
