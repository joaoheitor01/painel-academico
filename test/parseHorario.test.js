import test from "node:test";
import assert from "node:assert/strict";

import { parseHorarioPagina, parseCodigoHorario, encontrarId } from "../worker/suap-sync.js";
import { PAGINA_HORARIO_2026_2, HORARIO_2026_2 } from "./fixtures/horario.js";

test("parseCodigoHorario() entende <dia><turno><aulas> e múltiplos blocos", () => {
  assert.deepEqual(parseCodigoHorario("2V12"), [{ dia: 2, turno: "V", slots: [1, 2] }]);
  assert.deepEqual(parseCodigoHorario("4V1234"), [{ dia: 4, turno: "V", slots: [1, 2, 3, 4] }]);
  assert.deepEqual(parseCodigoHorario("5N2456"), [{ dia: 5, turno: "N", slots: [2, 4, 5, 6] }]);
  assert.deepEqual(parseCodigoHorario("2V34 / 3V12"), [
    { dia: 2, turno: "V", slots: [3, 4] },
    { dia: 3, turno: "V", slots: [1, 2] },
  ]);
});

test("parseCodigoHorario() ignora lixo sem quebrar", () => {
  assert.deepEqual(parseCodigoHorario(""), []);
  assert.deepEqual(parseCodigoHorario("A definir"), []);
  assert.deepEqual(parseCodigoHorario("2V12 / xx"), [{ dia: 2, turno: "V", slots: [1, 2] }]);
});

test("parseHorarioPagina() extrai as 6 disciplinas de 2026/2", () => {
  const horario = parseHorarioPagina(PAGINA_HORARIO_2026_2);
  assert.equal(horario.length, 6);
  assert.deepEqual(horario.map(d => d.encId).sort(), [
    "ENC-37", "ENC-39", "ENC-40", "ENC-42", "ENC-55", "ENC-56",
  ]);
});

test("parseHorarioPagina() reproduz exatamente o shape esperado do Worker", () => {
  const horario = parseHorarioPagina(PAGINA_HORARIO_2026_2);
  const porId = Object.fromEntries(horario.map(d => [d.encId, d]));
  for (const esperado of HORARIO_2026_2) {
    assert.deepEqual(porId[esperado.encId], esperado, `divergência em ${esperado.encId}`);
  }
});

test("cargaHoraria usa o nº de AULAS, não as horas de '[68 h/80 Aulas]'", () => {
  const porId = Object.fromEntries(parseHorarioPagina(PAGINA_HORARIO_2026_2).map(d => [d.encId, d]));
  assert.equal(porId["ENC-37"].cargaHoraria, 80); // 68 h / 80 aulas
  assert.equal(porId["ENC-55"].cargaHoraria, 40); // 34 h / 40 aulas
});

test("o nome perde o sufixo de modalidade e o bloco de carga horária", () => {
  const porId = Object.fromEntries(parseHorarioPagina(PAGINA_HORARIO_2026_2).map(d => [d.encId, d]));
  assert.equal(porId["ENC-37"].nome, "Análise e Projeto de Sistemas Computacionais");
  assert.equal(porId["ENC-56"].nome, "Homem, Cultura e Sociedade");
});

test("o match por código vence o match por nome", () => {
  // "Eletrônica I" e "Eletrônica Analógica I" são o mesmo componente (ENC-40).
  assert.equal(encontrarId("Eletrônica I", "Normal.2095"), "ENC-40");
  assert.equal(encontrarId("Eletrônica Analógica I", "Normal.7432"), "ENC-40");
  // Nome que não existe no mapa, mas com código conhecido → resolve pelo código.
  assert.equal(encontrarId("Análise e Proj. de Sist. Comp.", "Normal.7433"), "ENC-37");
});

test("código desconhecido cai no match por nome (o mapa é parcial)", () => {
  assert.equal(encontrarId("Redes de Computadores", "Normal.9999"), "ENC-42");
  assert.equal(encontrarId("Redes de Computadores", null), "ENC-42");
  // Componente fora da matriz do painel continua sendo descartado.
  assert.equal(encontrarId("Microcontroladores", "Normal.3021"), null);
});

test("linhas sem componente reconhecível não viram entrada", () => {
  const html = `
    <table>
      <tr><th>Diário</th><th>Componente</th></tr>
      <tr><td>99999</td><td>Normal.3021 - Microcontroladores - Graduação [68 h/80 Aulas]</td><td>Fulano</td><td>6V12</td></tr>
      <tr><td>total</td><td>sem código aqui</td></tr>
    </table>`;
  assert.deepEqual(parseHorarioPagina(html), []);
});
