"use client"

import { useState } from "react"
import { format } from "date-fns"
import { BookOpen, Edit, Eye, FileText, Plus, Trash } from "lucide-react"
import { useAppData } from "@/lib/app-data-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { DashboardHeader } from "@/components/dashboard-header"
import { NoteForm } from "@/components/note-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Function to get background color class based on note color
const getNoteColorClass = (color) => {
  switch (color) {
    case "yellow":
      return "bg-yellow-100 dark:bg-yellow-900/30"
    case "blue":
      return "bg-blue-100 dark:bg-blue-900/30"
    case "green":
      return "bg-green-100 dark:bg-green-900/30"
    case "pink":
      return "bg-pink-100 dark:bg-pink-900/30"
    case "purple":
      return "bg-purple-100 dark:bg-purple-900/30"
    case "orange":
      return "bg-orange-100 dark:bg-orange-900/30"
    default:
      return "bg-yellow-100 dark:bg-yellow-900/30"
  }
}

export default function NotesPage() {
  const { notes, deleteNote } = useAppData()
  const [open, setOpen] = useState(false)
  const [editNote, setEditNote] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState(null)
  const [viewNoteDialogOpen, setViewNoteDialogOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState(null)

  // Filter notes by category
  const generalNotes = notes.filter((note) => note.category === "general")
  const uniqueNotes = notes.filter((note) => note.category === "unique")
  const projectNotes = notes.filter((note) => note.category === "project")

  const handleEdit = (note) => {
    setEditNote(note)
  }

  const handleDelete = (note) => {
    setNoteToDelete(note)
    setDeleteDialogOpen(true)
  }

  const handleViewNote = (note) => {
    setSelectedNote(note)
    setViewNoteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (noteToDelete) {
      deleteNote(noteToDelete.id)
      setDeleteDialogOpen(false)
      setNoteToDelete(null)
    }
  }

  const renderNoteCard = (note) => {
    const colorClass = getNoteColorClass(note.color || "yellow")

    return (
      <div
        key={note.id}
        className={`${colorClass} h-[220px] flex flex-col rounded-md shadow-md p-4 transform transition-transform hover:-translate-y-1 hover:shadow-lg`}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg truncate">{note.title}</h3>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(note)}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(note)}>
              <Trash className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-2">{format(new Date(note.updatedAt), "MMM d, yyyy")}</p>
        <div className="flex-grow overflow-hidden">
          <p className="line-clamp-4 whitespace-pre-wrap text-sm">{note.content}</p>
        </div>
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs">
            {note.category === "project" && (
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-2 py-0.5 rounded-full">
                Project
              </span>
            )}
            {note.category === "unique" && (
              <span className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 px-2 py-0.5 rounded-full">
                Unique
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => handleViewNote(note)} className="flex items-center">
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <DashboardHeader />

      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Notes</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <Button
              onClick={() => setOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Note
            </Button>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto my-4">
              <DialogHeader>
                <DialogTitle>Add New Note</DialogTitle>
                <DialogDescription>
                  Create a new note to capture your thoughts or important information.
                </DialogDescription>
              </DialogHeader>
              <NoteForm onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              General ({generalNotes.length})
            </TabsTrigger>
            <TabsTrigger value="unique" className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              Unique Records ({uniqueNotes.length})
            </TabsTrigger>
            <TabsTrigger value="project" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Project Notes ({projectNotes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-4">
            {generalNotes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You haven't created any general notes yet.</p>
                <Button
                  onClick={() => setOpen(true)}
                  className="mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Your First Note
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{generalNotes.map(renderNoteCard)}</div>
            )}
          </TabsContent>

          <TabsContent value="unique" className="mt-4">
            {uniqueNotes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You haven't created any unique records yet.</p>
                <Button
                  onClick={() => setOpen(true)}
                  className="mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Your First Unique Record
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{uniqueNotes.map(renderNoteCard)}</div>
            )}
          </TabsContent>

          <TabsContent value="project" className="mt-4">
            {projectNotes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You haven't created any project notes yet.</p>
                <Button
                  onClick={() => setOpen(true)}
                  className="mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Your First Project Note
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{projectNotes.map(renderNoteCard)}</div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={!!editNote} onOpenChange={(open) => !open && setEditNote(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto my-4">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>Make changes to your note.</DialogDescription>
          </DialogHeader>
          {editNote && <NoteForm note={editNote} onSuccess={() => setEditNote(null)} />}
        </DialogContent>
      </Dialog>

      <Dialog open={viewNoteDialogOpen} onOpenChange={setViewNoteDialogOpen}>
        <DialogContent
          className={`max-w-2xl max-h-[90vh] overflow-y-auto my-4 ${getNoteColorClass(selectedNote?.color || "yellow")}`}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{selectedNote?.title}</DialogTitle>
            <DialogDescription>
              {selectedNote && format(new Date(selectedNote.updatedAt), "MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto mt-4">
            {selectedNote && <div className="whitespace-pre-wrap">{selectedNote.content}</div>}
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={() => setViewNoteDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setViewNoteDialogOpen(false)
                handleEdit(selectedNote)
              }}
            >
              Edit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-h-[90vh] overflow-y-auto my-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the note "{noteToDelete?.title}". This action cannot be undone.
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
    </div>
  )
}
