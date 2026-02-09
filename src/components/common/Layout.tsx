import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useGitHubAuth } from "../../contexts/GitHubAuthContext";
import { authApi } from "../../api/auth";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const { isAuthenticated, user, logout } = useGitHubAuth();

  const checkTokenExpiration = () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("accessToken");

    if (!userId || !token) {
      setIsAdmin(false);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();

      if (isExpired) {
        clearAuthData();
      } else {
        setIsAdmin(true);
      }
    } catch {
      clearAuthData();
    }
  };

  useEffect(() => {
    checkTokenExpiration();
  }, [location]);

  const clearAuthData = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("refreshTokenId");
    localStorage.removeItem("userId");
    localStorage.removeItem("nickname");
    setIsAdmin(false);
  };

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
      <header className="w-full border-b border-border">
        <nav className="w-full lg:px-8 px-4">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center gap-6">
              <Link
                to="/"
                className="font-mono text-sm text-gray-800 hover:text-text underline"
              >
                / HOME
              </Link>
              <Link
                to="/"
                className="font-mono text-sm text-gray-800 hover:text-text underline"
              >
                / FEED
              </Link>
            </div>

            <div className="flex items-center gap-4 font-mono text-sm">
              {isAdmin && (
                <>
                  <Link
                    to="/admin/posts"
                    className="text-gray-800 hover:text-text underline"
                  >
                    / ADMIN
                  </Link>
                  <Link
                    to="/posts/create"
                    className="text-gray-800 hover:text-text underline"
                  >
                    / WRITE
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-800 hover:text-text underline"
                  >
                    / LOGOUT
                  </button>
                </>
              )}

              {!isAdmin && isAuthenticated && user && (
                <div className="flex items-center gap-3">
                  <img
                    src={user.githubAvatarUrl || ''}
                    alt={user.githubUsername}
                    className="w-5 h-5 rounded-full border border-border"
                  />
                  <span className="text-text hidden sm:inline">
                    {user.githubUsername}
                  </span>
                  <button
                    onClick={logout}
                    className="text-gray-800 hover:text-text underline"
                  >
                    / LOGOUT
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

      <footer className="border-t border-border mt-auto">
        <div className="w-full lg:px-8 px-4 py-6">
          <div className="flex justify-between items-center font-mono text-xs text-muted">
            <span>&copy; 2025 Seeeeeeong.log</span>
            <div className="flex gap-4">
              <a
                href="https://github.com/seeeeeeong"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text underline"
              >
                GitHub
              </a>
              <a
                href="mailto:lsinsung@gmail.com"
                className="hover:text-text underline"
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
