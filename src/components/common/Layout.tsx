import { Link, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Layout() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const userNickname = localStorage.getItem("nickname");

    setIsLoggedIn(!!userId);
    setNickname(userNickname || "");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("nickname");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 네비게이션 */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* 로고 */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">Blog</span>
            </Link>

            {/* 메뉴 */}
            <div className="flex items-center gap-6">
              <Link
                to="/"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                홈
              </Link>

              {isLoggedIn ? (
                <>
                  <Link
                    to="/posts/create"
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                  >
                    글쓰기
                  </Link>
                  
                  <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
                    <span className="text-gray-700 font-medium">{nickname}</span>
                    <button
                      onClick={handleLogout}
                      className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
                    >
                      로그아웃
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                  >
                    로그인
                  </Link>
                  <Link
                    to="/signup"
                    className="btn-primary"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 페이지 내용 */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>© 2025 Blog. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
