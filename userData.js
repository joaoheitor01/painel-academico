// ─── DADOS POR USUÁRIO ────────────────────────────────────────────────────────
// Cada conta tem seu próprio progresso (statusOverrides) e suas próprias
// faltas, isolados sob uma chave exclusiva no localStorage.

const dataKey = (userKey) => `painel-academico:data:${userKey}`;

export function loadUserData(userKey) {
  try {
    const raw = localStorage.getItem(dataKey(userKey));
    if (!raw) return { statusOverrides: {}, faltas: {} };
    const parsed = JSON.parse(raw);
    return {
      statusOverrides: parsed.statusOverrides || {},
      faltas: parsed.faltas || {},
    };
  } catch {
    return { statusOverrides: {}, faltas: {} };
  }
}

export function saveUserData(userKey, data) {
  localStorage.setItem(dataKey(userKey), JSON.stringify(data));
}
