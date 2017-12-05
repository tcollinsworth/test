import stringify from 'json-stringify-safe'
import os from 'os'
import uuidV4 from 'uuid/v4'

import * as clsMgr from '../middleware/cls-mgr'

// serializer functions that take: level, args, errors
export const defaultSerializers = [
  getEpochTime,
  getIsoDateTime,
  getId,
  getLevel,
  getLoggerName,
  getPid,
  getHostname,
  getArgs, //includes log args, all errors are squirreled away for inclusion by getErrors
  getErrors //squirreled away by getArgs
  //getClsArgs
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
  return '"id":"' + id + '"'
}

export function getLevel(level, args, errors) {
  return '"level":"' + level.name + '"'
}

export function getPid(level, args, errors) {
  return '"pid":"' + process.pid + '"'
}

export function getHostname(level, args, errors) {
  return '"host":"' + os.hostname() + '"'
}

export function getArgs(level, args, errors) {
  let mesg = '"mesg":['
  let delimiter = ''
  args.forEach((arg) => {
    const argMesg = handleArgByType(arg, errors)
    if (argMesg) {
      mesg += delimiter
      mesg += argMesg
      delimiter = ','
    }
  })
  mesg += ']'
  return mesg
}

export function getErrors(level, args, errors) {
  let errorMesg
  let errorsPrefix = '"errors":['
  let errorsSuffix
  let errNo = 0
  let delimiter = ''
  errors.forEach((err) => {
    if (!errorMesg) {
      errorMesg = errorsPrefix //error, open/begin error prop
    }
    errorsPrefix = '' //opened, clear so not opened again
    errorsSuffix = ']' //opened to add error, set so will be closed when done
    errorMesg += addError(err, errNo, errors.length)
    delimiter = ',' //added, set to comman in case another added
  })
  if (errorsSuffix) {
    errorMesg += errorsSuffix
  }
  return errorMesg
}

export function addError(err) {
  let mesg = '{'
  mesg += '"type":"' + err.constructor.name + '"'
  mesg += ',"mesg":"' + err.message + '"'
  mesg += ',"stack":['
  // no stack //103047.3 in 10 sec, getting stack is a real killer of performance
  //mesg += '"' + err.stack + '"' //slightly faster, exceptions kill performance //2635 in 10 sec
  let delimiter = ''
  err.stack.split('\n').forEach((call) => { //2458 in 10 sec
    mesg += delimiter + '"' + call.trimLeft() + '"'
    delimiter = ','
  })
  mesg += ']'
  //add all other properties of Error
  Object.keys(err).forEach((key) => {
    if (key != 'message') {
      if (err[key] instanceof Error) {
        //add errors recursively as cause if any properties are errors
        mesg += delimiter + '"cause":' + addError(err[key])
      } else {
        mesg += delimiter + '"' + key + '":' + handleArgByType(err[key])
      }
    }
  })
  mesg += '}'
  return mesg
}

export function handleArgByType(arg, errors) {
  //collect and add all errors at end in errors
  if (arg instanceof Error) {
    errors.push(arg)
    return null
  }

  switch (typeof arg) {
    case 'string':
      return stringify(arg)
    case 'number':
      if (arg === Number.POSITIVE_INFINITY) {
        return '"Infinity"'
      } else if (arg === Number.NEGATIVE_INFINITY) {
        return '"-Infinity"'
      } else if (Number.isNaN(arg)) {
        return '"NaN"'
      }
      return arg
    case 'boolean':
      return arg
    case 'object':
      return stringify(arg)
    case 'array':
      return stringify(arg)
    case 'null':
      return '"null"'
    case 'undefined':
      return '"undefined"'
    case 'symbol': //new ES6
      return '"' + arg.toString() + '"'
    case 'function':
      return '"[Function]"'
    default:
      return '"unsupported type ' + typeof arg + '"'
  }
}
