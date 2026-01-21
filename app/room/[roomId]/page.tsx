'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import useSWR from 'swr'
import {
  checkRoomExists,
  joinRoom,
  leaveRoom,
  getRoomData,
  submitVote,
  reveal,
  reset,
  updateTask,
  updateDeck,
  heartbeat,
  startRevote,
  deleteRoomAction,
  checkRoomStatus,
} from '@/lib/actions'
import { JoinDialog } from '@/components/join-dialog'
import { VotingCards } from '@/components/voting-cards'
import { ParticipantsList } from '@/components/participants-list'
import { AdminControls } from '@/components/admin-controls'
import { VoteResults } from '@/components/vote-results'
import { ThemeToggle } from '@/components/theme-toggle'
import { PaperAirplane, PaperCrumple } from '@/components/easter-eggs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, Check, Home, Edit2 } from 'lucide-react'
import Link from 'next/link'
import { addParticipant } from '@/lib/room-store'

export default function RoomPage() {
  const params = useParams()
  const roomId = params.roomId as string
  const router = useRouter()
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminToken, setAdminToken] = useState<string | null>(null)
  const [showJoinDialog, setShowJoinDialog] = useState(true)
  const [roomDeleted, setRoomDeleted] = useState(false)
  const [roomExpired, setRoomExpired] = useState(false)
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isEditingTask, setIsEditingTask] = useState(false)
  const [taskInput, setTaskInput] = useState('')
  const [isRevoting, setIsRevoting] = useState(false)
  const [showAirplane, setShowAirplane] = useState(false)
  const [crumpleTrigger, setCrumpleTrigger] = useState(0)

  // Check if room exists on mount and load adminToken from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem(`scrum-poker-admin-${roomId}`)
    const user = localStorage.getItem(`scrum-poker-user-${roomId}`)
    if (storedToken) {
      setAdminToken(storedToken)
    }
    
    checkRoomExists(roomId).then(({ exists }) => {
      if (!exists) {
        router.push('/?error=room-not-found')
      }

      if (user) {
        const [username, participantId, isAdmin] = user.split(':')
        addParticipant(roomId, participantId, username, isAdmin === "true")
        setParticipantId(participantId)
        setIsAdmin(isAdmin === "true")
        setShowJoinDialog(false)
      } 
    })
  }, [roomId, router])

  // Periodically check if room still exists (for deletion/expiry detection)
  useEffect(() => {
    if (!participantId) return

    const checkInterval = setInterval(async () => {
      const status = await checkRoomStatus(roomId)
      if (!status.exists) {
        if (status.deleted) {
          setRoomDeleted(true)
        } else {
          setRoomExpired(true)
        }
      }
    }, 5000) // Check every 5 seconds

    return () => clearInterval(checkInterval)
  }, [roomId, participantId])

  // Fetch room data with polling
  const { data: roomData, mutate } = useSWR(
    participantId ? ['room', roomId, participantId] : null,
    () => getRoomData(roomId, participantId!),
    {
      refreshInterval: 1000, // Poll every second for real-time updates
      revalidateOnFocus: true,
    }
  )

  // Heartbeat to keep participant active
  useEffect(() => {
    if (!participantId) return

    const interval = setInterval(() => {
      heartbeat(roomId, participantId)
    }, 10000) // Send heartbeat every 10 seconds

    return () => clearInterval(interval)
  }, [roomId, participantId])

  // Update task input when room data changes
  useEffect(() => {
    if (roomData && 'taskDescription' in roomData) {
      setTaskInput(roomData.taskDescription)
    }
  }, [roomData])

  // Reset selected card when votes are reset
  useEffect(() => {
    if (roomData && 'revealed' in roomData && !roomData.revealed) {
      const currentParticipant = roomData.participants?.find(
        (p) => p.id === participantId
      )
      if (currentParticipant && !currentParticipant.hasVoted) {
        setSelectedCard(null)
      }
    }
  }, [roomData, participantId])

  const handleJoin = async (username: string) => {
    // Pass adminToken to verify admin status
    const result = await joinRoom(roomId, username, adminToken ?? undefined)
    if ('error' in result) {
      return result.error as string
    }

    localStorage.setItem(`scrum-poker-user-${roomId}`, `${username}:${result.participantId}:${result.isAdmin}`)
    setParticipantId(result.participantId)
    setIsAdmin(result.isAdmin)
    setShowJoinDialog(false)
    return null
  }

  const handleVote = useCallback(
    async (card: string) => {
      if (!participantId) return
      // Allow voting if not revealed OR if in revoting mode
      const canVote = roomData && 'revealed' in roomData ? (!roomData.revealed || isRevoting) : true
      if (!canVote) return

      const newCard = selectedCard === card ? null : card
      setSelectedCard(newCard)
      
      // Trigger crumple animation on vote
      if (newCard !== null) {
        setCrumpleTrigger((prev) => prev + 1)
      }
      
      await submitVote(roomId, participantId, newCard)
      
      // If was revoting and selected a card, exit revoting mode
      if (isRevoting && newCard !== null) {
        setIsRevoting(false)
      }
      
      mutate()
    },
    [participantId, roomId, selectedCard, roomData, mutate, isRevoting]
  )

  const handleReveal = async () => {
    if (!participantId) return
    await reveal(roomId, participantId)
    // Trigger airplane animation
    setShowAirplane(true)
    setTimeout(() => setShowAirplane(false), 100) // Reset trigger
    mutate()
  }

  const handleRevote = async () => {
    if (!participantId) return
    setIsRevoting(true)
    setSelectedCard(null)
    await startRevote(roomId, participantId)
    mutate()
  }

  const handleUpdateDeck = async (deck: string[]) => {
    if (!participantId) return
    await updateDeck(roomId, participantId, deck)
    mutate()
  }

  const handleReset = async () => {
    if (!participantId) return
    await reset(roomId, participantId)
    setSelectedCard(null)
    setIsRevoting(false)
    mutate()
  }

  const handleUpdateTask = async () => {
    if (!participantId) return
    await updateTask(roomId, participantId, taskInput)
    setIsEditingTask(false)
    mutate()
  }

  const handleLeave = async () => {
    if (participantId) {
      await leaveRoom(roomId, participantId)
    }
    router.push('/')
  }

  const handleDeleteRoom = async () => {
    if (!adminToken) return
    
    const confirmed = window.confirm('Are you sure you want to delete this room? This action cannot be undone.')
    if (!confirmed) return

    const result = await deleteRoomAction(roomId, adminToken)
    if ('error' in result) {
      alert(result.error)
      return
    }

    // Clear adminToken from localStorage
    localStorage.removeItem(`scrum-poker-admin-${roomId}`)
    router.push('/?message=room-deleted')
  }

  const copyRoomLink = () => {
    const url = `${window.location.origin}/room/${roomId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Show room deleted message
  if (roomDeleted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <h2 className="text-2xl font-bold mb-4">Room Deleted</h2>
          <p className="text-muted-foreground mb-6">
            This room has been deleted by the admin.
          </p>
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Show room expired message
  if (roomExpired) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <h2 className="text-2xl font-bold mb-4">Room Expired</h2>
          <p className="text-muted-foreground mb-6">
            This room has expired after 6 hours. Please create a new room.
          </p>
          <Link href="/">
            <Button>Create New Room</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (showJoinDialog) {
    return <JoinDialog onJoin={handleJoin} roomId={roomId} />
  }

  if (!roomData || 'error' in roomData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Loading room...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Easter Egg Animations */}
      <PaperAirplane trigger={showAirplane} />
      <PaperCrumple trigger={crumpleTrigger} />

      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="shrink-0">
                <Home className="h-4 w-4" />
                <span className="sr-only">Home</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">Room:</span>
              <code className="px-2 py-1 bg-muted rounded text-sm font-mono">{roomId}</code>
              <Button variant="ghost" size="icon" onClick={copyRoomLink} className="h-8 w-8">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">Copy room link</span>
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleLeave}>
              Leave
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Task Description */}
          <div className="mb-8">
            {isAdmin ? (
              <div className="flex items-start gap-2">
                {isEditingTask ? (
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={taskInput}
                      onChange={(e) => setTaskInput(e.target.value)}
                      placeholder="Enter story or task description..."
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdateTask()
                        if (e.key === 'Escape') setIsEditingTask(false)
                      }}
                      autoFocus
                    />
                    <Button onClick={handleUpdateTask} size="sm">
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingTask(false)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingTask(true)}
                    className="flex-1 text-left p-4 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors group"
                  >
                    {roomData.taskDescription ? (
                      <p className="text-lg">{roomData.taskDescription}</p>
                    ) : (
                      <p className="text-muted-foreground">Click to add a story or task description...</p>
                    )}
                    <Edit2 className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity inline-block ml-2" />
                  </button>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-muted/50">
                {roomData.taskDescription ? (
                  <p className="text-lg">{roomData.taskDescription}</p>
                ) : (
                  <p className="text-muted-foreground">Waiting for admin to set the task...</p>
                )}
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Vote Results (shown when revealed) */}
              {roomData.revealed && <VoteResults stats={roomData.stats} />}

              {/* Voting Cards */}
              <VotingCards
                deck={roomData.cardDeck}
                selectedCard={selectedCard}
                onSelect={handleVote}
                disabled={roomData.revealed}
                revealed={roomData.revealed}
                isRevoting={isRevoting}
                onRevote={handleRevote}
              />

              {/* Admin Controls */}
              {isAdmin && (
                <AdminControls
                  revealed={roomData.revealed}
                  hasVotes={roomData.participants.some((p) => p.hasVoted)}
                  onReveal={handleReveal}
                  onReset={handleReset}
                  currentDeck={roomData.cardDeck}
                  onUpdateDeck={handleUpdateDeck}
                  hasRevotingParticipants={roomData.participants.some((p) => p.isRevoting)}
                  onDeleteRoom={handleDeleteRoom}
                />
              )}
            </div>

            {/* Participants List */}
            <div>
              <ParticipantsList
                participants={roomData.participants}
                revealed={roomData.revealed}
                currentParticipantId={participantId}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
