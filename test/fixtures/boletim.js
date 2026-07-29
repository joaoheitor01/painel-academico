// Fixtures reais do boletim do SUAP (aluno 2024178440032, extraídos em 29/07/2026).
// Só as colunas relevantes estão preenchidas; o resto vai como "-" (o parser lê
// cells[7] p1, cells[9] média, cells[10] AF, cells[12] MFD).
//
// ⚠ ORDEM DAS COLUNAS — cells[3] é "Total de Aulas", cells[4] é "Total de Faltas".
// Em 2026/2 o ENC-37 tem 2 aulas dadas e ZERO faltas; ler cells[3] inventaria uma
// falta que não existe.

const N_COLS = 14;

/** Monta um <tr> com 14 <td>, preenchendo por índice a partir de um objeto. */
function linha(cols) {
  const cells = Array.from({ length: N_COLS }, (_, i) => cols[i] ?? "-");
  return `<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`;
}

/** Envolve as linhas numa tabela, com um <th> de cabeçalho (deve ser ignorado). */
export function tabela(linhas) {
  const head =
    "<tr>" +
    ["#", "Componente", "CH", "Aulas", "Faltas", "Freq.", "Situação"]
      .map((h) => `<th>${h}</th>`)
      .join("") +
    "</tr>";
  return `<table>${head}${linhas.map(linha).join("")}</table>`;
}

// ─── 2026/2 — período ATIVO (isPeriodoAtivo = true) ────────────────────────
// c0 diário · c1 componente · c2 carga · c3 total de aulas · c4 total de faltas
// c5 frequência · c6 situação
export const BOLETIM_2026_2 = tabela([
  { 0: "61479", 1: "Normal.7433 - Análise e Projeto de Sistemas Computacionais", 2: "80 aulas", 3: "2", 4: "0", 5: "100%", 6: "Cursando" },
  { 0: "61570", 1: "Normal.3009 - Circuitos Elétricos II",                       2: "80 aulas", 3: "0", 4: "0", 5: "100%", 6: "Cursando" },
  { 0: "61576", 1: "Normal.2095 - Eletrônica I",                                 2: "80 aulas", 3: "0", 4: "0", 5: "100%", 6: "Cursando" },
  { 0: "62785", 1: "Normal.0935 - Homem, Cultura e Sociedade",                   2: "40 aulas", 3: "0", 4: "0", 5: "100%", 6: "Cursando" },
  { 0: "61481", 1: "Normal.3010 - Laboratório de Circuitos Elétricos II",        2: "40 aulas", 3: "0", 4: "0", 5: "100%", 6: "Cursando" },
  { 0: "61482", 1: "Normal.1367 - Redes de Computadores",                        2: "80 aulas", 3: "2", 4: "0", 5: "100%", 6: "Cursando" },
]);

// ─── 2026/1 — histórico (isPeriodoAtivo = false) ───────────────────────────
// Equações Diferenciais usa a forma ABREVIADA "Reprov. por Falta", que não
// contém "reprovado" — era por isso que o filtro antigo não pegava.
export const BOLETIM_2026_1 = tabela([
  { 1: "Normal.1294 - Cálculo Numérico",                        4: "18", 6: "Aprovado" },
  { 1: "Normal.1654 - Equações Diferenciais",                   4: "28", 6: "Reprov. por Falta" },
  { 1: "Normal.2185 - Programação WEB",                         4: "20", 6: "Reprovado" },
  { 1: "Normal.7430 - Laboratório de Circuitos Elétricos I",    4: "0",  6: "Aprovado" },
]);
