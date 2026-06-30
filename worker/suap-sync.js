// ─── suap-sync.js ──────────────────────────────────────────────────────────
// Cloudflare Worker: proxy de login no SUAP (IFMT) + extração do boletim.
// Stateless — não loga matricula, senha ou cookies em nenhum momento.

const ALLOWED_ORIGIN = "https://joaoheitor01.github.io";
const SUAP_BASE = "https://suap.ifmt.edu.br";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function respJson(status, data, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
      ...extraHeaders,
    },
  });
}

// ─── Mapeamento nome (SUAP) → ID (painel) ──────────────────────────────────
// Chaves cobrem todos os DEFAULT_SUBJECTS de curriculumData.js. São
// normalizadas (sem acento, sem parênteses) na carga do módulo, abaixo.
const NOME_PARA_ID_RAW = {
  "fundamentos da matemática": "ENC-01",
  "algoritmos i": "ENC-02",
  "introdução à engenharia da computação": "ENC-03",
  "desenho técnico em ambiente computacional": "ENC-04",
  "química geral e ciência dos materiais": "ENC-05",
  "metodologia científica": "ENC-06",
  "cálculo diferencial e integral i": "ENC-07",
  "algoritmos ii": "ENC-08",
  "física geral e experimental i": "ENC-09",
  "probabilidade e estatística": "ENC-10",
  "introdução à extensão": "ENC-11",
  "ética profissional": "ENC-12",
  "cálculo diferencial e integral ii": "ENC-13",
  "estruturas de dados": "ENC-14",
  "física geral e experimental ii": "ENC-15",
  "cálculo vetorial e geometria analítica": "ENC-16",
  "matemática discreta e teoria dos grafos": "ENC-17",
  "saúde e segurança do trabalho": "ENC-18",
  "banco de dados": "ENC-19",
  "programação orientada a objetos": "ENC-20",
  "física geral e experimental iii": "ENC-21",
  "equações diferenciais": "ENC-22",
  "álgebra linear": "ENC-23",
  "cálculo numérico": "ENC-24",
  "arquitetura e organização de computadores": "ENC-25",
  "eletrônica digital": "ENC-26",
  "economia": "ENC-27",
  "ciências do ambiente": "ENC-28",
  "compiladores": "ENC-29",
  "programação web": "ENC-30",
  "sistemas operacionais": "ENC-31",
  "laboratório de circuitos elétricos i": "ENC-32",
  "extensão i": "ENC-33",
  "engenharia de software": "ENC-34",
  "circuitos elétricos i": "ENC-35",
  "transmissão e comunicação de dados": "ENC-36",
  "análise e proj. de sistemas computacionais": "ENC-37",
  "extensão ii": "ENC-38",
  "circuitos elétricos ii": "ENC-39",
  "eletrônica analógica i": "ENC-40",
  "sinais e sistemas lineares": "ENC-41",
  "redes de computadores": "ENC-42",
  "inteligência artificial": "ENC-43",
  "extensão iii": "ENC-44",
  "eletrônica analógica ii": "ENC-45",
  "processamento digital de sinais": "ENC-46",
  "sistemas embarcados": "ENC-47",
  "segurança computacional": "ENC-48",
  "extensão iv": "ENC-49",
  "projeto integrador i": "ENC-50",
  "visão computacional": "ENC-51",
  "internet das coisas": "ENC-52",
  "extensão v": "ENC-53",
  "trabalho de conclusão de curso": "ENC-54",
};

const DIACRITIC_MIN = 0x0300;
const DIACRITIC_MAX = 0x036f;

function removerAcentos(str) {
  let out = "";
  for (const ch of str) {
    const code = ch.codePointAt(0);
    if (code < DIACRITIC_MIN || code > DIACRITIC_MAX) out += ch;
  }
  return out;
}

function normalizar(str) {
  return removerAcentos(str.toLowerCase().normalize("NFD"))
    .replace(/\s*\(.*?\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const NOME_PARA_ID = Object.fromEntries(
  Object.entries(NOME_PARA_ID_RAW).map(([k, v]) => [normalizar(k), v])
);

function encontrarId(nomeSuap) {
  const normalizado = normalizar(nomeSuap);
  // 1. Lookup exato
  if (NOME_PARA_ID[normalizado]) return NOME_PARA_ID[normalizado];
  // 2. Fallback substring (chave mais longa que bate ganha, evita ambiguidade)
  let melhorChave = "";
  let melhorId = null;
  for (const [chave, id] of Object.entries(NOME_PARA_ID)) {
    if (normalizado.includes(chave) && chave.length > melhorChave.length) {
      melhorChave = chave;
      melhorId = id;
    }
  }
  return melhorId;
}

// ─── Mapeamento situação (SUAP) → status (painel) ──────────────────────────
// "done": disciplina integralizada (aprovada, dispensada, aproveitada).
const SITUACOES_DONE = ["aprovado", "dispensado", "aproveitamento", "concluído", "cumprida"];
// "current": disciplina ativa no período (em curso ou ainda em definição).
const SITUACOES_CURRENT = ["cursando", "andamento", "prova final", "segunda chamada", "exame final", "matriculado"];
// Qualquer "reprovado *" (por nota/falta) ou situação desconhecida → NÃO altera:
// o Worker não sabe se o aluno vai cursar de novo, então deixa o usuário decidir.

// ─── Descoberta dos períodos letivos (<select id="ano_periodo">) ───────────
// O boletim do SUAP mostra UM período por vez (default = atual). Os demais
// ficam nas <option> de um <select>, navegáveis via ?ano_periodo=YYYY_S.
export function extrairPeriodos(html) {
  const sel = html.match(/<select[^>]*id="ano_periodo"[\s\S]*?<\/select>/i)?.[0] || "";
  const periodos = [];
  const optRegex = /<option[^>]*value="([^"]+)"/gi;
  let m;
  while ((m = optRegex.exec(sel)) !== null) {
    if (m[1]) periodos.push(m[1]);
  }
  return periodos; // ex.: ["2026_1","2025_2","2025_1","2024_2","2024_1"]
}

// ─── Parsing de UMA página de boletim (sem DOM disponível no Worker) ───────
// Acumula em faltas/statusOverrides. first-write-wins: como as páginas são
// varridas do período MAIS NOVO para o mais antigo, o estado mais recente de
// cada disciplina prevalece (ex.: reprovou e depois foi aprovado → "done").
export function parseBoletimPagina(html, faltas, statusOverrides) {
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const stripTagsRegex = /<[^>]+>/g;

  let rowMatch;
  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1];
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi; // recriado por linha — regex global não pode ser reusado entre strings diferentes
    const cells = [];
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      // colapsa quebras de linha/indentação do HTML (ex.: nome em "Normal.1294\n  - Cálculo Numérico")
      cells.push(cellMatch[1].replace(stripTagsRegex, "").replace(/\s+/g, " ").trim());
    }

    if (cells.length < 7) continue; // precisa de cols[0..6]; pula cabeçalho/tfoot/linhas vazias

    // Coluna [1]: nome da disciplina (remove prefixo "Normal.XXXX - ")
    const nomeBruto = cells[1] || "";
    const nome = nomeBruto.includes(" - ")
      ? nomeBruto.split(" - ").pop().trim()
      : nomeBruto.trim();
    if (!nome) continue;

    const encId = encontrarId(nome);
    if (!encId) continue;
    if (encId in statusOverrides) continue; // first-write-wins (período mais novo já decidiu)

    // Coluna [4]: total de faltas | Coluna [6]: situação
    const faltasNum = parseInt((cells[4] || "0").replace(/\D/g, "") || "0", 10);
    const situacao = (cells[6] || "").toLowerCase().trim();

    if (SITUACOES_DONE.some(s => situacao.includes(s))) {
      statusOverrides[encId] = "done";
    } else if (SITUACOES_CURRENT.some(s => situacao.includes(s))) {
      statusOverrides[encId] = "current";
      faltas[encId] = faltasNum;
    }
    // reprovado / desconhecido → não altera
  }
}

// ─── Cookie jar ─────────────────────────────────────────────────────────────
// O SUAP usa o esquema de cookies com prefixo "__Host-" (ex.: __Host-csrftoken,
// __Host-sessionid), não os nomes simples "csrftoken"/"sessionid". Por isso
// mantemos um jar que repassa TODOS os cookies recebidos entre requisições
// (igual ao requests.Session do Python), e localizamos os que precisamos
// por sufixo do nome em vez de assumir o nome exato.
function mergeCookies(jar, setCookies) {
  for (const c of setCookies) {
    const pair = c.split(";")[0];
    const eq = pair.indexOf("=");
    if (eq === -1) continue;
    jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
  }
}

function cookieHeader(jar) {
  return Array.from(jar.entries()).map(([k, v]) => `${k}=${v}`).join("; ");
}

function findCookieValue(jar, suffix) {
  for (const [name, value] of jar) {
    if (name.endsWith(suffix)) return value;
  }
  return null;
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (request.method !== "POST") {
      return respJson(405, { erro: "método não permitido" });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return respJson(400, { erro: "corpo da requisição inválido" });
    }

    const { matricula, senha } = body || {};
    if (!matricula || !senha) {
      return respJson(400, { erro: "matricula e senha são obrigatórios" });
    }

    const jar = new Map();

    try {
      // STEP A — GET csrftoken
      const loginUrl = `${SUAP_BASE}/accounts/login/`;
      const loginPage = await fetch(loginUrl, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      mergeCookies(jar, loginPage.headers.getSetCookie());
      const csrfToken = findCookieValue(jar, "csrftoken");

      const html = await loginPage.text();
      const csrfMiddleware = html.match(/name="csrfmiddlewaretoken" value="([^"]+)"/)?.[1];

      if (!csrfToken || !csrfMiddleware) {
        return respJson(502, { erro: "falha ao obter CSRF" });
      }

      // STEP B — POST login
      const loginBody = new URLSearchParams({
        username: matricula,
        password: senha,
        csrfmiddlewaretoken: csrfMiddleware,
        next: "/",
      });

      const loginResp = await fetch(loginUrl, {
        method: "POST",
        redirect: "manual",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Cookie": cookieHeader(jar),
          "Referer": loginUrl,
          "User-Agent": "Mozilla/5.0",
        },
        body: loginBody.toString(),
      });

      if (loginResp.status !== 302) {
        return respJson(401, { erro: "credenciais inválidas" });
      }

      mergeCookies(jar, loginResp.headers.getSetCookie());
      const sessionId = findCookieValue(jar, "sessionid");

      if (!sessionId) {
        return respJson(502, { erro: "sessionid não encontrado" });
      }

      // STEP C — Fetch boletim do período atual + descobrir todos os períodos
      const headersBoletim = { "Cookie": cookieHeader(jar), "User-Agent": "Mozilla/5.0" };
      const baseUrl = `${SUAP_BASE}/edu/aluno/${encodeURIComponent(matricula)}/?tab=boletim`;

      const primeiraResp = await fetch(baseUrl, { headers: headersBoletim });
      const primeiroHtml = await primeiraResp.text();
      const periodos = extrairPeriodos(primeiroHtml);

      // STEP D — parseBoletim de TODOS os períodos (mais novo → mais antigo)
      const faltas = {};
      const statusOverrides = {};

      if (periodos.length === 0) {
        // Sem seletor de períodos: parseia ao menos a página atual.
        parseBoletimPagina(primeiroHtml, faltas, statusOverrides);
      } else {
        for (const p of periodos) {
          const url = `${baseUrl}&ano_periodo=${encodeURIComponent(p)}`;
          const resp = await fetch(url, { headers: headersBoletim });
          const html = await resp.text();
          parseBoletimPagina(html, faltas, statusOverrides);
        }
      }

      return respJson(200, { faltas, statusOverrides });
    } catch (err) {
      return respJson(500, { erro: "erro inesperado ao sincronizar com o SUAP" });
    }
  },
};
