import P from 'pino'

type LogMethod = 'error' | 'warn' | 'info' | 'debug' | 'trace'
type LoggerMethods = Record<LogMethod, () => void>

export function eventlogger(): void {
  const methods: LogMethod[] = ['error', 'warn', 'info', 'debug', 'trace']
  methods.forEach((method) => {
    console[method] = () => {};
  });

  const loggingLibraries: string[] = ['pino'];
  loggingLibraries.forEach((lib) => {
    try {
      const logger = require(lib);
      if (logger && typeof logger.createLogger === 'function') {
        logger.createLogger = (): LoggerMethods => ({
          info: () => {},
          warn: () => {},
          error: () => {},
          debug: () => {},
          trace: () => {},
        });
      }
    } catch {}
  });
}

export const logger = P()
logger.level = 'silent'