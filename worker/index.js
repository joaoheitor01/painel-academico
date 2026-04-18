const SUAP_BASE = 'https://suap.ifmt.edu.br';

function extractCsrfToken(html) {
  const patterns = [
    /name='csrfmiddlewaretoken'\s+value='([^']+)'/,
    /name="csrfmiddlewaretoken"\s+value="([^"]+)"/,
    /value='([^']+)'\s+name='csrfmiddlewaretoken'/,
    /value="([^"]+)"\s+name="csrfmiddlewaretoken"/,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractAllCookies(response) {
  const cookies = {};
  const raw = response.headers.get('set-cookie') || '';
  const parts = raw.split(',');
  for (const part of parts) {
    const seg = part.trim().split(';')[0];
    const eq = seg.indexOf('=');
    if (eq > 0) {
      cookies[seg.substring(0, eq).trim()] = seg.substring(eq + 1).trim();
    }
  }
  return cookies;
}

function cookiesToHeader(cookies) {
  return Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
}

async function getGrades(env) {
  const SUAP_USER = env.SUAP_USER;
  const SUAP_PASS = env.SUAP_PASS;

  console.log("SUAP_USER:", SUAP_USER ? "presente" : "VAZIO");

  // 1. GET login page para obter CSRF
  const loginPageRes = await fetch(`${SUAP_BASE}/accounts/login/`, {
    method: 'GET',
    redirect: 'manual',
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });

  console.log("Status login page:", loginPageRes.status);

  const loginPageHtml = await loginPageRes.text();
  let cookies = extractAllCookies(loginPageRes);

  const csrfToken = extractCsrfToken(loginPageHtml) || cookies['csrftoken'];
  console.log("CSRF token:", csrfToken ? "encontrado" : "NAO encontrado");

  if (!csrfToken) {
    console.log("HTML trecho:", loginPageHtml.substring(0, 1000));
    throw new Error('CSRF token not found');
  }

  // 2. POST login
  const loginBody = new URLSearchParams({
    username: SUAP_USER,
    password: SUAP_PASS,
    csrfmiddlewaretoken: csrfToken,
    next: '/'
  });

  const loginRes = await fetch(`${SUAP_BASE}/accounts/login/`, {
    method: 'POST',
    redirect: 'manual',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': cookiesToHeader(cookies),
      'Referer': `${SUAP_BASE}/accounts/login/`,
      'User-Agent': 'Mozilla/5.0',
      'X-CSRFToken': csrfToken
    },
    body: loginBody.toString()
  });

  console.log("Status após login:", loginRes.status);
  const newCookies = extractAllCookies(loginRes);
  cookies = { ...cookies, ...newCookies };

  if (loginRes.status !== 302 || loginRes.headers.get('location') === '/accounts/login/') {
    throw new Error('Login falhou - credenciais incorretas ou bloqueio');
  }

  // 3. GET boletim
  const boletimUrl = `${SUAP_BASE}/edu/aluno/${SUAP_USER}/?tab=boletim`;
  console.log("Buscando boletim:", boletimUrl);

  const boletimRes = await fetch(boletimUrl, {
    method: 'GET',
    redirect: 'follow',
    headers: {
      'Cookie': cookiesToHeader(cookies),
      'User-Agent': 'Mozilla/5.0'
    }
  });

  console.log("Status boletim:", boletimRes.status);

  const html = await boletimRes.text();

  // 4. Parsear tabela
  const tableMatch = html.match(/summary="Boletim do Aluno"[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/);
  if (!tableMatch) {
    console.log("HTML boletim trecho:", html.substring(0, 2000));
    throw new Error('Tabela do boletim não encontrada');
  }

  const subjectMap = {
    'Cálculo Numérico': 'ENC-23',
    'Compiladores': 'ENC-33',
    'Engenharia de Software': 'ENC-31',
    'Equações Diferenciais': 'ENC-21',
    'Extensão I': 'ENC-34',
    'Laboratório de Circuitos Elétricos I': 'ENC-30',
    'Programação WEB': 'ENC-32',
  };

  const rows = tableMatch[1].match(/<tr[\s\S]*?<\/tr>/g) || [];
  const disciplinas = [];

  for (const row of rows) {
    const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g) || [];
    if (cells.length < 10) continue;

    const getText = (cell) => cell.replace(/<[^>]+>/g, '').trim();
    let nome = getText(cells[1]).replace(/^Normal\.\d+ - /, '');

    const subject_id = Object.entries(subjectMap).find(([k]) =>
      nome.toLowerCase().includes(k.toLowerCase())
    )?.[1] || null;

    disciplinas.push({
      diario: getText(cells[0]),
      nome,
      total_aulas: getText(cells[2]),
      carga_horaria: getText(cells[3]),
      total_faltas: getText(cells[4]),
      frequencia: getText(cells[5]),
      situacao: getText(cells[6]),
      nota_e1: getText(cells[7]),
      faltas_e1: getText(cells[8]),
      media: getText(cells[9]),
      nota_af: cells[10] ? getText(cells[10]) : '',
      faltas_af: cells[11] ? getText(cells[11]) : '',
      mfd: cells[12] ? getText(cells[12]) : '',
      subject_id,
      faltas_int: parseInt(getText(cells[4])) || 0
    });
  }

  console.log("Disciplinas encontradas:", disciplinas.length);

  const faltas = {};
  for (const d of disciplinas) {
    if (d.subject_id) faltas[d.subject_id] = d.faltas_int;
  }

  return {
    atualizadoEm: new Date().toISOString(),
    disciplinas,
    faltas
  };
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    try {
      const data = await getGrades(env);
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    } catch (err) {
      console.log("ERRO FINAL:", err.message, err.stack);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
};