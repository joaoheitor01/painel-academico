import { useState } from "react";
import { GraduationCap, Lock, User, LogIn, UserPlus, AlertCircle, ArrowRight } from "lucide-react";
import { registerUser, loginUser } from "./auth";

export default function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function switchMode(next) {
    setMode(next);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let userKey;
      if (mode === "register") {
        if (password !== confirm) throw new Error("As senhas não coincidem.");
        userKey = await registerUser(username, password);
      } else {
        userKey = await loginUser(username, password);
      }
      onAuthenticated(userKey);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-[#F2F1F6] border border-transparent rounded-xl pl-9 pr-3 py-3 " +
    "text-sm text-[#1C1C1E] placeholder-gray-400 " +
    "focus:outline-none focus:ring-2 focus:ring-violet-200 transition-all";

  return (
    <div className="min-h-screen bg-[#F2F1F6] flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white shadow-sm p-3 mb-1">
            <GraduationCap size={28} className="text-violet-600" />
          </div>
          <h1 className="text-[22px] font-bold text-[#1C1C1E] text-center">Dashboard Acadêmico</h1>
          <p className="text-sm text-[#6D6D72] text-center">Engenharia de Computação · IFMT</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          {/* Segmented control (iOS) */}
          <div className="bg-gray-100 rounded-2xl p-1 flex mb-5">
            {[["login", "Entrar"], ["register", "Criar conta"]].map(([k, label]) => (
              <button key={k} type="button" onClick={() => switchMode(k)}
                className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors ${
                  mode === k ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">Usuário</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={username} onChange={(e) => setUsername(e.target.value)} required
                  className={inputClass} placeholder="seu.nome" autoComplete="username" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">Senha</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className={inputClass} placeholder="••••••••"
                  autoComplete={mode === "register" ? "new-password" : "current-password"} />
              </div>
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5">Confirmar senha</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required
                    className={inputClass} placeholder="••••••••" autoComplete="new-password" />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5">
                <AlertCircle size={15} className="text-[#FF3B30] shrink-0" />
                <span className="text-sm text-[#FF3B30] leading-tight">{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50
                text-white text-sm font-semibold py-3.5 rounded-xl transition-all">
              {mode === "login" ? <LogIn size={15} /> : <UserPlus size={15} />}
              {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#6D6D72] mt-6 px-2">
          Seus dados ficam salvos apenas neste navegador. Cada colega tem sua própria
          conta, com progresso e faltas isolados dos demais.
        </p>
      </div>
    </div>
  );
}
