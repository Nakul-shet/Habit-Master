"use client"

import { useEffect, useState } from "react"
import { Calendar, CheckCircle, Clock, FileText, Star, Trophy } from "lucide-react"
import { useAppData } from "@/lib/app-data-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { calculateLevel, formatDate, getCompletionRate } from "@/lib/utils"
import { DashboardChart } from "@/components/dashboard-chart"
import { DashboardHeader } from "@/components/dashboard-header"
import { TaskList } from "@/components/task-list"
import { HabitList } from "@/components/habit-list"
import { BadgeIcon } from "@/components/badge-icon"
import { UniqueRecordsList } from "@/components/unique-records-list"

export default function DashboardPage() {
  const { habits, tasks, settings, projects, badge, uniqueRecords } = useAppData()
  const [todaysTasks, setTodaysTasks] = useState([])
  const [stats, setStats] = useState({
    totalPoints: 0,
    completionRate: 0,
    pendingTasks: 0,
    completedTasks: 0,
    pendingHabits: 0,
    completedHabits: 0,
    level: 1,
    nextLevel: 0,
  })

  useEffect(() => {
    // Calculate total points
    const habitPoints = habits.reduce((total, habit) => {
      const completedDays = habit.history.filter((h) => h.completed).length
      return total + completedDays * settings.pointsPerHabit
    }, 0)

    const taskPoints = tasks.reduce((total, task) => {
      return total + (task.completed ? settings.pointsPerTask : 0)
    }, 0)

    const totalPoints = habitPoints + taskPoints

    // Get today's date in YYYY-MM-DD format
    const today = formatDate(new Date())

    // Filter today's tasks
    const todayTaskList = tasks.filter((task) => task.date === today)
    setTodaysTasks(todayTaskList)

    // Calculate completion rates
    const taskCompletionRate = getCompletionRate(todayTaskList)

    // Calculate today's habits
    const todayHabits = habits.map((habit) => {
      const todayEntry = habit.history.find((h) => h.date === today)
      return {
        ...habit,
        completedToday: todayEntry?.completed || false,
      }
    })

    const habitCompletionRate = (todayHabits.filter((h) => h.completedToday).length / (todayHabits.length || 1)) * 100

    // Calculate level
    const { level, nextLevelPercentage } = calculateLevel(totalPoints, settings.levelThresholds)

    setStats({
      totalPoints,
      completionRate: (taskCompletionRate + habitCompletionRate) / 2,
      pendingTasks: todayTaskList.filter((t) => !t.completed).length,
      completedTasks: todayTaskList.filter((t) => t.completed).length,
      pendingHabits: todayHabits.filter((h) => !h.completedToday).length,
      completedHabits: todayHabits.filter((h) => h.completedToday).length,
      level,
      nextLevel: nextLevelPercentage,
    })
  }, [habits, tasks, settings])

  // Get the badge name for display
  const getBadgeName = () => {
    const parts = badge.split(/(\d+)/)
    if (parts.length > 1) {
      return `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} ${parts[1]}`
    }
    return badge.charAt(0).toUpperCase() + badge.slice(1)
  }

  // Get active projects
  const activeProjects = projects.filter((p) => p.progress < 100).slice(0, 3)

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <DashboardHeader />

      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Level {stats.level}
              </CardTitle>
              <CardDescription className="text-purple-100">Your progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <BadgeIcon rank={badge} size={48} />
                <div>
                  <div className="text-xl font-bold">{getBadgeName()}</div>
                  <div className="text-sm text-purple-100">{stats.totalPoints} points</div>
                </div>
              </div>
              <Progress value={stats.nextLevel} className="h-2 bg-purple-400 mt-3" />
              <p className="text-xs mt-2 text-purple-100">
                {100 - stats.nextLevel}% to level {stats.level + 1}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Completion Rate
              </CardTitle>
              <CardDescription className="text-emerald-100">Today's progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{Math.round(stats.completionRate)}%</div>
              <Progress value={stats.completionRate} className="h-2 bg-emerald-400" />
              <p className="text-xs mt-2 text-emerald-100">
                {stats.completedTasks + stats.completedHabits} completed, {stats.pendingTasks + stats.pendingHabits}{" "}
                pending
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Habits
              </CardTitle>
              <CardDescription className="text-amber-100">Your daily habits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col items-center justify-center bg-amber-600/30 rounded-lg p-2">
                  <div className="text-2xl font-bold">{stats.completedHabits}</div>
                  <div className="text-xs text-amber-100">Completed</div>
                </div>
                <div className="flex flex-col items-center justify-center bg-amber-600/30 rounded-lg p-2">
                  <div className="text-2xl font-bold">{stats.pendingHabits}</div>
                  <div className="text-xs text-amber-100">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-rose-500 to-pink-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Tasks
              </CardTitle>
              <CardDescription className="text-rose-100">Today's tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col items-center justify-center bg-rose-600/30 rounded-lg p-2">
                  <div className="text-2xl font-bold">{stats.completedTasks}</div>
                  <div className="text-xs text-rose-100">Completed</div>
                </div>
                <div className="flex flex-col items-center justify-center bg-rose-600/30 rounded-lg p-2">
                  <div className="text-2xl font-bold">{stats.pendingTasks}</div>
                  <div className="text-xs text-rose-100">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Progress</CardTitle>
              <CardDescription>Your habit and task completion over time</CardDescription>
            </CardHeader>
            <CardContent>
              <DashboardChart habits={habits} tasks={tasks} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
              <CardDescription>Your ongoing projects</CardDescription>
            </CardHeader>
            <CardContent>
              {activeProjects.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No active projects</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeProjects.map((project) => (
                    <div key={project.id} className="space-y-2">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{project.name}</h4>
                        <span className="text-sm">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Tabs defaultValue="today">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="today">Today's Tasks</TabsTrigger>
              <TabsTrigger value="habits">Habits</TabsTrigger>
              <TabsTrigger value="unique">Unique Records ({uniqueRecords.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="today" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    Today's Tasks
                  </CardTitle>
                  <CardDescription>Complete tasks to earn {settings.pointsPerTask} points each</CardDescription>
                </CardHeader>
                <CardContent>
                  <TaskList tasks={todaysTasks} showAddButton />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="habits" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-purple-500" />
                    Your Habits
                  </CardTitle>
                  <CardDescription>Complete habits to earn {settings.pointsPerHabit} points each</CardDescription>
                </CardHeader>
                <CardContent>
                  <HabitList showAddButton={true} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="unique" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Unique Records
                  </CardTitle>
                  <CardDescription>Special tasks you've completed</CardDescription>
                </CardHeader>
                <CardContent>
                  <UniqueRecordsList />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
