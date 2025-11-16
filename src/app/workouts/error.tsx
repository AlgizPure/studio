'use client'

import { useEffect } from 'react'
import { ErrorFallback } from '@/components/error-fallback'
import { logRouteError } from '@/lib/error-logger'

/**
 * Error Handler for Workout Builder Route
 *
 * Catches errors in:
 * - /workouts/* (all workout management pages)
 * - Workout builder (drag & drop)
 * - Exercise selection
 * - Set/rep/weight configuration
 * - Supersets/circuits
 * - Workout templates
 *
 * Module: User Interface (Module 10)
 * Function: 10.10 - Error Boundaries
 * Reference: docs/requirements/10_user_interface_requirements.md
 */
export default function WorkoutsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logRouteError(error, '/workouts', {
      context: 'Workout Builder',
      features: ['drag-drop', 'exercise selection', 'supersets'],
    })
  }, [error])

  return <ErrorFallback error={error} reset={reset} showDetails={process.env.NODE_ENV === 'development'} />
}
