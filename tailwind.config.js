export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enable class-based dark mode
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                display: ['Space Grotesk', 'sans-serif'],
                pixel: ['"Press Start 2P"', 'cursive'],
            },
            colors: {
                // Custom Bazzar/Pixel Palette
                pixel: {
                    dark: '#0B0F19', // Onyx
                    darker: '#05070A',
                    light: '#F8F9FC',
                    accent: '#6366F1', // Indigo
                },
                // Dynamic Theming
                brand: {
                    primary: 'rgb(var(--color-primary) / <alpha-value>)',
                    secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
                    accent: 'rgb(var(--color-accent) / <alpha-value>)',
                }
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
}
