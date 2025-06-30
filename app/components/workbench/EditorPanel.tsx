import { useStore } from '@nanostores/react';
import { memo, useMemo } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import {
  CodeMirrorEditor,
  type EditorDocument,
  type EditorSettings,
  type OnChangeCallback as OnEditorChange,
  type OnSaveCallback as OnEditorSave,
  type OnScrollCallback as OnEditorScroll,
} from '~/components/editor/codemirror/CodeMirrorEditor';
import { PanelHeader } from '~/components/ui/PanelHeader';
import { PanelHeaderButton } from '~/components/ui/PanelHeaderButton';
import type { FileMap } from '~/lib/stores/files';
import { themeStore } from '~/lib/stores/theme';
import { WORK_DIR } from '~/utils/constants';
import { renderLogger } from '~/utils/logger';
import { isMobile } from '~/utils/mobile';
import { FileBreadcrumb } from './FileBreadcrumb';
import { FileTree } from './FileTree';
import { DEFAULT_TERMINAL_SIZE, TerminalTabs } from './terminal/TerminalTabs';
import { workbenchStore } from '~/lib/stores/workbench';

interface EditorPanelProps {
  files?: FileMap;
  unsavedFiles?: Set<string>;
  editorDocument?: EditorDocument;
  selectedFile?: string | undefined;
  isStreaming?: boolean;
  onEditorChange?: OnEditorChange;
  onEditorScroll?: OnEditorScroll;
  onFileSelect?: (value?: string) => void;
  onFileSave?: OnEditorSave;
  onFileReset?: () => void;
}

const DEFAULT_EDITOR_SIZE = 100 - DEFAULT_TERMINAL_SIZE;

const editorSettings: EditorSettings = { tabSize: 2 };

export const EditorPanel = memo(
  ({
    files,
    unsavedFiles,
    editorDocument,
    selectedFile,
    isStreaming,
    onFileSelect,
    onEditorChange,
    onEditorScroll,
    onFileSave,
    onFileReset,
  }: EditorPanelProps) => {
    renderLogger.trace('EditorPanel');

    const theme = useStore(themeStore);
    const showTerminal = useStore(workbenchStore.showTerminal);
    const [isRTL, setIsRTL] = useState(false);

    useEffect(() => {
      // Assuming html dir attribute is set for RTL
      setIsRTL(document.documentElement.dir === 'rtl');
    }, []);

    const activeFileSegments = useMemo(() => {
      if (!editorDocument) {
        return undefined;
      }

      return editorDocument.filePath.split('/');
    }, [editorDocument]);

    const activeFileUnsaved = useMemo(() => {
      return editorDocument !== undefined && unsavedFiles?.has(editorDocument.filePath);
    }, [editorDocument, unsavedFiles]);

    const fileTreePanel = (
      <Panel defaultSize={20} minSize={10} collapsible order={1}>
        <div className="flex flex-col border-r rtl:border-l rtl:border-r-0 border-bolt-elements-borderColor h-full">
          <PanelHeader className="rtl:flex-row-reverse">
            <div className="i-ph:tree-structure-duotone shrink-0" />
            Files
          </PanelHeader>
          <FileTree
            className="h-full"
            files={files}
            hideRoot
            unsavedFiles={unsavedFiles}
            rootFolder={WORK_DIR}
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
          />
        </div>
      </Panel>
    );

    const editorContentPanel = (
      <Panel className="flex flex-col" defaultSize={80} minSize={20} order={2}>
        <PanelHeader className="overflow-x-auto">
          {activeFileSegments?.length && (
            <div className="flex items-center flex-1 text-sm rtl:flex-row-reverse">
              <FileBreadcrumb pathSegments={activeFileSegments} files={files} onFileSelect={onFileSelect} />
              {activeFileUnsaved && (
                // ml-auto correctly pushes to the other side in RTL.
                // Adjust margin for the button group container for RTL.
                <div className="flex gap-1 ml-auto ms-auto me-0 rtl:-ms-1.5 rtl:me-auto">
                  <PanelHeaderButton onClick={onFileSave}>
                    <div className="i-ph:floppy-disk-duotone" />
                    Save
                  </PanelHeaderButton>
                  <PanelHeaderButton onClick={onFileReset}>
                    <div className="i-ph:clock-counter-clockwise-duotone" />
                    Reset
                  </PanelHeaderButton>
                </div>
              )}
            </div>
          )}
        </PanelHeader>
        <div className="h-full flex-1 overflow-hidden">
          <CodeMirrorEditor
            theme={theme}
            editable={!isStreaming && editorDocument !== undefined}
            settings={editorSettings}
            doc={editorDocument}
            autoFocusOnDocumentChange={!isMobile()}
            onScroll={onEditorScroll}
            onChange={onEditorChange}
            onSave={onFileSave}
          />
        </div>
      </Panel>
    );

    return (
      <PanelGroup direction="vertical">
        <Panel defaultSize={showTerminal ? DEFAULT_EDITOR_SIZE : 100} minSize={20}>
          <PanelGroup direction="horizontal">
            {isRTL ? (
              <>
                {editorContentPanel}
                <PanelResizeHandle />
                {fileTreePanel}
              </>
            ) : (
              <>
                {fileTreePanel}
                <PanelResizeHandle />
                {editorContentPanel}
              </>
            )}
          </PanelGroup>
        </Panel>
        <PanelResizeHandle />
        <TerminalTabs />
      </PanelGroup>
    );
  },
);
