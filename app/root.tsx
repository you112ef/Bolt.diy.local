import { useStore } from '@nanostores/react';
import type { LinksFunction } from '@remix-run/cloudflare';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import tailwindReset from '@unocss/reset/tailwind-compat.css?url';
// Updated imports: use currentThemeStore for resolved theme, and constants from theme.ts
import { currentThemeStore, kThemeSetting } from './lib/stores/theme';
import { isBatterySaverEnabled } from './lib/stores/settings'; // Import battery saver store
import { stripIndents } from './utils/stripIndent';
import { createHead } from 'remix-island';
import { useEffect } from 'react';

import reactToastifyStyles from 'react-toastify/dist/ReactToastify.css?url';
import globalStyles from './styles/index.scss?url';
import xtermStyles from '@xterm/xterm/css/xterm.css?url';

import 'virtual:uno.css';

export const links: LinksFunction = () => [
  {
    rel: 'icon',
    href: '/favicon.svg',
    type: 'image/svg+xml',
  },
  { rel: 'stylesheet', href: reactToastifyStyles },
  { rel: 'stylesheet', href: tailwindReset },
  { rel: 'stylesheet', href: globalStyles },
  { rel: 'stylesheet', href: xtermStyles },
  {
    rel: 'preconnect',
    href: 'https://fonts.googleapis.com',
  },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  },
];

const inlineThemeCode = stripIndents`
  (function() {
    let setting = localStorage.getItem('${kThemeSetting}');
    let theme;
    if (setting === 'light' || setting === 'dark') {
      theme = setting;
    } else { // 'system' or null/undefined
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
  })();
`;

export const Head = createHead(() => (
  <>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <Meta />
    <Links />
    <script dangerouslySetInnerHTML={{ __html: inlineThemeCode }} />
  </>
));

export function Layout({ children }: { children: React.ReactNode }) {
  // Use the resolved currentThemeStore here
  const resolvedTheme = useStore(currentThemeStore);
  const batterySaverActive = useStore(isBatterySaverEnabled);

  useEffect(() => {
    // Apply theme
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    // Apply battery saver class
    if (batterySaverActive) {
      document.documentElement.classList.add('battery-saver-active');
    } else {
      document.documentElement.classList.remove('battery-saver-active');
    }
  }, [batterySaverActive]);

  return (
    <>
      {children}
      <ScrollRestoration />
      <Scripts />
    </>
  );
}

import { logStore } from './lib/stores/logs';

export default function App() {
  // For logging purposes, we might want to log both the setting and the resolved theme.
  // const themeSetting = useStore(themeSettingStore);
  const resolvedTheme = useStore(currentThemeStore);

  useEffect(() => {
    logStore.logSystem('Application initialized', {
      themeSetting: localStorage.getItem(kThemeSetting) || 'system', // Log the setting
      resolvedTheme: resolvedTheme, // Log the actual applied theme
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  }, [resolvedTheme]); // Log when resolvedTheme is determined

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
