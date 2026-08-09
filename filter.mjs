#!/usr/bin/env node
/**
 * filter.mjs — filtra timetable.json por disciplinas e sinaliza conflitos.
 *
 * Uso:
 *   node filter.mjs <disciplina...> [--file caminho/timetable.json]
 *
 * Exemplos:
 *   node filter.mjs matematica "programação web"
 *   node filter.mjs MAT PW --file ./timetable.json
 *
 * A busca é por substring, sem diferenciar maiúsculas/acentos, contra o campo
 * "disciplina" — em QUALQUER curso. A saída é agrupada por dia da semana e
 * conflitos de horário entre disciplinas diferentes são sinalizados.
 */

import { readFile } from "node:fs/promises";

const DIAS = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"];

const args = process.argv.slice(2);
let file = "timetable.json";
const terms = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--file") {
    file = args[++i];
    if (!file) {
      console.error("--file requer um caminho.");
      process.exit(1);
    }
  } else {
    terms.push(args[i]);
  }
}

if (terms.length === 0) {
  console.error("Uso: node filter.mjs <disciplina...> [--file timetable.json]");
  process.exit(1);
}

/** minúsculas + sem acentos, para comparação tolerante. */
function norm(s) {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

const entries = JSON.parse(await readFile(file, "utf8"));
if (!Array.isArray(entries) || entries.length === 0) {
  console.error(`${file} está vazio ou não é um array. Rode scrape-edupage.mjs antes.`);
  process.exit(1);
}

const normTerms = terms.map(norm);
const matchTerm = (e) =>
  normTerms.find((t) => norm(e.disciplina).includes(t)) ?? null;

// dedup (o mesmo card pode gerar entradas idênticas em edge cases)
const seen = new Set();
const matched = [];
for (const e of entries) {
  const t = matchTerm(e);
  if (t === null) continue;
  const key = JSON.stringify([e.turma, e.disciplina, e.dia, e.inicio, e.fim, e.professor, e.sala]);
  if (seen.has(key)) continue;
  seen.add(key);
  matched.push({ ...e, _term: t });
}

if (matched.length === 0) {
  console.error(`Nenhum horário encontrado para: ${terms.join(", ")}`);
  process.exit(1);
}

// avisa sobre termos que não casaram com nada
for (const t of normTerms) {
  if (!matched.some((e) => e._term === t)) {
    console.error(`Aviso: nenhum horário encontrado para "${terms[normTerms.indexOf(t)]}".`);
  }
}

const overlaps = (a, b) => a.inicio < b.fim && b.inicio < a.fim;

// conflitos: mesmo dia, horários sobrepostos, disciplinas diferentes
const conflicts = [];
const conflicted = new Set();
for (let i = 0; i < matched.length; i++) {
  for (let j = i + 1; j < matched.length; j++) {
    const a = matched[i];
    const b = matched[j];
    if (a.dia !== b.dia) continue;
    if (norm(a.disciplina) === norm(b.disciplina)) continue;
    if (!a.inicio || !b.inicio || !overlaps(a, b)) continue;
    conflicts.push([a, b]);
    conflicted.add(a);
    conflicted.add(b);
  }
}

console.log(`Disciplinas buscadas: ${terms.join(", ")}`);
console.log(`${matched.length} horário(s) encontrado(s).\n`);

for (const dia of DIAS) {
  const doDia = matched
    .filter((e) => e.dia === dia)
    .sort((a, b) => a.inicio.localeCompare(b.inicio) || a.turma.localeCompare(b.turma, "pt-BR"));
  if (doDia.length === 0) continue;

  console.log(`=== ${dia.toUpperCase()} ===`);
  for (const e of doDia) {
    const flag = conflicted.has(e) ? "  ⚠ CONFLITO" : "";
    console.log(
      `  ${e.inicio}–${e.fim}  ${e.disciplina}  [${e.turma} / ${e.curso}]` +
        `  prof: ${e.professor || "-"}  sala: ${e.sala || "-"}${flag}`
    );
  }
  console.log();
}

if (conflicts.length > 0) {
  console.log(`⚠ ${conflicts.length} conflito(s) de horário detectado(s):`);
  for (const [a, b] of conflicts) {
    console.log(
      `  ${a.dia}: "${a.disciplina}" (${a.inicio}–${a.fim}, ${a.turma})` +
        ` × "${b.disciplina}" (${b.inicio}–${b.fim}, ${b.turma})`
    );
  }
} else {
  console.log("Sem conflitos de horário entre as disciplinas buscadas.");
}
