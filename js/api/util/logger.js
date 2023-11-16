import pino from 'pino'
import conf from 'config'

// type Level = "fatal" | "error" | "warn" | "info" | "debug" | "trace";

const logger = pino({
  name: 'ruda.app',
  level: process.env.PINO_LOG_LEVEL || 'info',
  transport: {
    targets: [
      { target: 'pino-pretty' },
      { level: 'error', target: 'pino/file', options: { destination: conf.get('errorLogPath'), append: true } }
      // { level: 'error', target: './my-transport.js', options }
    ]
  }
})

export default logger
