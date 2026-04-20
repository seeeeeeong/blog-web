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
    <div className="min-h-screen bg-paper flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link to="/" className="block text-center mb-10 leading-none">
          <span className="block font-meta text-[10px] tracking-[0.25em] text-muted uppercase mb-1.5">
            Est. MMXXV
          </span>
          <span className="font-display text-[24px] font-medium tracking-[-0.02em] text-ink">
            The Reading Room
          </span>
        </Link>

        <div className="mb-8 text-center">
          <p className="eyebrow mb-2">Private</p>
          <h1 className="font-display text-[32px] font-medium tracking-[-0.02em] text-ink leading-none mb-2">
            Sign in
          </h1>
          <p className="font-body italic text-[14px] text-muted">
            Admin authentication required.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border border-rule bg-paper-2/40 p-6 space-y-4"
        >
          <div>
            <label htmlFor="email" className="block eyebrow mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3 bg-paper border border-rule text-[14px] text-ink placeholder:text-faint outline-none focus:border-ink transition-colors font-body"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block eyebrow mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 px-3 bg-paper border border-rule text-[14px] text-ink placeholder:text-faint outline-none focus:border-ink transition-colors font-body"
              placeholder="••••••••"
            />
          </div>

          {errorMessage && (
            <p className="font-body text-[13px] text-danger italic">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-ink text-paper font-meta text-[12px] uppercase tracking-[0.12em] hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="font-meta text-[11px] text-muted hover:text-ink transition-colors tracking-[0.08em] uppercase"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
