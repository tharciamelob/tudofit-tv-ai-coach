import React, { createContext, useContext, useEffect } from 'react';

// Fixed dark theme - no longer dynamic
const FIXED_THEME = 'dark';

interface ThemeContextType {
  theme: 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Apply dark theme to document
const applyDarkTheme = () => {
  const root = document.documentElement;
  root.classList.remove('light');
  root.classList.add('dark');
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Apply dark theme on mount
  useEffect(() => {
    applyDarkTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: FIXED_THEME }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
