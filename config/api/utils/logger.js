/**
 * Logger utility to standardize and control application logging
 */
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

// Default to INFO in production, DEBUG in development
const DEFAULT_LOG_LEVEL = process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

class Logger {
  constructor(options = {}) {
    this.logLevel = options.logLevel || DEFAULT_LOG_LEVEL;
    this.ignoredErrors = options.ignoredErrors || [];
    this.context = options.context || '';
  }

  /**
   * Formats a log message with a context prefix
   */
  formatMessage(message) {
    if (this.context) {
      return `[${this.context}] ${message}`;
    }
    return message;
  }

  /**
   * Determines if a message should be logged based on log level and error filters
   */
  shouldLog(level, message) {
    if (level > this.logLevel) return false;
    
    // Check if this is an error that should be suppressed
    if (level === LOG_LEVELS.ERROR && message && this.ignoredErrors.some(pattern => {
      return typeof pattern === 'string' 
        ? message.includes(pattern) 
        : pattern.test(message);
    })) {
      return false;
    }
    
    return true;
  }

  /**
   * Error level logging
   */
  error(message, error) {
    if (!this.shouldLog(LOG_LEVELS.ERROR, message)) return;
    
    if (error) {
      console.error(this.formatMessage(message), error);
    } else {
      console.error(this.formatMessage(message));
    }
  }

  /**
   * Warning level logging
   */
  warn(message) {
    if (!this.shouldLog(LOG_LEVELS.WARN, message)) return;
    console.warn(this.formatMessage(message));
  }

  /**
   * Info level logging
   */
  info(message) {
    if (!this.shouldLog(LOG_LEVELS.INFO, message)) return;
    console.log(this.formatMessage(message));
  }

  /**
   * Debug level logging
   */
  debug(message) {
    if (!this.shouldLog(LOG_LEVELS.DEBUG, message)) return;
    console.log(this.formatMessage(message));
  }

  /**
   * Trace level logging (most verbose)
   */
  trace(message) {
    if (!this.shouldLog(LOG_LEVELS.TRACE, message)) return;
    console.log(this.formatMessage(message));
  }

  /**
   * Creates a child logger with inherited settings and a new context
   */
  child(context) {
    return new Logger({
      logLevel: this.logLevel,
      ignoredErrors: this.ignoredErrors,
      context
    });
  }
}

// Create and export the root logger
const rootLogger = new Logger();

// Export factory function for creating component-specific loggers
const createLogger = (context) => rootLogger.child(context);

/**
 * Configure global logging settings
 */
const configureLogging = (options = {}) => {
  rootLogger.logLevel = options.logLevel !== undefined ? options.logLevel : rootLogger.logLevel;
  
  if (options.ignoredErrors) {
    rootLogger.ignoredErrors = options.ignoredErrors;
  }
};

module.exports = {
  LOG_LEVELS,
  createLogger,
  configureLogging
};
