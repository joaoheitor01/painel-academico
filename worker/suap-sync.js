// ─── suap-sync.js ──────────────────────────────────────────────────────────
// Cloudflare Worker: proxy de login no SUAP (IFMT) + extração do boletim.
// Stateless — não loga matricula, senha ou cookies em nenhum momento.
//
// ── CORREÇÕES 2026/2 ───────────────────────────────────────────────────────
// FIX 1 · NOME_PARA_ID: nomes de 2026/2 que não existiam no mapa
//         ("Análise e Projeto…", "Laboratório de Circuitos Elétricos II",
//          "Eletrônica I", "Homem, Cultura e Sociedade").
// FIX 2 · encontrarId(): o fallback por substring casava "…Elétricos II" com
//         a chave "…elétricos i" (prefixo), jogando o Lab. II em cima do
//         Lab. I. Agora exige limite de palavra no fim do match.
// FIX 3 · "Reprovado": antes o Worker não escrevia nada, então uma disciplina
//         reprovada continuava eternamente como "Cursando" no localStorage.
//         Agora grava "next" (precisa refazer) e zera as faltas.
//
// ── HORÁRIO POR ALUNO ──────────────────────────────────────────────────────
// STEP E lê ?tab=locais_aula_aluno e devolve `horario` (diário, código,
// professor, carga horária e blocos de aula). Antes disso SCHEDULE e
// ATTENDANCE_META eram constantes no repo: todo semestre alguém editava na
// mão e, pior, todo colega via o horário de quem editou. O match passa a
// tentar primeiro o código estável do componente (CODIGO_PARA_ID) e só depois
// o nome. Falha ao ler o horário não derruba o sync de notas.

import { descobrirTimetable, baixarGrade, lerGrade, casarHorario } from "./edupage.js";

const ALLOWED_ORIGIN = "https://joaoheitor01.github.io";
const SUAP_BASE = "https://suap.ifmt.edu.br";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };
}

// ─── Descriptografia da senha (RSA-OAEP) ───────────────────────────────────
function b64ToBuf(b64) {
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

async function decryptSenha(privateKeyB64, ciphertextB64) {
  const key = await crypto.subtle.importKey(
    "pkcs8",
    b64ToBuf(privateKeyB64),
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["decrypt"]
  );
  const pt = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, key, b64ToBuf(ciphertextB64));
  return new TextDecoder().decode(pt);
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
  "segurança do trabalho": "ENC-18",                              // FIX 1
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
  "análise e projeto de sistemas computacionais": "ENC-37",       // FIX 1
  "extensão ii": "ENC-38",
  "circuitos elétricos ii": "ENC-39",
  "eletrônica analógica i": "ENC-40",
  "eletrônica i": "ENC-40",                                       // FIX 1 (equivalente)
  "sinais e sistemas lineares": "ENC-41",
  "redes de computadores": "ENC-42",
  "inteligência artificial": "ENC-43",
  "extensão iii": "ENC-44",
  "eletrônica analógica ii": "ENC-45",
  "eletrônica ii": "ENC-45",                                      // FIX 1 (equivalente)
  "processamento digital de sinais": "ENC-46",
  "sistemas embarcados": "ENC-47",
  "segurança computacional": "ENC-48",
  "extensão iv": "ENC-49",
  "projeto integrador i": "ENC-50",
  "visão computacional": "ENC-51",
  "internet das coisas": "ENC-52",
  "extensão v": "ENC-53",
  "trabalho de conclusão de curso": "ENC-54",
  "laboratório de circuitos elétricos ii": "ENC-55",              // FIX 1
  "homem, cultura e sociedade": "ENC-56",                         // FIX 1
};

// ─── Mapeamento código (SUAP) → ID (painel) ────────────────────────────────
// O prefixo "Normal.XXXX" é o código estável do componente no SUAP — bem mais
// confiável que o nome, que varia ("Eletrônica I" vs "Eletrônica Analógica I",
// "Análise e Proj." vs "Análise e Projeto").
//
// ⚠ Mapa PARCIAL, derivado do histórico de um único aluno. Vários códigos que
// existem no SUAP (Normal.3021 Microcontroladores, Normal.7435 Controle de
// Sistemas…) nem constam da matriz do painel. O match por nome continua sendo
// o fallback — não remova.
const CODIGO_PARA_ID = {
  "Normal.1387":"ENC-01", "Normal.7420":"ENC-02", "Normal.7418":"ENC-03",
  "Normal.7419":"ENC-04", "Normal.2998":"ENC-05", "Normal.0593":"ENC-06",
  "Normal.1391":"ENC-07", "Normal.2996":"ENC-16", "Normal.1712":"ENC-18",
  "Normal.1362":"ENC-19", "Normal.1358":"ENC-20", "Normal.6179":"ENC-21",
  "Normal.1654":"ENC-22", "Normal.1294":"ENC-24", "Normal.4589":"ENC-27",
  "Normal.7429":"ENC-29", "Normal.2185":"ENC-30", "Normal.7430":"ENC-32",
  "Normal.7431":"ENC-33", "Normal.1455":"ENC-34", "Normal.4579":"ENC-35",
  "Normal.7428":"ENC-36", "Normal.7433":"ENC-37", "Normal.3009":"ENC-39",
  "Normal.7432":"ENC-40", "Normal.2095":"ENC-40", // Eletrônica I ≡ Analógica I
  "Normal.4587":"ENC-41", "Normal.1367":"ENC-42", "Normal.1465":"ENC-43",
  "Normal.7434":"ENC-45", "Normal.7427":"ENC-17", "Normal.3010":"ENC-55",
  "Normal.0935":"ENC-56",
};

// "Normal.7433 - Análise e Projeto…" → "Normal.7433" (null se não houver código)
export function extrairCodigo(textoBruto) {
  const i = (textoBruto || "").indexOf(" - ");
  if (i === -1) return null;
  const cod = textoBruto.slice(0, i).trim();
  return /^[A-Za-z]+\.\d+$/.test(cod) ? cod : null;
}

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

// FIX 2 — o fallback por substring casava prefixos ("…eletricos i" dentro de
// "…eletricos ii"), o que fazia o Laboratório de Circuitos Elétricos II ser
// gravado como ENC-32 (Lab. I) e sobrescrever um status já correto.
// Agora só aceita o match se ele terminar em limite de palavra.
export function matchComLimite(texto, chave) {
  let from = 0;
  for (;;) {
    const i = texto.indexOf(chave, from);
    if (i === -1) return false;
    const antes = i === 0 ? " " : texto[i - 1];
    const depois = texto[i + chave.length] ?? " ";
    if (!/[a-z0-9]/.test(antes) && !/[a-z0-9]/.test(depois)) return true;
    from = i + 1;
  }
}

export function encontrarId(nomeSuap, codigo = null) {
  // 0. Código do componente — estável, imune a variação de nome.
  if (codigo && CODIGO_PARA_ID[codigo]) return CODIGO_PARA_ID[codigo];

  const normalizado = normalizar(nomeSuap);
  // 1. Lookup exato
  if (NOME_PARA_ID[normalizado]) return NOME_PARA_ID[normalizado];
  // 2. Fallback substring com limite de palavra (chave mais longa vence)
  let melhorChave = "";
  let melhorId = null;
  for (const [chave, id] of Object.entries(NOME_PARA_ID)) {
    if (chave.length > melhorChave.length && matchComLimite(normalizado, chave)) {
      melhorChave = chave;
      melhorId = id;
    }
  }
  return melhorId;
}

// ─── Mapeamento situação (SUAP) → status (painel) ──────────────────────────
const SITUACOES_DONE = ["aprovado", "dispensado", "aproveitamento", "concluído", "concluido", "cumprida"];
const SITUACOES_CURRENT = ["cursando", "andamento", "prova final", "segunda chamada", "exame final", "matriculado"];
// FIX 3 — reprovações agora são registradas como "next" (refazer). Antes o
// Worker não escrevia nada e o status antigo ("current") ficava congelado.
// Prefixo "reprov" cobre tanto "Reprovado" quanto a forma abreviada que o
// SUAP usa para falta: "Reprov. por Falta". ("aprovado" não contém "reprov".)
const SITUACOES_RETAKE = ["reprov"];

// ─── Descoberta dos períodos letivos (<select id="ano_periodo">) ───────────
export function extrairPeriodos(html) {
  const sel = html.match(/<select[^>]*id="ano_periodo"[\s\S]*?<\/select>/i)?.[0] || "";
  const periodos = [];
  const optRegex = /<option[^>]*value="([^"]+)"/gi;
  let m;
  while ((m = optRegex.exec(sel)) !== null) {
    if (m[1]) periodos.push(m[1]);
  }
  return periodos; // ex.: ["2026_2","2026_1","2025_2","2025_1","2024_2","2024_1"]
}

const limparNota = (s) => {
  const t = (s || "").trim();
  return t && t !== "-" ? t.replace(",", ".") : "-";
};

// "80 aulas" → 80 (o boletim já traz a carga horária do diário)
function extrairAulas(txt) {
  const m = /(\d+)\s*aulas?/i.exec(txt || "");
  return m ? Number(m[1]) : 0;
}

// ─── Parsing de UMA página de boletim ──────────────────────────────────────
// `cursando`, quando passado, recebe as disciplinas do período ATIVO — nome,
// código (Normal.7433), diário e carga horária. É essa a lista que define o
// horário: o boletim é a fonte de "o que eu curso agora".
export function parseBoletimPagina(html, faltas, statusOverrides, notas, isPeriodoAtivo = false, cursando = null) {
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const stripTagsRegex = /<[^>]+>/g;

  let rowMatch;
  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1];
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const cells = [];
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      cells.push(cellMatch[1].replace(stripTagsRegex, "").replace(/\s+/g, " ").trim());
    }

    if (cells.length < 7) continue;

    const nomeBruto = cells[1] || "";
    const nome = nomeBruto.includes(" - ")
      ? nomeBruto.split(" - ").pop().trim()
      : nomeBruto.trim();
    if (!nome) continue;

    const codigo = extrairCodigo(nomeBruto);
    const encId = encontrarId(nome, codigo);
    if (!encId) continue;
    if (encId in statusOverrides) continue; // first-write-wins

    const faltasNum = parseInt((cells[4] || "0").replace(/\D/g, "") || "0", 10);
    const situacao = (cells[6] || "").toLowerCase().trim();

    const isRetake  = SITUACOES_RETAKE.some(s => situacao.includes(s));
    const isDone    = !isRetake && SITUACOES_DONE.some(s => situacao.includes(s));
    const isCurrent = !isRetake && SITUACOES_CURRENT.some(s => situacao.includes(s));

    if (isRetake) {
      // FIX 3 — reprovado (por nota ou falta): sai de "current", vira "próxima".
      statusOverrides[encId] = "next";
      faltas[encId] = 0;
      delete notas[encId];
    } else if (isPeriodoAtivo && (isDone || isCurrent)) {
      statusOverrides[encId] = "current";
      faltas[encId] = faltasNum;
      if (cursando) {
        cursando.push({
          encId,
          codigo,
          nome,
          diario: cells[0] || "",
          cargaHoraria: extrairAulas(cells[2]),
          professor: "", // preenchido depois por ?tab=locais_aula_aluno
        });
      }
      notas[encId] = {
        p1:    limparNota(cells[7]),
        media: limparNota(cells[9]),
        af:    limparNota(cells[10]),
        mfd:   limparNota(cells[12]),
      };
    } else if (isDone) {
      statusOverrides[encId] = "done";
      faltas[encId] = 0;
    } else if (isCurrent) {
      statusOverrides[encId] = "current";
      faltas[encId] = faltasNum;
      notas[encId] = {
        p1:    limparNota(cells[7]),
        media: limparNota(cells[9]),
        af:    limparNota(cells[10]),
        mfd:   limparNota(cells[12]),
      };
    }
    // cancelado / trancado / desconhecido → não altera
  }
}

// ─── Parsing do horário (?tab=locais_aula_aluno) ───────────────────────────
// A tabela "Diários" traz uma linha por disciplina:
//   61479 | Normal.7433 - Análise e Projeto… - Graduação [68 h/80 Aulas]
//         | Evandro Cesar Freiberger | 2V34 / 3V12
//
// O parser identifica as colunas por FORMATO, não por posição — o SUAP muda a
// ordem/quantidade de colunas entre versões (às vezes há coluna de sala).

// Um bloco: <dia><turno><aulas> — ex.: 2V34, 4V1234, 5N2456.
const RE_BLOCO = /^([2-7])([MVN])(\d+)$/;
// "[68 h/80 Aulas]" → queremos o nº de AULAS (80), não as horas (68).
const RE_CARGA = /\[\s*\d+\s*h\s*\/\s*(\d+)\s*aulas?\s*\]/i;

/** "2V34 / 3V12" → [{dia:2,turno:"V",slots:[3,4]}, {dia:3,turno:"V",slots:[1,2]}] */
export function parseCodigoHorario(texto) {
  const blocos = [];
  for (const parte of (texto || "").split("/")) {
    const m = parte.trim().match(RE_BLOCO);
    if (!m) continue;
    const slots = m[3].split("").map(Number).filter((n) => n >= 1 && n <= 6);
    if (slots.length) {
      blocos.push({ dia: Number(m[1]), turno: m[2], slots: [...new Set(slots)].sort((a, b) => a - b) });
    }
  }
  return blocos;
}

/** Uma célula é horário se TODOS os seus pedaços casam com o formato de bloco. */
function pareceHorario(txt) {
  const partes = (txt || "").split("/").map((p) => p.trim()).filter(Boolean);
  return partes.length > 0 && partes.every((p) => RE_BLOCO.test(p));
}

/**
 * "Normal.7433 - Análise e Projeto… - Graduação [68 h/80 Aulas]"
 *   → { codigo, nome, cargaHoraria }
 */
function parseComponente(txt) {
  const codigo = extrairCodigo(txt);
  if (!codigo) return null;
  const resto = txt.slice(txt.indexOf(" - ") + 3);
  const cargaHoraria = Number(resto.match(RE_CARGA)?.[1] || 0);
  // Tira o "[68 h/80 Aulas]" e o sufixo de modalidade (" - Graduação").
  const nome = resto.replace(/\[[^\]]*\]/g, "").split(" - ")[0].replace(/\s+/g, " ").trim();
  if (!nome) return null;
  return { codigo, nome, cargaHoraria };
}

export function parseHorarioPagina(html) {
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const stripTagsRegex = /<[^>]+>/g;
  const horario = [];
  const vistos = new Set();

  let rowMatch;
  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const cells = [];
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
      cells.push(cellMatch[1].replace(stripTagsRegex, "").replace(/\s+/g, " ").trim());
    }
    if (cells.length < 2) continue;

    const idxComp = cells.findIndex((c) => extrairCodigo(c));
    if (idxComp === -1) continue;
    const comp = parseComponente(cells[idxComp]);
    if (!comp) continue;

    const encId = encontrarId(comp.nome, comp.codigo);
    if (!encId) continue; // componente fora da matriz do painel

    const idxHorario = cells.findIndex((c, i) => i !== idxComp && pareceHorario(c));
    const blocos = idxHorario === -1 ? [] : parseCodigoHorario(cells[idxHorario]);

    // Diário: primeira célula puramente numérica antes do componente.
    const diario = cells.slice(0, idxComp).find((c) => /^\d+$/.test(c)) || "";

    // Professor: célula de texto imediatamente ANTES do horário. Ancorar na
    // posição evita pegar a coluna de sala ("Bloco C"), que também é texto.
    const textuais = cells
      .map((c, i) => ({ c, i }))
      .filter(({ c, i }) => i !== idxComp && i !== idxHorario && !pareceHorario(c) && /[A-Za-zÀ-ÿ]{3,}/.test(c));
    const professor =
      textuais.find(({ i }) => i === idxHorario - 1)?.c ||
      textuais.find(({ i }) => i > idxComp)?.c ||
      "";

    const chave = `${comp.codigo}|${diario}`;
    if (vistos.has(chave)) continue;
    vistos.add(chave);

    horario.push({
      diario,
      codigo: comp.codigo,
      encId,
      nome: comp.nome,
      professor,
      cargaHoraria: comp.cargaHoraria,
      blocos,
    });
  }

  return horario;
}

// ─── Cookie jar ─────────────────────────────────────────────────────────────
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
  async fetch(request, env) {
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

    const { matricula, senha, senha_enc } = body || {};

    let senhaPlain = senha;
    if (senha_enc) {
      if (!env || !env.SUAP_PRIVATE_KEY) {
        return respJson(500, { erro: "chave de descriptografia não configurada no servidor" });
      }
      try {
        senhaPlain = await decryptSenha(env.SUAP_PRIVATE_KEY, senha_enc);
      } catch {
        return respJson(400, { erro: "falha ao descriptografar as credenciais" });
      }
    }

    if (!matricula || !senhaPlain) {
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
        password: senhaPlain,
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

      // STEP C — boletim do período atual + descobrir todos os períodos
      const headersBoletim = { "Cookie": cookieHeader(jar), "User-Agent": "Mozilla/5.0" };
      const baseUrl = `${SUAP_BASE}/edu/aluno/${encodeURIComponent(matricula)}/?tab=boletim`;

      const primeiraResp = await fetch(baseUrl, { headers: headersBoletim });
      const primeiroHtml = await primeiraResp.text();
      const periodos = extrairPeriodos(primeiroHtml);

      // STEP D — parse de TODOS os períodos (mais novo → mais antigo)
      const faltas = {};
      const statusOverrides = {};
      const notas = {};

      // O boletim do período ATIVO é a fonte de "quais disciplinas eu curso
      // agora" — traz nome, código (Normal.7433), diário e carga horária.
      const cursando = [];
      parseBoletimPagina(primeiroHtml, faltas, statusOverrides, notas, true, cursando);
      for (let i = 1; i < periodos.length; i++) {
        const url = `${baseUrl}&ano_periodo=${encodeURIComponent(periodos[i])}`;
        const resp = await fetch(url, { headers: headersBoletim });
        const html = await resp.text();
        parseBoletimPagina(html, faltas, statusOverrides, notas, false);
      }

      // STEP E — complemento opcional: ?tab=locais_aula_aluno só acrescenta o
      // professor (e confirma a carga horária). Se esta página mudar de forma
      // ou sair do ar, o horário continua funcionando — só perde o desempate
      // por professor quando a mesma disciplina aparece em várias turmas.
      try {
        const urlHorario = `${SUAP_BASE}/edu/aluno/${encodeURIComponent(matricula)}/?tab=locais_aula_aluno`;
        const respHorario = await fetch(urlHorario, { headers: headersBoletim });
        if (respHorario.ok) {
          const detalhes = parseHorarioPagina(await respHorario.text());
          const porId = new Map(detalhes.map((d) => [d.encId, d]));
          for (const c of cursando) {
            const d = porId.get(c.encId);
            if (!d) continue;
            c.professor = d.professor || c.professor;
            c.cargaHoraria = c.cargaHoraria || d.cargaHoraria;
            c.diario = c.diario || d.diario;
          }
        }
      } catch {
        // segue sem professor — o casamento por nome ainda resolve a maioria
      }

      // STEP F — horário de relógio SOMENTE pela grade oficial do campus.
      // Os códigos do SUAP ("3V56") não dizem a hora, e a grade de sinos que
      // circula erra em até 1h20 (Redes na quinta é 15:35, não 16:55). O
      // EduPage é público e traz turma + professor, então dá pra casar com
      // segurança. Disciplina que a grade não publicou fica de fora — e é
      // reportada em horarioMeta.naoEncontradas, nunca descartada em silêncio.
      let horario = [];
      let horarioMeta = { fonte: "nenhuma", grade: "", naoEncontradas: [] };
      if (cursando.length) {
        try {
          const { ttNum, texto } = await descobrirTimetable();
          const grade = lerGrade(await baixarGrade(ttNum));
          const { horario: casado, naoEncontradas } = casarHorario(cursando, grade);
          horario = casado;
          horarioMeta = { fonte: "edupage", grade: texto, naoEncontradas };
        } catch {
          // EduPage indisponível: sem horário. Não inventamos a partir do
          // SUAP — foi decisão explícita que o horário só vem da grade
          // oficial. A UI cai no SCHEDULE estático e avisa.
          horarioMeta = {
            fonte: "indisponivel",
            grade: "",
            naoEncontradas: cursando.map((c) => ({
              encId: c.encId, nome: c.nome, motivo: "grade oficial indisponível",
            })),
          };
        }
      }

      return respJson(200, { faltas, statusOverrides, notas, horario, horarioMeta });
    } catch (err) {
      return respJson(500, { erro: "erro inesperado ao sincronizar com o SUAP" });
    }
  },
};