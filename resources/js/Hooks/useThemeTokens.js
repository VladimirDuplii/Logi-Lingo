// Central hook to expose design tokens (could later be dynamic / dark mode)
export function useThemeTokens() {
  return {
    radius: {
      card: '1.25rem',
      pill: '9999px'
    },
    color: {
      brand: '#6366f1',
      brandAccent: '#8b5cf6',
      danger: '#ef4444',
      success: '#10b981',
      border: '#E5E3F3',
      borderStrong: '#C9C5E5',
      surface: '#FFFFFF',
      surfaceAlt: '#F8F7FC',
      text: '#1E1B2E',
      textSubtle: '#5c5674'
    },
    shadow: {
      card: '0 2px 4px -2px rgba(0,0,0,0.04), 0 8px 24px -4px rgba(99,102,241,0.08)',
      hover: '0 6px 28px -6px rgba(99,102,241,0.15)'
    }
  };
}
