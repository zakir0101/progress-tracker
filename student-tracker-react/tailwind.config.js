/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f8ff',
          100: '#e7f3ff',
          500: '#667eea',
          600: '#5a6fd8',
          700: '#4d5fc6'
        },
        success: {
          50: '#d4edda',
          100: '#c3e6cb',
          500: '#28a745',
          600: '#218838'
        },
        danger: {
          50: '#f8d7da',
          100: '#f5c6cb',
          500: '#dc3545',
          600: '#c82333'
        },
        warning: {
          50: '#fff3cd',
          100: '#ffeaa7',
          500: '#ffc107',
          600: '#e0a800'
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif']
      }
    },
  },
  plugins: [],
}