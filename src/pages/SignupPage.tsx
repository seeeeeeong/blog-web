import type React from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import type { AxiosError } from "axios";
import { authApi } from "../api/auth";
import { useAlert } from "../contexts/AlertContext";
import AuthLayout from "../components/common/AuthLayout";

export default function SignupPage() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authApi.signup({ email, password, nickname });
      showSuccess("Sign up successful. Please log in.");
      navigate("/login");
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      showError(
        axiosError.response?.data?.message || "Sign up failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Create a new account">
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
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 font-mono text-base placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
          />
          <p className="mt-2 text-xs font-mono text-gray-500">Please enter at least 8 characters.</p>
        </div>

        <div>
          <label
            htmlFor="nickname"
            className="block text-sm font-mono font-semibold text-gray-900 mb-2"
          >
            Nickname
          </label>
          <input
            id="nickname"
            name="nickname"
            type="text"
            autoComplete="nickname"
            required
            minLength={2}
            maxLength={20}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 font-mono text-base placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
          />
          <p className="mt-2 text-xs font-mono text-gray-500">Please enter between 2-20 characters.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-sm font-mono text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 transition-all"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm font-mono">
          <span className="px-3 bg-white text-gray-500">or</span>
        </div>
      </div>
      <p className="text-center text-sm font-mono">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-gray-900 hover:text-gray-600 transition-colors"
        >
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}