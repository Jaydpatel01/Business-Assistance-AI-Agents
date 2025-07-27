"use client"

import { useEffect, useState } from "react"
import { getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { 
  Brain, 
  Users, 
  FileText, 
  TrendingUp, 
  Shield, 
  Zap, 
  CheckCircle,
  ArrowRight,
  PlayCircle,
  BarChart3,
  Lightbulb,
  Target,
  Globe
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication status
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        // Redirect authenticated users to dashboard
        router.push("/dashboard")
      } else {
        setIsLoading(false)
      }
    }
    
    checkSession()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-8 bg-blue-600 rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">{/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                Business AI Agents
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/login?demo=true">
                <Button variant="ghost" size="sm" className="hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors duration-200">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Demo App
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition-all duration-200">
                  Login / Signup
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            🚀 Next-Generation AI Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Transform Your Business with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {" "}Intelligent AI Agents
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
            Empower your organization with advanced AI agents that collaborate, learn, and deliver 
            intelligent insights for strategic decision-making and operational excellence.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Comprehensive AI-Powered Business Solutions
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              From intelligent document processing to strategic boardroom insights, 
              our platform delivers enterprise-grade AI capabilities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Intelligent Agents */}
            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group">
              <CardHeader>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="group-hover:text-blue-600 transition-colors duration-300">Intelligent AI Agents</CardTitle>
                <CardDescription>
                  Deploy specialized AI agents for different business functions with advanced reasoning capabilities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Multi-agent collaboration</li>
                  <li className="flex items-center group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Domain-specific expertise</li>
                  <li className="flex items-center group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Autonomous task execution</li>
                </ul>
              </CardContent>
            </Card>

            {/* Executive Boardroom */}
            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group">
              <CardHeader>
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="group-hover:text-purple-600 transition-colors duration-300">Executive Boardroom</CardTitle>
                <CardDescription>
                  AI-powered strategic sessions with real-time collaboration and intelligent decision support.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Strategic planning sessions</li>
                  <li className="flex items-center group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Real-time collaboration</li>
                  <li className="flex items-center group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Decision tracking</li>
                </ul>
              </CardContent>
            </Card>

            {/* Document Intelligence */}
            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group">
              <CardHeader>
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="group-hover:text-green-600 transition-colors duration-300">Document Intelligence</CardTitle>
                <CardDescription>
                  Advanced RAG system for intelligent document processing and knowledge extraction.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Smart document analysis</li>
                  <li className="flex items-center group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Knowledge extraction</li>
                  <li className="flex items-center group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Contextual search</li>
                </ul>
              </CardContent>
            </Card>

            {/* Market Intelligence */}
            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group">
              <CardHeader>
                <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="group-hover:text-orange-600 transition-colors duration-300">Market Intelligence</CardTitle>
                <CardDescription>
                  Real-time market analysis and competitive intelligence powered by AI.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Market trend analysis</li>
                  <li className="flex items-center group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Competitive insights</li>
                  <li className="flex items-center group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Predictive analytics</li>
                </ul>
              </CardContent>
            </Card>

            {/* Analytics & Insights */}
            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group">
              <CardHeader>
                <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle className="group-hover:text-indigo-600 transition-colors duration-300">Analytics & Insights</CardTitle>
                <CardDescription>
                  Comprehensive analytics dashboard with AI-driven insights and recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Performance metrics</li>
                  <li className="flex items-center group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Predictive insights</li>
                  <li className="flex items-center group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Custom reports</li>
                </ul>
              </CardContent>
            </Card>

            {/* Explainable AI */}
            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group">
              <CardHeader>
                <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Lightbulb className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <CardTitle className="group-hover:text-yellow-600 transition-colors duration-300">Explainable AI</CardTitle>
                <CardDescription>
                  Complete transparency in AI decision-making with detailed reasoning and confidence metrics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Decision transparency</li>
                  <li className="flex items-center group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Reasoning chains</li>
                  <li className="flex items-center group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Confidence analysis</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Benefits */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Why Choose Business AI Agents?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Built for enterprise scale with cutting-edge AI technology and enterprise-grade security.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group cursor-pointer">
              <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors duration-300">Lightning Fast</h3>
              <p className="text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">Advanced AI models with optimized performance for real-time insights.</p>
            </div>

            <div className="text-center group cursor-pointer">
              <div className="h-16 w-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-green-600 transition-colors duration-300">Enterprise Security</h3>
              <p className="text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">Bank-grade security with comprehensive data protection and compliance.</p>
            </div>

            <div className="text-center group cursor-pointer">
              <div className="h-16 w-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Target className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 transition-colors duration-300">Precision AI</h3>
              <p className="text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">Domain-specific AI agents trained for your industry and use cases.</p>
            </div>

            <div className="text-center group cursor-pointer">
              <div className="h-16 w-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Globe className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-orange-600 transition-colors duration-300">Global Scale</h3>
              <p className="text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">Cloud-native architecture that scales with your business needs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-white/5 dark:bg-white/10 animate-pulse"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">
            Choose Your Experience
          </h2>
          <p className="text-xl text-blue-100 dark:text-blue-200 mb-8">
            Explore with sample data or dive into real business intelligence.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Demo App Card */}
            <div className="bg-white/10 dark:bg-slate-800/20 backdrop-blur-sm rounded-2xl p-8 border border-white/20 dark:border-slate-700/30 hover:bg-white/20 dark:hover:bg-slate-700/30 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center justify-center mb-4">
                <div className="h-16 w-16 bg-white/20 dark:bg-slate-700/50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <PlayCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Demo App</h3>
              <p className="text-blue-100 dark:text-blue-200 mb-6">
                Experience all features with sample data, mock scenarios, and simulated responses. Perfect for testing and evaluation.
              </p>
              <ul className="text-sm text-blue-100 dark:text-blue-200 mb-6 space-y-2">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-300 dark:text-green-400" />Sample business scenarios</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-300 dark:text-green-400" />Mock AI responses</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-300 dark:text-green-400" />Demo data sets</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-300 dark:text-green-400" />Full feature exploration</li>
              </ul>
              <Link href="/login?demo=true">
                <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-700 group-hover:scale-105 transition-all duration-300">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Try Demo App
                </Button>
              </Link>
            </div>

            {/* Full Platform Access Card */}
            <div className="bg-white/10 dark:bg-slate-800/20 backdrop-blur-sm rounded-2xl p-8 border border-white/20 dark:border-slate-700/30 hover:bg-white/20 dark:hover:bg-slate-700/30 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center justify-center mb-4">
                <div className="h-16 w-16 bg-white/20 dark:bg-slate-700/50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Brain className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Full Platform Access</h3>
              <p className="text-blue-100 dark:text-blue-200 mb-6">
                Create your account for complete access to all AI capabilities, real business analysis, and production-ready intelligence.
              </p>
              <ul className="text-sm text-blue-100 dark:text-blue-200 mb-6 space-y-2">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-300 dark:text-green-400" />Real data analysis</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-300 dark:text-green-400" />Production AI models</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-300 dark:text-green-400" />Custom scenarios</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-300 dark:text-green-400" />Enterprise features</li>
              </ul>
              <Link href="/login">
                <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-700 group-hover:scale-105 transition-all duration-300">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
          
          <p className="text-blue-200 dark:text-blue-300 text-sm mt-6">
            Both options provide access to all platform features • Demo uses sample data • Full access uses real data
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="h-6 w-6 text-blue-400 dark:text-blue-300" />
            <span className="text-lg font-semibold text-white">Business AI Agents</span>
          </div>
          <p className="text-slate-400 dark:text-slate-300 text-sm">
            © 2025 Business AI Agents. Empowering businesses with intelligent AI solutions.
          </p>
        </div>
      </footer>
    </div>
  )
}
