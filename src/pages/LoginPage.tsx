import type React from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import type { AxiosError } from "axios";
import { authApi } from "../api/auth";
import { getUserIdFromToken } from "../utils/authToken";
import { extractApiErrorMessage } from "../utils/error";

interface LoginApiError {
  error?: { code?: string; message?: string };
  message?: string;
}

export default function LoginPage() {
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
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-bold mb-1">Login</h1>
        <p className="text-sm text-ink-light mb-6">Admin authentication</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-ink-light mb-1">Email</label>
            <input
              id="email" name="email" type="email" autoComplete="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3 border-[1.5px] border-ink-ghost rounded-md text-sm outline-none focus:border-ink transition-colors"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-ink-light mb-1">Password</label>
            <input
              id="password" name="password" type="password" autoComplete="current-password" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 px-3 border-[1.5px] border-ink-ghost rounded-md text-sm outline-none focus:border-ink transition-colors"
              placeholder="••••••••"
            />
          </div>

          {errorMessage && (
            <div className="text-danger text-xs">{errorMessage}</div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full h-10 text-sm font-semibold bg-accent text-accent-text rounded-md hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? "..." : "Login"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/" className="text-xs text-ink-light hover:text-ink transition-colors">&larr; Back to blog</Link>
        </div>
      </div>
    </div>
  );
}
