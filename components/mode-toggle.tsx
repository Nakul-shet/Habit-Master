"use client"

import { useEffect } from "react"
import { Moon, Palette, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useAppData } from "@/lib/app-data-context"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const { settings, updateSettings } = useAppData()

  // Sync theme changes from settings to next-themes
  useEffect(() => {
    if (settings.theme === "gradient") {
      document.documentElement.classList.add("gradient-theme")
      setTheme("light") // Use light as base for gradient
    } else {
      document.documentElement.classList.remove("gradient-theme")
      setTheme(settings.theme)
    }
  }, [settings.theme, setTheme])

  const handleThemeChange = (newTheme: "light" | "dark" | "gradient") => {
    // Update the theme in our app settings
    updateSettings({ theme: newTheme })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
          {settings.theme === "gradient" ? (
            <Palette className="h-4 w-4" />
          ) : (
            <>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </>
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleThemeChange("light")}>
          <Sun className="h-4 w-4 mr-2" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
          <Moon className="h-4 w-4 mr-2" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("gradient")}>
          <Palette className="h-4 w-4 mr-2" /> Gradient
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
