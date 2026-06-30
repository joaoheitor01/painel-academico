import { useState, useMemo, useEffect } from "react";
import {
  CheckCircle2, Circle, BookOpen, Zap, ChevronRight,
  BarChart3, GitBranch, GraduationCap, Clock, Star,
  ArrowRight, Layers, TrendingUp, Network, Calendar,
  AlertTriangle, XCircle, Shield, Minus, Plus, CalendarDays,
  User, LogOut, Pencil, RefreshCw, School
} from "lucide-react";
import AuthScreen from "./AuthScreen";
import { getSession, setSession, getDisplayName } from "./auth";
import { loadUserData, saveUserData } from "./userData";
import {
  DEFAULT_SUBJECTS, CURRICULUM_PERIODS, ATTENDANCE_META, SCHEDULE, SUBJECT_COLORS,
  STATUS, STATUS_ORDER, toMin, fmtTime, DAY_START, DAY_END, DAY_SPAN,
  getCascadeCount, calcAbsence,
} from "./curriculumData";

function ProgressBar({ value, colorClass = "bg-gray-900" }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${colorClass}`} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

function AbsenceCard({ subject, faltas, onSetFaltas }) {
  const meta = ATTENDANCE_META[subject.id];
  if (!meta) return null;
  const { limite, restam, diasRestantes, pct, state } = calcAbsence(meta, faltas);

  const stateStyle = {
    safe:    { bar: "bg-gray-400",  icon: Shield,        textColor: "text-gray-600",  box: "bg-gray-50 border-gray-200",   top: "border-gray-300" },
    warning: { bar: "bg-amber-400", icon: AlertTriangle, textColor: "text-amber-700", box: "bg-amber-50 border-amber-200", top: "border-gray-300" },
    danger:  { bar: "bg-red-500",   icon: XCircle,       textColor: "text-red-700",   box: "bg-red-50 border-red-200",     top: "border-red-500" },
  }[state];

  const IconAlert = stateStyle.icon;

  return (
    <div className={`rounded-xl border border-gray-200 border-t-2 ${stateStyle.top} bg-white overflow-hidden shadow-sm`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={`w-2 h-2 rounded-full ${state === "danger" ? "bg-red-500" : "bg-gray-400"}`} />
              <span className="text-xs text-gray-500 font-medium">{subject.id}</span>
            </div>
            <h4 className="text-sm font-bold text-gray-900 leading-snug">{subject.name}</h4>
          </div>
          <span className="text-xs text-gray-500 shrink-0">{meta.cargaHoraria}h</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-500 mr-auto">Faltas atuais</span>
          <button onClick={() => onSetFaltas(Math.max(0, faltas - 1))}
            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors">
            <Minus size={12} />
          </button>
          <span className="text-lg font-bold text-gray-900 w-8 text-center">{faltas}</span>
          <button onClick={() => onSetFaltas(Math.min(meta.cargaHoraria, faltas + 1))}
            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors">
            <Plus size={12} />
          </button>
          <span className="text-xs text-gray-500">/ {limite} max</span>
        </div>

        <ProgressBar value={pct} colorClass={stateStyle.bar} />
        <div className="flex justify-between text-xs text-gray-500 mt-1 mb-3">
          <span>{faltas} usadas</span>
          <span>{pct}% do limite</span>
        </div>

        <div className={`rounded-lg border px-3 py-2 flex items-center gap-2 ${stateStyle.box}`}>
          <IconAlert size={14} className={stateStyle.textColor} />
          <p className={`text-xs font-medium ${stateStyle.textColor}`}>
            {state === "danger"  && "Limite estourado. Reprovado por falta (RF)."}
            {state === "warning" && `Atenção! Só pode faltar mais ${diasRestantes} dia${diasRestantes !== 1 ? "s" : ""} de ${meta.shortName}.`}
            {state === "safe"    && `Tranquilo. Ainda pode faltar ${diasRestantes} dia${diasRestantes !== 1 ? "s" : ""}.`}
          </p>
        </div>

        <div className="mt-2 flex gap-3 text-xs text-gray-500">
          <span>{meta.aulasPorDia} aulas/dia</span>
          <span>·</span>
          <span>{Math.max(0, restam)} faltas restantes</span>
        </div>
      </div>
    </div>
  );
}

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
            <div key={id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${c.light || "bg-gray-50"} border ${c.border || "border-gray-200"}`}>
              <span className={`w-2 h-2 rounded-full ${c.dot || "bg-gray-400"}`} />
              <span className="text-xs text-gray-700 font-medium">{meta.shortName}</span>
            </div>
          ) : null;
        })}
      </div>

      <div className="space-y-4">
        {SCHEDULE.map(({ day, dayShort, blocks }) => (
          <div key={day} className="flex gap-3 items-start">
            <div className="w-10 shrink-0 pt-5 text-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{dayShort}</span>
            </div>
            <div className="flex-1 bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
              <div className="relative h-4 mb-2">
                {timeMarkers.map(m => (
                  <span key={m} className="absolute text-[10px] text-gray-400 -translate-x-1/2"
                    style={{ left: `${pct(m)}%` }}>
                    {fmtTime(m)}
                  </span>
                ))}
              </div>

              <div className="relative h-14 bg-gray-100 rounded-xl overflow-hidden">
                {timeMarkers.map(m => (
                  <div key={m} className="absolute top-0 bottom-0 w-px bg-gray-200" style={{ left: `${pct(m)}%` }} />
                ))}
                {blocks.map((block, i) => {
                  const c = SUBJECT_COLORS[block.id] || {};
                  const left  = pct(block.start);
                  const width = pct(block.end) - pct(block.start);
                  return (
                    <div key={`${block.id}-${i}`}
                      className={`absolute top-1 bottom-1 rounded-lg ${c.bg || "bg-gray-100"} border ${c.border || "border-gray-200"} flex flex-col justify-center px-2 overflow-hidden cursor-default`}
                      style={{ left: `${left}%`, width: `${width}%` }}
                      title={`${block.name} · ${fmtTime(block.start)} – ${fmtTime(block.end)} · ${block.aulas} aula(s)`}>
                      <span className={`text-[11px] font-bold leading-tight truncate ${c.text || "text-gray-700"}`}>{block.name}</span>
                      <span className={`text-[10px] opacity-70 truncate ${c.text || "text-gray-700"}`}>{fmtTime(block.start)}–{fmtTime(block.end)}</span>
                      {block.intervals?.map((iv, j) => (
                        <div key={j} className="absolute top-0 bottom-0 bg-white/40 border-x border-gray-200"
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
                  const c = SUBJECT_COLORS[block.id] || {};
                  return (
                    <span key={`${block.id}-${i}-lbl`}
                      className={`text-[10px] px-2 py-0.5 rounded-full ${c.light || "bg-gray-50"} border ${c.border || "border-gray-200"} ${c.text || "text-gray-700"}`}>
                      {fmtTime(block.start)}–{fmtTime(block.end)} · {block.name} ({block.aulas}×)
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-200">
        {[
          { label: "Dias com aula",   value: "5",   sub: "Seg → Sex",        icon: CalendarDays },
          { label: "Total aulas/sem", value: SCHEDULE.reduce((a,d)=>a+d.blocks.reduce((x,b)=>x+b.aulas,0),0),
                                              sub: "blocos de 50 min",   icon: BookOpen },
          { label: "Dia mais pesado", value: "Seg", sub: "Eng.SW + Ext.I",   icon: TrendingUp },
          { label: "Dia mais leve",   value: "Qua", sub: "Lab. Circ. (2h)", icon: Star },
        ].map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <Icon size={14} className="text-gray-400 mb-1.5" />
            <p className="text-xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-xs text-gray-400">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AbsenceTab({ subjects, faltas, setFaltas }) {
  const currentSubs = subjects.filter(s => s.status === "current" && ATTENDANCE_META[s.id]);
  const alerts = currentSubs.filter(s => {
    const { state } = calcAbsence(ATTENDANCE_META[s.id], faltas[s.id] || 0);
    return state !== "safe";
  });

  return (
    <div className="space-y-6">
      {alerts.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <span className="text-sm font-bold text-amber-700">{alerts.length} disciplina{alerts.length > 1 ? "s" : ""} em situação de alerta</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {alerts.map(s => {
              const { state, diasRestantes } = calcAbsence(ATTENDANCE_META[s.id], faltas[s.id] || 0);
              return (
                <span key={s.id} className={`text-xs px-2.5 py-1 rounded-full font-medium border ${state === "danger" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                  {ATTENDANCE_META[s.id].shortName}{state !== "danger" && ` · ${diasRestantes}d restantes`}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Use os botões <span className="font-bold text-gray-900">+/−</span> para registrar faltas.
        O sistema calcula quantos <span className="font-bold text-gray-900">dias de aula</span> você
        ainda pode perder antes de reprovar (mínimo de 75% de presença).
      </p>

      {currentSubs.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-gray-500">
            Nenhuma das suas disciplinas marcadas como <span className="font-bold text-gray-900">"Cursando"</span> tem
            controle de frequência cadastrado.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentSubs.map(s => (
              <AbsenceCard key={s.id} subject={s}
                faltas={faltas[s.id] || 0}
                onSetFaltas={(v) => setFaltas(prev => ({ ...prev, [s.id]: v }))} />
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">Resumo Geral de Frequência</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200">
                    {["Disciplina","CH","Limite","Faltas","Restam","Dias Restantes","Status"].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-gray-500 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentSubs.map(s => {
                    const meta = ATTENDANCE_META[s.id];
                    const f = faltas[s.id] || 0;
                    const { limite, restam, diasRestantes, state } = calcAbsence(meta, f);
                    const statusLabel = { safe: "Seguro", warning: "Alerta", danger: "RF" }[state];
                    const statusClass = {
                      safe: "bg-gray-100 text-gray-600",
                      warning: "bg-amber-50 text-amber-700 border border-amber-200",
                      danger: "bg-red-50 text-red-700 border border-red-200",
                    }[state];
                    return (
                      <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2.5 text-gray-900 font-medium">{meta.shortName}</td>
                        <td className="px-3 py-2.5 text-gray-500">{meta.cargaHoraria}</td>
                        <td className="px-3 py-2.5 text-gray-500">{limite}</td>
                        <td className="px-3 py-2.5 font-bold text-gray-900">{f}</td>
                        <td className={`px-3 py-2.5 font-medium ${restam <= 0 ? "text-red-600" : restam <= meta.aulasPorDia * 2 ? "text-amber-600" : "text-gray-700"}`}>{Math.max(0, restam)}</td>
                        <td className={`px-3 py-2.5 font-bold ${diasRestantes <= 0 ? "text-red-600" : diasRestantes <= 2 ? "text-amber-600" : "text-gray-700"}`}>{diasRestantes}</td>
                        <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full ${statusClass}`}>{statusLabel}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SubjectCard({ subject, editMode, onCycleStatus }) {
  const s = STATUS[subject.status];
  return (
    <div
      onClick={editMode ? () => onCycleStatus(subject.id) : undefined}
      title={editMode ? "Clique para alterar o status" : undefined}
      className={`rounded-xl border ${s.border} ${s.bg} p-3.5 transition-all duration-200 hover:border-gray-300 hover:shadow-sm
        ${editMode ? "cursor-pointer ring-1 ring-transparent hover:ring-gray-300" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-gray-900 leading-snug">{subject.name}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 font-medium ${s.badge}`}>{subject.id}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 items-center">
        {subject.sem && (
          <span className="text-[10px] uppercase tracking-widest text-gray-400">{subject.sem}º período</span>
        )}
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <span className={`text-xs ${s.text} flex items-center gap-1`}>
          {subject.status === "done"    && <CheckCircle2 size={11} />}
          {subject.status === "current" && <Circle size={11} className="animate-pulse" />}
          {subject.status === "next"    && <ArrowRight size={11} />}
          {subject.status === "future"  && <Clock size={11} />}
          {s.label}
        </span>
        {subject.prereqs.length > 0 && <span className="text-xs text-gray-400">· {subject.prereqs.length} pré-req.</span>}
      </div>
    </div>
  );
}

function OverviewTab({ subjects, editMode, onCycleStatus }) {
  const current = subjects.filter(s => s.status === "current");
  const next    = subjects.filter(s => s.status === "next");
  const future  = subjects.filter(s => s.status === "future");
  const Section = ({ title, icon: Icon, items, color }) => (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={15} className={color} />
        <h3 className={`text-sm font-semibold ${color}`}>{title}</h3>
        <span className="text-xs text-gray-400 ml-auto">{items.length} disciplinas</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {items.map(s => <SubjectCard key={s.id} subject={s} editMode={editMode} onCycleStatus={onCycleStatus} />)}
      </div>
    </div>
  );
  const termGroups = CURRICULUM_PERIODS.map(period => ({
    ...period,
    items: subjects.filter(s => s.sem === period.id),
  })).filter(period => period.items.length > 0);

  return (
    <div className="space-y-8">
      {editMode && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 flex items-center gap-2">
          <Pencil size={14} className="text-gray-500 shrink-0" />
          <p className="text-xs text-gray-600">
            Modo de edição ativo: clique em qualquer disciplina para alternar entre
            <span className="font-bold text-gray-900"> Concluída → Cursando → Próxima → Futura</span>.
          </p>
        </div>
      )}

      <Section title="Cursando"            icon={BookOpen}   items={current} color="text-gray-900" />
      <div className="border-t border-gray-200" />
      <Section title="Próximos Passos"     icon={ArrowRight} items={next}    color="text-gray-900" />
      <div className="border-t border-gray-200" />
      <Section title="Disciplinas Futuras" icon={Layers}     items={future}  color="text-gray-500" />

      <div className="border-t border-gray-200" />
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Layers size={15} className="text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-500">Grade Curricular por Período (referência)</h3>
        </div>
        <div className="space-y-4">
          {termGroups.map(term => (
            <div key={term.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">{term.label}</p>
                  <p className="text-sm font-bold text-gray-900">{term.items.length} disciplina{term.items.length !== 1 ? "s" : ""}</p>
                </div>
                <span className="text-xs text-gray-400">{term.id}º sem.</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {term.items.map(s => <SubjectCard key={s.id} subject={s} editMode={editMode} onCycleStatus={onCycleStatus} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
        return (
          <button key={s.id} onClick={() => setSelected(isSelected ? null : s.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 mb-0.5 flex items-center gap-2
              ${isSelected ? "bg-gray-100 border-gray-300 border text-gray-900 font-medium" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent"}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? "bg-gray-900" : "bg-gray-300"}`} />
            <span className="truncate">{s.name}</span>
            <span className="ml-auto text-xs text-gray-400 shrink-0">{s.id}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex gap-4 min-h-[500px]">
      <div className="w-64 shrink-0 bg-white border border-gray-200 rounded-xl p-3 overflow-y-auto max-h-[600px] shadow-sm">
        <p className="text-xs text-gray-500 mb-3 px-2 font-medium">Selecione uma disciplina</p>
        <ListSection title="Concluídas" items={grouped.done}    color="text-gray-400" />
        <ListSection title="Cursando"   items={grouped.current} color="text-gray-900" />
        <ListSection title="Próximas"   items={grouped.next}    color="text-gray-500" />
        <ListSection title="Futuras"    items={grouped.future}  color="text-gray-400" />
      </div>
      <div className="flex-1 bg-white border border-gray-200 rounded-xl p-5 overflow-y-auto max-h-[600px] shadow-sm">
        {!analysis ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3 opacity-50">
            <Network size={40} className="text-gray-400" />
            <p className="text-gray-500 text-sm">Selecione uma disciplina para ver sua análise de fluxo</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className={`rounded-xl border ${STATUS[analysis.subject.status].border} ${STATUS[analysis.subject.status].bg} p-4`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`text-xs font-bold ${STATUS[analysis.subject.status].text}`}>{analysis.subject.id}</span>
                  <h3 className="text-lg font-bold text-gray-900 mt-0.5">{analysis.subject.name}</h3>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS[analysis.subject.status].badge}`}>
                  {STATUS[analysis.subject.status].label}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 flex items-center gap-3">
              <TrendingUp size={20} className="text-gray-400 shrink-0" />
              <div>
                <p className="text-gray-900 font-bold text-xl leading-none">{analysis.cascade}</p>
                <p className="text-gray-500 text-xs mt-0.5">disciplinas afetadas em cascata</p>
              </div>
              <div className="ml-auto text-xs text-gray-400 text-right">
                <p>{Math.round((analysis.cascade / subjects.length) * 100)}% do curso</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5"><ChevronRight size={12} /> Depende de</p>
              {analysis.prereqNames.length === 0 ? <p className="text-sm text-gray-400 italic">Nenhum pré-requisito</p> : (
                <div className="flex flex-wrap gap-2">
                  {analysis.prereqNames.map(p => (
                    <button key={p.id} onClick={() => setSelected(p.id)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border ${STATUS[p.status].border} ${STATUS[p.status].bg} ${STATUS[p.status].text} font-medium hover:border-gray-300 transition-all`}>
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Zap size={12} className="text-gray-400" /> Libera Diretamente</p>
              {analysis.unlocks.length === 0 ? <p className="text-sm text-gray-400 italic">Nenhuma matéria desbloqueada</p> : (
                <div className="flex flex-wrap gap-2">
                  {analysis.unlocks.map(u => (
                    <button key={u.id} onClick={() => setSelected(u.id)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border ${STATUS[u.status].border} ${STATUS[u.status].bg} ${STATUS[u.status].text} font-medium hover:border-gray-300 transition-all`}>
                      {u.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {analysis.cascade > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5"><GitBranch size={12} className="text-gray-400" /> Peso no Curso</p>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Impacto cascata</span>
                  <span className="text-gray-900 font-bold">{analysis.cascade}/{subjects.length}</span>
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

function SuapModal({ onSync, onClose, loading, error }) {
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">Sincronizar com SUAP</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
            <XCircle size={16} />
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Suas credenciais são enviadas uma única vez ao Worker e nunca armazenadas.
          As faltas ficam salvas localmente na sua conta.
        </p>
        <div className="space-y-2">
          <input value={matricula} onChange={e => setMatricula(e.target.value)}
            placeholder="Matrícula SUAP"
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5
              text-sm text-gray-900 placeholder-gray-400 focus:outline-none
              focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-all" />
          <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
            placeholder="Senha"
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5
              text-sm text-gray-900 placeholder-gray-400 focus:outline-none
              focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-all" />
        </div>
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2">
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={onClose} disabled={loading}
            className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600
              hover:text-gray-900 hover:border-gray-300 transition-colors">
            Cancelar
          </button>
          <button onClick={() => onSync(matricula, senha)}
            disabled={loading || !matricula || !senha}
            className="flex-1 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-sm
              font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Sincronizando..." : "Sincronizar"}
          </button>
        </div>
      </div>
    </div>
  );
}

const WORKER_URL = "https://suap-sync.painel-academico-2026.workers.dev";

function Dashboard({ userKey, displayName, onLogout }) {
  const [tab, setTab] = useState("overview");
  const [faltas, setFaltas] = useState({});
  const [statusOverrides, setStatusOverrides] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [hydratedFor, setHydratedFor] = useState(null);
  const [suapModal, setSuapModal] = useState(false);
  const [suapLoading, setSuapLoading] = useState(false);
  const [suapError, setSuapError] = useState("");

  useEffect(() => {
    setHydratedFor(null);
    const data = loadUserData(userKey);
    setFaltas(data.faltas);
    setStatusOverrides(data.statusOverrides);
    setHydratedFor(userKey);
  }, [userKey]);

  useEffect(() => {
    if (hydratedFor !== userKey) return;
    saveUserData(userKey, { faltas, statusOverrides });
  }, [hydratedFor, userKey, faltas, statusOverrides]);

  const subjects = useMemo(() => DEFAULT_SUBJECTS.map(s => ({
    ...s,
    status: statusOverrides[s.id] ?? "future",
  })), [statusOverrides]);

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
    const future  = subjects.filter(s => s.status !== "done" && s.status !== "current").length;
    const total   = subjects.length;
    return { done, current, future, total, pct: Math.round((done / total) * 100) };
  }, [subjects]);

  const doneSubs = subjects.filter(s => s.status === "done");
  const alertCount = subjects.filter(s => {
    if (!ATTENDANCE_META[s.id]) return false;
    const { state } = calcAbsence(ATTENDANCE_META[s.id], faltas[s.id] || 0);
    return state !== "safe";
  }).length;

  const TABS = [
    { id: "overview",  label: "Visão Geral",     icon: BarChart3,  iconName: "dashboard" },
    { id: "schedule",  label: "Horário",          icon: Calendar,   iconName: "calendar_today" },
    { id: "absence",   label: "Faltas",           icon: AlertTriangle, iconName: "warning", badge: alertCount },
    { id: "flow",      label: "Análise de Fluxo", icon: GitBranch,  iconName: "insights" },
  ];

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
      setSuapModal(false);
    } catch (err) {
      setSuapError(err.message);
    } finally {
      setSuapLoading(false);
    }
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex antialiased">
      <nav className="hidden lg:flex flex-col fixed left-0 top-0 h-full py-8 w-64 bg-white border-r border-gray-200 z-40">
        <div className="px-6 mb-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 mb-4 flex items-center justify-center border border-gray-200">
            <School size={28} className="text-gray-700" />
          </div>
          <h2 className="font-headline-md text-headline-md font-black text-gray-900 mb-1">Dashboard Acadêmico</h2>
          <p className="font-body-md text-body-md text-gray-500">Engenharia de Computação · IFMT</p>
        </div>
        <div className="px-6 mb-8">
          <div className="bg-gray-100 rounded-full h-2 w-full overflow-hidden">
            <div className="bg-gray-900 h-full" style={{ width: `${stats.pct}%` }} />
          </div>
          <p className="font-label-caps text-label-caps text-gray-500 mt-2 text-center">{stats.pct}% concluído</p>
        </div>
        <ul className="flex flex-col flex-1 space-y-1 px-4">
          {TABS.map(({ id, label, icon: Icon, badge }) => (
            <li key={id}>
              <button onClick={() => setTab(id)}
                className={`w-full flex items-center px-4 py-3 rounded-lg font-label-caps text-label-caps uppercase transition-all border-l-2
                  ${tab === id
                    ? "text-gray-900 border-gray-900 bg-gray-100"
                    : "text-gray-500 border-transparent hover:bg-gray-50 hover:text-gray-900"}`}>
                <Icon size={16} className="mr-4 shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                {badge > 0 && <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px]">{badge}</span>}
              </button>
            </li>
          ))}
        </ul>
        <div className="px-6 mt-auto mb-4">
          <div className="border-t border-gray-200 pt-4">
            <button onClick={() => setSuapModal(true)}
              className="w-full text-left font-label-caps text-label-caps text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors py-2 px-3 rounded flex items-center gap-3">
              <RefreshCw size={16} /> Sincronizar SUAP
            </button>
            <button onClick={() => setEditMode(e => !e)}
              className={`w-full text-left font-label-caps text-label-caps py-2 px-3 rounded flex items-center gap-3 mt-1 transition-colors
                ${editMode ? "text-gray-900 bg-gray-100" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
              <Pencil size={16} /> {editMode ? "Concluir edição" : "Editar progresso"}
            </button>
            <button onClick={onLogout}
              className="w-full text-left font-label-caps text-label-caps text-red-600 hover:bg-red-50 transition-colors py-2 px-3 rounded flex items-center gap-3 mt-1">
              <LogOut size={16} /> Sair
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 flex justify-between items-center w-full px-4 lg:px-margin h-16 sticky top-0 z-30">
          <div className="flex items-center gap-2 text-gray-500">
            <User size={14} />
            <span className="font-code text-code font-bold text-gray-900">{displayName}</span>
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            <button onClick={() => setSuapModal(true)}
              className="font-body-md text-body-md text-gray-500 hover:bg-gray-50 transition-colors px-3 py-1.5 rounded-lg">
              <RefreshCw size={14} />
            </button>
            <button onClick={onLogout}
              className="font-body-md text-body-md text-gray-900 font-bold hover:bg-gray-50 transition-colors px-3 py-1.5 rounded-lg">
              Sair
            </button>
          </div>
        </header>

        <div className="max-w-container-max mx-auto w-full px-4 lg:px-margin py-6 lg:py-8 pb-28 lg:pb-10 flex-1">
          <div className="space-y-6">
            {tab === "overview" && (
            <>
            <section className="flex items-end justify-between border-b border-gray-200 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap size={14} className="text-gray-400" />
                  <span className="font-label-caps text-label-caps text-gray-500 tracking-widest uppercase">Engenharia de Computação · IFMT</span>
                </div>
                <h1 className="font-headline-md text-headline-md text-gray-900">Dashboard Acadêmico</h1>
                <p className="text-sm text-gray-500">Fluxo curricular · 2026/1</p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <div className="text-3xl font-black text-gray-900 leading-none">{stats.pct}%</div>
                <div className="font-label-caps text-label-caps text-gray-500 uppercase mt-1">Concluído</div>
              </div>
            </section>

            <section>
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Progresso Total do Curso</h3>
                  <span className="text-xs text-gray-500">{stats.done} de {stats.total} disciplinas</span>
                </div>
                <ProgressBar value={stats.pct} colorClass="bg-gray-900" />
                <div className="mt-4 grid grid-cols-4 gap-3 divide-x divide-gray-200">
                  {[
                    { v: stats.done,    l: "Concluídas" },
                    { v: stats.current, l: "Cursando" },
                    { v: subjects.filter(s=>s.status==="next").length,   l: "Próximas" },
                    { v: subjects.filter(s=>s.status==="future").length, l: "Futuras" },
                  ].map(({ v, l }) => (
                    <div key={l} className="text-center first:pl-0">
                      <p className="text-2xl font-bold text-gray-900 leading-none">{v}</p>
                      <p className="text-xs text-gray-500 mt-1">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <details className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <summary className="p-4 flex items-center gap-2 cursor-pointer select-none hover:bg-gray-50 transition-colors">
                <CheckCircle2 size={14} className="text-gray-400" />
                <span className="text-sm font-semibold text-gray-900">Disciplinas Concluídas</span>
                <span className="ml-auto text-xs text-gray-400">{doneSubs.length} disciplinas · expandir</span>
              </summary>
              <div className="px-4 pb-4 pt-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5">
                {doneSubs.map(s => (
                  <div key={s.id} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <CheckCircle2 size={10} className="text-gray-400 shrink-0" />
                    <span className="truncate">{s.name}</span>
                  </div>
                ))}
              </div>
            </details>
            </>
            )}

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="flex border-b border-gray-200 overflow-x-auto">
                {TABS.map(({ id, label, icon: Icon, badge }) => (
                  <button key={id} onClick={() => setTab(id)}
                    className={`relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-all border-b-2 whitespace-nowrap
                      ${tab === id ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}>
                    <Icon size={14} />
                    {label}
                    {badge > 0 && (
                      <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center leading-none">{badge}</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="p-5">
                {tab === "overview" && <OverviewTab subjects={subjects} editMode={editMode} onCycleStatus={cycleStatus} />}
                {tab === "schedule" && <ScheduleTab />}
                {tab === "absence"  && <AbsenceTab subjects={subjects} faltas={faltas} setFaltas={setFaltas} />}
                {tab === "flow"     && <FlowTab subjects={subjects} />}
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 pb-4 font-label-caps text-label-caps uppercase">GIDEON Academic · ENC 2026/1</p>
          </div>
        </div>
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-white border-t border-gray-200 shadow-lg rounded-t-xl">
        {TABS.map(({ id, label, icon: Icon, badge }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`relative flex flex-col items-center justify-center pt-2 transition-all
              ${tab === id ? "text-gray-900 border-t-2 border-gray-900" : "text-gray-500"}`}>
            <Icon size={18} className="mb-1" />
            <span className={`font-label-caps text-[10px] uppercase tracking-wider ${tab === id ? "font-bold" : ""}`}>
              {label}
            </span>
            {badge > 0 && tab !== id && (
              <span className="absolute -top-0.5 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        ))}
      </nav>

      {suapModal && (
        <SuapModal
          onSync={sincronizarSUAP}
          onClose={() => { setSuapModal(false); setSuapError(""); }}
          loading={suapLoading}
          error={suapError}
        />
      )}
    </div>
  );
}

export default function AcademicDashboard() {
  const [userKey, setUserKey] = useState(() => getSession());

  if (!userKey) {
    return (
      <AuthScreen onAuthenticated={(key) => { setSession(key); setUserKey(key); }} />
    );
  }

  return (
    <Dashboard
      userKey={userKey}
      displayName={getDisplayName(userKey)}
      onLogout={() => { setSession(null); setUserKey(null); }}
    />
  );
}
