'use client'

import { useEffect } from 'react'
import { ErrorFallback } from '@/components/error-fallback'

/**
 * Error Handler for Dashboard Route
 *
 * Catches errors in:
 * - /dashboard (main entry point)
 * - Dashboard widgets
 * - Quick stats
 * - Recent workouts
 * - Upcoming schedule
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Dashboard Error]:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      url: window.location.href,
    })
  }, [error])

  return <ErrorFallback error={error} reset={reset} showDetails={process.env.NODE_ENV === 'development'} />
}
