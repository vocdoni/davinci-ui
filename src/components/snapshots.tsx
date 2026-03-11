import { Calendar, Wallet } from 'lucide-react'
import { IndeterminateProgress } from '~components/ui/indeterminate-progress'
import { Label } from '~components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~components/ui/select'
import type { Snapshot } from '~hooks/use-snapshots'

interface SnapshotsProps {
  snapshots: Snapshot[]
  isLoading: boolean
  isError: boolean
  selectedCensusRoot?: string
  onSnapshotSelect: (censusRoot: string) => void
}

export function Snapshots({ snapshots, isLoading, isError, selectedCensusRoot, onSnapshotSelect }: SnapshotsProps) {
  const formatSnapshotDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    })
  }

  // Group snapshots by queryName to get unique census types
  const censusTypes = snapshots.reduce(
    (acc, snapshot) => {
      if (!acc[snapshot.queryName]) {
        acc[snapshot.queryName] = []
      }
      acc[snapshot.queryName].push(snapshot)
      return acc
    },
    {} as Record<string, Snapshot[]>
  )

  // Get the currently selected snapshot
  const selectedSnapshot = selectedCensusRoot ? snapshots.find((s) => s.censusRoot === selectedCensusRoot) : null

  // If we have multiple census types, show a selector
  const showSelector = Object.keys(censusTypes).length > 1

  return (
    <div
      className={`${isError || (!isLoading && snapshots.length === 0) ? 'bg-red-200' : 'bg-davinci-digital-highlight'} ml-6 p-4 rounded-lg border border-davinci-callout-border`}
    >
      <div className='flex items-start gap-3'>
        <Wallet className='w-5 h-5 text-davinci-black-alt mt-0.5' />
        <div className='space-y-2 flex-1'>
          {isLoading ? (
            <div className='space-y-2'>
              <IndeterminateProgress className='h-1' />
              <div className='flex items-center gap-2 text-xs text-davinci-black-alt/70'>
                <Calendar className='w-3 h-3' />
                <span>Loading latest snapshot...</span>
              </div>
            </div>
          ) : isError || snapshots.length === 0 ? (
            <div className='flex items-center gap-2 text-xs text-davinci-black-alt/70'>
              <Calendar className='w-3 h-3' />
              <span className='text-red-800 font-bold'>
                {isError ? 'Error loading snapshot data' : 'No snapshot data available'}
              </span>
            </div>
          ) : (
            <div className='space-y-3'>
              {showSelector && (
                <div className='space-y-2'>
                  <Label className='text-davinci-black-alt text-sm'>Select a dynamic census</Label>
                  <Select value={selectedCensusRoot || ''} onValueChange={onSnapshotSelect}>
                    <SelectTrigger className='border-davinci-callout-border bg-davinci-text-base max-h-60 text-ellipsis text-clip'>
                      <SelectValue placeholder='Select a census type' />
                    </SelectTrigger>
                    <SelectContent className='bg-davinci-paper-base border-davinci-callout-border z-50'>
                      {Object.entries(censusTypes).map(([queryName, snapshots]) => {
                        // Use the most recent snapshot for each census type
                        const latestSnapshot = snapshots.sort(
                          (a, b) => new Date(b.snapshotDate).getTime() - new Date(a.snapshotDate).getTime()
                        )[0]

                        // Fallback display name: queryName + snapshot date
                        const displayText = latestSnapshot.displayName || 
                          `${latestSnapshot.queryName} (${formatSnapshotDate(latestSnapshot.snapshotDate)})`

                        return (
                          <SelectItem key={queryName} value={latestSnapshot.censusRoot}>
                            <div className='flex flex-row items-center gap-2'>
                              {latestSnapshot.displayAvatar && (
                                <img width='20px' src={latestSnapshot.displayAvatar} alt='' />
                              )}
                              <span>{displayText}</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedSnapshot && (
                <div className='flex items-center gap-2 text-xs text-davinci-black-alt/70'>
                  <Calendar className='w-3 h-3' />
                  <span>
                    Snapshot taken: {formatSnapshotDate(selectedSnapshot.snapshotDate)}(
                    {selectedSnapshot.participantCount.toLocaleString()} participants)
                  </span>
                </div>
              )}

              {!showSelector && snapshots.length > 0 && !selectedSnapshot && (
                <div className='flex items-center gap-2 text-xs text-davinci-black-alt/70'>
                  <Calendar className='w-3 h-3' />
                  <span>
                    Snapshot taken: {formatSnapshotDate(snapshots[0].snapshotDate)}(
                    {snapshots[0].participantCount.toLocaleString()} participants)
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
