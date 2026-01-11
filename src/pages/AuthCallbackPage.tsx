import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Spinner from "../components/common/Spinner";

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const oauthId = searchParams.get("oauthId") ?? searchParams.get("githubId");
    const oauthUsername = searchParams.get("oauthUsername") ?? searchParams.get("githubUsername");
    const oauthAvatarUrl = searchParams.get("oauthAvatarUrl") ?? searchParams.get("githubAvatarUrl");

    if (token && oauthId && oauthUsername) {
      const userData = {
        commentToken: token,
        githubId: oauthId,
        githubUsername: oauthUsername,
        githubAvatarUrl: oauthAvatarUrl || null,
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
      navigate("/");
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner />
        <p className="text-tertiary font-mono text-sm uppercase tracking-wider mt-6">AUTHENTICATING...</p>
      </div>
    </div>
  );
}
