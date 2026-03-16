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
                },
                bg: {
                    primary: 'var(--tg-theme-bg-color, #0f0f1a)',
                    secondary: 'var(--tg-theme-secondary-bg-color, #1c1c1e)',
                    elevated: '#2c2c2e',
                },
                text: {
                    primary: 'var(--tg-theme-text-color, #ffffff)',
                    secondary: 'var(--tg-theme-hint-color, #8e8e93)',
                    accent: 'var(--tg-theme-link-color, #3390ec)',
                },
                accent: {
                    purple: '#a855f7',
                    pink: '#ec4899',
                    blue: '#3390ec',
                },
                glass: {
                    DEFAULT: 'rgba(255,255,255,0.05)',
                    border: 'rgba(255,255,255,0.10)',
                    hover: 'rgba(255,255,255,0.08)',
                },
            },
            borderRadius: {
                card: '16px',
                input: '12px',
                button: '12px',
                chip: '8px',
                full: '9999px',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 2s infinite linear',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '200% 0' },
                    '100%': { backgroundPosition: '-200% 0' },
                }
            }
        },
    },
    plugins: [],
}
