// Fixture real da aba "Locais e Horários de Aula" do SUAP
// (GET /edu/aluno/2024178440032/?tab=locais_aula_aluno, 2026/2, 29/07/2026).
//
// A tabela "Diários" tem uma linha por disciplina. As colunas são identificadas
// por FORMATO no parser, não por posição — por isso o fixture inclui uma coluna
// extra de sala, que o SUAP mostra em algumas versões da página.

const LINHAS = [
  ["61479", "Normal.7433 - Análise e Projeto de Sistemas Computacionais - Graduação [68 h/80 Aulas]", "Evandro Cesar Freiberger",         "2V34 / 3V12"],
  ["61481", "Normal.3010 - Laboratório de Circuitos Elétricos II - Graduação [34 h/40 Aulas]",        "Paulo Henrique Correa de Morais",  "2V12"],
  ["61482", "Normal.1367 - Redes de Computadores - Graduação [68 h/80 Aulas]",                        "Juliana Fonseca Antunes",          "3V56 / 5V56"],
  ["61570", "Normal.3009 - Circuitos Elétricos II - Graduação [68 h/80 Aulas]",                       "Ronan Marcelo Martins",            "4V1234"],
  ["61576", "Normal.2095 - Eletrônica I - Graduação [68 h/80 Aulas]",                                 "Alberto Willian Mascarenhas",      "5N2456"],
  ["62785", "Normal.0935 - Homem, Cultura e Sociedade - Graduação [34 h/40 Aulas]",                   "Sandro Aparecido Lima dos Santos", "2N34"],
];

export const PAGINA_HORARIO_2026_2 = `
<h4>Diários</h4>
<table class="diarios">
  <thead>
    <tr><th>Diário</th><th>Componente</th><th>Professor</th><th>Horário</th><th>Local</th></tr>
  </thead>
  <tbody>
    ${LINHAS.map(
      ([diario, comp, prof, hor]) =>
        `<tr><td>${diario}</td><td><a href="#">${comp}</a></td><td>${prof}</td><td>${hor}</td><td>Bloco C</td></tr>`
    ).join("\n    ")}
  </tbody>
</table>
`;

// Mesmo período, já no formato que o Worker devolve — entrada de buildSchedule
// e buildAttendanceMeta nos testes que não dependem do parsing de HTML.
export const HORARIO_2026_2 = [
  { diario: "61479", codigo: "Normal.7433", encId: "ENC-37", nome: "Análise e Projeto de Sistemas Computacionais", professor: "Evandro Cesar Freiberger",        cargaHoraria: 80, blocos: [{ dia: 2, turno: "V", slots: [3,4] }, { dia: 3, turno: "V", slots: [1,2] }] },
  { diario: "61481", codigo: "Normal.3010", encId: "ENC-55", nome: "Laboratório de Circuitos Elétricos II",        professor: "Paulo Henrique Correa de Morais", cargaHoraria: 40, blocos: [{ dia: 2, turno: "V", slots: [1,2] }] },
  { diario: "61482", codigo: "Normal.1367", encId: "ENC-42", nome: "Redes de Computadores",                        professor: "Juliana Fonseca Antunes",         cargaHoraria: 80, blocos: [{ dia: 3, turno: "V", slots: [5,6] }, { dia: 5, turno: "V", slots: [5,6] }] },
  { diario: "61570", codigo: "Normal.3009", encId: "ENC-39", nome: "Circuitos Elétricos II",                       professor: "Ronan Marcelo Martins",           cargaHoraria: 80, blocos: [{ dia: 4, turno: "V", slots: [1,2,3,4] }] },
  { diario: "61576", codigo: "Normal.2095", encId: "ENC-40", nome: "Eletrônica I",                                 professor: "Alberto Willian Mascarenhas",     cargaHoraria: 80, blocos: [{ dia: 5, turno: "N", slots: [2,4,5,6] }] },
  { diario: "62785", codigo: "Normal.0935", encId: "ENC-56", nome: "Homem, Cultura e Sociedade",                   professor: "Sandro Aparecido Lima dos Santos", cargaHoraria: 40, blocos: [{ dia: 2, turno: "N", slots: [3,4] }] },
];
