import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { Server } from 'socket.io'
import { Server as HttpServer } from 'http'

const app = new Hono()
const server = serve(app)

const io = new Server(server as HttpServer, {
	cors: {
		origin: "http://localhost:4200",
		methods: ["GET", "POST"]
	}
})

// Store connected users and their colors
const connectedUsers = new Map<string, { nickname: string; color: string }>()
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

io.on('connection', (socket) => {
	console.log('User connected:', socket.id)

	// Handle user join
	socket.on('user:join', (nickname: string) => {
		const color = getNextColor()
		const user = { nickname, color }

		connectedUsers.set(socket.id, user)

		// Send current user list to the new user
		socket.emit('users:list', Array.from(connectedUsers.values()))

		// Notify all other users about the new user
		socket.broadcast.emit('user:joined', user)

		console.log(`User ${nickname} joined with color ${color}`)
	})

	// Handle user leave
	socket.on('disconnect', () => {
		const user = connectedUsers.get(socket.id)
		if (user) {
			connectedUsers.delete(socket.id)
			socket.broadcast.emit('user:left', user.nickname)
			console.log(`User ${user.nickname} left`)
		}
	})
})

app.get('/', (c) => {
	return c.text('Hello Hono!')
})

console.log('Server is running on http://localhost:3000')
