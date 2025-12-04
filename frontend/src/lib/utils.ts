import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeParseJson(jsonString: string): unknown {
  try {
    return JSON.parse(jsonString) as unknown;
  } catch {
    throw new Error('Invalid JSON format');
  }
}

/**
 * Format a date string to a human-readable format
 * @param dateString - ISO date string
 * @param options - Intl.DateTimeFormatOptions (optional)
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, options);
}

/**
 * Format a date string to include time
 * @param dateString - ISO date string
 * @returns Formatted date and time string
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
