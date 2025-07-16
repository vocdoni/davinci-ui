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
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { sepolia } from '@reown/appkit/networks'
import { useAppKitNetwork } from '@reown/appkit/react'
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
import { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm, type Control } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button } from '~components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~components/ui/card'
import { Input } from '~components/ui/input'
import { Label } from '~components/ui/label'
import { LabeledSwitch } from '~components/ui/labeled-switch'
import { RadioGroup, RadioGroupItem } from '~components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~components/ui/select'
import { Separator } from '~components/ui/separator'
import { Textarea } from '~components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~components/ui/tooltip'
import { useMiniApp } from '~contexts/MiniAppContext'
import { useSnapshots, type Snapshot } from '~hooks/use-snapshots'
import { useUnifiedProvider } from '~hooks/use-unified-provider'
import { useUnifiedWallet } from '~hooks/use-unified-wallet'
import { CustomAddressesManager } from './census-addresses'
import { Snapshots } from './snapshots'
import ConnectWalletButtonMiniApp from './ui/connect-wallet-button-miniapp'
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

type FormData = {
  question: string
  choices: Choice[]
  votingMethod: string
  multipleChoiceMin: string
  multipleChoiceMax: string
  quadraticCredits: string
  budgetCredits: string
  useWeightedVoting: boolean
  censusType: string
  duration: string
  durationUnit: DurationUnit
  customAddresses: string[]
  customAddressWeights: string[]
  selectedCensusRoot?: string
}

// Sortable Choice Item Component
interface SortableChoiceItemProps {
  choice: Choice
  index: number
  control: Control<FormData>
  onRemove: (id: string) => void
  canRemove: boolean
}

function SortableChoiceItem({ choice, index, control, onRemove, canRemove }: SortableChoiceItemProps) {
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
        <Controller
          name={`choices.${index}.text`}
          control={control}
          render={({ field }) => (
            <Input
              placeholder={`Choice ${index + 1}`}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={`poll-choice-${index + 1}`}
              className='border-davinci-callout-border'
            />
          )}
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
  const { address, isConnected } = useUnifiedWallet()
  const { getProvider } = useUnifiedProvider()
  const [error, setError] = useState<Error | null>(null)

  const form = useForm<FormData>({
    defaultValues: {
      question: '',
      choices: [
        { id: '1', text: '' },
        { id: '2', text: '' },
      ],
      votingMethod: '',
      multipleChoiceMin: '1',
      multipleChoiceMax: '2',
      quadraticCredits: '100',
      budgetCredits: '100',
      useWeightedVoting: false,
      censusType: '',
      duration: '',
      durationUnit: 'minutes',
      customAddresses: address ? [address] : [],
      customAddressWeights: address ? ['1'] : [],
    },
  })

  const { control, watch, setValue, getValues, handleSubmit } = form
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'choices',
  })

  const formData = watch()
  const api = useVocdoniApi()
  const { data: snapshots, isLoading: isLoadingSnapshot, isError: isSnapshotError } = useSnapshots()

  // Reset weighted voting when switching to non-proportional snapshots
  useEffect(() => {
    if (formData.censusType === 'ethereum-wallets' && formData.useWeightedVoting) {
      const selectedSnapshot = formData.selectedCensusRoot
        ? snapshots?.find((s) => s.censusRoot === formData.selectedCensusRoot)
        : snapshots?.[0]

      if (selectedSnapshot?.weightStrategy !== 'proportional') {
        setValue('useWeightedVoting', false)
      }
    }
  }, [formData.selectedCensusRoot, formData.censusType, formData.useWeightedVoting, snapshots, setValue])

  // Switch away from multiple choice when weighted voting is enabled (for custom addresses)
  useEffect(() => {
    if (
      formData.censusType === 'custom-addresses' &&
      formData.useWeightedVoting &&
      formData.votingMethod === ElectionResultsTypeNames.MULTIPLE_CHOICE
    ) {
      setValue('votingMethod', ElectionResultsTypeNames.BUDGET)
    }
  }, [formData.censusType, formData.useWeightedVoting, formData.votingMethod, setValue])

  const addChoice = () => {
    if (fields.length < 8) {
      append({
        id: Date.now().toString(),
        text: '',
      })
    }
  }

  const removeChoice = (id: string) => {
    if (fields.length > 2) {
      const index = fields.findIndex((field) => field.id === id)
      if (index !== -1) {
        remove(index)
      }
    }
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
      const oldIndex = fields.findIndex((field) => field.id === active.id)
      const newIndex = fields.findIndex((field) => field.id === over.id)

      move(oldIndex, newIndex)
    }
  }

  const handleLaunch = async (data: FormData) => {
    if (!isConnected) return

    setIsLaunching(true)
    setError(null)

    console.info('ℹ️ form data:', data)

    try {
      let selectedSnapshot: Snapshot | undefined
      if (snapshots?.length) {
        // Find the selected snapshot by censusRoot, or use the first one if none selected
        selectedSnapshot = formData.selectedCensusRoot
          ? snapshots.find((s) => s.censusRoot === formData.selectedCensusRoot)
          : snapshots[0]
      }

      const census = {
        censusURI: '',
        censusRoot: '',
        censusSize: 0,
      }
      switch (data.censusType) {
        case 'ethereum-wallets': {
          if (!snapshots || snapshots.length === 0) {
            throw new Error('No snapshot data available')
          }

          if (!selectedSnapshot) {
            throw new Error('Selected snapshot not found')
          }

          census.censusSize = selectedSnapshot.participantCount
          census.censusRoot = selectedSnapshot.censusRoot
          census.censusURI = `${import.meta.env.BIGQUERY_URL}/censuses/${selectedSnapshot.censusRoot}`
          break
        }
        default: {
          if (data.customAddresses.length === 0) {
            throw new Error('Please add at least one address to the custom addresses list')
          }

          // Step 1: Create census
          const censusId = await api.createCensus()

          // Step 2: Add participants
          const participants = data.customAddresses.map((address, index) => ({
            key: address,
            weight: data.useWeightedVoting && data.customAddressWeights[index] ? data.customAddressWeights[index] : '1',
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
        title: { default: data.question },
        description: { default: '' },
        media: { header: '', logo: '' },
        questions: [
          {
            title: { default: data.question },
            description: { default: '' },
            meta: {},
            choices: data.choices
              .filter((choice) => choice.text.trim() !== '')
              .map((choice, index) => ({
                title: { default: choice.text },
                value: index,
                meta: {},
              })),
          },
        ],
        version: '1.2' as ProtocolVersion,
        type: {
          name: data.votingMethod as ElectionResultsTypeNames,
          properties: {} as Record<string, never>,
        } as ElectionResultsType,
      }

      if (formData.censusType === 'ethereum-wallets' && selectedSnapshot) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(metadata.meta as any) = {
          census: {
            type: 'bigquery',
            name: selectedSnapshot.displayName,
            query: selectedSnapshot.queryName,
          },
        }
      }

      const metadataHash = await api.pushMetadata(metadata)
      const metadataUrl = api.getMetadataUrl(metadataHash)
      console.info('ℹ️ Metadata URL:', metadataUrl)

      // Use provider for process creation (check wallet capabilities)
      const walletProvider = await getProvider()
      if (!walletProvider) {
        throw new Error('Wallet provider not available.')
      }
      const provider = new BrowserProvider(walletProvider as Eip1193Provider)
      console.info('ℹ️ Browser provider initialized:', provider)
      const signer = await provider.getSigner()
      const registry = new ProcessRegistryService(deployedAddresses.processRegistry.sepolia, signer)
      const address = await signer.getAddress()
      const pid = await registry.getNextProcessId(address)
      console.info('ℹ️ Process ID:', pid)

      const message = await createProcessSignatureMessage(pid)
      const signature = await signer.signMessage(message)

      const ballotMode = generateBallotMode(metadata, data)
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
        Number.parseInt(data.duration) * (data.durationUnit === 'hours' ? 3600 : 60),
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
          Number.parseInt(data.duration) * (data.durationUnit === 'hours' ? 3600 : 60),
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
      console.info('ℹ️ Vote launched successfully with process ID:', processId)

      // Wait to navigate
      while (true) {
        try {
          const process = await api.getProcess(processId)
          if (process.isAcceptingVotes) {
            navigate(`/vote/${processId}`)
            break
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty
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
    const currentData = getValues()
    const hasQuestion = currentData.question.trim() !== ''
    const hasValidChoices = currentData.choices.filter((choice) => choice.text.trim() !== '').length >= 2
    const hasVotingMethod = currentData.votingMethod !== ''
    const hasCensusType = currentData.censusType !== ''
    const hasDuration = currentData.duration !== '' && Number.parseInt(currentData.duration) > 0
    const hasAddresses =
      currentData.censusType !== 'custom-addresses' || currentData.customAddresses.filter(Boolean).length > 0

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
                {...form.register('question')}
                className='border-davinci-callout-border'
              />
            </div>

            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <Label className='text-davinci-black-alt'>Choices ({fields.length}/8)</Label>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={addChoice}
                  disabled={fields.length >= 8}
                  className='border-davinci-callout-border text-davinci-black-alt hover:bg-davinci-soft-neutral/20'
                >
                  <Plus className='w-4 h-4 mr-1' />
                  Add Choice
                </Button>
              </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
                  <div className='space-y-3'>
                    {fields.map((field, index) => (
                      <SortableChoiceItem
                        key={field.id}
                        choice={field}
                        index={index}
                        control={control}
                        onRemove={removeChoice}
                        canRemove={fields.length > 2}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
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
                onValueChange={(value) => {
                  setValue('censusType', value)
                  // Reset weighted voting when switching away from ethereum-wallets
                  if (value !== 'ethereum-wallets') {
                    setValue('useWeightedVoting', false)
                  }
                }}
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
                        weights={formData.customAddressWeights}
                        useWeightedVoting={formData.useWeightedVoting}
                        setAddresses={(newAddresses) => setValue('customAddresses', newAddresses)}
                        setWeights={(newWeights) => setValue('customAddressWeights', newWeights)}
                        setUseWeightedVoting={(useWeighted) => setValue('useWeightedVoting', useWeighted)}
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
                      onSnapshotSelect={(censusRoot) => setValue('selectedCensusRoot', censusRoot)}
                    />
                  )}
                </div>
              </RadioGroup>
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
                      This miniapp offers 4 voting methods, but DAVINCI allows any type of voting method thanks to the
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
              <RadioGroup value={formData.votingMethod} onValueChange={(value) => setValue('votingMethod', value)}>
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
                    disabled={formData.censusType === 'custom-addresses' && formData.useWeightedVoting}
                  />
                  <Label
                    htmlFor='multiple-choice'
                    className={`${formData.censusType === 'custom-addresses' && formData.useWeightedVoting ? 'text-davinci-black-alt/50' : 'text-davinci-black-alt'}`}
                  >
                    Multiple Choice
                  </Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className='w-4 h-4 text-davinci-black-alt/60' />
                    </TooltipTrigger>
                    <TooltipContent className='bg-davinci-paper-base text-davinci-black-alt border-davinci-callout-border'>
                      <p>
                        {formData.censusType === 'custom-addresses' && formData.useWeightedVoting
                          ? 'Multiple choice voting is not available with custom weighted addresses. Use budget voting instead for similar functionality.'
                          : 'Voters can select multiple options within specified limits'}
                      </p>
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
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem
                    value={ElectionResultsTypeNames.BUDGET}
                    id='budget-voting'
                    className='border-davinci-callout-border'
                  />
                  <Label htmlFor='budget-voting' className='text-davinci-black-alt'>
                    Budget Voting
                  </Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className='w-4 h-4 text-davinci-black-alt/60' />
                    </TooltipTrigger>
                    <TooltipContent className='bg-davinci-paper-base text-davinci-black-alt border-davinci-callout-border'>
                      <p>Voters allocate credits linearly (1 credit = 1 vote)</p>
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
                        onValueChange={(value) => setValue('multipleChoiceMin', value)}
                      >
                        <SelectTrigger className='border-davinci-callout-border'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className='bg-davinci-paper-base border-davinci-callout-border'>
                          {Array.from({ length: Math.min(fields.length, 8) }, (_, i) => (
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
                        onValueChange={(value) => setValue('multipleChoiceMax', value)}
                      >
                        <SelectTrigger className='border-davinci-callout-border'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className='bg-davinci-paper-base border-davinci-callout-border'>
                          {Array.from({ length: Math.min(fields.length, 8) }, (_, i) => (
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

              {/* Single Choice Voting Configuration */}
              {formData.votingMethod === ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION && (
                <div className='bg-davinci-digital-highlight p-4 rounded-lg space-y-4 border border-davinci-callout-border'>
                  <h4 className='font-medium text-davinci-black-alt'>Single Choice Configuration</h4>

                  {/* Weighted voting option for dynamic censuses with proportional strategy */}
                  {formData.censusType === 'ethereum-wallets' &&
                    (() => {
                      const selectedSnapshot = formData.selectedCensusRoot
                        ? snapshots?.find((s) => s.censusRoot === formData.selectedCensusRoot)
                        : snapshots?.[0]
                      return selectedSnapshot?.weightStrategy === 'proportional'
                    })() && (
                      <div className='space-y-3'>
                        <div className='flex items-center space-x-2'>
                          <LabeledSwitch
                            id='weighted-voting'
                            checked={formData.useWeightedVoting}
                            onCheckedChange={(checked) => setValue('useWeightedVoting', checked === true)}
                            leftLabel='Fixed weight'
                            rightLabel='Token-based weight'
                          />
                        </div>

                        <div className='bg-davinci-soft-neutral/20 p-3 rounded border border-davinci-callout-border'>
                          <p className='text-sm text-davinci-black-alt/70'>
                            {formData.useWeightedVoting
                              ? 'Voting power will be determined by token balances from the selected snapshot.'
                              : 'All voters will have equal voting power regardless of their token balances.'}
                          </p>
                        </div>
                      </div>
                    )}

                  <p className='text-sm text-davinci-black-alt/80'>
                    {formData.useWeightedVoting
                      ? 'Each voter can select one choice, but their voting power is proportional to their token balance from the snapshot.'
                      : 'Each voter can select one choice with equal voting power.'}
                  </p>
                </div>
              )}

              {/* Quadratic Voting Configuration */}
              {formData.votingMethod === ElectionResultsTypeNames.QUADRATIC && (
                <div className='bg-davinci-digital-highlight p-4 rounded-lg space-y-4 border border-davinci-callout-border'>
                  <h4 className='font-medium text-davinci-black-alt'>Quadratic Voting Configuration</h4>

                  {/* Weighted voting option for dynamic censuses with proportional strategy */}
                  {formData.censusType === 'ethereum-wallets' &&
                    (() => {
                      const selectedSnapshot = formData.selectedCensusRoot
                        ? snapshots?.find((s) => s.censusRoot === formData.selectedCensusRoot)
                        : snapshots?.[0]
                      return selectedSnapshot?.weightStrategy === 'proportional'
                    })() && (
                      <div className='space-y-3'>
                        <div className='flex items-center space-x-2'>
                          <LabeledSwitch
                            id='weighted-voting-quadratic'
                            checked={formData.useWeightedVoting}
                            onCheckedChange={(checked) => setValue('useWeightedVoting', checked === true)}
                            leftLabel='Fixed weight'
                            rightLabel='Token-based weight'
                          />
                        </div>

                        <div className='bg-davinci-soft-neutral/20 p-3 rounded border border-davinci-callout-border'>
                          <p className='text-sm text-davinci-black-alt/70'>
                            {formData.useWeightedVoting
                              ? 'Voting power will be determined by token balances from the selected snapshot.'
                              : 'All voters will receive the same number of credits regardless of their token balances.'}
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Credits configuration - only show when not using weighted voting */}
                  {!formData.useWeightedVoting && (
                    <div>
                      <Label htmlFor='credits' className='text-davinci-black-alt'>
                        Credits per Voter
                      </Label>
                      <Input
                        id='credits'
                        type='number'
                        min='1'
                        max='256'
                        {...form.register('quadraticCredits')}
                        className='border-davinci-callout-border'
                      />
                    </div>
                  )}

                  <p className='text-sm text-davinci-black-alt/80'>
                    {!formData.useWeightedVoting
                      ? `Each voter will receive ${formData.quadraticCredits} credits to allocate across choices. The cost to vote increases quadratically (1 vote = 1 credit, 2 votes = 4 credits, etc.).`
                      : 'Credits are determined by the weight assigned to each address. The cost to vote increases quadratically (1 vote = 1 credit, 2 votes = 4 credits, etc.).'}
                  </p>
                </div>
              )}

              {/* Budget Voting Configuration */}
              {formData.votingMethod === ElectionResultsTypeNames.BUDGET && (
                <div className='bg-davinci-digital-highlight p-4 rounded-lg space-y-4 border border-davinci-callout-border'>
                  <h4 className='font-medium text-davinci-black-alt'>Budget Voting Configuration</h4>

                  {/* Weighted voting option for dynamic censuses with proportional strategy */}
                  {formData.censusType === 'ethereum-wallets' &&
                    (() => {
                      const selectedSnapshot = formData.selectedCensusRoot
                        ? snapshots?.find((s) => s.censusRoot === formData.selectedCensusRoot)
                        : snapshots?.[0]
                      return selectedSnapshot?.weightStrategy === 'proportional'
                    })() && (
                      <div className='space-y-3'>
                        <div className='flex items-center space-x-2'>
                          <LabeledSwitch
                            id='weighted-voting-budget'
                            checked={formData.useWeightedVoting}
                            onCheckedChange={(checked) => setValue('useWeightedVoting', checked === true)}
                            leftLabel='Fixed weight'
                            rightLabel='Token-based weight'
                          />
                        </div>

                        <div className='bg-davinci-soft-neutral/20 p-3 rounded border border-davinci-callout-border'>
                          <p className='text-sm text-davinci-black-alt/70'>
                            {formData.useWeightedVoting
                              ? 'Voting power will be determined by token balances from the selected snapshot.'
                              : 'All voters will receive the same number of credits regardless of their token balances.'}
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Credits configuration - only show when not using weighted voting */}
                  {!formData.useWeightedVoting && (
                    <div>
                      <Label htmlFor='budget-credits' className='text-davinci-black-alt'>
                        Credits per Voter
                      </Label>
                      <Input
                        id='budget-credits'
                        type='number'
                        min='1'
                        max='256'
                        {...form.register('budgetCredits')}
                        className='border-davinci-callout-border'
                      />
                    </div>
                  )}

                  <p className='text-sm text-davinci-black-alt/80'>
                    {!formData.useWeightedVoting
                      ? `Each voter will receive ${formData.budgetCredits} credits to allocate across choices. Each credit equals one vote.`
                      : 'Credits are determined by the weight assigned to each address. Each credit equals one vote.'}
                  </p>
                </div>
              )}
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
                    {...form.register('duration', {
                      validate: (value) => value === '' || Number.parseInt(value) >= 0,
                    })}
                    className='border-davinci-callout-border'
                  />
                </div>
                <div className='w-32'>
                  <Select
                    value={formData.durationUnit}
                    onValueChange={(value) => setValue('durationUnit', value as DurationUnit)}
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
              <LaunchVoteButton
                handleLaunch={handleSubmit(handleLaunch)}
                isLaunching={isLaunching}
                isFormValid={isFormValid}
              />
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
  const { isConnected } = useUnifiedWallet()
  const { isMiniApp, isExternalWallet, supportedChains, getFarcasterEthereumProvider } = useMiniApp()
  const { caipNetwork, switchNetwork } = useAppKitNetwork()

  // All hooks must be at the top before any conditional returns
  const [actualChainId, setActualChainId] = useState<string | null>(null)

  useEffect(() => {
    if (isMiniApp) {
      // Get actual chain ID from Farcaster provider
      const getActualChain = async () => {
        try {
          const provider = await getFarcasterEthereumProvider()
          if (provider) {
            const chainId = await provider.request({ method: 'eth_chainId' })
            setActualChainId(chainId)
            console.log('🔍 Actual Farcaster provider chain ID:', chainId)
          }
        } catch (error) {
          console.error('Error getting actual chain ID from Farcaster provider:', error)
        }
      }
      getActualChain()
    }
  }, [isMiniApp, getFarcasterEthereumProvider])

  // PRIORITY 2: Check chain compatibility (only for external wallets)
  // Convert hex chain ID to decimal for comparison
  const actualChainIdDecimal = actualChainId ? parseInt(actualChainId, 16) : null
  const isOnSepoliaActually = actualChainIdDecimal === sepolia.id

  useEffect(() => {
    console.info('🔍 Chain validation debug:', {
      caipNetwork,
      sepoliaId: sepolia.id,
      appKitChainId: caipNetwork?.id,
      actualChainId,
      actualChainIdDecimal,
      isOnSepoliaActually,
      isMiniApp,
      supportedChains,
      isExternalWallet,
    })
  }, [
    caipNetwork,
    actualChainId,
    isMiniApp,
    supportedChains,
    isExternalWallet,
    actualChainIdDecimal,
    isOnSepoliaActually,
  ])

  if (!isConnected) {
    return <ConnectWalletButtonMiniApp />
  }

  // PRIORITY 1: Check wallet type first (embedded wallets can't switch chains anyway)
  // If in miniapp with embedded wallet (Warpcast), process creation is not available
  if (isMiniApp && !isExternalWallet) {
    return (
      <div className='space-y-4'>
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <p className='text-sm text-blue-800'>
            <strong>Process creation not yet supported with embedded wallet:</strong> Please use an external wallet
            (e.g. MetaMask) to create votes. Support for embedded wallets is coming soon.
          </p>
        </div>
        <div className='space-y-3'>
          <ConnectWalletButtonMiniApp />
          <div className='text-sm text-gray-600'>
            <p className='font-medium mb-1'>Why this happens:</p>
            <ul className='space-y-1 text-xs'>
              <li>• Embedded wallets use proxy providers for security</li>
              <li>• These proxies only support signing, not contract calls</li>
              <li>• Process creation requires reading from smart contracts</li>
              <li>• External wallets should work normally</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // For miniapp users with external wallets: check actual Farcaster provider chain
  if (isMiniApp && isExternalWallet && actualChainId && !isOnSepoliaActually) {
    const chainName =
      actualChainIdDecimal === 8453
        ? 'Base'
        : actualChainIdDecimal === 1
          ? 'Ethereum Mainnet'
          : actualChainIdDecimal === 84532
            ? 'Base Sepolia'
            : `Chain ${actualChainIdDecimal}`

    return (
      <div className='space-y-4'>
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
          <p className='text-sm text-yellow-800'>
            <strong>Wrong Network:</strong> Please switch to Sepolia testnet in your wallet to create votes. Current
            network: {chainName}
          </p>
        </div>
        <div className='text-sm text-gray-600'>
          <p>
            You're currently on {chainName}. DAVINCI requires Sepolia testnet (Chain ID: 11155111) for creating votes.
          </p>
        </div>
      </div>
    )
  }

  // For non-miniapp (PWA) users: check AppKit network (this should rarely trigger due to auto-switching)
  if (!isMiniApp && caipNetwork?.id !== sepolia.id && caipNetwork) {
    return (
      <div className='space-y-4'>
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
          <p className='text-sm text-yellow-800'>
            <strong>Wrong Network:</strong> Please switch to Sepolia testnet to create votes. Current network:{' '}
            {caipNetwork.name}
          </p>
        </div>
        <Button
          onClick={() => switchNetwork(sepolia)}
          className='w-full bg-davinci-black-alt hover:bg-davinci-black-alt/90 text-davinci-text-base'
        >
          Switch to Sepolia Testnet
        </Button>
      </div>
    )
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

const generateBallotMode = (election: ElectionMetadata, form: FormData): BallotMode => {
  const maxValue = Math.pow(2, 16).toString()
  switch (election.type.name) {
    default:
    case ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION:
      return {
        maxCount: 1,
        maxValue,
        minValue: '0',
        forceUniqueness: false,
        costFromWeight: form.useWeightedVoting,
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
        costFromWeight: false,
        costExponent: 1,
        maxTotalCost: form.multipleChoiceMax,
        minTotalCost: form.multipleChoiceMin,
      }
    case ElectionResultsTypeNames.QUADRATIC:
      return {
        maxCount: election.questions[0].choices.length,
        maxValue: form.useWeightedVoting
          ? Math.floor(Math.sqrt(Number(maxValue))).toString() // Use maximum when weighted (will be limited by individual voter's weight)
          : (Math.floor(Math.sqrt(Number(form.quadraticCredits))) + 1).toString(),
        minValue: '0',
        forceUniqueness: false,
        costFromWeight: form.useWeightedVoting, // Use weight from census when weighted voting is enabled
        costExponent: 2,
        maxTotalCost: form.useWeightedVoting
          ? '0' // When weighted, max cost is determined by voter's actual weight
          : form.quadraticCredits,
        minTotalCost: '0',
      }
    case ElectionResultsTypeNames.BUDGET:
      return {
        maxCount: election.questions[0].choices.length,
        maxValue: form.useWeightedVoting
          ? maxValue // Use maximum when weighted (will be limited by individual voter's weight)
          : form.budgetCredits,
        minValue: '0',
        forceUniqueness: false,
        costFromWeight: form.useWeightedVoting, // Use weight from census when weighted voting is enabled
        costExponent: 1, // Linear cost: 1 credit = 1 vote
        maxTotalCost: form.useWeightedVoting
          ? '0' // When weighted, max cost is determined by voter's actual weight
          : form.budgetCredits,
        minTotalCost: '0',
      }
  }
}
