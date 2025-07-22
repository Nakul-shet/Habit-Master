"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { formatDate } from "@/lib/utils"

// Define types
type Habit = {
  id: string
  name: string
  frequency: "daily" | "weekly" | "monthly"
  color: string
  history: { date: string; completed: boolean; failed?: boolean }[]
}

type TaskCategory = {
  id: string
  name: string
  icon: string
  color: string
}

type Task = {
  id: string
  name: string
  date: string
  completed: boolean
  incomplete?: boolean // NEW: mark as incomplete
  failed?: boolean // NEW: mark as failed
  remember?: boolean
  color?: string
  categoryId?: string
  priority?: "low" | "medium" | "high"
}

type Note = {
  id: string
  title: string
  content: string
  category: "general" | "unique" | "project"
  projectId?: string
  color?: string // Added color property
  createdAt: string
  updatedAt: string
}

type ProjectStage = {
  id: string
  name: string
  completed: boolean
  order: number
  points: number
  comments?: string
  completedAt?: string
}

type TeamMember = {
  id: string
  name: string
  role?: string
  assignedTasks?: string[] // IDs of todos assigned to this person
}

type ProjectTodoSubtask = {
  id: string
  name: string
  completed: boolean
}

type ProjectTodo = {
  id: string
  name: string
  completed: boolean
  subtasks: ProjectTodoSubtask[]
}

type Project = {
  id: string
  name: string
  description: string
  stages: ProjectStage[]
  todos: ProjectTodo[]
  progress: number
  deadline?: string
  priority: "low" | "medium" | "high"
  tags: string[]
  team: TeamMember[]
  requirements?: string
  techStack?: string[]
  additionalDetails?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  isCompleted?: boolean
  completionNotes?: string
  totalPoints?: number
}

type CompletedProject = {
  id: string
  originalProjectId: string
  name: string
  description: string
  progress: number
  priority: "low" | "medium" | "high"
  tags: string[]
  completedAt: string
  completionNotes?: string
  totalPoints: number
  totalStages: number
  totalTodos: number
  deadline?: string
  duration: number // days from creation to completion
}

type BadgeRank =
  | "bronze3"
  | "bronze2"
  | "bronze1"
  | "silver3"
  | "silver2"
  | "silver1"
  | "gold3"
  | "gold2"
  | "gold1"
  | "diamond"
  | "platinum"
  | "ruby"

type Settings = {
  pointsPerHabit: number
  pointsPerTask: number
  pointsPerProjectStage: number
  levelThresholds: number[]
  theme: "light" | "dark" | "gradient"
}

type AppDataContextType = {
  habits: Habit[]
  tasks: Task[]
  notes: Note[]
  projects: Project[]
  completedProjects: CompletedProject[]
  settings: Settings
  badge: BadgeRank
  uniqueRecords: Task[]
  taskCategories: TaskCategory[]
  addHabit: (habit: Omit<Habit, "id" | "history">) => void
  updateHabit: (id: string, habit: Partial<Omit<Habit, "id" | "history">>) => void
  deleteHabit: (id: string) => void
  toggleHabitCompletion: (id: string, date: string) => void
  addTask: (task: Omit<Task, "id" | "completed">) => void
  updateTask: (id: string, task: Partial<Omit<Task, "id">>) => void
  deleteTask: (id: string) => void
  toggleTaskCompletion: (id: string) => void
  toggleTaskIncomplete: (id: string) => void // NEW
  toggleTaskFailed: (id: string) => void // NEW
  addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => void
  updateNote: (id: string, note: Partial<Omit<Note, "id" | "createdAt" | "updatedAt">>) => void
  deleteNote: (id: string) => void
  addProject: (
    project: Omit<Project, "id" | "stages" | "todos" | "progress" | "createdAt" | "updatedAt" | "team" | "techStack">,
  ) => void
  updateProject: (
    id: string,
    project: Partial<Omit<Project, "id" | "stages" | "todos" | "progress" | "createdAt" | "updatedAt">>,
  ) => void
  deleteProject: (id: string) => void
  addProjectStage: (projectId: string, stage: Omit<ProjectStage, "id" | "completed" | "order">) => void
  updateProjectStage: (projectId: string, stageId: string, stage: Partial<Omit<ProjectStage, "id" | "order">>) => void
  deleteProjectStage: (projectId: string, stageId: string) => void
  toggleProjectStage: (projectId: string, stageId: string, comments?: string) => void
  addProjectTodo: (projectId: string, todo: Omit<ProjectTodo, "id" | "completed" | "subtasks">) => void
  updateProjectTodo: (projectId: string, todoId: string, todo: Partial<Omit<ProjectTodo, "id" | "subtasks">>) => void
  deleteProjectTodo: (projectId: string, todoId: string) => void
  toggleProjectTodo: (projectId: string, todoId: string) => void
  addProjectTodoSubtask: (
    projectId: string,
    todoId: string,
    subtask: Omit<ProjectTodoSubtask, "id" | "completed">,
  ) => void
  updateProjectTodoSubtask: (
    projectId: string,
    todoId: string,
    subtaskId: string,
    subtask: Partial<Omit<ProjectTodoSubtask, "id">>,
  ) => void
  deleteProjectTodoSubtask: (projectId: string, todoId: string, subtaskId: string) => void
  toggleProjectTodoSubtask: (projectId: string, todoId: string, subtaskId: string) => void
  updateSettings: (settings: Partial<Settings>) => void
  calculateBadge: (points: number) => BadgeRank
  addTeamMember: (projectId: string, member: Omit<TeamMember, "id">) => void
  updateTeamMember: (projectId: string, memberId: string, memberData: Partial<Omit<TeamMember, "id">>) => void
  removeTeamMember: (projectId: string, memberId: string) => void
  completeProject: (projectId: string, completionNotes?: string) => void
  calculateProjectPoints: (project: Project) => number
  getProjectStatistics: () => {
    totalProjects: number
    completedProjects: number
    ongoingProjects: number
    totalPoints: number
    averageCompletion: number
    projectsByPriority: { priority: string; count: number }[]
    projectsByMonth: { month: string; count: number }[]
    averageDuration: number
  }
  toggleHabitFailed: (id: string, date: string) => void
  addTaskCategory: (category: Omit<TaskCategory, "id">) => void
  updateTaskCategory: (id: string, category: Partial<Omit<TaskCategory, "id">>) => void
  deleteTaskCategory: (id: string) => void
  getTaskCategory: (id: string) => TaskCategory | undefined
}

// Create context
const AppDataContext = createContext<AppDataContextType | undefined>(undefined)

// Default settings
const defaultSettings: Settings = {
  pointsPerHabit: 10,
  pointsPerTask: 5,
  pointsPerProjectStage: 20,
  levelThresholds: [100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000],
  theme: "light",
}

// Default task categories
const defaultTaskCategories: TaskCategory[] = [
  { id: "work", name: "Work", icon: "Briefcase", color: "#3b82f6" },
  { id: "personal", name: "Personal", icon: "User", color: "#10b981" },
  { id: "health", name: "Health", icon: "Heart", color: "#ef4444" },
  { id: "shopping", name: "Shopping", icon: "ShoppingCart", color: "#f59e0b" },
  { id: "education", name: "Education", icon: "GraduationCap", color: "#8b5cf6" },
]

export function AppDataProvider({ children, initialTheme = "light" }) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [completedProjects, setCompletedProjects] = useState<CompletedProject[]>([])
  const [taskCategories, setTaskCategories] = useState<TaskCategory[]>(defaultTaskCategories)
  const [settings, setSettings] = useState<Settings>({
    ...defaultSettings,
    theme: initialTheme as "light" | "dark" | "gradient",
  })
  const [badge, setBadge] = useState<BadgeRank>("bronze3")
  const [uniqueRecords, setUniqueRecords] = useState<Task[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const storedHabits = localStorage.getItem("habits")
        const storedTasks = localStorage.getItem("tasks")
        const storedNotes = localStorage.getItem("notes")
        const storedProjects = localStorage.getItem("projects")
        const storedCompletedProjects = localStorage.getItem("completedProjects")
        const storedSettings = localStorage.getItem("settings")
        const storedUniqueRecords = localStorage.getItem("uniqueRecords")
        const storedTaskCategories = localStorage.getItem("taskCategories")

        if (storedHabits) {
          setHabits(JSON.parse(storedHabits))
        }

        if (storedTasks) {
          setTasks(JSON.parse(storedTasks))
        }

        if (storedNotes) {
          setNotes(JSON.parse(storedNotes))
        }

        if (storedProjects) {
          const parsedProjects = JSON.parse(storedProjects)
          // Ensure all projects have the new fields
          const updatedProjects = parsedProjects.map((project) => ({
            ...project,
            todos: project.todos || [],
            priority: project.priority || "medium",
            tags: project.tags || [],
            team: project.team || [],
            techStack: project.techStack || [],
            isCompleted: project.isCompleted || false,
            // Ensure all stages have points
            stages: (project.stages || []).map((stage) => ({
              ...stage,
              points: stage.points || 20,
            })),
          }))
          setProjects(updatedProjects)
        }

        if (storedCompletedProjects) {
          setCompletedProjects(JSON.parse(storedCompletedProjects))
        }

        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings)
          setSettings({
            ...parsedSettings,
            pointsPerProjectStage: parsedSettings.pointsPerProjectStage || 20,
          })
        }

        if (storedUniqueRecords) {
          setUniqueRecords(JSON.parse(storedUniqueRecords))
        }

        if (storedTaskCategories) {
          setTaskCategories(JSON.parse(storedTaskCategories))
        }
      } catch (error) {
        console.error("Error loading data from localStorage:", error)
      } finally {
        setIsLoaded(true)
      }
    }

    loadData()
  }, [])

  // Calculate total points and badge
  useEffect(() => {
    if (!isLoaded) return

    // Calculate total points
    const habitPoints = habits.reduce((total, habit) => {
      const completedDays = habit.history.filter((h) => h.completed).length
      return total + completedDays * settings.pointsPerHabit
    }, 0)

    const taskPoints = tasks.reduce((total, task) => {
      return total + (task.completed ? settings.pointsPerTask : 0)
    }, 0)

    // Subtract 2 points for each failed task
    const failedTaskPenalty = tasks.reduce((total, task) => {
      return total + (task.failed ? 2 : 0)
    }, 0)

    // Calculate project stage points
    const projectPoints = projects.reduce((total, project) => {
      const stagePoints = project.stages.reduce((stageTotal, stage) => {
        return stageTotal + (stage.completed ? stage.points || settings.pointsPerProjectStage : 0)
      }, 0)
      return total + stagePoints
    }, 0)

    // Add completed project points
    const completedProjectPoints = completedProjects.reduce((total, project) => {
      return total + project.totalPoints
    }, 0)

    const totalPoints = habitPoints + taskPoints + projectPoints + completedProjectPoints - failedTaskPenalty

    // Calculate badge
    const newBadge = calculateBadge(totalPoints)
    setBadge(newBadge)
  }, [habits, tasks, projects, completedProjects, settings, isLoaded])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!isLoaded) return

    try {
      localStorage.setItem("habits", JSON.stringify(habits))
      localStorage.setItem("tasks", JSON.stringify(tasks))
      localStorage.setItem("notes", JSON.stringify(notes))
      localStorage.setItem("projects", JSON.stringify(projects))
      localStorage.setItem("completedProjects", JSON.stringify(completedProjects))
      localStorage.setItem("settings", JSON.stringify(settings))
      localStorage.setItem("uniqueRecords", JSON.stringify(uniqueRecords))
      localStorage.setItem("taskCategories", JSON.stringify(taskCategories))
    } catch (error) {
      console.error("Error saving data to localStorage:", error)
    }
  }, [habits, tasks, notes, projects, completedProjects, settings, uniqueRecords, taskCategories, isLoaded])

  // Badge calculation function
  const calculateBadge = (points: number): BadgeRank => {
    if (points < 100) return "bronze3"
    if (points < 250) return "bronze2"
    if (points < 500) return "bronze1"
    if (points < 750) return "silver3"
    if (points < 1000) return "silver2"
    if (points < 1500) return "silver1"
    if (points < 2000) return "gold3"
    if (points < 3000) return "gold2"
    if (points < 4000) return "gold1"
    if (points < 5000) return "diamond"
    if (points < 7500) return "platinum"
    return "ruby"
  }

  // Calculate total points for a project
  const calculateProjectPoints = (project: Project): number => {
    // Points from completed stages
    const stagePoints = project.stages.reduce((total, stage) => {
      return total + (stage.completed ? stage.points || settings.pointsPerProjectStage : 0)
    }, 0)

    // Points from completed todos
    const todoPoints = project.todos.reduce((total, todo) => {
      return total + (todo.completed ? settings.pointsPerTask : 0)
    }, 0)

    // Bonus points for project completion (20% of total stage points)
    const completionBonus = project.isCompleted ? Math.round(stagePoints * 0.2) : 0

    return stagePoints + todoPoints + completionBonus
  }

  // Get project statistics
  const getProjectStatistics = () => {
    const allProjects = [...projects, ...completedProjects.map((p) => ({ ...p, stages: [], todos: [] }) as Project)]

    const totalProjects = allProjects.length
    const ongoingProjects = projects.length
    const completedProjectsCount = completedProjects.length

    // Calculate total points from all projects
    const totalPoints = allProjects.reduce((total, project) => {
      if ("totalPoints" in project && project.totalPoints) {
        return total + project.totalPoints
      }
      return total + calculateProjectPoints(project)
    }, 0)

    // Calculate average completion percentage of ongoing projects
    const averageCompletion =
      projects.length > 0 ? projects.reduce((sum, project) => sum + project.progress, 0) / projects.length : 0

    // Group projects by priority
    const projectsByPriority = [
      { priority: "high", count: allProjects.filter((p) => p.priority === "high").length },
      { priority: "medium", count: allProjects.filter((p) => p.priority === "medium").length },
      { priority: "low", count: allProjects.filter((p) => p.priority === "low").length },
    ]

    // Group projects by month created
    const projectsByMonth: { month: string; count: number }[] = []
    const monthCounts = new Map<string, number>()

    allProjects.forEach((project) => {
      const date = new Date(project.createdAt)
      const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`

      const count = monthCounts.get(monthYear) || 0
      monthCounts.set(monthYear, count + 1)
    })

    // Convert map to array and sort by date
    Array.from(monthCounts.entries())
      .sort((a, b) => {
        const dateA = new Date(a[0])
        const dateB = new Date(b[0])
        return dateA.getTime() - dateB.getTime()
      })
      .forEach(([month, count]) => {
        projectsByMonth.push({ month, count })
      })

    // Calculate average duration of completed projects (in days)
    const averageDuration =
      completedProjects.length > 0
        ? completedProjects.reduce((sum, project) => sum + project.duration, 0) / completedProjects.length
        : 0

    return {
      totalProjects,
      completedProjects: completedProjectsCount,
      ongoingProjects,
      totalPoints,
      averageCompletion,
      projectsByPriority,
      projectsByMonth,
      averageDuration,
    }
  }

  // Complete a project and move it to completed projects
  const completeProject = (projectId: string, completionNotes?: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (!project) return

    // Calculate project duration in days
    const creationDate = new Date(project.createdAt)
    const completionDate = new Date()
    const durationMs = completionDate.getTime() - creationDate.getTime()
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24))

    // Calculate total points
    const totalPoints = calculateProjectPoints(project)

    // Create completed project record
    const completedProject: CompletedProject = {
      id: uuidv4(),
      originalProjectId: project.id,
      name: project.name,
      description: project.description,
      progress: 100,
      priority: project.priority,
      tags: project.tags,
      completedAt: completionDate.toISOString(),
      completionNotes,
      totalPoints,
      totalStages: project.stages.length,
      totalTodos: project.todos.length,
      deadline: project.deadline,
      duration: durationDays,
    }

    // Add to completed projects
    setCompletedProjects((prev) => [...prev, completedProject])

    // Update the original project
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            isCompleted: true,
            completedAt: completionDate.toISOString(),
            completionNotes,
            totalPoints,
            progress: 100,
          }
        }
        return p
      }),
    )
  }

  // Task Category functions
  const addTaskCategory = (category: Omit<TaskCategory, "id">) => {
    const newCategory: TaskCategory = {
      id: uuidv4(),
      ...category,
    }

    setTaskCategories((prev) => [...prev, newCategory])
  }

  const updateTaskCategory = (id: string, categoryData: Partial<Omit<TaskCategory, "id">>) => {
    setTaskCategories((prev) =>
      prev.map((category) => (category.id === id ? { ...category, ...categoryData } : category)),
    )
  }

  const deleteTaskCategory = (id: string) => {
    setTaskCategories((prev) => prev.filter((category) => category.id !== id))

    // Update tasks that use this category
    setTasks((prev) => prev.map((task) => (task.categoryId === id ? { ...task, categoryId: undefined } : task)))
  }

  const getTaskCategory = (id: string) => {
    return taskCategories.find((category) => category.id === id)
  }

  // Habit functions
  const addHabit = (habit: Omit<Habit, "id" | "history">) => {
    const today = formatDate(new Date())

    const newHabit: Habit = {
      id: uuidv4(),
      ...habit,
      history: [{ date: today, completed: false }],
    }

    setHabits((prev) => [...prev, newHabit])
  }

  const updateHabit = (id: string, habitData: Partial<Omit<Habit, "id" | "history">>) => {
    setHabits((prev) => prev.map((habit) => (habit.id === id ? { ...habit, ...habitData } : habit)))
  }

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== id))
  }

  const toggleHabitCompletion = (id: string, date: string) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== id) return habit

        // Check if there's already an entry for this date
        const existingEntryIndex = habit.history.findIndex((h) => h.date === date)

        if (existingEntryIndex >= 0) {
          // Toggle the existing entry
          const newHistory = [...habit.history]
          newHistory[existingEntryIndex] = {
            ...newHistory[existingEntryIndex],
            completed: !newHistory[existingEntryIndex].completed,
          }

          return { ...habit, history: newHistory }
        } else {
          // Add a new entry for this date
          return {
            ...habit,
            history: [...habit.history, { date, completed: true }],
          }
        }
      }),
    )
  }

  const toggleHabitFailed = (id: string, date: string) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== id) return habit

        // Check if there's already an entry for this date
        const existingEntryIndex = habit.history.findIndex((h) => h.date === date)

        if (existingEntryIndex >= 0) {
          // Toggle the failed status
          const newHistory = [...habit.history]
          newHistory[existingEntryIndex] = {
            ...newHistory[existingEntryIndex],
            failed: !newHistory[existingEntryIndex].failed,
            // If marking as failed, ensure it's not marked as completed
            completed: newHistory[existingEntryIndex].failed ? newHistory[existingEntryIndex].completed : false,
          }

          return { ...habit, history: newHistory }
        } else {
          // Add a new entry for this date
          return {
            ...habit,
            history: [...habit.history, { date, completed: false, failed: true }],
          }
        }
      }),
    )
  }

  // Task functions
  const addTask = (task: Omit<Task, "id" | "completed">) => {
    const newTask: Task = {
      id: uuidv4(),
      ...task,
      completed: false,
    }

    setTasks((prev) => [...prev, newTask])
  }

  const updateTask = (id: string, taskData: Partial<Omit<Task, "id">>) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task

        // Create a new task object with the updated data
        const updatedTask = { ...task, ...taskData }

        // Return the updated task
        return updatedTask
      }),
    )
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const toggleTaskCompletion = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task

        const newCompletedState = !task.completed

        // If task is being marked as completed and has remember flag
        if (newCompletedState && task.remember) {
          // Add to unique records
          setUniqueRecords((records) => [...records, { ...task, completed: true }])
        }

        return { ...task, completed: newCompletedState }
      }),
    )
  }

  const toggleTaskIncomplete = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task
        // Toggle incomplete state
        return { ...task, incomplete: !task.incomplete, completed: task.incomplete ? task.completed : false }
      })
    )
  }

  const toggleTaskFailed = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task
        // Toggle failed state, and ensure only one of completed/incomplete/failed is true
        const newFailedState = !task.failed
        return {
          ...task,
          failed: newFailedState,
          completed: newFailedState ? false : task.completed,
          incomplete: newFailedState ? false : task.incomplete,
        }
      })
    )
  }

  // Note functions
  const addNote = (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString()

    const newNote: Note = {
      id: uuidv4(),
      ...note,
      createdAt: now,
      updatedAt: now,
    }

    setNotes((prev) => [...prev, newNote])
  }

  const updateNote = (id: string, noteData: Partial<Omit<Note, "id" | "createdAt" | "updatedAt">>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? {
              ...note,
              ...noteData,
              updatedAt: new Date().toISOString(),
            }
          : note,
      ),
    )
  }

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
  }

  // Project functions
  const addProject = (
    project: Omit<Project, "id" | "stages" | "todos" | "progress" | "createdAt" | "updatedAt" | "team" | "techStack">,
  ) => {
    const now = new Date().toISOString()

    const newProject: Project = {
      id: uuidv4(),
      ...project,
      stages: [],
      todos: [],
      progress: 0,
      priority: project.priority || "medium",
      tags: project.tags || [],
      team: [],
      techStack: [],
      isCompleted: false,
      createdAt: now,
      updatedAt: now,
    }

    setProjects((prev) => [...prev, newProject])
  }

  const updateProject = (
    id: string,
    projectData: Partial<Omit<Project, "id" | "stages" | "todos" | "progress" | "createdAt" | "updatedAt">>,
  ) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === id
          ? {
              ...project,
              ...projectData,
              updatedAt: new Date().toISOString(),
            }
          : project,
      ),
    )
  }

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== id))

    // Also delete any notes associated with this project
    setNotes((prev) => prev.filter((note) => note.projectId !== id))
  }

  const addProjectStage = (projectId: string, stage: Omit<ProjectStage, "id" | "completed" | "order">) => {
    const newStageId = uuidv4()

    setProjects((prev) => {
      return prev.map((project) => {
        if (project.id !== projectId) return project

        const newStage: ProjectStage = {
          id: newStageId,
          ...stage,
          completed: false,
          order: project.stages.length,
          points: stage.points || settings.pointsPerProjectStage,
        }

        const updatedStages = [...project.stages, newStage]

        // Calculate progress immediately
        const totalStages = updatedStages.length
        const completedStages = updatedStages.filter((s) => s.completed).length
        const progress = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0

        return {
          ...project,
          stages: updatedStages,
          progress,
          updatedAt: new Date().toISOString(),
        }
      })
    })
  }

  const updateProjectStage = (
    projectId: string,
    stageId: string,
    stageData: Partial<Omit<ProjectStage, "id" | "order">>,
  ) => {
    setProjects((prev) => {
      return prev.map((project) => {
        if (project.id !== projectId) return project

        const updatedStages = project.stages.map((stage) => (stage.id === stageId ? { ...stage, ...stageData } : stage))

        // Calculate progress immediately
        const totalStages = updatedStages.length
        const completedStages = updatedStages.filter((s) => s.completed).length
        const progress = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0

        return {
          ...project,
          stages: updatedStages,
          progress,
          updatedAt: new Date().toISOString(),
        }
      })
    })
  }

  const deleteProjectStage = (projectId: string, stageId: string) => {
    setProjects((prev) => {
      return prev.map((project) => {
        if (project.id !== projectId) return project

        const filteredStages = project.stages
          .filter((stage) => stage.id !== stageId)
          .map((stage, index) => ({ ...stage, order: index }))

        // Calculate progress immediately
        const totalStages = filteredStages.length
        const completedStages = filteredStages.filter((s) => s.completed).length
        const progress = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0

        return {
          ...project,
          stages: filteredStages,
          progress,
          updatedAt: new Date().toISOString(),
        }
      })
    })
  }

  const toggleProjectStage = (projectId: string, stageId: string, comments?: string) => {
    setProjects((prev) => {
      return prev.map((project) => {
        if (project.id !== projectId) return project

        const updatedStages = project.stages.map((stage) => {
          if (stage.id === stageId) {
            const completed = !stage.completed
            return {
              ...stage,
              completed,
              comments: completed ? comments || stage.comments : stage.comments,
              completedAt: completed ? new Date().toISOString() : undefined,
            }
          }
          return stage
        })

        // Calculate progress immediately
        const totalStages = updatedStages.length
        const completedStages = updatedStages.filter((s) => s.completed).length
        const progress = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0

        return {
          ...project,
          stages: updatedStages,
          progress,
          updatedAt: new Date().toISOString(),
        }
      })
    })
  }

  // Project Todo functions
  const addProjectTodo = (projectId: string, todo: Omit<ProjectTodo, "id" | "completed" | "subtasks">) => {
    const newTodoId = uuidv4()

    setProjects((prev) => {
      return prev.map((project) => {
        if (project.id !== projectId) return project

        const newTodo: ProjectTodo = {
          id: newTodoId,
          ...todo,
          completed: false,
          subtasks: [],
        }

        return {
          ...project,
          todos: [...project.todos, newTodo],
          updatedAt: new Date().toISOString(),
        }
      })
    })
  }

  const updateProjectTodo = (
    projectId: string,
    todoId: string,
    todoData: Partial<Omit<ProjectTodo, "id" | "subtasks">>,
  ) => {
    setProjects((prev) => {
      return prev.map((project) => {
        if (project.id !== projectId) return project

        const updatedTodos = project.todos.map((todo) => (todo.id === todoId ? { ...todo, ...todoData } : todo))

        return {
          ...project,
          todos: updatedTodos,
          updatedAt: new Date().toISOString(),
        }
      })
    })
  }

  const deleteProjectTodo = (projectId: string, todoId: string) => {
    setProjects((prev) => {
      return prev.map((project) => {
        if (project.id !== projectId) return project

        const filteredTodos = project.todos.filter((todo) => todo.id !== todoId)

        return {
          ...project,
          todos: filteredTodos,
          updatedAt: new Date().toISOString(),
        }
      })
    })
  }

  const toggleProjectTodo = (projectId: string, todoId: string) => {
    setProjects((prev) => {
      return prev.map((project) => {
        if (project.id !== projectId) return project

        const updatedTodos = project.todos.map((todo) => {
          if (todo.id !== todoId) return todo

          // If marking as completed, also mark all subtasks as completed
          const newCompleted = !todo.completed
          const updatedSubtasks = newCompleted
            ? todo.subtasks.map((subtask) => ({ ...subtask, completed: true }))
            : todo.subtasks

          return {
            ...todo,
            completed: newCompleted,
            subtasks: updatedSubtasks,
          }
        })

        return {
          ...project,
          todos: updatedTodos,
          updatedAt: new Date().toISOString(),
        }
      })
    })
  }

  // Project Todo Subtask functions
  const addProjectTodoSubtask = (
    projectId: string,
    todoId: string,
    subtask: Omit<ProjectTodoSubtask, "id" | "completed">,
  ) => {
    const newSubtaskId = uuidv4()

    setProjects((prev) => {
      return prev.map((project) => {
        if (project.id !== projectId) return project

        const updatedTodos = project.todos.map((todo) => {
          if (todo.id !== todoId) return todo

          const newSubtask: ProjectTodoSubtask = {
            id: newSubtaskId,
            ...subtask,
            completed: false,
          }

          return {
            ...todo,
            subtasks: [...todo.subtasks, newSubtask],
          }
        })

        return {
          ...project,
          todos: updatedTodos,
          updatedAt: new Date().toISOString(),
        }
      })
    })
  }

  const updateProjectTodoSubtask = (
    projectId: string,
    todoId: string,
    subtaskId: string,
    subtaskData: Partial<Omit<ProjectTodoSubtask, "id">>,
  ) => {
    setProjects((prev) => {
      return prev.map((project) => {
        if (project.id !== projectId) return project

        const updatedTodos = project.todos.map((todo) => {
          if (todo.id !== todoId) return todo

          const updatedSubtasks = todo.subtasks.map((subtask) =>
            subtask.id === subtaskId ? { ...subtask, ...subtaskData } : subtask,
          )

          return {
            ...todo,
            subtasks: updatedSubtasks,
          }
        })

        return {
          ...project,
          todos: updatedTodos,
          updatedAt: new Date().toISOString(),
        }
      })
    })
  }

  const deleteProjectTodoSubtask = (projectId: string, todoId: string, subtaskId: string) => {
    setProjects((prev) => {
      return prev.map((project) => {
        if (project.id !== projectId) return project

        const updatedTodos = project.todos.map((todo) => {
          if (todo.id !== todoId) return todo

          const filteredSubtasks = todo.subtasks.filter((subtask) => subtask.id !== subtaskId)

          return {
            ...todo,
            subtasks: filteredSubtasks,
          }
        })

        return {
          ...project,
          todos: updatedTodos,
          updatedAt: new Date().toISOString(),
        }
      })
    })
  }

  const toggleProjectTodoSubtask = (projectId: string, todoId: string, subtaskId: string) => {
    setProjects((prev) => {
      return prev.map((project) => {
        if (project.id !== projectId) return project

        const updatedTodos = project.todos.map((todo) => {
          if (todo.id !== todoId) return todo

          const updatedSubtasks = todo.subtasks.map((subtask) =>
            subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask,
          )

          // Check if all subtasks are completed
          const allSubtasksCompleted = updatedSubtasks.every((subtask) => subtask.completed)

          return {
            ...todo,
            subtasks: updatedSubtasks,
            // Auto-complete the todo if all subtasks are completed
            completed: allSubtasksCompleted,
          }
        })

        return {
          ...project,
          todos: updatedTodos,
          updatedAt: new Date().toISOString(),
        }
      })
    })
  }

  // Settings functions
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const addTeamMember = (projectId: string, member: Omit<TeamMember, "id">) => {
    const newMemberId = uuidv4()

    setProjects((prev) => {
      return prev.map((project) => {
        if (project.id !== projectId) return project

        const newMember: TeamMember = {
          id: newMemberId,
          ...member,
          assignedTasks: member.assignedTasks || [],
        }

        return {
          ...project,
          team: [...project.team, newMember],
          updatedAt: new Date().toISOString(),
        }
      })
    })
  }

  const updateTeamMember = (projectId: string, memberId: string, memberData: Partial<Omit<TeamMember, "id">>) => {
    setProjects((prev) => {
      return prev.map((project) => {
        if (project.id !== projectId) return project

        const updatedTeam = project.team.map((member) =>
          member.id === memberId ? { ...member, ...memberData } : member,
        )

        return {
          ...project,
          team: updatedTeam,
          updatedAt: new Date().toISOString(),
        }
      })
    })
  }

  const removeTeamMember = (projectId: string, memberId: string) => {
    setProjects((prev) => {
      return prev.map((project) => {
        if (project.id !== projectId) return project

        return {
          ...project,
          team: project.team.filter((member) => member.id !== memberId),
          updatedAt: new Date().toISOString(),
        }
      })
    })
  }

  return (
    <AppDataContext.Provider
      value={{
        habits,
        tasks,
        notes,
        projects,
        completedProjects,
        settings,
        badge,
        uniqueRecords,
        taskCategories,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabitCompletion,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        toggleTaskIncomplete, // NEW
        toggleTaskFailed, // NEW
        addNote,
        updateNote,
        deleteNote,
        addProject,
        updateProject,
        deleteProject,
        addProjectStage,
        updateProjectStage,
        deleteProjectStage,
        toggleProjectStage,
        addProjectTodo,
        updateProjectTodo,
        deleteProjectTodo,
        toggleProjectTodo,
        addProjectTodoSubtask,
        updateProjectTodoSubtask,
        deleteProjectTodoSubtask,
        toggleProjectTodoSubtask,
        updateSettings,
        calculateBadge,
        addTeamMember,
        updateTeamMember,
        removeTeamMember,
        completeProject,
        calculateProjectPoints,
        getProjectStatistics,
        toggleHabitFailed,
        addTaskCategory,
        updateTaskCategory,
        deleteTaskCategory,
        getTaskCategory,
      }}
    >
      {children}
    </AppDataContext.Provider>
  )
}

export function useAppData() {
  const context = useContext(AppDataContext)

  if (context === undefined) {
    throw new Error("useAppData must be used within an AppDataProvider")
  }

  return context
}
