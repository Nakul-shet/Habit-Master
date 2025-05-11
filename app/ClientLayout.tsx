"use client"

import type React from "react"

import { Inter } from "next/font/google"
import { useEffect, useState } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AppDataProvider } from "@/lib/app-data-context"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

// Gradient options
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

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [mounted, setMounted] = useState(false)
  const [appTheme, setAppTheme] = useState("light")
  const [gradientType, setGradientType] = useState("purple-blue")

  useEffect(() => {
    setMounted(true)

    // Load theme setting from localStorage
    try {
      const storedSettings = localStorage.getItem("settings")
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings)
        if (parsedSettings.theme) {
          setAppTheme(parsedSettings.theme)
        }
        if (parsedSettings.gradientType) {
          setGradientType(parsedSettings.gradientType)
        }
      }
    } catch (error) {
      console.error("Error loading theme from localStorage:", error)
    }
  }, [])

  // Apply gradient theme class if needed
  useEffect(() => {
    if (appTheme === "gradient") {
      document.documentElement.classList.add("gradient-theme")
      document.documentElement.classList.remove("dark")

      // Apply the selected gradient
      const selectedGradient = gradientOptions.find((g) => g.id === gradientType) || gradientOptions[0]
      const isDark = document.documentElement.classList.contains("dark")
      const gradientStyle = isDark ? selectedGradient.dark : selectedGradient.light

      // Apply the gradient to the body
      document.body.style.background = gradientStyle
      document.body.style.backgroundAttachment = "fixed"
    } else {
      document.documentElement.classList.remove("gradient-theme")
      document.body.style.background = ""
    }
  }, [appTheme, gradientType])

  if (!mounted) {
    return null
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme={appTheme === "gradient" ? "light" : appTheme}
          enableSystem={false}
          disableTransitionOnChange
          onValueChange={(newTheme) => {
            if (appTheme !== "gradient") {
              setAppTheme(newTheme)
            }
          }}
        >
          <AppDataProvider initialTheme={appTheme}>
            {children}
            <Toaster />
          </AppDataProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
