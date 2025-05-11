"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import {
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  Edit,
  Layers,
  Plus,
  Tag,
  Trash,
  Users,
  BarChart3,
  Archive,
} from "lucide-react"
import { useAppData } from "@/lib/app-data-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
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
import { ProjectForm } from "@/components/project-form"
import { ProjectStageForm } from "@/components/project-stage-form"
import { MultiStepProgress } from "@/components/multi-step-progress"
import { ProjectTodoForm } from "@/components/project-todo-form"
import { ProjectSubtaskForm } from "@/components/project-subtask-form"
import { TeamMemberForm } from "@/components/team-member-form"
import { ProjectCompletionModal } from "@/components/project-completion-modal"
import { ProjectStatistics } from "@/components/project-statistics"

export default function ProjectsPage() {
  const {
    projects,
    toggleProjectStage,
    deleteProject,
    toggleProjectTodo,
    deleteProjectTodo,
    toggleProjectTodoSubtask,
    deleteProjectTodoSubtask,
    calculateProjectPoints,
    completeProject,
  } = useAppData()

  const [open, setOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [addStageDialogOpen, setAddStageDialogOpen] = useState(false)
  const [addTodoDialogOpen, setAddTodoDialogOpen] = useState(false)
  const [editTodoDialogOpen, setEditTodoDialogOpen] = useState(false)
  const [selectedTodo, setSelectedTodo] = useState(null)
  const [addSubtaskDialogOpen, setAddSubtaskDialogOpen] = useState(false)
  const [selectedSubtask, setSelectedSubtask] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [teamDialogOpen, setTeamDialogOpen] = useState(false)
  const [selectedTeamMember, setSelectedTeamMember] = useState(null)
  const [completionModalOpen, setCompletionModalOpen] = useState(false)
  const [projectToComplete, setProjectToComplete] = useState(null)
  const [projectPoints, setProjectPoints] = useState(0)
  const [activeTab, setActiveTab] = useState("projects")
  const [showCompleted, setShowCompleted] = useState(false)

  // Filter active and completed projects
  const activeProjects = projects.filter((p) => !p.isCompleted)
  const completedProjects = projects.filter((p) => p.isCompleted)

  // Force re-render when projects change
  const [, setForceUpdate] = useState(0)

  useEffect(() => {
    // Force re-render when projects change
    setForceUpdate((prev) => prev + 1)
  }, [projects])

  // Check if any project has reached 100% and show completion modal
  useEffect(() => {
    const projectAt100 = projects.find((p) => p.progress === 100 && !p.isCompleted)
    if (projectAt100) {
      setProjectToComplete(projectAt100)
      setProjectPoints(calculateProjectPoints(projectAt100))
      setCompletionModalOpen(true)
    }
  }, [projects, calculateProjectPoints])

  const handleSelectProject = (project) => {
    setSelectedProject(project)
  }

  const handleDelete = (project) => {
    setProjectToDelete(project)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id)
      if (selectedProject?.id === projectToDelete.id) {
        setSelectedProject(null)
      }
      setDeleteDialogOpen(false)
      setProjectToDelete(null)
    }
  }

  const handleEditTodo = (todo) => {
    setSelectedTodo(todo)
    setEditTodoDialogOpen(true)
  }

  const handleAddSubtask = (todo) => {
    setSelectedTodo(todo)
    setAddSubtaskDialogOpen(true)
  }

  const handleEditSubtask = (todo, subtask) => {
    setSelectedTodo(todo)
    setSelectedSubtask(subtask)
    setAddSubtaskDialogOpen(true)
  }

  const handleToggleProjectStage = (projectId, stageId, comments) => {
    toggleProjectStage(projectId, stageId, comments)

    // Update the selected project to reflect changes immediately
    if (selectedProject && selectedProject.id === projectId) {
      const updatedProject = projects.find((p) => p.id === projectId)
      if (updatedProject) {
        setSelectedProject(updatedProject)
      }
    }
  }

  const handleToggleProjectTodo = (projectId, todoId) => {
    toggleProjectTodo(projectId, todoId)

    // Update the selected project to reflect changes immediately
    if (selectedProject && selectedProject.id === projectId) {
      const updatedProject = projects.find((p) => p.id === projectId)
      if (updatedProject) {
        setSelectedProject(updatedProject)
      }
    }
  }

  const handleCompleteProject = (notes) => {
    if (projectToComplete) {
      completeProject(projectToComplete.id, notes)
      setCompletionModalOpen(false)
      setProjectToComplete(null)

      // If the completed project was selected, deselect it
      if (selectedProject?.id === projectToComplete.id) {
        setSelectedProject(null)
      }
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "medium":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  // Update selected project when projects change
  useEffect(() => {
    if (selectedProject) {
      const updatedProject = projects.find((p) => p.id === selectedProject.id)
      if (updatedProject) {
        setSelectedProject(updatedProject)
      }
    }
  }, [projects, selectedProject])

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <DashboardHeader />

      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Projects</h1>
          <div className="flex gap-2">
            <Button
              variant={activeTab === "statistics" ? "default" : "outline"}
              onClick={() => setActiveTab("statistics")}
              className={activeTab === "statistics" ? "bg-gradient-to-r from-purple-600 to-indigo-600" : ""}
            >
              <BarChart3 className="mr-2 h-4 w-4" /> Statistics
            </Button>
            <Button
              variant={activeTab === "projects" ? "default" : "outline"}
              onClick={() => setActiveTab("projects")}
              className={activeTab === "projects" ? "bg-gradient-to-r from-purple-600 to-indigo-600" : ""}
            >
              <Layers className="mr-2 h-4 w-4" /> Projects
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <Button
                onClick={() => setOpen(true)}
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Project
              </Button>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Project</DialogTitle>
                  <DialogDescription>Create a new project to track your progress.</DialogDescription>
                </DialogHeader>
                <ProjectForm onSuccess={() => setOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {activeTab === "statistics" ? (
          <ProjectStatistics />
        ) : (
          <div className="grid md:grid-cols-[300px_1fr] gap-6">
            {/* Project List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Projects</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="flex items-center gap-1"
                >
                  <Archive className="h-4 w-4" />
                  {showCompleted ? "Show Active" : "Show Completed"}
                </Button>
              </div>

              {showCompleted ? (
                completedProjects.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg p-4">
                    <p className="text-muted-foreground">You haven't completed any projects yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {completedProjects.map((project) => (
                      <Card
                        key={project.id}
                        className={`cursor-pointer hover:border-primary transition-colors ${
                          selectedProject?.id === project.id ? "border-primary" : ""
                        } opacity-70`}
                        onClick={() => handleSelectProject(project)}
                      >
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">
                              {project.name}
                              <span className="ml-2 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-2 py-0.5 rounded-full">
                                Completed
                              </span>
                            </CardTitle>
                            <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                          </div>
                          <CardDescription className="text-xs flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(project.completedAt || project.updatedAt), "MMM d, yyyy")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <Progress value={100} className="h-2" />
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs">100% complete</p>
                            <p className="text-xs font-medium">{calculateProjectPoints(project)} pts</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )
              ) : activeProjects.length === 0 ? (
                <div className="text-center py-8 border rounded-lg p-4">
                  <p className="text-muted-foreground">You haven't created any projects yet.</p>
                  <Button
                    onClick={() => setOpen(true)}
                    className="mt-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Your First Project
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeProjects.map((project) => (
                    <Card
                      key={project.id}
                      className={`cursor-pointer hover:border-primary transition-colors ${
                        selectedProject?.id === project.id ? "border-primary" : ""
                      }`}
                      onClick={() => handleSelectProject(project)}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{project.name}</CardTitle>
                          <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                        </div>
                        <CardDescription className="text-xs flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(project.updatedAt), "MMM d, yyyy")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <Progress value={project.progress} className="h-2" />
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs">{project.progress}% complete</p>
                          <p className="text-xs font-medium">{calculateProjectPoints(project)} pts</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Project Details */}
            {selectedProject ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle>{selectedProject.name}</CardTitle>
                        <Badge className={getPriorityColor(selectedProject.priority)}>{selectedProject.priority}</Badge>
                        {selectedProject.isCompleted && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            Completed
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="flex flex-wrap gap-2 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Created on {format(new Date(selectedProject.createdAt), "MMMM d, yyyy")}
                        </span>
                        {selectedProject.deadline && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Due by {format(new Date(selectedProject.deadline), "MMMM d, yyyy")}
                          </span>
                        )}
                        {selectedProject.team?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {selectedProject.team.length} team member{selectedProject.team.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </CardDescription>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedProject.tags &&
                          selectedProject.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {tag}
                            </Badge>
                          ))}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Dialog>
                        <Button
                          onClick={() => {
                            // Open a dialog to edit the project
                            const editDialog = document.getElementById("edit-project-dialog")
                            if (editDialog) {
                              editDialog.click()
                            }
                          }}
                          variant="outline"
                          size="sm"
                          disabled={selectedProject.isCompleted}
                        >
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <DialogTrigger id="edit-project-dialog" className="hidden" />
                        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Project</DialogTitle>
                            <DialogDescription>Make changes to your project.</DialogDescription>
                          </DialogHeader>
                          <ProjectForm project={selectedProject} onSuccess={() => {}} />
                        </DialogContent>
                      </Dialog>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedProject)}>
                        <Trash className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-muted-foreground mb-4">{selectedProject.description}</p>

                    {/* Project Points */}
                    <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md mb-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Project Points</h3>
                        <p className="text-sm text-muted-foreground">Points earned from this project</p>
                      </div>
                      <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        {calculateProjectPoints(selectedProject)}
                      </div>
                    </div>

                    {/* Additional Project Details */}
                    {(selectedProject.requirements || selectedProject.additionalDetails) && (
                      <div className="mt-6 space-y-4">
                        {selectedProject.requirements && (
                          <div>
                            <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                            <div className="bg-muted/30 p-4 rounded-md whitespace-pre-wrap">
                              {selectedProject.requirements}
                            </div>
                          </div>
                        )}

                        {selectedProject.additionalDetails && (
                          <div>
                            <h3 className="text-lg font-semibold mb-2">Additional Details</h3>
                            <div className="bg-muted/30 p-4 rounded-md whitespace-pre-wrap">
                              {selectedProject.additionalDetails}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Tabs defaultValue="stages">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="stages">Progress Stages</TabsTrigger>
                      <TabsTrigger value="todos">To-Do List</TabsTrigger>
                      <TabsTrigger value="team">Team</TabsTrigger>
                    </TabsList>

                    <TabsContent value="stages" className="mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Project Stages</h3>
                        <Dialog open={addStageDialogOpen} onOpenChange={setAddStageDialogOpen}>
                          <Button
                            onClick={() => setAddStageDialogOpen(true)}
                            size="sm"
                            variant="outline"
                            disabled={selectedProject.isCompleted}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add Stage
                          </Button>
                          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Add Project Stage</DialogTitle>
                              <DialogDescription>Create a new stage for your project.</DialogDescription>
                            </DialogHeader>
                            <ProjectStageForm
                              projectId={selectedProject.id}
                              onSuccess={() => setAddStageDialogOpen(false)}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>

                      {selectedProject.stages.length === 0 ? (
                        <div className="text-center py-4 border rounded-lg">
                          <p className="text-muted-foreground">No stages defined for this project.</p>
                          <Button
                            onClick={() => setAddStageDialogOpen(true)}
                            className="mt-2"
                            variant="outline"
                            size="sm"
                            disabled={selectedProject.isCompleted}
                          >
                            <Plus className="mr-1 h-4 w-4" /> Add First Stage
                          </Button>
                        </div>
                      ) : (
                        <MultiStepProgress
                          steps={selectedProject.stages}
                          onToggleStep={(stageId, comments) =>
                            handleToggleProjectStage(selectedProject.id, stageId, comments)
                          }
                        />
                      )}
                    </TabsContent>

                    <TabsContent value="todos" className="mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">To-Do List</h3>
                        <Dialog open={addTodoDialogOpen} onOpenChange={setAddTodoDialogOpen}>
                          <Button
                            onClick={() => setAddTodoDialogOpen(true)}
                            size="sm"
                            variant="outline"
                            disabled={selectedProject.isCompleted}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add To-Do
                          </Button>
                          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Add To-Do</DialogTitle>
                              <DialogDescription>Create a new to-do item for your project.</DialogDescription>
                            </DialogHeader>
                            <ProjectTodoForm
                              projectId={selectedProject.id}
                              onSuccess={() => setAddTodoDialogOpen(false)}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>

                      {selectedProject.todos?.length === 0 ? (
                        <div className="text-center py-4 border rounded-lg">
                          <p className="text-muted-foreground">No to-do items for this project.</p>
                          <Button
                            onClick={() => setAddTodoDialogOpen(true)}
                            className="mt-2"
                            variant="outline"
                            size="sm"
                            disabled={selectedProject.isCompleted}
                          >
                            <Plus className="mr-1 h-4 w-4" /> Add First To-Do
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {selectedProject.todos?.map((todo) => (
                            <div key={todo.id} className="border rounded-lg">
                              <div className="flex items-center justify-between p-3 border-b">
                                <div className="flex items-center">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full h-8 w-8 mr-2"
                                    onClick={() => handleToggleProjectTodo(selectedProject.id, todo.id)}
                                    disabled={selectedProject.isCompleted}
                                  >
                                    {todo.completed ? (
                                      <CheckCircle className="h-5 w-5 text-green-500" />
                                    ) : (
                                      <Circle className="h-5 w-5 text-muted-foreground" />
                                    )}
                                  </Button>
                                  <span
                                    className={todo.completed ? "line-through text-muted-foreground" : "font-medium"}
                                  >
                                    {todo.name}
                                  </span>
                                </div>
                                <div className="flex space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleAddSubtask(todo)}
                                    disabled={selectedProject.isCompleted}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleEditTodo(todo)}
                                    disabled={selectedProject.isCompleted}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive"
                                    onClick={() => deleteProjectTodo(selectedProject.id, todo.id)}
                                    disabled={selectedProject.isCompleted}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              {todo.subtasks.length > 0 && (
                                <div className="p-2 pl-10 space-y-2">
                                  {todo.subtasks.map((subtask) => (
                                    <div
                                      key={subtask.id}
                                      className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                                    >
                                      <div className="flex items-center">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="rounded-full h-6 w-6 mr-2"
                                          onClick={() =>
                                            toggleProjectTodoSubtask(selectedProject.id, todo.id, subtask.id)
                                          }
                                          disabled={selectedProject.isCompleted}
                                        >
                                          {subtask.completed ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                          ) : (
                                            <Circle className="h-4 w-4 text-muted-foreground" />
                                          )}
                                        </Button>
                                        <span
                                          className={
                                            subtask.completed ? "line-through text-muted-foreground text-sm" : "text-sm"
                                          }
                                        >
                                          {subtask.name}
                                        </span>
                                      </div>
                                      <div className="flex space-x-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() => handleEditSubtask(todo, subtask)}
                                          disabled={selectedProject.isCompleted}
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 text-destructive"
                                          onClick={() =>
                                            deleteProjectTodoSubtask(selectedProject.id, todo.id, subtask.id)
                                          }
                                          disabled={selectedProject.isCompleted}
                                        >
                                          <Trash className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="team" className="mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Team Members</h3>
                        <Dialog
                          open={teamDialogOpen}
                          onOpenChange={(open) => {
                            setTeamDialogOpen(open)
                            if (!open) setSelectedTeamMember(null)
                          }}
                        >
                          <Button
                            onClick={() => setTeamDialogOpen(true)}
                            size="sm"
                            variant="outline"
                            disabled={selectedProject.isCompleted}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add Team Member
                          </Button>
                          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{selectedTeamMember ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
                              <DialogDescription>
                                {selectedTeamMember
                                  ? "Update team member details."
                                  : "Add a new team member to your project."}
                              </DialogDescription>
                            </DialogHeader>
                            <TeamMemberForm
                              projectId={selectedProject?.id}
                              member={selectedTeamMember}
                              onSuccess={() => {
                                setTeamDialogOpen(false)
                                setSelectedTeamMember(null)
                              }}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>

                      {selectedProject.team?.length === 0 ? (
                        <div className="text-center py-4 border rounded-lg">
                          <p className="text-muted-foreground">No team members added to this project.</p>
                          <Button
                            onClick={() => setTeamDialogOpen(true)}
                            className="mt-2"
                            variant="outline"
                            size="sm"
                            disabled={selectedProject.isCompleted}
                          >
                            <Plus className="mr-1 h-4 w-4" /> Add First Team Member
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {selectedProject.team?.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border">
                              <div>
                                <h4 className="font-medium">{member.name}</h4>
                                {member.role && <p className="text-sm text-muted-foreground">{member.role}</p>}
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTeamMember(member)
                                    setTeamDialogOpen(true)
                                  }}
                                  disabled={selectedProject.isCompleted}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No Project Selected</h3>
                    <p className="text-muted-foreground">Select a project from the list or create a new one</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      <Dialog open={editTodoDialogOpen} onOpenChange={setEditTodoDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit To-Do</DialogTitle>
            <DialogDescription>Make changes to your to-do item.</DialogDescription>
          </DialogHeader>
          {selectedTodo && (
            <ProjectTodoForm
              projectId={selectedProject?.id}
              todo={selectedTodo}
              onSuccess={() => {
                setEditTodoDialogOpen(false)
                setSelectedTodo(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={addSubtaskDialogOpen} onOpenChange={setAddSubtaskDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSubtask ? "Edit Subtask" : "Add Subtask"}</DialogTitle>
            <DialogDescription>
              {selectedSubtask ? "Make changes to your subtask." : `Add a subtask to "${selectedTodo?.name}"`}
            </DialogDescription>
          </DialogHeader>
          {selectedTodo && (
            <ProjectSubtaskForm
              projectId={selectedProject?.id}
              todoId={selectedTodo?.id}
              subtask={selectedSubtask}
              onSuccess={() => {
                setAddSubtaskDialogOpen(false)
                setSelectedTodo(null)
                setSelectedSubtask(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project "{projectToDelete?.name}" and all associated data. This action
              cannot be undone.
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

      <ProjectCompletionModal
        isOpen={completionModalOpen}
        onClose={() => setCompletionModalOpen(false)}
        onConfirm={handleCompleteProject}
        projectName={projectToComplete?.name || ""}
        totalPoints={projectPoints}
      />
    </div>
  )
}
