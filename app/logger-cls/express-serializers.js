import stringify from 'json-stringify-safe'
import os from 'os'
import uuidV4 from 'uuid/v4'
import * as clsMgr from '../middleware/cls-mgr'
import { addError } from './serializers'

// serializer functions that take: level, req
export const defaultReqSerializers = [
  getEpochTime,
  getIsoDateTime,
  getId,
  getHostname,
  getProtocol,
  getMethod,
  getUrl,
  getReqHeaders,
  getConnRemoteAddress,
  getConnRemotePort,
]

// serializer functions that take: level, res, error (opt)
export const defaultResSerializers = [
  getEpochTime,
  getIsoDateTime,
  getId,
  getResHeaders,
  getResStatus,
  getResError,
  getResTime,
]

export function getLoggerName(level, args, errors) {
  return '"logger":"' + this.name + '"'
}

export function getEpochTime(level, args, errors) {
  return '"time":"' + Date.now() + '"'
}

export function getIsoDateTime(level, args, errors) {
  return '"date":"' + (new Date()).toISOString() + '"'
}

export function getId(level, args, errors) {
  let id = clsMgr.get('reqId')
  if (id) {
    //no-op
  } else {
    id = uuidV4()
  }
  return '"x-request-id":"' + id + '"'
}

export function getHostname(level, args, errors) {
  return '"host":"' + os.hostname() + '"'
}

export function getProtocol(level, req) {
  return '"protocol":""' + req.protocol + '"'
}

export function getMethod(level, req) {
  return '"method":""' + req.method + '"'
}

export function getUrl(level, req) {
  return '"url":"' + req.originalUrl + '"'
}

export function getReqHeaders(level, req) {
  return '"headers":' + JSON.stringify(req.headers)
}

export function getConnRemoteAddress(level, req) {
  return '"remoteIp":"' + req.ip + '"'
}

export function getConnRemotePort(level, req) {
  return '"remotePort":' + req.connection.remotePort
}

export function getResHeaders(level, res, error) {
  return '"headers":' + JSON.stringify(res.header()._headers)
}

export function getResStatus(level, res, error) {
  return '"status":' + res.statusCode
}

export function getResError(level, res, error) {
  //TODO FIXME below not logging what expected
  console.log('getResError res', JSON.stringify(res, null, '  '))
  //TODO FIXME, not reporting error in response logging
  console.log('getResError', error)
  if (error && error.length > 0) {
    //chain of errors and their properties
    return '"error":' + addError(error)
  }
}

export function getResTime(level, res, error) {
  return '"responseTime":"' + (Date.now() - res.start) + ' ms"'
}
