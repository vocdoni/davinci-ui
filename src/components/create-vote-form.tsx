import {
  OrganizationRegistryService,
  ProcessRegistryService,
  ProcessStatus,
  TxStatus,
  deployedAddresses,
} from '@vocdoni/davinci-sdk/contracts'
import {
  ElectionResultsTypeNames,
  type ElectionMetadata,
  type ElectionResultsType,
  type ProtocolVersion,
} from '@vocdoni/davinci-sdk/core'
import { VocdoniApiService } from '@vocdoni/davinci-sdk/sequencer'
import { useConnectWallet } from '@web3-onboard/react'
import { BrowserProvider } from 'ethers'
import { Calendar, CheckCircle, Clock, HelpCircle, Plus, Rocket, Users, Wallet, X } from 'lucide-react'
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
import ConnectWalletButton from './ui/connect-wallet-button'

interface Choice {
  id: string
  text: string
}

export function CreateVoteForm() {
  const navigate = useNavigate()
  const [isLaunching, setIsLaunching] = useState(false)
  const [launchSuccess, setLaunchSuccess] = useState(false)
  const [{ wallet }] = useConnectWallet()
  const [formData, setFormData] = useState({
    question: '',
    choices: [
      { id: '1', text: '' },
      { id: '2', text: '' },
    ] as Choice[],
    votingMethod: '',
    multipleChoiceMin: '1',
    multipleChoiceMax: '2',
    quadraticCredits: '100',
    censusType: '',
    duration: '',
    durationUnit: 'minutes',
  })

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

  const handleLaunch = async () => {
    if (!isFormValid() || !wallet) return

    setIsLaunching(true)

    try {
      // Initialize API service
      const api = new VocdoniApiService(import.meta.env.SEQUENCER_URL)

      // Step 2: Fetch circuit info (unnecessary)
      // const info = await api.getInfo()

      // Step 3: Create census
      const censusId = await api.createCensus()

      // Step 4: Add participants
      const participants = [
        {
          key: '0x8349DE968A70B79D09886DA1690CC259b67CbCbC',
          weight: '1',
        },
      ]
      await api.addParticipants(censusId, participants)

      // Step 5: Verify participants were added
      console.log('participants:', await api.getParticipants(censusId))

      // Step 6: Get census root and size
      const censusRoot = await api.getCensusRoot(censusId)
      const censusSize = await api.getCensusSize(censusId)

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
          name: ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION,
          properties: {} as Record<string, never>,
        } as ElectionResultsType,
      }
      const metadataHash = await api.pushMetadata(metadata)
      const metadataUrl = api.getMetadataUrl(metadataHash)
      console.log('Metadata URL:', metadataUrl)

      // Step 8: Create process via API
      const provider = new BrowserProvider(wallet.provider)
      const signer = await provider.getSigner()
      const nonce = await provider.getTransactionCount(wallet.accounts[0].address)
      const signature = await signer.signMessage(`${11155111}${nonce}`) // 11155111 is Sepolia chain ID

      const ballotMode = {
        maxCount: 1,
        maxValue: '8', // (formData.choices.length - 1).toString(),
        minValue: '0',
        forceUniqueness: false,
        costFromWeight: false,
        costExponent: 0,
        maxTotalCost: '36', //  metadata.questions[0].choices.reduce((p, n) => p + n.value, 0).toString(),
        minTotalCost: '0',
      }

      const { processId, encryptionPubKey, stateRoot } = await api.createProcess({
        censusRoot,
        ballotMode,
        nonce,
        chainId: 11155111,
        signature,
      })

      // Step 9: Check admin rights
      const orgService = new OrganizationRegistryService(deployedAddresses.organizationRegistry.sepolia, signer)
      const isAdmin = await orgService.isAdministrator(wallet.accounts[0].address, wallet.accounts[0].address)
      if (!isAdmin) throw new Error('Caller is not an organization admin')

      // Step 10: Submit newProcess on-chain
      const registry = new ProcessRegistryService(deployedAddresses.processRegistry.sepolia, signer)
      await registry.newProcess(
        ProcessStatus.READY,
        Math.floor(Date.now() / 1000) + 60,
        Number.parseInt(formData.duration) * (formData.durationUnit === 'hours' ? 3600 : 60),
        ballotMode,
        {
          censusOrigin: 1,
          maxVotes: censusSize.toString(),
          censusRoot,
          censusURI: censusId,
        },
        metadataUrl,
        wallet.accounts[0].address,
        processId,
        { x: encryptionPubKey[0], y: encryptionPubKey[1] },
        BigInt(stateRoot)
      )

      setLaunchSuccess(true)
      console.log('Vote launched successfully (?) with process ID:', processId)

      // Wait a moment to show success state, then navigate
      setTimeout(() => {
        navigate(`/vote/${processId}`)
      }, 2000)
    } catch (error) {
      console.error('Failed to launch vote:', error)
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

    return hasQuestion && hasValidChoices && hasVotingMethod && hasCensusType && hasDuration
  }

  const getCurrentTimestamp = () => {
    return new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    })
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
              Define your voting question and provide up to 6 choices for voters
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
                <Label className='text-davinci-black-alt'>Choices ({formData.choices.length}/6)</Label>
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

              <div className='space-y-3'>
                {formData.choices.map((choice, index) => (
                  <div key={choice.id} className='flex gap-2'>
                    <div className='flex-1'>
                      <Input
                        placeholder={`Choice ${index + 1}`}
                        value={choice.text}
                        onChange={(e) => updateChoice(choice.id, e.target.value)}
                        className='border-davinci-callout-border'
                      />
                    </div>
                    {formData.choices.length > 2 && (
                      <Button
                        type='button'
                        variant='outline'
                        size='icon'
                        onClick={() => removeChoice(choice.id)}
                        className='border-davinci-callout-border hover:bg-davinci-soft-neutral/20'
                      >
                        <X className='w-4 h-4' />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
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
                  <RadioGroupItem value='single-choice' id='single-choice' className='border-davinci-callout-border' />
                  <Label htmlFor='single-choice' className='text-davinci-black-alt'>
                    Single Choice
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem
                    value='multiple-choice'
                    id='multiple-choice'
                    className='border-davinci-callout-border'
                    disabled
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
                    value='quadratic-voting'
                    id='quadratic-voting'
                    className='border-davinci-callout-border'
                    disabled
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
                          {Array.from({ length: Math.min(formData.choices.length, 6) }, (_, i) => (
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
                          {Array.from({ length: Math.min(formData.choices.length, 6) }, (_, i) => (
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
              {formData.votingMethod === 'quadratic-voting' && (
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
                      max='1000'
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
                      value='hardcoded-wallets'
                      id='hardcoded-wallets'
                      className='border-davinci-callout-border'
                    />
                    <Label htmlFor='hardcoded-wallets' className='text-davinci-black-alt'>
                      Hardcoded wallets 🫠
                    </Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem
                      value='ethereum-wallets'
                      id='ethereum-wallets'
                      className='border-davinci-callout-border'
                      disabled
                    />
                    <Label htmlFor='ethereum-wallets' className='text-davinci-black-alt'>
                      Ethereum Wallets
                    </Label>
                  </div>
                  {formData.censusType === 'ethereum-wallets' && (
                    <div className='ml-6 bg-davinci-digital-highlight p-4 rounded-lg border border-davinci-callout-border'>
                      <div className='flex items-start gap-3'>
                        <Wallet className='w-5 h-5 text-davinci-black-alt mt-0.5' />
                        <div className='space-y-2'>
                          <p className='text-sm font-medium text-davinci-black-alt'>Ethereum Wallet Requirements</p>
                          <p className='text-sm text-davinci-black-alt/80'>
                            Only wallets with a minimum balance of <strong>0.001 ETH</strong> can participate in this
                            vote.
                          </p>
                          <div className='flex items-center gap-2 text-xs text-davinci-black-alt/70'>
                            <Calendar className='w-3 h-3' />
                            <span>Snapshot taken: {getCurrentTimestamp()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem
                      value='holonym-passport'
                      id='holonym-passport'
                      className='border-davinci-callout-border'
                      disabled
                    />
                    <Label htmlFor='holonym-passport' className='text-davinci-black-alt'>
                      Holonym Passport
                    </Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className='w-4 h-4 text-davinci-black-alt/60' />
                      </TooltipTrigger>
                      <TooltipContent className='bg-davinci-paper-base text-davinci-black-alt border-davinci-callout-border'>
                        <p>Wallets verified through Holonym's identity system</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  {formData.censusType === 'holonym-passport' && (
                    <div className='ml-6 bg-davinci-digital-highlight p-4 rounded-lg border border-davinci-callout-border'>
                      <div className='flex items-start gap-3'>
                        <Users className='w-5 h-5 text-davinci-black-alt mt-0.5' />
                        <div>
                          <p className='text-sm font-medium text-davinci-black-alt'>Holonym Passport Requirements</p>
                          <p className='text-sm text-davinci-black-alt/80'>
                            Only wallets with verified Holonym Passport credentials can participate in this vote.
                          </p>
                        </div>
                      </div>
                    </div>
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
                    onValueChange={(value) => setFormData({ ...formData, durationUnit: value })}
                  >
                    <SelectTrigger className='border-davinci-callout-border'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className='bg-davinci-paper-base border-davinci-callout-border'>
                      <SelectItem value='minutes'>Minutes</SelectItem>
                      <SelectItem value='hours'>Hours</SelectItem>
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
              <LaunchVoteButton handleLaunch={handleLaunch} isLaunching={isLaunching} isFormValid={isFormValid} />

              {isLaunching && (
                <div className='bg-davinci-digital-highlight p-4 rounded-lg border border-davinci-callout-border max-w-md mx-auto'>
                  <p className='text-sm text-davinci-black-alt/80'>
                    Deploying your vote to the DAVINCI network. This may take a few moments...
                  </p>
                </div>
              )}
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
  const [{ wallet }] = useConnectWallet()
  if (!wallet) {
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
      <Button
        className='bg-davinci-black-alt hover:bg-davinci-black-alt/90 text-davinci-text-base block mx-auto'
        onClick={async () => {
          if (!wallet) {
            throw new Error('No wallet connected. Please connect a wallet to create an organization.')
          }

          try {
            const provider = new BrowserProvider(wallet.provider)
            const signer = await provider.getSigner()
            const orgService = new OrganizationRegistryService(deployedAddresses.organizationRegistry.sepolia, signer)

            const orgName = `automatically created org ${new Date().toDateString()}`
            const orgMeta = ``

            const txn = orgService.createOrganization(wallet.accounts[0].address, orgName, orgMeta, [
              wallet.accounts[0].address,
            ])

            for await (const { status } of txn) {
              if (status === TxStatus.Pending) {
                console.log('Transaction is pending...')
              } else if (status === TxStatus.Completed) {
                console.log('Transaction was completed!')
              } else if (status === TxStatus.Failed) {
                console.error('Transaction failed', txn)
              } else if (status === TxStatus.Reverted) {
                console.error('Transaction was reverted', txn)
              }
            }
          } catch (error) {
            console.error('Failed to create organization service:', error)
            return
          }
        }}
      >
        Create org (required rn to create a vote)
      </Button>
    </>
  )
}
