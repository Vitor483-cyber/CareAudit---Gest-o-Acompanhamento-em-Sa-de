export type ActiveTab = 'inicio' | 'pacientes' | 'nova-consulta' | 'auditoria';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  schedule: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  familyContactName: string;
  familyRelationship: string;
  familyPhone: string;
  healthPlan: string;
  healthPlanCode: string;
  diagnoses: string[];
  allergies: string[];
  medications: Medication[];
  notes?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  title: string;
  specialty: string;
  doctorName: string;
  location: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  completed: boolean;
}

export interface ConsultationReport {
  id: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  specialty: string;
  doctorName: string;
  reasonAndComplaints: string;
  medicalSummary: string;
  medicationChanges: string;
  requestedExams: string;
  nextStepsAndReturn: string;
  createdAt: string;
}

export type AuditStatus =
  | 'Em análise'
  | 'Aprovado'
  | 'Negado - Recurso em andamento'
  | 'Concluído';

export interface AuditChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface InsuranceAuditItem {
  id: string;
  patientId: string;
  title: string;
  category: string;
  healthPlan: string;
  protocolNumber: string;
  requestDate: string; // YYYY-MM-DD
  status: AuditStatus;
  checklist: AuditChecklistItem[];
  technicalNotes: string;
}

export interface CareAuditState {
  patients: Patient[];
  appointments: Appointment[];
  reports: ConsultationReport[];
  audits: InsuranceAuditItem[];
}
