import * as RadixDialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { useState, type ReactElement } from 'react';
import { classNames } from '~/utils/classNames';
import { DialogTitle, dialogVariants, dialogBackdropVariants } from '~/components/ui/Dialog';
import { IconButton } from '~/components/ui/IconButton';
import styles from './Settings.module.scss';
import ProvidersTab from './providers/ProvidersTab';
import { useSettings } from '~/lib/hooks/useSettings';
import FeaturesTab from './features/FeaturesTab';
import DebugTab from './debug/DebugTab';
import EventLogsTab from './event-logs/EventLogsTab';
import ConnectionsTab from './connections/ConnectionsTab';
import DataTab from './data/DataTab';

interface SettingsProps {
  open: boolean;
  onClose: () => void;
}

type TabType = 'data' | 'providers' | 'features' | 'debug' | 'event-logs' | 'connection';

export const SettingsWindow = ({ open, onClose }: SettingsProps) => {
  const { debug, eventLogs } = useSettings();
  const [activeTab, setActiveTab] = useState<TabType>('data');

  const tabs: { id: TabType; label: string; icon: string; component?: ReactElement }[] = [
    { id: 'data', label: 'البيانات', icon: 'i-ph:database', component: <DataTab /> },
    { id: 'providers', label: 'المزودون', icon: 'i-ph:key', component: <ProvidersTab /> },
    { id: 'connection', label: 'الاتصال', icon: 'i-ph:link', component: <ConnectionsTab /> },
    { id: 'features', label: 'الميزات', icon: 'i-ph:star', component: <FeaturesTab /> },
    ...(debug
      ? [
          {
            id: 'debug' as TabType,
            label: 'تصحيح الأخطاء',
            icon: 'i-ph:bug',
            component: <DebugTab />,
          },
        ]
      : []),
    ...(eventLogs
      ? [
          {
            id: 'event-logs' as TabType,
            label: 'سجلات الأحداث',
            icon: 'i-ph:list-bullets',
            component: <EventLogsTab />,
          },
        ]
      : []),
  ];

  return (
    <RadixDialog.Root open={open}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay asChild onClick={onClose}>
          <motion.div
            className="bg-black/50 fixed inset-0 z-max backdrop-blur-sm"
            initial="closed"
            animate="open"
            exit="closed"
            variants={dialogBackdropVariants}
          />
        </RadixDialog.Overlay>
        <RadixDialog.Content aria-describedby={undefined} asChild>
          <motion.div
            className="fixed inset-0 z-max h-full w-full border-0 rounded-none sm:h-[85vh] sm:w-[90vw] sm:max-w-[900px] sm:border sm:rounded-lg sm:top-[50%] sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] border-bolt-elements-borderColor shadow-lg focus:outline-none overflow-hidden"
            initial="closed"
            animate="open"
            exit="closed"
            variants={dialogVariants}
          >
            <div className="flex flex-col sm:flex-row h-full">
              <div
                className={classNames(
                  'w-full sm:w-48 border-l border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 p-4 flex flex-col justify-between flex-shrink-0 sm:overflow-y-auto',
                  styles['settings-tabs'],
                )}
              >
                <DialogTitle className="flex-shrink-0 text-lg font-semibold text-bolt-elements-textPrimary mb-2 text-center sm:text-right">
                  الإعدادات
                </DialogTitle>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={classNames(activeTab === tab.id ? styles.active : '')}
                  >
                    <div className={tab.icon} />
                    {tab.label}
                  </button>
                ))}
                <div className="mt-auto flex flex-col gap-2">
                  <a
                    href="https://github.com/stackblitz-labs/bolt.diy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={classNames(styles['settings-button'], 'flex items-center gap-2')}
                  >
                    <div className="i-ph:github-logo" />
                    جيت هب
                  </a>
                  <a
                    href="https://stackblitz-labs.github.io/bolt.diy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={classNames(styles['settings-button'], 'flex items-center gap-2')}
                  >
                    <div className="i-ph:book" />
                    المستندات
                  </a>
                </div>
              </div>

              <div className="flex-1 flex flex-col p-4 sm:p-8 sm:pt-10 bg-bolt-elements-background-depth-2 overflow-y-auto">
                <div className="flex-1 overflow-y-auto">{tabs.find((tab) => tab.id === activeTab)?.component}</div>
              </div>
            </div>
            <RadixDialog.Close asChild onClick={onClose}>
              <IconButton icon="i-ph:x" className="absolute top-[10px] left-[10px] sm:right-[10px] sm:left-auto" />
            </RadixDialog.Close>
          </motion.div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};
