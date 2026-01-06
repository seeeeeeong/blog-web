import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import { authApi } from "../api/auth";
import { useAlert } from "../contexts/AlertContext";
import AuthLayout from "../components/common/AuthLayout";

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

      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("refreshTokenId", response.refreshTokenId);
      localStorage.setItem("userId", String(response.user.id));
      localStorage.setItem("nickname", response.user.nickname);

      showSuccess("Logged in successfully!");
      navigate("/");
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      showError(axiosError.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Admin Login">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-mono font-semibold text-gray-900 mb-2"
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
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 font-mono text-base placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-mono font-semibold text-gray-900 mb-2"
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
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 font-mono text-base placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-sm font-mono text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 transition-all"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </AuthLayout>
  );
}