/**
 * Cognitience WP — Extension API SDK
 * Public API for extension developers.
 *
 * To create an extension:
 * 1. Create a directory in ~/.cognitience-wp/extensions/<your-extension>/
 * 2. Add a package.json with the extension manifest
 * 3. Create your main JS file that exports activate() and optionally deactivate()
 *
 * Example:
 * ```js
 * exports.activate = function(ctx) {
 *   ctx.commands.registerCommand('myext.hello', () => {
 *     ctx.notifications.info('Hello from my extension!');
 *   });
 * };
 * ```
 */

export {};

// Type declarations for extension developers
// These are provided for IDE support — the actual implementation
// is in the ExtensionHost (src/main/extension-host.ts)

declare global {
  interface Disposable {
    dispose(): void;
  }

  interface CognitionExtensionContext {
    extensionId: string;
    extensionPath: string;
    subscriptions: Disposable[];

    commands: {
      registerCommand(id: string, handler: (...args: unknown[]) => unknown, thisArg?: unknown): Disposable;
      executeCommand(id: string, ...args: unknown[]): Promise<unknown>;
      getCommands(): string[];
    };

    config: {
      get<T = unknown>(key: string): T;
      getAll(): Record<string, unknown>;
    };

    statusBar: {
      createItem(alignment: 'left' | 'right', priority: number): StatusBarItem;
    };

    notifications: {
      info(message: string): void;
      warning(message: string): void;
      error(message: string): void;
    };

    editor: {
      getContent(): Promise<string>;
      setContent(content: string): void;
      getSelection(): Promise<{ text: string; start: number; end: number }>;
      insertText(text: string, position?: number): void;
      replaceSelection(text: string): void;
      scrollTo(position: number): void;
    };

    documents: {
      onDidOpen(cb: (doc: unknown) => void): Disposable;
      onDidSave(cb: (doc: unknown) => void): Disposable;
      onDidChange(cb: (changes: unknown) => void): Disposable;
    };

    fs: {
      readFileSync(filePath: string): string;
      writeFileSync(filePath: string, content: string): void;
      existsSync(filePath: string): boolean;
      readDirSync(dirPath: string): string[];
    };

    logger: {
      info(...msgs: unknown[]): void;
      warn(...msgs: unknown[]): void;
      error(...msgs: unknown[]): void;
    };
  }

  interface StatusBarItem {
    id: string;
    setText(text: string): void;
    setTooltip(tooltip: string): void;
    show(): void;
    hide(): void;
    dispose(): void;
  }
}

export interface ExtensionModule {
  activate(context: CognitionExtensionContext, ...args: unknown[]): void | Promise<void>;
  deactivate?(): void | Promise<void>;
}
