import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { clearAuthData, isExpiredToken, checkIsAdmin } from "../../../support/auth/authToken";
import { categoryApi } from "../../../../storage/category/categoryApi";
import type { Category } from "../../../domain/category";
import { ChatPanel } from "./ChatPanel";

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const adminMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const urlParams = new URLSearchParams(location.search);
  const qParam = urlParams.get("q") ?? "";
  const categoryParam = urlParams.get("category");

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
    categoryApi.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    refreshAdminState();
    setMobileChatOpen(false);
    setMobileNavOpen(false);
    setAdminMenuOpen(false);
    setSearchOpen(false);
    setSearchValue(qParam);
  }, [location.pathname, location.search, qParam]);

  useEffect(() => {
    if (searchOpen) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [searchOpen]);

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

  const isHome = location.pathname === "/";
  const isAllPosts = isHome && !categoryParam && !qParam;

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      {/* Topbar */}
      <header className="sticky top-0 z-30 h-[52px] bg-paper border-b border-rule flex items-center">
        <div className="w-full px-4 md:px-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              className="lg:hidden w-8 h-8 grid place-items-center rounded-md text-muted hover:text-ink hover:bg-chip transition-colors"
              aria-label="Menu"
            >
              {mobileNavOpen ? "×" : "≡"}
            </button>

            <Link to="/" className="flex items-center gap-2.5 min-w-0">
              <span className="w-6 h-6 rounded-md bg-ink text-paper grid place-items-center font-meta text-[11px] font-semibold">
                S
              </span>
              <span className="font-semibold text-[14.5px] tracking-[0.04em] text-ink">
                SEEEEEEONG.LOG
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-1.5">
            {searchOpen ? (
              <form
                onSubmit={submitSearch}
                className="hidden md:flex items-center gap-2 px-3 py-[5px] bg-paper-2 border border-accent rounded-md w-[260px] transition-all"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-faint shrink-0"
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
                    if (e.key === "Escape") {
                      setSearchOpen(false);
                      setSearchValue(qParam);
                    }
                  }}
                  onBlur={() => {
                    if (!searchValue.trim()) setSearchOpen(false);
                  }}
                  placeholder="Search"
                  className="flex-1 min-w-0 bg-transparent outline-none text-[13px] text-ink placeholder:text-faint"
                />
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="hidden md:grid w-8 h-8 place-items-center rounded-md text-muted hover:text-ink hover:bg-chip transition-colors"
                aria-label="Search"
                title="Search"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileChatOpen((v) => !v)}
              className="lg:hidden px-3 h-8 rounded-md border border-rule text-[12.5px] text-muted hover:text-ink hover:border-ink transition-colors"
            >
              Ask
            </button>

            {isAdmin ? (
              <div ref={adminMenuRef} className="hidden md:block relative">
                <button
                  type="button"
                  onClick={() => setAdminMenuOpen((v) => !v)}
                  className={`h-8 inline-flex items-center gap-1.5 px-3 rounded-md text-[12.5px] transition-colors ${
                    adminMenuOpen
                      ? "bg-chip text-ink"
                      : "text-muted hover:bg-chip hover:text-ink"
                  }`}
                  aria-haspopup="menu"
                  aria-expanded={adminMenuOpen}
                >
                  Admin
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
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
                    className="absolute right-0 top-full mt-1.5 min-w-[180px] border border-rule bg-paper shadow-[0_8px_24px_rgba(0,0,0,0.08)] rounded-md py-1 z-40"
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
                    <div className="h-px bg-rule my-1 mx-3" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-1.5 text-[13px] text-danger hover:bg-chip transition-colors"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:inline-flex h-8 items-center px-3 rounded-md text-[12.5px] text-muted hover:bg-chip hover:text-ink transition-colors"
              >
                Sign in
              </Link>
            )}

            <a
              href="https://github.com/seeeeeeong"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:grid w-8 h-8 place-items-center rounded-md text-muted hover:text-ink hover:bg-chip transition-colors"
              title="GitHub"
              aria-label="GitHub"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.35.78 1.05.78 2.12v3.14c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileNavOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-paper border-b border-rule shadow-[0_8px_20px_rgba(0,0,0,0.05)] z-30 animate-fade-in">
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              <WorkspaceTree
                categories={categories}
                isAllPosts={isAllPosts}
                categoryParam={categoryParam}
                onNavigate={() => setMobileNavOpen(false)}
              />
            </div>
          </div>
        )}
      </header>

      {/* 3-col shell */}
      <div className="flex-1 grid lg:grid-cols-[260px_minmax(0,1fr)_340px]">
        {/* Left workspace tree */}
        <aside className="hidden lg:block border-r border-rule bg-paper-2 sticky top-[52px] self-start h-[calc(100vh-52px)] overflow-y-auto px-3 py-4">
          <WorkspaceTree
            categories={categories}
            isAllPosts={isAllPosts}
            categoryParam={categoryParam}
          />
        </aside>

        {/* Main */}
        <main className="min-w-0 animate-fade-in">
          <Outlet />
        </main>

        {/* Right chat panel (desktop) */}
        <div className="hidden lg:block sticky top-[52px] self-start h-[calc(100vh-52px)]">
          <ChatPanel />
        </div>
      </div>

      {/* Mobile chat drawer */}
      {mobileChatOpen && (
        <>
          <div
            onClick={() => setMobileChatOpen(false)}
            className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-[1px] lg:hidden"
            aria-hidden
          />
          <div className="lg:hidden">
            <ChatPanel variant="drawer" onClose={() => setMobileChatOpen(false)} />
          </div>
        </>
      )}

      {/* Mobile ask FAB */}
      <button
        type="button"
        onClick={() => setMobileChatOpen((v) => !v)}
        className={`lg:hidden fixed bottom-5 right-5 z-40 h-11 px-4 rounded-full text-[12px] font-semibold transition-all shadow-[0_8px_20px_rgba(10,102,194,0.25)] ${
          mobileChatOpen
            ? "bg-ink text-paper"
            : "bg-accent text-paper"
        }`}
      >
        {mobileChatOpen ? "Close" : "Ask"}
      </button>
    </div>
  );
}

function WorkspaceTree({
  categories,
  isAllPosts,
  categoryParam,
  onNavigate,
}: {
  categories: Category[];
  isAllPosts: boolean;
  categoryParam: string | null;
  onNavigate?: () => void;
}) {
  return (
    <>
      <TreeSection title="Workspace">
        <TreeLink to="/" emoji="🏠" active={isAllPosts} onNavigate={onNavigate}>
          Overview
        </TreeLink>
        <TreeLink
          to="/"
          emoji="📝"
          active={isAllPosts}
          count={undefined}
          onNavigate={onNavigate}
        >
          All posts
        </TreeLink>
      </TreeSection>

      {categories.length > 0 && (
        <TreeSection title="Categories">
          {categories.map((c) => (
            <TreeLink
              key={c.id}
              to={`/?category=${c.id}`}
              emoji="●"
              active={categoryParam === String(c.id)}
              onNavigate={onNavigate}
            >
              {c.name}
            </TreeLink>
          ))}
        </TreeSection>
      )}
    </>
  );
}

function TreeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="flex items-center px-2.5 py-1 text-[10.5px] text-faint font-semibold uppercase tracking-[0.06em]">
        {title}
      </div>
      <div>{children}</div>
    </div>
  );
}

function TreeLink({
  to,
  emoji,
  active,
  count,
  children,
  onNavigate,
}: {
  to: string;
  emoji?: string;
  active?: boolean;
  count?: number;
  children: React.ReactNode;
  onNavigate?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={`flex items-center gap-2 px-2.5 py-1 my-px rounded-md text-[13.5px] transition-colors ${
        active
          ? "bg-accent-soft text-accent font-medium"
          : "text-ink-soft hover:bg-chip"
      }`}
    >
      {emoji && (
        <span className={`w-4 text-center text-[12px] shrink-0 ${active ? "text-accent" : "text-faint"}`}>
          {emoji}
        </span>
      )}
      <span className="truncate flex-1">{children}</span>
      {count !== undefined && (
        <span className="font-meta text-[10.5px] text-faint">{count}</span>
      )}
    </Link>
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
      className="block px-4 py-1.5 text-[13px] text-ink-soft hover:text-ink hover:bg-chip transition-colors"
    >
      {children}
    </Link>
  );
}
