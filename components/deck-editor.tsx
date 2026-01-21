'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Settings } from 'lucide-react'

interface DeckEditorProps {
  currentDeck: string[]
  onSave: (deck: string[]) => void
}

const PRESET_DECKS = {
  fibonacci: ['?', '0', '1', '2', '3', '5', '8', '13', '20', '40', '100', '☕'],
  tshirt: ['?', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '☕'],
  powers: ['?', '0', '1', '2', '4', '8', '16', '32', '64', '☕'],
  simple: ['?', '1', '2', '3', '4', '5', '☕'],
}

export function DeckEditor({ currentDeck, onSave }: DeckEditorProps) {
  const [open, setOpen] = useState(false)
  const [deckInput, setDeckInput] = useState(currentDeck.join(', '))

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      setDeckInput(currentDeck.join(', '))
    }
  }

  const handleSave = () => {
    const newDeck = deckInput
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0)

    if (newDeck.length > 0) {
      onSave(newDeck)
      setOpen(false)
    }
  }

  const applyPreset = (preset: keyof typeof PRESET_DECKS) => {
    setDeckInput(PRESET_DECKS[preset].join(', '))
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Customize Deck
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Card Deck</DialogTitle>
          <DialogDescription>
            Enter card values separated by commas. Changes will sync to all participants.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Presets</label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset('fibonacci')}
              >
                Fibonacci
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset('tshirt')}
              >
                T-Shirt Sizes
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset('powers')}
              >
                Powers of 2
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset('simple')}
              >
                Simple (1-5)
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Card Values</label>
            <Input
              value={deckInput}
              onChange={(e) => setDeckInput(e.target.value)}
              placeholder="?, 0, 1, 2, 3, 5, 8, 13, 20, 40, 100, ☕"
            />
            <p className="text-xs text-muted-foreground">
              Use ☕ for coffee break, ? for unknown
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Preview</label>
            <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg min-h-[60px]">
              {deckInput
                .split(',')
                .map((v) => v.trim())
                .filter((v) => v.length > 0)
                .map((card, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-card border border-border rounded text-sm font-medium"
                  >
                    {card}
                  </span>
                ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Deck
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
