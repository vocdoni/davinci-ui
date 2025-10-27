import { useEffect, useState } from 'react'
import { useProcess } from '~contexts/process-context'

const VotingTimeRemaining = () => {
  const { process } = useProcess()
  const [timeRemaining, setTimeRemaining] = useState('')

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const start = new Date(process.process.startTime)
      const end = new Date(start.getTime() + process.process.duration / 1000000)

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
  }, [process.process.startTime, process.process.duration])

  return <>{timeRemaining}</>
}

export default VotingTimeRemaining
