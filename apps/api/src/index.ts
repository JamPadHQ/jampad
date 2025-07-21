import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { Server as HttpServer } from 'http'
import { setupYJS } from './yjs-handler.js'
import { cors } from 'hono/cors'

const app = new Hono()
const server = serve(app)

app.use(cors())

// Setup YJS WebSocket server
setupYJS(server as HttpServer)

app.get('/', (c) => {
	return c.text('Hello Hono!')
})

// Add a health check endpoint for YJS
app.get('/health', (c) => {
	return c.json({
		status: 'ok',
		services: ['hono', 'yjs'],
		timestamp: new Date().toISOString()
	})
})

console.log('Server is running on http://localhost:3000')