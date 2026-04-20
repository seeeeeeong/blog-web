import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { clearAuthData, isExpiredToken, checkIsAdmin } from "../../../support/auth/authToken";
import { adminAiApi } from "../../../../storage/admin/adminAiApi";
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
  const searchInputRef = useRef<HTMLInputElement>(null);
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
    navigate("/");
  };

  useEffect(() => {
    refreshAdminState();
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

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
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <nav className="sticky top-0 z-30 border-b border-rule bg-paper/95 backdrop-blur">
        <div className="max-w-[1180px] mx-auto px-6 md:px-10 py-5 md:py-6 grid grid-cols-[1fr_auto_1fr] items-center gap-6">
          <div className="hidden md:flex gap-6 text-[13px] text-muted">
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
            <Link
              to="/?category=1"
              className="hover:text-ink transition-colors"
            >
              Categories
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
                className="hover:text-ink transition-colors"
              >
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

          <div className="flex items-center justify-end gap-2 md:gap-3 font-meta text-[11px] text-muted">
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
            {isAdmin && (
              <div className="hidden md:flex gap-2">
                <Link
                  to="/posts/create"
                  className="h-[30px] inline-flex items-center px-2.5 border border-rule rounded-sm text-muted hover:border-ink hover:text-ink transition-colors lowercase tracking-[0.06em]"
                >
                  :new
                </Link>
                <Link
                  to="/admin/posts"
                  className="h-[30px] inline-flex items-center px-2.5 border border-rule rounded-sm text-muted hover:border-ink hover:text-ink transition-colors lowercase tracking-[0.06em]"
                >
                  :admin
                </Link>
                <Link
                  to="/admin/rag"
                  className="h-[30px] inline-flex items-center px-2.5 border border-rule rounded-sm text-muted hover:border-ink hover:text-ink transition-colors lowercase tracking-[0.06em]"
                >
                  :rag
                </Link>
                <BackfillButton />
                <button
                  onClick={handleLogout}
                  className="h-[30px] inline-flex items-center px-2.5 border border-rule rounded-sm text-danger hover:border-danger transition-colors lowercase tracking-[0.06em]"
                >
                  :logout
                </button>
              </div>
            )}
            {!isAdmin && (
              <Link
                to="/login"
                className="hidden md:inline-flex h-[30px] items-center px-2.5 border border-rule rounded-sm text-muted hover:border-ink hover:text-ink transition-colors lowercase tracking-[0.06em]"
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
                  <Link to="/posts/create" className="py-2 text-ink-soft hover:text-ink">:new</Link>
                  <Link to="/admin/posts" className="py-2 text-ink-soft hover:text-ink">:admin</Link>
                  <Link to="/admin/rag" className="py-2 text-ink-soft hover:text-ink">:rag</Link>
                  <button onClick={handleLogout} className="py-2 text-left text-danger">
                    :logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="py-2 text-ink-soft hover:text-ink">:login</Link>
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

function BackfillButton() {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");

  const run = async () => {
    setStatus("running");
    try {
      const contentCount = await adminAiApi.backfillContent();
      const embedCount = await adminAiApi.backfillEmbedding();
      alert(`Backfill 완료\n- Content: ${contentCount}개\n- Embedding: ${embedCount}개`);
      setStatus("done");
    } catch {
      alert("Backfill 실패");
      setStatus("error");
    } finally {
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const label =
    status === "running" ? "running…" : status === "done" ? "done" : ":backfill";

  return (
    <button
      onClick={run}
      disabled={status === "running"}
      className={`h-[30px] inline-flex items-center px-2.5 border rounded-sm transition-colors lowercase tracking-[0.06em] disabled:opacity-50 ${
        status === "done"
          ? "border-accent text-accent"
          : status === "error"
            ? "border-danger text-danger"
            : "border-rule text-muted hover:border-ink hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
