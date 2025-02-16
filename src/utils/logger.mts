type LogMethod = 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'log'

export function silenceLibsignalLogs(): void {
  const originalConsole = { ...console };
  
  const methods: LogMethod[] = ['error', 'warn', 'info', 'debug', 'trace', 'log'];
  
  methods.forEach((method) => {
    console[method] = (...args: any[]) => {
      // Expanded patterns to catch all libsignal logs
      const libsignalPatterns = [
        'Closing stale open session',
        'Closing session:',
        'Removing old closed session',
        'SessionEntry',
        'chainKey',
        'chainType',
        'messageKeys',
        'registrationId',
        'currentRatchet',
        'ephemeralKeyPair',
        'indexInfo',
        'baseKey',
        'baseKeyType',
        'remoteIdentityKey',
        '_chains'
      ];

      const shouldLog = !args.some(arg => {
        if (typeof arg !== 'string') {
          // Convert non-string arguments to string to check their content
          arg = JSON.stringify(arg);
        }
        return libsignalPatterns.some(pattern => arg.includes(pattern));
      });

      if (shouldLog) {
        originalConsole[method](...args);
      }
    };
  });
}