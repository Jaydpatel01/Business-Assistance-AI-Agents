import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/connection"
import bcryptjs from "bcryptjs"
import { z } from "zod"

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  company: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = signupSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 409 }
      )
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcryptjs.hash(validatedData.password, saltRounds)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        company: validatedData.company || null,
        role: "user"
      },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        role: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // User already excludes password due to select clause
    const userWithoutPassword = user

    return NextResponse.json({
      message: "User created successfully",
      user: userWithoutPassword
    }, { status: 201 })

  } catch (error) {
    console.error("Signup error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
