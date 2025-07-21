export const SERVER_CONFIG = {
	PORT: process.env.PORT || 3000,
	HOST: process.env.HOST || 'localhost',
	URL: `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}`
} as const 