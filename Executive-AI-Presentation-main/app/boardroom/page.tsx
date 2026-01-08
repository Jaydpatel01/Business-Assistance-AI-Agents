"use client"

import { BoardroomDiscussion } from "@/components/boardroom-discussion"

export default function BoardroomPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">AI Boardroom Simulator</h1>
        <BoardroomDiscussion />
      </div>
    </div>
  )
}
