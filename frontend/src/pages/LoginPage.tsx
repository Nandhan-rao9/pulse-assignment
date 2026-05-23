/**
 * Login Page - Modern Dark Mode
 */
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, LogIn, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black px-4 relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-primary-500/50 glow">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M10 8l14 8-14 8V8z" fill="white" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center justify-center gap-2">
            Pulse
            <Sparkles className="w-6 h-6 text-primary-400" />
          </h1>
          <p className="text-zinc-500">AI-Powered Video Management</p>
        </div>

        {/* Form */}
        <div className="glass rounded-2xl shadow-2xl p-8 border border-zinc-800">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900/80 border border-zinc-700 text-zinc-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-zinc-600"
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-zinc-900/80 border border-zinc-700 text-zinc-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-zinc-600"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold rounded-xl hover:from-primary-500 hover:to-primary-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-primary-500/30 glow-hover"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <LogIn size={20} strokeWidth={2.5} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
            >
              Sign up
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <p className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
              Demo Accounts:
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                <span className="font-semibold text-purple-400">Admin:</span>
                <span className="text-zinc-400 font-mono">admin@pulse.com / admin123</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                <span className="font-semibold text-blue-400">Editor/Viewer:</span>
                <span className="text-zinc-400">Register new account</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
