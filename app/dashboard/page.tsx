"use client"

import { useEffect, useState } from "react"
import { Calendar, CheckCircle, Clock, FileText, Star, Trophy, AlertCircle } from "lucide-react"
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
      // Use custom points if available, otherwise use default points
      const pointsForTask = task.completed ? (task.customPoints || settings.pointsPerTask) : 0
      return total + pointsForTask
    }, 0)

    const totalPoints = habitPoints + taskPoints

    // Get today's date in YYYY-MM-DD format
    const today = formatDate(new Date())

    // Filter today's tasks
    const todayTaskList = tasks.filter((task) => task.date === today)
    setTodaysTasks(todayTaskList as never[])

    // Calculate today's habits
    const todayHabits = habits.map((habit) => {
      const todayEntry = habit.history.find((h) => h.date === today)
      return {
        ...habit,
        completedToday: todayEntry?.completed || false,
      }
    })

    // Calculate overall completion rate (not average of two separate rates)
    const totalCompleted = todayTaskList.filter((t) => t.completed).length + todayHabits.filter((h) => h.completedToday).length
    const totalPossible = todayTaskList.length + todayHabits.length
    const overallCompletionRate = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0

    // Calculate level
    const { level, nextLevelPercentage } = calculateLevel(totalPoints, settings.levelThresholds)

    setStats({
      totalPoints,
      completionRate: overallCompletionRate,
      pendingTasks: todayTaskList.filter((t) => !t.completed).length,
      completedTasks: todayTaskList.filter((t) => t.completed).length,
      pendingHabits: todayHabits.filter((h) => !h.completedToday).length,
      completedHabits: todayHabits.filter((h) => h.completedToday).length,
      level,
      nextLevel: nextLevelPercentage,
    })
  }, [habits, tasks, settings])

  // Calculate negative percentage (all time)
  const incompleteTasks = tasks.filter((t) => t.incomplete).length
  const failedTasks = tasks.filter((t) => t.failed).length
  const failedHabits = habits.reduce((acc, habit) => acc + habit.history.filter((h) => h.failed).length, 0)
  const negativeCount = incompleteTasks + failedTasks + failedHabits
  let negativePercent = Math.min(negativeCount * 2, 100)

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

      <main className="flex-1 container mx-auto p-3 sm:p-4 md:p-6">
        {/* Stats Cards - Mobile 2x2 Grid, Desktop 4-column */}
        <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-lg md:text-xl flex items-center gap-1 sm:gap-2">
                <Trophy className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline">Level {stats.level}</span>
                <span className="sm:hidden">L{stats.level}</span>
              </CardTitle>
              <CardDescription className="text-purple-100 text-xs sm:text-sm">Your progress</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                <BadgeIcon rank={badge} size={32} className="sm:w-10 sm:h-10 md:w-12 md:h-12" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm sm:text-lg md:text-xl font-bold truncate">{getBadgeName()}</div>
                  <div className="text-xs sm:text-sm text-purple-100">{stats.totalPoints} pts</div>
                </div>
              </div>
              <Progress value={stats.nextLevel} className="h-1.5 sm:h-2 bg-purple-400 mt-2 sm:mt-3" />
              <p className="text-xs mt-1 sm:mt-2 text-purple-100">
                {100 - stats.nextLevel}% to L{stats.level + 1}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-lg md:text-xl flex items-center gap-1 sm:gap-2">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline">Completion</span>
                <span className="sm:hidden">Done</span>
              </CardTitle>
              <CardDescription className="text-emerald-100 text-xs sm:text-sm">Today's progress</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">{Math.round(stats.completionRate)}%</div>
              <Progress value={stats.completionRate} className="h-1.5 sm:h-2 bg-emerald-400" />
              <p className="text-xs mt-1 sm:mt-2 text-emerald-100">
                {stats.completedTasks + stats.completedHabits} done, {stats.pendingTasks + stats.pendingHabits} left
              </p>
            </CardContent>
          </Card>
          

          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-lg md:text-xl flex items-center gap-1 sm:gap-2">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline">Habits</span>
                <span className="sm:hidden">Habits</span>
              </CardTitle>
              <CardDescription className="text-amber-100 text-xs sm:text-sm">Your daily habits</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              <div className="grid grid-cols-2 gap-1 sm:gap-2">
                <div className="flex flex-col items-center justify-center bg-amber-600/30 rounded-lg p-1 sm:p-2">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats.completedHabits}</div>
                  <div className="text-xs text-amber-100">Done</div>
                </div>
                <div className="flex flex-col items-center justify-center bg-amber-600/30 rounded-lg p-1 sm:p-2">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats.pendingHabits}</div>
                  <div className="text-xs text-amber-100">Left</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-rose-500 to-pink-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-lg md:text-xl flex items-center gap-1 sm:gap-2">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline">Tasks</span>
                <span className="sm:hidden">Tasks</span>
              </CardTitle>
              <CardDescription className="text-rose-100 text-xs sm:text-sm">Today's tasks</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              <div className="grid grid-cols-2 gap-1 sm:gap-2">
                <div className="flex flex-col items-center justify-center bg-rose-600/30 rounded-lg p-1 sm:p-2">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats.completedTasks}</div>
                  <div className="text-xs text-rose-100">Done</div>
                </div>
                <div className="flex flex-col items-center justify-center bg-rose-600/30 rounded-lg p-1 sm:p-2">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats.pendingTasks}</div>
                  <div className="text-xs text-rose-100">Left</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <div className="mt-4 sm:mt-6">
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-10 sm:h-11">
              <TabsTrigger value="today" className="text-xs sm:text-sm">Today's Tasks</TabsTrigger>
              <TabsTrigger value="habits" className="text-xs sm:text-sm">Habits</TabsTrigger>
              <TabsTrigger value="unique" className="text-xs sm:text-sm">Unique Records ({uniqueRecords.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="today" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                    Today's Tasks
                  </CardTitle>
                  <CardDescription className="text-sm">Complete tasks to earn {settings.pointsPerTask} points each</CardDescription>
                </CardHeader>
                <CardContent>
                  <TaskList tasks={todaysTasks} showAddButton />
                </CardContent>
              </Card>
              {/* Negative Progress Bar - its own box after TaskList card */}
              <div className="w-full mt-4 rounded-lg shadow p-3 sm:p-4 bg-card dark:bg-black">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 font-semibold text-sm sm:text-base"
                    style={{
                      color: negativePercent === 0
                        ? '#059669' // green-600
                        : negativePercent <= 10
                        ? '#ca8a04' // yellow-600
                        : negativePercent <= 50
                        ? '#ea580c' // orange-600
                        : '#b91c1c', // red-700
                    }}
                  >
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    Negative Progress
                  </div>
                  <span className="text-lg sm:text-xl font-bold"
                    style={{
                      color: negativePercent === 0
                        ? '#059669'
                        : negativePercent <= 10
                        ? '#ca8a04'
                        : negativePercent <= 50
                        ? '#ea580c'
                        : '#b91c1c',
                    }}
                  >
                    -{negativePercent}%
                  </span>
                </div>
                <Progress value={negativePercent} max={100} className="h-2"
                  style={{
                    background: '#e5e7eb', // gray-200 for track
                  }}
                />
                {negativePercent === 100 && (
                  <div className="mt-1 text-center text-xs sm:text-sm font-semibold text-yellow-700 dark:text-yellow-200">
                    Serious warning: Self improvement needed!
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="habits" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                    Your Habits
                  </CardTitle>
                  <CardDescription className="text-sm">Complete habits to earn {settings.pointsPerHabit} points each</CardDescription>
                </CardHeader>
                <CardContent>
                  <HabitList showAddButton={true} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="unique" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                    Unique Records
                  </CardTitle>
                  <CardDescription className="text-sm">Special tasks you've completed</CardDescription>
                </CardHeader>
                <CardContent>
                  <UniqueRecordsList />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Charts and Projects Section */}
        <div className="mt-4 sm:mt-6 grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Weekly Progress</CardTitle>
              <CardDescription className="text-sm">Daily completion rates and weekly impact score</CardDescription>
            </CardHeader>
            <CardContent>
              <DashboardChart habits={habits} tasks={tasks} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Active Projects</CardTitle>
              <CardDescription className="text-sm">Your ongoing projects</CardDescription>
            </CardHeader>
            <CardContent>
              {activeProjects.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground text-sm">No active projects</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeProjects.map((project) => (
                    <div key={project.id} className="space-y-2">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-sm sm:text-base">{project.name}</h4>
                        <span className="text-xs sm:text-sm">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
