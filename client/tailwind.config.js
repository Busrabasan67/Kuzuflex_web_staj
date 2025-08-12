/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Okuma.com tarzı renk paleti
        'okuma': {
          50: '#f0f4ff',   // Çok açık mavi
          100: '#e0e9ff',  // Açık mavi
          200: '#c7d2ff',  // Orta açık mavi
          300: '#a5b4fc',  // Orta mavi
          400: '#818cf8',  // Mavi
          500: '#6366f1',  // Ana mavi
          600: '#4f46e5',  // Koyu mavi
          700: '#4338ca',  // Daha koyu mavi
          800: '#3730a3',  // Çok koyu mavi
          900: '#312e81',  // En koyu mavi
          950: '#1e1b4b',  // Navy blue
        },
        'okuma-gray': {
          50: '#f8fafc',   // Çok açık gri
          100: '#f1f5f9',  // Açık gri
          200: '#e2e8f0',  // Orta açık gri
          300: '#cbd5e1',  // Orta gri
          400: '#94a3b8',  // Orta koyu gri
          500: '#64748b',  // Gri
          600: '#475569',  // Koyu gri
          700: '#334155',  // Daha koyu gri
          800: '#1e293b',  // Çok koyu gri
          900: '#0f172a',  // En koyu gri
        }
      },
      fontFamily: {
        'okuma': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'okuma': '0 4px 6px -1px rgba(30, 58, 138, 0.1), 0 2px 4px -1px rgba(30, 58, 138, 0.06)',
        'okuma-lg': '0 10px 15px -3px rgba(30, 58, 138, 0.1), 0 4px 6px -2px rgba(30, 58, 138, 0.05)',
      }
    },
  },
  plugins: [
    // Scrollbar gizleme için custom utility
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      })
    }
  ],
}
