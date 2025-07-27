"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, MessageSquare, Upload, Users, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { useOnboarding } from "@/hooks/use-onboarding"

interface OnboardingState {
  hasCreatedScenario: boolean
  hasStartedBoardroom: boolean
  hasUploadedDocument: boolean
}

const QUICK_ACTIONS = [
  {
    id: 'create-scenario',
    title: 'Create Your First Scenario',
    description: 'Set up a business scenario for AI analysis',
    icon: FileText,
    href: '/scenarios/new',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    completedText: 'Scenario Created ✓'
  },
  {
    id: 'start-discussion',
    title: 'Start AI Discussion',
    description: 'Get insights from your AI executive team',
    icon: MessageSquare,
    href: '/scenarios',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    completedText: 'Discussion Started ✓'
  },
  {
    id: 'upload-documents',
    title: 'Upload Company Documents',
    description: 'Enhance AI responses with your business context',
    icon: Upload,
    href: '/documents',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    completedText: 'Documents Uploaded ✓'
  }
]

export function QuickActionsSection() {
  const { state, shouldShowOnboarding } = useOnboarding()

  // Only show for users who haven't completed onboarding
  if (!shouldShowOnboarding()) {
    return null
  }

  return (
    <Card className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950 dark:to-gray-950 border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Quick Actions to Get Started
        </CardTitle>
        <CardDescription>
          Complete these steps to unlock the full power of AI-driven decision making
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon
            const isCompleted = getCompletionStatus(action.id, state)
            
            return (
              <div
                key={action.id}
                className="relative p-4 border rounded-lg bg-white dark:bg-gray-900 hover:shadow-md transition-shadow"
              >
                {isCompleted && (
                  <Badge 
                    className="absolute -top-2 -right-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  >
                    ✓
                  </Badge>
                )}
                
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">
                      {isCompleted ? action.completedText : action.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      {action.description}
                    </p>
                  </div>
                </div>
                
                <Button 
                  asChild 
                  size="sm" 
                  variant={isCompleted ? "outline" : "default"}
                  className="w-full"
                  disabled={isCompleted}
                >
                  <Link href={action.href}>
                    {isCompleted ? (
                      <>
                        <Users className="h-3 w-3 mr-2" />
                        View
                      </>
                    ) : (
                      <>
                        Get Started
                        <ArrowRight className="h-3 w-3 ml-2" />
                      </>
                    )}
                  </Link>
                </Button>
              </div>
            )
          })}
        </div>

        {/* Progress Indicator */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium">Setup Progress</span>
            <span className="text-muted-foreground">
              {getCompletedCount(state)} of {QUICK_ACTIONS.length} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(getCompletedCount(state) / QUICK_ACTIONS.length) * 100}%` 
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getCompletionStatus(actionId: string, state: OnboardingState) {
  switch (actionId) {
    case 'create-scenario':
      return state.hasCreatedScenario
    case 'start-discussion':
      return state.hasStartedBoardroom
    case 'upload-documents':
      return state.hasUploadedDocument
    default:
      return false
  }
}

function getCompletedCount(state: OnboardingState) {
  let count = 0
  if (state.hasCreatedScenario) count++
  if (state.hasStartedBoardroom) count++
  if (state.hasUploadedDocument) count++
  return count
}
