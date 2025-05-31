import { atom, map } from 'nanostores';
import { workbenchStore } from './workbench';
import { PROVIDER_LIST } from '~/utils/constants';
import type { IProviderConfig } from '~/types/model';

export interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  ctrlOrMetaKey?: boolean;
  action: () => void;
}

export interface Shortcuts {
  toggleTerminal: Shortcut;
}

export const URL_CONFIGURABLE_PROVIDERS = ['Ollama', 'LMStudio', 'OpenAILike'];
export const LOCAL_PROVIDERS = ['OpenAILike', 'LMStudio', 'Ollama'];

export type ProviderSetting = Record<string, IProviderConfig>;

export const shortcutsStore = map<Shortcuts>({
  toggleTerminal: {
    key: 'j',
    ctrlOrMetaKey: true,
    action: () => workbenchStore.toggleTerminal(),
  },
});

const initialProviderSettings: ProviderSetting = {};
PROVIDER_LIST.forEach((provider) => {
  initialProviderSettings[provider.name] = {
    ...provider,
    settings: {
      enabled: true,
    },
  };
});

//TODO: need to create one single map for all these flags

export const providersStore = map<ProviderSetting>(initialProviderSettings);

export const isDebugMode = atom(false);

export const isEventLogsEnabled = atom(false);

export const isLocalModelsEnabled = atom(true);

export const promptStore = atom<string>('default');

export const latestBranchStore = atom(false);

export const autoSelectStarterTemplate = atom(false);
export const enableContextOptimizationStore = atom(false);

export type LanguageDirection = 'ltr' | 'rtl';
export type LanguageCode = 'en' | 'ar';

export const languageDirectionStore = atom<LanguageDirection>('ltr');
export const languageCodeStore = atom<LanguageCode>('en');

export function setLanguage(code: LanguageCode, direction: LanguageDirection) {
  languageCodeStore.set(code);
  languageDirectionStore.set(direction);
  if (typeof document !== 'undefined') {
    document.documentElement.dir = direction;
    document.documentElement.lang = code;
  }
}

export const showSettingsWindowStore = atom<boolean>(false);

export function toggleSettingsWindow() {
  showSettingsWindowStore.set(!showSettingsWindowStore.get());
}
