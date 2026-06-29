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
import { ExportManager } from './export-manager';
import { BUILTIN_THEMES } from '../shared/constants';
// Lazy-loaded imports for file format support
type MammothType = { convertToHtml: (input: { path: string }) => Promise<{ value: string }> };
type MarkedType = { marked: (input: string) => string } | ((input: string) => string);

export class IPCMainRegistry {
  private exportManager: ExportManager;

  constructor(
    private windowManager: WindowManager,
    private extensionHost: ExtensionHost,
    private configStore: ConfigStore,
  ) {
    this.exportManager = new ExportManager();
  }

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
            { name: 'All Supported', extensions: ['cog', 'md', 'txt', 'html', 'rtf', 'json', 'pdf', 'doc', 'docx'] },
            { name: 'Cognition Document', extensions: ['cog'] },
            { name: 'Word Documents', extensions: ['doc', 'docx'] },
            { name: 'Markdown', extensions: ['md', 'markdown'] },
            { name: 'PDF', extensions: ['pdf'] },
            { name: 'Text', extensions: ['txt'] },
            { name: 'HTML', extensions: ['html', 'htm'] },
            { name: 'All Files', extensions: ['*'] },
          ],
          properties: ['openFile'],
        });
        if (result.canceled || result.filePaths.length === 0) return null;
        filePath = result.filePaths[0];
      }

      const ext = path.extname(filePath).toLowerCase();
      let format = 'plaintext';
      let parsedContent = '';

      if (ext === '.cog') {
        const content = fs.readFileSync(filePath, 'utf-8');
        try {
          const parsed = this.exportManager.parseCogFile(content);
          if (!parsed) {
            format = 'plaintext';
            parsedContent = content;
          } else {
            parsedContent = parsed.html;
            format = 'cognition';
          }
        } catch (e) {
          throw new Error(`Failed to open .cog file: ${e instanceof Error ? e.message : String(e)}`);
        }
      } else if (ext === '.md' || ext === '.markdown') {
        const content = fs.readFileSync(filePath, 'utf-8');
        try {
          const markedModule = require('marked');
          const markedFn = (markedModule as any).marked || markedModule;
          parsedContent = markedFn.parse(content);
        } catch {
          // Fallback: basic markdown to HTML
          parsedContent = content
            .replace(/^### (.*)$/gm, '<h3>$1</h3>')
            .replace(/^## (.*)$/gm, '<h2>$1</h2>')
            .replace(/^# (.*)$/gm, '<h1>$1</h1>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code>$1</code>')
            .split('\n\n')
            .map(block => block.startsWith('<h') ? block : `<p>${block}</p>`)
            .join('\n');
        }
        format = 'markdown';
      } else if (ext === '.html' || ext === '.htm') {
        parsedContent = fs.readFileSync(filePath, 'utf-8');
        format = 'html';
      } else if (ext === '.txt' || ext === '.json' || ext === '.rtf') {
        const content = fs.readFileSync(filePath, 'utf-8');
        parsedContent = content.split('\n').map(line => `<p>${line || '&nbsp;'}</p>`).join('\n');
        format = 'plaintext';
      } else if (ext === '.doc' || ext === '.docx') {
        try {
          const mammoth = require('mammoth') as MammothType;
          const result = await mammoth.convertToHtml({ path: filePath });
          parsedContent = result.value || '<p>(Empty document)</p>';
          format = 'word';
        } catch (e) {
          // Fallback for .doc (old binary format) — mammoth only supports .docx
          if (ext === '.doc') {
            const content = fs.readFileSync(filePath, 'utf-8');
            // Crude extraction: strip non-printable chars from old .doc binary
            const text = content.replace(/[^\x20-\x7E\r\n]/g, '').replace(/\r\n\r\n+/g, '\n\n').trim();
            parsedContent = text.split('\n\n').map(block => `<p>${block}</p>`).join('\n');
            format = 'word';
          } else {
            throw new Error(`Failed to open Word document: ${e instanceof Error ? e.message : String(e)}`);
          }
        }
      } else if (ext === '.pdf') {
        // PDF: open with system viewer (Electron can't render PDFs natively in contenteditable)
        // We extract text using a basic approach
        try {
          const pdfBuffer = fs.readFileSync(filePath);
          // Basic PDF text extraction: find text in parentheses between BT...ET blocks
          const pdfText = pdfBuffer.toString('latin1');
          const textMatches: string[] = [];
          const regex = /\(([^)]+)\)/g;
          let match;
          while ((match = regex.exec(pdfText)) !== null) {
            const text = match[1].replace(/\\[nr()]/g, ' ').trim();
            if (text.length > 0 && textMatches.length < 10000) textMatches.push(text);
          }
          if (textMatches.length > 0) {
            parsedContent = textMatches.map(t => `<p>${t}</p>`).join('\n');
          } else {
            parsedContent = '<p>(PDF text could not be extracted. The PDF has been opened in your system viewer.)</p>';
            shell.openPath(filePath);
          }
          format = 'pdf';
        } catch (e) {
          // Last resort: open in system viewer
          shell.openPath(filePath);
          parsedContent = '<p>(PDF opened in system viewer)</p>';
          format = 'pdf';
        }
      } else {
        const content = fs.readFileSync(filePath, 'utf-8');
        parsedContent = content.split('\n').map(line => `<p>${line || '&nbsp;'}</p>`).join('\n');
        format = 'plaintext';
      }

      return {
        title: path.basename(filePath, ext),
        content: parsedContent,
        format,
        filePath,
      };
    });

    ipcMain.handle('doc:save', async (_, docData: { content: string; filePath: string; format: string; title: string }) => {
      let content = docData.content;

      if (docData.filePath.endsWith('.cog')) {
        content = this.exportManager.buildCogJson(docData.content, docData.title || 'Untitled', docData.filePath);
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
        // New file — no existing path to read metadata from
        content = this.exportManager.buildCogJson(docData.content, docData.title || 'Untitled', result.filePath);
      }

      fs.writeFileSync(result.filePath, content, 'utf-8');
      return { success: true, filePath: result.filePath };
    });

    ipcMain.handle('doc:export', async (_, data: { format: string; content: string; title: string }) => {
      return this.exportManager.exportDocument({
        format: data.format as any,
        content: data.content,
        title: data.title,
      });
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

    ipcMain.handle('fs:browseImage', async () => {
      const result = await dialog.showOpenDialog({
        title: 'Select Image',
        filters: [
          { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg'] },
          { name: 'All Files', extensions: ['*'] },
        ],
        properties: ['openFile'],
      });
      if (result.canceled || result.filePaths.length === 0) return null;
      return result.filePaths[0];
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
