const SUAP_BASE = 'https://suap.ifmt.edu.br';
const SUAP_USER = SUAP_USER || '';
const SUAP_PASS = SUAP_PASS || '';

const SUBJECT_MAP = {
  'Cálculo Numérico': 'ENC-23',
  'Compiladores': 'ENC-33',
  'Engenharia de Software': 'ENC-31',
  'Equações Diferenciais': 'ENC-21',
  'Extensão I': 'ENC-34',
  'Laboratório de Circuitos Elétricos I': 'ENC-30',
  'Programação WEB': 'ENC-32',
};

function addCorsHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function extractCsrfToken(html) {
  const match = html.match(/name='csrfmiddlewaretoken' value='([^']+)'/);
  return match ? match[1] : null;
}

function extractCookies(headers) {
  const setCookie = headers.get('Set-Cookie');
  if (!setCookie) return '';
  return setCookie.split(';')[0];
}

async function fetchWithCookies(url, method, body, cookies, csrfToken) {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  if (cookies) headers['Cookie'] = cookies;
  if (csrfToken) headers['X-CSRFToken'] = csrfToken;

  const options = {
    method,
    headers,
    redirect: 'manual',
  };
  if (body) options.body = body;

  const response = await fetch(url, options);
  const newCookies = extractCookies(response.headers);
  return { response, cookies: newCookies };
}

function parseGradeTable(html) {
  const tableMatch = html.match(/<table[^>]*summary="Boletim do Aluno"[^>]*>([\s\S]*?)<\/table>/i);
  if (!tableMatch) return [];

  const tableHtml = tableMatch[1];
  const rows = [];
  const tbodyMatch = tableHtml.match(/<tbody>([\s\S]*?)<\/tbody>/i);
  const tbodyHtml = tbodyMatch ? tbodyMatch[1] : tableHtml;

  const rowRegex = /<tr>([\s\S]*?)<\/tr>/gi;
  let rowMatch;
  while ((rowMatch = rowRegex.exec(tbodyHtml)) !== null) {
    const rowHtml = rowMatch[1];
    const cols = [];
    const colRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
    let colMatch;
    while ((colMatch = colRegex.exec(rowHtml)) !== null) {
      cols.push(colMatch[1].replace(/<[^>]+>/g, '').trim());
    }
    if (cols.length > 0) rows.push(cols);
  }
  return rows;
}

function cleanDisciplineName(name) {
  return name.replace(/^Normal\.\d+ - /, '');
}

function mapSubjectId(name) {
  const cleaned = cleanDisciplineName(name);
  for (const [key, value] of Object.entries(SUBJECT_MAP)) {
    if (cleaned.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  return null;
}

async function getGrades() {
  let cookies = '';

  const loginPageRes = await fetchWithCookies(`${SUAP_BASE}/accounts/login/`, 'GET', null, null, null);
  console.log("Status login page:", loginPageRes.response.status);
  const loginPageHtml = await loginPageRes.response.text();
  const csrfToken = extractCsrfToken(loginPageHtml);

  if (!csrfToken) {
    console.log("ERRO: CSRF token not found");
    throw new Error('CSRF token not found');
  }

  cookies = loginPageRes.cookies;

  const loginData = new URLSearchParams({
    username: SUAP_USER,
    password: SUAP_PASS,
    csrfmiddlewaretoken: csrfToken,
    next: '/',
  });

  const loginRes = await fetchWithCookies(
    `${SUAP_BASE}/accounts/login/`,
    'POST',
    loginData.toString(),
    cookies,
    csrfToken
  );

  console.log("Status após login:", loginRes.response.status);
  console.log("Headers após login:", JSON.stringify([...loginRes.response.headers]));

  cookies = loginRes.cookies;

  if (loginRes.response.status === 302) {
    const redirectMatch = loginRes.response.headers.get('Location');
    if (redirectMatch) {
      const redirectRes = await fetchWithCookies(`${SUAP_BASE}${redirectMatch}`, 'GET', null, cookies, csrfToken);
      cookies = redirectRes.cookies;
    }
  }

  const gradesRes = await fetchWithCookies(
    `${SUAP_BASE}/edu/aluno/${SUAP_USER}/?tab=boletim`,
    'GET',
    null,
    cookies,
    csrfToken
  );

  console.log("Status boletim:", gradesRes.response.status);
  console.log("URL final:", gradesRes.response.url);

  const gradesHtml = await gradesRes.response.text();
  const rows = parseGradeTable(gradesHtml);

  const disciplinas = [];
  const faltas = {};

  for (const row of rows) {
    if (row.length < 13) continue;

    const rawName = row[1];
    const name = cleanDisciplineName(rawName);
    const subjectId = mapSubjectId(name);
    const totalFaltas = parseInt(row[4]) || 0;

    const disciplina = {
      diario: row[0],
      nome: name,
      total_aulas: row[2],
      carga_horaria: row[3],
      total_faltas: row[4],
      frequencia: row[5],
      situacao: row[6],
      nota_e1: row[7],
      faltas_e1: row[8],
      media: row[9],
      nota_af: row[10],
      faltas_af: row[11],
      mfd: row[12],
      subject_id: subjectId,
      faltas_int: totalFaltas,
    };

    if (subjectId) {
      faltas[subjectId] = totalFaltas;
    }

    disciplinas.push(disciplina);
  }

  return {
    atualizadoEm: new Date().toISOString(),
    disciplinas,
    faltas,
  };
}

async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  console.log("Worker iniciado");

  try {
    const result = await getGrades();
    console.log("Disciplinas encontradas:", disciplinas.length);
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type' : 'application/json' },
    });
  } catch (error) {
    console.log("ERRO:", error.message, error.stack);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

addEventListener('fetch', (event) => {
  event.respondWith(
    handleRequest(event.request).then((response) => addCorsHeaders(response))
  );
});