import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useGitHubAuth } from "../../contexts/useGitHubAuth";
import { authApi } from "../../api/auth";
import { isAdminToken, isExpiredToken } from "../../utils/authToken";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const { isAuthenticated, user, logout } = useGitHubAuth();

  const clearAuthData = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    setIsAdmin(false);
  }, []);

  const checkTokenExpiration = useCallback(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setIsAdmin(false);
      return;
    }

    if (isExpiredToken(token)) {
      clearAuthData();
      return;
    }

    setIsAdmin(isAdminToken(token));
  }, [clearAuthData]);

  useEffect(() => {
    checkTokenExpiration();
  }, [checkTokenExpiration, location.pathname]);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } finally {
      clearAuthData();
      logout();
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full border-b border-gray-300">
        <nav className="w-full lg:px-8 px-4">
          <div className="flex justify-between items-center min-h-12 py-2 sm:h-12 sm:py-0">
            <div className="flex items-center gap-3 sm:gap-6 min-w-0">
              <Link
                to="/"
                className="font-mono text-xs sm:text-sm font-semibold text-text hover:opacity-60 transition-opacity truncate"
              >
                SEEEEEEONG.LOG
              </Link>
              <Link
                to="/"
                className="hidden sm:inline font-mono text-xs text-muted hover:text-text transition-colors"
              >
                Feed
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 font-mono text-[11px] sm:text-xs shrink-0">
              {isAdmin && (
                <>
                  <Link
                    to="/admin/posts"
                    className="text-muted hover:text-text transition-colors whitespace-nowrap"
                  >
                    Admin
                  </Link>
                  <Link
                    to="/posts/create"
                    className="text-muted hover:text-text transition-colors whitespace-nowrap"
                  >
                    Write
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-muted hover:text-text transition-colors whitespace-nowrap"
                  >
                    Logout
                  </button>
                </>
              )}

              {!isAdmin && isAuthenticated && user && (
                <div className="flex items-center gap-2 sm:gap-3">
                  <img
                    src={user.githubAvatarUrl || ""}
                    alt={user.githubUsername}
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-gray-300"
                  />
                  <span className="text-text hidden sm:inline">
                    {user.githubUsername}
                  </span>
                  <button
                    onClick={logout}
                    className="text-muted hover:text-text transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-300 mt-auto">
        <div className="w-full lg:px-8 px-4 py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center font-mono text-xs text-muted">
            <span>&copy; 2026 SEEEEEEONG.LOG</span>
            <div className="flex gap-4">
              <a
                href="https://github.com/seeeeeeong"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text transition-colors"
              >
                GitHub
              </a>
              <a
                href="mailto:lsinsung@gmail.com"
                className="hover:text-text transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
