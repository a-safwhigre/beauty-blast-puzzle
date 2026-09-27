/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blast: {
          pink: '#FF4D8D',
          blue: '#38BDF8',
          yellow: '#FBBF24',
          green: '#34D399',
          purple: '#A855F7',
          orange: '#FB923C',
        }
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.8)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-4px)' },
          '40%, 80%': { transform: 'translateX(4px)' },
        },
        pulseGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.8))' },
          '50%': { filter: 'drop-shadow(0 0 14px rgba(255, 215, 0, 1))' },
        }
      },
      animation: {
        pop: 'pop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        shake: 'shake 0.3s ease-in-out',
        pulseGlow: 'pulseGlow 1.2s infinite ease-in-out',
      }
    },
  },
  plugins: [],
}
