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

interface StageCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (comments: string) => void
  stageName: string
}

export function StageCompletionModal({ isOpen, onClose, onConfirm, stageName }: StageCompletionModalProps) {
  const [comments, setComments] = useState("")

  const handleConfirm = () => {
    onConfirm(comments)
    setComments("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Stage: {stageName}</DialogTitle>
          <DialogDescription>Add any comments or notes about completing this stage.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="comments">Comments</Label>
            <Textarea
              id="comments"
              placeholder="Enter any details about this completion..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Mark as Complete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
