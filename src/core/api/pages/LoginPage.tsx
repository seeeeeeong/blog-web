import type React from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import type { AxiosError } from "axios";
import { authApi } from "../../../storage/user/authApi";
import { getUserIdFromToken } from "../../support/auth/authToken";
import { extractApiErrorMessage } from "../../support/error/error";

interface LoginApiError {
  error?: { code?: string; message?: string };
  message?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await authApi.login({ email, password });
      const userId = getUserIdFromToken(response.accessToken);
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      if (userId) localStorage.setItem("userId", userId);
      navigate("/");
    } catch (err) {
      // authApi.login은 Axios 호출이므로 AxiosError로 단언 안전
      const axiosError = err as AxiosError<LoginApiError>;
      const errorCode = axiosError.response?.data?.error?.code;
      if (errorCode === "AUTH_009") {
        setErrorMessage("Too many login attempts. Please try again later.");
      } else {
        setErrorMessage(extractApiErrorMessage(err, "Login failed."));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-panel flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Terminal window */}
        <div className="border border-ink-ghost rounded-lg overflow-hidden">
          {/* Title bar */}
          <div className="bg-surface flex items-center gap-1.5 px-3 py-2">
            <div className="w-[10px] h-[10px] rounded-full bg-[#ff5f57]" />
            <div className="w-[10px] h-[10px] rounded-full bg-[#febc2e]" />
            <div className="w-[10px] h-[10px] rounded-full bg-[#28c840]" />
            <span className="text-[10px] text-ink-faint ml-2">login — zsh</span>
          </div>

          {/* Body */}
          <div className="bg-panel p-5">
            <div className="text-xs text-term-green mb-1">$ sudo authenticate</div>
            <p className="text-[11px] text-ink-faint mb-5">Admin authentication required</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-[11px] text-ink-faint mb-1">email:</label>
                <input
                  id="email" name="email" type="email" autoComplete="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-9 px-3 bg-surface border border-ink-ghost rounded text-xs text-term-white outline-none focus:border-term-green transition-colors"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-[11px] text-ink-faint mb-1">password:</label>
                <input
                  id="password" name="password" type="password" autoComplete="current-password" required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-9 px-3 bg-surface border border-ink-ghost rounded text-xs text-term-white outline-none focus:border-term-green transition-colors"
                  placeholder="••••••••"
                />
              </div>

              {errorMessage && (
                <div className="text-danger text-xs">[ERR] {errorMessage}</div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full h-9 text-xs font-semibold bg-term-green text-panel rounded hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                {loading ? "authenticating..." : "login"}
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link to="/" className="text-[11px] text-ink-faint hover:text-term-green transition-colors">$ cd ~/blog</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
