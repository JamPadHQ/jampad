import { Hono } from 'hono'
import { corsMiddleware } from './middleware/cors.js'
import { setupRoutes } from './routes/index.js'

export function createApp(): Hono {
	const app = new Hono()

	// Apply middleware
	app.use(corsMiddleware)

	// Setup routes
	setupRoutes(app)

	return app
} 