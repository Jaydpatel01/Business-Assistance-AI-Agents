import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/connection"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, company } = body

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    // Update user profile with missing data
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name,
        company: company || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        role: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser
    }, { status: 200 })

  } catch (error) {
    console.error("Profile migration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
