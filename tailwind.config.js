export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Split Mono palette
        panel: "#111",
        "panel-hover": "#1a1a1a",
        "panel-active": "#222",
        "panel-text": "#aaa",
        "panel-muted": "#555",
        "panel-dim": "#444",
        surface: "#fafafa",
        "surface-alt": "#f0f0f0",
        "surface-hover": "#e0e0e0",
        ink: "#1a1a1a",
        "ink-light": "#999",
        "ink-lighter": "#bbb",
        "ink-faint": "#ccc",
        "ink-ghost": "#eee",
        accent: "#111",
        "accent-text": "#fff",
        danger: "#e53e3e",
        info: "#3182ce",
        success: "#38a169",
        warning: "#d69e2e",
        draft: "#d69e2e",
      },
      fontFamily: {
        sans: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        DEFAULT: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
