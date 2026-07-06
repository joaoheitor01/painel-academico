// ─── AUTENTICAÇÃO LOCAL ───────────────────────────────────────────────────────
// Contas ficam salvas apenas no localStorage do navegador (nada é enviado
// para um servidor).
//
// Segurança (v2):
//  - Senha vira um VERIFICADOR via PBKDF2-SHA256 (300k iterações) — lento de
//    quebrar por força bruta, ao contrário do SHA-256 simples anterior.
//  - A MESMA derivação produz a chave AES que cifra os dados do usuário
//    (ver cryptoLocal.js / userData.js). A chave nunca é derivável a partir
//    do verificador armazenado.
//  - A chave da sessão vive em sessionStorage (morre ao fechar a aba). Com
//    "manter conectado", também vai ao localStorage — escolha do usuário,
//    pensada para o próprio celular, não para computadores compartilhados.
//  - Contas antigas (hash SHA-256) são migradas para PBKDF2 automaticamente
//    no primeiro login bem-sucedido.
//  - Erro de login é genérico: não revela se o usuário existe.

import { deriveFromPassword, importAesKey, randomB64, KDF_ITERS } from "./cryptoLocal";

const USERS_KEY = "painel-academico:users";
const SESSION_KEY = "painel-academico:session";
const SESSKEY_KEY = "painel-academico:sesskey";

const ERRO_LOGIN = "Usuário ou senha incorretos.";

let _cachedKey = null; // CryptoKey em memória (evita reimportar a cada uso)

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Esquema legado (v1): SHA-256(salt:senha) em hex. Mantido apenas para
// validar contas antigas antes de migrá-las.
async function legacyHash(salt, password) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
  } catch {
    return {};
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function normalizeKey(username) {
  return username.trim().toLowerCase();
}

async function persistSession(userKey, keyRawB64, remember) {
  localStorage.setItem(SESSION_KEY, userKey);
  sessionStorage.setItem(SESSKEY_KEY, keyRawB64);
  if (remember) localStorage.setItem(SESSKEY_KEY, keyRawB64);
  else localStorage.removeItem(SESSKEY_KEY);
  _cachedKey = await importAesKey(keyRawB64);
}

export async function registerUser(username, password, remember = false) {
  const key = normalizeKey(username);
  if (!key) throw new Error("Informe um nome de usuário.");
  if (password.length < 4) throw new Error("A senha deve ter pelo menos 4 caracteres.");

  const users = readUsers();
  if (users[key]) throw new Error("Esse nome de usuário já existe.");

  const salt = randomB64(16);
  const { verifierB64, keyRawB64 } = await deriveFromPassword(password, salt);
  users[key] = {
    username: username.trim(),
    kdf: { algo: "PBKDF2-SHA256", iters: KDF_ITERS, salt },
    verifier: verifierB64,
  };
  writeUsers(users);
  await persistSession(key, keyRawB64, remember);
  return key;
}

export async function loginUser(username, password, remember = false) {
  const key = normalizeKey(username);
  const users = readUsers();
  const user = users[key];
  if (!user) throw new Error(ERRO_LOGIN);

  let keyRawB64;

  if (user.kdf && user.verifier) {
    // Esquema atual (PBKDF2)
    const derived = await deriveFromPassword(password, user.kdf.salt, user.kdf.iters);
    if (derived.verifierB64 !== user.verifier) throw new Error(ERRO_LOGIN);
    keyRawB64 = derived.keyRawB64;
  } else {
    // Conta legada (SHA-256): valida e migra para PBKDF2
    const hash = await legacyHash(user.salt, password);
    if (hash !== user.hash) throw new Error(ERRO_LOGIN);
    const salt = randomB64(16);
    const derived = await deriveFromPassword(password, salt);
    users[key] = {
      username: user.username,
      kdf: { algo: "PBKDF2-SHA256", iters: KDF_ITERS, salt },
      verifier: derived.verifierB64,
    };
    writeUsers(users);
    keyRawB64 = derived.keyRawB64;
  }

  await persistSession(key, keyRawB64, remember);
  return key;
}

// Sessão válida = userKey salvo E chave de decifragem disponível. Sem a
// chave (aba nova sem "manter conectado"), exige login de novo — é o que
// impede outra pessoa de reabrir o app e ver seus dados.
export function getSession() {
  const userKey = localStorage.getItem(SESSION_KEY);
  if (!userKey) return null;
  const raw = sessionStorage.getItem(SESSKEY_KEY) || localStorage.getItem(SESSKEY_KEY);
  return raw ? userKey : null;
}

export async function getSessionCryptoKey() {
  if (_cachedKey) return _cachedKey;
  const raw = sessionStorage.getItem(SESSKEY_KEY) || localStorage.getItem(SESSKEY_KEY);
  if (!raw) return null;
  _cachedKey = await importAesKey(raw);
  return _cachedKey;
}

export function setSession(userKey) {
  if (userKey) {
    localStorage.setItem(SESSION_KEY, userKey);
  } else {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSKEY_KEY);
    sessionStorage.removeItem(SESSKEY_KEY);
    _cachedKey = null;
  }
}

export function getDisplayName(userKey) {
  const users = readUsers();
  return users[userKey]?.username || userKey;
}
