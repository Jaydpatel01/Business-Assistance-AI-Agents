import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Core className utility (existing)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Common validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function isEmptyObject(obj: unknown): boolean {
  return obj !== null && typeof obj === 'object' && Object.keys(obj).length === 0
}

// String utilities
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function truncate(str: string, length: number, suffix = '...'): string {
  if (str.length <= length) return str
  return str.slice(0, length - suffix.length) + suffix
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Number utilities
export function formatNumber(num: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// Array utilities
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}

export function groupBy<T, K extends string | number | symbol>(
  array: T[],
  key: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = key(item)
    groups[groupKey] = groups[groupKey] || []
    groups[groupKey].push(item)
    return groups
  }, {} as Record<K, T[]>)
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

// Object utilities
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  keys.forEach(key => delete result[key])
  return result
}

export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T
  if (typeof obj === 'object') {
    const clonedObj = {} as T
    Object.keys(obj).forEach(key => {
      (clonedObj as Record<string, unknown>)[key] = deepClone((obj as Record<string, unknown>)[key])
    })
    return clonedObj
  }
  return obj
}

// Async utilities
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), ms)
    ),
  ])
}

// Debounce utility with proper typing
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle utility
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Performance utilities
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }
    
    const result = fn(...args) as ReturnType<T>
    cache.set(key, result)
    return result
  }) as T
}

// Error handling utilities
export function safeExecute<T>(
  fn: () => T,
  fallback: T
): T {
  try {
    return fn()
  } catch {
    return fallback
  }
}

export async function safeExecuteAsync<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fn()
  } catch {
    return fallback
  }
}

// Type guards
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null
}

// Local storage utilities with error handling
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  
  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setToStorage<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeFromStorage(key: string): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    window.localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

// React-specific utilities
export function useStableCallback<T extends (...args: unknown[]) => unknown>(
  callback: T
): T {
  // This would need to be in a separate React utilities file
  // but included here for completeness
  return callback
}

// Development utilities
export function log(...args: unknown[]): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[DEV]', ...args)
  }
}

export function warn(...args: unknown[]): void {
  if (process.env.NODE_ENV === 'development') {
    console.warn('[DEV]', ...args)
  }
}

export function error(...args: unknown[]): void {
  console.error('[ERROR]', ...args)
}

// Export all utilities as a namespace for organized imports
export const Utils = {
  // Validation
  isValidEmail,
  isValidUrl,
  isEmptyObject,
  
  // String
  capitalize,
  truncate,
  slugify,
  
  // Number
  formatNumber,
  formatCurrency,
  clamp,
  
  // Array
  unique,
  groupBy,
  chunk,
  
  // Object
  omit,
  pick,
  deepClone,
  
  // Async
  sleep,
  timeout,
  debounce,
  throttle,
  
  // Performance
  memoize,
  
  // Error handling
  safeExecute,
  safeExecuteAsync,
  
  // Type guards
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isDefined,
  
  // Storage
  getFromStorage,
  setToStorage,
  removeFromStorage,
  
  // Development
  log,
  warn,
  error,
} as const
