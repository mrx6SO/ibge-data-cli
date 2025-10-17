const getTimestamp = (): string => new Date().toISOString();

/**
 * A simple logger that adds timestamps and log levels to messages.
 * It centralizes logging logic, making future improvements easier.
 */
const logger = {
  info: (message: string, ...args: any[]): void => {
    console.log(`[${getTimestamp()}] [INFO] - ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]): void => {
    console.warn(`[${getTimestamp()}] [WARN] - ${message}`, ...args);
  },
  error: (message: string, ...args: any[]): void => {
    // We pass the error object directly to console.error to preserve the stack trace.
    console.error(`[${getTimestamp()}] [ERROR] - ${message}`, ...args);
  },
};

export default logger;