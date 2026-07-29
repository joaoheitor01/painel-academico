import test from "node:test";
import assert from "node:assert/strict";

import { encontrarId, matchComLimite } from "../worker/suap-sync.js";

// Os pares I/II eram exatamente o que quebrava: o fallback por substring casava
// prefixo, então "…Elétricos II" era resolvido pela chave "…elétricos i".
const CASOS = [
  ["Análise e Projeto de Sistemas Computacionais", "ENC-37"],
  ["Análise e Proj. de Sistemas Computacionais",   "ENC-37"],
  ["Laboratório de Circuitos Elétricos II",        "ENC-55"], // antes retornava ENC-32
  ["Laboratório de Circuitos Elétricos I",         "ENC-32"],
  ["Circuitos Elétricos II",                       "ENC-39"],
  ["Circuitos Elétricos I",                        "ENC-35"],
  ["Eletrônica I",                                 "ENC-40"],
  ["Eletrônica Analógica I",                       "ENC-40"],
  ["Homem, Cultura e Sociedade",                   "ENC-56"],
  ["Redes de Computadores",                        "ENC-42"],
  ["Algoritmos II",                                "ENC-08"],
  ["Algoritmos I",                                 "ENC-02"],
  ["Extensão III",                                 "ENC-44"],
  ["Física Geral e Experimental III",              "ENC-21"],
  ["Cálculo Diferencial e Integral II",            "ENC-13"],
  ["Segurança do Trabalho",                        "ENC-18"],
];

test("encontrarId() resolve os nomes do SUAP para os IDs do painel", () => {
  for (const [nome, esperado] of CASOS) {
    assert.equal(encontrarId(nome), esperado, `"${nome}" deveria virar ${esperado}`);
  }
});

test("encontrarId() é insensível a acento, caixa e espaço extra", () => {
  assert.equal(encontrarId("  ELETRONICA   I  "), "ENC-40");
  assert.equal(encontrarId("Equacoes Diferenciais"), "ENC-22");
});

test("encontrarId() devolve null para componente fora da matriz", () => {
  // Microcontroladores e Controle de Sistemas existem no SUAP mas não no painel.
  assert.equal(encontrarId("Microcontroladores"), null);
  assert.equal(encontrarId("Controle de Sistemas"), null);
});

// FIX 2 — a raiz do bug do Lab. II, isolada.
test("matchComLimite() não aceita match de prefixo sem limite de palavra", () => {
  const lab2 = "laboratorio de circuitos eletricos ii";
  assert.equal(matchComLimite(lab2, "laboratorio de circuitos eletricos i"), false);
  assert.equal(matchComLimite(lab2, "laboratorio de circuitos eletricos ii"), true);

  assert.equal(matchComLimite("circuitos eletricos ii", "circuitos eletricos i"), false);
  assert.equal(matchComLimite("algoritmos ii", "algoritmos i"), false);
  assert.equal(matchComLimite("extensao iii", "extensao ii"), false);
});

test("matchComLimite() aceita a chave delimitada no meio do texto", () => {
  assert.equal(matchComLimite("normal.1367 redes de computadores", "redes de computadores"), true);
  assert.equal(matchComLimite("redes de computadores - graduacao", "redes de computadores"), true);
});
