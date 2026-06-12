// ─── AUTENTICAÇÃO LOCAL ───────────────────────────────────────────────────────
// Contas ficam salvas apenas no localStorage do navegador (nada é enviado
// para um servidor). Senhas nunca são armazenadas em texto puro: cada conta
// guarda um salt aleatório e o hash SHA-256 de (salt + senha).

const USERS_KEY = "painel-academico:users";
const SESSION_KEY = "painel-academico:session";

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hashPassword(salt, password) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

function randomSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return toHex(bytes.buffer);
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

export async function registerUser(username, password) {
  const key = normalizeKey(username);
  if (!key) throw new Error("Informe um nome de usuário.");
  if (password.length < 4) throw new Error("A senha deve ter pelo menos 4 caracteres.");

  const users = readUsers();
  if (users[key]) throw new Error("Esse nome de usuário já existe.");

  const salt = randomSalt();
  const hash = await hashPassword(salt, password);
  users[key] = { username: username.trim(), salt, hash };
  writeUsers(users);
  return key;
}

export async function loginUser(username, password) {
  const key = normalizeKey(username);
  const users = readUsers();
  const user = users[key];
  if (!user) throw new Error("Usuário não encontrado.");

  const hash = await hashPassword(user.salt, password);
  if (hash !== user.hash) throw new Error("Senha incorreta.");
  return key;
}

export function getSession() {
  return localStorage.getItem(SESSION_KEY);
}

export function setSession(userKey) {
  if (userKey) localStorage.setItem(SESSION_KEY, userKey);
  else localStorage.removeItem(SESSION_KEY);
}

export function getDisplayName(userKey) {
  const users = readUsers();
  return users[userKey]?.username || userKey;
}
