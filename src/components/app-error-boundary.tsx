import React, { type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { ErrorBoundaryWrapper } from './ui/error-boundary'

interface AppErrorFallbackProps {
  error?: Error
  resetError?: () => void
}

const AppErrorFallback: React.FC<AppErrorFallbackProps> = ({ error, resetError }) => {
  const handleRefresh = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl font-bold">Application Error</CardTitle>
          <CardDescription className="text-base">
            The DAVINCI voting application encountered an unexpected error. We apologize for the inconvenience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">Error Details</h4>
              <p className="text-sm text-red-700 font-mono break-all">
                {error.message}
              </p>
            </div>
          )}
          
          <div className="flex flex-col gap-3">
            <Button onClick={resetError} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={handleRefresh} variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground bg-gray-50 p-4 rounded-lg">
            <p className="font-medium mb-2">What you can do:</p>
            <ul className="space-y-1 text-xs">
              <li>• Try refreshing the page</li>
              <li>• Check your internet connection</li>
              <li>• Clear your browser cache and cookies</li>
              <li>• Try again in a few minutes</li>
              <li>• Contact support if the problem persists</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export interface AppErrorBoundaryProps {
  children: ReactNode
}

export const AppErrorBoundary: React.FC<AppErrorBoundaryProps> = ({ children }) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('App Error Boundary caught an error:', error, errorInfo)
    
    // Here you can add error reporting to external services
    // Example:
    // if (import.meta.env.PROD) {
    //   Sentry.captureException(error, {
    //     contexts: {
    //       react: {
    //         componentStack: errorInfo.componentStack,
    //       },
    //     },
    //   })
    // }
  }

  return (
    <ErrorBoundaryWrapper
      onError={handleError}
      fallback={<AppErrorFallback />}
    >
      {children}
    </ErrorBoundaryWrapper>
  )
}