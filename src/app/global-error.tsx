'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Global Error Handler
 *
 * Catches errors that occur outside of the normal app boundary
 * (e.g., root layout errors, _app errors).
 *
 * This must be a Client Component.
 * Wraps the entire application.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console
    console.error('Global error:', error)

    // TODO: Send to error tracking service (Sentry)
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error)
    // }
  }, [error])

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
          <div className="w-full max-w-md space-y-6 text-center">
            <AlertTriangle className="mx-auto h-16 w-16 text-destructive" />

            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Something Went Wrong</h1>
              <p className="text-muted-foreground">
                A critical error occurred. The application needs to be reloaded.
              </p>
            </div>

            {/* Error details (in development only) */}
            {process.env.NODE_ENV === 'development' && (
              <details className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-left">
                <summary className="cursor-pointer font-medium">
                  Error Details (Development Only)
                </summary>
                <div className="mt-2 space-y-2 text-sm">
                  <div>
                    <strong>Message:</strong> {error.message}
                  </div>
                  {error.digest && (
                    <div>
                      <strong>Digest:</strong> {error.digest}
                    </div>
                  )}
                  {error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap text-xs font-mono">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex flex-col gap-2">
              <Button onClick={reset} size="lg" className="w-full">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button onClick={() => window.location.href = '/'} variant="outline" size="lg" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Go to Homepage
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              If this problem persists, please{' '}
              <a
                href="https://github.com/AlgizPure/studio/issues/new?labels=bug"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                report it on GitHub
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
