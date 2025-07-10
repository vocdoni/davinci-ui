import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import {
  deployedAddresses,
  ProcessRegistryService,
  ProcessStatus,
  SmartContractService,
} from '@vocdoni/davinci-sdk/contracts'
import {
  ElectionResultsTypeNames,
  type BallotMode,
  type ElectionMetadata,
  type ElectionResultsType,
  type ProtocolVersion,
} from '@vocdoni/davinci-sdk/core'
import { createProcessSignatureMessage } from '@vocdoni/davinci-sdk/sequencer'
import { BrowserProvider, type Eip1193Provider } from 'ethers'
import { CheckCircle, Clock, GripVertical, HelpCircle, Plus, Rocket, Users, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '~components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~components/ui/card'
import { Input } from '~components/ui/input'
import { Label } from '~components/ui/label'
import { RadioGroup, RadioGroupItem } from '~components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~components/ui/select'
import { Separator } from '~components/ui/separator'
import { Textarea } from '~components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~components/ui/tooltip'
import { useSnapshots } from '~hooks/use-snapshots'
import { CustomAddressesManager } from './census-addresses'
import { Snapshots } from './snapshots'
import ConnectWalletButton from './ui/connect-wallet-button'
import { Link } from './ui/link'
import { useVocdoniApi } from './vocdoni-api-context'

interface Choice {
  id: string
  text: string
}

const durationUnits = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
] as const

type DurationUnit = (typeof durationUnits)[number]['value']

type Purosesu = {
  question: string
  choices: Choice[]
  votingMethod: string
  multipleChoiceMin: string
  multipleChoiceMax: string
  quadraticCredits: string
  censusType: string
  duration: string
  durationUnit: DurationUnit
  customAddresses: string[]
  selectedCensusRoot?: string
}

// Sortable Choice Item Component
interface SortableChoiceItemProps {
  choice: Choice
  index: number
  onUpdate: (id: string, text: string) => void
  onRemove: (id: string) => void
  canRemove: boolean
}

function SortableChoiceItem({ choice, index, onUpdate, onRemove, canRemove }: SortableChoiceItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: choice.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className='flex gap-2 items-center'>
      <div
        {...attributes}
        {...listeners}
        className='flex items-center justify-center w-8 h-8 cursor-grab active:cursor-grabbing text-davinci-black-alt/60 hover:text-davinci-black-alt hover:bg-davinci-soft-neutral/20 rounded border border-davinci-callout-border'
      >
        <GripVertical className='w-4 h-4' />
      </div>
      <div className='flex-1'>
        <Input
          placeholder={`Choice ${index + 1}`}
          value={choice.text}
          onChange={(e) => onUpdate(choice.id, e.target.value)}
          className='border-davinci-callout-border'
        />
      </div>
      {canRemove && (
        <Button
          type='button'
          variant='outline'
          size='icon'
          onClick={() => onRemove(choice.id)}
          className='border-davinci-callout-border hover:bg-davinci-soft-neutral/20'
        >
          <X className='w-4 h-4' />
        </Button>
      )}
    </div>
  )
}

export function CreateVoteForm() {
  const navigate = useNavigate()
  const [isLaunching, setIsLaunching] = useState(false)
  const [launchSuccess, setLaunchSuccess] = useState(false)
  const { address, isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('eip155')
  const [error, setError] = useState<Error | null>(null)
  const [formData, setFormData] = useState<Purosesu>({
    question: '',
    choices: [
      { id: '1', text: '' },
      { id: '2', text: '' },
    ],
    votingMethod: '',
    multipleChoiceMin: '1',
    multipleChoiceMax: '2',
    quadraticCredits: '100',
    censusType: '',
    duration: '',
    durationUnit: 'minutes',
    customAddresses: address ? [address] : [],
  })
  const api = useVocdoniApi()
  const { data: snapshots, isLoading: isLoadingSnapshot, isError: isSnapshotError } = useSnapshots()

  const addChoice = () => {
    if (formData.choices.length < 8) {
      const newChoice = {
        id: Date.now().toString(),
        text: '',
      }
      setFormData({
        ...formData,
        choices: [...formData.choices, newChoice],
      })
    }
  }

  const removeChoice = (id: string) => {
    if (formData.choices.length > 2) {
      setFormData({
        ...formData,
        choices: formData.choices.filter((choice) => choice.id !== id),
      })
    }
  }

  const updateChoice = (id: string, text: string) => {
    setFormData({
      ...formData,
      choices: formData.choices.map((choice) => (choice.id === id ? { ...choice, text } : choice)),
    })
  }

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = formData.choices.findIndex((choice) => choice.id === active.id)
      const newIndex = formData.choices.findIndex((choice) => choice.id === over.id)

      const newChoices = arrayMove(formData.choices, oldIndex, newIndex)
      setFormData({
        ...formData,
        choices: newChoices,
      })
    }
  }

  const handleLaunch = async () => {
    if (!isFormValid() || !isConnected || !walletProvider) return

    setIsLaunching(true)
    setError(null)

    try {
      const census = {
        censusURI: '',
        censusRoot: '',
        censusSize: 0,
      }
      switch (formData.censusType) {
        case 'ethereum-wallets': {
          if (!snapshots || snapshots.length === 0) {
            throw new Error('No snapshot data available')
          }

          // Find the selected snapshot by censusRoot, or use the first one if none selected
          const selectedSnapshot = formData.selectedCensusRoot
            ? snapshots.find((s) => s.censusRoot === formData.selectedCensusRoot)
            : snapshots[0]

          if (!selectedSnapshot) {
            throw new Error('Selected snapshot not found')
          }

          census.censusSize = selectedSnapshot.participantCount
          census.censusRoot = selectedSnapshot.censusRoot
          census.censusURI = `${import.meta.env.BIGQUERY_URL}/censuses/${selectedSnapshot.censusRoot}`
          break
        }
        default: {
          if (formData.customAddresses.length === 0) {
            throw new Error('Please add at least one address to the custom addresses list')
          }

          // Step 1: Create census
          const censusId = await api.createCensus()

          // Step 2: Add participants
          const participants = formData.customAddresses.map((address) => ({
            key: address,
            weight: '1',
          }))
          await api.addParticipants(censusId, participants)
          const censusRoot = await api.getCensusRoot(censusId)
          const censusSize = await api.getCensusSize(censusId)

          census.censusURI = censusId
          census.censusRoot = censusRoot
          census.censusSize = censusSize
          break
        }
      }

      console.info('Census created:', census)

      // Step 7: Create and push metadata
      const metadata: ElectionMetadata = {
        title: { default: formData.question },
        description: { default: '' },
        media: { header: '', logo: '' },
        questions: [
          {
            title: { default: formData.question },
            description: { default: '' },
            meta: {},
            choices: formData.choices
              .filter((choice) => choice.text.trim() !== '')
              .map((choice, index) => ({
                title: { default: choice.text },
                value: index,
                meta: {},
              })),
          },
        ],
        version: '1.2' as ProtocolVersion,
        meta: {},
        type: {
          name: formData.votingMethod as ElectionResultsTypeNames,
          properties: {} as Record<string, never>,
        } as ElectionResultsType,
      }
      const metadataHash = await api.pushMetadata(metadata)
      const metadataUrl = api.getMetadataUrl(metadataHash)
      console.info('ℹ️ Metadata URL:', metadataUrl)

      const provider = new BrowserProvider(walletProvider as Eip1193Provider)
      const signer = await provider.getSigner()
      const registry = new ProcessRegistryService(deployedAddresses.processRegistry.sepolia, signer)
      const pid = await registry.getNextProcessId(await signer.getAddress())
      console.info('ℹ️ Process ID:', pid)

      const message = await createProcessSignatureMessage(pid)
      const signature = await signer.signMessage(message)

      const ballotMode = generateBallotMode(metadata, formData)
      console.info('ℹ️ Ballot mode:', ballotMode)

      const { processId, encryptionPubKey, stateRoot } = await api.createProcess({
        processId: pid,
        censusRoot: census.censusRoot,
        ballotMode,
        signature,
      })
      console.info('✅ Process created with ID:', processId, stateRoot)

      console.info('ℹ️ Creating new process with data:', [
        ProcessStatus.READY,
        Math.floor(Date.now() / 1000) + 60,
        Number.parseInt(formData.duration) * (formData.durationUnit === 'hours' ? 3600 : 60),
        ballotMode,
        {
          censusOrigin: 1,
          maxVotes: census.censusSize.toString(),
          censusRoot: census.censusRoot,
          censusURI: census.censusURI,
        },
        metadataUrl,
        { x: encryptionPubKey[0], y: encryptionPubKey[1] },
        BigInt(stateRoot),
      ])

      // Step 10: Submit newProcess on-chain
      await SmartContractService.executeTx(
        registry.newProcess(
          ProcessStatus.READY,
          Math.floor(Date.now() / 1000) + 60,
          Number.parseInt(formData.duration) * (formData.durationUnit === 'hours' ? 3600 : 60),
          ballotMode,
          {
            censusOrigin: 1,
            maxVotes: census.censusSize.toString(),
            censusRoot: census.censusRoot,
            censusURI: census.censusURI,
          },
          metadataUrl,
          { x: encryptionPubKey[0], y: encryptionPubKey[1] },
          BigInt(stateRoot)
        )
      )

      setLaunchSuccess(true)
      console.log('Vote launched successfully with process ID:', processId)

      // Wait to navigate
      while (true) {
        try {
          const process = await api.getProcess(processId)
          if (process.isAcceptingVotes) {
            navigate(`/vote/${processId}`)
            break
          }
        } catch (e) {}

        await new Promise((r) => setTimeout(r, 2500))
      }
    } catch (error) {
      console.error('Failed to launch vote:', error)
      setError(error as Error)
      setIsLaunching(false)
      // In a real app, you'd show an error message here
    }
  }

  const isFormValid = () => {
    const hasQuestion = formData.question.trim() !== ''
    const hasValidChoices = formData.choices.filter((choice) => choice.text.trim() !== '').length >= 2
    const hasVotingMethod = formData.votingMethod !== ''
    const hasCensusType = formData.censusType !== ''
    const hasDuration = formData.duration !== '' && Number.parseInt(formData.duration) > 0
    const hasAddresses =
      formData.censusType !== 'custom-addresses' || formData.customAddresses.filter(Boolean).length > 0

    return hasQuestion && hasValidChoices && hasVotingMethod && hasCensusType && hasDuration && hasAddresses
  }

  // Show success state
  if (launchSuccess) {
    return (
      <div className='space-y-8'>
        <Card className='border-davinci-callout-border'>
          <CardContent className='p-12 text-center'>
            <div className='space-y-6'>
              <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto'>
                <CheckCircle className='w-10 h-10 text-green-600' />
              </div>
              <div>
                <h2 className='text-2xl font-bold text-davinci-black-alt mb-2'>Vote Launched Successfully!</h2>
                <p className='text-davinci-black-alt/80'>
                  Your vote has been deployed to the DAVINCI network and is now live.
                </p>
              </div>
              <div className='bg-davinci-digital-highlight p-4 rounded-lg border border-davinci-callout-border max-w-md mx-auto'>
                <p className='text-sm text-davinci-black-alt/80'>
                  Redirecting you to the vote page where you can share it with the community...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className='space-y-8'>
        {/* Section 1: Question and Choices */}
        <Card className='border-davinci-callout-border'>
          <CardHeader className='bg-davinci-paper-base'>
            <CardTitle className='flex items-center gap-2 text-davinci-black-alt'>
              <HelpCircle className='w-5 h-5' />
              1. Question and Choices
            </CardTitle>
            <CardDescription className='text-davinci-black-alt/70'>
              Define your voting question and provide up to 8 choices for voters
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6 pt-6 bg-davinci-text-base'>
            <div className='space-y-2'>
              <Label htmlFor='question' className='text-davinci-black-alt'>
                Vote Question
              </Label>
              <Textarea
                id='question'
                placeholder='What would you like to ask voters?'
                rows={3}
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className='border-davinci-callout-border'
              />
            </div>

            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <Label className='text-davinci-black-alt'>Choices ({formData.choices.length}/8)</Label>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={addChoice}
                  disabled={formData.choices.length >= 8}
                  className='border-davinci-callout-border text-davinci-black-alt hover:bg-davinci-soft-neutral/20'
                >
                  <Plus className='w-4 h-4 mr-1' />
                  Add Choice
                </Button>
              </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={formData.choices.map((choice) => choice.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className='space-y-3'>
                    {formData.choices.map((choice, index) => (
                      <SortableChoiceItem
                        key={choice.id}
                        choice={choice}
                        index={index}
                        onUpdate={updateChoice}
                        onRemove={removeChoice}
                        canRemove={formData.choices.length > 2}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            <Separator className='bg-davinci-callout-border' />

            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Label className='text-davinci-black-alt'>Voting Method</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className='w-4 h-4 text-davinci-black-alt/60' />
                  </TooltipTrigger>
                  <TooltipContent className='bg-davinci-paper-base text-davinci-black-alt border-davinci-callout-border max-w-xs'>
                    <p>
                      This miniapp offers 3 voting methods, but DAVINCI allows any type of voting method thanks to the
                      use of a{' '}
                      <a
                        href='https://developer.vocdoni.io/protocol/ballot-protocol'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='underline hover:text-davinci-black-alt/80'
                      >
                        ballot protocol
                      </a>
                      .
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <RadioGroup
                value={formData.votingMethod}
                onValueChange={(value) => setFormData({ ...formData, votingMethod: value })}
              >
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem
                    value={ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION}
                    id='single-choice'
                    className='border-davinci-callout-border'
                  />
                  <Label htmlFor='single-choice' className='text-davinci-black-alt'>
                    Single Choice
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem
                    value={ElectionResultsTypeNames.MULTIPLE_CHOICE}
                    id='multiple-choice'
                    className='border-davinci-callout-border'
                  />
                  <Label htmlFor='multiple-choice' className='text-davinci-black-alt'>
                    Multiple Choice
                  </Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className='w-4 h-4 text-davinci-black-alt/60' />
                    </TooltipTrigger>
                    <TooltipContent className='bg-davinci-paper-base text-davinci-black-alt border-davinci-callout-border'>
                      <p>Voters can select multiple options within specified limits</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem
                    value={ElectionResultsTypeNames.QUADRATIC}
                    id='quadratic-voting'
                    className='border-davinci-callout-border'
                  />
                  <Label htmlFor='quadratic-voting' className='text-davinci-black-alt'>
                    Quadratic Voting
                  </Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className='w-4 h-4 text-davinci-black-alt/60' />
                    </TooltipTrigger>
                    <TooltipContent className='bg-davinci-paper-base text-davinci-black-alt border-davinci-callout-border'>
                      <p>Voters allocate credits to express preference intensity</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </RadioGroup>

              {/* Multiple Choice Configuration */}
              {formData.votingMethod === 'multiple-choice' && (
                <div className='bg-davinci-digital-highlight p-4 rounded-lg space-y-4 border border-davinci-callout-border'>
                  <h4 className='font-medium text-davinci-black-alt'>Multiple Choice Configuration</h4>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='min-selections' className='text-davinci-black-alt'>
                        Minimum Selections
                      </Label>
                      <Select
                        value={formData.multipleChoiceMin}
                        onValueChange={(value) => setFormData({ ...formData, multipleChoiceMin: value })}
                      >
                        <SelectTrigger className='border-davinci-callout-border'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className='bg-davinci-paper-base border-davinci-callout-border'>
                          {Array.from({ length: Math.min(formData.choices.length, 8) }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor='max-selections' className='text-davinci-black-alt'>
                        Maximum Selections
                      </Label>
                      <Select
                        value={formData.multipleChoiceMax}
                        onValueChange={(value) => setFormData({ ...formData, multipleChoiceMax: value })}
                      >
                        <SelectTrigger className='border-davinci-callout-border'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className='bg-davinci-paper-base border-davinci-callout-border'>
                          {Array.from({ length: Math.min(formData.choices.length, 8) }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className='text-sm text-davinci-black-alt/80'>
                    Voters must select between {formData.multipleChoiceMin} and {formData.multipleChoiceMax} options.
                  </p>
                </div>
              )}

              {/* Quadratic Voting Configuration */}
              {formData.votingMethod === ElectionResultsTypeNames.QUADRATIC && (
                <div className='bg-davinci-digital-highlight p-4 rounded-lg space-y-4 border border-davinci-callout-border'>
                  <h4 className='font-medium text-davinci-black-alt'>Quadratic Voting Configuration</h4>
                  <div>
                    <Label htmlFor='credits' className='text-davinci-black-alt'>
                      Credits per Voter
                    </Label>
                    <Input
                      id='credits'
                      type='number'
                      min='1'
                      max='256'
                      value={formData.quadraticCredits}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quadraticCredits: e.target.value,
                        })
                      }
                      className='border-davinci-callout-border'
                    />
                  </div>
                  <p className='text-sm text-davinci-black-alt/80'>
                    Each voter will receive {formData.quadraticCredits} credits to allocate across choices. The cost to
                    vote increases quadratically (1 vote = 1 credit, 2 votes = 4 credits, etc.).
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Vote Configuration */}
        <Card className='border-davinci-callout-border'>
          <CardHeader className='bg-davinci-paper-base'>
            <CardTitle className='flex items-center gap-2 text-davinci-black-alt'>
              <Users className='w-5 h-5' />
              2. Vote Configuration
            </CardTitle>
            <CardDescription className='text-davinci-black-alt/70'>
              Configure voter eligibility and voting duration
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6 pt-6 bg-davinci-text-base'>
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Label className='text-davinci-black-alt'>Census Type</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className='w-4 h-4 text-davinci-black-alt/60' />
                  </TooltipTrigger>
                  <TooltipContent className='bg-davinci-paper-base text-davinci-black-alt border-davinci-callout-border max-w-xs'>
                    <p>
                      This miniapp showcases two census types, but the DAVINCI Protocol is designed to be compatible
                      with a wide range of census types and authentication methods. Censuses are based on snapshots that
                      are automatically updated every hour.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <RadioGroup
                value={formData.censusType}
                onValueChange={(value) => setFormData({ ...formData, censusType: value })}
              >
                <div className='space-y-2'>
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem
                      value='custom-addresses'
                      id='custom-addresses'
                      className='border-davinci-callout-border'
                    />
                    <Label htmlFor='custom-addresses' className='text-davinci-black-alt'>
                      Custom Addresses
                    </Label>
                  </div>
                  {formData.censusType === 'custom-addresses' && (
                    <div className='ml-6 bg-davinci-digital-highlight p-4 rounded-lg border border-davinci-callout-border space-y-3'>
                      <CustomAddressesManager
                        addresses={formData.customAddresses}
                        setAddresses={(newAddresses) =>
                          setFormData((prev) => ({ ...prev, customAddresses: newAddresses }))
                        }
                      />
                    </div>
                  )}

                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem
                      value='ethereum-wallets'
                      id='ethereum-wallets'
                      className='border-davinci-callout-border'
                    />
                    <Label htmlFor='ethereum-wallets' className='text-davinci-black-alt'>
                      Prebuilt censuses
                    </Label>
                  </div>
                  {formData.censusType === 'ethereum-wallets' && (
                    <Snapshots
                      snapshots={snapshots || []}
                      isLoading={isLoadingSnapshot}
                      isError={isSnapshotError}
                      selectedCensusRoot={formData.selectedCensusRoot}
                      onSnapshotSelect={(censusRoot) =>
                        setFormData((prev) => ({ ...prev, selectedCensusRoot: censusRoot }))
                      }
                    />
                  )}
                </div>
              </RadioGroup>
            </div>

            <Separator className='bg-davinci-callout-border' />

            <div className='space-y-4'>
              <Label className='text-davinci-black-alt'>Voting Duration</Label>
              <div className='flex gap-4'>
                <div className='flex-1'>
                  <Input
                    type='number'
                    min='1'
                    placeholder='Duration'
                    value={formData.duration}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '' || Number.parseInt(value) >= 0) {
                        setFormData({ ...formData, duration: value })
                      }
                    }}
                    className='border-davinci-callout-border'
                  />
                </div>
                <div className='w-32'>
                  <Select
                    value={formData.durationUnit}
                    onValueChange={(value) => setFormData({ ...formData, durationUnit: value as DurationUnit })}
                  >
                    <SelectTrigger className='border-davinci-callout-border'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className='bg-davinci-paper-base border-davinci-callout-border'>
                      {durationUnits.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.duration && Number.parseInt(formData.duration) > 0 && (
                <div className='bg-davinci-digital-highlight p-4 rounded-lg border border-davinci-callout-border'>
                  <div className='flex items-start gap-3'>
                    <Clock className='w-5 h-5 text-davinci-black-alt mt-0.5' />
                    <div>
                      <h4 className='font-medium text-davinci-black-alt'>Voting Period</h4>
                      <p className='text-sm text-davinci-black-alt/80'>
                        Your vote will be active for {formData.duration} {formData.durationUnit}. Once started, this
                        cannot be changed.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Launch */}
        <Card className='border-davinci-callout-border'>
          <CardHeader className='bg-davinci-paper-base'>
            <CardTitle className='flex items-center gap-2 text-davinci-black-alt'>
              <Rocket className='w-5 h-5' />
              3. Launch Your Vote
            </CardTitle>
            <CardDescription className='text-davinci-black-alt/70'>
              Review your configuration and launch your decentralized vote
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6 pt-6 bg-davinci-text-base'>
            {/* Ready to Launch Section */}
            <div className='text-center space-y-4'>
              <div className='flex justify-center items-center mx-auto'>
                <img src='/images/davinci-icon.png' alt='DAVINCI' className='w-16 h-16' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-davinci-black-alt'>Ready to Launch</h3>
                <p className='text-davinci-black-alt/80'>
                  Your vote will be deployed to the DAVINCI network and become immediately active.
                </p>
              </div>
              {error && (
                <div className='bg-red-100 p-4 rounded-lg border border-red-200 text-red-800'>
                  <p className='text-sm'>Error launching vote: {error.message}</p>
                </div>
              )}
              <LaunchVoteButton handleLaunch={handleLaunch} isLaunching={isLaunching} isFormValid={isFormValid} />
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}

type LaunchVoteButtonProps = {
  handleLaunch: () => void
  isLaunching: boolean
  isFormValid: () => boolean
}

const LaunchVoteButton = ({ handleLaunch, isLaunching, isFormValid }: LaunchVoteButtonProps) => {
  const { isConnected } = useAppKitAccount()
  if (!isConnected) {
    return <ConnectWalletButton />
  }

  return (
    <>
      <Button
        onClick={handleLaunch}
        disabled={!isFormValid() || isLaunching}
        className='bg-davinci-black-alt hover:bg-davinci-black-alt/90 text-davinci-text-base'
      >
        {isLaunching ? (
          <>
            <div className='w-4 h-4 border-2 border-davinci-text-base/30 border-t-davinci-text-base rounded-full animate-spin mr-2' />
            Launching Vote...
          </>
        ) : (
          <>
            <img src='/images/davinci-icon.png' alt='' className='w-4 h-4 mr-2' />
            Launch Vote
          </>
        )}
      </Button>
      {isLaunching && (
        <div className='bg-davinci-digital-highlight p-4 rounded-lg border border-davinci-callout-border max-w-md mx-auto'>
          <p className='text-sm text-davinci-black-alt/80'>
            Deploying your vote to the DAVINCI network. This may take a few moments...
          </p>
        </div>
      )}
      <div className='ml-6 text-left text-davinci-black-alt/80 text-sm'>
        Creating a vote requires a tx on the Sepolia testnet. If you need ETH to run a vote, you can get some from{' '}
        <Link href='https://cloud.google.com/application/web3/faucet/ethereum/sepolia'>this faucet</Link>. The tx is
        only needed to create the vote, <span className='font-medium'>casting votes is gasless.</span>
      </div>
    </>
  )
}

const generateBallotMode = (election: ElectionMetadata, form: Purosesu): BallotMode => {
  const maxValue = Math.pow(2, 16).toString()
  switch (election.type.name) {
    default:
    case ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION:
      return {
        maxCount: 1,
        maxValue,
        minValue: '0',
        forceUniqueness: false,
        costFromWeight: true,
        costExponent: 1,
        maxTotalCost: election.questions[0].choices.length.toString(),
        minTotalCost: '0',
      }
    case ElectionResultsTypeNames.MULTIPLE_CHOICE:
      return {
        maxCount: election.questions[0].choices.length,
        maxValue,
        minValue: '0',
        forceUniqueness: false,
        costFromWeight: true,
        costExponent: 1,
        maxTotalCost: form.multipleChoiceMax,
        minTotalCost: form.multipleChoiceMin,
      }
    case ElectionResultsTypeNames.QUADRATIC:
      return {
        maxCount: election.questions[0].choices.length,
        maxValue: (Math.floor(Math.sqrt(Number(form.quadraticCredits))) + 1).toString(),
        minValue: '0',
        forceUniqueness: false,
        costFromWeight: true,
        costExponent: 2,
        maxTotalCost: form.quadraticCredits,
        minTotalCost: '0',
      }
  }
}
