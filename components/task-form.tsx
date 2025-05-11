"use client"

import React from "react"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, Plus } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { useAppData } from "@/lib/app-data-context"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { cn, formatDate } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const taskSchema = z.object({
  name: z.string().min(2, {
    message: "Task name must be at least 2 characters.",
  }),
  date: z.date({
    required_error: "Please select a date.",
  }),
  remember: z.boolean().default(false),
  color: z.string().default("#f43f5e"),
  categoryId: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
})

export function TaskForm({ task, onSuccess }) {
  const { addTask, updateTask, taskCategories, addTaskCategory } = useAppData()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryIcon, setNewCategoryIcon] = useState("Bookmark")
  const [newCategoryColor, setNewCategoryColor] = useState("#3b82f6")

  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: task?.name || "",
      date: task ? new Date(task.date) : new Date(),
      remember: task?.remember || false,
      color: task?.color || "#f43f5e",
      categoryId: task?.categoryId || "",
      priority: task?.priority || "medium",
    },
  })

  function onSubmit(data) {
    setIsSubmitting(true)

    try {
      // Format date to YYYY-MM-DD
      const formattedDate = formatDate(data.date)

      if (task) {
        updateTask(task.id, {
          ...data,
          date: formattedDate,
        })
        toast({
          title: "Task updated",
          description: "Your task has been updated successfully.",
        })
      } else {
        addTask({
          ...data,
          date: formattedDate,
        })
        toast({
          title: "Task created",
          description: "Your new task has been created successfully.",
        })
      }

      if (onSuccess) {
        onSuccess()
      }

      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error saving your task.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory = {
        name: newCategoryName,
        icon: newCategoryIcon,
        color: newCategoryColor,
      }

      addTaskCategory(newCategory)
      setShowCategoryDialog(false)
      setNewCategoryName("")

      // Get the ID of the newly created category (it will be the last one in the array)
      const newCategoryId = taskCategories[taskCategories.length - 1]?.id
      if (newCategoryId) {
        form.setValue("categoryId", newCategoryId)
      }

      toast({
        title: "Category created",
        description: `Category "${newCategoryName}" has been created successfully.`,
      })
    }
  }

  // Get available Lucide icons
  const iconNames = Object.keys(LucideIcons).filter(
    (name) => typeof LucideIcons[name] === "function" && name !== "createLucideIcon",
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Complete project report" {...field} />
              </FormControl>
              <FormDescription>What do you need to accomplish?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                </PopoverContent>
              </Popover>
              <FormDescription>When do you need to complete this task?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-1">
                  <FormItem className="flex items-center space-x-1 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="low" className="sr-only peer" />
                    </FormControl>
                    <FormLabel className="cursor-pointer rounded-md border-2 border-transparent px-3 py-2 peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:text-green-500 bg-green-100 text-green-700">
                      Low
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-1 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="medium" className="sr-only peer" />
                    </FormControl>
                    <FormLabel className="cursor-pointer rounded-md border-2 border-transparent px-3 py-2 peer-data-[state=checked]:border-yellow-500 peer-data-[state=checked]:text-yellow-500 bg-yellow-100 text-yellow-700">
                      Medium
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-1 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="high" className="sr-only peer" />
                    </FormControl>
                    <FormLabel className="cursor-pointer rounded-md border-2 border-transparent px-3 py-2 peer-data-[state=checked]:border-red-500 peer-data-[state=checked]:text-red-500 bg-red-100 text-red-700">
                      High
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormDescription>Set the priority level for this task</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <div className="flex gap-2">
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {taskCategories.map((category) => {
                      const IconComponent = LucideIcons[category.icon] || LucideIcons.Bookmark
                      return (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <IconComponent size={16} style={{ color: category.color }} />
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="icon" onClick={() => setShowCategoryDialog(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <FormDescription>Categorize your task for better organization</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Color</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input type="color" {...field} className="w-12 h-8 p-1" />
                  <span className="text-sm">{field.value}</span>
                </div>
              </FormControl>
              <FormDescription>Choose a color to represent this task</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="remember"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Remember this task</FormLabel>
                <FormDescription>Add this task to your unique records when completed</FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700"
        >
          {isSubmitting ? "Saving..." : task ? "Update Task" : "Create Task"}
        </Button>
      </form>

      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <FormLabel>Category Name</FormLabel>
              <Input
                placeholder="e.g., Work, Personal, Health"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <FormLabel>Icon</FormLabel>
              <Select value={newCategoryIcon} onValueChange={setNewCategoryIcon}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {React.createElement(LucideIcons[newCategoryIcon], { size: 16 })}
                      <span>{newCategoryIcon}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {iconNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      <div className="flex items-center gap-2">
                        {React.createElement(LucideIcons[name], { size: 16 })}
                        <span>{name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <FormLabel>Color</FormLabel>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="w-12 h-8 p-1"
                />
                <span className="text-sm">{newCategoryColor}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCategory}>Create Category</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Form>
  )
}
