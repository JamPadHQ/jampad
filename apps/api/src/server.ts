import { serve } from '@hono/node-server'
import { Server as HttpServer } from 'http'
import { createApp } from './app.js'
import { WebSocketHandler } from './services/yjs/index.js'
import { SERVER_CONFIG } from './config/server.js'
import { Logger } from './utils/logger.js'

export function createServer(): HttpServer {
	const app = createApp()
	const server = serve(app)

	// Setup YJS WebSocket server
	new WebSocketHandler(server as HttpServer)

	Logger.info(`Server is running on ${SERVER_CONFIG.URL}`)
	Logger.info('YJS WebSocket server is running on the same port as the main server')

	return server as HttpServer
} 