'use client'

import { useEffect } from 'react'
import { ErrorFallback } from '@/components/error-fallback'
import { logRouteError } from '@/lib/error-logger'

/**
 * Error Handler for Workout History Route
 *
 * Catches errors in:
 * - /workout-history (historical workout logs)
 * - Calendar view of past workouts
 * - Workout log details
 * - Performance comparisons
 * - Filter by date/exercise/program
 *
 * Module: User Interface (Module 10)
 * Function: 10.10 - Error Boundaries
 * Reference: docs/requirements/10_user_interface_requirements.md
 */
export default function WorkoutHistoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logRouteError(error, '/workout-history', {
      context: 'Workout History',
      features: ['calendar view', 'workout logs', 'performance comparison'],
    })
  }, [error])

  return <ErrorFallback error={error} reset={reset} showDetails={process.env.NODE_ENV === 'development'} />
}
