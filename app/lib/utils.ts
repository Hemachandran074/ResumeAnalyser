import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts bytes to a human-readable file size string
 * @param bytes - The size in bytes
 * @param decimals - Number of decimal places to show (default: 2)
 * @returns A formatted string like "1.5 MB", "500 KB", etc.
 */
export function formatSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export const generateUUID = () => crypto.randomUUID()