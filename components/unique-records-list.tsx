"use client"

import { format } from "date-fns"
import { CheckCircle } from "lucide-react"
import { useAppData } from "@/lib/app-data-context"

export function UniqueRecordsList() {
  const { uniqueRecords } = useAppData()

  if (uniqueRecords.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          You haven't completed any unique tasks yet. Mark tasks as "Remember" when creating them to add them here when
          completed.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {uniqueRecords.map((record) => (
        <div
          key={record.id}
          className="flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
          style={{ borderLeft: "4px solid #3b82f6" }}
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <h4 className="font-medium">{record.name}</h4>
              <div className="text-xs text-muted-foreground">
                Completed on {format(new Date(record.date), "MMMM d, yyyy")}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
