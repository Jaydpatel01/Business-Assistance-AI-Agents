"use client"

import type React from "react"

import { motion } from "framer-motion"
import { BriefcaseBusiness, Calculator, Code, Users } from "lucide-react"
import type { Role } from "@/app/generate/page"
import { cn } from "@/lib/utils"

interface RoleSelectorProps {
  selectedRole: Role | null
  onSelectRole: (role: Role) => void
}

const roles: { id: Role; name: string; icon: React.ReactNode; description: string; color: string }[] = [
  {
    id: "CEO",
    name: "CEO",
    icon: <BriefcaseBusiness className="h-6 w-6" />,
    description: "Vision, strategy, market analysis",
    color: "#4f46e5", // indigo
  },
  {
    id: "CFO",
    name: "CFO",
    icon: <Calculator className="h-6 w-6" />,
    description: "Financial forecasting, ROI analysis",
    color: "#0ea5e9", // sky blue
  },
  {
    id: "CTO",
    name: "CTO",
    icon: <Code className="h-6 w-6" />,
    description: "Technical roadmap, architecture",
    color: "#8b5cf6", // purple
  },
  {
    id: "HR",
    name: "HR",
    icon: <Users className="h-6 w-6" />,
    description: "Talent strategy, culture insights",
    color: "#ec4899", // pink
  },
]

export function RoleSelector({ selectedRole, onSelectRole }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {roles.map((role, index) => (
        <motion.div
          key={role.id}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <div
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-all duration-300 backdrop-blur-sm",
              selectedRole === role.id
                ? "border-2 bg-white/10 dark:bg-gray-900/30 shadow-lg"
                : "border border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/20 hover:shadow-md",
            )}
            onClick={() => onSelectRole(role.id)}
            style={{
              borderColor: selectedRole === role.id ? role.color : "",
              boxShadow: selectedRole === role.id ? `0 4px 12px ${role.color}30` : "",
            }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{
                backgroundColor: `${role.color}20`,
                color: role.color,
              }}
            >
              {role.icon}
            </div>
            <h3 className="mt-3 font-medium">{role.name}</h3>
            <p className="text-xs text-center text-gray-500 mt-1">{role.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
