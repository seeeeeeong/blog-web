import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGitHubAuth } from "../../contexts/useGitHubAuth";
import { authApi } from "../../api/auth";
import { isAdminToken, isExpiredToken } from "../../utils/authToken";

const CAT_GIF_URL =
  "https://dszw1qtcnsa5e.cloudfront.net/community/20200813/db5c1766-f649-4481-855f-f941907987a6/4CB499DDCDD14524ADE779FF2C82EE57.gif";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const pointerCatRef = useRef<HTMLImageElement | null>(null);
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

  useEffect(() => {
    const cat = pointerCatRef.current;

    if (!cat) {
      return;
    }

    const canTrackPointer =
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!canTrackPointer) {
      cat.style.display = "none";
      return;
    }

    cat.style.display = "block";

    const target = {
      x: Math.max(window.innerWidth - 140, 40),
      y: Math.max(window.innerHeight - 140, 40),
    };
    const current = { ...target };
    let animationId = 0;

    const animate = () => {
      current.x += (target.x - current.x) * 0.14;
      current.y += (target.y - current.y) * 0.14;
      cat.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
      animationId = window.requestAnimationFrame(animate);
    };

    const handleMouseMove = (event: MouseEvent) => {
      target.x = Math.min(event.clientX + 18, window.innerWidth - 64);
      target.y = Math.min(event.clientY + 20, window.innerHeight - 64);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    animationId = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.cancelAnimationFrame(animationId);
    };
  }, []);

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
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center gap-6">
              <Link
                to="/"
                className="font-mono text-sm font-semibold text-text hover:opacity-60 transition-opacity"
              >
                SEEEEEEONG.LOG
              </Link>
              <Link
                to="/"
                className="font-mono text-xs text-muted hover:text-text transition-colors"
              >
                Feed
              </Link>
            </div>

            <div className="flex items-center gap-4 font-mono text-xs">
              {isAdmin && (
                <>
                  <Link
                    to="/admin/posts"
                    className="text-muted hover:text-text transition-colors"
                  >
                    Admin
                  </Link>
                  <Link
                    to="/posts/create"
                    className="text-muted hover:text-text transition-colors"
                  >
                    Write
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-muted hover:text-text transition-colors"
                  >
                    Logout
                  </button>
                </>
              )}

              {!isAdmin && isAuthenticated && user && (
                <div className="flex items-center gap-3">
                  <img
                    src={user.githubAvatarUrl || ""}
                    alt={user.githubUsername}
                    className="w-5 h-5 rounded-full border border-gray-300"
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
          <div className="flex justify-between items-center font-mono text-xs text-muted">
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
      <div aria-hidden="true" className="background-cat" />
      <img
        ref={pointerCatRef}
        className="pointer-cat"
        src={CAT_GIF_URL}
        alt=""
        aria-hidden="true"
      />
    </div>
  );
}
