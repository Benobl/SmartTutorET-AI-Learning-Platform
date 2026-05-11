import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCallId(type: 'class' | 'squad', id: string) {
    if (!id) return `temp-${Date.now()}`
    // Ensure ID is stable and compatible with Stream's requirements (lowercase, no special chars)
    const cleanId = id.toString().toLowerCase().replace(/[^a-z0-9_-]/g, '')
    return `${type}-${cleanId}`
}
