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
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">Please enter at least 8 characters.</p>
        </div>

        <div>
          <label
            htmlFor="nickname"
            className="block text-sm font-medium text-gray-700"
          >
            Nickname
          </label>
          <div className="mt-1">
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
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">Please enter between 2-20 characters.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">or</span>
        </div>
      </div>
      <p className="text-center text-sm">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-gray-900 hover:underline"
        >
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}