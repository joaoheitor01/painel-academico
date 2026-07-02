// ─── DADOS POR USUÁRIO ────────────────────────────────────────────────────────
// Cada conta tem seu próprio progresso (statusOverrides), faltas e notas,
// isolados sob uma chave exclusiva no localStorage.

const dataKey = (userKey) => `painel-academico:data:${userKey}`;

const DEFAULT_USER_DATA = {
  faltas: {},
  statusOverrides: {},
  notas: {},
};

export function loadUserData(userKey) {
  try {
    const raw = localStorage.getItem(dataKey(userKey));
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      faltas: parsed.faltas || {},
      statusOverrides: parsed.statusOverrides || {},
      notas: parsed.notas || {},
    };
  } catch {
    return { faltas: {}, statusOverrides: {}, notas: {} };
  }
}

export function saveUserData(userKey, data) {
  localStorage.setItem(dataKey(userKey), JSON.stringify({ ...DEFAULT_USER_DATA, ...data }));
}
