"use client"

import { useState, useMemo } from "react"
import { CheckCircle, Circle, Edit, Plus, Calendar, ArrowRight, Filter, SortAsc, SortDesc, X } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { useAppData } from "@/lib/app-data-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { format, addDays } from "date-fns"
import { TaskForm } from "@/components/task-form"
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { formatDate } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

export function TaskList({ tasks = [], showAddButton = false, compactView = false }) {
  const { toggleTaskCompletion, toggleTaskIncomplete, toggleTaskFailed, deleteTask, updateTask, taskCategories, getTaskCategory, settings } = useAppData()
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [moveDialogOpen, setMoveDialogOpen] = useState(false)
  const [taskToMove, setTaskToMove] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [sortDirection, setSortDirection] = useState("asc")
  const [failConfirmOpen, setFailConfirmOpen] = useState(false)
  const [failSwitchTask, setFailSwitchTask] = useState(null)
  const [failSwitchTarget, setFailSwitchTarget] = useState(null) // 'completed' or 'failed'
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false)

  const handleToggleCompletion = (task) => {
    if (task.failed) {
      setFailSwitchTask(task)
      setFailSwitchTarget('completed')
      setFailConfirmOpen(true)
      return
    }
    toggleTaskCompletion(task.id)
  }

  const handleToggleIncomplete = (taskId) => {
    toggleTaskIncomplete(taskId)
  }

  const handleEdit = (task) => {
    setEditTask(task)
  }

  const handleDelete = (task) => {
    setTaskToDelete(task)
    setDeleteDialogOpen(true)
  }

  const handleMoveTask = (task) => {
    setTaskToMove(task)
    setSelectedDate(new Date(task.date))
    setMoveDialogOpen(true)
  }

  const handleToggleFailed = (task) => {
    if (task.completed) {
      setFailSwitchTask(task)
      setFailSwitchTarget('failed')
      setFailConfirmOpen(true)
      return
    }
    toggleTaskFailed(task.id)
  }

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id)
      setDeleteDialogOpen(false)
      setTaskToDelete(null)
    }
  }

  const confirmMoveTask = () => {
    if (taskToMove && selectedDate) {
      const formattedDate = formatDate(selectedDate)
      updateTask(taskToMove.id, { ...taskToMove, date: formattedDate })
      setMoveDialogOpen(false)
      setTaskToMove(null)
      setSelectedDate(null)
    }
  }

  // Move task to tomorrow
  const moveToTomorrow = (task) => {
    const tomorrow = addDays(new Date(task.date), 1)
    const formattedDate = formatDate(tomorrow)
    updateTask(task.id, { ...task, date: formattedDate })
  }

  // Quick move options
  const quickMoveOptions = [
    { label: "Next Week", days: 7 },
    { label: "Next Month", days: 30 },
  ]

  const handleQuickMove = (task, days) => {
    const newDate = addDays(new Date(task.date), days)
    const formattedDate = formatDate(newDate)
    updateTask(task.id, { ...task, date: formattedDate })
  }

  const confirmFailSwitch = () => {
    if (failSwitchTask && failSwitchTarget) {
      if (failSwitchTarget === 'completed') {
        toggleTaskFailed(failSwitchTask.id) // Unfail first
        toggleTaskCompletion(failSwitchTask.id)
      } else if (failSwitchTarget === 'failed') {
        toggleTaskCompletion(failSwitchTask.id) // Uncomplete first
        toggleTaskFailed(failSwitchTask.id)
      }
    }
    setFailConfirmOpen(false)
    setFailSwitchTask(null)
    setFailSwitchTarget(null)
  }

  const clearAllCompletedTasks = () => {
    // Delete all completed tasks from the current list
    tasks.forEach(task => {
      if (task.completed) {
        deleteTask(task.id)
      }
    })
    setClearAllDialogOpen(false)
  }

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    // First, filter tasks
    let result = [...tasks]

    if (categoryFilter !== "all") {
      result = result.filter((task) => task.categoryId === categoryFilter)
    }

    if (priorityFilter !== "all") {
      result = result.filter((task) => task.priority === priorityFilter)
    }

    // For compact view, only show completed tasks
    if (compactView) {
      result = result.filter((task) => task.completed)
    }

    // Then, sort tasks
    result.sort((a, b) => {
      let comparison = 0

      if (sortBy === "date") {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (sortBy === "priority") {
        const priorityValues = { high: 3, medium: 2, low: 1 }
        comparison = (priorityValues[a.priority] || 0) - (priorityValues[b.priority] || 0)
      } else if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name)
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

    return result
  }, [tasks, categoryFilter, priorityFilter, sortBy, sortDirection, compactView])

  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "low":
        return "bg-green-100 text-green-800 border-green-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {!compactView && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuRadioGroup value={categoryFilter} onValueChange={setCategoryFilter}>
                    <DropdownMenuItem className="font-semibold">Category</DropdownMenuItem>
                    <DropdownMenuRadioItem value="all">All Categories</DropdownMenuRadioItem>
                    {taskCategories.map((category) => {
                      const IconComponent = LucideIcons[category.icon] || LucideIcons.Bookmark
                      return (
                        <DropdownMenuRadioItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <IconComponent size={16} style={{ color: category.color }} />
                            <span>{category.name}</span>
                          </div>
                        </DropdownMenuRadioItem>
                      )
                    })}
                  </DropdownMenuRadioGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuRadioGroup value={priorityFilter} onValueChange={setPriorityFilter}>
                    <DropdownMenuItem className="font-semibold">Priority</DropdownMenuItem>
                    <DropdownMenuRadioItem value="all">All Priorities</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="high">High</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="medium">Medium</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="low">Low</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    {sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    <span>Sort</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                    <DropdownMenuItem className="font-semibold">Sort By</DropdownMenuItem>
                    <DropdownMenuRadioItem value="date">Date</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="priority">Priority</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuRadioGroup value={sortDirection} onValueChange={setSortDirection}>
                    <DropdownMenuItem className="font-semibold">Direction</DropdownMenuItem>
                    <DropdownMenuRadioItem value="asc">Ascending</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="desc">Descending</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>

        <div className="flex gap-2">
          {compactView && filteredAndSortedTasks.length > 0 && (
            <Button
              onClick={() => setClearAllDialogOpen(true)}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Clear All
            </Button>
          )}
          
          {showAddButton && (
            <Button
              onClick={() => setAddDialogOpen(true)}
              size="sm"
              className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
          )}
        </div>
      </div>

      {filteredAndSortedTasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {compactView ? "No completed tasks found for this period." : "No tasks found for this period."}
          </p>
          {showAddButton && (
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="mt-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Your First Task
            </Button>
          )}
        </div>
      ) : (
        <>
          {filteredAndSortedTasks.map((task) => {
            const category = task.categoryId ? getTaskCategory(task.categoryId) : null
            const IconComponent = category && category.icon ? LucideIcons[category.icon] : null
            const pointsEarned = task.customPoints || settings.pointsPerTask

            if (compactView) {
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card text-card-foreground shadow-sm"
                  style={{ borderLeft: `4px solid ${task.color || "#10b981"}` }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm truncate">
                          {task.name}
                        </h4>
                        {category && IconComponent && (
                          <div
                            className="flex items-center justify-center h-4 w-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            <IconComponent size={10} style={{ color: category.color }} />
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{format(new Date(task.date), "MMM d, yyyy")}</span>
                        {category && (
                          <span className="flex items-center gap-1">
                            •<span style={{ color: category.color }}>{category.name}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      +{pointsEarned} pts
                    </Badge>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
                style={{ borderLeft: `4px solid ${task.color || (task.completed ? "#10b981" : task.failed ? "#6b7280" : "#f43f5e")}` }}
              >
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8"
                    onClick={() => handleToggleCompletion(task)}
                    disabled={task.failed}
                  >
                    {task.completed ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : task.failed ? (
                      <Circle className="h-6 w-6 text-gray-400" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    )}
                  </Button>
                  {/* Failed toggle button */}
                  <Button
                    variant={task.failed ? "default" : "ghost"}
                    size="icon"
                    className={`rounded-full h-8 w-8 ${task.failed ? "bg-red-500 hover:bg-red-600 text-white" : "hover:bg-red-50 hover:text-red-600"}`}
                    onClick={() => handleToggleFailed(task)}
                    title={task.failed ? "Marked as failed" : "Mark as failed"}
                    disabled={task.completed}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  {/* Optionally, you can keep the incomplete toggle if needed, or remove it if only failed/completed are allowed */}
                  {/* <Button ... /> */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                        {task.name}
                      </h4>
                      {task.priority && (
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      )}
                      {category && IconComponent && (
                        <div
                          className="flex items-center justify-center h-5 w-5 rounded-full"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <IconComponent size={12} style={{ color: category.color }} />
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{format(new Date(task.date), "EEEE, MMMM d, yyyy")}</span>
                      {category && (
                        <span className="flex items-center gap-1">
                          •<span style={{ color: category.color }}>{category.name}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Move to Tomorrow Button - Only show for incomplete tasks */}
                  {!task.completed && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveToTomorrow(task)}
                            className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Move to Tomorrow</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(task)}>Edit</DropdownMenuItem>

                      {/* Move task submenu - Only show for incomplete tasks */}
                      {!task.completed && (
                        <DropdownMenu>
                          <DropdownMenuTrigger className="w-full px-2 py-1.5 text-sm cursor-default flex items-center">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Move to...</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {quickMoveOptions.map((option) => (
                              <DropdownMenuItem key={option.days} onClick={() => handleQuickMove(task, option.days)}>
                                {option.label}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem onClick={() => handleMoveTask(task)}>Choose date...</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}

                      <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDelete(task)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}

          {showAddButton && (
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
          )}
        </>
      )}

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Create a new task to complete.</DialogDescription>
          </DialogHeader>
          <TaskForm onSuccess={() => setAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTask} onOpenChange={(open) => !open && setEditTask(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Make changes to your task.</DialogDescription>
          </DialogHeader>
          {editTask && <TaskForm task={editTask} onSuccess={() => setEditTask(null)} />}
        </DialogContent>
      </Dialog>

      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto my-4">
          <DialogHeader>
            <DialogTitle>Move Task</DialogTitle>
            <DialogDescription>Select a new date for this task.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            />
            <div className="flex justify-end w-full space-x-2">
              <Button variant="outline" onClick={() => setMoveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmMoveTask} disabled={!selectedDate}>
                Move Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-h-[90vh] overflow-y-auto my-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the task "{taskToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={failConfirmOpen} onOpenChange={setFailConfirmOpen}>
        <AlertDialogContent className="max-h-[90vh] overflow-y-auto my-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {failSwitchTarget === 'completed'
                ? 'This task is currently marked as failed. Do you want to mark it as completed instead?'
                : 'This task is currently marked as completed. Do you want to mark it as failed instead?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFailConfirmOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmFailSwitch} className="bg-gray-600 hover:bg-gray-700">
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={clearAllDialogOpen} onOpenChange={setClearAllDialogOpen}>
        <AlertDialogContent className="max-h-[90vh] overflow-y-auto my-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Completed Tasks?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all completed tasks from the past tab. Your earned points will be preserved at the global level. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setClearAllDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={clearAllCompletedTasks} className="bg-red-600 hover:bg-red-700">
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
