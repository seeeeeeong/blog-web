import { useCallback } from "react";

type Theme = "light";

export function useTheme() {
  const theme: Theme = "light";
  const toggleTheme = useCallback(() => {}, []);
  return { theme, toggleTheme };
}
