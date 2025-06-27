import { useEffect } from 'react'
import { useRevalidator } from 'react-router-dom'

const useLoaderAutoRefresh = (intervalMs = 10_000) => {
  const { revalidate } = useRevalidator()

  useEffect(() => {
    const interval = setInterval(() => {
      revalidate()
    }, intervalMs)

    return () => clearInterval(interval)
  }, [revalidate, intervalMs])
}

export default useLoaderAutoRefresh
