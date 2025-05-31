import { json, type MetaFunction } from '@remix-run/cloudflare';
import { useState } from 'react';
import { BottomNavigationBar } from '~/components/navigation/BottomNavigationBar';
import { AutomationView } from '~/components/sections/AutomationView';
import { TemplatesView } from '~/components/sections/TemplatesView';
import { AiAssistantView } from '~/components/sections/AiAssistantView';
import { SettingsView } from '~/components/sections/SettingsView';
import BackgroundRays from '~/components/ui/BackgroundRays';

export const meta: MetaFunction = () => {
  return [
    { title: 'يوسف n8n' },
    { name: 'description', content: 'منصة أتمتة ويب عربية محسّنة للجوال.' },
  ];
};

export const loader = () => json({});

type ViewName = 'Automation' | 'Templates' | 'AiAssistant' | 'Settings';

export default function Index() {
  const [activeView, setActiveView] = useState<ViewName>('Automation');

  const renderView = () => {
    switch (activeView) {
      case 'Automation':
        return <AutomationView />;
      case 'Templates':
        return <TemplatesView />;
      case 'AiAssistant':
        return <AiAssistantView />;
      case 'Settings':
        return <SettingsView />;
      default:
        return <AutomationView />;
    }
  };

  return (
    <div
      className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1"
      style={{ paddingBottom: '60px' }} // Adjust if nav height changes
    >
      <BackgroundRays />
      <div style={{ flex: 1, overflowY: 'auto' }}> {/* Ensure content area scrolls */}
        {renderView()}
      </div>
      <BottomNavigationBar activeView={activeView} onNavigate={setActiveView} />
    </div>
  );
}
