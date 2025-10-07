const getTimestamp = () => new Date().toISOString();

/**
 * A simple logger that adds timestamps and log levels to messages.
 * It centralizes logging logic, making future improvements easier.
 */
const logger = {
  info: (message, ...args) => {
    console.log(`[${getTimestamp()}] [INFO] - ${message}`, ...args);
  },
  warn: (message, ...args) => {
    console.warn(`[${getTimestamp()}] [WARN] - ${message}`, ...args);
  },
  error: (message, ...args) => {
    // We pass the error object directly to console.error to preserve the stack trace.
    console.error(`[${getTimestamp()}] [ERROR] - ${message}`, ...args);
  },
};

module.exports = logger;