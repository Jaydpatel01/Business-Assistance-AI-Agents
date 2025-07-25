import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState, useCallback } from 'react';

// Enhanced theme types
export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

// Theme configuration interface
export interface ThemeConfig {
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  enableColorScheme?: boolean;
  storageKey?: string;
  themes?: string[];
  defaultTheme?: string;
  attribute?: string;
}

// Theme preferences interface
export interface ThemePreferences {
  autoSwitch?: boolean;
  autoSwitchTimes?: {
    light: string; // e.g., "06:00"
    dark: string;  // e.g., "18:00"
  };
  highContrast?: boolean;
  reducedMotion?: boolean;
}

// Enhanced theme hook return type
export interface UseThemeReturn {
  // Basic theme state
  theme: string | undefined;
  resolvedTheme: ResolvedTheme | undefined;
  systemTheme: ResolvedTheme | undefined;
  
  // Theme actions
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
  
  // Enhanced functionality
  isLoading: boolean;
  preferences: ThemePreferences;
  setPreferences: (prefs: Partial<ThemePreferences>) => void;
  
  // Validation and fallbacks
  isValidTheme: (theme: string) => boolean;
  getEffectiveTheme: () => ResolvedTheme;
  
  // Theme preview (for settings)
  previewTheme: string | null;
  setPreviewTheme: (theme: string | null) => void;
  
  // Auto-switching
  enableAutoSwitch: (times: { light: string; dark: string }) => void;
  disableAutoSwitch: () => void;
  
  // Enhanced features
  resetToDefaults: () => void;
  exportPreferences: () => string;
  importPreferences: (data: string) => boolean;
}

const DEFAULT_PREFERENCES: ThemePreferences = {
  autoSwitch: false,
  autoSwitchTimes: {
    light: '06:00',
    dark: '18:00'
  },
  highContrast: false,
  reducedMotion: false
};

export function useTheme(): UseThemeReturn {
  const {
    theme,
    setTheme: setNextTheme,
    resolvedTheme,
    systemTheme,
    themes = ['light', 'dark', 'system']
  } = useNextTheme();

  // Enhanced state
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferencesState] = useState<ThemePreferences>(DEFAULT_PREFERENCES);
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const [autoSwitchTimer, setAutoSwitchTimer] = useState<NodeJS.Timeout | null>(null);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem('theme-preferences');
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs) as ThemePreferences;
        setPreferencesState(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.warn('Failed to load theme preferences:', error);
    }
  }, []);

  // Handle loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  // Save preferences to localStorage
  const setPreferences = useCallback((newPrefs: Partial<ThemePreferences>) => {
    setPreferencesState(prev => {
      const updated = { ...prev, ...newPrefs };
      try {
        localStorage.setItem('theme-preferences', JSON.stringify(updated));
      } catch (error) {
        console.warn('Failed to save theme preferences:', error);
      }
      return updated;
    });
  }, []);

  // Validation function
  const isValidTheme = useCallback((themeToCheck: string): boolean => {
    return themes.includes(themeToCheck);
  }, [themes]);

  // Get effective theme (with fallback)
  const getEffectiveTheme = useCallback((): ResolvedTheme => {
    if (previewTheme && isValidTheme(previewTheme)) {
      return previewTheme === 'system' 
        ? (systemTheme as ResolvedTheme) || 'light'
        : previewTheme as ResolvedTheme;
    }
    
    return (resolvedTheme as ResolvedTheme) || 'light';
  }, [resolvedTheme, systemTheme, previewTheme, isValidTheme]);

  // Enhanced toggle function
  const toggleTheme = useCallback(() => {
    const currentTheme = theme || 'system';
    
    if (currentTheme === 'light') {
      setNextTheme('dark');
    } else if (currentTheme === 'dark') {
      setNextTheme('light');
    } else {
      // If system, toggle to opposite of resolved theme
      const resolved = getEffectiveTheme();
      setNextTheme(resolved === 'light' ? 'dark' : 'light');
    }
  }, [theme, setNextTheme, getEffectiveTheme]);

  // Safe theme setter with validation
  const setTheme = useCallback((newTheme: string) => {
    if (isValidTheme(newTheme)) {
      setNextTheme(newTheme);
    } else {
      console.warn(`Invalid theme: ${newTheme}. Falling back to 'system'.`);
      setNextTheme('system');
    }
  }, [setNextTheme, isValidTheme]);

  // Auto-switch functionality
  const scheduleAutoSwitch = useCallback(() => {
    if (!preferences.autoSwitch || !preferences.autoSwitchTimes) return;

    const now = new Date();
    const today = now.toDateString();
    
    const lightTime = new Date(`${today} ${preferences.autoSwitchTimes.light}`);
    const darkTime = new Date(`${today} ${preferences.autoSwitchTimes.dark}`);
    
    // Adjust for next day if time has passed
    if (lightTime <= now) {
      lightTime.setDate(lightTime.getDate() + 1);
    }
    if (darkTime <= now) {
      darkTime.setDate(darkTime.getDate() + 1);
    }
    
    // Find next switch time
    const nextSwitch = lightTime < darkTime ? lightTime : darkTime;
    const nextTheme = lightTime < darkTime ? 'light' : 'dark';
    
    const timeUntilSwitch = nextSwitch.getTime() - now.getTime();
    
    if (autoSwitchTimer) {
      clearTimeout(autoSwitchTimer);
    }
    
    const timer = setTimeout(() => {
      setTheme(nextTheme);
      scheduleAutoSwitch(); // Schedule next switch
    }, timeUntilSwitch);
    
    setAutoSwitchTimer(timer);
  }, [preferences.autoSwitch, preferences.autoSwitchTimes, setTheme, autoSwitchTimer]);

  // Enable auto-switching
  const enableAutoSwitch = useCallback((times: { light: string; dark: string }) => {
    setPreferences({
      autoSwitch: true,
      autoSwitchTimes: times
    });
  }, [setPreferences]);

  // Disable auto-switching
  const disableAutoSwitch = useCallback(() => {
    if (autoSwitchTimer) {
      clearTimeout(autoSwitchTimer);
      setAutoSwitchTimer(null);
    }
    setPreferences({ autoSwitch: false });
  }, [autoSwitchTimer, setPreferences]);

  // Reset preferences to defaults
  const resetToDefaults = useCallback(() => {
    setPreferencesState(DEFAULT_PREFERENCES);
    try {
      localStorage.removeItem('theme-preferences');
    } catch (error) {
      console.warn('Failed to clear theme preferences:', error);
    }
  }, []);

  // Export preferences as JSON string
  const exportPreferences = useCallback((): string => {
    return JSON.stringify({
      theme,
      preferences,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    });
  }, [theme, preferences]);

  // Import preferences from JSON string
  const importPreferences = useCallback((data: string): boolean => {
    try {
      const imported = JSON.parse(data);
      
      // Validate structure
      if (!imported.preferences || !imported.version) {
        throw new Error('Invalid preferences format');
      }
      
      // Apply theme
      if (imported.theme && isValidTheme(imported.theme)) {
        setTheme(imported.theme);
      }
      
      // Apply preferences with validation
      const validPrefs: Partial<ThemePreferences> = {};
      if (typeof imported.preferences.autoSwitch === 'boolean') {
        validPrefs.autoSwitch = imported.preferences.autoSwitch;
      }
      if (imported.preferences.autoSwitchTimes) {
        validPrefs.autoSwitchTimes = imported.preferences.autoSwitchTimes;
      }
      if (typeof imported.preferences.highContrast === 'boolean') {
        validPrefs.highContrast = imported.preferences.highContrast;
      }
      if (typeof imported.preferences.reducedMotion === 'boolean') {
        validPrefs.reducedMotion = imported.preferences.reducedMotion;
      }
      
      setPreferences(validPrefs);
      return true;
    } catch (error) {
      console.error('Failed to import theme preferences:', error);
      return false;
    }
  }, [isValidTheme, setTheme, setPreferences]);

  // Set up auto-switching when preferences change
  useEffect(() => {
    if (preferences.autoSwitch) {
      scheduleAutoSwitch();
    } else if (autoSwitchTimer) {
      clearTimeout(autoSwitchTimer);
      setAutoSwitchTimer(null);
    }

    return () => {
      if (autoSwitchTimer) {
        clearTimeout(autoSwitchTimer);
      }
    };
  }, [preferences.autoSwitch, preferences.autoSwitchTimes, scheduleAutoSwitch, autoSwitchTimer]);

  // Apply accessibility preferences and system theme detection
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    
    // Batch all DOM updates for better performance
    root.classList.toggle('high-contrast', preferences.highContrast);
    root.classList.toggle('reduce-motion', preferences.reducedMotion);
    root.style.setProperty('--theme-mode', getEffectiveTheme());
    
    // Set up system preference change detection
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        // Force re-evaluation when system theme changes
        const newSystemTheme = mediaQuery.matches ? 'dark' : 'light';
        root.style.setProperty('--system-theme', newSystemTheme);
        root.dispatchEvent(new CustomEvent('theme-changed', { 
          detail: { theme: newSystemTheme, source: 'system' } 
        }));
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [preferences.highContrast, preferences.reducedMotion, getEffectiveTheme, theme]);

  // Enhanced preview theme effect with transition management
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    
    if (previewTheme) {
      root.setAttribute('data-preview-theme', previewTheme);
      root.classList.add('theme-transitioning');
      
      // Remove transition class after animation
      const timer = setTimeout(() => {
        root.classList.remove('theme-transitioning');
      }, 300);
      
      return () => {
        clearTimeout(timer);
        root.removeAttribute('data-preview-theme');
        root.classList.remove('theme-transitioning');
      };
    } else {
      root.removeAttribute('data-preview-theme');
    }
  }, [previewTheme]);

  return {
    // Basic theme state
    theme,
    resolvedTheme: resolvedTheme as ResolvedTheme | undefined,
    systemTheme: systemTheme as ResolvedTheme | undefined,
    
    // Theme actions
    setTheme,
    toggleTheme,
    
    // Enhanced functionality
    isLoading,
    preferences,
    setPreferences,
    
    // Validation and fallbacks
    isValidTheme,
    getEffectiveTheme,
    
    // Theme preview
    previewTheme,
    setPreviewTheme,
    
    // Auto-switching
    enableAutoSwitch,
    disableAutoSwitch,
    
    // Enhanced features
    resetToDefaults,
    exportPreferences,
    importPreferences,
  };
}

// Hook for theme-aware components
export function useThemeAware() {
  const { resolvedTheme, isLoading, getEffectiveTheme } = useTheme();
  
  return {
    isDark: getEffectiveTheme() === 'dark',
    isLight: getEffectiveTheme() === 'light',
    theme: getEffectiveTheme(),
    isLoading,
    resolvedTheme,
  };
}

// Hook for theme transitions
export function useThemeTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { theme } = useTheme();
  
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [theme]);
  
  return { isTransitioning };
}
