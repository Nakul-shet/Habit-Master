"use client"

import { useEffect } from "react"
import { useAppData } from "@/lib/app-data-context"
import { formatDate } from "@/lib/utils"

export function HabitAutoFail() {
  const { habits, toggleHabitFailed } = useAppData()

  // Function to check and mark incomplete habits as failed
  const checkAndFailHabits = () => {
    const today = formatDate(new Date())

    habits.forEach((habit) => {
      const todayEntry = habit.history.find((h) => h.date === today)

      // If the habit has no entry for today or is not marked as completed, mark it as failed
      if (!todayEntry || (!todayEntry.completed && !todayEntry.failed)) {
        toggleHabitFailed(habit.id, today)
      }
    })
  }

  useEffect(() => {
    // Check if it's close to the end of the day (11:55 PM)
    const scheduleEndOfDayCheck = () => {
      const now = new Date()
      const endOfDay = new Date(now)
      endOfDay.setHours(23, 55, 0, 0)

      // If it's already past 11:55 PM, schedule for tomorrow
      if (now > endOfDay) {
        endOfDay.setDate(endOfDay.getDate() + 1)
      }

      const timeUntilEndOfDay = endOfDay.getTime() - now.getTime()

      // Schedule the check
      return setTimeout(checkAndFailHabits, timeUntilEndOfDay)
    }

    // Set up the initial schedule
    const timer = scheduleEndOfDayCheck()

    // Clean up the timer when component unmounts
    return () => clearTimeout(timer)
  }, [habits, toggleHabitFailed])

  return null // This component doesn't render anything
}
