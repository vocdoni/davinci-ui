"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { VotingModal } from "@/components/voting-modal"
import { Wallet, Diamond, Clock, Lock, Users, CheckCircle, BarChart3, Plus, Minus } from "lucide-react"
import { VoteProgressTracker } from "@/components/vote-progress-tracker"

interface Choice {
  id: string
  text: string
}

interface VoteData {
  id: string
  question: string
  description: string
  choices: Choice[]
  votingMethod: "single-choice" | "multiple-choice" | "quadratic-voting"
  censusType: "ethereum-wallets" | "holonym-passport"
  duration: string
  durationUnit: "minutes" | "hours"
  creator: string
  startTime: Date
  endTime: Date
  totalVotes: number
  isActive: boolean
  // Additional configuration for different voting methods
  multipleChoiceMin?: string
  multipleChoiceMax?: string
  quadraticCredits?: string
}

interface VoteDisplayProps {
  voteData: VoteData
}

interface VoteResults {
  [choiceId: string]: {
    votes: number
    percentage: number
  }
}

interface QuadraticVote {
  [choiceId: string]: number
}

export function VoteDisplay({ voteData }: VoteDisplayProps) {
  const [walletConnected, setWalletConnected] = useState(false)
  const [isEligible, setIsEligible] = useState(true)
  const [selectedChoice, setSelectedChoice] = useState("")
  const [selectedChoices, setSelectedChoices] = useState<string[]>([])
  const [quadraticVotes, setQuadraticVotes] = useState<QuadraticVote>({})
  const [voteCount, setVoteCount] = useState(0)
  const [showVotingModal, setShowVotingModal] = useState(false)
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState("")
  const [voteEnded, setVoteEnded] = useState(false)
  const [results, setResults] = useState<VoteResults>({})
  const [currentTotalVotes, setCurrentTotalVotes] = useState(voteData.totalVotes)
  const [justVoted, setJustVoted] = useState(false)
  const [showProgressTracker, setShowProgressTracker] = useState(false)

  // Initialize quadratic votes
  useEffect(() => {
    if (voteData.votingMethod === "quadratic-voting") {
      const initialVotes: QuadraticVote = {}
      voteData.choices.forEach((choice) => {
        initialVotes[choice.id] = 0
      })
      setQuadraticVotes(initialVotes)
    }
  }, [voteData.choices, voteData.votingMethod])

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
    const totalCredits = Number.parseInt(voteData.quadraticCredits || "100")
    return totalCredits - getTotalCreditsUsed()
  }

  // Generate realistic vote results
  const generateResults = (): VoteResults => {
    const totalVotes = currentTotalVotes
    const results: VoteResults = {}
    let remainingVotes = totalVotes

    voteData.choices.forEach((choice, index) => {
      if (index === voteData.choices.length - 1) {
        results[choice.id] = {
          votes: remainingVotes,
          percentage: (remainingVotes / totalVotes) * 100,
        }
      } else {
        const maxVotes = Math.floor(remainingVotes * 0.6)
        const minVotes = Math.floor(remainingVotes * 0.1)
        const votes = Math.floor(Math.random() * (maxVotes - minVotes) + minVotes)

        results[choice.id] = {
          votes,
          percentage: (votes / totalVotes) * 100,
        }
        remainingVotes -= votes
      }
    })

    return results
  }

  // Update countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const timeLeft = voteData.endTime.getTime() - now.getTime()

      if (timeLeft <= 0) {
        setTimeRemaining("00:00:00")
        if (!voteEnded) {
          setVoteEnded(true)
          setResults(generateResults())
          // Remove the line that adds random votes here
        }
        return
      }

      const hours = Math.floor(timeLeft / (1000 * 60 * 60))
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

      setTimeRemaining(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      )
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [voteData.endTime, voteEnded, currentTotalVotes])

  // Simulate vote count increases while voting is active
  useEffect(() => {
    if (!voteEnded && voteData.isActive) {
      const interval = setInterval(() => {
        setCurrentTotalVotes((prev) => prev + Math.floor(Math.random() * 3))
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [voteEnded, voteData.isActive])

  // Clear "just voted" state after a few seconds
  useEffect(() => {
    if (justVoted) {
      const timeout = setTimeout(() => {
        setJustVoted(false)
      }, 3000)
      return () => clearTimeout(timeout)
    }
  }, [justVoted])

  const handleConnectWallet = async () => {
    setIsCheckingEligibility(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setWalletConnected(true)
    setIsCheckingEligibility(false)
  }

  const handleVoteSubmit = () => {
    if (!isVoteValid()) return
    setShowVotingModal(true)
  }

  const confirmVote = () => {
    setVoteCount((prev) => prev + 1)
    setShowVotingModal(false)
    setCurrentTotalVotes((prev) => prev + 1)

    // Show progress tracker
    setShowProgressTracker(true)

    // Clear selections after voting
    setSelectedChoice("")
    setSelectedChoices([])
    if (voteData.votingMethod === "quadratic-voting") {
      const resetVotes: QuadraticVote = {}
      voteData.choices.forEach((choice) => {
        resetVotes[choice.id] = 0
      })
      setQuadraticVotes(resetVotes)
    }

    setJustVoted(true)
  }

  const handleResetProgress = () => {
    setShowProgressTracker(false)
  }

  const handleVoteAgain = () => {
    setShowProgressTracker(false)
    // Reset form to allow voting again
    setSelectedChoice("")
    setSelectedChoices([])
    if (voteData.votingMethod === "quadratic-voting") {
      const resetVotes: QuadraticVote = {}
      voteData.choices.forEach((choice) => {
        resetVotes[choice.id] = 0
      })
      setQuadraticVotes(resetVotes)
    }
  }

  // Validation for different voting methods
  const isVoteValid = (): boolean => {
    switch (voteData.votingMethod) {
      case "single-choice":
        return selectedChoice !== ""
      case "multiple-choice":
        const min = Number.parseInt(voteData.multipleChoiceMin || "1")
        const max = Number.parseInt(voteData.multipleChoiceMax || "2")
        return selectedChoices.length >= min && selectedChoices.length <= max
      case "quadratic-voting":
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
        0,
      )
      const totalCredits = Number.parseInt(voteData.quadraticCredits || "100")

      if (totalCost <= totalCredits) {
        return newQuadraticVotes
      }

      return prev // Don't update if it would exceed credits
    })
  }

  const getVoteSelectionSummary = () => {
    switch (voteData.votingMethod) {
      case "single-choice":
        return voteData.choices.find((choice) => choice.id === selectedChoice)?.text || ""
      case "multiple-choice":
        return selectedChoices.map((id) => voteData.choices.find((choice) => choice.id === id)?.text).join(", ")
      case "quadratic-voting":
        return Object.entries(quadraticVotes)
          .filter(([, votes]) => votes > 0)
          .map(([choiceId, votes]) => {
            const choice = voteData.choices.find((c) => c.id === choiceId)
            return `${choice?.text}: ${votes} vote${votes !== 1 ? "s" : ""}`
          })
          .join(", ")
      default:
        return ""
    }
  }

  const getWinningChoice = () => {
    if (!results || Object.keys(results).length === 0) return null

    let maxVotes = 0
    let winningChoiceId = ""

    Object.entries(results).forEach(([choiceId, result]) => {
      if (result.votes > maxVotes) {
        maxVotes = result.votes
        winningChoiceId = choiceId
      }
    })

    return voteData.choices.find((choice) => choice.id === winningChoiceId)
  }

  const winningChoice = getWinningChoice()

  return (
    <div className="space-y-6">
      {/* Vote Status */}
      <Card className="border-davinci-callout-border">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${!voteEnded ? "bg-green-500" : "bg-gray-500"}`} />
              <span className="font-medium text-davinci-black-alt">{!voteEnded ? "Active Vote" : "Vote Ended"}</span>
              <Badge className="bg-davinci-soft-neutral text-davinci-black-alt">
                {voteData.votingMethod === "single-choice"
                  ? "Single Choice"
                  : voteData.votingMethod === "multiple-choice"
                    ? "Multiple Choice"
                    : "Quadratic Voting"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-davinci-black-alt/80">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium font-mono">{!voteEnded ? timeRemaining : "Ended"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vote Progress Tracker */}
      {showProgressTracker && (
        <VoteProgressTracker
          isVisible={showProgressTracker}
          onResetProgress={handleResetProgress}
          onVoteAgain={handleVoteAgain}
        />
      )}

      {/* Vote Question */}
      <Card className="border-davinci-callout-border">
        <CardHeader className="bg-davinci-paper-base">
          <CardTitle className="text-xl text-davinci-black-alt">Vote Question</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 bg-davinci-text-base">
          <h2 className="text-2xl font-bold text-davinci-black-alt mb-4">{voteData.question}</h2>
        </CardContent>
      </Card>

      {/* Results Display (when vote ended) */}
      {voteEnded && (
        <Card className="border-davinci-callout-border">
          <CardHeader className="bg-davinci-paper-base">
            <CardTitle className="flex items-center gap-2 text-davinci-black-alt">
              <BarChart3 className="w-5 h-5" />
              Vote Results
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 bg-davinci-text-base space-y-8">
            {/* Summary Statistics */}
            <div className="mt-8 p-6 bg-gradient-to-r from-davinci-paper-base/50 to-davinci-soft-neutral/30 rounded-xl border border-davinci-callout-border">
              <h5 className="font-semibold text-davinci-black-alt mb-4">Vote Summary</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-davinci-black-alt">{currentTotalVotes.toLocaleString()}</p>
                  <p className="text-xs text-davinci-black-alt/60">Total Votes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-davinci-black-alt">
                    {((currentTotalVotes / 5000) * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-davinci-black-alt/60">Turnout</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-davinci-black-alt">
                    {Object.values(results).filter((r) => r.votes > 0).length}
                  </p>
                  <p className="text-xs text-davinci-black-alt/60">Choices with Votes</p>
                </div>
              </div>
            </div>

            {/* Enhanced Results Visualization */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-bold text-davinci-black-alt">Detailed Results</h4>
                <div className="text-sm text-davinci-black-alt/60">
                  Total: {currentTotalVotes.toLocaleString()} votes
                </div>
              </div>

              {/* Single Card with All Results */}
              <Card className="border-davinci-callout-border bg-davinci-paper-base/30">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {voteData.choices
                      .map((choice) => ({
                        ...choice,
                        result: results[choice.id],
                      }))
                      .sort((a, b) => (b.result?.votes || 0) - (a.result?.votes || 0))
                      .map((choice, index) => {
                        const result = choice.result
                        const percentage = result?.percentage || 0
                        const votes = result?.votes || 0

                        // Color scheme based on ranking
                        const getBarColor = () => {
                          switch (index) {
                            case 0:
                              return "from-yellow-400 via-yellow-500 to-yellow-600"
                            case 1:
                              return "from-davinci-secondary-accent via-davinci-secondary-accent/80 to-davinci-secondary-accent/60"
                            case 2:
                              return "from-davinci-digital-highlight via-davinci-digital-highlight/80 to-davinci-digital-highlight/60"
                            default:
                              return "from-davinci-soft-neutral via-davinci-soft-neutral/80 to-davinci-soft-neutral/60"
                          }
                        }

                        return (
                          <div key={choice.id} className="space-y-3">
                            {/* Choice Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1 pr-4">
                                <p className="font-semibold text-lg leading-relaxed text-davinci-black-alt">
                                  {choice.text}
                                </p>
                              </div>
                              <div className="text-right space-y-1">
                                <p className="text-2xl font-bold text-davinci-black-alt">{votes.toLocaleString()}</p>
                                <p className="text-sm text-davinci-black-alt/60">votes</p>
                              </div>
                            </div>

                            {/* Progress Bar Section */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-davinci-black-alt/80">
                                  {percentage.toFixed(1)}% of total votes
                                </span>
                                <span className="text-davinci-black-alt/60">Rank #{index + 1}</span>
                              </div>

                              {/* Custom Progress Bar */}
                              <div className="relative">
                                <div className="w-full h-4 bg-davinci-soft-neutral/30 rounded-full overflow-hidden shadow-inner">
                                  <div
                                    className={`h-full bg-gradient-to-r ${getBarColor()} rounded-full transition-all duration-1000 ease-out shadow-sm relative overflow-hidden`}
                                    style={{ width: `${Math.max(percentage, 2)}%` }}
                                  >
                                    {/* Shimmer effect for top choice */}
                                    {index === 0 && (
                                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                                    )}
                                  </div>
                                </div>

                                {/* Percentage label on bar */}
                                {percentage > 15 && (
                                  <div
                                    className="absolute top-0 h-4 flex items-center pr-2"
                                    style={{ width: `${percentage}%` }}
                                  >
                                    <span className="ml-auto text-xs font-bold text-white drop-shadow-sm">
                                      {percentage.toFixed(1)}%
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Separator between choices (except last one) */}
                            {index < voteData.choices.length - 1 && (
                              <div className="border-t border-davinci-callout-border/30 pt-6"></div>
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
        <Card className="border-davinci-callout-border">
          <CardHeader className="bg-davinci-paper-base">
            <CardTitle className="flex items-center gap-2 text-davinci-black-alt">
              <Users className="w-5 h-5" />
              Cast Your Vote
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 bg-davinci-text-base space-y-6">
            {/* Wallet Connected Status - only show when connected */}
            {walletConnected && (
              <div className="bg-davinci-digital-highlight p-4 rounded-lg border border-davinci-callout-border">
                <div className="flex items-center gap-3">
                  <Diamond className="w-5 h-5 text-davinci-black-alt" />
                  <div>
                    <p className="font-medium text-davinci-black-alt">Wallet Connected</p>
                    <p className="text-sm text-davinci-black-alt/80">johndoe.eth • Eligible to vote</p>
                  </div>
                </div>
              </div>
            )}

            {/* Vote Success Message (temporary) */}
            {justVoted && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Vote Recorded!</p>
                    <p className="text-sm text-green-700">
                      Your vote has been securely recorded. You can vote again to change your choice.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Voting Method Instructions - always visible */}
            {voteData.votingMethod === "multiple-choice" && (
              <div className="bg-davinci-digital-highlight p-4 rounded-lg border border-davinci-callout-border">
                <h4 className="font-medium text-davinci-black-alt mb-3">Multiple Choice Voting</h4>

                {/* Selection Requirements */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-davinci-black-alt/80">
                      You must select a minimum of {voteData.multipleChoiceMin} votes and a maximum of{" "}
                      {voteData.multipleChoiceMax} choices. Currently selected: {selectedChoices.length}
                    </span>
                  </div>

                  {/* Selection Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-davinci-black-alt/80">Currently Selected:</span>
                      <span
                        className={`text-sm font-semibold ${
                          isVoteValid()
                            ? "text-green-600"
                            : selectedChoices.length === 0
                              ? "text-davinci-black-alt"
                              : "text-red-600"
                        }`}
                      >
                        {selectedChoices.length} / {voteData.multipleChoiceMax}
                      </span>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="relative">
                      <div className="w-full bg-davinci-soft-neutral rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isVoteValid() ? "bg-green-500" : selectedChoices.length === 0 ? "bg-gray-300" : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.min((selectedChoices.length / Number.parseInt(voteData.multipleChoiceMax || "2")) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      {/* Minimum threshold indicator */}
                      <div
                        className="absolute top-0 h-2 w-0.5 bg-davinci-black-alt/40"
                        style={{
                          left: `${(Number.parseInt(voteData.multipleChoiceMin || "1") / Number.parseInt(voteData.multipleChoiceMax || "2")) * 100}%`,
                        }}
                      />
                    </div>

                    {/* Status Message */}
                    <div className="text-xs">
                      {selectedChoices.length === 0 ? (
                        <span className="text-davinci-black-alt/60">
                          Please select between {voteData.multipleChoiceMin} and {voteData.multipleChoiceMax} choices
                        </span>
                      ) : selectedChoices.length < Number.parseInt(voteData.multipleChoiceMin || "1") ? (
                        <span className="text-red-600">
                          Select at least {Number.parseInt(voteData.multipleChoiceMin || "1") - selectedChoices.length}{" "}
                          more choice
                          {Number.parseInt(voteData.multipleChoiceMin || "1") - selectedChoices.length !== 1 ? "s" : ""}
                        </span>
                      ) : selectedChoices.length > Number.parseInt(voteData.multipleChoiceMax || "2") ? (
                        <span className="text-red-600">
                          Remove {selectedChoices.length - Number.parseInt(voteData.multipleChoiceMax || "2")} choice
                          {selectedChoices.length - Number.parseInt(voteData.multipleChoiceMax || "2") !== 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Valid selection
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {voteData.votingMethod === "quadratic-voting" && (
              <div className="bg-davinci-digital-highlight p-4 rounded-lg border border-davinci-callout-border">
                <h4 className="font-medium text-davinci-black-alt mb-2">Quadratic Voting</h4>
                <p className="text-sm text-davinci-black-alt/80 mb-2">
                  You have {voteData.quadraticCredits} credits to distribute. The cost increases quadratically (1 vote =
                  1 credit, 2 votes = 4 credits, etc.).
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-davinci-black-alt/80">Credits used: {getTotalCreditsUsed()}</span>
                  <span className="text-davinci-black-alt/80">Remaining: {getRemainingCredits()}</span>
                </div>
              </div>
            )}

            {/* Vote Choices - always visible */}
            <div className="space-y-4">
              <Label className="text-davinci-black-alt font-medium">
                {voteCount > 0 ? "Change your vote:" : "Select your choice:"}
              </Label>

              {/* Single Choice */}
              {voteData.votingMethod === "single-choice" && (
                <RadioGroup value={selectedChoice} onValueChange={setSelectedChoice} disabled={!walletConnected}>
                  <div className="space-y-3">
                    {voteData.choices.map((choice) => (
                      <div
                        key={choice.id}
                        className={`flex items-start space-x-3 p-4 rounded-lg border border-davinci-callout-border transition-colors ${
                          !walletConnected ? "opacity-70 cursor-not-allowed" : "hover:bg-davinci-soft-neutral/20"
                        }`}
                      >
                        <RadioGroupItem
                          value={choice.id}
                          id={choice.id}
                          className="border-davinci-callout-border mt-0.5"
                          disabled={!walletConnected}
                        />
                        <Label
                          htmlFor={choice.id}
                          className={`flex-1 leading-relaxed ${
                            !walletConnected
                              ? "text-davinci-black-alt/60 cursor-not-allowed"
                              : "text-davinci-black-alt cursor-pointer"
                          }`}
                        >
                          {choice.text}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}

              {/* Multiple Choice */}
              {voteData.votingMethod === "multiple-choice" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-davinci-black-alt">Available Choices:</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        isVoteValid()
                          ? "bg-green-100 text-green-700"
                          : selectedChoices.length === 0
                            ? "bg-gray-100 text-gray-600"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {selectedChoices.length} of {voteData.multipleChoiceMax} selected
                    </span>
                  </div>

                  {voteData.choices.map((choice) => {
                    const isSelected = selectedChoices.includes(choice.id)
                    const canSelect = selectedChoices.length < Number.parseInt(voteData.multipleChoiceMax || "2")
                    const isDisabled = !walletConnected || (!isSelected && !canSelect)

                    return (
                      <div
                        key={choice.id}
                        className={`flex items-start space-x-3 p-4 rounded-lg border transition-colors ${
                          isSelected
                            ? "border-davinci-black-alt bg-davinci-digital-highlight/30"
                            : isDisabled
                              ? "border-davinci-callout-border/50 bg-gray-50/50 opacity-60"
                              : "border-davinci-callout-border hover:bg-davinci-soft-neutral/20"
                        }`}
                      >
                        <Checkbox
                          id={choice.id}
                          checked={isSelected}
                          onCheckedChange={(checked) => handleMultipleChoiceChange(choice.id, checked as boolean)}
                          disabled={isDisabled}
                          className="border-davinci-callout-border mt-0.5"
                        />
                        <Label
                          htmlFor={choice.id}
                          className={`cursor-pointer flex-1 leading-relaxed ${
                            isDisabled ? "text-davinci-black-alt/50" : "text-davinci-black-alt"
                          }`}
                        >
                          {choice.text}
                        </Label>
                        {isSelected && <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Quadratic Voting */}
              {voteData.votingMethod === "quadratic-voting" && (
                <div className="space-y-4">
                  {voteData.choices.map((choice) => {
                    const votes = quadraticVotes[choice.id] || 0
                    const cost = calculateQuadraticCost(votes)

                    return (
                      <div
                        key={choice.id}
                        className={`p-4 rounded-lg border border-davinci-callout-border bg-davinci-text-base ${
                          !walletConnected ? "opacity-70" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <Label
                            className={`flex-1 leading-relaxed pr-4 ${
                              !walletConnected ? "text-davinci-black-alt/60" : "text-davinci-black-alt"
                            }`}
                          >
                            {choice.text}
                          </Label>
                          <div className="text-right">
                            <p className="text-sm font-medium text-davinci-black-alt">{votes} votes</p>
                            <p className="text-xs text-davinci-black-alt/60">{cost} credits</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuadraticVoteChange(choice.id, -1)}
                            disabled={!walletConnected || votes === 0}
                            className="h-8 w-8 border-davinci-callout-border"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <div className="flex-1 text-center">
                            <Input
                              type="number"
                              min="0"
                              value={votes}
                              onChange={(e) => {
                                const newVotes = Math.max(0, Number.parseInt(e.target.value) || 0)
                                setQuadraticVotes((prev) => ({ ...prev, [choice.id]: newVotes }))
                              }}
                              disabled={!walletConnected}
                              className="text-center border-davinci-callout-border h-8"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuadraticVoteChange(choice.id, 1)}
                            disabled={
                              !walletConnected || getRemainingCredits() < calculateQuadraticCost(votes + 1) - cost
                            }
                            className="h-8 w-8 border-davinci-callout-border"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Dynamic Action Button */}
            {!walletConnected ? (
              <div className="space-y-4">
                <Button
                  onClick={handleConnectWallet}
                  disabled={isCheckingEligibility}
                  className="w-full bg-davinci-black-alt hover:bg-davinci-black-alt/90 text-davinci-text-base"
                >
                  {isCheckingEligibility ? (
                    <>
                      <div className="w-4 h-4 border-2 border-davinci-text-base/30 border-t-davinci-text-base rounded-full animate-spin mr-2" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect wallet to vote
                    </>
                  )}
                </Button>
                <div className="bg-davinci-digital-highlight p-3 rounded-lg border border-davinci-callout-border">
                  <p className="text-xs text-davinci-black-alt/80 text-center">
                    Connect your wallet to verify eligibility and cast your vote. Your selections will be saved.
                  </p>
                </div>
              </div>
            ) : !isEligible ? (
              <div className="text-center space-y-4">
                <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Not Eligible</h3>
                  <p className="text-red-700">Your wallet doesn't meet the requirements to participate in this vote.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Submit Vote Button */}
                <Button
                  onClick={handleVoteSubmit}
                  disabled={!isVoteValid()}
                  className="w-full bg-davinci-black-alt hover:bg-davinci-black-alt/90 text-davinci-text-base"
                >
                  <img src="/images/davinci-icon.png" alt="" className="w-4 h-4 mr-2" />
                  {voteCount > 0 ? "Update Vote" : "Vote"}
                </Button>

                {/* Validation Messages */}
                {voteData.votingMethod === "multiple-choice" && selectedChoices.length > 0 && !isVoteValid() && (
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Invalid Selection</p>
                        <p className="text-xs text-red-700">
                          {selectedChoices.length < Number.parseInt(voteData.multipleChoiceMin || "1")
                            ? `You must select at least ${voteData.multipleChoiceMin} choice${voteData.multipleChoiceMin !== "1" ? "s" : ""}.`
                            : `You can select at most ${voteData.multipleChoiceMax} choice${voteData.multipleChoiceMax !== "1" ? "s" : ""}.`}
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
        <Card className="border-davinci-callout-border">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-davinci-black-alt mt-0.5" />
              <div>
                <h3 className="font-medium text-davinci-black-alt mb-2">Encrypted Results</h3>
                <p className="text-sm text-davinci-black-alt/80">
                  Vote results are encrypted and will only be revealed when the voting period ends ({timeRemaining}{" "}
                  remaining). This ensures the integrity of the voting process and prevents vote manipulation.
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
        voteQuestion={voteData.question}
        isRevote={voteCount > 0}
        votingMethod={voteData.votingMethod}
      />
    </div>
  )
}
