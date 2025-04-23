import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function convertTimeToSeconds(timeString: string): number {
  // Extract the numeric part from the string
  const hours = parseInt(timeString.replace("H", ""), 10);

  // Validate if parsing was successful
  if (isNaN(hours)) {
    console.error(`Invalid time format: ${timeString}`);
    return 3600; // Default to 1 hour (3600 seconds) if format is invalid
  }

  // Convert hours to seconds (1 hour = 3600 seconds)
  return hours * 3600;
}
