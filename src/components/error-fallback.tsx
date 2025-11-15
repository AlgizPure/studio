'use client'

import { AlertTriangle, RefreshCcw, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ErrorFallbackProps {
  error: Error
  reset: () => void
  showDetails?: boolean
}

/**
 * Error Fallback UI Component
 *
 * Displays user-friendly error message with recovery options.
 *
 * Features:
 * - User-friendly error message (no stack traces for users)
 * - "Try Again" button to reset error boundary
 * - "Report Issue" link to GitHub issues
 * - Collapsible error details (for developers)
 */
export function ErrorFallback({ error, reset, showDetails = false }: ErrorFallbackProps) {
  // User-friendly error message
  const getUserFriendlyMessage = (error: Error): string => {
    // Check common error patterns
    if (error.message.includes('fetch')) {
      return 'Network error. Please check your internet connection and try again.'
    }
    if (error.message.includes('Firebase') || error.message.includes('auth')) {
      return 'Authentication error. Please try signing in again.'
    }
    if (error.message.includes('permission') || error.message.includes('denied')) {
      return 'Permission denied. Please check your account permissions.'
    }

    // Generic message
    return 'Something went wrong. Please try again or report this issue if it persists.'
  }

  const handleReportIssue = (): void => {
    const issueTitle = encodeURIComponent(`Error: ${error.message.slice(0, 100)}`)
    const issueBody = encodeURIComponent(
      `**Error Message:**\n${error.message}\n\n` +
      `**Stack Trace:**\n\`\`\`\n${error.stack || 'No stack trace available'}\n\`\`\`\n\n` +
      `**Browser:** ${navigator.userAgent}\n` +
      `**URL:** ${window.location.href}\n\n` +
      `**Steps to Reproduce:**\n1. \n2. \n3. \n\n` +
      `**Expected Behavior:**\n\n` +
      `**Actual Behavior:**\n`
    )
    const githubIssueUrl = `https://github.com/AlgizPure/studio/issues/new?title=${issueTitle}&body=${issueBody}&labels=bug`

    window.open(githubIssueUrl, '_blank')
  }

  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Card className="w-full max-w-lg border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <CardTitle className="text-destructive">Error Occurred</CardTitle>
          </div>
          <CardDescription>
            {getUserFriendlyMessage(error)}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error details (collapsible for developers) */}
          {showDetails && (
            <Alert variant="destructive">
              <AlertDescription className="font-mono text-xs">
                <details>
                  <summary className="cursor-pointer font-sans text-sm font-medium">
                    Technical Details (for developers)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <strong>Error:</strong> {error.message}
                    </div>
                    {error.stack && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap text-xs">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              You can try refreshing the page or go back to the previous screen.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button onClick={reset} className="flex-1" size="lg">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button onClick={handleReportIssue} variant="outline" size="lg">
            <Bug className="mr-2 h-4 w-4" />
            Report Issue
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
