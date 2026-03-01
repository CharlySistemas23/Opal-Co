import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      colors: {
        ivory: "#F5F3EF",
        stone: "#E2DED6",
        charcoal: "#1C1C1C",
        champagne: "#C2A86B",
      },
      maxWidth: {
        container: "1680px",
      },
      spacing: {
        "30": "7.5rem",
        "40": "10rem",
        "padding-desktop": "140px",
      },
      transitionDuration: {
        "duration-fast": "400ms",
        "duration-base": "600ms",
      },
      transitionTimingFunction: {
        "ease-luxury": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
