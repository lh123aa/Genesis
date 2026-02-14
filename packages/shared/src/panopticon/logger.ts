import { getTraceId } from './tracer';

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogContext {
  [key: string]: any;
}

/**
 * Simple structured logger (JSON) with levels and context support.
 * Automatically includes traceId if available from tracer.
 */
export class Logger {
  private static buffer: any[] = [];
  private static MAX_LOGS = 100;

  constructor(private context: LogContext = {}) {}

  private log(level: LogLevel, message: string, context: LogContext = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      traceId: getTraceId(),
      ...this.context,
      ...context,
    };
    
    Logger.buffer.push(entry);
    if (Logger.buffer.length > Logger.MAX_LOGS) {
      Logger.buffer.shift();
    }

    console.log(JSON.stringify(entry));
  }

  public static getRecentLogs() {
    return Logger.buffer;
  }

  info(message: string, context: LogContext = {}) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context: LogContext = {}) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context: LogContext = {}) {
    this.log(LogLevel.ERROR, message, context);
  }

  /**
   * Creates a child logger with additional context.
   */
  child(context: LogContext): Logger {
    return new Logger({ ...this.context, ...context });
  }
}

export const logger = new Logger();
