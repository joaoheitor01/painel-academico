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
    "w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 " +
    "font-body-md text-body-md text-gray-900 placeholder-gray-400 " +
    "focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-all";

  const tabClass = (active) =>
    `flex-1 py-3.5 text-center font-label-caps text-label-caps uppercase transition-colors border-b-2 ${
      active ? "text-primary border-primary" : "text-gray-500 border-transparent hover:text-gray-900"
    }`;

  return (
    <div className="min-h-screen bg-background text-on-background flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 border border-gray-200 mb-1">
            <GraduationCap size={26} className="text-gray-700" />
          </div>
          <h1 className="font-headline-md text-headline-md text-gray-900 text-center">Dashboard Acadêmico</h1>
          <p className="font-body-md text-body-md text-gray-500 text-center">Engenharia de Computação · IFMT</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button type="button" onClick={() => switchMode("login")} className={tabClass(mode === "login")}>
              Entrar
            </button>
            <button type="button" onClick={() => switchMode("register")} className={tabClass(mode === "register")}>
              Criar conta
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block font-label-caps text-label-caps text-gray-700 mb-2">Usuário</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={username} onChange={(e) => setUsername(e.target.value)} required
                  className={inputClass} placeholder="seu.nome" autoComplete="username" />
              </div>
            </div>

            <div>
              <label className="block font-label-caps text-label-caps text-gray-700 mb-2">Senha</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className={inputClass} placeholder="••••••••"
                  autoComplete={mode === "register" ? "new-password" : "current-password"} />
              </div>
            </div>

            {mode === "register" && (
              <div>
                <label className="block font-label-caps text-label-caps text-gray-700 mb-2">Confirmar senha</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required
                    className={inputClass} placeholder="••••••••" autoComplete="new-password" />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                <AlertCircle size={15} className="text-red-600 shrink-0" />
                <span className="font-body-md text-body-md text-red-700 leading-tight">{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50
                text-on-primary font-label-caps text-label-caps uppercase py-3 rounded-xl transition-all">
              {mode === "login" ? <LogIn size={15} /> : <UserPlus size={15} />}
              {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>
        </div>

        <p className="text-center font-body-md text-body-md text-gray-500 mt-6 px-2">
          Seus dados ficam salvos apenas neste navegador. Cada colega tem sua própria
          conta, com progresso e faltas isolados dos demais.
        </p>
      </div>
    </div>
  );
}
