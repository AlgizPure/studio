'use client'

import { useEffect } from 'react'
import { ErrorFallback } from '@/components/error-fallback'
import { logRouteError } from '@/lib/error-logger'

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
 *
 * Module: User Interface (Module 10)
 * Function: 10.10 - Error Boundaries
 * Reference: docs/requirements/10_user_interface_requirements.md
 */
export default function ExecuteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // CRITICAL: Workout execution errors are high priority!
    logRouteError(error, '/execute', {
      context: 'Workout Execution (CRITICAL)',
      features: ['exercise tracking', 'rest timer', 'RPE slider', 'set logging'],
      priority: 'HIGH',
    })

    // TODO: Send to error tracking service with high priority
    // Workout execution errors are critical!
  }, [error])

  return <ErrorFallback error={error} reset={reset} showDetails={process.env.NODE_ENV === 'development'} />
}
