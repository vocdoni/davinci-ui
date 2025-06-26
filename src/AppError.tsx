import { AlertCircle } from 'lucide-react'
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom'
import { Button } from '~components/ui/button'

type CodedError = Error & { code?: number }

const isCodedError = (err: unknown): err is CodedError =>
  err instanceof Error && 'code' in err && typeof err.code === 'number'

const AppError = () => {
  const error = useRouteError()
  const navigate = useNavigate()

  const is404 =
    !error ||
    (isRouteErrorResponse(error) && error.status === 404) ||
    (error instanceof Response && error.status === 404) ||
    (isCodedError(error) && error.code === 40007)

  const isProcessNotFound = is404 && isCodedError(error) && error.code === 40007

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : isRouteErrorResponse(error)
          ? error.statusText
          : null

  return (
    <div className='max-w-2xl mx-auto mt-20 bg-card dark:bg-zinc-900 rounded-xl border p-10 text-center'>
      <div className='mx-auto mb-6 w-20 h-20 flex items-center justify-center rounded-full bg-muted'>
        <AlertCircle className='w-12 h-12 text-muted-foreground' />
      </div>

      <h1 className='text-2xl font-semibold mb-2 font-averia'>
        {isProcessNotFound ? 'Voting Process Not Found' : is404 ? 'Page Not Found' : 'An Error Occurred'}
      </h1>

      <p className='text-muted-foreground mb-6'>
        {isProcessNotFound
          ? "The voting process you're looking for could not be located. This might happen if the link is incorrect or there is an error."
          : is404
            ? 'The page you are looking for does not exist.'
            : 'An unexpected error occurred.'}
      </p>

      {errorMessage && !is404 && (
        <pre className='text-sm text-red-500 bg-red-50 dark:bg-red-950 p-4 rounded-lg overflow-x-auto mb-6 text-left whitespace-pre-wrap break-words'>
          {errorMessage}
        </pre>
      )}

      {is404 && (
        <div className='bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100 text-sm rounded-lg p-4 mb-6 text-left'>
          <p className='font-medium mb-2'>Need Help?</p>
          <ul className='list-disc list-inside space-y-1'>
            <li>Check if the voting process URL is correct</li>
            <li>Verify that the voting process hasn’t expired</li>
            <li>Contact the vote creator if you believe this is an error</li>
          </ul>
        </div>
      )}

      <div className='flex justify-center gap-3'>
        <Button variant='outline' onClick={() => window.history.back()}>
          Go Back
        </Button>
        <Button onClick={() => navigate('/')}>Create a new vote</Button>
      </div>
    </div>
  )
}

export default AppError
