'use client'

import { cn } from '@/lib/utils'
import { Crown, Check, Clock, RefreshCw } from 'lucide-react'

interface Participant {
  id: string
  username: string
  hasVoted: boolean
  vote: string | null
  isAdmin: boolean
  isOnline: boolean
  isRevoting?: boolean
}

interface ParticipantsListProps {
  participants: Participant[]
  revealed: boolean
  currentParticipantId: string | null
}

export function ParticipantsList({
  participants,
  revealed,
  currentParticipantId,
}: ParticipantsListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Participants</h2>
        <span className="text-sm text-muted-foreground">
          {participants.filter((p) => p.isOnline).length} online
        </span>
      </div>

      <div className="space-y-2">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border transition-colors',
              participant.id === currentParticipantId
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card',
              participant.isRevoting && 'border-amber-500 bg-amber-500/5'
            )}
          >
            {/* Avatar placeholder */}
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium shrink-0',
                participant.isOnline ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
                participant.isRevoting && 'bg-amber-500/10 text-amber-600'
              )}
            >
              {participant.username.slice(0, 2).toUpperCase()}
            </div>

            {/* Name and status */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{participant.username}</span>
                {participant.isAdmin && (
                  <Crown className="h-4 w-4 text-amber-500 shrink-0" />
                )}
                {participant.id === currentParticipantId && (
                  <span className="text-xs text-muted-foreground">(you)</span>
                )}
                {participant.isRevoting && (
                  <RefreshCw className="h-3 w-3 text-amber-500 animate-spin shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    participant.isOnline ? 'bg-green-500' : 'bg-muted-foreground/50'
                  )}
                />
                {participant.isRevoting ? (
                  <span className="text-amber-600">Revoting...</span>
                ) : participant.isOnline ? (
                  'Online'
                ) : (
                  'Away'
                )}
              </div>
            </div>

            {/* Vote status / card */}
            <div className="shrink-0">
              {participant.isRevoting ? (
                <div className="w-12 h-16 rounded-lg border-2 border-dashed border-amber-500 bg-amber-500/10 flex items-center justify-center animate-pulse">
                  <RefreshCw className="h-4 w-4 text-amber-500" />
                </div>
              ) : revealed ? (
                <div
                  className={cn(
                    'w-12 h-16 rounded-lg border-2 flex items-center justify-center font-bold text-sm',
                    'bg-card border-border',
                    'animate-in fade-in zoom-in duration-300'
                  )}
                >
                  {participant.vote ?? '-'}
                </div>
              ) : participant.hasVoted ? (
                <div className="w-12 h-16 rounded-lg border-2 border-primary bg-primary/10 flex items-center justify-center">
                  <Check className="h-5 w-5 text-primary" />
                </div>
              ) : (
                <div className="w-12 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
        ))}

        {participants.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No participants yet
          </p>
        )}
      </div>
    </div>
  )
}
