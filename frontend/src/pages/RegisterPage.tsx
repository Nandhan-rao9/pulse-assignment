/**
 * Register Page - Dark Mode
 */
import { useState, type FormEvent, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, UserPlus, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  organisation: string;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    organisation: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (form.password.length < 6) {
      return void toast.error("Password must be at least 6 characters.");
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.organisation);
      toast.success("Account created successfully!");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || "Registration failed.");
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
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-primary-500/50 glow">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M10 8l14 8-14 8V8z" fill="white" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center justify-center gap-2">
            Join Pulse
            <Sparkles className="w-6 h-6 text-primary-400" />
          </h1>
          <p className="text-zinc-500">Create your account</p>
        </div>

        <div className="glass rounded-2xl shadow-2xl p-8 border border-zinc-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-900/80 border border-zinc-700 text-zinc-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-zinc-600"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-900/80 border border-zinc-700 text-zinc-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-zinc-600"
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">
                Organisation <span className="text-zinc-600 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                name="organisation"
                value={form.organisation}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-900/80 border border-zinc-700 text-zinc-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-zinc-600"
                placeholder="Your company"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 bg-zinc-900/80 border border-zinc-700 text-zinc-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-zinc-600"
                  placeholder="Min 6 characters"
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
              className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold rounded-xl hover:from-primary-500 hover:to-primary-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-primary-500/30 glow-hover mt-6"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <UserPlus size={20} strokeWidth={2.5} />
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
