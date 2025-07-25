// NextAuth type extensions
import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      company?: string
      isDemo: boolean
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role?: string
    company?: string
    isDemo?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    company?: string
    isDemo?: boolean
  }
}
