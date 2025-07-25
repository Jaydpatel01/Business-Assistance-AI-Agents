import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth/config"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
      company?: string | null;
    }
  }
  
  interface User {
    role?: string;
    company?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    company?: string;
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
