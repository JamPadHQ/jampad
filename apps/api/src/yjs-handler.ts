import { WebSocketServer } from 'ws'
import * as Y from 'yjs'
import { setupWSConnection } from 'y-websocket/bin/utils'

const docs = new Map<string, Y.Doc>()

// Pastel colors for user assignment
const pastelColors = [
	'#FFB6C1', '#87CEEB', '#98FB98', '#DDA0DD', '#F0E68C',
	'#E6E6FA', '#D3D3D3', '#FFDAB9', '#90EE90', '#FFA07A',
	'#20B2AA', '#87CEFA', '#DDA0DD', '#98FB98', '#F0E68C'
]

let colorIndex = 0

function getNextColor(): string {
	const color = pastelColors[colorIndex % pastelColors.length]
	colorIndex++
	return color
}

export function setupYJS(server: any) {
	const wss = new WebSocketServer({ server })

	wss.on('connection', (conn, req) => {
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
		let doc = docs.get(roomName)
		if (!doc) {
			doc = new Y.Doc()
			docs.set(roomName, doc)
			console.log(`Created new YJS document for room: ${roomName}`)
		}

		// Setup the WebSocket connection with y-websocket
		setupWSConnection(conn, req, { docId: roomName, doc })

		// Log connection
		console.log(`YJS connection established for room: ${roomName}`)
	})

	console.log('YJS WebSocket server is running on the same port as the main server')
	return wss
}

// Helper function to get a document
export function getDocument(roomName: string): Y.Doc | undefined {
	return docs.get(roomName)
}

// Helper function to create a new document
export function createDocument(roomName: string): Y.Doc {
	const doc = new Y.Doc()
	docs.set(roomName, doc)
	return doc
}

// Helper function to delete a document
export function deleteDocument(roomName: string): boolean {
	const doc = docs.get(roomName)
	if (doc) {
		doc.destroy()
		docs.delete(roomName)
		return true
	}
	return false
}

// Helper function to get next available color
export function getNextAvailableColor(): string {
	return getNextColor()
} 