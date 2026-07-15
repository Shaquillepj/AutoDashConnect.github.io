import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formats a duration in minutes as "45 min", "1 hr", or "1 hr 30 min".
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${remainingMinutes} min`;
  if (remainingMinutes === 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
  return `${hours} hr${hours > 1 ? 's' : ''} ${remainingMinutes} min`;
}
