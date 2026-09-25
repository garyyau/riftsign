import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// The custom text sizes from index.css, so tailwind-merge doesn't mistake them for colours.
const twMerge = extendTailwindMerge({
  extend: { theme: { text: ['body-l', 'body', 'answer', 'small', 'button', 'button-md', 'button-sm'] } },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Two-digit step or rank label: 1 -> "01". */
export function stepNumber(n: number): string {
  return String(n).padStart(2, '0')
}
