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
    <div className="flex items-center justify-center px-6 py-16 md:py-24 min-h-[70vh]">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-[22px] font-semibold tracking-tighter-plus text-ink mb-1.5">
            Sign in
          </h1>
          <p className="text-[13px] text-muted">Admin authentication required.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-border-dim bg-raised p-6 space-y-4"
        >
          <div>
            <label htmlFor="email" className="block text-[12px] font-medium text-muted mb-1.5">
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
              className="w-full h-9 px-3 bg-bg border border-border-dim rounded-md text-[13px] text-ink placeholder:text-faint outline-none focus:border-border-mid transition-colors"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-[12px] font-medium text-muted mb-1.5">
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
              className="w-full h-9 px-3 bg-bg border border-border-dim rounded-md text-[13px] text-ink placeholder:text-faint outline-none focus:border-border-mid transition-colors"
              placeholder="••••••••"
            />
          </div>

          {errorMessage && (
            <p className="text-[12px] text-danger">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-9 rounded-md bg-white text-black text-[13px] font-medium hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-[12px] text-muted hover:text-ink transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
