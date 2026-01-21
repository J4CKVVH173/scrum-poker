'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createNewRoom, checkRoomExists } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { Users, Zap, Lock, Clock } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [joinRoomId, setJoinRoomId] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState('')

  const handleCreateRoom = async () => {
    setIsCreating(true)
    setError('')
    try {
      const result = await createNewRoom()
      if (result && result.roomId && result.adminToken) {
        // Store adminToken in localStorage for this room
        localStorage.setItem(`scrum-poker-admin-${result.roomId}`, result.adminToken)
        router.push(`/room/${result.roomId}`)
      } else {
        setError('Failed to create room. Please try again.')
      }
    } catch {
      setError('Failed to create room. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinRoomId.trim()) {
      setError('Please enter a room ID')
      return
    }

    setIsJoining(true)
    setError('')
    try {
      const { exists } = await checkRoomExists(joinRoomId.trim())
      if (exists) {
        router.push(`/room/${joinRoomId.trim()}`)
      } else {
        setError('Room not found. Please check the ID and try again.')
      }
    } catch {
      setError('Failed to join room. Please try again.')
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">SP</span>
            </div>
            <span className="font-semibold text-lg">Scrum Poker</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4 text-balance">
              Collaborative Estimation for Agile Teams
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Run planning poker sessions with your team in real-time. No sign-up required, just create a room and start estimating.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle>Create a Room</CardTitle>
                <CardDescription>
                  Start a new planning poker session for your team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  type="button"
                  onClick={handleCreateRoom}
                  disabled={isCreating}
                  className="w-full"
                  size="lg"
                >
                  {isCreating ? 'Creating...' : 'Create New Room'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle>Join a Room</CardTitle>
                <CardDescription>
                  Enter a room ID to join an existing session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoinRoom} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter room ID"
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isJoining} variant="secondary">
                    {isJoining ? 'Joining...' : 'Join'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Real-time Sync</h3>
              <p className="text-sm text-muted-foreground">
                All participants see updates instantly
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">No Sign-up</h3>
              <p className="text-sm text-muted-foreground">
                Just create a room and share the link
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Private Voting</h3>
              <p className="text-sm text-muted-foreground">
                Votes are hidden until the admin reveals
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Auto Cleanup</h3>
              <p className="text-sm text-muted-foreground">
                Rooms expire after 6 hours
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          Built for agile teams. Self-hosted and open source.
        </div>
      </footer>
    </div>
  )
}
