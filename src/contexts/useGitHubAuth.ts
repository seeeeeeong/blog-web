import { useContext } from "react";
import { GitHubAuthContext } from "./github-auth-context";

export function useGitHubAuth() {
  const context = useContext(GitHubAuthContext);
  if (!context) {
    throw new Error("useGitHubAuth must be used within GitHubAuthProvider");
  }
  return context;
}
