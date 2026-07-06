// ─── cryptoLocal.js ────────────────────────────────────────────────────────
// Proteção dos dados locais (localStorage) em máquinas compartilhadas.
//
// Modelo de ameaça: outra pessoa usando o MESMO navegador abre o console e lê
// o localStorage. Antes, faltas/notas/progresso de todos os usuários ficavam
// em JSON puro. Agora cada conta tem seus dados cifrados com AES-GCM-256,
// cuja chave é derivada da senha via PBKDF2 — sem a senha, o console mostra
// apenas um envelope cifrado.
//
// Design: UMA derivação PBKDF2 gera 512 bits; a primeira metade vira o
// "verificador" (substitui o hash de senha, armazenado), a segunda vira a
// chave AES (mantida apenas em sessão). As metades são independentes: quem
// lê o verificador não obtém a chave dos dados.
//
// Limite honesto: isto protege CONFIDENCIALIDADE contra outros usuários do
// mesmo navegador. Não impede alguém de APAGAR os dados (qualquer um pode
// limpar o localStorage) nem protege enquanto você está logado na mesma aba.

const enc = new TextEncoder();
const dec = new TextDecoder();

// OWASP recomenda centenas de milhares de iterações para PBKDF2-SHA256.
// 300k roda em ~0,2–0,6s em celulares atuais — aceitável no login.
export const KDF_ITERS = 300000;

export function randomB64(nBytes) {
  const b = new Uint8Array(nBytes);
  crypto.getRandomValues(b);
  return bufToB64(b);
}

export function bufToB64(buf) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

export function b64ToBuf(b64) {
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf;
}

// Deriva { verifierB64, keyRawB64 } da senha + salt (base64).
export async function deriveFromPassword(password, saltB64, iters = KDF_ITERS) {
  const material = await crypto.subtle.importKey(
    "raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: b64ToBuf(saltB64), iterations: iters },
    material,
    512
  );
  const bytes = new Uint8Array(bits);
  return {
    verifierB64: bufToB64(bytes.slice(0, 32)),
    keyRawB64: bufToB64(bytes.slice(32)),
  };
}

export function importAesKey(keyRawB64) {
  return crypto.subtle.importKey(
    "raw", b64ToBuf(keyRawB64), "AES-GCM", false, ["encrypt", "decrypt"]
  );
}

// Envelope: { enc: 1, iv, ct } — IV aleatório por gravação (exigência do GCM).
export async function encryptJson(cryptoKey, obj) {
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv }, cryptoKey, enc.encode(JSON.stringify(obj))
  );
  return { enc: 1, iv: bufToB64(iv), ct: bufToB64(ct) };
}

export async function decryptJson(cryptoKey, envelope) {
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64ToBuf(envelope.iv) }, cryptoKey, b64ToBuf(envelope.ct)
  );
  return JSON.parse(dec.decode(pt));
}
