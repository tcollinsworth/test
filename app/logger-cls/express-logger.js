import * as log from './logger'
import { fatal, error, warn, debug, info, trace, getLevel } from './levels'
import * as expressSerializers from './express-serializers'
import * as clsMgr from '../middleware/cls-mgr'

//app.use(clsMgr) //TODO remove or set into expressLogger and axios

const defaultOpts = {
  level: 'info'
}

export function expressLogger(name, options = defaultOpts, stream) {
  const logger = new log.createLogger(name, options, stream)
  const expressLogger = new ExpressLogger(logger)
  return (req, res, next) => {
    res.start = Date.now()
    expressLogger.handleRequest(req, res, next)
  }
}

//TODO method to add log management API to express
//TODO log route filters

// this.reqSerializers = expressSerializers.defaultReqSerializers
// this.resSerializers = expressSerializers.defaultResSerializers

class ExpressLogger {
  constructor(logger, reqSerializers, resSerializers) {
    this.logger = logger
    this.reqSerializers = reqSerializers
    this.resSerializers = resSerializers
  }

  handleRequest(req, res, next) {
    //TODO start timer
    //TODO has CLS
    //TODO saves data in cls
    //TODO log request info and cls data
    //TODO register resp and error handler
    this.logger.info('request')
    res.on('finish', handleResponse)
    res.on('error', handleError)
    // throw new Error('test')
    next()
  }
}

function handleResponse() {
  //this = res
  console.log('resp reqId', clsMgr.get('reqId'))
  console.log(Date.now() - this.start + ' ms')
  removeListeners.bind(this)
}

function handleError(err) {
  //this = res
  removeListeners.bind(this)
  console.log(Error)
  //TODO what is correct action here next, return, throw
}

function removeListeners() {
  this.removeListener('finish', handleResponse)
  this.removeListener('error', handleError)
}

/*
Object.key(res)

[ 'domain',
  '_events',
  '_eventsCount',
  '_maxListeners',
  'output',
  'outputEncodings',
  'outputCallbacks',
  'outputSize',
  'writable',
  '_last',
  'upgrading',
  'chunkedEncoding',
  'shouldKeepAlive',
  'useChunkedEncodingByDefault',
  'sendDate',
  '_removedConnection',
  '_removedContLen',
  '_removedTE',
  '_contentLength',
  '_hasBody',
  '_trailer',
  'finished',
  '_headerSent',
  'socket',
  'connection',
  '_header',
  '_onPendingData',
  '_sent100',
  '_expect_continue',
  'req',
  'locals',
  'flush',
  'write',
  'end',
  'on',
  'writeHead',
  'wrap@before',
  'addListener',
  'emit',
  '__unwrap',
  '__wrapped',
  'statusCode',
  'statusMessage',
  'removeListener' ]
  */
