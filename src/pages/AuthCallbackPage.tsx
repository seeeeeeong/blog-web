import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Spinner from "../components/common/Spinner";
import apiClient from "../api/client";

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      navigate("/");
      return;
    }

    const exchange = async () => {
      try {
        const response = await apiClient.post("/auth/github/exchange", { code });
        const { token, user } = response.data || {};

        if (!token || !user) {
          navigate("/");
          return;
        }

        const userData = {
          commentToken: token as string,
          githubId: String(user.id),
          githubUsername: user.login as string,
          githubAvatarUrl: (user.avatarUrl as string) || null,
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
      } catch (error) {
        console.error("GitHub exchange failed", error);
        navigate("/");
      }
    };

    exchange();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner />
        <p className="text-muted font-sans text-smr mt-6">Authenticating...</p>
      </div>
    </div>
  );
}
