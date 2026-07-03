// ─── gen-suap-keys.mjs ─────────────────────────────────────────────────────
// Gera um par de chaves RSA-OAEP (2048) para "selar" a senha do SUAP no
// cliente antes de enviá-la ao Worker. Rode com: `node worker/gen-suap-keys.mjs`
//
// Saída:
//  - PUBLIC  (SPKI base64) → cole em cryptoSuap.js (constante PUBLIC_KEY_SPKI_B64)
//  - PRIVATE (PKCS8 base64) → vira secret do Worker:
//        wrangler secret put SUAP_PRIVATE_KEY   (cole o valor quando pedir)
//
// A chave PÚBLICA pode ir para o Git sem problema. A PRIVADA nunca — ela só
// existe como secret no Cloudflare. Rotacione quando quiser: basta rodar de
// novo, trocar a pública no cliente e regravar o secret.
import { webcrypto as crypto } from "node:crypto";

const pair = await crypto.subtle.generateKey(
  { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
  true,
  ["encrypt", "decrypt"]
);

const spki = Buffer.from(await crypto.subtle.exportKey("spki", pair.publicKey)).toString("base64");
const pkcs8 = Buffer.from(await crypto.subtle.exportKey("pkcs8", pair.privateKey)).toString("base64");

console.log("\n=== CHAVE PÚBLICA (SPKI base64) — cole em cryptoSuap.js ===\n");
console.log(spki);
console.log("\n=== CHAVE PRIVADA (PKCS8 base64) — vira secret do Worker ===\n");
console.log(pkcs8);
console.log("\nComando: wrangler secret put SUAP_PRIVATE_KEY  (cole a privada acima)\n");
