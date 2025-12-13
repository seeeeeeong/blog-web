import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useGitHubAuth } from "../../contexts/GitHubAuthContext";

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
          localStorage.removeItem("userId");
          localStorage.removeItem("nickname");
          setIsAdmin(false);
        } else {
          setIsAdmin(true);
        }
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("nickname");
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("nickname");
    setIsAdmin(false);
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navigation */}
      <nav className="border-b border-gray-900 bg-gray-100">
        <div className="container mx-auto px-4 sm:px-8 max-w-7xl">
          <div className="flex justify-between items-end py-4">
            {/* Logo */}
            <a
              href="/"
              className="text-sm font-mono text-gray-900 hover:underline"
            >
              / HOME
            </a>

            {/* Menu */}
            <div className="flex items-center gap-4 sm:gap-6 text-sm font-mono">
              {isAdmin && (
                <>
                  <Link
                    to="/admin/posts"
                    className="text-gray-900 hover:underline"
                  >
                    ADMIN
                  </Link>

                  <Link
                    to="/posts/create"
                    className="text-gray-900 hover:underline"
                  >
                    WRITE
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="text-gray-900 hover:underline"
                  >
                    LOGOUT
                  </button>
                </>
              )}

              {!isAdmin && isAuthenticated && user && (
                <div className="flex items-center gap-3">
                  <img
                    src={user.githubAvatarUrl || ''}
                    alt={user.githubUsername}
                    className="w-6 h-6 rounded-full border border-gray-900"
                  />
                  <span className="text-xs font-mono text-gray-900 hidden sm:inline">
                    {user.githubUsername}
                  </span>
                  <button
                    onClick={logout}
                    className="text-gray-900 hover:underline text-xs"
                  >
                    LOGOUT
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Body */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 mt-auto bg-gray-100">
        <div className="container mx-auto px-4 sm:px-8 py-8 max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-xs font-mono text-gray-900">
              © 2025 seeeeeeong.log
            </p>
            <div className="flex gap-4 text-xs font-mono">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:underline">
                GitHub
              </a>
              <a href="mailto:contact@example.com" className="text-gray-900 hover:underline">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}