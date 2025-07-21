export class Logger {
	static info(message: string): void {
		console.log(`[INFO] ${new Date().toISOString()}: ${message}`)
	}

	static error(message: string, error?: Error): void {
		console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error || '')
	}

	static warn(message: string): void {
		console.warn(`[WARN] ${new Date().toISOString()}: ${message}`)
	}
} 