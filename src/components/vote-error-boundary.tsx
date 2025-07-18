import React, { type ReactNode } from 'react'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { ErrorBoundaryWrapper } from './ui/error-boundary'

interface VoteErrorFallbackProps {
  error?: Error
  resetError?: () => void
}

const VoteErrorFallback: React.FC<VoteErrorFallbackProps> = ({ error, resetError }) => {
  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl font-semibold">Vote Error</CardTitle>
          <CardDescription>
            Something went wrong with the voting process. This could be due to network issues, wallet problems, or temporary server issues.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription className="mt-2">
              {error?.message || 'An unexpected error occurred during the voting process.'}
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col gap-2">
            <Button onClick={resetError} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">Common solutions:</p>
            <ul className="space-y-1 text-xs">
              <li>• Check your wallet connection</li>
              <li>• Ensure you have sufficient network balance</li>
              <li>• Try refreshing the page</li>
              <li>• Check your internet connection</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export interface VoteErrorBoundaryProps {
  children: ReactNode
}

export const VoteErrorBoundary: React.FC<VoteErrorBoundaryProps> = ({ children }) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Vote Error Boundary caught an error:', error, errorInfo)
    
    // You can add error reporting here (e.g., Sentry, LogRocket)
    // reportError(error, errorInfo)
  }

  return (
    <ErrorBoundaryWrapper
      onError={handleError}
      fallback={<VoteErrorFallback />}
    >
      {children}
    </ErrorBoundaryWrapper>
  )
}