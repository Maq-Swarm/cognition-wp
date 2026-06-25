/**
 * Cognition WP — IPC Registry
 * Registers all IPC handlers between the main process and renderer.
 */

import { ipcMain, dialog, clipboard, shell, BrowserWindow } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { WindowManager } from './window-manager';
import { ExtensionHost } from './extension-host';
import { ConfigStore } from './config-store';
import { BUILTIN_THEMES, COGNITION_DOC_FORMAT } from '../shared/constants';

export class IPCMainRegistry {
  constructor(
    private windowManager: WindowManager,
    private extensionHost: ExtensionHost,
    private configStore: ConfigStore,
  ) {}

  registerAll() {
    this.registerDocumentHandlers();
    this.registerExtensionHandlers();
    this.registerConfigHandlers();
    this.registerThemeHandlers();
    this.registerClipboardHandlers();
    this.registerFileHandlers();
    this.registerWindowHandlers();
  }

  // ─── Document Operations ───────────────────────────────────

  private registerDocumentHandlers() {
    ipcMain.handle('doc:open', async (_, filePath?: string) => {
      if (!filePath) {
        const result = await dialog.showOpenDialog({
          title: 'Open Document',
          filters: [
            { name: 'All Supported', extensions: ['cog', 'md', 'txt', 'html', 'rtf', 'json'] },
            { name: 'Cognition Document', extensions: ['cog'] },
            { name: 'Markdown', extensions: ['md', 'markdown'] },
            { name: 'Text', extensions: ['txt'] },
            { name: 'HTML', extensions: ['html', 'htm'] },
            { name: 'All Files', extensions: ['*'] },
          ],
          properties: ['openFile'],
        });
        if (result.canceled || result.filePaths.length === 0) return null;
        filePath = result.filePaths[0];
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const ext = path.extname(filePath).toLowerCase();
      let format = 'plaintext';
      let parsedContent = content;

      if (ext === '.cog') {
        try {
          const doc = JSON.parse(content);
          parsedContent = doc.content || content;
          format = 'cognition';
        } catch {
          format = 'plaintext';
        }
      } else if (ext === '.md' || ext === '.markdown') {
        format = 'markdown';
      } else if (ext === '.html' || ext === '.htm') {
        format = 'html';
      }

      return {
        title: path.basename(filePath, ext),
        content: parsedContent,
        format,
        filePath,
      };
    });

    ipcMain.handle('doc:save', async (_, docData: { content: string; filePath: string; format: string }) => {
      let content = docData.content;

      if (docData.format === 'cognition' && docData.filePath.endsWith('.cog')) {
        content = JSON.stringify({
          magic: COGNITION_DOC_FORMAT.magic,
          version: COGNITION_DOC_FORMAT.version,
          content: docData.content,
          createdAt: Date.now(),
          appVersion: '1.0.0',
        }, null, 2);
      }

      fs.writeFileSync(docData.filePath, content, 'utf-8');
      return { success: true, filePath: docData.filePath };
    });

    ipcMain.handle('doc:saveAs', async (_, docData: { content: string; format: string; title: string }) => {
      const filters: Electron.FileFilter[] = [
        { name: 'Cognition Document', extensions: ['cog'] },
        { name: 'Markdown', extensions: ['md'] },
        { name: 'Text', extensions: ['txt'] },
        { name: 'HTML', extensions: ['html'] },
        { name: 'All Files', extensions: ['*'] },
      ];

      const result = await dialog.showSaveDialog({
        title: 'Save Document',
        defaultPath: docData.title || 'Untitled',
        filters,
      });

      if (result.canceled || !result.filePath) return null;

      let content = docData.content;
      if (result.filePath.endsWith('.cog')) {
        content = JSON.stringify({
          magic: COGNITION_DOC_FORMAT.magic,
          version: COGNITION_DOC_FORMAT.version,
          content: docData.content,
          createdAt: Date.now(),
          appVersion: '1.0.0',
        }, null, 2);
      }

      fs.writeFileSync(result.filePath, content, 'utf-8');
      return { success: true, filePath: result.filePath };
    });

    ipcMain.handle('doc:export', async (_, data: { content: string; format: string; filePath: string }) => {
      fs.writeFileSync(data.filePath, data.content, 'utf-8');
      return { success: true };
    });

    ipcMain.handle('doc:import', async (_, filePath: string) => {
      const content = fs.readFileSync(filePath, 'utf-8');
      return { content, filePath };
    });
  }

  // ─── Extension Operations ──────────────────────────────────

  private registerExtensionHandlers() {
    ipcMain.handle('ext:list', async () => {
      return this.extensionHost.getExtensions();
    });

    ipcMain.handle('ext:install', async (_, extensionPath: string) => {
      return this.extensionHost.installExtension(extensionPath);
    });

    ipcMain.handle('ext:uninstall', async (_, extensionId: string) => {
      return this.extensionHost.uninstallExtension(extensionId);
    });

    ipcMain.handle('ext:enable', async (_, extensionId: string) => {
      return this.extensionHost.enableExtension(extensionId);
    });

    ipcMain.handle('ext:disable', async (_, extensionId: string) => {
      return this.extensionHost.disableExtension(extensionId);
    });

    ipcMain.handle('ext:reload', async (_, extensionId: string) => {
      return this.extensionHost.reloadExtension(extensionId);
    });

    ipcMain.handle('ext:executeCommand', async (_, commandId: string, ...args: unknown[]) => {
      return this.extensionHost.executeCommand(commandId, ...args);
    });

    ipcMain.handle('ext:getCommands', async () => {
      return this.extensionHost.getCommands();
    });
  }

  // ─── Configuration ─────────────────────────────────────────

  private registerConfigHandlers() {
    ipcMain.handle('config:get', async (_, key: string) => {
      return this.configStore.get(key);
    });

    ipcMain.handle('config:set', async (_, key: string, value: unknown) => {
      this.configStore.set(key, value);
      // Notify renderer of config change
      this.windowManager.send('config:changed', { key, value });
      return { success: true };
    });

    ipcMain.handle('config:getAll', async () => {
      return this.configStore.getAll();
    });
  }

  // ─── Theme ─────────────────────────────────────────────────

  private registerThemeHandlers() {
    ipcMain.handle('theme:get', async () => {
      return this.configStore.get('theme.current');
    });

    ipcMain.handle('theme:set', async (_, themeId: string) => {
      this.configStore.set('theme.current', themeId);
      this.windowManager.send('theme:changed', themeId);
      return { success: true };
    });

    ipcMain.handle('theme:list', async () => {
      return BUILTIN_THEMES;
    });
  }

  // ─── Clipboard ────────────────────────────────────────────

  private registerClipboardHandlers() {
    ipcMain.handle('clipboard:write', async (_, text: string) => {
      clipboard.writeText(text);
      return { success: true };
    });

    ipcMain.handle('clipboard:read', async () => {
      return clipboard.readText();
    });
  }

  // ─── File System ──────────────────────────────────────────

  private registerFileHandlers() {
    ipcMain.handle('fs:read', async (_, filePath: string) => {
      try {
        return fs.readFileSync(filePath, 'utf-8');
      } catch (err) {
        throw new Error(`Failed to read file: ${err}`);
      }
    });

    ipcMain.handle('fs:write', async (_, filePath: string, content: string) => {
      fs.writeFileSync(filePath, content, 'utf-8');
      return { success: true };
    });

    ipcMain.handle('fs:exists', async (_, filePath: string) => {
      return fs.existsSync(filePath);
    });

    ipcMain.handle('fs:mkdir', async (_, dirPath: string) => {
      fs.mkdirSync(dirPath, { recursive: true });
      return { success: true };
    });
  }

  // ─── Window ───────────────────────────────────────────────

  private registerWindowHandlers() {
    ipcMain.handle('win:minimize', async () => {
      this.windowManager.getMainWindow()?.minimize();
    });

    ipcMain.handle('win:maximize', async () => {
      const win = this.windowManager.getMainWindow();
      if (win) {
        if (win.isMaximized()) {
          win.unmaximize();
        } else {
          win.maximize();
        }
      }
    });

    ipcMain.handle('win:close', async () => {
      this.windowManager.getMainWindow()?.close();
    });

    ipcMain.handle('win:fullscreen', async () => {
      const win = this.windowManager.getMainWindow();
      if (win) {
        win.setFullScreen(!win.isFullScreen());
      }
    });
  }
}
