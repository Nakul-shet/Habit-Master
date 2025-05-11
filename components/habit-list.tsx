"use client"

import { useState } from "react"
import { Check, ChevronDown, Plus, X, BarChart2, Trash2 } from "lucide-react"
import { useAppData } from "@/lib/app-data-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { HabitForm } from "@/components/habit-form"
import { formatDate, calculateStreak } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { HabitStats } from "@/components/habit-stats"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function HabitList({ showAddButton = false }) {
  const { habits, toggleHabitCompletion, toggleHabitFailed, deleteHabit } = useAppData()
  const [open, setOpen] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const [selectedHabit, setSelectedHabit] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [habitToDelete, setHabitToDelete] = useState(null)
  const today = formatDate(new Date())

  // Get today's habit status
  const habitsWithStatus = habits.map((habit) => {
    const todayEntry = habit.history.find((h) => h.date === today)
    const streak = calculateStreak(habit.history)
    return {
      ...habit,
      completed: todayEntry?.completed || false,
      failed: todayEntry?.failed || false,
      streak,
    }
  })

  const handleStatusChange = (habitId, status) => {
    if (status === "completed") {
      toggleHabitCompletion(habitId, today)
    } else if (status === "failed") {
      toggleHabitFailed(habitId, today)
    } else if (status === "none") {
      // First, if it's completed, toggle it to uncomplete it
      const habit = habitsWithStatus.find((h) => h.id === habitId)
      if (habit.completed) {
        toggleHabitCompletion(habitId, today)
      }
      // Then, if it's failed, toggle it to unfail it
      if (habit.failed) {
        toggleHabitFailed(habitId, today)
      }
    }
  }

  const viewHabitStats = (habit) => {
    setSelectedHabit(habit)
    setStatsOpen(true)
  }

  const handleDeleteHabit = (habit) => {
    setHabitToDelete(habit)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteHabit = () => {
    if (habitToDelete) {
      deleteHabit(habitToDelete.id)
      setDeleteDialogOpen(false)
      setHabitToDelete(null)
    }
  }

  return (
    <div className="space-y-4">
      {habitsWithStatus.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-muted-foreground">You haven't created any habits yet.</p>
          <Button onClick={() => setOpen(true)} className="mt-2">
            <Plus className="mr-2 h-4 w-4" /> Add Your First Habit
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {habitsWithStatus.map((habit) => (
              <div key={habit.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: habit.color }}></div>
                  <div>
                    <span className="font-medium">{habit.name}</span>
                    {habit.streak > 0 && (
                      <Badge className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                        {habit.streak} day streak 🔥
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => viewHabitStats(habit)}>
                    <BarChart2 className="h-4 w-4" />
                  </Button>

                  {/* Delete Habit Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteHabit(habit)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 gap-1">
                        {habit.completed ? (
                          <>
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Completed</span>
                          </>
                        ) : habit.failed ? (
                          <>
                            <X className="h-4 w-4 text-red-500" />
                            <span>Failed</span>
                          </>
                        ) : (
                          <>
                            <span>Not Tracked</span>
                          </>
                        )}
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleStatusChange(habit.id, "completed")}>
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Mark as Completed
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(habit.id, "failed")}>
                        <X className="h-4 w-4 mr-2 text-red-500" />
                        Mark as Failed
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(habit.id, "none")}>
                        Clear Status
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
          {showAddButton && (
            <Button onClick={() => setOpen(true)} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Add Habit
            </Button>
          )}
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Habit</DialogTitle>
            <DialogDescription>
              Create a new habit to track. You'll earn points each time you complete it.
            </DialogDescription>
          </DialogHeader>
          <HabitForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={statsOpen} onOpenChange={setStatsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Habit Statistics</DialogTitle>
            <DialogDescription>View detailed statistics for this habit.</DialogDescription>
          </DialogHeader>
          {selectedHabit && <HabitStats habit={selectedHabit} />}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-h-[90vh] overflow-y-auto my-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the habit "{habitToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteHabit} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
