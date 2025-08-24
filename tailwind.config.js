import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'Nunito', 'arial', 'sans-serif'],
            },
            colors: {
                brand: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                },
                accent: {
                    500: '#10b981',
                    600: '#059669',
                    700: '#047857',
                },
                surface: {
                    soft: '#F8F7FC',
                    alt: '#F2F1FA',
                    base: '#FFFFFF',
                    dark: '#1E1B2E',
                },
                border: {
                    subtle: '#E5E3F3',
                    strong: '#C9C5E5',
                },
            },
            boxShadow: {
                'soft-lg': '0 4px 16px -2px rgba(99,102,241,0.08), 0 2px 6px -1px rgba(99,102,241,0.06)',
                'card': '0 2px 4px -2px rgba(0,0,0,0.04), 0 8px 24px -4px rgba(99,102,241,0.08)',
            },
            borderRadius: {
                xl: '1rem',
                '2xl': '1.25rem',
            },
            backgroundImage: {
                'brand-gradient': 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 40%,#ec4899 100%)',
            }
        },
    },

    plugins: [forms],
};
