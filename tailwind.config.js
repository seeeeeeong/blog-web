/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // desktop.fm minimalist palette
        background: "#bec2c4",
        card: "#ddd",
        text: "#2d2d2d",
        accent: "#0059ff",
        border: "#999",
        muted: "#8e8e8e",
        hover: "#f5f5f5",

        // Legacy support (deprecated, use above)
        primary: "#2d2d2d",
        secondary: "#555",
        tertiary: "#8e8e8e",
        quaternary: "#EEEEEE",
        whitesmoke: "#F5F5F5",
        gainsboro: "#DCDCDC",
        wash: "rgba(0, 0, 0, 0.04)",
        gray: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0a0a0a",
        },
        cream: {
          50: "#fefdfb",
          100: "#fdfbf7",
          200: "#fbf7f0",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Apple System",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "SF Mono",
          "Monaco",
          "Consolas",
          "Courier New",
          "monospace",
        ],
      },
      borderRadius: {
        'sm': '8px',
        DEFAULT: '12px',
        'md': '16px',
        'lg': '20px',
        'xl': '24px',
        '2xl': '32px',
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0,0,0,0.08)',
        DEFAULT: '0 2px 8px rgba(0,0,0,0.1)',
        'md': '0 4px 12px rgba(0,0,0,0.12)',
        'lg': '0 8px 24px rgba(0,0,0,0.15)',
        'xl': '0 16px 48px rgba(0,0,0,0.18)',
        'none': 'none',
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
};