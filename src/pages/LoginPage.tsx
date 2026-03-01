import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import { authApi } from "../api/auth";
import AuthLayout from "../components/common/AuthLayout";
import { getUserIdFromToken } from "../utils/authToken";
import { extractApiErrorMessage } from "../utils/error";

interface LoginApiError {
  error?: {
    code?: string;
    message?: string;
  };
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
      if (userId) {
        localStorage.setItem("userId", userId);
      }

      navigate("/");
    } catch (err) {
      const axiosError = err as AxiosError<LoginApiError>;
      const errorCode = axiosError.response?.data?.error?.code;
      if (errorCode === "AUTH_009") {
        setErrorMessage("로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.");
      } else {
        setErrorMessage(extractApiErrorMessage(err, "로그인에 실패했습니다."));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Admin Login" subtitle="Access the admin dashboard">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-mono text-muted mb-2"
          >
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
            className="w-full px-3 py-2 border-b border-gray-500 bg-transparent font-mono text-base text-text placeholder:text-gray-400 focus:outline-none focus:border-text transition-colors"
            placeholder="admin@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-mono text-muted mb-2"
          >
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
            className="w-full px-3 py-2 border-b border-gray-500 bg-transparent font-mono text-base text-text placeholder:text-gray-400 focus:outline-none focus:border-text transition-colors"
            placeholder="••••••••"
          />
        </div>

        {errorMessage && (
          <p className="font-mono text-sm text-red-600">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 font-mono text-sm font-semibold text-white bg-text hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Logging in..." : "LOGIN"}
        </button>
      </form>
    </AuthLayout>
  );
}
