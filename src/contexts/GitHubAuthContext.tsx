import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import apiClient from "../api/client";

interface GitHubUser {
  githubId: string;
  githubUsername: string;
  githubAvatarUrl: string | null;
  commentToken: string;
}

interface GitHubAuthContextType {
  user: GitHubUser | null;
  login: () => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const GitHubAuthContext = createContext<GitHubAuthContextType | undefined>(
  undefined
);

export function GitHubAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GitHubUser | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("githubUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = () => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    if (apiBaseUrl == null || apiBaseUrl === "") {
      console.error("Missing API base URL.");
      return;
    }

    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      "",
      "GitHub Login",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    apiClient
      .get("/auth/github/authorize")
      .then((response) => {
        const { authorizationUrl } = response.data || {};

        if (!authorizationUrl) {
          throw new Error("Missing authorizationUrl");
        }

        if (popup == null) {
          window.location.href = authorizationUrl;
          return;
        }

        popup.location.href = authorizationUrl;
      })
      .catch((error) => {
        console.error("Failed to start GitHub OAuth", error);
        if (popup != null) {
          popup.close();
        }
      });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("githubUser");
  };

  const saveUser = (userData: GitHubUser) => {
    setUser(userData);
    localStorage.setItem("githubUser", JSON.stringify(userData));
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "GITHUB_AUTH_SUCCESS") {
        saveUser(event.data.user);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <GitHubAuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </GitHubAuthContext.Provider>
  );
}

export function useGitHubAuth() {
  const context = useContext(GitHubAuthContext);
  if (!context) {
    throw new Error("useGitHubAuth must be used within GitHubAuthProvider");
  }
  return context;
}
