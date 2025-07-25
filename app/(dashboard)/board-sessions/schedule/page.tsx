import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ScheduleBoardSessionPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Board Session</h1>
          <p className="text-muted-foreground">Plan your executive AI consultation</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="session-title">Session Title</Label>
            <Input id="session-title" placeholder="e.g., Q1 Strategic Planning Review" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-description">Description</Label>
            <Textarea
              id="session-description"
              placeholder="Describe the strategic challenge or decision to be discussed"
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="session-date">Preferred Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="session-date" type="date" className="pl-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-time">Preferred Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="session-time" type="time" className="pl-10" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-duration">Expected Duration</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              <Users className="h-4 w-4 mr-2" />
              Schedule Session
            </Button>
            <Button variant="outline">Save as Draft</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
