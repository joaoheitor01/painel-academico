import test from "node:test";
import assert from "node:assert/strict";

import { parseBoletimPagina } from "../worker/suap-sync.js";
import { BOLETIM_2026_2, BOLETIM_2026_1 } from "./fixtures/boletim.js";

/** O boletim do período ativo é a fonte de "o que eu curso agora". */
function cursandoDoBoletim() {
  const cursando = [];
  parseBoletimPagina(BOLETIM_2026_2, {}, {}, {}, true, cursando);
  return cursando;
}

test("o boletim ativo entrega as 6 disciplinas com nome, código e carga horária", () => {
  const cursando = cursandoDoBoletim();
  assert.equal(cursando.length, 6);

  const porId = Object.fromEntries(cursando.map(c => [c.encId, c]));
  assert.deepEqual(porId["ENC-37"], {
    encId: "ENC-37",
    codigo: "Normal.7433",
    nome: "Análise e Projeto de Sistemas Computacionais",
    diario: "61479",
    cargaHoraria: 80,
    professor: "",
  });
  assert.deepEqual(porId["ENC-56"], {
    encId: "ENC-56",
    codigo: "Normal.0935",
    nome: "Homem, Cultura e Sociedade",
    diario: "62785",
    cargaHoraria: 40,
    professor: "",
  });
});

test("a carga horária sai da coluna de aulas do próprio boletim", () => {
  const porId = Object.fromEntries(cursandoDoBoletim().map(c => [c.encId, c.cargaHoraria]));
  assert.deepEqual(porId, {
    "ENC-37": 80, "ENC-39": 80, "ENC-40": 80,
    "ENC-56": 40, "ENC-55": 40, "ENC-42": 80,
  });
});

test("período histórico não entra na lista de cursando", () => {
  const cursando = [];
  parseBoletimPagina(BOLETIM_2026_1, {}, {}, {}, false, cursando);
  assert.deepEqual(cursando, []);
});

test("reprovada do período ativo não entra como cursando", () => {
  const cursando = [];
  const linha = (cols) => {
    const cells = Array.from({ length: 14 }, (_, i) => cols[i] ?? "-");
    return `<tr>${cells.map(c => `<td>${c}</td>`).join("")}</tr>`;
  };
  const html = `<table>${linha({
    0: "99999", 1: "Normal.2185 - Programação WEB", 2: "60 aulas",
    3: "40", 4: "20", 5: "66%", 6: "Reprov. por Falta",
  })}</table>`;
  parseBoletimPagina(html, {}, {}, {}, true, cursando);
  assert.deepEqual(cursando, []);
});

test("o coletor é opcional — chamadas antigas seguem funcionando", () => {
  const faltas = {}, statusOverrides = {}, notas = {};
  assert.doesNotThrow(() => parseBoletimPagina(BOLETIM_2026_2, faltas, statusOverrides, notas, true));
  assert.equal(Object.keys(statusOverrides).length, 6);
});
