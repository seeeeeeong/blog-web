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
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[340px]">
        <Link
          to="/"
          className="flex items-center justify-center mb-10 font-semibold text-[15px] tracking-[0.04em] text-ink"
        >
          SEEEEEEONG.LOG
        </Link>

        <h1 className="text-[22px] font-bold tracking-[-0.015em] text-ink mb-6 text-center">
          Sign in
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 px-3 bg-[var(--c-input)] border border-rule rounded-md text-[13.5px] text-ink placeholder:text-faint outline-none focus:border-accent transition-colors"
            placeholder="Email"
          />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 px-3 bg-[var(--c-input)] border border-rule rounded-md text-[13.5px] text-ink placeholder:text-faint outline-none focus:border-accent transition-colors"
            placeholder="Password"
          />

          {errorMessage && (
            <p className="text-[12.5px] text-danger">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-accent text-[var(--c-on-accent)] rounded-md text-[13.5px] font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-[12.5px] text-muted hover:text-ink transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
