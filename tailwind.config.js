/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // CSS variable-driven brand color (merchant can customize)
        primary: "hsl(var(--primary))",
        primaryFg: "hsl(var(--primary-foreground))",
      },
      // sensible font sizes if needed
    },
  },
  plugins: [],
}
