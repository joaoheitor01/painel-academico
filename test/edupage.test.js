import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { lerGrade, casarHorario, mesmoProfessor, normalizar } from "../worker/edupage.js";
import { buildSchedule, buildAttendanceMeta, fmtTime } from "../curriculumData.js";

const raw = JSON.parse(
  await readFile(new URL("./fixtures/edupage-2026-2.json", import.meta.url), "utf8")
).r;
const grade = lerGrade(raw);

// O que o SUAP sabe: quais diários o aluno cursa, o professor e a carga real.
// (Análise e Projeto está aqui de propósito — o EduPage não publicou.)
const MATRICULAS = [
  { diario: "61479", codigo: "Normal.7433", encId: "ENC-37", nome: "Análise e Projeto de Sistemas Computacionais", professor: "Evandro Cesar Freiberger",         cargaHoraria: 80 },
  { diario: "61481", codigo: "Normal.3010", encId: "ENC-55", nome: "Laboratório de Circuitos Elétricos II",        professor: "Paulo Henrique Correa de Morais",  cargaHoraria: 40 },
  { diario: "61482", codigo: "Normal.1367", encId: "ENC-42", nome: "Redes de Computadores",                        professor: "Juliana Fonseca Antunes",          cargaHoraria: 80 },
  { diario: "61570", codigo: "Normal.3009", encId: "ENC-39", nome: "Circuitos Elétricos II",                       professor: "Ronan Marcelo Martins",            cargaHoraria: 80 },
  { diario: "61576", codigo: "Normal.2095", encId: "ENC-40", nome: "Eletrônica I",                                 professor: "Alberto Willian Mascarenhas",      cargaHoraria: 80 },
  { diario: "62785", codigo: "Normal.0935", encId: "ENC-56", nome: "Homem, Cultura e Sociedade",                   professor: "Sandro Aparecido Lima dos Santos", cargaHoraria: 40 },
];

const { horario, naoEncontradas } = casarHorario(MATRICULAS, grade);

test("mesmoProfessor() casa a forma abreviada do EduPage com a completa do SUAP", () => {
  assert.ok(mesmoProfessor("Paulo Morais", "Paulo Henrique Correa de Morais"));
  assert.ok(mesmoProfessor("Sandro Santos", "Sandro Aparecido Lima dos Santos"));
  assert.ok(mesmoProfessor("Alberto Mascarenhas", "Alberto Willian Mascarenhas"));
  assert.ok(mesmoProfessor("Juliana Antunes", "Juliana Fonseca Antunes"));
  assert.ok(mesmoProfessor("Ronan Martins", "Ronan Marcelo Martins"));
});

test("mesmoProfessor() não casa por sobrenome nem por primeiro nome sozinho", () => {
  assert.equal(mesmoProfessor("Paulo Silva", "Paulo Henrique Correa de Morais"), false);
  assert.equal(mesmoProfessor("Ana Morais", "Paulo Henrique Correa de Morais"), false);
  assert.equal(mesmoProfessor("Paulo", "Paulo Henrique Correa de Morais"), false);
  assert.equal(mesmoProfessor("", "Paulo Henrique Correa de Morais"), false);
});

test("normalizar() remove acento e pontuação dos nomes de disciplina", () => {
  assert.equal(normalizar("Eletrônica Analógica I"), "eletronica analogica i");
  assert.equal(normalizar("Homem, Cultura e Sociedade"), "homem cultura e sociedade");
});

test("lerGrade() expande durationperiods em períodos consecutivos", () => {
  const lab = grade.find(g => g.nome === "Laboratório de Circuitos Elétricos II");
  // 1 card (segunda, período 7) com durationperiods=2 → 2 aulas de 45 min.
  assert.equal(lab.periodos.length, 2);
  assert.deepEqual(lab.periodos.map(p => [p.dia, fmtTime(p.inicio), fmtTime(p.fim)]), [
    [2, "13:00", "13:45"],
    [2, "13:45", "14:30"],
  ]);
});

test("lerGrade() traz turma e professor para permitir o casamento", () => {
  const redes = grade.find(g => g.nome === "Redes de Computadores");
  assert.deepEqual(redes.professores, ["Juliana Antunes"]);
  assert.ok(redes.turmas.some(t => /7844\.6/.test(t)), `turmas: ${redes.turmas}`);
});

test("o horário sai 100% da grade oficial do EduPage", () => {
  const schedule = buildSchedule(horario);
  const desc = (dia) =>
    schedule.find(d => d.day === dia).blocks.map(b => {
      const iv = (b.intervals || []).map(i => ` int ${fmtTime(i.start)}–${fmtTime(i.end)}`).join("");
      return `${b.name} ${fmtTime(b.start)}–${fmtTime(b.end)} (${b.aulas})${iv}`;
    });

  assert.deepEqual(desc("Segunda"), [
    "Lab. Circuitos II 13:00–14:30 (2)",
    "Homem, Cultura e Sociedade 18:50–20:30 (2)",
  ]);
  assert.deepEqual(desc("Terça"), ["Redes de Computadores 16:20–17:50 (2)"]);
  assert.deepEqual(desc("Quarta"), [
    "Circuitos Elétricos II 13:00–16:20 (4) int 15:15–15:35",
  ]);
  assert.deepEqual(desc("Quinta"), [
    "Redes de Computadores 15:35–17:05 (2)",
    "Eletrônica I 18:50–22:25 (4) int 20:30–20:45",
  ]);
  assert.deepEqual(desc("Sexta"), []);
});

test("Redes na quinta é 15:35, não 16:55 — o erro que motivou trocar de fonte", () => {
  const schedule = buildSchedule(horario);
  const redesQui = schedule.find(d => d.day === "Quinta").blocks.find(b => b.id === "ENC-42");
  assert.equal(fmtTime(redesQui.start), "15:35");
  assert.equal(fmtTime(redesQui.end), "17:05");
});

test("disciplina ausente da grade oficial é descartada, e reportada", () => {
  assert.deepEqual(horario.map(h => h.encId).sort(), [
    "ENC-39", "ENC-40", "ENC-42", "ENC-55", "ENC-56",
  ]);
  assert.deepEqual(naoEncontradas.map(n => n.encId), ["ENC-37"]);
  assert.match(naoEncontradas[0].motivo, /ausente na grade/);
});

test("a carga horária continua vindo do SUAP (o EduPage não tem o total)", () => {
  const meta = buildAttendanceMeta(horario);
  const resumo = Object.fromEntries(
    Object.entries(meta).map(([id, m]) => [id, [m.cargaHoraria, m.aulasPorDia]])
  );
  assert.deepEqual(resumo, {
    "ENC-55": [40, 2],
    "ENC-42": [80, 2],
    "ENC-39": [80, 4],
    "ENC-40": [80, 4],
    "ENC-56": [40, 2],
  });
});

test("cada entrada registra turma e fonte, para auditoria", () => {
  const redes = horario.find(h => h.encId === "ENC-42");
  assert.equal(redes.fonte, "edupage");
  assert.match(redes.turma, /7844\.6/);
  assert.equal(redes.professor, "Juliana Antunes");
});

test("sem grade do EduPage, nada é inventado", () => {
  const { horario: vazio, naoEncontradas: todas } = casarHorario(MATRICULAS, []);
  assert.deepEqual(vazio, []);
  assert.equal(todas.length, MATRICULAS.length);
});
