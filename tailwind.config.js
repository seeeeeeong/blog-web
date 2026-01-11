/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#232324",
        secondary: "#383A41",
        tertiary: "#8E8E90",
        quaternary: "#EEEEEE",
        whitesmoke: "#F5F5F5",
        gainsboro: "#DCDCDC",
        accent: {
          green: "#E0F27E",
          blue: "#0084FF",
          secondary: "#E5F2FF",
        },
        border: "rgba(0, 0, 0, 0.14)",
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
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "Google Sans Code",
          "Roboto Mono",
          "JetBrains Mono",
          "SF Mono",
          "Monaco",
          "Inconsolata",
          "Courier New",
          "monospace",
        ],
      },
      letterSpacing: {
        wider: "0.05em",
        widest: "0.1em",
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
};