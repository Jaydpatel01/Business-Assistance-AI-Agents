"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import {
  ArrowRight,
  CheckCircle2,
  Target,
  TrendingUp,
  Clock,
  Star,
  Rocket,
  Lightbulb,
  Layers,
  Briefcase,
  Calculator,
  Code,
  Users as UsersIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function RoleBasedSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const roles = [
    {
      icon: <Briefcase className="h-6 w-6" />,
      title: "CEO",
      desc: "Vision, strategy, market analysis, positioning, value proposition.",
      color: "#4f46e5",
    },
    {
      icon: <Calculator className="h-6 w-6" />,
      title: "CFO",
      desc: "Financial forecasting, ROI analysis, profit margins, cost breakdown.",
      color: "#0ea5e9",
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "CTO",
      desc: "Technical roadmap, architecture, innovation stack, system design.",
      color: "#8b5cf6",
    },
    {
      icon: <UsersIcon className="h-6 w-6" />,
      title: "HR",
      desc: "Talent strategy, employee engagement, diversity metrics, culture insights.",
      color: "#ec4899",
    },
  ]

  return (
    <section ref={ref} className="w-full py-20 md:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 md:px-6">
        <motion.div
          className="mx-auto grid max-w-5xl items-center gap-10 py-12 lg:grid-cols-2 lg:gap-16"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="flex flex-col justify-center space-y-4"
            initial={{ x: -50, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="space-y-2">
              <Badge className="mb-2">Role-Based AI</Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Choose Your Executive Perspective
              </h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Generate presentations tailored to specific professional perspectives. Each role brings unique insights
                and focus areas.
              </p>
            </div>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2">
            {roles.map((role, index) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Card
                  className="p-6 h-full backdrop-blur-sm bg-white/10 dark:bg-gray-900/30 border border-gray-200/50 dark:border-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  style={{ borderLeftWidth: "4px", borderLeftColor: role.color }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="p-2 rounded-lg text-white"
                      style={{ backgroundColor: role.color }}
                    >
                      {role.icon}
                    </div>
                    <h3 className="text-xl font-bold">{role.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{role.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const steps = [
    {
      step: 1,
      icon: <Lightbulb className="h-8 w-8" />,
      title: "Enter Your Topic",
      desc: "Provide a business topic or idea for your presentation. Be as specific or broad as you like.",
    },
    {
      step: 2,
      icon: <Target className="h-8 w-8" />,
      title: "Select Executive Role",
      desc: "Choose the executive perspective (CEO, CFO, CTO, HR) that best fits your audience.",
    },
    {
      step: 3,
      icon: <Rocket className="h-8 w-8" />,
      title: "Generate & Export",
      desc: "Get your presentation instantly with AI-generated content, charts, and narration.",
    },
  ]

  return (
    <section id="how-it-works" ref={ref} className="w-full py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <Badge className="mb-4">Simple Process</Badge>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">How It Works</h2>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
            Generate professional presentations in just a few simple steps.
          </p>
        </motion.div>

        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 * index }}
              >
                <Card className="h-full p-8 backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <CardContent className="p-0 flex flex-col items-center text-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-primary to-purple-600 text-white text-xl font-bold">
                      {item.step}
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-purple-600/10">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{item.desc}</p>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-purple-600" />
                )}
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Button className="bg-gradient-to-r from-primary to-purple-600" size="lg" asChild>
              <Link href="/slide-builder">
                Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export function UseCasesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const useCases = [
    {
      title: "Board Meetings",
      description: "Present strategic initiatives and quarterly results to board members with executive-level insights.",
      icon: <Layers className="h-6 w-6" />,
    },
    {
      title: "Investor Pitches",
      description: "Create compelling pitch decks with financial projections and market analysis.",
      icon: <TrendingUp className="h-6 w-6" />,
    },
    {
      title: "Sales Presentations",
      description: "Generate persuasive sales decks tailored to client needs and industry specifics.",
      icon: <Target className="h-6 w-6" />,
    },
    {
      title: "Quarterly Reviews",
      description: "Summarize performance metrics and strategic goals for stakeholder updates.",
      icon: <Clock className="h-6 w-6" />,
    },
  ]

  return (
    <section ref={ref} className="w-full py-20 md:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 md:px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <Badge className="mb-4">Use Cases</Badge>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
            Perfect For Every Scenario
          </h2>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
            From boardroom meetings to investor pitches, PresentAI adapts to your needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {useCases.map((useCase, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="h-full p-6 backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/50 hover:shadow-xl transition-all duration-300 cursor-pointer">
                <CardContent className="p-0 space-y-4">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-purple-600/10 w-fit">
                    {useCase.icon}
                  </div>
                  <h3 className="text-lg font-bold">{useCase.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{useCase.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function TestimonialsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, TechVision",
      content:
        "PresentAI has transformed how we create board presentations. What used to take days now takes minutes.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "CFO, FinanceFlow",
      content:
        "The financial perspective is spot-on. It's like having a presentation expert on our team 24/7.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "CTO, DevStack",
      content:
        "The technical depth and clarity in the presentations are impressive. Our stakeholders love it.",
      rating: 5,
    },
  ]

  return (
    <section id="testimonials" ref={ref} className="w-full py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <Badge className="mb-4">Testimonials</Badge>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
            Loved by Executives Worldwide
          </h2>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
            See what leaders say about PresentAI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full p-6 backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/50 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-0 space-y-4">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 italic">&ldquo;{testimonial.content}&rdquo;</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function PricingSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const plans = [
    {
      name: "Starter",
      price: "$0",
      description: "Perfect for trying out PresentAI",
      features: ["5 presentations/month", "Basic AI features", "Standard templates", "Email support"],
    },
    {
      name: "Professional",
      price: "$29",
      description: "For individuals and small teams",
      features: [
        "Unlimited presentations",
        "Advanced AI features",
        "Premium templates",
        "Voice narration",
        "Priority support",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      features: [
        "Everything in Professional",
        "Custom AI training",
        "API access",
        "Dedicated support",
        "SLA guarantee",
      ],
    },
  ]

  return (
    <section id="pricing" ref={ref} className="w-full py-20 md:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 md:px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <Badge className="mb-4">Pricing</Badge>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
            Choose the plan that's right for you. No hidden fees.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card
                className={`h-full p-8 backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/50 hover:shadow-xl transition-all duration-300 relative ${
                  plan.popular ? "ring-2 ring-primary" : ""
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-purple-600">
                    Most Popular
                  </Badge>
                )}
                <CardContent className="p-0 space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
                  </div>
                  <div>
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.price !== "Custom" && <span className="text-gray-500 dark:text-gray-400">/month</span>}
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      plan.popular ? "bg-gradient-to-r from-primary to-purple-600" : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/slide-builder">
                      {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FAQSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const faqs = [
    {
      question: "How does PresentAI work?",
      answer:
        "PresentAI uses advanced AI to generate presentation content based on your topic and selected executive role. It creates slides, charts, and even voice narration automatically.",
    },
    {
      question: "Can I customize the generated presentations?",
      answer:
        "Yes! All generated content is fully editable. You can modify text, change charts, and regenerate individual slides until you're satisfied.",
    },
    {
      question: "What file formats can I export to?",
      answer: "You can export presentations as PDF, PPTX, or as a complete ZIP package with audio files for narration.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Absolutely. We use enterprise-grade encryption for all data. Your presentations are private and never used to train our AI models.",
    },
  ]

  return (
    <section ref={ref} className="w-full py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <Badge className="mb-4">FAQ</Badge>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
            Got questions? We've got answers.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/50">
                <CardContent className="p-0 space-y-2">
                  <h3 className="text-lg font-bold">{faq.question}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{faq.answer}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="w-full py-20 md:py-32 bg-gradient-to-r from-primary via-purple-600 to-pink-600">
      <div className="container px-4 md:px-6">
        <motion.div
          className="text-center space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
              Ready to Transform Your Presentations?
            </h2>
            <p className="mx-auto max-w-[700px] text-white/90 md:text-xl">
              Join thousands of executives creating stunning presentations with AI.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/slide-builder">
                Start Creating Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link href="#pricing">View Pricing</Link>
            </Button>
          </div>
          <p className="text-sm text-white/80">No credit card required • Free to start • Cancel anytime</p>
        </motion.div>
      </div>
    </section>
  )
}

