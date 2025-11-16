'use client'

import { useEffect } from 'react'
import { ErrorFallback } from '@/components/error-fallback'
import { logRouteError } from '@/lib/error-logger'

/**
 * Error Handler for Schedule & Planning Route
 *
 * Catches errors in:
 * - /schedule (weekly schedule view)
 * - Calendar widget
 * - Drag-drop workout scheduling
 * - Program-to-schedule assignment
 * - Schedule editing
 *
 * Module: User Interface (Module 10)
 * Function: 10.10 - Error Boundaries
 * Reference: docs/requirements/10_user_interface_requirements.md
 */
export default function ScheduleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logRouteError(error, '/schedule', {
      context: 'Schedule & Planning',
      features: ['calendar', 'drag-drop', 'program assignment'],
    })
  }, [error])

  return <ErrorFallback error={error} reset={reset} showDetails={process.env.NODE_ENV === 'development'} />
}
