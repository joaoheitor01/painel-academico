import { useState, useMemo } from "react";
import {
  CheckCircle2, Circle, BookOpen, Zap, ChevronRight,
  BarChart3, GitBranch, GraduationCap, Clock, Star,
  ArrowRight, Layers, TrendingUp, Network, Calendar,
  AlertTriangle, XCircle, Shield, Minus, Plus, CalendarDays
} from "lucide-react";

// ─── SUBJECTS DATA ───────────────────────────────────────────────────────────
const SUBJECTS = [
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
  "ENC-34": { cargaHoraria: 80, aulasPorDia: 4, shortName: "Eng. Software" },
  "ENC-33": { cargaHoraria: 60, aulasPorDia: 3, shortName: "Extensão I" },
  "ENC-29": { cargaHoraria: 80, aulasPorDia: 4, shortName: "Compiladores" },
  "ENC-32": { cargaHoraria: 40, aulasPorDia: 2, shortName: "Lab. Circuitos I" },
  "ENC-30": { cargaHoraria: 60, aulasPorDia: 3, shortName: "Prog. WEB" },
  "ENC-24": { cargaHoraria: 60, aulasPorDia: 2, shortName: "Cálculo Numérico" },
  "ENC-22": { cargaHoraria: 80, aulasPorDia: 4, shortName: "Eq. Diferenciais" },
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

const SUBJECT_COLORS = {
  "ENC-34": { bg: "bg-violet-600",  border: "border-violet-500", text: "text-violet-100", dot: "bg-violet-400",  light: "bg-violet-500/15" },
  "ENC-33": { bg: "bg-teal-600",    border: "border-teal-500",   text: "text-teal-100",   dot: "bg-teal-400",    light: "bg-teal-500/15" },
  "ENC-29": { bg: "bg-orange-600",  border: "border-orange-500", text: "text-orange-100", dot: "bg-orange-400",  light: "bg-orange-500/15" },
  "ENC-32": { bg: "bg-pink-600",    border: "border-pink-500",   text: "text-pink-100",   dot: "bg-pink-400",    light: "bg-pink-500/15" },
  "ENC-30": { bg: "bg-sky-600",     border: "border-sky-500",    text: "text-sky-100",    dot: "bg-sky-400",     light: "bg-sky-500/15" },
  "ENC-24": { bg: "bg-amber-600",   border: "border-amber-500",  text: "text-amber-100",  dot: "bg-amber-400",   light: "bg-amber-500/15" },
  "ENC-22": { bg: "bg-rose-600",    border: "border-rose-500",   text: "text-rose-100",   dot: "bg-rose-400",    light: "bg-rose-500/15" },
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

function calcAbsence(meta, faltas) {
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
  const meta = ATTENDANCE_META[subject.id];
  if (!meta) return null;
  const { limite, restam, diasRestantes, pct, state } = calcAbsence(meta, faltas);
  const c = SUBJECT_COLORS[subject.id];

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
            {state === "warning" && `Atenção! Só pode faltar mais ${diasRestantes} dia${diasRestantes !== 1 ? "s" : ""} de ${meta.shortName}.`}
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
          const meta = ATTENDANCE_META[id];
          return meta ? (
            <div key={id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${c.light} border ${c.border}`}>
              <span className={`w-2 h-2 rounded-full ${c.dot}`} />
              <span className="text-xs text-white font-medium">{meta.shortName}</span>
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
                  const c = SUBJECT_COLORS[block.id];
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
                  const c = SUBJECT_COLORS[block.id];
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
  const currentSubs = subjects.filter(s => s.status === "current" && ATTENDANCE_META[s.id]);
  const alerts = currentSubs.filter(s => {
    const { state } = calcAbsence(ATTENDANCE_META[s.id], faltas[s.id] || 0);
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
              const { state, diasRestantes } = calcAbsence(ATTENDANCE_META[s.id], faltas[s.id] || 0);
              return (
                <span key={s.id} className={`text-xs px-2.5 py-1 rounded-full font-medium ${state === "danger" ? "bg-red-500/20 text-red-300" : "bg-amber-500/20 text-amber-300"}`}>
                  {ATTENDANCE_META[s.id].shortName}{state !== "danger" && ` · ${diasRestantes}d restantes`}
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
                const meta = ATTENDANCE_META[s.id];
                const f = faltas[s.id] || 0;
                const { limite, restam, diasRestantes, state } = calcAbsence(meta, f);
                const statusLabel = { safe: "✅ Seguro", warning: "⚠️ Alerta", danger: "🔴 RF" }[state];
                return (
                  <tr key={s.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-3 py-2.5 text-white font-medium">{meta.shortName}</td>
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

// ─── OVERVIEW TAB ────────────────────────────────────────────────────────────
function SubjectCard({ subject }) {
  const s = STATUS[subject.status];
  return (
    <div className={`rounded-xl border ${s.border} ${s.bg} p-3.5 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-white leading-snug">{subject.name}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 font-medium ${s.badge}`}>{subject.id}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 items-center">
        {subject.academicTerm && (
          <span className="text-[10px] uppercase tracking-widest text-slate-500">{subject.academicTerm}</span>
        )}
        {subject.tags?.map(tag => (
          <span key={tag} className="text-[10px] px-2 py-1 rounded-full bg-slate-800 text-slate-400">{tag}</span>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <span className={`text-xs ${s.text} flex items-center gap-1`}>
          {subject.status === "done"    && <CheckCircle2 size={11} />}
          {subject.status === "current" && <Circle size={11} className="animate-pulse" />}
          {subject.status === "next"    && <ArrowRight size={11} />}
          {subject.status === "future"  && <Clock size={11} />}
          {s.label}
        </span>
        {subject.prereqs.length > 0 && <span className="text-xs text-slate-600">· {subject.prereqs.length} pré-req.</span>}
      </div>
    </div>
  );
}

function OverviewTab({ subjects }) {
  const current = subjects.filter(s => s.status === "current");
  const next    = subjects.filter(s => s.status === "next");
  const future  = subjects.filter(s => s.status === "future");
  const Section = ({ title, icon: Icon, items, color }) => (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={15} className={color} />
        <h3 className={`text-sm font-semibold ${color}`}>{title}</h3>
        <span className="text-xs text-slate-600 ml-auto">{items.length} disciplinas</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {items.map(s => <SubjectCard key={s.id} subject={s} />)}
      </div>
    </div>
  );
  const termGroups = ACADEMIC_TERMS.map(term => ({
    ...term,
    items: subjects.filter(s => s.academicTerm === term.id),
  })).filter(term => term.items.length > 0);

  return (
    <div className="space-y-8">
      <Section title="5º Semestre — Cursando (2026/1)" icon={BookOpen}  items={current} color="text-violet-400" />
      <div className="border-t border-slate-800" />
      <Section title="Próximos Passos — Semestre 6"   icon={ArrowRight} items={next}    color="text-sky-400" />
      <div className="border-t border-slate-800" />
      <Section title="Disciplinas Futuras"             icon={Layers}     items={future}  color="text-slate-500" />

      <div className="border-t border-slate-800" />
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Layers size={15} className="text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-400">Arquitetura por Ano Letivo</h3>
        </div>
        <div className="space-y-4">
          {termGroups.map(term => (
            <div key={term.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">{term.label}</p>
                  <p className="text-sm font-bold text-white">{term.items.length} disciplina{term.items.length !== 1 ? "s" : ""}</p>
                </div>
                <span className="text-xs text-slate-500">{term.id}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {term.items.map(s => <SubjectCard key={s.id} subject={s} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
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
  const [tab, setTab] = useState("overview");
  const [faltas, setFaltas] = useState({});

  const stats = useMemo(() => {
    const done    = SUBJECTS.filter(s => s.status === "done").length;
    const current = SUBJECTS.filter(s => s.status === "current").length;
    const future  = SUBJECTS.filter(s => s.status !== "done" && s.status !== "current").length;
    const total   = SUBJECTS.length;
    return { done, current, future, total, pct: Math.round((done / total) * 100) };
  }, []);

  const doneSubs = SUBJECTS.filter(s => s.status === "done");
  const alertCount = SUBJECTS.filter(s => {
    if (!ATTENDANCE_META[s.id]) return false;
    const { state } = calcAbsence(ATTENDANCE_META[s.id], faltas[s.id] || 0);
    return state !== "safe";
  }).length;

  const TABS = [
    { id: "overview",  label: "Visão Geral",     icon: BarChart3 },
    { id: "schedule",  label: "Horário",          icon: Calendar },
    { id: "absence",   label: "Faltas",           icon: AlertTriangle, badge: alertCount },
    { id: "flow",      label: "Análise de Fluxo", icon: GitBranch },
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
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">Dashboard Acadêmico</h1>
            <p className="text-slate-500 text-sm mt-0.5">Fluxo curricular · 2026/1</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black text-violet-400">{stats.pct}%</p>
            <p className="text-xs text-slate-500">concluído</p>
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
          <StatCard icon={Star}         label="Próximas"   value={SUBJECTS.filter(s=>s.status==="next").length}   color="sky" />
          <StatCard icon={Clock}        label="Futuras"    value={SUBJECTS.filter(s=>s.status==="future").length} color="slate" />
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
            {tab === "overview" && <OverviewTab subjects={SUBJECTS} />}
            {tab === "schedule" && <ScheduleTab />}
            {tab === "absence"  && <AbsenceTab subjects={SUBJECTS} faltas={faltas} setFaltas={setFaltas} />}
            {tab === "flow"     && <FlowTab subjects={SUBJECTS} />}
          </div>
        </div>

        <p className="text-center text-xs text-slate-700 pb-4">GIDEON Academic · João Heitor · ENC 2026/1</p>
      </div>
    </div>
  );
}
