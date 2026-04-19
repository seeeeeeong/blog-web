import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { clearAuthData, isExpiredToken, checkIsAdmin } from "../../../support/auth/authToken";
import { categoryApi } from "../../../../storage/category/categoryApi";
import type { Category } from "../../../domain/category";
import { useTheme } from "../../../support/hooks/useTheme";

function routePath(pathname: string, search: string): string {
  if (pathname === "/") {
    const params = new URLSearchParams(search);
    if (params.get("q")) return "blog/search";
    if (params.get("category")) return "blog/posts";
    return "blog";
  }
  if (pathname.startsWith("/posts/create")) return "blog/posts/new";
  if (pathname.startsWith("/posts/") && pathname.endsWith("/edit")) return "blog/posts/edit";
  if (pathname.startsWith("/posts/")) return `blog/posts/${pathname.split("/")[2]}`;
  if (pathname.startsWith("/chat")) return "blog/chat";
  if (pathname.startsWith("/admin")) return "blog/admin";
  if (pathname.startsWith("/login")) return "blog/login";
  return "blog" + pathname;
}

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

  const currentPath = routePath(location.pathname, location.search);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Terminal chrome bar */}
      <div className="sticky top-0 z-40 bg-bg-2 border-b border-border-dim">
        <div className="h-8 flex items-center px-4 gap-3 text-[11px] text-muted">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-cat-pink" />
            <div className="w-3 h-3 rounded-full bg-cat-amber" />
            <div className="w-3 h-3 rounded-full bg-cat-green" />
          </div>
          <div className="flex-1 text-center truncate">— zsh — ~/{currentPath} — 120×36</div>
          <div className="hidden sm:block text-faint">100% ▲</div>
        </div>

        {/* Prompt-style nav */}
        <header className="border-t border-border-dim">
          <div className="max-w-[1200px] mx-auto px-6 h-12 flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-0 text-[13px] min-w-0 shrink-0">
              <span className="prompt-green">sinseong</span>
              <span className="prompt-muted">@</span>
              <span className="prompt-blue">journal</span>
              <span className="prompt-muted mx-1">:</span>
              <span className="prompt-amber truncate">~/{currentPath}</span>
              <span className="prompt-pink mx-2">❯</span>
            </Link>

            <nav className="hidden md:flex items-center gap-5 text-[12px]">
              <Link
                to="/"
                className={isHomeAll ? "text-ink-bright" : "text-muted hover:text-ink-bright transition-colors"}
              >
                ./blog
              </Link>
              {categories.slice(0, 3).map((cat) => {
                const active = categoryParam === String(cat.id);
                return (
                  <Link
                    key={cat.id}
                    to={`/?category=${cat.id}`}
                    className={active ? "text-cat-amber" : "text-muted hover:text-cat-amber transition-colors"}
                  >
                    ./{cat.name.toLowerCase()}
                  </Link>
                );
              })}
              <Link
                to="/chat"
                className={
                  location.pathname.startsWith("/chat")
                    ? "text-cat-green"
                    : "text-muted hover:text-cat-green transition-colors"
                }
              >
                ./chat
              </Link>
            </nav>

            <div className="flex items-center gap-1.5">
              {searchOpen ? (
                <form onSubmit={submitSearch} className="flex items-center gap-1">
                  <div className="flex items-center h-7 border border-border-mid bg-bg-2 px-2 text-[12px]">
                    <span className="prompt-green mr-1.5">grep</span>
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setSearchOpen(false);
                      }}
                      placeholder="pattern…"
                      className="w-40 sm:w-52 bg-transparent text-ink placeholder:text-faint outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="h-7 w-7 text-muted hover:text-ink-bright"
                    aria-label="Close search"
                  >
                    ×
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="h-7 px-2 border border-border-dim hover:border-border-mid text-[11px] text-muted hover:text-cat-green transition-colors"
                  title="Search"
                >
                  grep
                </button>
              )}
              <button
                onClick={toggleTheme}
                className="h-7 w-7 border border-border-dim hover:border-border-mid flex items-center justify-center text-muted hover:text-cat-amber transition-colors text-[12px]"
                title={theme === "dark" ? "Light mode" : "Dark mode"}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? "☼" : "☾"}
              </button>
              {isAdmin ? (
                <>
                  <Link
                    to="/posts/create"
                    className="hidden sm:inline-flex h-7 px-2.5 border border-border-dim hover:border-cat-green text-[11px] text-muted hover:text-cat-green items-center transition-colors"
                  >
                    :new
                  </Link>
                  <Link
                    to="/admin/posts"
                    className="hidden sm:inline-flex h-7 px-2.5 border border-border-dim hover:border-cat-amber text-[11px] text-muted hover:text-cat-amber items-center transition-colors"
                  >
                    :admin
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="h-7 px-2.5 border border-cat-pink text-cat-pink hover:bg-cat-pink hover:text-bg text-[11px] transition-colors"
                  >
                    :logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="h-7 px-2.5 border border-cat-green text-cat-green hover:bg-cat-green hover:text-bg text-[11px] flex items-center transition-colors"
                >
                  :login
                </Link>
              )}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden h-7 w-7 border border-border-dim text-muted text-[12px]"
                aria-label="Menu"
              >
                {mobileOpen ? "×" : "≡"}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="md:hidden border-t border-border-dim bg-bg-2">
              <nav className="max-w-[1200px] mx-auto px-6 py-2 flex flex-col text-[12px]">
                <Link
                  to="/"
                  className={`py-2 ${isHomeAll ? "text-ink-bright" : "text-muted"}`}
                >
                  ./blog
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/?category=${cat.id}`}
                    className={`py-2 ${categoryParam === String(cat.id) ? "text-cat-amber" : "text-muted"}`}
                  >
                    ./{cat.name.toLowerCase()}
                  </Link>
                ))}
                <Link
                  to="/chat"
                  className={`py-2 ${location.pathname.startsWith("/chat") ? "text-cat-green" : "text-muted"}`}
                >
                  ./chat
                </Link>
              </nav>
            </div>
          )}
        </header>
      </div>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-dashed border-border-mid mt-10">
        <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-[11px] text-muted">
          <span>
            <span className="prompt-green">$</span> exit &nbsp;·&nbsp; © 2026 sinseong
          </span>
          <div className="flex items-center gap-5">
            <a
              href="https://github.com/seeeeeeong"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cat-green transition-colors"
            >
              github
            </a>
            <a href="mailto:lsinsung@gmail.com" className="hover:text-cat-green transition-colors">
              contact
            </a>
            <span className="prompt-green">connection closed</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
