/**
 * Structured Error Logging Utility
 *
 * Provides centralized error logging with consistent format.
 * Prepares for integration with error tracking services (Sentry, LogRocket).
 *
 * Module: User Interface (Module 10)
 * Function: 10.10 - Error Boundaries (Error Logging)
 * Reference: docs/requirements/10_user_interface_requirements.md
 */

interface ErrorLogContext {
  route?: string
  componentStack?: string
  userId?: string
  additionalData?: Record<string, unknown>
}

interface StructuredErrorLog {
  timestamp: string
  level: 'error' | 'warn' | 'info'
  message: string
  error: {
    name: string
    message: string
    stack?: string
    digest?: string
  }
  context: {
    url: string
    userAgent: string
    route?: string
    userId?: string
  }
  additionalData?: Record<string, unknown>
}

/**
 * Log error with structured format
 *
 * @param error - Error object
 * @param context - Additional context (route, component, user)
 * @param level - Log level (default: 'error')
 *
 * @example
 * ```typescript
 * logError(error, {
 *   route: '/dashboard',
 *   componentStack: errorInfo.componentStack,
 *   userId: user.id,
 * })
 * ```
 */
export function logError(
  error: Error & { digest?: string },
  context: ErrorLogContext = {},
  level: 'error' | 'warn' | 'info' = 'error'
): void {
  const structuredLog: StructuredErrorLog = {
    timestamp: new Date().toISOString(),
    level,
    message: error.message,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    },
    context: {
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      route: context.route,
      userId: context.userId,
    },
    additionalData: context.additionalData,
  }

  // Console logging (always)
  if (level === 'error') {
    console.error('[Structured Error Log]:', structuredLog)
  } else if (level === 'warn') {
    console.warn('[Structured Warning Log]:', structuredLog)
  } else {
    console.info('[Structured Info Log]:', structuredLog)
  }

  // TODO: Send to error tracking service (Sentry)
  // if (typeof window !== 'undefined' && window.Sentry) {
  //   window.Sentry.captureException(error, {
  //     level,
  //     contexts: {
  //       custom: structuredLog.context,
  //     },
  //     extra: structuredLog.additionalData,
  //     tags: {
  //       route: context.route,
  //     },
  //   })
  // }

  // TODO: Send to analytics (optional)
  // if (typeof window !== 'undefined' && window.gtag) {
  //   window.gtag('event', 'exception', {
  //     description: error.message,
  //     fatal: level === 'error',
  //   })
  // }
}

/**
 * Log error in route error handler
 *
 * Convenience wrapper for route-level error logging.
 *
 * @example
 * ```typescript
 * useEffect(() => {
 *   logRouteError(error, '/dashboard')
 * }, [error])
 * ```
 */
export function logRouteError(
  error: Error & { digest?: string },
  route: string,
  additionalContext?: Record<string, unknown>
): void {
  logError(error, {
    route,
    additionalData: additionalContext,
  })
}

/**
 * Log error in React Error Boundary
 *
 * Convenience wrapper for ErrorBoundary logging.
 *
 * @example
 * ```typescript
 * componentDidCatch(error: Error, errorInfo: ErrorInfo) {
 *   logBoundaryError(error, errorInfo)
 * }
 * ```
 */
export function logBoundaryError(
  error: Error,
  errorInfo: { componentStack?: string },
  route?: string
): void {
  logError(error, {
    route,
    componentStack: errorInfo.componentStack,
  })
}
