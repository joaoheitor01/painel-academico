// ─── SUBJECTS DATA (template curricular compartilhado) ───────────────────────
// Cada usuário pode sobrescrever o "status" das disciplinas com o próprio
// progresso (ver statusOverrides em userData.js). Os dados abaixo servem
// apenas como ponto de partida padrão.
export const DEFAULT_SUBJECTS = [
  { id: "ENC-01", name: "Fundamentos da Matemática",              sem: 1,  status: "done",    academicTerm: "2024/1", prereqs: [] },
  { id: "ENC-02", name: "Algoritmos I",                           sem: 1,  status: "done",    academicTerm: "2024/1", prereqs: [] },
  { id: "ENC-03", name: "Introdução à Engenharia da Computação",  sem: 1,  status: "done",    academicTerm: "2024/1", prereqs: [] },
  { id: "ENC-04", name: "Desenho Técnico em Ambiente Computacional", sem: 1, status: "done", academicTerm: "2024/1", prereqs: [] },
  { id: "ENC-05", name: "Química Geral e Ciência dos Materiais",  sem: 1,  status: "done",    academicTerm: "2024/1", prereqs: [] },
  { id: "ENC-16", name: "Cálculo Vetorial e Geometria Analítica", sem: 3,  status: "done",    academicTerm: "2024/1", prereqs: ["ENC-07"] },
  { id: "ENC-27", name: "Economia",                               sem: 4,  status: "done",    academicTerm: "2024/1", prereqs: [] },

  { id: "ENC-09", name: "Física Geral e Experimental I",          sem: 2,  status: "done",    academicTerm: "2024/2", prereqs: ["ENC-01"] },
  { id: "ENC-25", name: "Arquitetura e Organização de Computadores", sem: 4, status: "done", academicTerm: "2024/2", prereqs: ["ENC-03"] },
  { id: "ENC-08", name: "Algoritmos II",                          sem: 2,  status: "done",    academicTerm: "2024/2", prereqs: ["ENC-02"] },
  { id: "ENC-28", name: "Ciências do Ambiente",                   sem: 4,  status: "done",    academicTerm: "2024/2", prereqs: ["ENC-05"] },
  { id: "ENC-26", name: "Eletrônica Digital",                     sem: 4,  status: "done",    academicTerm: "2024/2", prereqs: ["ENC-09"] },

  { id: "ENC-06", name: "Metodologia Científica (Refeita)",       sem: 1,  status: "done",    academicTerm: "2025/1", tags: ["Refeita"], prereqs: [] },
  { id: "ENC-07", name: "Cálculo Diferencial e Integral I (Refeita)", sem: 2, status: "done", academicTerm: "2025/1", tags: ["Refeita"], prereqs: ["ENC-01"] },
  { id: "ENC-23", name: "Álgebra Linear",                         sem: 4,  status: "done",    academicTerm: "2025/1", prereqs: ["ENC-16"] },
  { id: "ENC-15", name: "Física Geral e Experimental II",         sem: 3,  status: "done",    academicTerm: "2025/1", prereqs: ["ENC-07","ENC-09"] },
  { id: "ENC-31", name: "Sistemas Operacionais",                  sem: 5,  status: "done",    academicTerm: "2025/1", prereqs: ["ENC-25"] },
  { id: "ENC-11", name: "Introdução à Extensão",                  sem: 2,  status: "done",    academicTerm: "2025/1", prereqs: [] },
  { id: "ENC-14", name: "Estruturas de Dados",                    sem: 3,  status: "done",    academicTerm: "2025/1", prereqs: ["ENC-08"] },

  { id: "ENC-13", name: "Cálculo Diferencial e Integral II",      sem: 3,  status: "done",    academicTerm: "2025/2", prereqs: ["ENC-07"] },
  { id: "ENC-20", name: "Programação Orientada a Objetos",        sem: 4,  status: "done",    academicTerm: "2025/2", prereqs: ["ENC-14"] },
  { id: "ENC-19", name: "Banco de Dados",                         sem: 4,  status: "done",    academicTerm: "2025/2", prereqs: ["ENC-14"] },
  { id: "ENC-21", name: "Física Geral e Experimental III",        sem: 4,  status: "done",    academicTerm: "2025/2", prereqs: ["ENC-13","ENC-15"] },
  { id: "ENC-17", name: "Matemática Discreta e Teoria dos Grafos",sem: 3,  status: "done",    academicTerm: "2025/2", prereqs: ["ENC-08"] },
  { id: "ENC-35", name: "Circuitos Elétricos I",                  sem: 6,  status: "done",    academicTerm: "2025/2", prereqs: ["ENC-21","ENC-22"] },
  { id: "ENC-36", name: "Transmissão e Comunicação de Dados",     sem: 6,  status: "done",    academicTerm: "2025/2", prereqs: ["ENC-31","ENC-10"] },
  { id: "ENC-10", name: "Probabilidade e Estatística",            sem: 2,  status: "done",    academicTerm: "2025/2", tags: ["Extracurricular"], prereqs: ["ENC-01"] },
  { id: "ENC-18", name: "Saúde e Segurança do Trabalho",          sem: 3,  status: "done",    academicTerm: "2025/2", tags: ["Extracurricular"], prereqs: [] },
  { id: "ENC-12", name: "Ética Profissional",                     sem: 2,  status: "done",    academicTerm: "2025/2", tags: ["Cumprida"], prereqs: [] },

  { id: "ENC-24", name: "Cálculo Numérico",                       sem: 5,  status: "current", academicTerm: "2026/1", prereqs: ["ENC-13","ENC-23"] },
  { id: "ENC-22", name: "Equações Diferenciais",                  sem: 5,  status: "current", academicTerm: "2026/1", prereqs: ["ENC-13"] },
  { id: "ENC-34", name: "Engenharia de Software",                 sem: 5,  status: "current", academicTerm: "2026/1", prereqs: ["ENC-19","ENC-20"] },
  { id: "ENC-30", name: "Programação WEB",                        sem: 5,  status: "current", academicTerm: "2026/1", prereqs: ["ENC-19","ENC-20"] },
  { id: "ENC-29", name: "Compiladores",                           sem: 5,  status: "current", academicTerm: "2026/1", prereqs: ["ENC-14"] },
  { id: "ENC-32", name: "Laboratório de Circuitos Elétricos I",   sem: 5,  status: "current", academicTerm: "2026/1", prereqs: ["ENC-21","ENC-22"] },
  { id: "ENC-33", name: "Extensão I",                             sem: 5,  status: "current", academicTerm: "2026/1", prereqs: ["ENC-11"] },

  { id: "ENC-37", name: "Análise e Proj. de Sistemas Computacionais", sem: 6, status: "next", academicTerm: "2026/2", prereqs: ["ENC-34"] },
  { id: "ENC-38", name: "Extensão II",                            sem: 6,  status: "next",    academicTerm: "2026/2", prereqs: ["ENC-33"] },

  { id: "ENC-39", name: "Circuitos Elétricos II",                 sem: 7,  status: "future",  academicTerm: "2027/1", prereqs: ["ENC-35"] },
  { id: "ENC-40", name: "Eletrônica Analógica I",                 sem: 7,  status: "future",  academicTerm: "2027/1", prereqs: ["ENC-35"] },
  { id: "ENC-41", name: "Sinais e Sistemas Lineares",             sem: 7,  status: "future",  academicTerm: "2027/1", prereqs: ["ENC-35"] },
  { id: "ENC-42", name: "Redes de Computadores",                  sem: 7,  status: "future",  academicTerm: "2027/1", prereqs: ["ENC-36"] },
  { id: "ENC-43", name: "Inteligência Artificial",                sem: 7,  status: "future",  academicTerm: "2027/1", prereqs: ["ENC-14","ENC-10"] },
  { id: "ENC-44", name: "Extensão III",                           sem: 7,  status: "future",  academicTerm: "2027/1", prereqs: ["ENC-38"] },

  { id: "ENC-45", name: "Eletrônica Analógica II",                sem: 8,  status: "future",  academicTerm: "2027/2", prereqs: ["ENC-40"] },
  { id: "ENC-46", name: "Processamento Digital de Sinais",        sem: 8,  status: "future",  academicTerm: "2027/2", prereqs: ["ENC-41"] },
  { id: "ENC-47", name: "Sistemas Embarcados",                    sem: 8,  status: "future",  academicTerm: "2027/2", prereqs: ["ENC-39","ENC-31"] },
  { id: "ENC-48", name: "Segurança Computacional",                sem: 8,  status: "future",  academicTerm: "2027/2", prereqs: ["ENC-42"] },
  { id: "ENC-49", name: "Extensão IV",                            sem: 8,  status: "future",  academicTerm: "2027/2", prereqs: ["ENC-44"] },

  { id: "ENC-50", name: "Projeto Integrador I",                   sem: 9,  status: "future",  academicTerm: "2028/1", prereqs: ["ENC-37","ENC-43"] },
  { id: "ENC-51", name: "Visão Computacional",                    sem: 9,  status: "future",  academicTerm: "2028/1", prereqs: ["ENC-43"] },
  { id: "ENC-52", name: "Internet das Coisas",                    sem: 9,  status: "future",  academicTerm: "2028/1", prereqs: ["ENC-47","ENC-42"] },
  { id: "ENC-53", name: "Extensão V",                             sem: 9,  status: "future",  academicTerm: "2028/1", prereqs: ["ENC-49"] },

  { id: "ENC-54", name: "Trabalho de Conclusão de Curso",         sem: 10, status: "future",  academicTerm: "2028/2", prereqs: ["ENC-50"] },
];

export const ACADEMIC_TERMS = [
  { id: "2024/1", label: "Ano Letivo 2024/1" },
  { id: "2024/2", label: "Ano Letivo 2024/2" },
  { id: "2025/1", label: "Ano Letivo 2025/1" },
  { id: "2025/2", label: "Ano Letivo 2025/2" },
  { id: "2026/1", label: "Ano Letivo 2026/1" },
  { id: "2026/2", label: "Ano Letivo 2026/2" },
  { id: "2027/1", label: "Ano Letivo 2027/1" },
  { id: "2027/2", label: "Ano Letivo 2027/2" },
  { id: "2028/1", label: "Ano Letivo 2028/1" },
  { id: "2028/2", label: "Ano Letivo 2028/2" },
];

// ─── ATTENDANCE META ─────────────────────────────────────────────────────────
export const ATTENDANCE_META = {
  "ENC-34": { cargaHoraria: 80, aulasPorDia: 4, shortName: "Eng. Software" },
  "ENC-33": { cargaHoraria: 60, aulasPorDia: 3, shortName: "Extensão I" },
  "ENC-29": { cargaHoraria: 80, aulasPorDia: 4, shortName: "Compiladores" },
  "ENC-32": { cargaHoraria: 40, aulasPorDia: 2, shortName: "Lab. Circuitos I" },
  "ENC-30": { cargaHoraria: 60, aulasPorDia: 3, shortName: "Prog. WEB" },
  "ENC-24": { cargaHoraria: 60, aulasPorDia: 2, shortName: "Cálculo Numérico" },
  "ENC-22": { cargaHoraria: 80, aulasPorDia: 4, shortName: "Eq. Diferenciais" },
};

// ─── SCHEDULE DATA ───────────────────────────────────────────────────────────
export const toMin = (h, m) => h * 60 + m;
export const fmtTime = (min) => `${String(Math.floor(min/60)).padStart(2,"0")}:${String(min%60).padStart(2,"0")}`;
export const DAY_START = toMin(13, 0);
export const DAY_END   = toMin(22, 25);
export const DAY_SPAN  = DAY_END - DAY_START;

export const SCHEDULE = [
  {
    day: "Segunda", dayShort: "SEG",
    blocks: [
      { id: "ENC-34", name: "Engenharia de Software", start: toMin(13,0),  end: toMin(16,40), aulas: 4 },
      { id: "ENC-33", name: "Extensão I",             start: toMin(16,40), end: toMin(19,40), aulas: 3,
        intervals: [{ start: toMin(18,20), end: toMin(18,50) }] },
    ],
  },
  {
    day: "Terça", dayShort: "TER",
    blocks: [
      { id: "ENC-29", name: "Compiladores", start: toMin(13,0),  end: toMin(16,40), aulas: 4 },
      { id: "ENC-33", name: "Extensão I",   start: toMin(16,40), end: toMin(19,40), aulas: 3,
        intervals: [{ start: toMin(18,20), end: toMin(18,50) }] },
    ],
  },
  {
    day: "Quarta", dayShort: "QUA",
    blocks: [
      { id: "ENC-32", name: "Lab. Circuitos I", start: toMin(13,0), end: toMin(14,40), aulas: 2 },
    ],
  },
  {
    day: "Quinta", dayShort: "QUI",
    blocks: [
      { id: "ENC-30", name: "Prog. WEB",        start: toMin(13,0),  end: toMin(13,50), aulas: 1 },
      { id: "ENC-24", name: "Cálculo Numérico", start: toMin(13,50), end: toMin(15,30), aulas: 2 },
      { id: "ENC-30", name: "Prog. WEB",        start: toMin(15,50), end: toMin(17,30), aulas: 2 },
    ],
  },
  {
    day: "Sexta", dayShort: "SEX",
    blocks: [
      { id: "ENC-24", name: "Cálculo Numérico", start: toMin(13,0),  end: toMin(14,40), aulas: 2 },
      { id: "ENC-22", name: "Eq. Diferenciais", start: toMin(18,50), end: toMin(22,25), aulas: 4,
        intervals: [{ start: toMin(20,30), end: toMin(20,45) }] },
    ],
  },
];

export const SUBJECT_COLORS = {
  "ENC-34": { bg: "bg-violet-600",  border: "border-violet-500", text: "text-violet-100", dot: "bg-violet-400",  light: "bg-violet-500/15" },
  "ENC-33": { bg: "bg-teal-600",    border: "border-teal-500",   text: "text-teal-100",   dot: "bg-teal-400",    light: "bg-teal-500/15" },
  "ENC-29": { bg: "bg-orange-600",  border: "border-orange-500", text: "text-orange-100", dot: "bg-orange-400",  light: "bg-orange-500/15" },
  "ENC-32": { bg: "bg-pink-600",    border: "border-pink-500",   text: "text-pink-100",   dot: "bg-pink-400",    light: "bg-pink-500/15" },
  "ENC-30": { bg: "bg-sky-600",     border: "border-sky-500",    text: "text-sky-100",    dot: "bg-sky-400",     light: "bg-sky-500/15" },
  "ENC-24": { bg: "bg-amber-600",   border: "border-amber-500",  text: "text-amber-100",  dot: "bg-amber-400",   light: "bg-amber-500/15" },
  "ENC-22": { bg: "bg-rose-600",    border: "border-rose-500",   text: "text-rose-100",   dot: "bg-rose-400",    light: "bg-rose-500/15" },
};

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
export const STATUS = {
  done:    { label: "Concluída",  border: "border-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-300" },
  current: { label: "Cursando",   border: "border-violet-500",  bg: "bg-violet-500/10",  text: "text-violet-400",  badge: "bg-violet-500/20 text-violet-300" },
  next:    { label: "Próxima",    border: "border-sky-500",     bg: "bg-sky-500/10",     text: "text-sky-400",     badge: "bg-sky-500/20 text-sky-300" },
  future:  { label: "Futura",     border: "border-slate-600",   bg: "bg-slate-800/40",   text: "text-slate-400",   badge: "bg-slate-700 text-slate-400" },
};

// Ordem de ciclo usada no modo de edição (clique para avançar o status)
export const STATUS_ORDER = ["done", "current", "next", "future"];
