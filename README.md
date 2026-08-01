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

`worker/suap-sync.js` é um Cloudflare Worker stateless. O aluno informa
matrícula e senha, e o sync roda nesta ordem:

1. **Login no SUAP.**
2. **Boletim (`?tab=boletim`)** — varre todos os períodos letivos, do mais novo
   para o mais antigo (`first-write-wins`), produzindo `faltas`,
   `statusOverrides` e `notas`. O boletim do período **ativo** também define
   *quais disciplinas o aluno cursa agora*: nome, código (`Normal.7433`),
   diário e carga horária.
3. **`?tab=locais_aula_aluno`** — complemento opcional: acrescenta o
   **professor** de cada diário.
4. **`ifmtcba.edupage.org`** — a grade oficial do campus define os **horários**,
   e somente eles (`worker/edupage.js`).

O componente é casado primeiro pelo **código estável** (`Normal.7433`) e só
depois pelo nome, que varia entre semestres.

### Por que o horário não vem do SUAP

Os códigos do SUAP (`3V56`) só dizem dia, turno e nº da aula. Converter isso em
horário de relógio exige a grade de sinos do campus, e a que circula erra: as
aulas do vespertino são de 45 min, não 50. Redes de Computadores na quinta é
**15:35–17:05**, não 16:55–18:40 — 1h20 de diferença.

O EduPage publica os sinos reais, é público (sem login) e traz turma e
professor, o que permite casar a disciplina com segurança. O `tt_num` da grade
é descoberto a cada sync e **nunca chumbado**: entre 29 e 30/07/2026 saíram
três versões, e uma delas moveu uma disciplina de segunda para sexta.

Disciplina que a grade oficial não publicou fica **fora** do horário — mas é
devolvida em `horarioMeta.naoEncontradas` e mostrada na tela. Nunca é
descartada em silêncio.

Não existe horário chumbado no repo: sem sync, a aba Horário convida a
sincronizar. Um snapshot versionado seria o horário de uma pessoa exibido a
todos os colegas, e desatualizaria em dias.

### Deploy

```bash
npm run deploy          # site → gh-pages
npm run deploy:worker   # Cloudflare Worker (exige `wrangler login`)
npm run worker:check    # valida o bundle do Worker sem publicar
```

Sem o redeploy do Worker, o próximo sync sobrescreve o `localStorage` com o
parsing antigo e parece que nada mudou.

## Testes

`npm test` (runner nativo do Node, sem dependência extra). Os fixtures em
`test/fixtures/` são páginas reais do SUAP; cobrem o mapeamento nome/código →
ID, o parsing do boletim e a montagem do horário.
- `AuthScreen.jsx` é a tela de login/criação de conta exibida antes de acessar
  o painel.
