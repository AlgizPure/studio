'use client'

import { useEffect } from 'react'
import { ErrorFallback } from '@/components/error-fallback'
import { logRouteError } from '@/lib/error-logger'

/**
 * Error Handler for Analytics Route
 *
 * Catches errors in:
 * - /analytics/* (all analytics pages)
 * - Recharts components (charts can fail with invalid data)
 * - Volume calculations
 * - RPE analytics
 * - Progress visualizations
 *
 * Module: User Interface (Module 10)
 * Function: 10.10 - Error Boundaries
 * Reference: docs/requirements/10_user_interface_requirements.md
 */
export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Analytics errors are often due to invalid/missing data
    logRouteError(error, '/analytics', {
      context: 'Analytics',
      features: ['Recharts', 'volume calculations', 'RPE analytics'],
      note: 'Often caused by invalid/missing data',
    })
  }, [error])

  return <ErrorFallback error={error} reset={reset} showDetails={process.env.NODE_ENV === 'development'} />
}
