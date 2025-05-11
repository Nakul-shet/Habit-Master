"use client"

import { useState } from "react"
import { CheckCircle, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { StageCompletionModal } from "@/components/stage-completion-modal"

interface MultiStepProgressProps {
  steps: {
    id: string
    name: string
    completed: boolean
    points: number
    order: number
    comments?: string
    completedAt?: string
  }[]
  onToggleStep: (id: string, comments?: string) => void
  className?: string
}

export function MultiStepProgress({ steps, onToggleStep, className }: MultiStepProgressProps) {
  const [completionModalOpen, setCompletionModalOpen] = useState(false)
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null)
  const [selectedStageName, setSelectedStageName] = useState<string>("")

  if (!steps.length) {
    return (
      <div className="text-center py-4 border rounded-lg">
        <p className="text-muted-foreground">No stages defined for this project.</p>
      </div>
    )
  }

  // Sort steps by order
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order)

  // Calculate progress percentage
  const completedSteps = steps.filter((step) => step.completed).length
  const progressPercentage = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0

  const handleStageClick = (step) => {
    if (!step.completed) {
      setSelectedStageId(step.id)
      setSelectedStageName(step.name)
      setCompletionModalOpen(true)
    } else {
      // If already completed, toggle directly
      onToggleStep(step.id)
    }
  }

  const handleConfirmCompletion = (comments: string) => {
    if (selectedStageId) {
      onToggleStep(selectedStageId, comments)
      setSelectedStageId(null)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        {/* Progress bar background */}
        <div className="absolute top-4 left-0 w-full h-1 bg-muted rounded-full" />

        {/* Progress bar fill */}
        <div
          className="absolute top-4 left-0 h-1 bg-primary rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          <TooltipProvider>
            {sortedSteps.map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8 rounded-full border-2 transition-colors duration-200",
                        step.completed
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-background border-muted-foreground/50",
                      )}
                      onClick={() => handleStageClick(step)}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-center">
                      <p className="font-medium">{step.name}</p>
                      <p className="text-xs text-muted-foreground">{step.points} points</p>
                      <p className="text-xs">{step.completed ? "Completed" : "Not completed"}</p>
                      {step.comments && (
                        <p className="text-xs mt-1 max-w-[200px] whitespace-normal break-words">"{step.comments}"</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
                <div className="mt-2 text-center max-w-[100px] text-xs">
                  <span className="line-clamp-2">{step.name}</span>
                </div>
              </div>
            ))}
          </TooltipProvider>
        </div>
      </div>

      <div className="text-right text-sm">
        <span className="font-medium">{completedSteps}</span> of <span className="font-medium">{steps.length}</span>{" "}
        stages completed
      </div>

      <StageCompletionModal
        isOpen={completionModalOpen}
        onClose={() => setCompletionModalOpen(false)}
        onConfirm={handleConfirmCompletion}
        stageName={selectedStageName}
      />
    </div>
  )
}
