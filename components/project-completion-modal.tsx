"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Trophy } from "lucide-react"

interface ProjectCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (notes: string) => void
  projectName: string
  totalPoints: number
}

export function ProjectCompletionModal({
  isOpen,
  onClose,
  onConfirm,
  projectName,
  totalPoints,
}: ProjectCompletionModalProps) {
  const [notes, setNotes] = useState("")

  const handleConfirm = () => {
    onConfirm(notes)
    setNotes("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-full">
              <Trophy className="h-8 w-8 text-amber-600 dark:text-amber-300" />
            </div>
          </div>
          <DialogTitle className="text-center">Project Complete: {projectName}</DialogTitle>
          <DialogDescription className="text-center">
            Congratulations! You've completed all stages of this project.
            <div className="mt-2 font-semibold text-amber-600 dark:text-amber-400">
              Total Points Earned: {totalPoints}
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Completion Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any final thoughts or lessons learned from this project..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Not Yet Complete
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
          >
            Mark as Complete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
