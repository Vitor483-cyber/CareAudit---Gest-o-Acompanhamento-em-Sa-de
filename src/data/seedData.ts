import { CareAuditState } from '../types';

export const STORAGE_KEY = 'careaudit_debora_gomes_v1';

export function getInitialSeedData(): CareAuditState {
  return {
    patients: [
      {
        id: 'pat-antonio',
        name: 'Sr. Antônio Carlos Ferreira',
        age: 76,
        familyContactName: 'Mariana Ferreira',
        familyRelationship: 'Filha',
        familyPhone: '(11) 98432-1190',
        healthPlan: 'Bradesco Saúde Top Nacional',
        healthPlanCode: '4829 1029 8831 004',
        diagnoses: [
          'Hipertensão Arterial Sistêmica (HAS)',
          'Insuficiência Cardíaca Compensada (FE 48%)',
          'Diabetes Mellitus Tipo 2',
        ],
        allergies: [
          'Penicilina (urticária grave)',
          'Dipirona (broncoespasmo)',
        ],
        medications: [
          {
            id: 'med-1',
            name: 'Losartana Potássica',
            dosage: '50 mg',
            schedule: '08:00 (1 comprimido ao acordar)',
          },
          {
            id: 'med-2',
            name: 'Carvedilol',
            dosage: '12,5 mg',
            schedule: '08:00 e 20:00 (após refeições)',
          },
          {
            id: 'med-3',
            name: 'Metformina XR',
            dosage: '850 mg',
            schedule: '20:30 (após o jantar)',
          },
          {
            id: 'med-4',
            name: 'Furosemida',
            dosage: '40 mg',
            schedule: '08:00 (em jejum ou café da manhã)',
          },
          {
            id: 'med-5',
            name: 'Atorvastatina',
            dosage: '20 mg',
            schedule: '22:00 (antes de dormir)',
          },
        ],
        notes:
          'Paciente lúcido, colaborativo. Controle pressórico domiciliar mantido em caderno pela cuidadora.',
      },
      {
        id: 'pat-maria',
        name: 'Dona Maria Helena Souza',
        age: 82,
        familyContactName: 'Paulo Roberto Souza',
        familyRelationship: 'Filho',
        familyPhone: '(11) 99125-4478',
        healthPlan: 'SulAmérica Especial 100',
        healthPlanCode: '8870 0041 5520 912',
        diagnoses: [
          'Osteoartrose de Joelho Bilateral',
          'Hipotireoidismo Primário',
          'Osteopenia em Coluna Lombar',
        ],
        allergies: [
          'Contraste Iodado (reação anafilactoide)',
          'Anti-inflamatórios não esteroidais — AINEs (gastrite erosiva)',
        ],
        medications: [
          {
            id: 'med-6',
            name: 'Levotiroxina Sódica',
            dosage: '50 mcg',
            schedule: '07:00 (em jejum, aguardar 30 min)',
          },
          {
            id: 'med-7',
            name: 'Carbonato de Cálcio + Vitamina D3',
            dosage: '500 mg + 400 UI',
            schedule: '12:30 (junto ao almoço)',
          },
          {
            id: 'med-8',
            name: 'Paracetamol',
            dosage: '750 mg',
            schedule: 'Se dor articular (máximo 3x ao dia)',
          },
        ],
        notes:
          'Deambula com bengala de apoio fora de casa. Necessita acompanhamento presencial para assinatura de guias.',
      },
    ],
    appointments: [
      {
        id: 'app-1',
        patientId: 'pat-antonio',
        title: 'Acompanhamento Cardiologista',
        specialty: 'Cardiologia',
        doctorName: 'Dr. Ricardo Vasconcelos',
        location: 'Instituto Paulista do Coração — Bela Vista',
        date: '2026-11-18',
        time: '14:30',
        completed: false,
      },
      {
        id: 'app-2',
        patientId: 'pat-maria',
        title: 'Retorno Exames & Avaliação Joelho',
        specialty: 'Ortopedia',
        doctorName: 'Dra. Camila Nogueira',
        location: 'Hospital Santa Catarina — Consultório 412',
        date: '2026-11-19',
        time: '10:00',
        completed: false,
      },
      {
        id: 'app-3',
        patientId: 'pat-maria',
        title: 'Controle de Tireoide e Vitamina D',
        specialty: 'Endocrinologia',
        doctorName: 'Dr. Fernando Bastos',
        location: 'Clínica Jardins Saúde',
        date: '2026-11-24',
        time: '09:15',
        completed: false,
      },
    ],
    reports: [
      {
        id: 'rep-1',
        patientId: 'pat-antonio',
        date: '2026-10-29',
        specialty: 'Cardiologia',
        doctorName: 'Dr. Ricardo Vasconcelos',
        reasonAndComplaints:
          'Consulta de acompanhamento trimestral para revisão de controle pressórico e avaliação de leve cansaço aos médios esforços nas últimas duas semanas (ao subir escadas). Sem dor torácica ou edema importante em membros inferiores.',
        medicalSummary:
          'Ao exame físico, pressão arterial aferida em 128/78 mmHg, frequência cardíaca de 66 bpm, ausculta cardíaca rítmica sem sopros novos e pulmões limpos. Médico avaliou que o quadro encontra-se compensado, porém solicitou investigação complementar com Ressonância Magnética Cardíaca para estratificação miocárdica e ajuste fino de diurético apenas se houver retenção hídrica.',
        medicationChanges:
          'Mantida Losartana 50mg (08h), Carvedilol 12,5mg (12/12h) e Atorvastatina 20mg (22h). Reforçada orientação de tomar a Furosemida 40mg estritamente pela manhã para evitar noctúria. Nenhuma medicação suspensa.',
        requestedExams:
          '1) Ressonância Magnética Cardíaca com realce tardio (prazo ideal: até 30 dias — em trâmite de liberação junto ao convênio Bradesco).\n2) Painel laboratorial completo: Função Renal (Ureia e Creatinina), Eletrólitos (Sódio e Potássio), Hemoglobina Glicada e Perfil Lipídico (realizar 7 dias antes do retorno).',
        nextStepsAndReturn:
          'Acompanhar autorização da Ressonância junto ao convênio, agendar coleta domiciliar do laboratório na semana de 10/11 e retornar com o Dr. Ricardo Vasconcelos em 18/11/2026 com todos os laudos em mãos.',
        createdAt: '2026-10-29T16:45:00.000Z',
      },
    ],
    audits: [
      {
        id: 'aud-1',
        patientId: 'pat-antonio',
        title: 'Liberação de Ressonância Magnética Cardíaca',
        category: 'Autorização de Exame de Alta Complexidade',
        healthPlan: 'Bradesco Saúde Top Nacional',
        protocolNumber: 'BR-2026-88412',
        requestDate: '2026-11-02',
        status: 'Em análise',
        checklist: [
          {
            id: 'chk-1',
            label: 'Pedido médico original com CID-10 (I50.9) e justificativa clínica',
            done: true,
          },
          {
            id: 'chk-2',
            label: 'Anexo de Ecocardiograma prévio demonstrando FE 48%',
            done: true,
          },
          {
            id: 'chk-3',
            label: 'Envio pelo portal do prestador e registro de protocolo',
            done: true,
          },
          {
            id: 'chk-4',
            label: 'Acompanhar prazo regulatório ANS (máx. 10 dias úteis para SADT)',
            done: false,
          },
        ],
        technicalNotes:
          'Auditoria do convênio solicitou confirmação sobre uso de marcapasso (paciente não possui dispositivos implantáveis). Resposta protocolada em 10/11 com termo de triagem assinado pela filha Mariana.',
      },
      {
        id: 'aud-2',
        patientId: 'pat-antonio',
        title: 'Pedido de Reembolso — Consulta Cardiologia',
        category: 'Reembolso de Honorários Médicos',
        healthPlan: 'Bradesco Saúde Top Nacional',
        protocolNumber: 'BR-2026-79104',
        requestDate: '2026-10-30',
        status: 'Aprovado',
        checklist: [
          {
            id: 'chk-5',
            label: 'Nota fiscal emitida com CRM do médico e descrição detalhada',
            done: true,
          },
          {
            id: 'chk-6',
            label: 'Comprovante de pagamento nominal ao titular/dependente',
            done: true,
          },
          {
            id: 'chk-7',
            label: 'Conferência de crédito em conta corrente familiar',
            done: true,
          },
        ],
        technicalNotes:
          'Reembolso aprovado integralmente dentro da tabela do plano Top Nacional (R$ 680,00). Previsão de depósito comunicada à filha Mariana.',
      },
      {
        id: 'aud-3',
        patientId: 'pat-maria',
        title: 'Contestação de Negativa — Viscossuplementação (Ácido Hialurônico)',
        category: 'Recurso de Negativa / Rol ANS',
        healthPlan: 'SulAmérica Especial 100',
        protocolNumber: 'SA-2026-44109',
        requestDate: '2026-11-05',
        status: 'Negado - Recurso em andamento',
        checklist: [
          {
            id: 'chk-8',
            label: 'Receber negativa formal por escrito da operadora (RN 395 ANS)',
            done: true,
          },
          {
            id: 'chk-9',
            label: 'Obter relatório ortopédico detalhando falha de tratamento conservador e contraindicação a AINEs',
            done: true,
          },
          {
            id: 'chk-10',
            label: 'Protocolar reanálise técnica na Ouvidoria SulAmérica + NIP ANS se mantida negativa',
            done: false,
          },
        ],
        technicalNotes:
          'Operadora alegou ausência de previsão no Rol para medicação específica. Fundamentação técnica preparada destacando contraindicação absoluta a AINEs (histórico de gastrite erosiva) e necessidade de preservação articular para evitar artroplastia precoce.',
      },
      {
        id: 'aud-4',
        patientId: 'pat-maria',
        title: 'Autorização de Densitometria Óssea (Coluna e Fêmur)',
        category: 'Autorização de Exame',
        healthPlan: 'SulAmérica Especial 100',
        protocolNumber: 'SA-2026-39021',
        requestDate: '2026-10-18',
        status: 'Concluído',
        checklist: [
          {
            id: 'chk-11',
            label: 'Guia SADT autorizada sem pendências',
            done: true,
          },
          {
            id: 'chk-12',
            label: 'Exame realizado e laudo arquivado para retorno de 19/11',
            done: true,
          },
        ],
        technicalNotes:
          'Guia liberada em 48h. Exame realizado no Fleury Paraíso; laudo impresso já separado na pasta da paciente.',
      },
    ],
  };
}
