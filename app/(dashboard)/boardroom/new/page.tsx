"use client"

import { Suspense } from "react"
import { BoardroomSessionCreator } from "../../../../components/boardroom/BoardroomSessionCreator"

export default function NewBoardroomPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Start AI Discussion</h1>
        <p className="text-muted-foreground">
          Create a new boardroom session to get insights from your AI agents
        </p>
      </div>
      
      <Suspense fallback={<div>Loading...</div>}>
        <BoardroomSessionCreator />
      </Suspense>
    </div>
  )
}
