import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>(() => {
    // Try to get from localStorage first for fast initial load
    const stored = localStorage.getItem('tudofit-theme');
    return (stored === 'light' || stored === 'dark') ? stored : 'dark';
  });
  const [isLoading, setIsLoading] = useState(true);

  // Apply theme to document
  const applyTheme = useCallback((newTheme: Theme) => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('tudofit-theme', newTheme);
  }, []);

  // Load theme from user settings
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
          applyTheme(userTheme);
        }
      } catch (err) {
        console.error('Error loading theme:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemeFromSettings();
  }, [user, applyTheme]);

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const setTheme = useCallback(async (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);

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
  }, [user, applyTheme]);

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
