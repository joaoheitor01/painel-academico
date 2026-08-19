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

/** Turno de um horário de relógio, na convenção do SUAP (M/V/N). */
const turnoDoMinuto = (min) => (min < 12 * 60 ? "M" : min < 18 * 60 ? "V" : "N");

const chaveEncontro = (dia, turno) => `${dia}|${turno}`;

/** Em que "dia|turno" a oferta do EduPage tem aula. */
function encontrosDaGrade(oferta) {
  return new Set(oferta.periodos.map((p) => chaveEncontro(p.dia, turnoDoMinuto(p.inicio))));
}

/**
 * O código do SUAP ("6N1234") não diz a hora do sino, mas diz QUAL oferta é a
 * do aluno — e é o único desempate que funciona quando duas turmas têm a mesma
 * disciplina COM O MESMO PROFESSOR. Caso real de 2026/2: Jorge Monsalve dá
 * Equações Diferenciais na Computação (terça e sexta à tarde) e na Civil
 * (sexta à noite); nome e professor são idênticos, só o turno separa.
 */
function compativelComSuap(oferta, blocos) {
  if (!blocos || blocos.length === 0) return true; // sem código do SUAP, não filtra
  const daGrade = encontrosDaGrade(oferta);
  return blocos.every((b) => daGrade.has(chaveEncontro(b.dia, b.turno)));
}

/**
 * Um nome contém o outro? O SUAP escreve por extenso ("Análise e Projeto de
 * Sistemas Computacionais") e o EduPage às vezes encurta ("Análise e Projeto
 * de Sistemas"). Exige tamanhos diferentes: "Circuitos Elétricos I" e
 * "Circuitos Elétricos II" têm o mesmo número de tokens e não se confundem.
 */
function nomeContido(a, b) {
  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.length < 2 || tb.length < 2 || ta.length === tb.length) return false;
  const [curto, longo] = ta.length < tb.length ? [ta, tb] : [tb, ta];
  const set = new Set(longo);
  return curto.every((t) => set.has(t));
}

/**
 * Candidatos de uma matrícula na grade. O nome parcial só entra quando o exato
 * não achou nada — assim "Redes de Computadores" jamais vira "Fundamentos de
 * Redes de Computadores", que existe na grade do técnico integrado.
 */
function candidatosPorNome(nome, grade) {
  const exatos = grade.filter((g) => normalizar(g.nome) === normalizar(nome));
  return exatos.length ? exatos : grade.filter((g) => nomeContido(g.nome, nome));
}

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
  // Passo 1 — nome, depois dia+turno do SUAP, depois professor.
  // A ordem importa: na grade real do campus (1300+ aulas) quase nenhuma
  // disciplina tem nome único, então o filtro do SUAP é quem faz o trabalho.
  const pendentes = matriculas.map((m) => {
    const porNome = candidatosPorNome(m.nome, grade);
    const porSuap = porNome.filter((c) => compativelComSuap(c, m.blocos));
    // Se o SUAP não bate com nenhuma oferta, a grade provavelmente mudou de
    // dia depois da matrícula: seguimos com os candidatos do nome e deixamos
    // professor/turma decidirem, em vez de descartar a disciplina.
    const candidatos = porSuap.length ? porSuap : porNome;

    let escolhido = null;
    if (candidatos.length === 1) {
      escolhido = candidatos[0];
    } else if (candidatos.length > 1 && m.professor) {
      escolhido =
        candidatos.find((c) => c.professores.some((p) => mesmoProfessor(p, m.professor))) || null;
    }
    return { m, porNome, semCompativel: porNome.length > 0 && porSuap.length === 0, candidatos, escolhido };
  });

  // Passo 2 — a turma do aluno sai do que já resolveu, e UM acerto basta.
  // Exigir dois era o que travava a grade real: com tudo repetido em várias
  // turmas, costuma sobrar uma única disciplina resolvida sozinha, e o quórum
  // de dois nunca chegava — derrubando todas as outras em cascata.
  const votos = new Map();
  const registrar = (oferta) => {
    for (const t of oferta.turmas) votos.set(t, (votos.get(t) || 0) + 1);
  };
  for (const p of pendentes) if (p.escolhido) registrar(p.escolhido);

  /** Quantas disciplinas já resolvidas do aluno estão nesta oferta. */
  const peso = (oferta) => Math.max(0, ...oferta.turmas.map((t) => votos.get(t) || 0));

  // Resolver por turma pode revelar OUTRA turma do mesmo aluno — dependência
  // de outro semestre, disciplina cursada em outro departamento. Por isso
  // repete até parar de progredir, em vez de uma passada só.
  for (let progrediu = true; progrediu; ) {
    progrediu = false;
    for (const p of pendentes) {
      if (p.escolhido || p.candidatos.length < 2) continue;
      const daTurma = p.candidatos.filter((c) => peso(c) > 0);
      if (daTurma.length === 0) continue;
      // O aluno costuma pertencer a mais de uma turma (a do semestre, a da
      // dependência). Havendo oferta em duas delas, fica com a principal —
      // a que aparece em mais disciplinas já resolvidas. Empate não se chuta.
      const melhor = daTurma.reduce((a, c) => (peso(c) > peso(a) ? c : a));
      if (daTurma.filter((c) => peso(c) === peso(melhor)).length > 1) continue;
      p.escolhido = melhor;
      registrar(melhor);
      progrediu = true;
    }
  }

  const horario = [];
  const naoEncontradas = [];

  for (const p of pendentes) {
    const { m, porNome, semCompativel, escolhido } = p;

    if (!escolhido) {
      naoEncontradas.push({
        encId: m.encId,
        nome: m.nome,
        motivo:
          porNome.length === 0
            ? "ausente na grade"
            : semCompativel
              ? "nenhuma turma bate com o dia/turno do SUAP"
              : m.professor
                ? "várias turmas e nenhuma bate com o professor"
                : "várias turmas e sem professor para desempatar",
      });
      continue;
    }

    horario.push({
      diario: m.diario,
      codigo: m.codigo,
      encId: m.encId,
      nome: m.nome,
      professor: escolhido.professores[0] || m.professor || "",
      turma: escolhido.turmas[0] || "",
      cargaHoraria: m.cargaHoraria, // do SUAP: o EduPage não tem o total do semestre
      fonte: "edupage",
      blocos: blocosPorDia(escolhido.periodos),
    });
  }

  return { horario, naoEncontradas };
}
