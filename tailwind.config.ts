import { nextui } from "@nextui-org/theme";
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/components/(button|form|input|ripple|spinner).js"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        danmaku: "danmaku 6s linear",
      },
      keyframes: {
        danmaku: {
          "0%": {
            transform: "translateX(0)",
            left: "100%",
          },
          "100%": {
            transform: "translateX(-100%)",
            left: "0px",
          },
        },
      },
    },
  },
  plugins: [nextui()],
} satisfies Config;
