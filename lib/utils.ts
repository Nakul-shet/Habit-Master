import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date to YYYY-MM-DD
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

// Get dates in range
export function getDatesInRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}

// Calculate streak for a habit
export function calculateStreak(history: { date: string; completed: boolean }[]): number {
  if (!history.length) return 0

  // Sort history by date (newest first)
  const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Get today's date in YYYY-MM-DD format
  const today = formatDate(new Date())

  // Check if the most recent entry is today and it's completed
  const mostRecent = sortedHistory[0]
  if (mostRecent.date !== today || !mostRecent.completed) {
    return 0
  }

  // Count consecutive completed days
  let streak = 1
  const currentDate = new Date(today)

  for (let i = 1; i < sortedHistory.length; i++) {
    // Move to previous day
    currentDate.setDate(currentDate.getDate() - 1)
    const prevDateStr = formatDate(currentDate)

    // Find entry for this date
    const entry = sortedHistory.find((h) => h.date === prevDateStr)

    // If no entry or not completed, break the streak
    if (!entry || !entry.completed) {
      break
    }

    streak++
  }

  return streak
}

// Calculate completion rate for tasks
export function getCompletionRate(tasks: { completed: boolean }[]): number {
  if (!tasks.length) return 0

  const completedCount = tasks.filter((task) => task.completed).length
  return (completedCount / tasks.length) * 100
}

// Calculate level based on points
export function calculateLevel(points: number, thresholds: number[]): { level: number; nextLevelPercentage: number } {
  // Find the current level
  let level = 1
  let nextLevelThreshold = thresholds[0]
  let prevLevelThreshold = 0

  for (let i = 0; i < thresholds.length; i++) {
    if (points >= thresholds[i]) {
      level = i + 2 // Level 1 is 0 points, Level 2 is first threshold, etc.
      prevLevelThreshold = thresholds[i]
      nextLevelThreshold = thresholds[i + 1] || thresholds[i] * 2 // If no next threshold, double the current one
    } else {
      nextLevelThreshold = thresholds[i]
      break
    }
  }

  // Calculate percentage to next level
  const pointsInCurrentLevel = points - prevLevelThreshold
  const pointsNeededForNextLevel = nextLevelThreshold - prevLevelThreshold
  const nextLevelPercentage = Math.min(100, Math.round((pointsInCurrentLevel / pointsNeededForNextLevel) * 100))

  return { level, nextLevelPercentage }
}
