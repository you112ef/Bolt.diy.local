import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';
import BackgroundRays from '~/components/ui/BackgroundRays';
import React, { Suspense } from 'react'; // Ensure Suspense is imported
import { useStore } from '@nanostores/react';
import { showSettingsWindowStore, toggleSettingsWindow } from '~/lib/stores/settings';
// import { SettingsWindow } from '~/components/settings/SettingsWindow'; // Remove direct import

// Lazy load SettingsWindow
const SettingsWindow = React.lazy(() => import('~/components/settings/SettingsWindow'));

export const meta: MetaFunction = () => {
  return [{ title: 'Bolt' }, { name: 'description', content: 'Talk with Bolt, an AI assistant from StackBlitz' }];
};

export const loader = () => json({});

export default function Index() {
  const showSettings = useStore(showSettingsWindowStore);

  return (
    <div className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1">
      <BackgroundRays />
      <Header />
      <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
      {showSettings && (
        <Suspense fallback={<div className="p-4 text-center">Loading Settings...</div>}> {/* Or a more sophisticated loader */}
          <SettingsWindow open={showSettings} onClose={toggleSettingsWindow} />
        </Suspense>
      )}
    </div>
  );
}
