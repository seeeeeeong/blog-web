import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import { authApi } from "../api/auth";
import { useAlert } from "../contexts/AlertContext";
import AuthLayout from "../components/common/AuthLayout";
import { getUserIdFromToken } from "../utils/authToken";

interface LoginApiError {
  error?: {
    code?: string;
    message?: string;
  };
  message?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authApi.login({ email, password });
      const userId = getUserIdFromToken(response.accessToken);

      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      if (userId) {
        localStorage.setItem("userId", userId);
      }

      showSuccess("Logged in successfully!");
      navigate("/");
    } catch (err) {
      const axiosError = err as AxiosError<LoginApiError>;
      const errorCode = axiosError.response?.data?.error?.code;
      if (errorCode === "AUTH_009") {
        showError("Too many login attempts. Please try again later.");
        return;
      }

      const errorMessage =
        axiosError.response?.data?.error?.message ||
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Login failed.";
      showError(errorMessage);
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
