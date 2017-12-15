import * as log from './logger'
import { fatal, error, warn, debug, info, trace, getLevel } from './levels'
import * as expressSerializers from './express-serializers'
import * as clsMgr from '../middleware/cls-mgr'

//app.use(clsMgr) //TODO remove or set into expressLogger and axios
//TODO method to add log management API to express
//TODO log route filters
//TODO setName, level, logger.options, reqSerializers, resSerializers

export var logger = log.createLogger('express', {level: 'info'})
export var reqSerializers = expressSerializers.defaultReqSerializers
export var resSerializers = expressSerializers.defaultResSerializers

function requestHandler(req, res, next) {
  res.start = Date.now()
  handleRequest(req, res, next)
}

export default requestHandler

function handleRequest(req, res, next) {
  //TODO start timer
  //TODO has CLS
  //TODO saves data in cls
  //TODO log request info and cls data
  //TODO register resp and error handler
  logger.logger(info, reqSerializers, req)
  res.on('finish', handleResponse)
  res.on('error', handleError)
  // throw new Error('test')
  next()
}

function handleResponse() {
  //TODO FIXME detect and report error on res logging
  //this = res
  logger.logger(info, resSerializers, this)
  removeListeners.bind(this)
}

function handleError(err) {
  console.log('handleError', err)

  //this = res
  logger.logger(info, resSerializers, this, err)
  removeListeners.bind(this)
  //TODO what is correct action here next, return, throw
}

function removeListeners() {
  this.removeListener('finish', handleResponse)
  this.removeListener('error', handleError)
}
