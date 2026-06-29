/**
 * Cognitience WP — Shared Types
 * Common interfaces used across main process, renderer, and extensions.
 */

// ─── Document Types ──────────────────────────────────────────────

export interface CognitionDocument {
  id: string;
  title: string;
  content: string;
  format: DocumentFormat;
  filePath: string | null;
  isDirty: boolean;
  createdAt: number;
  updatedAt: number;
  language: string;
  wordCount: number;
  charCount: number;
}

export type DocumentFormat = 'cognitience' | 'markdown' | 'html' | 'plaintext' | 'rich';

export interface DocumentStats {
  wordCount: number;
  charCount: number;
  paragraphCount: number;
  lineCount: number;
  readingTime: number; // minutes
}

// ─── Extension API Types ──────────────────────────────────────────

export interface ExtensionManifest {
  name: string;
  displayName: string;
  description: string;
  version: string;
  publisher: string;
  engines: { cognitienceWp: string };
  categories: string[];
  keywords: string[];
  main: string;
  icon: string;
  activationEvents: string[];
  contributes: ExtensionContributions;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export interface ExtensionContributions {
  commands: CommandContribution[];
  menus: MenuContribution[];
  keybindings: KeybindingContribution[];
  configuration: ConfigurationContribution | null;
  themes: ThemeContribution[];
  views: ViewContribution[];
  statusBarItems: StatusBarContribution[];
  sidebarItems: SidebarContribution[];
  documentFormatters: DocumentFormatterContribution[];
  exportFormats: ExportFormatContribution[];
  importFormats: ImportFormatContribution[];
}

export interface CommandContribution {
  command: string;
  title: string;
  category: string;
  icon: string;
  enablement: string;
}

export interface MenuContribution {
  command: string;
  group: string;
  when: string;
  order: number;
}

export interface KeybindingContribution {
  command: string;
  key: string;
  mac: string;
  when: string;
}

export interface ConfigurationContribution {
  title: string;
  properties: Record<string, ConfigurationProperty>;
}

export interface ConfigurationProperty {
  type: 'string' | 'boolean' | 'number' | 'array' | 'object';
  default: unknown;
  description: string;
  enum: string[] | null;
}

export interface ThemeContribution {
  id: string;
  label: string;
  type: 'light' | 'dark' | 'contrast';
  path: string;
}

export interface ViewContribution {
  id: string;
  name: string;
  position: 'sidebar-left' | 'sidebar-right' | 'panel-bottom';
  icon: string;
  when: string;
}

export interface StatusBarContribution {
  id: string;
  text: string;
  tooltip: string;
  alignment: 'left' | 'right';
  priority: number;
  command: string;
}

export interface SidebarContribution {
  id: string;
  title: string;
  icon: string;
  position: number;
}

export interface DocumentFormatterContribution {
  id: string;
  name: string;
  extensions: string[];
  apply: (content: string) => string;
}

export interface ExportFormatContribution {
  id: string;
  name: string;
  extension: string;
  mimeType: string;
  handler: string;
}

export interface ImportFormatContribution {
  id: string;
  name: string;
  extensions: string[];
  handler: string;
}

// ─── Extension Activation ─────────────────────────────────────────

export type ActivationEvent =
  | 'onStartup'
  | 'onCommand'
  | 'onLanguage'
  | 'onDocumentOpen'
  | 'onDocumentSave'
  | 'onView'
  | 'onTheme'
  | 'onConfiguration'
  | 'onFileExtension'
  | '*';

// ─── Command Registry ────────────────────────────────────────────

export interface RegisteredCommand {
  id: string;
  title: string;
  handler: (...args: unknown[]) => unknown | Promise<unknown>;
  extensionId: string;
  enabled: boolean;
}

export interface CommandExecutionContext {
  document: CognitionDocument | null;
  selection: string | null;
  editor: EditorState | null;
}

export interface EditorState {
  content: string;
  selectionStart: number;
  selectionEnd: number;
  scrollY: number;
}

// ─── Status Bar ──────────────────────────────────────────────────

export interface StatusBarItem {
  id: string;
  text: string;
  tooltip: string;
  alignment: 'left' | 'right';
  priority: number;
  command: string | null;
}

// ─── Extension State ──────────────────────────────────────────────

export type ExtensionState = 'uninstalled' | 'installed' | 'activating' | 'active' | 'deactivated' | 'disabled';

export interface InstalledExtension {
  id: string;
  manifest: ExtensionManifest;
  state: ExtensionState;
  installPath: string;
  installedAt: number;
  lastActivated: number | null;
  error: string | null;
}

// ─── IPC Channel Names ───────────────────────────────────────────

export const IPC = {
  // Document operations
  DOC_NEW: 'doc:new',
  DOC_OPEN: 'doc:open',
  DOC_SAVE: 'doc:save',
  DOC_SAVE_AS: 'doc:saveAs',
  DOC_EXPORT: 'doc:export',
  DOC_IMPORT: 'doc:import',
  DOC_CLOSE: 'doc:close',
  DOC_GET_STATS: 'doc:getStats',

  // Extension operations
  EXT_LIST: 'ext:list',
  EXT_INSTALL: 'ext:install',
  EXT_UNINSTALL: 'ext:uninstall',
  EXT_ENABLE: 'ext:enable',
  EXT_DISABLE: 'ext:disable',
  EXT_RELOAD: 'ext:reload',
  EXT_EXECUTE_COMMAND: 'ext:executeCommand',
  EXT_GET_COMMANDS: 'ext:getCommands',

  // Configuration
  CONFIG_GET: 'config:get',
  CONFIG_SET: 'config:set',
  CONFIG_GET_ALL: 'config:getAll',

  // Theme
  THEME_GET: 'theme:get',
  THEME_SET: 'theme:set',
  THEME_LIST: 'theme:list',

  // Clipboard
  CLIPBOARD_WRITE: 'clipboard:write',
  CLIPBOARD_READ: 'clipboard:read',

  // File system
  FS_READ: 'fs:read',
  FS_WRITE: 'fs:write',
  FS_LIST: 'fs:list',
  FS_EXISTS: 'fs:exists',
  FS_MKDIR: 'fs:mkdir',

  // Notifications
  NOTIFY_INFO: 'notify:info',
  NOTIFY_WARNING: 'notify:warning',
  NOTIFY_ERROR: 'notify:error',

  // Window
  WIN_MINIMIZE: 'win:minimize',
  WIN_MAXIMIZE: 'win:maximize',
  WIN_CLOSE: 'win:close',
  WIN_FULLSCREEN: 'win:fullscreen',

  // Quick open
  QUICK_OPEN: 'quick:open',
  COMMAND_PALETTE: 'command:palette',

  // Extension host events
  EXT_EVENT: 'ext:event',
} as const;
