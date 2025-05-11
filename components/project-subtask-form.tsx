"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useAppData } from "@/lib/app-data-context"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

const subtaskSchema = z.object({
  name: z.string().min(2, {
    message: "Subtask name must be at least 2 characters.",
  }),
})

export function ProjectSubtaskForm({ projectId, todoId, subtask, onSuccess }) {
  const { addProjectTodoSubtask, updateProjectTodoSubtask, deleteProjectTodoSubtask } = useAppData()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(subtaskSchema),
    defaultValues: {
      name: subtask?.name || "",
    },
  })

  function onSubmit(data) {
    setIsSubmitting(true)

    try {
      if (subtask) {
        updateProjectTodoSubtask(projectId, todoId, subtask.id, data)
        toast({
          title: "Subtask updated",
          description: "Your subtask has been updated successfully.",
        })
      } else {
        addProjectTodoSubtask(projectId, todoId, data)
        toast({
          title: "Subtask created",
          description: "Your new subtask has been created successfully.",
        })
      }

      if (onSuccess) {
        onSuccess()
      }

      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error saving your subtask.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleDelete() {
    if (subtask) {
      deleteProjectTodoSubtask(projectId, todoId, subtask.id)
      toast({
        title: "Subtask deleted",
        description: "Your subtask has been deleted successfully.",
      })
      if (onSuccess) {
        onSuccess()
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtask Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Call supplier" {...field} />
              </FormControl>
              <FormDescription>Break down your todo into smaller steps</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
          >
            {isSubmitting ? "Saving..." : subtask ? "Update Subtask" : "Create Subtask"}
          </Button>

          {subtask && (
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
