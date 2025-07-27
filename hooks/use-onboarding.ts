"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface OnboardingState {
  hasCompletedOnboarding: boolean
  hasCreatedScenario: boolean
  hasStartedBoardroom: boolean
  hasUploadedDocument: boolean
  currentStep: number
  totalSteps: number
}

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Business AI',
    description: 'Get started with AI-powered decision making'
  },
  {
    id: 'create-scenario',
    title: 'Create Your First Scenario', 
    description: 'Set up a business scenario for AI analysis'
  },
  {
    id: 'start-discussion',
    title: 'Start AI Discussion',
    description: 'Get insights from your AI executive team'
  },
  {
    id: 'upload-documents',
    title: 'Upload Company Documents',
    description: 'Enhance AI responses with your business context'
  }
]

export function useOnboarding() {
  const { data: session } = useSession()
  const [state, setState] = useState<OnboardingState>({
    hasCompletedOnboarding: false,
    hasCreatedScenario: false,
    hasStartedBoardroom: false,
    hasUploadedDocument: false,
    currentStep: 0,
    totalSteps: ONBOARDING_STEPS.length
  })

  useEffect(() => {
    const loadOnboardingState = async () => {
      try {
        // Load from localStorage for now, could be moved to API later
        const stored = localStorage.getItem(`onboarding_${session?.user?.id}`)
        if (stored) {
          const parsedState = JSON.parse(stored)
          setState(parsedState)
        }
      } catch (error) {
        console.error('Failed to load onboarding state:', error)
      }
    }

    if (session?.user) {
      loadOnboardingState()
    }
  }, [session])

  const updateOnboardingState = (updates: Partial<OnboardingState>) => {
    const newState = { ...state, ...updates }
    setState(newState)
    
    // Save to localStorage
    try {
      localStorage.setItem(`onboarding_${session?.user?.id}`, JSON.stringify(newState))
    } catch (error) {
      console.error('Failed to save onboarding state:', error)
    }
  }

  const markStepCompleted = (stepId: string) => {
    const updates: Partial<OnboardingState> = {}
    
    switch (stepId) {
      case 'create-scenario':
        updates.hasCreatedScenario = true
        updates.currentStep = Math.max(state.currentStep, 1)
        break
      case 'start-discussion':
        updates.hasStartedBoardroom = true
        updates.currentStep = Math.max(state.currentStep, 2)
        break
      case 'upload-documents':
        updates.hasUploadedDocument = true
        updates.currentStep = Math.max(state.currentStep, 3)
        break
    }

    // Check if onboarding is complete
    if (updates.currentStep === ONBOARDING_STEPS.length - 1) {
      updates.hasCompletedOnboarding = true
    }

    updateOnboardingState(updates)
  }

  const resetOnboarding = () => {
    setState({
      hasCompletedOnboarding: false,
      hasCreatedScenario: false,
      hasStartedBoardroom: false,
      hasUploadedDocument: false,
      currentStep: 0,
      totalSteps: ONBOARDING_STEPS.length
    })
    
    try {
      localStorage.removeItem(`onboarding_${session?.user?.id}`)
    } catch (error) {
      console.error('Failed to reset onboarding state:', error)
    }
  }

  const getNextStep = () => {
    if (state.currentStep < ONBOARDING_STEPS.length) {
      return ONBOARDING_STEPS[state.currentStep]
    }
    return null
  }

  const getProgress = () => {
    return Math.round((state.currentStep / state.totalSteps) * 100)
  }

  const shouldShowOnboarding = () => {
    // Show onboarding for real users who haven't completed it
    // Skip for demo users
    return session?.user?.role !== 'demo' && !state.hasCompletedOnboarding
  }

  return {
    state,
    markStepCompleted,
    resetOnboarding,
    getNextStep,
    getProgress,
    shouldShowOnboarding,
    steps: ONBOARDING_STEPS
  }
}
