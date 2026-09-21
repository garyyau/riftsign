import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Two-digit step or rank label: 1 -> "01". */
export function stepNumber(n: number): string {
  return String(n).padStart(2, '0')
}
