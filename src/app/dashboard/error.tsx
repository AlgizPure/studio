'use client'

import { useEffect } from 'react'
import { ErrorFallback } from '@/components/error-fallback'
import { logRouteError } from '@/lib/error-logger'

/**
 * Error Handler for Dashboard Route
 *
 * Catches errors in:
 * - /dashboard (main entry point)
 * - Dashboard widgets
 * - Quick stats
 * - Recent workouts
 * - Upcoming schedule
 *
 * Module: User Interface (Module 10)
 * Function: 10.10 - Error Boundaries
 * Reference: docs/requirements/10_user_interface_requirements.md
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logRouteError(error, '/dashboard', {
      context: 'Dashboard',
      features: ['widgets', 'quick stats', 'recent workouts'],
    })
  }, [error])

  return <ErrorFallback error={error} reset={reset} showDetails={process.env.NODE_ENV === 'development'} />
}
