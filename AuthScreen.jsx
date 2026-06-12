import { useState } from "react";
import { GraduationCap, Lock, User, LogIn, UserPlus, AlertCircle } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20">
            <GraduationCap size={28} className="text-violet-400" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-center">Dashboard Acadêmico</h1>
          <p className="text-xs text-slate-500 text-center">Engenharia de Computação · IFMT</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex gap-1 mb-4 bg-slate-800/50 rounded-xl p-1">
            <button type="button" onClick={() => switchMode("login")}
              className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all ${mode === "login" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"}`}>
              Entrar
            </button>
            <button type="button" onClick={() => switchMode("register")}
              className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all ${mode === "register" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"}`}>
              Criar conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Usuário</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input value={username} onChange={(e) => setUsername(e.target.value)} required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  placeholder="seu.nome" autoComplete="username" />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1 block">Senha</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  placeholder="••••••••" autoComplete={mode === "register" ? "new-password" : "current-password"} />
              </div>
            </div>

            {mode === "register" && (
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Confirmar senha</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    placeholder="••••••••" autoComplete="new-password" />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-bold py-2.5 rounded-lg transition-colors">
              {mode === "login" ? <LogIn size={14} /> : <UserPlus size={14} />}
              {mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          Seus dados ficam salvos apenas neste navegador. Cada colega tem sua própria
          conta, com progresso e faltas isolados dos demais.
        </p>
      </div>
    </div>
  );
}
