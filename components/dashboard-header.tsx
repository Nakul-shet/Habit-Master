"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart, BookOpen, Calendar, Home, Layers, Settings, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

// Live Clock Component
function LiveClock() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  const timeString = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })

  const dateString = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Clock className="h-4 w-4" />
      <div className="hidden sm:flex flex-col">
        <span className="font-medium">{timeString}</span>
        <span className="text-xs">{dateString}</span>
      </div>
      <div className="sm:hidden">
        <span className="font-medium">{timeString}</span>
      </div>
    </div>
  )
}

export function DashboardHeader() {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Habits",
      href: "/habits",
      icon: Calendar,
    },
    {
      name: "Tasks",
      href: "/tasks",
      icon: BarChart,
    },
    {
      name: "Notes",
      href: "/notes",
      icon: BookOpen,
    },
    {
      name: "Projects",
      href: "/projects",
      icon: Layers,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <img 
              src="/brain.png" 
              alt="Habit Master Logo" 
              className="h-8 w-8 filter brightness-0 invert"
            />
            <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
              Habit Master
            </span>
          </Link>
        </div>
        
        {/* Live Clock - positioned between logo and navigation */}
        <div className="flex-1 flex justify-center">
          <LiveClock />
        </div>
        
        <div className="flex items-center space-x-2">
          <nav className="flex items-center space-x-2">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 sm:h-9 sm:w-fit sm:px-3",
                  pathname === item.href && "bg-gradient-to-r from-purple-600 to-indigo-600",
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline-block">{item.name}</span>
                </Link>
              </Button>
            ))}
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
