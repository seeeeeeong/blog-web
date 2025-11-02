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
    <div className="min-h-screen bg-gray-50">
      {/* 네비게이션 */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* 로고 */}
            <Link to="/" className="text-xl font-bold text-blue-600">
              내 블로그
            </Link>

            {/* 메뉴 */}
            <div className="flex items-center gap-6">
              <Link to="/" className="text-gray-700 hover:text-blue-600">
                홈
              </Link>

              {isLoggedIn ? (
                <>
                  <Link
                    to="/posts/new"
                    className="text-gray-700 hover:text-blue-600"
                  >
                    글쓰기
                  </Link>
                  <span className="text-gray-600">{nickname}님</span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-blue-600"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600"
                  >
                    로그인
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
      <main>
        <Outlet />
      </main>
    </div>
  );
}
