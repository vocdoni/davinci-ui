export interface VoteChoice {
  id: string
  text: string
}

export interface VoteData {
  id: string
  question: string
  description: string
  choices: VoteChoice[]
  votingMethod: 'single-choice' | 'multiple-choice' | 'quadratic-voting'
  censusType: 'ethereum-wallets' | 'holonym-passport'
  duration: string
  durationUnit: 'minutes' | 'hours'
  creator: string
  startTime: Date
  endTime: Date
  totalVotes: number
  isActive: boolean
  multipleChoiceMin?: string
  multipleChoiceMax?: string
  quadraticCredits?: string
}
