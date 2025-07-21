declare module 'y-websocket/bin/utils' {
	import { IncomingMessage } from 'http'
	import { WebSocket } from 'ws'
	import * as Y from 'yjs'

	export interface WSConnectionOptions {
		docId?: string
		doc?: Y.Doc
		[key: string]: any
	}

	export function setupWSConnection(
		conn: WebSocket,
		req: IncomingMessage,
		options?: WSConnectionOptions
	): void
} 