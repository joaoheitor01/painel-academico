import test from "node:test";
import assert from "node:assert/strict";

import { parseBoletimPagina } from "../worker/suap-sync.js";
import { BOLETIM_2026_2, BOLETIM_2026_1 } from "./fixtures/boletim.js";

/** Roda o sync na mesma ordem do Worker: mais novo → mais antigo. */
function sync() {
  const faltas = {};
  const statusOverrides = {};
  const notas = {};
  parseBoletimPagina(BOLETIM_2026_2, faltas, statusOverrides, notas, true);
  parseBoletimPagina(BOLETIM_2026_1, faltas, statusOverrides, notas, false);
  return { faltas, statusOverrides, notas };
}

const idsCom = (overrides, status) =>
  Object.keys(overrides).filter((id) => overrides[id] === status).sort();

test("2026/2 (período ativo): as 6 disciplinas viram 'current'", () => {
  const { statusOverrides } = sync();
  assert.deepEqual(idsCom(statusOverrides, "current"), [
    "ENC-37", "ENC-39", "ENC-40", "ENC-42", "ENC-55", "ENC-56",
  ]);
});

test("Lab. de Circuitos II é ENC-55 e não sobrescreve o Lab. I (ENC-32)", () => {
  const { statusOverrides } = sync();
  // O bug antigo: Lab. II casava a chave do Lab. I por prefixo, gravava ENC-32
  // como "current" e, por first-write-wins, o "done" real de 2026/1 era perdido.
  assert.equal(statusOverrides["ENC-55"], "current");
  assert.equal(statusOverrides["ENC-32"], "done");
});

test("reprovações de 2026/1 viram 'next' — inclusive a forma abreviada de falta", () => {
  const { statusOverrides } = sync();
  assert.deepEqual(idsCom(statusOverrides, "next"), ["ENC-22", "ENC-30"]);
  assert.equal(statusOverrides["ENC-22"], "next"); // "Reprov. por Falta"
  assert.equal(statusOverrides["ENC-30"], "next"); // "Reprovado"
});

test("aprovações de 2026/1 viram 'done'", () => {
  const { statusOverrides } = sync();
  assert.deepEqual(idsCom(statusOverrides, "done"), ["ENC-24", "ENC-32"]);
});

test("nenhuma falta é inventada — cells[4] é Faltas, cells[3] é Total de Aulas", () => {
  const { faltas } = sync();
  // ENC-37 e ENC-42 têm c3=2 (2 aulas dadas) e c4=0. Ler a coluna errada daria 2.
  assert.equal(faltas["ENC-37"], 0);
  assert.equal(faltas["ENC-42"], 0);
  for (const [id, n] of Object.entries(faltas)) {
    assert.equal(n, 0, `${id} deveria ter 0 faltas, veio ${n}`);
  }
});

test("reprovada não carrega notas nem faltas do estado anterior", () => {
  const { faltas, notas } = sync();
  assert.equal(faltas["ENC-22"], 0);
  assert.equal(notas["ENC-22"], undefined);
  assert.equal(notas["ENC-30"], undefined);
});

test("first-write-wins: o período ativo tem precedência sobre o histórico", () => {
  const { statusOverrides } = sync();
  // Nenhuma das 6 de 2026/2 pode ser rebaixada por uma página mais antiga.
  for (const id of ["ENC-37", "ENC-39", "ENC-40", "ENC-42", "ENC-55", "ENC-56"]) {
    assert.equal(statusOverrides[id], "current");
  }
});

test("só as disciplinas dos fixtures são tocadas", () => {
  const { statusOverrides } = sync();
  // 6 cursando + 2 reprovadas + 2 aprovadas. As outras 32 "done" do resultado
  // final (34 no total) vêm dos 4 períodos anteriores, que não estão no fixture.
  assert.equal(Object.keys(statusOverrides).length, 10);
});
