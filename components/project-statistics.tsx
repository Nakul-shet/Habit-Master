"use client"

import { useAppData } from "@/lib/app-data-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { format } from "date-fns"

export function ProjectStatistics() {
  const { getProjectStatistics, completedProjects } = useAppData()

  const stats = getProjectStatistics()

  // Format data for priority bar chart
  const priorityData = stats.projectsByPriority.map((item) => ({
    name: item.priority.charAt(0).toUpperCase() + item.priority.slice(1),
    value: item.count,
  }))

  // Format data for monthly projects bar chart
  const monthlyData = stats.projectsByMonth.slice(-6) // Last 6 months

  // Format data for completed projects
  const recentCompletedProjects = [...completedProjects]
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 5) // Last 5 completed projects

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Total Projects</CardTitle>
            <CardDescription>All-time projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Completed</CardTitle>
            <CardDescription>Finished projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.completedProjects}</div>
            <div className="text-sm text-muted-foreground mt-2">
              {stats.totalProjects > 0
                ? `${Math.round((stats.completedProjects / stats.totalProjects) * 100)}% completion rate`
                : "No projects yet"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">In Progress</CardTitle>
            <CardDescription>Active projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.ongoingProjects}</div>
            <div className="text-sm text-muted-foreground mt-2">
              {stats.ongoingProjects > 0
                ? `${Math.round(stats.averageCompletion)}% avg. progress`
                : "No active projects"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Total Points</CardTitle>
            <CardDescription>From all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalPoints}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Projects by Priority</CardTitle>
            <CardDescription>Distribution of projects by priority level</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {priorityData.some((item) => item.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Projects" fill="#8884d8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No project data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projects by Month</CardTitle>
            <CardDescription>Number of projects created in recent months</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Projects" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No monthly data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recently Completed Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Completed Projects</CardTitle>
          <CardDescription>Your latest achievements</CardDescription>
        </CardHeader>
        <CardContent>
          {recentCompletedProjects.length > 0 ? (
            <div className="space-y-4">
              {recentCompletedProjects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Completed on {format(new Date(project.completedAt), "MMMM d, yyyy")}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        {project.totalPoints} points
                      </span>
                      <p className="text-xs text-muted-foreground">{project.duration} days to complete</p>
                    </div>
                  </div>
                  {project.completionNotes && (
                    <div className="mt-2 text-sm italic border-l-2 pl-2 border-muted">"{project.completionNotes}"</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">You haven't completed any projects yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Stats */}
      {stats.completedProjects > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Project Insights</CardTitle>
            <CardDescription>Statistics from your completed projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Average Project Duration</h3>
                <p className="text-2xl font-bold">{Math.round(stats.averageDuration)} days</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Average Points per Project</h3>
                <p className="text-2xl font-bold">
                  {stats.completedProjects > 0 ? Math.round(stats.totalPoints / stats.completedProjects) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
