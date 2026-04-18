import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  GitBranch,
  GraduationCap,
  Layers,
  Minus,
  Network,
  Plus,
  Shield,
  Star,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";

const SUBJECTS = [
  { id: "ENC-01", name: "Fundamentos da Matematica", sem: 1, status: "done", academicTerm: "2024/1", prereqs: [] },
  { id: "ENC-02", name: "Desenho Tecnico em Ambiente Computacional", sem: 1, status: "done", academicTerm: "2024/1", prereqs: [] },
  { id: "ENC-03", name: "Calculo Vetorial e Geometria Analitica", sem: 1, status: "done", academicTerm: "2024/1", prereqs: ["ENC-01"] },
  { id: "ENC-04", name: "Quimica Geral e Ciencia dos Materiais", sem: 1, status: "done", academicTerm: "2024/1", prereqs: [] },
  { id: "ENC-05", name: "Introducao a Engenharia da Computacao", sem: 1, status: "done", academicTerm: "2024/1", prereqs: [] },
  { id: "ENC-06", name: "Algoritmos I", sem: 1, status: "done", academicTerm: "2024/1", prereqs: [] },
  { id: "ENC-07", name: "Economia", sem: 1, status: "done", academicTerm: "2024/1", prereqs: [] },

  { id: "ENC-08", name: "Calculo Diferencial e Integral I", sem: 2, status: "done", academicTerm: "2024/2", prereqs: ["ENC-01", "ENC-03"] },
  { id: "ENC-09", name: "Fisica Geral e Experimental I", sem: 2, status: "done", academicTerm: "2024/2", prereqs: ["ENC-01"] },
  { id: "ENC-10", name: "Algebra Linear", sem: 2, status: "done", academicTerm: "2024/2", prereqs: ["ENC-03"] },
  { id: "ENC-11", name: "Metodologia Cientifica", sem: 2, status: "done", academicTerm: "2024/2", prereqs: [] },
  { id: "ENC-12", name: "Arquitetura e Organizacao de Computadores", sem: 2, status: "done", academicTerm: "2024/2", prereqs: ["ENC-05"] },
  { id: "ENC-13", name: "Algoritmos II", sem: 2, status: "done", academicTerm: "2024/2", prereqs: ["ENC-06"] },
  { id: "ENC-14", name: "Ciencias do Ambiente", sem: 2, status: "done", academicTerm: "2024/2", prereqs: ["ENC-04"] },

  { id: "ENC-15", name: "Calculo Diferencial e Integral II", sem: 3, status: "done", academicTerm: "2025/1", prereqs: ["ENC-08"] },
  { id: "ENC-16", name: "Fisica Geral e Experimental II", sem: 3, status: "done", academicTerm: "2025/1", prereqs: ["ENC-08", "ENC-09"] },
  { id: "ENC-17", name: "Eletronica Digital", sem: 3, status: "done", academicTerm: "2025/1", prereqs: ["ENC-09"] },
  { id: "ENC-18", name: "Introducao a Extensao", sem: 3, status: "done", academicTerm: "2025/1", prereqs: [] },
  { id: "ENC-19", name: "Estruturas de Dados", sem: 3, status: "done", academicTerm: "2025/1", prereqs: ["ENC-13"] },
  { id: "ENC-20", name: "Probabilidade e Estatistica", sem: 3, status: "done", academicTerm: "2025/1", prereqs: ["ENC-01"] },

  { id: "ENC-21", name: "Equacoes Diferenciais", sem: 4, status: "current", academicTerm: "2025/2", prereqs: ["ENC-15"] },
  { id: "ENC-22", name: "Fisica Geral e Experimental III", sem: 4, status: "current", academicTerm: "2025/2", prereqs: ["ENC-15", "ENC-16"] },
  { id: "ENC-23", name: "Calculo Numerico", sem: 4, status: "current", academicTerm: "2025/2", prereqs: ["ENC-15", "ENC-10"] },
  { id: "ENC-24", name: "Banco de Dados", sem: 4, status: "done", academicTerm: "2025/2", prereqs: ["ENC-19"] },
  { id: "ENC-25", name: "Programacao Orientada a Objetos", sem: 4, status: "done", academicTerm: "2025/2", prereqs: ["ENC-19"] },
  { id: "ENC-26", name: "Matematica Discreta e Teoria dos Grafos", sem: 4, status: "done", academicTerm: "2025/2", prereqs: ["ENC-13"] },
  { id: "ENC-27", name: "Transmissao e Comunicacao de Dados", sem: 4, status: "done", academicTerm: "2025/2", prereqs: ["ENC-12"] },

  { id: "ENC-28", name: "Etica Profissional", sem: 5, status: "done", academicTerm: "2026/1", prereqs: [] },
  { id: "ENC-29", name: "Circuitos Eletricos I", sem: 5, status: "done", academicTerm: "2026/1", prereqs: ["ENC-16"] },
  { id: "ENC-30", name: "Laboratorio de Circuitos Eletricos I", sem: 5, status: "current", academicTerm: "2026/1", prereqs: ["ENC-29"] },
  { id: "ENC-31", name: "Engenharia de Software", sem: 5, status: "current", academicTerm: "2026/1", prereqs: ["ENC-24", "ENC-25"] },
  { id: "ENC-32", name: "Programacao WEB", sem: 5, status: "current", academicTerm: "2026/1", prereqs: ["ENC-24", "ENC-25"] },
  { id: "ENC-33", name: "Compiladores", sem: 5, status: "current", academicTerm: "2026/1", prereqs: ["ENC-19"] },
  { id: "ENC-34", name: "Extensao I", sem: 5, status: "current", academicTerm: "2026/1", prereqs: ["ENC-18"] },

  { id: "ENC-35", name: "Laboratorio de Circuitos Eletricos II", sem: 6, status: "future", academicTerm: "2026/2", prereqs: ["ENC-30"] },
  { id: "ENC-36", name: "Sinais e Sistemas Lineares", sem: 6, status: "future", academicTerm: "2026/2", prereqs: ["ENC-21"] },
  { id: "ENC-37", name: "Circuitos Eletricos II", sem: 6, status: "future", academicTerm: "2026/2", prereqs: ["ENC-29"] },
  { id: "ENC-38", name: "Eletronica Analogica I", sem: 6, status: "future", academicTerm: "2026/2", prereqs: ["ENC-17", "ENC-29"] },
  { id: "ENC-39", name: "Analise e Projeto de Sistemas Computacionais", sem: 6, status: "future", academicTerm: "2026/2", prereqs: ["ENC-31"] },
  { id: "ENC-40", name: "Inteligencia Artificial", sem: 6, status: "future", academicTerm: "2026/2", prereqs: ["ENC-19", "ENC-20"] },
  { id: "ENC-41", name: "Extensao II", sem: 6, status: "future", academicTerm: "2026/2", prereqs: ["ENC-34"] },

  { id: "ENC-42", name: "Controle de Sistemas I", sem: 7, status: "future", academicTerm: "2027/1", prereqs: ["ENC-36"] },
  { id: "ENC-43", name: "Microcontroladores", sem: 7, status: "future", academicTerm: "2027/1", prereqs: ["ENC-17", "ENC-37"] },
  { id: "ENC-44", name: "Redes de Computadores", sem: 7, status: "future", academicTerm: "2027/1", prereqs: ["ENC-27"] },
  { id: "ENC-45", name: "Mineracao de Dados", sem: 7, status: "future", academicTerm: "2027/1", prereqs: ["ENC-20", "ENC-24"] },
  { id: "ENC-46", name: "Seguranca de Sistemas", sem: 7, status: "future", academicTerm: "2027/1", prereqs: ["ENC-44"] },
  { id: "ENC-47", name: "Eletronica Analogica II", sem: 7, status: "future", academicTerm: "2027/1", prereqs: ["ENC-38"] },
  { id: "ENC-48", name: "Extensao III", sem: 7, status: "future", academicTerm: "2027/1", prereqs: ["ENC-41"] },

  { id: "ENC-49", name: "Processamento Digital de Sinais", sem: 8, status: "future", academicTerm: "2027/2", prereqs: ["ENC-36", "ENC-46"] },
  { id: "ENC-50", name: "Trabalho de Conclusao de Curso", sem: 8, status: "future", academicTerm: "2027/2", prereqs: ["ENC-39", "ENC-40"] },
  { id: "ENC-51", name: "Administracao", sem: 8, status: "future", academicTerm: "2027/2", prereqs: ["ENC-07"] },
  { id: "ENC-52", name: "Projeto de Sistemas Inteligentes", sem: 8, status: "future", academicTerm: "2027/2", prereqs: ["ENC-40", "ENC-45"] },
  { id: "ENC-53", name: "Eletiva", sem: 8, status: "future", academicTerm: "2027/2", prereqs: [] },
  { id: "ENC-54", name: "Seguranca do Trabalho", sem: 8, status: "done", academicTerm: "2027/2", prereqs: [] },
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

const ATTENDANCE_META = {
  "ENC-21": { cargaHoraria: 60, aulasPorDia: 3, shortName: "Eq. Diferenciais" },
  "ENC-22": { cargaHoraria: 60, aulasPorDia: 3, shortName: "Fisica III" },
  "ENC-23": { cargaHoraria: 60, aulasPorDia: 3, shortName: "Calculo Numerico" },
  "ENC-31": { cargaHoraria: 80, aulasPorDia: 4, shortName: "Eng. Software" },
  "ENC-32": { cargaHoraria: 60, aulasPorDia: 3, shortName: "Prog. WEB" },
  "ENC-33": { cargaHoraria: 60, aulasPorDia: 3, shortName: "Compiladores" },
  "ENC-34": { cargaHoraria: 30, aulasPorDia: 2, shortName: "Extensao I" },
  "ENC-30": { cargaHoraria: 30, aulasPorDia: 2, shortName: "Lab. Circuitos I" },
};

const toMin = (hour, minute) => hour * 60 + minute;
const fmtTime = (minutes) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
const DAY_START = toMin(13, 0);
const DAY_END = toMin(22, 25);
const DAY_SPAN = DAY_END - DAY_START;

const SCHEDULE = [
  {
    day: "Segunda",
    dayShort: "SEG",
    blocks: [
      { id: "ENC-31", name: "Engenharia de Software", start: toMin(13, 0), end: toMin(16, 40), aulas: 4 },
      { id: "ENC-34", name: "Extensao I", start: toMin(16, 40), end: toMin(19, 40), aulas: 3, intervals: [{ start: toMin(18, 20), end: toMin(18, 50) }] },
    ],
  },
  {
    day: "Terca",
    dayShort: "TER",
    blocks: [
      { id: "ENC-33", name: "Compiladores", start: toMin(13, 0), end: toMin(16, 40), aulas: 4 },
      { id: "ENC-34", name: "Extensao I", start: toMin(16, 40), end: toMin(19, 40), aulas: 3, intervals: [{ start: toMin(18, 20), end: toMin(18, 50) }] },
    ],
  },
  {
    day: "Quarta",
    dayShort: "QUA",
    blocks: [{ id: "ENC-30", name: "Lab. Circuitos I", start: toMin(13, 0), end: toMin(14, 40), aulas: 2 }],
  },
  {
    day: "Quinta",
    dayShort: "QUI",
    blocks: [
      { id: "ENC-32", name: "Prog. WEB", start: toMin(13, 0), end: toMin(13, 50), aulas: 1 },
      { id: "ENC-23", name: "Calculo Numerico", start: toMin(13, 50), end: toMin(15, 30), aulas: 2 },
      { id: "ENC-32", name: "Prog. WEB", start: toMin(15, 50), end: toMin(17, 30), aulas: 2 },
    ],
  },
  {
    day: "Sexta",
    dayShort: "SEX",
    blocks: [
      { id: "ENC-23", name: "Calculo Numerico", start: toMin(13, 0), end: toMin(14, 40), aulas: 2 },
      { id: "ENC-21", name: "Eq. Diferenciais", start: toMin(18, 50), end: toMin(22, 25), aulas: 4, intervals: [{ start: toMin(20, 30), end: toMin(20, 45) }] },
    ],
  },
];

const SUBJECT_COLORS = {
  "ENC-21": { bg: "bg-rose-600", border: "border-rose-500", text: "text-rose-100", dot: "bg-rose-400", light: "bg-rose-500/15" },
  "ENC-22": { bg: "bg-cyan-600", border: "border-cyan-500", text: "text-cyan-100", dot: "bg-cyan-400", light: "bg-cyan-500/15" },
  "ENC-23": { bg: "bg-amber-600", border: "border-amber-500", text: "text-amber-100", dot: "bg-amber-400", light: "bg-amber-500/15" },
  "ENC-31": { bg: "bg-violet-600", border: "border-violet-500", text: "text-violet-100", dot: "bg-violet-400", light: "bg-violet-500/15" },
  "ENC-32": { bg: "bg-sky-600", border: "border-sky-500", text: "text-sky-100", dot: "bg-sky-400", light: "bg-sky-500/15" },
  "ENC-33": { bg: "bg-orange-600", border: "border-orange-500", text: "text-orange-100", dot: "bg-orange-400", light: "bg-orange-500/15" },
  "ENC-34": { bg: "bg-teal-600", border: "border-teal-500", text: "text-teal-100", dot: "bg-teal-400", light: "bg-teal-500/15" },
  "ENC-30": { bg: "bg-pink-600", border: "border-pink-500", text: "text-pink-100", dot: "bg-pink-400", light: "bg-pink-500/15" },
};

const STATUS = {
  done: { label: "Concluida", border: "border-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-300" },
  current: { label: "Cursando", border: "border-violet-500", bg: "bg-violet-500/10", text: "text-violet-400", badge: "bg-violet-500/20 text-violet-300" },
  next: { label: "Proxima", border: "border-sky-500", bg: "bg-sky-500/10", text: "text-sky-400", badge: "bg-sky-500/20 text-sky-300" },
  future: { label: "Futura", border: "border-slate-600", bg: "bg-slate-800/40", text: "text-slate-400", badge: "bg-slate-700 text-slate-400" },
};

const STATUS_ORDER = ["done", "current", "next", "future"];
const DEFAULT_CURRENT_SEMESTER = "2026/1";
const STORAGE_KEYS = {
  activeUser: "academic-dashboard:active-user",
  profiles: "academic-dashboard:profiles",
};

function getCascadeCount(subjectId, allSubjects) {
  const visited = new Set();

  function dfs(id) {
    if (visited.has(id)) return;
    visited.add(id);
    allSubjects.filter((subject) => subject.prereqs.includes(id)).forEach((subject) => dfs(subject.id));
  }

  dfs(subjectId);
  visited.delete(subjectId);
  return visited.size;
}

function clampPercentage(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function calcAbsence(meta, faltas) {
  const cargaHoraria = Number(meta?.cargaHoraria) || 0;
  const aulasPorDia = Math.max(1, Number(meta?.aulasPorDia) || 1);
  const totalAulas = Number(meta?.totalAulas) || 0;
  const faltasAtuais = Math.max(0, Number(faltas) || 0);

  let limite;
  if (totalAulas > 0) {
    limite = Math.max(0, Math.floor(totalAulas * 0.25));
  } else {
    limite = Math.max(0, Math.floor(cargaHoraria * 1.2 * 0.25));
  }

  const restam = limite - faltasAtuais;
  const diasRestantes = restam <= 0 ? 0 : Math.floor(restam / aulasPorDia);
  const pct = limite > 0 ? clampPercentage(Math.round((faltasAtuais / limite) * 100)) : 0;
  let state = "safe";

  if (faltasAtuais >= limite && limite > 0) state = "danger";
  else if (diasRestantes <= 2) state = "warning";

  return { limite, restam, diasRestantes, pct, state };
}

function createDefaultSubjectStatus() {
  return SUBJECTS.reduce((acc, subject) => {
    acc[subject.id] = subject.status;
    return acc;
  }, {});
}

function createDefaultProfile() {
  return {
    currentSemester: DEFAULT_CURRENT_SEMESTER,
    subjectStatus: createDefaultSubjectStatus(),
    faltas: {},
  };
}

function readLocalStorage(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalStorage(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore local persistence failures to keep the dashboard interactive.
  }
}

function normalizeUserName(name) {
  const normalized = String(name || "").trim().toLowerCase();
  return normalized || "default";
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function sanitizeSemester(value) {
  return ACADEMIC_TERMS.some((term) => term.id === value) ? value : DEFAULT_CURRENT_SEMESTER;
}

function sanitizeSubjectStatus(value) {
  const defaults = createDefaultSubjectStatus();
  if (!value || typeof value !== "object") return defaults;

  return SUBJECTS.reduce((acc, subject) => {
    const candidate = value[subject.id];
    acc[subject.id] = STATUS_ORDER.includes(candidate) ? candidate : defaults[subject.id];
    return acc;
  }, {});
}

function sanitizeFaltas(value) {
  if (!value || typeof value !== "object") return {};

  return Object.entries(value).reduce((acc, [subjectId, amount]) => {
    const parsed = Number(amount);
    if (Number.isFinite(parsed) && parsed >= 0) {
      acc[subjectId] = parsed;
    }
    return acc;
  }, {});
}

function sanitizeProfiles(value) {
  if (!value || typeof value !== "object") return {};

  return Object.entries(value).reduce((acc, [profileKey, profileValue]) => {
    acc[profileKey] = {
      currentSemester: sanitizeSemester(profileValue?.currentSemester),
      subjectStatus: sanitizeSubjectStatus(profileValue?.subjectStatus),
      faltas: sanitizeFaltas(profileValue?.faltas),
    };
    return acc;
  }, {});
}

function parseSuapNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;

  const normalized = value.replace(",", ".").match(/-?\d+(\.\d+)?/);
  if (!normalized) return null;

  const parsed = Number(normalized[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeSuapPayload(payload) {
  const disciplinas = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.disciplinas)
      ? payload.disciplinas
      : [];

  const faltasMap = Array.isArray(payload?.faltas)
    ? {}
    : payload?.faltas && typeof payload.faltas === "object"
      ? payload.faltas
      : {};

  const atualizadoEm = payload?.sincronizado_em || payload?.atualizadoEm || payload?.updatedAt || null;

  return { disciplinas, faltasMap, atualizadoEm };
}

function buildSuapAttendanceOverrides(disciplinas, fallbackMeta = {}) {
  return disciplinas.reduce((acc, item) => {
    const subjectId = item?.codigo || item?.subject_id;
    const situacao = String(item?.situacao || "").toLowerCase();

    if (!subjectId || situacao !== "cursando") return acc;

    const cargaHoraria =
      parseSuapNumber(item?.ch) ??
      parseSuapNumber(item?.carga_horaria) ??
      fallbackMeta[subjectId]?.cargaHoraria ??
      0;

    const totalAulas =
      parseSuapNumber(item?.total_aulas) ??
      parseSuapNumber(item?.totalAulas) ??
      0;

    const fallbackAulasPorDia = fallbackMeta[subjectId]?.aulasPorDia ?? 1;
    const aulasPorDia =
      totalAulas > 0 && cargaHoraria > 0
        ? Math.max(1, Math.round(totalAulas / cargaHoraria))
        : fallbackAulasPorDia;

    acc[subjectId] = {
      cargaHoraria: cargaHoraria > 0 ? cargaHoraria : fallbackMeta[subjectId]?.cargaHoraria ?? 0,
      totalAulas: totalAulas > 0 ? totalAulas : undefined,
      aulasPorDia,
      shortName: fallbackMeta[subjectId]?.shortName ?? item?.disciplina ?? item?.nome ?? subjectId,
    };

    return acc;
  }, {});
}

function buildSuapFaltas(disciplinas, fallbackFaltas = {}) {
  return disciplinas.reduce((acc, item) => {
    const subjectId = item?.codigo || item?.subject_id;
    const situacao = String(item?.situacao || "").toLowerCase();

    if (!subjectId || situacao !== "cursando") return acc;

    const totalFaltas =
      parseSuapNumber(item?.total_faltas) ??
      parseSuapNumber(item?.faltas_int) ??
      parseSuapNumber(item?.faltas) ??
      fallbackFaltas[subjectId] ??
      0;

    acc[subjectId] = Math.max(0, totalFaltas);
    return acc;
  }, {});
}

function ProgressBar({ value, colorClass = "bg-violet-500" }) {
  const safeValue = clampPercentage(value);

  return (
    <div className="w-full h-1.5 overflow-hidden rounded-full bg-slate-800">
      <div className={`h-full rounded-full transition-all duration-700 ${colorClass}`} style={{ width: `${safeValue}%` }} />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    violet: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    sky: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    slate: "text-slate-400 bg-slate-700/50 border-slate-600/30",
  };

  return (
    <div className={`flex items-center gap-3 rounded-2xl border p-4 ${colors[color]}`}>
      <div className={`rounded-xl p-2.5 ${colors[color]}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none text-white">{value}</p>
        <p className="mt-0.5 text-xs text-slate-400">{label}</p>
      </div>
    </div>
  );
}

function StatusSelector({ value, onChange }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {STATUS_ORDER.map((statusKey) => {
        const status = STATUS[statusKey];
        const isActive = value === statusKey;

        return (
          <button
            key={statusKey}
            onClick={() => onChange(statusKey)}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${
              isActive
                ? `${status.border} ${status.bg} ${status.text}`
                : "border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600 hover:text-slate-200"
            }`}
          >
            {status.label}
          </button>
        );
      })}
    </div>
  );
}

function AbsenceCard({ subject, faltas, onSetFaltas, meta }) {
  if (!meta) return null;

  const { limite, restam, diasRestantes, pct, state } = calcAbsence(meta, faltas);
  const colors = SUBJECT_COLORS[subject.id];
  const stateStyle = {
    safe: { bar: "bg-emerald-500", icon: Shield, textColor: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    warning: { bar: "bg-amber-400", icon: AlertTriangle, textColor: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    danger: { bar: "bg-red-500", icon: XCircle, textColor: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  }[state];
  const AlertIcon = stateStyle.icon;

  return (
    <div className={`overflow-hidden rounded-2xl border bg-slate-900 ${colors.border}`}>
      <div className={`h-1 w-full ${colors.bg}`} />
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <div className="mb-0.5 flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
              <span className="text-xs font-medium text-slate-500">{subject.id}</span>
            </div>
            <h4 className="text-sm font-bold leading-snug text-white">{subject.name}</h4>
          </div>
          <span className="shrink-0 text-xs text-slate-600">{meta.cargaHoraria}h</span>
        </div>

        <div className="mb-3 flex items-center gap-2">
          <span className="mr-auto text-xs text-slate-500">Faltas atuais</span>
          <button
            onClick={() => onSetFaltas(Math.max(0, faltas - 1))}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
          >
            <Minus size={12} />
          </button>
          <span className="w-8 text-center text-lg font-bold text-white">{faltas}</span>
          <button
            onClick={() => onSetFaltas(Math.min(Math.max(meta.cargaHoraria, limite), faltas + 1))}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
          >
            <Plus size={12} />
          </button>
          <span className="text-xs text-slate-600">/ {limite} max</span>
        </div>

        <ProgressBar value={pct} colorClass={stateStyle.bar} />

        <div className="mb-3 mt-1 flex justify-between text-xs text-slate-600">
          <span>{faltas} usadas</span>
          <span>{pct}% do limite</span>
        </div>

        <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${stateStyle.bg}`}>
          <AlertIcon size={14} className={stateStyle.textColor} />
          <p className={`text-xs font-medium ${stateStyle.textColor}`}>
            {state === "danger" && "Limite estourado. Reprovado por falta (RF)."}
            {state === "warning" && `Atencao: so pode faltar mais ${diasRestantes} dia${diasRestantes !== 1 ? "s" : ""}.`}
            {state === "safe" && `Tranquilo: ainda pode faltar ${diasRestantes} dia${diasRestantes !== 1 ? "s" : ""}.`}
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

function SubjectCard({ subject, showStatus = true, children }) {
  const status = STATUS[subject.status];

  return (
    <div className={`rounded-xl border p-3.5 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${status.border} ${status.bg}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium leading-snug text-white">{subject.name}</span>
        <span className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${status.badge}`}>{subject.id}</span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {subject.academicTerm && <span className="text-[10px] uppercase tracking-widest text-slate-500">{subject.academicTerm}</span>}
        {subject.tags?.map((tag) => (
          <span key={tag} className="rounded-full bg-slate-800 px-2 py-1 text-[10px] text-slate-400">
            {tag}
          </span>
        ))}
      </div>

      {showStatus && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className={`flex items-center gap-1 text-xs ${status.text}`}>
            {subject.status === "done" && <CheckCircle2 size={11} />}
            {subject.status === "current" && <Circle size={11} className="animate-pulse" />}
            {subject.status === "next" && <ArrowRight size={11} />}
            {subject.status === "future" && <Clock size={11} />}
            {status.label}
          </span>
          {subject.prereqs.length > 0 && <span className="text-xs text-slate-600">· {subject.prereqs.length} pre-req.</span>}
        </div>
      )}

      {children}
    </div>
  );
}

function ScheduleTab() {
  const timeMarkers = [];
  for (let minute = DAY_START; minute <= DAY_END; minute += 60) timeMarkers.push(minute);
  const toPercent = (minute) => ((minute - DAY_START) / DAY_SPAN) * 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {Object.entries(SUBJECT_COLORS).map(([subjectId, colors]) => {
          const meta = ATTENDANCE_META[subjectId];
          if (!meta) return null;

          return (
            <div key={subjectId} className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 ${colors.light} ${colors.border}`}>
              <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
              <span className="text-xs font-medium text-white">{meta.shortName}</span>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        {SCHEDULE.map(({ day, dayShort, blocks }) => (
          <div key={day} className="flex items-start gap-3">
            <div className="w-10 shrink-0 pt-5 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{dayShort}</span>
            </div>

            <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 p-3">
              <div className="relative mb-2 h-4">
                {timeMarkers.map((minute) => (
                  <span key={minute} className="absolute -translate-x-1/2 text-[10px] text-slate-600" style={{ left: `${toPercent(minute)}%` }}>
                    {fmtTime(minute)}
                  </span>
                ))}
              </div>

              <div className="relative h-14 overflow-hidden rounded-xl bg-slate-800/50">
                {timeMarkers.map((minute) => (
                  <div key={minute} className="absolute bottom-0 top-0 w-px bg-slate-700/40" style={{ left: `${toPercent(minute)}%` }} />
                ))}

                {blocks.map((block, index) => {
                  const colors = SUBJECT_COLORS[block.id];
                  const left = toPercent(block.start);
                  const width = toPercent(block.end) - toPercent(block.start);

                  return (
                    <div
                      key={`${block.id}-${index}`}
                      className={`absolute bottom-1 top-1 flex cursor-default flex-col justify-center overflow-hidden rounded-lg border px-2 ${colors.bg} ${colors.border}`}
                      style={{ left: `${left}%`, width: `${width}%` }}
                      title={`${block.name} · ${fmtTime(block.start)} - ${fmtTime(block.end)} · ${block.aulas} aula(s)`}
                    >
                      <span className={`truncate text-[11px] font-bold leading-tight ${colors.text}`}>{block.name}</span>
                      <span className={`truncate text-[10px] opacity-70 ${colors.text}`}>
                        {fmtTime(block.start)}-{fmtTime(block.end)}
                      </span>

                      {block.intervals?.map((interval, intervalIndex) => (
                        <div
                          key={intervalIndex}
                          className="absolute bottom-0 top-0 border-x border-slate-600/40 bg-slate-950/40"
                          style={{
                            left: `${((interval.start - block.start) / (block.end - block.start)) * 100}%`,
                            width: `${((interval.end - interval.start) / (block.end - block.start)) * 100}%`,
                          }}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {blocks.map((block, index) => {
                  const colors = SUBJECT_COLORS[block.id];

                  return (
                    <span key={`${block.id}-${index}-label`} className={`rounded-full border px-2 py-0.5 text-[10px] ${colors.light} ${colors.border} ${colors.text}`}>
                      {fmtTime(block.start)}-{fmtTime(block.end)} · {block.name} ({block.aulas}x)
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-slate-800 pt-2 sm:grid-cols-4">
        {[
          { label: "Dias com aula", value: "5", sub: "Seg a Sex", icon: CalendarDays, color: "text-violet-400" },
          {
            label: "Total aulas/sem",
            value: SCHEDULE.reduce((total, day) => total + day.blocks.reduce((sum, block) => sum + block.aulas, 0), 0),
            sub: "blocos de 50 min",
            icon: BookOpen,
            color: "text-sky-400",
          },
          { label: "Dia mais pesado", value: "Seg", sub: "Eng. SW + Ext. I", icon: TrendingUp, color: "text-amber-400" },
          { label: "Dia mais leve", value: "Qua", sub: "Lab. Circuitos", icon: Star, color: "text-emerald-400" },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
            <Icon size={14} className={`mb-1.5 ${color}`} />
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-400">{label}</p>
            <p className="text-xs text-slate-600">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AbsenceTab({
  subjects,
  faltas,
  setFaltas,
  getAttendanceMeta,
  onSync,
  isSyncing,
  syncError,
  lastSyncAt,
}) {
  const currentSubs = subjects.filter((subject) => subject.status === "current" && getAttendanceMeta(subject.id));
  const alerts = currentSubs.filter((subject) => calcAbsence(getAttendanceMeta(subject.id), faltas[subject.id] || 0).state !== "safe");
  const lastSyncLabel = lastSyncAt
    ? new Date(lastSyncAt).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "Ainda nao sincronizado";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Frequencia via SUAP</p>
          <p className="text-xs text-slate-500">Ultima sincronizacao: {lastSyncLabel}</p>
          {syncError && <p className="mt-1 text-xs text-amber-400">{syncError}</p>}
        </div>

        <button
          onClick={onSync}
          disabled={isSyncing}
          className="rounded-xl border border-violet-500/40 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-300 transition-colors hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSyncing ? "Sincronizando..." : "🔄 Sincronizar do SUAP"}
        </button>
      </div>

      {alerts.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-400" />
            <span className="text-sm font-bold text-amber-300">
              {alerts.length} disciplina{alerts.length > 1 ? "s" : ""} em situacao de alerta
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {alerts.map((subject) => {
              const { state, diasRestantes } = calcAbsence(getAttendanceMeta(subject.id), faltas[subject.id] || 0);

              return (
                <span
                  key={subject.id}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    state === "danger" ? "bg-red-500/20 text-red-300" : "bg-amber-500/20 text-amber-300"
                  }`}
                >
                  {getAttendanceMeta(subject.id)?.shortName}
                  {state !== "danger" && ` · ${diasRestantes}d restantes`}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Use os botoes <span className="font-bold text-white">+/-</span> para registrar faltas.
        O sistema calcula quantos <span className="font-bold text-white">dias de aula</span> voce ainda pode perder antes de reprovar.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {currentSubs.map((subject) => (
          <AbsenceCard
            key={subject.id}
            subject={subject}
            faltas={faltas[subject.id] || 0}
            meta={getAttendanceMeta(subject.id)}
            onSetFaltas={(value) => setFaltas((prev) => ({ ...prev, [subject.id]: value }))}
          />
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 px-4 py-3">
          <p className="text-sm font-semibold text-slate-300">Resumo Geral de Frequencia</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800">
                {["Disciplina", "CH", "Limite", "Faltas", "Restam", "Dias Restantes", "Status"].map((header) => (
                  <th key={header} className="whitespace-nowrap px-3 py-2 text-left font-medium text-slate-500">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentSubs.map((subject) => {
                const meta = getAttendanceMeta(subject.id);
                const faltasAtuais = faltas[subject.id] || 0;
                const { limite, restam, diasRestantes, state } = calcAbsence(meta, faltasAtuais);
                const statusLabel = { safe: "Seguro", warning: "Alerta", danger: "RF" }[state];

                return (
                  <tr key={subject.id} className="border-b border-slate-800/50 transition-colors hover:bg-slate-800/30">
                    <td className="px-3 py-2.5 font-medium text-white">{meta.shortName}</td>
                    <td className="px-3 py-2.5 text-slate-400">{meta.cargaHoraria}</td>
                    <td className="px-3 py-2.5 text-slate-400">{limite}</td>
                    <td className="px-3 py-2.5 font-bold text-white">{faltasAtuais}</td>
                    <td className={`px-3 py-2.5 font-medium ${restam <= 0 ? "text-red-400" : restam <= meta.aulasPorDia * 2 ? "text-amber-400" : "text-emerald-400"}`}>
                      {Math.max(0, restam)}
                    </td>
                    <td className={`px-3 py-2.5 font-bold ${diasRestantes <= 0 ? "text-red-400" : diasRestantes <= 2 ? "text-amber-400" : "text-emerald-400"}`}>
                      {diasRestantes}
                    </td>
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

function OverviewTab({ subjects, currentSemester, faltas }) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const dayNames = ["Domingo", "Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado"];
  const todayName = dayNames[dayOfWeek];
  const todayDate = today.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });

  const daySchedule = {
    1: [{ id: "ENC-31", name: "Engenharia de Software", start: "13:00 - 16:40" }, { id: "ENC-34", name: "Extensao I", start: "16:40 - 19:40" }],
    2: [{ id: "ENC-33", name: "Compiladores", start: "13:00 - 16:40" }, { id: "ENC-34", name: "Extensao I", start: "16:40 - 19:40" }],
    3: [{ id: "ENC-30", name: "Lab. Circuitos I", start: "13:00 - 14:40" }],
    4: [{ id: "ENC-32", name: "Prog. WEB", start: "13:00 - 13:50" }, { id: "ENC-23", name: "Calculo Numerico", start: "13:50 - 15:30" }, { id: "ENC-32", name: "Prog. WEB", start: "15:50 - 17:30" }],
    5: [{ id: "ENC-23", name: "Calculo Numerico", start: "13:00 - 14:40" }, { id: "ENC-21", name: "Eq. Diferenciais", start: "18:50 - 22:25" }],
  };

  const todayClasses = daySchedule[dayOfWeek] || [];
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const current = subjects.filter((subject) => subject.status === "current");
  const next = subjects.filter((subject) => subject.status === "next");
  const currentSemesterLabel = ACADEMIC_TERMS.find((term) => term.id === currentSemester)?.label || currentSemester;

  const Section = ({ title, icon: Icon, items, color }) => (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Icon size={15} className={color} />
        <h3 className={`text-sm font-semibold ${color}`}>{title}</h3>
        <span className="ml-auto text-xs text-slate-600">{items.length} disciplinas</span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-500">Nada para mostrar nesta secao.</div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-violet-500/30 bg-violet-950/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-violet-400">Hoje</p>
            <p className="text-xl font-bold text-white">{todayName} - {todayDate}</p>
          </div>
          <Calendar size={32} className="text-violet-400" />
        </div>
        {isWeekend ? (
          <p className="mt-3 text-sm text-slate-400">Sem aulas programadas neste dia. Bom descanso!</p>
        ) : todayClasses.length > 0 ? (
          <div className="mt-4 space-y-2">
            {todayClasses.map((cls, idx) => {
              const meta = ATTENDANCE_META[cls.id];
              const faltaCount = meta ? (faltas[cls.id] ?? 0) : 0;
              const limite = meta ? Math.floor(meta.cargaHoraria * 1.2 * 0.25) : 0;
              return (
                <div key={idx} className="flex items-center justify-between rounded-lg bg-slate-900/50 p-2">
                  <div>
                    <p className="text-sm font-medium text-white">{cls.name}</p>
                    <p className="text-xs text-slate-500">{cls.start}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{faltaCount} falta{faltaCount !== 1 ? "s" : ""}</p>
                    <p className="text-xs text-slate-500">limite: {limite}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      <Section title={`Cursando Atualmente · ${currentSemesterLabel}`} icon={BookOpen} items={current} color="text-violet-400" />
    </div>
  );
}

function CurriculumTab({ subjects, currentSemester, onSetSubjectStatus, onCompleteSemester }) {
  const semesters = useMemo(() => {
    return Array.from({ length: 10 }, (_, index) => {
      const semesterNumber = index + 1;
      return {
        sem: semesterNumber,
        items: subjects.filter((subject) => subject.sem === semesterNumber),
      };
    }).filter((group) => group.items.length > 0);
  }, [subjects]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-xs uppercase tracking-widest text-slate-500">Matriz Curricular</p>
        <p className="mt-1 text-sm text-slate-400">
          Ajuste o status das disciplinas por perfil local. O semestre atual selecionado e <span className="font-semibold text-white">{currentSemester}</span>.
        </p>
      </div>

      <div className="space-y-5">
        {semesters.map(({ sem, items }) => {
          const doneCount = items.filter((subject) => subject.status === "done").length;

          return (
            <div key={sem} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{sem}º Periodo</h3>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">{items.length} disciplinas</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {doneCount} concluida{doneCount !== 1 ? "s" : ""} neste periodo
                  </p>
                </div>

                <button
                  onClick={() => onCompleteSemester(sem)}
                  className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20"
                >
                  Concluir Semestre
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {items.map((subject) => (
                  <SubjectCard key={subject.id} subject={subject}>
                    <StatusSelector value={subject.status} onChange={(status) => onSetSubjectStatus(subject.id, status)} />
                  </SubjectCard>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FlowTab({ subjects }) {
  const [selected, setSelected] = useState(null);

  const analysis = useMemo(() => {
    if (!selected) return null;
    const subject = subjects.find((item) => item.id === selected);
    if (!subject) return null;

    const prereqNames = subject.prereqs.map((id) => subjects.find((item) => item.id === id)).filter(Boolean);
    const unlocks = subjects.filter((item) => item.prereqs.includes(subject.id));
    const cascade = getCascadeCount(subject.id, subjects);

    return { subject, prereqNames, unlocks, cascade };
  }, [selected, subjects]);

  const grouped = useMemo(
    () => ({
      done: subjects.filter((subject) => subject.status === "done"),
      current: subjects.filter((subject) => subject.status === "current"),
      next: subjects.filter((subject) => subject.status === "next"),
      future: subjects.filter((subject) => subject.status === "future"),
    }),
    [subjects],
  );

  const ListSection = ({ title, items, color }) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-2">
        <p className={`mb-1.5 px-2 text-xs font-bold uppercase tracking-widest ${color}`}>{title}</p>
        {items.map((subject) => {
          const isSelected = selected === subject.id;
          const status = STATUS[subject.status];

          return (
            <button
              key={subject.id}
              onClick={() => setSelected(isSelected ? null : subject.id)}
              className={`mb-0.5 flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-all duration-150 ${
                isSelected
                  ? `${status.bg} ${status.border} text-white font-medium`
                  : "border-transparent text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${isSelected ? "bg-violet-400" : "bg-slate-600"}`} />
              <span className="truncate">{subject.name}</span>
              <span className="ml-auto shrink-0 text-xs text-slate-600">{subject.id}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex min-h-[500px] gap-4">
      <div className="max-h-[600px] w-64 shrink-0 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
        <p className="mb-3 px-2 text-xs font-medium text-slate-500">Selecione uma disciplina</p>
        <ListSection title="Concluidas" items={grouped.done} color="text-emerald-600" />
        <ListSection title="Cursando" items={grouped.current} color="text-violet-500" />
        <ListSection title="Proximas" items={grouped.next} color="text-sky-500" />
        <ListSection title="Futuras" items={grouped.future} color="text-slate-600" />
      </div>

      <div className="max-h-[600px] flex-1 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        {!analysis ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center opacity-50">
            <Network size={40} className="text-slate-600" />
            <p className="text-sm text-slate-500">Selecione uma disciplina para ver sua analise de fluxo</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className={`rounded-xl border p-4 ${STATUS[analysis.subject.status].border} ${STATUS[analysis.subject.status].bg}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`text-xs font-bold ${STATUS[analysis.subject.status].text}`}>{analysis.subject.id}</span>
                  <h3 className="mt-0.5 text-lg font-bold text-white">{analysis.subject.name}</h3>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS[analysis.subject.status].badge}`}>
                  {STATUS[analysis.subject.status].label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
              <TrendingUp size={20} className="shrink-0 text-amber-400" />
              <div>
                <p className="text-xl font-bold leading-none text-amber-300">{analysis.cascade}</p>
                <p className="mt-0.5 text-xs text-amber-500/80">disciplinas afetadas em cascata</p>
              </div>
              <div className="ml-auto text-right text-xs text-amber-600">
                <p>{Math.round(((analysis.cascade || 0) / Math.max(subjects.length, 1)) * 100)}% do curso</p>
              </div>
            </div>

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500">
                <ChevronRight size={12} />
                Depende de
              </p>

              {analysis.prereqNames.length === 0 ? (
                <p className="text-sm italic text-slate-600">Nenhum pre-requisito</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {analysis.prereqNames.map((prereq) => (
                    <button
                      key={prereq.id}
                      onClick={() => setSelected(prereq.id)}
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all hover:brightness-125 ${STATUS[prereq.status].border} ${STATUS[prereq.status].bg} ${STATUS[prereq.status].text}`}
                    >
                      {prereq.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500">
                <Zap size={12} className="text-sky-400" />
                Libera Diretamente
              </p>

              {analysis.unlocks.length === 0 ? (
                <p className="text-sm italic text-slate-600">Nenhuma materia desbloqueada</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {analysis.unlocks.map((unlock) => (
                    <button
                      key={unlock.id}
                      onClick={() => setSelected(unlock.id)}
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all hover:brightness-125 ${STATUS[unlock.status].border} ${STATUS[unlock.status].bg} ${STATUS[unlock.status].text}`}
                    >
                      {unlock.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {analysis.cascade > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500">
                  <GitBranch size={12} className="text-amber-400" />
                  Peso no Curso
                </p>

                <div className="mb-1 flex justify-between text-xs text-slate-500">
                  <span>Impacto cascata</span>
                  <span className="font-bold text-amber-400">
                    {analysis.cascade}/{subjects.length}
                  </span>
                </div>
                <ProgressBar value={(analysis.cascade / Math.max(subjects.length, 1)) * 100} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AcademicDashboard() {
  const [tab, setTab] = useState("overview");
  const [userName, setUserName] = useState(() => readLocalStorage(STORAGE_KEYS.activeUser, ""));
  const [profiles, setProfiles] = useState(() => sanitizeProfiles(readLocalStorage(STORAGE_KEYS.profiles, {})));
  const [currentSemester, setCurrentSemester] = useState(DEFAULT_CURRENT_SEMESTER);
  const [subjectStatus, setSubjectStatus] = useState(() => createDefaultSubjectStatus());
  const [faltas, setFaltas] = useState({});
  const [attendanceMetaOverrides, setAttendanceMetaOverrides] = useState({});
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [syncError, setSyncError] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [suapCurrentSubjects, setSuapCurrentSubjects] = useState([]);
  const [hasSuapSnapshot, setHasSuapSnapshot] = useState(false);
  const [suapSnapshotSemester, setSuapSnapshotSemester] = useState(null);
  const hydratingProfileRef = useRef(true);
  const activeUserKey = useMemo(() => normalizeUserName(userName), [userName]);

  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.activeUser, userName);
  }, [userName]);

  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.profiles, profiles);
  }, [profiles]);

  useEffect(() => {
    const profile = profiles[activeUserKey] || createDefaultProfile();
    hydratingProfileRef.current = true;
    setCurrentSemester(sanitizeSemester(profile.currentSemester));
    setSubjectStatus(sanitizeSubjectStatus(profile.subjectStatus));
    setFaltas(sanitizeFaltas(profile.faltas));
  }, [activeUserKey, profiles]);

  useEffect(() => {
    if (hydratingProfileRef.current) {
      hydratingProfileRef.current = false;
      return;
    }

    setProfiles((prev) => {
      const currentProfile = prev[activeUserKey] || createDefaultProfile();
      const nextProfile = {
        currentSemester: sanitizeSemester(currentSemester),
        subjectStatus: sanitizeSubjectStatus(subjectStatus),
        faltas: sanitizeFaltas(faltas),
      };

      if (JSON.stringify(currentProfile) === JSON.stringify(nextProfile)) {
        return prev;
      }

      return {
        ...prev,
        [activeUserKey]: nextProfile,
      };
    });
  }, [activeUserKey, currentSemester, subjectStatus, faltas]);

  const subjects = useMemo(() => {
    const baseSubjects = SUBJECTS.map((subject) => ({
      ...subject,
      status: subjectStatus[subject.id] || subject.status,
    }));

    const shouldApplySuapSnapshot = hasSuapSnapshot && suapSnapshotSemester === currentSemester && suapCurrentSubjects.length > 0;

    if (!shouldApplySuapSnapshot) {
      return baseSubjects;
    }

    const currentSemesterSem =
      baseSubjects.find((subject) => subject.academicTerm === currentSemester)?.sem ??
      baseSubjects.filter((subject) => subject.academicTerm === currentSemester).sort((a, b) => a.sem - b.sem)[0]?.sem ??
      1;

    const suapKeySet = new Set();
    const baseLookup = new Map();

    baseSubjects.forEach((subject) => {
      baseLookup.set(subject.id, subject);
      baseLookup.set(normalizeText(subject.name), subject);
    });

    const normalizedSuapSubjects = suapCurrentSubjects.map((item) => {
      const itemCode = item?.codigo || item?.subject_id || "";
      const itemName = item?.disciplina || item?.nome || itemCode;
      const fallback = baseLookup.get(itemCode) || baseLookup.get(normalizeText(itemName));
      const resolvedId = fallback?.id || itemCode || normalizeText(itemName).toUpperCase();

      suapKeySet.add(resolvedId);
      suapKeySet.add(normalizeText(itemName));

      return {
        ...(fallback || {}),
        id: resolvedId,
        name: fallback?.name || itemName,
        sem: fallback?.sem || currentSemesterSem,
        academicTerm: currentSemester,
        prereqs: fallback?.prereqs || [],
        tags: fallback?.tags,
        status: "current",
      };
    });

    const filteredBase = baseSubjects.filter((subject) => {
      const matchesSuapById = suapKeySet.has(subject.id);
      if (matchesSuapById) return false;
      return true;
    });

    const deduplicatedMap = new Map();

    [...filteredBase, ...normalizedSuapSubjects].forEach((subject) => {
      deduplicatedMap.set(subject.id, subject);
    });

    return Array.from(deduplicatedMap.values()).sort((a, b) => {
      if (a.sem !== b.sem) return a.sem - b.sem;
      return a.name.localeCompare(b.name, "pt-BR");
    });
  }, [subjectStatus, hasSuapSnapshot, suapCurrentSubjects, currentSemester, suapSnapshotSemester]);

  const stats = useMemo(() => {
    const total = subjects.length;
    const done = subjects.filter((subject) => subject.status === "done").length;
    const current = subjects.filter((subject) => subject.status === "current").length;
    const next = subjects.filter((subject) => subject.status === "next").length;
    const future = subjects.filter((subject) => subject.status === "future").length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    return { done, current, next, future, total, pct };
  }, [subjects]);

  const doneSubjects = useMemo(() => subjects.filter((subject) => subject.status === "done"), [subjects]);

  const getAttendanceMeta = (subjectId) => attendanceMetaOverrides[subjectId] || ATTENDANCE_META[subjectId] || null;

  const alertCount = useMemo(() => {
    return subjects.filter((subject) => {
      const meta = getAttendanceMeta(subject.id);
      if (!meta) return false;
      return calcAbsence(meta, faltas[subject.id] || 0).state !== "safe";
    }).length;
  }, [subjects, faltas, attendanceMetaOverrides]);

  const handleSubjectStatusChange = (subjectId, nextStatus) => {
    if (!STATUS_ORDER.includes(nextStatus)) return;
    setSubjectStatus((prev) => ({ ...prev, [subjectId]: nextStatus }));
  };

  const handleCompleteSemester = (semesterNumber) => {
    setSubjectStatus((prev) => {
      const next = { ...prev };
      subjects.filter((subject) => subject.sem === semesterNumber).forEach((subject) => {
        next[subject.id] = "done";
      });
      return next;
    });
  };

  const WORKER_URL = "https://suap-sync.painel-academico-2026.workers.dev";

  const loadFromSUAP = async () => {
    setIsSyncing(true);
    setSyncError("");

    try {
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await response.json();
      const { disciplinas, faltasMap, atualizadoEm } = normalizeSuapPayload(payload);
      const currentSemesterDisciplines = disciplinas.filter((item) => String(item?.situacao || "").toLowerCase() === "cursando");
      const suapFaltas = {
        ...sanitizeFaltas(faltasMap),
        ...buildSuapFaltas(currentSemesterDisciplines, faltas),
      };
      const suapMeta = buildSuapAttendanceOverrides(currentSemesterDisciplines, ATTENDANCE_META);

      setAttendanceMetaOverrides((prev) => ({ ...prev, ...suapMeta }));
      setFaltas((prev) => ({ ...prev, ...suapFaltas }));
      setLastSyncAt(atualizadoEm || new Date().toISOString());
      setSuapCurrentSubjects(currentSemesterDisciplines);
      setHasSuapSnapshot(currentSemesterDisciplines.length > 0);
      setSuapSnapshotSemester(currentSemesterDisciplines.length > 0 ? currentSemester : null);

      const currentIds = new Set(
        currentSemesterDisciplines
          .map((item) => item?.codigo || item?.subject_id)
          .filter(Boolean),
      );

      if (currentIds.size > 0) {
        setSubjectStatus((prev) => {
          const next = { ...prev };
          currentIds.forEach((subjectId) => {
            next[subjectId] = "current";
          });
          return next;
        });
      }
    } catch (error) {
      setHasSuapSnapshot(false);
      setSuapCurrentSubjects([]);
      setSuapSnapshotSemester(null);
      setSyncError(`Falha ao sincronizar do SUAP: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadFromSUAP();
  }, []);

  const tabs = [
    { id: "overview", label: "Visao Geral", icon: BarChart3 },
    { id: "curriculum", label: "Matriz", icon: Layers },
    { id: "schedule", label: "Horario", icon: Calendar },
    { id: "absence", label: "Faltas", icon: AlertTriangle, badge: alertCount },
    { id: "flow", label: "Analise de Fluxo", icon: GitBranch },
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-white md:p-6 lg:p-8" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <GraduationCap size={18} className="text-violet-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-violet-400">Engenharia de Computacao · IFMT</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">Dashboard Academico</h1>
            <p className="mt-0.5 text-sm text-slate-500">Fluxo curricular · {currentSemester}</p>
          </div>

          <div className="text-right">
            <p className="text-4xl font-black text-violet-400">{stats.pct}%</p>
            <p className="text-xs text-slate-500">concluido</p>
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-[1fr_220px_220px]">
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            Perfil local
            <input
              value={userName}
              onChange={(event) => setUserName(event.target.value)}
              placeholder="Ex.: perfil-a"
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-violet-500"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-slate-500">
            Semestre atual
            <select
              value={currentSemester}
              onChange={(event) => setCurrentSemester(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-violet-500"
            >
              {ACADEMIC_TERMS.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col justify-center rounded-xl border border-slate-800 bg-slate-950 px-3 py-2">
            <span className="text-[11px] uppercase tracking-widest text-slate-500">Chave ativa</span>
            <span className="truncate text-sm font-semibold text-white">{activeUserKey}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="mb-2 flex justify-between text-xs text-slate-500">
            <span>Progresso Total do Curso</span>
            <span>
              {stats.done} de {stats.total} disciplinas
            </span>
          </div>
          <ProgressBar value={stats.pct} colorClass="bg-violet-500" />
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[
              { value: stats.done, label: "Concluidas", color: "text-emerald-400" },
              { value: stats.current, label: "Cursando", color: "text-violet-400" },
              { value: stats.future + stats.next, label: "Restantes", color: "text-slate-500" },
            ].map(({ value, label, color }) => (
              <div key={label}>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-slate-600">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard icon={CheckCircle2} label="Concluidas" value={stats.done} color="emerald" />
          <StatCard icon={BookOpen} label="Cursando" value={stats.current} color="violet" />
          <StatCard icon={Star} label="Proximas" value={stats.next} color="sky" />
          <StatCard icon={Clock} label="Futuras" value={stats.future} color="slate" />
        </div>

        <details className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <summary className="flex cursor-pointer items-center gap-2 p-4 transition-colors hover:bg-slate-800/50">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-400">Disciplinas Concluidas</span>
            <span className="ml-auto text-xs text-slate-500">{doneSubjects.length} disciplinas · expandir</span>
          </summary>

          <div className="grid grid-cols-2 gap-1.5 px-4 pb-4 pt-1 md:grid-cols-3 lg:grid-cols-4">
            {doneSubjects.map((subject) => (
              <div key={subject.id} className="flex items-center gap-1.5 text-xs text-slate-400">
                <CheckCircle2 size={10} className="shrink-0 text-emerald-500" />
                <span className="truncate">{subject.name}</span>
              </div>
            ))}
          </div>
        </details>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="flex overflow-x-auto border-b border-slate-800">
            {tabs.map(({ id, label, icon: Icon, badge }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`relative flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3.5 text-sm font-medium transition-all ${
                  tab === id
                    ? "border-violet-500 bg-violet-500/5 text-violet-400"
                    : "border-transparent text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
                }`}
              >
                <Icon size={14} />
                {label}
                {badge > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black leading-none text-black">
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-5">
            {tab === "overview" && <OverviewTab subjects={subjects} currentSemester={currentSemester} faltas={faltas} />}
            {tab === "curriculum" && (
              <CurriculumTab
                subjects={subjects}
                currentSemester={currentSemester}
                onSetSubjectStatus={handleSubjectStatusChange}
                onCompleteSemester={handleCompleteSemester}
              />
            )}
            {tab === "schedule" && <ScheduleTab />}
            {tab === "absence" && (
              <AbsenceTab
                subjects={subjects}
                faltas={faltas}
                setFaltas={setFaltas}
                getAttendanceMeta={getAttendanceMeta}
                onSync={loadFromSUAP}
                isSyncing={isSyncing}
                syncError={syncError}
                lastSyncAt={lastSyncAt}
              />
            )}
            {tab === "flow" && <FlowTab subjects={subjects} />}
          </div>
        </div>

        <p className="pb-4 text-center text-xs text-slate-700">Academic Dashboard · perfil local · estado salvo no navegador</p>
      </div>
    </div>
  );
}
