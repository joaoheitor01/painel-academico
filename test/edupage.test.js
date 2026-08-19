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
  assert.ok(todas.every(n => n.motivo === "ausente na grade"));
});

// ⚠ Só vale quando o nome é único NA GRADE INTEIRA. Na grade real do campus
// (1300+ aulas) quase toda disciplina aparece em várias turmas, e sem
// professor nada casa — conferido ao vivo. Por isso ?tab=locais_aula_aluno,
// que fornece o professor, é parte necessária do fluxo e não um extra.
test("nome único na grade resolve mesmo sem professor", () => {
  const semProf = MATRICULAS.map(m => ({ ...m, professor: "" }));
  const { horario: h } = casarHorario(semProf, grade);
  assert.deepEqual(h.map(x => x.encId).sort(), ["ENC-39", "ENC-40", "ENC-42", "ENC-55", "ENC-56"]);
});

test("disciplina em várias turmas: a turma do aluno desempata sem professor", () => {
  // Duas ofertas de Redes; só uma é da turma que o resto das disciplinas usa.
  const gradeAmbigua = [
    ...grade,
    { nome: "Redes de Computadores", professores: ["Outro Professor"],
      turmas: ["DCOM 7844.9 Engenh. Comput."],
      periodos: [{ dia: 6, inicio: 8 * 60, fim: 8 * 60 + 45 }] },
  ];
  const semProf = MATRICULAS.map(m => ({ ...m, professor: "" }));
  const { horario: h } = casarHorario(semProf, gradeAmbigua);
  const redes = h.find(x => x.encId === "ENC-42");
  assert.ok(redes, "Redes deveria ter sido resolvida pela turma");
  assert.match(redes.turma, /7844\.6/);
});

test("ambiguidade insolúvel é reportada, não chutada", () => {
  const gradeAmbigua = [
    { nome: "Redes de Computadores", professores: ["A A"], turmas: ["X 1"], periodos: [{ dia: 2, inicio: 780, fim: 825 }] },
    { nome: "Redes de Computadores", professores: ["B B"], turmas: ["Y 2"], periodos: [{ dia: 3, inicio: 780, fim: 825 }] },
  ];
  const { horario: h, naoEncontradas: ne } = casarHorario(
    [{ encId: "ENC-42", nome: "Redes de Computadores", professor: "", cargaHoraria: 80 }],
    gradeAmbigua
  );
  assert.deepEqual(h, []);
  assert.match(ne[0].motivo, /sem professor para desempatar/);
});

// ─── Regressão: a grade REAL do campus (2026/2) ────────────────────────────
// O fixture acima é podado e esconde o problema: nele cada nome é único, então
// tudo casa. Na grade publicada (1300+ aulas) NENHUMA das disciplinas do aluno
// tem nome único — e o painel mostrava "7 disciplinas fora da grade" enquanto
// elas estavam publicadas o tempo todo. Este bloco reconstrói essa situação.

const hm = (h, m = 0) => h * 60 + m;
/** Uma oferta como lerGrade() devolve, com os períodos já expandidos. */
const oferta = (nome, prof, turma, spans) => ({
  nome,
  professores: [prof],
  turmas: [turma],
  periodos: spans.map(([dia, ini, fim]) => ({ dia, inicio: ini, fim })),
});

const CAMPUS = [
  // Turma do aluno — DCOM 7844.6, 6º semestre de Engenharia de Computação.
  oferta("Laboratório de Circuitos Elétricos II", "Paulo Morais", "DCOM 7844.6 Engenh. Comput.", [[2, hm(13), hm(14, 30)]]),
  oferta("Análise e Projeto de Sistemas", "Evandro Freiberger", "DCOM 7844.6 Engenh. Comput.", [[2, hm(14, 30), hm(16, 20)], [3, hm(13), hm(14, 30)]]),
  oferta("Inteligência Artificial", "Juliana Antunes", "DCOM 7844.6 Engenh. Comput.", [[3, hm(14, 30), hm(16, 20)], [5, hm(13, 45), hm(15, 15)]]),
  oferta("Redes de Computadores", "Juliana Antunes", "DCOM 7844.6 Engenh. Comput.", [[3, hm(16, 20), hm(17, 50)], [5, hm(15, 35), hm(17, 5)]]),
  oferta("Circuitos Elétricos II", "Ronan Martins", "DCOM 7844.6 Engenh. Comput.", [[4, hm(13), hm(16, 20)]]),
  oferta("Eletrônica I", "Alberto Mascarenhas", "DCOM 7844.6 Engenh. Comput.", [[5, hm(18, 50), hm(20, 30)], [5, hm(20, 45), hm(22, 25)]]),
  // Outras turmas do próprio aluno: HCS é da 7844.9.
  oferta("Homem, Cultura e Sociedade", "Sandro Santos", "DCOM 7844.9 Engenh. Comput.", [[2, hm(18, 50), hm(20, 30)]]),
  // Equações Diferenciais: o aluno cursa a da Engenharia CIVIL, à noite.
  // Mesmo nome E mesmo professor da oferta da Computação — só o turno separa.
  oferta("Equações Diferenciais", "Jorge Monsalve", "DCOM 7844.4 Engenh. Comput.", [[3, hm(13), hm(14, 30)], [6, hm(14, 30), hm(16, 20)]]),
  oferta("Equações Diferenciais", "Jorge Monsalve", "DINFRA 0140063.4N Eng. Civil", [[6, hm(18, 50), hm(22, 25)]]),
  // Mesmas disciplinas ofertadas a outros cursos — o que quebra o nome único.
  oferta("Circuitos Elétricos II", "Outro Professor", "DEEA 6144.4 Eng. Controle e Automação", [[2, hm(7), hm(10, 20)]]),
  oferta("Circuitos Elétricos II", "Mais Um", "DEEA Eng. Elétrica 4º Sem", [[4, hm(18, 50), hm(22, 25)]]),
  oferta("Eletrônica I", "Outro Professor", "DEEA 6144.5I Eng. Controle e Automação", [[3, hm(7), hm(8, 30)]]),
  oferta("Laboratório de Circuitos Elétricos II", "Outro Professor", "DEEA 6144.4 Eng. Controle e Automação", [[5, hm(7), hm(8, 30)]]),
  oferta("Redes de Computadores", "Outro Professor", "DCOM 7342.3N Tecnol. Sis. Internet.", [[2, hm(20, 45), hm(22, 25)]]),
  oferta("Inteligência Artificial", "Outro Professor", "DEEA 6144.8I (Matriz Velha)", [[4, hm(7), hm(8, 30)]]),
  oferta("Homem, Cultura e Sociedade", "Outro Professor", "DEEA Eng. Elétrica 2º Sem", [[6, hm(7), hm(8, 30)]]),
  // Nome que CONTÉM o do aluno: não pode ser confundido com "Redes de
  // Computadores" — o casamento exato tem que ganhar do parcial.
  oferta("Fundamentos de Redes de Computadores", "Outro Professor", "DCOM 7131.2A Inform. Integ.", [[3, hm(7), hm(8, 30)]]),
];

// Como o SUAP entrega: nome por extenso e o código de horário (dia + turno).
const MATRICULAS_REAIS = [
  { encId: "ENC-37", nome: "Análise e Projeto de Sistemas Computacionais", professor: "Evandro Cesar Freiberger",     cargaHoraria: 80, blocos: [{ dia: 2, turno: "V", slots: [3, 4] }, { dia: 3, turno: "V", slots: [1, 2] }] },
  { encId: "ENC-55", nome: "Laboratório de Circuitos Elétricos II",        professor: "Paulo Henrique Correa de Morais", cargaHoraria: 40, blocos: [{ dia: 2, turno: "V", slots: [1, 2] }] },
  { encId: "ENC-42", nome: "Redes de Computadores",                        professor: "Juliana Fonseca Antunes",      cargaHoraria: 80, blocos: [{ dia: 3, turno: "V", slots: [5, 6] }, { dia: 5, turno: "V", slots: [5, 6] }] },
  { encId: "ENC-43", nome: "Inteligência Artificial",                      professor: "Juliana Fonseca Antunes",      cargaHoraria: 80, blocos: [{ dia: 3, turno: "V", slots: [3, 4] }, { dia: 5, turno: "V", slots: [1, 2] }] },
  { encId: "ENC-39", nome: "Circuitos Elétricos II",                       professor: "Ronan Marcelo Martins",        cargaHoraria: 80, blocos: [{ dia: 4, turno: "V", slots: [1, 2, 3, 4] }] },
  { encId: "ENC-40", nome: "Eletrônica I",                                 professor: "Alberto Willian Mascarenhas",  cargaHoraria: 80, blocos: [{ dia: 5, turno: "N", slots: [2, 4, 5, 6] }] },
  { encId: "ENC-56", nome: "Homem, Cultura e Sociedade",                   professor: "Sandro Aparecido Lima dos Santos", cargaHoraria: 40, blocos: [{ dia: 2, turno: "N", slots: [3, 4] }] },
  { encId: "ENC-99", nome: "Equações Diferenciais",                        professor: "Jorge Monsalve",               cargaHoraria: 80, blocos: [{ dia: 6, turno: "N", slots: [1, 2, 3, 4] }] },
];

test("grade real: as 8 disciplinas casam (antes só 1 casava)", () => {
  const { horario: h, naoEncontradas: ne } = casarHorario(MATRICULAS_REAIS, CAMPUS);
  assert.deepEqual(ne, [], `deveriam casar todas, faltaram: ${ne.map(n => `${n.nome} (${n.motivo})`).join(", ")}`);
  assert.equal(h.length, 8);
});

test("grade real: mesmo nome E mesmo professor — só o turno do SUAP separa", () => {
  const { horario: h } = casarHorario(MATRICULAS_REAIS, CAMPUS);
  const eq = h.find(x => x.encId === "ENC-99");
  assert.match(eq.turma, /Eng\. Civil/, "deveria pegar a oferta da Civil, sexta à noite");
  assert.deepEqual(eq.blocos.map(b => b.dia), [6]);
});

test("grade real: nome abreviado no EduPage casa com o do SUAP", () => {
  const { horario: h } = casarHorario(MATRICULAS_REAIS, CAMPUS);
  const ap = h.find(x => x.encId === "ENC-37");
  assert.ok(ap, "'Análise e Projeto de Sistemas' ≡ '... de Sistemas Computacionais'");
  assert.match(ap.turma, /7844\.6/);
});

test("grade real: 'Redes de Computadores' não vira 'Fundamentos de Redes...'", () => {
  const { horario: h } = casarHorario(MATRICULAS_REAIS, CAMPUS);
  const redes = h.find(x => x.encId === "ENC-42");
  assert.match(redes.turma, /7844\.6/);
});

test("grade real: uma disciplina resolvida já basta para descobrir a turma", () => {
  // Página de locais fora do ar: sem professor e sem código de horário.
  // Só Inteligência Artificial dá para resolver (turno inventado à parte),
  // e é dela que tem de sair a turma que destrava as demais.
  const semExtras = MATRICULAS_REAIS.map(m => ({ ...m, professor: "", blocos: [] }));
  const soUmaUnica = CAMPUS.filter(o => !(o.nome === "Inteligência Artificial" && /Matriz Velha/.test(o.turmas[0])));
  const { horario: h } = casarHorario(semExtras, soUmaUnica);
  const ids = h.map(x => x.encId).sort();
  assert.ok(ids.includes("ENC-43"), "IA tem nome único aqui e resolve sozinha");
  assert.ok(ids.includes("ENC-39"), "Circuitos II deveria vir pela turma da IA");
  assert.ok(ids.includes("ENC-42"), "Redes deveria vir pela turma da IA");
});
