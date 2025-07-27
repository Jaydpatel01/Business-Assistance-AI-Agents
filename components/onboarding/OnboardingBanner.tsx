"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight, X, FileText, MessageSquare, Upload, Sparkles } from "lucide-react"
import Link from "next/link"
import { useOnboarding } from "@/hooks/use-onboarding"

export function OnboardingBanner() {
  const { state, getNextStep, getProgress, shouldShowOnboarding } = useOnboarding()
  const [isDismissed, setIsDismissed] = useState(false)

  if (!shouldShowOnboarding() || isDismissed) {
    return null
  }

  const nextStep = getNextStep()
  const progress = getProgress()

  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case 'create-scenario':
        return FileText
      case 'start-discussion':
        return MessageSquare
      case 'upload-documents':
        return Upload
      default:
        return Sparkles
    }
  }

  const getStepAction = (stepId: string) => {
    switch (stepId) {
      case 'create-scenario':
        return { href: '/scenarios/new', label: 'Create Scenario' }
      case 'start-discussion':
        return { href: '/boardroom/new', label: 'Start AI Discussion' }
      case 'upload-documents':
        return { href: '/documents', label: 'Upload Documents' }
      default:
        return { href: '/dashboard', label: 'Get Started' }
    }
  }

  if (!nextStep) {
    return null
  }

  const Icon = getStepIcon(nextStep.id)
  const action = getStepAction(nextStep.id)

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Welcome to Business AI! 🚀</CardTitle>
              <CardDescription>
                Let's get you set up with AI-powered decision making
              </CardDescription>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Setup Progress</span>
            <span className="text-muted-foreground">{progress}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Current Step */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold">{nextStep.title}</h3>
              <p className="text-sm text-muted-foreground">{nextStep.description}</p>
            </div>
          </div>
          
          <Button asChild size="sm">
            <Link href={action.href}>
              {action.label}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Completed Steps */}
        {state.currentStep > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Completed Steps</h4>
            <div className="flex gap-2 flex-wrap">
              {state.hasCreatedScenario && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Scenario Created
                </Badge>
              )}
              {state.hasStartedBoardroom && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Discussion Started
                </Badge>
              )}
              {state.hasUploadedDocument && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Document Uploaded
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
