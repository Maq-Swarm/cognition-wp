# Extension API Guide

Cognition WP's extension system is modeled after VS Code's. If you've written a VS Code extension, you'll feel right at home.

## Extension Structure

```
my-extension/
├── package.json      # Extension manifest (required)
├── index.js          # Main entry point (required)
├── icon.png          # Extension icon (optional)
└── lib/              # Additional source files (optional)
```

## Manifest (package.json)

```json
{
  "name": "my-extension",
  "displayName": "My Extension",
  "description": "A cool extension for Cognition WP",
  "version": "1.0.0",
  "publisher": "your-name",
  "engines": { "cognitionWp": "^1.0.0" },
  "categories": ["Productivity"],
  "keywords": ["writing", "tools"],
  "main": "index.js",
  "icon": "icon.png",
  "activationEvents": ["onStartup"],
  "contributes": {
    "commands": [...],
    "keybindings": [...],
    "configuration": {...},
    "themes": [...]
  },
  "dependencies": {},
  "devDependencies": {}
}
```

## Activation Events

| Event | Description |
|-------|-------------|
| `onStartup` | Activate when Cognition WP starts |
| `onCommand` | Activate when a specific command is run |
| `onDocumentOpen` | Activate when a document is opened |
| `onDocumentSave` | Activate when a document is saved |
| `onLanguage` | Activate for a specific language |
| `onView` | Activate when a view is opened |
| `onTheme` | Activate when a theme is applied |
| `*` | Always active |

## Extension Context (ctx)

The `activate` function receives a context object with the following APIs:

### commands
```javascript
ctx.commands.registerCommand('myext.doSomething', (arg1, arg2) => {
  // Do something
  return result;
});

await ctx.commands.executeCommand('otherext.command', ...args);
const allCommands = ctx.commands.getCommands();
```

### editor
```javascript
const content = await ctx.editor.getContent();
ctx.editor.setContent('<p>New content</p>');
const selection = await ctx.editor.getSelection();
// { text: 'selected text', start: 0, end: 12 }
ctx.editor.insertText('inserted text');
ctx.editor.insertText('at position', 42);
ctx.editor.replaceSelection('replacement');
ctx.editor.scrollTo(100);
```

### documents
```javascript
ctx.documents.onDidOpen((doc) => {
  console.log('Document opened:', doc);
});

ctx.documents.onDidSave((doc) => {
  console.log('Document saved:', doc);
});

ctx.documents.onDidChange((changes) => {
  console.log('Document changed:', changes);
});
```

### notifications
```javascript
ctx.notifications.info('Information message');
ctx.notifications.warning('Warning message');
ctx.notifications.error('Error message');
```

### statusBar
```javascript
const item = ctx.statusBar.createItem('right', 100);
item.setText('Ready');
item.setTooltip('Click for options');
item.show();
item.hide();
item.dispose();
```

### config
```javascript
const fontSize = ctx.config.get('editor.fontSize');
const allConfig = ctx.config.getAll();
```

### fs (sandboxed to extension directory)
```javascript
const data = ctx.fs.readFileSync('data.json');
ctx.fs.writeFileSync('output.txt', 'Hello');
const exists = ctx.fs.existsSync('config.json');
const files = ctx.fs.readDirSync('lib/');
```

### logger
```javascript
ctx.logger.info('Info message');
ctx.logger.warn('Warning');
ctx.logger.error('Error');
```

## Contributes

### Commands
```json
{
  "contributes": {
    "commands": [
      {
        "command": "myext.format",
        "title": "Format Document",
        "category": "My Extension",
        "icon": "",
        "enablement": "true"
      }
    ]
  }
}
```

### Keybindings
```json
{
  "contributes": {
    "keybindings": [
      {
        "command": "myext.format",
        "key": "ctrl+shift+f",
        "mac": "cmd+shift+f",
        "when": "editorFocus"
      }
    ]
  }
}
```

### Configuration
```json
{
  "contributes": {
    "configuration": {
      "title": "My Extension",
      "properties": {
        "myext.option1": {
          "type": "string",
          "default": "hello",
          "description": "A string option",
          "enum": null
        }
      }
    }
  }
}
```

### Themes
```json
{
  "contributes": {
    "themes": [
      {
        "id": "my-theme",
        "label": "My Theme",
        "type": "dark",
        "path": "theme.json"
      }
    ]
  }
}
```

## Full Example

```javascript
// index.js
exports.activate = function(ctx) {
  const logger = ctx.logger;
  logger.info('Extension activating...');

  // Register a command
  ctx.commands.registerCommand('myext.uppercase', async () => {
    const content = await ctx.editor.getContent();
    const selection = await ctx.editor.getSelection();
    if (selection.text) {
      ctx.editor.replaceSelection(selection.text.toUpperCase());
      ctx.notifications.info('Converted to uppercase');
    }
  });

  // Status bar item
  const status = ctx.statusBar.createItem('left', 50);
  status.setText('MyExt: Active');
  status.show();

  // Document change listener
  ctx.documents.onDidChange(() => {
    logger.info('Document changed');
  });

  logger.info('Extension activated');
};

exports.deactivate = function() {
  console.log('[myext] Deactivated');
};
```

## Installation

### Manual
1. Copy your extension directory to `%APPDATA%/cognition-wp/extensions/` (Windows) or `~/.cognition-wp/extensions/` (macOS/Linux)
2. Restart Cognition WP

### Via Menu
1. Go to Extensions → Install from VSIX...
2. Select your extension directory or `.cogx` package
3. The extension will be discovered and activated automatically
