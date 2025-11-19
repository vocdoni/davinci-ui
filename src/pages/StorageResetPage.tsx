import { AlertCircle, CheckCircle2, RefreshCcw } from 'lucide-react'
import { useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '~components/ui/alert'
import { Button } from '~components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~components/ui/card'

type IndexedDbWithList = IDBFactory & {
  databases?: () => Promise<Array<{ name?: string | undefined }>>
}

const deleteDatabase = (name: string) =>
  new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name)
    request.onsuccess = () => resolve()
    request.onblocked = () => resolve()
    request.onerror = () => reject(request.error ?? new Error(`Unable to delete IndexedDB database "${name}"`))
  })

const clearIndexedDb = async () => {
  if (typeof indexedDB === 'undefined') {
    return 'IndexedDB is not available in this browser.'
  }

  const idb = indexedDB as IndexedDbWithList

  if (typeof idb.databases !== 'function') {
    return 'IndexedDB cleanup is limited in this browser. Please clear application databases from browser settings if issues persist.'
  }

  const databases = await idb.databases()
  const validDatabases = databases.filter((db): db is { name: string } => Boolean(db.name))

  if (validDatabases.length === 0) {
    return 'No IndexedDB databases were found.'
  }

  await Promise.all(validDatabases.map((db) => deleteDatabase(db.name)))
  return `Deleted ${validDatabases.length} IndexedDB database${validDatabases.length === 1 ? '' : 's'}.`
}

const clearCacheStorage = async () => {
  if (typeof caches === 'undefined') {
    return 'Cache storage is not available in this browser.'
  }

  const cacheNames = await caches.keys()

  if (cacheNames.length === 0) {
    return 'No cache entries were found.'
  }

  await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
  return `Removed ${cacheNames.length} cache entr${cacheNames.length === 1 ? 'y' : 'ies'}.`
}

const clearServiceWorkers = async () => {
  if (!('serviceWorker' in navigator)) {
    return 'Service workers are not supported in this browser.'
  }

  const registrations = await navigator.serviceWorker.getRegistrations()

  if (registrations.length === 0) {
    return 'No service worker registrations were found.'
  }

  await Promise.all(registrations.map((registration) => registration.unregister()))
  return `Unregistered ${registrations.length} service worker${registrations.length === 1 ? '' : 's'}.`
}

const clearWebStorage = () => {
  if (typeof window === 'undefined') {
    return 'Web storage APIs are not available in this environment.'
  }

  window.localStorage.clear()
  window.sessionStorage.clear()

  return 'Cleared localStorage and sessionStorage entries.'
}

export default function StorageResetPage() {
  const [isClearing, setIsClearing] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [lastRunAt, setLastRunAt] = useState<Date | null>(null)

  const handleClearStorage = async () => {
    if (typeof window === 'undefined') {
      setError('This action is only available in the browser.')
      return
    }

    setIsClearing(true)
    setError(null)
    setLogs([])

    try {
      const cleanupSteps: string[] = []

      cleanupSteps.push(await clearServiceWorkers())
      cleanupSteps.push(await clearCacheStorage())
      cleanupSteps.push(clearWebStorage())
      cleanupSteps.push(await clearIndexedDb())

      setLogs(cleanupSteps)
      setLastRunAt(new Date())
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong while clearing storage.'
      setError(message)
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className='px-4'>
      <div className='max-w-3xl mx-auto space-y-8'>
        <div className='text-center'>
          <h1 className='text-4xl font-bold text-davinci-black-alt mb-4 font-averia'>Emergency Storage Reset</h1>
          <p className='text-lg text-davinci-black-alt/80'>
            If something feels off with the DAVINCI PWA, you can remove the cached files and stored metadata that the
            service worker keeps on your device.
          </p>
        </div>

        <Card className='border-davinci-callout-border bg-davinci-paper-base'>
          <CardHeader>
            <CardTitle className='text-davinci-black-alt flex items-center gap-2'>
              <RefreshCcw className='w-5 h-5' />
              Clear Stored Metadata
            </CardTitle>
            <CardDescription>
              This will try to remove cached assets, unregister service workers, and wipe browser storage created by
              DAVINCI on this device. Reload the page afterwards so the app can download a fresh copy.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <Alert>
              <AlertCircle className='h-4 w-4 text-davinci-black-alt' />
              <AlertTitle>When to use this</AlertTitle>
              <AlertDescription>
                Run this if the UI looks outdated, you cannot fetch new votes, or the app behaves inconsistently after
                an update. You may be asked to sign in again afterwards.
              </AlertDescription>
            </Alert>

            <div className='space-y-4'>
              <Button
                onClick={handleClearStorage}
                loading={isClearing}
                className='bg-davinci-black-alt hover:bg-davinci-black-alt/90 text-davinci-text-base'
              >
                Clear DAVINCI storage
              </Button>

              {error && (
                <Alert variant='destructive'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertTitle>We could not finish the cleanup</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!error && lastRunAt && (
                <Alert>
                  <CheckCircle2 className='h-4 w-4 text-davinci-black-alt' />
                  <AlertTitle>Storage cleared</AlertTitle>
                  <AlertDescription>
                    <p>
                      Completed at {lastRunAt.toLocaleTimeString()} ({lastRunAt.toLocaleDateString()}), please reload the
                      page to let DAVINCI download a fresh copy.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {logs.length > 0 && (
              <div className='space-y-3'>
                <p className='text-sm uppercase tracking-wide text-davinci-black-alt/70'>Details</p>
                <ul className='space-y-1 text-davinci-black-alt/90'>
                  {logs.map((log, index) => (
                    <li key={index} className='flex items-start gap-2'>
                      <CheckCircle2 className='w-4 h-4 mt-0.5 text-davinci-black-alt/70' />
                      <span>{log}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className='text-sm text-davinci-black-alt/70'>
              If the problem continues after running this tool, open your browser settings and manually clear the
              application storage for davinci.vote.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
