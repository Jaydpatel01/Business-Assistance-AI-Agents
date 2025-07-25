import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function BoardSessionsLoading() {
  return (
    <div className="space-y-6">
      {/* Header and action */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Sessions table/cards */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center p-3 border rounded-md">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
