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
    <AuthLayout title="Admin Login" subtitle="Access the admin dashboard">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-mono text-secondary mb-3 uppercase tracking-wider font-semibold"
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
            className="w-full px-4 py-3 bg-white border border-primary font-mono text-sm placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-primary transition-all-smooth shadow-[1px_1px_0_#232324] focus:shadow-[2px_2px_0_#232324]"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-mono text-secondary mb-3 uppercase tracking-wider font-semibold"
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
            className="w-full px-4 py-3 bg-white border border-primary font-mono text-sm placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-primary transition-all-smooth shadow-[1px_1px_0_#232324] focus:shadow-[2px_2px_0_#232324]"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-interactive w-full py-4 text-sm font-mono text-white bg-primary hover:bg-accent-green hover:text-primary disabled:opacity-50 transition-all-smooth tracking-wider uppercase border border-primary shadow-[1px_1px_0_#232324] hover:shadow-[2px_2px_0_#232324] hover:-translate-y-0.5 active:translate-y-0 font-semibold"
        >
          {loading ? "LOGGING IN..." : "LOGIN"}
        </button>
      </form>
    </AuthLayout>
  );
}