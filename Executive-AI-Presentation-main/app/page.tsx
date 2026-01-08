"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { useRef } from "react"
import {
  ArrowRight,
  Presentation,
  Sparkles,
  Zap,
  Target,
  Users,
  TrendingUp,
  Clock,
  Shield,
  Star,
  CheckCircle2,
  MessageSquare,
  BarChart3,
  Lightbulb,
  Rocket,
  Brain,
  Layers,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatedBackground } from "@/components/animated-background"
import { Badge } from "@/components/ui/badge"
import {
  RoleBasedSection,
  HowItWorksSection,
  UseCasesSection,
  TestimonialsSection,
  PricingSection,
  FAQSection,
  CTASection,
} from "@/app/page-sections"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8])

  useEffect(() => {
    setMounted(true)
    // Smooth scrolling
    document.documentElement.style.scrollBehavior = "smooth"
  }, [])

  if (!mounted) return null

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10">
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 transition-all duration-300">
          <div className="container flex h-16 items-center">
            <div className="mr-4 flex">
              <Link href="/" className="flex items-center space-x-2 group">
                <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                  <Presentation className="h-6 w-6" />
                </motion.div>
                <span className="font-bold group-hover:text-primary transition-colors">PresentAI</span>
              </Link>
            </div>
            <div className="flex flex-1 items-center justify-end space-x-4">
              <nav className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="#features">Features</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="#how-it-works">How It Works</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="#testimonials">Reviews</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="#pricing">Pricing</Link>
                </Button>
                <Button variant="ghost" asChild className="text-primary">
                  <Link href="/summit">
                    <Users className="mr-1 h-4 w-4" />
                    AI Summit
                  </Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-primary to-purple-600">
                  <Link href="/slide-builder">Get Started</Link>
                </Button>
              </nav>
            </div>
          </div>
        </header>

        <main className="flex-1">
          {/* Hero Section */}
          <motion.section style={{ opacity, scale }} className="w-full py-24 md:py-32 lg:py-40 relative">
            <div className="container px-4 md:px-6">
              <motion.div
                className="flex flex-col items-center justify-center space-y-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  <motion.div
                    className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary mb-4"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Sparkles className="mr-1 h-4 w-4 inline-block" /> AI-Powered Presentations
                  </motion.div>
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-pink-600 animate-gradient">
                    Turn prompts into executive-level presentations
                  </h1>
                  <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400 mt-4">
                    Generate beautifully structured business presentations from simple prompts with role-based
                    intelligence. Powered by advanced AI.
                  </p>
                  <div className="flex items-center justify-center gap-4 pt-4">
                    <motion.div
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span>No design skills needed</span>
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span>Minutes, not hours</span>
                    </motion.div>
                  </div>
                </motion.div>
                <motion.div
                  className="w-full max-w-md space-y-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      className="flex-1 h-12 text-lg bg-gradient-to-r from-primary via-purple-600 to-pink-600 hover:opacity-90 transition-opacity"
                      size="lg"
                      asChild
                    >
                      <Link href="/slide-builder">
                        Create Presentation <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-12 text-lg border-primary/50 hover:bg-primary/10 hover:border-primary"
                      size="lg"
                      asChild
                    >
                      <Link href="/summit">
                        <Users className="mr-2 h-5 w-5" /> AI Summit
                      </Link>
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Free to start • No credit card required</p>
                </motion.div>
              </motion.div>
            </div>
          </motion.section>

          {/* Stats Section */}
          <StatsSection />

          {/* Features Section */}
          <FeaturesSection />

          {/* Role-Based Intelligence Section */}
          <RoleBasedSection />

          {/* How It Works Section */}
          <HowItWorksSection />

          {/* Use Cases Section */}
          <UseCasesSection />

          {/* Testimonials Section */}
          <TestimonialsSection />

          {/* Pricing Section */}
          <PricingSection />

          {/* FAQ Section */}
          <FAQSection />

          {/* CTA Section */}
          <CTASection />

        </main>

        {/* Enhanced Footer */}
        <footer className="w-full border-t bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container py-12 md:py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <Link href="/" className="flex items-center space-x-2">
                  <Presentation className="h-6 w-6" />
                  <span className="font-bold">PresentAI</span>
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Create executive-level presentations with AI-powered intelligence.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <li>
                    <Link href="/slide-builder" className="hover:text-primary transition-colors">
                      Slide Builder
                    </Link>
                  </li>
                  <li>
                    <Link href="/summit" className="hover:text-primary transition-colors flex items-center gap-1">
                      <Users className="h-3 w-3" /> AI Summit
                    </Link>
                  </li>
                  <li>
                    <Link href="/boardroom" className="hover:text-primary transition-colors">
                      Boardroom
                    </Link>
                  </li>
                  <li>
                    <Link href="/preview" className="hover:text-primary transition-colors">
                      Preview
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Resources</h3>
                <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <li>
                    <Link href="#" className="hover:text-primary transition-colors">
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-primary transition-colors">
                      API
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-primary transition-colors">
                      Support
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-primary transition-colors">
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <li>
                    <Link href="#" className="hover:text-primary transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-primary transition-colors">
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-primary transition-colors">
                      Terms
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="hover:text-primary transition-colors">
                      Privacy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t text-center text-sm text-gray-500 dark:text-gray-400">
              <p>© 2025 PresentAI. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

// Component Sections
function StatsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const stats = [
    { value: "10K+", label: "Presentations Created" },
    { value: "95%", label: "Time Saved" },
    { value: "4.9/5", label: "User Rating" },
    { value: "50+", label: "Countries" },
  ]

  return (
    <section ref={ref} className="w-full py-20 bg-gradient-to-b from-background to-gray-50 dark:to-gray-900">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.div
                className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600"
                initial={{ scale: 0.5 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
              >
                {stat.value}
              </motion.div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Intelligence",
      description: "Advanced AI generates contextual, professional content tailored to your needs.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightning Fast",
      description: "Generate complete presentations in minutes, not hours. Save 95% of your time.",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Role-Based Perspectives",
      description: "Choose from CEO, CFO, CTO, or HR perspectives for targeted messaging.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Data Visualization",
      description: "Automatic chart generation with multiple visualization options.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Voice Narration",
      description: "AI-generated voice narration for each slide in multiple voices.",
      color: "from-red-500 to-rose-500",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure & Private",
      description: "Your data is encrypted and never shared. Enterprise-grade security.",
      color: "from-indigo-500 to-blue-500",
    },
  ]

  return (
    <section id="features" ref={ref} className="w-full py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
            Powerful Features for Modern Teams
          </h2>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
            Everything you need to create stunning presentations that captivate your audience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full p-6 backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                <CardContent className="p-0">
                  <div
                    className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
