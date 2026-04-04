import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useGitHubAuth } from "../../contexts/useGitHubAuth";
import { authApi } from "../../api/auth";
import { isAdminToken, isExpiredToken } from "../../utils/authToken";
import { categoryApi } from "../../api/category";
import { postApi } from "../../api/post";
import type { Category, PostSummary } from "../../types";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const { isAuthenticated, user, logout } = useGitHubAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularPosts, setPopularPosts] = useState<PostSummary[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const clearAuthData = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    setIsAdmin(false);
  }, []);

  const checkTokenExpiration = useCallback(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) { setIsAdmin(false); return; }
    if (isExpiredToken(token)) { clearAuthData(); return; }
    setIsAdmin(isAdminToken(token));
  }, [clearAuthData]);

  useEffect(() => {
    checkTokenExpiration();
  }, [checkTokenExpiration, location.pathname]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    categoryApi.getCategories().then(setCategories).catch(() => {});
    postApi.getPopularPosts(3).then(setPopularPosts).catch(() => {});
  }, []);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } finally {
      clearAuthData();
      logout();
      navigate("/");
    }
  };

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-screen">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-panel px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-white font-bold text-[15px]">seeeeeeong</Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-panel-text text-xl leading-none"
        >
          {mobileMenuOpen ? "\u2715" : "\u2630"}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-panel pt-14 px-6 py-6 overflow-y-auto">
          <div className="text-xs text-panel-muted mb-1">Backend Developer</div>
          <nav className="flex flex-col gap-1 mt-4">
            <Link to="/" className={`text-sm px-3 py-2 rounded ${isActivePath("/") ? "bg-panel-active text-white" : "text-panel-muted"}`}>All Posts</Link>
            {categories.map(cat => (
              <Link key={cat.id} to={`/?category=${cat.id}`} className="text-sm px-3 py-2 rounded text-panel-muted">{cat.name}</Link>
            ))}
          </nav>
          {isAdmin && (
            <div className="mt-6 flex flex-col gap-1">
              <Link to="/admin/posts" className="text-sm px-3 py-2 text-panel-text">Admin</Link>
              <Link to="/posts/create" className="text-sm px-3 py-2 text-panel-text">New Post</Link>
              <button onClick={handleLogout} className="text-sm px-3 py-2 text-left text-red-400">Logout</button>
            </div>
          )}
        </div>
      )}

      {/* Left Panel (Desktop) */}
      <aside className="hidden lg:flex w-[280px] bg-panel text-panel-text flex-col flex-shrink-0 sticky top-0 h-screen overflow-y-auto p-7">
        <Link to="/" className="block">
          <h1 className="text-[20px] font-bold text-white mb-1">seeeeeeong</h1>
          <div className="text-xs text-panel-muted mb-8">Backend Developer</div>
        </Link>

        <nav className="flex flex-col gap-0.5 mb-8">
          <Link
            to="/"
            className={`text-[13px] px-3 py-2 rounded transition-colors ${isActivePath("/") ? "bg-panel-active text-white" : "text-panel-muted hover:bg-panel-hover hover:text-panel-text"}`}
          >
            All Posts
          </Link>
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/?category=${cat.id}`}
              className="text-[13px] px-3 py-2 rounded text-panel-muted hover:bg-panel-hover hover:text-panel-text transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {isAdmin && (
          <div className="flex flex-col gap-0.5 mb-8">
            <Link
              to="/admin/posts"
              className={`text-[13px] px-3 py-2 rounded transition-colors ${isActivePath("/admin/posts") ? "bg-panel-active text-white" : "text-panel-muted hover:bg-panel-hover hover:text-panel-text"}`}
            >
              Admin
            </Link>
            <Link
              to="/posts/create"
              className="text-[13px] px-3 py-2 rounded text-panel-muted hover:bg-panel-hover hover:text-panel-text transition-colors"
            >
              New Post
            </Link>
            <button
              onClick={handleLogout}
              className="text-[13px] px-3 py-2 rounded text-left text-panel-muted hover:bg-panel-hover hover:text-red-400 transition-colors"
            >
              Logout
            </button>
          </div>
        )}

        {!isAdmin && isAuthenticated && user && (
          <div className="flex items-center gap-2 mb-8 px-3">
            <img src={user.githubAvatarUrl || ""} alt={user.githubUsername} className="w-5 h-5 rounded-full" />
            <span className="text-xs text-panel-text">{user.githubUsername}</span>
            <button onClick={logout} className="text-xs text-panel-muted hover:text-red-400 ml-auto">&times;</button>
          </div>
        )}

        {/* Popular */}
        {popularPosts.length > 0 && (
          <div className="mt-auto">
            <div className="text-[10px] font-semibold text-panel-dim uppercase tracking-widest mb-2.5">Popular</div>
            {popularPosts.map(post => (
              <Link key={post.id} to={`/posts/${post.id}`} className="block py-2 border-b border-panel-hover group">
                <h4 className="text-xs text-panel-text group-hover:text-white transition-colors leading-snug">{post.title}</h4>
                <div className="font-mono text-[10px] text-panel-muted">{post.viewCount}</div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-panel-hover">
          <div className="flex gap-4 text-[10px] text-panel-muted">
            <a href="https://github.com/seeeeeeong" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <a href="mailto:lsinsung@gmail.com" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="text-[10px] text-panel-dim mt-2">&copy; 2026 seeeeeeong</div>
        </div>
      </aside>

      {/* Right Panel */}
      <main className="flex-1 min-w-0 pt-14 lg:pt-0">
        <div className="max-w-[700px] px-5 sm:px-10 py-8 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
