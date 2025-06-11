import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart2, Search, User } from 'lucide-react'
import { useEffect, useState } from 'react'

// Types for our voting process
interface VotingProcess {
  id: string
  title: string
  txHash: string
  votesCount: number
  type: 'Single Choice' | 'Multiple Choice' | 'Quadratic'
  points: number
  timestamp: string
  creator: string
}

// Generate dummy data for all votes
const generateDummyData = (): VotingProcess[] => {
  const types: ('Single Choice' | 'Multiple Choice' | 'Quadratic')[] = ['Single Choice', 'Multiple Choice', 'Quadratic']
  const titles = [
    'Should we adopt proposal XYZ?',
    'Community fund allocation Q3',
    'New governance structure vote',
    'Protocol upgrade decision',
    'Treasury management strategy',
    'Delegate selection for council',
    'Fee structure modification',
    'Partnership with external project',
    'Development roadmap priorities',
    'Token emission schedule change',
  ]

  const creators = [
    '0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e',
    'alice.eth',
    '0x8ba1f109551bD432803012645Hac136c22C501e',
    'bob.eth',
    '0x1234567890123456789012345678901234567890',
    'charlie.eth',
    '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    'dao-treasury.eth',
    '0x9876543210987654321098765432109876543210',
    'community.eth',
  ]

  return Array.from({ length: 20 }, (_, i) => {
    const randomTitle = titles[Math.floor(Math.random() * titles.length)]
    const randomType = types[Math.floor(Math.random() * types.length)]
    const randomCreator = creators[Math.floor(Math.random() * creators.length)]
    const votesCount = Math.floor(Math.random() * 1000) + 10
    const points = Math.floor(votesCount * (Math.random() * 0.5 + 0.5))

    // Generate a random date within the last 30 days
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 30))

    return {
      id: `vote-${i + 1}`,
      title: randomTitle,
      txHash: `0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}...`,
      votesCount,
      type: randomType,
      points,
      timestamp: date.toLocaleString(),
      creator: randomCreator,
    }
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Generate sample data for "My Votes" (johndoe.eth)
const generateMyVotesData = (): VotingProcess[] => {
  const myTitles = [
    'Community Treasury Allocation for Q4 2024',
    'Should we implement staking rewards?',
    'New partnership with DeFi protocol',
    'Governance token distribution model',
    'Protocol fee adjustment proposal',
  ]

  const types: ('Single Choice' | 'Multiple Choice' | 'Quadratic')[] = ['Single Choice', 'Multiple Choice', 'Quadratic']

  return Array.from({ length: 5 }, (_, i) => {
    const randomType = types[Math.floor(Math.random() * types.length)]
    const votesCount = Math.floor(Math.random() * 500) + 50
    const points = Math.floor(votesCount * (Math.random() * 0.3 + 0.7)) // Higher points ratio for my votes

    // Generate dates within the last 15 days for my votes
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 15))

    return {
      id: `my-vote-${i + 1}`,
      title: myTitles[i],
      txHash: `0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}...`,
      votesCount,
      type: randomType,
      points,
      timestamp: date.toLocaleString(),
      creator: 'johndoe.eth',
    }
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export default function ExplorerPage() {
  const [allVotes, setAllVotes] = useState<VotingProcess[]>([])
  const [myVotes, setMyVotes] = useState<VotingProcess[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [isClient, setIsClient] = useState(false)
  const [walletConnected, setWalletConnected] = useState(true) // Simulating connected wallet

  useEffect(() => {
    // Mark that we're now client-side
    setIsClient(true)

    // Initialize with dummy data
    setAllVotes(generateDummyData())
    setMyVotes(generateMyVotesData())

    // Simulate new votes coming in every 20 seconds for all votes
    const interval = setInterval(() => {
      setAllVotes((currentProcesses) => {
        if (!currentProcesses || currentProcesses.length === 0) return generateDummyData()

        const updatedProcesses = [...currentProcesses]
        const randomIndex = Math.floor(Math.random() * updatedProcesses.length)
        const additionalVotes = Math.floor(Math.random() * 10) + 1

        updatedProcesses[randomIndex] = {
          ...updatedProcesses[randomIndex],
          votesCount: updatedProcesses[randomIndex].votesCount + additionalVotes,
          points: updatedProcesses[randomIndex].points + Math.floor(additionalVotes * 0.8),
        }

        return updatedProcesses.sort((a, b) => b.points - a.points)
      })
    }, 20000)

    return () => clearInterval(interval)
  }, [])

  // Get current data based on active tab
  const getCurrentData = () => {
    return activeTab === 'all' ? allVotes : myVotes
  }

  // Filter voting processes based on search term
  const filteredProcesses =
    isClient && getCurrentData().length > 0
      ? getCurrentData().filter(
          (process) =>
            process.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            process.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
            process.creator.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : []

  // Format creator address for display
  const formatCreator = (creator: string) => {
    if (creator.endsWith('.eth')) {
      return creator
    }
    // Truncate long addresses
    return `${creator.slice(0, 6)}...${creator.slice(-4)}`
  }

  // If we're not on the client yet, show a loading state
  if (!isClient) {
    return (
      <div className='px-4'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-12'>
            <h1 className='text-4xl font-bold text-davinci-black-alt mb-4 font-averia'>Vote Explorer</h1>
            <p className='text-lg text-davinci-black-alt/80 max-w-2xl mx-auto'>Loading voting processes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='px-4'>
      <div className='max-w-6xl mx-auto'>
        {/* Page Header */}
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-davinci-black-alt mb-4 font-averia'>Vote Explorer</h1>
          <p className='text-lg text-davinci-black-alt/80 max-w-2xl mx-auto'>
            A simple explorer to view voting processes created on the DAVINCI network. Voting processes earn points
            based on the number of votes cast, encouraging active participation.
          </p>
        </div>

        <Card className='border-davinci-callout-border mb-8'>
          <CardHeader className='bg-davinci-paper-base'>
            <CardTitle className='flex items-center gap-2 text-davinci-black-alt'>
              <BarChart2 className='w-5 h-5' />
              Voting Processes
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-6 bg-davinci-text-base'>
            <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
                <TabsList className='grid w-full sm:w-auto grid-cols-2 bg-davinci-soft-neutral'>
                  <TabsTrigger
                    value='all'
                    className='data-[state=active]:bg-davinci-paper-base data-[state=active]:text-davinci-black-alt'
                  >
                    All Votes
                  </TabsTrigger>
                  {walletConnected && (
                    <TabsTrigger
                      value='my'
                      className='data-[state=active]:bg-davinci-paper-base data-[state=active]:text-davinci-black-alt'
                    >
                      <User className='w-4 h-4 mr-1' />
                      My Votes
                    </TabsTrigger>
                  )}
                </TabsList>

                <div className='relative flex-1 sm:max-w-sm'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-davinci-black-alt/60 w-4 h-4' />
                  <Input
                    placeholder='Search by title, hash, or creator'
                    className='pl-10 border-davinci-callout-border'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <TabsContent value='all' className='mt-0'>
                <div className='rounded-md border border-davinci-callout-border overflow-hidden'>
                  <div className='overflow-x-auto'>
                    <Table>
                      <TableHeader className='bg-davinci-paper-base'>
                        <TableRow>
                          <TableHead className='text-davinci-black-alt min-w-[200px]'>Title</TableHead>
                          <TableHead className='text-davinci-black-alt min-w-[120px]'>Creator</TableHead>
                          <TableHead className='text-davinci-black-alt min-w-[140px]'>Transaction</TableHead>
                          <TableHead className='text-davinci-black-alt text-center min-w-[120px]'>Type</TableHead>
                          <TableHead className='text-davinci-black-alt text-right min-w-[80px]'>Votes</TableHead>
                          <TableHead className='text-davinci-black-alt text-right min-w-[80px]'>Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProcesses.map((process) => (
                          <TableRow key={process.id} className='hover:bg-davinci-paper-base/20'>
                            <TableCell className='font-medium text-davinci-black-alt'>
                              <div className='max-w-[200px]'>
                                <div className='truncate'>
                                  {process.title.length > 40 ? `${process.title.substring(0, 40)}...` : process.title}
                                </div>
                                <div className='text-xs text-davinci-black-alt/60 mt-1'>{process.timestamp}</div>
                              </div>
                            </TableCell>
                            <TableCell className='text-davinci-black-alt/80'>
                              <div className='font-mono text-sm'>{formatCreator(process.creator)}</div>
                            </TableCell>
                            <TableCell className='text-davinci-black-alt/80 font-mono text-sm'>
                              <div className='truncate max-w-[140px]'>{process.txHash}</div>
                            </TableCell>
                            <TableCell className='text-center'>
                              <Badge
                                className={`
                                  ${process.type === 'Single Choice' ? 'bg-davinci-soft-neutral' : ''}
                                  ${process.type === 'Multiple Choice' ? 'bg-davinci-digital-highlight' : ''}
                                  ${process.type === 'Quadratic' ? 'bg-davinci-secondary-accent' : ''}
                                  text-davinci-black-alt whitespace-nowrap
                                `}
                              >
                                {process.type}
                              </Badge>
                            </TableCell>
                            <TableCell className='text-right text-davinci-black-alt'>{process.votesCount}</TableCell>
                            <TableCell className='text-right font-medium text-davinci-black-alt'>
                              {process.points}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='my' className='mt-0'>
                <div className='rounded-md border border-davinci-callout-border overflow-hidden'>
                  <div className='overflow-x-auto'>
                    <Table>
                      <TableHeader className='bg-davinci-paper-base'>
                        <TableRow>
                          <TableHead className='text-davinci-black-alt min-w-[200px]'>Title</TableHead>
                          <TableHead className='text-davinci-black-alt min-w-[120px]'>Creator</TableHead>
                          <TableHead className='text-davinci-black-alt min-w-[140px]'>Transaction</TableHead>
                          <TableHead className='text-davinci-black-alt text-center min-w-[120px]'>Type</TableHead>
                          <TableHead className='text-davinci-black-alt text-right min-w-[80px]'>Votes</TableHead>
                          <TableHead className='text-davinci-black-alt text-right min-w-[80px]'>Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProcesses.length > 0 ? (
                          filteredProcesses.map((process) => (
                            <TableRow key={process.id} className='hover:bg-davinci-paper-base/20'>
                              <TableCell className='font-medium text-davinci-black-alt'>
                                <div className='max-w-[200px]'>
                                  <div className='truncate'>
                                    {process.title.length > 40 ? `${process.title.substring(0, 40)}...` : process.title}
                                  </div>
                                  <div className='text-xs text-davinci-black-alt/60 mt-1'>{process.timestamp}</div>
                                </div>
                              </TableCell>
                              <TableCell className='text-davinci-black-alt/80'>
                                <div className='font-mono text-sm flex items-center gap-2'>
                                  <User className='w-3 h-3' />
                                  {formatCreator(process.creator)}
                                </div>
                              </TableCell>
                              <TableCell className='text-davinci-black-alt/80 font-mono text-sm'>
                                <div className='truncate max-w-[140px]'>{process.txHash}</div>
                              </TableCell>
                              <TableCell className='text-center'>
                                <Badge
                                  className={`
                                    ${process.type === 'Single Choice' ? 'bg-davinci-soft-neutral' : ''}
                                    ${process.type === 'Multiple Choice' ? 'bg-davinci-digital-highlight' : ''}
                                    ${process.type === 'Quadratic' ? 'bg-davinci-secondary-accent' : ''}
                                    text-davinci-black-alt whitespace-nowrap
                                  `}
                                >
                                  {process.type}
                                </Badge>
                              </TableCell>
                              <TableCell className='text-right text-davinci-black-alt'>{process.votesCount}</TableCell>
                              <TableCell className='text-right font-medium text-davinci-black-alt'>
                                {process.points}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className='text-center py-8 text-davinci-black-alt/60'>
                              {searchTerm
                                ? 'No votes found matching your search.'
                                : "You haven't created any votes yet."}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
