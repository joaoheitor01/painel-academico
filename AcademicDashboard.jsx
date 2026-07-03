import { useState, useMemo, useEffect } from "react";
import {
  CheckCircle2, BookOpen, Star, ChevronRight, ChevronLeft,
  GraduationCap, MoreHorizontal, LayoutGrid, Calendar, CalendarDays,
  Network, Minus, Plus, User, RefreshCw, Pencil, Moon, Info,
  Search, Eye, EyeOff, X, LogOut, Lock, ArrowRight, GitBranch,
} from "lucide-react";
import AuthScreen from "./AuthScreen";
import { getSession, setSession, getDisplayName } from "./auth";
import { loadUserData, saveUserData } from "./userData";
import {
  DEFAULT_SUBJECTS, CURRICULUM_PERIODS, ATTENDANCE_META, SCHEDULE, SUBJECT_COLORS,
  STATUS, STATUS_ORDER, fmtTime, DAY_START, DAY_END,
  getCascadeCount, calcAbsence,
} from "./curriculumData";

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho",
  "Agosto","Setembro","Outubro","Novembro","Dezembro"];

// RF = reprovado por falta (danger). Usa a lógica intacta de calcAbsence.
function absState(id, faltas) {
  const meta = ATTENDANCE_META[id];
  if (!meta) return null;
  return calcAbsence(meta, faltas);
}

// Header padrão das tabs: capelo violet + curso.
function CourseHeader({ title, subtitle = "Engenharia de Computação · IFMT", icon: Icon = GraduationCap }) {
  return (
    <div className="bg-white px-4 pt-5 pb-3 border-b border-gray-100">
      {title && <h1 className="text-[20px] font-bold text-violet-600 leading-tight">{title}</h1>}
      <div className="flex items-center gap-2 mt-0.5">
        <div className="w-6 h-6 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
          <Icon size={14} className="text-violet-600" />
        </div>
        <span className="text-[13px] font-medium text-[#6D6D72]">{subtitle}</span>
      </div>
    </div>
  );
}

// ─── FASE 2 · TAB GERAL ─────────────────────────────────────────────────────────
function TabGeral({ subjects, stats, doneSubs }) {
  const current = subjects.filter(s => s.status === "current");
  const nextCount   = subjects.filter(s => s.status === "next").length;
  const futureCount = subjects.filter(s => s.status === "future").length;

  const cards = [
    { icon: CheckCircle2, color: "text-[#34C759]", value: stats.done,    label: "Concluídas" },
    { icon: BookOpen,     color: "text-violet-600", value: stats.current, label: "Cursando" },
    { icon: Star,         color: "text-violet-600", value: nextCount,     label: "Próximas" },
    { icon: CalendarDays, color: "text-violet-600", value: futureCount,   label: "Futuras" },
  ];

  return (
    <div>
      {/* HERO */}
      <div className="bg-white rounded-b-3xl px-5 pt-6 pb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
            <GraduationCap size={20} className="text-violet-600" />
          </div>
          <span className="text-[13px] font-medium text-[#6D6D72]">Engenharia de Computação · IFMT</span>
        </div>
        <p className="text-[40px] leading-none font-bold text-violet-600">{stats.pct}% <span className="text-[15px] align-middle font-semibold text-violet-400">CONCLUÍDO</span></p>
        <p className="text-[13px] text-[#6D6D72] mt-1 mb-3">Progresso Total do Curso</p>
        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-violet-600 rounded-full transition-all duration-700" style={{ width: `${stats.pct}%` }} />
        </div>
        <div className="flex justify-between text-xs text-[#6D6D72] mt-2">
          <span>{stats.done} de {stats.total} disciplinas</span>
          <span>{stats.pct}%</span>
        </div>
      </div>

      {/* 4-CARD GRID */}
      <div className="grid grid-cols-2 gap-3 mx-4 mt-4">
        {cards.map(({ icon: Icon, color, value, label }) => (
          <div key={label} className="bg-white rounded-2xl p-4 flex flex-col items-center gap-1 shadow-sm">
            <Icon size={22} className={color} />
            <span className="text-[28px] leading-none font-bold text-[#1C1C1E]">{value}</span>
            <span className="text-xs text-[#6D6D72]">{label}</span>
          </div>
        ))}
      </div>

      {/* CURSANDO */}
      <div className="mx-4 mt-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[18px] font-bold text-[#1C1C1E]">Cursando</h2>
          <span className="text-[13px] text-[#6D6D72]">{current.length}</span>
        </div>
        <div className="flex flex-col gap-2">
          {current.length === 0 && (
            <div className="bg-white rounded-2xl px-4 py-6 text-center text-sm text-[#6D6D72] shadow-sm">
              Nenhuma disciplina em curso. Sincronize com o SUAP.
            </div>
          )}
          {current.map(s => {
            const st = absState(s.id, s.faltas);
            const rf = st?.state === "danger";
            return (
              <div key={s.id} className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${rf ? "bg-[#FF3B30]" : "bg-violet-500"}`} />
                  <span className="text-[15px] font-bold text-[#1C1C1E] leading-snug flex-1">{s.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0">{s.id}</span>
                </div>
                <p className="text-xs text-[#6D6D72] mt-1 pl-4">Cursando · 2026/1</p>
                {rf && (
                  <div className="mt-2 rounded-lg bg-red-50 text-[#FF3B30] text-xs px-3 py-1.5">
                    ⚠ Limite de faltas atingido
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CONCLUÍDAS (collapse) */}
      <div className="mx-4 mt-4 mb-2">
        <details className="bg-white rounded-2xl overflow-hidden shadow-sm group">
          <summary className="px-4 py-3.5 flex items-center gap-2 cursor-pointer select-none list-none">
            <CheckCircle2 size={16} className="text-[#34C759]" />
            <span className="text-[15px] font-semibold text-[#1C1C1E] flex-1">Disciplinas Concluídas</span>
            <span className="text-xs text-[#6D6D72]">{doneSubs.length}</span>
            <ChevronRight size={16} className="text-gray-300 transition-transform group-open:rotate-90" />
          </summary>
          <div className="px-4 pb-4 pt-1 border-t border-gray-100 flex flex-col gap-1.5">
            {doneSubs.map(s => (
              <div key={s.id} className="flex items-center gap-2 py-1">
                <span className="text-sm text-[#1C1C1E] flex-1 truncate">{s.name}</span>
                <span className="text-[11px] text-gray-400 shrink-0">{s.id}</span>
                <CheckCircle2 size={14} className="text-[#34C759] shrink-0" />
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}

// ─── FASE 3 · TAB HORÁRIO ────────────────────────────────────────────────────────
// Layout de colunas para blocos que se sobrepõem no tempo (side-by-side).
function layoutDay(blocks) {
  const items = blocks.map((b, i) => ({ ...b, key: `${b.id}-${i}` }))
    .sort((a, b) => a.start - b.start || a.end - b.end);
  const out = [];
  let cluster = [], clusterEnd = -1;
  const flush = () => {
    if (!cluster.length) return;
    const colEnds = [];
    cluster.forEach(b => {
      let c = colEnds.findIndex(end => end <= b.start);
      if (c === -1) { c = colEnds.length; colEnds.push(b.end); }
      else colEnds[c] = b.end;
      b._col = c;
    });
    cluster.forEach(b => { b._cols = colEnds.length; out.push(b); });
    cluster = []; clusterEnd = -1;
  };
  items.forEach(b => {
    if (cluster.length && b.start >= clusterEnd) flush();
    cluster.push(b);
    clusterEnd = Math.max(clusterEnd, b.end);
  });
  flush();
  return out;
}

function TabHorario() {
  const now = new Date();
  const dow = now.getDay(); // 0 dom .. 6 sáb
  const initialDay = dow >= 1 && dow <= 5 ? dow - 1 : 0;
  const [dayIdx, setDayIdx] = useState(initialDay);

  const monday = new Date(now); monday.setDate(now.getDate() - ((dow + 6) % 7));
  const friday = new Date(monday); friday.setDate(monday.getDate() + 4);
  const weekLabel = `Semana de ${monday.getDate()} a ${friday.getDate()} de ${MESES[friday.getMonth()]}`;

  const day = SCHEDULE[dayIdx];
  const laid = useMemo(() => layoutDay(day.blocks), [dayIdx]);
  const intervals = day.blocks.flatMap(b => (b.intervals || []).map(iv => ({ ...iv, key: `${b.id}-${iv.start}` })));

  // Janela do dia: só o intervalo com aula (evita horas vazias no fim do dia).
  const hasBlocks = day.blocks.length > 0;
  const winStart = hasBlocks ? Math.floor(Math.min(...day.blocks.map(b => b.start)) / 60) * 60 : DAY_START;
  const winEnd   = hasBlocks ? Math.ceil(Math.max(...day.blocks.map(b => b.end)) / 60) * 60 : DAY_END;
  const OFFSET = 14; // respiro no topo/base pra não cortar os rótulos de hora
  const hours = [];
  for (let m = winStart; m <= winEnd; m += 60) hours.push(m);
  const totalAulas = SCHEDULE.reduce((a, d) => a + d.blocks.reduce((x, b) => x + b.aulas, 0), 0);
  const px = (min) => (min - winStart) + OFFSET; // 1px por minuto = 60px por hora
  const gridHeight = (winEnd - winStart) + OFFSET * 2;

  return (
    <div>
      <div className="bg-white px-4 pt-5 pb-3">
        <h1 className="text-[20px] font-bold text-violet-600">📅 Horário</h1>
        <p className="text-[13px] text-[#6D6D72] mt-0.5">Engenharia de Computação - IFMT</p>
        <p className="text-[13px] text-[#6D6D72] mt-0.5">{weekLabel}</p>
      </div>

      {/* DAY SELECTOR */}
      <div className="px-4 pb-3 bg-white border-b border-gray-100">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {SCHEDULE.map((d, i) => (
            <button key={d.dayShort} onClick={() => setDayIdx(i)}
              className={`shrink-0 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                i === dayIdx ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-500"}`}>
              {d.dayShort}
            </button>
          ))}
        </div>
      </div>

      {/* CALENDAR */}
      {day.blocks.length === 0 ? (
        <div className="mx-4 mt-3 bg-white rounded-2xl py-16 text-center text-[#6D6D72] shadow-sm">
          Sem aulas neste dia 📚
        </div>
      ) : (
        <div className="mx-4 mt-3 bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="relative flex" style={{ height: `${gridHeight}px` }}>
            {/* time labels */}
            <div className="w-14 shrink-0 relative">
              {hours.map(m => (
                <span key={m} className="absolute right-2 -translate-y-1/2 text-[11px] text-gray-400"
                  style={{ top: `${px(m)}px` }}>{fmtTime(m)}</span>
              ))}
            </div>
            {/* content */}
            <div className="flex-1 relative border-l border-gray-100">
              {hours.map(m => (
                <div key={m} className="absolute left-0 right-0 border-t border-gray-100" style={{ top: `${px(m)}px` }} />
              ))}
              {/* intervalos */}
              {intervals.map(iv => (
                <div key={iv.key} className="absolute left-0 right-2 flex items-center"
                  style={{ top: `${px(iv.start)}px`, height: `${px(iv.end) - px(iv.start)}px` }}>
                  <div className="w-full border-t border-dashed border-gray-300 relative">
                    <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[9px] font-semibold tracking-wider text-gray-400">INTERVALO</span>
                  </div>
                </div>
              ))}
              {/* blocos */}
              {laid.map(b => {
                const c = SUBJECT_COLORS[b.id] || {};
                const width = 100 / b._cols;
                return (
                  <div key={b.key}
                    className={`absolute rounded-xl px-3 py-2 overflow-hidden ${c.bg || "bg-gray-100"} ${c.text || "text-gray-700"}`}
                    style={{
                      top: `${px(b.start) + 2}px`,
                      height: `${px(b.end) - px(b.start) - 4}px`,
                      left: `calc(${b._col * width}% + 4px)`,
                      width: `calc(${width}% - 8px)`,
                    }}>
                    <p className="text-[14px] font-bold leading-tight truncate">{b.name}</p>
                    <p className="text-[11px] opacity-70">{fmtTime(b.start)} – {fmtTime(b.end)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER STATS */}
      <div className="mx-4 mt-3 mb-2 flex flex-wrap gap-2">
        {[
          `📅 5 dias com aula`,
          `📚 ${totalAulas} aulas/semana`,
          `🔴 Seg — mais pesado`,
          `🟢 Qua — mais leve`,
        ].map(txt => (
          <span key={txt} className="bg-white rounded-full px-3 py-1.5 text-xs font-medium text-[#1C1C1E] shadow-sm">{txt}</span>
        ))}
      </div>
    </div>
  );
}

// ─── FASE 4 · TAB NOTAS ──────────────────────────────────────────────────────────
function AbsenceCardMobile({ subject, faltas, onSetFaltas }) {
  const meta = ATTENDANCE_META[subject.id];
  const { limite, restam, pct, state } = calcAbsence(meta, faltas);
  const rf = state === "danger";
  const warn = state === "warning" || pct > 75;

  const topBorder = rf ? "bg-red-500" : warn ? "bg-amber-400" : "bg-gray-200";
  const fill = rf ? "bg-red-500" : warn ? "bg-amber-400" : "bg-violet-500";
  const status = rf
    ? { cls: "bg-red-100 text-red-600", label: "● RF" }
    : warn
    ? { cls: "bg-amber-100 text-amber-600", label: "⚠ Alerta" }
    : { cls: "bg-green-100 text-green-600", label: "✓ Seguro" };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      <div className={`h-1 w-full ${topBorder}`} />
      <div className="px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="bg-gray-100 text-gray-500 rounded-lg px-2 py-0.5 text-xs shrink-0">{subject.id}</span>
          <h4 className="text-[16px] font-bold text-[#1C1C1E] leading-tight flex-1">{subject.name}</h4>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${status.cls}`}>{status.label}</span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <button onClick={() => onSetFaltas(Math.max(0, faltas - 1))}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors">
            <Minus size={16} />
          </button>
          <span className={`text-[32px] font-bold leading-none ${rf ? "text-[#FF3B30]" : "text-gray-900"}`}>{faltas}</span>
          <button onClick={() => onSetFaltas(Math.min(meta.cargaHoraria, faltas + 1))}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors">
            <Plus size={16} />
          </button>
          <span className="text-[13px] text-[#6D6D72]">/ {limite} max</span>
        </div>

        <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div className={`h-full rounded-full ${fill} transition-all duration-500`} style={{ width: `${pct}%` }} />
        </div>

        <p className="mt-2 text-xs text-[#6D6D72]">
          {meta.aulasPorDia} aulas/dia · {Math.max(0, restam)} faltas restantes
        </p>
      </div>
    </div>
  );
}

function notaBadge(media) {
  const m = parseFloat(media);
  if (media === "-" || Number.isNaN(m)) return { cls: "bg-gray-50 text-gray-400", label: "Aguardando" };
  if (m >= 6.0) return { cls: "bg-green-50 text-green-700", label: "✓ Aprovado" };
  if (m >= 4.0) return { cls: "bg-amber-50 text-amber-700", label: "⚡ Prova Final" };
  return { cls: "bg-red-50 text-red-700", label: "✗ Reprovado" };
}

function NotaCardMobile({ subject, nota, faltas }) {
  const n = nota || { p1: "-", media: "-", af: "-", mfd: "-" };
  const badge = notaBadge(n.media);
  const mediaNum = parseFloat(n.media);
  const st = absState(subject.id, faltas);
  const topBorder = st?.state === "danger" ? "bg-red-500"
    : (!Number.isNaN(mediaNum) && mediaNum >= 4 && mediaNum < 6) ? "bg-amber-400"
    : "bg-gray-200";
  const valClass = (v) => `text-[22px] leading-none font-bold ${v === "-" ? "text-gray-200" : "text-[#1C1C1E]"}`;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      <div className={`h-1 w-full ${topBorder}`} />
      <div className="px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="bg-gray-100 text-gray-500 rounded-lg px-2 py-0.5 text-xs shrink-0">{subject.id}</span>
          <h4 className="text-[16px] font-bold text-[#1C1C1E] leading-tight flex-1">{subject.name}</h4>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-3 text-center">
          {[["P1", n.p1], ["Média", n.media], ["AF", n.af], ["MFD", n.mfd]].map(([label, v]) => (
            <div key={label}>
              <p className={valClass(v)}>{v}</p>
              <p className="text-[10px] uppercase text-[#6D6D72] mt-1">{label}</p>
            </div>
          ))}
        </div>
        <span className={`inline-block mt-3 text-xs font-medium px-2.5 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
      </div>
    </div>
  );
}

function TabNotas({ subjects, faltas, setFaltas, notas, onOpenSuap }) {
  const [view, setView] = useState("freq");
  const currentSubs = subjects.filter(s => s.status === "current" && ATTENDANCE_META[s.id]);
  const rfSubs = currentSubs.filter(s => absState(s.id, faltas[s.id] || 0)?.state === "danger");
  const temNotas = Object.keys(notas || {}).length > 0;
  const notaSubs = subjects.filter(s => s.status === "current");

  return (
    <div>
      <CourseHeader />

      {/* SEGMENTED */}
      <div className="mx-4 mt-2 bg-gray-100 rounded-2xl p-1 flex">
        {[["freq", "Frequência"], ["notas", "Notas"]].map(([k, label]) => (
          <button key={k} onClick={() => setView(k)}
            className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors ${
              view === k ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>
            {label}
          </button>
        ))}
      </div>

      {view === "freq" ? (
        <>
          {rfSubs.length > 0 && (
            <div className="mx-4 mt-3 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 flex gap-3 items-start">
              <span className="text-lg leading-none">⚠</span>
              <div>
                <p className="text-sm font-bold text-orange-600">Atenção Crítica</p>
                <p className="text-xs text-[#6D6D72] mt-0.5">
                  {rfSubs.length} disciplina{rfSubs.length > 1 ? "s" : ""} com limite de faltas atingido (RF).
                </p>
              </div>
            </div>
          )}

          {currentSubs.length === 0 ? (
            <div className="mx-4 mt-3 bg-white rounded-2xl px-4 py-8 text-center text-sm text-[#6D6D72] shadow-sm">
              Nenhuma disciplina em curso com controle de frequência.
            </div>
          ) : (
            <>
              <div className="mx-4 mt-3 flex flex-col gap-3">
                {currentSubs.map(s => (
                  <AbsenceCardMobile key={s.id} subject={s}
                    faltas={faltas[s.id] || 0}
                    onSetFaltas={(v) => setFaltas(prev => ({ ...prev, [s.id]: v }))} />
                ))}
              </div>

              {/* RESUMO */}
              <div className="mx-4 mt-4 mb-2 bg-white rounded-2xl px-4 py-4 shadow-sm">
                <p className="text-[15px] font-bold text-[#1C1C1E] mb-3">Resumo Semestral</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[#6D6D72] text-xs">
                      <th className="pb-2 font-medium">Disciplina</th>
                      <th className="pb-2 font-medium text-center">Faltas/Lim.</th>
                      <th className="pb-2 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSubs.map((s, i) => {
                      const meta = ATTENDANCE_META[s.id];
                      const f = faltas[s.id] || 0;
                      const { limite, state } = calcAbsence(meta, f);
                      const rf = state === "danger";
                      return (
                        <tr key={s.id} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                          <td className="py-2 pl-1 text-[#1C1C1E]">{meta.shortName}</td>
                          <td className="py-2 text-center text-[#6D6D72]">{f}/{limite}</td>
                          <td className={`py-2 pr-1 text-right font-bold ${rf ? "text-[#FF3B30]" : "text-[#34C759]"}`}>
                            {rf ? "RF" : "OK"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      ) : (
        !temNotas ? (
          <div className="mx-4 mt-6 bg-white rounded-2xl px-4 py-10 text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center mx-auto mb-3">
              <RefreshCw size={22} className="text-violet-600" />
            </div>
            <p className="text-sm text-[#6D6D72] mb-4">Sincronize com o SUAP para ver suas notas.</p>
            <button onClick={onOpenSuap}
              className="inline-flex items-center gap-2 bg-violet-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl">
              <RefreshCw size={15} /> Sincronizar SUAP
            </button>
          </div>
        ) : notaSubs.length === 0 ? (
          <div className="mx-4 mt-3 bg-white rounded-2xl px-4 py-8 text-center text-sm text-[#6D6D72] shadow-sm">
            Nenhuma disciplina em curso para exibir notas.
          </div>
        ) : (
          <div className="mx-4 mt-3 mb-2 flex flex-col gap-3">
            {notaSubs.map(s => (
              <NotaCardMobile key={s.id} subject={s} nota={notas[s.id]} faltas={faltas[s.id] || 0} />
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ─── FASE 5 · SUB-TELA ANÁLISE DE FLUXO ──────────────────────────────────────────
function FluxoScreen({ subjects, onBack }) {
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");

  const analysis = useMemo(() => {
    if (!selected) return null;
    const s = subjects.find(x => x.id === selected);
    if (!s) return null;
    const prereqNames = s.prereqs.map(id => subjects.find(x => x.id === id)).filter(Boolean);
    const unlocks = subjects.filter(x => x.prereqs.includes(s.id));
    const cascade = getCascadeCount(s.id, subjects);
    return { subject: s, prereqNames, unlocks, cascade };
  }, [selected, subjects]);

  const q = query.trim().toLowerCase();
  const match = (s) => !q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);

  const groups = [
    { key: "current", title: "Cursando",   items: subjects.filter(s => s.status === "current" && match(s)) },
    { key: "done",    title: "Concluídas", items: subjects.filter(s => s.status === "done" && match(s)) },
    { key: "next",    title: "Próximas",   items: subjects.filter(s => s.status === "next" && match(s)) },
    { key: "future",  title: "Futuras",    items: subjects.filter(s => s.status === "future" && match(s)) },
  ].filter(g => g.items.length > 0);

  return (
    <div>
      <div className="bg-white px-4 pt-5 pb-3 border-b border-gray-100 flex items-center gap-2">
        <button onClick={onBack} className="flex items-center gap-1 text-violet-600 text-sm font-medium">
          <ChevronLeft size={18} /> Mais
        </button>
        <h1 className="text-[17px] font-bold text-[#1C1C1E] absolute left-1/2 -translate-x-1/2">Análise de Fluxo</h1>
      </div>

      {/* SEARCH */}
      <div className="mx-4 mt-3">
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5">
          <Search size={16} className="text-gray-400" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar disciplina ou código"
            className="bg-transparent text-sm text-[#1C1C1E] placeholder-gray-400 focus:outline-none flex-1" />
        </div>
      </div>

      {/* LISTA AGRUPADA */}
      <div className="mx-4 mt-3 flex flex-col gap-4 pb-2">
        {groups.map(g => (
          <div key={g.key}>
            <p className="text-[11px] uppercase tracking-wider text-[#6D6D72] mb-1 px-1">{g.title}</p>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100">
              {g.items.map(s => {
                const isSel = selected === s.id;
                return (
                  <div key={s.id}>
                    <button onClick={() => setSelected(isSel ? null : s.id)}
                      className="w-full px-4 py-3 flex items-center gap-3 text-left">
                      <span className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                        isSel ? "border-violet-600" : "border-gray-300"}`}>
                        {isSel && <span className="w-2 h-2 rounded-full bg-violet-600" />}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[15px] text-[#1C1C1E] truncate">{s.name}</span>
                        <span className="block text-xs text-[#6D6D72]">{s.id} · {s.sem}º Semestre</span>
                      </span>
                      {s.status === "done" && <CheckCircle2 size={16} className="text-[#34C759] shrink-0" />}
                    </button>

                    {/* PAINEL EXPANDIDO */}
                    {isSel && analysis && (
                      <div className="px-3 pb-3 bg-gray-50">
                        <div className="bg-violet-600 rounded-2xl px-4 py-3 mt-1">
                          <span className="inline-block text-[10px] font-semibold text-violet-100 bg-white/20 rounded-full px-2 py-0.5 mb-1">
                            ● {STATUS[analysis.subject.status].label.toUpperCase()} | {analysis.subject.id}
                          </span>
                          <p className="text-[18px] font-bold text-white leading-tight">{analysis.subject.name}</p>
                        </div>

                        <div className="bg-white rounded-2xl mt-2 divide-y divide-gray-100 overflow-hidden">
                          <div className="px-4 py-3">
                            <p className="text-[11px] uppercase tracking-wider text-[#6D6D72] mb-2">Depende de (pré-requisitos)</p>
                            {analysis.prereqNames.length === 0 ? (
                              <p className="text-sm text-gray-400 italic">Nenhum pré-requisito</p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {analysis.prereqNames.map(p => (
                                  <button key={p.id} onClick={() => setSelected(p.id)}
                                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                      p.status === "done" ? "bg-green-100 text-green-700"
                                        : p.status === "current" ? "bg-violet-100 text-violet-700"
                                        : "bg-gray-100 text-gray-600"}`}>
                                    {p.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="px-4 py-3">
                            <p className="text-[11px] uppercase tracking-wider text-[#6D6D72] mb-2">Libera diretamente</p>
                            {analysis.unlocks.length === 0 ? (
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Lock size={14} /> Nenhuma matéria
                              </div>
                            ) : (
                              <div className="flex flex-col gap-1.5">
                                {analysis.unlocks.map(u => (
                                  <button key={u.id} onClick={() => setSelected(u.id)}
                                    className="flex items-center gap-2 text-sm text-[#1C1C1E]">
                                    <span className="flex-1 text-left truncate">{u.name}</span>
                                    <ArrowRight size={14} className="text-violet-500 shrink-0" />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {analysis.cascade > 0 && (
                          <div className="bg-amber-50 rounded-2xl mt-2 px-4 py-3 flex gap-3 items-start">
                            <GitBranch size={18} className="text-orange-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-bold text-orange-700">Impacto em Cascata</p>
                              <p className="text-xs text-[#6D6D72] mt-0.5">
                                Esta disciplina desbloqueia {analysis.cascade} matéria{analysis.cascade > 1 ? "s" : ""} nos próximos semestres.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {groups.length === 0 && (
          <p className="text-center text-sm text-[#6D6D72] py-8">Nenhuma disciplina encontrada.</p>
        )}
      </div>
    </div>
  );
}

// ─── SUB-TELA EDITAR PROGRESSO ────────────────────────────────────────────────────
function EditarScreen({ subjects, onCycleStatus, onBack }) {
  const groups = CURRICULUM_PERIODS.map(p => ({
    ...p, items: subjects.filter(s => s.sem === p.id),
  })).filter(p => p.items.length > 0);

  return (
    <div>
      <div className="bg-white px-4 pt-5 pb-3 border-b border-gray-100 flex items-center gap-2 relative">
        <button onClick={onBack} className="flex items-center gap-1 text-violet-600 text-sm font-medium">
          <ChevronLeft size={18} /> Mais
        </button>
        <h1 className="text-[17px] font-bold text-[#1C1C1E] absolute left-1/2 -translate-x-1/2">Editar Progresso</h1>
      </div>

      <div className="mx-4 mt-3 bg-violet-50 rounded-2xl px-4 py-3 flex gap-2 items-start">
        <Pencil size={15} className="text-violet-600 shrink-0 mt-0.5" />
        <p className="text-xs text-violet-700">
          Toque numa disciplina para alternar entre <b>Concluída → Cursando → Próxima → Futura</b>.
        </p>
      </div>

      <div className="mx-4 mt-3 flex flex-col gap-4 pb-2">
        {groups.map(g => (
          <div key={g.id}>
            <p className="text-[11px] uppercase tracking-wider text-[#6D6D72] mb-1 px-1">{g.label}</p>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100">
              {g.items.map(s => {
                const st = STATUS[s.status];
                return (
                  <button key={s.id} onClick={() => onCycleStatus(s.id)}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left active:bg-gray-50">
                    <span className="flex-1 min-w-0">
                      <span className="block text-[15px] text-[#1C1C1E] truncate">{s.name}</span>
                      <span className="block text-xs text-[#6D6D72]">{s.id}</span>
                    </span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${st.badge}`}>{st.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FASE 5 · TAB MAIS ───────────────────────────────────────────────────────────
function SettingsRow({ icon: Icon, iconBg, label, onClick, trailing }) {
  return (
    <button onClick={onClick} className="w-full px-4 py-3.5 flex items-center gap-3 text-left active:bg-gray-50">
      <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon size={16} className="text-white" />
      </span>
      <span className="text-[15px] text-[#1C1C1E] flex-1">{label}</span>
      {trailing ?? <ChevronRight size={16} className="text-gray-300" />}
    </button>
  );
}

function TabMais({ displayName, onOpenSuap, onOpenFluxo, onOpenEditar, onOpenSobre, onLogout }) {
  return (
    <div>
      <CourseHeader />

      {/* PERFIL */}
      <div className="bg-white mx-4 mt-4 rounded-2xl px-4 py-4 flex gap-3 items-center shadow-sm">
        <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
          <User size={22} className="text-gray-500" />
        </div>
        <div>
          <p className="text-[17px] font-bold text-[#1C1C1E] leading-tight">{displayName}</p>
          <p className="text-[13px] text-[#6D6D72]">Estudante</p>
        </div>
      </div>

      {/* ACADÊMICO */}
      <div className="mx-4 mt-4">
        <p className="text-[11px] uppercase tracking-wider text-[#6D6D72] mb-2 px-1">Acadêmico</p>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100">
          <SettingsRow icon={RefreshCw} iconBg="bg-violet-500" label="Sincronizar SUAP" onClick={onOpenSuap} />
          <SettingsRow icon={Network}   iconBg="bg-orange-500" label="Análise de Fluxo" onClick={onOpenFluxo} />
          <SettingsRow icon={Pencil}    iconBg="bg-green-500"  label="Editar progresso" onClick={onOpenEditar} />
        </div>
      </div>

      {/* APP */}
      <div className="mx-4 mt-4">
        <p className="text-[11px] uppercase tracking-wider text-[#6D6D72] mb-2 px-1">App</p>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100">
          <SettingsRow icon={Moon} iconBg="bg-gray-800" label="Tema escuro"
            trailing={<span className="w-10 h-6 rounded-full bg-gray-200 flex items-center px-0.5"><span className="w-5 h-5 rounded-full bg-white shadow" /></span>} />
          <SettingsRow icon={Info} iconBg="bg-gray-500" label="Sobre o app" onClick={onOpenSobre} />
        </div>
      </div>

      {/* SAIR */}
      <div className="mx-4 mt-4 mb-2 bg-white rounded-2xl shadow-sm">
        <button onClick={onLogout} className="w-full text-center text-[#FF3B30] py-3.5 font-medium">Sair</button>
      </div>
    </div>
  );
}

// ─── MODAL SUAP (bottom sheet) ─────────────────────────────────────────────────
function SuapSheet({ onSync, onClose, loading, error }) {
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end justify-center" onClick={onClose}>
      <div className="w-full max-w-[430px] bg-white rounded-t-3xl px-5 pt-2 pb-8" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center mx-auto mb-3">
          <RefreshCw size={22} className="text-violet-600" />
        </div>
        <h2 className="text-[20px] font-bold text-[#1C1C1E] text-center">Sincronizar com SUAP</h2>
        <p className="text-sm text-[#6D6D72] text-center mt-1">Insira suas credenciais do SUAP para importar faltas e notas.</p>

        <div className="mt-4 flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">Matrícula</label>
            <input value={matricula} onChange={e => setMatricula(e.target.value)}
              placeholder="Sua matrícula"
              className="w-full bg-gray-50 rounded-xl px-3 py-3 text-sm text-[#1C1C1E] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">Senha do SUAP</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={senha} onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 rounded-xl px-3 py-3 pr-10 text-sm text-[#1C1C1E] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-200" />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl px-3 py-2.5 mt-3 flex gap-2">
          <span className="text-sm">ℹ️</span>
          <p className="text-xs text-[#6D6D72]">Suas credenciais são usadas apenas para sincronização e nunca são armazenadas.</p>
        </div>

        {error && (
          <div className="bg-red-50 rounded-xl px-3 py-2.5 mt-3">
            <p className="text-xs text-[#FF3B30]">{error}</p>
          </div>
        )}

        <button onClick={() => onSync(matricula, senha)} disabled={loading || !matricula || !senha}
          className="w-full mt-4 h-14 rounded-xl bg-violet-600 text-white font-semibold disabled:opacity-50 transition-opacity">
          {loading ? "Sincronizando..." : "Sincronizar"}
        </button>
        <button onClick={onClose} disabled={loading}
          className="w-full text-violet-600 text-center mt-3 font-medium">Cancelar</button>
      </div>
    </div>
  );
}

// ─── MODAL SOBRE ───────────────────────────────────────────────────────────────
function SobreSheet({ onClose }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end justify-center" onClick={onClose}>
      <div className="w-full max-w-[430px] bg-white rounded-t-3xl px-5 pt-2 pb-8" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center mx-auto mb-3">
          <GraduationCap size={24} className="text-violet-600" />
        </div>
        <h2 className="text-[20px] font-bold text-[#1C1C1E] text-center">Dashboard Acadêmico</h2>
        <p className="text-sm text-[#6D6D72] text-center mt-1">Engenharia de Computação · IFMT</p>
        <div className="mt-4 flex flex-col gap-2 text-sm text-[#6D6D72]">
          <div className="flex justify-between"><span>Versão</span><span className="text-[#1C1C1E] font-medium">2026.1</span></div>
          <div className="flex justify-between"><span>Turma</span><span className="text-[#1C1C1E] font-medium">ENC 2026/1</span></div>
        </div>
        <p className="text-xs text-[#6D6D72] text-center mt-4">Feito por e para estudantes. Dados locais no seu navegador.</p>
        <button onClick={onClose}
          className="w-full mt-4 h-12 rounded-xl bg-violet-600 text-white font-semibold">Fechar</button>
      </div>
    </div>
  );
}

// ─── SHELL DO APP ────────────────────────────────────────────────────────────────
const WORKER_URL = "https://suap-sync.painel-academico-2026.workers.dev";

function Dashboard({ userKey, displayName, onLogout }) {
  const [tab, setTab] = useState("geral");
  const [mais, setMais] = useState(null); // null | "fluxo" | "editar"
  const [faltas, setFaltas] = useState({});
  const [statusOverrides, setStatusOverrides] = useState({});
  const [notas, setNotas] = useState({});
  const [hydratedFor, setHydratedFor] = useState(null);
  const [suapModal, setSuapModal] = useState(false);
  const [sobreModal, setSobreModal] = useState(false);
  const [suapLoading, setSuapLoading] = useState(false);
  const [suapError, setSuapError] = useState("");

  useEffect(() => {
    setHydratedFor(null);
    const data = loadUserData(userKey);
    setFaltas(data.faltas);
    setStatusOverrides(data.statusOverrides);
    setNotas(data.notas);
    setHydratedFor(userKey);
  }, [userKey]);

  useEffect(() => {
    if (hydratedFor !== userKey) return;
    saveUserData(userKey, { faltas, statusOverrides, notas });
  }, [hydratedFor, userKey, faltas, statusOverrides, notas]);

  const subjects = useMemo(() => DEFAULT_SUBJECTS.map(s => ({
    ...s,
    status: statusOverrides[s.id] ?? "future",
    faltas: faltas[s.id] || 0,
  })), [statusOverrides, faltas]);

  function cycleStatus(id) {
    setStatusOverrides(prev => {
      const current = prev[id] || "future";
      const idx = STATUS_ORDER.indexOf(current);
      const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
      return { ...prev, [id]: next };
    });
  }

  const stats = useMemo(() => {
    const done    = subjects.filter(s => s.status === "done").length;
    const current = subjects.filter(s => s.status === "current").length;
    const total   = subjects.length;
    return { done, current, total, pct: Math.round((done / total) * 100) };
  }, [subjects]);

  const doneSubs = subjects.filter(s => s.status === "done");

  // Badge de alerta na tab Notas: alguma disciplina em RF ou > 75% do limite.
  const notasAlert = subjects.some(s => {
    const st = absState(s.id, s.faltas);
    return s.status === "current" && st && (st.state === "danger" || st.pct >= 75);
  });

  async function sincronizarSUAP(matricula, senha) {
    setSuapLoading(true);
    setSuapError("");
    try {
      const resp = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricula, senha }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.erro || "Erro desconhecido");
      setFaltas(prev => ({ ...prev, ...data.faltas }));
      setStatusOverrides(prev => ({ ...prev, ...data.statusOverrides }));
      setNotas(prev => ({ ...prev, ...(data.notas || {}) }));
      setSuapModal(false);
    } catch (err) {
      setSuapError(err.message);
    } finally {
      setSuapLoading(false);
    }
  }

  const NAV = [
    { id: "geral",   icon: LayoutGrid,     label: "Geral" },
    { id: "horario", icon: Calendar,       label: "Horário" },
    { id: "notas",   icon: Star,           label: "Notas", badge: notasAlert },
    { id: "mais",    icon: MoreHorizontal, label: "Mais" },
  ];

  function goTab(id) {
    setTab(id);
    setMais(null);
  }

  return (
    <div className="min-h-screen bg-[#F2F1F6] flex flex-col max-w-[430px] mx-auto relative">
      <main className="flex-1 overflow-y-auto pb-20">
        {tab === "geral"   && <TabGeral subjects={subjects} stats={stats} doneSubs={doneSubs} />}
        {tab === "horario" && <TabHorario />}
        {tab === "notas"   && <TabNotas subjects={subjects} faltas={faltas} setFaltas={setFaltas} notas={notas} onOpenSuap={() => setSuapModal(true)} />}
        {tab === "mais" && mais === null && (
          <TabMais displayName={displayName}
            onOpenSuap={() => setSuapModal(true)}
            onOpenFluxo={() => setMais("fluxo")}
            onOpenEditar={() => setMais("editar")}
            onOpenSobre={() => setSobreModal(true)}
            onLogout={onLogout} />
        )}
        {tab === "mais" && mais === "fluxo"  && <FluxoScreen subjects={subjects} onBack={() => setMais(null)} />}
        {tab === "mais" && mais === "editar" && <EditarScreen subjects={subjects} onCycleStatus={cycleStatus} onBack={() => setMais(null)} />}
      </main>

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-200 z-50">
        <div className="flex">
          {NAV.map(item => {
            const active = tab === item.id;
            return (
              <button key={item.id} onClick={() => goTab(item.id)}
                className="flex-1 flex flex-col items-center py-2 pt-3 gap-0.5 relative">
                <span className="relative">
                  <item.icon size={22} className={active ? "text-violet-600" : "text-gray-400"} />
                  {item.badge && <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#FF3B30]" />}
                </span>
                <span className={`text-[10px] font-medium ${active ? "text-violet-600" : "text-gray-400"}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {suapModal && (
        <SuapSheet onSync={sincronizarSUAP}
          onClose={() => { setSuapModal(false); setSuapError(""); }}
          loading={suapLoading} error={suapError} />
      )}
      {sobreModal && <SobreSheet onClose={() => setSobreModal(false)} />}
    </div>
  );
}

export default function AcademicDashboard() {
  const [userKey, setUserKey] = useState(() => getSession());

  if (!userKey) {
    return <AuthScreen onAuthenticated={(key) => { setSession(key); setUserKey(key); }} />;
  }

  return (
    <Dashboard
      userKey={userKey}
      displayName={getDisplayName(userKey)}
      onLogout={() => { setSession(null); setUserKey(null); }}
    />
  );
}
