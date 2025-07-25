import { Skeleton } from "@/components/ui/skeleton"

export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-lg font-medium text-foreground">Loading Business AI...</span>
        </div>
        <div className="space-y-2 w-80">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  )
}
