import { atom } from 'nanostores';
import { logStore } from './logs';

export type ThemeSetting = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

export const kThemeSetting = 'bolt_theme_setting'; // Key for storing user's explicit choice

// Function to determine the actual theme to apply based on setting and system preference
function resolveTheme(setting: ThemeSetting): ResolvedTheme {
  if (setting === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light'; // Default to light if system preference is not dark or not detectable
  }
  return setting;
}

// Atom to store the user's theme *setting* ('light', 'dark', or 'system')
export const themeSettingStore = atom<ThemeSetting>(getInitialThemeSetting());

// Atom to store the currently *resolved* theme ('light' or 'dark')
export const currentThemeStore = atom<ResolvedTheme>(resolveTheme(themeSettingStore.get()));

function getInitialThemeSetting(): ThemeSetting {
  if (!import.meta.env.SSR) {
    const persistedSetting = localStorage.getItem(kThemeSetting) as ThemeSetting | undefined;
    return persistedSetting ?? 'system'; // Default to 'system'
  }
  return 'system'; // Default for SSR
}

// Apply the resolved theme to the HTML element
function applyThemeToHTML(theme: ResolvedTheme) {
  if (typeof document !== 'undefined') {
    document.querySelector('html')?.setAttribute('data-theme', theme);
    logStore.logSystem(`Theme applied: ${theme} mode`);
  }
}

// Initialize and listen to changes
if (!import.meta.env.SSR) {
  // Apply initial theme
  applyThemeToHTML(currentThemeStore.get());

  // Listen for changes in themeSettingStore to re-resolve and apply
  themeSettingStore.subscribe((setting) => {
    const newResolvedTheme = resolveTheme(setting);
    currentThemeStore.set(newResolvedTheme);
    // applyThemeToHTML is called by currentThemeStore subscriber
  });

  currentThemeStore.subscribe((resolvedTheme) => {
    applyThemeToHTML(resolvedTheme);
    // No need to update localStorage here as we persist the *setting*, not the resolved theme
  });

  // Listen for system preference changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    if (themeSettingStore.get() === 'system') {
      currentThemeStore.set(e.matches ? 'dark' : 'light');
    }
  };
  mediaQuery.addEventListener('change', handleSystemThemeChange);
  // No explicit cleanup needed for mediaQuery listener in a store like this,
  // as it's global for the app's lifetime.
}


export function toggleThemeSetting() {
  const currentSetting = themeSettingStore.get();
  let newSetting: ThemeSetting;

  if (currentSetting === 'light') {
    newSetting = 'dark';
  } else if (currentSetting === 'dark') {
    newSetting = 'system';
  } else { // system
    newSetting = 'light';
  }

  themeSettingStore.set(newSetting);
  localStorage.setItem(kThemeSetting, newSetting);
  logStore.logSystem(`Theme setting changed to ${newSetting}`);
}

// Helper to check if the current *resolved* theme is dark
export function themeIsDark() {
  return currentThemeStore.get() === 'dark';
}
