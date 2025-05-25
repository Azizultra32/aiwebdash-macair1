export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogPayload {
  level: LogLevel;
  message: string;
  data?: unknown;
}

function output(level: LogLevel, payload: LogPayload) {
  const serialized = JSON.stringify(payload);
  if (level === 'error') {
    console.error(serialized);
  } else if (level === 'warn') {
    console.warn(serialized);
  } else {
    console.log(serialized);
  }
}

export const logger = {
  debug(message: string, data?: unknown) {
    if (import.meta.env.DEV) {
      output('debug', { level: 'debug', message, data });
    }
  },
  info(message: string, data?: unknown) {
    if (import.meta.env.DEV) {
      output('info', { level: 'info', message, data });
    }
  },
  warn(message: string, data?: unknown) {
    output('warn', { level: 'warn', message, data });
  },
  error(message: string, data?: unknown) {
    output('error', { level: 'error', message, data });
  },
};
