"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { Brain, Mail, Lock, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { signIn, getSession } from "next-auth/react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const { toast } = useToast()

  // Client-side email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setFieldErrors(prev => ({ ...prev, email: "Email is required" }))
      return false
    } else if (!emailRegex.test(email)) {
      setFieldErrors(prev => ({ ...prev, email: "Please enter a valid email address" }))
      return false
    } else {
      setFieldErrors(prev => ({ ...prev, email: "" }))
      return true
    }
  }

  const validatePassword = (password: string) => {
    if (!password) {
      setFieldErrors(prev => ({ ...prev, password: "Password is required" }))
      return false
    } else {
      setFieldErrors(prev => ({ ...prev, password: "" }))
      return true  
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear any existing errors
    setFieldErrors({})
    
    // Comprehensive client-side validation
    let hasErrors = false
    const errors: Record<string, string> = {}
    
    // Validate email
    if (!email.trim()) {
      errors.email = 'Email is required'
      hasErrors = true
    } else if (!validateEmail(email)) {
      hasErrors = true // Error already set by validateEmail
    }
    
    // Validate password
    if (!password.trim()) {
      errors.password = 'Password is required'
      hasErrors = true
    } else if (!validatePassword(password)) {
      hasErrors = true // Error already set by validatePassword
    }
    
    // Set field errors if any exist
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
    }
    
    // Show error toast if validation fails
    if (hasErrors) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors above before continuing",
        variant: "destructive"
      })
      return
    }
    
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        // Handle different types of login errors
        let errorTitle = "Login Failed"
        let errorDescription = result.error

        if (result.error.includes("No account found")) {
          errorTitle = "Account Not Found"
          errorDescription = "No account found with this email address. Please check your email or sign up for a new account."
        } else if (result.error.includes("Incorrect password")) {
          errorTitle = "Wrong Password"
          errorDescription = "The password you entered is incorrect. Please try again or reset your password."
        } else if (result.error.includes("Google/GitHub")) {
          errorTitle = "Social Login Required"
          errorDescription = "This account was created with Google or GitHub. Please use the social login buttons below."
        } else if (result.error.includes("both email and password")) {
          errorTitle = "Missing Information"
          errorDescription = "Please enter both your email address and password."
        }

        toast({
          title: errorTitle,
          description: errorDescription,
          variant: "destructive",
        })
      } else if (result?.ok) {
        toast({
          title: "Login successful",
          description: "Welcome to Business Assistance AI Agents!",
        })
        
        // Wait for session to be established
        await getSession()
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const result = await signIn("google", { 
        callbackUrl: "/dashboard",
        redirect: false 
      })
      
      if (result?.error) {
        toast({
          title: "Google Sign-in Failed",
          description: "Unable to sign in with Google. Please try again or use email/password.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
      // If successful, NextAuth will handle the redirect
    } catch (error) {
      console.error("Google sign-in error:", error)
      toast({
        title: "Sign-in Failed",
        description: "Failed to connect to Google. Please check your internet connection and try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        email: demoEmail,
        password: demoPassword,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Demo Login Failed",
          description: result.error,
          variant: "destructive",
        })
      } else if (result?.ok) {
        toast({
          title: "Demo access granted",
          description: "Exploring demo content with sample data.",
        })
        
        await getSession()
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      console.error("Demo login error:", error)
      toast({
        title: "Demo Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="shadow-2xl border border-border bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Brain className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-card-foreground">Business Assistance AI Agents</CardTitle>
          <CardDescription className="text-muted-foreground">Enterprise Decision Intelligence Platform</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-card-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (fieldErrors.email) validateEmail(e.target.value)
                  }}
                  onBlur={(e) => validateEmail(e.target.value)}
                  className="pl-10 transition-all focus:ring-2 focus:ring-primary border-border"
                  required
                  disabled={isLoading}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-sm text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-card-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (fieldErrors.password) validatePassword(e.target.value)
                  }}
                  onBlur={(e) => validatePassword(e.target.value)}
                  className="pl-10 pr-10 transition-all focus:ring-2 focus:ring-primary border-border"
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {fieldErrors.password && (
                <p className="text-sm text-red-500">{fieldErrors.password}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Signing In...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

                        <Button
              type="button"
              variant="outline"
              className="w-full"
              size="lg"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Try Demo</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-center text-muted-foreground">
                Quick access with test credentials:
              </p>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDemoLogin("demo@businessai.com", "demo123")}
                  disabled={isLoading}
                  className="text-xs"
                >
                  Demo User (demo@businessai.com)
                </Button>
              </div>
            </div>

            <p className="text-sm text-center text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/auth/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
