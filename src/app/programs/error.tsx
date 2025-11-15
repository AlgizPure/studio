'use client'

import { useEffect } from 'react'
import { ErrorFallback } from '@/components/error-fallback'

/**
 * Error Handler for Program Management Route
 *
 * Catches errors in:
 * - /programs/* (all program management pages)
 * - Program builder
 * - Cycle management
 * - Workout assignment
 * - ZTL export/import
 */
export default function ProgramsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Program Management Error]:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      url: window.location.href,
    })
  }, [error])

  return <ErrorFallback error={error} reset={reset} showDetails={process.env.NODE_ENV === 'development'} />
}
