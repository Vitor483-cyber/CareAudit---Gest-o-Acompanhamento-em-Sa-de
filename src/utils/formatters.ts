import { ConsultationReport, Patient } from '../types';

export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function formatLongDateBR(dateStr: string): string {
  if (!dateStr) return '—';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function getInitials(name: string): string {
  const cleaned = name
    .replace(/^(Sr\.|Sra\.|Dona|Dr\.|Dra\.|Enf\.)\s+/i, '')
    .trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'PS';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

export function getProfessionalDisplayName(
  displayName: string | null | undefined,
  email?: string | null
): string {
  const trimmed = displayName?.trim();
  if (trimmed) return trimmed;
  if (email?.trim()) {
    const local = email.split('@')[0]?.trim();
    if (local) return local;
  }
  return 'Profissional de Saúde';
}

export function buildWhatsAppLink(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, '');
  const fullNumber = digits.startsWith('55') ? digits : `55${digits}`;
  if (message) {
    return `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`;
  }
  return `https://wa.me/${fullNumber}`;
}

export function formatReportForWhatsApp(
  report: ConsultationReport,
  patient: Patient,
  professionalName = 'Profissional de Saúde'
): string {
  const lines = [
    `🩺 *RELATÓRIO DE ACOMPANHAMENTO EM SAÚDE*`,
    `_CareAudit · ${professionalName}_`,
    ``,
    `👤 *Paciente:* ${patient.name} (${patient.age} anos)`,
    `📅 *Data da Consulta:* ${formatDateBR(report.date)}`,
    `🏥 *Especialidade:* ${report.specialty}`,
    `👨‍⚕️ *Médico(a) Assistente:* ${report.doctorName}`,
    ``,
    `📋 *Motivo / Queixas Principais:*`,
    report.reasonAndComplaints.trim(),
    ``,
    `📝 *Resumo da Avaliação Médica:*`,
    report.medicalSummary.trim(),
    ``,
    `💊 *Medicamentos & Ajustes:*`,
    report.medicationChanges.trim() || 'Sem alterações na prescrição atual.',
    ``,
    `🔬 *Exames Solicitados e Prazos:*`,
    report.requestedExams.trim() || 'Nenhum exame solicitado nesta consulta.',
    ``,
    `📌 *Próximos Passos & Retorno:*`,
    report.nextStepsAndReturn.trim(),
    ``,
    `Qualquer dúvida sobre as orientações ou autorizações do convênio, estou à disposição!`,
    `*${professionalName}* · CareAudit`,
  ];

  return lines.join('\n');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
