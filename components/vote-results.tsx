'use client'

import { Card, CardContent } from '@/components/ui/card'

interface VoteResultsProps {
  stats: {
    average: number
    median: number
    total: number
  } | null
}

export function VoteResults({ stats }: VoteResultsProps) {
  if (!stats) {
    return (
      <div className="p-6 bg-muted/50 rounded-lg text-center">
        <p className="text-muted-foreground">No numeric votes to calculate statistics</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-primary">{stats.average}</p>
          <p className="text-sm text-muted-foreground mt-1">Average</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-primary">{stats.median}</p>
          <p className="text-sm text-muted-foreground mt-1">Median</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-primary">{stats.total}</p>
          <p className="text-sm text-muted-foreground mt-1">Votes</p>
        </CardContent>
      </Card>
    </div>
  )
}
