// ─── cryptoSuap.js ─────────────────────────────────────────────────────────
// "Sela" a senha do SUAP no cliente (RSA-OAEP) antes de enviá-la ao Worker.
// Assim ela nunca sai do dispositivo em texto claro — nem no payload que
// aparece no DevTools, nem para um proxy que faça inspeção de TLS (comum em
// redes institucionais). O Worker é o único que consegue descriptografar,
// usando a chave privada guardada como secret (SUAP_PRIVATE_KEY).
//
// Limite honesto: o Worker precisa da senha em claro para logar no SUAP, então
// ele descriptografa em memória. Isto NÃO é zero-knowledge — é defesa em
// profundidade contra quem observa o tráfego, não contra o próprio Worker.
//
// A chave PÚBLICA abaixo pode ficar no Git à vontade. Para rotacionar, rode
// `node worker/gen-suap-keys.mjs`, troque a constante e regrave o secret.

const PUBLIC_KEY_SPKI_B64 =
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA54JuVgUNa9yMIn7zn7q7UswxABFwlAVOuIJDb6RQPfzFbb2LHa9b0Sr0XJFNY9jpZuPeTcFHP/A5ADwj/3mogfbd44WkMe6s2I2OqyfuHcypGz/iq6ydVIZcZOn3ouzNWwgaUJvif2Iw3artu8wUf/ltnWUt2n52rjqvWRwRrib9XtmiKND0SMmB2l9AUzRfGAPb9B0jKZX1KzvSz+okpXVtzCFMi2wAxTFXGV0VfqtH3HZ6lDlNo+mnNyd+oa+P3IkMXfd3d4u1GFT2JBTngRqu8UJSrlZXG3oUEKTc7Mqmd+JC1l1rrFAyhe4WSV1MH9sJan9Ywcdc7fuhnRQZaQIDAQAB";

function b64ToBuf(b64) {
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

function bufToB64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

let _keyPromise = null;
function getPublicKey() {
  if (!_keyPromise) {
    _keyPromise = crypto.subtle.importKey(
      "spki",
      b64ToBuf(PUBLIC_KEY_SPKI_B64),
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["encrypt"]
    );
  }
  return _keyPromise;
}

// Retorna a senha cifrada em base64 (RSA-OAEP). Lança se o ambiente não tiver
// Web Crypto (ex.: contexto inseguro) — preferimos falhar alto a mandar em claro.
export async function encryptSenha(senha) {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Este navegador não suporta criptografia segura (requer HTTPS).");
  }
  const key = await getPublicKey();
  const ct = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, key, new TextEncoder().encode(senha));
  return bufToB64(ct);
}
