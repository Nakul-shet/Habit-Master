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

const todoSchema = z.object({
  name: z.string().min(2, {
    message: "Todo name must be at least 2 characters.",
  }),
})

export function ProjectTodoForm({ projectId, todo, onSuccess }) {
  const { addProjectTodo, updateProjectTodo } = useAppData()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      name: todo?.name || "",
    },
  })

  function onSubmit(data) {
    setIsSubmitting(true)

    try {
      if (todo) {
        updateProjectTodo(projectId, todo.id, data)
        toast({
          title: "Todo updated",
          description: "Your todo has been updated successfully.",
        })
      } else {
        addProjectTodo(projectId, data)
        toast({
          title: "Todo created",
          description: "Your new todo has been created successfully.",
        })
      }

      if (onSuccess) {
        onSuccess()
      }

      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error saving your todo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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
              <FormLabel>Todo Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Research competitors" {...field} />
              </FormControl>
              <FormDescription>What needs to be done for this project?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
        >
          {isSubmitting ? "Saving..." : todo ? "Update Todo" : "Create Todo"}
        </Button>
      </form>
    </Form>
  )
}
