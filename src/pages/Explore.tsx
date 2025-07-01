import { ElectionResultsTypeNames } from '@vocdoni/davinci-sdk'
import { BarChart2 } from 'lucide-react'
import { NewsletterCard } from '~components/newsletter-card'
import { useProcessList, useProcessQuery } from '~hooks/use-process-query'
import { Badge } from '~ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '~ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~ui/table'
import { Tabs, TabsContent } from '~ui/tabs'

const typesNames = {
  [ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION]: 'Single choice',
  [ElectionResultsTypeNames.MULTIPLE_CHOICE]: 'Multichoice',
  [ElectionResultsTypeNames.QUADRATIC]: 'Quadratic',
} as Record<ElectionResultsTypeNames, string>

const typesColors = {
  [ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION]: 'blue-200',
  [ElectionResultsTypeNames.MULTIPLE_CHOICE]: 'green-200',
  [ElectionResultsTypeNames.QUADRATIC]: 'yellow-200',
} as Record<ElectionResultsTypeNames, string>

function ProcessRow({ id }: { id: string }) {
  const { data, isLoading } = useProcessQuery(id)

  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={4} className='text-center text-davinci-black-alt/50'>
          Loading process...
        </TableCell>
      </TableRow>
    )
  }

  if (!data) {
    return (
      <TableRow>
        <TableCell colSpan={4} className='text-center text-davinci-black-alt/50'>
          Process has no metadata
        </TableCell>
      </TableRow>
    )
  }

  if (!data.meta) {
    return null
  }

  return (
    <TableRow key={id}>
      <TableCell className='font-medium text-davinci-black-alt'>
        <div className='max-w-[200px] truncate'>{data.meta?.title.default || 'Untitled Process'}</div>{' '}
      </TableCell>
      <TableCell className='text-davinci-black-alt/80'>
        <div className='font-mono text-sm'>
          {data.process.organizationId.slice(0, 6)}...{data.process.organizationId.slice(-4)}
        </div>
      </TableCell>
      <TableCell className='text-center'>
        <Badge
          className={`bg-${typesColors[data.meta?.type.name] || 'davinci-soft-neutral'} text-davinci-black-alt whitespace-nowrap`}
        >
          {typesNames[data.meta?.type.name] || 'Unknown'}
        </Badge>
      </TableCell>
      <TableCell className='text-right text-davinci-black-alt'>{data.process.voteCount ?? 0}</TableCell>
    </TableRow>
  )
}

export default function ExplorePage() {
  const { data: processIds, isLoading } = useProcessList()

  return (
    <div className='px-4'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-davinci-black-alt mb-4 font-averia'>Explore processes</h1>
          <p className='text-lg text-davinci-black-alt/80 max-w-2xl mx-auto'>
            Browse active and past votes on the DAVINCI Protocol. Voting may earn you future rewards.
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
          <div className='lg:col-span-8'>
            <Card className='border-davinci-callout-border'>
              <CardHeader className='bg-davinci-paper-base'>
                <CardTitle className='flex items-center gap-2 text-davinci-black-alt'>
                  <BarChart2 className='w-5 h-5' />
                  Voting Processes
                </CardTitle>
              </CardHeader>
              <CardContent className='pt-6 bg-davinci-text-base'>
                <Tabs value='all'>
                  <TabsContent value='all' className='mt-0'>
                    <div className='rounded-md border border-davinci-callout-border overflow-hidden'>
                      <div className='overflow-x-auto'>
                        <Table>
                          <TableHeader className='bg-davinci-paper-base'>
                            <TableRow>
                              <TableHead className='min-w-[200px]'>Title</TableHead>
                              <TableHead className='min-w-[120px]'>Creator</TableHead>
                              <TableHead className='min-w-[120px] text-center'>Type</TableHead>
                              <TableHead className='min-w-[80px] text-right'>Votes</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {isLoading && (
                              <TableRow>
                                <TableCell colSpan={4} className='text-center text-davinci-black-alt/50'>
                                  Loading processes...
                                </TableCell>
                              </TableRow>
                            )}
                            {processIds?.map((id) => <ProcessRow key={id} id={id} />)}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className='lg:col-span-4 space-y-6'>
            <NewsletterCard />
          </div>
        </div>
      </div>
    </div>
  )
}
