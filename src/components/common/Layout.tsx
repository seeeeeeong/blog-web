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
      <header className="fixed top-0 left-0 right-0 z-30 bg-card/80 backdrop-blur-[8px] transition-all-smooth animate-fade-in">
        <nav className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-6 sm:gap-8">
              <a
                href="/"
                className="text-base sm:text-lg font-sans text-text hover:text-accent transition-all-smooth hover:scale-105 inline-block font-semibold"
              >
                Seeeeeeong.log
              </a>
              <a
                href="/"
                className="text-sm sm:text-base font-sans text-muted hover:text-text transition-all-smooth"
              >
                Posts
              </a>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 text-sm sm:text-base font-sans">
              {isAdmin && (
                <>
                  <Link
                    to="/admin/posts"
                    className="text-muted hover:text-text transition-all-smooth relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-text after:transition-all hover:after:w-full"
                  >
                    Admin
                  </Link>

                  <Link
                    to="/posts/create"
                    className="text-muted hover:text-text transition-all-smooth relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-text after:transition-all hover:after:w-full"
                  >
                    Write
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="text-muted hover:text-text transition-all-smooth relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-text after:transition-all hover:after:w-full"
                  >
                    Logout
                  </button>
                </>
              )}

              {!isAdmin && isAuthenticated && user && (
                <div className="flex items-center gap-3">
                  <img
                    src={user.githubAvatarUrl || ''}
                    alt={user.githubUsername}
                    className="w-6 h-6 rounded-full border border-border transition-transform-smooth hover:scale-110 hover:rotate-3"
                  />
                  <span className="text-sm sm:text-base font-sans text-text hidden sm:inline">
                    {user.githubUsername}
                  </span>
                  <button
                    onClick={logout}
                    className="text-muted hover:text-text transition-all-smooth relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-text after:transition-all hover:after:w-full"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
            <p className="text-sm sm:text-base font-sans text-muted transition-all-smooth hover:text-text">
              © 2025 Seeeeeeong.log
            </p>
            <div className="flex gap-4 sm:gap-6 text-sm sm:text-base font-sans">
              <a
                href="https://github.com/seeeeeeong"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-text transition-all-smooth relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-text after:transition-all hover:after:w-full group"
              >
                <span className="inline-block transition-transform-smooth group-hover:-translate-y-0.5">GitHub</span>
              </a>
              <a
                href="mailto:lsinsung@gmail.com"
                className="text-muted hover:text-text transition-all-smooth relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-text after:transition-all hover:after:w-full group"
              >
                <span className="inline-block transition-transform-smooth group-hover:-translate-y-0.5">Contact</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}