/**
 * Logger utility for Zenith Trainer
 * Provides structured logging with different levels
 *
 * Usage:
 *   logger.debug('User action', { userId, action });
 *   logger.info('Operation completed', { duration });
 *   logger.warn('Deprecated feature used', { feature });
 *   logger.error('Failed to save', error);
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Debug level - detailed information for debugging
   * Only logs in development mode
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Info level - general informational messages
   * Only logs in development mode
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, context || '');
    }
  }

  /**
   * Warning level - potentially harmful situations
   * Logs in all environments
   */
  warn(message: string, context?: LogContext): void {
    console.warn(`[WARN] ${message}`, context || '');
  }

  /**
   * Error level - error events
   * Logs in all environments
   * In production, should send to error tracking service
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    console.error(`[ERROR] ${message}`, error || '', context || '');

    // TODO: In production, send to error tracking service (Sentry, LogRocket, etc.)
    // if (!this.isDevelopment) {
    //   sendToErrorTracking(message, error, context);
    // }
  }

  /**
   * Log with custom level
   */
  log(level: LogLevel, message: string, context?: LogContext): void {
    switch (level) {
      case 'debug':
        this.debug(message, context);
        break;
      case 'info':
        this.info(message, context);
        break;
      case 'warn':
        this.warn(message, context);
        break;
      case 'error':
        this.error(message, undefined, context);
        break;
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for extensions
export type { LogLevel, LogContext };
