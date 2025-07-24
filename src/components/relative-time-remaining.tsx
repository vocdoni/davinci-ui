import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useProcess } from './process-context'

const RelativeTimeRemaining = () => {
  const { process } = useProcess()
  const [timeRemaining, setTimeRemaining] = useState('')

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const start = new Date(process.process.startTime)
      const end = new Date(start.getTime() + process.process.duration / 1000000)

      if (end.getTime() <= now.getTime()) {
        setTimeRemaining('ended')
        return
      }

      const relative = formatDistanceToNow(end, { addSuffix: false })
      setTimeRemaining(relative)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [process.process.startTime, process.process.duration])

  return <>{timeRemaining}</>
}

export default RelativeTimeRemaining