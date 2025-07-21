# Jampad API

A collaborative drawing application backend built with Hono, Socket.IO, and YJS.

## Features

- **Real-time collaboration** via Socket.IO
- **Conflict-free collaborative editing** via YJS
- **User management** with color-coded participants
- **WebSocket support** for both Socket.IO and YJS

## Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## API Endpoints

- `GET /` - Health check
- `GET /health` - Detailed health status including all services

## WebSocket Endpoints

### Socket.IO (for user management and drawing)
- **Connection**: `ws://localhost:3000`
- **Events**:
  - `user:join` - Join with nickname
  - `users:list` - Receive current users
  - `user:joined` - New user joined
  - `user:left` - User left

### YJS (for collaborative editing)
- **Connection**: `ws://localhost:3000/yjs/{roomName}`
- **Usage**: Connect to a specific room for collaborative editing
- **Example**: `ws://localhost:3000/yjs/drawing-room-1`

## YJS Integration

The backend supports YJS for conflict-free collaborative editing. Each room gets its own YJS document that automatically handles:

- Real-time synchronization
- Conflict resolution
- Document persistence (in-memory)
- Multi-user collaboration

### Connecting from Frontend

```javascript
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

// Create a YJS document
const doc = new Y.Doc()

// Connect to the backend
const provider = new WebsocketProvider(
  'ws://localhost:3000/yjs',
  'room-name',
  doc
)

// Use the document for collaborative editing
const sharedText = doc.getText('text')
const sharedMap = doc.getMap('data')
```

## Architecture

- **Hono**: HTTP server and routing
- **Socket.IO**: Real-time user management and drawing events
- **YJS**: Conflict-free collaborative editing
- **WebSocket**: Dual WebSocket support for both Socket.IO and YJS

## Development

The server runs on port 3000 by default. Make sure your frontend is configured to connect to the correct endpoints.

```
