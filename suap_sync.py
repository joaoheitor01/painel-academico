"""
suap_sync.py
─────────────────────────────────────────────────────────────────────────────
Faz login no SUAP, captura o boletim e gera:
  → src/data/boletim.json   (dados brutos + formato para o dashboard)

Uso:
  python suap_sync.py
  python suap_sync.py --usuario 2024178440032 --senha SuaSenha
  python suap_sync.py --out ../meu-projeto/src/data/boletim.json

Instale:
  pip install requests beautifulsoup4
"""

import argparse
import getpass
import json
import os
import sys
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("❌  Instale: pip install requests beautifulsoup4")
    sys.exit(1)

# ── Constantes ─────────────────────────────────────────────────────────────────
BASE_URL    = "https://suap.ifmt.edu.br"
LOGIN_URL   = f"{BASE_URL}/accounts/login/"
BOLETIM_URL = f"{BASE_URL}/edu/aluno/{{usuario}}/?tab=boletim"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "pt-BR,pt;q=0.9",
}

# ── Mapeamento nome → ID do dashboard ─────────────────────────────────────────
# Ajuste se os nomes das disciplinas mudarem
NOME_PARA_ID: dict[str, str] = {
    "Cálculo Numérico":                      "ENC-23",
    "Compiladores":                          "ENC-33",
    "Engenharia de Software":                "ENC-31",
    "Equações Diferenciais":                "ENC-21",
    "Extensão I":                            "ENC-34",
    "Laboratório de Circuitos Elétricos I": "ENC-30",
    "Programação WEB":                      "ENC-32",
}


# ── Estrutura de dados ─────────────────────────────────────────────────────────
@dataclass
class Disciplina:
    diario:        str
    nome:          str
    total_aulas:   str
    carga_horaria: str
    total_faltas:  str
    frequencia:    str
    situacao:      str
    nota_e1:       str
    faltas_e1:     str
    media:         str
    nota_af:       str
    faltas_af:     str
    mfd:           str
    # campos extras para o dashboard
    subject_id:    str = "-"
    faltas_int:    int = 0


def _text(el) -> str:
    return el.get_text(strip=True) if el else "-"


# ── Login ──────────────────────────────────────────────────────────────────────
def login(usuario: str, senha: str) -> requests.Session:
    session = requests.Session()
    session.headers.update(HEADERS)

    print("🔐  Obtendo CSRF...")
    r = session.get(LOGIN_URL, timeout=15)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "html.parser")

    hidden = soup.find("input", {"name": "csrfmiddlewaretoken"})
    csrf = hidden["value"] if hidden else session.cookies.get("csrftoken", "")
    if not csrf:
        raise RuntimeError("CSRF token não encontrado.")

    print("🔑  Autenticando...")
    r = session.post(LOGIN_URL, data={
        "username": usuario,
        "password": senha,
        "csrfmiddlewaretoken": csrf,
        "next": "/",
    }, headers={**HEADERS, "Referer": LOGIN_URL}, allow_redirects=True, timeout=15)
    r.raise_for_status()

    if "accounts/login" in r.url or "Usuário ou senha incorretos" in r.text:
        raise PermissionError("Login falhou. Verifique usuário e senha.")

    print(f"✅  Logado! → {r.url}")
    return session


# ── Scraping ───────────────────────────────────────────────────────────────────
def fetch_boletim(session: requests.Session, usuario: str) -> list[Disciplina]:
    url = BOLETIM_URL.format(usuario=usuario)
    print(f"📥  Buscando boletim: {url}")

    r = session.get(url, timeout=15)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "html.parser")

    tabela = soup.find("table", {"summary": "Boletim do Aluno"})
    if not tabela:
        secao = soup.find(id=lambda x: x and "boletim" in str(x).lower())
        tabela = secao.find("table") if secao else None
    if not tabela:
        raise RuntimeError("Tabela do boletim não encontrada.")

    disciplinas: list[Disciplina] = []
    for tr in tabela.find("tbody").find_all("tr"):
        cols = tr.find_all("td")
        if len(cols) < 12:
            continue

        nome_raw = _text(cols[1])
        # Remove o prefixo "Normal.XXXX - " do nome
        nome = nome_raw.split(" - ", 1)[-1].strip() if " - " in nome_raw else nome_raw

        faltas_str = _text(cols[4]).replace("-", "0")
        try:
            faltas_int = int(faltas_str)
        except ValueError:
            faltas_int = 0

        # Tenta mapear para o ID do dashboard
        subject_id = "-"
        for chave, sid in NOME_PARA_ID.items():
            if chave.lower() in nome.lower():
                subject_id = sid
                break

        disciplinas.append(Disciplina(
            diario        = _text(cols[0]),
            nome          = nome,
            total_aulas   = _text(cols[2]),
            carga_horaria = _text(cols[3]),
            total_faltas  = _text(cols[4]),
            frequencia    = _text(cols[5]),
            situacao      = _text(cols[6]),
            nota_e1       = _text(cols[7]),
            faltas_e1     = _text(cols[8]),
            media         = _text(cols[9]),
            nota_af       = _text(cols[10]),
            faltas_af     = _text(cols[11]),
            mfd           = _text(cols[12]) if len(cols) > 12 else "-",
            subject_id    = subject_id,
            faltas_int    = faltas_int,
        ))

    return disciplinas


# ── Exportação ─────────────────────────────────────────────────────────────────
def export_json(disciplinas: list[Disciplina], out_path: Path) -> None:
    """
    Gera o JSON que o hook useSuapData.js consome no dashboard.
    Formato:
    {
      "atualizadoEm": "2026-04-16T14:32:00",
      "disciplinas": [ { ...campos... } ],
      "faltas": { "ENC-24": 10, "ENC-22": 8, ... }
    }
    """
    out_path.parent.mkdir(parents=True, exist_ok=True)

    # Mapa de faltas no formato que o AbsenceTab já usa: { "ENC-XX": N }
    faltas_map = {
        d.subject_id: d.faltas_int
        for d in disciplinas
        if d.subject_id != "-"
    }

    payload = {
        "atualizadoEm": datetime.now().isoformat(timespec="seconds"),
        "disciplinas":  [asdict(d) for d in disciplinas],
        "faltas":       faltas_map,
    }

    out_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"💾  JSON exportado → {out_path}")

    # Preview no terminal
    print("\n📊  Faltas capturadas:")
    for sid, f in faltas_map.items():
        nome = next((d.nome for d in disciplinas if d.subject_id == sid), sid)
        print(f"    {sid}  {nome:<45}  {f} falta(s)")

    nao_mapeadas = [d.nome for d in disciplinas if d.subject_id == "-"]
    if nao_mapeadas:
        print("\n⚠️  Disciplinas não mapeadas (adicione em NOME_PARA_ID):")
        for n in nao_mapeadas:
            print(f"    • {n}")


# ── CLI ────────────────────────────────────────────────────────────────────────
def main():
    p = argparse.ArgumentParser(description="Sincroniza boletim SUAP → Dashboard React")
    p.add_argument("--usuario", "-u", default=None)
    p.add_argument("--senha",   "-s", default=None)
    p.add_argument("--out",     "-o",
                   default="public/data/boletim.json",
                   help="Caminho de saída do JSON (padrão: public/data/boletim.json)")
    args = p.parse_args()

    usuario = args.usuario or os.environ.get("SUAP_USER") or input("👤  Usuário (matrícula): ").strip()
    senha   = args.senha   or os.environ.get("SUAP_PASS") or getpass.getpass("🔒  Senha: ")

    try:
        session     = login(usuario, senha)
        disciplinas = fetch_boletim(session, usuario)
        if not disciplinas:
            print("⚠️  Nenhuma disciplina encontrada.")
            return
        export_json(disciplinas, Path(args.out))
        print(f"\n✅  Sincronização concluída — {len(disciplinas)} disciplinas.")
    except PermissionError as e:
        print(f"❌  {e}"); sys.exit(1)
    except requests.exceptions.ConnectionError:
        print("❌  Sem conexão. Verifique sua internet."); sys.exit(1)
    except Exception as e:
        print(f"❌  Erro: {e}"); raise


if __name__ == "__main__":
    main()
