import { useEffect, useState } from 'react'
import { useElection } from '~contexts/election-context'

const VotingTimeRemaining = () => {
  const { election } = useElection()
  const [timeRemaining, setTimeRemaining] = useState('')

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const start = new Date(election!.process.startTime)
      const end = new Date(start.getTime() + election!.process.duration / 1000000)

      const timeLeft = end.getTime() - now.getTime()

      if (timeLeft <= 0) {
        setTimeRemaining('00:00:00')
        return
      }

      const hours = Math.floor(timeLeft / (1000 * 60 * 60))
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

      setTimeRemaining(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      )
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [election])

  return <>{timeRemaining}</>
}

export default VotingTimeRemaining
