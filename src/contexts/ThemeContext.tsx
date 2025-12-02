import React, { createContext, useContext, useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Apply theme to document immediately (can be called before React mounts)
const applyThemeToDocument = (newTheme: Theme) => {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(newTheme);
  localStorage.setItem('tudofit-theme', newTheme);
};

// Get initial theme from localStorage
const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('tudofit-theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  }
  return 'dark';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [isLoading, setIsLoading] = useState(true);

  // Apply theme immediately on mount (before paint)
  useLayoutEffect(() => {
    applyThemeToDocument(theme);
  }, []);

  // Apply theme whenever it changes
  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  // Load theme from user settings when user logs in
  useEffect(() => {
    const loadThemeFromSettings = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('theme')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error && data?.theme) {
          const userTheme = data.theme as Theme;
          setThemeState(userTheme);
          applyThemeToDocument(userTheme);
        }
      } catch (err) {
        console.error('Error loading theme:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemeFromSettings();
  }, [user]);

  const setTheme = useCallback(async (newTheme: Theme) => {
    setThemeState(newTheme);
    applyThemeToDocument(newTheme);

    // Save to Supabase if user is logged in
    if (user) {
      try {
        const { data: existing } = await supabase
          .from('user_settings')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('user_settings')
            .update({ theme: newTheme, updated_at: new Date().toISOString() })
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('user_settings')
            .insert({ user_id: user.id, theme: newTheme });
        }
      } catch (err) {
        console.error('Error saving theme:', err);
      }
    }
  }, [user]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isLoading }}>
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
