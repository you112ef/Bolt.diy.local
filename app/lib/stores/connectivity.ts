import { create } from 'zustand';

export type LocalLlamaStatus = 'not-loaded' | 'loading' | 'loaded' | 'error';

interface ConnectivityState {
  isOnline: boolean;
  localLlamaStatus: LocalLlamaStatus;
  setOnline: (isOnline: boolean) => void;
  setLocalLlamaStatus: (status: LocalLlamaStatus) => void;
}

export const useConnectivityStore = create<ConnectivityState>((set) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  localLlamaStatus: 'not-loaded',
  setOnline: (isOnline) => set({ isOnline }),
  setLocalLlamaStatus: (status) => set({ localLlamaStatus: status }),
}));

import { toast } from 'react-toastify'; // Import toast

// Function to simulate loading local LLaMA model
const simulateLoadLocalLlama = async () => {
  const { setLocalLlamaStatus, localLlamaStatus } = useConnectivityStore.getState();

  if (localLlamaStatus !== 'not-loaded' && localLlamaStatus !== 'error') {
    // Already loaded or currently loading
    return;
  }

  setLocalLlamaStatus('loading');
  console.log('Simulating local LLaMA model loading...');
  // Simulate a delay for model loading
  await new Promise(resolve => setTimeout(resolve, 3000)); // 3-second delay

  // Simulate success or error
  const success = Math.random() > 0.3; // 70% success rate for simulation
  if (success) {
    setLocalLlamaStatus('loaded');
    console.log('Local LLaMA model loaded successfully (simulated).');
    // Define the placeholder function if it doesn't exist
    if (typeof (window as any).callLocalLlama !== 'function') {
      (window as any).callLocalLlama = async (prompt: string, messages: any[]) => {
        console.log('callLocalLlama (simulated) with prompt:', prompt, 'and messages:', messages);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate response delay
        // Include previous messages in the response for context demonstration
        const historyContext = messages.slice(0, -1).map(m => `${m.role}: ${m.content}`).join('\n');
        return {
          role: 'assistant',
          content: `(Local LLaMA Simulated Response to: "${prompt}")\n[History context:\n${historyContext}\n]`,
        };
      };
    }
  } else {
    setLocalLlamaStatus('error');
    console.error('Failed to load local LLaMA model (simulated).');
  }
};


// Initialize and update online status
if (typeof window !== 'undefined') {
  const { setOnline, isOnline, localLlamaStatus: currentLlamaStatus } = useConnectivityStore.getState();

  window.addEventListener('online', () => {
    setOnline(true);
    toast.success("You're back online! Using cloud models.", { autoClose: 2000 });
    // Optionally, reset localLlamaStatus if cloud is always preferred when online
    // useConnectivityStore.getState().setLocalLlamaStatus('not-loaded');
  });

  window.addEventListener('offline', () => {
    setOnline(false);
    const currentStatus = useConnectivityStore.getState().localLlamaStatus;
    if (currentStatus === 'loaded') {
      toast.info("You're offline. Using local LLaMA model.", { autoClose: 2000 });
    } else if (currentStatus === 'error') {
      toast.error("You're offline. Failed to load local LLaMA model.", { autoClose: 2000 });
    } else {
      toast.warn("You're offline. Attempting to load local LLaMA model...", { autoClose: 2000 });
    }
    // Attempt to load local LLaMA when going offline
    simulateLoadLocalLlama();
  });

  // Set initial status
  const initiallyOnline = navigator.onLine;
  setOnline(initiallyOnline);
  if (!initiallyOnline) {
    simulateLoadLocalLlama(); // Attempt to load if starting offline
  }
}
