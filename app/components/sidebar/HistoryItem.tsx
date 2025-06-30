import { useParams } from '@remix-run/react';
import { classNames } from '~/utils/classNames';
import * as Dialog from '@radix-ui/react-dialog';
import { type ChatHistoryItem } from '~/lib/persistence';
import WithTooltip from '~/components/ui/Tooltip';
import { useEditChatDescription } from '~/lib/hooks';
import { forwardRef, type ForwardedRef } from 'react';

interface HistoryItemProps {
  item: ChatHistoryItem;
  onDelete?: (event: React.UIEvent) => void;
  onDuplicate?: (id: string) => void;
  exportChat: (id?: string) => void;
}

export function HistoryItem({ item, onDelete, onDuplicate, exportChat }: HistoryItemProps) {
  const { id: urlId } = useParams();
  const isActiveChat = urlId === item.urlId;

  const { editing, handleChange, handleBlur, handleSubmit, handleKeyDown, currentDescription, toggleEditMode } =
    useEditChatDescription({
      initialDescription: item.description,
      customChatId: item.id,
      syncWithGlobalStore: isActiveChat,
    });

  const renderDescriptionForm = (
    <form onSubmit={handleSubmit} className="flex-1 flex items-center rtl:flex-row-reverse">
      <input
        type="text"
        className="flex-1 bg-bolt-elements-background-depth-1 text-bolt-elements-textPrimary rounded px-2 ms-2 me-2 rtl:ms-0 rtl:me-2" // Adjusted margins for RTL
        autoFocus
        value={currentDescription}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
      <button
        type="submit"
        className="i-ph:check scale-110 hover:text-bolt-elements-item-contentAccent"
        onMouseDown={handleSubmit}
      />
    </form>
  );

  return (
    <div
      className={classNames(
        'group rounded-md text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3 overflow-hidden flex justify-between items-center px-2 py-1 rtl:flex-row-reverse',
        { '[&&]:text-bolt-elements-textPrimary bg-bolt-elements-background-depth-3': isActiveChat },
      )}
    >
      {editing ? (
        renderDescriptionForm
      ) : (
        <a href={`/chat/${item.urlId}`} className="flex w-full relative truncate block rtl:flex-row-reverse">
          {currentDescription}
          <div
            className={classNames(
              'absolute z-1 top-0 bottom-0 bg-gradient-to-l rtl:bg-gradient-to-r from-bolt-elements-background-depth-2 group-hover:from-bolt-elements-background-depth-3 box-content to-transparent w-10 flex justify-end group-hover:w-22 group-hover:from-99% right-0 rtl:left-0 rtl:right-auto ps-3 rtl:pe-3', // Adjusted for RTL: gradient, position, padding
              { 'from-bolt-elements-background-depth-3 w-10 ': isActiveChat },
            )}
          >
            <div className="flex items-center p-1 text-bolt-elements-textSecondary opacity-0 group-hover:opacity-100 transition-opacity rtl:flex-row-reverse">
              <ChatActionButton
                toolTipContent="Export chat"
                icon="i-ph:download-simple" // Symmetrical icon
                onClick={(event) => {
                  event.preventDefault();
                  exportChat(item.id);
                }}
              />
              {onDuplicate && (
                <ChatActionButton
                  toolTipContent="Duplicate chat"
                  icon="i-ph:copy"
                  onClick={() => onDuplicate?.(item.id)}
                />
              )}
              <ChatActionButton
                toolTipContent="Rename chat"
                icon="i-ph:pencil-fill"
                onClick={(event) => {
                  event.preventDefault();
                  toggleEditMode();
                }}
              />
              <Dialog.Trigger asChild>
                <ChatActionButton
                  toolTipContent="Delete chat"
                  icon="i-ph:trash" // Symmetrical icon
                  className="[&&]:hover:text-bolt-elements-button-danger-text"
                  onClick={(event) => {
                    event.preventDefault();
                    onDelete?.(event);
                  }}
                />
              </Dialog.Trigger>
            </div>
          </div>
        </a>
      )}
    </div>
  );
}

const ChatActionButton = forwardRef(
  (
    {
      toolTipContent,
      icon,
      className,
      onClick,
    }: {
      toolTipContent: string;
      icon: string;
      className?: string;
      onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
      btnTitle?: string;
    },
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    return (
      <WithTooltip tooltip={toolTipContent}>
        <button
          ref={ref}
          type="button"
          className={`scale-110 hover:text-bolt-elements-item-contentAccent ${icon} ${className ? className : ''} me-2 rtl:ms-2 rtl:me-0`} // Adjusted margin for RTL
          onClick={onClick}
        />
      </WithTooltip>
    );
  },
);
