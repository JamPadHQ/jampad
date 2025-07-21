import { Hono } from 'hono'
import { homeRoutes } from './home.js'

export function setupRoutes(app: Hono) {
	app.route('/', homeRoutes)
} 