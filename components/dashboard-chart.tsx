"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatDate, getDatesInRange } from "@/lib/utils"

// Local date formatting function to avoid timezone issues
function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function DashboardChart({ habits, tasks }) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    // Start with the beginning of the current week (Monday)
    const now = new Date()
    const dayOfWeek = now.getDay()
    const startOfWeek = new Date(now)
    
    // If today is Sunday, we want to show the week that includes today
    // So we go back 6 days to get to Monday of this week
    if (dayOfWeek === 0) {
      // Sunday - go back 6 days to get to Monday
      startOfWeek.setDate(now.getDate() - 6)
    } else {
      // Other days - go back to Monday of this week
      startOfWeek.setDate(now.getDate() - (dayOfWeek - 1))
    }
    
    startOfWeek.setHours(0, 0, 0, 0)
    return startOfWeek
  })

  const [weekData, setWeekData] = useState([])
  const [aggregateScore, setAggregateScore] = useState(0)

  // Calculate actual completion data based on habits and tasks
  const calculateActualData = (weekStart) => {
    const days = []
    let totalCompletion = 0

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      const dateStr = formatLocalDate(date)
      
      // Calculate completed habits for this date
      const completedHabits = habits.reduce((count, habit) => {
        const historyEntry = habit.history.find((h) => h.date === dateStr)
        return count + (historyEntry?.completed ? 1 : 0)
      }, 0)

      // Calculate completed tasks for this date
      const completedTasks = tasks.filter((task) => task.date === dateStr && task.completed).length

      // Calculate total possible completions for this date
      const totalHabits = habits.length
      const totalTasks = tasks.filter((task) => task.date === dateStr).length
      const totalPossible = totalHabits + totalTasks

      // Calculate completion rate
      const completionRate = totalPossible > 0 ? Math.round(((completedHabits + completedTasks) / totalPossible) * 100) : 0
      totalCompletion += completionRate

      days.push({
        date: date,
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        completionRate: completionRate,
        dateStr: dateStr,
        completedHabits,
        completedTasks,
        totalHabits,
        totalTasks
      })
    }

    const averageCompletion = Math.round(totalCompletion / 7)
    setAggregateScore(averageCompletion)

    return days
  }

  useEffect(() => {
    const data = calculateActualData(currentWeekStart)
    setWeekData(data)
  }, [currentWeekStart, habits, tasks])

  const navigateWeek = (direction) => {
    const newWeekStart = new Date(currentWeekStart)
    if (direction === 'prev') {
      newWeekStart.setDate(currentWeekStart.getDate() - 7)
    } else {
      newWeekStart.setDate(currentWeekStart.getDate() + 7)
    }
    setCurrentWeekStart(newWeekStart)
  }

  const getScoreColor = (score) => {
    if (score < 50) return "text-red-600"
    if (score < 75) return "text-yellow-600"
    return "text-green-600"
  }

  const getScoreBgColor = (score) => {
    if (score < 50) return "bg-red-100 dark:bg-red-900/20"
    if (score < 75) return "bg-yellow-100 dark:bg-yellow-900/20"
    return "bg-green-100 dark:bg-green-900/20"
  }

  const formatWeekRange = () => {
    const endOfWeek = new Date(currentWeekStart)
    endOfWeek.setDate(currentWeekStart.getDate() + 6)
    
    const startStr = currentWeekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    const endStr = endOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    
    return `${startStr} - ${endStr}`
  }

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateWeek('prev')}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous Week
        </Button>
        
        <h3 className="font-semibold text-lg">{formatWeekRange()}</h3>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateWeek('next')}
          className="flex items-center gap-1"
        >
          Next Week
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Daily Progress */}
      <div className="grid grid-cols-7 gap-2">
        {weekData.map((day, index) => {
          // Use local date comparison to avoid timezone issues
          const today = new Date()
          const todayStr = formatLocalDate(today)
          const isToday = todayStr === day.dateStr
          
                      return (
              <Card 
                key={index} 
                className={`text-center ${isToday ? 'border-2 border-green-500' : ''}`}
              >
              <CardContent className="p-3">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  {day.dayName}
                </div>
                <div className="text-lg font-bold mb-2">
                  {day.completionRate}%
                </div>
                <Progress 
                  value={day.completionRate} 
                  className={`h-2 ${day.completionRate < 50 ? 'bg-red-200' : day.completionRate < 75 ? 'bg-yellow-200' : 'bg-green-200'}`}
                />
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Aggregate Score */}
      <Card className={`${getScoreBgColor(aggregateScore)} border-0`}>
        <CardContent className="p-4 text-center">
          <div className="text-sm text-muted-foreground mb-1">Weekly Impact Score</div>
          <div className={`text-3xl font-bold ${getScoreColor(aggregateScore)}`}>
            {aggregateScore}%
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {aggregateScore < 50 ? "Needs improvement" : 
             aggregateScore < 75 ? "Good progress" : "Excellent performance"}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
