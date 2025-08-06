"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Palette, Settings, Sun, Moon, Trash2, AlertTriangle } from "lucide-react"
import { useAppData } from "@/lib/app-data-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/components/ui/use-toast"
import { DashboardHeader } from "@/components/dashboard-header"
import { BadgeIcon } from "@/components/badge-icon"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const settingsSchema = z.object({
  pointsPerHabit: z.number().min(1).max(100),
  pointsPerTask: z.number().min(1).max(100),
  pointsPerProjectStage: z.number().min(1).max(100),
  levelThresholds: z.array(z.number()).min(1),
  theme: z.enum(["light", "dark", "gradient"]),
  gradientType: z.string().optional(),
})

const gradientOptions = [
  {
    id: "purple-blue",
    name: "Purple to Blue",
    light: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    dark: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
  },
  {
    id: "green-blue",
    name: "Green to Blue",
    light: "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)",
    dark: "linear-gradient(135deg, #004d40 0%, #00796b 100%)",
  },
  {
    id: "pink-orange",
    name: "Pink to Orange",
    light: "linear-gradient(135deg, #fff0f6 0%, #ffe3e3 100%)",
    dark: "linear-gradient(135deg, #4a1d3e 0%, #6a1b4d 100%)",
  },
  {
    id: "blue-teal",
    name: "Blue to Teal",
    light: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
    dark: "linear-gradient(135deg, #01579b 0%, #006064 100%)",
  },
]

export default function SettingsPage() {
  const { settings, updateSettings, badge, calculateBadge, clearAllData } = useAppData()

  const form = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      pointsPerHabit: settings.pointsPerHabit,
      pointsPerTask: settings.pointsPerTask,
      pointsPerProjectStage: settings.pointsPerProjectStage || 20,
      levelThresholds: settings.levelThresholds,
      theme: settings.theme,
      gradientType: settings.gradientType || "purple-blue",
    },
  })

  const watchTheme = form.watch("theme")
  const watchGradientType = form.watch("gradientType")

  function onSubmit(data) {
    updateSettings(data)

    // Apply the selected gradient if in gradient mode
    if (data.theme === "gradient" && data.gradientType) {
      const selectedGradient = gradientOptions.find((g) => g.id === data.gradientType)
      if (selectedGradient) {
        const isDark = document.documentElement.classList.contains("dark")
        const gradientStyle = isDark ? selectedGradient.dark : selectedGradient.light

        // Apply the gradient to the body
        document.body.style.background = gradientStyle
        document.body.style.backgroundAttachment = "fixed"
      }
    }

    toast({
      title: "Settings updated",
      description: "Your settings have been saved successfully.",
    })
  }

  const handleClearData = () => {
    clearAllData()
    toast({
      title: "Data cleared",
      description: "All application data has been cleared successfully.",
    })
  }

  // All possible badge ranks for display
  const allBadges = [
    "bronze3",
    "bronze2",
    "bronze1",
    "silver3",
    "silver2",
    "silver1",
    "gold3",
    "gold2",
    "gold1",
    "diamond",
    "platinum",
    "ruby",
  ]

  // Get the badge name for display
  const getBadgeName = (badgeRank) => {
    const parts = badgeRank.split(/(\d+)/)
    if (parts.length > 1) {
      return `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} ${parts[1]}`
    }
    return badgeRank.charAt(0).toUpperCase() + badgeRank.slice(1)
  }

  // Calculate points needed for each badge
  const getPointsForBadge = (badgeRank) => {
    // Find the minimum points needed for this badge
    let testPoints = 0
    while (calculateBadge(testPoints) !== badgeRank) {
      testPoints += 50
      if (testPoints > 10000) break // Safety check
    }
    return testPoints
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <DashboardHeader />

      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="flex items-center mb-6">
          <Settings className="mr-2 h-6 w-6 text-purple-600" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => updateSettings({ theme: "light" })}
            variant={settings.theme === "light" ? "default" : "outline"}
            className={settings.theme === "light" ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            <Sun className="mr-2 h-4 w-4" /> Light Mode
          </Button>
          <Button
            onClick={() => updateSettings({ theme: "dark" })}
            variant={settings.theme === "dark" ? "default" : "outline"}
            className={settings.theme === "dark" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
          >
            <Moon className="mr-2 h-4 w-4" /> Dark Mode
          </Button>
          <Button
            onClick={() => updateSettings({ theme: "gradient" })}
            variant={settings.theme === "gradient" ? "default" : "outline"}
            className={settings.theme === "gradient" ? "bg-purple-600 hover:bg-purple-700" : ""}
          >
            <Palette className="mr-2 h-4 w-4" /> Gradient Mode
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Game Settings</CardTitle>
              <CardDescription>Customize how points are awarded and levels are calculated</CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="pointsPerHabit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Points per Habit Completion</FormLabel>
                        <FormControl>
                          <div className="flex flex-col space-y-2">
                            <Slider
                              min={1}
                              max={50}
                              step={1}
                              defaultValue={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">1</span>
                              <span className="text-sm font-medium">{field.value} points</span>
                              <span className="text-sm text-muted-foreground">50</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>Points earned each time you complete a habit</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pointsPerTask"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Points per Task Completion</FormLabel>
                        <FormControl>
                          <div className="flex flex-col space-y-2">
                            <Slider
                              min={1}
                              max={50}
                              step={1}
                              defaultValue={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">1</span>
                              <span className="text-sm font-medium">{field.value} points</span>
                              <span className="text-sm text-muted-foreground">50</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>Points earned each time you complete a task</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pointsPerProjectStage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Points per Project Stage Completion</FormLabel>
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
                        <FormDescription>Default points earned when completing a project stage</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="levelThresholds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Level Thresholds</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            {field.value.map((threshold, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <span className="text-sm font-medium w-16">Level {index + 2}:</span>
                                <Input
                                  type="number"
                                  min={index > 0 ? field.value[index - 1] + 100 : 100}
                                  value={threshold}
                                  onChange={(e) => {
                                    const newValue = Number.parseInt(e.target.value)
                                    const newThresholds = [...field.value]
                                    newThresholds[index] = newValue
                                    field.onChange(newThresholds)
                                  }}
                                />
                                {index > 0 && (
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      const newThresholds = [...field.value]
                                      newThresholds.splice(index, 1)
                                      field.onChange(newThresholds)
                                    }}
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const lastThreshold = field.value[field.value.length - 1]
                                const newThresholds = [...field.value, lastThreshold + 500]
                                field.onChange(newThresholds)
                              }}
                            >
                              Add Level
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>Points required to reach each level</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Theme</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="light" />
                              </FormControl>
                              <FormLabel className="font-normal">Light</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="dark" />
                              </FormControl>
                              <FormLabel className="font-normal">Dark</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="gradient" />
                              </FormControl>
                              <FormLabel className="font-normal">Gradient</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormDescription>Choose your preferred theme</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchTheme === "gradient" && (
                    <FormField
                      control={form.control}
                      name="gradientType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gradient Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gradient type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {gradientOptions.map((gradient) => (
                                <SelectItem key={gradient.id} value={gradient.id}>
                                  {gradient.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>Choose your preferred gradient style</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {watchTheme === "gradient" && watchGradientType && (
                    <div className="rounded-md overflow-hidden border">
                      <div
                        className="h-20 w-full"
                        style={{
                          background:
                            gradientOptions.find((g) => g.id === watchGradientType)?.light || gradientOptions[0].light,
                        }}
                      ></div>
                      <div className="p-2 text-center text-sm">Preview (Light Mode)</div>
                      <div
                        className="h-20 w-full"
                        style={{
                          background:
                            gradientOptions.find((g) => g.id === watchGradientType)?.dark || gradientOptions[0].dark,
                        }}
                      ></div>
                      <div className="p-2 text-center text-sm bg-gray-900 text-white">Preview (Dark Mode)</div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    Save Settings
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="mr-2 h-5 w-5" />
                  Badge Progression
                </CardTitle>
                <CardDescription>Earn points to unlock new badges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {allBadges.map((badgeRank) => {
                    const isCurrentBadge = badgeRank === badge
                    const pointsNeeded = getPointsForBadge(badgeRank)
                    const isUnlocked = pointsNeeded <= getPointsForBadge(badge)

                    return (
                      <div
                        key={badgeRank}
                        className={`flex flex-col items-center p-3 rounded-lg border ${
                          isCurrentBadge
                            ? "border-primary bg-primary/10"
                            : isUnlocked
                              ? "border-muted-foreground/30"
                              : "border-muted opacity-50"
                        }`}
                      >
                        <BadgeIcon rank={badgeRank} size={40} />
                        <div className="mt-2 text-center">
                          <div className="text-sm font-medium">{getBadgeName(badgeRank)}</div>
                          <div className="text-xs text-muted-foreground">{pointsNeeded} points</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-6">
                  <p className="text-sm text-muted-foreground">
                    Your current badge: <span className="font-medium">{getBadgeName(badge)}</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Clear Data Section */}
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                  <Trash2 className="mr-2 h-5 w-5" />
                  Clear Data
                </CardTitle>
                <CardDescription>Permanently delete all your data from the application</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-destructive mb-1">Warning</p>
                      <p className="text-muted-foreground">
                        This action will permanently delete all your habits, tasks, notes, projects, and settings. 
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear All Data
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will permanently delete all your data including:
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>All habits and their completion history</li>
                            <li>All tasks and their status</li>
                            <li>All notes and projects</li>
                            <li>All settings and preferences</li>
                            <li>All progress and points earned</li>
                          </ul>
                          <p className="mt-3 font-medium text-destructive">
                            This action cannot be undone.
                          </p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleClearData}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Yes, Clear All Data
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
