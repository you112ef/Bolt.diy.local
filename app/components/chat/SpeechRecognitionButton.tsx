import React, { useState, useEffect, useCallback } from 'react';
import { IconButton } from '~/components/ui/IconButton';
import { toast } from 'react-toastify';
import { classNames } from '~/utils/classNames';

interface SpeechRecognitionButtonProps {
  onTranscript: (transcript: string) => void;
  onListeningStateChange?: (isListening: boolean) => void; // Optional: to inform parent about listening state
  disabled?: boolean;
  currentInput: string; // To append or replace
}

const SpeechRecognitionButton: React.FC<SpeechRecognitionButtonProps> = ({
  onTranscript,
  onListeningStateChange,
  disabled,
  currentInput,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      console.warn('Web Speech API is not supported in this browser.');
      return;
    }

    const instance = new SpeechRecognitionAPI();
    instance.continuous = true; // Keep listening even after a pause
    instance.interimResults = true; // Get results as they are recognized

    instance.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      // Append final transcript to existing input or the latest interim
      // For this version, we'll update with interim and finalize with final for smoother UX
      onTranscript(currentInput + (finalTranscript || interimTranscript));
    };

    instance.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      toast.error(`Speech recognition error: ${event.error}`);
      if (isListening) { // Only update if it was an active listening error
        setIsListening(false);
        onListeningStateChange?.(false);
      }
    };

    instance.onend = () => {
      // Only set isListening to false if it wasn't manually stopped
      // This allows for continuous listening unless explicitly stopped by user
      // However, for a toggle button, usually onend means stop.
      // If continuous is true, onend might fire if user stops talking for too long.
      // For a button toggle, we manage state via setIsListening.
      // If recognition stops unexpectedly, isListening might become out of sync.
      // Let's ensure isListening is false if recognition genuinely stops.
      // For now, if it ends and we weren't trying to stop it, maybe try to restart?
      // Or just accept it stopped. For button toggle, user stopping means it should be off.
      if(isListening) { // If it ended while we thought we were listening (e.g. auto-stop due to silence)
        // setIsListening(false); // Commented out to allow more 'continuous' feel if desired
        // onListeningStateChange?.(false);
      }
    };

    setRecognition(instance);

    return () => {
      if (instance) {
        instance.abort(); // Abort any ongoing recognition
        instance.onresult = null;
        instance.onerror = null;
        instance.onend = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onTranscript]); // currentInput removed from deps to avoid re-creating recognition on every input change

  const handleToggleListen = useCallback(async () => {
    if (!recognition) {
      toast.warn('Speech recognition is not available in this browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      onListeningStateChange?.(false);
    } else {
      try {
        // Check for permission. This might not be standard, actual permission request is complex.
        // Browsers usually handle permission prompts automatically on the first .start()
        // For robustness, one might use Permissions API if available: navigator.permissions.query({ name: 'microphone' })
        recognition.start();
        setIsListening(true);
        onListeningStateChange?.(true);
        // Clear previous transcript part from input before starting new dictation for this segment
        // This depends on desired UX. For now, we append.
        // onTranscript(""); // Option to clear previous interim results from input
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        toast.error("Could not start voice input. Check microphone permissions.");
        setIsListening(false);
        onListeningStateChange?.(false);
      }
    }
  }, [recognition, isListening, onListeningStateChange]);

  const icon = isListening ? 'i-ph:microphone-slash-duotone' : 'i-ph:microphone-duotone';
  const title = isListening ? 'Stop Listening' : 'Start Voice Input';

  if (!recognition) { // If API is not supported at all
    return (
      <IconButton
        icon="i-ph:microphone-slash-duotone"
        size="xl"
        title="Voice input not supported"
        disabled={true}
        className={classNames(className, 'opacity-50 cursor-not-allowed')}
      />
    );
  }

  return (
    <IconButton
      icon={icon}
      size="xl"
      title={title}
      onClick={handleToggleListen}
      disabled={disabled}
      className={classNames(className, isListening ? 'text-red-500' : '')}
    />
  );
};

export default SpeechRecognitionButton;
