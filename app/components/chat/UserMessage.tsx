/*
 * @ts-nocheck
 * Preventing TS checks with files presented in the video for a better presentation.
 */
import { MODEL_REGEX, PROVIDER_REGEX } from '~/utils/constants';
import { Markdown } from './Markdown';
import { IconButton } from '~/components/ui/IconButton';
import { toast } from 'react-toastify';
import { useState, useMemo, useEffect } from 'react';

interface UserMessageProps {
  content: string | Array<{ type: string; text?: string; image?: string }>;
}

export function UserMessage({ content }: UserMessageProps) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const textToCopy = useMemo(() => {
    if (Array.isArray(content)) {
      const textItem = content.find((item) => item.type === 'text');
      return stripMetadata(textItem?.text || '');
    }
    return stripMetadata(content);
  }, [content]);

  const handleCopy = async () => {
    if (!textToCopy.trim()) {
      toast.info('No text to copy.', { autoClose: 1500 });
      return;
    }
    try {
      await navigator.clipboard.writeText(textToCopy);
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

  if (Array.isArray(content)) {
    const textItem = content.find((item) => item.type === 'text');
    const textContentForDisplay = stripMetadata(textItem?.text || ''); // Use this for display
    const images = content.filter((item) => item.type === 'image' && item.image);

    return (
      <div
        className="group relative overflow-hidden pt-[4px] w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col gap-4">
          {textContentForDisplay && <Markdown html>{textContentForDisplay}</Markdown>}
          {images.map((item, index) => (
            <img
              loading="lazy" // Assuming lazy loading was intended from previous steps
              key={index}
              src={item.image}
              alt={`Image ${index + 1}`}
              className="max-w-full h-auto rounded-lg self-start rtl:self-end"
              style={{ maxHeight: '512px', objectFit: 'contain' }}
            />
          ))}
        </div>
        {textToCopy.trim() && (
          <div className="absolute top-1 right-1 rtl:right-auto rtl:left-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 z-10">
            <IconButton
              icon={copied ? 'i-ph:check-circle-duotone' : 'i-ph:copy-duotone'}
              size="sm"
              title={copied ? 'Copied!' : 'Copy Text'}
              onClick={handleCopy}
              className={copied ? 'text-green-500 hover:text-green-600' : 'text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary'}
            />
          </div>
        )}
      </div>
    );
  }

  // For simple string content
  const textContentForDisplay = stripMetadata(content); // Use this for display

  return (
    <div
      className="group relative overflow-hidden pt-[4px] w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Markdown html>{textContentForDisplay}</Markdown>
      {textToCopy.trim() && (
         <div className="absolute top-1 right-1 rtl:right-auto rtl:left-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 z-10">
          <IconButton
            icon={copied ? 'i-ph:check-circle-duotone' : 'i-ph:copy-duotone'}
            size="sm"
            title={copied ? 'Copied!' : 'Copy Text'}
            onClick={handleCopy}
            className={copied ? 'text-green-500 hover:text-green-600' : 'text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary'}
          />
        </div>
      )}
    </div>
  );
}

function stripMetadata(content: string) {
  return content.replace(MODEL_REGEX, '').replace(PROVIDER_REGEX, '');
}
