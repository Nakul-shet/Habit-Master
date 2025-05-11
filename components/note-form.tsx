"use client"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useAppData } from "@/lib/app-data-context"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const noteSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  content: z.string().min(1, {
    message: "Content cannot be empty.",
  }),
  category: z.enum(["general", "unique", "project"], {
    required_error: "Please select a category.",
  }),
  projectId: z.string().optional(),
  color: z.string().default("yellow"),
})

const noteColors = [
  { value: "yellow", label: "Yellow", class: "bg-yellow-200" },
  { value: "blue", label: "Blue", class: "bg-blue-200" },
  { value: "green", label: "Green", class: "bg-green-200" },
  { value: "pink", label: "Pink", class: "bg-pink-200" },
  { value: "purple", label: "Purple", class: "bg-purple-200" },
  { value: "orange", label: "Orange", class: "bg-orange-200" },
]

export function NoteForm({ note, onSuccess, projectId = undefined }) {
  const { addNote, updateNote, projects } = useAppData()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: note?.title || "",
      content: note?.content || "",
      category: note?.category || (projectId ? "project" : "general"),
      projectId: note?.projectId || projectId || "",
      color: note?.color || "yellow",
    },
  })

  const watchCategory = form.watch("category")

  function onSubmit(data) {
    setIsSubmitting(true)

    try {
      if (note) {
        updateNote(note.id, data)
        toast({
          title: "Note updated",
          description: "Your note has been updated successfully.",
        })
      } else {
        addNote(data)
        toast({
          title: "Note created",
          description: "Your new note has been created successfully.",
        })
      }

      if (onSuccess) {
        onSuccess()
      }

      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error saving your note.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Note title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea placeholder="Write your note here..." className="min-h-[150px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap gap-2">
                  {noteColors.map((color) => (
                    <FormItem key={color.value} className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value={color.value} id={color.value} className="sr-only" />
                      </FormControl>
                      <label
                        htmlFor={color.value}
                        className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                          field.value === color.value ? "border-black dark:border-white" : "border-transparent"
                        } ${color.class}`}
                      />
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!projectId}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="unique">Unique Records</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Categorize your note for better organization</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchCategory === "project" && !projectId && (
          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Attach this note to a project</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
        >
          {isSubmitting ? "Saving..." : note ? "Update Note" : "Create Note"}
        </Button>
      </form>
    </Form>
  )
}
