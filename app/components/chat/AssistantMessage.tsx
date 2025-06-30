import { memo, useState, useEffect, useCallback } from 'react';
import { Markdown } from './Markdown';
import type { JSONValue } from 'ai';
import { IconButton } from '~/components/ui/IconButton';
import { toast } from 'react-toastify';

interface AssistantMessageProps {
  content: string;
  annotations?: JSONValue[];
}

// Global variable to track the currently speaking utterance for this component instance
// This helps ensure only one message speaks at a time. A more robust solution might use a global store
// if multiple AssistantMessage components could be playing simultaneously and need to be coordinated.
let currentSpeechInstance: SpeechSynthesisUtterance | null = null;
let currentMessageIdPlaying: string | null = null; // Use a unique ID for each message if available, or content

export const AssistantMessage = memo(({ content, annotations }: AssistantMessageProps) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  // Create a unique ID for this message instance for speech tracking
  const [messageInstanceId] = useState(() => Math.random().toString(36).substring(7));


  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setCanSpeak(true);
    }
    // Cleanup function to stop speech when component unmounts or content changes significantly
    return () => {
      if (window.speechSynthesis && currentMessageIdPlaying === messageInstanceId) {
        window.speechSynthesis.cancel();
        currentSpeechInstance = null;
        currentMessageIdPlaying = null;
        setIsSpeaking(false);
      }
    };
  }, [messageInstanceId]); // Empty dependency array means this runs once on mount and cleanup on unmount.

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Copied to clipboard!', { autoClose: 1500 });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy.');
    }
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const filteredAnnotations = (annotations?.filter(
    (annotation: JSONValue) => annotation && typeof annotation === 'object' && Object.keys(annotation).includes('type'),
  ) || []) as { type: string; value: any }[];

  const usage: {
    completionTokens: number;
    promptTokens: number;
    totalTokens: number;
  } = filteredAnnotations.find((annotation) => annotation.type === 'usage')?.value;

  const handleToggleSpeak = useCallback(() => {
    if (!canSpeak || !content) return;

    if (isSpeaking) { // If currently speaking this message, stop it
      window.speechSynthesis.cancel(); // This will trigger onend for the current utterance
      currentSpeechInstance = null;
      currentMessageIdPlaying = null;
      setIsSpeaking(false);
    } else {
      // If another message is speaking, stop it first
      if (window.speechSynthesis.speaking && currentSpeechInstance) {
        window.speechSynthesis.cancel();
        // Find a way to signal other components to update their isSpeaking state if necessary,
        // or rely on their own onend/onerror handlers. For now, this just stops global speech.
      }

      const utterance = new SpeechSynthesisUtterance(content);
      currentSpeechInstance = utterance; // Track this instance
      currentMessageIdPlaying = messageInstanceId;

      utterance.onend = () => {
        if (currentMessageIdPlaying === messageInstanceId) {
          setIsSpeaking(false);
          currentSpeechInstance = null;
          currentMessageIdPlaying = null;
        }
      };
      utterance.onerror = (event) => {
        console.error('SpeechSynthesis Error:', event);
        toast.error('Error playing audio.');
        if (currentMessageIdPlaying === messageInstanceId) {
          setIsSpeaking(false);
          currentSpeechInstance = null;
          currentMessageIdPlaying = null;
        }
      };
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  }, [canSpeak, content, isSpeaking, messageInstanceId]);


  return (
    <div
      className="group relative overflow-hidden w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {usage && (
        <div className="text-sm text-bolt-elements-textSecondary mb-2 rtl:text-right">
          Tokens: {usage.totalTokens} (prompt: {usage.promptTokens}, completion: {usage.completionTokens})
        </div>
      )}
      <Markdown html>{content}</Markdown>
      {(isHovered || copied || isSpeaking) && (
        <div className="absolute top-1 right-1 rtl:right-auto rtl:left-1 flex flex-col gap-0.5 opacity-100 transition-opacity p-0.5 z-10">
          <IconButton
            icon={copied ? 'i-ph:check-circle-duotone' : 'i-ph:copy-duotone'}
            size="sm"
            title={copied ? 'Copied!' : 'Copy to Clipboard'}
            onClick={handleCopy}
            className={copied ? 'text-green-500 hover:text-green-600' : 'text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary'}
          />
          {canSpeak && (
            <IconButton
              icon={isSpeaking ? 'i-ph:speaker-slash-duotone' : 'i-ph:speaker-high-duotone'}
              size="sm"
              title={isSpeaking ? 'Stop Speaking' : 'Read Aloud'}
              onClick={handleToggleSpeak}
              className={isSpeaking ? 'text-red-500 hover:text-red-600' : 'text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary'}
            />
          )}
        </div>
      )}
    </div>
  );
});
