/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors based on original HTML styling
        primary: {
          50: '#f8f9fa',
          500: '#495057',
          600: '#343a40',
          700: '#2c3e50',
          800: '#1a252f',
        },
        success: {
          50: '#d4edda',
          500: '#28a745',
          600: '#218838',
        },
        danger: {
          50: '#f8d7da',
          500: '#dc3545',
          600: '#c82333',
        },
        info: {
          50: '#e7f3ff',
          500: '#007bff',
          600: '#0056b3',
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 10px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 15px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}