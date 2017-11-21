import os from 'os'
import uuidV4 from 'uuid/v4'

// serializer functions that take: level, req
export const defaultReqSerializers = [
  getEpochTime,
  getIsoDateTime,
  getId,
  getHostname,
  getMethod,
  getUrl,
  getReqHeaders,
  getConnRemoteAddress,
  getConnRemotePort
]

// serializer functions that take: level, res, error
export const defaultResSerializers = [
  getEpochTime,
  getIsoDateTime,
  getId,
  getResHeaders,
  getStatus,
  getRespTime,
]

export function getLoggerName(level, args, errors) {
  return '"logger":"' + this.name + '"'
}

export function getEpochTime(level, args, errors) {
  return '"time":"' + Date.now() + '"'
}

export function getId(level, args, errors) {
  let id
  if (this.cls) {
    //TODO get from cls x-request-id
  } else {
    id = uuidV4()
  }
  return '"id":"' + id + '"'
}

export function getHostname(level, args, errors) {
  return '"host":"' + os.hostname() + '"'
}

export function getMethod(level, req) {
  //TODO
}

export function getUrl(level, req) {
  //TODO
}

export function getReqHeaders(level, req) {
  //TODO
}

export function getConnRemoteAddress(level, req) {
  //TODO
}

export function getConnRemotePort(level, req) {
  //TODO
}

export function getResHeaders(level, res, error) {
  //TODO
}

export function getStatus(level, res, error) {
  //TODO
}

export function getRespTime(level, res, error) {
  //TODO
}
