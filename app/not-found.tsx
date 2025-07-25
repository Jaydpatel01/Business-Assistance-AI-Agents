import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileQuestion, Home, Search } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <FileQuestion className="h-16 w-16 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
          <CardDescription>
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/scenarios">
                <Search className="mr-2 h-4 w-4" />
                Browse Scenarios
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
