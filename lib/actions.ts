'use server'

import { v4 as uuidv4 } from 'uuid'
import {
  createRoom,
  getRoom,
  addParticipant,
  setVote,
  setRevoting,
  revealVotes,
  resetVotes,
  setTaskDescription,
  setCardDeck,
  getRoomState,
  roomExists,
  updateParticipantActivity,
  removeParticipant,
  verifyAdminToken,
  deleteRoom,
} from './room-store'

export async function createNewRoom() {
  const roomId = uuidv4().slice(0, 8)
  const adminToken = uuidv4()
  createRoom(roomId, adminToken)
  return { roomId, adminToken }
}

export async function checkRoomExists(roomId: string) {
  return { exists: roomExists(roomId) }
}

export async function joinRoom(roomId: string, username: string, adminToken?: string, participantId?: string) {
  const room = getRoom(roomId)
  if (!room) {
    return { error: 'Room not found' }
  }

  if (room.isDeleted) {
    return { error: 'Room has been deleted' }
  }

  const id = participantId || uuidv4()
  // Verify admin status by token, not by being first
  const isAdmin = adminToken ? verifyAdminToken(roomId, adminToken) : false
  const participant = addParticipant(roomId, id, username, isAdmin)

  if (!participant) {
    return { error: 'Username already taken in this room' }
  }

  return {
    participantId: id,
    isAdmin,
  }
}

export async function leaveRoom(roomId: string, participantId: string) {
  removeParticipant(roomId, participantId)
  return { success: true }
}

export async function submitVote(roomId: string, participantId: string, vote: string | null) {
  const success = setVote(roomId, participantId, vote)
  return { success }
}

export async function reveal(roomId: string, participantId: string, adminToken?: string) {
  const room = getRoom(roomId)
  if (!room) return { error: 'Room not found' }

  // Verify admin by token or by participant isAdmin flag
  const isAdminByToken = adminToken ? verifyAdminToken(roomId, adminToken) : false
  const participant = room.participants.get(participantId)
  const isAdminByParticipant = participant?.isAdmin ?? false

  if (!isAdminByToken && !isAdminByParticipant) {
    return { error: 'Only admin can reveal votes' }
  }

  revealVotes(roomId)
  return { success: true }
}

export async function reset(roomId: string, participantId: string, adminToken?: string) {
  const room = getRoom(roomId)
  if (!room) return { error: 'Room not found' }

  const isAdminByToken = adminToken ? verifyAdminToken(roomId, adminToken) : false
  const participant = room.participants.get(participantId)
  const isAdminByParticipant = participant?.isAdmin ?? false

  if (!isAdminByToken && !isAdminByParticipant) {
    return { error: 'Only admin can reset votes' }
  }

  resetVotes(roomId)
  return { success: true }
}

export async function updateTask(roomId: string, participantId: string, description: string, adminToken?: string) {
  const room = getRoom(roomId)
  if (!room) return { error: 'Room not found' }

  const isAdminByToken = adminToken ? verifyAdminToken(roomId, adminToken) : false
  const participant = room.participants.get(participantId)
  const isAdminByParticipant = participant?.isAdmin ?? false

  if (!isAdminByToken && !isAdminByParticipant) {
    return { error: 'Only admin can update task' }
  }

  setTaskDescription(roomId, description)
  return { success: true }
}

export async function updateDeck(roomId: string, participantId: string, deck: string[], adminToken?: string) {
  const room = getRoom(roomId)
  if (!room) return { error: 'Room not found' }

  const isAdminByToken = adminToken ? verifyAdminToken(roomId, adminToken) : false
  const participant = room.participants.get(participantId)
  const isAdminByParticipant = participant?.isAdmin ?? false

  if (!isAdminByToken && !isAdminByParticipant) {
    return { error: 'Only admin can update deck' }
  }

  setCardDeck(roomId, deck)
  return { success: true }
}

export async function deleteRoomAction(roomId: string, adminToken: string) {
  const room = getRoom(roomId)
  if (!room) return { error: 'Room not found' }

  if (!verifyAdminToken(roomId, adminToken)) {
    return { error: 'Only admin can delete room' }
  }

  room.isDeleted = true
  deleteRoom(roomId)
  return { success: true, deleted: true }
}

export async function checkRoomStatus(roomId: string) {
  const room = getRoom(roomId)
  if (!room) {
    return { exists: false, deleted: true }
  }
  if (room.isDeleted) {
    return { exists: false, deleted: true }
  }
  return { exists: true, deleted: false }
}

export async function getRoomData(roomId: string, participantId?: string) {
  if (participantId) {
    updateParticipantActivity(roomId, participantId)
  }
  
  const state = getRoomState(roomId)
  if (!state) {
    return { error: 'Room not found' }
  }
  return state
}

export async function heartbeat(roomId: string, participantId: string) {
  updateParticipantActivity(roomId, participantId)
  return { success: true }
}

export async function startRevote(roomId: string, participantId: string) {
  const room = getRoom(roomId)
  if (!room) return { error: 'Room not found' }

  const participant = room.participants.get(participantId)
  if (!participant) return { error: 'Participant not found' }

  // Can only revote after reveal
  if (!room.revealed) return { error: 'Cannot revote before reveal' }

  setRevoting(roomId, participantId, true)
  return { success: true }
}
