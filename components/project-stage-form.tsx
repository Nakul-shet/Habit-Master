"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useAppData } from "@/lib/app-data-context"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/components/ui/use-toast"

const stageSchema = z.object({
  name: z.string().min(2, {
    message: "Stage name must be at least 2 characters.",
  }),
  points: z.number().min(1).max(100),
})

export function ProjectStageForm({ projectId, stage, onSuccess }) {
  const { addProjectStage, updateProjectStage, deleteProjectStage, settings } = useAppData()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(stageSchema),
    defaultValues: {
      name: stage?.name || "",
      points: stage?.points || settings.pointsPerProjectStage,
    },
  })

  function onSubmit(data) {
    setIsSubmitting(true)

    try {
      if (stage) {
        updateProjectStage(projectId, stage.id, data)
        toast({
          title: "Stage updated",
          description: "Your project stage has been updated successfully.",
        })
      } else {
        addProjectStage(projectId, data)
        toast({
          title: "Stage created",
          description: "Your new project stage has been created successfully.",
        })
      }

      if (onSuccess) {
        onSuccess()
      }

      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error saving your project stage.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleDelete() {
    if (stage) {
      deleteProjectStage(projectId, stage.id)
      toast({
        title: "Stage deleted",
        description: "Your project stage has been deleted successfully.",
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
              <FormLabel>Stage Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Research Phase" {...field} />
              </FormControl>
              <FormDescription>Name this stage of your project</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="points"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Points for Completion</FormLabel>
              <FormControl>
                <div className="flex flex-col space-y-2">
                  <Slider
                    min={1}
                    max={100}
                    step={1}
                    defaultValue={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">1</span>
                    <span className="text-sm font-medium">{field.value} points</span>
                    <span className="text-sm text-muted-foreground">100</span>
                  </div>
                </div>
              </FormControl>
              <FormDescription>Points earned when this stage is completed</FormDescription>
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
            {isSubmitting ? "Saving..." : stage ? "Update Stage" : "Create Stage"}
          </Button>

          {stage && (
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
