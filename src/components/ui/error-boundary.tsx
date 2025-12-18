import { AlertCircle, RefreshCw } from 'lucide-react'
import React, { Component, type ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from './alert'
import { Button } from './button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Alert variant='destructive' className='m-4'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className='mt-2'>
            <p className='mb-4'>
              An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
            </p>
            <div className='flex gap-2'>
              <Button onClick={this.handleReset} variant='outline' size='sm'>
                <RefreshCw className='h-4 w-4 mr-2' />
                Try again
              </Button>
              <Button onClick={() => window.location.reload()} variant='outline' size='sm'>
                Refresh page
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )
    }

    return this.props.children
  }
}

export interface ErrorBoundaryWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({ children, fallback, onError }) => {
  return (
    <ErrorBoundary fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundary>
  )
}
