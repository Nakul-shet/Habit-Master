"use client"

import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate, getDatesInRange } from "@/lib/utils"

export function DashboardChart({ habits, tasks }) {
  const [chartData, setChartData] = useState([])
  const [completionData, setCompletionData] = useState([])
  const [streakData, setStreakData] = useState([])

  useEffect(() => {
    // Get dates for the last 7 days
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 6)

    const dateRange = getDatesInRange(startDate, endDate)

    // Prepare chart data
    const data = dateRange.map((date) => {
      const dateStr = formatDate(date)

      // Count completed habits for this date
      const habitsCompleted = habits.reduce((count, habit) => {
        const historyEntry = habit.history.find((h) => h.date === dateStr)
        return count + (historyEntry?.completed ? 1 : 0)
      }, 0)

      // Count completed tasks for this date
      const tasksCompleted = tasks.filter((task) => task.date === dateStr && task.completed).length

      // Calculate total habits and tasks for completion rate
      const totalHabits = habits.length
      const totalTasks = tasks.filter((task) => task.date === dateStr).length

      // Calculate completion rate
      const completionRate = ((habitsCompleted + tasksCompleted) / (totalHabits + totalTasks || 1)) * 100

      return {
        date: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        habitsCompleted,
        tasksCompleted,
        completionRate: Math.round(completionRate),
      }
    })

    setChartData(data)

    // Prepare completion data for bar chart
    const totalCompletedHabits = habits.reduce((count, habit) => {
      return count + habit.history.filter((h) => h.completed).length
    }, 0)

    const totalCompletedTasks = tasks.filter((task) => task.completed).length
    const totalPendingTasks = tasks.filter((task) => !task.completed).length

    const totalPendingHabits = habits.reduce((count, habit) => {
      // Count all possible habit completions minus actual completions
      const daysTracked = habit.history.length
      const completedDays = habit.history.filter((h) => h.completed).length
      return count + (daysTracked - completedDays)
    }, 0)

    setCompletionData([
      { name: "Completed Habits", value: totalCompletedHabits },
      { name: "Completed Tasks", value: totalCompletedTasks },
      { name: "Pending Tasks", value: totalPendingTasks },
      { name: "Pending Habits", value: totalPendingHabits },
    ])

    // Prepare streak data
    const streaks = habits
      .map((habit) => {
        // Sort history by date (newest first)
        const sortedHistory = [...habit.history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        // Calculate current streak
        let currentStreak = 0
        for (let i = 0; i < sortedHistory.length; i++) {
          if (sortedHistory[i].completed) {
            currentStreak++
          } else {
            break
          }
        }

        return {
          name: habit.name.length > 15 ? habit.name.substring(0, 15) + "..." : habit.name,
          streak: currentStreak,
          color: habit.color,
        }
      })
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 5) // Top 5 streaks

    setStreakData(streaks)
  }, [habits, tasks])

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 border rounded-md shadow-sm">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Tabs defaultValue="activity">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="completion">Completion</TabsTrigger>
        <TabsTrigger value="streak">Streaks</TabsTrigger>
      </TabsList>

      <TabsContent value="activity" className="pt-4">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 30, // Increased bottom margin to prevent label overlap
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              angle={-45} // Angle the labels to prevent overlap
              textAnchor="end"
              height={60} // Increase height for angled labels
              tick={{ fontSize: 12 }} // Smaller font size
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="habitsCompleted"
              name="Habits Completed"
              stackId="1"
              stroke="hsl(var(--chart-1))"
              fill="hsl(var(--chart-1))"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="tasksCompleted"
              name="Tasks Completed"
              stackId="1"
              stroke="hsl(var(--chart-2))"
              fill="hsl(var(--chart-2))"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </TabsContent>

      <TabsContent value="completion" className="pt-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={completionData}
            layout="vertical"
            margin={{
              top: 20,
              right: 30,
              left: 120, // Increased left margin for labels
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </TabsContent>

      <TabsContent value="streak" className="pt-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={streakData}
            layout="vertical"
            margin={{
              top: 20,
              right: 30,
              left: 100, // Increased left margin for habit names
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis
              dataKey="name"
              type="category"
              width={100}
              tick={{ fontSize: 12 }} // Smaller font size
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              dataKey="streak"
              name="Current Streak"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ stroke: "#8884d8", strokeWidth: 2, r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </TabsContent>
    </Tabs>
  )
}
