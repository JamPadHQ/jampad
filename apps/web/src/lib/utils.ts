import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

// Performance optimization utilities
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout | null = null;

	return (...args: Parameters<T>) => {
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

export function throttle<T extends (...args: any[]) => any>(
	func: T,
	limit: number
): (...args: Parameters<T>) => void {
	let inThrottle: boolean;

	return (...args: Parameters<T>) => {
		if (!inThrottle) {
			func(...args);
			inThrottle = true;
			setTimeout(() => inThrottle = false, limit);
		}
	};
}

// Memoization helper for expensive computations
export function memoize<T extends (...args: any[]) => any>(
	fn: T,
	getKey?: (...args: Parameters<T>) => string
): T {
	const cache = new Map<string, ReturnType<T>>();

	return ((...args: Parameters<T>) => {
		const key = getKey ? getKey(...args) : JSON.stringify(args);

		if (cache.has(key)) {
			return cache.get(key);
		}

		const result = fn(...args);
		cache.set(key, result);
		return result;
	}) as T;
}

// Performance monitoring utility
export function measurePerformance<T extends (...args: any[]) => any>(
	name: string,
	fn: T
): T {
	return ((...args: Parameters<T>) => {
		const start = performance.now();
		const result = fn(...args);
		const end = performance.now();
		return result;
	}) as T;
}
