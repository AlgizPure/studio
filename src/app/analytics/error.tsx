'use client'

import { useEffect } from 'react'
import { ErrorFallback } from '@/components/error-fallback'

/**
 * Error Handler for Analytics Route
 *
 * Catches errors in:
 * - /analytics/* (all analytics pages)
 * - Recharts components (charts can fail with invalid data)
 * - Volume calculations
 * - RPE analytics
 * - Progress visualizations
 */
export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Analytics Error]:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      url: window.location.href,
    })

    // Analytics errors are often due to invalid/missing data
    // Log this for debugging
  }, [error])

  return <ErrorFallback error={error} reset={reset} showDetails={process.env.NODE_ENV === 'development'} />
}
