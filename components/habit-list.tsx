"use client"

import { useState } from "react"
import { Check, Plus, X, BarChart2, Trash2, Clock } from "lucide-react"
import { useAppData } from "@/lib/app-data-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { HabitForm } from "@/components/habit-form"
import { formatDate, calculateStreak } from "@/lib/utils"
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

// New component for interactive status icons
function HabitStatusIcons({ habit, onStatusChange }) {
  const today = formatDate(new Date())
  const isToday = habit.date === today
  const isPast = new Date(habit.date) < new Date(today)
  const isFuture = new Date(habit.date) > new Date(today)

  const handleStatusClick = (status) => {
    if (isFuture) return // Don't allow status changes for future dates
    
    if (status === "completed") {
      onStatusChange(habit.id, "completed")
    } else if (status === "failed") {
      onStatusChange(habit.id, "failed")
    }
  }

  const handleClearStatus = () => {
    if (isFuture) return
    onStatusChange(habit.id, "none")
  }

  // Future date - show pending state
  if (isFuture) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground cursor-not-allowed"
          disabled
        >
          <Clock className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  // Past or today - show interactive icons
  return (
    <div className="flex items-center gap-1">
      {/* Completed button */}
      <Button
        variant={habit.completed ? "default" : "ghost"}
        size="sm"
        className={`h-8 w-8 p-0 ${
          habit.completed 
            ? "bg-green-500 hover:bg-green-600 text-white" 
            : "hover:bg-green-50 hover:text-green-600"
        } ${habit.failed ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={() => handleStatusClick("completed")}
        disabled={habit.failed}
        title={habit.completed ? "Click to unmark as completed" : "Mark as completed"}
      >
        <Check className="h-4 w-4" />
      </Button>

      {/* Failed button */}
      <Button
        variant={habit.failed ? "default" : "ghost"}
        size="sm"
        className={`h-8 w-8 p-0 ${
          habit.failed 
            ? "bg-red-500 hover:bg-red-600 text-white" 
            : "hover:bg-red-50 hover:text-red-600"
        } ${habit.completed ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={() => handleStatusClick("failed")}
        disabled={habit.completed}
        title={habit.failed ? "Click to unmark as failed" : "Mark as failed"}
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Clear status button - only show if there's a status */}
      {(habit.completed || habit.failed) && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-gray-600"
          onClick={handleClearStatus}
          title="Clear status"
        >
          <span className="text-xs">×</span>
        </Button>
      )}
    </div>
  )
}

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
      date: today, // Add date for the status icons component
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

                  {/* Replace dropdown with interactive status icons */}
                  <HabitStatusIcons habit={habit} onStatusChange={handleStatusChange} />
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
        <DialogContent className="max-w-lg">
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
