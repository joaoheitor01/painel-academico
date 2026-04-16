import { useState, useMemo, useEffect } from "react";
import {
  CheckCircle2, Circle, BookOpen, Zap, ChevronRight,
  BarChart3, GitBranch, GraduationCap, Clock, Star,
  ArrowRight, Layers, TrendingUp, Network, Calendar,
  AlertTriangle, XCircle, Shield, Minus, Plus, CalendarDays
} from "lucide-react";

// ─── SUBJECTS DATA ───────────────────────────────────────────────────────────
const SUBJECTS = [
  // 1º Período
  { id: "ENC-001", name: "Algoritmos I",                                sem: 1, ch: 68, status: "done", prereqs: [] },
  { id: "ENC-002", name: "Cálculo Vetorial e Geometria Analítica",      sem: 1, ch: 68, status: "done", prereqs: [] },
  { id: "ENC-003", name: "Desenho Técnico em Ambiente Computacional",   sem: 1, ch: 34, status: "done", prereqs: [] },
  { id: "ENC-004", name: "Economia",                                    sem: 1, ch: 34, status: "done", prereqs: [] },
  { id: "ENC-005", name: "Fundamentos da Matemática",                   sem: 1, ch: 68, status: "done", prereqs: [] },
  { id: "ENC-006", name: "Introdução à Engenharia da Computação",       sem: 1, ch: 34, status: "done", prereqs: [] },
  { id: "ENC-007", name: "Química Geral e Ciência dos Materiais",       sem: 1, ch: 34, status: "done", prereqs: [] },

  // 2º Período
  { id: "ENC-008", name: "Álgebra Linear",                              sem: 2, ch: 68, status: "done", prereqs: ["ENC-002"] },
  { id: "ENC-009", name: "Algoritmos II",                               sem: 2, ch: 68, status: "done", prereqs: ["ENC-001"] },
  { id: "ENC-010", name: "Arquitetura e Organização de Computadores",   sem: 2, ch: 68, status: "done", prereqs: ["ENC-006"] },
  { id: "ENC-011", name: "Cálculo Diferencial e Integral I",            sem: 2, ch: 68, status: "done", prereqs: ["ENC-005"] },
  { id: "ENC-012", name: "Ciências do Ambiente",                        sem: 2, ch: 34, status: "done", prereqs: ["ENC-007"] },
  { id: "ENC-013", name: "Física Geral e Experimental I",               sem: 2, ch: 68, status: "done", prereqs: ["ENC-005"] },
  { id: "ENC-014", name: "Metodologia Científica",                      sem: 2, ch: 34, status: "done", prereqs: [] },

  // 3º Período
  { id: "ENC-015", name: "Cálculo Diferencial e Integral II",           sem: 3, ch: 68, status: "done", prereqs: ["ENC-011"] },
  { id: "ENC-016", name: "Eletrônica Digital",                          sem: 3, ch: 68, status: "done", prereqs: ["ENC-013"] },
  { id: "ENC-017", name: "Estruturas de Dados",                         sem: 3, ch: 68, status: "done", prereqs: ["ENC-009"] },
  { id: "ENC-018", name: "Física Geral e Experimental II",              sem: 3, ch: 68, status: "done", prereqs: ["ENC-013"] },
  { id: "ENC-019", name: "Introdução à Extensão",                       sem: 3, ch: 34, status: "done", prereqs: [] },
  { id: "ENC-020", name: "Probabilidade e Estatística Computacional",   sem: 3, ch: 34, status: "done", prereqs: ["ENC-005"] },
  { id: "ENC-021", name: "Sistemas Operacionais",                       sem: 3, ch: 68, status: "done", prereqs: ["ENC-010"] },

  // 4º Período
  { id: "ENC-022", name: "Banco de Dados",                              sem: 4, ch: 68, status: "done", prereqs: ["ENC-017"] },
  { id: "ENC-023", name: "Cálculo Numérico",                            sem: 4, ch: 68, status: "done", prereqs: ["ENC-015"] },
  { id: "ENC-024", name: "Equações Diferenciais",                       sem: 4, ch: 68, status: "done", prereqs: ["ENC-015"] },
  { id: "ENC-025", name: "Física Geral e Experimental III",             sem: 4, ch: 68, status: "done", prereqs: ["ENC-018"] },
  { id: "ENC-026", name: "Matemática Discreta e Teoria dos Grafos",     sem: 4, ch: 34, status: "done", prereqs: ["ENC-009"] },
  { id: "ENC-027", name: "Programação Orientada a Objetos",             sem: 4, ch: 68, status: "done", prereqs: ["ENC-017"] },
  { id: "ENC-028", name: "Transmissão e Comunicação de Dados",           sem: 4, ch: 68, status: "done", prereqs: ["ENC-021"] },

  // 5º Período
  { id: "ENC-029", name: "Circuitos Elétricos I",                       sem: 5, ch: 68, status: "current", prereqs: ["ENC-025"] },
  { id: "ENC-030", name: "Compiladores",                                sem: 5, ch: 68, status: "current", prereqs: ["ENC-017"] },
  { id: "ENC-031", name: "Engenharia de Software",                      sem: 5, ch: 68, status: "current", prereqs: ["ENC-022", "ENC-027"] },
  { id: "ENC-032", name: "Ética Profissional",                          sem: 5, ch: 34, status: "current", prereqs: [] },
  { id: "ENC-033", name: "Extensão I",                                  sem: 5, ch: 102, status: "current", prereqs: ["ENC-019"] },
  { id: "ENC-034", name: "Laboratório de Circuitos Elétricos I",         sem: 5, ch: 34, status: "current", prereqs: ["ENC-029"] },
  { id: "ENC-035", name: "Programação WEB",                             sem: 5, ch: 68, status: "current", prereqs: ["ENC-022", "ENC-027"] },

  // 6º Período
  { id: "ENC-036", name: "Análise e Projeto de Sistemas Computacionais", sem: 6, ch: 68, status: "next", prereqs: ["ENC-031"] },
  { id: "ENC-037", name: "Circuitos Elétricos II",                      sem: 6, ch: 68, status: "next", prereqs: ["ENC-029"] },
  { id: "ENC-038", name: "Eletrônica Analógica I",                      sem: 6, ch: 68, status: "next", prereqs: ["ENC-029"] },
  { id: "ENC-039", name: "Inteligência Artificial",                     sem: 6, ch: 68, status: "next", prereqs: ["ENC-017", "ENC-020"] },
  { id: "ENC-040", name: "Laboratório de Circuitos Elétricos II",        sem: 6, ch: 34, status: "next", prereqs: ["ENC-037"] },
  { id: "ENC-041", name: "Redes de Computadores",                       sem: 6, ch: 68, status: "next", prereqs: ["ENC-028"] },
  { id: "ENC-042", name: "Sinais e Sistemas Lineares",                  sem: 6, ch: 68, status: "next", prereqs: ["ENC-024"] },

  // 7º Período
  { id: "ENC-043", name: "Controle de Sistemas Contínuos I",            sem: 7, ch: 68, status: "future", prereqs: ["ENC-024"] },
  { id: "ENC-044", name: "Eletrônica Analógica II",                     sem: 7, ch: 68, status: "future", prereqs: ["ENC-038"] },
  { id: "ENC-045", name: "Extensão II",                                 sem: 7, ch: 102, status: "future", prereqs: ["ENC-033"] },
  { id: "ENC-046", name: "Microcontroladores",                          sem: 7, ch: 68, status: "future", prereqs: ["ENC-037"] },
  { id: "ENC-047", name: "Mineração de Dados",                          sem: 7, ch: 68, status: "future", prereqs: ["ENC-020", "ENC-039"] },
  { id: "ENC-048", name: "Segurança de Sistemas de Computação",          sem: 7, ch: 34, status: "future", prereqs: ["ENC-041"] },
  { id: "ENC-049", name: "Segurança do Trabalho",                       sem: 7, ch: 34, status: "future", prereqs: [] },

  // 8º Período
  { id: "ENC-050", name: "Administração",                               sem: 8, ch: 34, status: "future", prereqs: [] },
  { id: "ENC-051", name: "Disciplina Eletiva",                          sem: 8, ch: 34, status: "future", prereqs: [] },
  { id: "ENC-052", name: "Processamento Digital de Sinais",             sem: 8, ch: 34, status: "future", prereqs: ["ENC-042"] },
  { id: "ENC-053", name: "Projeto de Sistemas Inteligentes",            sem: 8, ch: 68, status: "future", prereqs: ["ENC-039"] },
  { id: "ENC-054", name: "Trabalho de Conclusão do Curso",              sem: 8, ch: 34, status: "future", prereqs: ["ENC-036"] },
];

const ACADEMIC_TERMS = [
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
const ATTENDANCE_META = {
  "ENC-031": { cargaHoraria: 68, aulasPorDia: 4, shortName: "Eng. Software" },
  "ENC-033": { cargaHoraria: 102, aulasPorDia: 3, shortName: "Extensão I" },
  "ENC-030": { cargaHoraria: 68, aulasPorDia: 4, shortName: "Compiladores" },
  "ENC-034": { cargaHoraria: 34, aulasPorDia: 2, shortName: "Lab. Circuitos I" },
  "ENC-035": { cargaHoraria: 68, aulasPorDia: 3, shortName: "Prog. WEB" },
  "ENC-023": { cargaHoraria: 68, aulasPorDia: 2, shortName: "Cálculo Numérico" },
  "ENC-024": { cargaHoraria: 68, aulasPorDia: 4, shortName: "Eq. Diferenciais" },
};

// ─── SCHEDULE DATA ───────────────────────────────────────────────────────────
const toMin = (h, m) => h * 60 + m;
const fmtTime = (min) => `${String(Math.floor(min/60)).padStart(2,"0")}:${String(min%60).padStart(2,"0")}`;
const DAY_START = toMin(13, 0);
const DAY_END   = toMin(22, 25);
const DAY_SPAN  = DAY_END - DAY_START;

const SCHEDULE = [
  {
    day: "Segunda", dayShort: "SEG",
    blocks: [
      { id: "ENC-031", name: "Engenharia de Software", start: toMin(13,0),  end: toMin(16,40), aulas: 4 },
      { id: "ENC-033", name: "Extensão I",             start: toMin(16,40), end: toMin(19,40), aulas: 3,
        intervals: [{ start: toMin(18,20), end: toMin(18,50) }] },
    ],
  },
  {
    day: "Terça", dayShort: "TER",
    blocks: [
      { id: "ENC-030", name: "Compiladores", start: toMin(13,0),  end: toMin(16,40), aulas: 4 },
      { id: "ENC-033", name: "Extensão I",   start: toMin(16,40), end: toMin(19,40), aulas: 3,
        intervals: [{ start: toMin(18,20), end: toMin(18,50) }] },
    ],
  },
  {
    day: "Quarta", dayShort: "QUA",
    blocks: [
      { id: "ENC-034", name: "Lab. Circuitos I", start: toMin(13,0), end: toMin(14,40), aulas: 2 },
    ],
  },
  {
    day: "Quinta", dayShort: "QUI",
    blocks: [
      { id: "ENC-035", name: "Prog. WEB",        start: toMin(13,0),  end: toMin(13,50), aulas: 1 },
      { id: "ENC-023", name: "Cálculo Numérico", start: toMin(13,50), end: toMin(15,30), aulas: 2 },
      { id: "ENC-035", name: "Prog. WEB",        start: toMin(15,50), end: toMin(17,30), aulas: 2 },
    ],
  },
  {
    day: "Sexta", dayShort: "SEX",
    blocks: [
      { id: "ENC-023", name: "Cálculo Numérico", start: toMin(13,0),  end: toMin(14,40), aulas: 2 },
      { id: "ENC-024", name: "Eq. Diferenciais", start: toMin(18,50), end: toMin(22,25), aulas: 4,
        intervals: [{ start: toMin(20,30), end: toMin(20,45) }] },
    ],
  },
];

const SUBJECT_COLORS = {
  "ENC-031": { bg: "bg-violet-600",  border: "border-violet-500", text: "text-violet-100", dot: "bg-violet-400",  light: "bg-violet-500/15" },
  "ENC-033": { bg: "bg-teal-600",    border: "border-teal-500",   text: "text-teal-100",   dot: "bg-teal-400",    light: "bg-teal-500/15" },
  "ENC-030": { bg: "bg-orange-600",  border: "border-orange-500", text: "text-orange-100", dot: "bg-orange-400",  light: "bg-orange-500/15" },
  "ENC-034": { bg: "bg-pink-600",    border: "border-pink-500",   text: "text-pink-100",   dot: "bg-pink-400",    light: "bg-pink-500/15" },
  "ENC-035": { bg: "bg-sky-600",     border: "border-sky-500",    text: "text-sky-100",    dot: "bg-sky-400",     light: "bg-sky-500/15" },
  "ENC-023": { bg: "bg-amber-600",   border: "border-amber-500",  text: "text-amber-100",  dot: "bg-amber-400",   light: "bg-amber-500/15" },
  "ENC-024": { bg: "bg-rose-600",    border: "border-rose-500",   text: "text-rose-100",   dot: "bg-rose-400",    light: "bg-rose-500/15" },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getCascadeCount(subjectId, allSubjects) {
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

// Calcula metadados dinâmicos de uma disciplina baseado em sua carga horária
function getDynamicAttendanceMeta(subject) {
  const ch = subject.ch;
  const aulasPorDia = ch <= 34 ? 2 : 4;
  const limite = Math.floor(ch * 0.25);
  return {
    cargaHoraria: ch,
    aulasPorDia,
    limite,
    shortName: subject.name.substring(0, 15), // Fallback: usa nome abreviado
  };
}

function calcAbsence(meta, faltas) {
  const limite = meta.limite || Math.floor(meta.cargaHoraria * 0.25);
  const restam = limite - faltas;
  const diasRestantes = restam <= 0 ? 0 : Math.floor(restam / meta.aulasPorDia);
  const pct = Math.min(100, Math.round((faltas / limite) * 100));
  let state = "safe";
  if (faltas >= limite) state = "danger";
  else if (diasRestantes <= 2) state = "warning";
  return { limite, restam, diasRestantes, pct, state };
}

// Cores dinâmicas com fallback neutro
function getSubjectColors(subjectId) {
  const predefined = SUBJECT_COLORS[subjectId];
  if (predefined) return predefined;
  
  // Fallback: tons neutros
  return {
    bg: "bg-slate-600",
    border: "border-slate-500",
    text: "text-slate-100",
    dot: "bg-slate-400",
    light: "bg-slate-500/15"
  };
}

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const STATUS = {
  done:    { label: "Concluída",  border: "border-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-300" },
  current: { label: "Cursando",   border: "border-violet-500",  bg: "bg-violet-500/10",  text: "text-violet-400",  badge: "bg-violet-500/20 text-violet-300" },
  next:    { label: "Próxima",    border: "border-sky-500",     bg: "bg-sky-500/10",     text: "text-sky-400",     badge: "bg-sky-500/20 text-sky-300" },
  future:  { label: "Futura",     border: "border-slate-600",   bg: "bg-slate-800/40",   text: "text-slate-400",   badge: "bg-slate-700 text-slate-400" },
};

// ─── REUSABLE UI ──────────────────────────────────────────────────────────────
function ProgressBar({ value, colorClass = "bg-violet-500" }) {
  return (
    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${colorClass}`} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    violet:  "text-violet-400 bg-violet-500/10 border-violet-500/20",
    sky:     "text-sky-400 bg-sky-500/10 border-sky-500/20",
    slate:   "text-slate-400 bg-slate-700/50 border-slate-600/30",
  };
  return (
    <div className={`rounded-2xl border p-4 flex items-center gap-3 ${colors[color]}`}>
      <div className={`p-2.5 rounded-xl ${colors[color]}`}><Icon size={18} /></div>
      <div>
        <p className="text-2xl font-bold text-white leading-none">{value}</p>
        <p className="text-xs mt-0.5 text-slate-400">{label}</p>
      </div>
    </div>
  );
}

// ─── ABSENCE CARD ─────────────────────────────────────────────────────────────
function AbsenceCard({ subject, faltas, onSetFaltas }) {
  const meta = getDynamicAttendanceMeta(subject);
  const { limite, restam, diasRestantes, pct, state } = calcAbsence(meta, faltas);
  const c = getSubjectColors(subject.id);

  const stateStyle = {
    safe:    { bar: "bg-emerald-500", icon: Shield,        textColor: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    warning: { bar: "bg-amber-400",   icon: AlertTriangle, textColor: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
    danger:  { bar: "bg-red-500",     icon: XCircle,       textColor: "text-red-400",     bg: "bg-red-500/10 border-red-500/20" },
  }[state];

  const IconAlert = stateStyle.icon;

  return (
    <div className={`rounded-2xl border ${c.border} bg-slate-900 overflow-hidden`}>
      <div className={`h-1 w-full ${c.bg}`} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={`w-2 h-2 rounded-full ${c.dot}`} />
              <span className="text-xs text-slate-500 font-medium">{subject.id}</span>
            </div>
            <h4 className="text-sm font-bold text-white leading-snug">{subject.name}</h4>
          </div>
          <span className="text-xs text-slate-600 shrink-0">{meta.cargaHoraria}h</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-slate-500 mr-auto">Faltas atuais</span>
          <button onClick={() => onSetFaltas(Math.max(0, faltas - 1))}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <Minus size={12} />
          </button>
          <span className="text-lg font-bold text-white w-8 text-center">{faltas}</span>
          <button onClick={() => onSetFaltas(Math.min(meta.cargaHoraria, faltas + 1))}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <Plus size={12} />
          </button>
          <span className="text-xs text-slate-600">/ {limite} max</span>
        </div>

        <ProgressBar value={pct} colorClass={stateStyle.bar} />
        <div className="flex justify-between text-xs text-slate-600 mt-1 mb-3">
          <span>{faltas} usadas</span>
          <span>{pct}% do limite</span>
        </div>

        <div className={`rounded-xl border px-3 py-2 flex items-center gap-2 ${stateStyle.bg}`}>
          <IconAlert size={14} className={stateStyle.textColor} />
          <p className={`text-xs font-medium ${stateStyle.textColor}`}>
            {state === "danger"  && "Limite estourado. Reprovado por falta (RF)."}
            {state === "warning" && `Atenção! Só pode faltar mais ${diasRestantes} dia${diasRestantes !== 1 ? "s" : ""} de ${subject.name.substring(0, 20)}.`}
            {state === "safe"    && `Tranquilo. Ainda pode faltar ${diasRestantes} dia${diasRestantes !== 1 ? "s" : ""}.`}
          </p>
        </div>

        <div className="mt-2 flex gap-3 text-xs text-slate-600">
          <span>{meta.aulasPorDia} aulas/dia</span>
          <span>·</span>
          <span>{Math.max(0, restam)} faltas restantes</span>
        </div>
      </div>
    </div>
  );
}

// ─── SCHEDULE TAB ─────────────────────────────────────────────────────────────
function ScheduleTab() {
  const timeMarkers = [];
  for (let m = DAY_START; m <= DAY_END; m += 60) timeMarkers.push(m);
  const pct = (min) => ((min - DAY_START) / DAY_SPAN) * 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {Object.entries(SUBJECT_COLORS).map(([id, c]) => {
          const subject = SUBJECTS.find(s => s.id === id);
          return subject ? (
            <div key={id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${c.light} border ${c.border}`}>
              <span className={`w-2 h-2 rounded-full ${c.dot}`} />
              <span className="text-xs text-white font-medium">{subject.name.substring(0, 15)}</span>
            </div>
          ) : null;
        })}
      </div>

      <div className="space-y-4">
        {SCHEDULE.map(({ day, dayShort, blocks }) => (
          <div key={day} className="flex gap-3 items-start">
            <div className="w-10 shrink-0 pt-5 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{dayShort}</span>
            </div>
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-3">
              <div className="relative h-4 mb-2">
                {timeMarkers.map(m => (
                  <span key={m} className="absolute text-[10px] text-slate-600 -translate-x-1/2"
                    style={{ left: `${pct(m)}%` }}>
                    {fmtTime(m)}
                  </span>
                ))}
              </div>

              <div className="relative h-14 bg-slate-800/50 rounded-xl overflow-hidden">
                {timeMarkers.map(m => (
                  <div key={m} className="absolute top-0 bottom-0 w-px bg-slate-700/40" style={{ left: `${pct(m)}%` }} />
                ))}
                {blocks.map((block, i) => {
                  const c = getSubjectColors(block.id);
                  const left  = pct(block.start);
                  const width = pct(block.end) - pct(block.start);
                  return (
                    <div key={`${block.id}-${i}`}
                      className={`absolute top-1 bottom-1 rounded-lg ${c.bg} border ${c.border} flex flex-col justify-center px-2 overflow-hidden cursor-default`}
                      style={{ left: `${left}%`, width: `${width}%` }}
                      title={`${block.name} · ${fmtTime(block.start)} – ${fmtTime(block.end)} · ${block.aulas} aula(s)`}>
                      <span className={`text-[11px] font-bold leading-tight truncate ${c.text}`}>{block.name}</span>
                      <span className={`text-[10px] opacity-70 truncate ${c.text}`}>{fmtTime(block.start)}–{fmtTime(block.end)}</span>
                      {block.intervals?.map((iv, j) => (
                        <div key={j} className="absolute top-0 bottom-0 bg-slate-950/40 border-x border-slate-600/40"
                          style={{
                            left:  `${((iv.start - block.start) / (block.end - block.start)) * 100}%`,
                            width: `${((iv.end - iv.start) / (block.end - block.start)) * 100}%`,
                          }} />
                      ))}
                    </div>
                  );
                })}
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {blocks.map((block, i) => {
                  const c = getSubjectColors(block.id);
                  return (
                    <span key={`${block.id}-${i}-lbl`}
                      className={`text-[10px] px-2 py-0.5 rounded-full ${c.light} border ${c.border} ${c.text}`}>
                      {fmtTime(block.start)}–{fmtTime(block.end)} · {block.name} ({block.aulas}×)
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
        {[
          { label: "Dias com aula",   value: "5",   sub: "Seg → Sex",        icon: CalendarDays, color: "text-violet-400" },
          { label: "Total aulas/sem", value: SCHEDULE.reduce((a,d)=>a+d.blocks.reduce((x,b)=>x+b.aulas,0),0),
                                              sub: "blocos de 50 min",   icon: BookOpen,     color: "text-sky-400" },
          { label: "Dia mais pesado", value: "Seg", sub: "Eng.SW + Ext.I",   icon: TrendingUp,   color: "text-amber-400" },
          { label: "Dia mais leve",   value: "Qua", sub: "Lab. Circ. (2h)", icon: Star,         color: "text-emerald-400" },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-2xl p-3">
            <Icon size={14} className={`${color} mb-1.5`} />
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-400">{label}</p>
            <p className="text-xs text-slate-600">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ABSENCE TAB ─────────────────────────────────────────────────────────────
function AbsenceTab({ subjects, faltas, setFaltas }) {
  // Filtro dinâmico: inclui TODAS as disciplinas com status "current", sem dependência de ATTENDANCE_META
  const currentSubs = subjects.filter(s => s.status === "current");
  const alerts = currentSubs.filter(s => {
    const meta = getDynamicAttendanceMeta(s);
    const { state } = calcAbsence(meta, faltas[s.id] || 0);
    return state !== "safe";
  });

  return (
    <div className="space-y-6">
      {alerts.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-amber-400" />
            <span className="text-sm font-bold text-amber-300">{alerts.length} disciplina{alerts.length > 1 ? "s" : ""} em situação de alerta</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {alerts.map(s => {
              const meta = getDynamicAttendanceMeta(s);
              const { state, diasRestantes } = calcAbsence(meta, faltas[s.id] || 0);
              return (
                <span key={s.id} className={`text-xs px-2.5 py-1 rounded-full font-medium ${state === "danger" ? "bg-red-500/20 text-red-300" : "bg-amber-500/20 text-amber-300"}`}>
                  {s.name.substring(0, 15)}{state !== "danger" && ` · ${diasRestantes}d restantes`}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Use os botões <span className="font-bold text-white">+/−</span> para registrar faltas.
        O sistema calcula quantos <span className="font-bold text-white">dias de aula</span> você
        ainda pode perder antes de reprovar (mínimo de 75% de presença).
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentSubs.map(s => (
          <AbsenceCard key={s.id} subject={s}
            faltas={faltas[s.id] || 0}
            onSetFaltas={(v) => setFaltas(prev => ({ ...prev, [s.id]: v }))} />
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800">
          <p className="text-sm font-semibold text-slate-300">Resumo Geral de Frequência</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800">
                {["Disciplina","CH","Limite","Faltas","Restam","Dias Restantes","Status"].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-slate-500 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentSubs.map(s => {
                const meta = getDynamicAttendanceMeta(s);
                const f = faltas[s.id] || 0;
                const { limite, restam, diasRestantes, state } = calcAbsence(meta, f);
                const statusLabel = { safe: "✅ Seguro", warning: "⚠️ Alerta", danger: "🔴 RF" }[state];
                return (
                  <tr key={s.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-3 py-2.5 text-white font-medium">{s.name.substring(0, 20)}</td>
                    <td className="px-3 py-2.5 text-slate-400">{meta.cargaHoraria}</td>
                    <td className="px-3 py-2.5 text-slate-400">{limite}</td>
                    <td className="px-3 py-2.5 font-bold text-white">{f}</td>
                    <td className={`px-3 py-2.5 font-medium ${restam <= 0 ? "text-red-400" : restam <= meta.aulasPorDia * 2 ? "text-amber-400" : "text-emerald-400"}`}>{Math.max(0, restam)}</td>
                    <td className={`px-3 py-2.5 font-bold ${diasRestantes <= 0 ? "text-red-400" : diasRestantes <= 2 ? "text-amber-400" : "text-emerald-400"}`}>{diasRestantes}</td>
                    <td className="px-3 py-2.5">{statusLabel}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── DIFF / INSTRUÇÕES DE INTEGRAÇÃO ────────────────────────────────────────
//
// Aplique estas 3 mudanças no seu AcademicDashboard.jsx existente.
// Não precisa reescrever o arquivo inteiro.
//
// ════════════════════════════════════════════════════════════════════════════
// MUDANÇA 1 — Adicione o import do hook no topo do arquivo
// (logo após os imports do lucide-react)
// ════════════════════════════════════════════════════════════════════════════

import { useSuapData } from "../../hooks/useSuapData";

// ════════════════════════════════════════════════════════════════════════════
// MUDANÇA 2 — Substitua o início da função AcademicDashboard
//
// ANTES:
//   export default function AcademicDashboard() {
//     const [tab, setTab] = useState("overview");
//     const [faltas, setFaltas] = useState({});
//
// DEPOIS (cole isso):
// ════════════════════════════════════════════════════════════════════════════

export default function AcademicDashboard() {
}
  const [tab, setTab] = useState("overview");

  // Dados vindos do SUAP (gerados pelo suap_sync.py)
  const {
    faltas,
    setFaltas,
    atualizadoEm,
    loaded,
    error: suapError,
  } = useSuapData();

  // Enquanto carrega o JSON, mostra tela de loading
  if (!loaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400 text-sm animate-pulse">Carregando dados...</p>
      </div>
    );
  }

  // --- O RESTO DO COMPONENTE CONTINUA IGUAL A PARTIR DAQUI ---
  // (stats, doneSubs, alertCount, TABS, return ...)


// ════════════════════════════════════════════════════════════════════════════
// MUDANÇA 3 — Adicione o badge "Atualizado em" no header do dashboard
//
// Dentro do return, no bloco do header (onde está o "Dashboard Acadêmico"),
// adicione logo abaixo do <p className="text-slate-500 text-sm mt-0.5">:
// ════════════════════════════════════════════════════════════════════════════

{atualizadoEm && (
  <p className="text-xs text-violet-700 mt-1 flex items-center gap-1">
    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block" />
    Dados SUAP · {new Date(atualizadoEm).toLocaleString("pt-BR")}
  </p>
)}
{suapError && (
  <p className="text-xs text-amber-600 mt-1">⚠ {suapError}</p>
)}


// ─── CURRICULUM TAB ──────────────────────────────────────────────────────────
function CurriculumTab({ subjects, getEffectiveStatus, updateSubjectStatus, getUnmetPrereqs, arePrereqsMet, onCompleteSemester }) {
  // Agrupar por semestre (1-8)
  const semesters = {};
  subjects.forEach(subject => {
    if (!semesters[subject.sem]) {
      semesters[subject.sem] = [];
    }
    semesters[subject.sem].push(subject);
  });

  // Ordenar semestres
  const semesterKeys = Object.keys(semesters).map(Number).sort((a, b) => a - b);

  const semesterLabels = {
    1: "1º Período",
    2: "2º Período",
    3: "3º Período",
    4: "4º Período",
    5: "5º Período",
    6: "6º Período",
    7: "7º Período",
    8: "8º Período",
  };

  const statusOptions = [
    { value: "done", label: "✓ Concluída", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    { value: "current", label: "◉ Cursando", color: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
    { value: "next", label: "→ Próxima", color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
    { value: "future", label: "◌ Futura", color: "bg-slate-700/50 text-slate-400 border-slate-600/30" },
  ];

  return (
    <div className="space-y-8">
      {semesterKeys.map(semNum => {
        const subs = semesters[semNum];
        const totalCH = subs.reduce((sum, s) => sum + s.ch, 0);
        const completedCount = subs.filter(s => getEffectiveStatus(s) === "done").length;

        return (
          <div key={semNum}>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-violet-400" />
                  <h3 className="text-lg font-bold text-violet-400">{semesterLabels[semNum]}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {completedCount} de {subs.length} · {totalCH}h total
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Botão Concluir Semestre */}
                {completedCount < subs.length && (
                  <button
                    onClick={() => onCompleteSemester(semNum)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                    title="Marcar todas as disciplinas deste semestre como concluídas"
                  >
                    <CheckCircle2 size={14} />
                    Concluir
                  </button>
                )}
                
                {completedCount > 0 && completedCount === subs.length && (
                  <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                    ✓ Concluído
                  </span>
                )}
                {completedCount > 0 && completedCount < subs.length && (
                  <span className="text-xs px-3 py-1.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-medium">
                    ◉ Cursando
                  </span>
                )}
                {completedCount === 0 && (
                  <span className="text-xs px-3 py-1.5 rounded-full bg-slate-700/50 text-slate-400 border border-slate-600/30 font-medium">
                    ◌ Futuro
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {subs.map(subject => {
                const effectiveStatus = getEffectiveStatus(subject);
                const s = STATUS[effectiveStatus];
                const isConcluded = effectiveStatus === "done";
                const unmetPrereqs = getUnmetPrereqs(subject);
                const hasUnmetPrereqs = unmetPrereqs.length > 0;
                
                return (
                  <div
                    key={subject.id}
                    className={`rounded-xl border p-3.5 transition-all duration-200 ${
                      isConcluded
                        ? `${s.border} ${s.bg}`
                        : "border-slate-700 bg-slate-900/50"
                    } ${hasUnmetPrereqs && (effectiveStatus === "current" || effectiveStatus === "next") ? "ring-2 ring-amber-400/50" : ""}`}
                  >
                    {/* Aviso de pré-requisitos não cumpridos */}
                    {hasUnmetPrereqs && (effectiveStatus === "current" || effectiveStatus === "next") && (
                      <div className="mb-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
                        <AlertTriangle size={12} className="text-amber-400 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-amber-300">
                          Pré-req.: {unmetPrereqs.map(p => p.id).join(", ")}
                        </p>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`text-xs font-bold ${isConcluded ? s.text : "text-slate-600"}`}>
                            {subject.id}
                          </span>
                          <span className="text-xs text-slate-600">{subject.ch}h</span>
                        </div>
                        <h4 className={`text-sm font-semibold leading-snug ${isConcluded ? "text-white" : "text-slate-300"}`}>
                          {subject.name}
                        </h4>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between mb-3">
                      <span className={`text-xs ${isConcluded ? s.text : "text-slate-600"} flex items-center gap-1`}>
                        {effectiveStatus === "done" && <CheckCircle2 size={11} />}
                        {effectiveStatus === "current" && <Circle size={11} className="animate-pulse" />}
                        {effectiveStatus === "next" && <ArrowRight size={11} />}
                        {effectiveStatus === "future" && <Clock size={11} />}
                        {s.label}
                      </span>
                      {subject.prereqs.length > 0 && (
                        <span className="text-xs text-slate-600">
                          {subject.prereqs.length} pré-req.
                        </span>
                      )}
                    </div>

                    {/* Status Change Buttons */}
                    <div className="flex flex-wrap gap-1.5">
                      {statusOptions.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => updateSubjectStatus(subject.id, opt.value)}
                          className={`text-xs px-2 py-1 rounded-lg border font-medium transition-all ${
                            effectiveStatus === opt.value
                              ? opt.color
                              : "border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400 bg-slate-900/30"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── OVERVIEW TAB ────────────────────────────────────────────────────────────
// Componente minimalista para exibição em modo leitura na OverviewTab
function MinimalSubjectCard({ subject }) {
  const s = STATUS[subject.status];
  return (
    <div className={`rounded-xl border ${s.border} ${s.bg} p-3.5 transition-all duration-200`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-white leading-snug">{subject.name}</h4>
        </div>
        <span className={`text-xs px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0 font-bold ${s.badge}`}>
          {subject.id}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className={`${s.text} flex items-center gap-1.5`}>
          {subject.status === "done"    && <CheckCircle2 size={11} />}
          {subject.status === "current" && <Circle size={11} className="animate-pulse" />}
          {subject.status === "next"    && <ArrowRight size={11} />}
          {subject.status === "future"  && <Clock size={11} />}
          <span>{s.label}</span>
        </span>
        {subject.prereqs.length > 0 && (
          <span className="text-slate-600 font-medium">{subject.prereqs.length} pré-req.</span>
        )}
      </div>
    </div>
  );
}

function OverviewTab({ subjects }) {
  // Exibir apenas disciplinas em progresso (excluindo concluídas)
  const current = subjects.filter(s => s.status === "current");
  const next    = subjects.filter(s => s.status === "next");
  const future  = subjects.filter(s => s.status === "future");

  const Section = ({ title, icon: Icon, items, color }) => (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} className={color} />
        <h3 className={`text-base font-semibold ${color}`}>{title}</h3>
        <span className="text-xs text-slate-600 ml-auto">{items.length} {items.length === 1 ? "disciplina" : "disciplinas"}</span>
      </div>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map(s => <MinimalSubjectCard key={s.id} subject={s} />)}
        </div>
      ) : (
        <p className="text-sm text-slate-500 italic py-6">Nenhuma disciplina nesta seção</p>
      )}
    </div>
  );

  const hasAnySubjects = current.length > 0 || next.length > 0 || future.length > 0;

  return (
    <div className="space-y-8">
      <Section title="◉ Cursando Atualmente" icon={BookOpen} items={current} color="text-violet-400" />
      {current.length > 0 && (next.length > 0 || future.length > 0) && <div className="border-t border-slate-800" />}
      
      <Section title="→ Próximos Passos" icon={ArrowRight} items={next} color="text-sky-400" />
      {next.length > 0 && future.length > 0 && <div className="border-t border-slate-800" />}
      
      <Section title="◌ Disciplinas Futuras" icon={Layers} items={future} color="text-slate-500" />

      {!hasAnySubjects && (
        <div className="text-center py-12">
          <BookOpen size={40} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500">Nenhuma disciplina em progresso</p>
        </div>
      )}
    </div>
  );
}

// ─── FLOW TAB ────────────────────────────────────────────────────────────────
function FlowTab({ subjects }) {
  const [selected, setSelected] = useState(null);
  const analysis = useMemo(() => {
    if (!selected) return null;
    const s = subjects.find(x => x.id === selected);
    if (!s) return null;
    const prereqNames = s.prereqs.map(id => subjects.find(x => x.id === id)).filter(Boolean);
    const unlocks = subjects.filter(x => x.prereqs.includes(s.id));
    const cascade = getCascadeCount(s.id, subjects);
    return { subject: s, prereqNames, unlocks, cascade };
  }, [selected, subjects]);

  const grouped = useMemo(() => ({
    done:    subjects.filter(s => s.status === "done"),
    current: subjects.filter(s => s.status === "current"),
    next:    subjects.filter(s => s.status === "next"),
    future:  subjects.filter(s => s.status === "future"),
  }), [subjects]);

  const ListSection = ({ title, items, color }) => items.length === 0 ? null : (
    <div className="mb-2">
      <p className={`text-xs font-bold uppercase tracking-widest mb-1.5 px-2 ${color}`}>{title}</p>
      {items.map(s => {
        const isSelected = selected === s.id;
        const st = STATUS[s.status];
        return (
          <button key={s.id} onClick={() => setSelected(isSelected ? null : s.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 mb-0.5 flex items-center gap-2
              ${isSelected ? `${st.bg} ${st.border} border text-white font-medium` : "text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent"}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? "bg-violet-400" : "bg-slate-600"}`} />
            <span className="truncate">{s.name}</span>
            <span className="ml-auto text-xs text-slate-600 shrink-0">{s.id}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex gap-4 min-h-[500px]">
      <div className="w-64 shrink-0 bg-slate-900/60 border border-slate-800 rounded-2xl p-3 overflow-y-auto max-h-[600px]">
        <p className="text-xs text-slate-500 mb-3 px-2 font-medium">Selecione uma disciplina</p>
        <ListSection title="✓ Concluídas" items={grouped.done}    color="text-emerald-600" />
        <ListSection title="◉ Cursando"   items={grouped.current} color="text-violet-500" />
        <ListSection title="→ Próximas"   items={grouped.next}    color="text-sky-500" />
        <ListSection title="◌ Futuras"    items={grouped.future}  color="text-slate-600" />
      </div>
      <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 overflow-y-auto max-h-[600px]">
        {!analysis ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3 opacity-50">
            <Network size={40} className="text-slate-600" />
            <p className="text-slate-500 text-sm">Selecione uma disciplina para ver sua análise de fluxo</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className={`rounded-xl border ${STATUS[analysis.subject.status].border} ${STATUS[analysis.subject.status].bg} p-4`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`text-xs font-bold ${STATUS[analysis.subject.status].text}`}>{analysis.subject.id}</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{analysis.subject.name}</h3>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS[analysis.subject.status].badge}`}>
                  {STATUS[analysis.subject.status].label}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 flex items-center gap-3">
              <TrendingUp size={20} className="text-amber-400 shrink-0" />
              <div>
                <p className="text-amber-300 font-bold text-xl leading-none">{analysis.cascade}</p>
                <p className="text-amber-500/80 text-xs mt-0.5">disciplinas afetadas em cascata</p>
              </div>
              <div className="ml-auto text-xs text-amber-600 text-right">
                <p>{Math.round((analysis.cascade / subjects.length) * 100)}% do curso</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5"><ChevronRight size={12} /> Depende de</p>
              {analysis.prereqNames.length === 0 ? <p className="text-sm text-slate-600 italic">Nenhum pré-requisito</p> : (
                <div className="flex flex-wrap gap-2">
                  {analysis.prereqNames.map(p => (
                    <button key={p.id} onClick={() => setSelected(p.id)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border ${STATUS[p.status].border} ${STATUS[p.status].bg} ${STATUS[p.status].text} font-medium hover:brightness-125 transition-all`}>
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Zap size={12} className="text-sky-400" /> Libera Diretamente</p>
              {analysis.unlocks.length === 0 ? <p className="text-sm text-slate-600 italic">Nenhuma matéria desbloqueada</p> : (
                <div className="flex flex-wrap gap-2">
                  {analysis.unlocks.map(u => (
                    <button key={u.id} onClick={() => setSelected(u.id)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border ${STATUS[u.status].border} ${STATUS[u.status].bg} ${STATUS[u.status].text} font-medium hover:brightness-125 transition-all`}>
                      {u.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {analysis.cascade > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5"><GitBranch size={12} className="text-amber-400" /> Peso no Curso</p>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Impacto cascata</span>
                  <span className="text-amber-400 font-bold">{analysis.cascade}/{subjects.length}</span>
                </div>
                <ProgressBar value={(analysis.cascade / subjects.length) * 100} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function AcademicDashboard() {
  // ─── STATE MANAGEMENT ────────────────────────────────────────────────────
  const [tab, setTab] = useState("overview");
  const [faltas, setFaltas] = useState({});
  const [currentSemester, setCurrentSemester] = useState(5); // Semestre atual
  const [subjectStatus, setSubjectStatus] = useState({}); // { id -> "done" | "current" | "next" | "future" }
  const [userName, setUserName] = useState(""); // Nome do utilizador
  const [userNameInput, setUserNameInput] = useState(""); // Input temporário

  // ─── LOAD FROM LOCALSTORAGE ─────────────────────────────────────────────
  useEffect(() => {
    const savedSemester = localStorage.getItem("currentSemester");
    const savedStatus = localStorage.getItem("subjectStatus");
    const savedFaltas = localStorage.getItem("faltas");
    const savedUserName = localStorage.getItem("userName");

    if (savedSemester) setCurrentSemester(parseInt(savedSemester));
    if (savedStatus) {
      try {
        setSubjectStatus(JSON.parse(savedStatus));
      } catch (e) {
        console.error("Erro ao carregar status das matérias:", e);
      }
    }
    if (savedFaltas) {
      try {
        setFaltas(JSON.parse(savedFaltas));
      } catch (e) {
        console.error("Erro ao carregar faltas:", e);
      }
    }
    if (savedUserName) {
      setUserName(savedUserName);
      setUserNameInput(savedUserName);
    }
  }, []);

  // ─── SAVE TO LOCALSTORAGE ───────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem("currentSemester", currentSemester.toString());
  }, [currentSemester]);

  useEffect(() => {
    localStorage.setItem("subjectStatus", JSON.stringify(subjectStatus));
  }, [subjectStatus]);

  useEffect(() => {
    localStorage.setItem("faltas", JSON.stringify(faltas));
  }, [faltas]);

  useEffect(() => {
    if (userName) {
      localStorage.setItem("userName", userName);
    }
  }, [userName]);

  // ─── HANDLE USER NAME SAVE ──────────────────────────────────────────────
  const handleUserNameSave = () => {
    if (userNameInput.trim()) {
      setUserName(userNameInput.trim());
    }
  };

  // ─── HANDLE COMPLETE SEMESTER ───────────────────────────────────────────
  const handleCompleteSemester = (semesterNum) => {
    const subjectsInSem = SUBJECTS.filter(s => s.sem === semesterNum);
    const newStatus = { ...subjectStatus };
    subjectsInSem.forEach(subject => {
      newStatus[subject.id] = "done";
    });
    setSubjectStatus(newStatus);
  };

  // ─── HELPER: GET EFFECTIVE STATUS (LOCAL STATE OVER DEFAULT) ───────────
  const getEffectiveStatus = (subject) => {
    return subjectStatus[subject.id] || subject.status;
  };

  // ─── HELPER: CHECK IF PREREQUISITES ARE MET ─────────────────────────────
  const arePrereqsMet = (subject) => {
    return subject.prereqs.every(
      (prereqId) => getEffectiveStatus(SUBJECTS.find((s) => s.id === prereqId)) === "done"
    );
  };

  // ─── HELPER: GET UNMET PREREQUISITES ────────────────────────────────────
  const getUnmetPrereqs = (subject) => {
    return subject.prereqs
      .filter((prereqId) => getEffectiveStatus(SUBJECTS.find((s) => s.id === prereqId)) !== "done")
      .map((prereqId) => SUBJECTS.find((s) => s.id === prereqId));
  };

  // ─── HELPER: UPDATE SUBJECT STATUS ──────────────────────────────────────
  const updateSubjectStatus = (subjectId, newStatus) => {
    const subject = SUBJECTS.find((s) => s.id === subjectId);
    if (!subject) return;

    // Validação: não pode marcar como "current" ou "next" sem pré-requisitos cumpridos
    if ((newStatus === "current" || newStatus === "next") && !arePrereqsMet(subject)) {
      alert(
        `⚠️ Você não pode marcar '${subject.name}' como '${newStatus === "current" ? "Cursando" : "Próxima"}' sem cumprir os pré-requisitos:\n\n${getUnmetPrereqs(subject)
          .map((p) => `• ${p.name}`)
          .join("\n")}`
      );
      return;
    }

    setSubjectStatus((prev) => ({ ...prev, [subjectId]: newStatus }));
  };

  // ─── CREATE MODIFIED SUBJECTS LIST ──────────────────────────────────────
  const SUBJECTS_WITH_STATUS = SUBJECTS.map((s) => ({
    ...s,
    status: getEffectiveStatus(s),
  }));

  // ─── STATS CALCULATION ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    const done = SUBJECTS_WITH_STATUS.filter((s) => s.status === "done").length;
    const current = SUBJECTS_WITH_STATUS.filter((s) => s.status === "current").length;
    const future = SUBJECTS_WITH_STATUS.filter(
      (s) => s.status !== "done" && s.status !== "current"
    ).length;
    const total = SUBJECTS_WITH_STATUS.length;
    return { done, current, future, total, pct: Math.round((done / total) * 100) };
  }, [subjectStatus]);

  const doneSubs = SUBJECTS_WITH_STATUS.filter(s => s.status === "done");
  const alertCount = SUBJECTS_WITH_STATUS.filter(s => {
    if (!ATTENDANCE_META[s.id]) return false;
    const { state } = calcAbsence(ATTENDANCE_META[s.id], faltas[s.id] || 0);
    return state !== "safe";
  }).length;

  const TABS = [
    { id: "overview",    label: "Visão Geral",     icon: BarChart3 },
    { id: "curriculum",  label: "Matriz",          icon: GraduationCap },
    { id: "schedule",    label: "Horário",         icon: Calendar },
    { id: "absence",     label: "Faltas",          icon: AlertTriangle, badge: alertCount },
    { id: "flow",        label: "Análise de Fluxo", icon: GitBranch },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6 lg:p-8" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="max-w-6xl mx-auto space-y-6">

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap size={18} className="text-violet-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-violet-400">Engenharia de Computação · IFMT</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              {userName ? `${userName} — Dashboard Acadêmico` : "Dashboard Acadêmico"}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Fluxo curricular · 2026/1</p>
          </div>
          <div className="text-right flex flex-col gap-3">
            {/* Campos de Configuração */}
            <div className="space-y-2">
              {/* Nome do Utilizador */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={userNameInput}
                  onChange={(e) => setUserNameInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleUserNameSave()}
                  placeholder="Digite seu nome..."
                  className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm placeholder-slate-500 hover:border-violet-500 transition-colors"
                />
                <button
                  onClick={handleUserNameSave}
                  className="px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
                >
                  ✓
                </button>
              </div>

              {/* Seletor de Semestre */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-400 min-w-fit">Semestre:</label>
                <select
                  value={currentSemester}
                  onChange={(e) => setCurrentSemester(parseInt(e.target.value))}
                  className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm font-medium hover:border-violet-500 transition-colors cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>{sem}º</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Progresso */}
            <div>
              <p className="text-4xl font-black text-violet-400">{stats.pct}%</p>
              <p className="text-xs text-slate-500">concluído</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Progresso Total do Curso</span>
            <span>{stats.done} de {stats.total} disciplinas</span>
          </div>
          <ProgressBar value={stats.pct} colorClass="bg-violet-500" />
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[
              { v: stats.done,    l: "Concluídas", c: "text-emerald-400" },
              { v: stats.current, l: "Cursando",   c: "text-violet-400" },
              { v: stats.future,  l: "Restantes",  c: "text-slate-500" },
            ].map(({ v, l, c }) => (
              <div key={l}><p className={`text-xl font-bold ${c}`}>{v}</p><p className="text-xs text-slate-600">{l}</p></div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={CheckCircle2} label="Concluídas" value={stats.done}    color="emerald" />
          <StatCard icon={BookOpen}     label="Cursando"   value={stats.current} color="violet" />
          <StatCard icon={Star}         label="Próximas"   value={SUBJECTS_WITH_STATUS.filter(s=>s.status==="next").length}   color="sky" />
          <StatCard icon={Clock}        label="Futuras"    value={SUBJECTS_WITH_STATUS.filter(s=>s.status==="future").length} color="slate" />
        </div>

        <details className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <summary className="p-4 flex items-center gap-2 cursor-pointer select-none hover:bg-slate-800/50 transition-colors">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-400">Disciplinas Concluídas</span>
            <span className="ml-auto text-xs text-slate-500">{doneSubs.length} disciplinas · expandir</span>
          </summary>
          <div className="px-4 pb-4 pt-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5">
            {doneSubs.map(s => (
              <div key={s.id} className="flex items-center gap-1.5 text-xs text-slate-400">
                <CheckCircle2 size={10} className="text-emerald-500 shrink-0" />
                <span className="truncate">{s.name}</span>
              </div>
            ))}
          </div>
        </details>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex border-b border-slate-800 overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon, badge }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-all border-b-2 whitespace-nowrap
                  ${tab === id ? "border-violet-500 text-violet-400 bg-violet-500/5" : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"}`}>
                <Icon size={14} />
                {label}
                {badge > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] font-black flex items-center justify-center leading-none">{badge}</span>
                )}
              </button>
            ))}
          </div>
          <div className="p-5">
            {tab === "overview"   && <OverviewTab subjects={SUBJECTS_WITH_STATUS} />}
            {tab === "curriculum" && <CurriculumTab subjects={SUBJECTS_WITH_STATUS} getEffectiveStatus={getEffectiveStatus} updateSubjectStatus={updateSubjectStatus} getUnmetPrereqs={getUnmetPrereqs} arePrereqsMet={arePrereqsMet} onCompleteSemester={handleCompleteSemester} />}
            {tab === "schedule"   && <ScheduleTab />}
            {tab === "absence"    && <AbsenceTab subjects={SUBJECTS_WITH_STATUS} faltas={faltas} setFaltas={setFaltas} />}
            {tab === "flow"       && <FlowTab subjects={SUBJECTS_WITH_STATUS} />}
          </div>
        </div>

        <p className="text-center text-xs text-slate-700 pb-4">Dashboard Acadêmico · Engenharia da Computação · IFMT 2026</p>
      </div>
    </div>
  );
}


import { useSuapData } from "../../hooks/useSuapData";

export default function AcademicDashboard() {
  const [tab, setTab] = useState("overview");

  const {
    faltas,
    setFaltas,
    atualizadoEm,
    loaded,
    error: suapError,
  } = useSuapData();

  
  if (!loaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400 text-sm animate-pulse">Carregando dados...</p>
      </div>
    );
  }

{atualizadoEm && (
  <p className="text-xs text-violet-700 mt-1 flex items-center gap-1">
    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block" />
    Dados SUAP · {new Date(atualizadoEm).toLocaleString("pt-BR")}
  </p>
)}
{suapError && (
  <p className="text-xs text-amber-600 mt-1">⚠ {suapError}</p>
)}
}
