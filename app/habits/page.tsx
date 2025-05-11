"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DashboardHeader } from "@/components/dashboard-header"
import { HabitForm } from "@/components/habit-form"
import { HabitList } from "@/components/habit-list"

export default function HabitsPage() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <DashboardHeader />

      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Habits</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <Button
              onClick={() => setOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Habit
            </Button>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Habit</DialogTitle>
                <DialogDescription>Create a new habit to track daily, weekly, or monthly.</DialogDescription>
              </DialogHeader>
              <HabitForm onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Habits</CardTitle>
            <CardDescription>Track your habits consistently to build streaks and earn points</CardDescription>
          </CardHeader>
          <CardContent>
            <HabitList />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
