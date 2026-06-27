# Cognition WP

**The VS Code of word processors.**

An open-source, extensible word processor built on Electron and TypeScript. Cognition WP brings the power and flexibility of VS Code's extension ecosystem to the world of document editing.

![Cognition WP](resources/logo.png)

## Download & Install

Download `Cognition WP Setup 1.0.0.exe` from the [releases page](https://github.com/Maq-Swarm/cognition-wp/releases), double-click to install. Creates desktop and Start Menu shortcuts automatically.

## Features

### Core Editor
- Rich text editing with full formatting toolbar
- Headings (H1-H6), bold, italic, underline, strikethrough
- Subscript, superscript, and text highlighting
- Bullet lists, numbered lists, and checklists
- Tables, code blocks, quote blocks, horizontal rules
- Links and images
- Text and background color selection
- Font size control
- Paragraph alignment (left, center, right, justify)
- Spell check, auto-save, find and replace

### Export Formats
- `.cog` — Cognition WP native format (v2.0.0: JSON with metadata, multi-format content, styles, history)
- `.md` — Markdown (headings, lists, tables, code blocks, links, images, checklists)
- `.txt` — Plain text
- `.html` — Standalone HTML with embedded CSS
- `.pdf` — PDF via Electron printToPDF (A4)
- `.docx` — Microsoft Word (Office Open XML, built from scratch)
- `.doc` — Word 97-2003 (RTF format)

### User Interface
- VS Code-inspired layout: activity bar, sidebar, editor area, status bar
- Command palette (Ctrl+Shift+P) with 50+ commands
- 4 themes: Dark, Light, Sepia, High Contrast
- Focus mode for distraction-free writing
- Document outline (auto-generated from headings)
- Context menu, notification system
- Custom title bar with window controls
- Status bar (word count, reading time, cursor position, theme, spellcheck)

### Extension System (VS Code-style)
- `package.json` manifest with `contributes`
- Extension API: commands, editor, documents, notifications, statusBar, config, fs, logger
- Activation events: onStartup, onCommand, onLanguage, onDocumentOpen, etc.
- Install/uninstall/enable/disable/reload from Extensions sidebar
- Sample extension included (Word Count Pro)

### Plugin Compatibility (External Tools)
- JSON-RPC 2.0 over stdio protocol
- External tools (Claude Code, Codex, etc.) can plug in
- Full editor access: get/set content, selection, insertion
- Language-agnostic (Node.js, Python, anything that speaks JSON-RPC)
- See [Plugin Protocol](docs/plugin-protocol.md)

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+N | New Document |
| Ctrl+O | Open File |
| Ctrl+S | Save |
| Ctrl+Shift+S | Save As |
| Ctrl+F | Find |
| Ctrl+H | Replace |
| Ctrl+B | Bold |
| Ctrl+I | Italic |
| Ctrl+U | Underline |
| Ctrl+K | Insert Link |
| Ctrl+1-6 | Headings |
| Ctrl+Shift+P | Command Palette |
| Ctrl+Shift+F | Focus Mode |
| Ctrl+Shift+O | Toggle Outline |
| Ctrl+, | Settings |
| F11 | Full Screen |

## Build from Source

```bash
npm install
npm run build
npm start          # Run in dev
npm run package:win  # Build installer (Windows)
```

## Creating an Extension

See [Extension API Guide](docs/extension-api.md).

1. Create a directory in `%APPDATA%/cognition-wp/extensions/my-extension/`
2. Add a `package.json` with manifest
3. Create `index.js` with `exports.activate = function(ctx) { ... }`
4. Restart Cognition WP

## Architecture

- **Main Process**: WindowManager, MenuBuilder, IPCRegistry, ExtensionHost, PluginHost, ExportManager, ConfigStore
- **Preload**: Secure contextBridge (contextIsolation, no nodeIntegration, sandboxed)
- **Renderer**: HTML/CSS/JS editor with full formatting toolbar
- **Zero runtime dependencies** — config stored as plain JSON, no external libs needed at runtime

## License

MIT — © Maq-Swarm
