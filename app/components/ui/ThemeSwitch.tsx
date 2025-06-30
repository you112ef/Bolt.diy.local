import { useStore } from '@nanostores/react';
import { memo, useEffect, useState } from 'react';
import { themeSettingStore, currentThemeStore, toggleThemeSetting, type ThemeSetting, type ResolvedTheme } from '~/lib/stores/theme';
import { IconButton } from './IconButton';

interface ThemeSwitchProps {
  className?: string;
}

export const ThemeSwitch = memo(({ className }: ThemeSwitchProps) => {
  const setting = useStore(themeSettingStore);
  const resolvedTheme = useStore(currentThemeStore);
  const [domLoaded, setDomLoaded] = useState(false);

  useEffect(() => {
    setDomLoaded(true);
  }, []);

  const getIconAndTitle = (): { icon: string; title: string } => {
    if (setting === 'light') {
      return { icon: 'i-ph-moon-stars-duotone', title: 'Switch to Dark Mode' };
    } else if (setting === 'dark') {
      return { icon: 'i-ph-monitor-duotone', title: 'Switch to System Preference' };
    } else { // system
      // When system, icon should reflect the current resolved theme, but action is to switch to Light
      const currentDisplayIcon = resolvedTheme === 'dark' ? 'i-ph-sun-dim-duotone' : 'i-ph-moon-stars-duotone';
      // To make it clearer what the "system" icon is, we can show the monitor icon,
      // and the sun/moon can be a sub-icon or implicitly understood from the theme.
      // For simplicity, let's always show an icon representing the *next* state or a neutral "system" icon.
      // Let's refine:
      // - Setting Light: Shows Moon (to become Dark). Title: "Activate Dark Mode"
      // - Setting Dark: Shows Monitor (to become System). Title: "Use System Preference"
      // - Setting System: Shows Sun (to become Light). Title: "Activate Light Mode"
      // The actual visual theme (sun/moon icon for current state) can be shown by the icon inside the button if needed,
      // but the button's primary action is to toggle the setting.
      // Let's use an icon that represents the setting itself.
      if (resolvedTheme === 'dark') { // Currently dark (either by dark setting or system=dark)
         // If setting is dark, next is system. If system (and dark), next is light.
        return setting === 'dark'
            ? { icon: 'i-ph-monitor-duotone', title: 'Use System Preference' }
            : { icon: 'i-ph-sun-dim-duotone', title: 'Switch to Light Mode' };
      } else { // Currently light (either by light setting or system=light)
        return setting === 'light'
            ? { icon: 'i-ph-moon-stars-duotone', title: 'Switch to Dark Mode' }
            : { icon: 'i-ph-monitor-duotone', title: 'Use System Preference' }; // System setting, currently light, next is dark (via toggle)
            // This logic for system is tricky. The toggle order is L -> D -> S -> L
            // If setting is 'system' and current is 'light', next is 'light' (which is wrong)
            // Correct title should be "Switch to Light Mode" (as per toggleThemeSetting)
            // Icon should represent current state or the setting itself.
      }
    }
     // Simplified logic based on the toggle order: light -> dark -> system -> light
    switch (setting) {
        case 'light':
            return { icon: 'i-ph-moon-stars-duotone', title: 'Switch to Dark Mode' };
        case 'dark':
            return { icon: 'i-ph-monitor-duotone', title: 'Use System Preference' };
        case 'system':
            // When setting is 'system', the icon displayed should reflect the *current actual theme*
            const displayIcon = resolvedTheme === 'dark' ? 'i-ph-sun-dim-duotone' : 'i-ph-moon-stars-duotone';
            return { icon: displayIcon, title: 'Switch to Light Mode (from System)' }; // Next is Light
        default:
            return { icon: 'i-ph-circle-half-duotone', title: 'Toggle Theme' }; // Fallback
    }
  };

  const { icon, title } = getIconAndTitle();

  return (
    domLoaded && (
      <IconButton
        className={className}
        icon={icon}
        size="xl"
        title={title}
        onClick={toggleThemeSetting}
      />
    )
  );
});
