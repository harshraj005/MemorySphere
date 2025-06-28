import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { useAuth } from './AuthContext';

type Theme = 'light' | 'dark';
type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
  colors: typeof lightColors;
}

const lightColors = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  secondary: '#EC4899',
  secondaryLight: '#F472B6',
  accent: '#F59E0B',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  surfaceSecondary: '#F1F5F9',
  surfaceElevated: '#FFFFFF',
  text: '#1E293B',
  textSecondary: '#64748B',
  textLight: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowMedium: 'rgba(0, 0, 0, 0.12)',
  shadowStrong: 'rgba(0, 0, 0, 0.16)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  gradient: ['#6366F1', '#8B5CF6', '#EC4899'],
  gradientLight: ['#818CF8', '#A78BFA', '#F472B6'],
  gradientSubtle: ['#F8FAFC', '#F1F5F9'],
  cardGradient: ['#FFFFFF', '#F8FAFC'],
};

const darkColors = {
  primary: '#818CF8',
  primaryLight: '#A5B4FC',
  primaryDark: '#6366F1',
  secondary: '#F472B6',
  secondaryLight: '#F9A8D4',
  accent: '#FBBF24',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  background: '#0F172A',
  surface: '#1E293B',
  surfaceSecondary: '#334155',
  surfaceElevated: '#2D3748',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textLight: '#94A3B8',
  border: '#334155',
  borderLight: '#475569',
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowMedium: 'rgba(0, 0, 0, 0.4)',
  shadowStrong: 'rgba(0, 0, 0, 0.5)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  gradient: ['#1E293B', '#334155', '#475569'],
  gradientLight: ['#334155', '#475569', '#64748B'],
  gradientSubtle: ['#0F172A', '#1E293B'],
  cardGradient: ['#1E293B', '#334155'],
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const { user, updateProfile } = useAuth();
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    if (user?.theme_preference) {
      setThemePreferenceState(user.theme_preference);
    }
  }, [user]);

  const theme: Theme = themePreference === 'system' 
    ? (systemColorScheme === 'dark' ? 'dark' : 'light')
    : themePreference;

  const colors = theme === 'dark' ? darkColors : lightColors;

  const setThemePreference = async (preference: ThemePreference) => {
    setThemePreferenceState(preference);
    if (user) {
      try {
        await updateProfile({ theme_preference: preference });
      } catch (error) {
        console.error('Error updating theme preference:', error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      themePreference,
      setThemePreference,
      colors,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};