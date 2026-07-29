import test from "node:test";
import assert from "node:assert/strict";

import {
  buildSchedule, buildAttendanceMeta, buildSubjectColors,
  SCHEDULE, ATTENDANCE_META, fmtTime, SLOT_TIMES, toMin,
} from "../curriculumData.js";
import { HORARIO_2026_2 } from "./fixtures/horario.js";

const schedule = buildSchedule(HORARIO_2026_2);
const byDay = Object.fromEntries(schedule.map(d => [d.day, d]));

/** "Nome 13:00–14:45 (2)" + " int 15:40–16:00" por bloco — fácil de comparar. */
const descreve = (d) =>
  d.blocks.map(b => {
    const base = `${b.name} ${fmtTime(b.start)}–${fmtTime(b.end)} (${b.aulas})`;
    const iv = (b.intervals || []).map(i => ` int ${fmtTime(i.start)}–${fmtTime(i.end)}`).join("");
    return base + iv;
  });

test("buildSchedule() reproduz o horário de 2026/2 conferido no SUAP", () => {
  assert.deepEqual(descreve(byDay["Segunda"]), [
    "Lab. Circuitos II 13:00–14:45 (2)",
    "Análise e Projeto 14:50–16:50 (2) int 15:40–16:00",
    "Homem, Cultura e Sociedade 18:55–20:30 (2)",
  ]);
  assert.deepEqual(descreve(byDay["Terça"]), [
    "Análise e Projeto 13:00–14:45 (2)",
    "Redes de Computadores 16:55–18:40 (2)",
  ]);
  assert.deepEqual(descreve(byDay["Quarta"]), [
    "Circuitos Elétricos II 13:00–16:50 (4) int 15:40–16:00",
  ]);
  assert.deepEqual(descreve(byDay["Quinta"]), [
    "Redes de Computadores 16:55–18:40 (2)",
    "Eletrônica I 18:50–22:25 (4) int 20:30–20:45",
  ]);
  assert.deepEqual(descreve(byDay["Sexta"]), []);
});

test("buildSchedule() emite segunda a sexta, mesmo com dia vazio", () => {
  assert.deepEqual(schedule.map(d => d.day), ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"]);
  assert.deepEqual(schedule.map(d => d.dayShort), ["SEG", "TER", "QUA", "QUI", "SEX"]);
});

test("buildSchedule() inclui sábado só quando há aula", () => {
  const comSabado = buildSchedule([
    { encId: "ENC-42", nome: "Redes de Computadores", cargaHoraria: 80,
      blocos: [{ dia: 7, turno: "M", slots: [1, 2] }] },
  ]);
  assert.deepEqual(comSabado.map(d => d.day),
    ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]);
  assert.deepEqual(descreve(comSabado[5]), ["Redes de Computadores 07:00–08:45 (2)"]);
});

test("slots não contíguos viram UM bloco, com a lacuna virando intervalo", () => {
  // 5N2456: falta o slot 3, mas a aula é contínua das 18:50 às 22:25.
  const [bloco] = buildSchedule([
    { encId: "ENC-40", nome: "Eletrônica I", cargaHoraria: 80,
      blocos: [{ dia: 5, turno: "N", slots: [2, 4, 5, 6] }] },
  ])[3].blocks;
  assert.equal(bloco.aulas, 4);
  assert.equal(fmtTime(bloco.start), "18:50");
  assert.equal(fmtTime(bloco.end), "22:25");
  assert.equal(bloco.intervals.length, 1);
});

test("lacuna menor que 15 min não vira intervalo", () => {
  // 2V12: 13:00–13:50 e 13:55–14:45, 5 min de folga — a UI não marca nada.
  const [bloco] = buildSchedule([
    { encId: "ENC-55", nome: "Laboratório de Circuitos Elétricos II", cargaHoraria: 40,
      blocos: [{ dia: 2, turno: "V", slots: [1, 2] }] },
  ])[0].blocks;
  assert.deepEqual(bloco.intervals, []);
});

test("a grade noturna sobreposta (N2 18:50 / N3 18:55) é respeitada", () => {
  // Duas disciplinas no mesmo dia e turno começando em slots de grades diferentes.
  assert.equal(toMin(...SLOT_TIMES.N[2]), toMin(18, 50));
  assert.equal(toMin(...SLOT_TIMES.N[3]), toMin(18, 55));
  // N4 fecha 2N34 às 20:30 e abre o intervalo de 5N2456 às 20:30.
  assert.equal(toMin(...SLOT_TIMES.N[4]) + 50, toMin(20, 30));
});

test("buildAttendanceMeta() traz carga horária e aulas/dia corretas", () => {
  const meta = buildAttendanceMeta(HORARIO_2026_2);
  const resumo = Object.fromEntries(
    Object.entries(meta).map(([id, m]) => [id, [m.cargaHoraria, m.aulasPorDia]])
  );
  assert.deepEqual(resumo, {
    "ENC-37": [80, 2],
    "ENC-55": [40, 2],
    "ENC-42": [80, 2],
    "ENC-39": [80, 4],
    "ENC-40": [80, 4],
    "ENC-56": [40, 2],
  });
});

test("aulasPorDia é o MAIOR nº de aulas num único dia, não o total da semana", () => {
  // ENC-42 tem 2 aulas na terça e 2 na quinta → 2/dia, não 4.
  assert.equal(buildAttendanceMeta(HORARIO_2026_2)["ENC-42"].aulasPorDia, 2);
});

test("buildAttendanceMeta() ignora disciplina sem carga horária legível", () => {
  const meta = buildAttendanceMeta([
    { encId: "ENC-42", nome: "Redes de Computadores", cargaHoraria: 0,
      blocos: [{ dia: 3, turno: "V", slots: [5, 6] }] },
  ]);
  assert.deepEqual(meta, {});
});

test("sem horário sincronizado, cai no fallback estático", () => {
  assert.equal(buildSchedule([]), SCHEDULE);
  assert.equal(buildSchedule(undefined), SCHEDULE);
  assert.equal(buildAttendanceMeta([]), ATTENDANCE_META);
  assert.equal(buildAttendanceMeta(null), ATTENDANCE_META);
});

test("buildSubjectColors() dá uma cor a cada disciplina, de forma estável", () => {
  const ids = schedule.flatMap(d => d.blocks.map(b => b.id));
  const cores = buildSubjectColors(ids);
  assert.deepEqual(Object.keys(cores).sort(), [
    "ENC-37", "ENC-39", "ENC-40", "ENC-42", "ENC-55", "ENC-56",
  ]);
  // Sem colisão entre as 6 (a paleta tem 10 entradas).
  assert.equal(new Set(Object.values(cores).map(c => c.bg)).size, 6);
  // Mesma entrada → mesma saída, independente da ordem de chegada.
  assert.deepEqual(buildSubjectColors([...ids].reverse()), cores);
});

test("mais disciplinas que cores: a paleta dá a volta sem quebrar", () => {
  const ids = Array.from({ length: 13 }, (_, i) => `ENC-${String(i + 1).padStart(2, "0")}`);
  const cores = buildSubjectColors(ids);
  assert.equal(Object.keys(cores).length, 13);
  assert.ok(Object.values(cores).every(c => c && c.bg));
});
