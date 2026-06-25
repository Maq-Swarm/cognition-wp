# Cognition WP

**The VS Code of word processors.**

An open-source, extensible word processor built on Electron and TypeScript. Cognition WP brings the power and flexibility of VS Code's extension ecosystem to the world of document editing.

![Cognition WP](resources/logo.png)

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
- Spell check (native browser spellcheck)
- Find and replace with sidebar search
- Auto-save with configurable delay

### User Interface
- VS Code-inspired layout: activity bar, sidebar, editor area, status bar
- Custom title bar with window controls
- Tab bar for multiple documents
- Command palette (Ctrl+Shift+P) — fuzzy search all commands
- Focus mode for distraction-free writing
- Right panel with document outline (auto-generated from headings)
- Context menu (right-click in editor)
- Notification system (info, warning, error, success)

### Themes
- Cognition Dark (default) — a Catppuccin Mocha-inspired palette
- Cognition Light — clean and bright
- Cognition Sepia — warm, paper-like
- High Contrast Dark — maximum readability

### Document Formats
- `.cog` — Cognition WP native format (JSON with rich content)
- `.md` — Markdown import/export
- `.html` — HTML export
- `.txt` — Plain text export
- Print support

### Extension System (VS Code-style)
- `package.json` manifest with `contributes` — just like VS Code
- Commands, keybindings, menus, configuration, themes, views
- Extension API: `ctx.commands`, `ctx.editor`, `ctx.notifications`, `ctx.statusBar`, `ctx.documents`, `ctx.fs`, `ctx.config`, `ctx.logger`
- Activation events: `onStartup`, `onCommand`, `onLanguage`, `onDocumentOpen`, `onDocumentSave`, `onView`, `onTheme`, `*`
- Install from `.cogx` packages or directories
- Enable/disable/reload/uninstall from the Extensions sidebar
- Extension gallery (coming soon)

### Plugin Compatibility (External Tools)
- JSON-RPC 2.0 over stdio protocol
- External tools (like Claude Code, Codex, etc.) can plug in
- Full editor access: get/set content, selection, insertion
- Send notifications, create status bar items, register commands
- See [Plugin Protocol](docs/plugin-protocol.md) for details

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+N | New Document |
| Ctrl+O | Open File |
| Ctrl+S | Save |
| Ctrl+Shift+S | Save As |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
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
| Ctrl+B (outside editor) | Toggle Sidebar |
| Ctrl+, | Settings |
| F11 | Full Screen |
| Ctrl+/ | Show Shortcuts |

## Getting Started

### Prerequisites
- Node.js 18+ (tested on v24)
- npm 9+

### Install Dependencies
```bash
npm install
```

### Run in Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Run
```bash
npm start
```

### Package for Distribution
```bash
# Windows
npm run package:win

# macOS
npm run package:mac

# Linux
npm run package:linux
```

## Creating an Extension

See [Extension API Guide](docs/extension-api.md) for full documentation.

### Quick Start

1. Create a directory in your extensions folder (`~/.cognition-wp/extensions/` on Windows: `%APPDATA%/cognition-wp/extensions/`)
2. Add a `package.json`:

```json
{
  "name": "my-extension",
  "displayName": "My Extension",
  "description": "Does something cool",
  "version": "1.0.0",
  "publisher": "your-name",
  "engines": { "cognitionWp": "^1.0.0" },
  "main": "index.js",
  "activationEvents": ["onStartup"],
  "contributes": {
    "commands": [
      {
        "command": "myext.hello",
        "title": "Say Hello",
        "category": "My Extension",
        "icon": "",
        "enablement": "true"
      }
    ]
  }
}
```

3. Create `index.js`:

```javascript
exports.activate = function(ctx) {
  ctx.commands.registerCommand('myext.hello', () => {
    ctx.notifications.info('Hello from my extension!');
  });
};
```

4. Restart Cognition WP — your extension will be discovered and activated on startup.

## Creating a Plugin (External Tool)

Plugins are external processes that communicate with Cognition WP via JSON-RPC 2.0 over stdio. See [Plugin Protocol](docs/plugin-protocol.md).

1. Create a directory in `%APPDATA%/cognition-wp/plugins/my-plugin/`
2. Add a `plugin.json`:

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "command": "node",
  "args": ["main.js"],
  "capabilities": ["editor", "notifications"]
}
```

3. Write your plugin process (any language that can do JSON-RPC over stdio).

## Architecture

```
┌──────────────────────────────────────────────┐
│                  Main Process                 │
│  ┌─────────────┐  ┌──────────────────────┐  │
│  │ Window Mgr  │  │    Extension Host     │  │
│  ├─────────────┤  ├──────────────────────┤  │
│  │ Menu Builder│  │    Plugin Host        │  │
│  ├─────────────┤  │  (JSON-RPC stdio)    │  │
│  │ IPC Registry│  └──────────────────────┘  │
│  └─────────────┘         │                    │
│         │                │                    │
│  ┌──────┴────────────────┴──────────────┐    │
│  │         Config Store                  │    │
│  └───────────────────────────────────────┘    │
└──────────────────┬───────────────────────────┘
                   │  contextBridge (secure)
┌──────────────────┴───────────────────────────┐
│               Renderer Process                │
│  ┌─────────┐ ┌────────┐ ┌──────────────────┐ │
│  │Activity │ │Sidebar │ │  Editor (CE)      │ │
│  │  Bar    │ ├────────┤ │  ┌─────────────┐  │ │
│  ├─────────┤ │Search  │ │  │ ContentEdit │  │ │
│  │Settings │ │Outline │ │  │  div        │  │ │
│  └─────────┘ │Ext Mgr  │ │  └─────────────┘  │ │
│              └────────┘ └──────────────────┘ │
│  ┌─────────────────────────────────────────┐ │
│  │  Status Bar / Command Palette / Notifs  │ │
│  └─────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

## License

MIT — © Maq-Swarm

## Contributing

Issues and pull requests are welcome at https://github.com/Maq-Swarm/cognition-wp
