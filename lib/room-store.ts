// In-memory store for rooms
// Note: This works for development. For production, use a database like Redis or Supabase

export interface Participant {
  id: string
  username: string
  vote: string | null
  isAdmin: boolean
  lastSeen: number
  isRevoting: boolean
}

export interface Room {
  id: string
  adminToken: string
  createdAt: number
  lastActivity: number
  participants: Map<string, Participant>
  cardDeck: string[]
  revealed: boolean
  taskDescription: string
  isDeleted: boolean
}

const DEFAULT_DECK = ['?', '0', '1', '2', '3', '5', '8', '13', '20', '40', '100', '☕']

// Global room storage
const rooms = new Map<string, Room>()

// Room cleanup interval - 6 hours from creation (fixed time)
const ROOM_MAX_LIFETIME_MS = 6 * 60 * 60 * 1000

// Clean up expired rooms periodically (check both lifetime and empty rooms)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [roomId, room] of rooms.entries()) {
      // Delete if room is older than 6 hours from creation
      if (now - room.createdAt > ROOM_MAX_LIFETIME_MS) {
        room.isDeleted = true
        rooms.delete(roomId)
      }
      // Also delete if room has been empty for 30 minutes
      else if (room.participants.size === 0 && now - room.lastActivity > 30 * 60 * 1000) {
        room.isDeleted = true
        rooms.delete(roomId)
      }
    }
  }, 60000) // Check every minute
}

export function createRoom(roomId: string, adminToken: string): Room {
  const room: Room = {
    id: roomId,
    adminToken,
    createdAt: Date.now(),
    lastActivity: Date.now(),
    participants: new Map(),
    cardDeck: [...DEFAULT_DECK],
    revealed: false,
    taskDescription: '',
    isDeleted: false,
  }
  rooms.set(roomId, room)
  return room
}

export function verifyAdminToken(roomId: string, adminToken: string): boolean {
  const room = rooms.get(roomId)
  if (!room) return false
  return room.adminToken === adminToken
}

export function getRoomAdminToken(roomId: string): string | null {
  const room = rooms.get(roomId)
  return room?.adminToken ?? null
}

export function getRoom(roomId: string): Room | undefined {
  const room = rooms.get(roomId)
  if (room) {
    room.lastActivity = Date.now()
  }
  return room
}

export function deleteRoom(roomId: string): boolean {
  return rooms.delete(roomId)
}

export function addParticipant(
  roomId: string,
  participantId: string,
  username: string,
  isAdmin: boolean = false
): Participant | null {
  const room = getRoom(roomId)
  if (!room) return null

  // Check for duplicate username
  for (const [, participant] of room.participants) {
    if (participant.username.toLowerCase() === username.toLowerCase() && participant.id !== participantId) {
      return null
    }
  }

  const participant: Participant = {
    id: participantId,
    username,
    vote: null,
    isAdmin,
    lastSeen: Date.now(),
    isRevoting: false,
  }
  room.participants.set(participantId, participant)
  return participant
}

export function removeParticipant(roomId: string, participantId: string): boolean {
  const room = getRoom(roomId)
  if (!room) return false
  return room.participants.delete(participantId)
}

export function setVote(roomId: string, participantId: string, vote: string | null): boolean {
  const room = getRoom(roomId)
  if (!room) return false

  const participant = room.participants.get(participantId)
  if (!participant) return false

  participant.vote = vote
  participant.lastSeen = Date.now()
  // If participant was revoting and now has a vote, they're done revoting
  if (vote !== null && participant.isRevoting) {
    participant.isRevoting = false
  }
  return true
}

export function setRevoting(roomId: string, participantId: string, isRevoting: boolean): boolean {
  const room = getRoom(roomId)
  if (!room) return false

  const participant = room.participants.get(participantId)
  if (!participant) return false

  participant.isRevoting = isRevoting
  if (isRevoting) {
    participant.vote = null // Clear vote when starting revote
  }
  participant.lastSeen = Date.now()
  return true
}

export function revealVotes(roomId: string): boolean {
  const room = getRoom(roomId)
  if (!room) return false

  room.revealed = true
  return true
}

export function resetVotes(roomId: string): boolean {
  const room = getRoom(roomId)
  if (!room) return false

  room.revealed = false
  for (const [, participant] of room.participants) {
    participant.vote = null
    participant.isRevoting = false
  }
  return true
}

export function setTaskDescription(roomId: string, description: string): boolean {
  const room = getRoom(roomId)
  if (!room) return false

  room.taskDescription = description
  return true
}

export function setCardDeck(roomId: string, deck: string[]): boolean {
  const room = getRoom(roomId)
  if (!room) return false

  room.cardDeck = deck
  return true
}

export function updateParticipantActivity(roomId: string, participantId: string): void {
  const room = getRoom(roomId)
  if (!room) return

  const participant = room.participants.get(participantId)
  if (participant) {
    participant.lastSeen = Date.now()
  }
}

export function getRoomState(roomId: string) {
  const room = getRoom(roomId)
  if (!room) return null

  const participants = Array.from(room.participants.values()).map((p) => ({
    id: p.id,
    username: p.username,
    hasVoted: p.vote !== null,
    vote: room.revealed && !p.isRevoting ? p.vote : null,
    isAdmin: p.isAdmin,
    isOnline: Date.now() - p.lastSeen < 30000, // Consider online if seen in last 30 seconds
    isRevoting: p.isRevoting,
  }))

  // Calculate statistics if revealed
  let stats = null
  if (room.revealed) {
    const numericVotes = participants
      .filter((p) => p.vote !== null && !isNaN(Number(p.vote)) && p.vote !== '?' && p.vote !== '☕')
      .map((p) => Number(p.vote))

    if (numericVotes.length > 0) {
      const sum = numericVotes.reduce((a, b) => a + b, 0)
      const avg = sum / numericVotes.length
      const sorted = [...numericVotes].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2

      stats = {
        average: Math.round(avg * 10) / 10,
        median: median,
        total: numericVotes.length,
      }
    }
  }

  return {
    id: room.id,
    participants,
    cardDeck: room.cardDeck,
    revealed: room.revealed,
    taskDescription: room.taskDescription,
    stats,
  }
}

export function roomExists(roomId: string): boolean {
  return rooms.has(roomId)
}
