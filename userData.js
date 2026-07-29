// ─── DADOS POR USUÁRIO ────────────────────────────────────────────────────────
// Cada conta tem seu próprio progresso (statusOverrides), faltas e notas,
// isolados sob uma chave exclusiva no localStorage.
//
// Segurança (v2): os dados são gravados CIFRADOS (AES-GCM-256) com a chave
// derivada da senha do usuário (ver auth.js/cryptoLocal.js). No console, o
// que aparece é um envelope { enc:1, iv, ct } — sem a senha do dono, não há
// como ler faltas/notas de outra conta no mesmo navegador.
//
// Migração: dados antigos em texto claro são lidos normalmente uma última
// vez e re-gravados cifrados na primeira gravação após o login.

import { getSessionCryptoKey } from "./auth";
import { encryptJson, decryptJson } from "./cryptoLocal";

const dataKey = (userKey) => `painel-academico:data:${userKey}`;

const DEFAULT_USER_DATA = {
  faltas: {},
  statusOverrides: {},
  notas: {},
  // Horário do período atual: matrícula do SUAP + sinos da grade oficial do
  // campus (EduPage). Vazio = conta ainda não sincronizou → SCHEDULE estático.
  horario: [],
  // Procedência do horário e o que a grade oficial não publicou. Existe para
  // que uma disciplina sumida apareça na tela em vez de ser descartada calada.
  horarioMeta: null,
};

function withDefaults(parsed) {
  return {
    faltas: parsed?.faltas || {},
    statusOverrides: parsed?.statusOverrides || {},
    notas: parsed?.notas || {},
    horario: Array.isArray(parsed?.horario) ? parsed.horario : [],
    horarioMeta: parsed?.horarioMeta ?? null,
  };
}

export async function loadUserData(userKey) {
  let parsed;
  try {
    const raw = localStorage.getItem(dataKey(userKey));
    if (!raw) return { ...DEFAULT_USER_DATA };
    parsed = JSON.parse(raw);
  } catch {
    return { ...DEFAULT_USER_DATA };
  }

  if (parsed && parsed.enc === 1) {
    const key = await getSessionCryptoKey();
    if (!key) throw new Error("sessão sem chave de decifragem");
    try {
      return withDefaults(await decryptJson(key, parsed));
    } catch {
      // Chave não bate com o envelope (ex.: dado órfão de outra conta) —
      // não vaza nada, começa vazio.
      return { ...DEFAULT_USER_DATA };
    }
  }

  // Legado em texto claro: última leitura sem cifra; a próxima gravação
  // (efeito de persistência pós-hidratação) já sela em AES-GCM.
  return withDefaults(parsed);
}

export async function saveUserData(userKey, data) {
  const key = await getSessionCryptoKey();
  if (!key) return; // sem chave de sessão não grava — nunca volta a texto claro
  const envelope = await encryptJson(key, { ...DEFAULT_USER_DATA, ...data });
  localStorage.setItem(dataKey(userKey), JSON.stringify(envelope));
}
