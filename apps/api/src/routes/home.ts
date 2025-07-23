import { Hono } from 'hono'
import { ColorService } from '../services/yjs/color-service.js'

const homeRoutes = new Hono()

homeRoutes.get('/', (c) => {
	return c.text('Hello Hono!')
})

homeRoutes.get('/color/:roomName/:nickname', (c) => {
	const { roomName, nickname } = c.req.param()
	const color = ColorService.getUserColor(roomName, nickname)
	return c.json({ color })
})

export { homeRoutes } 