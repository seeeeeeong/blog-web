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
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-30 bg-white/50 backdrop-blur-[14px] transition-all-smooth animate-fade-in">
        <nav className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-6 sm:gap-8">
              <a
                href="/"
                className="text-[11px] sm:text-xs font-mono text-primary hover:text-accent-green transition-all-smooth tracking-wider uppercase hover:scale-105 inline-block"
              >
                SEEEEEEONG.LOG
              </a>
              <a
                href="/"
                className="text-[11px] sm:text-xs font-mono text-tertiary hover:text-primary transition-all-smooth tracking-wide flex items-center gap-1 group"
              >
                <span className="hidden sm:inline transition-transform-smooth group-hover:translate-x-1">→</span>POSTS
              </a>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 text-[11px] sm:text-xs font-mono tracking-wide">
              {isAdmin && (
                <>
                  <Link
                    to="/admin/posts"
                    className="text-tertiary hover:text-primary transition-all-smooth uppercase relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
                  >
                    ADMIN
                  </Link>

                  <Link
                    to="/posts/create"
                    className="text-tertiary hover:text-primary transition-all-smooth uppercase relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
                  >
                    WRITE
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="text-tertiary hover:text-primary transition-all-smooth uppercase relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
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
                    className="w-6 h-6 rounded-full border border-border transition-transform-smooth hover:scale-110 hover:rotate-3"
                  />
                  <span className="text-[11px] sm:text-xs font-mono text-primary hidden sm:inline uppercase">
                    {user.githubUsername}
                  </span>
                  <button
                    onClick={logout}
                    className="text-tertiary hover:text-primary transition-all-smooth uppercase relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
                  >
                    LOGOUT
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
            <p className="text-[11px] sm:text-xs font-mono text-tertiary tracking-wide uppercase transition-all-smooth hover:text-primary">
              © 2025 SEEEEEEONG.LOG
            </p>
            <div className="flex gap-4 sm:gap-6 text-[11px] sm:text-xs font-mono tracking-wide">
              <a
                href="https://github.com/seeeeeeong"
                target="_blank"
                rel="noopener noreferrer"
                className="text-tertiary hover:text-primary transition-all-smooth uppercase relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full group"
              >
                <span className="inline-block transition-transform-smooth group-hover:-translate-y-0.5">GITHUB</span>
              </a>
              <a
                href="mailto:lsinsung@gmail.com"
                className="text-tertiary hover:text-primary transition-all-smooth uppercase relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full group"
              >
                <span className="inline-block transition-transform-smooth group-hover:-translate-y-0.5">CONTACT</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}