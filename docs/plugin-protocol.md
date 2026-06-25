# Plugin Protocol

Cognition WP supports external tool plugins via a JSON-RPC 2.0 protocol over stdio. This allows tools like Claude Code, Codex, or any external process to plug into the editor — similar to how Language Servers plug into VS Code.

## How It Works

1. The plugin is a standalone process (any language)
2. Cognition WP spawns the process and communicates via stdin/stdout
3. Messages are JSON-RPC 2.0, newline-delimited
4. The plugin can call Cognition WP APIs (editor, notifications, etc.)
5. Cognition WP can call the plugin with events and requests

## Plugin Descriptor (plugin.json)

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "command": "node",
  "args": ["main.js"],
  "env": {},
  "capabilities": ["editor", "notifications", "statusBar", "commands"]
}
```

## Protocol

### Initialize (Cognition WP → Plugin)
```json
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{
  "processId": 12345,
  "appVersion": "1.0.0",
  "rootUri": "file:///path/to/userdata",
  "capabilities": {
    "editor": true,
    "documents": true,
    "commands": true,
    "statusBar": true,
    "notifications": true,
    "configuration": true
  }
}}
```

### Plugin → Cognition WP Requests

#### editor.getContent
```json
{"jsonrpc":"2.0","id":2,"method":"editor.getContent","params":{}}
```
Response: `{"jsonrpc":"2.0","id":2,"result":"<p>document HTML</p>"}`

#### editor.setContent
```json
{"jsonrpc":"2.0","id":3,"method":"editor.setContent","params":{"content":"<p>new content</p>"}}
```

#### editor.getSelection
```json
{"jsonrpc":"2.0","id":4,"method":"editor.getSelection","params":{}}
```
Response: `{"jsonrpc":"2.0","id":4,"result":{"text":"selected","start":0,"end":8}}`

#### editor.insertText
```json
{"jsonrpc":"2.0","id":5,"method":"editor.insertText","params":{"text":"hello","position":10}}
```

#### editor.replaceSelection
```json
{"jsonrpc":"2.0","id":6,"method":"editor.replaceSelection","params":{"text":"replacement"}}
```

#### notifications.info / .warning / .error
```json
{"jsonrpc":"2.0","id":7,"method":"notifications.info","params":{"message":"Hello user!"}}
```

#### statusBar.create
```json
{"jsonrpc":"2.0","id":8,"method":"statusBar.create","params":{"text":"Ready","alignment":"right","priority":100}}
```

#### statusBar.update
```json
{"jsonrpc":"2.0","id":9,"method":"statusBar.update","params":{"id":"plugin-123","text":"Updated"}}
```

#### commands.register
```json
{"jsonrpc":"2.0","id":10,"method":"commands.register","params":{"id":"myplugin.action","title":"Do Action"}}
```

#### commands.execute
```json
{"jsonrpc":"2.0","id":11,"method":"commands.execute","params":{"id":"some.command","args":[]}}
```

### Cognition WP → Plugin Notifications

#### shutdown
```json
{"jsonrpc":"2.0","method":"shutdown","params":{}}
```

## Example Plugin (Node.js)

```javascript
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

let initialized = false;

rl.on('line', (line) => {
  const msg = JSON.parse(line);
  
  if (msg.id && msg.method === 'initialize') {
    initialized = true;
    send({ jsonrpc: '2.0', id: msg.id, result: { capabilities: {} } });
    
    // Create a status bar item
    send({ jsonrpc: '2.0', id: nextId(), method: 'statusBar.create', params: {
      text: 'Plugin Ready', alignment: 'right', priority: 100
    }});
  }
  
  if (msg.method === 'shutdown') {
    process.exit(0);
  }
});

function send(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
}

let reqId = 100;
function nextId() { return reqId++; }
```

## Example Plugin (Python)

```python
import sys, json

def send(obj):
    sys.stdout.write(json.dumps(obj) + '\n')
    sys.stdout.flush()

for line in sys.stdin:
    msg = json.loads(line)
    
    if msg.get('method') == 'initialize':
        send({'jsonrpc': '2.0', 'id': msg['id'], 'result': {'capabilities': {}}})
    
    elif msg.get('method') == 'shutdown':
        sys.exit(0)
```

## Installation

1. Create a directory in `%APPDATA%/cognition-wp/plugins/my-plugin/`
2. Add `plugin.json`
3. Add your executable script
4. Start Cognition WP — the plugin appears in Extensions sidebar
5. Click "Enable" to start the plugin process

## Security

- Plugins run as child processes with the same permissions as Cognition WP
- File system access is limited to the plugin's directory
- Editor access is mediated through the JSON-RPC protocol
- The `COGNITION_WP_PLUGIN=1` environment variable is set for plugin processes
