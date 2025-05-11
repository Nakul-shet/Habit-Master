import { AppDataProvider } from "@/lib/app-data-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { HabitAutoFail } from "@/components/habit-auto-fail"
import "./globals.css"

export const metadata = {
  title: "Habit Tracker",
  description: "Track your habits and tasks",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppDataProvider>
            {children}
            <Toaster />
            <HabitAutoFail />
          </AppDataProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
