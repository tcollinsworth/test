import stringify from 'json-stringify-safe'
import flatstr from 'flatstr'

import { fatal, error, warn, debug, info, trace, getLevel } from './levels'
import * as serializers from './serializers'

const defaultOpts = {
  level: 'info'
}

const loggerRegistry = {}
let seq = 0

class Logger {
  constructor(name, options = defaultOpts, stream = process.stdout) {
    if (!name) {
      //TODO not console
      console.log(new Error('Error unamed logger'))
    }
    this.name = name || 'unamed' + ++seq
    this.level = getLevel(options.level) || info //TODO will error if options not set right
    this.cls = null //TODO
    this.options = options
    this.stream = stream
    this.baseSerializers = serializers.defaultBaseSerializers
    this.reqSerializers = serializers.defaultReqSerializers
    this.resSerializers = serializers.defaultResSerializers

    this.registerLogger(name, this)
  }

  registerLogger(name, logger) {
    if (typeof loggerRegistry[name] === 'undefined') {
      loggerRegistry[name] = this
    } else {
      loggerRegistry[name + ++seq] = this
      //TODO not console
      console.log(new Error('Error logger name collision ' + name))
    }
  }

  setLevel(level) {
    this.level = getLevel(level)
  }

  getLevel() {
    return this.level
  }

  fatal(...args) {this.baseLog(fatal, this.baseSerializers, args)}
  error(...args) {this.baseLog(error, this.baseSerializers, args)}
  warn(...args) {this.baseLog(warn, this.baseSerializers, args)}
  debug(...args) {this.baseLog(debug, this.baseSerializers, args)}
  info(...args) {this.baseLog(info, this.baseSerializers, args)}
  trace(...args) {this.baseLog(trace, this.baseSerializers, args)}

  baseLog(level, serializers, args) {
    if (level.value < this.level.value) {
      return //level is below current logger level
    }
    const errors = [] //collect and add all errors at end in errors collection
    let mesg = '{'
    let delimiter = ''
    serializers.forEach((serializer) => {
      try {
        const mesgProp = serializer.call(this, level, args, errors)
        if (mesgProp) {
          mesg += delimiter
          mesg += mesgProp
          delimiter = ','
        }
      } catch(err) {
        this.messageSerializingError(err, serializer)
        return '"Error: ' + serializer + '"'
      }
    })
    mesg += '}'
    //flatstr(mesg)
    // console.log(flatstr(mesg))
    console.log(JSON.stringify(JSON.parse(flatstr(mesg)), null, '  '))
  }

  messageSerializingError(err, serializer) {
    let mesgObj = {
      mesg: 'serializer error: ' + serializer,
      type: err.constructor.name,
      message: err.message,
      stack: err.stack
    }
    const mesg = stringify(flatstr(mesgObj))
    this.stream.write(mesg + '\n')
  }

  reqLog() {

  }

  resLog() {

  }
}

export function getLoggersLevels() {
  const loggers = []
  Object.keys(loggerRegistry).forEach((key) => {
    loggers.push({[key]: loggerRegistry[key].getLevel()})
  })
  return loggers
}

export function setLoggerLevel(name, level) {
  loggerRegistry[name].setLevel(level)
}

export function createLogger(options, stream) {
  return new Logger(options, stream)
}
