import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db/connection"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import type { NextAuthOptions } from "next-auth"
import bcryptjs from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email and password")
        }

        // Check for demo credentials first
        const DEMO_CREDENTIALS = [
          { email: "demo@businessai.com", password: "demo123", name: "Demo User", role: "demo" },
          { email: "test@example.com", password: "test123", name: "Test User", role: "demo" },
          { email: "guest@demo.com", password: "guest123", name: "Guest User", role: "demo" }
        ]

        const demoUser = DEMO_CREDENTIALS.find(
          user => user.email === credentials.email && user.password === credentials.password
        )

        if (demoUser) {
          return {
            id: `demo-${demoUser.email}`,
            email: demoUser.email,
            name: demoUser.name,
            role: demoUser.role,
            company: "Demo Company",
            image: "/placeholder-user.jpg"
          }
        }

        try {
          // Check if user exists in database
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              company: true,
              image: true
            }
          })

          if (!user) {
            throw new Error("No account found with this email address. Please check your email or sign up for a new account.")
          }

          if (!user.password) {
            throw new Error("This account was created with Google/GitHub. Please sign in using the social login buttons above.")
          }

          // Verify password
          const isPasswordValid = await bcryptjs.compare(credentials.password, user.password)
          
          if (!isPasswordValid) {
            throw new Error("Incorrect password. Please check your password and try again.")
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role || "user",
            company: user.company || undefined,
            image: user.image || undefined,
          }
        } catch (error) {
          console.error("Authentication error:", error)
          // Re-throw the error to pass it to the client
          throw error
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
    error: "/login", // Error code passed in query string as ?error=
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role || "user";
        token.company = user.company || undefined;
      }
      
      // For OAuth users (Google/GitHub), fetch their data from DB
      if (account?.provider === "google" || account?.provider === "github") {
        token.role = "user";
        
        // Fetch user data from database for OAuth users
        if (token.email) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: token.email },
              select: {
                company: true,
                role: true,
                name: true
              }
            });
            
            if (dbUser) {
              token.company = dbUser.company || undefined;
              token.role = dbUser.role || "user";
              // Update name if it exists in database
              if (dbUser.name) {
                token.name = dbUser.name;
              }
            }
          } catch (error) {
            console.error("Error fetching OAuth user data:", error);
          }
        }
      }
      
      // Persist the OAuth account info
      if (account) {
        token.accessToken = account.access_token
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.company = token.company as string;
        
        // Update name from token if available
        if (token.name) {
          session.user.name = token.name as string;
        }
      }
      return session;
    },
    async signIn({ account }) {
      // Allow OAuth sign-ins
      if (account?.provider === "google" || account?.provider === "github") {
        return true;
      }
      
      // For credentials provider, user validation is handled in authorize
      return true;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log("User signed in:", { user: user.email, provider: account?.provider, isNewUser });
    },
    async signOut({ session }) {
      console.log("User signed out:", { user: session?.user?.email });
    },
  },
}
