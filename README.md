# painel-academico

Painel acadêmico para a grade de Engenharia de Computação do IFMT.

- `AcademicDashboard.jsx` organiza disciplinas por ano letivo e status.
- Exibe histórico de matérias concluídas, atualização das que estão cursando e um fluxo de planejamento para as próximas etapas.
- Inclui cálculo de faltas, horário e análise de dependências entre disciplinas.

## Contas e privacidade dos dados

O painel agora suporta múltiplas pessoas (colegas de curso), cada uma com sua
própria conta local:

- `auth.js` cuida de criar contas e login. As senhas **nunca** são salvas em
  texto puro: cada conta guarda um salt aleatório e o hash SHA-256
  (`salt + senha`), gerado com a Web Crypto API do navegador.
- `userData.js` salva o progresso (status de cada disciplina) e as faltas de
  cada conta em uma chave isolada do `localStorage`
  (`painel-academico:data:<usuario>`), para que os dados de um colega nunca
  apareçam para outro.
- Tudo é armazenado **apenas no navegador** — nada é enviado para um servidor.
  Isso significa que os dados ficam restritos ao dispositivo/navegador usado
  e podem ser perdidos se o `localStorage` for limpo.
- `curriculumData.js` contém a grade curricular compartilhada (disciplinas,
  pré-requisitos) e as funções puras que montam o horário. Cada usuário pode
  marcar seu próprio progresso (Concluída / Cursando / Próxima / Futura)
  através do botão **"Editar progresso"**, sem afetar os dados de outros
  colegas.

## Sincronização com o SUAP

`worker/suap-sync.js` é um Cloudflare Worker stateless que faz login no SUAP
com as credenciais do aluno e devolve quatro campos: `faltas`,
`statusOverrides`, `notas` e `horario`.

- **Notas e faltas** vêm da aba `?tab=boletim`, varrida de todos os períodos
  letivos (do mais novo para o mais antigo, `first-write-wins`).
- **Horário e carga horária** vêm da aba `?tab=locais_aula_aluno` — por aluno.
  `buildSchedule()` e `buildAttendanceMeta()` convertem os códigos do SUAP
  (`2V34 / 3V12`) em blocos com horário e intervalos. O `SCHEDULE` estático em
  `curriculumData.js` só é usado como fallback para contas que ainda não
  sincronizaram.
- O componente é casado primeiro pelo **código estável** (`Normal.7433`) e só
  depois pelo nome, que varia entre semestres.

Deploy do Worker: `cd worker && wrangler deploy`. Sem redeploy, o próximo sync
sobrescreve o `localStorage` com o parsing antigo.

## Testes

`npm test` (runner nativo do Node, sem dependência extra). Os fixtures em
`test/fixtures/` são páginas reais do SUAP; cobrem o mapeamento nome/código →
ID, o parsing do boletim e a montagem do horário.
- `AuthScreen.jsx` é a tela de login/criação de conta exibida antes de acessar
  o painel.
