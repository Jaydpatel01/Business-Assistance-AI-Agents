import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"

export default async function HomePage() {
  // Check authentication status
  const session = await getServerSession()
  
  if (session) {
    // Redirect authenticated users to dashboard
    redirect("/dashboard")
  } else {
    // Redirect unauthenticated users to login
    redirect("/login")
  }
}
