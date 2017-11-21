import stringify from 'json-stringify-safe'
import flatstr from 'flatstr'
import fs from 'fs'

import { fatal, error, warn, debug, info, trace, getLevel } from './levels'
import * as serializers from './serializers'

const defaultOpts = {
  level: 'info'
}

const loggerRegistry = {}
//sequence is appended if there are name conflicts
let seq = 0

class Logger {
  constructor(name, options = defaultOpts, stream = process.stdout) {
    if (!name) {
      //TODO not console
      console.log(new Error('Error unnamed logger'))
    }
    this.name = name || 'unnamed-' + ++seq
    this.level = getLevel(options.level) || info //TODO will error if options not set right
    this.cls = null //TODO
    this.options = options
    this.stream = stream
    this.serializers = serializers.defaultSerializers

    this.registerLogger(name, this)
  }

  // streamStatus() {
  //   console.log(stringify(JSON.parse(stringify(this.stream)), null, '  '))
  // }

  // hasFileDecriptor() {
  //   return !!(typeof this.stream._handle !== 'undefined' && typeof this.stream._handle.fd !== 'undefined' && this.stream._handle.fd)
  //             || (typeof this.stream.fd !== 'undefined' && this.stream.fd)
  // }

  // syncWrite(buf = '\n') {
  //   const fd = (this.stream.fd) ? this.stream.fd : this.stream._handle.fd
  //   fs.writeSync(fd, buf)
  // }

  registerLogger(name, logger) {
    //TODO don't think this is correct
    if (typeof loggerRegistry[name] === 'undefined') {
      loggerRegistry[name] = this
    } else {
      const loggerName = `${name}-${++seq}`
      loggerRegistry[loggerName] = this
      //TODO not console
      console.log(new Error(`Error logger name collision ${loggerName}`))
    }
  }

  setLevel(level) {
    this.level = getLevel(level)
  }

  getLevel() {
    return this.level
  }

  fatal(...args) {this.baseLog(fatal, this.serializers, args)}
  error(...args) {this.baseLog(error, this.serializers, args)}
  warn(...args) {this.baseLog(warn, this.serializers, args)}
  debug(...args) {this.baseLog(debug, this.serializers, args)}
  info(...args) {this.baseLog(info, this.serializers, args)}
  trace(...args) {this.baseLog(trace, this.serializers, args)}

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
    //TODO write to stream, default stream is console, but can be set to readable buffer for testing
    //TODO something more efficient than parse/stringify
    //console.log(JSON.stringify(JSON.parse(flatstr(mesg)), null, '  '))
    //console.log(flatstr(mesg) + '\r\n')
    const output = flatstr(mesg + '\n')  //JSON.stringify(JSON.parse(flatstr(mesg)), null, '  ')
    this.stream.write(output)
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
}

export function getLoggersLevels() {
  const loggersLevels = []
  Object.keys(loggerRegistry).forEach((key) => {
    loggersLevels.push({[key]: loggerRegistry[key].getLevel()})
  })
  return loggersLevels
}

export function setLoggerLevel(name, level) {
  loggerRegistry[name].setLevel(level)
}

export function createLogger(name, options, stream) {
  return new Logger(name, options, stream)
}

export function removeLogger(name) {
  delete loggerRegistry[name]
}
