import { createContext } from "react";

export interface GitHubUser {
  githubId: string;
  githubUsername: string;
  githubAvatarUrl: string | null;
  commentToken: string;
}

export interface GitHubAuthContextType {
  user: GitHubUser | null;
  login: () => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const GitHubAuthContext = createContext<GitHubAuthContextType | undefined>(
  undefined
);
