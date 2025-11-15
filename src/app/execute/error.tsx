'use client'

import { useEffect } from 'react'
import { ErrorFallback } from '@/components/error-fallback'

/**
 * Error Handler for Workout Execution Route
 *
 * This is a critical route - errors during workout execution
 * should be handled gracefully to prevent data loss.
 *
 * Catches errors in:
 * - /execute/* (all workout execution pages)
 * - Exercise tracking components
 * - Rest timer
 * - RPE slider
 * - Set logging
 */
export default function ExecuteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error with context
    console.error('[Workout Execution Error]:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      url: window.location.href,
    })

    // TODO: Send to error tracking service with high priority
    // Workout execution errors are critical!
  }, [error])

  return <ErrorFallback error={error} reset={reset} showDetails={process.env.NODE_ENV === 'development'} />
}
