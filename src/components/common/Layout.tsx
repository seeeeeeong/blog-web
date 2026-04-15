import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAdminToken, isExpiredToken } from "../../utils/authToken";
import { categoryApi } from "../../api/category";
import type { Category } from "../../types";
import { useTheme } from "../../hooks/useTheme";

export function Layout() {
  // 1. Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // 2. 파생 상태
  const isActivePath = (path: string) => location.pathname === path;
  const categoryParam = new URLSearchParams(location.search).get("category");

  // 3. 이벤트 핸들러
  const clearAuthData = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    setIsAdmin(false);
  };

  const checkTokenExpiration = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) { setIsAdmin(false); return; }
    if (isExpiredToken(token)) { clearAuthData(); return; }
    setIsAdmin(isAdminToken(token));
  };

  const handleLogout = () => {
    clearAuthData();
    navigate("/");
  };

  // Side Effects
  useEffect(() => {
    checkTokenExpiration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    categoryApi.getCategories().then(setCategories).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Terminal Title Bar */}
      <div className="bg-surface border-b border-ink-ghost px-4 h-10 flex items-center gap-3 sticky top-0 z-50">
        {/* macOS dots */}
        <div className="flex gap-1.5">
          <div className="w-[10px] h-[10px] rounded-full bg-[#ff5f57]" />
          <div className="w-[10px] h-[10px] rounded-full bg-[#febc2e]" />
          <div className="w-[10px] h-[10px] rounded-full bg-[#28c840]" />
        </div>
        <div className="text-[11px] text-ink-faint flex items-center gap-1.5 ml-2">
          <span className="text-term-green">~</span>/blog
          <span className="text-term-green">·</span>
          zsh
        </div>

        {/* Theme toggle + Mobile menu toggle */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={toggleTheme}
            className="text-ink-faint hover:text-term-green transition-colors text-[11px]"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? "light" : "dark"}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-ink-faint text-sm"
          >
            {mobileMenuOpen ? "✕" : "≡"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-panel border-b border-ink-ghost px-4 py-3">
          <nav className="flex flex-col gap-1">
            <Link
              to="/"
              className={`text-xs px-2 py-1.5 rounded ${isActivePath("/") && !categoryParam ? "text-term-green" : "text-ink-faint hover:text-ink"}`}
            >
              {">"} all
            </Link>
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/?category=${cat.id}`}
                className={`text-xs px-2 py-1.5 rounded ${categoryParam === String(cat.id) ? "text-term-green" : "text-ink-faint hover:text-ink"}`}
              >
                {cat.name.toLowerCase()}
              </Link>
            ))}
          </nav>
          {isAdmin && (
            <div className="mt-3 pt-3 border-t border-ink-ghost flex flex-col gap-1">
              <Link to="/admin/posts" className="text-xs px-2 py-1.5 text-term-amber">admin</Link>
              <Link to="/posts/create" className="text-xs px-2 py-1.5 text-term-blue">new post</Link>
              <button onClick={handleLogout} className="text-xs px-2 py-1.5 text-left text-danger">logout</button>
            </div>
          )}
        </div>
      )}

      {/* Shell */}
      <main className="flex-1">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6">
          {/* Navigation prompt */}
          <div className="pt-6 pb-4 border-b border-ink-ghost mb-6">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3">
              {/* Bio */}
              <Link to="/" className="text-sm font-bold text-term-white hover:text-term-green transition-colors">
                seeeeeeong
              </Link>
              <div className="hidden sm:flex items-center gap-3 ml-auto text-[11px]">
                <a
                  href="https://github.com/seeeeeeong"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-term-green border-b border-dashed border-term-green-dim hover:text-term-white"
                >
                  github
                </a>
                <a
                  href="mailto:lsinsung@gmail.com"
                  className="text-term-green border-b border-dashed border-term-green-dim hover:text-term-white"
                >
                  contact
                </a>
              </div>
            </div>

            {/* Nav as command output */}
            <nav className="hidden lg:flex items-center gap-4 text-xs">
              <Link
                to="/"
                className={`transition-colors ${isActivePath("/") && !categoryParam ? "text-term-green before:content-['>_']" : "text-ink-faint hover:text-term-green"}`}
              >
                all
              </Link>
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/?category=${cat.id}`}
                  className={`transition-colors ${categoryParam === String(cat.id) ? "text-term-green before:content-['>_']" : "text-ink-faint hover:text-term-green"}`}
                >
                  {cat.name.toLowerCase()}
                </Link>
              ))}

              {isAdmin && (
                <>
                  <span className="text-ink-ghost">|</span>
                  <Link
                    to="/admin/posts"
                    className={`transition-colors ${isActivePath("/admin/posts") ? "text-term-amber" : "text-ink-faint hover:text-term-amber"}`}
                  >
                    admin
                  </Link>
                  <Link
                    to="/posts/create"
                    className="text-ink-faint hover:text-term-blue transition-colors"
                  >
                    new
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-ink-faint hover:text-danger transition-colors"
                  >
                    logout
                  </button>
                </>
              )}
            </nav>
          </div>

          <Outlet />

          {/* Footer prompt */}
          <div className="py-6 mt-4 border-t border-ink-ghost text-[10px] text-ink-faint flex gap-4">
            <span>© 2026 seeeeeeong</span>
            <a href="https://github.com/seeeeeeong" target="_blank" rel="noopener noreferrer" className="hover:text-term-green">GitHub</a>
            <a href="mailto:lsinsung@gmail.com" className="hover:text-term-green">Contact</a>
          </div>
        </div>
      </main>
    </div>
  );
}
