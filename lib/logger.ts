type LogLevel = "debug" | "info" | "warn" | "error"

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  [key: string]: unknown
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const MIN_LEVEL = (process.env.LOG_LEVEL as LogLevel) || "info"

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL]
}

function emit(entry: LogEntry) {
  const output = JSON.stringify(entry)
  if (entry.level === "error") {
    console.error(output)
  } else if (entry.level === "warn") {
    console.warn(output)
  } else {
    console.log(output)
  }
}

function createLogFn(level: LogLevel) {
  return (message: string, meta?: Record<string, unknown>) => {
    if (!shouldLog(level)) return
    emit({
      ...meta,
      level,
      message,
      timestamp: new Date().toISOString(),
    })
  }
}

export const logger = {
  debug: createLogFn("debug"),
  info: createLogFn("info"),
  warn: createLogFn("warn"),
  error: createLogFn("error"),
}
