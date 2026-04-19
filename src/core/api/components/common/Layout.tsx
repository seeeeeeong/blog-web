import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { clearAuthData, isExpiredToken, checkIsAdmin } from "../../../support/auth/authToken";
import { categoryApi } from "../../../../storage/category/categoryApi";
import type { Category } from "../../../domain/category";
import { useTheme } from "../../../support/hooks/useTheme";

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { theme, toggleTheme } = useTheme();

  const urlParams = new URLSearchParams(location.search);
  const categoryParam = urlParams.get("category");
  const qParam = urlParams.get("q");
  const isHomeAll = location.pathname === "/" && !categoryParam && !qParam;

  const refreshAdminState = () => {
    if (isExpiredToken(localStorage.getItem("accessToken") ?? "")) {
      clearAuthData();
      setIsAdmin(false);
      return;
    }
    setIsAdmin(checkIsAdmin());
  };

  const handleLogout = () => {
    clearAuthData();
    setIsAdmin(false);
    navigate("/");
  };

  useEffect(() => {
    refreshAdminState();
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    categoryApi.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setSearchValue(qParam ?? "");
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [searchOpen, qParam]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (!q) return;
    navigate(`/?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg/70 backdrop-blur-xl border-b border-border-dim">
        <div className="max-w-[1100px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8 min-w-0">
            <Link
              to="/"
              className="flex items-center gap-2 font-semibold text-[14px] tracking-[0.02em] text-ink shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 76 65" fill="currentColor" aria-hidden="true">
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
              </svg>
              <span>
                SEEEEEEONG<span className="text-ghost">.</span>LOG
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-[13px] text-muted">
              <Link
                to="/"
                className={isHomeAll ? "text-ink" : "hover:text-ink transition-colors"}
              >
                Blog
              </Link>
              {categories.slice(0, 3).map((cat) => {
                const active = categoryParam === String(cat.id);
                return (
                  <Link
                    key={cat.id}
                    to={`/?category=${cat.id}`}
                    className={active ? "text-ink" : "hover:text-ink transition-colors"}
                  >
                    {cat.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {searchOpen ? (
              <form onSubmit={submitSearch} className="flex items-center gap-1">
                <div className="relative">
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-faint pointer-events-none"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setSearchOpen(false);
                    }}
                    placeholder="Search posts…"
                    className="h-8 w-44 sm:w-56 pl-8 pr-3 rounded-md border border-border-dim bg-raised text-[13px] text-ink placeholder:text-faint focus:border-border-mid outline-none transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="h-8 w-8 rounded-md text-muted hover:text-ink transition-colors"
                  aria-label="Close search"
                >
                  ×
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="h-8 w-8 rounded-md border border-border-dim hover:border-border-mid flex items-center justify-center text-muted hover:text-ink transition-colors"
                aria-label="Search"
                title="Search"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </button>
            )}
            <button
              onClick={toggleTheme}
              className="h-8 w-8 rounded-md border border-border-dim hover:border-border-mid flex items-center justify-center text-muted hover:text-ink transition-colors"
              title={theme === "dark" ? "Light mode" : "Dark mode"}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              ) : (
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            {isAdmin ? (
              <>
                <Link
                  to="/posts/create"
                  className="hidden sm:inline-flex h-8 px-3 rounded-md border border-border-dim hover:border-border-mid text-[13px] text-muted hover:text-ink items-center transition-colors"
                >
                  New
                </Link>
                <Link
                  to="/admin/posts"
                  className="hidden sm:inline-flex h-8 px-3 rounded-md border border-border-dim hover:border-border-mid text-[13px] text-muted hover:text-ink items-center transition-colors"
                >
                  Admin
                </Link>
                <button
                  onClick={handleLogout}
                  className="h-8 px-3 rounded-md bg-white text-black text-[13px] font-medium hover:bg-gray-100 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="h-8 px-3 rounded-md bg-white text-black text-[13px] font-medium hover:bg-gray-100 flex items-center transition-colors"
              >
                Sign In
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden h-8 w-8 rounded-md border border-border-dim text-muted"
              aria-label="Menu"
            >
              {mobileOpen ? "✕" : "≡"}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border-dim bg-bg">
            <nav className="max-w-[1100px] mx-auto px-6 py-3 flex flex-col gap-1 text-[13px]">
              <Link
                to="/"
                className={`py-2 ${isHomeAll ? "text-ink" : "text-muted"}`}
              >
                Blog
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/?category=${cat.id}`}
                  className={`py-2 ${categoryParam === String(cat.id) ? "text-ink" : "text-muted"}`}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border-dim">
        <div className="max-w-[1100px] mx-auto px-6 py-10 flex flex-wrap items-center justify-between gap-4">
          <span className="font-mono text-[12px] text-faint">© 2026 seeeeeeong — deployed on Vercel</span>
          <div className="flex items-center gap-5 text-[13px] text-muted">
            <a href="https://github.com/seeeeeeong" target="_blank" rel="noopener noreferrer" className="hover:text-ink transition-colors">
              GitHub
            </a>
            <a href="mailto:lsinsung@gmail.com" className="hover:text-ink transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
