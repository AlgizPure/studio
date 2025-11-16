'use client'

import { useEffect } from 'react'
import { ErrorFallback } from '@/components/error-fallback'
import { logRouteError } from '@/lib/error-logger'

/**
 * Error Handler for Exercise Library Route
 *
 * Catches errors in:
 * - /library (exercise library)
 * - Exercise search & filtering
 * - Custom exercise creation
 * - Exercise details
 * - Category/muscle group filtering
 *
 * Module: User Interface (Module 10)
 * Function: 10.10 - Error Boundaries
 * Reference: docs/requirements/10_user_interface_requirements.md
 */
export default function LibraryError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logRouteError(error, '/library', {
      context: 'Exercise Library',
      features: ['search', 'filtering', 'custom exercises'],
    })
  }, [error])

  return <ErrorFallback error={error} reset={reset} showDetails={process.env.NODE_ENV === 'development'} />
}
