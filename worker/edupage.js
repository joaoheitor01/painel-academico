// ─── edupage.js ────────────────────────────────────────────────────────────
// Grade oficial de horários do IFMT Campus Cuiabá (aSc TimeTables / EduPage).
//
// POR QUE ESTA FONTE
// Os códigos do SUAP ("2V34 / 3V12") só dizem dia + turno + nº da aula; para
// virar horário de relógio é preciso conhecer a grade de sinos do campus, e a
// que circula não bate com a real. Conferido contra a turma DCOM 7844.6:
// Redes de Computadores na quinta é 15:35–17:05, não 16:55–18:40 — 1h20 de
// erro. O EduPage publica os sinos de verdade, é público (sem login) e traz
// turma + professor, o que permite casar a disciplina com segurança.
//
// O ENDPOINT
// POST /timetable/server/regulartt.js?__func=regularttGetData
//   body: {"__args":[null,"<tt_num>"],"__gsh":"00000000"}
// O tt_num sai de getTTViewerData (não chumbar: muda a cada semestre).

const EDUPAGE_BASE = "https://ifmtcba.edupage.org";
const GSH = "00000000"; // token público do viewer anônimo

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

function headers() {
  return {
    "Content-Type": "application/json",
    "User-Agent": UA,
    Accept: "*/*",
    Origin: EDUPAGE_BASE,
    Referer: `${EDUPAGE_BASE}/timetable/`,
  };
}

async function rpc(path, func, args) {
  const res = await fetch(`${EDUPAGE_BASE}${path}?__func=${func}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ __args: args, __gsh: GSH }),
  });
  if (!res.ok) throw new Error(`edupage ${func}: HTTP ${res.status}`);
  const json = JSON.parse(await res.text());
  if (json.e || json.error || json.r == null) throw new Error(`edupage ${func}: resposta de erro`);
  return json.r;
}

/** Descobre o tt_num da grade vigente (ex.: "1234" → HORARIO_2026_2_...). */
export async function descobrirTimetable() {
  const r = await rpc("/timetable/server/ttviewer.js", "getTTViewerData", [null, new Date().getFullYear()]);
  const reg = r?.regular;
  const num = reg?.default_num || reg?.timetables?.[0]?.tt_num;
  if (!num) throw new Error("edupage: tt_num não encontrado");
  const meta = (reg.timetables || []).find((t) => t.tt_num === num) || {};
  return { ttNum: String(num), texto: meta.text || "", de: meta.datefrom || "" };
}

export async function baixarGrade(ttNum) {
  return await rpc("/timetable/server/regulartt.js", "regularttGetData", [null, String(ttNum)]);
}

// ─── Normalização de texto / nomes ─────────────────────────────────────────
const PARTICULAS = new Set(["de", "da", "do", "das", "dos", "e", "di", "del"]);

export function normalizar(s) {
  return (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const tokens = (s) => normalizar(s).split(" ").filter((t) => t && !PARTICULAS.has(t));

/**
 * O EduPage abrevia o nome do professor ("Paulo Morais"), o SUAP traz completo
 * ("Paulo Henrique Correa de Morais"). Casa se todos os tokens do mais curto
 * aparecem no mais longo — e exige ao menos 2 (evita casar só pelo primeiro nome).
 */
export function mesmoProfessor(a, b) {
  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.length === 0 || tb.length === 0) return false;
  const [curto, longo] = ta.length <= tb.length ? [ta, tb] : [tb, ta];
  // Um token só (“Paulo”) é ambíguo demais para desempatar professor.
  if (curto.length < 2) return false;
  const set = new Set(longo);
  return curto.every((t) => set.has(t));
}

// ─── Leitura da grade ──────────────────────────────────────────────────────
const hhmmParaMin = (s) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec((s || "").trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

/** days é bitmask por posição: "100000" = segunda … "000001" = sábado. */
const diaDoBitmask = (days) => {
  const i = String(days || "").indexOf("1");
  return i === -1 ? null : i + 2; // 0=Segunda → dia 2, alinhado com o resto do app
};

/**
 * Grade bruta do EduPage → aulas por disciplina:
 *   [{ nome, professores, turmas, periodos: [{ dia, inicio, fim }] }]
 * Cada card ocupa `durationperiods` períodos consecutivos a partir de `period`.
 */
export function lerGrade(raw) {
  const tabelas = Object.fromEntries(
    (raw?.dbiAccessorRes?.tables || []).map((t) => [t.id, t.data_rows || []])
  );
  const porId = (rows) => Object.fromEntries((rows || []).map((r) => [r.id, r]));

  const subjects = porId(tabelas.subjects);
  const teachers = porId(tabelas.teachers);
  const classes = porId(tabelas.classes);

  // Períodos ordenados por número, para expandir durationperiods.
  const periodos = (tabelas.periods || [])
    .map((p) => ({
      num: Number(p.period ?? p.id),
      inicio: hhmmParaMin(p.starttime),
      fim: hhmmParaMin(p.endtime),
    }))
    .filter((p) => Number.isFinite(p.num) && p.inicio !== null && p.fim !== null)
    .sort((a, b) => a.num - b.num);
  const periodoPorNum = new Map(periodos.map((p) => [p.num, p]));

  const cardsPorAula = new Map();
  for (const c of tabelas.cards || []) {
    if (!cardsPorAula.has(c.lessonid)) cardsPorAula.set(c.lessonid, []);
    cardsPorAula.get(c.lessonid).push(c);
  }

  const out = [];
  for (const l of tabelas.lessons || []) {
    const nome = subjects[l.subjectid]?.name;
    if (!nome) continue;

    const dur = Math.max(1, Number(l.durationperiods) || 1);
    const spans = [];
    for (const c of cardsPorAula.get(l.id) || []) {
      const dia = diaDoBitmask(c.days);
      const base = Number(c.period);
      if (dia === null || !Number.isFinite(base)) continue;
      for (let k = 0; k < dur; k++) {
        const p = periodoPorNum.get(base + k);
        if (p) spans.push({ dia, inicio: p.inicio, fim: p.fim });
      }
    }
    if (spans.length === 0) continue;

    out.push({
      nome,
      professores: (l.teacherids || []).map((t) => teachers[t]?.short || teachers[t]?.name).filter(Boolean),
      turmas: (l.classids || []).map((c) => classes[c]?.name).filter(Boolean),
      periodos: spans,
    });
  }
  return out;
}

// ─── Casamento SUAP × EduPage ──────────────────────────────────────────────
/**
 * Junta os períodos de uma disciplina em blocos por dia.
 * Slots grudados viram um bloco só; a lacuna fica para a UI virar intervalo.
 */
function blocosPorDia(spans) {
  const porDia = new Map();
  for (const s of spans) {
    if (!porDia.has(s.dia)) porDia.set(s.dia, []);
    porDia.get(s.dia).push([s.inicio, s.fim]);
  }
  return [...porDia.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([dia, ps]) => ({
      dia,
      // dedup + ordena; a UI calcula início/fim/intervalos a partir daqui
      periodos: [...new Map(ps.map((p) => [p.join("-"), p])).values()].sort((a, b) => a[0] - b[0]),
    }));
}

/**
 * `matriculas` vem do SUAP (quem é o aluno, carga horária real do diário);
 * `grade` vem do EduPage (os sinos de verdade).
 *
 * Só entra no resultado a disciplina que o EduPage publicou — foi a escolha
 * explícita: horário 100% da grade oficial, sem completar com o SUAP.
 */
export function casarHorario(matriculas, grade) {
  const horario = [];
  const naoEncontradas = [];

  for (const m of matriculas) {
    const candidatos = grade.filter((g) => normalizar(g.nome) === normalizar(m.nome));

    let escolhido = null;
    if (candidatos.length === 1) {
      escolhido = candidatos[0];
    } else if (candidatos.length > 1) {
      // Mesma disciplina em várias turmas: o professor desempata.
      escolhido =
        candidatos.find((c) => c.professores.some((p) => mesmoProfessor(p, m.professor))) || null;
    }

    if (!escolhido) {
      naoEncontradas.push({ encId: m.encId, nome: m.nome, motivo: candidatos.length ? "professor não bateu" : "ausente na grade" });
      continue;
    }

    horario.push({
      diario: m.diario,
      codigo: m.codigo,
      encId: m.encId,
      nome: m.nome,
      professor: escolhido.professores[0] || m.professor,
      turma: escolhido.turmas[0] || "",
      cargaHoraria: m.cargaHoraria, // do SUAP: o EduPage não tem o total do semestre
      fonte: "edupage",
      blocos: blocosPorDia(escolhido.periodos),
    });
  }

  return { horario, naoEncontradas };
}
