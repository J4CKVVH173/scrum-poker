'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface VotingCardsProps {
  deck: string[]
  selectedCard: string | null
  onSelect: (card: string) => void
  disabled: boolean
  revealed: boolean
  isRevoting: boolean
  onRevote: () => void
}

export function VotingCards({
  deck,
  selectedCard,
  onSelect,
  disabled,
  revealed,
  isRevoting,
  onRevote,
}: VotingCardsProps) {
  const canVote = !disabled || isRevoting

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Select Your Estimate</h2>
        {revealed && !isRevoting && (
          <Button variant="outline" size="sm" onClick={onRevote}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Revote
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        {deck.map((card) => (
          <button
            key={card}
            onClick={() => onSelect(card)}
            disabled={!canVote}
            className={cn(
              'relative w-16 h-24 sm:w-20 sm:h-28 rounded-lg border-2 font-bold text-xl',
              'transition-all duration-200 ease-out',
              'hover:scale-105 active:scale-95',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              selectedCard === card
                ? 'border-primary bg-primary text-primary-foreground shadow-lg -translate-y-2'
                : 'border-border bg-card text-card-foreground hover:border-primary/50',
              !canVote && 'opacity-50 cursor-not-allowed hover:scale-100',
              isRevoting && 'animate-pulse'
            )}
          >
            <span className="flex items-center justify-center h-full">
              {card}
            </span>
            {selectedCard === card && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
            )}
          </button>
        ))}
      </div>
      {revealed && !isRevoting && (
        <p className="text-center text-sm text-muted-foreground">
          Votes revealed. Click &quot;Revote&quot; to change your estimate.
        </p>
      )}
      {isRevoting && (
        <p className="text-center text-sm text-primary font-medium">
          Revoting mode - select a new estimate
        </p>
      )}
    </div>
  )
}
