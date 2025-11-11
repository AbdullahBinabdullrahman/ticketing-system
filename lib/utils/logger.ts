type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  userId?: number;
  requestId?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";
  private logLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info";

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[level] >= levels[this.logLevel];
  }

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, userId, requestId } = entry;

    let logMessage = `[${timestamp}] [${level.toUpperCase()}]`;

    if (userId) logMessage += ` [USER:${userId}]`;
    if (requestId) logMessage += ` [REQ:${requestId}]`;

    logMessage += ` ${message}`;

    if (context && Object.keys(context).length > 0) {
      logMessage += ` | Context: ${JSON.stringify(context)}`;
    }

    return logMessage;
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    userId?: number,
    requestId?: string
  ) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      userId,
      requestId,
    };

    const formattedLog = this.formatLog(entry);

    if (this.isDevelopment) {
      // In development, use console with colors
      const colors = {
        debug: "\x1b[36m", // Cyan
        info: "\x1b[32m", // Green
        warn: "\x1b[33m", // Yellow
        error: "\x1b[31m", // Red
      };
      const reset = "\x1b[0m";
      console.log(`${colors[level]}${formattedLog}${reset}`);
    } else {
      // In production, use structured logging
      console.log(JSON.stringify(entry));
    }
  }

  debug(
    message: string,
    context?: Record<string, unknown>,
    userId?: number,
    requestId?: string
  ) {
    this.log("debug", message, context, userId, requestId);
  }

  info(
    message: string,
    context?: Record<string, unknown>,
    userId?: number,
    requestId?: string
  ) {
    this.log("info", message, context, userId, requestId);
  }

  warn(
    message: string,
    context?: Record<string, unknown>,
    userId?: number,
    requestId?: string
  ) {
    this.log("warn", message, context, userId, requestId);
  }

  error(
    message: string,
    context?: Record<string, unknown>,
    userId?: number,
    requestId?: string
  ) {
    this.log("error", message, context, userId, requestId);
  }

  // Specialized logging methods
  apiRequest(
    method: string,
    url: string,
    body?: Record<string, unknown> | null,
    userId?: number | undefined,
    requestId?: string | undefined
  ) {
    this.info(
      `API Request: ${method} ${url}`,
      { method, url, ...body },
      userId,
      requestId
    );
  }

  apiResponse(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    userId?: number,
    requestId?: string
  ) {
    this.info(
      `API Response: ${method} ${url} - ${statusCode} (${duration}ms)`,
      { method, url, statusCode, duration },
      userId,
      requestId
    );
  }

  databaseQuery(
    query: string,
    duration: number,
    userId?: number,
    requestId?: string
  ) {
    this.debug(
      `Database Query: ${query} (${duration}ms)`,
      { query, duration },
      userId,
      requestId
    );
  }

  authEvent(
    event: string,
    userId?: number,
    details?: Record<string, unknown>,
    requestId?: string
  ) {
    this.info(`Auth Event: ${event}`, { event, ...details }, userId, requestId);
  }

  businessEvent(
    event: string,
    entityType: string,
    entityId: number,
    userId?: number,
    details?: Record<string, unknown>,
    requestId?: string
  ) {
    this.info(
      `Business Event: ${event}`,
      { event, entityType, entityId, ...details },
      userId,
      requestId
    );
  }

  errorEvent(
    error: Error,
    context?: Record<string, unknown>,
    userId?: number,
    requestId?: string
  ) {
    this.error(
      `Error Event: ${error.message}`,
      {
        error: error.message,
        stack: error.stack,
        ...context,
      },
      userId,
      requestId
    );
  }
}

export const logger = new Logger();
export default logger;
