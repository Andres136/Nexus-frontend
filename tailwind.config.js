/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 1s ease-in-out',
        'slide-in': 'slideIn 0.5s ease-out',
         "spin-slow": "spin 2s linear infinite",
    "loading-bar": "loadingBar 1.8s ease-in-out infinite"
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(20px)' },
          '100%': { transform: 'translateX(0)' },
        },
           loadingBar: {
      "0%": { transform: "translateX(-100%)" },
      "50%": { transform: "translateX(0%)" },
      "100%": { transform: "translateX(100%)" }
    }
      },
    },
  },
  plugins: [],
}

