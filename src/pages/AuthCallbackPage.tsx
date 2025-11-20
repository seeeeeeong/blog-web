import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const githubId = searchParams.get("githubId");
    const githubUsername = searchParams.get("githubUsername");
    const githubAvatarUrl = searchParams.get("githubAvatarUrl");

    if (token && githubId && githubUsername) {
      const userData = {
        commentToken: token,
        githubId,
        githubUsername,
        githubAvatarUrl: githubAvatarUrl || null,
      };

      if (window.opener) {
        window.opener.postMessage(
          {
            type: "GITHUB_AUTH_SUCCESS",
            user: userData,
          },
          window.location.origin
        );
        window.close();
      } else {
        localStorage.setItem("githubUser", JSON.stringify(userData));
        navigate("/");
      }
    } else {
      console.error("GitHub OAuth 콜백 파라미터 누락");
      navigate("/");
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">로그인 처리 중...</p>
      </div>
    </div>
  );
}