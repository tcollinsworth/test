import pino from 'pino'
import * as lodash from 'lodash'

const nodeEnv = process.env.NODE_ENV || 'debug'
const logLevel = process.env.LOG_LEVEL || 'info'

/*
The purpose of the app-logger is to avoid the need to pass a conext, express request, or logger around the application to get consistent logging.
This module creates and initializes all loggers with a unique name, but the same config by default, but supports per logger custom initialization.
All loggers will all have a reference to the same continuation-local-storage to be able to log common properties like x-request-id.
This module also saves a reference to all loggers so they can be listed and have their levels changed during run-time through a REST end-point.
*/

//TODO level string instead of number
//TODO ISO date instead of or in addition to unix
//TODO specified cls property, req x-request-id

//update to the desired defaults before creating loggers
export const defaultPrettyPrintOpts = {
  levelFirst: true,
  forceColor: true
}

//update to the desired defaults before creating loggers
export const defaultOpts = {
  name: 'app',
  level: logLevel,
  prettyPrintOpts: nodeEnv == 'production' ? false : defaultPrettyPrintOpts, //not prettyPrint
  stream: undefined // process.stdout
}

//use this to create customized logger without affecting default logging initialization
export function getClonedDefaultOpts() {
  return lodash.cloneDeep(defaultOpts)
}

// uses defaultOpts unless custom options are provided
export function createLogger(opts = defaultOpts) {
  const logger = pino({
      name: opts.name,
      level: opts.level,
      prettyPrint: opts.prettyPrintOpts,
    },
    opts.stream
  )
  return logger
}
