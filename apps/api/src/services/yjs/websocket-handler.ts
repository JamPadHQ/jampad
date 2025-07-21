import { WebSocketServer } from 'ws'
import { setupWSConnection } from 'y-websocket/bin/utils'
import { DocumentManager } from './document-manager.js'
import { Logger } from '../../utils/logger.js'

export class WebSocketHandler {
	private wss: WebSocketServer

	constructor(server: any) {
		this.wss = new WebSocketServer({ server })
		this.setupConnectionHandlers()
	}

	private setupConnectionHandlers(): void {
		this.wss.on('connection', (conn, req) => {
			this.handleConnection(conn, req)
		})
	}

	private handleConnection(conn: any, req: any): void {
		const url = req.url
		if (!url) {
			conn.close()
			return
		}

		// Extract room name from URL (e.g., /yjs/room1 -> room1)
		const roomName = url.replace('/yjs/', '')

		if (!roomName) {
			conn.close()
			return
		}

		// Get or create YJS document for this room
		const existingDoc = DocumentManager.getDocument(roomName)
		const doc = DocumentManager.getOrCreateDocument(roomName)

		if (!existingDoc) {
			Logger.info(`Created new YJS document for room: ${roomName}`)
		}

		// Setup the WebSocket connection with y-websocket
		setupWSConnection(conn, req, { docId: roomName, doc })

		// Log connection
		Logger.info(`YJS connection established for room: ${roomName}`)
	}

	getWebSocketServer(): WebSocketServer {
		return this.wss
	}
} 