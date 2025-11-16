import { Link, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Layout() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setIsAdmin(!!userId);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("nickname");
    setIsAdmin(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 네비게이션 */}
      <nav className="border-b border-gray-200 sticky top-0 z-50 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="flex justify-between items-center h-16">
            {/* 로고 */}
            <Link 
              to="/" 
              className="text-xl font-bold text-gray-900 font-mono hover:text-gray-600 transition-colors"
            >
              seeeeeeong.log
            </Link>

            {/* 메뉴 - 관리자만 보임 */}
            {isAdmin && (
              <div className="flex items-center gap-8">
                <Link
                  to="/"
                  className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Posts
                </Link>

                <Link
                  to="/posts/create"
                  className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Write
                </Link>
                
                <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 페이지 내용 */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-6 py-8 max-w-5xl">
          <div className="text-center">
            <p className="text-sm text-gray-500 font-mono">
              © 2025 seeeeeeong.log. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}