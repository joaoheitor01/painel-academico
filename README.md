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
  pré-requisitos, horário, controle de frequência). Cada usuário pode marcar
  seu próprio progresso (Concluída / Cursando / Próxima / Futura) através do
  botão **"Editar progresso"**, sem afetar os dados de outros colegas.
- `AuthScreen.jsx` é a tela de login/criação de conta exibida antes de acessar
  o painel.
