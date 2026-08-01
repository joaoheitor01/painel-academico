// ─── SUBJECTS DATA (template curricular compartilhado) ───────────────────────
// APENAS a estrutura do curso: id, nome, período curricular (sem), pré-requisitos
// e, quando o nome não cabe na UI, um `short` curado. NENHUM dado acadêmico
// pessoal é versionado aqui — toda conta começa com todas as disciplinas em
// "future" (0% concluído). O progresso real (aprovadas/cursando/faltas) e o
// horário vêm exclusivamente do SUAP via sync (ver worker/suap-sync.js).
export const DEFAULT_SUBJECTS = [
  { id: "ENC-01", name: "Fundamentos da Matemática",                 sem: 1,  prereqs: [] },
  { id: "ENC-02", name: "Algoritmos I",                              sem: 1,  prereqs: [] },
  { id: "ENC-03", name: "Introdução à Engenharia da Computação",     sem: 1,  prereqs: [], short: "Intro. Eng. Comp." },
  { id: "ENC-04", name: "Desenho Técnico em Ambiente Computacional", sem: 1,  prereqs: [], short: "Desenho Técnico" },
  { id: "ENC-05", name: "Química Geral e Ciência dos Materiais",     sem: 1,  prereqs: [], short: "Química Geral" },
  { id: "ENC-16", name: "Cálculo Vetorial e Geometria Analítica",    sem: 3,  prereqs: ["ENC-07"], short: "Cálculo Vetorial e GA" },
  { id: "ENC-27", name: "Economia",                                  sem: 4,  prereqs: [] },

  { id: "ENC-09", name: "Física Geral e Experimental I",             sem: 2,  prereqs: ["ENC-01"], short: "Física Exp. I" },
  { id: "ENC-25", name: "Arquitetura e Organização de Computadores", sem: 4,  prereqs: ["ENC-03"], short: "Arq. de Computadores" },
  { id: "ENC-08", name: "Algoritmos II",                             sem: 2,  prereqs: ["ENC-02"] },
  { id: "ENC-28", name: "Ciências do Ambiente",                      sem: 4,  prereqs: ["ENC-05"] },
  { id: "ENC-26", name: "Eletrônica Digital",                        sem: 4,  prereqs: ["ENC-09"] },

  { id: "ENC-06", name: "Metodologia Científica",                    sem: 1,  prereqs: [] },
  { id: "ENC-07", name: "Cálculo Diferencial e Integral I",          sem: 2,  prereqs: ["ENC-01"], short: "Cálculo I" },
  { id: "ENC-23", name: "Álgebra Linear",                            sem: 4,  prereqs: ["ENC-16"] },
  { id: "ENC-15", name: "Física Geral e Experimental II",            sem: 3,  prereqs: ["ENC-07","ENC-09"], short: "Física Exp. II" },
  { id: "ENC-31", name: "Sistemas Operacionais",                     sem: 5,  prereqs: ["ENC-25"] },
  { id: "ENC-11", name: "Introdução à Extensão",                     sem: 2,  prereqs: [] },
  { id: "ENC-14", name: "Estruturas de Dados",                       sem: 3,  prereqs: ["ENC-08"] },

  { id: "ENC-13", name: "Cálculo Diferencial e Integral II",         sem: 3,  prereqs: ["ENC-07"], short: "Cálculo II" },
  { id: "ENC-20", name: "Programação Orientada a Objetos",           sem: 4,  prereqs: ["ENC-14"], short: "Prog. Orient. a Objetos" },
  { id: "ENC-19", name: "Banco de Dados",                            sem: 4,  prereqs: ["ENC-14"] },
  { id: "ENC-21", name: "Física Geral e Experimental III",           sem: 4,  prereqs: ["ENC-13","ENC-15"], short: "Física Exp. III" },
  { id: "ENC-17", name: "Matemática Discreta e Teoria dos Grafos",   sem: 3,  prereqs: ["ENC-08"], short: "Mat. Discreta e Grafos" },
  { id: "ENC-35", name: "Circuitos Elétricos I",                     sem: 6,  prereqs: ["ENC-21","ENC-22"] },
  { id: "ENC-36", name: "Transmissão e Comunicação de Dados",        sem: 6,  prereqs: ["ENC-31","ENC-10"], short: "Transmissão de Dados" },
  { id: "ENC-10", name: "Probabilidade e Estatística",               sem: 2,  prereqs: ["ENC-01"] },
  { id: "ENC-18", name: "Saúde e Segurança do Trabalho",             sem: 3,  prereqs: [], short: "Segurança do Trabalho" },
  { id: "ENC-12", name: "Ética Profissional",                        sem: 2,  prereqs: [] },

  { id: "ENC-24", name: "Cálculo Numérico",                          sem: 5,  prereqs: ["ENC-13","ENC-23"] },
  { id: "ENC-22", name: "Equações Diferenciais",                     sem: 5,  prereqs: ["ENC-13"] },
  { id: "ENC-34", name: "Engenharia de Software",                    sem: 5,  prereqs: ["ENC-19","ENC-20"] },
  { id: "ENC-30", name: "Programação WEB",                           sem: 5,  prereqs: ["ENC-19","ENC-20"] },
  { id: "ENC-29", name: "Compiladores",                              sem: 5,  prereqs: ["ENC-14"] },
  { id: "ENC-32", name: "Laboratório de Circuitos Elétricos I",      sem: 5,  prereqs: ["ENC-21","ENC-22"], short: "Lab. Circuitos I" },
  { id: "ENC-33", name: "Extensão I",                                sem: 5,  prereqs: ["ENC-11"] },

  { id: "ENC-37", name: "Análise e Proj. de Sistemas Computacionais", sem: 6, prereqs: ["ENC-34"], short: "Análise e Projeto" },
  { id: "ENC-38", name: "Extensão II",                               sem: 6,  prereqs: ["ENC-33"] },
  // NOVO — componente do núcleo comum ofertado em 2026/2 (Normal.0935).
  { id: "ENC-56", name: "Homem, Cultura e Sociedade",                sem: 6,  prereqs: [] },

  { id: "ENC-39", name: "Circuitos Elétricos II",                    sem: 7,  prereqs: ["ENC-35"] },
  { id: "ENC-40", name: "Eletrônica Analógica I",                    sem: 7,  prereqs: ["ENC-35"] },
  { id: "ENC-41", name: "Sinais e Sistemas Lineares",                sem: 7,  prereqs: ["ENC-35"] },
  { id: "ENC-42", name: "Redes de Computadores",                     sem: 7,  prereqs: ["ENC-36"] },
  { id: "ENC-43", name: "Inteligência Artificial",                   sem: 7,  prereqs: ["ENC-14","ENC-10"] },
  { id: "ENC-44", name: "Extensão III",                              sem: 7,  prereqs: ["ENC-38"] },
  // NOVO — faltava na matriz; SUAP oferta junto de Circuitos Elétricos II (Normal.3010).
  { id: "ENC-55", name: "Laboratório de Circuitos Elétricos II",     sem: 7,  prereqs: ["ENC-32","ENC-35"], short: "Lab. Circuitos II" },

  { id: "ENC-45", name: "Eletrônica Analógica II",                   sem: 8,  prereqs: ["ENC-40"] },
  { id: "ENC-46", name: "Processamento Digital de Sinais",           sem: 8,  prereqs: ["ENC-41"], short: "Proc. Digital de Sinais" },
  { id: "ENC-47", name: "Sistemas Embarcados",                       sem: 8,  prereqs: ["ENC-39","ENC-31"] },
  { id: "ENC-48", name: "Segurança Computacional",                   sem: 8,  prereqs: ["ENC-42"] },
  { id: "ENC-49", name: "Extensão IV",                               sem: 8,  prereqs: ["ENC-44"] },

  { id: "ENC-50", name: "Projeto Integrador I",                      sem: 9,  prereqs: ["ENC-37","ENC-43"] },
  { id: "ENC-51", name: "Visão Computacional",                       sem: 9,  prereqs: ["ENC-43"] },
  { id: "ENC-52", name: "Internet das Coisas",                       sem: 9,  prereqs: ["ENC-47","ENC-42"] },
  { id: "ENC-53", name: "Extensão V",                                sem: 9,  prereqs: ["ENC-49"] },

  { id: "ENC-54", name: "Trabalho de Conclusão de Curso",            sem: 10, prereqs: ["ENC-50"], short: "TCC" },
];

const SUBJECT_BY_ID = Object.fromEntries(DEFAULT_SUBJECTS.map((s) => [s.id, s]));

// Períodos curriculares (1º ao 10º) — usados para agrupar a grade na Visão Geral.
export const CURRICULUM_PERIODS = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  label: `${i + 1}º Período`,
}));

// ─── NOMES CURTOS ────────────────────────────────────────────────────────────
// A UI (bloco do horário, tabela de frequência) tem pouca largura. Preferimos,
// nesta ordem: o `short` curado da matriz → o nome do SUAP se já for curto →
// uma abreviação genérica.
const MAX_SHORT = 28;
const ABREVIACOES = [
  [/^Laborat[óo]rio de /i, "Lab. "],
  [/^Introdução à /i, "Intro. "],
  [/\bDiferencial e Integral\b/gi, "Dif. e Int."],
  [/\bOrientada a Objetos\b/gi, "Orient. a Objetos"],
  [/\bExperimental\b/gi, "Exp."],
  [/\bProcessamento\b/gi, "Proc."],
  [/\bProgramação\b/gi, "Prog."],
  [/\bEngenharia\b/gi, "Eng."],
  [/\bArquitetura\b/gi, "Arq."],
  [/\bMatemática\b/gi, "Mat."],
  [/\bComputacionais\b/gi, "Comp."],
  [/\bComputadores\b/gi, "Comp."],
  [/\bComputação\b/gi, "Comp."],
];

function abreviar(nome) {
  if (nome.length <= MAX_SHORT) return nome;
  let s = nome;
  for (const [re, rep] of ABREVIACOES) s = s.replace(re, rep);
  s = s.replace(/\s+/g, " ").trim();
  if (s.length <= MAX_SHORT) return s;
  const corte = s.lastIndexOf(" ", MAX_SHORT);
  return (corte > 0 ? s.slice(0, corte) : s.slice(0, MAX_SHORT)).trim();
}

export function shortNameOf(encId, nomeSuap) {
  const curado = SUBJECT_BY_ID[encId]?.short;
  if (curado) return curado;
  return abreviar((nomeSuap || SUBJECT_BY_ID[encId]?.name || encId).trim());
}

// ─── SCHEDULE DATA ───────────────────────────────────────────────────────────
export const toMin = (h, m) => h * 60 + m;
export const fmtTime = (min) => `${String(Math.floor(min/60)).padStart(2,"0")}:${String(min%60).padStart(2,"0")}`;
export const DAY_START = toMin(13, 0);
export const DAY_END   = toMin(22, 25);
export const DAY_SPAN  = DAY_END - DAY_START;

// ─── GRADE DE HORÁRIOS DO CAMPUS ─────────────────────────────────────────────
// Código do SUAP: <dia><turno><aulas>, blocos separados por " / ".
// dia 2=Segunda … 7=Sábado · turno M/V/N · um dígito por aula (ex.: 4V1234).
// Cada aula dura AULA_MIN; o fim do bloco é o início da última aula + AULA_MIN.
//
// ⚠ O turno noturno tem DUAS grades sobrepostas no SUAP (N2 18:50 e N3 18:55) —
// disciplinas diferentes usam grades diferentes. Cada slot é tratado pelo seu
// horário próprio; não tente normalizar.
// ⚠ N4 é 19:40, não 19:41. A grade que circulou traz 19:41, mas os dois casos
// conferidos na grade visual do SUAP só fecham com 19:40:
//   · 2N34  termina 20:30  → N4 + 50 = 20:30  → N4 = 19:40
//   · 5N2456 tem intervalo 20:30–20:45 → N4 + 50 = 20:30 (com 19:41 daria
//     20:31–20:45, 14 min, abaixo do limiar de intervalo — some da UI).
export const SLOT_TIMES = {
  M: { 1:[7,0],  2:[7,55],  3:[8,50],  4:[10,0],  5:[10,55], 6:[11,50] },
  V: { 1:[13,0], 2:[13,55], 3:[14,50], 4:[16,0],  5:[16,55], 6:[17,50] },
  N: { 1:[18,0], 2:[18,50], 3:[18,55], 4:[19,40], 5:[20,45], 6:[21,35] },
};

export const AULA_MIN = 50;      // duração de uma aula
const INTERVALO_MIN = 15;        // lacuna a partir da qual vira "INTERVALO" na UI

const DIAS = {
  2: { day: "Segunda", dayShort: "SEG" },
  3: { day: "Terça",   dayShort: "TER" },
  4: { day: "Quarta",  dayShort: "QUA" },
  5: { day: "Quinta",  dayShort: "QUI" },
  6: { day: "Sexta",   dayShort: "SEX" },
  7: { day: "Sábado",  dayShort: "SÁB" },
};
// Segunda a sexta aparecem sempre (mesmo vazias); sábado só se houver aula.
const DIAS_PADRAO = [2, 3, 4, 5, 6];

function slotStart(turno, slot) {
  const t = SLOT_TIMES[turno]?.[slot];
  return t ? toMin(t[0], t[1]) : null;
}

/**
 * Um bloco → um bloco da UI, com os intervalos internos.
 *
 * Duas entradas possíveis:
 *  · `periodos: [[inicio, fim], …]` — horário de relógio, vindo da grade
 *    oficial do EduPage (fonte primária: são os sinos de verdade).
 *  · `turno` + `slots` — código do SUAP (2V34), convertido por SLOT_TIMES.
 *    Só entra em cena se o EduPage estiver fora do ar.
 */
function blocoParaBlock(encId, nome, bloco) {
  let spans;

  if (Array.isArray(bloco?.periodos) && bloco.periodos.length) {
    spans = bloco.periodos
      .filter((p) => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite))
      .map(([inicio, fim]) => [inicio, fim]);
  } else {
    spans = [...new Set(bloco?.slots || [])]
      .map((s) => slotStart(bloco.turno, s))
      .filter((t) => t !== null)
      .map((t) => [t, t + AULA_MIN]);
  }

  if (!spans || spans.length === 0) return null;
  spans.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  const intervals = [];
  for (let i = 1; i < spans.length; i++) {
    const start = spans[i - 1][1];
    const end = spans[i][0];
    if (end - start >= INTERVALO_MIN) intervals.push({ start, end });
  }

  return {
    id: encId,
    name: shortNameOf(encId, nome),
    start: spans[0][0],
    end: Math.max(...spans.map((s) => s[1])),
    aulas: spans.length,
    intervals,
  };
}

/** Agrupa as entradas do SUAP por encId (Eletrônica I ≡ Analógica I colidem). */
function porDisciplina(horario) {
  const map = new Map();
  for (const d of horario) {
    if (!d?.encId) continue;
    const atual = map.get(d.encId);
    if (atual) {
      atual.blocos.push(...(d.blocos || []));
      atual.cargaHoraria = Math.max(atual.cargaHoraria, d.cargaHoraria || 0);
    } else {
      map.set(d.encId, {
        encId: d.encId,
        nome: d.nome,
        cargaHoraria: d.cargaHoraria || 0,
        blocos: [...(d.blocos || [])],
      });
    }
  }
  return map;
}

/**
 * horario (do Worker) → mesmo shape do SCHEDULE estático.
 * Sem horário sincronizado, devolve o SCHEDULE estático como fallback.
 */
export function buildSchedule(horario) {
  if (!Array.isArray(horario) || horario.length === 0) return SCHEDULE;

  const porDia = new Map();
  for (const d of porDisciplina(horario).values()) {
    for (const bloco of d.blocos) {
      const block = blocoParaBlock(d.encId, d.nome, bloco);
      if (!block) continue;
      if (!porDia.has(bloco.dia)) porDia.set(bloco.dia, []);
      porDia.get(bloco.dia).push(block);
    }
  }

  const dias = [...new Set([...DIAS_PADRAO, ...porDia.keys()])]
    .filter((d) => DIAS[d])
    .sort((a, b) => a - b);

  return dias.map((dia) => ({
    ...DIAS[dia],
    blocks: (porDia.get(dia) || []).sort((a, b) => a.start - b.start || a.end - b.end),
  }));
}

/**
 * horario (do Worker) → { [encId]: { cargaHoraria, aulasPorDia, shortName } }.
 * aulasPorDia = maior nº de aulas que a disciplina tem num único dia.
 * Sem horário sincronizado, devolve o ATTENDANCE_META estático como fallback.
 */
export function buildAttendanceMeta(horario) {
  if (!Array.isArray(horario) || horario.length === 0) return ATTENDANCE_META;

  const meta = {};
  for (const d of porDisciplina(horario).values()) {
    // Sem carga horária não dá pra calcular o limite de 25% — não inventa.
    if (!d.cargaHoraria) continue;

    const aulasNoDia = new Map();
    for (const b of d.blocos) {
      const n = Array.isArray(b?.periodos) && b.periodos.length
        ? b.periodos.length
        : new Set(b?.slots || []).size;
      if (n) aulasNoDia.set(b.dia, (aulasNoDia.get(b.dia) || 0) + n);
    }

    meta[d.encId] = {
      cargaHoraria: d.cargaHoraria,
      aulasPorDia: aulasNoDia.size ? Math.max(...aulasNoDia.values()) : 1,
      shortName: shortNameOf(d.encId, d.nome),
    };
  }
  return meta;
}

// ─── FALLBACKS ESTÁTICOS ─────────────────────────────────────────────────────
// Usados só enquanto a conta não sincronizou com o SUAP. Depois do primeiro
// sync, buildSchedule/buildAttendanceMeta assumem — e cada aluno vê o SEU
// horário, não o de quem editou o repo por último.
export const ATTENDANCE_META = {};

// Sem horário sincronizado não há grade nenhuma: apenas os dias, vazios.
//
// Por que NÃO existe mais um SCHEDULE chumbado aqui: a grade do campus muda
// quase todo dia (só em 29–30/07/2026 saíram três versões, e uma delas moveu
// Homem, Cultura e Sociedade de segunda para sexta). Qualquer snapshot no
// repo nasce errado — e, pior, era o horário de UMA pessoa sendo mostrado
// para todos os colegas. O horário verdadeiro vem do EduPage, por aluno.
export const SCHEDULE = [
  { day: "Segunda", dayShort: "SEG", blocks: [] },
  { day: "Terça",   dayShort: "TER", blocks: [] },
  { day: "Quarta",  dayShort: "QUA", blocks: [] },
  { day: "Quinta",  dayShort: "QUI", blocks: [] },
  { day: "Sexta",   dayShort: "SEX", blocks: [] },
];

// ─── CORES DA ABA HORÁRIO ────────────────────────────────────────────────────
// Paleta fixa atribuída POR ÍNDICE — não há mais mapa por ID chumbado, então
// qualquer conjunto de disciplinas (de qualquer aluno/semestre) recebe cor.
// Tons pastel desaturados para não competir com o tema editorial.
export const SUBJECT_PALETTE = [
  { bg: "bg-violet-100", border: "border-violet-200", text: "text-violet-800", dot: "bg-violet-500", light: "bg-violet-50" },
  { bg: "bg-teal-100",   border: "border-teal-200",   text: "text-teal-800",   dot: "bg-teal-500",   light: "bg-teal-50" },
  { bg: "bg-orange-100", border: "border-orange-200", text: "text-orange-800", dot: "bg-orange-500", light: "bg-orange-50" },
  { bg: "bg-pink-100",   border: "border-pink-200",   text: "text-pink-800",   dot: "bg-pink-500",   light: "bg-pink-50" },
  { bg: "bg-blue-100",   border: "border-blue-200",   text: "text-blue-800",   dot: "bg-blue-500",   light: "bg-blue-50" },
  { bg: "bg-amber-100",  border: "border-amber-200",  text: "text-amber-800",  dot: "bg-amber-500",  light: "bg-amber-50" },
  { bg: "bg-lime-100",   border: "border-lime-200",   text: "text-lime-800",   dot: "bg-lime-500",   light: "bg-lime-50" },
  { bg: "bg-rose-100",   border: "border-rose-200",   text: "text-rose-800",   dot: "bg-rose-500",   light: "bg-rose-50" },
  { bg: "bg-cyan-100",   border: "border-cyan-200",   text: "text-cyan-800",   dot: "bg-cyan-500",   light: "bg-cyan-50" },
  { bg: "bg-indigo-100", border: "border-indigo-200", text: "text-indigo-800", dot: "bg-indigo-500", light: "bg-indigo-50" },
];

/** Atribui uma cor da paleta a cada id, em ordem estável. */
export function buildSubjectColors(ids) {
  const out = {};
  [...new Set(ids)].sort().forEach((id, i) => {
    out[id] = SUBJECT_PALETTE[i % SUBJECT_PALETTE.length];
  });
  return out;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
export function getCascadeCount(subjectId, allSubjects) {
  const visited = new Set();
  function dfs(id) {
    if (visited.has(id)) return;
    visited.add(id);
    allSubjects.filter(s => s.prereqs.includes(id)).forEach(s => dfs(s.id));
  }
  dfs(subjectId);
  visited.delete(subjectId);
  return visited.size;
}

export function calcAbsence(meta, faltas) {
  const limite = Math.floor(meta.cargaHoraria * 0.25);
  const restam = limite - faltas;
  const diasRestantes = restam <= 0 ? 0 : Math.floor(restam / meta.aulasPorDia);
  const pct = Math.min(100, Math.round((faltas / limite) * 100));
  let state = "safe";
  if (faltas >= limite) state = "danger";
  else if (diasRestantes <= 2) state = "warning";
  return { limite, restam, diasRestantes, pct, state };
}

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
// Tema editorial: status comunicado por tom de cinza + peso, sem cor saturada.
export const STATUS = {
  done:    { label: "Concluída",  border: "border-gray-200", bg: "bg-gray-50", text: "text-gray-500", dot: "bg-gray-400", badge: "bg-gray-100 text-gray-600" },
  current: { label: "Cursando",   border: "border-gray-300", bg: "bg-white",   text: "text-gray-900", dot: "bg-gray-900", badge: "bg-gray-100 text-gray-700" },
  next:    { label: "Próxima",    border: "border-gray-200", bg: "bg-gray-50", text: "text-gray-500", dot: "bg-gray-300", badge: "bg-gray-100 text-gray-600" },
  future:  { label: "Futura",     border: "border-gray-200", bg: "bg-gray-50", text: "text-gray-400", dot: "bg-gray-200", badge: "bg-gray-100 text-gray-500" },
};

// Ordem de ciclo usada no modo de edição (clique para avançar o status)
export const STATUS_ORDER = ["done", "current", "next", "future"];
