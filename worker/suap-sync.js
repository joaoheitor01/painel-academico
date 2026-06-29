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

// ─── Parsing do boletim (sem DOM disponível no Worker) ─────────────────────
function parseBoletim(html) {
  const faltas = {};
  const statusOverrides = {};
  const diagnostico = []; // TODO: remover antes do commit final

  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const stripTagsRegex = /<[^>]+>/g;

  let rowMatch;
  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1];
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi; // recriado por linha — regex global não pode ser reusado entre strings diferentes
    const cells = [];
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      cells.push(cellMatch[1].replace(stripTagsRegex, "").trim());
    }

    if (cells.length < 7) continue; // precisa de cols[0..6]; pula cabeçalho/linhas vazias

    // Coluna [1]: nome da disciplina (remove prefixo "Normal.XXXX - ")
    const nomeBruto = cells[1] || "";
    const nome = nomeBruto.includes(" - ")
      ? nomeBruto.split(" - ").pop().trim()
      : nomeBruto.trim();
    if (!nome) continue;

    const encId = encontrarId(nome);
    if (!encId) {
      diagnostico.push({ nome, id: "NÃO RECONHECIDO", situacao: null, faltas: null });
      continue;
    }

    // Coluna [4]: faltas
    const faltasStr = cells[4] || "0";
    const faltasNum = parseInt(faltasStr.replace(/\D/g, "") || "0", 10);

    // Coluna [6]: situação (confirmada a partir da ordem de campos do suap_sync.py)
    const situacao = (cells[6] || "").toLowerCase().trim();

    if (situacao.includes("aprovado")) {
      statusOverrides[encId] = "done";
    } else if (situacao === "-" || situacao.includes("andamento") || situacao === "") {
      statusOverrides[encId] = "current";
      faltas[encId] = faltasNum;
    }
    // "reprovado" / "reprovado por falta" → não altera, deixa o usuário decidir

    diagnostico.push({ nome, id: encId, situacao, faltas: faltasNum });
  }

  // TODO: remover antes do commit final
  console.log("SUAP rows:", JSON.stringify(diagnostico));

  return { faltas, statusOverrides };
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response("", { status: 204, headers: corsHeaders() });
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

    try {
      // STEP A — GET csrftoken
      const loginPage = await fetch(`${SUAP_BASE}/accounts/login/`, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      const setCookies = loginPage.headers.getSetCookie();
      const csrfCookie = setCookies.find((c) => c.startsWith("csrftoken="));
      const csrfToken = csrfCookie?.split(";")[0].split("=")[1];

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

      const loginResp = await fetch(`${SUAP_BASE}/accounts/login/`, {
        method: "POST",
        redirect: "manual",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Cookie": `csrftoken=${csrfToken}`,
          "Referer": `${SUAP_BASE}/accounts/login/`,
          "User-Agent": "Mozilla/5.0",
        },
        body: loginBody.toString(),
      });

      if (loginResp.status !== 302) {
        return respJson(401, { erro: "credenciais inválidas" });
      }

      const loginCookies = loginResp.headers.getSetCookie();
      const sessionCookie = loginCookies.find((c) => c.startsWith("sessionid="));
      const sessionId = sessionCookie?.split(";")[0].split("=")[1];

      if (!sessionId) {
        return respJson(502, { erro: "sessionid não encontrado" });
      }

      // STEP C — Fetch boletim
      const boletimUrl = `${SUAP_BASE}/edu/aluno/${encodeURIComponent(matricula)}/?tab=boletim`;
      const boletimResp = await fetch(boletimUrl, {
        headers: {
          "Cookie": `csrftoken=${csrfToken}; sessionid=${sessionId}`,
          "User-Agent": "Mozilla/5.0",
        },
      });
      const boletimHtml = await boletimResp.text();

      // STEP D — parseBoletim
      const { faltas, statusOverrides } = parseBoletim(boletimHtml);

      return respJson(200, { faltas, statusOverrides });
    } catch (err) {
      return respJson(500, { erro: "erro inesperado ao sincronizar com o SUAP" });
    }
  },
};
