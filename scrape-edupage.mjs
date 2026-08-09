#!/usr/bin/env node
/**
 * scrape-edupage.mjs — extrai a grade de horários do IFMT Cuiabá
 * (aSc TimeTables / edupage) sem dependências externas (Node 18+, fetch nativo).
 *
 * Uso:
 *   node scrape-edupage.mjs [ano]          # ano default: 2026
 *
 * Env:
 *   EDUPAGE_BASE  — sobrescreve a URL base (default https://ifmtcba.edupage.org)
 *   EDUPAGE_GSH   — sobrescreve o token __gsh (default "00000000")
 *
 * Saída:
 *   timetable-raw.json — resposta bruta de regularttGetData
 *   timetable.json     — array normalizado
 *   stdout             — resumo: disciplinas distintas por curso
 */

import { writeFile } from "node:fs/promises";

const BASE = process.env.EDUPAGE_BASE || "https://ifmtcba.edupage.org";
const YEAR = Number(process.argv[2] || 2026);
const GSH = process.env.EDUPAGE_GSH || "00000000";

const HEADERS = {
  "Content-Type": "application/json",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  Accept: "*/*",
  Origin: BASE,
  Referer: `${BASE}/timetable/`,
};

const DIAS = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"];

/** POST num endpoint rpc do edupage; valida a resposta e devolve o payload `r`. */
async function rpc(path, func, args) {
  const url = `${BASE}${path}?__func=${func}`;
  const res = await fetch(url, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ __args: args, __gsh: GSH }),
  });

  const raw = await res.text();

  if (!res.ok) {
    console.error(`HTTP ${res.status} em ${url}. Body cru:`);
    console.error(raw);
    process.exit(1);
  }

  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    console.error(`Resposta não é JSON em ${url} (possível __gsh inválido). Body cru:`);
    console.error(raw);
    process.exit(1);
  }

  // Erros do edupage vêm como {"e":...} / {"error":...} ou sem o campo "r".
  if (json.e || json.error || !("r" in json) || json.r == null) {
    console.error(`Resposta de erro do edupage em ${url} (possível __gsh inválido). Body cru:`);
    console.error(raw);
    process.exit(1);
  }

  return { r: json.r, raw };
}

function indexById(rows) {
  const map = new Map();
  for (const row of rows) map.set(row.id, row);
  return map;
}

/** "10000" -> [0]; "01100" -> [1,2] (índices dos dias com bit ligado). */
function daysFromBitmask(days) {
  const idx = [];
  const s = String(days ?? "");
  for (let i = 0; i < s.length; i++) if (s[i] === "1") idx.push(i);
  return idx;
}

/**
 * Heurística para separar "curso" do nome da turma.
 * Ex.: "1º ANO INFORMÁTICA A" -> "INFORMÁTICA"; "ELETRÔNICA 2M" -> "ELETRÔNICA".
 * Se nada casar, devolve o próprio nome da turma.
 */
function cursoFromClassName(name) {
  if (!name) return "";
  let s = String(name).trim();
  // remove marcador de série no início: "1º", "2°", "3a", "1º ANO", "2ª SÉRIE"...
  s = s.replace(/^\d+\s*[ºª°oa]?\s*(ano|série|serie|sem(estre)?)?\s*[-–.]?\s*/i, "");
  // remove sufixo de seção/turno no final: letra isolada, "A", "B", "2M", "3V"...
  s = s.replace(/\s+\d*[A-Za-z]$/u, "").trim();
  return s || String(name).trim();
}

async function main() {
  console.log(`Base: ${BASE} | ano: ${YEAR}`);

  // 1) Descobrir os timetables publicados
  const viewer = await rpc("/timetable/server/ttviewer.js", "getTTViewerData", [null, YEAR]);
  const timetables = viewer.r?.regular?.timetables;
  if (!Array.isArray(timetables) || timetables.length === 0) {
    console.error("Nenhum timetable publicado encontrado. Resposta:");
    console.error(viewer.raw);
    process.exit(1);
  }

  const latest = timetables.reduce((a, b) =>
    Number(b.tt_num) > Number(a.tt_num) ? b : a
  );
  console.log(
    `Timetables publicados: ${timetables
      .map((t) => `${t.tt_num} (${t.text}, ${t.year})`)
      .join("; ")}`
  );
  console.log(`Selecionado: tt_num=${latest.tt_num} — "${latest.text}"`);

  // 2) Baixar os dados completos
  const data = await rpc("/timetable/server/regulartt.js", "regularttGetData", [
    null,
    String(latest.tt_num),
  ]);
  await writeFile("timetable-raw.json", data.raw);
  console.log("timetable-raw.json gravado.");

  const tables = data.r?.dbiAccessorRes?.tables;
  if (!Array.isArray(tables)) {
    console.error("Resposta sem dbiAccessorRes.tables. Body cru:");
    console.error(data.raw);
    process.exit(1);
  }

  const rows = (id) => tables.find((t) => t.id === id)?.data_rows ?? [];
  const classes = indexById(rows("classes"));
  const subjects = indexById(rows("subjects"));
  const teachers = indexById(rows("teachers"));
  const classrooms = indexById(rows("classrooms"));
  const lessons = indexById(rows("lessons"));
  const groups = indexById(rows("groups"));
  const cards = rows("cards");

  // periods indexado pelo número do período (campo "period"), não pelo id
  const periodsByNum = new Map();
  for (const p of rows("periods")) periodsByNum.set(String(p.period), p);

  console.log(
    `Tabelas: ${cards.length} cards, ${lessons.size} lessons, ` +
      `${classes.size} classes, ${subjects.size} subjects, ` +
      `${teachers.size} teachers, ${classrooms.size} classrooms, ` +
      `${periodsByNum.size} periods`
  );

  // 3) Normalizar: card -> lesson -> subject/teacher/class
  const entries = [];
  let skipped = 0;

  for (const card of cards) {
    const lesson = lessons.get(card.lessonid);
    if (!lesson) {
      skipped++;
      continue;
    }

    const subject = subjects.get(lesson.subjectid);
    const professor = (lesson.teacherids ?? [])
      .map((id) => teachers.get(id)?.name ?? teachers.get(id)?.short ?? id)
      .join(", ");
    const sala = (card.classroomids ?? [])
      .filter(Boolean)
      .map((id) => classrooms.get(id)?.name ?? classrooms.get(id)?.short ?? id)
      .join(", ");

    const grupoNames = (lesson.groupids ?? [])
      .map((id) => groups.get(id))
      .filter((g) => g && g.entireclass === false && g.name)
      .map((g) => g.name);

    const dur = Number(lesson.durationperiods ?? card.durationperiods ?? 1) || 1;
    const startPeriod = periodsByNum.get(String(card.period));
    const endPeriod =
      periodsByNum.get(String(Number(card.period) + dur - 1)) ?? startPeriod;

    for (const dayIdx of daysFromBitmask(card.days)) {
      for (const classid of lesson.classids ?? [null]) {
        const klass = classid ? classes.get(classid) : null;
        const turmaBase = klass?.name ?? klass?.short ?? "(sem turma)";
        const turma = grupoNames.length
          ? `${turmaBase} (${grupoNames.join(", ")})`
          : turmaBase;

        entries.push({
          curso: cursoFromClassName(klass?.name ?? klass?.short ?? ""),
          turma,
          disciplina: subject?.name ?? subject?.short ?? String(lesson.subjectid),
          professor,
          sala,
          dia: DIAS[dayIdx] ?? `dia${dayIdx}`,
          inicio: startPeriod?.starttime ?? "",
          fim: endPeriod?.endtime ?? "",
          periodo: Number(card.period),
        });
      }
    }
  }

  if (skipped) console.log(`Aviso: ${skipped} cards sem lesson correspondente (ignorados).`);

  if (entries.length === 0) {
    console.error("Nenhuma entrada normalizada gerada — verifique timetable-raw.json.");
    process.exit(1);
  }

  entries.sort(
    (a, b) =>
      a.curso.localeCompare(b.curso, "pt-BR") ||
      a.turma.localeCompare(b.turma, "pt-BR") ||
      DIAS.indexOf(a.dia) - DIAS.indexOf(b.dia) ||
      a.periodo - b.periodo
  );

  await writeFile("timetable.json", JSON.stringify(entries, null, 2));
  console.log(`timetable.json gravado com ${entries.length} entradas.\n`);

  // 4) Resumo: disciplinas distintas por curso
  const porCurso = new Map();
  for (const e of entries) {
    if (!porCurso.has(e.curso)) porCurso.set(e.curso, new Set());
    porCurso.get(e.curso).add(e.disciplina);
  }

  console.log("=== Disciplinas distintas por curso ===");
  for (const [curso, discs] of [...porCurso.entries()].sort((a, b) =>
    a[0].localeCompare(b[0], "pt-BR")
  )) {
    console.log(`\n${curso || "(sem curso)"} — ${discs.size} disciplinas:`);
    for (const d of [...discs].sort((a, b) => a.localeCompare(b, "pt-BR"))) {
      console.log(`  - ${d}`);
    }
  }
}

await main();
