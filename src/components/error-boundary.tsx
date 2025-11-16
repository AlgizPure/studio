'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in child component tree,
 * logs errors, and displays fallback UI.
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 *
 * With custom fallback:
 * ```tsx
 * <ErrorBoundary fallback={(error, reset) => <CustomFallback error={error} onReset={reset} />}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so next render shows fallback UI
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error with structured logging
    const { logBoundaryError } = require('@/lib/error-logger')
    logBoundaryError(error, errorInfo)

    // Call optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // TODO: Send to error tracking service (Sentry)
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, {
    //     contexts: {
    //       react: {
    //         componentStack: errorInfo.componentStack,
    //       },
    //     },
    //   })
    // }
  }

  reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset)
      }

      // Default fallback (lazy-loaded to avoid circular dependencies)
      const ErrorFallback = require('./error-fallback').ErrorFallback
      return <ErrorFallback error={this.state.error} reset={this.reset} />
    }

    return this.props.children
  }
}
