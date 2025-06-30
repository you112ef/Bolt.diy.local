import React from 'react';
import { useStore } from '@nanostores/react';
import { useConnectivityStore, type LocalLlamaStatus } from '~/lib/stores/connectivity'; // Using Zustand store
import WithTooltip from '~/components/ui/Tooltip';
import { classNames } from '~/utils/classNames';

// Helper to determine icon and text based on status
const getStatusDetails = (isOnline: boolean, llamaStatus: LocalLlamaStatus): { icon: string; text: string; tooltip: string; colorClass: string } => {
  if (isOnline) {
    // TODO: Add a check here for "Cloud Unavailable" if cloud service fails despite being online
    return {
      icon: 'i-ph:cloud-duotone',
      text: 'Cloud',
      tooltip: 'Online: Using cloud-based AI models.',
      colorClass: 'text-green-500',
    };
  } else {
    switch (llamaStatus) {
      case 'not-loaded':
        return {
          icon: 'i-ph:plugs-connected-duotone',
          text: 'Offline',
          tooltip: 'Offline: Local model not yet loaded. Attempting to load...',
          colorClass: 'text-yellow-500 animate-pulse',
        };
      case 'loading':
        return {
          icon: 'i-svg-spinners:90-ring-with-bg',
          text: 'Loading Local',
          tooltip: 'Offline: Local LLaMA model is loading...',
          colorClass: 'text-yellow-500',
        };
      case 'loaded':
        return {
          icon: 'i-ph:desktop-tower-duotone',
          text: 'Local',
          tooltip: 'Offline: Using local LLaMA model.',
          colorClass: 'text-blue-500',
        };
      case 'error':
        return {
          icon: 'i-ph:warning-octagon-duotone',
          text: 'Local Error',
          tooltip: 'Offline: Error loading or using local LLaMA model.',
          colorClass: 'text-red-500',
        };
      default:
        return {
          icon: 'i-ph:question-duotone',
          text: 'Unknown',
          tooltip: 'Connectivity status is unknown.',
          colorClass: 'text-gray-500',
        };
    }
  }
};

export const ModelStatusIndicator: React.FC = () => {
  const { isOnline, localLlamaStatus } = useConnectivityStore(state => ({ isOnline: state.isOnline, localLlamaStatus: state.localLlamaStatus }));

  const { icon, text, tooltip, colorClass } = getStatusDetails(isOnline, localLlamaStatus);

  return (
    <WithTooltip tooltip={tooltip} position="bottom">
      <div className={classNames("flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium", colorClass)}>
        <div className={classNames(icon, "text-lg")} />
        <span>{text}</span>
      </div>
    </WithTooltip>
  );
};
