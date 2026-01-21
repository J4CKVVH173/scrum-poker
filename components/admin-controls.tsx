'use client'

import { Button } from '@/components/ui/button'
import { Eye, RotateCcw, Trash2 } from 'lucide-react'
import { DeckEditor } from '@/components/deck-editor'

interface AdminControlsProps {
  revealed: boolean
  hasVotes: boolean
  onReveal: () => void
  onReset: () => void
  currentDeck: string[]
  onUpdateDeck: (deck: string[]) => void
  hasRevotingParticipants: boolean
  onDeleteRoom: () => void
}

export function AdminControls({
  revealed,
  hasVotes,
  onReveal,
  onReset,
  currentDeck,
  onUpdateDeck,
  hasRevotingParticipants,
  onDeleteRoom,
}: AdminControlsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-4 p-6 bg-muted/50 rounded-lg">
      <div className="flex items-center justify-between mb-2 w-full">
        <p className="text-sm text-muted-foreground">Admin Controls</p>
        <div className="flex items-center gap-2">
          <DeckEditor currentDeck={currentDeck} onSave={onUpdateDeck} />
          <Button
            variant="outline"
            size="sm"
            onClick={onDeleteRoom}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Room
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 w-full">
        {!revealed ? (
          <Button onClick={onReveal} disabled={!hasVotes} size="lg" className="min-w-[140px]">
            <Eye className="mr-2 h-4 w-4" />
            Reveal Cards
          </Button>
        ) : (
          <>
            {hasRevotingParticipants && (
              <Button onClick={onReveal} size="lg" variant="outline" className="min-w-[140px] bg-transparent">
                <Eye className="mr-2 h-4 w-4" />
                Re-Reveal
              </Button>
            )}
            <Button onClick={onReset} size="lg" className="min-w-[140px]">
              <RotateCcw className="mr-2 h-4 w-4" />
              New Round
            </Button>
          </>
        )}
      </div>

      {hasRevotingParticipants && revealed && (
        <p className="text-sm text-amber-600 dark:text-amber-400 w-full text-center">
          Some participants are revoting...
        </p>
      )}
    </div>
  )
}
