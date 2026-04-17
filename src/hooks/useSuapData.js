// src/hooks/useSuapData.js
//
// Lê src/data/boletim.json (gerado pelo suap_sync.py)
// e devolve os dados prontos para o AcademicDashboard.
//
// Uso no AcademicDashboard.jsx:
//   import { useSuapData } from "../../hooks/useSuapData";
//   const { faltas, setFaltas, disciplinas, atualizadoEm, loaded } = useSuapData();

import { useState, useEffect } from "react";

export function useSuapData() {
  const [faltas,       setFaltas]       = useState({});
  const [disciplinas,  setDisciplinas]  = useState([]);
  const [atualizadoEm, setAtualizadoEm] = useState(null);
  const [loaded,       setLoaded]       = useState(false);
  const [error,        setError]        = useState(null);

  useEffect(() => {
    // Vite expõe arquivos em /src/data/ via import dinâmico
    import("../data/boletim.json")
      .then((mod) => {
        const data = mod.default ?? mod;
        setFaltas(data.faltas       ?? {});
        setDisciplinas(data.disciplinas ?? []);
        setAtualizadoEm(data.atualizadoEm ?? null);
        setLoaded(true);
      })
      .catch((err) => {
        // Arquivo não existe ainda → dashboard funciona normalmente
        // com os valores manuais
        console.warn("[useSuapData] boletim.json não encontrado:", err.message);
        setError("boletim.json não encontrado — use valores manuais.");
        setLoaded(true);
      });
  }, []);

  return { faltas, setFaltas, disciplinas, atualizadoEm, loaded, error };
}
