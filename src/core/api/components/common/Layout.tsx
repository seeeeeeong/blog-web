import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { clearAuthData, isExpiredToken, checkIsAdmin } from "../../../support/auth/authToken";
import { useTheme } from "../../../support/hooks/useTheme";
import { ChatDrawer } from "./ChatDrawer";

function formatToday(): string {
  const d = new Date();
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const adminMenuRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  const urlParams = new URLSearchParams(location.search);
  const qParam = urlParams.get("q");
  const categoryParam = urlParams.get("category");
  const isHome = location.pathname === "/";
  const isArchive = isHome && Boolean(categoryParam || qParam);

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
    setAdminMenuOpen(false);
    navigate("/");
  };

  useEffect(() => {
    refreshAdminState();
    setMobileOpen(false);
    setSearchOpen(false);
    setAdminMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (searchOpen) {
      setSearchValue(qParam ?? "");
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [searchOpen, qParam]);

  useEffect(() => {
    if (!adminMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!adminMenuRef.current?.contains(e.target as Node)) {
        setAdminMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAdminMenuOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [adminMenuOpen]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (!q) return;
    navigate(`/?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <nav className="sticky top-0 z-30 border-b border-rule bg-paper/95 backdrop-blur">
        <div className="max-w-[1180px] mx-auto px-6 md:px-10 py-5 md:py-6 grid grid-cols-[1fr_auto_1fr] items-center gap-6">
          <div className="hidden md:flex gap-6 text-[13px] text-muted items-center">
            <Link
              to="/"
              className={`relative py-1 hover:text-ink transition-colors ${
                isHome && !isArchive
                  ? "text-ink after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-ink"
                  : ""
              }`}
            >
              Home
            </Link>
            {searchOpen ? (
              <form onSubmit={submitSearch} className="flex items-center gap-1">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setSearchOpen(false);
                  }}
                  onBlur={() => setSearchOpen(false)}
                  placeholder="search…"
                  className="w-40 bg-transparent border-b border-rule focus:border-ink outline-none text-[13px] text-ink placeholder:text-faint pb-0.5"
                />
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="hover:text-ink transition-colors inline-flex items-center gap-1.5"
                aria-label="Search"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                Search
              </button>
            )}
          </div>

          <Link to="/" className="text-center leading-none select-none">
            <span className="block font-meta text-[10px] tracking-[0.25em] text-muted uppercase mb-1.5">
              Est. MMXXV — seeeeeeong.log
            </span>
            <span className="font-display text-[24px] md:text-[28px] font-medium tracking-[-0.02em] text-ink">
              The Reading Room
            </span>
          </Link>

          <div className="flex items-center justify-end gap-2 md:gap-2.5 font-meta text-[11px] text-muted">
            <button
              type="button"
              onClick={() => setChatOpen((v) => !v)}
              className={`hidden md:inline-flex h-[30px] items-center px-3 rounded-sm border transition-colors lowercase tracking-[0.06em] ${
                chatOpen
                  ? "border-accent text-accent bg-accent-soft"
                  : "border-rule text-muted hover:border-ink hover:text-ink"
              }`}
              aria-label="Toggle chat"
            >
              :ask
            </button>

            {isAdmin ? (
              <div ref={adminMenuRef} className="hidden md:block relative">
                <button
                  type="button"
                  onClick={() => setAdminMenuOpen((v) => !v)}
                  className={`h-[30px] inline-flex items-center gap-1.5 px-3 rounded-sm border transition-colors lowercase tracking-[0.06em] ${
                    adminMenuOpen
                      ? "border-ink text-ink bg-paper-2"
                      : "border-rule text-muted hover:border-ink hover:text-ink"
                  }`}
                  aria-haspopup="menu"
                  aria-expanded={adminMenuOpen}
                >
                  :admin
                  <svg
                    width="9"
                    height="9"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform ${adminMenuOpen ? "rotate-180" : ""}`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {adminMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 min-w-[180px] border border-rule bg-paper shadow-[0_12px_32px_rgba(0,0,0,0.18)] py-1.5 z-40"
                  >
                    <AdminMenuItem to="/posts/create" onSelect={() => setAdminMenuOpen(false)}>
                      New post
                    </AdminMenuItem>
                    <AdminMenuItem to="/admin/posts" onSelect={() => setAdminMenuOpen(false)}>
                      All posts
                    </AdminMenuItem>
                    <AdminMenuItem to="/admin/rag" onSelect={() => setAdminMenuOpen(false)}>
                      Index
                    </AdminMenuItem>
                    <div className="h-px bg-rule-soft my-1.5 mx-3" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 font-body text-[14px] text-danger hover:bg-paper-2 transition-colors"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:inline-flex h-[30px] items-center px-3 border border-rule rounded-sm text-muted hover:border-ink hover:text-ink transition-colors lowercase tracking-[0.06em]"
              >
                :login
              </Link>
            )}

            <button
              onClick={toggleTheme}
              className="w-[30px] h-[30px] rounded-full border border-rule hover:border-ink flex items-center justify-center transition-colors"
              title={theme === "dark" ? "Light" : "Dark"}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden w-[30px] h-[30px] rounded-sm border border-rule text-muted text-[14px] flex items-center justify-center"
              aria-label="Menu"
            >
              {mobileOpen ? "×" : "≡"}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-rule bg-paper">
            <div className="max-w-[1180px] mx-auto px-6 py-3 flex flex-col text-[14px]">
              <Link to="/" className="py-2 text-ink-soft hover:text-ink">Home</Link>
              <button
                onClick={() => {
                  setChatOpen(true);
                  setMobileOpen(false);
                }}
                className="py-2 text-left text-accent"
              >
                Ask
              </button>
              {isAdmin ? (
                <>
                  <div className="h-px bg-rule-soft my-1.5" />
                  <Link to="/posts/create" className="py-2 text-ink-soft hover:text-ink">
                    New post
                  </Link>
                  <Link to="/admin/posts" className="py-2 text-ink-soft hover:text-ink">
                    All posts
                  </Link>
                  <Link to="/admin/rag" className="py-2 text-ink-soft hover:text-ink">
                    Index
                  </Link>
                  <button onClick={handleLogout} className="py-2 text-left text-danger">
                    Log out
                  </button>
                </>
              ) : (
                <Link to="/login" className="py-2 text-ink-soft hover:text-ink">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <div className="max-w-[1180px] mx-auto w-full px-6 md:px-10 pt-8 md:pt-9 pb-6 flex justify-between items-baseline border-b-2 border-ink font-meta text-[11px] tracking-[0.2em] uppercase text-muted">
        <span>{formatToday()}</span>
        <span className="hidden sm:inline font-display text-[12px] tracking-[0.15em] text-ink font-medium normal-case">
          Essays · Notes · Readings
        </span>
        <span>Vol · {new Date().getFullYear()}</span>
      </div>

      <main className="flex-1 max-w-[1180px] w-full mx-auto">
        <Outlet />
      </main>

      <footer className="border-t border-rule mt-16">
        <div className="max-w-[1180px] mx-auto px-6 md:px-10 py-10 flex flex-wrap items-center justify-between gap-4 font-meta text-[11px] text-muted tracking-[0.1em] uppercase">
          <span>© {new Date().getFullYear()} — seeeeeeong</span>
          <div className="flex items-center gap-5">
            <a
              href="https://github.com/seeeeeeong"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink transition-colors"
            >
              github
            </a>
            <a href="mailto:lsinsung@gmail.com" className="hover:text-ink transition-colors">
              contact
            </a>
            <span>fin.</span>
          </div>
        </div>
      </footer>

      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />

      <button
        type="button"
        onClick={() => setChatOpen((v) => !v)}
        className={`md:hidden fixed bottom-5 right-5 z-40 h-12 px-4 rounded-full border font-meta text-[11px] tracking-[0.15em] uppercase transition-all ${
          chatOpen
            ? "bg-ink text-paper border-ink"
            : "bg-paper text-ink border-rule shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
        }`}
      >
        {chatOpen ? "close" : "ask"}
      </button>
    </div>
  );
}

function AdminMenuItem({
  to,
  onSelect,
  children,
}: {
  to: string;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      onClick={onSelect}
      role="menuitem"
      className="block px-4 py-2 font-body text-[14px] text-ink-soft hover:text-ink hover:bg-paper-2 transition-colors"
    >
      {children}
    </Link>
  );
}
