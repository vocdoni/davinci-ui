import {
  BallotProof,
  CircomProof,
  ProcessStatus,
  VocdoniApiService,
  type BallotProofInputs,
  type GetProcessResponse,
  type VoteBallot,
  type VoteRequest,
} from '@vocdoni/davinci-sdk'
import type { ElectionMetadata } from '@vocdoni/davinci-sdk/core'
import { ElectionResultsTypeNames } from '@vocdoni/davinci-sdk/core'
import { useConnectWallet } from '@web3-onboard/react'
import { BrowserProvider } from 'ethers'
import { BarChart3, CheckCircle, Clock, Diamond, Lock, Minus, Plus, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '~components/ui/badge'
import { Button } from '~components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~components/ui/card'
import { Checkbox } from '~components/ui/checkbox'
import { Input } from '~components/ui/input'
import { Label } from '~components/ui/label'
import { RadioGroup, RadioGroupItem } from '~components/ui/radio-group'
import { VoteProgressTracker } from '~components/vote-progress-tracker'
import { VotingModal } from '~components/voting-modal'
import { usePersistedVote } from '~hooks/use-persisted-vote'
import { useProcessQuery } from '~hooks/use-process-query'
import { truncateAddress } from '~lib/web3-utils'
import { useProcess } from './process-context'
import ConnectWalletButton from './ui/connect-wallet-button'
import { Spinner } from './ui/spinner'
import VotingTimeRemaining from './voting-time-remaining'

interface VotingMethod {
  type: ElectionResultsTypeNames
  min?: number
  max?: number
  credits?: number
}

function getVotingMethod(process: GetProcessResponse, meta: ElectionMetadata): VotingMethod {
  const { type } = meta
  switch (type.name) {
    case ElectionResultsTypeNames.MULTIPLE_CHOICE:
      return {
        type: type.name,
        min: Number(process.ballotMode.minTotalCost) || 1,
        max: Number(process.ballotMode.maxTotalCost) || 2,
      }
    case ElectionResultsTypeNames.QUADRATIC:
      return {
        type: type.name,
        credits: Number(process.ballotMode.maxTotalCost) || 100,
      }
    default:
      return { type: ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION }
  }
}

interface QuadraticVote {
  [choiceId: string]: number
}

export function VoteDisplay() {
  const [{ wallet }] = useConnectWallet()
  const {
    censusProof,
    isInCensus,
    isAbleToVote,
    isCensusProofLoading,
    process: { meta, process },
  } = useProcess()
  const processQuery = useProcessQuery(process.id)
  const [selectedChoice, setSelectedChoice] = useState('')
  const [selectedChoices, setSelectedChoices] = useState<string[]>([])
  const [quadraticVotes, setQuadraticVotes] = useState<QuadraticVote>({})
  const [voteCount, setVoteCount] = useState(0)
  const [showVotingModal, setShowVotingModal] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const { voteId, trackVote, resetVote } = usePersistedVote(process.id)
  const isConnected = !!wallet
  const voteEnded = process.status === ProcessStatus.ENDED || process.status === ProcessStatus.RESULTS

  // Initialize quadratic votes
  useEffect(() => {
    const votingMethod = getVotingMethod(process, meta)
    if (votingMethod.type === ElectionResultsTypeNames.QUADRATIC) {
      const initialVotes: QuadraticVote = {}
      meta.questions[0].choices.forEach((choice) => {
        initialVotes[choice.value.toString()] = 0
      })
      setQuadraticVotes(initialVotes)
    }
  }, [meta.questions, meta.type.name])

  // Calculate quadratic cost
  const calculateQuadraticCost = (votes: number): number => {
    return votes * votes
  }

  // Calculate total credits used
  const getTotalCreditsUsed = (): number => {
    return Object.values(quadraticVotes).reduce((total, votes) => total + calculateQuadraticCost(votes), 0)
  }

  // Get remaining credits
  const getRemainingCredits = (): number => {
    const votingMethod = getVotingMethod(process, meta)
    return (votingMethod.credits || 100) - getTotalCreditsUsed()
  }

  const handleVoteSubmit = () => {
    if (!isVoteValid()) return
    setShowVotingModal(true)
  }

  const confirmVote = async () => {
    if (!wallet) {
      throw new Error('Wallet not connected')
    }

    setVoteCount((prev) => prev + 1)
    setShowVotingModal(false)
    setIsVoting(true)

    try {
      if (!censusProof) {
        throw new Error('Census proof is required to vote')
      }
      // Initialize API service
      const api = new VocdoniApiService(import.meta.env.SEQUENCER_URL)

      // Step 2: Fetch circuit info (unnecessary)
      const info = await api.getInfo()

      const sdk = new BallotProof({
        wasmExecUrl: info.ballotProofWasmHelperExecJsUrl,
        wasmUrl: info.ballotProofWasmHelperUrl,
      })
      await sdk.init()
      console.info('ℹ️ BallotProof SDK initialized')

      const kHex = Array.from(crypto.getRandomValues(new Uint8Array(8)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
      const kStr = BigInt('0x' + kHex).toString()

      const fieldValues =
        meta.type.name === ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION
          ? getBinaryArray([selectedChoice])
          : meta.type.name === ElectionResultsTypeNames.QUADRATIC
            ? padTo(Object.values(quadraticVotes))
            : getBinaryArray(selectedChoices)

      const inputs: BallotProofInputs = {
        address: wallet.accounts[0].address,
        processID: process.id,
        ballotMode: process.ballotMode,
        encryptionKey: [process.encryptionKey.x, process.encryptionKey.y],
        k: kStr,
        fieldValues,
        weight: '1',
      }
      console.info('ℹ️ Ballot proof inputs:', inputs)

      const out = await sdk.proofInputs(inputs)

      console.info('✅ Ballot proof inputs generated:', out, info)

      const pg = new CircomProof({
        wasmUrl: info.circuitUrl,
        zkeyUrl: info.provingKeyUrl,
        vkeyUrl: info.verificationKeyUrl,
      })
      console.info('ℹ️ CircomProof SDK initialized', pg)

      const { proof, publicSignals } = await pg.generate(out.circomInputs)
      console.log('✅ Proof generated:', proof)
      const ok = await pg.verify(proof, publicSignals)

      if (!ok) throw new Error(`Proof verification failed`)

      const voteBallot: VoteBallot = {
        curveType: out.ballot.curveType,
        ciphertexts: out.ballot.ciphertexts,
      }

      const provider = new BrowserProvider(wallet.provider)
      const signer = await provider.getSigner()
      console.info('ℹ️ census proof:', censusProof)
      console.info('ℹ️ voteid:', out.voteId)
      const signature = await signer.signMessage(hexStringToUint8Array(out.voteId))

      const voteRequest: VoteRequest = {
        address: wallet.accounts[0].address,
        ballot: voteBallot,
        ballotInputsHash: out.ballotInputsHash,
        ballotProof: proof,
        censusProof,
        processId: process.id,
        signature,
        voteId: out.voteId,
      }

      await api.submitVote(voteRequest)

      // Track the vote
      trackVote(out.voteId)

      console.info('✅ Vote submitted successfully:', out.voteId)

      // refetch process info
      await processQuery.refetch()
    } catch (error) {
      console.error('Error during voting process:', error)

      return
    } finally {
      setIsVoting(false)
    }

    // Clear selections after voting
    setSelectedChoice('')
    setSelectedChoices([])
    const votingMethod = getVotingMethod(process, meta)
    if (votingMethod.type === ElectionResultsTypeNames.QUADRATIC) {
      const resetVotes: QuadraticVote = {}
      meta.questions[0].choices.forEach((choice) => {
        resetVotes[choice.value.toString()] = 0
      })
      setQuadraticVotes(resetVotes)
    }
  }

  const handleVoteAgain = () => {
    resetVote()
    // Reset form to allow voting again
    setSelectedChoice('')
    setSelectedChoices([])
    const votingMethod = getVotingMethod(process, meta)
    if (votingMethod.type === ElectionResultsTypeNames.QUADRATIC) {
      const resetVotes: QuadraticVote = {}
      meta.questions[0].choices.forEach((choice) => {
        resetVotes[choice.value.toString()] = 0
      })
      setQuadraticVotes(resetVotes)
    }
  }

  // Validation for different voting methods
  const isVoteValid = (): boolean => {
    const votingMethod = getVotingMethod(process, meta)
    switch (votingMethod.type) {
      case ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION:
        return selectedChoice !== ''
      case ElectionResultsTypeNames.MULTIPLE_CHOICE:
        return selectedChoices.length >= (votingMethod.min || 1) && selectedChoices.length <= (votingMethod.max || 2)
      case ElectionResultsTypeNames.QUADRATIC:
        return getTotalCreditsUsed() > 0 && getRemainingCredits() >= 0
      default:
        return false
    }
  }

  // Handle multiple choice selection
  const handleMultipleChoiceChange = (choiceId: string, checked: boolean) => {
    if (checked) {
      setSelectedChoices((prev) => [...prev, choiceId])
    } else {
      setSelectedChoices((prev) => prev.filter((id) => id !== choiceId))
    }
  }

  // Handle quadratic vote change
  const handleQuadraticVoteChange = (choiceId: string, change: number) => {
    setQuadraticVotes((prev) => {
      const newVotes = Math.max(0, (prev[choiceId] || 0) + change)
      const newQuadraticVotes = { ...prev, [choiceId]: newVotes }

      // Check if this would exceed available credits
      const totalCost = Object.values(newQuadraticVotes).reduce(
        (total, votes) => total + calculateQuadraticCost(votes),
        0
      )
      const votingMethod = getVotingMethod(process, meta)
      const totalCredits = votingMethod.credits || 100

      if (totalCost <= totalCredits) {
        return newQuadraticVotes
      }

      return prev // Don't update if it would exceed credits
    })
  }

  const getVoteSelectionSummary = () => {
    const choices = meta.questions[0].choices
    const votingMethod = getVotingMethod(process, meta)
    switch (votingMethod.type) {
      case ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION:
        return choices.find((choice) => choice.value.toString() === selectedChoice)?.title.default || ''
      case ElectionResultsTypeNames.MULTIPLE_CHOICE:
        return selectedChoices
          .map((id) => choices.find((choice) => choice.value.toString() === id)?.title.default)
          .join(', ')
      case ElectionResultsTypeNames.QUADRATIC:
        return Object.entries(quadraticVotes)
          .filter(([, votes]) => votes > 0)
          .map(([choiceId, votes]) => {
            const choice = choices.find((c) => c.value.toString() === choiceId)
            return `${choice?.title.default}: ${votes} vote${votes !== 1 ? 's' : ''}`
          })
          .join(', ')
      default:
        return ''
    }
  }

  const votingMethod = getVotingMethod(process, meta)

  return (
    <div className='space-y-6'>
      {/* Vote Status */}
      <Card className='border-davinci-callout-border'>
        <CardContent className='p-6'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <div className={`w-3 h-3 rounded-full ${!voteEnded ? 'bg-green-500' : 'bg-gray-500'}`} />
              <span className='font-medium text-davinci-black-alt'>{!voteEnded ? 'Active Vote' : 'Vote Ended'}</span>
              <Badge className='bg-davinci-soft-neutral text-davinci-black-alt'>
                {votingMethod.type === ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION
                  ? 'Single Choice'
                  : votingMethod.type === ElectionResultsTypeNames.MULTIPLE_CHOICE
                    ? 'Multiple Choice'
                    : 'Quadratic Voting'}
              </Badge>
            </div>
            <div className='flex items-center gap-2 text-davinci-black-alt/80'>
              <Clock className='w-4 h-4' />
              <span className='text-sm font-medium font-mono'>{!voteEnded ? <VotingTimeRemaining /> : 'Ended'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vote Progress Tracker - moved inside voting interface */}

      {/* Results Display (when vote ended) */}
      {voteEnded && (
        <Card className='border-davinci-callout-border'>
          <CardHeader className='bg-davinci-paper-base'>
            <CardTitle className='flex items-center gap-2 text-davinci-black-alt'>
              <BarChart3 className='w-5 h-5' />
              Vote Results
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-6 bg-davinci-text-base space-y-8'>
            {/* Summary Statistics */}
            <div className='mt-8 p-6 bg-gradient-to-r from-davinci-paper-base/50 to-davinci-soft-neutral/30 rounded-xl border border-davinci-callout-border'>
              <h5 className='font-semibold text-davinci-black-alt mb-4'>Vote Summary</h5>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='text-center'>
                  <p className='text-2xl font-bold text-davinci-black-alt'>{process.voteCount}</p>
                  <p className='text-xs text-davinci-black-alt/60'>Total Votes</p>
                </div>
                <div className='text-center'>
                  <p className='text-2xl font-bold text-davinci-black-alt'>
                    {((Number(process.voteCount) / (Number(process?.census.maxVotes) || 5000)) * 100).toFixed(1)}%
                  </p>
                  <p className='text-xs text-davinci-black-alt/60'>Turnout</p>
                </div>
                <div className='text-center'>
                  <p className='text-2xl font-bold text-davinci-black-alt'>
                    {Array.from(process.result).filter((r) => Number(r) > 0).length}
                  </p>
                  <p className='text-xs text-davinci-black-alt/60'>Choices with Votes</p>
                </div>
              </div>
            </div>

            {/* Enhanced Results Visualization */}
            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <h4 className='text-xl font-bold text-davinci-black-alt'>Detailed Results</h4>
                <div className='text-sm text-davinci-black-alt/60'>Total: {process.voteCount} votes</div>
              </div>

              {/* Single Card with All Results */}
              <Card className='border-davinci-callout-border bg-davinci-paper-base/30'>
                <CardContent className='p-6'>
                  <div className='space-y-6'>
                    {meta.questions[0].choices
                      .map((choice) => ({
                        ...choice,
                        result: process.result[choice.value],
                      }))
                      .sort((a, b) => (Number(b.result) || 0) - (Number(a.result) || 0))
                      .map((choice, index) => {
                        const result = process.result[choice.value] || '0'
                        const percentage = (Number(result) / Number(process.voteCount)) * 100 || 0
                        const votes = result || 0

                        // Color scheme based on ranking
                        const getBarColor = () => {
                          switch (index) {
                            case 0:
                              return 'from-yellow-400 via-yellow-500 to-yellow-600'
                            case 1:
                              return 'from-davinci-secondary-accent via-davinci-secondary-accent/80 to-davinci-secondary-accent/60'
                            case 2:
                              return 'from-davinci-digital-highlight via-davinci-digital-highlight/80 to-davinci-digital-highlight/60'
                            default:
                              return 'from-davinci-soft-neutral via-davinci-soft-neutral/80 to-davinci-soft-neutral/60'
                          }
                        }

                        return (
                          <div key={choice.value} className='space-y-3'>
                            {/* Choice Header */}
                            <div className='flex items-start justify-between'>
                              <div className='flex-1 pr-4'>
                                <p className='font-semibold text-lg leading-relaxed text-davinci-black-alt'>
                                  {choice.title.default}
                                </p>
                              </div>
                              <div className='text-right space-y-1'>
                                <p className='text-2xl font-bold text-davinci-black-alt'>{votes.toLocaleString()}</p>
                                <p className='text-sm text-davinci-black-alt/60'>votes</p>
                              </div>
                            </div>

                            {/* Progress Bar Section */}
                            <div className='space-y-2'>
                              <div className='flex items-center justify-between text-sm'>
                                <span className='font-medium text-davinci-black-alt/80'>
                                  {percentage.toFixed(1)}% of total votes
                                </span>
                                <span className='text-davinci-black-alt/60'>Rank #{index + 1}</span>
                              </div>

                              {/* Custom Progress Bar */}
                              <div className='relative'>
                                <div className='w-full h-4 bg-davinci-soft-neutral/30 rounded-full overflow-hidden shadow-inner'>
                                  <div
                                    className={`h-full bg-gradient-to-r ${getBarColor()} rounded-full transition-all duration-1000 ease-out shadow-sm relative overflow-hidden`}
                                    style={{
                                      width: `${Math.max(percentage, 2)}%`,
                                    }}
                                  >
                                    {/* Shimmer effect for top choice */}
                                    {index === 0 && (
                                      <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse'></div>
                                    )}
                                  </div>
                                </div>

                                {/* Percentage label on bar */}
                                {percentage > 15 && (
                                  <div
                                    className='absolute top-0 h-4 flex items-center pr-2'
                                    style={{ width: `${percentage}%` }}
                                  >
                                    <span className='ml-auto text-xs font-bold text-white drop-shadow-sm'>
                                      {percentage.toFixed(1)}%
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Separator between choices (except last one) */}
                            {index < meta.questions[0].choices.length - 1 && (
                              <div className='border-t border-davinci-callout-border/30 pt-6'></div>
                            )}
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voting Interface (when vote is active) */}
      {!voteEnded && (
        <Card className='border-davinci-callout-border'>
          <CardHeader className='bg-davinci-paper-base'>
            <CardTitle className='flex items-center gap-2 text-davinci-black-alt'>
              <Users className='w-5 h-5' />
              Cast Your Vote
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-6 bg-davinci-text-base space-y-6'>
            <WalletEligibilityStatus />

            {/* Vote Progress Tracker */}
            {voteId && <VoteProgressTracker onVoteAgain={handleVoteAgain} processId={process.id} voteId={voteId} />}

            {/* Voting Method Instructions - always visible */}
            {votingMethod.type === ElectionResultsTypeNames.MULTIPLE_CHOICE && (
              <div className='bg-davinci-digital-highlight p-4 rounded-lg border border-davinci-callout-border'>
                <h4 className='font-medium text-davinci-black-alt mb-3'>Multiple Choice Voting</h4>

                {/* Selection Requirements */}
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-davinci-black-alt/80'>
                      You must select a minimum of {votingMethod.min} votes and a maximum of {votingMethod.max} choices.
                      Currently selected: {selectedChoices.length}
                    </span>
                  </div>

                  {/* Selection Progress */}
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-davinci-black-alt/80'>Currently Selected:</span>
                      <span
                        className={`text-sm font-semibold ${
                          isVoteValid()
                            ? 'text-green-600'
                            : selectedChoices.length === 0
                              ? 'text-davinci-black-alt'
                              : 'text-red-600'
                        }`}
                      >
                        {selectedChoices.length} / {votingMethod.max}
                      </span>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className='relative'>
                      <div className='w-full bg-davinci-soft-neutral rounded-full h-2'>
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isVoteValid() ? 'bg-green-500' : selectedChoices.length === 0 ? 'bg-gray-300' : 'bg-red-500'
                          }`}
                          style={{
                            width: `${Math.min((selectedChoices.length / (votingMethod.max || 2)) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      {/* Minimum threshold indicator */}
                      <div
                        className='absolute top-0 h-2 w-0.5 bg-davinci-black-alt/40'
                        style={{
                          left: `${((votingMethod.min || 1) / (votingMethod.max || 2)) * 100}%`,
                        }}
                      />
                    </div>

                    {/* Status Message */}
                    <div className='text-xs'>
                      {selectedChoices.length === 0 ? (
                        <span className='text-davinci-black-alt/60'>
                          Please select between {votingMethod.min} and {votingMethod.max} choices
                        </span>
                      ) : selectedChoices.length < (votingMethod.min || 1) ? (
                        <span className='text-red-600'>
                          Select at least {(votingMethod.min || 1) - selectedChoices.length} more choice
                          {(votingMethod.min || 1) - selectedChoices.length !== 1 ? 's' : ''}
                        </span>
                      ) : selectedChoices.length > (votingMethod.max || 2) ? (
                        <span className='text-red-600'>
                          Remove {selectedChoices.length - (votingMethod.max || 2)} choice
                          {selectedChoices.length - (votingMethod.max || 2) !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className='text-green-600 flex items-center gap-1'>
                          <CheckCircle className='w-3 h-3' />
                          Valid selection
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {votingMethod.type === ElectionResultsTypeNames.QUADRATIC && (
              <div className='bg-davinci-digital-highlight p-4 rounded-lg border border-davinci-callout-border'>
                <h4 className='font-medium text-davinci-black-alt mb-2'>Quadratic Voting</h4>
                <p className='text-sm text-davinci-black-alt/80 mb-2'>
                  You have {votingMethod.credits} credits to distribute. The cost increases quadratically (1 vote = 1
                  credit, 2 votes = 4 credits, etc.).
                </p>
                <div className='flex justify-between text-sm'>
                  <span className='text-davinci-black-alt/80'>Credits used: {getTotalCreditsUsed()}</span>
                  <span className='text-davinci-black-alt/80'>Remaining: {getRemainingCredits()}</span>
                </div>
              </div>
            )}

            {/* Vote Choices - always visible */}
            <div className='space-y-4'>
              <Label className='text-davinci-black-alt font-medium'>
                {voteCount > 0 ? 'Change your vote:' : 'Select your choice:'}
              </Label>

              {/* Single Choice */}
              {votingMethod.type === ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION && (
                <RadioGroup value={selectedChoice} onValueChange={setSelectedChoice} disabled={!isAbleToVote}>
                  <div className='space-y-3'>
                    {meta.questions[0].choices.map((choice) => (
                      <div
                        key={choice.value}
                        className={`flex items-start space-x-3 p-4 rounded-lg border border-davinci-callout-border transition-colors ${
                          !isAbleToVote ? 'opacity-70 cursor-not-allowed' : 'hover:bg-davinci-soft-neutral/20'
                        }`}
                      >
                        <RadioGroupItem
                          value={choice.value.toString()}
                          id={choice.value.toString()}
                          className='border-davinci-callout-border mt-0.5'
                          disabled={!isAbleToVote}
                        />
                        <Label
                          htmlFor={choice.value.toString()}
                          className={`flex-1 leading-relaxed ${
                            !isAbleToVote
                              ? 'text-davinci-black-alt/60 cursor-not-allowed'
                              : 'text-davinci-black-alt cursor-pointer'
                          }`}
                        >
                          {choice.title.default}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}

              {/* Multiple Choice */}
              {votingMethod.type === ElectionResultsTypeNames.MULTIPLE_CHOICE && (
                <div className='space-y-3'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium text-davinci-black-alt'>Available Choices:</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        isVoteValid()
                          ? 'bg-green-100 text-green-700'
                          : selectedChoices.length === 0
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {selectedChoices.length} of {votingMethod.max} selected
                    </span>
                  </div>

                  {meta.questions[0].choices.map((choice) => {
                    const isSelected = selectedChoices.includes(choice.value.toString())
                    const canSelect = selectedChoices.length < (votingMethod.max || 2)
                    const isDisabled = !isConnected || (!isSelected && !canSelect)

                    return (
                      <div
                        key={choice.value}
                        className={`flex items-start space-x-3 p-4 rounded-lg border transition-colors ${
                          isSelected
                            ? 'border-davinci-black-alt bg-davinci-digital-highlight/30'
                            : isDisabled
                              ? 'border-davinci-callout-border/50 bg-gray-50/50 opacity-60'
                              : 'border-davinci-callout-border hover:bg-davinci-soft-neutral/20'
                        }`}
                      >
                        <Checkbox
                          id={choice.value.toString()}
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleMultipleChoiceChange(choice.value.toString(), checked as boolean)
                          }
                          disabled={isDisabled}
                          className='border-davinci-callout-border mt-0.5'
                        />
                        <Label
                          htmlFor={choice.value.toString()}
                          className={`cursor-pointer flex-1 leading-relaxed ${
                            isDisabled ? 'text-davinci-black-alt/50' : 'text-davinci-black-alt'
                          }`}
                        >
                          {choice.title.default}
                        </Label>
                        {isSelected && <CheckCircle className='w-4 h-4 text-green-600 mt-0.5 flex-shrink-0' />}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Quadratic Voting */}
              {votingMethod.type === ElectionResultsTypeNames.QUADRATIC && (
                <div className='space-y-4'>
                  {meta.questions[0].choices.map((choice) => {
                    const votes = quadraticVotes[choice.value.toString()] || 0
                    const cost = calculateQuadraticCost(votes)

                    return (
                      <div
                        key={choice.value}
                        className={`p-4 rounded-lg border border-davinci-callout-border bg-davinci-text-base ${
                          !isConnected ? 'opacity-70' : ''
                        }`}
                      >
                        <div className='flex items-start justify-between mb-3'>
                          <Label
                            className={`flex-1 leading-relaxed pr-4 ${
                              !isConnected ? 'text-davinci-black-alt/60' : 'text-davinci-black-alt'
                            }`}
                          >
                            {choice.title.default}
                          </Label>
                          <div className='text-right'>
                            <p className='text-sm font-medium text-davinci-black-alt'>{votes} votes</p>
                            <p className='text-xs text-davinci-black-alt/60'>{cost} credits</p>
                          </div>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Button
                            type='button'
                            variant='outline'
                            size='icon'
                            onClick={() => handleQuadraticVoteChange(choice.value.toString(), -1)}
                            disabled={!isConnected || votes === 0}
                            className='h-8 w-8 border-davinci-callout-border'
                          >
                            <Minus className='w-3 h-3' />
                          </Button>
                          <div className='flex-1 text-center'>
                            <Input
                              type='number'
                              min='0'
                              value={votes}
                              onChange={(e) => {
                                const newVotes = Math.max(0, Number(e.target.value) || 0)
                                setQuadraticVotes((prev) => ({
                                  ...prev,
                                  [choice.value.toString()]: newVotes,
                                }))
                              }}
                              disabled={!isConnected}
                              className='text-center border-davinci-callout-border h-8'
                            />
                          </div>
                          <Button
                            type='button'
                            variant='outline'
                            size='icon'
                            onClick={() => handleQuadraticVoteChange(choice.value.toString(), 1)}
                            disabled={!isConnected || getRemainingCredits() < calculateQuadraticCost(votes + 1) - cost}
                            className='h-8 w-8 border-davinci-callout-border'
                          >
                            <Plus className='w-3 h-3' />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Dynamic Action Button */}
            {!isConnected ? (
              <div className='space-y-4'>
                <ConnectWalletButton className='w-full' />
                <div className='bg-davinci-digital-highlight p-3 rounded-lg border border-davinci-callout-border'>
                  <p className='text-xs text-davinci-black-alt/80 text-center'>
                    Connect your wallet to verify eligibility and cast your vote. Your selections will be saved.
                  </p>
                </div>
              </div>
            ) : !isInCensus ? (
              <div className='text-center space-y-4'>
                <div
                  className={`${isCensusProofLoading ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'} p-6 rounded-lg border `}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${!isCensusProofLoading && 'bg-red-100'}`}
                  >
                    {isCensusProofLoading ? <Spinner /> : <Lock className='w-6 h-6 text-red-600' />}
                  </div>
                  {isCensusProofLoading ? (
                    <p className='text-sm text-blue-800'>Checking eligibility...</p>
                  ) : (
                    <>
                      <h3 className='text-lg font-semibold text-red-800 mb-2'>Not Eligible</h3>
                      <p className='text-red-700'>
                        Your wallet doesn't meet the requirements to participate in this vote.
                      </p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className='space-y-4'>
                {/* Submit Vote Button */}
                <Button
                  onClick={handleVoteSubmit}
                  disabled={!isVoteValid()}
                  className='w-full bg-davinci-black-alt hover:bg-davinci-black-alt/90 text-davinci-text-base'
                  loading={isVoting}
                >
                  <img src='/images/davinci-icon.png' alt='' className='w-4 h-4 mr-2' />
                  {voteCount > 0 ? 'Update Vote' : 'Vote'}
                </Button>

                {/* Validation Messages */}
                {votingMethod.type === ElectionResultsTypeNames.MULTIPLE_CHOICE &&
                  selectedChoices.length > 0 &&
                  !isVoteValid() && (
                    <div className='bg-red-50 p-3 rounded-lg border border-red-200'>
                      <div className='flex items-start gap-2'>
                        <div className='w-4 h-4 bg-red-500 rounded-full mt-0.5 flex-shrink-0' />
                        <div>
                          <p className='text-sm font-medium text-red-800'>Invalid Selection</p>
                          <p className='text-xs text-red-700'>
                            {selectedChoices.length < (votingMethod.min || 1)
                              ? `You must select at least ${votingMethod.min} choice${
                                  votingMethod.min !== 1 ? 's' : ''
                                }.`
                              : `You can select at most ${votingMethod.max} choice${
                                  votingMethod.max !== 1 ? 's' : ''
                                }.`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Encryption Notice (only when vote is active) */}
      {!voteEnded && (
        <Card className='border-davinci-callout-border'>
          <CardContent className='p-6'>
            <div className='flex items-start gap-3'>
              <Lock className='w-5 h-5 text-davinci-black-alt mt-0.5' />
              <div>
                <h3 className='font-medium text-davinci-black-alt mb-2'>Encrypted Results</h3>
                <p className='text-sm text-davinci-black-alt/80'>
                  Votes are encrypted and remain hidden until the voting period ends (<VotingTimeRemaining />{' '}
                  remaining). This ensures fairness by preventing biases like the bandwagon effect.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voting Modal */}
      <VotingModal
        isOpen={showVotingModal}
        onClose={() => setShowVotingModal(false)}
        onConfirm={confirmVote}
        selectedChoice={getVoteSelectionSummary()}
        voteQuestion={meta.questions[0].title.default}
        isRevote={voteCount > 0}
        votingMethod={votingMethod.type}
      />
    </div>
  )
}

const hexStringToUint8Array = (hex: string) =>
  new Uint8Array(
    hex
      .replace(/^0x/, '')
      .match(/.{1,2}/g)!
      .map((byte) => parseInt(byte, 16))
  )

export const WalletEligibilityStatus = () => {
  const [{ wallet }] = useConnectWallet()
  const address = wallet?.accounts?.[0]?.address ?? null
  const isConnected = !!address

  const {
    isInCensus,
    isCensusProofLoading,
    process: { process },
  } = useProcess()

  if (!isConnected) return null

  const bg = isInCensus ? 'bg-davinci-digital-highlight' : 'bg-yellow-100'

  // estimate time left for the process to end and show and alert when 5 minutes are left
  const votingEndTime = new Date(new Date(process.startTime).getTime() + process.duration / 1_000_000)
  const timeLeft = votingEndTime.getTime() - Date.now()

  return (
    <div className={`${bg} p-4 rounded-lg border border-davinci-callout-border`}>
      <div className='flex items-center gap-3'>
        <Diamond className='w-5 h-5 text-davinci-black-alt' />
        <div>
          <p className='font-medium text-davinci-black-alt'>Wallet Connected</p>
          <p className='text-sm text-davinci-black-alt/80'>
            {truncateAddress(address)} •{' '}
            {isCensusProofLoading
              ? 'Checking eligibility...'
              : isInCensus
                ? 'Eligible to vote'
                : 'Not eligible to vote'}
          </p>
          {timeLeft < 5 * 60 * 1000 && timeLeft > 0 && (
            <p className='text-sm text-red-600 mt-2'>
              ⚠️ Voting ends in less than 5 minutes! Please cast your vote soon though it might not be validated anyway.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export function getBinaryArray(positions: string[]): string[] {
  const result = Array(8).fill('0')
  positions.forEach((posStr) => {
    const pos = parseInt(posStr, 10)
    if (!isNaN(pos) && pos >= 0 && pos < 8) {
      result[pos] = '1'
    }
  })
  return result
}

const padTo = (arr: number[] | string[], length: number = 8): string[] =>
  arr
    .concat(Array(8 - arr.length).fill(0))
    .slice(0, 8)
    .map((v) => v.toString())
