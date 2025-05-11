"use client"

import { useState } from "react"
import { subDays, eachDayOfInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import { Flame, Trophy, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

export function HabitStats({ habit }) {
  const [timeRange, setTimeRange] = useState("week")

  // Calculate date range based on selected time range
  const today = new Date()
  let startDate, endDate

  if (timeRange === "week") {
    startDate = startOfWeek(today, { weekStartsOn: 0 })
    endDate = endOfWeek(today, { weekStartsOn: 0 })
  } else if (timeRange === "month") {
    startDate = startOfMonth(today)
    endDate = endOfMonth(today)
  } else {
    // 3 months
    startDate = subDays(today, 90)
    endDate = today
  }

  // Get all dates in the range
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate })

  // Calculate completion rate
  const totalDays = habit.history.length
  const completedDays = habit.history.filter((h) => h.completed).length
  const failedDays = habit.history.filter((h) => h.failed).length
  const notTrackedDays = totalDays - completedDays - failedDays

  const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0

  // Calculate current streak
  const calculateCurrentStreak = (history) => {
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

  const currentStreak = calculateCurrentStreak(habit.history)

  // Calculate longest streak
  const calculateLongestStreak = (history) => {
    if (!history.length) return 0

    // Sort history by date (oldest first)
    const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    let longestStreak = 0
    let currentStreak = 0

    for (let i = 0; i < sortedHistory.length; i++) {
      if (sortedHistory[i].completed) {
        currentStreak++

        if (currentStreak > longestStreak) {
          longestStreak = currentStreak
        }
      } else {
        currentStreak = 0
      }
    }

    return longestStreak
  }

  const longestStreak = calculateLongestStreak(habit.history)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{habit.name}</h2>
        <Tabs value={timeRange} onValueChange={setTimeRange}>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="quarter">3 Months</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Success Rate
            </CardTitle>
            <CardDescription>Overall habit performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.round(completionRate)}%</div>
            <Progress value={completionRate} className="h-2 mt-2" />
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div>
                <div className="text-sm font-medium text-green-600">{completedDays}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-sm font-medium text-red-600">{failedDays}</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
              <div>
                <div className="text-sm font-medium">{notTrackedDays}</div>
                <div className="text-xs text-muted-foreground">Not Tracked</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Current Streak
            </CardTitle>
            <CardDescription>Consecutive days completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{currentStreak} days</div>
            {currentStreak > 0 && (
              <div className="text-sm text-amber-600 dark:text-amber-400 mt-2">Keep it going! 🔥</div>
            )}
            {currentStreak === 0 && (
              <div className="text-sm text-muted-foreground mt-2">Complete today to start a streak!</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Longest Streak
            </CardTitle>
            <CardDescription>Best performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{longestStreak} days</div>
            {currentStreak > 0 && currentStreak === longestStreak && (
              <div className="text-sm text-amber-600 dark:text-amber-400 mt-2">You're at your best! 🏆</div>
            )}
            {currentStreak > 0 && currentStreak < longestStreak && (
              <div className="text-sm text-muted-foreground mt-2">
                {longestStreak - currentStreak} days to beat your record
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
