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

const teamMemberSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  role: z.string().optional(),
})

export function TeamMemberForm({ projectId, member, onSuccess }) {
  const { addTeamMember, updateTeamMember, removeTeamMember } = useAppData()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: member?.name || "",
      role: member?.role || "",
    },
  })

  function onSubmit(data) {
    setIsSubmitting(true)

    try {
      if (member) {
        updateTeamMember(projectId, member.id, data)
        toast({
          title: "Team member updated",
          description: "Team member has been updated successfully.",
        })
      } else {
        addTeamMember(projectId, data)
        toast({
          title: "Team member added",
          description: "New team member has been added successfully.",
        })
      }

      if (onSuccess) {
        onSuccess()
      }

      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error saving the team member.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleDelete() {
    if (member) {
      removeTeamMember(projectId, member.id)
      toast({
        title: "Team member removed",
        description: "Team member has been removed successfully.",
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
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., John Doe" {...field} />
              </FormControl>
              <FormDescription>Enter the team member's name</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Developer" {...field} />
              </FormControl>
              <FormDescription>Specify the team member's role in this project</FormDescription>
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
            {isSubmitting ? "Saving..." : member ? "Update Member" : "Add Member"}
          </Button>

          {member && (
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Remove
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
