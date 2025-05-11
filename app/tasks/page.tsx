"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppData } from "@/lib/app-data-context"
import { formatDate } from "@/lib/utils"
import { DashboardHeader } from "@/components/dashboard-header"
import { TaskForm } from "@/components/task-form"
import { TaskList } from "@/components/task-list"

export default function TasksPage() {
  const { tasks } = useAppData()
  const [open, setOpen] = useState(false)

  // Get today's date in YYYY-MM-DD format
  const today = formatDate(new Date())

  // Filter tasks by date
  const todayTasks = tasks.filter((task) => task.date === today)

  // Get upcoming tasks (future dates)
  const upcomingTasks = tasks.filter((task) => task.date > today)

  // Get past tasks (past dates)
  const pastTasks = tasks.filter((task) => task.date < today)

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <DashboardHeader />

      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Tasks</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <Button
              onClick={() => setOpen(true)}
              className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>Create a new task for today or schedule it for the future.</DialogDescription>
              </DialogHeader>
              <TaskForm onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="today">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">Today ({todayTasks.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({upcomingTasks.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastTasks.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="today" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Today's Tasks</CardTitle>
                <CardDescription>Tasks scheduled for today</CardDescription>
              </CardHeader>
              <CardContent>
                <TaskList tasks={todayTasks} showAddButton />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="upcoming" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
                <CardDescription>Tasks scheduled for future dates</CardDescription>
              </CardHeader>
              <CardContent>
                <TaskList tasks={upcomingTasks} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="past" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Past Tasks</CardTitle>
                <CardDescription>Tasks from previous days</CardDescription>
              </CardHeader>
              <CardContent>
                <TaskList tasks={pastTasks} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
