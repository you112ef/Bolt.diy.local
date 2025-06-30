/**
 * Core data structure for an automation rule.
 */
export interface AutomationRule {
  id: string;          // Unique identifier (e.g., UUID)
  name: string;        // User-defined name for the rule
  trigger: Trigger;    // The event that causes the automation to run
  action: Action;      // The task the automation performs
  isEnabled: boolean;  // Whether the rule is currently active
  createdAt: Date;     // Timestamp of when the rule was created
  updatedAt: Date;     // Timestamp of when the rule was last updated
}

/**
 * Defines the trigger for an automation rule.
 * This is a discriminated union based on the `type` property.
 */
export type Trigger =
  | KeywordTrigger
  | OfflineTrigger
  | FileReceivedTrigger
  | TimedTrigger;

export interface BaseTrigger {
  type: 'keyword' | 'offline' | 'fileReceived' | 'timed';
  // Common properties for all triggers can go here if any
}

export interface KeywordTrigger extends BaseTrigger {
  type: 'keyword';
  keywords: string[]; // List of keywords to look for in messages
  // future: messageSource: 'user' | 'assistant' | 'any'; // To specify whose message to check
}

export interface OfflineTrigger extends BaseTrigger {
  type: 'offline';
  // No specific properties needed, triggers when app goes offline
}

export interface FileReceivedTrigger extends BaseTrigger {
  type: 'fileReceived';
  fileTypes: string[]; // MIME types or extensions, e.g., ['application/pdf', 'image/jpeg']
  // future: source: 'upload' | 'dragAndDrop' | 'any';
}

export interface TimedTrigger extends BaseTrigger {
  type: 'timed';
  cronExpression: string; // Standard CRON expression for scheduling
                          // Note: True CRON execution in a web client is limited.
                          // This might be interpreted as "run if app is open at this time"
                          // or require Service Workers for more robust background-like scheduling.
}

/**
 * Defines the action an automation rule performs.
 * This is a discriminated union based on the `type` property.
 */
export type Action =
  | SendMessageAction
  | RunCommandAction
  | WebhookAction;

export interface BaseAction {
  type: 'sendMessage' | 'runCommand' | 'webhook';
  // Common properties for all actions can go here if any
}

export interface SendMessageAction extends BaseAction {
  type: 'sendMessage';
  prompt: string;     // The predefined prompt or message to send
  model?: string;    // Optional: specific model to use (if applicable)
  // future: recipient?: 'currentChat' | 'newChat';
}

export interface RunCommandAction extends BaseAction {
  type: 'runCommand';
  command: string;    // The shell command to execute
                      // Note: Requires a secure execution environment (e.g., integrated terminal with user consent)
}

export interface WebhookAction extends BaseAction {
  type: 'webhook';
  url: string;        // The URL to send the POST request to
  method?: 'POST' | 'GET' | 'PUT'; // Optional: HTTP method, defaults to POST
  payload: string;    // JSON string or other stringified payload
                      // future: headers?: Record<string, string>;
                      // future: payloadType?: 'json' | 'formData' | 'text';
}
