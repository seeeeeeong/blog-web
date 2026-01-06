import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useGitHubAuth } from "../../contexts/GitHubAuthContext";
import { authApi } from "../../api/auth";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const { isAuthenticated, user, logout } = useGitHubAuth();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("accessToken");

    if (userId && token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();

        if (isExpired) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("refreshTokenId");
          localStorage.removeItem("userId");
          localStorage.removeItem("nickname");
          setIsAdmin(false);
        } else {
          setIsAdmin(true);
        }
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("refreshTokenId");
        localStorage.removeItem("userId");
        localStorage.removeItem("nickname");
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, [location]);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("refreshTokenId");
      localStorage.removeItem("userId");
      localStorage.removeItem("nickname");
      setIsAdmin(false);
      logout();
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <nav className="border-b-2 border-gray-900 bg-gray-100">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex justify-between items-end py-5">
            <a
              href="/"
              className="text-sm font-mono text-gray-900 hover:text-gray-600 transition-colors"
            >
              / HOME
            </a>

            <div className="flex items-center gap-6 text-sm font-mono">
              {isAdmin && (
                <>
                  <Link
                    to="/admin/posts"
                    className="text-gray-900 hover:text-gray-600 transition-colors"
                  >
                    ADMIN
                  </Link>

                  <Link
                    to="/posts/create"
                    className="text-gray-900 hover:text-gray-600 transition-colors"
                  >
                    WRITE
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="text-gray-900 hover:text-gray-600 transition-colors"
                  >
                    LOGOUT
                  </button>
                </>
              )}

              {!isAdmin && isAuthenticated && user && (
                <div className="flex items-center gap-4">
                  <img
                    src={user.githubAvatarUrl || ''}
                    alt={user.githubUsername}
                    className="w-7 h-7 rounded-full border-2 border-gray-900"
                  />
                  <span className="text-sm font-mono text-gray-900 hidden sm:inline">
                    {user.githubUsername}
                  </span>
                  <button
                    onClick={logout}
                    className="text-gray-900 hover:text-gray-600 transition-colors"
                  >
                    LOGOUT
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t-2 border-gray-900 mt-auto bg-gray-100">
        <div className="container mx-auto px-6 py-10 max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <p className="text-sm font-mono text-gray-900">
              © 2025 seeeeeeong.log
            </p>
            <div className="flex gap-6 text-sm font-mono">
              <a
                href="https://github.com/seeeeeeong"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-900 hover:text-gray-600 transition-colors"
              >
                GitHub
              </a>
              <a
                href="mailto:lsinsung@gmail.com"
                className="text-gray-900 hover:text-gray-600 transition-colors"
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