import { convertToCoreMessages, streamText as _streamText } from 'ai';
import { MAX_TOKENS } from './constants';
import { getSystemPrompt } from '~/lib/common/prompts/prompts';
import {
  DEFAULT_MODEL,
  DEFAULT_PROVIDER,
  MODEL_REGEX,
  MODIFICATIONS_TAG_NAME,
  PROVIDER_LIST,
  PROVIDER_REGEX,
  WORK_DIR,
} from '~/utils/constants';
import { LlamaProvider } from '~/lib/modules/llm/providers/llama';
import ignore from 'ignore';
import type { IProviderSetting } from '~/types/model';
import { PromptLibrary } from '~/lib/common/prompt-library';
import { allowedHTMLElements } from '~/utils/markdown';
import { LLMManager } from '~/lib/modules/llm/manager';
import { createScopedLogger } from '~/utils/logger';

interface ToolResult<Name extends string, Args, Result> {
  toolCallId: string;
  toolName: Name;
  args: Args;
  result: Result;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolResult<string, unknown, unknown>[];
  model?: string;
}

export type Messages = Message[];

export type StreamingOptions = Omit<Parameters<typeof _streamText>[0], 'model'>;

export interface File {
  type: 'file';
  content: string;
  isBinary: boolean;
}

export interface Folder {
  type: 'folder';
}

type Dirent = File | Folder;

export type FileMap = Record<string, Dirent | undefined>;

export function simplifyBoltActions(input: string): string {
  // Using regex to match boltAction tags that have type="file"
  const regex = /(<boltAction[^>]*type="file"[^>]*>)([\s\S]*?)(<\/boltAction>)/g;

  // Replace each matching occurrence
  return input.replace(regex, (_0, openingTag, _2, closingTag) => {
    return `${openingTag}\n          ...\n        ${closingTag}`;
  });
}

// Common patterns to ignore, similar to .gitignore
const IGNORE_PATTERNS = [
  'node_modules/**',
  '.git/**',
  'dist/**',
  'build/**',
  '.next/**',
  'coverage/**',
  '.cache/**',
  '.vscode/**',
  '.idea/**',
  '**/*.log',
  '**/.DS_Store',
  '**/npm-debug.log*',
  '**/yarn-debug.log*',
  '**/yarn-error.log*',
  '**/*lock.json',
  '**/*lock.yml',
];
const ig = ignore().add(IGNORE_PATTERNS);

function createFilesContext(files: FileMap) {
  let filePaths = Object.keys(files);
  filePaths = filePaths.filter((x) => {
    const relPath = x.replace('/home/project/', '');
    return !ig.ignores(relPath);
  });

  const fileContexts = filePaths
    .filter((x) => files[x] && files[x].type == 'file')
    .map((path) => {
      const dirent = files[path];

      if (!dirent || dirent.type == 'folder') {
        return '';
      }

      const codeWithLinesNumbers = dirent.content
        .split('\n')
        .map((v, i) => `${i + 1}|${v}`)
        .join('\n');

      return `<file path="${path}">\n${codeWithLinesNumbers}\n</file>`;
    });

  return `Below are the code files present in the webcontainer:\ncode format:\n<line number>|<line content>\n <codebase>${fileContexts.join('\n\n')}\n\n</codebase>`;
}

function extractPropertiesFromMessage(message: Message): { model: string; provider: string; content: string } {
  const textContent = Array.isArray(message.content)
    ? message.content.find((item) => item.type === 'text')?.text || ''
    : message.content;

  const modelMatch = textContent.match(MODEL_REGEX);
  const providerMatch = textContent.match(PROVIDER_REGEX);

  /*
   * Extract model
   * const modelMatch = message.content.match(MODEL_REGEX);
   */
  const model = modelMatch ? modelMatch[1] : DEFAULT_MODEL;

  /*
   * Extract provider
   * const providerMatch = message.content.match(PROVIDER_REGEX);
   */
  const provider = providerMatch ? providerMatch[1] : DEFAULT_PROVIDER.name;

  const cleanedContent = Array.isArray(message.content)
    ? message.content.map((item) => {
        if (item.type === 'text') {
          return {
            type: 'text',
            text: item.text?.replace(MODEL_REGEX, '').replace(PROVIDER_REGEX, ''),
          };
        }

        return item; // Preserve image_url and other types as is
      })
    : textContent.replace(MODEL_REGEX, '').replace(PROVIDER_REGEX, '');

  return { model, provider, content: cleanedContent };
}

const logger = createScopedLogger('stream-text');

export async function streamText(props: {
  messages: Messages;
  env: Env;
  options?: StreamingOptions;
  apiKeys?: Record<string, string>;
  files?: FileMap;
  providerSettings?: Record<string, IProviderSetting>;
  promptId?: string;
  contextOptimization?: boolean;
}) {
  const { messages, env: serverEnv, options, apiKeys, files, providerSettings, promptId, contextOptimization } = props;
  const llmManager = LLMManager.getInstance(serverEnv as any); // Get LLMManager instance

  let currentModel = DEFAULT_MODEL;
  let currentProvider = DEFAULT_PROVIDER.name;
  const processedMessages = messages.map((message) => {
    if (message.role === 'user') {
      const { model, provider, content } = extractPropertiesFromMessage(message);
      currentModel = model;
      currentProvider = provider;

      return { ...message, content };
    } else if (message.role == 'assistant') {
      let content = message.content;

      if (contextOptimization) {
        content = simplifyBoltActions(content);
      }

      return { ...message, content };
    }

    return message;
  });

  let providerInstance: import('~/lib/modules/llm/base-provider').BaseProvider;
  let modelDetails: import('~/lib/modules/llm/types').ModelInfo | undefined;

  if (llmManager.isOnline()) {
    providerInstance = llmManager.getProvider(currentProvider) || llmManager.getDefaultProvider();
    const staticModels = providerInstance.staticModels || [];
    modelDetails = staticModels.find((m) => m.name === currentModel);

    if (!modelDetails) {
      const modelsList = [
        ...staticModels,
        ...(await llmManager.getModelListFromProvider(providerInstance, {
          apiKeys,
          providerSettings,
          serverEnv: serverEnv as any,
        })),
      ];
      if (!modelsList.length) {
        // This case should ideally be handled to prevent further errors
        // For now, let it proceed and fail at getModelInstance or _streamText
         logger.error(`No models found for provider ${providerInstance.name}. This might lead to an error.`);
      }
      modelDetails = modelsList.find((m) => m.name === currentModel);
      if (!modelDetails && modelsList.length > 0) {
        logger.warn(
          `MODEL [${currentModel}] not found in provider [${providerInstance.name}]. Falling back to first model. ${modelsList[0].name}`,
        );
        modelDetails = modelsList[0];
        currentModel = modelDetails.name;
      } else if (!modelDetails) {
           logger.error(`No model details found for ${currentModel} in ${providerInstance.name} and no fallback possible.`);
           // Throw an error here to prevent further execution with undefined modelDetails
           throw new Error(`Failed to find a suitable model for ${currentProvider}.`);
      }
    }
  } else {
    // Offline: Use LlamaProvider
    logger.info('Network offline. Switching to LlamaProvider.');
    providerInstance = new LlamaProvider();
    currentProvider = providerInstance.name;
    // Assuming LlamaProvider has a default model or a way to select one
    modelDetails = providerInstance.staticModels.find(m => m.name === 'llama-cpp'); // Or some other default
    if (!modelDetails && providerInstance.staticModels.length > 0) {
      modelDetails = providerInstance.staticModels[0];
    }
    if (!modelDetails) {
        logger.error('LlamaProvider has no models configured.');
        throw new Error('LlamaProvider has no models configured.');
    }
    currentModel = modelDetails.name;
    // Display offline notification to the user (handled in BaseChat.tsx)
  }

  const dynamicMaxTokens = modelDetails && modelDetails.maxTokenAllowed ? modelDetails.maxTokenAllowed : MAX_TOKENS;

  let systemPrompt =
    PromptLibrary.getPropmtFromLibrary(promptId || 'default', {
      cwd: WORK_DIR,
      allowedHtmlElements: allowedHTMLElements,
      modificationTagName: MODIFICATIONS_TAG_NAME,
    }) ?? getSystemPrompt();

  if (files && contextOptimization) {
    const codeContext = createFilesContext(files);
    systemPrompt = `${systemPrompt}\n\n ${codeContext}`;
  }

  logger.info(`Sending llm call to ${providerInstance.name} with model ${currentModel}`);

  try {
    // Ensure modelDetails is defined before calling getModelInstance
    if (!modelDetails) {
      logger.error(`Model details for ${currentModel} are undefined before calling AI service.`);
      throw new Error(`Model details for ${currentModel} could not be resolved.`);
    }
    return await _streamText({
      model: providerInstance.getModelInstance({
        model: currentModel,
        serverEnv,
        apiKeys,
        providerSettings,
      }),
      system: systemPrompt,
      maxTokens: dynamicMaxTokens,
      messages: convertToCoreMessages(processedMessages as any),
      ...options,
    });
  } catch (error: any) { // Explicitly type error
    logger.error(`Error during AI streamText call to ${providerInstance.name} with model ${currentModel}:`, error.message, error.stack);
    // Return a stream that emits an error message, compatible with Vercel AI SDK client-side handling
    return new ReadableStream({
      start(controller) {
        controller.error(new Error(`AI service error with ${providerInstance.name} (${currentModel}): ${error.message}`));
        controller.close();
      }
    });
  }
}
